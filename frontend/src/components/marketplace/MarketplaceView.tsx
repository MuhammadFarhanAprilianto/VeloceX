'use client';

import React, { useState, useMemo } from 'react';
import {
  Search01Icon,
  StarIcon,
  TradeUpIcon,
  FlashIcon,
  Coins01Icon,
  ArrowUpRight01Icon,
  ArrowDownLeft01Icon,
  SparklesIcon,
  Activity01Icon,
  Layers01Icon,
  CpuIcon,
  ChartHistogramIcon,
  CheckmarkCircle01Icon,
  Tick01Icon,
  Cancel01Icon,
  ArrowRight01Icon,
  Shield01Icon,
  Download01Icon,
  DashboardSquare01Icon,
  FilterIcon,
} from 'hugeicons-react';
import { MarketIcon } from '@/components/MarketIcon';

export interface MarketAsset {
  id: string;
  symbol: string;
  name: string;
  category: 'crypto' | 'forex' | 'cfd';
  lastPrice: number;
  change24h: number;
  change24hUsd: number;
  high24h: number;
  low24h: number;
  volume24hUsd: number;
  decimals: number;
  prefix: string;
  sparkline: number[];
}

export interface StrategyBot {
  id: string;
  name: string;
  creator: string;
  category: string;
  roi30d: number;
  maxDrawdown: number;
  copiers: number;
  minInvestment: number;
  tag: string;
  description: string;
  sparkline: number[];
}

// 18 VeloceX Official Markets
const ALL_MARKETS: MarketAsset[] = [
  // 1. KRIPTO (7 Aset)
  { id: 'BTCUSDT', symbol: 'BTC/USDT', name: 'Bitcoin', category: 'crypto', lastPrice: 75368.45, change24h: 4.82, change24hUsd: 3462.10, high24h: 76200.00, low24h: 71800.00, volume24hUsd: 1420500000, decimals: 2, prefix: '$', sparkline: [71800, 72400, 73100, 72900, 74500, 75100, 75368] },
  { id: 'ETHUSDT', symbol: 'ETH/USDT', name: 'Ethereum', category: 'crypto', lastPrice: 4149.74, change24h: 3.65, change24hUsd: 146.20, high24h: 4210.00, low24h: 3980.00, volume24hUsd: 890400000, decimals: 2, prefix: '$', sparkline: [3980, 4020, 4060, 4040, 4110, 4130, 4149] },
  { id: 'SOLUSDT', symbol: 'SOL/USDT', name: 'Solana', category: 'crypto', lastPrice: 175.03, change24h: 12.40, change24hUsd: 19.30, high24h: 178.50, low24h: 154.20, volume24hUsd: 650200000, decimals: 2, prefix: '$', sparkline: [154, 158, 162, 160, 169, 173, 175] },
  { id: 'BNBUSDT', symbol: 'BNB/USDT', name: 'Binance Coin', category: 'crypto', lastPrice: 614.35, change24h: 2.15, change24hUsd: 12.90, high24h: 622.00, low24h: 598.00, volume24hUsd: 280100000, decimals: 2, prefix: '$', sparkline: [598, 602, 606, 604, 610, 612, 614] },
  { id: 'LTCUSDT', symbol: 'LTC/USDT', name: 'Litecoin', category: 'crypto', lastPrice: 94.92, change24h: 5.12, change24hUsd: 4.62, high24h: 96.40, low24h: 89.80, volume24hUsd: 140300000, decimals: 2, prefix: '$', sparkline: [89.8, 91.2, 92.5, 91.8, 93.4, 94.2, 94.9] },
  { id: 'ADAUSDT', symbol: 'ADA/USDT', name: 'Cardano', category: 'crypto', lastPrice: 0.562, change24h: -1.84, change24hUsd: -0.010, high24h: 0.584, low24h: 0.552, volume24hUsd: 95400000, decimals: 3, prefix: '$', sparkline: [0.58, 0.575, 0.57, 0.565, 0.568, 0.56, 0.562] },
  { id: 'USDT', symbol: 'USDT/USD', name: 'Tether USD', category: 'crypto', lastPrice: 1.0001, change24h: 0.01, change24hUsd: 0.0001, high24h: 1.0005, low24h: 0.9998, volume24hUsd: 4200000000, decimals: 4, prefix: '$', sparkline: [1.00, 1.0001, 0.9999, 1.0002, 1.00, 1.0001, 1.0001] },

  // 2. FOREX (6 Aset)
  { id: 'EURUSD', symbol: 'EUR/USD', name: 'Euro / US Dollar', category: 'forex', lastPrice: 1.0842, change24h: 0.42, change24hUsd: 0.0045, high24h: 1.0875, low24h: 1.0790, volume24hUsd: 2150000000, decimals: 4, prefix: '', sparkline: [1.079, 1.081, 1.083, 1.082, 1.084, 1.083, 1.084] },
  { id: 'GBPUSD', symbol: 'GBP/USD', name: 'British Pound / USD', category: 'forex', lastPrice: 1.2915, change24h: 0.65, change24hUsd: 0.0083, high24h: 1.2950, low24h: 1.2820, volume24hUsd: 1480000000, decimals: 4, prefix: '', sparkline: [1.282, 1.285, 1.288, 1.286, 1.290, 1.289, 1.291] },
  { id: 'USDJPY', symbol: 'USD/JPY', name: 'USD / Japanese Yen', category: 'forex', lastPrice: 154.60, change24h: -0.38, change24hUsd: -0.58, high24h: 155.40, low24h: 153.90, volume24hUsd: 1890000000, decimals: 2, prefix: '¥', sparkline: [155.2, 155.0, 154.6, 154.8, 154.4, 154.7, 154.6] },
  { id: 'AUDUSD', symbol: 'AUD/USD', name: 'Australian Dollar / USD', category: 'forex', lastPrice: 0.6580, change24h: 0.72, change24hUsd: 0.0047, high24h: 0.6610, low24h: 0.6520, volume24hUsd: 820000000, decimals: 4, prefix: '', sparkline: [0.652, 0.654, 0.656, 0.655, 0.657, 0.656, 0.658] },
  { id: 'USDCAD', symbol: 'USD/CAD', name: 'USD / Canadian Dollar', category: 'forex', lastPrice: 1.3820, change24h: -0.15, change24hUsd: -0.0021, high24h: 1.3860, low24h: 1.3790, volume24hUsd: 710000000, decimals: 4, prefix: '', sparkline: [1.385, 1.384, 1.382, 1.383, 1.381, 1.383, 1.382] },
  { id: 'USDCHF', symbol: 'USD/CHF', name: 'USD / Swiss Franc', category: 'forex', lastPrice: 0.8840, change24h: 0.28, change24hUsd: 0.0025, high24h: 0.8870, low24h: 0.8805, volume24hUsd: 590000000, decimals: 4, prefix: '', sparkline: [0.881, 0.882, 0.884, 0.883, 0.885, 0.883, 0.884] },

  // 3. CFD & KOMODITAS (6 Aset)
  { id: 'XAUUSD', symbol: 'XAU/USD', name: 'Gold (Emas Spot)', category: 'cfd', lastPrice: 2514.80, change24h: 3.82, change24hUsd: 92.40, high24h: 2528.00, low24h: 2420.00, volume24hUsd: 3120000000, decimals: 2, prefix: '$', sparkline: [2420, 2445, 2470, 2465, 2495, 2510, 2514] },
  { id: 'XAGUSD', symbol: 'XAG/USD', name: 'Silver (Perak Spot)', category: 'cfd', lastPrice: 29.45, change24h: 4.15, change24hUsd: 1.18, high24h: 29.90, low24h: 28.10, volume24hUsd: 480000000, decimals: 2, prefix: '$', sparkline: [28.1, 28.4, 28.9, 28.7, 29.2, 29.3, 29.4] },
  { id: 'USOIL', symbol: 'USOIL', name: 'Crude Oil WTI', category: 'cfd', lastPrice: 74.60, change24h: 1.62, change24hUsd: 1.19, high24h: 75.80, low24h: 73.10, volume24hUsd: 920000000, decimals: 2, prefix: '$', sparkline: [73.1, 73.5, 74.0, 73.8, 74.4, 74.2, 74.6] },
  { id: 'SPX500', symbol: 'SPX500', name: 'S&P 500 Index', category: 'cfd', lastPrice: 5648.40, change24h: 1.12, change24hUsd: 62.50, high24h: 5665.00, low24h: 5580.00, volume24hUsd: 2840000000, decimals: 2, prefix: '$', sparkline: [5580, 5595, 5620, 5610, 5635, 5642, 5648] },
  { id: 'NAS100', symbol: 'NAS100', name: 'Nasdaq 100 Index', category: 'cfd', lastPrice: 19720.50, change24h: 1.84, change24hUsd: 356.20, high24h: 19810.00, low24h: 19340.00, volume24hUsd: 3410000000, decimals: 2, prefix: '$', sparkline: [19340, 19450, 19580, 19520, 19680, 19710, 19720] },
  { id: 'US30', symbol: 'US30', name: 'Dow Jones 30 Index', category: 'cfd', lastPrice: 41250.00, change24h: 0.85, change24hUsd: 348.00, high24h: 41380.00, low24h: 40850.00, volume24hUsd: 1950000000, decimals: 2, prefix: '$', sparkline: [40850, 40920, 41050, 40980, 41180, 41220, 41250] },
];

// Top Automated Strategy Bots
const STRATEGY_BOTS: StrategyBot[] = [
  {
    id: 'bot_neural_scalp',
    name: 'VeloceX AI Neural Scalper',
    creator: 'AlphaQuant Lab',
    category: 'Lightning Scalping',
    roi30d: 168.42,
    maxDrawdown: 4.8,
    copiers: 1420,
    minInvestment: 100,
    tag: 'Ultra Fast',
    description: 'Algoritma scalping frekuensi tinggi mengeksploitasi mikro-tren 5s-60s pada SOL, BTC, dan Gold.',
    sparkline: [100, 112, 125, 122, 140, 155, 168],
  },
  {
    id: 'bot_grid_master',
    name: 'Spot Volatility Grid Master',
    creator: 'VeloceX Official',
    category: 'Grid Trading',
    roi30d: 84.25,
    maxDrawdown: 3.2,
    copiers: 2190,
    minInvestment: 50,
    tag: 'Low Risk',
    description: 'Menempatkan jaring order beli dan jual bertingkat otomatis pada rentang harga sideways BTC & ETH.',
    sparkline: [100, 105, 118, 124, 145, 162, 184],
  },
  {
    id: 'bot_gold_breakout',
    name: 'Gold & FX Trend Breakout',
    creator: 'Swiss Capital Fund',
    category: 'Commodities & FX',
    roi30d: 112.50,
    maxDrawdown: 6.1,
    copiers: 980,
    minInvestment: 250,
    tag: 'High Yield',
    description: 'Mendeteksi momentum breakout sesi London & New York pada pasangan XAU/USD dan EUR/USD.',
    sparkline: [100, 108, 120, 132, 150, 180, 212],
  },
  {
    id: 'bot_dca_martingale',
    name: 'Smart DCA Dynamic Martingale',
    creator: 'Hyperion Asset',
    category: 'DCA Accumulator',
    roi30d: 45.80,
    maxDrawdown: 2.1,
    copiers: 3450,
    minInvestment: 50,
    tag: 'Safe Growth',
    description: 'Akumulasi bertahap dengan rata-rata harga dinamis untuk hasil yield stabil bebas stres.',
    sparkline: [100, 104, 110, 115, 125, 136, 145],
  },
];

interface MarketplaceViewProps {
  onOrderSuccess?: (msg: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  onOrderSuccess,
  onNavigateTab,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'crypto' | 'forex' | 'cfd' | 'favorites'>('all');
  const [sortBy, setSortBy] = useState<'volume' | 'change' | 'price'>('volume');
  const [favorites, setFavorites] = useState<string[]>(['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'XAUUSD']);

  // Copy Bot Modal State
  const [selectedBot, setSelectedBot] = useState<StrategyBot | null>(null);
  const [copyInvestment, setCopyInvestment] = useState<string>('500');
  const [copyPhase, setCopyPhase] = useState<'idle' | 'progress' | 'checkmark_center' | 'checkmark_shift' | 'success_revealed'>('idle');

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((fav) => fav !== id));
      onOrderSuccess?.('Pasangan aset dihapus dari daftar Favorit.');
    } else {
      setFavorites([...favorites, id]);
      onOrderSuccess?.('Pasangan aset berhasil ditambahkan ke Favorit.');
    }
  };

  // Filtered & Sorted Markets
  const filteredMarkets = useMemo(() => {
    return ALL_MARKETS.filter((m) => {
      const matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === 'all'
        ? true
        : selectedCategory === 'favorites'
        ? favorites.includes(m.id)
        : m.category === selectedCategory;
      return matchSearch && matchCategory;
    }).sort((a, b) => {
      if (sortBy === 'volume') return b.volume24hUsd - a.volume24hUsd;
      if (sortBy === 'change') return b.change24h - a.change24h;
      return b.lastPrice - a.lastPrice;
    });
  }, [searchQuery, selectedCategory, sortBy, favorites]);

  // Handle Copy Bot Execution with 4-Step Animated Motion
  const handleExecuteCopy = () => {
    if (copyPhase !== 'idle' || !selectedBot) return;

    const amt = parseFloat(copyInvestment);
    if (isNaN(amt) || amt < selectedBot.minInvestment) {
      onOrderSuccess?.(`Minimal investasi untuk strategi ini adalah $${selectedBot.minInvestment}.`);
      return;
    }

    // 1. Loading Progress Bar Hijau (700ms)
    setCopyPhase('progress');

    // 2. Centang Pop di Tengah
    setTimeout(() => {
      setCopyPhase('checkmark_center');

      // 3. Jeda 1s -> Geser Kiri + Blur-to-Sharp Teks Sukses
      setTimeout(() => {
        setCopyPhase('checkmark_shift');

        setTimeout(() => {
          setCopyPhase('success_revealed');

          // 4. Jeda 2s -> Tutup Modal
          setTimeout(() => {
            const botName = selectedBot.name;
            setSelectedBot(null);
            setCopyPhase('idle');
            onOrderSuccess?.(`Berhasil menyalin strategi ${botName} dengan modal $${amt.toLocaleString()} USDT.`);
          }, 2000);
        }, 150);
      }, 1000);
    }, 700);
  };

  // Mini Sparkline SVG Path Generator
  const getSparklineSvg = (pts: number[], isPositive: boolean) => {
    const min = Math.min(...pts);
    const max = Math.max(...pts);
    const range = max - min || 1;
    const w = 110;
    const h = 32;

    const coords = pts.map((p, i) => {
      const x = (i / (pts.length - 1)) * w;
      const y = h - ((p - min) / range) * (h - 8) - 4;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    return (
      <svg width="110" height="32" viewBox="0 0 110 32" className="overflow-visible">
        <polyline
          fill="none"
          stroke={isPositive ? '#00E163' : '#FF5C77'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={coords}
        />
      </svg>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1600px] mx-auto w-full font-sans animate-fade-in text-slate-100">
      {/* 1. EXECUTIVE MARKET OVERVIEW HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#18171E] via-[#1F1E25] to-[#18171E] border border-white/5 p-6 md:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xl">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-xl bg-[#00E163]/10 border border-[#00E163]/30 text-[#00E163] text-[10px] font-black uppercase tracking-wider">
              Pusat Intelijen Pasar Global
            </span>
            <span className="text-xs font-bold text-slate-400">18 Pasar Terverifikasi</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white font-heading tracking-tight">
            Marketplace &amp; Bot Trading
          </h1>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-mono-num">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Volume 24h Global:</span>
              <span className="font-extrabold text-white">$84.28 Miliar</span>
            </div>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Dominasi BTC:</span>
              <span className="font-extrabold text-[#00E163]">54.2%</span>
            </div>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Total Bot Aktif:</span>
              <span className="font-extrabold text-[#A855F7]">8,040 Strategi</span>
            </div>
          </div>
        </div>

        {/* Market Sentiment Gauge Card */}
        <div className="p-4 rounded-2xl bg-[#14131A] border border-white/5 flex items-center gap-4 w-full lg:w-auto shadow-inner">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Indeks Sentimen Pasar</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#00E163] font-mono-num">76/100</span>
              <span className="text-xs font-extrabold text-[#00E163]">Keserakahan (Greed)</span>
            </div>
            <span className="text-[10px] text-slate-500">Rasio 24h: 58.4% Long / 41.6% Short</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#00E163]/10 border border-[#00E163]/30 flex items-center justify-center text-[#00E163] shrink-0">
            <Activity01Icon className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* 2. TOP 4 HIGHLIGHTS / MOVERS CARDS (Top Gainers, Hot Volume, Top Losers, Trending) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. TOP GAINER */}
        <div
          onClick={() => onNavigateTab ? onNavigateTab('dashboard') : onOrderSuccess?.('Membuka grafik SOL/USDT.')}
          className="p-5 rounded-3xl bg-[#1F1E25] border border-white/5 hover:border-[#00E163]/40 transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-xl group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <TradeUpIcon className="w-4 h-4 text-[#00E163]" />
              <span>Kenaikan Tertinggi (24h)</span>
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-[#00E163]/10 text-[#00E163] font-black text-[10px] font-mono-num">
              +12.40%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MarketIcon symbol="SOLUSDT" size="md" />
              <div className="flex flex-col">
                <span className="font-extrabold text-white text-sm group-hover:text-[#00E163] transition-colors">Solana</span>
                <span className="text-[10px] text-slate-400 font-mono-num">SOL/USDT</span>
              </div>
            </div>
            <span className="text-base font-black text-white font-mono-num">$175.03</span>
          </div>
        </div>

        {/* 2. HOT VOLUME */}
        <div
          onClick={() => onNavigateTab ? onNavigateTab('dashboard') : onOrderSuccess?.('Membuka grafik BTC/USDT.')}
          className="p-5 rounded-3xl bg-[#1F1E25] border border-white/5 hover:border-[#FFB800]/40 transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-xl group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <FlashIcon className="w-4 h-4 text-[#FFB800]" />
              <span>Volume Terbesar (Hot)</span>
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-[#FFB800]/10 text-[#FFB800] font-black text-[10px] font-mono-num">
              $1.42B Vol
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MarketIcon symbol="BTCUSDT" size="md" />
              <div className="flex flex-col">
                <span className="font-extrabold text-white text-sm group-hover:text-[#FFB800] transition-colors">Bitcoin</span>
                <span className="text-[10px] text-slate-400 font-mono-num">BTC/USDT</span>
              </div>
            </div>
            <span className="text-base font-black text-white font-mono-num">$75,368.45</span>
          </div>
        </div>

        {/* 3. TOP LOSER / PULLBACK DIP */}
        <div
          onClick={() => onNavigateTab ? onNavigateTab('dashboard') : onOrderSuccess?.('Membuka grafik ADA/USDT.')}
          className="p-5 rounded-3xl bg-[#1F1E25] border border-white/5 hover:border-[#FF5C77]/40 transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-xl group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <ArrowDownLeft01Icon className="w-4 h-4 text-[#FF5C77]" />
              <span>Koreksi Diskon (Dip)</span>
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-[#FF5C77]/10 text-[#FF5C77] font-black text-[10px] font-mono-num">
              -1.84%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MarketIcon symbol="ADAUSDT" size="md" />
              <div className="flex flex-col">
                <span className="font-extrabold text-white text-sm group-hover:text-[#FF5C77] transition-colors">Cardano</span>
                <span className="text-[10px] text-slate-400 font-mono-num">ADA/USDT</span>
              </div>
            </div>
            <span className="text-base font-black text-white font-mono-num">$0.562</span>
          </div>
        </div>

        {/* 4. TRENDING COMMODITY / CFD */}
        <div
          onClick={() => onNavigateTab ? onNavigateTab('dashboard') : onOrderSuccess?.('Membuka grafik XAU/USD Emas.')}
          className="p-5 rounded-3xl bg-[#1F1E25] border border-white/5 hover:border-[#3875F6]/40 transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-xl group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
              <SparklesIcon className="w-4 h-4 text-[#3875F6]" />
              <span>Trending Komoditas Emas</span>
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-[#3875F6]/10 text-[#3875F6] font-black text-[10px] font-mono-num">
              +3.82%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MarketIcon symbol="XAUUSD" size="md" />
              <div className="flex flex-col">
                <span className="font-extrabold text-white text-sm group-hover:text-[#3875F6] transition-colors">Gold Spot</span>
                <span className="text-[10px] text-slate-400 font-mono-num">XAU/USD</span>
              </div>
            </div>
            <span className="text-base font-black text-white font-mono-num">$2,514.80</span>
          </div>
        </div>
      </div>

      {/* 3. AUTOMATED STRATEGY BOT & COPY TRADING MARKETPLACE */}
      <div className="p-6 rounded-3xl bg-[#1F1E25] border border-white/5 shadow-xl flex flex-col gap-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CpuIcon className="w-5 h-5 text-[#00E163]" />
            <h2 className="text-base font-black text-white font-heading">Pasar Strategi Bot &amp; Copy Trading Unggulan</h2>
          </div>
          <span className="text-xs text-slate-400">Salin strategi otomatis dalam 1-klik tanpa coding</span>
        </div>

        {/* Strategy Bots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {STRATEGY_BOTS.map((bot) => (
            <div
              key={bot.id}
              className="p-5 rounded-3xl bg-[#18171E] border border-white/5 hover:border-white/15 transition-all flex flex-col justify-between gap-4 shadow-lg group"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-lg bg-[#00E163]/10 text-[#00E163] text-[10px] font-black">
                    {bot.tag}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono-num">{bot.copiers.toLocaleString()} Pengikut</span>
                </div>

                <div className="flex flex-col">
                  <h3 className="font-extrabold text-white text-sm group-hover:text-[#00E163] transition-colors">{bot.name}</h3>
                  <span className="text-[11px] text-slate-400">Oleh {bot.creator}</span>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {bot.description}
                </p>
              </div>

              {/* Bot ROI & Mini Sparkline */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">ROI 30 Hari</span>
                  <span className="text-lg font-black text-[#00E163] font-mono-num">+{bot.roi30d.toFixed(2)}%</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Max Drawdown</span>
                  <span className="text-xs font-bold text-slate-300 font-mono-num">-{bot.maxDrawdown}%</span>
                </div>
              </div>

              {/* Copy Strategy Button with 1000ms VeloceX Sweep */}
              <button
                type="button"
                onClick={() => setSelectedBot(bot)}
                className="group/btn relative w-full h-10 rounded-2xl bg-[#26252E] hover:text-black border border-white/5 text-xs font-bold text-slate-200 overflow-hidden cursor-pointer select-none transition-all duration-1000 flex items-center justify-center"
              >
                <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                <span className="relative z-10 flex items-center gap-1.5 transition-colors duration-1000 font-black">
                  <SparklesIcon className="w-3.5 h-3.5" />
                  <span>Salin Strategi (1-Klik)</span>
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. MULTI-ASSET EXPLORER TABLE (ALL 18 ASSETS WITH SPARKLINE CHARTS) */}
      <div className="p-6 rounded-3xl bg-[#1F1E25] border border-white/5 shadow-xl flex flex-col gap-5">
        {/* Table Controls: Search, Category Filters, Sorting Options */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter Chips with 1000ms Sweep */}
            {[
              { id: 'all', label: 'Semua Pasar' },
              { id: 'crypto', label: 'Kripto' },
              { id: 'forex', label: 'Forex' },
              { id: 'cfd', label: 'CFD & Komoditas' },
              { id: 'favorites', label: 'Favorit ⭐' },
            ].map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`group relative flex items-center justify-center px-4 h-9 rounded-2xl text-xs font-bold transition-all duration-1000 overflow-hidden cursor-pointer select-none ${
                    isActive
                      ? 'bg-[#00E163] text-black font-black shadow-md shadow-[#00E163]/20 border border-[#00E163]'
                      : 'bg-[#18171E] text-slate-300 hover:text-black border border-white/5'
                  }`}
                >
                  {!isActive && (
                    <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                  )}
                  <span className="relative z-10 transition-colors duration-1000">{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 justify-between lg:justify-end">
            {/* Sort Filter Selector */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#18171E] border border-white/5 text-xs">
              {(['volume', 'change', 'price'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSortBy(s)}
                  className={`px-3 py-1 rounded-xl font-bold transition-colors cursor-pointer capitalize ${
                    sortBy === s ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s === 'volume' ? 'Volume' : s === 'change' ? 'Perubahan' : 'Harga'}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative flex items-center h-9 px-3.5 rounded-2xl bg-[#18171E] border border-white/10 focus-within:border-[#00E163]/50 transition-colors w-52">
              <Search01Icon className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari pasar aset..."
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Scrollable Table Content with Sticky Header */}
        <div className="max-h-[520px] overflow-y-auto overflow-x-auto custom-positions-scrollbar pr-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-30 bg-[#1F1E25] text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-white/5 shadow-md">
              <tr>
                <th className="py-3.5 px-4 bg-[#1F1E25] sticky top-0 z-30 w-10 text-center">⭐</th>
                <th className="py-3.5 px-4 bg-[#1F1E25] sticky top-0 z-30">Pasangan Pasar</th>
                <th className="py-3.5 px-4 bg-[#1F1E25] sticky top-0 z-30">Harga Terakhir</th>
                <th className="py-3.5 px-4 bg-[#1F1E25] sticky top-0 z-30">Perubahan 24 Jam</th>
                <th className="py-3.5 px-4 bg-[#1F1E25] sticky top-0 z-30">Tertinggi / Terendah 24h</th>
                <th className="py-3.5 px-4 bg-[#1F1E25] sticky top-0 z-30">Volume Transaksi (24h)</th>
                <th className="py-3.5 px-4 bg-[#1F1E25] sticky top-0 z-30">Tren 7 Hari</th>
                <th className="py-3.5 px-4 text-right bg-[#1F1E25] sticky top-0 z-30">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200 font-medium">
              {filteredMarkets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-500">
                    Tidak ada pasar aset yang sesuai dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredMarkets.map((m) => {
                  const isFav = favorites.includes(m.id);
                  const isProfit = m.change24h >= 0;

                  return (
                    <tr
                      key={m.id}
                      onClick={() => onNavigateTab ? onNavigateTab('dashboard') : onOrderSuccess?.(`Membuka pasar ${m.symbol}.`)}
                      className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    >
                      {/* Favorite Star */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={(e) => toggleFavorite(m.id, e)}
                          className="p-1 rounded-lg hover:bg-white/10 text-slate-500 hover:text-[#FFB800] transition-colors cursor-pointer"
                        >
                          <StarIcon className={`w-4 h-4 ${isFav ? 'text-[#FFB800] fill-[#FFB800]' : ''}`} />
                        </button>
                      </td>

                      {/* Asset & Symbol */}
                      <td className="py-3.5 px-4 flex items-center gap-3">
                        <MarketIcon symbol={m.symbol} size="sm" />
                        <div className="flex flex-col">
                          <span className="font-extrabold text-white text-xs group-hover:text-[#00E163] transition-colors">
                            {m.name}
                          </span>
                          <span className="text-[10px] text-slate-400 uppercase font-mono-num">{m.symbol}</span>
                        </div>
                      </td>

                      {/* Last Price */}
                      <td className="py-3.5 px-4 font-mono-num font-bold text-white">
                        {m.prefix}{m.lastPrice.toLocaleString(undefined, { minimumFractionDigits: m.decimals })}
                      </td>

                      {/* 24h Change */}
                      <td className="py-3.5 px-4 font-mono-num">
                        <div className="flex flex-col">
                          <span className={`font-black ${isProfit ? 'text-[#00E163]' : 'text-[#FF5C77]'}`}>
                            {isProfit ? '+' : ''}{m.change24h.toFixed(2)}%
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {isProfit ? '+' : ''}{m.prefix}{m.change24hUsd.toLocaleString(undefined, { minimumFractionDigits: m.decimals })}
                          </span>
                        </div>
                      </td>

                      {/* 24h High / Low */}
                      <td className="py-3.5 px-4 font-mono-num text-xs">
                        <div className="flex flex-col">
                          <span className="text-slate-300">T: {m.prefix}{m.high24h.toLocaleString(undefined, { minimumFractionDigits: m.decimals })}</span>
                          <span className="text-[10px] text-slate-500">R: {m.prefix}{m.low24h.toLocaleString(undefined, { minimumFractionDigits: m.decimals })}</span>
                        </div>
                      </td>

                      {/* 24h Turnover Volume */}
                      <td className="py-3.5 px-4 font-mono-num font-bold text-slate-300">
                        ${(m.volume24hUsd / 1000000).toLocaleString('en-US', { maximumFractionDigits: 1 })}M
                      </td>

                      {/* 7D Sparkline */}
                      <td className="py-3.5 px-4">
                        {getSparklineSvg(m.sparkline, isProfit)}
                      </td>

                      {/* Quick Trade Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onNavigateTab) onNavigateTab('dashboard');
                            onOrderSuccess?.(`Membuka terminal trading ${m.symbol}.`);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-[#26252E] hover:bg-[#00E163] text-slate-300 hover:text-black text-xs font-black transition-colors cursor-pointer"
                        >
                          Trade
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. COPY STRATEGY BOT MODAL (With 4-Step Animated Motion Confirmation) */}
      {selectedBot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#1F1E25] border border-white/10 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <CpuIcon className="w-5 h-5 text-[#00E163]" />
                <h3 className="text-sm font-extrabold text-white">Salin Strategi Bot Otomatis</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBot(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <Cancel01Icon className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#18171E] border border-white/5 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-white">{selectedBot.name}</span>
                <span className="px-2 py-0.5 rounded-lg bg-[#00E163]/15 text-[#00E163] font-black text-xs font-mono-num">
                  ROI +{selectedBot.roi30d}%
                </span>
              </div>
              <span className="text-xs text-slate-400">{selectedBot.description}</span>
            </div>

            {/* Investment Amount Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-400">Modal Alokasi Bot (USDT)</label>
                <span className="text-[10px] text-slate-500 font-mono-num">Min: ${selectedBot.minInvestment} USDT</span>
              </div>
              <div className="relative flex items-center h-11 px-3.5 rounded-2xl bg-[#18171E] border border-white/10 focus-within:border-[#00E163]/50">
                <input
                  type="number"
                  value={copyInvestment}
                  onChange={(e) => setCopyInvestment(e.target.value)}
                  placeholder="500"
                  className="w-full bg-transparent text-xs font-bold text-white font-mono-num focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setCopyInvestment('2500')}
                  className="text-[10px] font-black text-[#00E163] hover:underline cursor-pointer"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Risk Control Notes */}
            <div className="p-3 rounded-2xl bg-[#14131A] border border-white/5 flex items-center gap-2.5 text-xs text-slate-400">
              <Shield01Icon className="w-4 h-4 text-[#00E163] shrink-0" />
              <span>Sistem proteksi otomatis membatasi stop loss pada -{selectedBot.maxDrawdown}% modal.</span>
            </div>

            {/* Action Buttons with 4-Step Animated Flow */}
            <div className="flex items-center gap-3 pt-2">
              {copyPhase === 'idle' && (
                <button
                  type="button"
                  onClick={() => setSelectedBot(null)}
                  className="w-28 py-3 rounded-2xl bg-[#26252E] hover:bg-white/10 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
                >
                  Batal
                </button>
              )}

              {/* Confirm Copy Button with 4-Step Animated Motion */}
              <button
                type="button"
                onClick={handleExecuteCopy}
                disabled={copyPhase !== 'idle'}
                className="relative flex-1 h-12 rounded-2xl overflow-hidden font-black text-xs transition-all duration-300 cursor-pointer flex items-center justify-center bg-white/5 hover:bg-white/10 text-white select-none shadow-lg border border-white/5 group"
              >
                {/* 1. Green Progress Fill from Left to Right (700ms) */}
                <div
                  className={`absolute left-0 top-0 bottom-0 bg-[#00E163] shadow-lg shadow-[#00E163]/30 transition-all ease-out pointer-events-none ${
                    copyPhase === 'idle'
                      ? 'w-0'
                      : 'w-full duration-700'
                  }`}
                />

                {/* Initial Idle Text "Konfirmasi Salin Strategi" */}
                {copyPhase === 'idle' && (
                  <span className="relative z-10 flex items-center gap-1.5 transition-opacity duration-300 text-white group-hover:text-white uppercase tracking-wider text-xs font-black">
                    <SparklesIcon className="w-4 h-4" />
                    <span>Konfirmasi Salin Strategi</span>
                  </span>
                )}

                {/* Step 1: While filling progress bar */}
                {copyPhase === 'progress' && (
                  <span className="relative z-10 text-black font-black tracking-wider text-xs animate-pulse">
                    Mengaktifkan Bot...
                  </span>
                )}

                {/* Step 2 & 3: Centered Checkmark & Success Text Motion */}
                {(copyPhase === 'checkmark_center' || copyPhase === 'checkmark_shift' || copyPhase === 'success_revealed') && (
                  <div className="relative z-10 flex items-center justify-center gap-2.5">
                    {/* Checkmark Icon with Smooth Centered Pop & Left Shift */}
                    <div
                      className={`transition-all duration-500 ease-out flex items-center justify-center ${
                        copyPhase === 'checkmark_center'
                          ? 'scale-110 translate-x-0'
                          : 'scale-100'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center shadow-md animate-in zoom-in duration-300">
                        <Tick01Icon className="w-4 h-4 text-[#00E163] stroke-[3.5]" />
                      </div>
                    </div>

                    {/* Step 3: Success Text with Blur-to-Sharp Fade-In */}
                    <div
                      className={`transition-all duration-500 ease-out ${
                        copyPhase === 'success_revealed'
                          ? 'opacity-100 blur-0 translate-x-0 max-w-[220px]'
                          : 'opacity-0 blur-sm -translate-x-3 max-w-0 overflow-hidden'
                      }`}
                    >
                      <span className="font-black text-black text-xs tracking-wider uppercase whitespace-nowrap">
                        Bot Berhasil Aktif
                      </span>
                    </div>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
