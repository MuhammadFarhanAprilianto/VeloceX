package market

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"math/rand"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"

	"velocex-backend/internal/domain"
	ws "velocex-backend/internal/websocket"
)

type MarketFeed struct {
	hub            *ws.Hub
	latestPrices   map[string]float64
	tickers        map[string]*domain.MarketTicker
	candlesHistory map[string][]domain.Candlestick
	mu             sync.RWMutex
}

func NewMarketFeed(hub *ws.Hub) *MarketFeed {
	feed := &MarketFeed{
		hub:            hub,
		latestPrices:   make(map[string]float64),
		tickers:        make(map[string]*domain.MarketTicker),
		candlesHistory: make(map[string][]domain.Candlestick),
	}

	// 1. KRIPTO (7 Aset)
	feed.initSymbol("BTCUSDT", 75368.45, 76200.00, 71800.00, 1420500000.0)
	feed.initSymbol("ETHUSDT", 4149.74, 4210.00, 3980.00, 890400000.0)
	feed.initSymbol("SOLUSDT", 175.03, 178.50, 154.20, 650200000.0)
	feed.initSymbol("BNBUSDT", 614.35, 622.00, 598.00, 280100000.0)
	feed.initSymbol("LTCUSDT", 94.92, 96.40, 89.80, 140300000.0)
	feed.initSymbol("ADAUSDT", 0.562, 0.584, 0.552, 95400000.0)
	feed.initSymbol("USDTUSD", 1.0001, 1.0005, 0.9998, 4200000000.0)

	// 2. FOREX (6 Aset)
	feed.initSymbol("EURUSD", 1.0842, 1.0875, 1.0790, 2150000000.0)
	feed.initSymbol("GBPUSD", 1.2915, 1.2950, 1.2820, 1480000000.0)
	feed.initSymbol("USDJPY", 154.60, 155.40, 153.90, 1890000000.0)
	feed.initSymbol("AUDUSD", 0.6580, 0.6610, 0.6520, 820000000.0)
	feed.initSymbol("USDCAD", 1.3820, 1.3860, 1.3790, 710000000.0)
	feed.initSymbol("USDCHF", 0.8840, 0.8870, 0.8805, 590000000.0)

	// 3. CFD & KOMODITAS (6 Aset)
	feed.initSymbol("XAUUSD", 2514.80, 2528.00, 2420.00, 3120000000.0)
	feed.initSymbol("XAGUSD", 29.45, 29.90, 28.10, 480000000.0)
	feed.initSymbol("USOIL", 74.60, 75.80, 73.10, 920000000.0)
	feed.initSymbol("SPX500", 5648.40, 5665.00, 5580.00, 2840000000.0)
	feed.initSymbol("NAS100", 19720.50, 19810.00, 19340.00, 3410000000.0)
	feed.initSymbol("US30", 41250.00, 41380.00, 40850.00, 1950000000.0)

	return feed
}

func (f *MarketFeed) initSymbol(symbol string, basePrice, high24, low24, vol float64) {
	f.latestPrices[symbol] = basePrice
	f.tickers[symbol] = &domain.MarketTicker{
		Symbol:        symbol,
		Price:         basePrice,
		High24h:       high24,
		Low24h:        low24,
		Change24h:     basePrice * 0.024,
		ChangePercent: 2.40,
		Volume24h:     vol,
		Timestamp:     time.Now(),
	}

	// Generate 100 historical 1-minute candles for immediate chart rendering
	now := time.Now().Unix()
	now = now - (now % 60)
	price := basePrice * 0.98

	candles := make([]domain.Candlestick, 100)
	for i := 0; i < 100; i++ {
		t := now - int64((100-i)*60)
		delta := (rand.Float64() - 0.48) * (price * 0.003)
		open := price
		close := price + delta
		high := math.Max(open, close) + rand.Float64()*(price*0.0015)
		low := math.Min(open, close) - rand.Float64()*(price*0.0015)
		volume := 10.0 + rand.Float64()*50.0

		candles[i] = domain.Candlestick{
			Time:   t,
			Open:   math.Round(open*100) / 100,
			High:   math.Round(high*100) / 100,
			Low:    math.Round(low*100) / 100,
			Close:  math.Round(close*100) / 100,
			Volume: math.Round(volume*100) / 100,
		}
		price = close
	}
	f.candlesHistory[symbol] = candles
}

func (f *MarketFeed) Start(ctx context.Context) {
	// Attempt Binance live stream for BTC/USDT in background
	go f.connectBinanceStream(ctx)

	// Start continuous high-performance market generator
	go f.startMarketGenerator(ctx)
}

func (f *MarketFeed) GetLatestPrice(symbol string) float64 {
	f.mu.RLock()
	defer f.mu.RUnlock()
	return f.latestPrices[symbol]
}

func (f *MarketFeed) GetPrice(symbol string) float64 {
	return f.GetLatestPrice(symbol)
}

func (f *MarketFeed) GetTicker(symbol string) *domain.MarketTicker {
	f.mu.RLock()
	defer f.mu.RUnlock()
	return f.tickers[symbol]
}

func (f *MarketFeed) GetAllTickers() []*domain.MarketTicker {
	f.mu.RLock()
	defer f.mu.RUnlock()
	var list []*domain.MarketTicker
	for _, t := range f.tickers {
		list = append(list, t)
	}
	return list
}

func (f *MarketFeed) GetCandles(symbol string, limit int) []domain.Candlestick {
	f.mu.RLock()
	defer f.mu.RUnlock()
	candles := f.candlesHistory[symbol]
	if len(candles) == 0 {
		return []domain.Candlestick{}
	}
	if limit > 0 && len(candles) > limit {
		return candles[len(candles)-limit:]
	}
	return candles
}

// GenerateOrderBookDepth produces a 20-level L2 depth for the given symbol
func (f *MarketFeed) GenerateOrderBookDepth(symbol string) *domain.OrderBookDepth {
	price := f.GetLatestPrice(symbol)
	if price <= 0 {
		price = 75368.45
	}

	asks := make([]domain.DepthLevel, 15)
	bids := make([]domain.DepthLevel, 15)

	askTotal := 0.0
	for i := 0; i < 15; i++ {
		spread := float64(i+1) * (price * 0.0002)
		p := math.Round((price+spread)*100) / 100
		amt := math.Round((0.1+rand.Float64()*1.8)*1000) / 1000
		askTotal += amt
		asks[i] = domain.DepthLevel{
			Price:  p,
			Amount: amt,
			Total:  math.Round(askTotal*1000) / 1000,
		}
	}

	bidTotal := 0.0
	for i := 0; i < 15; i++ {
		spread := float64(i+1) * (price * 0.0002)
		p := math.Round((price-spread)*100) / 100
		amt := math.Round((0.1+rand.Float64()*1.8)*1000) / 1000
		bidTotal += amt
		bids[i] = domain.DepthLevel{
			Price:  p,
			Amount: amt,
			Total:  math.Round(bidTotal*1000) / 1000,
		}
	}

	return &domain.OrderBookDepth{
		Symbol:    symbol,
		Asks:      asks,
		Bids:      bids,
		Timestamp: time.Now(),
	}
}

func (f *MarketFeed) startMarketGenerator(ctx context.Context) {
	ticker := time.NewTicker(500 * time.Millisecond) // Tick every 500ms
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			f.mu.Lock()
			for sym, curPrice := range f.latestPrices {
				// Gentle micro-tick simulation
				pctDelta := (rand.Float64() - 0.495) * 0.0008
				newPrice := curPrice * (1.0 + pctDelta)
				f.latestPrices[sym] = newPrice

				// Update ticker
				t := f.tickers[sym]
				if t != nil {
					t.Price = newPrice
					if newPrice > t.High24h {
						t.High24h = newPrice
					}
					if newPrice < t.Low24h {
						t.Low24h = newPrice
					}
					t.Timestamp = time.Now()
				}
			}
			f.mu.Unlock()

			// Broadcast per-symbol updates to subscribed frontend clients
			for _, sym := range []string{"BTCUSDT", "ETHUSDT", "SOLUSDT", "EURUSD", "XAUUSD"} {
				t := f.GetTicker(sym)
				if t != nil {
					f.hub.BroadcastToTopic("ticker:"+sym, t)
				}
				ob := f.GenerateOrderBookDepth(sym)
				f.hub.BroadcastToTopic("orderbook:"+sym, ob)
			}

			// Broadcast global ticker list
			f.hub.Broadcast("tickers", f.GetAllTickers())
		}
	}
}

func (f *MarketFeed) connectBinanceStream(ctx context.Context) {
	url := "wss://stream.binance.com:9443/ws/btcusdt@trade"
	for {
		select {
		case <-ctx.Done():
			return
		default:
			c, _, err := websocket.DefaultDialer.Dial(url, http.Header{})
			if err != nil {
				time.Sleep(5 * time.Second)
				continue
			}
			log.Println("[MarketFeed] ✅ Connected to Binance Live Stream for BTC/USDT")

			for {
				_, msg, err := c.ReadMessage()
				if err != nil {
					c.Close()
					break
				}
				var tradeMsg struct {
					Price string `json:"p"`
				}
				if err := json.Unmarshal(msg, &tradeMsg); err == nil {
					var p float64
					fmt.Sscanf(tradeMsg.Price, "%f", &p)
					if p > 0 {
						f.mu.Lock()
						f.latestPrices["BTCUSDT"] = p
						if t := f.tickers["BTCUSDT"]; t != nil {
							t.Price = p
						}
						f.mu.Unlock()
					}
				}
			}
			time.Sleep(2 * time.Second)
		}
	}
}
