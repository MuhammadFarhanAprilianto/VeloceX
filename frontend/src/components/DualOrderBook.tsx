'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTradingStore } from '@/store/useTradingStore';
import { getAssetConfig } from '@/lib/assetConfig';

interface DepthRow {
  price: string;
  size: string;
  sum: string;
  depthPct: number;
}

export const DualOrderBook: React.FC = () => {
  const { selectedSymbol, tickers } = useTradingStore();
  const config = getAssetConfig(selectedSymbol);

  const currentTicker = tickers[selectedSymbol];
  const centerPrice = currentTicker?.price ?? config.defaultPrice;
  const step = config.tickSize * 8;

  const formatPrice = (val: number) =>
    val.toLocaleString('en-US', {
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    });

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Multiplier schedule: bar starts shorter near market price (24%) and dynamically expands longer as depth accumulates (98%)
  const DEPTH_LADDER = [
    { stepMult: 0.5, sizeMult: 1.0, sumUsd: '13.06M', depthPct: 24 },
    { stepMult: 1.2, sizeMult: 2.2, sumUsd: '46.72M', depthPct: 38 },
    { stepMult: 2.1, sizeMult: 4.8, sumUsd: '114.17M', depthPct: 52 },
    { stepMult: 3.2, sizeMult: 8.5, sumUsd: '960.47K', depthPct: 66 },
    { stepMult: 4.5, sizeMult: 15.0, sumUsd: '6.74M', depthPct: 78 },
    { stepMult: 5.8, sizeMult: 22.4, sumUsd: '1.47M', depthPct: 86 },
    { stepMult: 7.2, sizeMult: 35.0, sumUsd: '741.06K', depthPct: 92 },
    { stepMult: 8.8, sizeMult: 52.0, sumUsd: '226.06M', depthPct: 98 },
  ];

  // Dynamic Bids: Price naik/tinggi (Row 0) -> Bar Panjang (98%), Price murah/rendah (Row 7) -> Bar Pendek (22%)
  const bids: DepthRow[] = useMemo(() => {
    const minBidPrice = Math.max(0.0001, centerPrice - step * 8.8);
    const maxBidPrice = Math.max(0.0001, centerPrice - step * 0.5);
    const priceRange = maxBidPrice - minBidPrice || 1;

    return DEPTH_LADDER.map((item) => {
      const priceVal = Math.max(0.0001, centerPrice - step * item.stepMult);
      const sizeVal =
        config.decimals >= 4
          ? (item.sizeMult * 10).toFixed(2)
          : config.defaultPrice > 1000
          ? (item.sizeMult * 0.15).toFixed(2)
          : (item.sizeMult * 2.5).toFixed(2);

      // Price murah -> pendek (22%), price naik -> panjang (98%)
      const normalizedPrice = (priceVal - minBidPrice) / priceRange;
      const depthPct = Math.round(22 + normalizedPrice * 76);

      return {
        price: formatPrice(priceVal),
        size: sizeVal,
        sum: item.sumUsd,
        depthPct,
      };
    });
  }, [centerPrice, step, config]);

  // Dynamic Asks: Price murah/rendah (Row 0) -> Bar Pendek (22%), Price naik/tinggi (Row 7) -> Bar Panjang (98%)
  const asks: DepthRow[] = useMemo(() => {
    const minAskPrice = centerPrice + step * 0.5;
    const maxAskPrice = centerPrice + step * 8.8;
    const priceRange = maxAskPrice - minAskPrice || 1;

    return DEPTH_LADDER.map((item) => {
      const priceVal = centerPrice + step * item.stepMult;
      const sizeVal =
        config.decimals >= 4
          ? (item.sizeMult * 10).toFixed(2)
          : config.defaultPrice > 1000
          ? (item.sizeMult * 0.15).toFixed(2)
          : (item.sizeMult * 2.5).toFixed(2);

      // Price murah -> pendek (22%), price naik -> panjang (98%)
      const normalizedPrice = (priceVal - minAskPrice) / priceRange;
      const depthPct = Math.round(22 + normalizedPrice * 76);

      return {
        sum: item.sumUsd,
        size: sizeVal,
        price: formatPrice(priceVal),
        depthPct,
      };
    });
  }, [centerPrice, step, config]);

  if (!mounted) {
    return (
      <div className="flex flex-col w-full bg-[#1F1E25] border border-white/5 rounded-3xl p-5 select-none min-h-[300px]">
        <h3 className="text-sm font-bold text-white mb-3 tracking-wide font-heading">
          Order Book
        </h3>
        <div className="flex items-center justify-center h-48 text-xs text-slate-500">
          Loading order depth...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full bg-[#1F1E25] border border-white/5 rounded-3xl p-5 select-none">
      {/* Title */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white tracking-wide font-heading">
          Order Book
        </h3>
        <span className="text-[10px] font-mono font-bold text-slate-400">
          Spread: {formatPrice(step)}
        </span>
      </div>

      {/* Grid: Left Bids (Green Depth), Right Asks (Red Depth) */}
      <div className="grid grid-cols-2 gap-4 text-xs font-mono-num">
        {/* Left: Bids Table */}
        <div className="flex flex-col">
          {/* Header */}
          <div className="grid grid-cols-3 text-[11px] font-semibold text-slate-500 pb-2 border-b border-white/5 px-2">
            <span>Price ({config.prefix || 'USD'})</span>
            <span className="text-center">Size</span>
            <span className="text-right">Sum (USD)</span>
          </div>

          {/* Rows */}
          <div className="flex flex-col space-y-1 pt-1.5">
            {bids.map((row, idx) => (
              <div
                key={idx}
                className="group relative flex items-center h-7 px-2 rounded-lg hover:bg-white/[0.04] transition-colors overflow-hidden cursor-pointer"
              >
                {/* Dynamic Horizontal Depth Bar (Green) */}
                <div
                  style={{ width: `${row.depthPct}%` }}
                  className="absolute left-0 top-0.5 bottom-0.5 bg-[#00E163]/15 rounded-r-[4px] pointer-events-none transition-all duration-500"
                />

                {/* Row Content Overlay */}
                <div className="relative z-10 w-full grid grid-cols-3 items-center">
                  <span className="text-[#00E163] font-bold text-[11px] tracking-tight">
                    {row.price}
                  </span>
                  <span className="text-center text-slate-300 text-[11px] font-medium">
                    {row.size}
                  </span>
                  <span className="text-right text-slate-400 text-[11px]">
                    {row.sum}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Asks Table */}
        <div className="flex flex-col">
          {/* Header */}
          <div className="grid grid-cols-3 text-[11px] font-semibold text-slate-500 pb-2 border-b border-white/5 px-2">
            <span className="text-left">Sum (USD)</span>
            <span className="text-center">Size</span>
            <span className="text-right">Price ({config.prefix || 'USD'})</span>
          </div>

          {/* Rows */}
          <div className="flex flex-col space-y-1 pt-1.5">
            {asks.map((row, idx) => (
              <div
                key={idx}
                className="group relative flex items-center h-7 px-2 rounded-lg hover:bg-white/[0.04] transition-colors overflow-hidden cursor-pointer"
              >
                {/* Dynamic Horizontal Depth Bar (#362227) */}
                <div
                  style={{ width: `${row.depthPct}%` }}
                  className="absolute right-0 top-0.5 bottom-0.5 bg-[#362227] rounded-l-[4px] pointer-events-none transition-all duration-500"
                />

                {/* Row Content Overlay */}
                <div className="relative z-10 w-full grid grid-cols-3 items-center">
                  <span className="text-left text-slate-400 text-[11px]">
                    {row.sum}
                  </span>
                  <span className="text-center text-slate-300 text-[11px] font-medium">
                    {row.size}
                  </span>
                  <span className="text-right text-[#FF5C77] font-bold text-[11px] tracking-tight">
                    {row.price}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
