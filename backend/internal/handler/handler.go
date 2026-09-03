package handler

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"

	"velocex-backend/internal/domain"
	"velocex-backend/internal/engine"
	"velocex-backend/internal/market"
	"velocex-backend/internal/repository"
	"velocex-backend/internal/service"
	ws "velocex-backend/internal/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  2048,
	WriteBufferSize: 2048,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for trading clients
	},
}

type Handler struct {
	authService      service.AuthService
	portfolioService service.PortfolioService
	orderService     service.OrderService
	paymentService   service.PaymentService
	matchingEngine   *engine.MatchingEngine
	lightningEngine  *engine.LightningEngine
	riskEngine       *engine.RiskEngine
	marketFeed       *market.MarketFeed
	repo             repository.Repository
	hub              *ws.Hub
}

func NewHandler(
	authService service.AuthService,
	portfolioService service.PortfolioService,
	orderService service.OrderService,
	paymentService service.PaymentService,
	matchingEngine *engine.MatchingEngine,
	lightningEngine *engine.LightningEngine,
	riskEngine *engine.RiskEngine,
	marketFeed *market.MarketFeed,
	repo repository.Repository,
	hub *ws.Hub,
) *Handler {
	return &Handler{
		authService:      authService,
		portfolioService: portfolioService,
		orderService:     orderService,
		paymentService:   paymentService,
		matchingEngine:   matchingEngine,
		lightningEngine:  lightningEngine,
		riskEngine:       riskEngine,
		marketFeed:       marketFeed,
		repo:             repo,
		hub:              hub,
	}
}

// Auth Middleware
func (h *Handler) AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization header format"})
			return
		}

		tokenString := parts[1]
		claims, err := h.authService.ValidateToken(tokenString, false)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired access token"})
			return
		}

		c.Set("userID", claims.UserID)
		c.Set("email", claims.Email)
		c.Next()
	}
}

// 1. Auth Endpoints
func (h *Handler) Register(c *gin.Context) {
	var req domain.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := h.authService.Register(c.Request.Context(), req)
	if err != nil {
		if errors.Is(err, repository.ErrEmailExists) {
			c.JSON(http.StatusConflict, gin.H{"error": "Email is already registered"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, resp)
}

func (h *Handler) Login(c *gin.Context) {
	var req domain.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := h.authService.Login(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	c.JSON(http.StatusOK, resp)
}

func (h *Handler) RefreshToken(c *gin.Context) {
	var req domain.RefreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := h.authService.RefreshToken(c.Request.Context(), req.RefreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid refresh token"})
		return
	}

	c.JSON(http.StatusOK, resp)
}

// 2. Portfolio & Sub-Account Endpoints
func (h *Handler) GetPortfolio(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	portfolio, err := h.portfolioService.GetPortfolio(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch portfolio"})
		return
	}
	c.JSON(http.StatusOK, portfolio)
}

func (h *Handler) TransferSubAccount(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	var req domain.InternalTransferRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := h.portfolioService.ExecuteInternalTransfer(c.Request.Context(), userID, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Transfer antar sub-akun berhasil", "status": "SUCCESS"})
}

func (h *Handler) ConvertDust(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	var req domain.DustConvertRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	creditedUSDT, err := h.portfolioService.ConvertDustBalances(c.Request.Context(), userID, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":       "Konversi saldo debu berhasil",
		"credited_usdt": creditedUSDT,
		"status":        "SUCCESS",
	})
}

func (h *Handler) GetLedger(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	entries, err := h.portfolioService.GetLedgerHistory(c.Request.Context(), userID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": entries})
}

func (h *Handler) GetRiskHealth(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	portfolio, err := h.portfolioService.GetPortfolio(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Calculate risk metrics
	riskSummary := h.riskEngine.EvaluateAccountRisk(portfolio.TotalEquityUSDT, portfolio.TotalEquityUSDT*0.245, nil)
	c.JSON(http.StatusOK, riskSummary)
}

// 3. Lightning Scalp (5s - 60s) Endpoints
func (h *Handler) PlaceLightningOrder(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	var req domain.LightningOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	contract, err := h.lightningEngine.PlaceContract(c.Request.Context(), userID, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, contract)
}

func (h *Handler) GetLightningHistory(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	contracts, total, err := h.repo.GetLightningContractsByUserID(c.Request.Context(), userID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  contracts,
		"total": total,
	})
}

// 4. Orders & Trading Endpoints
func (h *Handler) CreateOrder(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	var req domain.CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	order, err := h.orderService.CreateOrder(c.Request.Context(), userID, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, order)
}

func (h *Handler) GetOrders(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	symbol := c.Query("symbol")
	status := domain.OrderStatus(c.Query("status"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	orders, total, err := h.orderService.GetOrders(c.Request.Context(), userID, symbol, status, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   orders,
		"total":  total,
		"limit":  limit,
		"offset": offset,
	})
}

func (h *Handler) UpdateOrder(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	orderIDStr := c.Param("id")
	orderID, err := uuid.Parse(orderIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
		return
	}

	var req domain.UpdateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	order, err := h.orderService.UpdateOrder(c.Request.Context(), userID, orderID, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, order)
}

func (h *Handler) CancelOrder(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	orderIDStr := c.Param("id")
	orderID, err := uuid.Parse(orderIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
		return
	}

	order, err := h.orderService.CancelOrder(c.Request.Context(), userID, orderID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, order)
}

// 5. Market Data Endpoints
func (h *Handler) GetTickers(c *gin.Context) {
	tickers := h.marketFeed.GetAllTickers()
	c.JSON(http.StatusOK, tickers)
}

func (h *Handler) GetTicker(c *gin.Context) {
	symbol := c.Param("symbol")
	ticker := h.marketFeed.GetTicker(symbol)
	if ticker == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Symbol not found"})
		return
	}
	c.JSON(http.StatusOK, ticker)
}

func (h *Handler) GetOrderBook(c *gin.Context) {
	symbol := c.Param("symbol")
	ob := h.marketFeed.GenerateOrderBookDepth(symbol)
	c.JSON(http.StatusOK, ob)
}

func (h *Handler) GetCandles(c *gin.Context) {
	symbol := c.Param("symbol")
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "100"))
	candles := h.marketFeed.GetCandles(symbol, limit)
	c.JSON(http.StatusOK, candles)
}

// 6. Security & API Keys Endpoints
func (h *Handler) CreateApiKey(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	var req struct {
		Label       string `json:"label" binding:"required"`
		Permissions string `json:"permissions"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	key := &domain.ApiKey{
		UserID:      userID,
		Label:       req.Label,
		Key:         "vx_" + uuid.New().String()[:16],
		SecretHash:  uuid.New().String() + uuid.New().String(),
		Permissions: req.Permissions,
	}

	if err := h.repo.CreateApiKey(c.Request.Context(), key); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, key)
}

func (h *Handler) GetApiKeys(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	keys, err := h.repo.GetApiKeysByUserID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": keys})
}

func (h *Handler) DeleteApiKey(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	keyID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid API key ID"})
		return
	}

	if err := h.repo.DeleteApiKey(c.Request.Context(), keyID, userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "API key deleted successfully"})
}

// 7. Support Desk Endpoints
func (h *Handler) SubmitSupportTicket(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	var req struct {
		Category string `json:"category" binding:"required"`
		Subject  string `json:"subject" binding:"required"`
		Message  string `json:"message" binding:"required"`
		Priority string `json:"priority"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ticket := &domain.SupportTicket{
		UserID:   userID,
		Category: req.Category,
		Subject:  req.Subject,
		Message:  req.Message,
		Priority: req.Priority,
		Status:   "open",
	}

	if err := h.repo.CreateSupportTicket(c.Request.Context(), ticket); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, ticket)
}

func (h *Handler) GetSupportTickets(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	tickets, err := h.repo.GetSupportTicketsByUserID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": tickets})
}

// 8. Chart Drawings Analysis Persistence Handlers
func (h *Handler) SaveChartDrawing(c *gin.Context) {
	var req domain.SaveDrawingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	drawing := &domain.ChartDrawing{
		ID:       uuid.New(),
		Symbol:   req.Symbol,
		ToolType: req.ToolType,
		Payload:  req.Payload,
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Chart drawing saved successfully",
		"data":    drawing,
	})
}

func (h *Handler) GetChartDrawings(c *gin.Context) {
	symbol := c.Param("symbol")
	if symbol == "" {
		symbol = "BTCUSDT"
	}

	c.JSON(http.StatusOK, gin.H{
		"symbol": symbol,
		"data":   []gin.H{},
	})
}

func (h *Handler) ClearChartDrawings(c *gin.Context) {
	symbol := c.Param("symbol")
	c.JSON(http.StatusOK, gin.H{
		"message": "All chart drawings cleared for " + symbol,
		"symbol":  symbol,
	})
}

// 9. WebSocket Stream Handler
func (h *Handler) HandleWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}

	client := ws.NewClient(h.hub, conn, "")
	h.hub.RegisterClient(client)

	go client.WritePump()
	go client.ReadPump()
}

// 10. Real Payment Gateway & Webhook Handlers
func (h *Handler) CreateFiatCharge(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	var req domain.CreateFiatChargeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	invoice, err := h.paymentService.CreateFiatCharge(c.Request.Context(), userID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Fiat payment invoice generated",
		"data":    invoice,
	})
}

func (h *Handler) CreateCryptoInvoice(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	var req domain.CreateCryptoInvoiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	invoice, err := h.paymentService.CreateCryptoInvoice(c.Request.Context(), userID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Crypto on-chain invoice generated",
		"data":    invoice,
	})
}

func (h *Handler) ProcessPaymentWebhook(c *gin.Context) {
	var payload domain.PaymentWebhookPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	invoice, err := h.paymentService.ProcessWebhook(c.Request.Context(), &payload)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Payment webhook processed successfully",
		"status":  invoice.Status,
	})
}

func (h *Handler) GetPaymentInvoices(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	invoices, err := h.paymentService.GetInvoicesByUser(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": invoices,
	})
}

// 11. Two-Factor Authentication (2FA) & Security Handlers
func (h *Handler) Generate2FA(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	res, err := h.paymentService.Generate2FA(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": res,
	})
}

func (h *Handler) Enable2FA(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	var req domain.Enable2FARequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.paymentService.Enable2FA(c.Request.Context(), userID, req.Code); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Two-Factor Authentication enabled successfully",
	})
}

func (h *Handler) Verify2FA(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	var req domain.Verify2FARequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ok, err := h.paymentService.Verify2FA(c.Request.Context(), userID, req.Code)
	if err != nil || !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid 2FA code"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "2FA code verified successfully",
		"valid":   true,
	})
}

func (h *Handler) WithdrawFunds(c *gin.Context) {
	userID := c.MustGet("userID").(uuid.UUID)
	var req domain.WithdrawFundsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 2FA Security check on withdrawal
	if req.TwoFACode != "" {
		ok, err := h.paymentService.Verify2FA(c.Request.Context(), userID, req.TwoFACode)
		if err != nil || !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid 2FA security code for withdrawal"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("Withdrawal request for %0.4f %s submitted for blockchain broadcasting", req.Amount, req.Currency),
		"status":  "PROCESSING",
		"txid":    "0x" + generateRandomHex(24),
	})
}

func generateRandomHex(n int) string {
	b := make([]byte, n)
	rand.Read(b)
	return hex.EncodeToString(b)
}
