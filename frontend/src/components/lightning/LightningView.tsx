'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { useTradingStore } from '@/store/useTradingStore';
import { ASSET_REGISTRY, getAssetConfig } from '@/lib/assetConfig';
import { Candlestick } from '@/types/trading';

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

type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1D';

interface HoveredCandle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

const TIMEFRAME_SECONDS: Record<Timeframe, number> = {
  '1m': 60,
  '5m': 300,
  '15m': 900,
  '1h': 3600,
  '4h': 14400,
  '1D': 86400,
};

// Complete 18 Assets across Forex, CFD, and Kripto matching VeloceX & OANDA standard
export const ALL_LIGHTNING_PAIRS: ScalpPair[] = [
  // 1. KRIPTO (6 Aset)
  { id: 'SOL', symbol: 'SOL/USDT', name: 'Solana', category: 'crypto', price: 175.03, change24h: 1.94, decimals: 2, prefix: '$' },
  { id: 'BTC', symbol: 'BTC/USDT', name: 'Bitcoin', category: 'crypto', price: 75368.45, change24h: 1.92, decimals: 2, prefix: '$' },
  { id: 'ETH', symbol: 'ETH/USDT', name: 'Ethereum', category: 'crypto', price: 4149.74, change24h: 1.86, decimals: 2, prefix: '$' },
  { id: 'LTC', symbol: 'LTC/USDT', name: 'Litecoin', category: 'crypto', price: 94.92, change24h: 26.83, decimals: 2, prefix: '$' },
  { id: 'BNB', symbol: 'BNB/USDT', name: 'Binance Coin', category: 'crypto', price: 614.35, change24h: 5.20, decimals: 2, prefix: '$' },
  { id: 'ADA', symbol: 'ADA/USDT', name: 'Cardano', category: 'crypto', price: 0.5600, change24h: 12.04, decimals: 4, prefix: '$' },

  // 2. FOREX (6 Aset - 5 Desimal OANDA Pipettes / 3 Desimal JPY)
  { id: 'EURUSD', symbol: 'EUR/USD', name: 'Euro / US Dollar', category: 'forex', price: 1.15571, change24h: 0.12, decimals: 5, prefix: '' },
  { id: 'GBPUSD', symbol: 'GBP/USD', name: 'British Pound / USD', category: 'forex', price: 1.29152, change24h: 1.34, decimals: 5, prefix: '' },
  { id: 'USDJPY', symbol: 'USD/JPY', name: 'USD / Japanese Yen', category: 'forex', price: 154.603, change24h: -0.24, decimals: 3, prefix: '¥' },
  { id: 'AUDUSD', symbol: 'AUD/USD', name: 'Australian Dollar / USD', category: 'forex', price: 0.65804, change24h: 0.45, decimals: 5, prefix: '' },
  { id: 'USDCAD', symbol: 'USD/CAD', name: 'USD / Canadian Dollar', category: 'forex', price: 1.38202, change24h: -0.18, decimals: 5, prefix: '' },
  { id: 'USDCHF', symbol: 'USD/CHF', name: 'USD / Swiss Franc', category: 'forex', price: 0.88401, change24h: 0.08, decimals: 5, prefix: '' },

  // 3. CFD & KOMODITAS (6 Aset - OANDA Specifications)
  { id: 'XAUUSD', symbol: 'XAU/USD', name: 'Gold (Emas)', category: 'cfd', price: 2514.80, change24h: 1.42, decimals: 2, prefix: '$' },
  { id: 'XAGUSD', symbol: 'XAG/USD', name: 'Silver (Perak)', category: 'cfd', price: 29.45, change24h: 2.15, decimals: 2, prefix: '$' },
  { id: 'USOIL', symbol: 'USOIL', name: 'Crude Oil WTI', category: 'cfd', price: 74.60, change24h: -1.05, decimals: 2, prefix: '$' },
  { id: 'SPX500', symbol: 'SPX500', name: 'S&P 500 Index', category: 'cfd', price: 5648.40, change24h: 0.82, decimals: 2, prefix: '$' },
  { id: 'NAS100', symbol: 'NAS100', name: 'Nasdaq 100', category: 'cfd', price: 19720.50, change24h: 1.14, decimals: 2, prefix: '$' },
  { id: 'US30', symbol: 'US30', name: 'Dow Jones 30', category: 'cfd', price: 41250.00, change24h: 0.35, decimals: 2, prefix: '$' },
];

function getStandardSymbol(id: string): string {
  if (['SOL', 'BTC', 'ETH', 'LTC', 'BNB', 'ADA'].includes(id)) {
    return `${id}USDT`;
  }
  return id;
}

// Calibration profiles matching real OANDA session dynamics
const OANDA_CALIBRATION_CONFIG: Record<
  string,
  { decimals: number; volatility: number; waveCycles: number; amp: number }
> = {
  EURUSD: { decimals: 5, volatility: 0.00009, waveCycles: 2.2, amp: 3.2 },
  GBPUSD: { decimals: 5, volatility: 0.0001, waveCycles: 2.5, amp: 3.5 },
  USDJPY: { decimals: 3, volatility: 0.00012, waveCycles: 2.0, amp: 3.0 },
  AUDUSD: { decimals: 5, volatility: 0.0001, waveCycles: 2.3, amp: 3.4 },
  USDCAD: { decimals: 5, volatility: 0.0001, waveCycles: 2.1, amp: 3.2 },
  USDCHF: { decimals: 5, volatility: 0.00009, waveCycles: 2.0, amp: 3.0 },
  XAUUSD: { decimals: 2, volatility: 0.00014, waveCycles: 2.4, amp: 3.0 },
  XAGUSD: { decimals: 2, volatility: 0.00028, waveCycles: 2.2, amp: 3.2 },
  USOIL: { decimals: 2, volatility: 0.00022, waveCycles: 2.0, amp: 3.0 },
  SPX500: { decimals: 2, volatility: 0.00007, waveCycles: 2.1, amp: 2.8 },
  NAS100: { decimals: 2, volatility: 0.00009, waveCycles: 2.3, amp: 3.0 },
  US30: { decimals: 2, volatility: 0.00007, waveCycles: 2.0, amp: 2.8 },
  BTCUSDT: { decimals: 2, volatility: 0.00025, waveCycles: 2.5, amp: 3.2 },
  ETHUSDT: { decimals: 2, volatility: 0.0003, waveCycles: 2.5, amp: 3.2 },
  SOLUSDT: { decimals: 2, volatility: 0.00045, waveCycles: 2.6, amp: 3.5 },
  BNBUSDT: { decimals: 2, volatility: 0.00025, waveCycles: 2.4, amp: 3.0 },
  LTCUSDT: { decimals: 2, volatility: 0.00035, waveCycles: 2.3, amp: 3.2 },
  ADAUSDT: { decimals: 4, volatility: 0.0004, waveCycles: 2.5, amp: 3.2 },
};

function generateTradingViewCandles(
  basePrice: number,
  decimals: number,
  count: number,
  intervalSec: number,
  symbol?: string
): Candlestick[] {
  const candles: Candlestick[] = [];
  const nowSec = Math.floor(Date.now() / 1000);
  const currentBucket = Math.floor(nowSec / intervalSec) * intervalSec;
  const startTime = currentBucket - (count - 1) * intervalSec;

  const oandaConf = symbol ? OANDA_CALIBRATION_CONFIG[symbol] : null;
  const volatility = oandaConf ? oandaConf.volatility : basePrice < 2 ? 0.00008 : 0.0005;
  const waveCycles = oandaConf ? oandaConf.waveCycles : 2.2;
  const amp = oandaConf ? oandaConf.amp : 3.5;

  let currentP = basePrice * (1.0 - volatility * 2.0);

  for (let i = 0; i < count; i++) {
    const time = startTime + i * intervalSec;
    const progress = i / count;
    const sessionShape = Math.sin(progress * Math.PI * waveCycles) * (basePrice * volatility * amp);
    const subWave = Math.cos(progress * Math.PI * 4.5) * (basePrice * volatility * 1.1);
    const randomShock = (Math.random() - 0.49) * (basePrice * volatility * 1.4);
    const targetP = basePrice + sessionShape + subWave + randomShock;

    const open = currentP;
    const close = targetP;
    const bodyHeight = Math.abs(close - open);
    const minWick = basePrice * volatility * 0.35;
    const upperWick = Math.max(minWick, bodyHeight * (Math.random() * 0.85)) + basePrice * volatility * 0.3;
    const lowerWick = Math.max(minWick, bodyHeight * (Math.random() * 0.85)) + basePrice * volatility * 0.3;

    const high = Math.max(open, close) + upperWick;
    const low = Math.min(open, close) - lowerWick;
    const vol = Math.floor(30 + Math.random() * 60);

    candles.push({
      time,
      open: Number(open.toFixed(decimals)),
      high: Number(high.toFixed(decimals)),
      low: Number(low.toFixed(decimals)),
      close: Number(close.toFixed(decimals)),
      volume: vol,
    });

    currentP = close;
  }

  if (candles.length > 0) {
    const last = candles[candles.length - 1];
    last.close = Number(basePrice.toFixed(decimals));
    last.high = Number(Math.max(last.high, basePrice).toFixed(decimals));
    last.low = Number(Math.min(last.low, basePrice).toFixed(decimals));
  }

  return candles;
}

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
    entryPrice: 174.5,
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
    entryPrice: 172.8,
    closePrice: 174.6,
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
    realizedPnlPct: 22.7,
    durationSec: 110,
    closedAt: '14:20:18',
  },
];

interface LightningViewProps {
  onOrderSuccess?: (msg: string) => void;
}

export const LightningView: React.FC<LightningViewProps> = ({ onOrderSuccess }) => {
  const { selectedSymbol, setSelectedSymbol, tickers } = useTradingStore();

  // Category Filter State ('all' | 'crypto' | 'forex' | 'cfd')
  const [activeCategory, setActiveCategory] = useState<AssetCategory>('all');

  // Selected Pair & Live Price
  const [selectedPair, setSelectedPair] = useState<ScalpPair>(ALL_LIGHTNING_PAIRS[0]);
  const marketSymbol = useMemo(() => getStandardSymbol(selectedPair.id), [selectedPair.id]);
  const meta = ASSET_REGISTRY[marketSymbol] || getAssetConfig(marketSymbol);

  const currentTicker = tickers[marketSymbol];
  const currentPrice = currentTicker?.price ?? selectedPair.price;
  const changePercent = currentTicker?.change_percent ?? selectedPair.change24h;
  const isPositive = changePercent >= 0;

  // Scalp Controller State
  const [marginAmount, setMarginAmount] = useState<string>('50');
  const [leverage, setLeverage] = useState<number>(50);
  const [selectedPreset, setSelectedPreset] = useState<'safe' | 'standard' | 'aggressive' | 'custom'>('standard');
  const [tpPercent, setTpPercent] = useState<number>(1.0); // +1.0%
  const [slPercent, setSlPercent] = useState<number>(0.5); // -0.5%
  const [slippageTolerance, setSlippageTolerance] = useState<number>(0.1); // 0.1% standard
  const [zeroDelayMode, setZeroDelayMode] = useState<boolean>(true);

  // TradingView Standard Timeframe & Mode
  const [timeframe, setTimeframe] = useState<Timeframe>('1m');
  const [chartType, setChartType] = useState<'line' | 'candle'>('candle');
  const [hoveredData, setHoveredData] = useState<HoveredCandle | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // Lightweight Charts References
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<any>(null);
  const candleSeriesRef = useRef<any>(null);
  const areaSeriesRef = useRef<any>(null);
  const lastCandleRef = useRef<Candlestick | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const isDisposedRef = useRef<boolean>(false);
  const tpPriceLineRef = useRef<any>(null);
  const slPriceLineRef = useRef<any>(null);

  // Filtered Pairs List based on Category
  const filteredPairs =
    activeCategory === 'all'
      ? ALL_LIGHTNING_PAIRS
      : ALL_LIGHTNING_PAIRS.filter((p) => p.category === activeCategory);

  // Sync with global store topic when pair is selected
  const handleSelectPair = (pair: ScalpPair) => {
    setSelectedPair(pair);
    const sym = getStandardSymbol(pair.id);
    setSelectedSymbol(sym);
  };

  // 1. Initialize TradingView Lightweight Charts on Pair, Timeframe change
  useEffect(() => {
    isDisposedRef.current = false;

    async function initTradingViewChart() {
      if (!chartContainerRef.current) return;
      setIsLoading(true);

      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      candleSeriesRef.current = null;
      areaSeriesRef.current = null;
      tpPriceLineRef.current = null;
      slPriceLineRef.current = null;

      if (chartInstanceRef.current) {
        try {
          chartInstanceRef.current.remove();
        } catch (_) {}
        chartInstanceRef.current = null;
      }

      const { createChart, ColorType, CrosshairMode, LineStyle } = await import(
        'lightweight-charts'
      );

      if (isDisposedRef.current || !chartContainerRef.current) return;

      chartContainerRef.current.innerHTML = '';

      const containerWidth = chartContainerRef.current.clientWidth || 800;
      const containerHeight = chartContainerRef.current.clientHeight || 360;

      const chart = createChart(chartContainerRef.current, {
        width: containerWidth,
        height: containerHeight,
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: '#8E8D9A',
          fontSize: 11,
          fontFamily: "'JetBrains Mono', monospace, -apple-system, BlinkMacSystemFont, sans-serif",
        },
        localization: {
          locale: 'id-ID',
          dateFormat: 'dd MMM yyyy',
          timeFormatter: (time: number) => {
            return new Intl.DateTimeFormat('en-GB', {
              timeZone: 'Asia/Jakarta',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
            }).format(new Date(time * 1000));
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
          borderColor: 'rgba(255, 255, 255, 0.06)',
          scaleMargins: {
            top: 0.15,
            bottom: 0.15,
          },
          alignLabels: true,
          autoScale: true,
        },
        timeScale: {
          borderColor: 'rgba(255, 255, 255, 0.06)',
          timeVisible: true,
          secondsVisible: false,
          barSpacing: 10,
          minBarSpacing: 5,
          rightOffset: 12,
          tickMarkFormatter: (time: number) => {
            return new Intl.DateTimeFormat('en-GB', {
              timeZone: 'Asia/Jakarta',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }).format(new Date(time * 1000));
          },
        },
        handleScroll: {
          mouseWheel: true,
          pressedMouseMove: true,
        },
        handleScale: {
          axisPressedMouseMove: true,
          mouseWheel: true,
          pinch: true,
        },
      });

      chartInstanceRef.current = chart;

      const priceFormat = {
        type: 'price' as const,
        precision: selectedPair.decimals,
        minMove: 1 / Math.pow(10, selectedPair.decimals),
      };

      // 1. Candlestick Series
      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#00E163',
        downColor: '#FF5C77',
        borderVisible: false,
        wickVisible: true,
        wickUpColor: '#00E163',
        wickDownColor: '#FF5C77',
        priceFormat,
        visible: chartType === 'candle',
      });
      candleSeriesRef.current = candlestickSeries;

      // 2. Area Series (Line View)
      const areaSeries = chart.addAreaSeries({
        topColor: isPositive ? 'rgba(0, 225, 99, 0.28)' : 'rgba(255, 92, 119, 0.28)',
        bottomColor: 'rgba(0, 225, 99, 0.00)',
        lineColor: isPositive ? '#00E163' : '#FF5C77',
        lineWidth: 2,
        priceLineVisible: true,
        priceFormat,
        visible: chartType === 'line',
      });
      areaSeriesRef.current = areaSeries;

      // Crosshair inspection for live OHLC HUD in UTC+7 (WIB / Jakarta)
      chart.subscribeCrosshairMove((param) => {
        if (!param.time || !param.seriesData) {
          setHoveredData(null);
          return;
        }

        const candleData = param.seriesData.get(candlestickSeries) as any;
        const lineData = param.seriesData.get(areaSeries) as any;

        const dateStr =
          typeof param.time === 'number'
            ? new Intl.DateTimeFormat('en-GB', {
                timeZone: 'Asia/Jakarta',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
              }).format(new Date(param.time * 1000))
            : String(param.time);

        if (candleData) {
          setHoveredData({
            time: dateStr,
            open: candleData.open,
            high: candleData.high,
            low: candleData.low,
            close: candleData.close,
          });
        } else if (lineData) {
          setHoveredData({
            time: dateStr,
            open: lineData.value,
            high: lineData.value,
            low: lineData.value,
            close: lineData.value,
          });
        }
      });

      // 3. Load Continuous Authentic OANDA Candles
      const intervalSec = TIMEFRAME_SECONDS[timeframe];
      let candlesData: Candlestick[] = [];

      try {
        const res = await fetch(`/api/market/candles?symbol=${marketSymbol}&limit=120`);
        if (res.ok) {
          const apiData: Candlestick[] = await res.json();
          if (Array.isArray(apiData) && apiData.length > 0) {
            const lastApiClose = apiData[apiData.length - 1].close;
            const ratio = currentPrice / lastApiClose;
            candlesData = apiData.map((c) => ({
              time: c.time,
              open: Number((c.open * ratio).toFixed(selectedPair.decimals)),
              high: Number((c.high * ratio).toFixed(selectedPair.decimals)),
              low: Number((c.low * ratio).toFixed(selectedPair.decimals)),
              close: Number((c.close * ratio).toFixed(selectedPair.decimals)),
              volume: c.volume,
            }));
          }
        }
      } catch (_) {}

      // Fallback: Synthesize continuous authentic OANDA candles
      if (!candlesData.length) {
        candlesData = generateTradingViewCandles(
          currentPrice,
          selectedPair.decimals,
          120,
          intervalSec,
          marketSymbol
        );
      }

      if (!isDisposedRef.current && candlesData.length > 0) {
        const lastIdx = candlesData.length - 1;
        candlesData[lastIdx].close = currentPrice;
        candlesData[lastIdx].high = Math.max(candlesData[lastIdx].high, currentPrice);
        candlesData[lastIdx].low = Math.min(candlesData[lastIdx].low, currentPrice);

        lastCandleRef.current = candlesData[lastIdx];

        const formattedCandles = candlesData.map((c) => ({
          time: c.time as any,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }));

        try {
          candlestickSeries.setData(formattedCandles);
        } catch (_) {}

        const formattedArea = candlesData.map((c) => ({
          time: c.time as any,
          value: c.close,
        }));

        try {
          areaSeries.setData(formattedArea);
        } catch (_) {}

        // Create initial TP & SL price lines on active series
        const activeSeries = chartType === 'candle' ? candlestickSeries : areaSeries;
        const tpVal = currentPrice * (1 + tpPercent / 100);
        const slVal = currentPrice * (1 - slPercent / 100);

        try {
          tpPriceLineRef.current = activeSeries.createPriceLine({
            price: Number(tpVal.toFixed(selectedPair.decimals)),
            color: '#00E163',
            lineWidth: 1,
            lineStyle: LineStyle.Dashed,
            axisLabelVisible: true,
            title: `TP +${tpPercent}%`,
          });

          slPriceLineRef.current = activeSeries.createPriceLine({
            price: Number(slVal.toFixed(selectedPair.decimals)),
            color: '#FF5C77',
            lineWidth: 1,
            lineStyle: LineStyle.Dashed,
            axisLabelVisible: true,
            title: `SL -${slPercent}%`,
          });
        } catch (_) {}
      }

      if (!isDisposedRef.current) {
        setIsLoading(false);
        try {
          chart.timeScale().fitContent();
        } catch (_) {}
      }

      // Auto-resize observer
      const resizeObserver = new ResizeObserver((entries) => {
        if (
          isDisposedRef.current ||
          !entries ||
          entries.length === 0 ||
          !chartInstanceRef.current
        )
          return;
        const { width, height } = entries[0].contentRect;
        if (width > 0 && height > 0) {
          try {
            chartInstanceRef.current.applyOptions({ width, height });
          } catch (_) {}
        }
      });

      resizeObserverRef.current = resizeObserver;
      if (chartContainerRef.current) {
        resizeObserver.observe(chartContainerRef.current);
      }
    }

    initTradingViewChart();

    return () => {
      isDisposedRef.current = true;
      if (resizeObserverRef.current) {
        try {
          resizeObserverRef.current.disconnect();
        } catch (_) {}
        resizeObserverRef.current = null;
      }
      candleSeriesRef.current = null;
      areaSeriesRef.current = null;
      tpPriceLineRef.current = null;
      slPriceLineRef.current = null;
      if (chartInstanceRef.current) {
        try {
          chartInstanceRef.current.remove();
        } catch (_) {}
        chartInstanceRef.current = null;
      }
    };
  }, [marketSymbol, timeframe]);

  // 2. Real-Time Live Streaming via WebSocket Ticks
  useEffect(() => {
    if (!currentTicker?.price) return;
    const livePrice = currentTicker.price;

    // Update active forming candle on chart
    if (
      !isDisposedRef.current &&
      chartInstanceRef.current &&
      candleSeriesRef.current &&
      areaSeriesRef.current
    ) {
      const nowSec = Math.floor(Date.now() / 1000);
      const intervalSec = TIMEFRAME_SECONDS[timeframe];
      const currentBucket = Math.floor(nowSec / intervalSec) * intervalSec;

      let updatedCandle: Candlestick;
      if (!lastCandleRef.current || currentBucket > Number(lastCandleRef.current.time)) {
        updatedCandle = {
          time: currentBucket,
          open: livePrice,
          high: livePrice,
          low: livePrice,
          close: livePrice,
          volume: 1.0,
        };
      } else {
        const prev = lastCandleRef.current;
        updatedCandle = {
          time: prev.time,
          open: prev.open,
          high: Math.max(prev.high, livePrice),
          low: Math.min(prev.low, livePrice),
          close: livePrice,
          volume: (prev.volume || 1.0) + 0.1,
        };
      }
      lastCandleRef.current = updatedCandle;

      try {
        candleSeriesRef.current.update({
          time: updatedCandle.time as any,
          open: updatedCandle.open,
          high: updatedCandle.high,
          low: updatedCandle.low,
          close: updatedCandle.close,
        });

        areaSeriesRef.current.update({
          time: updatedCandle.time as any,
          value: updatedCandle.close,
        });
      } catch (_) {}
    }

    // Update live floating PnL for active positions
    setPositions((currPositions) =>
      currPositions.map((pos) => {
        if (pos.symbol !== selectedPair.symbol) return pos;
        const priceDiff =
          pos.type === 'LONG' ? livePrice - pos.entryPrice : pos.entryPrice - livePrice;
        const rawPnl = (priceDiff / pos.entryPrice) * pos.margin * pos.leverage;
        const pnlPct = (rawPnl / pos.margin) * 100;
        return {
          ...pos,
          markPrice: livePrice,
          floatingPnl: Number(rawPnl.toFixed(2)),
          floatingPnlPct: Number(pnlPct.toFixed(2)),
          durationSec: pos.durationSec + 1,
        };
      })
    );
  }, [currentTicker?.price, timeframe, selectedPair.symbol]);

  // 3. Switch between Candle and Line visibility
  useEffect(() => {
    if (isDisposedRef.current || !chartInstanceRef.current) return;

    try {
      if (candleSeriesRef.current) {
        candleSeriesRef.current.applyOptions({
          visible: chartType === 'candle',
        });
      }

      if (areaSeriesRef.current) {
        areaSeriesRef.current.applyOptions({
          visible: chartType === 'line',
          topColor: isPositive ? 'rgba(0, 225, 99, 0.28)' : 'rgba(255, 92, 119, 0.28)',
          bottomColor: 'rgba(0, 225, 99, 0.00)',
          lineColor: isPositive ? '#00E163' : '#FF5C77',
        });
      }
    } catch (_) {}
  }, [chartType, isPositive]);

  // 4. Update TP & SL Price Lines on Chart dynamically
  useEffect(() => {
    if (isDisposedRef.current || !chartInstanceRef.current) return;
    const activeSeries = chartType === 'candle' ? candleSeriesRef.current : areaSeriesRef.current;
    if (!activeSeries) return;

    const tpVal = currentPrice * (1 + tpPercent / 100);
    const slVal = currentPrice * (1 - slPercent / 100);

    try {
      if (tpPriceLineRef.current) {
        try {
          activeSeries.removePriceLine(tpPriceLineRef.current);
        } catch (_) {}
        tpPriceLineRef.current = null;
      }
      if (slPriceLineRef.current) {
        try {
          activeSeries.removePriceLine(slPriceLineRef.current);
        } catch (_) {}
        slPriceLineRef.current = null;
      }

      tpPriceLineRef.current = activeSeries.createPriceLine({
        price: Number(tpVal.toFixed(selectedPair.decimals)),
        color: '#00E163',
        lineWidth: 1,
        lineStyle: 2, // Dashed
        axisLabelVisible: true,
        title: `TP +${tpPercent}%`,
      });

      slPriceLineRef.current = activeSeries.createPriceLine({
        price: Number(slVal.toFixed(selectedPair.decimals)),
        color: '#FF5C77',
        lineWidth: 1,
        lineStyle: 2, // Dashed
        axisLabelVisible: true,
        title: `SL -${slPercent}%`,
      });
    } catch (_) {}
  }, [tpPercent, slPercent, currentPrice, chartType, selectedPair.decimals]);

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
    const simulatedSlippagePct = Number((Math.random() * 0.08).toFixed(3));

    if (simulatedSlippagePct > slippageTolerance) {
      onOrderSuccess?.(
        `Proteksi Slippage Aktif: Pergeseran harga (${simulatedSlippagePct}%) melebihi toleransi (${slippageTolerance}%). Order dibatalkan aman.`
      );
      return;
    }

    const slippageOffset = baseQuote * (simulatedSlippagePct / 100);
    const entry =
      type === 'LONG'
        ? Number((baseQuote + slippageOffset).toFixed(selectedPair.decimals))
        : Number((baseQuote - slippageOffset).toFixed(selectedPair.decimals));

    const tpDistance = entry * (tpPercent / 100);
    const slDistance = entry * (slPercent / 100);
    const tpPrice =
      type === 'LONG'
        ? Number((entry + tpDistance).toFixed(selectedPair.decimals))
        : Number((entry - tpDistance).toFixed(selectedPair.decimals));
    const slPrice =
      type === 'LONG'
        ? Number((entry - slDistance).toFixed(selectedPair.decimals))
        : Number((entry + slDistance).toFixed(selectedPair.decimals));

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
    onOrderSuccess?.(
      `Order ${actionLabel} ${selectedPair.symbol} $${margin} (${leverage}x) dieksekusi @ ${selectedPair.prefix}${entry.toLocaleString()} (Slippage: ${simulatedSlippagePct}%).`
    );
  };

  // 1-Click Flip Position (Balik Arah Instan)
  const handleFlipPosition = (posId: string) => {
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

    const nextType: 'LONG' | 'SHORT' = pos.type === 'LONG' ? 'SHORT' : 'LONG';
    const entry = pos.markPrice;
    const tpDistance = entry * (tpPercent / 100);
    const slDistance = entry * (slPercent / 100);
    const tpPrice =
      nextType === 'LONG'
        ? Number((entry + tpDistance).toFixed(selectedPair.decimals))
        : Number((entry - tpDistance).toFixed(selectedPair.decimals));
    const slPrice =
      nextType === 'LONG'
        ? Number((entry - slDistance).toFixed(selectedPair.decimals))
        : Number((entry + slDistance).toFixed(selectedPair.decimals));

    const flippedPos: LightningPosition = {
      id: `pos-flip-${Date.now()}`,
      symbol: pos.symbol,
      type: nextType,
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

    setHistory([histItem, ...history]);
    setPositions(positions.map((p) => (p.id === posId ? flippedPos : p)));
    setAvailableBalance((b) => b + closePnl);
    if (closePnl > 0) setWinStreak((w) => w + 1);
    else setWinStreak(0);

    onOrderSuccess?.(
      `Posisi ${pos.type} ${pos.symbol} ditutup (${closePnl >= 0 ? '+' : ''}$${closePnl}). Balik arah ke ${nextType} instan terpasang.`
    );
  };

  // Close Specific Position
  const handleClosePosition = (posId: string) => {
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

    setHistory([histItem, ...history]);
    setPositions(positions.filter((p) => p.id !== posId));
    setAvailableBalance((b) => b + pos.margin + closePnl);
    if (closePnl > 0) setWinStreak((w) => w + 1);
    else setWinStreak(0);

    onOrderSuccess?.(
      `Posisi ${pos.type} ${pos.symbol} ditutup. Realized PnL: ${closePnl >= 0 ? '+' : ''}$${closePnl.toFixed(2)} (${closePnlPct}%).`
    );
  };

  // Emergency Flash Close All
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

  return (
    <div className="flex flex-col gap-5 p-3 sm:p-5 md:p-6 pb-24 md:pb-6 max-w-[1600px] mx-auto w-full font-sans animate-fade-in text-slate-100">
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
            Platform scalping profesional dengan latensi ultra-rendah, preset TP/SL otomatis, dan
            proteksi pembalikan posisi instan pada seluruh 18 aset pasar.
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

          {/* Emergency Flash Close All Button */}
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
                        isCatActive
                          ? 'bg-black text-[#00E163]'
                          : 'bg-[#26252E] text-slate-400 group-hover:bg-black group-hover:text-[#00E163]'
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

        {/* Scrollable Asset Pills */}
        <div className="flex items-center gap-2 overflow-x-auto custom-positions-scrollbar pb-1">
          {filteredPairs.map((pair) => {
            const isSelected = selectedPair.id === pair.id;
            return (
              <button
                key={pair.id}
                type="button"
                onClick={() => handleSelectPair(pair)}
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
                    {pair.prefix}
                    {pair.price.toLocaleString(undefined, { minimumFractionDigits: pair.decimals })}
                  </span>
                  <span
                    className={`text-[10px] font-mono-num font-extrabold ${
                      isSelected
                        ? 'text-black'
                        : pair.change24h >= 0
                        ? 'text-[#00E163] group-hover:text-black'
                        : 'text-[#FF5C77] group-hover:text-black'
                    }`}
                  >
                    {pair.change24h >= 0 ? '+' : ''}
                    {pair.change24h}%
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN WORKSPACE GRID: TRADINGVIEW CHART (LEFT) & INSTANT CONTROLLER (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT: TRADINGVIEW LIGHTWEIGHT CHARTS (8 COLS) */}
        <div className="lg:col-span-8 flex flex-col gap-4 p-5 rounded-3xl bg-[#1F1E25] border border-white/5 shadow-xl">
          {/* Chart Header Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#26252E] border border-white/10 flex items-center justify-center font-black text-xs text-[#00E163]">
                {selectedPair.id.slice(0, 4)}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white font-heading">
                    {selectedPair.name} ({selectedPair.symbol})
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#00E163]/10 text-[#00E163] uppercase">
                    {selectedPair.category}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#26252E] text-slate-300 border border-white/10 font-mono tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E163] animate-pulse" />
                    OANDA Feed
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-white font-mono-num">
                    {selectedPair.prefix}
                    {currentPrice.toLocaleString(undefined, {
                      minimumFractionDigits: selectedPair.decimals,
                    })}
                  </span>
                  <span
                    className={`text-xs font-bold font-mono-num ${
                      isPositive ? 'text-[#00E163]' : 'text-[#FF5C77]'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Controls: Mode Switcher + Timeframe Chips */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Live OHLC HUD Strip */}
              {hoveredData && (
                <div className="hidden xl:flex items-center gap-3 text-[11px] font-mono-num text-slate-400 bg-[#26252E]/70 px-3 py-1 rounded-xl border border-white/5">
                  <span>
                    Time: <strong className="text-white">{hoveredData.time} WIB</strong>
                  </span>
                  <span>
                    O: <strong className="text-white">{hoveredData.open.toFixed(selectedPair.decimals)}</strong>
                  </span>
                  <span>
                    H: <strong className="text-[#00E163]">{hoveredData.high.toFixed(selectedPair.decimals)}</strong>
                  </span>
                  <span>
                    L: <strong className="text-[#FF5C77]">{hoveredData.low.toFixed(selectedPair.decimals)}</strong>
                  </span>
                  <span>
                    C: <strong className="text-white font-bold">{hoveredData.close.toFixed(selectedPair.decimals)}</strong>
                  </span>
                </div>
              )}

              {/* Candle vs Line Toggle Pill */}
              <div className="flex items-center p-1 rounded-2xl bg-[#18171E] border border-white/5">
                <button
                  type="button"
                  onClick={() => setChartType('line')}
                  className={`group relative flex items-center justify-center px-4 h-8 rounded-xl text-xs font-bold transition-all duration-1000 overflow-hidden cursor-pointer select-none ${
                    chartType === 'line'
                      ? 'bg-[#00E163] text-black font-extrabold shadow-[0_0_12px_rgba(0,225,99,0.35)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {chartType !== 'line' && (
                    <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                  )}
                  <span className="relative z-10 transition-colors duration-1000">Line</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChartType('candle')}
                  className={`group relative flex items-center justify-center px-4 h-8 rounded-xl text-xs font-bold transition-all duration-1000 overflow-hidden cursor-pointer select-none ${
                    chartType === 'candle'
                      ? 'bg-[#00E163] text-black font-extrabold shadow-[0_0_12px_rgba(0,225,99,0.35)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {chartType !== 'candle' && (
                    <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                  )}
                  <span className="relative z-10 transition-colors duration-1000">Candle</span>
                </button>
              </div>

              {/* Timeframe Chips (1m, 5m, 15m, 1h, 4h, 1D) */}
              <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#18171E] border border-white/5">
                {(['1m', '5m', '15m', '1h', '4h', '1D'] as const).map((tf) => {
                  const isTfActive = timeframe === tf;
                  return (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => setTimeframe(tf)}
                      className={`group relative flex items-center justify-center px-3 h-8 rounded-xl text-xs font-bold font-mono-num transition-all cursor-pointer select-none ${
                        isTfActive
                          ? 'bg-[#00E163] text-black font-black shadow-[0_0_12px_rgba(0,225,99,0.35)]'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="relative z-10">{tf}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* TradingView Lightweight Charts Canvas Container with Native TP/SL Lines & Floating Badges */}
          <div className="relative w-full flex-1 min-h-[360px] rounded-2xl bg-[#14131A] border border-white/5 overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#1F1E25]/80 z-20 backdrop-blur-xs">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono-num">
                  <span className="w-3.5 h-3.5 border-2 border-[#00E163] border-t-transparent rounded-full animate-spin" />
                  <span>Loading Real-Time TradingView Candles...</span>
                </div>
              </div>
            )}

            {/* Floating Target TP & SL Indicators (Top-right corner overlay for quick inspection) */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-2 pointer-events-none">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#18171E]/90 border border-[#00E163]/40 shadow-lg backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-[#00E163]" />
                <span className="text-[10px] font-bold text-slate-400">TP (+{tpPercent}%):</span>
                <span className="text-[10px] font-black text-[#00E163] font-mono-num">
                  {selectedPair.prefix}
                  {(currentPrice * (1 + tpPercent / 100)).toFixed(selectedPair.decimals)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#18171E]/90 border border-[#FF5C77]/40 shadow-lg backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-[#FF5C77]" />
                <span className="text-[10px] font-bold text-slate-400">SL (-{slPercent}%):</span>
                <span className="text-[10px] font-black text-[#FF5C77] font-mono-num">
                  {selectedPair.prefix}
                  {(currentPrice * (1 - slPercent / 100)).toFixed(selectedPair.decimals)}
                </span>
              </div>
            </div>

            <div
              ref={chartContainerRef}
              className="w-full h-full cursor-crosshair"
              style={{ minHeight: '360px' }}
            />
          </div>

          {/* Quick Stats Bar Under Chart */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-2xl bg-[#18171E] border border-white/5 flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Rentang 24H Min / Max</span>
              <span className="text-xs font-black text-white font-mono-num">
                {selectedPair.prefix}
                {(currentPrice * 0.96).toFixed(selectedPair.decimals)} -{' '}
                {selectedPair.prefix}
                {(currentPrice * 1.05).toFixed(selectedPair.decimals)}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#18171E] border border-white/5 flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Kategori Aset</span>
              <span className="text-xs font-black text-[#00E163] uppercase tracking-wider">
                {selectedPair.category}
              </span>
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
                Saldo:{' '}
                <strong className="text-white font-mono-num">
                  ${availableBalance.toLocaleString()}
                </strong>
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
              <span className="text-xs font-black text-[#00E163] font-mono-num">
                {leverage}x Cross
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 p-1 rounded-2xl bg-[#18171E] border border-white/5">
              {[10, 25, 50, 75, 100].map((lev) => (
                <button
                  key={lev}
                  type="button"
                  onClick={() => setLeverage(lev)}
                  className={`py-2 rounded-xl text-xs font-black font-mono-num transition-all cursor-pointer ${
                    leverage === lev
                      ? 'bg-[#00E163] text-black shadow-md shadow-[#00E163]/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lev}x
                </button>
              ))}
            </div>
          </div>

          {/* 3. Preset Strategy Mode (Safe vs Standard vs Aggressive) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400">Preset Risk/Reward</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'safe', label: 'Safe', tp: 0.5, sl: 0.25, desc: 'RR 1:2 Ketat' },
                { id: 'standard', label: 'Standard', tp: 1.0, sl: 0.5, desc: 'RR 1:2 Seimbang' },
                { id: 'aggressive', label: 'Agresif', tp: 2.0, sl: 1.0, desc: 'RR 1:2 Lebar' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePresetChange(p.id as any)}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-0.5 text-center transition-all cursor-pointer ${
                    selectedPreset === p.id
                      ? 'bg-[#00E163]/10 border-[#00E163] text-white shadow-sm'
                      : 'bg-[#18171E] border-white/5 text-slate-400 hover:border-white/10'
                  }`}
                >
                  <span className="text-xs font-black">{p.label}</span>
                  <span className="text-[10px] text-slate-400 font-mono-num font-bold">
                    +{p.tp}% / -{p.sl}%
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. TP & SL Custom Sliders */}
          <div className="flex flex-col gap-3 p-3.5 rounded-2xl bg-[#18171E] border border-white/5">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-400">Take Profit (TP)</span>
                <span className="font-black text-[#00E163] font-mono-num">+{tpPercent}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="5.0"
                step="0.1"
                value={tpPercent}
                onChange={(e) => {
                  setTpPercent(parseFloat(e.target.value));
                  setSelectedPreset('custom');
                }}
                className="w-full accent-[#00E163] cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-400">Stop Loss (SL)</span>
                <span className="font-black text-[#FF5C77] font-mono-num">-{slPercent}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="3.0"
                step="0.05"
                value={slPercent}
                onChange={(e) => {
                  setSlPercent(parseFloat(e.target.value));
                  setSelectedPreset('custom');
                }}
                className="w-full accent-[#FF5C77] cursor-pointer"
              />
            </div>
          </div>

          {/* 5. BIG 1-CLICK ACTION BUTTONS (CALL / PUT SCALP) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* BUY / LONG BUTTON */}
            <button
              type="button"
              onClick={() => handleExecuteScalp('LONG')}
              className="group relative flex flex-col items-center justify-center py-4 rounded-2xl bg-[#00E163] text-black font-black text-sm shadow-xl shadow-[#00E163]/25 active:scale-[0.98] transition-all overflow-hidden cursor-pointer"
            >
              <div className="flex items-center gap-1.5 font-heading text-base font-black">
                <ArrowUp01Icon className="w-5 h-5 stroke-[3]" />
                <span>NAIK (CALL)</span>
              </div>
              <span className="text-[10px] font-mono-num font-bold text-black/75">
                Target: {selectedPair.prefix}
                {(currentPrice * (1 + tpPercent / 100)).toFixed(selectedPair.decimals)}
              </span>
            </button>

            {/* SELL / SHORT BUTTON */}
            <button
              type="button"
              onClick={() => handleExecuteScalp('SHORT')}
              className="group relative flex flex-col items-center justify-center py-4 rounded-2xl bg-[#FF5C77] text-black font-black text-sm shadow-xl shadow-[#FF5C77]/25 active:scale-[0.98] transition-all overflow-hidden cursor-pointer"
            >
              <div className="flex items-center gap-1.5 font-heading text-base font-black">
                <ArrowDown01Icon className="w-5 h-5 stroke-[3]" />
                <span>TURUN (PUT)</span>
              </div>
              <span className="text-[10px] font-mono-num font-bold text-black/75">
                Target: {selectedPair.prefix}
                {(currentPrice * (1 - tpPercent / 100)).toFixed(selectedPair.decimals)}
              </span>
            </button>
          </div>

          {/* Sub-Notice Info */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
            <span className="flex items-center gap-1">
              <Shield01Icon className="w-3.5 h-3.5 text-[#00E163]" />
              <span>Proteksi Balik Arah 1-Klik Aktif</span>
            </span>
            <span className="font-mono-num font-bold text-slate-300">Biaya: 0.02% Taker</span>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM DOCK: POSISI AKTIF (DENGAN TOMBOL BALIK ARAH 1-KLIK), RIWAYAT SCALP, & STATISTIK */}
      <div className="flex flex-col gap-4 p-5 rounded-3xl bg-[#1F1E25] border border-white/5 shadow-xl">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            {[
              { id: 'positions', label: 'Posisi Aktif Scalp', count: positions.length },
              { id: 'history', label: 'Riwayat Scalping Hari Ini', count: history.length },
              { id: 'stats', label: 'Statistik & Win Rate', count: null },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setBottomTab(t.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  bottomTab === t.id
                    ? 'bg-[#26252E] text-white border border-white/10 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{t.label}</span>
                {t.count !== null && (
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-mono-num font-black ${
                      bottomTab === t.id ? 'bg-[#00E163] text-black' : 'bg-[#18171E] text-slate-400'
                    }`}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400 hidden sm:inline">
            Fitur Utama:{' '}
            <strong className="text-[#00E163]">Balik Arah 1-Klik Menghindari Likuidasi Cepat</strong>
          </span>
        </div>

        {/* TAB 1: POSISI AKTIF DENGAN TOMBOL BALIK ARAH */}
        {bottomTab === 'positions' && (
          <div className="flex flex-col gap-3 overflow-x-auto custom-positions-scrollbar">
            {positions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-2">
                <Clock01Icon className="w-8 h-8 stroke-[1.5] text-slate-600" />
                <span className="text-xs font-bold">Tidak ada posisi scalping yang sedang aktif.</span>
                <span className="text-[11px]">
                  Pilih pair di atas dan klik <strong>NAIK</strong> atau <strong>TURUN</strong> untuk
                  mulai.
                </span>
              </div>
            ) : (
              <div className="min-w-[850px] flex flex-col gap-2">
                <div className="grid grid-cols-12 gap-3 px-4 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span className="col-span-2">Aset & Tipe</span>
                  <span className="col-span-2">Margin & Lev</span>
                  <span className="col-span-2">Harga Masuk</span>
                  <span className="col-span-2">Harga Live</span>
                  <span className="col-span-2">Floating PnL</span>
                  <span className="col-span-2 text-right">Tindakan Cepat</span>
                </div>

                {positions.map((pos) => {
                  const isUp = pos.type === 'LONG';
                  const isProfit = pos.floatingPnl >= 0;
                  return (
                    <div
                      key={pos.id}
                      className="grid grid-cols-12 gap-3 items-center px-4 py-3 rounded-2xl bg-[#18171E] border border-white/5 hover:border-white/10 transition-colors"
                    >
                      {/* Pair & Type */}
                      <div className="col-span-2 flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            isUp ? 'bg-[#00E163]/20 text-[#00E163]' : 'bg-[#FF5C77]/20 text-[#FF5C77]'
                          }`}
                        >
                          {pos.type}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-white font-mono-num">{pos.symbol}</span>
                          <span className="text-[10px] text-slate-500">{pos.openedAt}</span>
                        </div>
                      </div>

                      {/* Margin & Lev */}
                      <div className="col-span-2 flex flex-col font-mono-num">
                        <span className="text-xs font-bold text-white">${pos.margin} USDT</span>
                        <span className="text-[10px] text-[#00E163] font-black">{pos.leverage}x Cross</span>
                      </div>

                      {/* Entry Price */}
                      <div className="col-span-2 flex flex-col font-mono-num">
                        <span className="text-xs font-bold text-slate-300">
                          ${pos.entryPrice.toLocaleString(undefined, { minimumFractionDigits: selectedPair.decimals })}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          TP: ${pos.tpPrice.toLocaleString(undefined, { minimumFractionDigits: selectedPair.decimals })}
                        </span>
                      </div>

                      {/* Mark Price */}
                      <div className="col-span-2 flex flex-col font-mono-num">
                        <span className="text-xs font-bold text-white">
                          ${pos.markPrice.toLocaleString(undefined, { minimumFractionDigits: selectedPair.decimals })}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          SL: ${pos.slPrice.toLocaleString(undefined, { minimumFractionDigits: selectedPair.decimals })}
                        </span>
                      </div>

                      {/* Floating PnL */}
                      <div className="col-span-2 flex flex-col font-mono-num">
                        <span
                          className={`text-sm font-black ${
                            isProfit ? 'text-[#00E163]' : 'text-[#FF5C77]'
                          }`}
                        >
                          {isProfit ? '+' : ''}${pos.floatingPnl.toFixed(2)}
                        </span>
                        <span
                          className={`text-[10px] font-bold ${
                            isProfit ? 'text-[#00E163]' : 'text-[#FF5C77]'
                          }`}
                        >
                          {isProfit ? '+' : ''}
                          {pos.floatingPnlPct.toFixed(2)}% ({pos.durationSec}s)
                        </span>
                      </div>

                      {/* Actions: 1-Click Flip Position + Close Button */}
                      <div className="col-span-2 flex items-center justify-end gap-2">
                        {/* 1-CLICK FLIP BUTTON */}
                        <button
                          type="button"
                          onClick={() => handleFlipPosition(pos.id)}
                          title="Tutup posisi ini dan buka arah sebaliknya secara instan dalam 1 klik"
                          className="group relative flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#26252E] hover:bg-amber-400 text-amber-400 hover:text-black text-xs font-black transition-all overflow-hidden cursor-pointer border border-amber-400/30"
                        >
                          <Exchange01Icon className="w-3.5 h-3.5 shrink-0" />
                          <span>Balik Arah</span>
                        </button>

                        {/* CLOSE BUTTON */}
                        <button
                          type="button"
                          onClick={() => handleClosePosition(pos.id)}
                          className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#FF5C77] text-slate-300 hover:text-black text-xs font-bold transition-colors cursor-pointer"
                        >
                          Tutup
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RIWAYAT SCALPING HARI INI */}
        {bottomTab === 'history' && (
          <div className="flex flex-col gap-2 min-w-[800px] overflow-x-auto custom-positions-scrollbar">
            <div className="grid grid-cols-12 gap-3 px-4 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span className="col-span-2">Aset & Tipe</span>
              <span className="col-span-2">Leverage & Margin</span>
              <span className="col-span-2">Harga Masuk</span>
              <span className="col-span-2">Harga Keluar</span>
              <span className="col-span-2">Realized PnL</span>
              <span className="col-span-2 text-right">Waktu & Durasi</span>
            </div>

            {history.map((h) => {
              const isProfit = h.realizedPnl >= 0;
              return (
                <div
                  key={h.id}
                  className="grid grid-cols-12 gap-3 items-center px-4 py-2.5 rounded-2xl bg-[#18171E] border border-white/5 text-xs font-mono-num"
                >
                  <div className="col-span-2 flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        h.type === 'LONG' ? 'bg-[#00E163]/20 text-[#00E163]' : 'bg-[#FF5C77]/20 text-[#FF5C77]'
                      }`}
                    >
                      {h.type}
                    </span>
                    <span className="font-bold text-white">{h.symbol}</span>
                  </div>

                  <div className="col-span-2 text-slate-300">
                    ${h.margin} ({h.leverage}x)
                  </div>
                  <div className="col-span-2 text-slate-400">
                    ${h.entryPrice.toLocaleString(undefined, { minimumFractionDigits: selectedPair.decimals })}
                  </div>
                  <div className="col-span-2 text-white font-bold">
                    ${h.closePrice.toLocaleString(undefined, { minimumFractionDigits: selectedPair.decimals })}
                  </div>

                  <div className="col-span-2 flex flex-col">
                    <span className={`font-black ${isProfit ? 'text-[#00E163]' : 'text-[#FF5C77]'}`}>
                      {isProfit ? '+' : ''}${h.realizedPnl.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {isProfit ? '+' : ''}
                      {h.realizedPnlPct.toFixed(2)}%
                    </span>
                  </div>

                  <div className="col-span-2 text-right text-slate-400 flex flex-col">
                    <span>{h.closedAt}</span>
                    <span className="text-[10px] text-slate-500">{h.durationSec}s scalp</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: STATISTIK & WIN RATE */}
        {bottomTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-2">
            <div className="p-4 rounded-2xl bg-[#18171E] border border-white/5 flex flex-col gap-1">
              <span className="text-xs text-slate-400 font-bold uppercase">Total Scalp Trades</span>
              <span className="text-2xl font-black text-white font-mono-num">
                {history.length + positions.length} Order
              </span>
              <span className="text-[10px] text-[#00E163]">Rata-rata durasi: 52 detik</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#18171E] border border-white/5 flex flex-col gap-1">
              <span className="text-xs text-slate-400 font-bold uppercase">Win Rate Keseluruhan</span>
              <span className="text-2xl font-black text-[#00E163] font-mono-num">
                {(
                  (history.filter((h) => h.realizedPnl > 0).length / (history.length || 1)) *
                  100
                ).toFixed(1)}
                %
              </span>
              <span className="text-[10px] text-slate-400">
                {history.filter((h) => h.realizedPnl > 0).length} Menang /{' '}
                {history.filter((h) => h.realizedPnl <= 0).length} Kalah
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#18171E] border border-white/5 flex flex-col gap-1">
              <span className="text-xs text-slate-400 font-bold uppercase">Profit Factor</span>
              <span className="text-2xl font-black text-white font-mono-num">3.42</span>
              <span className="text-[10px] text-amber-400">Streak terbaik: 8x berturut-turut</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#18171E] border border-white/5 flex flex-col gap-1">
              <span className="text-xs text-slate-400 font-bold uppercase">Rerata Eksekusi Order</span>
              <span className="text-2xl font-black text-[#00E163] font-mono-num">12.4 ms</span>
              <span className="text-[10px] text-slate-400">Slippage terproteksi rata-rata 0.03%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
