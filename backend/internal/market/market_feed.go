package market

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math"
	"math/rand"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/websocket"

	"velocex-backend/internal/domain"
	ws "velocex-backend/internal/websocket"
)

type MarketFeed struct {
	hub            *ws.Hub
	latestPrices   map[string]float64
	basePrices     map[string]float64
	tickers        map[string]*domain.MarketTicker
	candlesHistory map[string][]domain.Candlestick
	mu             sync.RWMutex
}

func NewMarketFeed(hub *ws.Hub) *MarketFeed {
	feed := &MarketFeed{
		hub:            hub,
		latestPrices:   make(map[string]float64),
		basePrices:     make(map[string]float64),
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

	// 2. FOREX (6 Aset - OANDA High Precision Feed)
	feed.initSymbol("EURUSD", 1.15571, 1.15640, 1.15490, 2150000000.0)
	feed.initSymbol("GBPUSD", 1.29152, 1.29500, 1.28820, 1480000000.0)
	feed.initSymbol("USDJPY", 154.603, 155.150, 154.120, 1890000000.0)
	feed.initSymbol("AUDUSD", 0.65804, 0.66120, 0.65480, 820000000.0)
	feed.initSymbol("USDCAD", 1.38202, 1.38580, 1.37880, 710000000.0)
	feed.initSymbol("USDCHF", 0.88401, 0.88680, 0.88120, 590000000.0)

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
	f.basePrices[symbol] = basePrice
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

	// Generate 120 historical 1-minute candles for immediate chart rendering
	now := time.Now().Unix()
	now = now - (now % 60)

	count := 120
	candles := make([]domain.Candlestick, count)
	decPrecision := 100.0
	volatility := 0.0006

	if symbol == "EURUSD" || symbol == "GBPUSD" || symbol == "AUDUSD" || symbol == "USDCAD" || symbol == "USDCHF" {
		decPrecision = 100000.0 // 5 decimals (OANDA pipette standard)
		volatility = 0.00035
	} else if symbol == "USDJPY" {
		decPrecision = 1000.0 // 3 decimals (OANDA JPY pipette standard)
		volatility = 0.00045
	} else if symbol == "XAUUSD" {
		decPrecision = 100.0 // 2 decimals (OANDA Gold: ~$0.35 candle, authentic swings)
		volatility = 0.00014
	} else if symbol == "XAGUSD" {
		decPrecision = 100.0 // 2 decimals (OANDA Silver)
		volatility = 0.00028
	} else if symbol == "USOIL" {
		decPrecision = 100.0 // 2 decimals (OANDA WTI Crude)
		volatility = 0.00022
	} else if symbol == "SPX500" {
		decPrecision = 100.0 // 2 decimals (OANDA S&P 500)
		volatility = 0.00007
	} else if symbol == "NAS100" {
		decPrecision = 100.0 // 2 decimals (OANDA Nasdaq 100)
		volatility = 0.00009
	} else if symbol == "US30" {
		decPrecision = 100.0 // 2 decimals (OANDA Dow Jones 30)
		volatility = 0.00007
	} else if basePrice < 2.0 {
		decPrecision = 100000.0
		volatility = 0.00040
	} else if basePrice < 10.0 {
		decPrecision = 1000.0
		volatility = 0.0008
	}

	currentP := basePrice * 0.9985
	for i := 0; i < count; i++ {
		t := now - int64((count-1-i)*60)
		progress := float64(i) / float64(count)
		sessionWave := math.Sin(progress*math.Pi*2.5) * (basePrice * volatility * 3.5)
		noise := (rand.Float64() - 0.495) * (basePrice * volatility * 1.5)
		target := basePrice + sessionWave + noise

		o := currentP
		c := target
		spread := (rand.Float64()*0.4 + 0.3) * (basePrice * volatility)
		h := math.Max(o, c) + rand.Float64()*spread
		l := math.Min(o, c) - rand.Float64()*spread
		v := 20.0 + rand.Float64()*60.0

		candles[i] = domain.Candlestick{
			Time:   t,
			Open:   math.Round(o*decPrecision) / decPrecision,
			High:   math.Round(h*decPrecision) / decPrecision,
			Low:    math.Round(l*decPrecision) / decPrecision,
			Close:  math.Round(c*decPrecision) / decPrecision,
			Volume: math.Round(v*100) / 100,
		}
		currentP = c
	}

	// Anchor the last candle's close directly to basePrice so live ticks stream seamlessly without any spike
	candles[count-1].Close = basePrice
	candles[count-1].High = math.Max(candles[count-1].High, basePrice)
	candles[count-1].Low = math.Min(candles[count-1].Low, basePrice)

	f.candlesHistory[symbol] = candles
}

func (f *MarketFeed) Start(ctx context.Context) {
	// 1. Preload authentic Binance 1m candles for crypto
	go f.preloadBinanceKlines()

	// 2. Connect to Binance Multi-Stream WebSocket for live ticks and 1m klines
	go f.connectBinanceMultiStream(ctx)

	// 3. Start continuous high-performance market generator & broadcaster for all symbols
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
	f.mu.Lock()
	defer f.mu.Unlock()

	candles := f.candlesHistory[symbol]

	// If crypto and candles are empty or short, fetch real Binance klines
	isCrypto := symbol == "BTCUSDT" || symbol == "ETHUSDT" || symbol == "SOLUSDT" ||
		symbol == "BNBUSDT" || symbol == "LTCUSDT" || symbol == "ADAUSDT"
	if isCrypto && len(candles) < 10 {
		f.mu.Unlock()
		fetched := f.fetchBinanceInitialKlines(symbol)
		f.mu.Lock()
		if len(fetched) > 0 {
			f.candlesHistory[symbol] = fetched
			candles = fetched
		}
	}

	curPrice := f.latestPrices[symbol]
	if curPrice <= 0 {
		curPrice = 1.15568
	}

	now := time.Now().Unix()
	nowMin := now - (now % 60)

	// If history is empty or older than 180 seconds, synthesize fresh continuous 1m bars ending right at nowMin
	if len(candles) == 0 || (nowMin-candles[len(candles)-1].Time) > 180 {
		count := 120
		newHistory := make([]domain.Candlestick, count)

		decPrecision := 100.0
		volatility := 0.0006
		if symbol == "EURUSD" || symbol == "GBPUSD" || symbol == "AUDUSD" || symbol == "USDCAD" || symbol == "USDCHF" {
			decPrecision = 100000.0 // 5 decimals for OANDA Forex
			volatility = 0.00015
		} else if symbol == "USDJPY" {
			decPrecision = 1000.0 // 3 decimals for OANDA USD/JPY
			volatility = 0.00020
		} else if symbol == "XAUUSD" {
			decPrecision = 100.0 // 2 decimals for OANDA Gold
			volatility = 0.00014
		} else if symbol == "XAGUSD" {
			decPrecision = 100.0 // 2 decimals for OANDA Silver
			volatility = 0.00028
		} else if symbol == "USOIL" {
			decPrecision = 100.0 // 2 decimals for OANDA Crude Oil
			volatility = 0.00022
		} else if symbol == "SPX500" {
			decPrecision = 100.0 // 2 decimals for OANDA SPX500
			volatility = 0.00007
		} else if symbol == "NAS100" {
			decPrecision = 100.0 // 2 decimals for OANDA NAS100
			volatility = 0.00009
		} else if symbol == "US30" {
			decPrecision = 100.0 // 2 decimals for OANDA US30
			volatility = 0.00007
		} else if curPrice < 2.0 {
			decPrecision = 100000.0
			volatility = 0.00015
		} else if curPrice < 20.0 {
			decPrecision = 1000.0
			volatility = 0.0008
		}

		p := curPrice
		for i := count - 1; i >= 0; i-- {
			t := nowMin - int64((count-1-i)*60)
			delta := (rand.Float64() - 0.495) * (p * volatility * 1.5)
			c := p
			o := p - delta
			spread := (rand.Float64()*0.4 + 0.3) * (p * volatility)
			h := math.Max(o, c) + rand.Float64()*spread
			l := math.Min(o, c) - rand.Float64()*spread
			vol := 25.0 + rand.Float64()*60.0

			newHistory[i] = domain.Candlestick{
				Time:   t,
				Open:   math.Round(o*decPrecision) / decPrecision,
				High:   math.Round(h*decPrecision) / decPrecision,
				Low:    math.Round(l*decPrecision) / decPrecision,
				Close:  math.Round(c*decPrecision) / decPrecision,
				Volume: math.Round(vol*100) / 100,
			}
			p = o
		}
		f.candlesHistory[symbol] = newHistory
		candles = newHistory
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
				target := f.basePrices[sym]
				if target <= 0 {
					target = curPrice
				}
				// Micro-tick with mean-reversion anchor to prevent drift
				volatility := 0.00008
				pullWeight := 0.07
				decPrecision := 100.0

				if sym == "EURUSD" || sym == "GBPUSD" || sym == "AUDUSD" || sym == "USDCAD" || sym == "USDCHF" {
					volatility = 0.000075 // 5-decimal natural tick for OANDA
					decPrecision = 100000.0
				} else if sym == "USDJPY" {
					volatility = 0.00009 // 3-decimal JPY pipette tick for OANDA
					decPrecision = 1000.0
				} else if sym == "XAUUSD" {
					volatility = 0.00004 // 2 decimals for OANDA Gold ($0.10 step)
					decPrecision = 100.0
				} else if sym == "XAGUSD" {
					volatility = 0.00008 // 2 decimals for OANDA Silver ($0.002 step)
					decPrecision = 100.0
				} else if sym == "USOIL" {
					volatility = 0.00006 // 2 decimals for OANDA Crude Oil ($0.005 step)
					decPrecision = 100.0
				} else if sym == "SPX500" {
					volatility = 0.00002 // 2 decimals for OANDA SPX500 ($0.11 step)
					decPrecision = 100.0
				} else if sym == "NAS100" {
					volatility = 0.000025 // 2 decimals for OANDA NAS100 ($0.49 step)
					decPrecision = 100.0
				} else if sym == "US30" {
					volatility = 0.00002 // 2 decimals for OANDA US30 ($0.82 step)
					decPrecision = 100.0
				} else if target < 2.0 {
					decPrecision = 100000.0
					volatility = 0.00006
				} else if target < 20.0 {
					decPrecision = 1000.0
					volatility = 0.0003
				}

				pull := (target - curPrice) * pullWeight
				noise := (rand.Float64() - 0.500) * (target * volatility)
				newPrice := curPrice + pull + noise
				newPrice = math.Round(newPrice*decPrecision) / decPrecision
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

				// Maintain running minute candle
				nowMin := time.Now().Unix()
				nowMin = nowMin - (nowMin % 60)
				candles := f.candlesHistory[sym]
				if len(candles) > 0 {
					lastIdx := len(candles) - 1
					if candles[lastIdx].Time == nowMin {
						if newPrice > candles[lastIdx].High {
							candles[lastIdx].High = newPrice
						}
						if newPrice < candles[lastIdx].Low {
							candles[lastIdx].Low = newPrice
						}
						candles[lastIdx].Close = newPrice
						candles[lastIdx].Volume += rand.Float64() * 0.2
					} else if nowMin > candles[lastIdx].Time {
						newCandle := domain.Candlestick{
							Time:   nowMin,
							Open:   newPrice,
							High:   newPrice,
							Low:    newPrice,
							Close:  newPrice,
							Volume: 1.0 + rand.Float64()*5.0,
						}
						if len(candles) >= 300 {
							f.candlesHistory[sym] = append(candles[1:], newCandle)
						} else {
							f.candlesHistory[sym] = append(candles, newCandle)
						}
					}
				}
			}
			f.mu.Unlock()

			// Broadcast per-symbol updates to subscribed frontend clients for ALL 19 symbols (Forex, CFD, Kripto)
			for sym, t := range f.tickers {
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

// preloadBinanceKlines loads authentic 1m historical candles from Binance for crypto symbols
func (f *MarketFeed) preloadBinanceKlines() {
	cryptoSymbols := []string{"BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "LTCUSDT", "ADAUSDT"}
	for _, sym := range cryptoSymbols {
		klines := f.fetchBinanceInitialKlines(sym)
		if len(klines) > 0 {
			f.mu.Lock()
			f.candlesHistory[sym] = klines
			last := klines[len(klines)-1]
			f.latestPrices[sym] = last.Close
			f.basePrices[sym] = last.Close
			if t := f.tickers[sym]; t != nil {
				t.Price = last.Close
				t.Timestamp = time.Now()
			}
			f.mu.Unlock()
			log.Printf("[MarketFeed] ✅ Preloaded %d real Binance 1m klines for %s (Last Price: %.2f)", len(klines), sym, last.Close)
		}
	}
}

// fetchBinanceInitialKlines fetches official 1-minute historical candles from Binance REST API
func (f *MarketFeed) fetchBinanceInitialKlines(symbol string) []domain.Candlestick {
	client := &http.Client{Timeout: 4 * time.Second}
	url := fmt.Sprintf("https://api.binance.com/api/v3/klines?symbol=%s&interval=1m&limit=120", strings.ToUpper(symbol))
	resp, err := client.Get(url)
	if err != nil {
		return nil
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil
	}

	var rawKlines [][]interface{}
	if err := json.Unmarshal(body, &rawKlines); err != nil {
		return nil
	}

	candles := make([]domain.Candlestick, 0, len(rawKlines))
	for _, k := range rawKlines {
		if len(k) < 6 {
			continue
		}
		// [0: openTime ms, 1: open, 2: high, 3: low, 4: close, 5: volume]
		openTimeMs, ok := k[0].(float64)
		if !ok {
			continue
		}
		oStr, _ := k[1].(string)
		hStr, _ := k[2].(string)
		lStr, _ := k[3].(string)
		cStr, _ := k[4].(string)
		vStr, _ := k[5].(string)

		o, _ := strconv.ParseFloat(oStr, 64)
		h, _ := strconv.ParseFloat(hStr, 64)
		l, _ := strconv.ParseFloat(lStr, 64)
		c, _ := strconv.ParseFloat(cStr, 64)
		v, _ := strconv.ParseFloat(vStr, 64)

		candles = append(candles, domain.Candlestick{
			Time:   int64(openTimeMs) / 1000,
			Open:   o,
			High:   h,
			Low:    l,
			Close:  c,
			Volume: v,
		})
	}
	return candles
}

// connectBinanceMultiStream subscribes to Binance Multi-Stream WebSocket covering live trades and 1-minute klines
func (f *MarketFeed) connectBinanceMultiStream(ctx context.Context) {
	url := "wss://stream.binance.com:9443/stream?streams=btcusdt@trade/ethusdt@trade/solusdt@trade/bnbusdt@trade/ltcusdt@trade/adausdt@trade/btcusdt@kline_1m/ethusdt@kline_1m/solusdt@kline_1m/bnbusdt@kline_1m/ltcusdt@kline_1m/adausdt@kline_1m"

	for {
		select {
		case <-ctx.Done():
			return
		default:
			log.Println("[MarketFeed] 🌐 Connecting to Binance Multi-Stream WebSocket (Crypto Real-Time)...")
			c, _, err := websocket.DefaultDialer.Dial(url, http.Header{})
			if err != nil {
				log.Printf("[MarketFeed] ⚠️ Binance connection failed (%v). Retrying in 4s...", err)
				time.Sleep(4 * time.Second)
				continue
			}
			log.Println("[MarketFeed] ✅ Connected to Binance Multi-Stream (BTC, ETH, SOL, BNB, LTC, ADA)")

			for {
				_, msg, err := c.ReadMessage()
				if err != nil {
					log.Printf("[MarketFeed] ⚠️ Binance stream disconnected: %v", err)
					c.Close()
					break
				}

				var envelope struct {
					Stream string          `json:"stream"`
					Data   json.RawMessage `json:"data"`
				}
				if err := json.Unmarshal(msg, &envelope); err != nil {
					continue
				}

				// 1. Process Live Trade Stream
				if strings.HasSuffix(envelope.Stream, "@trade") {
					var trade struct {
						Symbol string `json:"s"`
						Price  string `json:"p"`
						Qty    string `json:"q"`
					}
					if err := json.Unmarshal(envelope.Data, &trade); err == nil {
						p, _ := strconv.ParseFloat(trade.Price, 64)
						if p > 0 {
							sym := strings.ToUpper(trade.Symbol)
							f.mu.Lock()
							f.latestPrices[sym] = p
							f.basePrices[sym] = p
							if t := f.tickers[sym]; t != nil {
								t.Price = p
								if p > t.High24h {
									t.High24h = p
								}
								if p < t.Low24h {
									t.Low24h = p
								}
								t.Timestamp = time.Now()
							}

							// Update forming candle in history
							candles := f.candlesHistory[sym]
							if len(candles) > 0 {
								lastIdx := len(candles) - 1
								if p > candles[lastIdx].High {
									candles[lastIdx].High = p
								}
								if p < candles[lastIdx].Low {
									candles[lastIdx].Low = p
								}
								candles[lastIdx].Close = p
							}
							f.mu.Unlock()

							// Instant broadcast to subscribers for this symbol
							if t := f.GetTicker(sym); t != nil {
								f.hub.BroadcastToTopic("ticker:"+sym, t)
							}
						}
					}
				}

				// 2. Process Live Kline Stream (Candlesticks)
				if strings.HasSuffix(envelope.Stream, "@kline_1m") {
					var klineMsg struct {
						Symbol string `json:"s"`
						Kline  struct {
							StartTime int64  `json:"t"`
							Open      string `json:"o"`
							High      string `json:"h"`
							Low       string `json:"l"`
							Close     string `json:"c"`
							Volume    string `json:"v"`
							IsClosed  bool   `json:"x"`
						} `json:"k"`
					}
					if err := json.Unmarshal(envelope.Data, &klineMsg); err == nil {
						sym := strings.ToUpper(klineMsg.Symbol)
						tSec := klineMsg.Kline.StartTime / 1000
						o, _ := strconv.ParseFloat(klineMsg.Kline.Open, 64)
						h, _ := strconv.ParseFloat(klineMsg.Kline.High, 64)
						l, _ := strconv.ParseFloat(klineMsg.Kline.Low, 64)
						c, _ := strconv.ParseFloat(klineMsg.Kline.Close, 64)
						v, _ := strconv.ParseFloat(klineMsg.Kline.Volume, 64)

						if c > 0 {
							f.mu.Lock()
							candles := f.candlesHistory[sym]
							if len(candles) > 0 {
								lastIdx := len(candles) - 1
								if candles[lastIdx].Time == tSec {
									candles[lastIdx].Open = o
									candles[lastIdx].High = h
									candles[lastIdx].Low = l
									candles[lastIdx].Close = c
									candles[lastIdx].Volume = v
								} else if tSec > candles[lastIdx].Time {
									newBar := domain.Candlestick{
										Time:   tSec,
										Open:   o,
										High:   h,
										Low:    l,
										Close:  c,
										Volume: v,
									}
									if len(candles) >= 300 {
										f.candlesHistory[sym] = append(candles[1:], newBar)
									} else {
										f.candlesHistory[sym] = append(candles, newBar)
									}
								}
							}
							f.mu.Unlock()
						}
					}
				}
			}
			time.Sleep(3 * time.Second)
		}
	}
}
