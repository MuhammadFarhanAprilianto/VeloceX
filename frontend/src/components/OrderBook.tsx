'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTradingStore } from '@/store/useTradingStore';
import { DepthLevel } from '@/types/trading';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface OrderBookProps {
  onSelectPrice?: (price: number) => void;
}

export const OrderBook: React.FC<OrderBookProps> = ({ onSelectPrice }) => {
  const { orderBook, tickers, selectedSymbol } = useTradingStore();
  const currentTicker = tickers[selectedSymbol];

  // Flashing row tracker
  const [flashedRows, setFlashedRows] = useState<Record<string, 'bid' | 'ask'>>({});
  const prevDataRef = useRef<{ asks: DepthLevel[]; bids: DepthLevel[] }>({ asks: [], bids: [] });

  useEffect(() => {
    if (!orderBook) return;

    const newFlashes: Record<string, 'bid' | 'ask'> = {};

    // Check ask changes
    orderBook.asks.forEach((ask) => {
      const prev = prevDataRef.current.asks.find((p) => p.price === ask.price);
      if (!prev || prev.amount !== ask.amount) {
        newFlashes[`ask-${ask.price}`] = 'ask';
      }
    });

    // Check bid changes
    orderBook.bids.forEach((bid) => {
      const prev = prevDataRef.current.bids.find((p) => p.price === bid.price);
      if (!prev || prev.amount !== bid.amount) {
        newFlashes[`bid-${bid.price}`] = 'bid';
      }
    });

    if (Object.keys(newFlashes).length > 0) {
      setFlashedRows((curr) => ({ ...curr, ...newFlashes }));
      const timer = setTimeout(() => {
        setFlashedRows({});
      }, 350);
      prevDataRef.current = { asks: orderBook.asks, bids: orderBook.bids };
      return () => clearTimeout(timer);
    }
  }, [orderBook]);

  // Asks displayed top-to-bottom (highest ask to lowest ask)
  const asks = orderBook?.asks ? [...orderBook.asks].slice(0, 10).reverse() : [];
  const bids = orderBook?.bids ? orderBook.bids.slice(0, 10) : [];

  const maxAskTotal = asks.length > 0 ? Math.max(...asks.map((a) => a.total)) : 1;
  const maxBidTotal = bids.length > 0 ? Math.max(...bids.map((b) => b.total)) : 1;
  const maxTotal = Math.max(maxAskTotal, maxBidTotal, 1);

  const bestAsk = orderBook?.asks?.[0]?.price ?? 0;
  const bestBid = orderBook?.bids?.[0]?.price ?? 0;
  const spread = bestAsk > 0 && bestBid > 0 ? (bestAsk - bestBid).toFixed(2) : '0.00';

  return (
    <div className="flex h-full w-full flex-col border-l border-dark-800 bg-dark-900 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-dark-800 px-4 py-2.5 font-semibold text-slate-400">
        <span>Order Book</span>
        <span className="text-[11px] text-slate-500">Real-Time Depth</span>
      </div>

      {/* Column Titles */}
      <div className="grid grid-cols-3 px-4 py-1.5 font-medium text-[11px] text-slate-500 border-b border-dark-800/60">
        <span className="text-left">Price (USDT)</span>
        <span className="text-right">Size ({selectedSymbol.replace('USDT', '')})</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks (Sell Orders - Red) */}
      <div className="flex-1 overflow-y-auto font-mono-num flex flex-col justify-end space-y-[1px] py-1">
        {asks.map((item) => {
          const depthPercent = Math.min((item.total / maxTotal) * 100, 100);
          const isFlashed = flashedRows[`ask-${item.price}`];

          return (
            <div
              key={`ask-${item.price}`}
              onClick={() => onSelectPrice?.(item.price)}
              className={`relative grid grid-cols-3 px-4 py-1 cursor-pointer transition-colors duration-300 hover:bg-rose-500/10 ${
                isFlashed ? 'bg-rose-500/20' : 'bg-transparent'
              }`}
            >
              {/* Depth background bar */}
              <div
                className="absolute right-0 top-0 bottom-0 bg-rose-500/10 transition-all duration-200 pointer-events-none"
                style={{ width: `${depthPercent}%` }}
              />
              <span className="relative z-10 text-rose-400 font-medium">
                {item.price.toFixed(2)}
              </span>
              <span className="relative z-10 text-right text-slate-300">
                {item.amount.toFixed(4)}
              </span>
              <span className="relative z-10 text-right text-slate-500">
                {item.total.toFixed(4)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mid Spread & Market Price Indicator */}
      <div className="flex items-center justify-between border-y border-dark-800 bg-dark-850 px-4 py-2 my-0.5">
        <div className="flex items-center gap-2">
          <span
            className={`font-mono-num text-sm font-bold ${
              (currentTicker?.change_percent ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            ${currentTicker?.price.toFixed(2) ?? '---'}
          </span>
          {(currentTicker?.change_percent ?? 0) >= 0 ? (
            <ArrowUp className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <ArrowDown className="h-3.5 w-3.5 text-rose-400" />
          )}
        </div>
        <div className="text-[11px] text-slate-400">
          Spread: <span className="font-mono-num font-semibold text-slate-200">${spread}</span>
        </div>
      </div>

      {/* Bids (Buy Orders - Green) */}
      <div className="flex-1 overflow-y-auto font-mono-num space-y-[1px] py-1">
        {bids.map((item) => {
          const depthPercent = Math.min((item.total / maxTotal) * 100, 100);
          const isFlashed = flashedRows[`bid-${item.price}`];

          return (
            <div
              key={`bid-${item.price}`}
              onClick={() => onSelectPrice?.(item.price)}
              className={`relative grid grid-cols-3 px-4 py-1 cursor-pointer transition-colors duration-300 hover:bg-emerald-500/10 ${
                isFlashed ? 'bg-emerald-500/20' : 'bg-transparent'
              }`}
            >
              {/* Depth background bar */}
              <div
                className="absolute right-0 top-0 bottom-0 bg-emerald-500/10 transition-all duration-200 pointer-events-none"
                style={{ width: `${depthPercent}%` }}
              />
              <span className="relative z-10 text-emerald-400 font-medium">
                {item.price.toFixed(2)}
              </span>
              <span className="relative z-10 text-right text-slate-300">
                {item.amount.toFixed(4)}
              </span>
              <span className="relative z-10 text-right text-slate-500">
                {item.total.toFixed(4)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
