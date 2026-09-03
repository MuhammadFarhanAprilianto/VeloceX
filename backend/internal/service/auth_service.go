package service

import (
	"context"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"velocex-backend/internal/config"
	"velocex-backend/internal/domain"
	"velocex-backend/internal/repository"
)

var (
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrInvalidToken       = errors.New("invalid or expired token")
)

type JWTClaims struct {
	UserID uuid.UUID `json:"user_id"`
	Email  string    `json:"email"`
	jwt.RegisteredClaims
}

type AuthService interface {
	Register(ctx context.Context, req domain.RegisterRequest) (*domain.AuthResponse, error)
	Login(ctx context.Context, req domain.LoginRequest) (*domain.AuthResponse, error)
	RefreshToken(ctx context.Context, refreshToken string) (*domain.AuthResponse, error)
	ValidateToken(tokenString string, isRefresh bool) (*JWTClaims, error)
}

type authService struct {
	repo   repository.Repository
	config *config.Config
}

func NewAuthService(repo repository.Repository, cfg *config.Config) AuthService {
	return &authService{
		repo:   repo,
		config: cfg,
	}
}

func (s *authService) Register(ctx context.Context, req domain.RegisterRequest) (*domain.AuthResponse, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &domain.User{
		ID:           uuid.New(),
		Name:         req.Name,
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
	}

	// Create user and initialize default demo wallets (50,000 USDT, 1.5 BTC, etc.)
	err = s.repo.WithTransaction(ctx, func(txRepo repository.Repository, tx *gorm.DB) error {
		if err := txRepo.CreateUser(ctx, user); err != nil {
			return err
		}
		return txRepo.CreateDefaultWallets(ctx, user.ID)
	})
	if err != nil {
		return nil, err
	}

	accessToken, err := s.generateToken(user.ID, user.Email, s.config.JWTSecret, s.config.AccessTokenExpiry)
	if err != nil {
		return nil, err
	}

	refreshToken, err := s.generateToken(user.ID, user.Email, s.config.JWTRefreshSecret, s.config.RefreshTokenExpiry)
	if err != nil {
		return nil, err
	}

	return &domain.AuthResponse{
		User:         *user,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func (s *authService) Login(ctx context.Context, req domain.LoginRequest) (*domain.AuthResponse, error) {
	user, err := s.repo.GetUserByEmail(ctx, req.Email)
	if err != nil {
		return nil, ErrInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, ErrInvalidCredentials
	}

	accessToken, err := s.generateToken(user.ID, user.Email, s.config.JWTSecret, s.config.AccessTokenExpiry)
	if err != nil {
		return nil, err
	}

	refreshToken, err := s.generateToken(user.ID, user.Email, s.config.JWTRefreshSecret, s.config.RefreshTokenExpiry)
	if err != nil {
		return nil, err
	}

	return &domain.AuthResponse{
		User:         *user,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}, nil
}

func (s *authService) RefreshToken(ctx context.Context, refreshToken string) (*domain.AuthResponse, error) {
	claims, err := s.ValidateToken(refreshToken, true)
	if err != nil {
		return nil, ErrInvalidToken
	}

	user, err := s.repo.GetUserByID(ctx, claims.UserID)
	if err != nil {
		return nil, ErrInvalidToken
	}

	newAccessToken, err := s.generateToken(user.ID, user.Email, s.config.JWTSecret, s.config.AccessTokenExpiry)
	if err != nil {
		return nil, err
	}

	newRefreshToken, err := s.generateToken(user.ID, user.Email, s.config.JWTRefreshSecret, s.config.RefreshTokenExpiry)
	if err != nil {
		return nil, err
	}

	return &domain.AuthResponse{
		User:         *user,
		AccessToken:  newAccessToken,
		RefreshToken: newRefreshToken,
	}, nil
}

func (s *authService) generateToken(userID uuid.UUID, email string, secret string, expiry time.Duration) (string, error) {
	claims := JWTClaims{
		UserID: userID,
		Email:  email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiry)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "velocex-platform",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func (s *authService) ValidateToken(tokenString string, isRefresh bool) (*JWTClaims, error) {
	secret := s.config.JWTSecret
	if isRefresh {
		secret = s.config.JWTRefreshSecret
	}

	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrInvalidToken
		}
		return []byte(secret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, ErrInvalidToken
}
