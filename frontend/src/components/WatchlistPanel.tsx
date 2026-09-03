'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useTradingStore } from '@/store/useTradingStore';
import { MarketIcon } from '@/components/MarketIcon';

type MarketCategory = 'forex' | 'cfd' | 'crypto';

interface MarketItem {
  name: string;
  symbol: string;
  pair: string;
  defaultPrice: number;
  defaultChange: number;
  decimals: number;
  prefix: string;
}

const CATEGORIES: { id: MarketCategory; label: string }[] = [
  { id: 'forex', label: 'Forex' },
  { id: 'cfd', label: 'CFD' },
  { id: 'crypto', label: 'Kripto' },
];

const MARKET_DATA: Record<'forex' | 'cfd' | 'crypto', MarketItem[]> = {
  forex: [
    {
      name: 'EUR / USD',
      symbol: 'EURUSD',
      pair: 'EURUSD',
      defaultPrice: 1.0842,
      defaultChange: 0.12,
      decimals: 4,
      prefix: '',
    },
    {
      name: 'GBP / USD',
      symbol: 'GBPUSD',
      pair: 'GBPUSD',
      defaultPrice: 1.2915,
      defaultChange: 13.4,
      decimals: 4,
      prefix: '',
    },
    {
      name: 'USD / JPY',
      symbol: 'USDJPY',
      pair: 'USDJPY',
      defaultPrice: 154.6,
      defaultChange: -0.24,
      decimals: 2,
      prefix: '¥',
    },
    {
      name: 'AUD / USD',
      symbol: 'AUDUSD',
      pair: 'AUDUSD',
      defaultPrice: 0.658,
      defaultChange: 0.45,
      decimals: 4,
      prefix: '',
    },
    {
      name: 'USD / CAD',
      symbol: 'USDCAD',
      pair: 'USDCAD',
      defaultPrice: 1.382,
      defaultChange: -0.18,
      decimals: 4,
      prefix: '',
    },
    {
      name: 'USD / CHF',
      symbol: 'USDCHF',
      pair: 'USDCHF',
      defaultPrice: 0.884,
      defaultChange: 0.08,
      decimals: 4,
      prefix: '',
    },
  ],
  cfd: [
    {
      name: 'Gold (Emas)',
      symbol: 'XAUUSD',
      pair: 'XAUUSD',
      defaultPrice: 2514.8,
      defaultChange: 1.42,
      decimals: 2,
      prefix: '$',
    },
    {
      name: 'Silver (Perak)',
      symbol: 'XAGUSD',
      pair: 'XAGUSD',
      defaultPrice: 29.45,
      defaultChange: 2.15,
      decimals: 2,
      prefix: '$',
    },
    {
      name: 'Crude Oil WTI',
      symbol: 'USOIL',
      pair: 'USOIL',
      defaultPrice: 74.6,
      defaultChange: -1.05,
      decimals: 2,
      prefix: '$',
    },
    {
      name: 'S&P 500 Index',
      symbol: 'SPX500',
      pair: 'SPX500',
      defaultPrice: 5648.4,
      defaultChange: 0.82,
      decimals: 2,
      prefix: '$',
    },
    {
      name: 'Nasdaq 100',
      symbol: 'NAS100',
      pair: 'NAS100',
      defaultPrice: 19720.5,
      defaultChange: 1.14,
      decimals: 2,
      prefix: '$',
    },
    {
      name: 'Dow Jones 30',
      symbol: 'US30',
      pair: 'US30',
      defaultPrice: 41250.0,
      defaultChange: 0.35,
      decimals: 2,
      prefix: '$',
    },
  ],
  crypto: [
    {
      name: 'Bitcoin',
      symbol: 'BTC',
      pair: 'BTCUSDT',
      defaultPrice: 75368.45,
      defaultChange: 1.92,
      decimals: 2,
      prefix: '$',
    },
    {
      name: 'Ethereum',
      symbol: 'ETH',
      pair: 'ETHUSDT',
      defaultPrice: 4149.74,
      defaultChange: 1.86,
      decimals: 2,
      prefix: '$',
    },
    {
      name: 'Litecoin',
      symbol: 'LTC',
      pair: 'LTCUSDT',
      defaultPrice: 94.92,
      defaultChange: 26.83,
      decimals: 2,
      prefix: '$',
    },
    {
      name: 'Solana',
      symbol: 'SOL',
      pair: 'SOLUSDT',
      defaultPrice: 175.03,
      defaultChange: 1.94,
      decimals: 2,
      prefix: '$',
    },
    {
      name: 'Binance',
      symbol: 'BNB',
      pair: 'BNBUSDT',
      defaultPrice: 614.35,
      defaultChange: 52.08,
      decimals: 2,
      prefix: '$',
    },
    {
      name: 'Cardano',
      symbol: 'ADA',
      pair: 'ADAUSDT',
      defaultPrice: 0.56,
      defaultChange: 12.04,
      decimals: 4,
      prefix: '$',
    },
  ],
};

const ALL_MARKET_ITEMS: MarketItem[] = [
  ...MARKET_DATA.forex,
  ...MARKET_DATA.cfd,
  ...MARKET_DATA.crypto,
];

export const WatchlistPanel: React.FC = () => {
  const { selectedSymbol, setSelectedSymbol, tickers } = useTradingStore();
  const [activeCategory, setActiveCategory] = useState<MarketCategory>('forex');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(['BTCUSDT', 'XAUUSD', 'EURUSD', 'GBPUSD']);

  const toggleFavorite = (e: React.MouseEvent, pair: string) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(pair) ? prev.filter((p) => p !== pair) : [...prev, pair]
    );
  };

  const currentItems = showOnlyFavorites
    ? ALL_MARKET_ITEMS.filter((item) => favorites.includes(item.pair))
    : MARKET_DATA[activeCategory];

  return (
    <div className="flex flex-col w-full bg-[#1F1E25] border border-white/5 rounded-3xl p-4 select-none">
      {/* Top Header Controls: 3-Category Switcher Box (Forex, CFD, Kripto) + Standalone Outside Favorit Button */}
      <div className="flex items-center gap-2 mb-4">
        {/* 3 Categories Switcher Box (Forex, CFD, Kripto) */}
        <div className="flex-1 flex items-center p-1 bg-[#26252E] border border-white/5 rounded-2xl text-xs font-bold gap-1">
          {CATEGORIES.map((cat) => {
            const isActive = !showOnlyFavorites && activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setShowOnlyFavorites(false);
                  setActiveCategory(cat.id);
                }}
                className={`group relative flex-1 py-2 text-xs font-bold rounded-xl overflow-hidden transition-colors duration-1000 cursor-pointer ${
                  isActive
                    ? 'bg-[#00E163] text-black font-bold'
                    : 'text-slate-400 hover:text-black'
                }`}
              >
                {/* Left-to-Right Sliding Green Layer (1000ms) */}
                {!isActive && (
                  <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                )}
                <span className="relative z-10 transition-colors duration-1000">{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Standalone Outside Favorit Toggle Button (Pure Star Icon with 1000ms Left-to-Right Sweep) */}
        <button
          onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
          className={`group relative flex items-center justify-center w-[42px] h-[42px] rounded-2xl border overflow-hidden transition-colors duration-1000 cursor-pointer select-none shrink-0 ${
            showOnlyFavorites
              ? 'bg-amber-400 text-black border-amber-400 font-bold'
              : 'bg-[#26252E] border-white/5 text-slate-400 hover:text-black hover:border-amber-400/40'
          }`}
          title="Filter Pasar Favorit"
        >
          {/* Left-to-Right Sliding Amber Layer (1000ms) */}
          {!showOnlyFavorites && (
            <span className="absolute inset-0 bg-amber-400 -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
          )}
          <Star
            className={`w-4 h-4 relative z-10 transition-colors duration-1000 ${
              showOnlyFavorites ? 'fill-black text-black' : 'group-hover:text-black fill-none'
            }`}
          />
        </button>
      </div>

      {/* Market Items List */}
      <div className="flex flex-col space-y-2 max-h-[380px] overflow-y-auto pr-1">
        {currentItems.map((item) => {
          const isSelected = selectedSymbol === item.pair;
          const isFav = favorites.includes(item.pair);
          const liveTicker = tickers[item.pair];
          const price = liveTicker ? liveTicker.price : item.defaultPrice;
          const change = liveTicker ? liveTicker.change_percent : item.defaultChange;
          const isPositive = change >= 0;

          return (
            <div
              key={item.pair}
              onClick={() => setSelectedSymbol(item.pair)}
              className={`group/row flex items-center justify-between px-3 py-2.5 rounded-2xl cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'bg-[#00E163]/10 border border-[#00E163]/30 shadow-[0_0_12px_rgba(0,225,99,0.1)]'
                  : 'hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              {/* Left: Star Button + Authentic Vector Logo + Name + Symbol */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={(e) => toggleFavorite(e, item.pair)}
                  className={`p-1 rounded-lg transition-colors cursor-pointer ${
                    isFav
                      ? 'text-amber-400 hover:text-amber-300'
                      : 'text-slate-600 hover:text-amber-400 opacity-60 group-hover/row:opacity-100'
                  }`}
                  title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                </button>

                <MarketIcon symbol={item.symbol} size="md" />

                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white tracking-wide">
                    {item.name}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {item.symbol}
                  </span>
                </div>
              </div>

              {/* Right: Price & Percent Change */}
              <div className="flex flex-col items-end font-mono-num">
                <span className="text-xs font-bold text-white">
                  {item.prefix}
                  {price.toLocaleString('en-US', {
                    minimumFractionDigits: item.decimals,
                    maximumFractionDigits: item.decimals,
                  })}
                </span>
                <span
                  className={`text-[10px] font-bold ${
                    isPositive ? 'text-[#00E163]' : 'text-[#FF5C77]'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {change.toFixed(2)}%
                </span>
              </div>
            </div>
          );
        })}

        {currentItems.length === 0 && (
          <div className="py-12 text-center text-xs text-slate-500">
            Belum ada aset yang ditandai bintang (Favorit).
          </div>
        )}
      </div>
    </div>
  );
};
