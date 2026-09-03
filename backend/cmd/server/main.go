package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/glebarez/sqlite"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"velocex-backend/internal/config"
	"velocex-backend/internal/domain"
	"velocex-backend/internal/engine"
	"velocex-backend/internal/handler"
	"velocex-backend/internal/market"
	"velocex-backend/internal/middleware"
	"velocex-backend/internal/repository"
	"velocex-backend/internal/service"
	ws "velocex-backend/internal/websocket"
)

func main() {
	log.Println("==================================================")
	log.Println("⚡ VeloceX: Real-Time Trading & Portfolio Engine ⚡")
	log.Println("    Binance Pro & Bybit Standard Architecture    ")
	log.Println("==================================================")

	// 1. Load configuration
	cfg := config.LoadConfig()

	// 2. Connect Database (PostgreSQL with automatic SQLite local fallback)
	var db *gorm.DB
	var err error

	dsn := cfg.GetDSN()
	log.Printf("[DB] Checking PostgreSQL connection at %s:%s...", cfg.DBHost, cfg.DBPort)

	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})

	if err != nil {
		log.Printf("[DB Notice] PostgreSQL not reachable (%v)", err)
		log.Println("[DB Fallback] ⚡ Initializing embedded standalone SQLite database (velocex.db)...")
		db, err = gorm.Open(sqlite.Open("velocex.db"), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Warn),
		})
		if err != nil {
			log.Fatalf("[DB Fatal] Failed to initialize fallback SQLite database: %v", err)
		}
		log.Println("[DB Success] ✅ Running with local SQLite database. Ready for trading!")
	} else {
		log.Println("[DB Success] ✅ Connected to PostgreSQL database successfully.")
	}

	// Run auto migrations for all 9 tables
	log.Println("[DB] Running schema auto-migration across all entities...")
	if err := db.AutoMigrate(
		&domain.User{},
		&domain.Wallet{},
		&domain.LedgerEntry{},
		&domain.Order{},
		&domain.Trade{},
		&domain.LightningContract{},
		&domain.ApiKey{},
		&domain.SupportTicket{},
		&domain.PaymentInvoice{},
	); err != nil {
		log.Fatalf("[DB] Auto-migration failed: %v", err)
	}
	log.Println("[DB] ✅ Database connected and migrated successfully.")

	// 3. Initialize WebSocket Hub
	hub := ws.NewHub()
	go hub.Run()

	// 4. Initialize Repository & Core Components
	repo := repository.NewPostgresRepository(db)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// 5. Initialize Market Feed & Generator
	marketFeed := market.NewMarketFeed(hub)
	marketFeed.Start(ctx)

	// 6. Initialize Order Matching Engine
	matchingEngine := engine.NewMatchingEngine(repo, hub)
	matchingEngine.Start(ctx)

	// 7. Initialize Lightning Scalp Engine (5s-60s)
	lightningEngine := engine.NewLightningEngine(repo, hub, marketFeed)
	lightningEngine.Start(ctx)

	// 8. Initialize Risk Engine
	riskEngine := engine.NewRiskEngine()

	// 9. Initialize Services
	authService := service.NewAuthService(repo, cfg)
	portfolioService := service.NewPortfolioService(repo, marketFeed)
	orderService := service.NewOrderService(repo, matchingEngine, marketFeed)
	paymentService := service.NewPaymentService(repo, db)

	// 10. Initialize REST & WS Handlers
	h := handler.NewHandler(
		authService,
		portfolioService,
		orderService,
		paymentService,
		matchingEngine,
		lightningEngine,
		riskEngine,
		marketFeed,
		repo,
		hub,
	)

	// 11. Setup Gin Router & Security Rate Limiting
	router := gin.Default()

	// DDoS Shield & API Rate Limiter (120 req/min per IP)
	rateLimiter := middleware.NewRateLimiter(120, 1*time.Minute)
	router.Use(rateLimiter.Middleware())

	// Enable CORS for frontend and mobile dev
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Healthcheck endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "healthy",
			"timestamp": time.Now(),
			"service":   "velocex-engine",
			"tier":      "binance-bybit-pro",
		})
	})

	// WebSocket Streaming Route
	router.GET("/ws", h.HandleWebSocket)

	// API V1 Routes
	v1 := router.Group("/api/v1")
	{
		// Public Auth routes
		auth := v1.Group("/auth")
		{
			auth.POST("/register", h.Register)
			auth.POST("/login", h.Login)
			auth.POST("/refresh", h.RefreshToken)
		}

		// Public Market routes
		m := v1.Group("/market")
		{
			m.GET("/tickers", h.GetTickers)
			m.GET("/ticker/:symbol", h.GetTicker)
			m.GET("/orderbook/:symbol", h.GetOrderBook)
			m.GET("/candles/:symbol", h.GetCandles)
		}

		// Payment Webhook (Public with signature check)
		v1.POST("/payments/webhook", h.ProcessPaymentWebhook)

		// Protected routes (Requires Bearer JWT)
		protected := v1.Group("")
		protected.Use(h.AuthMiddleware())
		{
			// Two-Factor Authentication (2FA) & Security
			protected.POST("/auth/2fa/generate", h.Generate2FA)
			protected.POST("/auth/2fa/enable", h.Enable2FA)
			protected.POST("/auth/2fa/verify", h.Verify2FA)

			// Real Payment Gateway (Fiat QRIS/VA & Crypto On-Chain)
			protected.POST("/payments/fiat/charge", h.CreateFiatCharge)
			protected.POST("/payments/crypto/invoice", h.CreateCryptoInvoice)
			protected.GET("/payments/invoices", h.GetPaymentInvoices)

			// Portfolio & Sub-Accounts & Ledger & Secure Withdrawal
			protected.GET("/portfolio", h.GetPortfolio)
			protected.POST("/portfolio/transfer", h.TransferSubAccount)
			protected.POST("/portfolio/dust-convert", h.ConvertDust)
			protected.GET("/portfolio/ledger", h.GetLedger)
			protected.GET("/portfolio/risk", h.GetRiskHealth)
			protected.POST("/portfolio/withdraw", h.WithdrawFunds)

			// Orders & Matching Engine (Full CRUD: Create, Read, Update/Edit, Delete/Stop)
			protected.GET("/orders", h.GetOrders)
			protected.POST("/orders", h.CreateOrder)
			protected.PUT("/orders/:id", h.UpdateOrder)
			protected.DELETE("/orders/:id", h.CancelOrder)

			// Lightning Scalp (5s - 60s)
			protected.POST("/lightning/order", h.PlaceLightningOrder)
			protected.GET("/lightning/history", h.GetLightningHistory)

			// Security & API Keys
			protected.POST("/settings/api-keys", h.CreateApiKey)
			protected.GET("/settings/api-keys", h.GetApiKeys)
			protected.DELETE("/settings/api-keys/:id", h.DeleteApiKey)

			// VIP Support Desk
			protected.POST("/support/tickets", h.SubmitSupportTicket)
			protected.GET("/support/tickets", h.GetSupportTickets)

			// Chart Drawing Presets & Overlays
			protected.POST("/chart/drawings", h.SaveChartDrawing)
			protected.GET("/chart/drawings/:symbol", h.GetChartDrawings)
			protected.DELETE("/chart/drawings/:symbol", h.ClearChartDrawings)
		}
	}

	// 12. Start Server with Graceful Shutdown
	srv := &http.Server{
		Addr:    ":" + cfg.ServerPort,
		Handler: router,
	}

	go func() {
		log.Printf("[Server] 🚀 VeloceX listening on http://localhost:%s", cfg.ServerPort)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("[Server] Failed to listen: %v", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("[Server] Shutting down VeloceX gracefully...")
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("[Server] Forced shutdown: %v", err)
	}

	log.Println("[Server] VeloceX stopped successfully.")
}
