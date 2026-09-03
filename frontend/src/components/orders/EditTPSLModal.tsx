'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Cancel01Icon,
  Tick01Icon,
  FlashIcon,
  SparklesIcon,
  AlertCircleIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  Target01Icon,
} from 'hugeicons-react';
import { OrderItem } from './OrdersView';

interface EditTPSLModalProps {
  isOpen: boolean;
  order: OrderItem | null;
  onClose: () => void;
  onSaveTPSL: (orderId: string, tpPrice: number | null, slPrice: number | null) => void;
}

export const EditTPSLModal: React.FC<EditTPSLModalProps> = ({
  isOpen,
  order,
  onClose,
  onSaveTPSL,
}) => {
  const [tpPrice, setTpPrice] = useState<string>('');
  const [slPrice, setSlPrice] = useState<string>('');
  const [savePhase, setSavePhase] = useState<
    'idle' | 'progress' | 'checkmark_center' | 'checkmark_shift' | 'success_revealed'
  >('idle');

  React.useEffect(() => {
    if (order) {
      setTpPrice(order.price ? (order.price * 1.05).toFixed(2) : '');
      setSlPrice(order.price ? (order.price * 0.95).toFixed(2) : '');
    }
  }, [order]);

  if (!isOpen || !order || typeof document === 'undefined') return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (savePhase !== 'idle') return;

    // Step 1: 0ms -> Progress fills from left to right (700ms)
    setSavePhase('progress');

    // Step 2: 700ms -> Centered Pop Checkmark badge with 1s pause
    setTimeout(() => {
      setSavePhase('checkmark_center');

      // Step 3: 1700ms -> Checkmark shifts left & text reveals from blur
      setTimeout(() => {
        setSavePhase('checkmark_shift');

        setTimeout(() => {
          setSavePhase('success_revealed');

          // Step 4: 3850ms -> Complete & Close
          setTimeout(() => {
            const tpVal = tpPrice ? parseFloat(tpPrice) : null;
            const slVal = slPrice ? parseFloat(slPrice) : null;
            onSaveTPSL(order.id, tpVal, slVal);
            setSavePhase('idle');
            onClose();
          }, 2000);
        }, 150);
      }, 1000);
    }, 700);
  };

  const currentPrice = order.price || order.avgPrice || 64250;
  const numTp = parseFloat(tpPrice) || 0;
  const numSl = parseFloat(slPrice) || 0;
  const tpGain = numTp > 0 ? ((numTp - currentPrice) / currentPrice) * 100 : 0;
  const slLoss = numSl > 0 ? ((numSl - currentPrice) / currentPrice) * 100 : 0;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in font-sans">
      <div className="relative w-full max-w-md rounded-3xl bg-[#1F1E25] border border-white/10 p-6 shadow-2xl flex flex-col gap-5 overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-[#00E163]/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#00E163]/10 border border-[#00E163]/20 text-[#00E163]">
              <Target01Icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Set Take Profit & Stop Loss</h2>
              <p className="text-xs text-slate-400 font-mono-num">
                {order.symbol} • Order ID: {order.id}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <Cancel01Icon className="w-5 h-5" />
          </button>
        </div>

        {/* Current Order Summary */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#17161C] border border-white/5 text-xs font-mono-num">
          <div>
            <span className="text-[10px] text-slate-400 font-sans block">Order Side / Amount</span>
            <span className={`font-bold ${order.side === 'BUY' ? 'text-[#00E163]' : 'text-[#FF5C77]'}`}>
              {order.side} {order.amount}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-sans block">Entry / Order Price</span>
            <span className="font-bold text-white">${currentPrice.toLocaleString()} USDT</span>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {/* Take Profit Field */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00E163]" />
                Take Profit (TP Trigger Price)
              </span>
              {tpGain !== 0 && (
                <span className="text-[#00E163] font-bold font-mono-num">
                  +{tpGain.toFixed(2)}% Est. Gain
                </span>
              )}
            </div>
            <div className="relative flex items-center">
              <input
                type="number"
                step="any"
                value={tpPrice}
                onChange={(e) => setTpPrice(e.target.value)}
                placeholder={`e.g. ${(currentPrice * 1.05).toFixed(2)}`}
                className="w-full h-11 px-3.5 pr-14 rounded-xl bg-[#26252E] border border-white/10 focus:border-[#00E163] text-white font-mono-num text-xs focus:outline-none"
              />
              <span className="absolute right-3 text-xs text-slate-400 font-mono">USDT</span>
            </div>
          </div>

          {/* Stop Loss Field */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FF5C77]" />
                Stop Loss (SL Trigger Price)
              </span>
              {slLoss !== 0 && (
                <span className="text-[#FF5C77] font-bold font-mono-num">
                  {slLoss.toFixed(2)}% Est. Loss
                </span>
              )}
            </div>
            <div className="relative flex items-center">
              <input
                type="number"
                step="any"
                value={slPrice}
                onChange={(e) => setSlPrice(e.target.value)}
                placeholder={`e.g. ${(currentPrice * 0.95).toFixed(2)}`}
                className="w-full h-11 px-3.5 pr-14 rounded-xl bg-[#26252E] border border-white/10 focus:border-[#FF5C77] text-white font-mono-num text-xs focus:outline-none"
              />
              <span className="absolute right-3 text-xs text-slate-400 font-mono">USDT</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-400 flex items-start gap-2">
            <FlashIcon className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Ketika harga pasar menyentuh target pemicu, sistem VeloceX akan mengeksekusi order Market secara instan untuk melindungi posisi Anda.
            </span>
          </div>

          {/* Submit Action Button with 4-Step Animated Motion */}
          <button
            type="submit"
            disabled={savePhase !== 'idle'}
            className="relative w-full h-14 rounded-2xl overflow-hidden font-black text-xs transition-all duration-300 cursor-pointer flex-shrink-0 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white select-none shadow-lg border border-white/5 group mt-1"
          >
            {/* 1. Green Progress Fill from Left to Right */}
            <div
              className={`absolute left-0 top-0 bottom-0 bg-[#00E163] shadow-lg shadow-[#00E163]/30 transition-all ease-out pointer-events-none ${
                savePhase === 'idle' ? 'w-0' : 'w-full duration-700'
              }`}
            />

            {/* Initial Idle Text */}
            {savePhase === 'idle' && (
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Target01Icon className="w-4 h-4 text-[#00E163]" />
                <span className="tracking-wide">Konfirmasi Simpan TP / SL</span>
              </span>
            )}

            {/* Step 2 & 3: Centered Checkmark Badge and Left Shift + Text Reveal */}
            {savePhase !== 'idle' && (
              <div className="relative z-10 flex items-center justify-center w-full">
                <div
                  className={`flex items-center transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    savePhase === 'checkmark_center' ? 'translate-x-0' : '-translate-x-16'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shadow-lg border border-white/20 animate-scale-up">
                    <Tick01Icon className="w-5 h-5 text-[#00E163] stroke-[3]" />
                  </div>
                </div>

                <div
                  className={`absolute left-[54%] transition-all duration-500 ease-out font-black text-xs tracking-wider text-black ${
                    savePhase === 'success_revealed'
                      ? 'opacity-100 blur-0 translate-x-0'
                      : 'opacity-0 blur-sm -translate-x-3 pointer-events-none'
                  }`}
                >
                  TP/SL UPDATED
                </div>
              </div>
            )}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};
