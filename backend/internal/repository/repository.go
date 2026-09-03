package repository

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"

	"velocex-backend/internal/domain"
)

var (
	ErrUserNotFound        = errors.New("user not found")
	ErrEmailExists         = errors.New("email already registered")
	ErrWalletNotFound      = errors.New("wallet not found")
	ErrInsufficientFunds   = errors.New("insufficient available balance")
	ErrOrderNotFound       = errors.New("order not found")
	ErrOrderNotCancellable = errors.New("order is already filled or cancelled")
)

type Repository interface {
	// User operations
	CreateUser(ctx context.Context, user *domain.User) error
	GetUserByEmail(ctx context.Context, email string) (*domain.User, error)
	GetUserByID(ctx context.Context, id uuid.UUID) (*domain.User, error)
	UpdateUserSecurity(ctx context.Context, userID uuid.UUID, twoFactorSecret string, twoFactorEnabled bool, antiPhishing string) error

	// Wallet operations
	GetWalletsByUserID(ctx context.Context, userID uuid.UUID) ([]domain.Wallet, error)
	GetSubAccountWallets(ctx context.Context, userID uuid.UUID, subAccount domain.SubAccountType) ([]domain.Wallet, error)
	GetWallet(ctx context.Context, userID uuid.UUID, subAccount domain.SubAccountType, currency string) (*domain.Wallet, error)
	CreateDefaultWallets(ctx context.Context, userID uuid.UUID) error
	LockBalance(ctx context.Context, tx *gorm.DB, userID uuid.UUID, subAccount domain.SubAccountType, currency string, amount float64) error
	UnlockBalance(ctx context.Context, tx *gorm.DB, userID uuid.UUID, subAccount domain.SubAccountType, currency string, amount float64) error
	CreditWallet(ctx context.Context, tx *gorm.DB, userID uuid.UUID, subAccount domain.SubAccountType, currency string, amount float64) error
	DebitWallet(ctx context.Context, tx *gorm.DB, userID uuid.UUID, subAccount domain.SubAccountType, currency string, amount float64) error

	// Double-Entry Ledger operations
	CreateLedgerEntry(ctx context.Context, tx *gorm.DB, entry *domain.LedgerEntry) error
	GetLedgerEntries(ctx context.Context, userID uuid.UUID, limit, offset int) ([]domain.LedgerEntry, error)

	// Order operations
	CreateOrder(ctx context.Context, tx *gorm.DB, order *domain.Order) error
	GetOrderByID(ctx context.Context, id uuid.UUID) (*domain.Order, error)
	GetOrders(ctx context.Context, userID uuid.UUID, symbol string, status domain.OrderStatus, limit, offset int) ([]domain.Order, int64, error)
	GetActiveOrdersBySymbol(ctx context.Context, symbol string) ([]domain.Order, error)
	UpdateOrder(ctx context.Context, tx *gorm.DB, order *domain.Order) error
	CancelOrder(ctx context.Context, orderID, userID uuid.UUID) (*domain.Order, error)

	// Trade operations
	CreateTrade(ctx context.Context, tx *gorm.DB, trade *domain.Trade) error
	GetTradesBySymbol(ctx context.Context, symbol string, limit int) ([]domain.Trade, error)
	GetTradesByUserID(ctx context.Context, userID uuid.UUID, limit, offset int) ([]domain.Trade, int64, error)

	// Lightning Scalp Contract operations
	CreateLightningContract(ctx context.Context, tx *gorm.DB, contract *domain.LightningContract) error
	GetActiveLightningContracts(ctx context.Context) ([]domain.LightningContract, error)
	SettleLightningContract(ctx context.Context, tx *gorm.DB, contract *domain.LightningContract) error
	GetLightningContractsByUserID(ctx context.Context, userID uuid.UUID, limit, offset int) ([]domain.LightningContract, int64, error)

	// API Keys operations
	CreateApiKey(ctx context.Context, key *domain.ApiKey) error
	GetApiKeysByUserID(ctx context.Context, userID uuid.UUID) ([]domain.ApiKey, error)
	DeleteApiKey(ctx context.Context, id, userID uuid.UUID) error

	// Support Tickets operations
	CreateSupportTicket(ctx context.Context, ticket *domain.SupportTicket) error
	GetSupportTicketsByUserID(ctx context.Context, userID uuid.UUID) ([]domain.SupportTicket, error)

	// Transaction helper
	WithTransaction(ctx context.Context, fn func(txRepo Repository, tx *gorm.DB) error) error
	DB() *gorm.DB
}

type postgresRepo struct {
	db *gorm.DB
}

func NewPostgresRepository(db *gorm.DB) Repository {
	return &postgresRepo{db: db}
}

func (r *postgresRepo) DB() *gorm.DB {
	return r.db
}

func (r *postgresRepo) WithTransaction(ctx context.Context, fn func(txRepo Repository, tx *gorm.DB) error) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		txRepo := &postgresRepo{db: tx}
		return fn(txRepo, tx)
	})
}

// User methods
func (r *postgresRepo) CreateUser(ctx context.Context, user *domain.User) error {
	if err := r.db.WithContext(ctx).Create(user).Error; err != nil {
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return ErrEmailExists
		}
		return err
	}
	return nil
}

func (r *postgresRepo) GetUserByEmail(ctx context.Context, email string) (*domain.User, error) {
	var user domain.User
	if err := r.db.WithContext(ctx).Where("email = ?", email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}
	return &user, nil
}

func (r *postgresRepo) GetUserByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	var user domain.User
	if err := r.db.WithContext(ctx).Preload("Wallets").Where("id = ?", id).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}
	return &user, nil
}

func (r *postgresRepo) UpdateUserSecurity(ctx context.Context, userID uuid.UUID, twoFactorSecret string, twoFactorEnabled bool, antiPhishing string) error {
	updates := map[string]interface{}{
		"two_factor_enabled": twoFactorEnabled,
	}
	if twoFactorSecret != "" {
		updates["two_factor_secret"] = twoFactorSecret
	}
	if antiPhishing != "" {
		updates["anti_phishing_code"] = antiPhishing
	}
	return r.db.WithContext(ctx).Model(&domain.User{}).Where("id = ?", userID).Updates(updates).Error
}

// Wallet methods
func (r *postgresRepo) GetWalletsByUserID(ctx context.Context, userID uuid.UUID) ([]domain.Wallet, error) {
	var wallets []domain.Wallet
	if err := r.db.WithContext(ctx).Where("user_id = ?", userID).Find(&wallets).Error; err != nil {
		return nil, err
	}
	return wallets, nil
}

func (r *postgresRepo) GetSubAccountWallets(ctx context.Context, userID uuid.UUID, subAccount domain.SubAccountType) ([]domain.Wallet, error) {
	var wallets []domain.Wallet
	if err := r.db.WithContext(ctx).Where("user_id = ? AND sub_account = ?", userID, subAccount).Find(&wallets).Error; err != nil {
		return nil, err
	}
	return wallets, nil
}

func (r *postgresRepo) GetWallet(ctx context.Context, userID uuid.UUID, subAccount domain.SubAccountType, currency string) (*domain.Wallet, error) {
	var wallet domain.Wallet
	if err := r.db.WithContext(ctx).Where("user_id = ? AND sub_account = ? AND currency = ?", userID, subAccount, currency).First(&wallet).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrWalletNotFound
		}
		return nil, err
	}
	return &wallet, nil
}

func (r *postgresRepo) CreateDefaultWallets(ctx context.Context, userID uuid.UUID) error {
	currencies := []string{
		"USDT", "BTC", "ETH", "SOL", "BNB", "LTC", "ADA",
		"EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCAD", "USDCHF",
		"XAUUSD", "XAGUSD", "USOIL", "SPX500", "NAS100", "US30",
	}

	subAccounts := []domain.SubAccountType{
		domain.SubAccountSpot,
		domain.SubAccountFutures,
		domain.SubAccountLightning,
		domain.SubAccountEarn,
	}

	var wallets []domain.Wallet
	for _, sub := range subAccounts {
		for _, c := range currencies {
			wallets = append(wallets, domain.Wallet{
				UserID:        userID,
				SubAccount:    sub,
				Currency:      c,
				Balance:       0.0,
				LockedBalance: 0.0,
			})
		}
	}
	return r.db.WithContext(ctx).Create(&wallets).Error
}

func (r *postgresRepo) queryWithLock(db *gorm.DB, ctx context.Context) *gorm.DB {
	q := db.WithContext(ctx)
	if db.Dialector.Name() == "postgres" {
		q = q.Clauses(clause.Locking{Strength: "UPDATE"})
	}
	return q
}

func (r *postgresRepo) LockBalance(ctx context.Context, tx *gorm.DB, userID uuid.UUID, subAccount domain.SubAccountType, currency string, amount float64) error {
	db := r.db
	if tx != nil {
		db = tx
	}

	var wallet domain.Wallet
	err := r.queryWithLock(db, ctx).
		Where("user_id = ? AND sub_account = ? AND currency = ?", userID, subAccount, currency).
		First(&wallet).Error

	if err != nil {
		return ErrWalletNotFound
	}

	if wallet.Balance < amount {
		return ErrInsufficientFunds
	}

	wallet.Balance -= amount
	wallet.LockedBalance += amount

	return db.WithContext(ctx).Save(&wallet).Error
}

func (r *postgresRepo) UnlockBalance(ctx context.Context, tx *gorm.DB, userID uuid.UUID, subAccount domain.SubAccountType, currency string, amount float64) error {
	db := r.db
	if tx != nil {
		db = tx
	}

	var wallet domain.Wallet
	err := r.queryWithLock(db, ctx).
		Where("user_id = ? AND sub_account = ? AND currency = ?", userID, subAccount, currency).
		First(&wallet).Error

	if err != nil {
		return ErrWalletNotFound
	}

	wallet.LockedBalance -= amount
	wallet.Balance += amount

	return db.WithContext(ctx).Save(&wallet).Error
}

func (r *postgresRepo) CreditWallet(ctx context.Context, tx *gorm.DB, userID uuid.UUID, subAccount domain.SubAccountType, currency string, amount float64) error {
	db := r.db
	if tx != nil {
		db = tx
	}

	var wallet domain.Wallet
	err := r.queryWithLock(db, ctx).
		Where("user_id = ? AND sub_account = ? AND currency = ?", userID, subAccount, currency).
		First(&wallet).Error

	if err != nil {
		// Create new wallet row if not exists
		wallet = domain.Wallet{
			UserID:     userID,
			SubAccount: subAccount,
			Currency:   currency,
			Balance:    amount,
		}
		return db.WithContext(ctx).Create(&wallet).Error
	}

	wallet.Balance += amount
	return db.WithContext(ctx).Save(&wallet).Error
}

func (r *postgresRepo) DebitWallet(ctx context.Context, tx *gorm.DB, userID uuid.UUID, subAccount domain.SubAccountType, currency string, amount float64) error {
	db := r.db
	if tx != nil {
		db = tx
	}

	var wallet domain.Wallet
	err := r.queryWithLock(db, ctx).
		Where("user_id = ? AND sub_account = ? AND currency = ?", userID, subAccount, currency).
		First(&wallet).Error

	if err != nil {
		return ErrWalletNotFound
	}

	if wallet.Balance < amount {
		return ErrInsufficientFunds
	}

	wallet.Balance -= amount
	return db.WithContext(ctx).Save(&wallet).Error
}

// Double-Entry Ledger
func (r *postgresRepo) CreateLedgerEntry(ctx context.Context, tx *gorm.DB, entry *domain.LedgerEntry) error {
	db := r.db
	if tx != nil {
		db = tx
	}
	return db.WithContext(ctx).Create(entry).Error
}

func (r *postgresRepo) GetLedgerEntries(ctx context.Context, userID uuid.UUID, limit, offset int) ([]domain.LedgerEntry, error) {
	var entries []domain.LedgerEntry
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).
		Order("created_at DESC").Limit(limit).Offset(offset).Find(&entries).Error
	return entries, err
}

// Order methods
func (r *postgresRepo) CreateOrder(ctx context.Context, tx *gorm.DB, order *domain.Order) error {
	db := r.db
	if tx != nil {
		db = tx
	}
	return db.WithContext(ctx).Create(order).Error
}

func (r *postgresRepo) GetOrderByID(ctx context.Context, id uuid.UUID) (*domain.Order, error) {
	var order domain.Order
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&order).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrOrderNotFound
		}
		return nil, err
	}
	return &order, nil
}

func (r *postgresRepo) GetOrders(ctx context.Context, userID uuid.UUID, symbol string, status domain.OrderStatus, limit, offset int) ([]domain.Order, int64, error) {
	var orders []domain.Order
	var total int64

	query := r.db.WithContext(ctx).Model(&domain.Order{}).Where("user_id = ?", userID)

	if symbol != "" {
		query = query.Where("symbol = ?", symbol)
	}

	if status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&orders).Error; err != nil {
		return nil, 0, err
	}

	return orders, total, nil
}

func (r *postgresRepo) GetActiveOrdersBySymbol(ctx context.Context, symbol string) ([]domain.Order, error) {
	var orders []domain.Order
	err := r.db.WithContext(ctx).
		Where("symbol = ? AND status IN (?, ?)", symbol, domain.StatusOpen, domain.StatusPartiallyFilled).
		Order("created_at ASC").
		Find(&orders).Error
	return orders, err
}

func (r *postgresRepo) UpdateOrder(ctx context.Context, tx *gorm.DB, order *domain.Order) error {
	db := r.db
	if tx != nil {
		db = tx
	}
	return db.WithContext(ctx).Save(order).Error
}

func (r *postgresRepo) CancelOrder(ctx context.Context, orderID, userID uuid.UUID) (*domain.Order, error) {
	var order domain.Order

	err := r.WithTransaction(ctx, func(txRepo Repository, tx *gorm.DB) error {
		err := r.queryWithLock(tx, ctx).
			Where("id = ? AND user_id = ?", orderID, userID).
			First(&order).Error

		if err != nil {
			return ErrOrderNotFound
		}

		if order.Status == domain.StatusFilled || order.Status == domain.StatusCancelled {
			return ErrOrderNotCancellable
		}

		remainingAmount := order.Amount - order.FilledAmount
		order.Status = domain.StatusCancelled

		if err := tx.WithContext(ctx).Save(&order).Error; err != nil {
			return err
		}

		// Refund locked balance
		if order.Side == domain.SideBuy {
			refundUSD := remainingAmount * order.Price
			return txRepo.UnlockBalance(ctx, tx, userID, domain.SubAccountSpot, "USDT", refundUSD)
		} else {
			baseCurrency := "BTC"
			if len(order.Symbol) > 4 {
				baseCurrency = order.Symbol[:len(order.Symbol)-4]
			}
			return txRepo.UnlockBalance(ctx, tx, userID, domain.SubAccountSpot, baseCurrency, remainingAmount)
		}
	})

	if err != nil {
		return nil, err
	}
	return &order, nil
}

// Trade methods
func (r *postgresRepo) CreateTrade(ctx context.Context, tx *gorm.DB, trade *domain.Trade) error {
	db := r.db
	if tx != nil {
		db = tx
	}
	return db.WithContext(ctx).Create(trade).Error
}

func (r *postgresRepo) GetTradesBySymbol(ctx context.Context, symbol string, limit int) ([]domain.Trade, error) {
	var trades []domain.Trade
	err := r.db.WithContext(ctx).
		Where("symbol = ?", symbol).
		Order("executed_at DESC").
		Limit(limit).
		Find(&trades).Error
	return trades, err
}

func (r *postgresRepo) GetTradesByUserID(ctx context.Context, userID uuid.UUID, limit, offset int) ([]domain.Trade, int64, error) {
	var trades []domain.Trade
	var total int64

	query := r.db.WithContext(ctx).Model(&domain.Trade{}).
		Joins("JOIN orders ON trades.buy_order_id = orders.id OR trades.sell_order_id = orders.id").
		Where("orders.user_id = ?", userID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := query.Order("executed_at DESC").Limit(limit).Offset(offset).Find(&trades).Error; err != nil {
		return nil, 0, err
	}

	return trades, total, nil
}

// Lightning Contract methods
func (r *postgresRepo) CreateLightningContract(ctx context.Context, tx *gorm.DB, contract *domain.LightningContract) error {
	db := r.db
	if tx != nil {
		db = tx
	}
	return db.WithContext(ctx).Create(contract).Error
}

func (r *postgresRepo) GetActiveLightningContracts(ctx context.Context) ([]domain.LightningContract, error) {
	var contracts []domain.LightningContract
	err := r.db.WithContext(ctx).
		Where("status = ?", "OPEN").
		Order("expires_at ASC").
		Find(&contracts).Error
	return contracts, err
}

func (r *postgresRepo) SettleLightningContract(ctx context.Context, tx *gorm.DB, contract *domain.LightningContract) error {
	db := r.db
	if tx != nil {
		db = tx
	}
	return db.WithContext(ctx).Save(contract).Error
}

func (r *postgresRepo) GetLightningContractsByUserID(ctx context.Context, userID uuid.UUID, limit, offset int) ([]domain.LightningContract, int64, error) {
	var contracts []domain.LightningContract
	var total int64

	query := r.db.WithContext(ctx).Model(&domain.LightningContract{}).Where("user_id = ?", userID)
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&contracts).Error
	return contracts, total, err
}

// API Keys methods
func (r *postgresRepo) CreateApiKey(ctx context.Context, key *domain.ApiKey) error {
	return r.db.WithContext(ctx).Create(key).Error
}

func (r *postgresRepo) GetApiKeysByUserID(ctx context.Context, userID uuid.UUID) ([]domain.ApiKey, error) {
	var keys []domain.ApiKey
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).Order("created_at DESC").Find(&keys).Error
	return keys, err
}

func (r *postgresRepo) DeleteApiKey(ctx context.Context, id, userID uuid.UUID) error {
	return r.db.WithContext(ctx).Where("id = ? AND user_id = ?", id, userID).Delete(&domain.ApiKey{}).Error
}

// Support Ticket methods
func (r *postgresRepo) CreateSupportTicket(ctx context.Context, ticket *domain.SupportTicket) error {
	return r.db.WithContext(ctx).Create(ticket).Error
}

func (r *postgresRepo) GetSupportTicketsByUserID(ctx context.Context, userID uuid.UUID) ([]domain.SupportTicket, error) {
	var tickets []domain.SupportTicket
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).Order("created_at DESC").Find(&tickets).Error
	return tickets, err
}
