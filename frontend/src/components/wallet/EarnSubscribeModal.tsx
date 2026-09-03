'use client';

import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Cancel01Icon,
  Coins01Icon,
  FlashIcon,
  Tick01Icon,
} from 'hugeicons-react';
import { MarketIcon } from '@/components/MarketIcon';

export interface EarnProduct {
  id: string;
  symbol: string;
  name: string;
  category: 'crypto' | 'forex' | 'cfd';
  apy: number;
  duration: string;
  minAmount: number;
  availableBalance: number;
}

interface EarnSubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: EarnProduct;
  onSubscribeSuccess: (productId: string, symbol: string, amount: number, estDailyYield: number) => void;
}

export const EarnSubscribeModal: React.FC<EarnSubscribeModalProps> = ({
  isOpen,
  onClose,
  product,
  onSubscribeSuccess,
}) => {
  const [amount, setAmount] = useState('');
  const [autoRenew, setAutoRenew] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [earnPhase, setEarnPhase] = useState<'idle' | 'progress' | 'checkmark_center' | 'checkmark_shift' | 'success_revealed'>('idle');

  const parsedAmount = parseFloat(amount) || 0;

  // Real-time Yield Calculations
  const estDailyYield = useMemo(() => {
    if (parsedAmount <= 0) return 0;
    return (parsedAmount * (product.apy / 100)) / 365;
  }, [parsedAmount, product.apy]);

  const estYearlyYield = useMemo(() => {
    if (parsedAmount <= 0) return 0;
    return parsedAmount * (product.apy / 100);
  }, [parsedAmount, product.apy]);

  const handlePercentage = (pct: number) => {
    const val = (product.availableBalance * pct) / 100;
    setAmount(val > 0 ? val.toFixed(product.symbol === 'BTC' ? 4 : 2) : '0');
    setErrorMsg(null);
  };

  const handleSubscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (earnPhase !== 'idle') return;

    if (parsedAmount <= 0) {
      setErrorMsg('Masukkan nominal langganan yang valid.');
      return;
    }
    if (parsedAmount < product.minAmount) {
      setErrorMsg(`Minimal langganan adalah ${product.minAmount} ${product.symbol}.`);
      return;
    }
    if (parsedAmount > product.availableBalance) {
      setErrorMsg(`Saldo ${product.symbol} tidak mencukupi (Tersedia: ${product.availableBalance.toLocaleString()}).`);
      return;
    }

    setErrorMsg(null);

    // Langkah 1: Loading Progress Bar Hijau dari Kiri ke Kanan (700ms)
    setEarnPhase('progress');

    // Langkah 2: Setelah Full Hijau -> Centang Pop di Rata Tengah (Center)
    setTimeout(() => {
      setEarnPhase('checkmark_center');

      // Jeda 1 detik (1000ms) lalu geser ke kiri
      setTimeout(() => {
        setEarnPhase('checkmark_shift');

        // Langkah 3: Teks Success muncul dari burem (blur) ke jelas (sharp)
        setTimeout(() => {
          setEarnPhase('success_revealed');

          // Langkah 4: Jeda 2 detik (2000ms) langsung tutup modal & kembali ke Wallet
          setTimeout(() => {
            onSubscribeSuccess(product.id, product.symbol, parsedAmount, estDailyYield);
            setEarnPhase('idle');
            onClose();
          }, 2000);
        }, 150);
      }, 1000);
    }, 700);
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in font-sans">
      <div className="flex flex-col w-full max-w-md bg-[#1F1E25] border border-white/10 rounded-3xl p-6 shadow-2xl gap-5 select-none max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#00E163]/15 text-[#00E163]">
              <Coins01Icon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-base font-heading">
                VeloceX Simple Earn
              </span>
              <span className="text-xs text-slate-400">
                Langganan Tabungan Bunga Fleksibel Harian
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

        {/* Product Banner */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#26252E] border border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <MarketIcon symbol={product.symbol} size="md" />
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-sm">{product.name}</span>
              <span className="text-[11px] text-slate-400">{product.duration}</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-400">Estimasi APY</span>
            <span className="text-base font-black text-[#00E163] font-mono-num">
              +{product.apy.toFixed(1)}%
            </span>
          </div>
        </div>

        <form onSubmit={handleSubscribeSubmit} className="flex flex-col gap-4 overflow-y-auto pr-1 custom-positions-scrollbar flex-1">
          {/* Amount Input */}
          <div className="flex flex-col p-4 rounded-2xl bg-[#26252E] border border-white/5 gap-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold">Nominal Stake / Simpan</span>
              <span className="font-mono-num text-[11px]">
                Tersedia:{' '}
                <strong className="text-white">
                  {product.availableBalance.toLocaleString('en-US', { maximumFractionDigits: 4 })}{' '}
                  {product.symbol}
                </strong>
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setErrorMsg(null);
                }}
                className="w-full bg-transparent text-xl font-black text-white font-mono-num focus:outline-none placeholder:text-slate-600"
              />
              <span className="px-3 py-1.5 rounded-xl bg-[#1F1E25] text-xs font-extrabold text-white font-mono">
                {product.symbol}
              </span>
            </div>

            {/* Percentage Chips */}
            <div className="flex items-center gap-1.5 pt-1">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handlePercentage(pct)}
                  className="flex-1 py-1 rounded-lg bg-[#1F1E25] hover:bg-[#00E163]/20 hover:text-[#00E163] text-slate-400 text-[10px] font-mono-num font-bold transition-all cursor-pointer"
                >
                  {pct === 100 ? 'MAX' : `${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Yield Summary Card */}
          <div className="flex flex-col p-4 rounded-2xl bg-[#1B1A21] border border-white/5 gap-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Estimasi Bunga Harian:</span>
              <strong className="text-[#00E163] font-mono-num font-bold">
                +{estDailyYield.toFixed(product.symbol === 'BTC' ? 6 : 4)} {product.symbol} / hari
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Estimasi Total Bunga 1 Tahun:</span>
              <strong className="text-white font-mono-num font-bold">
                +{estYearlyYield.toFixed(product.symbol === 'BTC' ? 4 : 2)} {product.symbol}
              </strong>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
              <span className="text-slate-400">Pencairan Dana (Redemption):</span>
              <span className="text-slate-200 font-bold">Fleksibel (Kapan saja)</span>
            </div>
          </div>

          {/* Auto Compound Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#26252E] border border-white/5 text-xs">
            <div className="flex items-center gap-2">
              <FlashIcon className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-white">Auto-Compound Daily Interest</span>
            </div>
            <button
              type="button"
              onClick={() => setAutoRenew(!autoRenew)}
              className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                autoRenew ? 'bg-[#00E163]' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-black transition-transform absolute top-0.5 left-0.5 ${
                  autoRenew ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#FF5C77]/10 border border-[#FF5C77]/30 text-xs text-[#FF5C77] font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Submit Stake Action Button with Enlarged Height, Sleek Rounded-2xl, and 4-Step Animated Motion */}
          <button
            type="submit"
            disabled={earnPhase !== 'idle'}
            className="relative w-full h-14 rounded-2xl overflow-hidden font-black text-xs transition-all duration-300 cursor-pointer flex-shrink-0 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white select-none shadow-lg border border-white/5 group"
          >
            {/* 1. Green Progress Fill from Left to Right */}
            <div
              className={`absolute left-0 top-0 bottom-0 bg-[#00E163] shadow-lg shadow-[#00E163]/30 transition-all ease-out pointer-events-none ${
                earnPhase === 'idle'
                  ? 'w-0'
                  : 'w-full duration-700'
              }`}
            />

            {/* Initial Idle Text "Konfirmasi Langganan Simple Earn" */}
            {earnPhase === 'idle' && (
              <span className="relative z-10 transition-opacity duration-300 text-white group-hover:text-white uppercase tracking-wider text-xs font-black">
                Konfirmasi Langganan Simple Earn
              </span>
            )}

            {/* Step 1: While filling progress bar */}
            {earnPhase === 'progress' && (
              <span className="relative z-10 text-black font-black tracking-wider text-xs animate-pulse">
                Mengaktifkan Simple Earn...
              </span>
            )}

            {/* Step 2 & 3: Centered Checkmark & Success Text Motion */}
            {(earnPhase === 'checkmark_center' || earnPhase === 'checkmark_shift' || earnPhase === 'success_revealed') && (
              <div className="relative z-10 flex items-center justify-center gap-2.5">
                {/* Checkmark Icon with Smooth Centered Pop & Left Shift */}
                <div
                  className={`transition-all duration-500 ease-out flex items-center justify-center ${
                    earnPhase === 'checkmark_center'
                      ? 'scale-110 translate-x-0'
                      : 'scale-100'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center shadow-md animate-in zoom-in duration-300">
                    <Tick01Icon className="w-4 h-4 text-[#00E163] stroke-[3.5]" />
                  </div>
                </div>

                {/* Step 3: Success Text with Blur-to-Sharp Fade-In */}
                <div
                  className={`transition-all duration-500 ease-out ${
                    earnPhase === 'success_revealed'
                      ? 'opacity-100 blur-0 translate-x-0 max-w-[220px]'
                      : 'opacity-0 blur-sm -translate-x-3 max-w-0 overflow-hidden'
                  }`}
                >
                  <span className="font-black text-black text-xs tracking-wider uppercase whitespace-nowrap">
                    Earn Success
                  </span>
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
