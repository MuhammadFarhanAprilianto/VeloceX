'use client';

import React from 'react';
import { useTradingStore } from '@/store/useTradingStore';
import { getAssetConfig } from '@/lib/assetConfig';

export const OrderFilledCard: React.FC = () => {
  const { selectedSymbol, tickers } = useTradingStore();
  const config = getAssetConfig(selectedSymbol);

  const currentTicker = tickers[selectedSymbol];
  const unitPrice = currentTicker?.price ?? config.defaultPrice;

  const filledAmount = config.decimals >= 4 ? '50,000' : config.defaultPrice > 1000 ? '1.41' : '85.0';
  const totalUsd = Math.round(parseFloat(filledAmount.replace(/,/g, '')) * unitPrice);

  const progressFraction =
    config.decimals >= 4
      ? '12,500/50,000'
      : config.defaultPrice > 1000
      ? '0.12/3.5'
      : '10.5/85.0';

  return (
    <div className="flex flex-col w-full bg-[#1F1E25] border border-white/5 rounded-3xl p-5 select-none">
      {/* Title */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white tracking-wide font-heading">
          Order Filled
        </h3>
        <span className="text-[10px] font-mono text-[#00E163] font-bold">
          FILLED
        </span>
      </div>

      {/* Card Content */}
      <div className="flex items-center justify-between px-3.5 py-3 bg-[#26252E] border border-white/5 rounded-2xl font-mono-num text-xs">
        <span className="font-bold text-[#00E163] text-sm">
          ${totalUsd.toLocaleString('en-US')}
        </span>
        <span className="font-semibold text-slate-200 text-[11px]">
          {filledAmount} {config.unit}
        </span>
        <span className="text-slate-400 text-[11px]">
          {progressFraction} {config.unit}
        </span>
      </div>
    </div>
  );
};
