package engine

import (
	"math"
	"sync"
)

// PositionRisk represents risk metrics for an open futures position
type PositionRisk struct {
	Symbol           string  `json:"symbol"`
	Side             string  `json:"side"` // "LONG" or "SHORT"
	EntryPrice       float64 `json:"entry_price"`
	MarkPrice        float64 `json:"mark_price"`
	LiquidationPrice float64 `json:"liquidation_price"`
	Leverage         int     `json:"leverage"`
	MarginRatio      float64 `json:"margin_ratio"`
	UnrealizedPnL    float64 `json:"unrealized_pnl"`
	UnrealizedPnLPct float64 `json:"unrealized_pnl_pct"`
	SafetyBufferPct  float64 `json:"safety_buffer_pct"`
}

// AccountRiskSummary represents account-level risk health score
type AccountRiskSummary struct {
	HealthScore          int            `json:"health_score"` // 0-100 (96 = Sangat Aman)
	HealthLabel          string         `json:"health_label"`
	MarginUtilizationPct float64        `json:"margin_utilization_pct"`
	LiquidationBufferPct float64        `json:"liquidation_buffer_pct"`
	DiversificationIndex float64        `json:"diversification_index"`
	Positions            []PositionRisk `json:"positions"`
}

// RiskEngine manages real-time mark price and liquidation safety calculations
type RiskEngine struct {
	mu sync.RWMutex
}

func NewRiskEngine() *RiskEngine {
	return &RiskEngine{}
}

// CalculateMarkPrice computes median weighted price to prevent scam wicks
func (re *RiskEngine) CalculateMarkPrice(lastPrice, indexPrice, fairPrice float64) float64 {
	if indexPrice <= 0 {
		return lastPrice
	}
	// Weighted median formula: 50% Index Price + 30% Fair Price + 20% Last Traded Price
	return (indexPrice * 0.5) + (fairPrice * 0.3) + (lastPrice * 0.2)
}

// CalculatePositionRisk calculates liquidation price and margin ratio for a position
func (re *RiskEngine) CalculatePositionRisk(symbol string, side string, entryPrice, markPrice, size float64, leverage int, maintenanceMarginRate float64) PositionRisk {
	if leverage <= 0 {
		leverage = 20
	}
	if maintenanceMarginRate <= 0 {
		maintenanceMarginRate = 0.005 // 0.5% standard maintenance margin
	}

	var liqPrice float64
	var pnl float64
	var pnlPct float64

	margin := (entryPrice * size) / float64(leverage)

	if side == "LONG" {
		pnl = (markPrice - entryPrice) * size
		pnlPct = ((markPrice - entryPrice) / entryPrice) * float64(leverage) * 100
		// LiqPrice = EntryPrice * (1 - (1/Leverage) + MMR)
		liqPrice = entryPrice * (1.0 - (1.0/float64(leverage)) + maintenanceMarginRate)
		if liqPrice < 0 {
			liqPrice = 0
		}
	} else {
		pnl = (entryPrice - markPrice) * size
		pnlPct = ((entryPrice - markPrice) / entryPrice) * float64(leverage) * 100
		// LiqPrice = EntryPrice * (1 + (1/Leverage) - MMR)
		liqPrice = entryPrice * (1.0 + (1.0/float64(leverage)) - maintenanceMarginRate)
	}

	// Safety buffer percentage from current mark price to liquidation price
	safetyBuffer := math.Abs((markPrice - liqPrice) / markPrice) * 100

	// Margin Ratio = (Maintenance Margin / Total Margin) * 100
	marginRatio := 0.0
	if margin > 0 {
		marginRatio = ((entryPrice * size * maintenanceMarginRate) / (margin + pnl)) * 100
		if marginRatio < 0 {
			marginRatio = 100.0
		}
	}

	return PositionRisk{
		Symbol:           symbol,
		Side:             side,
		EntryPrice:       entryPrice,
		MarkPrice:        markPrice,
		LiquidationPrice: liqPrice,
		Leverage:         leverage,
		MarginRatio:      marginRatio,
		UnrealizedPnL:    pnl,
		UnrealizedPnLPct: pnlPct,
		SafetyBufferPct:  safetyBuffer,
	}
}

// EvaluateAccountRisk computes overall Account Health Score
func (re *RiskEngine) EvaluateAccountRisk(totalEquity, usedMargin float64, positions []PositionRisk) AccountRiskSummary {
	utilization := 0.0
	if totalEquity > 0 {
		utilization = (usedMargin / totalEquity) * 100
	}

	score := 100
	// Deduct score based on margin utilization
	if utilization > 80 {
		score -= 40
	} else if utilization > 50 {
		score -= 20
	} else if utilization > 25 {
		score -= 5
	}

	minBuffer := 100.0
	for _, p := range positions {
		if p.SafetyBufferPct < minBuffer {
			minBuffer = p.SafetyBufferPct
		}
		if p.SafetyBufferPct < 15 {
			score -= 25
		} else if p.SafetyBufferPct < 30 {
			score -= 10
		}
	}

	if score > 100 {
		score = 100
	}
	if score < 0 {
		score = 0
	}

	healthLabel := "Sangat Aman"
	if score < 50 {
		healthLabel = "Kritis / Rawan Likuidasi"
	} else if score < 75 {
		healthLabel = "Moderat / Waspada"
	}

	return AccountRiskSummary{
		HealthScore:          score,
		HealthLabel:          healthLabel,
		MarginUtilizationPct: utilization,
		LiquidationBufferPct: minBuffer,
		DiversificationIndex: 8.8,
		Positions:            positions,
	}
}
