'use client';

import React, { useState, useEffect } from 'react';
import { useTradingStore } from '@/store/useTradingStore';
import { useAuthStore } from '@/store/useAuthStore';
import { fetchWithAuth } from '@/lib/api';
import { Order, Trade } from '@/types/trading';
import { Clock, CheckCircle, XCircle, Trash2, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';

export const OrdersTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'open' | 'history'>('open');
  const { openOrders, setOpenOrders, removeOrder, trades, setTrades } = useTradingStore();
  const { isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Fetch orders and trades
  const fetchOrdersAndTrades = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const [ordersRes, tradesRes] = await Promise.all([
        fetchWithAuth('/orders?limit=30'),
        fetchWithAuth('/trades?limit=30'),
      ]);

      if (ordersRes.ok) {
        const data = await ordersRes.json();
        setOpenOrders(data.orders || []);
      }

      if (tradesRes.ok) {
        const data = await tradesRes.json();
        setTrades(data.trades || []);
      }
    } catch (e) {
      // Ignore network failures
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndTrades();
    const interval = setInterval(fetchOrdersAndTrades, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleCancelOrder = async (orderId: string) => {
    setCancellingId(orderId);
    try {
      const res = await fetchWithAuth(`/orders/${orderId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        removeOrder(orderId);
      }
    } catch (e) {
      // Error handling
    } finally {
      setCancellingId(null);
    }
  };

  // Filter open vs history
  const activeOrders = openOrders.filter(
    (o) => o.status === 'OPEN' || o.status === 'PARTIALLY_FILLED'
  );

  return (
    <div className="flex h-full w-full flex-col border-t border-dark-800 bg-dark-900 text-xs">
      {/* Tabs Header */}
      <div className="flex items-center justify-between border-b border-dark-800 px-6 py-2">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('open')}
            className={`relative py-2 font-semibold transition-colors ${
              activeTab === 'open' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Open Orders</span>
            {activeOrders.length > 0 && (
              <span className="ml-2 rounded-full bg-dark-750 px-2 py-0.5 text-[10px] font-mono-num font-bold text-emerald-400">
                {activeOrders.length}
              </span>
            )}
            {activeTab === 'open' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`relative py-2 font-semibold transition-colors ${
              activeTab === 'history' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Trade History</span>
            {activeTab === 'history' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400" />
            )}
          </button>
        </div>

        <button
          onClick={fetchOrdersAndTrades}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white"
          title="Refresh Data"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        {activeTab === 'open' ? (
          activeOrders.length > 0 ? (
            <table className="w-full text-left font-mono-num">
              <thead>
                <tr className="border-b border-dark-800/80 bg-dark-850/50 text-[11px] font-medium text-slate-400">
                  <th className="px-6 py-2.5">Date / Time</th>
                  <th className="px-4 py-2.5">Symbol</th>
                  <th className="px-4 py-2.5">Type</th>
                  <th className="px-4 py-2.5">Side</th>
                  <th className="px-4 py-2.5 text-right">Price (USDT)</th>
                  <th className="px-4 py-2.5 text-right">Amount</th>
                  <th className="px-4 py-2.5 text-right">Filled</th>
                  <th className="px-4 py-2.5 text-center">Status</th>
                  <th className="px-6 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800/50">
                {activeOrders.map((order) => {
                  const filledPct = ((order.filled_amount / order.amount) * 100).toFixed(1);
                  const isBuy = order.side === 'BUY';

                  return (
                    <tr key={order.id} className="transition-colors hover:bg-dark-850/40">
                      <td className="px-6 py-2 text-slate-400 text-[11px]">
                        {new Date(order.created_at).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-2 font-bold text-white">{order.symbol}</td>
                      <td className="px-4 py-2 text-slate-400">{order.type}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            isBuy ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                          }`}
                        >
                          {order.side}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right font-medium text-slate-200">
                        ${order.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-2 text-right text-slate-200">
                        {order.amount.toFixed(4)}
                      </td>
                      <td className="px-4 py-2 text-right text-slate-400">
                        {order.filled_amount.toFixed(4)} ({filledPct}%)
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                          <Clock className="h-3 w-3" />
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-2 text-right">
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancellingId === order.id}
                          className="rounded-md border border-slate-700 bg-dark-800 px-2 py-1 text-[11px] font-medium text-rose-400 transition-colors hover:border-rose-500 hover:bg-rose-500/10"
                        >
                          {cancellingId === order.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="flex h-36 flex-col items-center justify-center text-slate-500">
              <Clock className="mb-2 h-6 w-6 stroke-1" />
              <span>No open orders found</span>
            </div>
          )
        ) : trades.length > 0 ? (
          <table className="w-full text-left font-mono-num">
            <thead>
              <tr className="border-b border-dark-800/80 bg-dark-850/50 text-[11px] font-medium text-slate-400">
                <th className="px-6 py-2.5">Executed At</th>
                <th className="px-4 py-2.5">Symbol</th>
                <th className="px-4 py-2.5 text-right">Executed Price</th>
                <th className="px-4 py-2.5 text-right">Amount</th>
                <th className="px-6 py-2.5 text-right">Total (USDT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800/50">
              {trades.map((trade) => {
                const total = (trade.price * trade.amount).toFixed(2);
                return (
                  <tr key={trade.id} className="transition-colors hover:bg-dark-850/40">
                    <td className="px-6 py-2 text-slate-400 text-[11px]">
                      {new Date(trade.executed_at).toLocaleString('en-US')}
                    </td>
                    <td className="px-4 py-2 font-bold text-white">{trade.symbol}</td>
                    <td className="px-4 py-2 text-right font-medium text-emerald-400">
                      ${trade.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2 text-right text-slate-200">
                      {trade.amount.toFixed(4)}
                    </td>
                    <td className="px-6 py-2 text-right font-semibold text-slate-200">
                      ${total}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="flex h-36 flex-col items-center justify-center text-slate-500">
            <CheckCircle className="mb-2 h-6 w-6 stroke-1" />
            <span>No trade history recorded yet</span>
          </div>
        )}
      </div>
    </div>
  );
};
