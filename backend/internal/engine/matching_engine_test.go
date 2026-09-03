package engine

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"

	"velocex-backend/internal/domain"
)

func TestMatchingEngine_SortAndMatch(t *testing.T) {
	ob := &OrderBook{
		Symbol: "BTCUSDT",
		Bids:   make([]*domain.Order, 0),
		Asks:   make([]*domain.Order, 0),
	}

	engine := &MatchingEngine{
		orderBooks: map[string]*OrderBook{"BTCUSDT": ob},
	}

	sellerID := uuid.New()
	buyerID := uuid.New()

	// 1. Add Ask (Sell Limit: 0.5 BTC @ $65,000)
	sellOrder := &domain.Order{
		ID:           uuid.New(),
		UserID:       sellerID,
		Symbol:       "BTCUSDT",
		Side:         domain.SideSell,
		Type:         domain.TypeLimit,
		Price:        65000.0,
		Amount:       0.5,
		FilledAmount: 0,
		Status:       domain.StatusOpen,
		CreatedAt:    time.Now(),
	}
	ob.Asks = append(ob.Asks, sellOrder)

	// 2. Incoming Buy Order matching the ask (Buy Limit: 0.3 BTC @ $65,100)
	buyOrder := &domain.Order{
		ID:           uuid.New(),
		UserID:       buyerID,
		Symbol:       "BTCUSDT",
		Side:         domain.SideBuy,
		Type:         domain.TypeLimit,
		Price:        65100.0,
		Amount:       0.3,
		FilledAmount: 0,
		Status:       domain.StatusOpen,
		CreatedAt:    time.Now(),
	}

	matches := engine.matchBuyOrder(context.Background(), ob, buyOrder)

	if len(matches) != 1 {
		t.Fatalf("Expected 1 match, got %d", len(matches))
	}

	match := matches[0]
	if match.Amount != 0.3 {
		t.Errorf("Expected match amount 0.3, got %.4f", match.Amount)
	}

	if match.Price != 65000.0 {
		t.Errorf("Expected execution price 65000.0 (maker price), got %.2f", match.Price)
	}

	if buyOrder.Status != domain.StatusFilled {
		t.Errorf("Expected buyOrder status FILLED, got %s", buyOrder.Status)
	}

	if sellOrder.Status != domain.StatusPartiallyFilled {
		t.Errorf("Expected sellOrder status PARTIALLY_FILLED, got %s", sellOrder.Status)
	}

	if sellOrder.FilledAmount != 0.3 {
		t.Errorf("Expected sellOrder filled amount 0.3, got %.4f", sellOrder.FilledAmount)
	}
}
