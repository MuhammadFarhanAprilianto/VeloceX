'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Cancel01Icon,
  Copy01Icon,
  CheckmarkCircle01Icon,
  Note01Icon,
  Shield01Icon,
} from 'hugeicons-react';
import { MarketIcon } from '@/components/MarketIcon';

export interface OrderDetailRecord {
  id: string;
  symbol: string;
  category: 'crypto' | 'forex' | 'cfd';
  side: 'BUY' | 'SELL';
  type: string;
  price: number;
  avgPrice: number;
  amount: number;
  filledAmount: number;
  status: 'Filled' | 'Partially Filled' | 'Canceled' | 'Open' | 'Expired';
  fee: number;
  feeAsset: string;
  role: 'Maker' | 'Taker';
  createdAt: string;
  updatedAt: string;
  txHash: string;
  clientOrderId: string;
}

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderDetailRecord | null;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen || !order || typeof document === 'undefined') return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const totalValueUSD = order.avgPrice > 0 ? order.filledAmount * order.avgPrice : order.amount * order.price;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in font-sans">
      <div className="flex flex-col w-full max-w-lg bg-[#1F1E25] border border-white/10 rounded-3xl p-6 shadow-2xl gap-5 select-none max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#00E163]/15 text-[#00E163]">
              <Note01Icon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-base font-heading">
                Order Execution Details
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ID: {order.id}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <Cancel01Icon className="w-4 h-4" />
          </button>
        </div>

        {/* Content Box */}
        <div className="flex flex-col gap-4 overflow-y-auto pr-1 custom-positions-scrollbar font-mono-num text-xs">
          {/* Market & Side Hero */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#26252E] border border-white/5">
            <div className="flex items-center gap-3">
              <MarketIcon symbol={order.symbol} size="md" />
              <div className="flex flex-col">
                <span className="font-black text-white text-base font-heading">{order.symbol}</span>
                <span className="text-[11px] text-slate-400 font-sans capitalize">{order.category} Market</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span
                className={`px-3 py-1 rounded-xl text-xs font-black ${
                  order.side === 'BUY'
                    ? 'bg-[#00E163]/15 text-[#00E163]'
                    : 'bg-[#FF5C77]/15 text-[#FF5C77]'
                }`}
              >
                {order.side} {order.type}
              </span>
              <span className="text-[10px] text-slate-400 font-sans">{order.status}</span>
            </div>
          </div>

          {/* Execution Timeline */}
          <div className="flex flex-col p-4 rounded-2xl bg-[#26252E] border border-white/5 gap-3 font-sans">
            <span className="text-xs font-bold text-slate-300">Timeline Eksekusi Order</span>
            <div className="flex items-center justify-between text-[11px] relative">
              <div className="flex flex-col items-center gap-1 z-10">
                <div className="w-3 h-3 rounded-full bg-[#00E163] shadow-sm shadow-[#00E163]/50" />
                <span className="text-white font-bold">Created</span>
                <span className="text-[9px] text-slate-500 font-mono-num">{order.createdAt}</span>
              </div>

              <div className="flex-1 h-0.5 bg-[#00E163] mx-2 -mt-4" />

              <div className="flex flex-col items-center gap-1 z-10">
                <div className="w-3 h-3 rounded-full bg-[#00E163] shadow-sm shadow-[#00E163]/50" />
                <span className="text-white font-bold">Matched</span>
                <span className="text-[9px] text-slate-500 font-mono-num">Matching Engine</span>
              </div>

              <div className={`flex-1 h-0.5 mx-2 -mt-4 ${order.status === 'Filled' ? 'bg-[#00E163]' : 'bg-white/10'}`} />

              <div className="flex flex-col items-center gap-1 z-10">
                <div className={`w-3 h-3 rounded-full ${order.status === 'Filled' ? 'bg-[#00E163]' : 'bg-white/20'}`} />
                <span className="text-white font-bold">{order.status}</span>
                <span className="text-[9px] text-slate-500 font-mono-num">{order.updatedAt}</span>
              </div>
            </div>
          </div>

          {/* Rincian Finansial & Fee Grid */}
          <div className="flex flex-col p-4 rounded-2xl bg-[#26252E] border border-white/5 gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-sans">Harga Limit / Order:</span>
              <strong className="text-white font-bold">${order.price.toLocaleString()}</strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-sans">Harga Rata-rata Eksekusi (Avg Price):</span>
              <strong className="text-[#00E163] font-bold">${order.avgPrice.toLocaleString()}</strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-sans">Kuantitas Terisi (Filled):</span>
              <strong className="text-white font-bold">
                {order.filledAmount} / {order.amount} {order.symbol}
              </strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-sans">Total Nilai Transaksi:</span>
              <strong className="text-white font-bold">
                ${totalValueUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
              </strong>
            </div>

            <div className="w-full h-px bg-white/5 my-1" />

            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-sans">Peran Likuiditas (Liquidity Role):</span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-slate-200 font-bold text-[10px]">
                {order.role}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-sans">Biaya Transaksi (Trading Fee):</span>
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400 font-bold">
                  {order.fee} {order.feeAsset}
                </span>
                <span className="px-1.5 py-0.2 rounded bg-[#00E163]/15 text-[#00E163] text-[9px] font-bold">
                  25% VELX OFF
                </span>
              </div>
            </div>
          </div>

          {/* Cryptographic Proof & Client Order ID */}
          <div className="flex flex-col p-4 rounded-2xl bg-[#1B1A21] border border-white/5 gap-2 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-sans">Client Order ID:</span>
              <button
                type="button"
                onClick={() => handleCopy(order.clientOrderId, 'clientOrderId')}
                className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <span>{order.clientOrderId}</span>
                {copiedKey === 'clientOrderId' ? (
                  <CheckmarkCircle01Icon className="w-3.5 h-3.5 text-[#00E163]" />
                ) : (
                  <Copy01Icon className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-sans">Matching Engine TX Hash:</span>
              <button
                type="button"
                onClick={() => handleCopy(order.txHash, 'txHash')}
                className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer max-w-[200px] truncate"
              >
                <span className="truncate">{order.txHash}</span>
                {copiedKey === 'txHash' ? (
                  <CheckmarkCircle01Icon className="w-3.5 h-3.5 text-[#00E163]" />
                ) : (
                  <Copy01Icon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="py-3 rounded-2xl bg-[#00E163] text-black font-extrabold text-xs hover:brightness-110 transition-all cursor-pointer flex-shrink-0"
        >
          Tutup Rincian
        </button>
      </div>
    </div>,
    document.body
  );
};
