'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useTradingStore } from '@/store/useTradingStore';
import { getAssetConfig } from '@/lib/assetConfig';
import { MarketIcon } from '@/components/MarketIcon';

interface OrderItem {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'LIMIT' | 'MARKET';
  totalUsd: string;
  amountAsset: string;
  priceUsd: string;
  date: string;
  status: 'OPEN' | 'FILLED' | 'CANCELLED';
  filledPct: number;
}

export const MyOrdersCard: React.FC = () => {
  const { selectedSymbol, tickers, openOrders: storeOrders, removeOrder: cancelOrder } = useTradingStore();
  const config = getAssetConfig(selectedSymbol);

  const currentTicker = tickers[selectedSymbol];
  const unitPrice = currentTicker?.price ?? config.defaultPrice;

  // View All Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'OPEN' | 'HISTORY' | 'ALL'>('ALL');
  const [modalSearch, setModalSearch] = useState('');

  // Generate dynamic sample orders for active symbol
  const generateInitialOrders = (): OrderItem[] => {
    const p = unitPrice;
    const a1 = config.decimals >= 4 ? '10,000' : config.defaultPrice > 1000 ? '0.26' : '15.5';
    const a2 = config.decimals >= 4 ? '15,000' : config.defaultPrice > 1000 ? '0.31' : '22.0';
    const a3 = config.decimals >= 4 ? '8,000' : config.defaultPrice > 1000 ? '0.17' : '11.2';

    const calcTotal = (amtStr: string) => {
      const num = parseFloat(amtStr.replace(/,/g, ''));
      return `$${Math.round(num * p).toLocaleString('en-US')}`;
    };

    return [
      {
        id: 'ord_1',
        symbol: selectedSymbol,
        side: 'BUY',
        type: 'LIMIT',
        totalUsd: calcTotal(a1),
        amountAsset: `${a1} ${config.unit}`,
        priceUsd: `${config.prefix}${p.toLocaleString('en-US', { minimumFractionDigits: config.decimals })}`,
        date: '2026-09-01 14:20:10',
        status: 'OPEN',
        filledPct: 45,
      },
      {
        id: 'ord_2',
        symbol: selectedSymbol,
        side: 'BUY',
        type: 'LIMIT',
        totalUsd: calcTotal(a2),
        amountAsset: `${a2} ${config.unit}`,
        priceUsd: `${config.prefix}${p.toLocaleString('en-US', { minimumFractionDigits: config.decimals })}`,
        date: '2026-09-01 12:15:44',
        status: 'OPEN',
        filledPct: 0,
      },
      {
        id: 'ord_3',
        symbol: selectedSymbol,
        side: 'SELL',
        type: 'LIMIT',
        totalUsd: calcTotal(a3),
        amountAsset: `${a3} ${config.unit}`,
        priceUsd: `${config.prefix}${p.toLocaleString('en-US', { minimumFractionDigits: config.decimals })}`,
        date: '2026-09-01 10:05:12',
        status: 'OPEN',
        filledPct: 80,
      },
      {
        id: 'ord_4',
        symbol: 'BTCUSDT',
        side: 'BUY',
        type: 'MARKET',
        totalUsd: '$37,684',
        amountAsset: '0.50 BTC',
        priceUsd: '$75,368.45',
        date: '2026-08-31 18:30:00',
        status: 'FILLED',
        filledPct: 100,
      },
      {
        id: 'ord_5',
        symbol: 'ETHUSDT',
        side: 'SELL',
        type: 'LIMIT',
        totalUsd: '$12,449',
        amountAsset: '3.00 ETH',
        priceUsd: '$4,149.74',
        date: '2026-08-30 09:12:18',
        status: 'FILLED',
        filledPct: 100,
      },
    ];
  };

  const [orders, setOrders] = useState<OrderItem[]>(() => generateInitialOrders());

  useEffect(() => {
    setOrders(generateInitialOrders());
  }, [selectedSymbol]);

  const handleRemove = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'CANCELLED' as const } : o))
    );
    cancelOrder(id);
  };

  const activeSymbolOrders = orders.filter((o) => o.symbol === selectedSymbol && o.status === 'OPEN');

  const filteredModalOrders = orders.filter((o) => {
    const matchesTab =
      modalTab === 'ALL'
        ? true
        : modalTab === 'OPEN'
        ? o.status === 'OPEN'
        : o.status !== 'OPEN';

    const matchesSearch =
      o.symbol.toLowerCase().includes(modalSearch.toLowerCase()) ||
      o.side.toLowerCase().includes(modalSearch.toLowerCase()) ||
      o.id.toLowerCase().includes(modalSearch.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <>
      <div className="flex flex-col w-full bg-[#1F1E25] border border-white/5 rounded-3xl p-5 select-none">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white tracking-wide font-heading">
            My Order
          </h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-[11px] font-semibold text-[#00E163] hover:underline cursor-pointer"
          >
            View all
          </button>
        </div>

        {/* Orders List for Active Symbol */}
        <div className="flex flex-col space-y-2">
          {activeSymbolOrders.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-3.5 py-2.5 bg-[#26252E] border border-white/5 rounded-2xl font-mono-num text-xs hover:border-white/15 transition-all"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                    item.side === 'BUY'
                      ? 'bg-[#00E163]/20 text-[#00E163]'
                      : 'bg-[#362227] text-[#FF5C77] border border-[#FF5C77]/30'
                  }`}
                >
                  {item.side}
                </span>
                <span className="font-bold text-white">{item.totalUsd}</span>
              </div>
              <span className="font-medium text-slate-200 text-[11px]">
                {item.amountAsset}
              </span>
              <span className="text-slate-400 text-[11px]">{item.priceUsd}</span>
              <button
                onClick={() => handleRemove(item.id)}
                className="flex items-center justify-center w-5 h-5 rounded-full text-slate-500 hover:text-[#FF5C77] hover:bg-white/10 transition-colors cursor-pointer"
                title="Cancel Order"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {activeSymbolOrders.length === 0 && (
            <div className="py-4 text-center text-xs text-slate-500">
              No active open orders for {config.symbol}
            </div>
          )}
        </div>
      </div>

      {/* VIEW ALL ORDERS MODAL POP-UP */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col w-full max-w-3xl bg-[#1F1E25] border border-white/15 rounded-3xl shadow-2xl overflow-hidden p-6 max-h-[85vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-black text-white tracking-wide font-heading">
                    All Orders & Trade History
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#26252E] border border-white/10 text-xs font-mono text-[#00E163]">
                    {orders.length} Total
                  </span>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filters & Search Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                {/* Tabs */}
                <div className="flex items-center p-1 bg-[#26252E] rounded-xl text-xs font-semibold gap-1">
                  {(['ALL', 'OPEN', 'HISTORY'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setModalTab(tab)}
                      className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                        modalTab === tab
                          ? 'bg-[#00E163] text-black font-bold shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab === 'ALL'
                        ? 'All Orders'
                        : tab === 'OPEN'
                        ? 'Open Orders'
                        : 'History'}
                    </button>
                  ))}
                </div>

                {/* Search Input */}
                <div className="relative flex items-center w-64 h-9">
                  <Search className="absolute left-3 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search pair or ID..."
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    className="w-full h-full pl-9 pr-3 text-xs bg-[#26252E] border border-white/5 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#00E163]/50"
                  />
                </div>
              </div>

              {/* Table of Orders */}
              <div className="flex flex-col overflow-y-auto pr-1 font-mono-num text-xs">
                <div className="grid grid-cols-7 text-[11px] font-bold text-slate-500 pb-2 border-b border-white/5 px-2">
                  <span>Pair</span>
                  <span>Side / Type</span>
                  <span>Price</span>
                  <span>Amount</span>
                  <span>Total</span>
                  <span>Date</span>
                  <span className="text-right">Status / Action</span>
                </div>

                <div className="flex flex-col space-y-1.5 pt-2">
                  {filteredModalOrders.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-7 items-center px-2 py-2.5 rounded-xl hover:bg-white/[0.03] transition-colors border border-transparent hover:border-white/5"
                    >
                      {/* Pair */}
                      <div className="flex items-center gap-2">
                        <MarketIcon symbol={item.symbol} size="sm" />
                        <span className="font-bold text-white">{item.symbol}</span>
                      </div>

                      {/* Side / Type */}
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                            item.side === 'BUY'
                              ? 'bg-[#00E163]/20 text-[#00E163]'
                              : 'bg-[#362227] text-[#FF5C77] border border-[#FF5C77]/30'
                          }`}
                        >
                          {item.side}
                        </span>
                        <span className="text-[10px] text-slate-400 font-sans">
                          {item.type}
                        </span>
                      </div>

                      {/* Price */}
                      <span className="text-slate-300">{item.priceUsd}</span>

                      {/* Amount */}
                      <span className="text-slate-300">{item.amountAsset}</span>

                      {/* Total */}
                      <span className="font-bold text-white">{item.totalUsd}</span>

                      {/* Date */}
                      <span className="text-[10px] text-slate-500">{item.date}</span>

                      {/* Status / Action */}
                      <div className="flex items-center justify-end gap-2">
                        {item.status === 'OPEN' ? (
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="px-2.5 py-1 rounded-lg bg-[#362227] hover:bg-[#462b32] text-[#FF5C77] font-bold text-[10px] transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        ) : item.status === 'FILLED' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#00E163] bg-[#00E163]/10 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3" /> FILLED
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded-md">
                            CANCELLED
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {filteredModalOrders.length === 0 && (
                    <div className="py-12 text-center text-xs text-slate-500">
                      No matching orders found.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
