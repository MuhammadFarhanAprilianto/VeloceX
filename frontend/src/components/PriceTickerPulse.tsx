'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MarketTicker } from '@/types/trading';
import { TrendingUp, TrendingDown, ChevronDown } from 'lucide-react';
import { useTradingStore } from '@/store/useTradingStore';

interface PriceTickerPulseProps {
  ticker?: MarketTicker;
}

export const PriceTickerPulse: React.FC<PriceTickerPulseProps> = ({ ticker }) => {
  const { selectedSymbol, setSelectedSymbol } = useTradingStore();
  const [direction, setDirection] = useState<'up' | 'down' | 'none'>('none');
  const [showDropdown, setShowDropdown] = useState(false);
  const prevPriceRef = useRef<number | undefined>(ticker?.price);

  useEffect(() => {
    if (!ticker) return;

    if (prevPriceRef.current !== undefined) {
      if (ticker.price > prevPriceRef.current) {
        setDirection('up');
      } else if (ticker.price < prevPriceRef.current) {
        setDirection('down');
      }
      const timeout = setTimeout(() => setDirection('none'), 400);
      prevPriceRef.current = ticker.price;
      return () => clearTimeout(timeout);
    }
    prevPriceRef.current = ticker.price;
  }, [ticker?.price]);

  const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];

  const isPositive = (ticker?.change_percent ?? 0) >= 0;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-dark-800 bg-dark-900/90 px-6 py-3 backdrop-blur-md">
      {/* Symbol Selector Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2.5 rounded-lg bg-dark-850 px-3.5 py-1.5 font-bold text-white transition-all hover:bg-dark-800 hover:ring-1 hover:ring-slate-700"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20 text-xs font-black text-amber-400">
            {selectedSymbol.slice(0, 3)}
          </div>
          <span className="text-base tracking-wide">{selectedSymbol}</span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>

        {showDropdown && (
          <div className="absolute left-0 top-full z-50 mt-2 w-48 rounded-xl border border-dark-700 bg-dark-850 p-1.5 shadow-2xl backdrop-blur-xl">
            {symbols.map((sym) => (
              <button
                key={sym}
                onClick={() => {
                  setSelectedSymbol(sym);
                  setShowDropdown(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  sym === selectedSymbol
                    ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
                    : 'text-slate-300 hover:bg-dark-800 hover:text-white'
                }`}
              >
                <span>{sym}</span>
                <span className="text-xs text-slate-500">Spot</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Real-Time Price with Motion Pulse */}
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Market Price
          </span>
          <motion.div
            key={ticker?.price}
            initial={{ opacity: 0.85, scale: 0.98 }}
            animate={{
              opacity: 1,
              scale: 1,
              backgroundColor:
                direction === 'up'
                  ? 'rgba(16, 185, 129, 0.22)'
                  : direction === 'down'
                  ? 'rgba(244, 63, 94, 0.22)'
                  : 'rgba(0, 0, 0, 0)',
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`flex items-center gap-2 rounded-md px-2 py-0.5 font-mono-num text-xl font-bold transition-colors ${
              direction === 'up'
                ? 'text-emerald-400'
                : direction === 'down'
                ? 'text-rose-400'
                : 'text-white'
            }`}
          >
            {ticker ? (
              <>
                <span>${ticker.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                {direction === 'up' && (
                  <motion.span initial={{ y: 2, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                  </motion.span>
                )}
                {direction === 'down' && (
                  <motion.span initial={{ y: -2, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                    <TrendingDown className="h-4 w-4 text-rose-400" />
                  </motion.span>
                )}
              </>
            ) : (
              <span className="text-slate-500">Connecting...</span>
            )}
          </motion.div>
        </div>

        {/* 24h Change */}
        <div className="flex flex-col">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            24h Change
          </span>
          <div
            className={`flex items-center gap-1 font-mono-num text-sm font-semibold ${
              isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            <span>{isPositive ? '+' : ''}{ticker?.change_percent.toFixed(2)}%</span>
            <span className="text-xs text-slate-400">
              ({isPositive ? '+' : ''}${ticker?.change_24h.toFixed(2)})
            </span>
          </div>
        </div>

        {/* 24h High */}
        <div className="hidden flex-col sm:flex">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            24h High
          </span>
          <span className="font-mono-num text-sm font-medium text-slate-200">
            ${ticker?.high_24h.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* 24h Low */}
        <div className="hidden flex-col sm:flex">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            24h Low
          </span>
          <span className="font-mono-num text-sm font-medium text-slate-200">
            ${ticker?.low_24h.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* 24h Volume */}
        <div className="hidden flex-col md:flex">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            24h Volume
          </span>
          <span className="font-mono-num text-sm font-medium text-slate-200">
            {ticker?.volume_24h.toLocaleString('en-US', { maximumFractionDigits: 2 })} {selectedSymbol.replace('USDT', '')}
          </span>
        </div>
      </div>
    </div>
  );
};
