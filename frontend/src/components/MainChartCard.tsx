'use client';

import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTradingStore } from '@/store/useTradingStore';
import { MarketIcon } from '@/components/MarketIcon';
import { ASSET_REGISTRY } from '@/lib/assetConfig';

type Timeframe = '1D' | '7D' | '1M' | '3M' | '1Y' | 'All';
type ChartType = 'Line' | 'Candle';

interface DataPoint {
  x: number;
  y: number;
  price: number;
  volume: string;
  label: string;
}

interface CandlePoint {
  x: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: string;
  date: string;
  isUp: boolean;
}

const TIMEFRAME_CONFIG: Record<
  Timeframe,
  { labels: string[]; volatility: number; multiplier: number[]; volumeScale: string }
> = {
  '1D': {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
    volatility: 0.012,
    multiplier: [0.992, 0.995, 0.998, 1.002, 0.999, 1.005, 1.008, 1.012, 1.009, 1.018, 1.015, 1.022, 1.025],
    volumeScale: 'M',
  },
  '7D': {
    labels: ['1 Apr', '2 Apr', '3 Apr', '4 Apr', '5 Apr', '6 Apr', '7 Apr'],
    volatility: 0.038,
    multiplier: [0.964, 0.975, 0.992, 1.018, 1.042, 1.035, 1.012, 0.982, 0.958, 0.942, 0.965, 0.995, 1.00],
    volumeScale: 'B',
  },
  '1M': {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    volatility: 0.08,
    multiplier: [0.91, 0.93, 0.96, 0.94, 0.99, 1.02, 0.98, 1.04, 1.02, 1.07, 1.05, 1.11],
    volumeScale: 'B',
  },
  '3M': {
    labels: ['Jan', 'Feb', 'Mar'],
    volatility: 0.14,
    multiplier: [0.85, 0.88, 0.94, 0.91, 0.97, 1.03, 1.01, 1.08, 1.05, 1.12, 1.10, 1.18],
    volumeScale: 'B',
  },
  '1Y': {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    volatility: 0.28,
    multiplier: [0.72, 0.78, 0.84, 0.81, 0.89, 0.96, 0.93, 1.05, 1.02, 1.15, 1.12, 1.28],
    volumeScale: 'B',
  },
  All: {
    labels: ['2021', '2022', '2023', '2024', '2025', '2026'],
    volatility: 0.55,
    multiplier: [0.45, 0.58, 0.52, 0.68, 0.62, 0.78, 0.74, 0.92, 0.88, 1.05, 1.02, 1.35],
    volumeScale: 'B',
  },
};

export const MainChartCard: React.FC = () => {
  const { selectedSymbol, tickers } = useTradingStore();
  const [timeframe, setTimeframe] = useState<Timeframe>('7D');
  const [chartType, setChartType] = useState<ChartType>('Candle');
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [hoveredCandleIndex, setHoveredCandleIndex] = useState<number | null>(null);
  const [movementMode, setMovementMode] = useState<'USD' | 'PCT'>('USD');
  const [volumeMode, setVolumeMode] = useState<'USD' | 'BASE'>('USD');
  const [liveTick, setLiveTick] = useState(0);

  // Real-time ticking engine: continuously breathes and pulses matching Lightning & ProCharts
  React.useEffect(() => {
    const interval = setInterval(() => {
      setLiveTick((prev) => (prev + 1) % 10000);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const svgRef = useRef<SVGSVGElement>(null);

  const currentTicker = tickers[selectedSymbol];
  const meta = ASSET_REGISTRY[selectedSymbol] || {
    name: selectedSymbol,
    iconBg: 'bg-[#F7931A]',
    icon: '₿',
    defaultPrice: 75479,
    decimals: 2,
    prefix: '$',
  };

  const rawBasePrice = currentTicker?.price ?? meta.defaultPrice;
  const livePriceOffset = (Math.sin(liveTick * 1.5) * 0.0016 + Math.sin(liveTick * 3.3) * 0.0008) * rawBasePrice;
  const centerPrice = Number((rawBasePrice + livePriceOffset).toFixed(meta.decimals));

  const changePercent = currentTicker?.change_percent ?? 2.40;
  const isPositive = changePercent >= 0;

  const tfConfig = TIMEFRAME_CONFIG[timeframe];

  // 1. Generate Dynamic Spline Line Points covering full 0 to 800 width
  const linePoints: DataPoint[] = useMemo(() => {
    const totalPoints = tfConfig.multiplier.length;
    const width = 800;
    const startX = 0;
    const stepX = width / (totalPoints - 1);

    return tfConfig.multiplier.map((mult, i) => {
      const isLast = i === totalPoints - 1;
      const liveWave = isLast
        ? (Math.sin(liveTick * 1.5) * 0.004 + Math.sin(liveTick * 3.2) * 0.002) * centerPrice
        : 0;

      const ptPrice = centerPrice * mult + liveWave;
      const x = startX + i * stepX;
      const minMult = Math.min(...tfConfig.multiplier);
      const maxMult = Math.max(...tfConfig.multiplier);
      const normalized = (mult - minMult) / (maxMult - minMult || 1);
      const y = 165 - normalized * 130 - (isLast ? (liveWave / (centerPrice * 0.04)) * 12 : 0);

      const volumeVal = (Math.abs(Math.sin(i * 1.5 + 1)) * 30 + 10).toFixed(1);
      const label = tfConfig.labels[Math.floor((i / (totalPoints - 1)) * (tfConfig.labels.length - 1))] || '';

      return {
        x,
        y: Math.max(30, Math.min(185, y)),
        price: ptPrice,
        volume: `$${volumeVal}${tfConfig.volumeScale}`,
        label,
      };
    });
  }, [centerPrice, tfConfig, liveTick]);

  // 2. SVG Path Generation for Spline Curve
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
    return `${splinePath} L ${lastX} 200 L ${firstX} 200 Z`;
  }, [splinePath, linePoints]);

  // 3. Generate Realistic Japanese Candlestick Data matching TradeView reference curves
  const candlePoints: CandlePoint[] = useMemo(() => {
    const CANDLE_COUNTS: Record<Timeframe, number> = {
      '1D': 60,
      '7D': 48,
      '1M': 36,
      '3M': 28,
      '1Y': 20,
      'All': 16,
    };

    const numCandles = CANDLE_COUNTS[timeframe] || 48;
    const chartWidth = 760;
    const startX = 15;
    const stepX = chartWidth / numCandles;

    // Harmonic wave profile matching the reference image curve
    return Array.from({ length: numCandles }, (_, i) => {
      const x = startX + i * stepX;
      const progress = i / (numCandles - 1);

      // S-curve swing matching reference (rise -> peak -> dip -> recovery)
      let waveFactor = 0;
      if (progress <= 0.35) {
        // Ascending to peak at 3 Apr
        waveFactor = -0.035 + (progress / 0.35) * 0.075;
      } else if (progress <= 0.72) {
        // Descending to trough at 5-6 Apr
        const subP = (progress - 0.35) / 0.37;
        waveFactor = 0.040 - subP * 0.088;
      } else {
        // Ascending surge to final 7 Apr price
        const subP = (progress - 0.72) / 0.28;
        waveFactor = -0.048 + subP * 0.048;
      }

      const microNoise = Math.sin(i * 1.8) * 0.004;
      const baseMid = centerPrice * (1.0 + waveFactor + microNoise);

      // Determine bar trend
      const isUp = (i % 7 !== 2 && i % 7 !== 5 && progress < 0.35) ||
                   (progress >= 0.72 && i % 4 !== 1) ||
                   (progress > 0.35 && progress < 0.72 ? (i % 5 === 2) : true);

      const barSpread = centerPrice * 0.006 * (0.6 + Math.abs(Math.sin(i * 2.3)) * 0.8);
      const open = isUp ? baseMid - barSpread * 0.5 : baseMid + barSpread * 0.5;
      let close = isUp ? baseMid + barSpread * 0.5 : baseMid - barSpread * 0.5;

      // Live micro-tick movement on the latest 2 candles
      const isLast = i >= numCandles - 2;
      const liveDelta = isLast
        ? (Math.sin(liveTick * 1.8 + i) * 0.004 + Math.sin(liveTick * 3.4) * 0.002) * centerPrice
        : 0;

      close = close + liveDelta;

      const wickUpper = Math.max(open, close) + barSpread * (0.2 + Math.abs(Math.sin(i * 3.1)) * 0.6) + (isLast ? Math.abs(liveDelta) * 0.6 : 0);
      const wickLower = Math.min(open, close) - barSpread * (0.2 + Math.abs(Math.cos(i * 2.7)) * 0.6) - (isLast ? Math.abs(liveDelta) * 0.6 : 0);

      return {
        x,
        open,
        high: wickUpper,
        low: wickLower,
        close,
        volume: `$${(Math.abs(Math.sin(i * 1.2)) * 25 + 8).toFixed(1)}${tfConfig.volumeScale}`,
        date: tfConfig.labels[Math.floor((i / numCandles) * tfConfig.labels.length)] || '',
        isUp: close >= open,
      };
    });
  }, [centerPrice, tfConfig, timeframe, liveTick]);

  // Dynamic Y-Axis Price Levels (6 Levels matching grid lines)
  const yAxisLevels = useMemo(() => {
    const minMult = Math.min(...tfConfig.multiplier);
    const maxMult = Math.max(...tfConfig.multiplier);
    const minP = centerPrice * (minMult * 0.98);
    const maxP = centerPrice * (maxMult * 1.02);
    const step = (maxP - minP) / 5;

    return Array.from({ length: 6 }, (_, i) => {
      const val = maxP - i * step;
      return `${meta.prefix}${val.toLocaleString('en-US', {
        minimumFractionDigits: meta.decimals > 2 ? 4 : 0,
        maximumFractionDigits: meta.decimals > 2 ? 4 : 0,
      })}`;
    });
  }, [centerPrice, tfConfig, meta]);

  const activePoint = hoveredPointIndex !== null ? linePoints[hoveredPointIndex] : null;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement | SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 800;
    const mouseX = Math.max(0, Math.min(800, rawX));

    let closestIdx = 0;
    let minDistance = Infinity;
    linePoints.forEach((pt, idx) => {
      const dist = Math.abs(pt.x - mouseX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = idx;
      }
    });

    setHoveredPointIndex(closestIdx);
  };

  return (
    <div className="flex flex-col w-full bg-[#1F1E25] border border-white/5 rounded-3xl p-5 select-none transition-all">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        {/* Left: Big Asset Logo + Name & Price */}
        <div className="flex items-center gap-3.5">
          <MarketIcon symbol={selectedSymbol} size="lg" />

          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-white font-heading tracking-wide">
              {meta.name}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xl font-black text-white font-mono-num">
                {meta.prefix}
                {centerPrice.toLocaleString('en-US', {
                  minimumFractionDigits: meta.decimals,
                  maximumFractionDigits: meta.decimals,
                })}
              </span>
              <span
                className={`flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-full font-mono-num ${
                  isPositive ? 'bg-[#00E163]/15 text-[#00E163]' : 'bg-[#362227] text-[#FF5C77]'
                }`}
              >
                {isPositive ? '▲' : '▼'} {Math.abs(changePercent).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Right: Unified Single Connected Card with 2 Interactive Clickable Sub-Buttons */}
        <div className="flex items-center p-1 bg-[#26252E] border border-white/5 rounded-2xl gap-1 self-start sm:self-auto">
          {/* 24 Hours Movement Button */}
          <button
            type="button"
            onClick={() => setMovementMode((prev) => (prev === 'USD' ? 'PCT' : 'USD'))}
            title="Klik untuk ubah tampilan USD / Persentase"
            className="group relative flex flex-col text-left px-3.5 py-1.5 rounded-xl overflow-hidden transition-colors duration-1000 cursor-pointer select-none"
          >
            <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />

            <span
              className={`relative z-10 text-xs font-black font-mono-num transition-colors duration-1000 ${
                isPositive
                  ? 'text-[#00E163] group-hover:text-black'
                  : 'text-[#FF5C77] group-hover:text-black'
              }`}
            >
              {movementMode === 'USD' ? (
                <>
                  {isPositive ? '+' : '-'}
                  {meta.prefix}
                  {(centerPrice * Math.abs(changePercent) * 0.01).toLocaleString('en-US', {
                    minimumFractionDigits: meta.decimals,
                    maximumFractionDigits: meta.decimals,
                  })}
                </>
              ) : (
                <>
                  {isPositive ? '+' : '-'}
                  {Math.abs(changePercent).toFixed(2)}%
                </>
              )}
            </span>
            <span className="relative z-10 text-[10px] text-slate-400 font-medium group-hover:text-black transition-colors duration-1000">
              {movementMode === 'USD' ? '24 Hours Movement' : '24H % Change'}
            </span>
          </button>

          <div className="w-[1px] h-6 bg-white/10 my-auto" />

          {/* 24 Hours Volume Button */}
          <button
            type="button"
            onClick={() => setVolumeMode((prev) => (prev === 'USD' ? 'BASE' : 'USD'))}
            title="Klik untuk ubah tampilan USD / Volume Aset"
            className="group relative flex flex-col text-left px-3.5 py-1.5 rounded-xl overflow-hidden transition-colors duration-1000 cursor-pointer select-none"
          >
            <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />

            <span className="relative z-10 text-xs font-black text-white group-hover:text-black font-mono-num transition-colors duration-1000">
              {volumeMode === 'USD' ? (
                `$${(27965324755).toLocaleString('en-US')}`
              ) : (
                `${Math.round(27965324755 / centerPrice).toLocaleString('en-US')} ${meta.name.split('/')[0].trim()}`
              )}
            </span>
            <span className="relative z-10 text-[10px] text-slate-400 font-medium group-hover:text-black transition-colors duration-1000">
              {volumeMode === 'USD' ? '24 Hours Volume' : '24H Base Vol'}
            </span>
          </button>
        </div>
      </div>

      {/* Sub-Header Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3">
        {/* Timeframe Selector */}
        <div className="flex items-center p-1 bg-[#26252E] border border-white/5 rounded-2xl text-xs font-bold gap-1 overflow-x-auto max-w-full">
          {(['1D', '7D', '1M', '3M', '1Y', 'All'] as const).map((tf) => {
            const isActive = timeframe === tf;
            return (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`group relative px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-[#00E163] text-black font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="relative z-10">{tf}</span>
              </button>
            );
          })}
        </div>

        {/* Line vs Candle Toggle Pill Switcher */}
        <div className="flex items-center p-1 bg-[#26252E] border border-white/5 rounded-2xl text-xs font-semibold gap-1">
          <button
            onClick={() => setChartType('Line')}
            className={`group relative px-4 py-1.5 rounded-xl overflow-hidden text-xs font-bold transition-colors duration-1000 cursor-pointer ${
              chartType === 'Line'
                ? 'bg-[#00E163] text-black font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {chartType !== 'Line' && (
              <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
            )}
            <span className="relative z-10 transition-colors duration-1000">Line</span>
          </button>

          <button
            onClick={() => setChartType('Candle')}
            className={`group relative px-4 py-1.5 rounded-xl overflow-hidden text-xs font-bold transition-colors duration-1000 cursor-pointer ${
              chartType === 'Candle'
                ? 'bg-[#00E163] text-black font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {chartType !== 'Candle' && (
              <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
            )}
            <span className="relative z-10 transition-colors duration-1000">Candle</span>
          </button>
        </div>
      </div>

      {/* Interactive Chart Canvas Area */}
      <div className="relative w-full h-64 mt-2">
        <div className="absolute left-0 top-0 h-[190px] flex flex-col justify-between text-[11px] font-mono-num text-slate-500 select-none pointer-events-none w-16">
          {yAxisLevels.map((lvl, idx) => (
            <span key={idx} className="truncate">{lvl}</span>
          ))}
        </div>

        <div className="ml-16 h-full flex flex-col justify-between">
          <div className="relative flex-1 w-full overflow-visible">
            {chartType === 'Line' ? (
              <svg
                ref={svgRef}
                onMouseEnter={handleMouseMove}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoveredPointIndex(null)}
                className="w-full h-full overflow-visible cursor-crosshair"
                viewBox="0 0 800 200"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="chartGreenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00E163" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#00E163" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {[0, 36, 72, 108, 144, 180].map((gridY, i) => (
                  <line
                    key={i}
                    x1={0}
                    y1={gridY}
                    x2={800}
                    y2={gridY}
                    stroke="rgba(255, 255, 255, 0.06)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                ))}

                <path d={splineAreaPath} fill="url(#chartGreenGrad)" />

                <path
                  d={splinePath}
                  fill="none"
                  stroke="#00E163"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {activePoint && (
                  <line
                    x1={activePoint.x}
                    y1={0}
                    x2={activePoint.x}
                    y2={200}
                    stroke="#00E163"
                    strokeWidth="1.5"
                    className="opacity-70"
                  />
                )}
              </svg>
            ) : (
              /* Candlestick Chart Layer */
              chartType === 'Candle' && (
                <div className="relative w-full h-[200px] flex items-center justify-between px-3 overflow-hidden">
                  {candlePoints.map((c, idx) => {
                    const minPrice = Math.min(...candlePoints.map((p) => p.low));
                    const maxPrice = Math.max(...candlePoints.map((p) => p.high));
                    const candleHeight = 185;
                    const range = maxPrice - minPrice || 1;

                    const highY = candleHeight - ((c.high - minPrice) / range) * (candleHeight - 24);
                    const lowY = candleHeight - ((c.low - minPrice) / range) * (candleHeight - 24);
                    const openY = candleHeight - ((c.open - minPrice) / range) * (candleHeight - 24);
                    const closeY = candleHeight - ((c.close - minPrice) / range) * (candleHeight - 24);

                    const bodyTop = Math.min(openY, closeY);
                    const bodyHeight = Math.max(Math.abs(openY - closeY), 2.5);
                    const candleBodyWidth = Math.max(2.5, Math.min(18, (740 / candlePoints.length) * 0.68));

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
              )
            )}

            {chartType === 'Line' && activePoint && (
              <div
                style={{
                  left: `${(activePoint.x / 800) * 100}%`,
                  top: `${(activePoint.y / 200) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                className="absolute pointer-events-none z-10 flex items-center justify-center"
              >
                {/* 1. Large Faint Green Radar Glow Aura */}
                <div className="absolute w-9 h-9 rounded-full bg-[#00E163]/12 animate-pulse" />
                {/* 2. Middle Concentric Green Ring */}
                <div className="absolute w-6 h-6 rounded-full bg-[#00E163]/30" />
                {/* 3. Dark Circular Collar */}
                <div className="absolute w-3.5 h-3.5 rounded-full bg-[#131118]" />
                {/* 4. Solid Bright Neon Green Inner Core Dot */}
                <div className="w-2 h-2 rounded-full bg-[#00E163] shadow-[0_0_8px_#00E163] relative z-10" />
              </div>
            )}

            {chartType === 'Line' && activePoint && (
              <motion.div
                key={hoveredPointIndex}
                initial={{ opacity: 0, scale: 0.95, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.12 }}
                style={{
                  left: `${(activePoint.x / 800) * 100}%`,
                  top: `${(activePoint.y / 200) * 100}%`,
                  transform:
                    activePoint.y < 65
                      ? activePoint.x < 100
                        ? 'translate(10%, 25%)'
                        : activePoint.x > 700
                        ? 'translate(-110%, 25%)'
                        : 'translate(15%, 25%)'
                      : activePoint.x < 100
                      ? 'translate(10%, -115%)'
                      : activePoint.x > 700
                      ? 'translate(-110%, -115%)'
                      : 'translate(15%, -115%)',
                }}
                className="absolute z-30 flex flex-col p-3 bg-[#26252E]/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-md pointer-events-none min-w-[135px]"
              >
                <div className="flex items-center justify-between text-xs font-mono-num gap-3">
                  <span className="text-slate-400 text-[11px]">Price:</span>
                  <span className="font-extrabold text-[#00E163]">
                    {meta.prefix}
                    {activePoint.price.toLocaleString('en-US', {
                      minimumFractionDigits: meta.decimals,
                      maximumFractionDigits: meta.decimals,
                    })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono-num mt-1 gap-3">
                  <span className="text-slate-400 text-[11px]">Volume:</span>
                  <span className="font-extrabold text-[#00E163]">{activePoint.volume}</span>
                </div>
              </motion.div>
            )}

            {chartType === 'Candle' && hoveredCandleIndex !== null && candlePoints[hoveredCandleIndex] && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                style={{
                  left: `${Math.max(10, Math.min(candlePoints[hoveredCandleIndex].x - 80, 580))}px`,
                  top: '10px',
                }}
                className="absolute z-30 flex flex-col p-3 bg-[#26252E]/95 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-md pointer-events-none min-w-[160px] text-xs font-mono-num"
              >
                <div className="text-[10px] font-bold text-slate-400 border-b border-white/10 pb-1 mb-1.5 flex justify-between">
                  <span>Candle Details</span>
                  <span className={candlePoints[hoveredCandleIndex].isUp ? 'text-[#00E163]' : 'text-[#FF5C77]'}>
                    {candlePoints[hoveredCandleIndex].isUp ? 'BULLISH' : 'BEARISH'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                  <span className="text-slate-400">Open:</span>
                  <span className="text-white text-right">
                    {meta.prefix}
                    {candlePoints[hoveredCandleIndex].open.toLocaleString('en-US', {
                      minimumFractionDigits: meta.decimals,
                      maximumFractionDigits: meta.decimals,
                    })}
                  </span>

                  <span className="text-slate-400">High:</span>
                  <span className="text-[#00E163] text-right">
                    {meta.prefix}
                    {candlePoints[hoveredCandleIndex].high.toLocaleString('en-US', {
                      minimumFractionDigits: meta.decimals,
                      maximumFractionDigits: meta.decimals,
                    })}
                  </span>

                  <span className="text-slate-400">Low:</span>
                  <span className="text-[#FF5C77] text-right">
                    {meta.prefix}
                    {candlePoints[hoveredCandleIndex].low.toLocaleString('en-US', {
                      minimumFractionDigits: meta.decimals,
                      maximumFractionDigits: meta.decimals,
                    })}
                  </span>

                  <span className="text-slate-400">Close:</span>
                  <span className="text-white font-bold text-right">
                    {meta.prefix}
                    {candlePoints[hoveredCandleIndex].close.toLocaleString('en-US', {
                      minimumFractionDigits: meta.decimals,
                      maximumFractionDigits: meta.decimals,
                    })}
                  </span>

                  <span className="text-slate-400">Vol:</span>
                  <span className="text-white text-right">{candlePoints[hoveredCandleIndex].volume}</span>
                </div>
              </motion.div>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-2 border-t border-white/5">
            {tfConfig.labels.map((lbl, idx) => (
              <span key={idx}>{lbl}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
