# ⚡ VeloceX: Real-Time Trading & Portfolio Tracker Platform

> **Institutional-Grade Real-Time Crypto Trading Engine & Portfolio Tracker**  
> Built with Go Clean Architecture, PostgreSQL ACID Transactions, WebSocket Hub, Next.js App Router, Framer Motion Micro-Interactions, and Flutter Mobile Client.

---

## 🏛️ System Architecture

```
VeloceX/
├── backend/                      # Prompts 1 & 2: Go Backend & High-Performance Matching Engine
│   ├── cmd/server/main.go        # Server entrypoint & routing
│   ├── internal/
│   │   ├── domain/               # Domain models: User, Wallet, Order, Trade, DTOs
│   │   ├── config/               # Environment configuration loader
│   │   ├── repository/           # PostgreSQL repository with ACID transactions & row locking
│   │   ├── service/              # AuthService (bcrypt + dual JWT), PortfolioService, OrderService
│   │   ├── handler/              # HTTP REST handlers, Auth middleware, and WebSocket upgrader
│   │   ├── websocket/            # WebSocket Hub, client connection pumps, topic manager
│   │   ├── engine/               # In-Memory order book matching + PostgreSQL trade settlement
│   │   └── market/               # Real-time market feed generator & Binance live stream connector
│   ├── migrations/               # PostgreSQL schema migration (000001_init_schema.sql)
│   ├── Dockerfile                # Multi-stage production container
│   ├── go.mod / go.sum
│   └── .env.example
├── frontend/                     # Prompts 3 & 4: Next.js Trading Dashboard & Framer Motion
│   ├── src/
│   │   ├── app/                  # Next.js App Router (layout, main terminal page, styles)
│   │   ├── components/           # Trading components:
│   │   │   ├── Header.tsx        # Balance, profile avatar, live WS ping indicator
│   │   │   ├── CandlestickChart.tsx # Lightweight Charts (TradingView) live candles & volume
│   │   │   ├── OrderBook.tsx     # Bids/Asks depth table with row flash micro-interactions
│   │   │   ├── OrderActionPanel.tsx # Limit/Market toggle, percentage slider with spring physics
│   │   │   ├── OrdersTable.tsx   # Open Orders & Trade History tabs with cancel support
│   │   │   ├── PriceTickerPulse.tsx # Rolling number & soft green/red flash badge on tick updates
│   │   │   ├── OrderSuccessModal.tsx# Spring scale-up (0.95 -> 1.0) with SVG checkmark path draw
│   │   │   ├── SkeletonShimmer.tsx  # Smooth gradient loading shimmer effect
│   │   │   └── AuthModal.tsx     # Quick account connect & $50,000 demo funding
│   │   ├── hooks/                # useTradingWebSocket custom auto-reconnecting streaming hook
│   │   ├── store/                # Zustand stores (useTradingStore, useAuthStore)
│   │   ├── types/                # TypeScript trading & portfolio definitions
│   │   └── lib/                  # Fetch client with Bearer token & refresh handlers
│   ├── tailwind.config.ts        # Custom fintech dark palette tokens
│   └── package.json
├── mobile/                       # Prompt 5: Flutter Cross-Platform Mobile Client
│   ├── lib/
│   │   ├── main.dart             # Mobile app entrypoint with BottomNavigationBar
│   │   ├── core/
│   │   │   ├── api/              # ApiClient with automatic JWT injection & error handling
│   │   │   ├── storage/          # SecureStorageService for JWT Access and Refresh tokens
│   │   │   └── websocket/        # WebSocketService with WidgetsBindingObserver lifecycle handling
│   │   └── features/
│   │       ├── auth/             # AuthProvider & token state
│   │       ├── portfolio/        # PortfolioScreen: Total equity card, PnL badge, asset breakdown
│   │       ├── trade/            # TradeScreen: Mini chart, live orderbook, quick Buy/Sell forms
│   │       └── orders/           # OrdersScreen: Transaction history & status filter chips
│   └── pubspec.yaml
├── docker-compose.yml            # PostgreSQL 16 + Redis 7 + Go backend container stack
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Start Database & Infrastructure (Docker Compose)
```bash
docker compose up -d postgres redis
```

### 2. Run Go Backend
```bash
cd backend
go run cmd/server/main.go
```
*The backend will automatically connect to PostgreSQL, run database auto-migrations, start the WebSocket Hub on `/ws`, and boot the order matching engine on port `8080`.*

### 3. Run Frontend Web Dashboard (Next.js)
```bash
cd frontend
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 4. Run Mobile App (Flutter)
```bash
cd mobile
flutter run
```

---

## 📡 REST API & WebSocket Specifications

### REST Endpoints (`/api/v1`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/auth/register` | Register new user + provision $50k demo wallets | No |
| `POST` | `/auth/login` | Authenticate user, return Access & Refresh tokens | No |
| `POST` | `/auth/refresh` | Issue new access token using refresh token | No |
| `GET` | `/portfolio` | Get asset balances, total equity (USDT), daily PnL | Yes (Bearer JWT) |
| `GET` | `/orders` | List open & history orders with status/symbol filters | Yes (Bearer JWT) |
| `POST` | `/orders` | Place LIMIT / MARKET order (locks wallet funds) | Yes (Bearer JWT) |
| `DELETE`| `/orders/:id` | Cancel open order and unlock remaining balance | Yes (Bearer JWT) |
| `GET` | `/trades` | Get user executed trade history | Yes (Bearer JWT) |
| `GET` | `/market/tickers` | Get 24h market statistics for all symbols | No |
| `GET` | `/market/candles` | Get historical 1-minute OHLCV candles | No |
| `GET` | `/market/depth` | Get current orderbook depth snapshot | No |

### WebSocket Channels (`ws://localhost:8080/ws`)
- **Subscribe**: `{"action": "subscribe", "topic": "ticker:BTCUSDT"}`
- **Depth**: `{"action": "subscribe", "topic": "orderbook:BTCUSDT"}`
- **Private Execution Alerts**: `user:order_executed` (automatically routed when connected with `?token=<JWT>`)

---

## 🎨 Micro-Interactions & Motion Implementation (Prompt 4)
- **Price Ticker Pulse**: Rolling number with soft green overlay flash on price increase and red flash on decrease (300ms transition).
- **Order Book Row Flash**: Rows highlight with `rgba(16, 185, 129, 0.2)` or `rgba(244, 63, 94, 0.2)` fading smoothly upon depth changes.
- **Buy/Sell Tab Switch**: Smooth active tab indicator transition via Framer Motion `layoutId="active-tab"`.
- **Percentage Slider**: Spring physics (`stiffness: 300, damping: 20`) with 25%, 50%, 75%, 100% quick chips.
- **Order Success Modal**: Spring scale-up (`0.95 -> 1.0`) with animated SVG checkmark stroke draw path (`pathLength: [0, 1]`).
- **Skeleton Shimmer**: Sleek gradient shimmer loading skeleton during initial data hydration.
