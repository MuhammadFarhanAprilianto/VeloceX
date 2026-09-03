package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type clientVisitor struct {
	lastSeen time.Time
	tokens   int
}

type RateLimiter struct {
	mu       sync.Mutex
	visitors map[string]*clientVisitor
	rate     int           // Max requests per window
	window   time.Duration // Time window
}

func NewRateLimiter(rate int, window time.Duration) *RateLimiter {
	rl := &RateLimiter{
		visitors: make(map[string]*clientVisitor),
		rate:     rate,
		window:   window,
	}

	// Background cleanup of stale visitors every minute
	go func() {
		for {
			time.Sleep(1 * time.Minute)
			rl.mu.Lock()
			for ip, v := range rl.visitors {
				if time.Since(v.lastSeen) > 3*window {
					delete(rl.visitors, ip)
				}
			}
			rl.mu.Unlock()
		}
	}()

	return rl
}

func (rl *RateLimiter) Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		if ip == "" {
			ip = "unknown"
		}

		rl.mu.Lock()
		v, exists := rl.visitors[ip]
		now := time.Now()

		if !exists || now.Sub(v.lastSeen) > rl.window {
			rl.visitors[ip] = &clientVisitor{
				lastSeen: now,
				tokens:   1,
			}
			rl.mu.Unlock()
			c.Next()
			return
		}

		if v.tokens >= rl.rate {
			rl.mu.Unlock()
			c.Header("Retry-After", "5")
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error":   "Rate limit exceeded. Too many requests, please slow down.",
				"message": "DDoS protection active.",
			})
			return
		}

		v.tokens++
		v.lastSeen = now
		rl.mu.Unlock()

		c.Next()
	}
}
