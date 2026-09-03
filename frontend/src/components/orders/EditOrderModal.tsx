import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Cancel01Icon,
  CheckmarkCircle01Icon,
  Edit01Icon,
  AlertCircleIcon,
} from 'hugeicons-react';
import { MarketIcon } from '@/components/MarketIcon';

export interface EditableOrder {
  id: string;
  symbol: string;
  category: 'crypto' | 'forex' | 'cfd';
  side: 'BUY' | 'SELL';
  type: string;
  price: number;
  amount: number;
  filledAmount: number;
}

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: EditableOrder | null;
  onSaveOrder: (orderId: string, newPrice: number, newAmount: number) => void;
}

export const EditOrderModal: React.FC<EditOrderModalProps> = ({
  isOpen,
  onClose,
  order,
  onSaveOrder,
}) => {
  const [priceInput, setPriceInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (order) {
      setPriceInput(order.price.toString());
      setAmountInput(order.amount.toString());
      setErrorMsg(null);
    }
  }, [order]);

  if (!isOpen || !order || typeof document === 'undefined') return null;

  const parsedPrice = parseFloat(priceInput) || 0;
  const parsedAmount = parseFloat(amountInput) || 0;
  const newTotalUSD = parsedPrice * parsedAmount;

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedPrice <= 0 || parsedAmount <= 0) {
      setErrorMsg('Masukkan harga dan kuantitas order yang valid.');
      return;
    }
    if (parsedAmount <= order.filledAmount) {
      setErrorMsg(`Kuantitas baru harus lebih besar dari jumlah yang sudah terisi (${order.filledAmount}).`);
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSaveOrder(order.id, parsedPrice, parsedAmount);
      onClose();
    }, 600);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in font-sans">
      <div className="flex flex-col w-full max-w-md bg-[#1F1E25] border border-white/10 rounded-3xl p-6 shadow-2xl gap-5 select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#00E163]/15 text-[#00E163]">
              <Edit01Icon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-base font-heading">
                Edit Open Order
              </span>
              <span className="text-xs text-slate-400">
                Sesuaikan harga limit dan kuantitas order yang sedang aktif
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

        {/* Order Info Badge */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#26252E] border border-white/5">
          <div className="flex items-center gap-2.5">
            <MarketIcon symbol={order.symbol} size="sm" />
            <div className="flex flex-col">
              <span className="font-extrabold text-sm text-white">{order.symbol}</span>
              <span className="text-[10px] text-slate-400 font-mono">ID: {order.id}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono-num text-xs">
            <span
              className={`px-2.5 py-0.5 rounded-lg font-bold text-[10px] ${
                order.side === 'BUY'
                  ? 'bg-[#00E163]/15 text-[#00E163]'
                  : 'bg-[#FF5C77]/15 text-[#FF5C77]'
              }`}
            >
              {order.side} {order.type}
            </span>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
          {/* Price Input */}
          <div className="flex flex-col p-3.5 rounded-2xl bg-[#26252E] border border-white/5 gap-2">
            <span className="text-xs font-bold text-slate-400">Harga Order Baru</span>
            <div className="flex items-center justify-between gap-2">
              <input
                type="number"
                step="any"
                value={priceInput}
                onChange={(e) => {
                  setPriceInput(e.target.value);
                  setErrorMsg(null);
                }}
                className="w-full bg-transparent text-lg font-black text-white font-mono-num focus:outline-none"
              />
              <span className="text-xs font-mono text-slate-400">USD</span>
            </div>
          </div>

          {/* Amount Input */}
          <div className="flex flex-col p-3.5 rounded-2xl bg-[#26252E] border border-white/5 gap-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold">Kuantitas Order Baru</span>
              <span className="font-mono-num text-[11px]">
                Terisi: {order.filledAmount} / {order.amount}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <input
                type="number"
                step="any"
                value={amountInput}
                onChange={(e) => {
                  setAmountInput(e.target.value);
                  setErrorMsg(null);
                }}
                className="w-full bg-transparent text-lg font-black text-white font-mono-num focus:outline-none"
              />
              <span className="text-xs font-mono text-slate-400">{order.symbol}</span>
            </div>
          </div>

          {/* New Total Preview */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#1B1A21] border border-white/5 text-xs">
            <span className="text-slate-400 font-bold">Total Nilai Order Baru:</span>
            <strong className="text-[#00E163] font-mono-num text-sm font-bold">
              ${newTotalUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
            </strong>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FF5C77]/10 border border-[#FF5C77]/30 text-xs text-[#FF5C77] font-semibold">
              <AlertCircleIcon className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-[#26252E] hover:bg-white/10 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isProcessing}
              className="group relative flex-1 flex items-center justify-center h-12 rounded-2xl bg-[#00E163] text-black font-extrabold text-xs overflow-hidden transition-all duration-300 hover:brightness-110 shadow-lg shadow-[#00E163]/25 cursor-pointer disabled:opacity-50"
            >
              <span className="absolute inset-0 bg-white/20 -translate-x-[120%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
              <span className="relative z-10 flex items-center gap-1.5">
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                    <span>Memperbarui Order...</span>
                  </>
                ) : (
                  <>
                    <CheckmarkCircle01Icon className="w-4 h-4 stroke-[2.5]" />
                    <span>Simpan Perubahan</span>
                  </>
                )}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
