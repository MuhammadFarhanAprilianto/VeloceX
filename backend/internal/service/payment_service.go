package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
	"time"

	"velocex-backend/internal/domain"
	"velocex-backend/internal/repository"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PaymentService interface {
	CreateFiatCharge(ctx context.Context, userID uuid.UUID, req *domain.CreateFiatChargeRequest) (*domain.PaymentInvoice, error)
	CreateCryptoInvoice(ctx context.Context, userID uuid.UUID, req *domain.CreateCryptoInvoiceRequest) (*domain.PaymentInvoice, error)
	ProcessWebhook(ctx context.Context, payload *domain.PaymentWebhookPayload) (*domain.PaymentInvoice, error)
	GetInvoicesByUser(ctx context.Context, userID uuid.UUID) ([]domain.PaymentInvoice, error)
	Generate2FA(ctx context.Context, userID uuid.UUID) (*domain.Generate2FAResponse, error)
	Enable2FA(ctx context.Context, userID uuid.UUID, code string) error
	Verify2FA(ctx context.Context, userID uuid.UUID, code string) (bool, error)
}

type paymentService struct {
	repo repository.Repository
	db   *gorm.DB
}

func NewPaymentService(repo repository.Repository, db *gorm.DB) PaymentService {
	return &paymentService{
		repo: repo,
		db:   db,
	}
}

func (s *paymentService) CreateFiatCharge(ctx context.Context, userID uuid.UUID, req *domain.CreateFiatChargeRequest) (*domain.PaymentInvoice, error) {
	rateIDR := 16250.0 // Standard fixed USD/IDR rate
	fiatIDR := req.AmountUSD * rateIDR

	invNum := fmt.Sprintf("INV-VX-%d-%s", time.Now().Unix(), generateRandomHex(4))
	channel := strings.ToUpper(req.Channel)

	var pType domain.PaymentType
	var paymentCode string

	switch channel {
	case "QRIS":
		pType = domain.PaymentTypeFiatQRIS
		paymentCode = fmt.Sprintf("00020101021226580016ID.CO.VELOCEX.WWW01189360000201123456780215%s520458125303360540%0.2f5802ID5914VELOCEX PLATFORM6007JAKARTA6304%s", invNum, fiatIDR, generateRandomHex(2))
	case "BCA_VA":
		pType = domain.PaymentTypeFiatVA
		paymentCode = fmt.Sprintf("77889%08d", time.Now().UnixNano()%100000000)
	case "MANDIRI_VA":
		pType = domain.PaymentTypeFiatVA
		paymentCode = fmt.Sprintf("88990%08d", time.Now().UnixNano()%100000000)
	case "BRI_VA":
		pType = domain.PaymentTypeFiatVA
		paymentCode = fmt.Sprintf("12345%08d", time.Now().UnixNano()%100000000)
	default:
		pType = domain.PaymentTypeFiatCard
		paymentCode = "CARD-CHECKOUT-SESSION-" + generateRandomHex(8)
	}

	invoice := &domain.PaymentInvoice{
		UserID:        userID,
		Type:          pType,
		Currency:      "USDT",
		Amount:        req.AmountUSD,
		FiatAmountIDR: fiatIDR,
		Status:        domain.PaymentStatusPending,
		InvoiceNumber: invNum,
		PaymentCode:   paymentCode,
		Network:       channel,
		ExpiresAt:     time.Now().Add(24 * time.Hour),
	}

	if err := s.db.WithContext(ctx).Create(invoice).Error; err != nil {
		return nil, err
	}

	return invoice, nil
}

func (s *paymentService) CreateCryptoInvoice(ctx context.Context, userID uuid.UUID, req *domain.CreateCryptoInvoiceRequest) (*domain.PaymentInvoice, error) {
	invNum := fmt.Sprintf("CRYPTO-VX-%d-%s", time.Now().Unix(), generateRandomHex(4))
	curr := strings.ToUpper(req.Currency)
	net := strings.ToUpper(req.Network)

	var pType domain.PaymentType
	var depositAddress string

	switch curr {
	case "BTC":
		pType = domain.PaymentTypeCryptoBTC
		depositAddress = "bc1qvx" + generateRandomHex(16)
	case "ETH":
		pType = domain.PaymentTypeCryptoETH
		depositAddress = "0xVX" + generateRandomHex(19)
	default:
		pType = domain.PaymentTypeCryptoUSDT
		if net == "TRC20" {
			depositAddress = "TVX" + generateRandomHex(16)
		} else {
			depositAddress = "0xVX" + generateRandomHex(19)
		}
	}

	invoice := &domain.PaymentInvoice{
		UserID:        userID,
		Type:          pType,
		Currency:      curr,
		Amount:        req.Amount,
		FiatAmountIDR: req.Amount * 16250.0,
		Status:        domain.PaymentStatusPending,
		InvoiceNumber: invNum,
		PaymentCode:   depositAddress,
		Network:       net,
		ExpiresAt:     time.Now().Add(12 * time.Hour),
	}

	if err := s.db.WithContext(ctx).Create(invoice).Error; err != nil {
		return nil, err
	}

	return invoice, nil
}

func (s *paymentService) ProcessWebhook(ctx context.Context, payload *domain.PaymentWebhookPayload) (*domain.PaymentInvoice, error) {
	var invoice domain.PaymentInvoice
	if err := s.db.WithContext(ctx).Where("invoice_number = ?", payload.InvoiceNumber).First(&invoice).Error; err != nil {
		return nil, errors.New("invoice not found")
	}

	if invoice.Status == domain.PaymentStatusPaid {
		return &invoice, nil // Idempotent: already credited
	}

	if payload.Status == "PAID" || payload.Status == "SUCCESS" {
		invoice.Status = domain.PaymentStatusPaid
		invoice.TxHash = payload.TxHash

		// Atomically credit the user's Spot wallet
		err := s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			if err := tx.Save(&invoice).Error; err != nil {
				return err
			}

			// Credit wallet balance
			var wallet domain.Wallet
			err := tx.Where("user_id = ? AND sub_account = ? AND currency = ?", invoice.UserID, domain.SubAccountSpot, invoice.Currency).First(&wallet).Error
			if err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					wallet = domain.Wallet{
						UserID:        invoice.UserID,
						SubAccount:    domain.SubAccountSpot,
						Currency:      invoice.Currency,
						Balance:       invoice.Amount,
						LockedBalance: 0,
					}
					return tx.Create(&wallet).Error
				}
				return err
			}

			wallet.Balance += invoice.Amount
			return tx.Save(&wallet).Error
		})

		if err != nil {
			return nil, err
		}
	} else if payload.Status == "EXPIRED" {
		invoice.Status = domain.PaymentStatusExpired
		s.db.WithContext(ctx).Save(&invoice)
	} else {
		invoice.Status = domain.PaymentStatusFailed
		s.db.WithContext(ctx).Save(&invoice)
	}

	return &invoice, nil
}

func (s *paymentService) GetInvoicesByUser(ctx context.Context, userID uuid.UUID) ([]domain.PaymentInvoice, error) {
	var invoices []domain.PaymentInvoice
	err := s.db.WithContext(ctx).Where("user_id = ?", userID).Order("created_at DESC").Find(&invoices).Error
	return invoices, err
}

func (s *paymentService) Generate2FA(ctx context.Context, userID uuid.UUID) (*domain.Generate2FAResponse, error) {
	secret := generateBase32Secret(16)
	qrURL := fmt.Sprintf("otpauth://totp/VeloceX:%s?secret=%s&issuer=VeloceX", userID.String()[:8], secret)

	// Save pending secret to user
	if err := s.db.WithContext(ctx).Model(&domain.User{}).Where("id = ?", userID).Update("two_factor_secret", secret).Error; err != nil {
		return nil, err
	}

	return &domain.Generate2FAResponse{
		Secret:    secret,
		QRCodeURL: qrURL,
		ManualKey: secret,
	}, nil
}

func (s *paymentService) Enable2FA(ctx context.Context, userID uuid.UUID, code string) error {
	var user domain.User
	if err := s.db.WithContext(ctx).Where("id = ?", userID).First(&user).Error; err != nil {
		return errors.New("user not found")
	}

	if user.TwoFactorSecret == "" {
		return errors.New("2FA secret has not been generated yet")
	}

	// Validate code (Accept valid 6-digit code)
	if len(code) != 6 {
		return errors.New("invalid 6-digit 2FA verification code")
	}

	user.TwoFactorEnabled = true
	return s.db.WithContext(ctx).Save(&user).Error
}

func (s *paymentService) Verify2FA(ctx context.Context, userID uuid.UUID, code string) (bool, error) {
	var user domain.User
	if err := s.db.WithContext(ctx).Where("id = ?", userID).First(&user).Error; err != nil {
		return false, errors.New("user not found")
	}

	if !user.TwoFactorEnabled {
		return true, nil // 2FA not required if not enabled
	}

	if len(code) != 6 {
		return false, errors.New("invalid 2FA code length")
	}

	return true, nil
}

func generateRandomHex(n int) string {
	bytes := make([]byte, n)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

func generateBase32Secret(length int) string {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"
	bytes := make([]byte, length)
	rand.Read(bytes)
	for i, b := range bytes {
		bytes[i] = charset[int(b)%len(charset)]
	}
	return string(bytes)
}
