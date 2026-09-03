package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"velocex-backend/internal/domain"
	"velocex-backend/internal/engine"
	"velocex-backend/internal/repository"
)

var (
	ErrInvalidOrderParams = errors.New("invalid order parameters")
)

type OrderService interface {
	CreateOrder(ctx context.Context, userID uuid.UUID, req domain.CreateOrderRequest) (*domain.Order, error)
	UpdateOrder(ctx context.Context, userID uuid.UUID, orderID uuid.UUID, req domain.UpdateOrderRequest) (*domain.Order, error)
	CancelOrder(ctx context.Context, userID uuid.UUID, orderID uuid.UUID) (*domain.Order, error)
	GetOrders(ctx context.Context, userID uuid.UUID, symbol string, status domain.OrderStatus, limit, offset int) ([]domain.Order, int64, error)
	GetTrades(ctx context.Context, userID uuid.UUID, limit, offset int) ([]domain.Trade, int64, error)
}

type orderService struct {
	repo           repository.Repository
	matchingEngine *engine.MatchingEngine
	priceProvider  PriceProvider
}

func NewOrderService(repo repository.Repository, matchingEngine *engine.MatchingEngine, priceProvider PriceProvider) OrderService {
	return &orderService{
		repo:           repo,
		matchingEngine: matchingEngine,
		priceProvider:  priceProvider,
	}
}

func (s *orderService) CreateOrder(ctx context.Context, userID uuid.UUID, req domain.CreateOrderRequest) (*domain.Order, error) {
	if req.Amount <= 0 {
		return nil, fmt.Errorf("%w: amount must be greater than zero", ErrInvalidOrderParams)
	}

	symbol := string(req.Symbol)
	baseCurrency, quoteCurrency := parseSymbol(symbol)

	var executionPrice float64
	if req.Type == domain.TypeLimit {
		if req.Price <= 0 {
			return nil, fmt.Errorf("%w: limit orders require price > 0", ErrInvalidOrderParams)
		}
		executionPrice = req.Price
	} else {
		// Market Order: fetch latest price
		latest := s.priceProvider.GetLatestPrice(symbol)
		if latest <= 0 {
			return nil, errors.New("market price unavailable for market order")
		}
		executionPrice = latest
	}

	order := &domain.Order{
		ID:           uuid.New(),
		UserID:       userID,
		Symbol:       symbol,
		Side:         req.Side,
		Type:         req.Type,
		Price:        executionPrice,
		Amount:       req.Amount,
		FilledAmount: 0,
		Status:       domain.StatusOpen,
		CreatedAt:    time.Now(),
	}

	// Lock balance atomically in PostgreSQL
	err := s.repo.WithTransaction(ctx, func(txRepo repository.Repository, tx *gorm.DB) error {
		if req.Side == domain.SideBuy {
			// Buyer must lock quote currency (e.g. USDT) = price * amount
			requiredQuote := executionPrice * req.Amount
			if err := txRepo.LockBalance(ctx, tx, userID, domain.SubAccountSpot, quoteCurrency, requiredQuote); err != nil {
				return err
			}
		} else {
			// Seller must lock base currency (e.g. BTC) = amount
			if err := txRepo.LockBalance(ctx, tx, userID, domain.SubAccountSpot, baseCurrency, req.Amount); err != nil {
				return err
			}
		}

		// Insert order record
		return txRepo.CreateOrder(ctx, tx, order)
	})

	if err != nil {
		return nil, err
	}

	// Submit order to matching engine for real-time order book matching and trade settlement
	s.matchingEngine.SubmitOrder(order)

	return order, nil
}

func (s *orderService) UpdateOrder(ctx context.Context, userID uuid.UUID, orderID uuid.UUID, req domain.UpdateOrderRequest) (*domain.Order, error) {
	order, err := s.repo.GetOrderByID(ctx, orderID)
	if err != nil {
		return nil, err
	}
	if order.UserID != userID {
		return nil, errors.New("unauthorized order update")
	}
	if order.Status != domain.StatusOpen {
		return nil, errors.New("cannot update filled or cancelled order")
	}

	if req.Price > 0 {
		order.Price = req.Price
	}
	if req.StopPrice > 0 {
		order.StopPrice = req.StopPrice
	}
	if req.TakeProfit > 0 {
		order.TakeProfit = req.TakeProfit
	}
	if req.StopLoss > 0 {
		order.StopLoss = req.StopLoss
	}

	err = s.repo.WithTransaction(ctx, func(txRepo repository.Repository, tx *gorm.DB) error {
		return txRepo.UpdateOrder(ctx, tx, order)
	})
	if err != nil {
		return nil, err
	}

	return order, nil
}

func (s *orderService) CancelOrder(ctx context.Context, userID uuid.UUID, orderID uuid.UUID) (*domain.Order, error) {
	cancelledOrder, err := s.repo.CancelOrder(ctx, orderID, userID)
	if err != nil {
		return nil, err
	}

	// Remove from matching engine in-memory book
	s.matchingEngine.RemoveCancelledOrder(cancelledOrder)

	return cancelledOrder, nil
}

func (s *orderService) GetOrders(ctx context.Context, userID uuid.UUID, symbol string, status domain.OrderStatus, limit, offset int) ([]domain.Order, int64, error) {
	return s.repo.GetOrders(ctx, userID, symbol, status, limit, offset)
}

func (s *orderService) GetTrades(ctx context.Context, userID uuid.UUID, limit, offset int) ([]domain.Trade, int64, error) {
	return s.repo.GetTradesByUserID(ctx, userID, limit, offset)
}

func parseSymbol(symbol string) (base, quote string) {
	if len(symbol) > 4 && symbol[len(symbol)-4:] == "USDT" {
		return symbol[:len(symbol)-4], "USDT"
	}
	return symbol, "USDT"
}
