'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FlashIcon,
  FireIcon,
  Shield01Icon,
  TradeUpIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  Cancel01Icon,
  Tick01Icon,
  Clock01Icon,
  Activity01Icon,
  AlertCircleIcon,
  CheckmarkCircle01Icon,
  SparklesIcon,
  Settings02Icon,
  Exchange01Icon,
  Layers01Icon,
  Globe02Icon,
  Coins01Icon,
  ChartHistogramIcon,
} from 'hugeicons-react';

export type AssetCategory = 'all' | 'crypto' | 'forex' | 'cfd';

export interface ScalpPair {
  id: string;
  symbol: string;
  name: string;
  category: 'crypto' | 'forex' | 'cfd';
  price: number;
  change24h: number;
  decimals: number;
  prefix: string;
}

// Complete 18 Assets across Forex, CFD, and Kripto matching VeloceX standard
export const ALL_LIGHTNING_PAIRS: ScalpPair[] = [
  // 1. KRIPTO (6 Aset)
  { id: 'SOL', symbol: 'SOL/USDT', name: 'Solana', category: 'crypto', price: 175.03, change24h: 1.94, decimals: 2, prefix: '$' },
  { id: 'BTC', symbol: 'BTC/USDT', name: 'Bitcoin', category: 'crypto', price: 75368.45, change24h: 1.92, decimals: 2, prefix: '$' },
  { id: 'ETH', symbol: 'ETH/USDT', name: 'Ethereum', category: 'crypto', price: 4149.74, change24h: 1.86, decimals: 2, prefix: '$' },
  { id: 'LTC', symbol: 'LTC/USDT', name: 'Litecoin', category: 'crypto', price: 94.92, change24h: 26.83, decimals: 2, prefix: '$' },
  { id: 'BNB', symbol: 'BNB/USDT', name: 'Binance Coin', category: 'crypto', price: 614.35, change24h: 5.20, decimals: 2, prefix: '$' },
  { id: 'ADA', symbol: 'ADA/USDT', name: 'Cardano', category: 'crypto', price: 0.562, change24h: 12.04, decimals: 4, prefix: '$' },

  // 2. FOREX (6 Aset)
  { id: 'EURUSD', symbol: 'EUR/USD', name: 'Euro / US Dollar', category: 'forex', price: 1.0842, change24h: 0.12, decimals: 4, prefix: '' },
  { id: 'GBPUSD', symbol: 'GBP/USD', name: 'British Pound / USD', category: 'forex', price: 1.2915, change24h: 1.34, decimals: 4, prefix: '' },
  { id: 'USDJPY', symbol: 'USD/JPY', name: 'USD / Japanese Yen', category: 'forex', price: 154.60, change24h: -0.24, decimals: 2, prefix: '¥' },
  { id: 'AUDUSD', symbol: 'AUD/USD', name: 'Australian Dollar / USD', category: 'forex', price: 0.6580, change24h: 0.45, decimals: 4, prefix: '' },
  { id: 'USDCAD', symbol: 'USD/CAD', name: 'USD / Canadian Dollar', category: 'forex', price: 1.3820, change24h: -0.18, decimals: 4, prefix: '' },
  { id: 'USDCHF', symbol: 'USD/CHF', name: 'USD / Swiss Franc', category: 'forex', price: 0.8840, change24h: 0.08, decimals: 4, prefix: '' },

  // 3. CFD & KOMODITAS (6 Aset)
  { id: 'XAUUSD', symbol: 'XAU/USD', name: 'Gold (Emas)', category: 'cfd', price: 2514.80, change24h: 1.42, decimals: 2, prefix: '$' },
  { id: 'XAGUSD', symbol: 'XAG/USD', name: 'Silver (Perak)', category: 'cfd', price: 29.45, change24h: 2.15, decimals: 2, prefix: '$' },
  { id: 'USOIL', symbol: 'USOIL', name: 'Crude Oil WTI', category: 'cfd', price: 74.60, change24h: -1.05, decimals: 2, prefix: '$' },
  { id: 'SPX500', symbol: 'SPX500', name: 'S&P 500 Index', category: 'cfd', price: 5648.40, change24h: 0.82, decimals: 2, prefix: '$' },
  { id: 'NAS100', symbol: 'NAS100', name: 'Nasdaq 100', category: 'cfd', price: 19720.50, change24h: 1.14, decimals: 2, prefix: '$' },
  { id: 'US30', symbol: 'US30', name: 'Dow Jones 30', category: 'cfd', price: 41250.00, change24h: 0.35, decimals: 2, prefix: '$' },
];

interface LightningPosition {
  id: string;
  symbol: string;
  type: 'LONG' | 'SHORT';
  leverage: number;
  margin: number;
  entryPrice: number;
  markPrice: number;
  tpPrice: number;
  slPrice: number;
  floatingPnl: number;
  floatingPnlPct: number;
  openedAt: string;
  durationSec: number;
}

interface ScalpHistoryItem {
  id: string;
  symbol: string;
  type: 'LONG' | 'SHORT';
  leverage: number;
  margin: number;
  entryPrice: number;
  closePrice: number;
  realizedPnl: number;
  realizedPnlPct: number;
  durationSec: number;
  closedAt: string;
}

const INITIAL_POSITIONS: LightningPosition[] = [
  {
    id: 'pos-1',
    symbol: 'SOL/USDT',
    type: 'LONG',
    leverage: 50,
    margin: 100,
    entryPrice: 174.50,
    markPrice: 175.03,
    tpPrice: 176.77,
    slPrice: 173.62,
    floatingPnl: 15.18,
    floatingPnlPct: 15.18,
    openedAt: '14:48:12',
    durationSec: 42,
  },
];

const INITIAL_HISTORY: ScalpHistoryItem[] = [
  {
    id: 'hist-1',
    symbol: 'SOL/USDT',
    type: 'LONG',
    leverage: 50,
    margin: 100,
    entryPrice: 172.80,
    closePrice: 174.60,
    realizedPnl: 52.08,
    realizedPnlPct: 52.08,
    durationSec: 68,
    closedAt: '14:42:05',
  },
  {
    id: 'hist-2',
    symbol: 'BTC/USDT',
    type: 'SHORT',
    leverage: 75,
    margin: 150,
    entryPrice: 75520.0,
    closePrice: 75310.0,
    realizedPnl: 31.42,
    realizedPnlPct: 20.94,
    durationSec: 35,
    closedAt: '14:35:40',
  },
  {
    id: 'hist-3',
    symbol: 'XAU/USD',
    type: 'LONG',
    leverage: 50,
    margin: 80,
    entryPrice: 2510.5,
    closePrice: 2516.2,
    realizedPnl: 18.16,
    realizedPnlPct: 22.70,
    durationSec: 110,
    closedAt: '14:20:18',
  },
];

interface LightningViewProps {
  onOrderSuccess?: (msg: string) => void;
}

export const LightningView: React.FC<LightningViewProps> = ({ onOrderSuccess }) => {
  // Category Filter State ('all' | 'crypto' | 'forex' | 'cfd')
  const [activeCategory, setActiveCategory] = useState<AssetCategory>('all');
  
  // Selected Pair & Live Price
  const [selectedPair, setSelectedPair] = useState<ScalpPair>(ALL_LIGHTNING_PAIRS[0]);
  const [currentPrice, setCurrentPrice] = useState<number>(ALL_LIGHTNING_PAIRS[0].price);
  const [priceHistory, setPriceHistory] = useState<number[]>([]);

  // Scalp Controller State
  const [marginAmount, setMarginAmount] = useState<string>('50');
  const [leverage, setLeverage] = useState<number>(50);
  const [selectedPreset, setSelectedPreset] = useState<'safe' | 'standard' | 'aggressive' | 'custom'>('standard');
  const [tpPercent, setTpPercent] = useState<number>(1.0); // +1.0%
  const [slPercent, setSlPercent] = useState<number>(0.5); // -0.5%
  const [slippageTolerance, setSlippageTolerance] = useState<number>(0.1); // 0.1% standard
  const [zeroDelayMode, setZeroDelayMode] = useState<boolean>(true);
  const [timeframe, setTimeframe] = useState<'30s' | '1m' | '3m' | '5m'>('1m');
  const [chartType, setChartType] = useState<'line' | 'candle'>('line');
  const [candles, setCandles] = useState<{ open: number; high: number; low: number; close: number }[]>([]);

  // Sub-Navigation Tabs
  const [bottomTab, setBottomTab] = useState<'positions' | 'history' | 'stats'>('positions');

  // Positions & History
  const [positions, setPositions] = useState<LightningPosition[]>(INITIAL_POSITIONS);
  const [history, setHistory] = useState<ScalpHistoryItem[]>(INITIAL_HISTORY);
  const [winStreak, setWinStreak] = useState<number>(6);

  // Available Balance
  const [availableBalance, setAvailableBalance] = useState<number>(12450.8);

  // Flash Execution Pulse Animation Trigger
  const [isExecuting, setIsExecuting] = useState<'LONG' | 'SHORT' | null>(null);

  // Filtered Pairs List based on Category
  const filteredPairs = activeCategory === 'all' 
    ? ALL_LIGHTNING_PAIRS 
    : ALL_LIGHTNING_PAIRS.filter((p) => p.category === activeCategory);

  // Timeframe Configuration Mapping
  const getTimeframeConfig = (tf: '30s' | '1m' | '3m' | '5m') => {
    switch (tf) {
      case '30s':
        return { vol: 0.0004, tickInterval: 200, rollTicks: 4, trendDepth: 0.0015 };
      case '1m':
        return { vol: 0.0008, tickInterval: 350, rollTicks: 8, trendDepth: 0.003 };
      case '3m':
        return { vol: 0.0016, tickInterval: 550, rollTicks: 12, trendDepth: 0.006 };
      case '5m':
        return { vol: 0.0028, tickInterval: 800, rollTicks: 16, trendDepth: 0.01 };
      default:
        return { vol: 0.0008, tickInterval: 350, rollTicks: 8, trendDepth: 0.003 };
    }
  };

  // Generate initial price history ticks & candles when switching asset OR timeframe
  useEffect(() => {
    const config = getTimeframeConfig(timeframe);
    const base = selectedPair.price;
    const initialTicks: number[] = [];
    let p = base * (1 - config.trendDepth * 0.5);

    // Build 40 historical ticks with undulating swings matching timeframe
    for (let i = 0; i < 40; i++) {
      const swing = Math.sin(i / 3.5) * (base * config.vol * 1.5);
      const noise = (Math.random() - 0.48) * (base * config.vol * 0.8);
      p = base + swing + noise;
      initialTicks.push(Number(p.toFixed(selectedPair.decimals)));
    }
    initialTicks[initialTicks.length - 1] = base;
    setPriceHistory(initialTicks);
    setCurrentPrice(base);

    // Build 24 realistic OHLC candles matching timeframe waves
    const initCandles: { open: number; high: number; low: number; close: number }[] = [];
    let cOpen = base * (1 - config.trendDepth * 0.8);
    for (let i = 0; i < 24; i++) {
      const waveDelta = Math.sin(i / 2.5) * (base * config.vol * 2.2);
      const delta = (Math.random() - 0.48) * (base * config.vol * 1.2) + waveDelta * 0.3;
      const cClose = Number((cOpen + delta).toFixed(selectedPair.decimals));
      const cHigh = Number((Math.max(cOpen, cClose) + Math.random() * (base * config.vol * 0.9)).toFixed(selectedPair.decimals));
      const cLow = Number((Math.min(cOpen, cClose) - Math.random() * (base * config.vol * 0.9)).toFixed(selectedPair.decimals));
      initCandles.push({ open: cOpen, high: cHigh, low: cLow, close: cClose });
      cOpen = cClose;
    }
    setCandles(initCandles);
  }, [selectedPair, timeframe]);

  // Live Tick-by-Tick Simulation (Synchronized to selected timeframe speed)
  useEffect(() => {
    const config = getTimeframeConfig(timeframe);
    let tickCount = 0;
    const interval = setInterval(() => {
      tickCount++;
      const volatility = selectedPair.price * config.vol * 0.5;
      const delta = (Math.random() - 0.49) * volatility;
      
      setCurrentPrice((prev) => {
        const nextPrice = Number((prev + delta).toFixed(selectedPair.decimals));
        
        setPriceHistory((hist) => {
          const updated = [...hist.slice(1), nextPrice];
          return updated;
        });

        // Update active candle or roll new candle based on timeframe rollTicks
        setCandles((currCandles) => {
          if (currCandles.length === 0) return currCandles;
          const lastCandle = currCandles[currCandles.length - 1];
          const updatedLast = {
            ...lastCandle,
            high: Math.max(lastCandle.high, nextPrice),
            low: Math.min(lastCandle.low, nextPrice),
            close: nextPrice,
          };

          if (tickCount % config.rollTicks === 0) {
            // Roll new candle
            const newCandle = {
              open: nextPrice,
              high: nextPrice,
              low: nextPrice,
              close: nextPrice,
            };
            return [...currCandles.slice(1), newCandle];
          }

          return [...currCandles.slice(0, -1), updatedLast];
        });

        // Update live floating PnL for active positions
        setPositions((currPositions) =>
          currPositions.map((pos) => {
            if (pos.symbol !== selectedPair.symbol) return pos;
            const priceDiff = pos.type === 'LONG' ? nextPrice - pos.entryPrice : pos.entryPrice - nextPrice;
            const rawPnl = (priceDiff / pos.entryPrice) * pos.margin * pos.leverage;
            const pnlPct = (rawPnl / pos.margin) * 100;
            return {
              ...pos,
              markPrice: nextPrice,
              floatingPnl: Number(rawPnl.toFixed(2)),
              floatingPnlPct: Number(pnlPct.toFixed(2)),
              durationSec: pos.durationSec + 1,
            };
          })
        );

        return nextPrice;
      });
    }, config.tickInterval);

    return () => clearInterval(interval);
  }, [selectedPair, timeframe]);

  // Handle Preset Change
  const handlePresetChange = (preset: 'safe' | 'standard' | 'aggressive') => {
    setSelectedPreset(preset);
    if (preset === 'safe') {
      setTpPercent(0.5);
      setSlPercent(0.25);
    } else if (preset === 'standard') {
      setTpPercent(1.0);
      setSlPercent(0.5);
    } else if (preset === 'aggressive') {
      setTpPercent(2.0);
      setSlPercent(1.0);
    }
  };

  // Instant 1-Click Order Execution with Slippage Protection
  const handleExecuteScalp = (type: 'LONG' | 'SHORT') => {
    const margin = parseFloat(marginAmount);
    if (isNaN(margin) || margin <= 0 || margin > availableBalance) return;

    setIsExecuting(type);
    setTimeout(() => setIsExecuting(null), 300);

    const baseQuote = currentPrice;
    
    // Simulate sub-second order book slippage fluctuation (0.01% - 0.12%)
    const simulatedSlippagePct = Number(((Math.random() * 0.09) * (timeframe === '30s' ? 1.4 : 1.0)).toFixed(3));
    
    // Check if slippage exceeds user-defined protection threshold
    if (simulatedSlippagePct > slippageTolerance) {
      onOrderSuccess?.(`Proteksi Slippage Aktif: Pergeseran harga (${simulatedSlippagePct}%) melebihi toleransi (${slippageTolerance}%). Order dibatalkan aman.`);
      return;
    }

    // Apply filled execution price with actual slippage offset
    const slippageOffset = baseQuote * (simulatedSlippagePct / 100);
    const entry = type === 'LONG'
      ? Number((baseQuote + slippageOffset).toFixed(selectedPair.decimals))
      : Number((baseQuote - slippageOffset).toFixed(selectedPair.decimals));

    const tpDistance = entry * (tpPercent / 100);
    const slDistance = entry * (slPercent / 100);
    const tpPrice = type === 'LONG' ? Number((entry + tpDistance).toFixed(selectedPair.decimals)) : Number((entry - tpDistance).toFixed(selectedPair.decimals));
    const slPrice = type === 'LONG' ? Number((entry - slDistance).toFixed(selectedPair.decimals)) : Number((entry + slDistance).toFixed(selectedPair.decimals));

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    const newPos: LightningPosition = {
      id: `pos-${Date.now()}`,
      symbol: selectedPair.symbol,
      type,
      leverage,
      margin,
      entryPrice: entry,
      markPrice: entry,
      tpPrice,
      slPrice,
      floatingPnl: 0,
      floatingPnlPct: 0,
      openedAt: timeStr,
      durationSec: 0,
    };

    setPositions([newPos, ...positions]);
    setAvailableBalance((b) => b - margin);
    const actionLabel = type === 'LONG' ? 'BUY' : 'SELL';
    onOrderSuccess?.(`Order ${actionLabel} ${selectedPair.symbol} $${margin} (${leverage}x) dieksekusi @ ${selectedPair.prefix}${entry.toLocaleString()} (Slippage: ${simulatedSlippagePct}%).`);
  };

  // 1-Click Flip Position (Balik Arah Instan)
  const handleFlipPosition = (posId: string) => {
    const pos = positions.find((p) => p.id === posId);
    if (!pos) return;

    // Close current position
    const closePnl = pos.floatingPnl;
    const closePnlPct = pos.floatingPnlPct;
    const now = new Date().toTimeString().split(' ')[0];

    const histItem: ScalpHistoryItem = {
      id: `hist-${Date.now()}`,
      symbol: pos.symbol,
      type: pos.type,
      leverage: pos.leverage,
      margin: pos.margin,
      entryPrice: pos.entryPrice,
      closePrice: pos.markPrice,
      realizedPnl: closePnl,
      realizedPnlPct: closePnlPct,
      durationSec: pos.durationSec,
      closedAt: now,
    };

    // Open reverse position
    const newType: 'LONG' | 'SHORT' = pos.type === 'LONG' ? 'SHORT' : 'LONG';
    const entry = currentPrice;
    const tpDistance = entry * (tpPercent / 100);
    const slDistance = entry * (slPercent / 100);
    const tpPrice = newType === 'LONG' ? Number((entry + tpDistance).toFixed(selectedPair.decimals)) : Number((entry - tpDistance).toFixed(selectedPair.decimals));
    const slPrice = newType === 'LONG' ? Number((entry - slDistance).toFixed(selectedPair.decimals)) : Number((entry + slDistance).toFixed(selectedPair.decimals));

    const flippedPos: LightningPosition = {
      id: `pos-flip-${Date.now()}`,
      symbol: pos.symbol,
      type: newType,
      leverage: pos.leverage,
      margin: pos.margin,
      entryPrice: entry,
      markPrice: entry,
      tpPrice,
      slPrice,
      floatingPnl: 0,
      floatingPnlPct: 0,
      openedAt: now,
      durationSec: 0,
    };

    setPositions((prev) => [flippedPos, ...prev.filter((p) => p.id !== posId)]);
    setHistory((prev) => [histItem, ...prev]);
    setAvailableBalance((b) => b + closePnl);
    if (closePnl > 0) setWinStreak((s) => s + 1);

    const newActionLabel = newType === 'LONG' ? 'BUY' : 'SELL';
    onOrderSuccess?.(`Posisi berhasil dibalik ke ${newActionLabel} ${pos.symbol} secara instan.`);
  };

  // 1-Click Flash Close Single Position
  const handleFlashClose = (posId: string) => {
    const pos = positions.find((p) => p.id === posId);
    if (!pos) return;

    const closePnl = pos.floatingPnl;
    const closePnlPct = pos.floatingPnlPct;
    const now = new Date().toTimeString().split(' ')[0];

    const histItem: ScalpHistoryItem = {
      id: `hist-${Date.now()}`,
      symbol: pos.symbol,
      type: pos.type,
      leverage: pos.leverage,
      margin: pos.margin,
      entryPrice: pos.entryPrice,
      closePrice: pos.markPrice,
      realizedPnl: closePnl,
      realizedPnlPct: closePnlPct,
      durationSec: pos.durationSec,
      closedAt: now,
    };

    setPositions((prev) => prev.filter((p) => p.id !== posId));
    setHistory((prev) => [histItem, ...prev]);
    setAvailableBalance((b) => b + pos.margin + closePnl);
    if (closePnl > 0) {
      setWinStreak((s) => s + 1);
    } else {
      setWinStreak(0);
    }

    onOrderSuccess?.(`Posisi ${pos.symbol} berhasil ditutup. PnL: ${closePnl >= 0 ? '+' : ''}$${closePnl.toFixed(2)} USDT`);
  };

  // Emergency Flash Close All (Tutup Semua Posisi Seketika)
  const handleEmergencyFlashCloseAll = () => {
    if (positions.length === 0) return;

    const now = new Date().toTimeString().split(' ')[0];
    let totalPnlRecovered = 0;

    const newHistoryItems: ScalpHistoryItem[] = positions.map((pos) => {
      totalPnlRecovered += pos.margin + pos.floatingPnl;
      return {
        id: `hist-emg-${Date.now()}-${pos.id}`,
        symbol: pos.symbol,
        type: pos.type,
        leverage: pos.leverage,
        margin: pos.margin,
        entryPrice: pos.entryPrice,
        closePrice: pos.markPrice,
        realizedPnl: pos.floatingPnl,
        realizedPnlPct: pos.floatingPnlPct,
        durationSec: pos.durationSec,
        closedAt: now,
      };
    });

    setHistory((prev) => [...newHistoryItems, ...prev]);
    setPositions([]);
    setAvailableBalance((b) => b + totalPnlRecovered);
    onOrderSuccess?.(`Seluruh ${positions.length} posisi terbuka berhasil ditutup seketika.`);
  };

  // SVG Catmull-Rom Path Builder for Live Tick Chart
  const getTickPath = () => {
    if (priceHistory.length < 2) return { path: '', fillPath: '' };
    const min = Math.min(...priceHistory);
    const max = Math.max(...priceHistory);
    const range = max - min || 1;
    const width = 640;
    const height = 240;
    const padX = 15;
    const padY = 20;

    const pts = priceHistory.map((val, idx) => {
      const x = padX + (idx / (priceHistory.length - 1)) * (width - 2 * padX);
      const y = height - padY - ((val - min) / range) * (height - 2 * padY);
      return { x, y };
    });

    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 4.5;
      const cp1y = p1.y + (p2.y - p0.y) / 4.5;
      const cp2x = p2.x - (p3.x - p1.x) / 4.5;
      const cp2y = p2.y - (p3.y - p1.y) / 4.5;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }

    const lastPt = pts[pts.length - 1];
    const fillPath = `${d} L ${lastPt.x.toFixed(1)} ${height} L ${pts[0].x.toFixed(1)} ${height} Z`;

    return { path: d, fillPath, lastPt, min, max };
  };

  const tickData = getTickPath();

  // Candle Geometry Builder for SVG
  const getCandleGeometry = () => {
    if (candles.length === 0) return [];
    const min = Math.min(...candles.map((c) => c.low), currentPrice * 0.998);
    const max = Math.max(...candles.map((c) => c.high), currentPrice * 1.002);
    const range = max - min || 1;
    const width = 640;
    const height = 240;
    const padX = 15;
    const padY = 20;
    const totalBars = candles.length;
    const barWidth = (width - 2 * padX) / totalBars;

    return candles.map((c, idx) => {
      const cx = padX + (idx + 0.5) * barWidth;
      const yHigh = height - padY - ((c.high - min) / range) * (height - 2 * padY);
      const yLow = height - padY - ((c.low - min) / range) * (height - 2 * padY);
      const yOpen = height - padY - ((c.open - min) / range) * (height - 2 * padY);
      const yClose = height - padY - ((c.close - min) / range) * (height - 2 * padY);
      const isUp = c.close >= c.open;
      const bodyTop = Math.min(yOpen, yClose);
      const bodyHeight = Math.max(Math.abs(yClose - yOpen), 2.5);
      const color = isUp ? '#00E163' : '#FF5C77';

      return {
        cx,
        yHigh,
        yLow,
        bodyTop,
        bodyHeight,
        bodyWidth: Math.max(barWidth * 0.72, 4),
        color,
        isUp,
      };
    });
  };

  const candleData = getCandleGeometry();

  return (
    <div className="flex flex-col gap-5 p-6 max-w-[1600px] mx-auto w-full font-sans animate-fade-in text-slate-100">
      {/* 1. TOP HEADER & EMERGENCY ACTION BAR */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#18171E] via-[#1F1E25] to-[#18171E] border border-white/5 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="flex flex-col gap-2 z-10 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black bg-[#00E163]/10 text-[#00E163] border border-[#00E163]/30 tracking-wider uppercase">
              <FlashIcon className="w-3.5 h-3.5" />
              <span>Lightning Terminal</span>
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#18171E] text-slate-300 border border-white/10 font-mono-num">
              <Activity01Icon className="w-3 h-3 text-[#00E163]" />
              <span>Eksekusi 12ms Sub-Second</span>
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight font-heading">
            Eksekusi Scalping Cepat & Balik Arah 1-Klik
          </h1>
          <p className="text-xs text-slate-400">
            Platform scalping profesional dengan latensi ultra-rendah, preset TP/SL otomatis, dan proteksi pembalikan posisi instan pada seluruh 18 aset pasar.
          </p>
        </div>

        {/* Quick Stats + Emergency Close All Button */}
        <div className="flex items-center gap-4 z-10 shrink-0">
          <div className="flex items-center gap-3 p-2.5 px-4 rounded-2xl bg-[#18171E] border border-white/5">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Scalp PnL Hari Ini</span>
              <span className="text-sm font-black text-[#00E163] font-mono-num">
                +${history.reduce((a, b) => a + b.realizedPnl, 0).toFixed(2)}
              </span>
            </div>

            <div className="w-[1px] h-7 bg-white/10" />

            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Win Streak</span>
              <span className="flex items-center gap-1 text-sm font-black text-amber-400 font-mono-num">
                <FireIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>{winStreak}x Streak</span>
              </span>
            </div>
          </div>

          {/* Emergency Flash Close All Button with Red Sweep */}
          <button
            type="button"
            onClick={handleEmergencyFlashCloseAll}
            disabled={positions.length === 0}
            className="group relative flex items-center justify-center gap-2 h-12 px-5 rounded-2xl bg-[#26252E] hover:bg-[#FF5C77] disabled:bg-[#18171E] text-[#FF5C77] hover:text-black disabled:text-slate-600 font-extrabold text-xs shadow-lg transition-all duration-1000 overflow-hidden cursor-pointer border border-[#FF5C77]/30 disabled:border-white/5 disabled:cursor-not-allowed"
          >
            <span className="absolute inset-0 bg-[#FF5C77] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
            <span className="relative z-10 flex items-center gap-2 transition-colors duration-1000">
              <AlertCircleIcon className="w-4 h-4" />
              <span>Tutup Semua ({positions.length})</span>
            </span>
          </button>
        </div>
      </div>

      {/* 2. CATEGORY SELECTOR + 18 ASSETS SCROLLABLE CHIP BAR */}
      <div className="flex flex-col gap-3 p-4 rounded-3xl bg-[#1F1E25] border border-white/5 shadow-xl">
        {/* Category Header Filter (Semua 18 | Kripto 6 | Forex 6 | CFD 6) */}
        <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            {[
              { id: 'all', label: 'Semua Aset', count: 18, icon: Layers01Icon },
              { id: 'crypto', label: 'Kripto', count: 6, icon: Coins01Icon },
              { id: 'forex', label: 'Forex', count: 6, icon: Globe02Icon },
              { id: 'cfd', label: 'CFD & Komoditas', count: 6, icon: ChartHistogramIcon },
            ].map((cat) => {
              const Icon = cat.icon;
              const isCatActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id as AssetCategory)}
                  className={`group relative flex items-center justify-center gap-2 px-4 h-9 rounded-xl text-xs font-bold transition-all duration-1000 overflow-hidden cursor-pointer select-none ${
                    isCatActive
                      ? 'bg-[#00E163] text-black shadow-md shadow-[#00E163]/20 font-black border border-[#00E163]'
                      : 'bg-[#18171E] text-slate-300 hover:text-black border border-white/5'
                  }`}
                >
                  {!isCatActive && (
                    <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5 transition-colors duration-1000">
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{cat.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono-num font-extrabold ${
                        isCatActive ? 'bg-black text-[#00E163]' : 'bg-[#26252E] text-slate-400 group-hover:bg-black group-hover:text-[#00E163]'
                      }`}
                    >
                      {cat.count}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Asset Pills with 1000ms Sweep */}
        <div className="flex items-center gap-2 overflow-x-auto custom-positions-scrollbar pb-1">
          {filteredPairs.map((pair) => {
            const isSelected = selectedPair.id === pair.id;
            return (
              <button
                key={pair.id}
                type="button"
                onClick={() => setSelectedPair(pair)}
                className={`group relative flex items-center gap-2.5 px-3.5 h-11 rounded-2xl text-xs font-bold transition-all duration-1000 overflow-hidden cursor-pointer select-none shrink-0 border ${
                  isSelected
                    ? 'bg-[#00E163] text-black shadow-lg shadow-[#00E163]/20 font-black border-[#00E163]'
                    : 'bg-[#18171E] text-slate-300 hover:text-black border-white/5'
                }`}
              >
                {!isSelected && (
                  <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                )}
                <span className="relative z-10 flex items-center gap-2 transition-colors duration-1000">
                  <span className="font-extrabold font-mono-num">{pair.symbol}</span>
                  <span className="font-mono-num font-bold">
                    {pair.prefix}{pair.price.toLocaleString(undefined, { minimumFractionDigits: pair.decimals })}
                  </span>
                  <span className={`text-[10px] font-mono-num font-extrabold ${isSelected ? 'text-black' : pair.change24h >= 0 ? 'text-[#00E163] group-hover:text-black' : 'text-[#FF5C77] group-hover:text-black'}`}>
                    {pair.change24h >= 0 ? '+' : ''}{pair.change24h}%
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN WORKSPACE GRID: LIVE TICK CHART (LEFT) & INSTANT CONTROLLER (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT: LIVE SUB-SECOND TICK / CANDLESTICK CHART (8 COLS) */}
        <div className="lg:col-span-8 flex flex-col gap-4 p-5 rounded-3xl bg-[#1F1E25] border border-white/5 shadow-xl">
          {/* Chart Header Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#26252E] border border-white/10 flex items-center justify-center font-black text-xs text-[#00E163]">
                {selectedPair.id.slice(0, 4)}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white font-heading">{selectedPair.name} ({selectedPair.symbol})</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#00E163]/10 text-[#00E163] uppercase">
                    {selectedPair.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-white font-mono-num">
                    {selectedPair.prefix}{currentPrice.toLocaleString(undefined, { minimumFractionDigits: selectedPair.decimals })}
                  </span>
                  <span className={`text-xs font-bold font-mono-num ${selectedPair.change24h >= 0 ? 'text-[#00E163]' : 'text-[#FF5C77]'}`}>
                    {selectedPair.change24h >= 0 ? '+' : ''}{selectedPair.change24h}%
                  </span>
                </div>
              </div>
            </div>

            {/* Controls: Candle / Line Toggle + Timeframe Chips */}
            <div className="flex items-center gap-2">
              {/* Candle vs Line Toggle Pill (Matching User Reference) */}
              <div className="flex items-center p-1 rounded-2xl bg-[#18171E] border border-white/5">
                <button
                  type="button"
                  onClick={() => setChartType('candle')}
                  className={`group relative flex items-center justify-center px-4 h-8 rounded-xl text-xs font-bold transition-all duration-1000 overflow-hidden cursor-pointer select-none ${
                    chartType === 'candle'
                      ? 'bg-[#00E163] text-black font-extrabold shadow-sm'
                      : 'text-slate-400 hover:text-black'
                  }`}
                >
                  {chartType !== 'candle' && (
                    <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                  )}
                  <span className="relative z-10 transition-colors duration-1000">Candle</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChartType('line')}
                  className={`group relative flex items-center justify-center px-4 h-8 rounded-xl text-xs font-bold transition-all duration-1000 overflow-hidden cursor-pointer select-none ${
                    chartType === 'line'
                      ? 'bg-[#00E163] text-black font-extrabold shadow-sm'
                      : 'text-slate-400 hover:text-black'
                  }`}
                >
                  {chartType !== 'line' && (
                    <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                  )}
                  <span className="relative z-10 transition-colors duration-1000">Line</span>
                </button>
              </div>

              {/* Timeframe Chips with 1000ms Sweep */}
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#18171E] border border-white/5">
                {(['30s', '1m', '3m', '5m'] as const).map((tf) => {
                  const isTfActive = timeframe === tf;
                  return (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => setTimeframe(tf)}
                      className={`group relative flex items-center justify-center px-3.5 h-8 rounded-xl text-xs font-bold font-mono-num transition-all duration-1000 overflow-hidden cursor-pointer select-none ${
                        isTfActive ? 'bg-[#00E163] text-black font-black shadow-sm' : 'text-slate-400 hover:text-black'
                      }`}
                    >
                      {!isTfActive && (
                        <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                      )}
                      <span className="relative z-10 transition-colors duration-1000">{tf}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SVG Canvas Area Live Pulse Chart (Line or Candlestick) - Dynamically Expands to Fill Height */}
          <div className="relative w-full flex-1 min-h-[340px] rounded-2xl bg-[#14131A] border border-white/5 p-2 overflow-hidden flex items-center justify-center">
            {(() => {
              const tpPriceVal = currentPrice * (1 + tpPercent / 100);
              const slPriceVal = currentPrice * (1 - slPercent / 100);
              const minVal = chartType === 'candle' && candles.length > 0
                ? Math.min(...candles.map((c) => c.low), slPriceVal * 0.999)
                : Math.min(...priceHistory, slPriceVal * 0.999);
              const maxVal = chartType === 'candle' && candles.length > 0
                ? Math.max(...candles.map((c) => c.high), tpPriceVal * 1.001)
                : Math.max(...priceHistory, tpPriceVal * 1.001);
              const rangeVal = maxVal - minVal || 1;

              const clampY = (val: number) => {
                const y = 240 - 22 - ((val - minVal) / rangeVal) * (240 - 44);
                return Math.min(Math.max(y, 18), 222);
              };

              const yTP = clampY(tpPriceVal);
              const ySL = clampY(slPriceVal);
              const yCurrent = clampY(currentPrice);

              const tpTopPercent = (yTP / 240) * 100;
              const slTopPercent = (ySL / 240) * 100;

              return (
                <>
                  <svg width="100%" height="100%" viewBox="0 0 640 240" preserveAspectRatio="none" className="w-full h-full overflow-hidden">
                    <defs>
                      <linearGradient id="live-tick-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00E163" stopOpacity="0.35" />
                        <stop offset="60%" stopColor="#00E163" stopOpacity="0.10" />
                        <stop offset="100%" stopColor="#00E163" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Dashed Grid Guide Lines - Subtle & Transparent */}
                    <line x1="0" y1="60" x2="640" y2="60" stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" strokeWidth="1" />
                    <line x1="0" y1="120" x2="640" y2="120" stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" strokeWidth="1" />
                    <line x1="0" y1="180" x2="640" y2="180" stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" strokeWidth="1" />

                    {/* MODE 1: LINE SPLINE AREA CHART */}
                    {chartType === 'line' && (
                      <>
                        {tickData.fillPath && (
                          <path d={tickData.fillPath} fill="url(#live-tick-grad)" />
                        )}
                        {tickData.path && (
                          <path
                            d={tickData.path}
                            fill="none"
                            stroke="#00E163"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )}
                        {tickData.lastPt && (
                          <>
                            <circle cx={tickData.lastPt.x} cy={tickData.lastPt.y} r="8" fill="#00E163" opacity="0.25" className="animate-ping" />
                            <circle cx={tickData.lastPt.x} cy={tickData.lastPt.y} r="4" fill="#00E163" />
                            <circle cx={tickData.lastPt.x} cy={tickData.lastPt.y} r="1.5" fill="#000000" />
                          </>
                        )}
                      </>
                    )}

                    {/* MODE 2: CANDLESTICK BARS */}
                    {chartType === 'candle' && (
                      <g>
                        {candleData.map((cd, idx) => (
                          <g key={idx}>
                            {/* Upper & Lower Wick Line */}
                            <line
                              x1={cd.cx}
                              y1={cd.yHigh}
                              x2={cd.cx}
                              y2={cd.yLow}
                              stroke={cd.color}
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                            {/* Candle Body Rect */}
                            <rect
                              x={cd.cx - cd.bodyWidth / 2}
                              y={cd.bodyTop}
                              width={cd.bodyWidth}
                              height={cd.bodyHeight}
                              rx="2"
                              fill={cd.color}
                            />
                          </g>
                        ))}
                      </g>
                    )}

                    {/* 1. HORIZONTAL TP TARGET LINE (Subtle Dashed Line) */}
                    <line x1="0" y1={yTP} x2="640" y2={yTP} stroke="#00E163" strokeDasharray="3 3" strokeWidth="1" opacity="0.5" />

                    {/* 2. HORIZONTAL SL LIMIT LINE (Subtle Dashed Line) */}
                    <line x1="0" y1={ySL} x2="640" y2={ySL} stroke="#FF5C77" strokeDasharray="3 3" strokeWidth="1" opacity="0.5" />

                    {/* 3. CURRENT LIVE PRICE HORIZONTAL DASHED LINE */}
                    <line x1="0" y1={yCurrent} x2="640" y2={yCurrent} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" strokeWidth="1" />
                  </svg>

                  {/* CRISP HTML OVERLAY BADGES FOR TP & SL (100% Crisp Font & Zero Distortion) */}
                  <div
                    className="absolute right-3.5 z-20 flex items-center justify-center px-2.5 py-1 rounded-lg bg-[#00E163] text-black shadow-lg -translate-y-1/2 pointer-events-none select-none"
                    style={{ top: `${tpTopPercent}%` }}
                  >
                    <span className="text-[10px] font-black font-mono-num whitespace-nowrap leading-none">
                      TP +{tpPercent}%: {selectedPair.prefix}{tpPriceVal.toFixed(selectedPair.decimals)}
                    </span>
                  </div>

                  <div
                    className="absolute right-3.5 z-20 flex items-center justify-center px-2.5 py-1 rounded-lg bg-[#FF5C77] text-black shadow-lg -translate-y-1/2 pointer-events-none select-none"
                    style={{ top: `${slTopPercent}%` }}
                  >
                    <span className="text-[10px] font-black font-mono-num whitespace-nowrap leading-none">
                      SL -{slPercent}%: {selectedPair.prefix}{slPriceVal.toFixed(selectedPair.decimals)}
                    </span>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Quick Stats Bar Under Chart */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-2xl bg-[#18171E] border border-white/5 flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Rentang 24H Min / Max</span>
              <span className="text-xs font-black text-white font-mono-num">
                {selectedPair.prefix}{(selectedPair.price * 0.96).toFixed(selectedPair.decimals)} - {selectedPair.prefix}{(selectedPair.price * 1.05).toFixed(selectedPair.decimals)}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#18171E] border border-white/5 flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Kategori Aset</span>
              <span className="text-xs font-black text-[#00E163] uppercase tracking-wider">{selectedPair.category}</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#18171E] border border-white/5 flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Volume Scalping 24H</span>
              <span className="text-xs font-black text-white font-mono-num">$42.8M USDT</span>
            </div>
          </div>
        </div>

        {/* RIGHT: INSTANT SCALPING CONTROLLER (4 COLS) */}
        <div className="lg:col-span-4 flex flex-col gap-4 p-5 rounded-3xl bg-[#1F1E25] border border-white/5 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-[#00E163]" />
              <h3 className="text-sm font-extrabold text-white">Kontrol Scalping Cepat</h3>
            </div>

            {/* Zero Delay Toggle */}
            <div
              onClick={() => setZeroDelayMode(!zeroDelayMode)}
              className="flex items-center gap-1.5 cursor-pointer select-none group"
            >
              <div
                className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                  zeroDelayMode ? 'bg-[#00E163] border-[#00E163]' : 'border-white/20 bg-transparent'
                }`}
              >
                {zeroDelayMode && <Tick01Icon className="w-3 h-3 stroke-[3] text-black" />}
              </div>
              <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-200">
                Mode 0-Delay
              </span>
            </div>
          </div>

          {/* 1. Modal Margin Input & Quick Chips */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-400">Nominal Margin (USDT)</label>
              <span className="text-[10px] text-slate-500 font-mono-num">
                Saldo: <strong className="text-white font-mono-num">${availableBalance.toLocaleString()}</strong>
              </span>
            </div>

            <div className="relative flex items-center h-12 px-3.5 rounded-2xl bg-[#18171E] border border-white/10 focus-within:border-[#00E163]/60 transition-colors">
              <input
                type="number"
                min="5"
                max={availableBalance}
                value={marginAmount}
                onChange={(e) => setMarginAmount(e.target.value)}
                placeholder="50"
                className="w-full bg-transparent text-sm font-bold text-white font-mono-num focus:outline-none"
              />
              <span className="text-xs font-extrabold text-[#00E163] font-mono-num">USDT</span>
            </div>

            {/* Quick Pills */}
            <div className="grid grid-cols-4 gap-1.5 mt-1">
              {[10, 25, 50, 100, 250, 500].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setMarginAmount(amt.toString())}
                  className={`py-1.5 rounded-xl text-[11px] font-bold font-mono-num transition-all cursor-pointer border ${
                    marginAmount === amt.toString()
                      ? 'bg-[#00E163] text-black font-extrabold border-[#00E163]'
                      : 'bg-[#26252E] hover:bg-white/10 text-slate-300 border-white/5'
                  }`}
                >
                  ${amt}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setMarginAmount('1000')}
                className="py-1.5 rounded-xl bg-[#26252E] hover:bg-white/10 text-slate-300 text-[11px] font-bold font-mono-num border border-white/5 cursor-pointer"
              >
                $1k
              </button>
              <button
                type="button"
                onClick={() => setMarginAmount(availableBalance.toFixed(0))}
                className="py-1.5 rounded-xl bg-[#26252E] hover:bg-[#00E163] text-slate-300 hover:text-black text-[11px] font-black font-mono-num border border-white/5 cursor-pointer transition-colors"
              >
                MAX
              </button>
            </div>
          </div>

          {/* 2. Leverage Selector (10x, 25x, 50x, 75x, 100x) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-400">Pengali Leverage</label>
              <span className="text-xs font-black text-[#00E163] font-mono-num">{leverage}x Cross</span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 p-1 rounded-2xl bg-[#18171E] border border-white/5">
              {[10, 25, 50, 75, 100].map((lev) => (
                <button
                  key={lev}
                  type="button"
                  onClick={() => setLeverage(lev)}
                  className={`py-1.5 rounded-xl text-xs font-bold font-mono-num transition-all cursor-pointer ${
                    leverage === lev
                      ? 'bg-[#00E163] text-black font-extrabold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lev}x
                </button>
              ))}
            </div>
          </div>

          {/* 3. Toleransi Slippage (Slippage Tolerance Settings) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <Shield01Icon className="w-3.5 h-3.5 text-[#00E163]" />
                <label className="font-bold text-slate-400">Toleransi Slippage</label>
              </div>
              <span className="text-xs font-black text-[#00E163] font-mono-num">{slippageTolerance}% Maks</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-[#18171E] border border-white/5">
              {[0.05, 0.1, 0.2, 0.5].map((slip) => (
                <button
                  key={slip}
                  type="button"
                  onClick={() => setSlippageTolerance(slip)}
                  className={`py-1.5 rounded-xl text-xs font-bold font-mono-num transition-all cursor-pointer ${
                    slippageTolerance === slip
                      ? 'bg-[#00E163] text-black font-extrabold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {slip}%
                </button>
              ))}
            </div>
          </div>

          {/* 4. INTERACTIVE TP & SL CONTROLLER */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Take Profit (TP) Box */}
            <div className="p-3 rounded-2xl bg-[#18171E] border border-[#00E163]/20 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#00E163] flex items-center gap-1">
                  <span>Take Profit</span>
                </span>
                <span className="text-[10px] font-mono-num font-bold text-[#00E163]">
                  +${((parseFloat(marginAmount) || 50) * (leverage * (tpPercent / 100))).toFixed(1)}
                </span>
              </div>

              <div className="flex items-center h-9 px-2.5 rounded-xl bg-[#26252E] border border-white/10">
                <span className="text-xs font-bold text-[#00E163] mr-1">+</span>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="100"
                  value={tpPercent}
                  onChange={(e) => setTpPercent(parseFloat(e.target.value) || 0.5)}
                  className="w-full bg-transparent text-xs font-bold text-white font-mono-num focus:outline-none"
                />
                <span className="text-[10px] font-bold text-slate-400">%</span>
              </div>

              {/* Quick TP Chips (2x2 Grid) */}
              <div className="grid grid-cols-2 gap-1.5">
                {[0.5, 1.0, 2.0, 3.0].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setTpPercent(p)}
                    className={`py-1 rounded-lg text-[10px] font-bold font-mono-num transition-all cursor-pointer ${
                      tpPercent === p
                        ? 'bg-[#00E163] text-black font-extrabold shadow-sm'
                        : 'bg-[#26252E] hover:bg-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </div>

            {/* Stop Loss (SL) Box */}
            <div className="p-3 rounded-2xl bg-[#18171E] border border-[#FF5C77]/20 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#FF5C77] flex items-center gap-1">
                  <span>Stop Loss</span>
                </span>
                <span className="text-[10px] font-mono-num font-bold text-[#FF5C77]">
                  -${((parseFloat(marginAmount) || 50) * (leverage * (slPercent / 100))).toFixed(1)}
                </span>
              </div>

              <div className="flex items-center h-9 px-2.5 rounded-xl bg-[#26252E] border border-white/10">
                <span className="text-xs font-bold text-[#FF5C77] mr-1">-</span>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="100"
                  value={slPercent}
                  onChange={(e) => setSlPercent(parseFloat(e.target.value) || 0.25)}
                  className="w-full bg-transparent text-xs font-bold text-white font-mono-num focus:outline-none"
                />
                <span className="text-[10px] font-bold text-slate-400">%</span>
              </div>

              {/* Quick SL Chips (2x2 Grid) */}
              <div className="grid grid-cols-2 gap-1.5">
                {[0.25, 0.5, 1.0, 1.5].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setSlPercent(p)}
                    className={`py-1 rounded-lg text-[10px] font-bold font-mono-num transition-all cursor-pointer ${
                      slPercent === p
                        ? 'bg-[#FF5C77] text-black font-extrabold shadow-sm'
                        : 'bg-[#26252E] hover:bg-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. LARGE 1-CLICK INSTANT EXECUTION BUTTONS (BUY & SELL) */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* BUY BUTTON */}
            <button
              type="button"
              onClick={() => handleExecuteScalp('LONG')}
              className={`relative flex flex-col items-center justify-center py-3.5 px-4 rounded-2xl bg-[#00E163] hover:bg-[#00c957] text-black font-black text-sm shadow-[0_0_20px_rgba(0,225,99,0.3)] cursor-pointer transition-all active:scale-95 select-none ${
                isExecuting === 'LONG' ? 'ring-4 ring-white' : ''
              }`}
            >
              <div className="flex items-center gap-1.5">
                <ArrowUp01Icon className="w-4 h-4 stroke-[3]" />
                <span className="tracking-wide">BUY</span>
              </div>
              <span className="text-[10px] font-mono-num opacity-80">
                {selectedPair.prefix}{currentPrice.toFixed(selectedPair.decimals)}
              </span>
            </button>

            {/* SELL BUTTON */}
            <button
              type="button"
              onClick={() => handleExecuteScalp('SHORT')}
              className={`relative flex flex-col items-center justify-center py-3.5 px-4 rounded-2xl bg-[#FF5C77] hover:bg-[#ff4362] text-black font-black text-sm shadow-[0_0_20px_rgba(255,92,119,0.3)] cursor-pointer transition-all active:scale-95 select-none ${
                isExecuting === 'SHORT' ? 'ring-4 ring-white' : ''
              }`}
            >
              <div className="flex items-center gap-1.5">
                <ArrowDown01Icon className="w-4 h-4 stroke-[3]" />
                <span className="tracking-wide">SELL</span>
              </div>
              <span className="text-[10px] font-mono-num opacity-80">
                {selectedPair.prefix}{currentPrice.toFixed(selectedPair.decimals)}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM WORKSPACE TABS: ACTIVE POSITIONS & FAST HISTORY */}
      <div className="p-5 rounded-3xl bg-[#1F1E25] border border-white/5 space-y-4 shadow-xl">
        {/* Sub-Navigation Tabs with 1000ms Sweep */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'positions', label: 'Posisi Aktif', count: positions.length, icon: Layers01Icon },
              { id: 'history', label: 'Riwayat Scalping Cepat', count: history.length, icon: Clock01Icon },
              { id: 'stats', label: 'Statistik Kecepatan', icon: Activity01Icon },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = bottomTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setBottomTab(tab.id as any)}
                  className={`group relative flex items-center justify-center gap-2 px-5 h-11 rounded-2xl text-xs font-bold transition-all duration-1000 overflow-hidden cursor-pointer select-none ${
                    isActive
                      ? 'bg-[#00E163] text-black shadow-lg shadow-[#00E163]/25 font-black border border-[#00E163]'
                      : 'bg-[#18171E] text-slate-300 hover:text-black border border-white/5'
                  }`}
                >
                  {!isActive && (
                    <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                  )}
                  <span className="relative z-10 flex items-center gap-2 transition-colors duration-1000">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono-num font-extrabold ${
                          isActive ? 'bg-black text-[#00E163]' : 'bg-[#26252E] text-slate-300 group-hover:bg-black group-hover:text-[#00E163]'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: ACTIVE POSITIONS */}
        {bottomTab === 'positions' && (
          <div className="overflow-x-auto custom-positions-scrollbar">
            {positions.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center gap-2 text-slate-500">
                <FlashIcon className="w-8 h-8 opacity-30 text-[#00E163]" />
                <span className="text-xs font-bold">Tidak ada posisi scalping aktif.</span>
                <span className="text-[11px]">Klik FAST LONG atau FAST SHORT untuk membuka order instan!</span>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#18171E] text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-white/5">
                  <tr>
                    <th className="p-3.5">Pasangan</th>
                    <th className="p-3.5">Modal Margin</th>
                    <th className="p-3.5">Entry / Mark Price</th>
                    <th className="p-3.5">Target TP / SL</th>
                    <th className="p-3.5">Floating PnL</th>
                    <th className="p-3.5">Durasi</th>
                    <th className="p-3.5 text-right">Aksi Instan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200 font-medium">
                  {positions.map((pos) => (
                    <tr key={pos.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3.5 flex items-center gap-2.5">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black font-mono-num ${
                            pos.type === 'LONG' ? 'bg-[#00E163]/15 text-[#00E163]' : 'bg-[#FF5C77]/15 text-[#FF5C77]'
                          }`}
                        >
                          {pos.type} {pos.leverage}x
                        </span>
                        <span className="font-extrabold text-white font-mono-num">{pos.symbol}</span>
                      </td>

                      <td className="p-3.5 font-mono-num font-bold">
                        ${pos.margin.toFixed(2)} USDT
                      </td>

                      <td className="p-3.5 font-mono-num">
                        <div className="flex flex-col">
                          <span className="text-white font-bold">${pos.entryPrice.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400">${pos.markPrice.toLocaleString()}</span>
                        </div>
                      </td>

                      <td className="p-3.5 font-mono-num">
                        <div className="flex flex-col">
                          <span className="text-[#00E163] font-bold">${pos.tpPrice.toLocaleString()}</span>
                          <span className="text-[#FF5C77] text-[10px]">${pos.slPrice.toLocaleString()}</span>
                        </div>
                      </td>

                      <td className="p-3.5 font-mono-num">
                        <div className="flex flex-col">
                          <span
                            className={`text-sm font-black ${
                              pos.floatingPnl >= 0 ? 'text-[#00E163]' : 'text-[#FF5C77]'
                            }`}
                          >
                            {pos.floatingPnl >= 0 ? '+' : ''}${pos.floatingPnl.toFixed(2)}
                          </span>
                          <span
                            className={`text-[10px] font-bold ${
                              pos.floatingPnlPct >= 0 ? 'text-[#00E163]' : 'text-[#FF5C77]'
                            }`}
                          >
                            {pos.floatingPnlPct >= 0 ? '+' : ''}{pos.floatingPnlPct.toFixed(2)}%
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5 font-mono-num text-slate-400 text-[11px]">
                        {pos.durationSec}s lalu
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* 1-Click Flip Position */}
                          <button
                            type="button"
                            onClick={() => handleFlipPosition(pos.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#26252E] hover:bg-white/10 text-amber-400 hover:text-white font-bold text-xs border border-amber-400/30 cursor-pointer transition-colors"
                            title="Tutup posisi ini dan langsung buka arah sebaliknya"
                          >
                            <Exchange01Icon className="w-3.5 h-3.5" />
                            <span>Balik Arah</span>
                          </button>

                          {/* 1-Click Flash Close */}
                          <button
                            type="button"
                            onClick={() => handleFlashClose(pos.id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FF5C77]/10 hover:bg-[#FF5C77] text-[#FF5C77] hover:text-black font-extrabold text-xs border border-[#FF5C77]/30 cursor-pointer transition-colors"
                          >
                            <Cancel01Icon className="w-3.5 h-3.5" />
                            <span>Flash Close</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TAB 2: FAST SCALPING HISTORY */}
        {bottomTab === 'history' && (
          <div className="overflow-x-auto custom-positions-scrollbar">
            {history.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">Belum ada riwayat scalping.</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#18171E] text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-white/5">
                  <tr>
                    <th className="p-3.5">Pasangan</th>
                    <th className="p-3.5">Modal</th>
                    <th className="p-3.5">Entry / Exit</th>
                    <th className="p-3.5">Realized PnL</th>
                    <th className="p-3.5">Durasi</th>
                    <th className="p-3.5 text-right">Waktu Tutup</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-200 font-medium">
                  {history.map((h) => (
                    <tr key={h.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3.5 flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black font-mono-num ${
                            h.type === 'LONG' ? 'bg-[#00E163]/15 text-[#00E163]' : 'bg-[#FF5C77]/15 text-[#FF5C77]'
                          }`}
                        >
                          {h.type} {h.leverage}x
                        </span>
                        <span className="font-extrabold text-white font-mono-num">{h.symbol}</span>
                      </td>

                      <td className="p-3.5 font-mono-num">${h.margin.toFixed(2)} USDT</td>

                      <td className="p-3.5 font-mono-num">
                        ${h.entryPrice.toLocaleString()} ➔ ${h.closePrice.toLocaleString()}
                      </td>

                      <td className="p-3.5 font-mono-num">
                        <span className={`font-black ${h.realizedPnl >= 0 ? 'text-[#00E163]' : 'text-[#FF5C77]'}`}>
                          {h.realizedPnl >= 0 ? '+' : ''}${h.realizedPnl.toFixed(2)} (+{h.realizedPnlPct.toFixed(2)}%)
                        </span>
                      </td>

                      <td className="p-3.5 font-mono-num text-slate-400">{h.durationSec} detik</td>
                      <td className="p-3.5 text-right text-slate-500 font-mono-num">{h.closedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* TAB 3: SPEED & WIN STREAK STATS */}
        {bottomTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2">
            <div className="p-4 rounded-2xl bg-[#18171E] border border-white/5 flex flex-col gap-1.5">
              <span className="text-xs text-slate-400 font-bold">Rata-rata Durasi Scalping</span>
              <span className="text-xl font-black text-white font-mono-num">
                {history.length > 0 ? (history.reduce((a, b) => a + b.durationSec, 0) / history.length).toFixed(1) : '0.0'} Detik
              </span>
              <span className="text-[10px] text-[#00E163] font-bold">
                Kategori: High Frequency Scalper
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#18171E] border border-white/5 flex flex-col gap-1.5">
              <span className="text-xs text-slate-400 font-bold">Win Rate Cepat (Fast Winrate)</span>
              <span className="text-xl font-black text-[#00E163] font-mono-num">
                {history.length > 0 ? ((history.filter((h) => h.realizedPnl > 0).length / history.length) * 100).toFixed(1) : '100.0'}%
              </span>
              <span className="text-[10px] text-slate-400">
                Dari {history.length} order ({history.filter((h) => h.realizedPnl > 0).length} Menang / {history.filter((h) => h.realizedPnl <= 0).length} Kalah)
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#18171E] border border-white/5 flex flex-col gap-1.5">
              <span className="text-xs text-slate-400 font-bold">Rekor Win Streak Saat Ini</span>
              <span className="text-xl font-black text-amber-400 font-mono-num">{winStreak}x Berturut-turut</span>
              <span className="flex items-center gap-1 text-[10px] text-amber-400 font-bold">
                <FireIcon className="w-3 h-3 text-amber-400" />
                <span>Status: {winStreak >= 5 ? 'Godmode Scalper' : 'Active Scalper'}</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
