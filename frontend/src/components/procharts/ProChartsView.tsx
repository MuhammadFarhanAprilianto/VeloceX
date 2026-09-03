'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  HistogramData,
  ColorType,
  CrosshairMode,
  LineStyle,
  Time,
} from 'lightweight-charts';
import {
  Search01Icon,
  ArrowDown01Icon,
  Tick01Icon,
  FlashIcon,
  TradeUpIcon,
  Cancel01Icon,
  SparklesIcon,
  Layers01Icon,
} from 'hugeicons-react';
import { useTradingStore } from '@/store/useTradingStore';
import { MarketIcon } from '@/components/MarketIcon';

interface ProAsset {
  id: string;
  symbol: string;
  name: string;
  category: 'indices' | 'crypto' | 'forex' | 'cfd';
  price: number;
  change: number;
  changePct: number;
  high24h: number;
  low24h: number;
  volume: string;
  decimals: number;
  prefix: string;
  binanceSymbol?: string;
}

export const PRO_ASSETS: ProAsset[] = [
  // 1. INDICES (3 Aset)
  { id: 'SPX', symbol: 'SPX500', name: 'S&P 500 Index', category: 'indices', price: 5648.40, change: 35.13, changePct: 0.46, high24h: 5665.00, low24h: 5580.00, volume: '2.84B', decimals: 2, prefix: '$' },
  { id: 'NDQ', symbol: 'NAS100', name: 'Nasdaq 100', category: 'indices', price: 19720.50, change: 66.11, changePct: 0.23, high24h: 19810.00, low24h: 19340.00, volume: '3.41B', decimals: 2, prefix: '$' },
  { id: 'DJI', symbol: 'US30', name: 'Dow Jones 30', category: 'indices', price: 41250.00, change: 295.05, changePct: 0.56, high24h: 41380.00, low24h: 40850.00, volume: '1.95B', decimals: 2, prefix: '$' },

  // 2. CRYPTO (6 Aset) - Direct Live Binance API
  { id: 'BTC', symbol: 'BTCUSDT', name: 'Bitcoin', category: 'crypto', price: 75479.00, change: 1811.50, changePct: 2.40, high24h: 76200.00, low24h: 71800.00, volume: '27.96B', decimals: 2, prefix: '$', binanceSymbol: 'BTCUSDT' },
  { id: 'ETH', symbol: 'ETHUSDT', name: 'Ethereum', category: 'crypto', price: 4149.74, change: 75.80, changePct: 1.86, high24h: 4210.00, low24h: 3980.00, volume: '14.80B', decimals: 2, prefix: '$', binanceSymbol: 'ETHUSDT' },
  { id: 'SOL', symbol: 'SOLUSDT', name: 'Solana', category: 'crypto', price: 175.03, change: 3.32, changePct: 1.94, high24h: 178.50, low24h: 154.20, volume: '6.50B', decimals: 2, prefix: '$', binanceSymbol: 'SOLUSDT' },
  { id: 'BNB', symbol: 'BNBUSDT', name: 'BNB Chain', category: 'crypto', price: 614.35, change: 30.40, changePct: 5.20, high24h: 622.00, low24h: 598.00, volume: '2.80B', decimals: 2, prefix: '$', binanceSymbol: 'BNBUSDT' },
  { id: 'LTC', symbol: 'LTCUSDT', name: 'Litecoin', category: 'crypto', price: 94.92, change: 20.10, changePct: 26.83, high24h: 96.40, low24h: 89.80, volume: '1.40B', decimals: 2, prefix: '$', binanceSymbol: 'LTCUSDT' },
  { id: 'ADA', symbol: 'ADAUSDT', name: 'Cardano', category: 'crypto', price: 0.5620, change: 0.06, changePct: 12.04, high24h: 0.5840, low24h: 0.5520, volume: '954M', decimals: 4, prefix: '$', binanceSymbol: 'ADAUSDT' },

  // 3. COMMODITIES & CFD (3 Aset)
  { id: 'GOLD', symbol: 'XAUUSD', name: 'CFDs on Gold (US$ / OZ)', category: 'cfd', price: 2514.80, change: 34.68, changePct: 0.79, high24h: 2528.00, low24h: 2420.00, volume: '3.12B', decimals: 2, prefix: '$', binanceSymbol: 'PAXGUSDT' },
  { id: 'SILVER', symbol: 'XAGUSD', name: 'Silver (US$ / OZ)', category: 'cfd', price: 29.45, change: 0.30, changePct: 0.47, high24h: 29.90, low24h: 28.10, volume: '480M', decimals: 2, prefix: '$' },
  { id: 'USOIL', symbol: 'USOIL', name: 'Crude Oil WTI', category: 'cfd', price: 74.60, change: 1.84, changePct: 2.03, high24h: 75.80, low24h: 73.10, volume: '920M', decimals: 2, prefix: '$' },

  // 4. FOREX (6 Aset)
  { id: 'EURUSD', symbol: 'EURUSD', name: 'EUR / USD', category: 'forex', price: 1.0842, change: 0.0013, changePct: 0.12, high24h: 1.0875, low24h: 1.0790, volume: '2.15B', decimals: 4, prefix: '', binanceSymbol: 'EURUSDT' },
  { id: 'GBPUSD', symbol: 'GBPUSD', name: 'GBP / USD', category: 'forex', price: 1.2915, change: 0.0170, changePct: 1.34, high24h: 1.2950, low24h: 1.2820, volume: '1.48B', decimals: 4, prefix: '', binanceSymbol: 'GBPUSDT' },
  { id: 'USDJPY', symbol: 'USDJPY', name: 'USD / JPY', category: 'forex', price: 154.60, change: -0.37, changePct: -0.24, high24h: 155.40, low24h: 153.90, volume: '1.89B', decimals: 2, prefix: '¥' },
  { id: 'AUDUSD', symbol: 'AUDUSD', name: 'AUD / USD', category: 'forex', price: 0.6580, change: 0.0029, changePct: 0.45, high24h: 0.6610, low24h: 0.6520, volume: '820M', decimals: 4, prefix: '', binanceSymbol: 'AUDUSDT' },
  { id: 'USDCAD', symbol: 'USDCAD', name: 'USD / CAD', category: 'forex', price: 1.3820, change: -0.0025, changePct: -0.18, high24h: 1.3860, low24h: 1.3790, volume: '710M', decimals: 4, prefix: '' },
  { id: 'USDCHF', symbol: 'USDCHF', name: 'USD / CHF', category: 'forex', price: 0.8840, change: 0.0007, changePct: 0.08, high24h: 0.8870, low24h: 0.8805, volume: '590M', decimals: 4, prefix: '' },
];

// Anchored Drawn Line bound to Time & Price per Symbol
interface AnchoredTrendline {
  id: string;
  symbol: string;
  time1: number;
  price1: number;
  time2: number;
  price2: number;
  color: string;
  lineWidth: number;
  lineStyle: 'solid' | 'dashed';
  timeLabel1: string;
  timeLabel2: string;
}

interface BrushStroke {
  id: string;
  symbol: string;
  points: Array<{ time: number; price: number }>;
  color: string;
}

interface TextAnnotation {
  id: string;
  symbol: string;
  time: number;
  price: number;
  text: string;
  color: string;
}

interface StampMarker {
  id: string;
  symbol: string;
  time: number;
  price: number;
  icon: string;
  label: string;
}

// Sanitize and strictly sort candle & volume datasets ascending by time without duplicate timestamps
function sanitizeCandleData(data: { candles: CandlestickData<Time>[]; volume: HistogramData<Time>[] }): {
  candles: CandlestickData<Time>[];
  volume: HistogramData<Time>[];
} {
  const timeMap = new Map<number, CandlestickData<Time>>();
  const volMap = new Map<number, HistogramData<Time>>();

  if (Array.isArray(data.candles)) {
    for (let i = 0; i < data.candles.length; i++) {
      const c = data.candles[i];
      if (c && c.time) {
        timeMap.set(Number(c.time), c);
      }
    }
  }

  if (Array.isArray(data.volume)) {
    for (let i = 0; i < data.volume.length; i++) {
      const v = data.volume[i];
      if (v && v.time) {
        volMap.set(Number(v.time), v);
      }
    }
  }

  const sortedTimes = Array.from(timeMap.keys()).sort((a, b) => a - b);

  const cleanCandles: CandlestickData<Time>[] = [];
  const cleanVolume: HistogramData<Time>[] = [];

  for (const t of sortedTimes) {
    const c = timeMap.get(t);
    if (c) cleanCandles.push({ ...c, time: t as Time });

    const v = volMap.get(t);
    if (v) {
      cleanVolume.push({ ...v, time: t as Time });
    } else {
      cleanVolume.push({
        time: t as Time,
        value: 100,
        color: 'rgba(0, 225, 99, 0.35)',
      });
    }
  }

  return { candles: cleanCandles, volume: cleanVolume };
}

// Generate Authentic TradingView Candlesticks with Crisp, Prominent Upper & Lower Wicks (Matching Image 2)
function generateAuthenticTradingViewCandles(
  basePrice: number,
  decimals: number,
  count: number,
  intervalSec: number
): { candles: CandlestickData<Time>[]; volume: HistogramData<Time>[] } {
  const candles: CandlestickData<Time>[] = [];
  const volume: HistogramData<Time>[] = [];

  const nowSec = Math.floor(Date.now() / 1000);
  const currentBucket = Math.floor(nowSec / intervalSec) * intervalSec;
  const startTime = currentBucket - (count - 1) * intervalSec;

  const volatility = basePrice < 2 ? 0.0006 : basePrice < 100 ? 0.0012 : 0.0008;
  let currentPrice = basePrice * (1.0 - 0.004);

  for (let i = 0; i < count; i++) {
    const time = (startTime + i * intervalSec) as Time;

    // Organic micro-trend oscillation
    const trendCycle = Math.sin(i * 0.08) * (currentPrice * volatility * 0.7);
    const randomShock = (Math.random() - 0.495) * (currentPrice * volatility * 1.6);
    const delta = trendCycle + randomShock;

    const open = currentPrice;
    const close = open + delta;

    // Prominent, crisp TradingView upper and lower wicks (matching Image 2)
    const bodyHeight = Math.abs(close - open);
    const minWick = currentPrice * volatility * 0.6;
    const upperWickMultiplier = Math.random() < 0.25 ? 2.8 : Math.random() < 0.5 ? 1.6 : 0.9;
    const lowerWickMultiplier = Math.random() < 0.25 ? 2.8 : Math.random() < 0.5 ? 1.6 : 0.9;

    const upperWick = Math.max(minWick, bodyHeight * upperWickMultiplier * Math.random() + (currentPrice * volatility * 0.5));
    const lowerWick = Math.max(minWick, bodyHeight * lowerWickMultiplier * Math.random() + (currentPrice * volatility * 0.5));

    const high = Math.max(open, close) + upperWick;
    const low = Math.min(open, close) - lowerWick;

    const isUp = close >= open;
    const vol = Math.floor(80 + Math.random() * 420 + (bodyHeight / (currentPrice * volatility)) * 200);

    candles.push({
      time,
      open: Number(open.toFixed(decimals)),
      high: Number(high.toFixed(decimals)),
      low: Number(low.toFixed(decimals)),
      close: Number(close.toFixed(decimals)),
    });

    volume.push({
      time,
      value: vol,
      color: isUp ? 'rgba(0, 225, 99, 0.35)' : 'rgba(255, 92, 119, 0.35)',
    });

    currentPrice = close;
  }

  return sanitizeCandleData({ candles, volume });
}

export const ProChartsView: React.FC = () => {
  const { selectedSymbol, setSelectedSymbol, tickers } = useTradingStore();

  // Persistent Selected Asset (Restores exactly what user opened even after page refresh)
  const [selectedAsset, setSelectedAsset] = useState<ProAsset>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedSymbol = localStorage.getItem('velocex_selected_pro_symbol');
        if (savedSymbol) {
          const found = PRO_ASSETS.find((a) => a.symbol === savedSymbol);
          if (found) return found;
        }
      } catch (_) {}
    }
    return PRO_ASSETS.find((a) => a.symbol === selectedSymbol) || PRO_ASSETS[0];
  });

  const [activeTimeframe, setActiveTimeframe] = useState<'1s' | '1m' | '5m' | '15m' | '1h' | '4h' | '1D' | '1W'>('1m');
  const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'indices' | 'crypto' | 'cfd' | 'forex'>('all');

  // Drawing Toolbar Modes
  const [activeDrawingTool, setActiveDrawingTool] = useState<string>('crosshair');
  const [isMagnetActive, setIsMagnetActive] = useState(false);
  const [isDrawLocked, setIsDrawLocked] = useState(false);
  const [isHideDrawings, setIsHideDrawings] = useState(false);
  const [isStayDrawActive, setIsStayDrawActive] = useState(false);

  // Dynamic Interactive Overlays State
  const [showFibonacci, setShowFibonacci] = useState(false);
  const [showRiskReward, setShowRiskReward] = useState(false);
  const [showHarmonicPattern, setShowHarmonicPattern] = useState(false);
  const [showRulerMeasure, setShowRulerMeasure] = useState(false);

  // Persistent Anchored Objects (Scoped per symbol to prevent cross-asset distortion & persistent after refresh)
  const [trendlines, setTrendlines] = useState<AnchoredTrendline[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('velocex_procharts_trendlines');
        if (saved) return JSON.parse(saved);
      } catch (_) {}
    }
    return [];
  });

  const saveTrendlines = useCallback((updater: AnchoredTrendline[] | ((prev: AnchoredTrendline[]) => AnchoredTrendline[])) => {
    setTrendlines((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('velocex_procharts_trendlines', JSON.stringify(next));
        } catch (_) {}
      }
      return next;
    });
  }, []);

  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [brushStrokes, setBrushStrokes] = useState<BrushStroke[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('velocex_procharts_brush');
        if (saved) return JSON.parse(saved);
      } catch (_) {}
    }
    return [];
  });
  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('velocex_procharts_text');
        if (saved) return JSON.parse(saved);
      } catch (_) {}
    }
    return [];
  });
  const [stampMarkers, setStampMarkers] = useState<StampMarker[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('velocex_procharts_stamps');
        if (saved) return JSON.parse(saved);
      } catch (_) {}
    }
    return [];
  });

  // State to force redraw of overlays when chart scrolls/zooms
  const [, setViewportTick] = useState(0);

  // Active interaction drag state
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragStartCoord, setDragStartCoord] = useState<{ x: number; y: number } | null>(null);
  const [currentMouseCoord, setCurrentMouseCoord] = useState<{ x: number; y: number } | null>(null);
  const [currentBrushCoords, setCurrentBrushCoords] = useState<Array<{ time: number; price: number }>>([]);
  const [rulerStartCoord, setRulerStartCoord] = useState<{ x: number; y: number; time: number; price: number } | null>(null);

  // Hovered bar tooltip state
  const [hoveredData, setHoveredData] = useState<{
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    time: string;
    isUp: boolean;
  } | null>(null);

  // Fast Order Feedback Toast State
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Chart Container References
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const drawingLayerRef = useRef<SVGSVGElement>(null);
  const chartApiRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentCandlesRef = useRef<{ candles: CandlestickData<Time>[]; volume: HistogramData<Time>[] }>({
    candles: [],
    volume: [],
  });

  // Sync selected symbol
  useEffect(() => {
    const found = PRO_ASSETS.find((a) => a.symbol === selectedSymbol);
    if (found && found.symbol !== selectedAsset.symbol) {
      setSelectedAsset(found);
      if (typeof window !== 'undefined') {
        localStorage.setItem('velocex_selected_pro_symbol', found.symbol);
      }
    }
  }, [selectedSymbol, selectedAsset.symbol]);

  // Close on Click Outside or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsAssetDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsAssetDropdownOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Handle Asset Switch
  const handleSelectAsset = (asset: ProAsset) => {
    setSelectedAsset(asset);
    setSelectedSymbol(asset.symbol);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('velocex_selected_pro_symbol', asset.symbol);
      } catch (_) {}
    }
    setSelectedLineId(null);
    setIsAssetDropdownOpen(false);
  };

  // Convert Screen Coordinates (x, y) to Time & Price
  const screenToTimePrice = useCallback((x: number, y: number) => {
    if (!chartApiRef.current || !candleSeriesRef.current) return null;
    const time = chartApiRef.current.timeScale().coordinateToTime(x);
    const price = candleSeriesRef.current.coordinateToPrice(y);
    return { time: time ? Number(time) : Math.floor(Date.now() / 1000), price: price ?? selectedAsset.price };
  }, [selectedAsset.price]);

  // Convert Time & Price to Screen (x, y)
  const timePriceToScreen = useCallback((time: number, price: number): { x: number; y: number } | null => {
    if (!chartApiRef.current || !candleSeriesRef.current) return null;
    const x = chartApiRef.current.timeScale().timeToCoordinate(time as Time);
    const y = candleSeriesRef.current.priceToCoordinate(price);
    if (x === null || y === null) return null;
    return { x: Number(x), y: Number(y) };
  }, []);

  // Load Real-Market Candles with Persistent Storage (Does NOT restart on refresh)
  const loadCandleData = useCallback(async (asset: ProAsset, tf: string) => {
    const storageKey = `velocex_v4_candles_${asset.symbol}_${tf}`;
    const intervalSec = tf === '1s' ? 1 : tf === '1m' ? 60 : tf === '5m' ? 300 : tf === '15m' ? 900 : tf === '1h' ? 3600 : tf === '4h' ? 14400 : 86400;

    // 1. Try fetching from Live Binance API if symbol or binanceSymbol is available
    const bSymbol = asset.binanceSymbol || (asset.category === 'crypto' ? asset.symbol : null);
    if (bSymbol) {
      try {
        const binanceTfMap: Record<string, string> = {
          '1s': '1s',
          '1m': '1m',
          '5m': '5m',
          '15m': '15m',
          '1h': '1h',
          '4h': '4h',
          '1D': '1d',
          '1W': '1w',
        };
        const binanceInterval = binanceTfMap[tf] || '1m';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${bSymbol}&interval=${binanceInterval}&limit=200`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const rawKlines = await res.json();
          if (Array.isArray(rawKlines) && rawKlines.length > 0) {
            const candles: CandlestickData<Time>[] = [];
            const volume: HistogramData<Time>[] = [];

            for (const item of rawKlines) {
              const time = Math.floor(item[0] / 1000) as Time;
              const open = Number(parseFloat(item[1]).toFixed(asset.decimals));
              const high = Number(parseFloat(item[2]).toFixed(asset.decimals));
              const low = Number(parseFloat(item[3]).toFixed(asset.decimals));
              const close = Number(parseFloat(item[4]).toFixed(asset.decimals));
              const vol = parseFloat(item[5]);

              candles.push({ time, open, high, low, close });
              volume.push({
                time,
                value: vol,
                color: close >= open ? 'rgba(0, 225, 99, 0.35)' : 'rgba(255, 92, 119, 0.35)',
              });
            }

            const cleanBinance = sanitizeCandleData({ candles, volume });
            try {
              localStorage.setItem(storageKey, JSON.stringify(cleanBinance));
            } catch (_) {}

            return cleanBinance;
          }
        }
      } catch (_) {}
    }

    // 2. Check LocalStorage for persistent continuous data
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.candles && parsed.candles.length > 0) {
          const cleanCached = sanitizeCandleData(parsed);
          const lastCandle = cleanCached.candles[cleanCached.candles.length - 1];
          const nowSec = Math.floor(Date.now() / 1000);

          if (lastCandle && nowSec - Number(lastCandle.time) < 86400 * 7) {
            let lastTime = Number(lastCandle.time);
            let lastClose = lastCandle.close;

            while (lastTime + intervalSec <= nowSec) {
              lastTime += intervalSec;
              const spread = asset.price < 2 ? 0.0006 : asset.price < 100 ? 0.0012 : 0.0008;
              const delta = (Math.random() - 0.495) * (lastClose * spread * 1.5);
              const open = lastClose;
              const close = Number((open + delta).toFixed(asset.decimals));
              const body = Math.abs(close - open);
              const wick = Math.max(lastClose * spread * 0.8, body * 1.5 * Math.random());
              const high = Number((Math.max(open, close) + wick).toFixed(asset.decimals));
              const low = Number((Math.min(open, close) - wick).toFixed(asset.decimals));

              cleanCached.candles.push({
                time: lastTime as Time,
                open,
                high,
                low,
                close,
              });

              cleanCached.volume.push({
                time: lastTime as Time,
                value: Math.floor(50 + Math.random() * 200),
                color: close >= open ? 'rgba(0, 225, 99, 0.35)' : 'rgba(255, 92, 119, 0.35)',
              });

              lastClose = close;
            }

            if (cleanCached.candles.length > 200) {
              cleanCached.candles = cleanCached.candles.slice(cleanCached.candles.length - 200);
              cleanCached.volume = cleanCached.volume.slice(cleanCached.volume.length - 200);
            }

            const finalized = sanitizeCandleData(cleanCached);
            try {
              localStorage.setItem(storageKey, JSON.stringify(finalized));
            } catch (_) {}

            return finalized;
          }
        }
      }
    } catch (_) {}

    // 3. Generate Authentic TradingView Candlesticks with Crisp Wicks
    const freshData = generateAuthenticTradingViewCandles(asset.price, asset.decimals, 180, intervalSec);
    try {
      localStorage.setItem(storageKey, JSON.stringify(freshData));
    } catch (_) {}

    return freshData;
  }, []);

  // Mount and Render Real-Market Lightweight Charts
  useEffect(() => {
    if (!chartContainerRef.current) return;

    let isMounted = true;

    if (chartApiRef.current) {
      chartApiRef.current.remove();
      chartApiRef.current = null;
    }

    const container = chartContainerRef.current;

    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: '#131118' },
        textColor: '#848E9C',
        fontSize: 11,
        fontFamily: 'Inter, sans-serif',
      },
      localization: {
        locale: 'id-ID',
        dateFormat: 'dd MMM yyyy',
        timeFormatter: (time: number) => {
          const d = new Date(time * 1000);
          return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
        },
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.03)', style: LineStyle.Dashed },
        horzLines: { color: 'rgba(255, 255, 255, 0.03)', style: LineStyle.Dashed },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#2962FF',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#2962FF',
        },
        horzLine: {
          color: '#2962FF',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#2962FF',
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.08)',
        scaleMargins: {
          top: 0.12,
          bottom: 0.22,
        },
        autoScale: true,
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.08)',
        timeVisible: true,
        secondsVisible: activeTimeframe === '1s',
        barSpacing: 9,
        minBarSpacing: 4,
        rightOffset: 12,
        tickMarkFormatter: (time: number) => {
          const d = new Date(time * 1000);
          const hh = String(d.getHours()).padStart(2, '0');
          const mm = String(d.getMinutes()).padStart(2, '0');
          return `${hh}:${mm}`;
        },
      },
    });

    chartApiRef.current = chart;

    // 1. Candlestick Series with crisp TradingView wicks (matching Image 2)
    const candleSeries = chart.addCandlestickSeries({
      upColor: '#00E163',
      downColor: '#FF5C77',
      borderVisible: false,
      wickVisible: true,
      wickUpColor: '#00E163',
      wickDownColor: '#FF5C77',
      priceFormat: {
        type: 'price',
        precision: selectedAsset.decimals,
        minMove: Math.pow(10, -selectedAsset.decimals),
      },
    });
    candleSeriesRef.current = candleSeries;

    // 2. Volume Histogram Series
    const volumeSeries = chart.addHistogramSeries({
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.82,
        bottom: 0,
      },
    });
    volumeSeriesRef.current = volumeSeries;

    // Load data asynchronously and set to chart
    loadCandleData(selectedAsset, activeTimeframe).then((marketData) => {
      if (!isMounted || !candleSeriesRef.current || !volumeSeriesRef.current) return;
      currentCandlesRef.current = {
        candles: [...marketData.candles],
        volume: [...marketData.volume],
      };
      candleSeriesRef.current.setData(marketData.candles);
      volumeSeriesRef.current.setData(marketData.volume);

      chart.timeScale().fitContent();
    });

    // Reposition drawings on every scroll / pan / zoom
    chart.timeScale().subscribeVisibleLogicalRangeChange(() => {
      setViewportTick((t) => t + 1);
    });

    chart.timeScale().subscribeVisibleTimeRangeChange(() => {
      setViewportTick((t) => t + 1);
    });

    // Subscribe to Crosshair Move
    chart.subscribeCrosshairMove((param) => {
      setViewportTick((t) => t + 1);

      if (!param || !param.time || !param.seriesData) {
        setHoveredData(null);
        return;
      }

      const barData = param.seriesData.get(candleSeries) as CandlestickData<Time> | undefined;
      const volData = volumeSeriesRef.current ? (param.seriesData.get(volumeSeriesRef.current) as HistogramData<Time> | undefined) : undefined;

      if (barData) {
        const isUp = barData.close >= barData.open;
        setHoveredData({
          open: barData.open,
          high: barData.high,
          low: barData.low,
          close: barData.close,
          volume: volData ? volData.value : 0,
          time: new Date(Number(param.time) * 1000).toLocaleDateString('id-ID', {
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          }),
          isUp,
        });
      }
    });

    const handleResize = () => {
      if (container && chart) {
        chart.applyOptions({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      isMounted = false;
      resizeObserver.disconnect();
      chart.remove();
      chartApiRef.current = null;
    };
  }, [selectedAsset, activeTimeframe, loadCandleData]);

  // Live Micro-Tick Real-Time Engine with Continuous LocalStorage Persistence
  useEffect(() => {
    const intervalSec = activeTimeframe === '1s' ? 1 : activeTimeframe === '1m' ? 60 : activeTimeframe === '5m' ? 300 : activeTimeframe === '15m' ? 900 : activeTimeframe === '1h' ? 3600 : activeTimeframe === '4h' ? 14400 : 86400;
    const storageKey = `velocex_v3_candles_${selectedAsset.symbol}_${activeTimeframe}`;

    const interval = setInterval(() => {
      if (!candleSeriesRef.current || !volumeSeriesRef.current) return;

      const spread = selectedAsset.price < 2 ? 0.0004 : selectedAsset.price < 100 ? 0.0008 : 0.0005;
      const delta = (Math.random() - 0.495) * (selectedAsset.price * spread);
      const newPrice = Number((selectedAsset.price + delta).toFixed(selectedAsset.decimals));

      const nowSec = Math.floor(Date.now() / 1000);
      const bucketTime = (Math.floor(nowSec / intervalSec) * intervalSec) as Time;
      const wickSpread = selectedAsset.price * spread * 1.1;

      const candleList = currentCandlesRef.current.candles;
      const volumeList = currentCandlesRef.current.volume;

      if (!candleList || candleList.length === 0) return;

      const lastCandle = candleList[candleList.length - 1];
      const lastTime = Number(lastCandle.time);
      const currentBucketTime = Number(bucketTime);

      if (currentBucketTime <= lastTime) {
        // Update existing candle bar in the same timeframe bucket
        lastCandle.high = Math.max(lastCandle.high, newPrice, Number((newPrice + Math.random() * wickSpread).toFixed(selectedAsset.decimals)));
        lastCandle.low = Math.min(lastCandle.low, newPrice, Number((newPrice - Math.random() * wickSpread).toFixed(selectedAsset.decimals)));
        lastCandle.close = newPrice;

        candleSeriesRef.current.update(lastCandle);
      } else {
        // Form a new candle period bar (strictly currentBucketTime > lastTime)
        const prevClose = lastCandle ? lastCandle.close : selectedAsset.price;
        const newBar: CandlestickData<Time> = {
          time: bucketTime,
          open: prevClose,
          high: Math.max(prevClose, newPrice, Number((newPrice + Math.random() * wickSpread).toFixed(selectedAsset.decimals))),
          low: Math.min(prevClose, newPrice, Number((newPrice - Math.random() * wickSpread).toFixed(selectedAsset.decimals))),
          close: newPrice,
        };
        candleList.push(newBar);
        if (candleList.length > 250) candleList.shift();

        const newVol: HistogramData<Time> = {
          time: bucketTime,
          value: Math.floor(60 + Math.random() * 200),
          color: newPrice >= prevClose ? 'rgba(0, 225, 99, 0.4)' : 'rgba(255, 92, 119, 0.4)',
        };
        volumeList.push(newVol);
        if (volumeList.length > 250) volumeList.shift();

        candleSeriesRef.current.update(newBar);
        volumeSeriesRef.current.update(newVol);
      }

      // Persist live candles directly to localStorage so refreshing NEVER loses data!
      try {
        localStorage.setItem(storageKey, JSON.stringify({ candles: candleList, volume: volumeList }));
      } catch (_) {}
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedAsset, activeTimeframe]);

  // Fast Order Handler
  const handleFastOrder = (side: 'BUY' | 'SELL') => {
    const priceStr = `${selectedAsset.prefix}${selectedAsset.price.toLocaleString('en-US', { minimumFractionDigits: selectedAsset.decimals })}`;
    setToastMsg(`Order ${side} ${selectedAsset.name} dieksekusi @ ${priceStr} (0.00% Fee)`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Handle Tool Click with Action Feedback & State Update
  const handleToolClick = (toolId: string) => {
    setActiveDrawingTool(toolId);

    if (toolId === 'magnet') {
      setIsMagnetActive((prev) => !prev);
      setToastMsg(!isMagnetActive ? 'Magnet Mode: Aktif (Snap ke Titik Lilin)' : 'Magnet Mode: Nonaktif');
      setTimeout(() => setToastMsg(null), 2500);
      return;
    }

    if (toolId === 'lock') {
      setIsDrawLocked((prev) => !prev);
      setToastMsg(!isDrawLocked ? 'Garis & Gambar Terkunci (Fixed)' : 'Kunci Gambar Dibuka');
      setTimeout(() => setToastMsg(null), 2500);
      return;
    }

    if (toolId === 'hide') {
      setIsHideDrawings((prev) => !prev);
      setToastMsg(!isHideDrawings ? 'Menyembunyikan Seluruh Gambar' : 'Menampilkan Seluruh Gambar');
      setTimeout(() => setToastMsg(null), 2500);
      return;
    }

    if (toolId === 'stay_draw') {
      setIsStayDrawActive((prev) => !prev);
      setToastMsg(!isStayDrawActive ? 'Mode Gambar Kontinu Aktif' : 'Mode Gambar Kontinu Nonaktif');
      setTimeout(() => setToastMsg(null), 2500);
      return;
    }

    if (toolId === 'trash') {
      saveTrendlines((prev) => prev.filter((l) => l.symbol !== selectedAsset.symbol));
      setSelectedLineId(null);
      setBrushStrokes((prev) => {
        const next = prev.filter((s) => s.symbol !== selectedAsset.symbol);
        if (typeof window !== 'undefined') localStorage.setItem('velocex_procharts_brush', JSON.stringify(next));
        return next;
      });
      setTextAnnotations((prev) => {
        const next = prev.filter((t) => t.symbol !== selectedAsset.symbol);
        if (typeof window !== 'undefined') localStorage.setItem('velocex_procharts_text', JSON.stringify(next));
        return next;
      });
      setStampMarkers((prev) => {
        const next = prev.filter((m) => m.symbol !== selectedAsset.symbol);
        if (typeof window !== 'undefined') localStorage.setItem('velocex_procharts_stamps', JSON.stringify(next));
        return next;
      });
      setShowFibonacci(false);
      setShowRiskReward(false);
      setShowHarmonicPattern(false);
      setShowRulerMeasure(false);
      setToastMsg('Seluruh Garis & Analisis Dihapus');
      setTimeout(() => setToastMsg(null), 2500);
      return;
    }

    if (toolId === 'fibonacci') {
      setShowFibonacci((prev) => !prev);
      setToastMsg(!showFibonacci ? 'Fibonacci Retracement Diterapkan (0% - 100%)' : 'Fibonacci Disembunyikan');
      setTimeout(() => setToastMsg(null), 2500);
      return;
    }

    if (toolId === 'position') {
      setShowRiskReward((prev) => !prev);
      setToastMsg(!showRiskReward ? 'Long / Short Risk-Reward Box Diterapkan' : 'Position Box Dihapus');
      setTimeout(() => setToastMsg(null), 2500);
      return;
    }

    if (toolId === 'patterns') {
      setShowHarmonicPattern((prev) => !prev);
      setToastMsg(!showHarmonicPattern ? 'Harmonic X-A-B-C-D Pattern Diaktifkan' : 'Harmonic Pattern Dihapus');
      setTimeout(() => setToastMsg(null), 2500);
      return;
    }

    if (toolId === 'ruler') {
      setShowRulerMeasure((prev) => !prev);
      setToastMsg(!showRulerMeasure ? 'Penggaris Ukur: Klik & Tarik pada grafik' : 'Penggaris Dinonaktifkan');
      setTimeout(() => setToastMsg(null), 2500);
      return;
    }

    if (toolId === 'zoom') {
      if (chartApiRef.current) {
        chartApiRef.current.timeScale().fitContent();
      }
      setToastMsg('Grafik Disesuaikan ke Tampilan Penuh');
      setTimeout(() => setToastMsg(null), 2500);
      return;
    }

    if (toolId === 'trendline') {
      setToastMsg('Trendline: Klik & Tarik untuk menggambar garis terikat waktu & harga');
      setTimeout(() => setToastMsg(null), 2500);
      return;
    }

    if (toolId === 'brush') {
      setToastMsg('Kuas: Klik & Tahan mouse untuk mencoret bebas');
      setTimeout(() => setToastMsg(null), 2500);
      return;
    }

    if (toolId === 'text') {
      setToastMsg('Teks: Klik pada grafik untuk menaruh catatan');
      setTimeout(() => setToastMsg(null), 2500);
      return;
    }

    if (toolId === 'stickers') {
      setToastMsg('Stiker: Klik pada lilin untuk menaruh pin sinyal 🚀');
      setTimeout(() => setToastMsg(null), 2500);
      return;
    }
  };

  // Interactive Chart Drawing Canvas Mouse Event Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDrawLocked || isHideDrawings) return;
    const rect = drawingLayerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const tp = screenToTimePrice(x, y);
    if (!tp) return;

    setIsMouseDown(true);
    setDragStartCoord({ x, y });
    setCurrentMouseCoord({ x, y });

    if (activeDrawingTool === 'brush') {
      setCurrentBrushCoords([tp]);
    } else if (activeDrawingTool === 'ruler') {
      setRulerStartCoord({ x, y, time: tp.time, price: tp.price });
      setShowRulerMeasure(true);
    } else if (activeDrawingTool === 'text') {
      const newText: TextAnnotation = {
        id: `txt-${Date.now()}`,
        symbol: selectedAsset.symbol,
        time: tp.time,
        price: tp.price,
        text: `Target Breakout ${selectedAsset.id}`,
        color: '#2962FF',
      };
      setTextAnnotations((prev) => {
        const next = [...prev, newText];
        if (typeof window !== 'undefined') localStorage.setItem('velocex_procharts_text', JSON.stringify(next));
        return next;
      });
      setToastMsg('Catatan Anotasi Berhasil Ditambahkan');
      setTimeout(() => setToastMsg(null), 2000);
      if (!isStayDrawActive) setActiveDrawingTool('crosshair');
    } else if (activeDrawingTool === 'stickers') {
      const newStamp: StampMarker = {
        id: `stamp-${Date.now()}`,
        symbol: selectedAsset.symbol,
        time: tp.time,
        price: tp.price,
        icon: '🚀',
        label: 'Breakout Signal',
      };
      setStampMarkers((prev) => {
        const next = [...prev, newStamp];
        if (typeof window !== 'undefined') localStorage.setItem('velocex_procharts_stamps', JSON.stringify(next));
        return next;
      });
      setToastMsg('Penanda Sinyal Ditempelkan ke Grafik');
      setTimeout(() => setToastMsg(null), 2000);
      if (!isStayDrawActive) setActiveDrawingTool('crosshair');
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = drawingLayerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurrentMouseCoord({ x, y });

    if (!isMouseDown || isDrawLocked) return;

    const tp = screenToTimePrice(x, y);
    if (!tp) return;

    if (activeDrawingTool === 'brush') {
      setCurrentBrushCoords((prev) => [...prev, tp]);
    }
  };

  const handleCanvasMouseUp = () => {
    if (!isMouseDown || isDrawLocked) {
      setIsMouseDown(false);
      return;
    }

    if (activeDrawingTool === 'trendline' && dragStartCoord && currentMouseCoord) {
      const dist = Math.hypot(currentMouseCoord.x - dragStartCoord.x, currentMouseCoord.y - dragStartCoord.y);
      if (dist > 15) {
        const tp1 = screenToTimePrice(dragStartCoord.x, dragStartCoord.y);
        const tp2 = screenToTimePrice(currentMouseCoord.x, currentMouseCoord.y);

        if (tp1 && tp2) {
          const newLine: AnchoredTrendline = {
            id: `line-${selectedAsset.symbol}-${Date.now()}`,
            symbol: selectedAsset.symbol,
            time1: tp1.time,
            price1: tp1.price,
            time2: tp2.time,
            price2: tp2.price,
            color: '#2962FF',
            lineWidth: 2,
            lineStyle: 'solid',
            timeLabel1: new Date(tp1.time * 1000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }),
            timeLabel2: new Date(tp2.time * 1000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }),
          };
          saveTrendlines((prev) => [...prev, newLine]);
          setSelectedLineId(newLine.id);
          setToastMsg('Garis Tren (Trendline) Terikat Sempurna ke Waktu & Harga');
          setTimeout(() => setToastMsg(null), 2000);
          if (!isStayDrawActive) setActiveDrawingTool('crosshair');
        }
      }
    } else if (activeDrawingTool === 'brush' && currentBrushCoords.length > 2) {
      const newStroke: BrushStroke = {
        id: `brush-${Date.now()}`,
        symbol: selectedAsset.symbol,
        points: currentBrushCoords,
        color: '#00E163',
      };
      setBrushStrokes((prev) => {
        const next = [...prev, newStroke];
        if (typeof window !== 'undefined') localStorage.setItem('velocex_procharts_brush', JSON.stringify(next));
        return next;
      });
      setCurrentBrushCoords([]);
      setToastMsg('Coretan Kuas Tersimpan');
      setTimeout(() => setToastMsg(null), 2000);
      if (!isStayDrawActive) setActiveDrawingTool('crosshair');
    }

    setIsMouseDown(false);
    setDragStartCoord(null);
  };

  // Filter drawings for current selected asset
  const assetTrendlines = trendlines.filter((l) => l.symbol === selectedAsset.symbol);
  const selectedLine = assetTrendlines.find((l) => l.id === selectedLineId) || (assetTrendlines.length > 0 ? assetTrendlines[assetTrendlines.length - 1] : null);

  const filteredAssets = useMemo(() => {
    return PRO_ASSETS.filter((a) => {
      const matchCat =
        activeCategory === 'all' ||
        (activeCategory === 'indices' && a.category === 'indices') ||
        (activeCategory === 'crypto' && a.category === 'crypto') ||
        (activeCategory === 'cfd' && (a.category === 'cfd' || a.category === 'indices')) ||
        (activeCategory === 'forex' && a.category === 'forex');

      const matchSearch =
        a.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        a.symbol.toLowerCase().includes(searchFilter.toLowerCase()) ||
        a.id.toLowerCase().includes(searchFilter.toLowerCase());

      return matchCat && matchSearch;
    });
  }, [activeCategory, searchFilter]);

  return (
    <div className="flex flex-col w-full h-[calc(100vh-120px)] md:h-[calc(100vh-68px)] bg-[#131118] text-slate-200 overflow-hidden select-none font-sans">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-[9999] flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#1F1E25] border border-[#2962FF] text-white shadow-2xl animate-fade-in">
          <Tick01Icon className="w-5 h-5 text-[#2962FF] stroke-[3]" />
          <span className="text-xs font-bold font-mono-num">{toastMsg}</span>
        </div>
      )}

      {/* TOP TRADINGVIEW PRO TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between px-2 sm:px-3.5 py-2 bg-[#18171E] border-b border-white/5 flex-shrink-0 gap-2 sm:gap-3 z-30 overflow-visible">
        {/* Left: Asset Switcher Dropdown + O,H,L,C Header Stats */}
        <div className="flex items-center gap-3 overflow-visible">
          {/* Asset Dropdown Trigger matching Image 1 */}
          <div ref={dropdownRef} className="relative">
            <div
              onClick={() => setIsAssetDropdownOpen(!isAssetDropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-[#26252E] hover:bg-[#2F2E38] border border-white/5 text-white cursor-pointer transition-all select-none group"
            >
              <MarketIcon symbol={selectedAsset.symbol} size="sm" />
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white font-heading tracking-wide">
                  {selectedAsset.id}
                </span>
                <span className="text-xs font-medium text-slate-400">
                  {selectedAsset.name.split('(')[0].trim()}
                </span>
              </div>
              <ArrowDown01Icon
                className={`w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform duration-300 ml-0.5 ${
                  isAssetDropdownOpen ? 'rotate-180 text-white' : ''
                }`}
              />
            </div>

            {/* Categorized Dropdown Modal matching Analytics view */}
            {isAssetDropdownOpen && (
              <div className="absolute top-12 left-0 w-80 bg-[#1F1E25] border border-white/10 rounded-2xl shadow-2xl p-3 z-50 flex flex-col gap-2 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                {/* Search Bar */}
                <div className="relative flex items-center w-full h-8 px-2.5 rounded-xl bg-[#26252E] border border-white/5">
                  <Search01Icon className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Cari aset (BTC, XAU, EUR...)"
                    className="w-full text-xs text-white placeholder-slate-500 bg-transparent focus:outline-none"
                  />
                  {searchFilter && (
                    <button
                      type="button"
                      onClick={() => setSearchFilter('')}
                      className="text-slate-400 hover:text-white shrink-0 cursor-pointer"
                    >
                      <Cancel01Icon className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Category Filter Pills (Semua, Forex, CFD, Kripto) */}
                <div className="flex items-center p-1 bg-[#26252E] rounded-xl text-[10px] font-bold gap-1">
                  {[
                    { id: 'all', label: 'Semua' },
                    { id: 'forex', label: 'Forex' },
                    { id: 'cfd', label: 'CFD' },
                    { id: 'crypto', label: 'Kripto' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id as any)}
                      className={`flex-1 py-1 rounded-lg transition-all cursor-pointer ${
                        activeCategory === cat.id
                          ? 'bg-[#00E163] text-black font-bold shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Assets List with Dual-Flag & Vector Logos */}
                <div className="flex flex-col space-y-1 max-h-64 overflow-y-auto custom-positions-scrollbar pr-1">
                  {filteredAssets.map((asset) => {
                    const isSelected = selectedAsset.id === asset.id;
                    const liveTicker = tickers[asset.symbol];
                    const curPrice = liveTicker ? liveTicker.price : asset.price;
                    const curChange = liveTicker ? liveTicker.change_percent : asset.changePct;

                    return (
                      <div
                        key={asset.id}
                        onClick={() => handleSelectAsset(asset)}
                        className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#00E163]/15 border border-[#00E163]/30'
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <MarketIcon symbol={asset.symbol} size="sm" />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-white leading-tight">
                              {asset.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {asset.symbol}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end font-mono-num">
                          <span className="text-xs font-bold text-white">
                            {asset.prefix}
                            {curPrice.toLocaleString('en-US', {
                              minimumFractionDigits: asset.decimals,
                              maximumFractionDigits: asset.decimals,
                            })}
                          </span>
                          <span
                            className={`text-[9px] font-bold ${
                              curChange >= 0 ? 'text-[#00E163]' : 'text-[#FF5C77]'
                            }`}
                          >
                            {curChange >= 0 ? '+' : ''}{curChange.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Timeframe Chips */}
          <div className="flex items-center p-0.5 rounded-xl bg-[#26252E] border border-white/5 text-xs font-bold">
            {(['1s', '1m', '5m', '15m', '1h', '4h', '1D', '1W'] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setActiveTimeframe(tf)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  activeTimeframe === tf ? 'bg-[#00E163] text-black font-extrabold shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="w-[1px] h-5 bg-white/10 my-auto" />

          {/* Live Bar OHLCV Header Display (TradingView Style) */}
          <div className="hidden lg:flex items-center gap-3 text-[11px] font-mono-num">
            <span className="text-slate-400">
              O <span className={hoveredData?.isUp ?? true ? 'text-[#00E163]' : 'text-[#FF5C77]'}>{selectedAsset.prefix}{(hoveredData?.open ?? selectedAsset.price * 0.999).toFixed(selectedAsset.decimals)}</span>
            </span>
            <span className="text-slate-400">
              H <span className="text-[#00E163]">{selectedAsset.prefix}{(hoveredData?.high ?? selectedAsset.high24h).toFixed(selectedAsset.decimals)}</span>
            </span>
            <span className="text-slate-400">
              L <span className="text-[#FF5C77]">{selectedAsset.prefix}{(hoveredData?.low ?? selectedAsset.low24h).toFixed(selectedAsset.decimals)}</span>
            </span>
            <span className="text-slate-400">
              C <span className={hoveredData?.isUp ?? true ? 'text-[#00E163]' : 'text-[#FF5C77]'}>{selectedAsset.prefix}{(hoveredData?.close ?? selectedAsset.price).toFixed(selectedAsset.decimals)}</span>
            </span>
            <span className="text-slate-400">
              Vol <span className="text-slate-200">{hoveredData ? hoveredData.volume.toLocaleString() : selectedAsset.volume}</span>
            </span>
            {hoveredData?.time && (
              <span className="text-slate-500 text-[10px]">
                {hoveredData.time}
              </span>
            )}
          </div>
        </div>

        {/* Right: Fast BUY / SELL Order Buttons (Persis TradingView Bar) */}
        <div className="flex items-center gap-2">
          {/* Fast SELL Button */}
          <button
            type="button"
            onClick={() => handleFastOrder('SELL')}
            className="group relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#FF5C77]/15 hover:bg-[#FF5C77] border border-[#FF5C77]/30 text-[#FF5C77] hover:text-black font-extrabold text-xs transition-all duration-300 cursor-pointer overflow-hidden select-none"
          >
            <span className="font-mono-num font-bold">{(selectedAsset.price * 0.9998).toFixed(selectedAsset.decimals)}</span>
            <span className="px-1.5 py-0.5 rounded bg-black/20 text-[9px] font-black">SELL</span>
          </button>

          {/* Fast BUY Button */}
          <button
            type="button"
            onClick={() => handleFastOrder('BUY')}
            className="group relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00E163]/15 hover:bg-[#00E163] border border-[#00E163]/30 text-[#00E163] hover:text-black font-extrabold text-xs transition-all duration-300 cursor-pointer overflow-hidden select-none"
          >
            <span className="font-mono-num font-bold">{(selectedAsset.price * 1.0002).toFixed(selectedAsset.decimals)}</span>
            <span className="px-1.5 py-0.5 rounded bg-black/20 text-[9px] font-black">BUY</span>
          </button>
        </div>
      </div>

      {/* MAIN BODY: DRAWING TOOLS (LEFT) + CANVAS CHART (CENTER) + WATCHLIST (RIGHT) */}
      <div className="flex flex-1 w-full overflow-hidden">
        {/* LEFT DRAWING TOOLS SIDEBAR */}
        <div className="w-11 bg-[#18171E] border-r border-white/5 flex flex-col items-center py-2 gap-1 flex-shrink-0 z-20 select-none overflow-y-auto custom-positions-scrollbar">
          {/* 1. Crosshair Pointer */}
          <button
            type="button"
            onClick={() => handleToolClick('crosshair')}
            title="Kursor Crosshair"
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              activeDrawingTool === 'crosshair' ? 'bg-[#26252E] text-white border border-white/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="2" x2="12" y2="8" />
              <line x1="12" y1="16" x2="12" y2="22" />
              <line x1="2" y1="12" x2="8" y2="12" />
              <line x1="16" y1="12" x2="22" y2="12" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            </svg>
          </button>

          {/* 2. Trendline Tool */}
          <button
            type="button"
            onClick={() => handleToolClick('trendline')}
            title="Garis Tren (Trendline)"
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              activeDrawingTool === 'trendline' ? 'bg-[#2962FF] text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="5" cy="19" r="2.5" />
              <circle cx="19" cy="5" r="2.5" />
              <line x1="7" y1="17" x2="17" y2="7" />
            </svg>
          </button>

          {/* 3. Fibonacci & Gann Retracement */}
          <button
            type="button"
            onClick={() => handleToolClick('fibonacci')}
            title="Fibonacci Retracement (Golden Ratio Levels)"
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              showFibonacci ? 'bg-[#2962FF] text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="11" x2="20" y2="11" />
              <line x1="4" y1="16" x2="20" y2="16" />
              <line x1="4" y1="21" x2="20" y2="21" />
              <circle cx="18" cy="6" r="1.5" fill="currentColor" />
              <circle cx="6" cy="21" r="1.5" fill="currentColor" />
            </svg>
          </button>

          {/* 4. Geometric & Harmonic Patterns */}
          <button
            type="button"
            onClick={() => handleToolClick('patterns')}
            title="Pola Geometrik & Harmonik (Harmonic X-A-B-C-D)"
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              showHarmonicPattern ? 'bg-[#2962FF] text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="18" r="2" />
              <circle cx="12" cy="7" r="2" />
              <circle cx="18" cy="18" r="2" />
              <line x1="7.5" y1="16.5" x2="10.5" y2="8.5" />
              <line x1="13.5" y1="8.5" x2="16.5" y2="16.5" />
              <line x1="8" y1="18" x2="16" y2="18" />
            </svg>
          </button>

          {/* 5. Long / Short Position Risk:Reward Tool */}
          <button
            type="button"
            onClick={() => handleToolClick('position')}
            title="Alat Posisi Long/Short & Kalkulator Risk-Reward"
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              showRiskReward ? 'bg-[#2962FF] text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="17" x2="20" y2="17" />
              <polyline points="10 11 12 11 12 14 14 14" />
              <circle cx="6" cy="7" r="1.5" fill="currentColor" />
              <circle cx="6" cy="17" r="1.5" fill="currentColor" />
            </svg>
          </button>

          {/* 6. Brush / Paint Tool */}
          <button
            type="button"
            onClick={() => handleToolClick('brush')}
            title="Kuas Lukis Bebas (Brush Marker)"
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              activeDrawingTool === 'brush' ? 'bg-[#2962FF] text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              <path d="M4 20c1.5-2 3.5-2 5 0" />
            </svg>
          </button>

          {/* 7. Text Annotation Tool */}
          <button
            type="button"
            onClick={() => handleToolClick('text')}
            title="Anotasi Teks & Callout"
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              activeDrawingTool === 'text' ? 'bg-[#2962FF] text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="font-serif font-black text-sm leading-none">T</span>
          </button>

          {/* 8. Stickers & Market Icons */}
          <button
            type="button"
            onClick={() => handleToolClick('stickers')}
            title="Ikon & Stiker Pasar"
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              activeDrawingTool === 'stickers' ? 'bg-[#2962FF] text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" />
              <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" />
            </svg>
          </button>

          {/* Divider */}
          <div className="w-5 h-[1px] bg-white/10 my-0.5" />

          {/* 9. Ruler Measuring Tool */}
          <button
            type="button"
            onClick={() => handleToolClick('ruler')}
            title="Penggaris Ukur Rentang Bar & Harga"
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              showRulerMeasure ? 'bg-[#2962FF] text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.3 8.7L8.7 21.3a2.12 2.12 0 0 1-3 0L2.7 18.3a2.12 2.12 0 0 1 0-3L15.3 2.7a2.12 2.12 0 0 1 3 0l3 3a2.12 2.12 0 0 1 0 3z" />
              <line x1="13.5" y1="4.5" x2="15" y2="6" />
              <line x1="10.5" y1="7.5" x2="12" y2="9" />
              <line x1="7.5" y1="10.5" x2="9" y2="12" />
            </svg>
          </button>

          {/* 10. Zoom In Magnifier */}
          <button
            type="button"
            onClick={() => handleToolClick('zoom')}
            title="Zoom Pembesar Tampilan Grafik"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>

          {/* Divider */}
          <div className="w-5 h-[1px] bg-white/10 my-0.5" />

          {/* 11. Magnet Snap Mode */}
          <button
            type="button"
            onClick={() => handleToolClick('magnet')}
            title="Mode Magnet (Snap Otomatis ke Open/High/Low/Close Lilin)"
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              isMagnetActive ? 'bg-[#2962FF] text-white font-bold' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4v7a8 8 0 0 0 16 0V4" />
              <line x1="4" y1="8" x2="8" y2="8" />
              <line x1="16" y1="8" x2="20" y2="8" />
            </svg>
          </button>

          {/* 12. Stay in Drawing Mode */}
          <button
            type="button"
            onClick={() => handleToolClick('stay_draw')}
            title="Mode Gambar Terus-Menerus"
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              isStayDrawActive ? 'bg-[#26252E] text-white border border-white/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </button>

          {/* 13. Lock All Drawing Tools */}
          <button
            type="button"
            onClick={() => handleToolClick('lock')}
            title={isDrawLocked ? 'Buka Kunci Gambar' : 'Kunci Semua Gambar'}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              isDrawLocked ? 'bg-[#FF5C77] text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d={isDrawLocked ? 'M7 11V7a5 5 0 0 1 10 0v4' : 'M7 11V7a5 5 0 0 1 9.9-1'} />
            </svg>
          </button>

          {/* 14. Hide All Drawings & Indicators */}
          <button
            type="button"
            onClick={() => handleToolClick('hide')}
            title={isHideDrawings ? 'Tampilkan Semua Gambar' : 'Sembunyikan Semua Gambar'}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              isHideDrawings ? 'bg-[#FF5C77] text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
              {isHideDrawings && <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" strokeWidth="2" />}
            </svg>
          </button>

          {/* Divider */}
          <div className="w-5 h-[1px] bg-white/10 my-0.5" />

          {/* 15. Remove All Drawings / Trash */}
          <button
            type="button"
            onClick={() => handleToolClick('trash')}
            title="Hapus Semua Gambar & Analisis"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#FF5C77] hover:bg-[#FF5C77]/15 transition-colors cursor-pointer"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>

        {/* CENTRAL CANVAS TRADINGVIEW CHART CONTAINER WITH DYNAMIC ANCHORED OVERLAY */}
        <div className="relative flex-1 h-full bg-[#131118] flex flex-col overflow-hidden">
          {/* Base Lightweight Charts Canvas */}
          <div ref={chartContainerRef} className="w-full h-full" />

          {/* FLOATING QUICK TOOLBAR FOR SELECTED LINE (Persis Gambar 1 TradingView Asli) */}
          {selectedLine && !isHideDrawings && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1F1E25]/95 border border-white/15 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
              {/* 6-dot drag handle */}
              <div className="flex items-center gap-0.5 px-1 text-slate-500 cursor-move">
                <span className="text-xs">⋮⋮</span>
              </div>

              {/* Color Swatch */}
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-black/30 border border-white/5">
                <span className="w-3.5 h-3.5 rounded-full bg-[#2962FF] ring-2 ring-white/30" />
              </div>

              <div className="w-[1px] h-4 bg-white/10 my-auto" />

              {/* Line Thickness */}
              <button
                type="button"
                onClick={() => {
                  saveTrendlines((prev) =>
                    prev.map((l) => (l.id === selectedLine.id ? { ...l, lineWidth: l.lineWidth === 2 ? 3 : 2 } : l))
                  );
                }}
                className="px-2 py-0.5 rounded text-[11px] font-mono-num font-bold text-white bg-white/5 hover:bg-white/10"
              >
                {selectedLine.lineWidth}px
              </button>

              <div className="w-[1px] h-4 bg-white/10 my-auto" />

              {/* Lock Button */}
              <button
                type="button"
                onClick={() => {
                  setIsDrawLocked(!isDrawLocked);
                  setToastMsg(!isDrawLocked ? 'Garis Terkunci' : 'Kunci Garis Dibuka');
                  setTimeout(() => setToastMsg(null), 2000);
                }}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5"
                title="Kunci Garis"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d={isDrawLocked ? 'M7 11V7a5 5 0 0 1 10 0v4' : 'M7 11V7a5 5 0 0 1 9.9-1'} />
                </svg>
              </button>

              {/* Delete Line Button */}
              <button
                type="button"
                onClick={() => {
                  saveTrendlines((prev) => prev.filter((l) => l.id !== selectedLine.id));
                  setSelectedLineId(null);
                  setToastMsg('Garis Tren Dihapus');
                  setTimeout(() => setToastMsg(null), 2000);
                }}
                className="p-1 rounded text-[#FF5C77] hover:bg-[#FF5C77]/20"
                title="Hapus Garis"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          )}

          {/* DYNAMIC ANCHORED SVG DRAWING LAYER */}
          <svg
            ref={drawingLayerRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            className={`absolute inset-0 w-full h-full z-10 ${
              activeDrawingTool === 'crosshair'
                ? 'pointer-events-none'
                : 'cursor-crosshair pointer-events-auto'
            }`}
          >
            {/* Render Anchored Trendlines for current symbol */}
            {!isHideDrawings &&
              assetTrendlines.map((line) => {
                const p1 = timePriceToScreen(line.time1, line.price1);
                const p2 = timePriceToScreen(line.time2, line.price2);
                if (!p1 || !p2) return null;

                return (
                  <g key={line.id} onClick={() => setSelectedLineId(line.id)} className="cursor-pointer">
                    <line
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke={line.color}
                      strokeWidth={line.lineWidth}
                      strokeDasharray={line.lineStyle === 'dashed' ? '5 5' : undefined}
                      strokeLinecap="round"
                    />
                    <circle cx={p1.x} cy={p1.y} r="5" fill="#FFFFFF" stroke={line.color} strokeWidth="2" />
                    <circle cx={p2.x} cy={p2.y} r="5" fill="#FFFFFF" stroke={line.color} strokeWidth="2" />
                  </g>
                );
              })}

            {/* Current Active Dragging Trendline */}
            {isMouseDown && activeDrawingTool === 'trendline' && dragStartCoord && currentMouseCoord && (
              <g>
                <line
                  x1={dragStartCoord.x}
                  y1={dragStartCoord.y}
                  x2={currentMouseCoord.x}
                  y2={currentMouseCoord.y}
                  stroke="#2962FF"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />
                <circle cx={dragStartCoord.x} cy={dragStartCoord.y} r="5" fill="#FFFFFF" stroke="#2962FF" strokeWidth="2" />
                <circle cx={currentMouseCoord.x} cy={currentMouseCoord.y} r="5" fill="#FFFFFF" stroke="#2962FF" strokeWidth="2" />
              </g>
            )}

            {/* Render Brush Strokes for current symbol */}
            {!isHideDrawings &&
              brushStrokes
                .filter((s) => s.symbol === selectedAsset.symbol)
                .map((stroke) => {
                  const screenPts = stroke.points
                    .map((p) => timePriceToScreen(p.time, p.price))
                    .filter((p): p is { x: number; y: number } => p !== null && p !== undefined);

                  if (screenPts.length < 2) return null;

                  return (
                    <path
                      key={stroke.id}
                      d={screenPts.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '')}
                      fill="none"
                      stroke={stroke.color}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  );
                })}

            {/* Current Active Freehand Brush Stroke */}
            {isMouseDown && activeDrawingTool === 'brush' && currentBrushCoords.length > 1 && (
              <path
                d={currentBrushCoords
                  .map((p) => timePriceToScreen(p.time, p.price))
                  .filter((p): p is { x: number; y: number } => p !== null && p !== undefined)
                  .reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '')}
                fill="none"
                stroke="#00E163"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Ruler Live Measurement Box */}
            {isMouseDown && activeDrawingTool === 'ruler' && rulerStartCoord && currentMouseCoord && (
              <g>
                <rect
                  x={Math.min(rulerStartCoord.x, currentMouseCoord.x)}
                  y={Math.min(rulerStartCoord.y, currentMouseCoord.y)}
                  width={Math.abs(currentMouseCoord.x - rulerStartCoord.x)}
                  height={Math.abs(currentMouseCoord.y - rulerStartCoord.y)}
                  fill="rgba(41, 98, 255, 0.15)"
                  stroke="#2962FF"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                <line x1={rulerStartCoord.x} y1={rulerStartCoord.y} x2={currentMouseCoord.x} y2={currentMouseCoord.y} stroke="#2962FF" strokeWidth="2" />
              </g>
            )}
          </svg>

          {/* BLUE PRICE & TIME AXIS BADGES (Kotak-Kotak Biru TradingView) */}
          {selectedLine && !isHideDrawings && (() => {
            const p1 = timePriceToScreen(selectedLine.time1, selectedLine.price1);
            const p2 = timePriceToScreen(selectedLine.time2, selectedLine.price2);
            if (!p1 || !p2) return null;

            return (
              <>
                <div
                  style={{ top: `${p1.y}px` }}
                  className="absolute right-0 z-30 pointer-events-none -translate-y-1/2 flex items-center px-2 py-0.5 rounded-l bg-[#2962FF] text-white text-[11px] font-mono-num font-black shadow-lg"
                >
                  <span>{selectedAsset.prefix}{selectedLine.price1.toLocaleString('en-US', { minimumFractionDigits: selectedAsset.decimals })}</span>
                </div>

                <div
                  style={{ top: `${p2.y}px` }}
                  className="absolute right-0 z-30 pointer-events-none -translate-y-1/2 flex items-center px-2 py-0.5 rounded-l bg-[#2962FF] text-white text-[11px] font-mono-num font-black shadow-lg"
                >
                  <span>{selectedAsset.prefix}{selectedLine.price2.toLocaleString('en-US', { minimumFractionDigits: selectedAsset.decimals })}</span>
                </div>

                <div
                  style={{ left: `${p1.x}px` }}
                  className="absolute bottom-0 z-30 pointer-events-none -translate-x-1/2 flex items-center px-2 py-0.5 rounded-t bg-[#2962FF] text-white text-[10px] font-mono-num font-bold shadow-lg whitespace-nowrap"
                >
                  <span>{selectedLine.timeLabel1}</span>
                </div>

                <div
                  style={{ left: `${p2.x}px` }}
                  className="absolute bottom-0 z-30 pointer-events-none -translate-x-1/2 flex items-center px-2 py-0.5 rounded-t bg-[#2962FF] text-white text-[10px] font-mono-num font-bold shadow-lg whitespace-nowrap"
                >
                  <span>{selectedLine.timeLabel2}</span>
                </div>
              </>
            );
          })()}

          {/* OVERLAY 1: AUTHENTIC TRADINGVIEW FIBONACCI RETRACEMENT */}
          {showFibonacci && !isHideDrawings && (
            <div className="absolute inset-x-0 top-12 bottom-16 pointer-events-none z-10 flex flex-col justify-between px-6 border-l-2 border-dashed border-[#2962FF]/50">
              {[
                { level: '0.0% (0.00)', color: '#FF5C77', bg: 'rgba(255, 92, 119, 0.08)', priceOffset: 1.035 },
                { level: '23.6% (0.236)', color: '#FF8A00', bg: 'rgba(255, 138, 0, 0.08)', priceOffset: 1.025 },
                { level: '38.2% (0.382)', color: '#FFD600', bg: 'rgba(255, 214, 0, 0.08)', priceOffset: 1.015 },
                { level: '50.0% (0.500)', color: '#00E163', bg: 'rgba(0, 225, 99, 0.08)', priceOffset: 1.000 },
                { level: '61.8% Golden (0.618)', color: '#00D1FF', bg: 'rgba(0, 209, 255, 0.08)', priceOffset: 0.985 },
                { level: '78.6% (0.786)', color: '#6366F1', bg: 'rgba(99, 102, 241, 0.08)', priceOffset: 0.975 },
                { level: '100.0% (1.000)', color: '#EC4899', bg: 'rgba(236, 72, 153, 0.08)', priceOffset: 0.965 },
              ].map((fib, idx) => (
                <div key={idx} className="relative flex items-center justify-between w-full h-7 border-t border-dashed" style={{ borderColor: fib.color, backgroundColor: fib.bg }}>
                  <span className="text-[10px] font-mono-num font-bold px-2 py-0.5 rounded shadow-sm backdrop-blur-sm" style={{ color: fib.color }}>
                    Fib {fib.level} : {selectedAsset.prefix}{(selectedAsset.price * fib.priceOffset).toFixed(selectedAsset.decimals)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* OVERLAY 2: TRADINGVIEW LONG / SHORT POSITION RISK:REWARD BOX */}
          {showRiskReward && !isHideDrawings && (
            <div className="absolute left-[35%] top-[25%] z-10 pointer-events-none flex flex-col w-72 rounded-2xl border border-white/20 shadow-2xl overflow-hidden backdrop-blur-md">
              <div className="p-3 bg-[#00E163]/25 border-b border-[#00E163] flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs font-black text-[#00E163] font-mono-num">
                  <span>TARGET (TP): +3.40%</span>
                  <span>{selectedAsset.prefix}{(selectedAsset.price * 1.034).toFixed(selectedAsset.decimals)}</span>
                </div>
                <span className="text-[10px] text-slate-200">Keuntungan Potensial: +$340.00 USDT</span>
              </div>

              <div className="px-3 py-1 bg-[#1F1E25] flex items-center justify-between text-[11px] font-bold text-white border-y border-white/10 font-mono-num">
                <span>Entry Price: {selectedAsset.prefix}{selectedAsset.price.toFixed(selectedAsset.decimals)}</span>
                <span className="text-[#00E163] font-black">R:R 1 : 2.43</span>
              </div>

              <div className="p-3 bg-[#FF5C77]/25 border-t border-[#FF5C77] flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs font-black text-[#FF5C77] font-mono-num">
                  <span>STOP LOSS (SL): -1.40%</span>
                  <span>{selectedAsset.prefix}{(selectedAsset.price * 0.986).toFixed(selectedAsset.decimals)}</span>
                </div>
                <span className="text-[10px] text-slate-200">Risiko Maksimal: -$140.00 USDT</span>
              </div>
            </div>
          )}

          {/* OVERLAY 3: HARMONIC X-A-B-C-D PIVOT PATTERN */}
          {showHarmonicPattern && !isHideDrawings && (
            <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-around px-20">
              {['X (Start)', 'A (Peak)', 'B (Retrace)', 'C (Swing)', 'D (Breakout)'].map((pivot, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-[#00E163] shadow-[0_0_8px_#00E163] animate-pulse" />
                  <span className="px-2 py-0.5 rounded bg-[#1F1E25] border border-[#00E163] text-[10px] font-bold text-white font-mono-num">
                    {pivot}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* OVERLAY 4: RULER MEASUREMENT BADGE */}
          {showRulerMeasure && !isHideDrawings && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#1F1E25]/95 border border-[#2962FF] text-white text-xs font-mono-num shadow-2xl backdrop-blur-md">
              <div className="w-2.5 h-2.5 rounded-full bg-[#2962FF] animate-ping" />
              <span>Rentang: <strong>24 Bar</strong> (24m)</span>
              <span>•</span>
              <span className="text-[#2962FF] font-bold">Delta: +{selectedAsset.prefix}{(selectedAsset.price * 0.018).toFixed(selectedAsset.decimals)} (+1.80%)</span>
              <span>•</span>
              <span>Vol: <strong>14.2K</strong></span>
            </div>
          )}

          {/* OVERLAY 5: CUSTOM TEXT ANNOTATION CALLOUTS */}
          {!isHideDrawings &&
            textAnnotations
              .filter((t) => t.symbol === selectedAsset.symbol)
              .map((ann) => {
                const pos = timePriceToScreen(ann.time, ann.price);
                if (!pos) return null;

                return (
                  <div
                    key={ann.id}
                    style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
                    className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1F1E25]/90 border border-[#2962FF] text-white text-xs font-bold font-heading shadow-xl backdrop-blur-md"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#2962FF]" />
                    <span>{ann.text}</span>
                  </div>
                );
              })}

          {/* OVERLAY 6: STAMP SIGNAL BADGES */}
          {!isHideDrawings &&
            stampMarkers
              .filter((m) => m.symbol === selectedAsset.symbol)
              .map((stamp) => {
                const pos = timePriceToScreen(stamp.time, stamp.price);
                if (!pos) return null;

                return (
                  <div
                    key={stamp.id}
                    style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
                    className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#18171E] border border-white/20 text-white text-xs font-bold shadow-2xl animate-bounce"
                  >
                    <span>{stamp.icon}</span>
                    <span className="text-[10px] text-slate-300">{stamp.label}</span>
                  </div>
                );
              })}
        </div>

        {/* RIGHT SIDEBAR: WATCHLIST & ASSET PERFORMANCE */}
        <div className="w-72 bg-[#18171E] border-l border-white/5 flex flex-col flex-shrink-0 hidden md:flex">
          {/* Watchlist Header */}
          <div className="flex items-center justify-between p-3 border-b border-white/5">
            <span className="font-extrabold text-xs text-white font-heading uppercase tracking-wider">Watchlist 18 Pasar</span>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded font-mono-num">{PRO_ASSETS.length} Aset</span>
            </div>
          </div>

          {/* Watchlist Items Scroll */}
          <div className="flex-1 overflow-y-auto custom-positions-scrollbar p-1.5 flex flex-col gap-1">
            {PRO_ASSETS.map((item) => {
              const isSelected = selectedAsset.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectAsset(item)}
                  className={`flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                    isSelected ? 'bg-[#26252E] border border-[#2962FF]/40 shadow-sm' : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MarketIcon symbol={item.symbol} size="sm" />
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-white leading-tight">{item.id}</span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[100px]">{item.name}</span>
                    </div>
                  </div>

                  <div className="flex flex-col text-right font-mono-num">
                    <span className="font-bold text-xs text-white">{item.prefix}{item.price.toLocaleString('en-US', { minimumFractionDigits: item.decimals })}</span>
                    <span className={`text-[10px] font-bold ${item.changePct >= 0 ? 'text-[#00E163]' : 'text-[#FF5C77]'}`}>
                      {item.changePct >= 0 ? '+' : ''}{item.changePct.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Asset Performance Summary Card */}
          <div className="p-3 bg-[#14131A] border-t border-white/5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MarketIcon symbol={selectedAsset.symbol} size="sm" />
                <span className="font-extrabold text-xs text-white font-heading">{selectedAsset.name}</span>
              </div>
              <span className="text-[10px] text-[#00E163] font-bold px-1.5 py-0.5 rounded bg-[#00E163]/10">
                Market Open
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-white font-mono-num">
                {selectedAsset.prefix}{selectedAsset.price.toLocaleString('en-US', { minimumFractionDigits: selectedAsset.decimals })}
              </span>
              <span className={`text-xs font-bold font-mono-num ${selectedAsset.changePct >= 0 ? 'text-[#00E163]' : 'text-[#FF5C77]'}`}>
                {selectedAsset.changePct >= 0 ? '+' : ''}{selectedAsset.change.toFixed(selectedAsset.decimals)} ({selectedAsset.changePct.toFixed(2)}%)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-mono-num pt-1 border-t border-white/5">
              <div>
                <span>24H High: </span>
                <span className="text-white font-bold">{selectedAsset.prefix}{selectedAsset.high24h.toFixed(selectedAsset.decimals)}</span>
              </div>
              <div>
                <span>24H Low: </span>
                <span className="text-white font-bold">{selectedAsset.prefix}{selectedAsset.low24h.toFixed(selectedAsset.decimals)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
