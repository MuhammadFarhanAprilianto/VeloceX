package engine

import (
	"context"
	"fmt"
	"log"
	"math"
	"sort"
	"sync"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"velocex-backend/internal/domain"
	"velocex-backend/internal/repository"
	"velocex-backend/internal/websocket"
)

// MatchResult represents a matched trade between two orders
type MatchResult struct {
	TradeID     uuid.UUID
	BuyOrderID  uuid.UUID
	SellOrderID uuid.UUID
	BuyerID     uuid.UUID
	SellerID    uuid.UUID
	Symbol      string
	Price       float64
	Amount      float64
	ExecutedAt  time.Time
}

// OrderBook represents in-memory book for a symbol
type OrderBook struct {
	Symbol string
	Bids   []*domain.Order // Highest price first
	Asks   []*domain.Order // Lowest price first
	mu     sync.RWMutex
}

// MatchingEngine manages order books for all symbols and executes ACID trades
type MatchingEngine struct {
	repo       repository.Repository
	hub        *websocket.Hub
	orderBooks map[string]*OrderBook
	orderQueue chan *domain.Order
	mu         sync.RWMutex
}

func NewMatchingEngine(repo repository.Repository, hub *websocket.Hub) *MatchingEngine {
	return &MatchingEngine{
		repo:       repo,
		hub:        hub,
		orderBooks: make(map[string]*OrderBook),
		orderQueue: make(chan *domain.Order, 1024),
	}
}

func (m *MatchingEngine) Start(ctx context.Context) {
	// Initialize default symbols
	symbols := []string{"BTCUSDT", "ETHUSDT", "SOLUSDT"}
	for _, s := range symbols {
		m.getOrCreateOrderBook(s)
		m.loadActiveOrders(ctx, s)
	}

	// Order processing loop
	go func() {
		for {
			select {
			case <-ctx.Done():
				return
			case order := <-m.orderQueue:
				m.processOrder(context.Background(), order)
			}
		}
	}()
}

func (m *MatchingEngine) SubmitOrder(order *domain.Order) {
	m.orderQueue <- order
}

func (m *MatchingEngine) getOrCreateOrderBook(symbol string) *OrderBook {
	m.mu.Lock()
	defer m.mu.Unlock()

	if ob, exists := m.orderBooks[symbol]; exists {
		return ob
	}

	ob := &OrderBook{
		Symbol: symbol,
		Bids:   make([]*domain.Order, 0),
		Asks:   make([]*domain.Order, 0),
	}
	m.orderBooks[symbol] = ob
	return ob
}

func (m *MatchingEngine) loadActiveOrders(ctx context.Context, symbol string) {
	orders, err := m.repo.GetActiveOrdersBySymbol(ctx, symbol)
	if err != nil {
		log.Printf("[Engine] Failed loading active orders for %s: %v", symbol, err)
		return
	}

	ob := m.getOrCreateOrderBook(symbol)
	ob.mu.Lock()
	defer ob.mu.Unlock()

	for i := range orders {
		order := &orders[i]
		if order.Side == domain.SideBuy {
			ob.Bids = append(ob.Bids, order)
		} else {
			ob.Asks = append(ob.Asks, order)
		}
	}
	m.sortBids(ob)
	m.sortAsks(ob)
}

func (m *MatchingEngine) processOrder(ctx context.Context, incoming *domain.Order) {
	ob := m.getOrCreateOrderBook(incoming.Symbol)
	ob.mu.Lock()
	defer ob.mu.Unlock()

	var matches []MatchResult

	if incoming.Side == domain.SideBuy {
		matches = m.matchBuyOrder(ctx, ob, incoming)
	} else {
		matches = m.matchSellOrder(ctx, ob, incoming)
	}

	// Persist matches in ACID database transaction
	for _, match := range matches {
		if err := m.executeTradeTransaction(ctx, match); err != nil {
			log.Printf("[Engine] Error executing trade transaction: %v", err)
		} else {
			log.Printf("[Engine] MATCH EXECUTED: %s %.4f @ %.2f", match.Symbol, match.Amount, match.Price)
			// Broadcast trade execution to buyers and sellers
			m.hub.BroadcastToUser(match.BuyerID.String(), "order_executed", match)
			m.hub.BroadcastToUser(match.SellerID.String(), "order_executed", match)
		}
	}

	// If incoming order still has remaining amount and is LIMIT order, place into book
	remaining := incoming.Amount - incoming.FilledAmount
	if remaining > 0 && incoming.Type == domain.TypeLimit {
		if incoming.Side == domain.SideBuy {
			ob.Bids = append(ob.Bids, incoming)
			m.sortBids(ob)
		} else {
			ob.Asks = append(ob.Asks, incoming)
			m.sortAsks(ob)
		}
	}

	// Broadcast updated OrderBook Depth to WebSocket topic "orderbook:{symbol}"
	m.broadcastDepth(ob)
}

func (m *MatchingEngine) matchBuyOrder(ctx context.Context, ob *OrderBook, incoming *domain.Order) []MatchResult {
	var results []MatchResult

	i := 0
	for i < len(ob.Asks) {
		ask := ob.Asks[i]
		remainingBuy := incoming.Amount - incoming.FilledAmount
		if remainingBuy <= 0 {
			break
		}

		// Price match check
		if incoming.Type == domain.TypeLimit && incoming.Price < ask.Price {
			// Lowest ask is higher than limit buy price; cannot match
			break
		}

		// Determine execution price (maker price takes priority)
		execPrice := ask.Price
		remainingAsk := ask.Amount - ask.FilledAmount
		matchAmount := math.Min(remainingBuy, remainingAsk)

		// Create match
		match := MatchResult{
			TradeID:     uuid.New(),
			BuyOrderID:  incoming.ID,
			SellOrderID: ask.ID,
			BuyerID:     incoming.UserID,
			SellerID:    ask.UserID,
			Symbol:      incoming.Symbol,
			Price:       execPrice,
			Amount:      matchAmount,
			ExecutedAt:  time.Now(),
		}
		results = append(results, match)

		// Update in-memory amounts
		incoming.FilledAmount += matchAmount
		ask.FilledAmount += matchAmount

		if incoming.FilledAmount >= incoming.Amount {
			incoming.Status = domain.StatusFilled
		} else {
			incoming.Status = domain.StatusPartiallyFilled
		}

		if ask.FilledAmount >= ask.Amount {
			ask.Status = domain.StatusFilled
			// Remove filled ask from in-memory book
			ob.Asks = append(ob.Asks[:i], ob.Asks[i+1:]...)
		} else {
			ask.Status = domain.StatusPartiallyFilled
			i++
		}
	}

	return results
}

func (m *MatchingEngine) matchSellOrder(ctx context.Context, ob *OrderBook, incoming *domain.Order) []MatchResult {
	var results []MatchResult

	i := 0
	for i < len(ob.Bids) {
		bid := ob.Bids[i]
		remainingSell := incoming.Amount - incoming.FilledAmount
		if remainingSell <= 0 {
			break
		}

		// Price match check
		if incoming.Type == domain.TypeLimit && incoming.Price > bid.Price {
			// Highest bid is lower than limit sell price; cannot match
			break
		}

		// Determine execution price (maker price takes priority)
		execPrice := bid.Price
		remainingBid := bid.Amount - bid.FilledAmount
		matchAmount := math.Min(remainingSell, remainingBid)

		match := MatchResult{
			TradeID:     uuid.New(),
			BuyOrderID:  bid.ID,
			SellOrderID: incoming.ID,
			BuyerID:     bid.UserID,
			SellerID:    incoming.UserID,
			Symbol:      incoming.Symbol,
			Price:       execPrice,
			Amount:      matchAmount,
			ExecutedAt:  time.Now(),
		}
		results = append(results, match)

		// Update in-memory amounts
		incoming.FilledAmount += matchAmount
		bid.FilledAmount += matchAmount

		if incoming.FilledAmount >= incoming.Amount {
			incoming.Status = domain.StatusFilled
		} else {
			incoming.Status = domain.StatusPartiallyFilled
		}

		if bid.FilledAmount >= bid.Amount {
			bid.Status = domain.StatusFilled
			// Remove filled bid from in-memory book
			ob.Bids = append(ob.Bids[:i], ob.Bids[i+1:]...)
		} else {
			bid.Status = domain.StatusPartiallyFilled
			i++
		}
	}

	return results
}

// executeTradeTransaction performs ACID balance adjustments and creates trade record
func (m *MatchingEngine) executeTradeTransaction(ctx context.Context, match MatchResult) error {
	baseCurrency, quoteCurrency := parseSymbol(match.Symbol)
	quoteAmount := match.Price * match.Amount

	return m.repo.WithTransaction(ctx, func(txRepo repository.Repository, tx *gorm.DB) error {
		// 1. Record trade
		trade := &domain.Trade{
			ID:          match.TradeID,
			BuyOrderID:  match.BuyOrderID,
			SellOrderID: match.SellOrderID,
			Symbol:      match.Symbol,
			Price:       match.Price,
			Amount:      match.Amount,
			ExecutedAt:  match.ExecutedAt,
		}
		if err := txRepo.CreateTrade(ctx, tx, trade); err != nil {
			return fmt.Errorf("failed to create trade: %w", err)
		}

		// 2. Update Buy Order
		var buyOrder domain.Order
		if err := forUpdate(tx).
			Where("id = ?", match.BuyOrderID).First(&buyOrder).Error; err != nil {
			return err
		}
		buyOrder.FilledAmount += match.Amount
		if buyOrder.FilledAmount >= buyOrder.Amount {
			buyOrder.Status = domain.StatusFilled
		} else {
			buyOrder.Status = domain.StatusPartiallyFilled
		}
		if err := tx.Save(&buyOrder).Error; err != nil {
			return err
		}

		// 3. Update Sell Order
		var sellOrder domain.Order
		if err := forUpdate(tx).
			Where("id = ?", match.SellOrderID).First(&sellOrder).Error; err != nil {
			return err
		}
		sellOrder.FilledAmount += match.Amount
		if sellOrder.FilledAmount >= sellOrder.Amount {
			sellOrder.Status = domain.StatusFilled
		} else {
			sellOrder.Status = domain.StatusPartiallyFilled
		}
		if err := tx.Save(&sellOrder).Error; err != nil {
			return err
		}

		// 4. Update Buyer Wallets:
		// Buyer: Deduct locked quote currency (USDT), Credit base currency (BTC)
		var buyerQuoteWallet, buyerBaseWallet domain.Wallet
		if err := forUpdate(tx).
			Where("user_id = ? AND currency = ?", match.BuyerID, quoteCurrency).
			First(&buyerQuoteWallet).Error; err != nil {
			return err
		}
		buyerQuoteWallet.LockedBalance -= quoteAmount
		if buyerQuoteWallet.LockedBalance < 0 {
			buyerQuoteWallet.LockedBalance = 0
		}
		if err := tx.Save(&buyerQuoteWallet).Error; err != nil {
			return err
		}

		if err := forUpdate(tx).
			Where("user_id = ? AND currency = ?", match.BuyerID, baseCurrency).
			FirstOrCreate(&buyerBaseWallet, domain.Wallet{UserID: match.BuyerID, Currency: baseCurrency}).Error; err != nil {
			return err
		}
		buyerBaseWallet.Balance += match.Amount
		if err := tx.Save(&buyerBaseWallet).Error; err != nil {
			return err
		}

		// 5. Update Seller Wallets:
		// Seller: Deduct locked base currency (BTC), Credit quote currency (USDT)
		var sellerBaseWallet, sellerQuoteWallet domain.Wallet
		if err := forUpdate(tx).
			Where("user_id = ? AND currency = ?", match.SellerID, baseCurrency).
			First(&sellerBaseWallet).Error; err != nil {
			return err
		}
		sellerBaseWallet.LockedBalance -= match.Amount
		if sellerBaseWallet.LockedBalance < 0 {
			sellerBaseWallet.LockedBalance = 0
		}
		if err := tx.Save(&sellerBaseWallet).Error; err != nil {
			return err
		}

		if err := forUpdate(tx).
			Where("user_id = ? AND currency = ?", match.SellerID, quoteCurrency).
			FirstOrCreate(&sellerQuoteWallet, domain.Wallet{UserID: match.SellerID, Currency: quoteCurrency}).Error; err != nil {
			return err
		}
		sellerQuoteWallet.Balance += quoteAmount
		if err := tx.Save(&sellerQuoteWallet).Error; err != nil {
			return err
		}

		return nil
	})
}

// RemoveCancelledOrder removes a cancelled order from in-memory order book
func (m *MatchingEngine) RemoveCancelledOrder(order *domain.Order) {
	ob := m.getOrCreateOrderBook(order.Symbol)
	ob.mu.Lock()
	defer ob.mu.Unlock()

	if order.Side == domain.SideBuy {
		for i, b := range ob.Bids {
			if b.ID == order.ID {
				ob.Bids = append(ob.Bids[:i], ob.Bids[i+1:]...)
				break
			}
		}
	} else {
		for i, a := range ob.Asks {
			if a.ID == order.ID {
				ob.Asks = append(ob.Asks[:i], ob.Asks[i+1:]...)
				break
			}
		}
	}

	m.broadcastDepth(ob)
}

func (m *MatchingEngine) GetDepth(symbol string) domain.OrderBookDepth {
	ob := m.getOrCreateOrderBook(symbol)
	ob.mu.RLock()
	defer ob.mu.RUnlock()

	return m.buildDepthSnapshot(ob)
}

func (m *MatchingEngine) buildDepthSnapshot(ob *OrderBook) domain.OrderBookDepth {
	// Aggregate asks
	askMap := make(map[float64]float64)
	for _, a := range ob.Asks {
		rem := a.Amount - a.FilledAmount
		if rem > 0 {
			askMap[a.Price] += rem
		}
	}

	var askPrices []float64
	for p := range askMap {
		askPrices = append(askPrices, p)
	}
	sort.Float64s(askPrices) // Ascending

	var asks []domain.DepthLevel
	var askTotal float64
	for _, p := range askPrices {
		amt := askMap[p]
		askTotal += amt
		asks = append(asks, domain.DepthLevel{
			Price:  p,
			Amount: amt,
			Total:  askTotal,
		})
		if len(asks) >= 15 {
			break
		}
	}

	// Aggregate bids
	bidMap := make(map[float64]float64)
	for _, b := range ob.Bids {
		rem := b.Amount - b.FilledAmount
		if rem > 0 {
			bidMap[b.Price] += rem
		}
	}

	var bidPrices []float64
	for p := range bidMap {
		bidPrices = append(bidPrices, p)
	}
	sort.Slice(bidPrices, func(i, j int) bool {
		return bidPrices[i] > bidPrices[j] // Descending
	})

	var bids []domain.DepthLevel
	var bidTotal float64
	for _, p := range bidPrices {
		amt := bidMap[p]
		bidTotal += amt
		bids = append(bids, domain.DepthLevel{
			Price:  p,
			Amount: amt,
			Total:  bidTotal,
		})
		if len(bids) >= 15 {
			break
		}
	}

	return domain.OrderBookDepth{
		Symbol:    ob.Symbol,
		Asks:      asks,
		Bids:      bids,
		Timestamp: time.Now(),
	}
}

func (m *MatchingEngine) broadcastDepth(ob *OrderBook) {
	depth := m.buildDepthSnapshot(ob)
	topic := fmt.Sprintf("orderbook:%s", ob.Symbol)
	m.hub.BroadcastToTopic(topic, depth)
}

func (m *MatchingEngine) sortBids(ob *OrderBook) {
	sort.Slice(ob.Bids, func(i, j int) bool {
		if ob.Bids[i].Price == ob.Bids[j].Price {
			return ob.Bids[i].CreatedAt.Before(ob.Bids[j].CreatedAt)
		}
		return ob.Bids[i].Price > ob.Bids[j].Price
	})
}

func (m *MatchingEngine) sortAsks(ob *OrderBook) {
	sort.Slice(ob.Asks, func(i, j int) bool {
		if ob.Asks[i].Price == ob.Asks[j].Price {
			return ob.Asks[i].CreatedAt.Before(ob.Asks[j].CreatedAt)
		}
		return ob.Asks[i].Price < ob.Asks[j].Price
	})
}

func parseSymbol(symbol string) (base, quote string) {
	if len(symbol) > 4 && symbol[len(symbol)-4:] == "USDT" {
		return symbol[:len(symbol)-4], "USDT"
	}
	return symbol, "USDT"
}

func forUpdate(db *gorm.DB) *gorm.DB {
	if db.Dialector != nil && db.Dialector.Name() == "postgres" {
		return db.Clauses(clause.Locking{Strength: "UPDATE"})
	}
	return db
}

