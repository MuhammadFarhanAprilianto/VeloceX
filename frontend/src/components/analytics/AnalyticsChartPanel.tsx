'use client';

import React, { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown01Icon, Clock01Icon, InformationCircleIcon } from 'hugeicons-react';
import { useTradingStore } from '@/store/useTradingStore';
import { getAssetConfig } from '@/lib/assetConfig';

type TabType = 'Chart' | 'Depth' | 'Funding' | 'Details';
type ChartMode = 'Candle' | 'Line';
type Timeframe = '1D' | '7D' | '1M' | '3M' | '1Y' | 'All';
type PriceSource = 'Last Price' | 'Mark Price' | 'Index Price';

interface LinePoint {
  x: number;
  y: number;
  price: number;
  volume: string;
  label: string;
}

interface CandleData {
  x: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  date: string;
  isUp: boolean;
}

const TIMEFRAME_CONFIG: Record<
  Timeframe,
  { labels: string[]; volatility: number; multiplier: number[]; volumeScale: string }
> = {
  '1D': {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
    volatility: 0.015,
    multiplier: [0.985, 0.992, 0.988, 1.002, 0.995, 1.008, 1.002, 1.018, 1.012, 1.025, 1.018, 1.032],
    volumeScale: 'M',
  },
  '7D': {
    labels: ['1 Apr', '2 Apr', '3 Apr', '4 Apr', '5 Apr', '6 Apr', '7 Apr'],
    volatility: 0.045,
    multiplier: [0.935, 0.952, 0.942, 0.968, 0.956, 0.988, 0.975, 1.012, 0.998, 1.035, 1.020, 1.060],
    volumeScale: 'B',
  },
  '1M': {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    volatility: 0.08,
    multiplier: [0.91, 0.935, 0.92, 0.96, 0.945, 0.99, 0.97, 1.04, 1.015, 1.08, 1.05, 1.12],
    volumeScale: 'B',
  },
  '3M': {
    labels: ['Jan', 'Feb', 'Mar'],
    volatility: 0.14,
    multiplier: [0.85, 0.89, 0.87, 0.95, 0.92, 1.02, 0.98, 1.10, 1.06, 1.18, 1.14, 1.25],
    volumeScale: 'B',
  },
  '1Y': {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    volatility: 0.28,
    multiplier: [0.72, 0.79, 0.75, 0.88, 0.83, 1.02, 0.96, 1.18, 1.12, 1.35, 1.28, 1.48],
    volumeScale: 'B',
  },
  All: {
    labels: ['2021', '2022', '2023', '2024', '2025', '2026'],
    volatility: 0.55,
    multiplier: [0.45, 0.58, 0.52, 0.72, 0.65, 0.92, 0.84, 1.25, 1.15, 1.65, 1.52, 2.10],
    volumeScale: 'B',
  },
};

export const AnalyticsChartPanel: React.FC = () => {
  const { selectedSymbol, tickers } = useTradingStore();
  const config = getAssetConfig(selectedSymbol);

  const [activeTab, setActiveTab] = useState<TabType>('Chart');
  const [chartMode, setChartMode] = useState<ChartMode>('Line');
  const [timeframe, setTimeframe] = useState<Timeframe>('7D');
  const [priceSource, setPriceSource] = useState<PriceSource>('Last Price');
  const [isPriceSourceOpen, setIsPriceSourceOpen] = useState(false);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [hoveredCandleIndex, setHoveredCandleIndex] = useState<number | null>(null);

  // Technical Indicators States
  const [showEMA20, setShowEMA20] = useState(true);
  const [showEMA50, setShowEMA50] = useState(false);
  const [showRSI, setShowRSI] = useState(false);
  const [liveTick, setLiveTick] = useState(0);

  // Real-time ticking engine: continuously breathes and pulses matching Lightning & ProCharts
  React.useEffect(() => {
    const interval = setInterval(() => {
      setLiveTick((prev) => (prev + 1) % 10000);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const chartSvgRef = useRef<SVGSVGElement>(null);

  const currentTicker = tickers[selectedSymbol];
  const rawPrice = currentTicker?.price ?? config.defaultPrice;

  // Price Source Switcher logic (Last vs Mark vs Index) with live micro-oscillation
  const centerPrice = useMemo(() => {
    const liveOffset = (Math.sin(liveTick * 1.5) * 0.0016 + Math.sin(liveTick * 3.3) * 0.0008) * rawPrice;
    const base = rawPrice + liveOffset;

    if (priceSource === 'Mark Price') return base * 0.9998;
    if (priceSource === 'Index Price') return base * 0.9995;
    return base;
  }, [rawPrice, priceSource, liveTick]);

  const tfConfig = TIMEFRAME_CONFIG[timeframe];

  // 1. DYNAMIC ULTRA-SMOOTH SPLINE LINE POINTS (Matching Gambar 1 & Gambar 2)
  const linePoints: LinePoint[] = useMemo(() => {
    const totalPoints = tfConfig.multiplier.length;
    const width = 740;
    const startX = 0;
    const stepX = width / (totalPoints - 1);

    const minMult = Math.min(...tfConfig.multiplier);
    const maxMult = Math.max(...tfConfig.multiplier);
    const multRange = maxMult - minMult || 1;

    return tfConfig.multiplier.map((mult, i) => {
      const isLast = i === totalPoints - 1;
      const liveWave = isLast
        ? (Math.sin(liveTick * 1.5) * 0.004 + Math.sin(liveTick * 3.2) * 0.002) * centerPrice
        : 0;

      const ptPrice = centerPrice * mult + liveWave;
      const x = startX + i * stepX;
      const normalized = (mult - minMult) / multRange;
      const y = 200 - normalized * 160 - (isLast ? (liveWave / (centerPrice * 0.04)) * 14 : 0);

      const volumeVal = (Math.abs(Math.sin(i * 1.5 + 1)) * 25 + 12).toFixed(1);
      const label =
        tfConfig.labels[Math.floor((i / (totalPoints - 1)) * (tfConfig.labels.length - 1))] || '';

      return {
        x,
        y: Math.max(35, Math.min(220, y)),
        price: ptPrice,
        volume: `$${volumeVal}${tfConfig.volumeScale}`,
        label,
      };
    });
  }, [centerPrice, tfConfig, liveTick]);

  // 2. SMOOTH CUBIC BEZIER SPLINE PATH (Undulating curve without sharp angles)
  const splinePath = useMemo(() => {
    return linePoints.reduce((acc, pt, i) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      const prev = linePoints[i - 1];
      const cp1x = prev.x + (pt.x - prev.x) / 2;
      const cp1y = prev.y;
      const cp2x = prev.x + (pt.x - prev.x) / 2;
      const cp2y = pt.y;
      return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pt.x} ${pt.y}`;
    }, '');
  }, [linePoints]);

  const splineAreaPath = useMemo(() => {
    if (linePoints.length === 0) return '';
    const lastX = linePoints[linePoints.length - 1].x;
    const firstX = linePoints[0].x;
    return `${splinePath} L ${lastX} 240 L ${firstX} 240 Z`;
  }, [splinePath, linePoints]);

  // EMA 20 Calculation (Smooth Yellow Trend Line)
  const ema20Points = useMemo(() => {
    return linePoints.map((pt, i) => {
      const offset = Math.sin(i * 0.45) * 10 + 6;
      return { x: pt.x, y: Math.min(220, Math.max(35, pt.y + offset)) };
    });
  }, [linePoints]);

  const ema20Path = useMemo(() => {
    return ema20Points.reduce((acc, pt, i) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      const prev = ema20Points[i - 1];
      const cpx = prev.x + (pt.x - prev.x) / 2;
      return `${acc} C ${cpx} ${prev.y}, ${cpx} ${pt.y}, ${pt.x} ${pt.y}`;
    }, '');
  }, [ema20Points]);

  // EMA 50 Calculation (Smooth Purple Trend Line)
  const ema50Points = useMemo(() => {
    return linePoints.map((pt, i) => {
      const offset = Math.cos(i * 0.35) * 16 + 12;
      return { x: pt.x, y: Math.min(220, Math.max(35, pt.y + offset)) };
    });
  }, [linePoints]);

  const ema50Path = useMemo(() => {
    return ema50Points.reduce((acc, pt, i) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      const prev = ema50Points[i - 1];
      const cpx = prev.x + (pt.x - prev.x) / 2;
      return `${acc} C ${cpx} ${prev.y}, ${cpx} ${pt.y}, ${pt.x} ${pt.y}`;
    }, '');
  }, [ema50Points]);

  // RSI 14-period Oscillator Data
  const rsiValues = useMemo(() => {
    const count = 30;
    const step = 740 / (count - 1);
    return Array.from({ length: count }, (_, i) => {
      const val = 50 + Math.sin(i * 0.5 + 1.2) * 22 + Math.cos(i * 0.9) * 8;
      const x = i * step;
      const y = 60 - ((val - 20) / 60) * 45; // map 20..80 range to 15..60px height
      return { x, y, val };
    });
  }, []);

  const rsiPath = useMemo(() => {
    return rsiValues.reduce((acc, pt, i) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      const prev = rsiValues[i - 1];
      const cpx = prev.x + (pt.x - prev.x) / 2;
      return `${acc} C ${cpx} ${prev.y}, ${cpx} ${pt.y}, ${pt.x} ${pt.y}`;
    }, '');
  }, [rsiValues]);

  const currentRSI = rsiValues[rsiValues.length - 1]?.val || 58.4;


  // 3. CANDLESTICK DATA FOR CANDLE MODE (Dense on 1D, tapering down on larger timeframes)
  const candleList: CandleData[] = useMemo(() => {
    const CANDLE_COUNTS: Record<string, number> = {
      '1D': 70,  // Sangat padat (persis seperti gambar referensi)
      '7D': 46,  // Cukup padat
      '1M': 32,  // Standar harian
      '3M': 24,  // Multi-day swings
      '1Y': 18,  // Mingguan
      'All': 14, // Bulanan makro
    };

    const totalCandles = CANDLE_COUNTS[timeframe] || 70;
    const chartWidth = 720;
    const startX = 15;
    const stepX = chartWidth / totalCandles;

    let curOpen = centerPrice * (1 - tfConfig.volatility * 0.5);

    return Array.from({ length: totalCandles }, (_, i) => {
      const x = startX + i * stepX;
      // Multi-wave simulation: fundamental trend + harmonic oscillation + micro noise
      const w1 = Math.sin(i * 0.18 + 0.4) * 0.45;
      const w2 = Math.cos(i * 0.45 + 1.2) * 0.35;
      const w3 = Math.sin(i * 0.95 + 2.1) * 0.20;
      const delta = (w1 + w2 + w3) * tfConfig.volatility * 0.7;

      const noise = (Math.sin(i * 3.7 + 0.5) * 0.5) * tfConfig.volatility * 0.3;
      const change = curOpen * (delta + noise);
      const close = curOpen + change;

      // Realistic high and low wicks
      const wickSpread = Math.abs(curOpen * (tfConfig.volatility * 0.4 + Math.abs(noise) * 0.6));
      let high = Math.max(curOpen, close) + wickSpread * (0.3 + Math.abs(Math.sin(i * 2.1)) * 0.7);
      let low = Math.min(curOpen, close) - wickSpread * (0.3 + Math.abs(Math.cos(i * 2.7)) * 0.7);
      let finalClose = close;

      const isLast = i >= totalCandles - 2;
      if (isLast) {
        const liveDelta = (Math.sin(liveTick * 1.8 + i) * 0.004 + Math.sin(liveTick * 3.4) * 0.002) * centerPrice;
        finalClose = close + liveDelta;
        high = Math.max(curOpen, finalClose) + wickSpread * (0.3 + Math.abs(Math.sin(i * 2.1)) * 0.7) + Math.abs(liveDelta) * 0.5;
        low = Math.min(curOpen, finalClose) - wickSpread * (0.3 + Math.abs(Math.cos(i * 2.7)) * 0.7) - Math.abs(liveDelta) * 0.5;
      }

      const isUp = finalClose >= curOpen;
      const volume = Math.abs(Math.sin(i * 1.5 + 0.8)) * 40 + 15;
      const dateIdx = Math.min(
        tfConfig.labels.length - 1,
        Math.floor((i / totalCandles) * tfConfig.labels.length)
      );

      const candle: CandleData = {
        x,
        open: curOpen,
        high,
        low,
        close: finalClose,
        volume,
        date: tfConfig.labels[dateIdx] || '21 Apr',
        isUp,
      };

      curOpen = close;
      return candle;
    });
  }, [centerPrice, tfConfig, timeframe, liveTick]);

  // Price Range & 6 Dynamic Y-Axis Price Levels
  const minPrice = useMemo(() => {
    const minLine = Math.min(...linePoints.map((p) => p.price));
    return minLine * 0.992;
  }, [linePoints]);

  const maxPrice = useMemo(() => {
    const maxLine = Math.max(...linePoints.map((p) => p.price));
    return maxLine * 1.008;
  }, [linePoints]);

  const priceRange = maxPrice - minPrice || 1;

  const yAxisLevels = useMemo(() => {
    const step = priceRange / 5;
    return Array.from({ length: 6 }, (_, i) => {
      const val = maxPrice - i * step;
      return `${config.prefix}${val.toLocaleString('en-US', {
        minimumFractionDigits: config.decimals > 2 ? 4 : 0,
        maximumFractionDigits: config.decimals > 2 ? 4 : 0,
      })}`;
    });
  }, [minPrice, maxPrice, priceRange, config]);

  // Interactive Hover Handler for Line Mode
  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!chartSvgRef.current || linePoints.length === 0) return;
    const rect = chartSvgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 740;

    let closestIdx = 0;
    let minDiff = Infinity;
    linePoints.forEach((pt, idx) => {
      const diff = Math.abs(pt.x - mouseX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    setHoveredPointIndex(closestIdx);
  };

  const activePoint = hoveredPointIndex !== null ? linePoints[hoveredPointIndex] : null;
  const activeCandle = hoveredCandleIndex !== null ? candleList[hoveredCandleIndex] : null;

  return (
    <div className="flex flex-col w-full bg-[#1F1E25] border border-white/5 rounded-3xl p-5 select-none transition-all">
      {/* Top Header Controls: Sub-Tabs, Price Selector, Mode Switcher, and Timeframe Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/5">
        {/* Left Sub-Tabs: Chart, Depth, Funding, Details */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center p-1 bg-[#26252E] border border-white/5 rounded-2xl text-xs font-semibold gap-1">
            {(['Chart', 'Depth', 'Funding', 'Details'] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`group relative px-3 py-1.5 rounded-xl overflow-hidden text-xs font-bold transition-colors duration-1000 cursor-pointer ${
                    isActive
                      ? 'bg-[#00E163] text-black font-bold shadow-sm'
                      : 'text-slate-400 hover:text-black'
                  }`}
                >
                  {!isActive && (
                    <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                  )}
                  <span className="relative z-10 transition-colors duration-1000">{tab}</span>
                </button>
              );
            })}
          </div>

          {/* Last Price / Mark / Index Dropdown Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsPriceSourceOpen(!isPriceSourceOpen)}
              className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#26252E] border border-white/5 overflow-hidden text-xs text-slate-300 hover:text-black font-semibold cursor-pointer transition-colors duration-1000"
            >
              <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
              <span className="relative z-10 transition-colors duration-1000">{priceSource}</span>
              <ArrowDown01Icon
                className={`relative z-10 w-3.5 h-3.5 text-slate-400 group-hover:text-black transition-all duration-1000 ${
                  isPriceSourceOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isPriceSourceOpen && (
              <div className="absolute left-0 top-10 w-36 bg-[#26252E] border border-white/10 rounded-xl shadow-2xl p-1.5 flex flex-col gap-1 z-50 backdrop-blur-xl">
                {(['Last Price', 'Mark Price', 'Index Price'] as const).map((src) => {
                  const isSelected = priceSource === src;
                  return (
                    <button
                      key={src}
                      onClick={() => {
                        setPriceSource(src);
                        setIsPriceSourceOpen(false);
                      }}
                      className={`group relative flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold overflow-hidden transition-colors duration-1000 cursor-pointer ${
                        isSelected
                          ? 'bg-[#00E163] text-black font-bold'
                          : 'text-slate-300 hover:text-black'
                      }`}
                    >
                      {!isSelected && (
                        <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                      )}
                      <span className="relative z-10 transition-colors duration-1000">{src}</span>
                      {isSelected && <span className="relative z-10 text-[10px]">✓</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Indicators Top Row + Timeframe & Mode Bottom Row (Stacked & Perfectly Aligned) */}
        <div className="flex flex-col items-end gap-2">
          {/* Top Row: Mini Compact RSI Status (when enabled) + Indicator Pills right above 1D 7D */}
          {activeTab === 'Chart' && (
            <div className="flex items-center gap-2">
              {/* Compact RSI (14) Status Widget with Mini Sparkline Wave */}
              {showRSI && (
                <div className="flex items-center gap-2 px-2.5 py-1 bg-[#18171E] border border-[#00E163]/30 rounded-xl text-[10px] font-mono-num animate-fade-in shadow-sm">
                  <span className="font-bold text-[#00E163]">RSI (14)</span>
                  <span className="text-white font-bold">{currentRSI.toFixed(1)}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${
                      currentRSI >= 70
                        ? 'bg-rose-500/20 text-rose-400'
                        : currentRSI <= 30
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-[#00E163]/15 text-[#00E163]'
                    }`}
                  >
                    {currentRSI >= 70 ? 'OVERBOUGHT' : currentRSI <= 30 ? 'OVERSOLD' : 'NEUTRAL'}
                  </span>

                  {/* Mini Sparkline */}
                  <div className="w-14 h-3 relative">
                    <svg className="w-full h-full" viewBox="0 0 56 12" preserveAspectRatio="none">
                      <line x1={0} y1={3} x2={56} y2={3} stroke="rgba(244,63,94,0.3)" strokeWidth="0.8" strokeDasharray="2 2" />
                      <line x1={0} y1={9} x2={56} y2={9} stroke="rgba(0,225,99,0.3)" strokeWidth="0.8" strokeDasharray="2 2" />
                      <path
                        d="M 0 6 Q 14 1, 28 6 T 56 6"
                        fill="none"
                        stroke="#00E163"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  <span className="text-slate-500 text-[8px]">70/30</span>
                </div>
              )}

              {/* Indicator Toggle Pills (EMA 20, EMA 50, RSI 14) */}
              <div className="flex items-center p-0.5 bg-[#26252E] border border-white/5 rounded-xl text-[10px] font-bold gap-1">
                <button
                  type="button"
                  onClick={() => setShowEMA20(!showEMA20)}
                  className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    showEMA20
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>EMA 20</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowEMA50(!showEMA50)}
                  className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    showEMA50
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span>EMA 50</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowRSI(!showRSI)}
                  className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    showRSI
                      ? 'bg-[#00E163]/20 text-[#00E163] border border-[#00E163]/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00E163]" />
                  <span>RSI (14)</span>
                </button>
              </div>
            </div>
          )}

          {/* Bottom Row: Mode Switcher & Timeframe Pills aligned together */}
          <div className="flex items-center gap-2">
            {activeTab === 'Chart' && (
              <div className="flex items-center p-1 bg-[#26252E] border border-white/5 rounded-2xl text-xs font-semibold gap-1">
                <button
                  onClick={() => setChartMode('Candle')}
                  className={`group relative min-w-[76px] px-5 py-1.5 rounded-xl overflow-hidden text-xs font-bold transition-colors duration-1000 cursor-pointer flex items-center justify-center ${
                    chartMode === 'Candle'
                      ? 'bg-[#00E163] text-black font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {chartMode !== 'Candle' && (
                    <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                  )}
                  <span className="relative z-10 transition-colors duration-1000">Candle</span>
                </button>

                <button
                  onClick={() => setChartMode('Line')}
                  className={`group relative min-w-[76px] px-5 py-1.5 rounded-xl overflow-hidden text-xs font-bold transition-colors duration-1000 cursor-pointer flex items-center justify-center ${
                    chartMode === 'Line'
                      ? 'bg-[#00E163] text-black font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {chartMode !== 'Line' && (
                    <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                  )}
                  <span className="relative z-10 transition-colors duration-1000">Line</span>
                </button>
              </div>
            )}

            {/* Timeframe Pills: 1D, 7D, 1M, 3M, 1Y, All */}
            <div className="flex items-center p-1 bg-[#26252E] border border-white/5 rounded-2xl text-xs font-bold gap-1">
              {(['1D', '7D', '1M', '3M', '1Y', 'All'] as const).map((tf) => {
                const isActive = timeframe === tf;
                return (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#00E163] text-black font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* DYNAMIC TAB VIEWS */}
      {activeTab === 'Chart' && (
        /* 1. MAIN PRICE CHART VIEW */
        <div className="relative w-full h-80 mt-3">
          {/* Y-Axis Price Levels aligned with dashed grid lines */}
          <div className="absolute left-0 top-0 h-[240px] flex flex-col justify-between text-[11px] font-mono-num text-slate-500 select-none pointer-events-none w-16">
            {yAxisLevels.map((lvl, idx) => (
              <span key={idx} className="truncate">
                {lvl}
              </span>
            ))}
          </div>

          {/* Chart SVG Graphic Area with overflow-visible for floating tooltip */}
          <div className="ml-16 h-full flex flex-col justify-between overflow-visible">
            <div className="relative flex-1 w-full overflow-visible rounded-xl">
              {/* Dashed Grid Lines (6 Levels) */}
              <svg
                className="absolute inset-0 w-full h-[240px] pointer-events-none overflow-hidden"
                viewBox="0 0 740 240"
                preserveAspectRatio="none"
              >
                {[0, 48, 96, 144, 192, 238].map((gridY, i) => (
                  <line
                    key={i}
                    x1={0}
                    y1={gridY}
                    x2={740}
                    y2={gridY}
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                ))}
              </svg>

              {/* LINE MODE (Ultra-Smooth Spline + Crosshair + Glowing Dot + Sleek Tooltip matching Gambar 1 & 2) */}
              {chartMode === 'Line' ? (
                <div className="relative w-full h-[240px] overflow-visible">
                  <svg
                    ref={chartSvgRef}
                    onMouseMove={handleSvgMouseMove}
                    onMouseLeave={() => setHoveredPointIndex(null)}
                    className="w-full h-[240px] overflow-hidden cursor-crosshair rounded-xl"
                    viewBox="0 0 740 240"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="analyticsLineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00E163" stopOpacity="0.38" />
                        <stop offset="60%" stopColor="#00E163" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="#00E163" stopOpacity="0.0" />
                      </linearGradient>
                      <filter id="glowNode" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#00E163" floodOpacity="0.8" />
                      </filter>
                    </defs>

                    {/* Gradient Area Fill */}
                    <path d={splineAreaPath} fill="url(#analyticsLineGrad)" />

                    {/* EMA 20 Overlay Path (Yellow) */}
                    {showEMA20 && (
                      <path
                        d={ema20Path}
                        fill="none"
                        stroke="#FBBF24"
                        strokeWidth="1.8"
                        strokeDasharray="4 2"
                        className="opacity-90"
                      />
                    )}

                    {/* EMA 50 Overlay Path (Purple) */}
                    {showEMA50 && (
                      <path
                        d={ema50Path}
                        fill="none"
                        stroke="#A855F7"
                        strokeWidth="1.8"
                        strokeDasharray="5 3"
                        className="opacity-80"
                      />
                    )}

                    {/* Main Spline Curve Stroke */}
                    <path
                      d={splinePath}
                      fill="none"
                      stroke="#00E163"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                    />

                    {/* Vertical Green Crosshair Guide Line (Gambar 2) */}
                    {activePoint && (
                      <line
                        x1={activePoint.x}
                        y1={0}
                        x2={activePoint.x}
                        y2={240}
                        stroke="#00E163"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                        className="opacity-80"
                      />
                    )}

                  </svg>

                  {/* 100% Geometrically Perfect Round Concentric Radar Target Node (Gambar 2 Target) */}
                  {activePoint && (
                    <div
                      style={{
                        left: `${(activePoint.x / 740) * 100}%`,
                        top: `${(activePoint.y / 240) * 100}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      className="absolute pointer-events-none z-20 flex items-center justify-center"
                    >
                      {/* 1. Outer Soft Green Radar Glow Aura (Perfect 36px circle) */}
                      <div className="absolute w-9 h-9 rounded-full bg-[#00E163]/15 animate-pulse shadow-[0_0_12px_rgba(0,225,99,0.3)]" />
                      {/* 2. Middle Concentric Green Ring (Perfect 22px circle) */}
                      <div className="absolute w-[22px] h-[22px] rounded-full bg-[#00E163]/30" />
                      {/* 3. Dark Collar Ring (Perfect 14px circle) */}
                      <div className="absolute w-3.5 h-3.5 rounded-full bg-[#131118]" />
                      {/* 4. Solid Bright Neon Green Inner Core Dot (Perfect 7px circle) */}
                      <div className="w-[7px] h-[7px] rounded-full bg-[#00E163] shadow-[0_0_8px_#00E163] relative z-10" />
                    </div>
                  )}

                  {/* Sleek Dark Tooltip matching Gambar 2 & 3 (Floats over boundary, never clipped) */}
                  {activePoint && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.1 }}
                      style={{
                        left: `${(activePoint.x / 740) * 100}%`,
                        top: `${activePoint.y}px`,
                        transform:
                          activePoint.x > 660
                            ? 'translate(-108%, -20%)'
                            : 'translate(12px, -20%)',
                      }}
                      className="absolute z-50 flex flex-col p-3 bg-[#1F1E25]/95 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-xl pointer-events-none min-w-[170px] w-max whitespace-nowrap font-mono-num text-xs"
                    >
                      <div className="flex justify-between items-center gap-4 text-[11px] mb-1.5">
                        <span className="text-slate-300 font-sans font-medium">Price:</span>
                        <span className="font-black text-[#00E163]">
                          ${activePoint.price.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center gap-4 text-[11px]">
                        <span className="text-slate-300 font-sans font-medium">Volume:</span>
                        <span className="font-extrabold text-[#00E163]">
                          {activePoint.volume}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                /* CANDLESTICK MODE (Bounded within card with volume histogram) */
                <div className="relative w-full h-[240px]">
                  <div className="relative w-full h-[200px] flex items-center justify-between px-2 overflow-hidden">
                    {candleList.map((c, idx) => {
                      const chartHeight = 185;
                      const highY = chartHeight - ((c.high - minPrice) / priceRange) * (chartHeight - 24);
                      const lowY = chartHeight - ((c.low - minPrice) / priceRange) * (chartHeight - 24);
                      const openY = chartHeight - ((c.open - minPrice) / priceRange) * (chartHeight - 24);
                      const closeY = chartHeight - ((c.close - minPrice) / priceRange) * (chartHeight - 24);

                      const bodyTop = Math.min(openY, closeY);
                      const bodyHeight = Math.max(Math.abs(openY - closeY), 2.5);
                      const candleBodyWidth = Math.max(2.5, Math.min(18, (720 / candleList.length) * 0.68));

                      return (
                        <div
                          key={idx}
                          onMouseEnter={() => setHoveredCandleIndex(idx)}
                          onMouseLeave={() => setHoveredCandleIndex(null)}
                          className="relative flex-1 h-full flex flex-col items-center justify-center cursor-pointer group"
                        >
                          {/* Wick */}
                          <div
                            style={{
                              top: `${Math.max(4, highY)}px`,
                              height: `${Math.max(lowY - highY, 3)}px`,
                            }}
                            className={`absolute w-[1px] md:w-[1.5px] ${
                              c.isUp ? 'bg-[#00E163]' : 'bg-[#FF5C77]'
                            } group-hover:w-[2px] transition-all`}
                          />

                          {/* Body */}
                          <div
                            style={{
                              top: `${Math.max(4, bodyTop)}px`,
                              height: `${bodyHeight}px`,
                              width: `${candleBodyWidth}px`,
                            }}
                            className={`absolute rounded-[1px] ${
                              c.isUp
                                ? 'bg-[#00E163] shadow-[0_0_4px_rgba(0,225,99,0.3)]'
                                : 'bg-[#FF5C77] shadow-[0_0_4px_rgba(255,92,119,0.3)]'
                            } group-hover:brightness-125 transition-all`}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Volume Histogram Indicator Bar at the Bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-10 flex items-end justify-between px-2 border-t border-white/5 pt-1 pointer-events-none">
                    {candleList.map((c, idx) => (
                      <div key={idx} className="flex-1 flex justify-center items-end h-full">
                        <div
                          style={{ height: `${Math.min(100, (c.volume / 60) * 100)}%` }}
                          className={`w-1.5 rounded-t-[2px] ${
                            c.isUp ? 'bg-[#00E163]/30' : 'bg-[#362227]'
                          }`}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Hover Tooltip Card for Candle Mode */}
                  {activeCandle && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.12 }}
                      style={{
                        left: `${Math.max(10, Math.min(activeCandle.x - 70, 520))}px`,
                        top: '10px',
                      }}
                      className="absolute z-30 flex flex-col p-3 bg-[#26252E]/95 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-md pointer-events-none min-w-[160px] text-xs font-mono-num"
                    >
                      <div className="text-[10px] font-bold text-slate-400 border-b border-white/10 pb-1 mb-1.5 flex justify-between">
                        <span>{activeCandle.date}</span>
                        <span className={activeCandle.isUp ? 'text-[#00E163]' : 'text-[#FF5C77]'}>
                          {activeCandle.isUp ? 'BULLISH' : 'BEARISH'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                        <span className="text-slate-400">Open:</span>
                        <span className="text-white text-right">${activeCandle.open.toFixed(2)}</span>
                        <span className="text-slate-400">High:</span>
                        <span className="text-[#00E163] text-right">${activeCandle.high.toFixed(2)}</span>
                        <span className="text-slate-400">Low:</span>
                        <span className="text-[#FF5C77] text-right">${activeCandle.low.toFixed(2)}</span>
                        <span className="text-slate-400">Close:</span>
                        <span className="text-white font-bold text-right">${activeCandle.close.toFixed(2)}</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* X-Axis Date Labels matching active Timeframe (Gambar 1: 1 Apr - 7 Apr) */}
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-2 border-t border-white/5">
              {tfConfig.labels.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Depth' && (
        /* 2. MARKET DEPTH VISUAL CHART (Binance / Bybit Standard) */
        <div className="flex flex-col w-full h-80 mt-3 p-4 bg-[#26252E] rounded-2xl">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 text-xs">
            <span className="font-bold text-white">Visual Market Depth</span>
            <span className="text-slate-400 font-mono">
              Mid Market Price:{' '}
              <strong className="text-[#00E163]">
                ${centerPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </strong>
            </span>
          </div>

          <div className="relative flex-1 w-full flex items-center justify-center">
            {/* SVG Visual Depth Curve */}
            <svg className="w-full h-full" viewBox="0 0 700 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="depthBidsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00E163" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#00E163" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="depthAsksGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF5C77" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#FF5C77" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Bids Depth Curve (Green) */}
              <path d="M 0 30 Q 180 60 340 190 L 340 200 L 0 200 Z" fill="url(#depthBidsGrad)" />
              <path d="M 0 30 Q 180 60 340 190" fill="none" stroke="#00E163" strokeWidth="2.5" />

              {/* Asks Depth Curve (Red) */}
              <path d="M 360 190 Q 520 60 700 30 L 700 200 L 360 200 Z" fill="url(#depthAsksGrad)" />
              <path d="M 360 190 Q 520 60 700 30" fill="none" stroke="#FF5C77" strokeWidth="2.5" />

              {/* Center Spread Line */}
              <line
                x1="350"
                y1="20"
                x2="350"
                y2="195"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono-num text-slate-400 pt-2 border-t border-white/5">
            <span className="text-[#00E163]">Total Bids: $148.2M</span>
            <span className="text-slate-300">Spread: 0.10 (0.01%)</span>
            <span className="text-[#FF5C77]">Total Asks: $152.6M</span>
          </div>
        </div>
      )}

      {activeTab === 'Funding' && (
        /* 3. FUNDING RATE MODULE & SETTLEMENT COUNTDOWN */
        <div className="flex flex-col w-full h-80 mt-3 p-4 bg-[#26252E] rounded-2xl overflow-y-auto font-mono-num text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
            <div className="flex items-center gap-2">
              <Clock01Icon className="w-4 h-4 text-[#00E163]" />
              <span className="font-bold text-white font-heading">Funding Rate & 8H Settlement</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Next Funding:</span>
              <span className="px-2.5 py-0.5 rounded bg-[#00E163]/15 text-[#00E163] font-bold">
                04:22:15
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-3 rounded-xl bg-[#1F1E25] border border-white/5">
              <span className="text-[10px] text-slate-500 block font-sans">Predicted Rate</span>
              <span className="text-sm font-extrabold text-[#00E163]">+0.0100%</span>
            </div>
            <div className="p-3 rounded-xl bg-[#1F1E25] border border-white/5">
              <span className="text-[10px] text-slate-500 block font-sans">Current Interval</span>
              <span className="text-sm font-extrabold text-white">8 Hours</span>
            </div>
            <div className="p-3 rounded-xl bg-[#1F1E25] border border-white/5">
              <span className="text-[10px] text-slate-500 block font-sans">Annualized Rate</span>
              <span className="text-sm font-extrabold text-slate-200">+10.95%</span>
            </div>
          </div>

          {/* Historical Funding Table */}
          <span className="text-[11px] font-bold text-slate-400 mb-1.5 block">
            Historical Settlements
          </span>
          <div className="flex flex-col space-y-1">
            {[
              { time: '2026-09-01 16:00:00', rate: '+0.0100%', mark: '$3,354.20' },
              { time: '2026-09-01 08:00:00', rate: '+0.0094%', mark: '$3,348.80' },
              { time: '2026-09-01 00:00:00', rate: '+0.0105%', mark: '$3,362.10' },
              { time: '2026-08-31 16:00:00', rate: '+0.0088%', mark: '$3,320.50' },
            ].map((f, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-1.5 px-2.5 rounded-lg bg-[#1F1E25] text-[11px]"
              >
                <span className="text-slate-400">{f.time}</span>
                <span className="text-[#00E163] font-bold">{f.rate}</span>
                <span className="text-slate-300">{f.mark}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Details' && (
        /* 4. PERPETUAL CONTRACT SPECIFICATIONS */
        <div className="flex flex-col w-full h-80 mt-3 p-4 bg-[#26252E] rounded-2xl overflow-y-auto text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-white/5 mb-3">
            <InformationCircleIcon className="w-4 h-4 text-[#00E163]" />
            <span className="font-bold text-white font-heading">Contract Specifications</span>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono-num text-[11px]">
            <div className="flex justify-between p-2.5 bg-[#1F1E25] rounded-xl">
              <span className="text-slate-400 font-sans">Symbol:</span>
              <span className="font-bold text-white">{selectedSymbol} Perpetual</span>
            </div>
            <div className="flex justify-between p-2.5 bg-[#1F1E25] rounded-xl">
              <span className="text-slate-400 font-sans">Settlement Asset:</span>
              <span className="font-bold text-white">USDT</span>
            </div>
            <div className="flex justify-between p-2.5 bg-[#1F1E25] rounded-xl">
              <span className="text-slate-400 font-sans">Contract Size:</span>
              <span className="font-bold text-white">1 {config.unit}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-[#1F1E25] rounded-xl">
              <span className="text-slate-400 font-sans">Tick Size:</span>
              <span className="font-bold text-white">{config.tickSize}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-[#1F1E25] rounded-xl">
              <span className="text-slate-400 font-sans">Max Leverage:</span>
              <span className="font-bold text-[#00E163]">100x</span>
            </div>
            <div className="flex justify-between p-2.5 bg-[#1F1E25] rounded-xl">
              <span className="text-slate-400 font-sans">Maintenance Margin:</span>
              <span className="font-bold text-white">0.50%</span>
            </div>
            <div className="flex justify-between p-2.5 bg-[#1F1E25] rounded-xl">
              <span className="text-slate-400 font-sans">Price Index:</span>
              <span className="font-bold text-white">Binance / OKX / Coinbase Avg</span>
            </div>
            <div className="flex justify-between p-2.5 bg-[#1F1E25] rounded-xl">
              <span className="text-slate-400 font-sans">Trading Hours:</span>
              <span className="font-bold text-[#00E163]">24/7 Continuous</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
