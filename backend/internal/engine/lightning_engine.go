package engine

import (
	"context"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"velocex-backend/internal/domain"
	"velocex-backend/internal/repository"
	"velocex-backend/internal/websocket"
)

type PriceProvider interface {
	GetPrice(symbol string) float64
}

// LightningEngine manages high-speed 5s - 60s Scalping contracts
type LightningEngine struct {
	repo          repository.Repository
	hub           *websocket.Hub
	priceProvider PriceProvider
	activeMu      sync.RWMutex
	stopChan      chan struct{}
}

func NewLightningEngine(repo repository.Repository, hub *websocket.Hub, priceProvider PriceProvider) *LightningEngine {
	return &LightningEngine{
		repo:          repo,
		hub:           hub,
		priceProvider: priceProvider,
		stopChan:      make(chan struct{}),
	}
}

func (le *LightningEngine) Start(ctx context.Context) {
	log.Println("[LightningEngine] ⚡ Started high-speed contract settlement engine (5s-60s)")
	ticker := time.NewTicker(200 * time.Millisecond) // Check every 200ms

	go func() {
		for {
			select {
			case <-ctx.Done():
				ticker.Stop()
				return
			case <-le.stopChan:
				ticker.Stop()
				return
			case <-ticker.C:
				le.checkSettlements(ctx)
			}
		}
	}()
}

func (le *LightningEngine) Stop() {
	close(le.stopChan)
}

// PlaceContract places a new 5s-60s lightning trade
func (le *LightningEngine) PlaceContract(ctx context.Context, userID uuid.UUID, req domain.LightningOrderRequest) (*domain.LightningContract, error) {
	currentPrice := le.priceProvider.GetPrice(req.Symbol)
	if currentPrice <= 0 {
		return nil, fmt.Errorf("harga pasar untuk %s tidak tersedia", req.Symbol)
	}

	var contract *domain.LightningContract

	err := le.repo.WithTransaction(ctx, func(txRepo repository.Repository, tx *gorm.DB) error {
		// 1. Debit stake amount from lightning wallet
		if err := txRepo.DebitWallet(ctx, tx, userID, domain.SubAccountLightning, "USDT", req.StakeAmount); err != nil {
			return fmt.Errorf("saldo Lightning Wallet tidak mencukupi: %w", err)
		}

		// 2. Record debit ledger
		ledger := &domain.LedgerEntry{
			UserID:      userID,
			SubAccount:  domain.SubAccountLightning,
			Currency:    "USDT",
			Amount:      req.StakeAmount,
			Type:        "DEBIT",
			ReferenceID: "LIGHTNING_STAKE",
			Description: fmt.Sprintf("Stake Lightning %ds %s %s @ $%.2f", req.DurationSeconds, req.Direction, req.Symbol, currentPrice),
		}
		if err := txRepo.CreateLedgerEntry(ctx, tx, ledger); err != nil {
			return err
		}

		// 3. Create contract record
		now := time.Now()
		expiresAt := now.Add(time.Duration(req.DurationSeconds) * time.Second)

		contract = &domain.LightningContract{
			ID:               uuid.New(),
			UserID:           userID,
			Symbol:           req.Symbol,
			Direction:        req.Direction,
			DurationSeconds:  req.DurationSeconds,
			StakeAmount:      req.StakeAmount,
			StrikePrice:      currentPrice,
			PayoutMultiplier: 1.90, // 90% payout
			Status:           "OPEN",
			ExpiresAt:        expiresAt,
			CreatedAt:        now,
		}

		return txRepo.CreateLightningContract(ctx, tx, contract)
	})

	if err != nil {
		return nil, err
	}

	// Broadcast contract placed
	le.hub.BroadcastToUser(userID.String(), "LIGHTNING_OPENED", contract)

	return contract, nil
}

// checkSettlements processes all contracts that reached their expiration timestamp
func (le *LightningEngine) checkSettlements(ctx context.Context) {
	activeContracts, err := le.repo.GetActiveLightningContracts(ctx)
	if err != nil || len(activeContracts) == 0 {
		return
	}

	now := time.Now()
	for _, contract := range activeContracts {
		if now.After(contract.ExpiresAt) || now.Equal(contract.ExpiresAt) {
			le.settleSingleContract(ctx, contract)
		}
	}
}

func (le *LightningEngine) settleSingleContract(ctx context.Context, c domain.LightningContract) {
	settlementPrice := le.priceProvider.GetPrice(c.Symbol)
	if settlementPrice <= 0 {
		settlementPrice = c.StrikePrice
	}

	// Determine Win / Loss
	isWon := false
	if c.Direction == "CALL" && settlementPrice > c.StrikePrice {
		isWon = true
	} else if c.Direction == "PUT" && settlementPrice < c.StrikePrice {
		isWon = true
	}

	totalPayout := 0.0
	profitAmount := 0.0

	if isWon {
		c.Status = "WON"
		totalPayout = c.StakeAmount * c.PayoutMultiplier
		profitAmount = totalPayout - c.StakeAmount
	} else {
		c.Status = "LOST"
		profitAmount = -c.StakeAmount
	}

	c.SettlementPrice = settlementPrice
	c.ProfitAmount = profitAmount

	err := le.repo.WithTransaction(ctx, func(txRepo repository.Repository, tx *gorm.DB) error {
		// Save settlement
		if err := txRepo.SettleLightningContract(ctx, tx, &c); err != nil {
			return err
		}

		if isWon && totalPayout > 0 {
			// Credit payout to Lightning Wallet
			if err := txRepo.CreditWallet(ctx, tx, c.UserID, domain.SubAccountLightning, "USDT", totalPayout); err != nil {
				return err
			}

			// Record credit ledger
			ledger := &domain.LedgerEntry{
				UserID:      c.UserID,
				SubAccount:  domain.SubAccountLightning,
				Currency:    "USDT",
				Amount:      totalPayout,
				Type:        "CREDIT",
				ReferenceID: c.ID.String(),
				Description: fmt.Sprintf("Payout Lightning %s %s Strike $%.2f -> Close $%.2f (+90%%)", c.Direction, c.Symbol, c.StrikePrice, settlementPrice),
			}
			if err := txRepo.CreateLedgerEntry(ctx, tx, ledger); err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		log.Printf("[LightningEngine Error] Failed to settle contract %s: %v", c.ID, err)
		return
	}

	// Broadcast settlement notification to user
	le.hub.BroadcastToUser(c.UserID.String(), "LIGHTNING_SETTLED", map[string]interface{}{
		"contract_id":      c.ID,
		"status":           c.Status,
		"strike_price":     c.StrikePrice,
		"settlement_price": c.SettlementPrice,
		"profit_amount":    c.ProfitAmount,
		"total_payout":     totalPayout,
		"is_won":           isWon,
	})
}
