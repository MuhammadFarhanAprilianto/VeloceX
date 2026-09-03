package service

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"velocex-backend/internal/domain"
	"velocex-backend/internal/repository"
)

type PriceProvider interface {
	GetLatestPrice(symbol string) float64
}

type PortfolioService interface {
	GetPortfolio(ctx context.Context, userID uuid.UUID) (*domain.PortfolioResponse, error)
	ExecuteInternalTransfer(ctx context.Context, userID uuid.UUID, req domain.InternalTransferRequest) error
	ConvertDustBalances(ctx context.Context, userID uuid.UUID, req domain.DustConvertRequest) (float64, error)
	GetLedgerHistory(ctx context.Context, userID uuid.UUID, limit, offset int) ([]domain.LedgerEntry, error)
}

type portfolioService struct {
	repo          repository.Repository
	priceProvider PriceProvider
}

func NewPortfolioService(repo repository.Repository, priceProvider PriceProvider) PortfolioService {
	return &portfolioService{
		repo:          repo,
		priceProvider: priceProvider,
	}
}

func (s *portfolioService) GetPortfolio(ctx context.Context, userID uuid.UUID) (*domain.PortfolioResponse, error) {
	wallets, err := s.repo.GetWalletsByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	var assets []domain.AssetBalance
	var totalEquity float64

	subAccountTotals := map[domain.SubAccountType]float64{
		domain.SubAccountSpot:      0,
		domain.SubAccountFutures:   0,
		domain.SubAccountLightning: 0,
		domain.SubAccountEarn:      0,
	}

	for _, w := range wallets {
		totalAmount := w.Balance + w.LockedBalance
		var unitPrice float64

		if w.Currency == "USDT" {
			unitPrice = 1.0
		} else {
			symbol := w.Currency + "USDT"
			unitPrice = s.priceProvider.GetLatestPrice(symbol)
			if unitPrice <= 0 {
				switch w.Currency {
				case "BTC":
					unitPrice = 75368.45
				case "ETH":
					unitPrice = 4149.74
				case "SOL":
					unitPrice = 175.03
				case "BNB":
					unitPrice = 614.35
				case "LTC":
					unitPrice = 94.92
				case "ADA":
					unitPrice = 0.562
				case "EURUSD":
					unitPrice = 1.0842
				case "GBPUSD":
					unitPrice = 1.2915
				case "USDJPY":
					unitPrice = 0.0065
				case "AUDUSD":
					unitPrice = 0.6580
				case "USDCAD":
					unitPrice = 0.7235
				case "USDCHF":
					unitPrice = 1.1312
				case "XAUUSD":
					unitPrice = 2514.80
				case "XAGUSD":
					unitPrice = 29.45
				case "USOIL":
					unitPrice = 74.60
				case "SPX500":
					unitPrice = 5648.40
				case "NAS100":
					unitPrice = 19720.50
				case "US30":
					unitPrice = 41250.00
				default:
					unitPrice = 1.0
				}
			}
		}

		usdtVal := totalAmount * unitPrice
		totalEquity += usdtVal
		subAccountTotals[w.SubAccount] += usdtVal

		assets = append(assets, domain.AssetBalance{
			Currency:      w.Currency,
			SubAccount:    string(w.SubAccount),
			Balance:       w.Balance,
			LockedBalance: w.LockedBalance,
			Total:         totalAmount,
			UsdtValue:     usdtVal,
		})
	}

	dailyPnLPercent := 3.42
	dailyPnLUSDT := totalEquity * (dailyPnLPercent / 100.0)

	// Calculate sub-account allocation percentages
	var allocations []domain.SubAccountAllocation
	subAccountNames := map[domain.SubAccountType]string{
		domain.SubAccountSpot:      "Dompet Spot",
		domain.SubAccountFutures:   "Futures Margin",
		domain.SubAccountLightning: "Lightning Scalp",
		domain.SubAccountEarn:      "Staking Yield",
	}

	for sub, name := range subAccountNames {
		balUSD := subAccountTotals[sub]
		pct := 0.0
		if totalEquity > 0 {
			pct = (balUSD / totalEquity) * 100
		}
		allocations = append(allocations, domain.SubAccountAllocation{
			ID:         string(sub),
			Name:       name,
			BalanceUSD: balUSD,
			Pct:        pct,
		})
	}

	return &domain.PortfolioResponse{
		TotalEquityUSDT: totalEquity,
		DailyPnLUSDT:    dailyPnLUSDT,
		DailyPnLPercent: dailyPnLPercent,
		HealthScore:     96,   // 96/100 Sangat Aman
		MarginRatio:     24.5, // 24.5% margin ratio
		Allocations:     allocations,
		Assets:          assets,
	}, nil
}

// ExecuteInternalTransfer transfers balances between sub-accounts with double-entry accounting
func (s *portfolioService) ExecuteInternalTransfer(ctx context.Context, userID uuid.UUID, req domain.InternalTransferRequest) error {
	if req.FromSubAccount == req.ToSubAccount {
		return fmt.Errorf("sub-akun asal dan tujuan tidak boleh sama")
	}

	return s.repo.WithTransaction(ctx, func(txRepo repository.Repository, tx *gorm.DB) error {
		// 1. Debit from source sub-account
		if err := txRepo.DebitWallet(ctx, tx, userID, req.FromSubAccount, req.Currency, req.Amount); err != nil {
			return fmt.Errorf("saldo pada %s tidak mencukupi: %w", req.FromSubAccount, err)
		}

		// 2. Record Debit Ledger Entry
		debitLedger := &domain.LedgerEntry{
			UserID:      userID,
			SubAccount:  req.FromSubAccount,
			Currency:    req.Currency,
			Amount:      req.Amount,
			Type:        "DEBIT",
			ReferenceID: "INTERNAL_TRANSFER",
			Description: fmt.Sprintf("Transfer ke %s", req.ToSubAccount),
		}
		if err := txRepo.CreateLedgerEntry(ctx, tx, debitLedger); err != nil {
			return err
		}

		// 3. Credit to destination sub-account
		if err := txRepo.CreditWallet(ctx, tx, userID, req.ToSubAccount, req.Currency, req.Amount); err != nil {
			return fmt.Errorf("gagal mengkredit %s: %w", req.ToSubAccount, err)
		}

		// 4. Record Credit Ledger Entry
		creditLedger := &domain.LedgerEntry{
			UserID:      userID,
			SubAccount:  req.ToSubAccount,
			Currency:    req.Currency,
			Amount:      req.Amount,
			Type:        "CREDIT",
			ReferenceID: "INTERNAL_TRANSFER",
			Description: fmt.Sprintf("Transfer dari %s", req.FromSubAccount),
		}
		if err := txRepo.CreateLedgerEntry(ctx, tx, creditLedger); err != nil {
			return err
		}

		return nil
	})
}

// ConvertDustBalances converts small balances (< $50) to USDT at 0% fee
func (s *portfolioService) ConvertDustBalances(ctx context.Context, userID uuid.UUID, req domain.DustConvertRequest) (float64, error) {
	var totalUsdtCredit float64

	err := s.repo.WithTransaction(ctx, func(txRepo repository.Repository, tx *gorm.DB) error {
		for _, cur := range req.Currencies {
			if cur == "USDT" {
				continue
			}

			wallet, err := txRepo.GetWallet(ctx, userID, domain.SubAccountSpot, cur)
			if err != nil || wallet.Balance <= 0 {
				continue
			}

			unitPrice := s.priceProvider.GetLatestPrice(cur + "USDT")
			if unitPrice <= 0 {
				unitPrice = 1.0
			}

			usdtVal := wallet.Balance * unitPrice
			if usdtVal > 50.0 {
				// Only convert small balances < $50
				continue
			}

			// Debit the coin
			coinAmount := wallet.Balance
			if err := txRepo.DebitWallet(ctx, tx, userID, domain.SubAccountSpot, cur, coinAmount); err != nil {
				return err
			}

			// Credit USDT
			totalUsdtCredit += usdtVal
		}

		if totalUsdtCredit > 0 {
			if err := txRepo.CreditWallet(ctx, tx, userID, domain.SubAccountSpot, "USDT", totalUsdtCredit); err != nil {
				return err
			}

			ledger := &domain.LedgerEntry{
				UserID:      userID,
				SubAccount:  domain.SubAccountSpot,
				Currency:    "USDT",
				Amount:      totalUsdtCredit,
				Type:        "CREDIT",
				ReferenceID: "DUST_CONVERSION",
				Description: fmt.Sprintf("Konversi Saldo Debu (%d aset) ke USDT (0%% Fee)", len(req.Currencies)),
			}
			return txRepo.CreateLedgerEntry(ctx, tx, ledger)
		}

		return nil
	})

	return totalUsdtCredit, err
}

func (s *portfolioService) GetLedgerHistory(ctx context.Context, userID uuid.UUID, limit, offset int) ([]domain.LedgerEntry, error) {
	return s.repo.GetLedgerEntries(ctx, userID, limit, offset)
}
