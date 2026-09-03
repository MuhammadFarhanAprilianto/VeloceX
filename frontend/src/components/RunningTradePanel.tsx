'use client';

import React, { useState, useEffect } from 'react';
import { useTradingStore } from '@/store/useTradingStore';
import { getAssetConfig } from '@/lib/assetConfig';

interface MockTrade {
  id: string;
  price: number;
  amount: number;
  time: string;
  isBuy: boolean;
}

const STATIC_OFFSETS = [
  { deltaStep: 1.2, isBuy: true, time: '15:40:14', amtRatio: 1.0 },
  { deltaStep: -0.8, isBuy: true, time: '14:21:02', amtRatio: 1.5 },
  { deltaStep: -1.3, isBuy: true, time: '13:54:11', amtRatio: 2.2 },
  { deltaStep: -2.0, isBuy: true, time: '13:24:04', amtRatio: 0.5 },
  { deltaStep: -3.7, isBuy: false, time: '13:10:12', amtRatio: 3.1 },
  { deltaStep: -3.5, isBuy: false, time: '12:32:49', amtRatio: 4.8 },
  { deltaStep: -3.3, isBuy: true, time: '11:16:21', amtRatio: 1.2 },
  { deltaStep: -3.8, isBuy: false, time: '10:21:53', amtRatio: 1.8 },
];

export const RunningTradePanel: React.FC = () => {
  const { selectedSymbol, tickers } = useTradingStore();
  const config = getAssetConfig(selectedSymbol);

  const currentTicker = tickers[selectedSymbol];
  const basePrice = currentTicker?.price ?? config.defaultPrice;

  // 100% Deterministic initial trades generator to eliminate any SSR hydration mismatch
  const generateDeterministicTrades = (price: number): MockTrade[] => {
    const step = config.tickSize;

    return STATIC_OFFSETS.map((item, i) => {
      const tradePrice = Math.max(0.0001, price + item.deltaStep * step);
      const amountVal =
        config.decimals >= 4
          ? Math.round(item.amtRatio * 8000)
          : config.defaultPrice > 1000
          ? Math.round(item.amtRatio * 0.15 * 1000) / 1000
          : Math.round(item.amtRatio * 12 * 100) / 100;

      return {
        id: `init_${selectedSymbol}_${i}`,
        price: tradePrice,
        amount: amountVal,
        time: item.time,
        isBuy: item.isBuy,
      };
    });
  };

  const [trades, setTrades] = useState<MockTrade[]>(() => generateDeterministicTrades(basePrice));

  // Reset trades whenever selectedSymbol changes
  useEffect(() => {
    setTrades(generateDeterministicTrades(basePrice));
  }, [selectedSymbol]);

  // Live real-time tick streaming simulation in browser only
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');

      const isBuy = Math.random() > 0.48;
      const delta = (Math.random() * 4 - 2) * config.tickSize;
      const newPrice = Math.max(0.0001, basePrice + delta);

      const amountVal =
        config.decimals >= 4
          ? Math.round(Math.random() * 20000 + 1000)
          : config.defaultPrice > 1000
          ? Math.round((Math.random() * 0.8 + 0.01) * 1000) / 1000
          : Math.round((Math.random() * 25 + 0.5) * 100) / 100;

      const newTrade: MockTrade = {
        id: `trade_${Date.now()}`,
        price: newPrice,
        amount: amountVal,
        time: `${hours}:${mins}:${secs}`,
        isBuy,
      };

      setTrades((prev) => [newTrade, ...prev.slice(0, 7)]);
    }, 2200);

    return () => clearInterval(interval);
  }, [basePrice, config]);

  return (
    <div className="flex flex-col w-full bg-[#1F1E25] border border-white/5 rounded-3xl p-4 select-none">
      {/* Title */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white tracking-wide">
          Running Trade
        </h3>
        <span className="text-[10px] font-mono text-slate-500 font-bold">
          {config.symbol}
        </span>
      </div>

      {/* Table Headers */}
      <div className="grid grid-cols-3 text-[11px] font-semibold text-slate-500 pb-2 border-b border-white/5">
        <span>Price ({config.prefix || 'USD'})</span>
        <span className="text-center">Amount</span>
        <span className="text-right">Time</span>
      </div>

      {/* Trade Rows with Real-time Tick Animation */}
      <div className="flex flex-col space-y-1.5 pt-2 font-mono-num text-xs">
        {trades.map((trade) => (
          <div
            key={trade.id}
            className="grid grid-cols-3 items-center py-0.5 hover:bg-white/[0.02] rounded-lg px-1 transition-colors"
          >
            <span
              className={`font-semibold ${
                trade.isBuy ? 'text-[#00E163]' : 'text-[#FF5C77]'
              }`}
            >
              {config.prefix}
              {trade.price.toLocaleString('en-US', {
                minimumFractionDigits: config.decimals,
                maximumFractionDigits: config.decimals,
              })}
            </span>
            <span className="text-center text-slate-300 text-[11px]">
              {trade.amount.toLocaleString('en-US')}{' '}
              <span className="text-slate-500 text-[10px]">{config.unit}</span>
            </span>
            <span className="text-right text-slate-500 text-[11px]">
              {trade.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
