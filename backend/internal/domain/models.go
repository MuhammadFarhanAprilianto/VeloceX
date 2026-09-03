package domain

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// OrderSide represents order side BUY or SELL
type OrderSide string

const (
	SideBuy  OrderSide = "BUY"
	SideSell OrderSide = "SELL"
)

// OrderType represents order types
type OrderType string

const (
	TypeLimit        OrderType = "LIMIT"
	TypeMarket       OrderType = "MARKET"
	TypeStopLimit    OrderType = "STOP_LIMIT"
	TypeTakeProfit   OrderType = "TAKE_PROFIT"
	TypeStopLoss     OrderType = "STOP_LOSS"
	TypeTrailingStop OrderType = "TRAILING_STOP"
)

// OrderStatus represents order lifecycle state
type OrderStatus string

const (
	StatusOpen            OrderStatus = "OPEN"
	StatusPartiallyFilled OrderStatus = "PARTIALLY_FILLED"
	StatusFilled          OrderStatus = "FILLED"
	StatusCancelled       OrderStatus = "CANCELLED"
	StatusRejected        OrderStatus = "REJECTED"
)

// SubAccountType represents the 4 wallet sub-accounts
type SubAccountType string

const (
	SubAccountSpot      SubAccountType = "spot"
	SubAccountFutures   SubAccountType = "futures"
	SubAccountLightning SubAccountType = "lightning"
	SubAccountEarn      SubAccountType = "earn"
)

// User entity
type User struct {
	ID             uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	Name           string    `gorm:"type:varchar(100);not null" json:"name"`
	Email          string    `gorm:"type:varchar(255);uniqueIndex;not null" json:"email"`
	PasswordHash   string    `gorm:"type:text;not null" json:"-"`
	TwoFactorSecret string   `gorm:"type:varchar(64)" json:"-"`
	TwoFactorEnabled bool    `gorm:"default:false" json:"two_factor_enabled"`
	AntiPhishingCode string  `gorm:"type:varchar(50);default:''" json:"anti_phishing_code"`
	VipTier        int       `gorm:"default:2" json:"vip_tier"`
	CreatedAt      time.Time `gorm:"autoCreateTime" json:"created_at"`
	Wallets        []Wallet  `gorm:"foreignKey:UserID" json:"wallets,omitempty"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}

// Wallet entity with multi-subaccount support
type Wallet struct {
	ID            uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	UserID        uuid.UUID      `gorm:"type:uuid;not null;index" json:"user_id"`
	SubAccount    SubAccountType `gorm:"type:varchar(20);default:'spot';not null;index" json:"sub_account"`
	Currency      string         `gorm:"type:varchar(10);not null;index" json:"currency"` // e.g. USDT, BTC, ETH
	Balance       float64        `gorm:"type:numeric(28,8);default:0;not null" json:"balance"`
	LockedBalance float64        `gorm:"type:numeric(28,8);default:0;not null" json:"locked_balance"`
	UpdatedAt     time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
}

func (w *Wallet) BeforeCreate(tx *gorm.DB) error {
	if w.ID == uuid.Nil {
		w.ID = uuid.New()
	}
	return nil
}

// LedgerEntry represents an immutable double-entry accounting record
type LedgerEntry struct {
	ID          uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	UserID      uuid.UUID      `gorm:"type:uuid;not null;index" json:"user_id"`
	SubAccount  SubAccountType `gorm:"type:varchar(20);not null;index" json:"sub_account"`
	Currency    string         `gorm:"type:varchar(10);not null" json:"currency"`
	Amount      float64        `gorm:"type:numeric(28,8);not null" json:"amount"`
	Type        string         `gorm:"type:varchar(10);not null" json:"type"` // "DEBIT" or "CREDIT"
	ReferenceID string         `gorm:"type:varchar(100);index" json:"reference_id"`
	Description string         `gorm:"type:varchar(255)" json:"description"`
	CreatedAt   time.Time      `gorm:"autoCreateTime" json:"created_at"`
}

func (l *LedgerEntry) BeforeCreate(tx *gorm.DB) error {
	if l.ID == uuid.Nil {
		l.ID = uuid.New()
	}
	return nil
}

// Order entity
type Order struct {
	ID           uuid.UUID   `gorm:"type:uuid;primaryKey" json:"id"`
	UserID       uuid.UUID   `gorm:"type:uuid;not null;index" json:"user_id"`
	Symbol       string      `gorm:"type:varchar(20);not null;index" json:"symbol"`
	Side         OrderSide   `gorm:"type:varchar(10);not null" json:"side"`
	Type         OrderType   `gorm:"type:varchar(15);not null" json:"type"`
	Price        float64     `gorm:"type:numeric(28,8);default:0;not null" json:"price"`
	StopPrice    float64     `gorm:"type:numeric(28,8);default:0" json:"stop_price"`
	TakeProfit   float64     `gorm:"type:numeric(28,8);default:0" json:"take_profit"`
	StopLoss     float64     `gorm:"type:numeric(28,8);default:0" json:"stop_loss"`
	Amount       float64     `gorm:"type:numeric(28,8);not null" json:"amount"`
	FilledAmount float64     `gorm:"type:numeric(28,8);default:0;not null" json:"filled_amount"`
	Status       OrderStatus `gorm:"type:varchar(20);default:'OPEN';not null;index" json:"status"`
	CreatedAt    time.Time   `gorm:"autoCreateTime" json:"created_at"`
}

func (o *Order) BeforeCreate(tx *gorm.DB) error {
	if o.ID == uuid.Nil {
		o.ID = uuid.New()
	}
	return nil
}

// Trade entity
type Trade struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	BuyOrderID  uuid.UUID `gorm:"type:uuid;not null;index" json:"buy_order_id"`
	SellOrderID uuid.UUID `gorm:"type:uuid;not null;index" json:"sell_order_id"`
	Symbol      string    `gorm:"type:varchar(20);not null;index" json:"symbol"`
	Price       float64   `gorm:"type:numeric(28,8);not null" json:"price"`
	Amount      float64   `gorm:"type:numeric(28,8);not null" json:"amount"`
	ExecutedAt  time.Time `gorm:"autoCreateTime" json:"executed_at"`
}

func (t *Trade) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return nil
}

// LightningContract entity for 5s - 60s Scalping
type LightningContract struct {
	ID               uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	UserID           uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	Symbol           string    `gorm:"type:varchar(20);not null" json:"symbol"`
	Direction        string    `gorm:"type:varchar(10);not null" json:"direction"` // "CALL" (Naik) or "PUT" (Turun)
	DurationSeconds  int       `gorm:"not null" json:"duration_seconds"`          // 5, 10, 30, 60
	StakeAmount      float64   `gorm:"type:numeric(28,8);not null" json:"stake_amount"`
	StrikePrice      float64   `gorm:"type:numeric(28,8);not null" json:"strike_price"`
	SettlementPrice  float64   `gorm:"type:numeric(28,8);default:0" json:"settlement_price"`
	PayoutMultiplier float64   `gorm:"type:numeric(5,2);default:1.90" json:"payout_multiplier"`
	ProfitAmount     float64   `gorm:"type:numeric(28,8);default:0" json:"profit_amount"`
	Status           string    `gorm:"type:varchar(20);default:'OPEN';index" json:"status"` // "OPEN", "WON", "LOST"
	ExpiresAt        time.Time `gorm:"not null;index" json:"expires_at"`
	CreatedAt        time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (lc *LightningContract) BeforeCreate(tx *gorm.DB) error {
	if lc.ID == uuid.Nil {
		lc.ID = uuid.New()
	}
	return nil
}

// ApiKey entity for Bot Trading
type ApiKey struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	UserID      uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	Label       string    `gorm:"type:varchar(100);not null" json:"label"`
	Key         string    `gorm:"type:varchar(64);uniqueIndex;not null" json:"key"`
	SecretHash  string    `gorm:"type:text;not null" json:"-"`
	Permissions string    `gorm:"type:varchar(255);default:'read,spot,futures'" json:"permissions"`
	IPWhitelist string    `gorm:"type:varchar(255);default:'*'" json:"ip_whitelist"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (ak *ApiKey) BeforeCreate(tx *gorm.DB) error {
	if ak.ID == uuid.Nil {
		ak.ID = uuid.New()
	}
	return nil
}

// SupportTicket entity
type SupportTicket struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	UserID    uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	Category  string    `gorm:"type:varchar(50);not null" json:"category"`
	Subject   string    `gorm:"type:varchar(255);not null" json:"subject"`
	Message   string    `gorm:"type:text;not null" json:"message"`
	Priority  string    `gorm:"type:varchar(20);default:'Sedang'" json:"priority"`
	Status    string    `gorm:"type:varchar(20);default:'open';index" json:"status"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (st *SupportTicket) BeforeCreate(tx *gorm.DB) error {
	if st.ID == uuid.Nil {
		st.ID = uuid.New()
	}
	return nil
}

// ChartDrawing entity for persisting user analysis overlays on TradingView charts
type ChartDrawing struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	UserID    uuid.UUID `gorm:"type:uuid;not null;index" json:"user_id"`
	Symbol    string    `gorm:"type:varchar(20);not null;index" json:"symbol"`
	ToolType  string    `gorm:"type:varchar(30);not null" json:"tool_type"`
	Payload   string    `gorm:"type:text;not null" json:"payload"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (cd *ChartDrawing) BeforeCreate(tx *gorm.DB) error {
	if cd.ID == uuid.Nil {
		cd.ID = uuid.New()
	}
	return nil
}

type SaveDrawingRequest struct {
	Symbol   string `json:"symbol" binding:"required"`
	ToolType string `json:"tool_type" binding:"required"`
	Payload  string `json:"payload" binding:"required"`
}

// Auth DTOs
type RegisterRequest struct {
	Name     string `json:"name" binding:"required,min=2,max=100"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type LoginRequest struct {
	Email      string `json:"email" binding:"required,email"`
	Password   string `json:"password" binding:"required"`
	TwoFactor  string `json:"two_factor_code"`
}

type AuthResponse struct {
	User         User   `json:"user"`
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// Order DTOs
type CreateOrderRequest struct {
	Symbol     string    `json:"symbol" binding:"required"`
	Side       OrderSide `json:"side" binding:"required,oneof=BUY SELL"`
	Type       OrderType `json:"type" binding:"required"`
	Price      float64   `json:"price"`
	StopPrice  float64   `json:"stop_price"`
	TakeProfit float64   `json:"take_profit"`
	StopLoss   float64   `json:"stop_loss"`
	Amount     float64   `json:"amount" binding:"required,gt=0"`
}

type UpdateOrderRequest struct {
	Price      float64 `json:"price"`
	StopPrice  float64 `json:"stop_price"`
	TakeProfit float64 `json:"take_profit"`
	StopLoss   float64 `json:"stop_loss"`
}

// Transfer Request DTO
type InternalTransferRequest struct {
	FromSubAccount SubAccountType `json:"from_sub_account" binding:"required"`
	ToSubAccount   SubAccountType `json:"to_sub_account" binding:"required"`
	Currency       string         `json:"currency" binding:"required"`
	Amount         float64        `json:"amount" binding:"required,gt=0"`
}

// Dust Conversion Request DTO
type DustConvertRequest struct {
	Currencies []string `json:"currencies" binding:"required,min=1"`
}

// Lightning Order Request DTO
type LightningOrderRequest struct {
	Symbol          string  `json:"symbol" binding:"required"`
	Direction       string  `json:"direction" binding:"required,oneof=CALL PUT"`
	DurationSeconds int     `json:"duration_seconds" binding:"required,oneof=5 10 30 60"`
	StakeAmount     float64 `json:"stake_amount" binding:"required,gt=0"`
}

// Portfolio DTOs
type AssetBalance struct {
	Currency      string  `json:"currency"`
	SubAccount    string  `json:"sub_account"`
	Balance       float64 `json:"balance"`
	LockedBalance float64 `json:"locked_balance"`
	Total         float64 `json:"total"`
	UsdtValue     float64 `json:"usdt_value"`
}

type SubAccountAllocation struct {
	ID         string  `json:"id"`
	Name       string  `json:"name"`
	BalanceUSD float64 `json:"balance_usd"`
	Pct        float64 `json:"pct"`
}

type PortfolioResponse struct {
	TotalEquityUSDT  float64                `json:"total_equity_usdt"`
	DailyPnLUSDT     float64                `json:"daily_pnl_usdt"`
	DailyPnLPercent  float64                `json:"daily_pnl_percent"`
	HealthScore      int                    `json:"health_score"`
	MarginRatio      float64                `json:"margin_ratio"`
	Allocations      []SubAccountAllocation `json:"allocations"`
	Assets           []AssetBalance         `json:"assets"`
}

// Market Data DTOs
type MarketTicker struct {
	Symbol        string    `json:"symbol"`
	Price         float64   `json:"price"`
	High24h       float64   `json:"high_24h"`
	Low24h        float64   `json:"low_24h"`
	Change24h     float64   `json:"change_24h"`
	ChangePercent float64   `json:"change_percent"`
	Volume24h     float64   `json:"volume_24h"`
	Timestamp     time.Time `json:"timestamp"`
}

type DepthLevel struct {
	Price  float64 `json:"price"`
	Amount float64 `json:"amount"`
	Total  float64 `json:"total"`
}

type OrderBookDepth struct {
	Symbol    string       `json:"symbol"`
	Asks      []DepthLevel `json:"asks"` // Ascending price
	Bids      []DepthLevel `json:"bids"` // Descending price
	Timestamp time.Time    `json:"timestamp"`
}

type Candlestick struct {
	Time   int64   `json:"time"` // Unix timestamp in seconds
	Open   float64 `json:"open"`
	High   float64 `json:"high"`
	Low    float64 `json:"low"`
	Close  float64 `json:"close"`
	Volume float64 `json:"volume"`
}

// Payment Gateway & On-Chain Invoice Models
type PaymentType string

const (
	PaymentTypeFiatQRIS   PaymentType = "FIAT_QRIS"
	PaymentTypeFiatVA     PaymentType = "FIAT_VA"
	PaymentTypeFiatCard   PaymentType = "FIAT_CARD"
	PaymentTypeCryptoUSDT PaymentType = "CRYPTO_USDT"
	PaymentTypeCryptoBTC  PaymentType = "CRYPTO_BTC"
	PaymentTypeCryptoETH  PaymentType = "CRYPTO_ETH"
)

type PaymentStatus string

const (
	PaymentStatusPending   PaymentStatus = "PENDING"
	PaymentStatusPaid      PaymentStatus = "PAID"
	PaymentStatusExpired   PaymentStatus = "EXPIRED"
	PaymentStatusFailed    PaymentStatus = "FAILED"
)

type PaymentInvoice struct {
	ID            uuid.UUID     `gorm:"type:uuid;primaryKey" json:"id"`
	UserID        uuid.UUID     `gorm:"type:uuid;index;not null" json:"user_id"`
	Type          PaymentType   `gorm:"type:varchar(30);not null" json:"type"`
	Currency      string        `gorm:"type:varchar(10);not null" json:"currency"`
	Amount        float64       `gorm:"type:decimal(28,8);not null" json:"amount"`
	FiatAmountIDR float64       `gorm:"type:decimal(28,2)" json:"fiat_amount_idr"`
	Status        PaymentStatus `gorm:"type:varchar(20);default:'PENDING'" json:"status"`
	InvoiceNumber string        `gorm:"type:varchar(64);uniqueIndex;not null" json:"invoice_number"`
	PaymentCode   string        `gorm:"type:text" json:"payment_code"` // QR string, VA Number, or Crypto Address
	Network       string        `gorm:"type:varchar(20)" json:"network"` // TRC20, ERC20, BEP20, BCA, Mandiri, QRIS
	TxHash        string        `gorm:"type:varchar(128)" json:"tx_hash,omitempty"`
	ExpiresAt     time.Time     `json:"expires_at"`
	CreatedAt     time.Time     `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt     time.Time     `gorm:"autoUpdateTime" json:"updated_at"`
}

func (p *PaymentInvoice) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}

// Payment DTOs
type CreateFiatChargeRequest struct {
	Channel   string  `json:"channel" binding:"required"` // QRIS, BCA_VA, MANDIRI_VA, BRI_VA
	AmountUSD float64 `json:"amount_usd" binding:"required,gt=0"`
}

type CreateCryptoInvoiceRequest struct {
	Currency string  `json:"currency" binding:"required"` // USDT, BTC, ETH
	Network  string  `json:"network" binding:"required"`  // TRC20, ERC20, BEP20
	Amount   float64 `json:"amount" binding:"required,gt=0"`
}

type PaymentWebhookPayload struct {
	InvoiceNumber string  `json:"invoice_number" binding:"required"`
	Status        string  `json:"status" binding:"required"` // PAID, EXPIRED, FAILED
	Amount        float64 `json:"amount"`
	TxHash        string  `json:"tx_hash"`
	Signature     string  `json:"signature"`
}

// 2FA & OTP DTOs
type Generate2FAResponse struct {
	Secret     string `json:"secret"`
	QRCodeURL  string `json:"qr_code_url"`
	ManualKey  string `json:"manual_key"`
}

type Enable2FARequest struct {
	Code string `json:"code" binding:"required"`
}

type Verify2FARequest struct {
	Code string `json:"code" binding:"required"`
}

type SendOTPRequest struct {
	Email   string `json:"email" binding:"required,email"`
	Purpose string `json:"purpose"` // REGISTRATION, WITHDRAWAL, RESET_PASSWORD
}

type VerifyOTPRequest struct {
	Email string `json:"email" binding:"required,email"`
	Code  string `json:"code" binding:"required"`
}

type WithdrawFundsRequest struct {
	Currency   string  `json:"currency" binding:"required"`
	SubAccount string  `json:"sub_account" binding:"required"`
	Amount     float64 `json:"amount" binding:"required,gt=0"`
	Address    string  `json:"address" binding:"required"`
	Network    string  `json:"network"`
	TwoFACode  string  `json:"two_fa_code"`
}

