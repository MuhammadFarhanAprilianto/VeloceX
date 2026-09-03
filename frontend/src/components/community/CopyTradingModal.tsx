'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Cancel01Icon,
  CheckmarkCircle01Icon,
  Copy01Icon,
  Shield01Icon,
  TradeUpIcon,
  Wallet01Icon,
  AlertCircleIcon,
  Tick01Icon,
  StarIcon,
  Settings02Icon,
  FilterIcon,
} from 'hugeicons-react';

export interface AssetAllocation {
  symbol: string;
  percent: number;
  color: string;
}

export interface MasterTrader {
  id: string;
  name: string;
  avatar: string;
  badge: string;
  badgeColor: string;
  quickTag?: 'top' | 'low_risk' | 'high_freq' | 'bot';
  style: 'Scalping' | 'Day Trading' | 'Swing Trading' | 'Algo Bot';
  roi7d: number;
  roi30d: number;
  roi90d: number;
  winRate: number;
  totalPnl: number;
  maxDrawdown: number;
  copiers: number;
  maxCopiers: number;
  aum: number; // Asset under management
  profitShare: number; // e.g. 10%
  tradesCount: number;
  bio: string;
  pairs: string[];
  sparkline: number[]; // 7D/30D PnL curve points
  assetAllocations: AssetAllocation[];
}

interface CopyTradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  trader: MasterTrader | null;
  onConfirmCopy: (
    traderId: string,
    amount: number,
    stopLossPercent: number,
    leverageMode: string,
    maxMarginPerOrder?: number
  ) => void;
}

type SubmitStage = 'idle' | 'progress' | 'check_center' | 'check_slide_text' | 'done';

export const CopyTradingModal: React.FC<CopyTradingModalProps> = ({
  isOpen,
  onClose,
  trader,
  onConfirmCopy,
}) => {
  const [mounted, setMounted] = useState(false);
  const [copyMode, setCopyMode] = useState<'fixed' | 'proportional'>('fixed');
  const [amount, setAmount] = useState<string>('500');
  const [stopLossPercent, setStopLossPercent] = useState<number>(15); // 15% Max drawdown protection
  const [leverageMode, setLeverageMode] = useState<'follow' | 'custom'>('follow');
  const [customLeverage, setCustomLeverage] = useState<number>(10);
  
  // Advanced Copy Mode (Bybit / Binance Standard)
  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);
  const [maxMarginPerOrder, setMaxMarginPerOrder] = useState<string>('50');
  const [selectedPairs, setSelectedPairs] = useState<string[]>([]);

  const [isAgreed, setIsAgreed] = useState<boolean>(true);
  const [submitStage, setSubmitStage] = useState<SubmitStage>('idle');
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  const handleClose = () => {
    clearAllTimers();
    setSubmitStage('idle');
    onClose();
  };

  useEffect(() => {
    setMounted(true);
    return () => {
      clearAllTimers();
    };
  }, []);

  useEffect(() => {
    if (trader) {
      setSelectedPairs(trader.pairs);
    }
  }, [trader]);

  if (!isOpen || !trader || !mounted) return null;

  const availableBalance = 12450.8; // User's available USDT

  const handleQuickPercent = (pct: number) => {
    if (submitStage !== 'idle') return;
    const val = (availableBalance * (pct / 100)).toFixed(0);
    setAmount(val);
  };

  const togglePair = (pair: string) => {
    if (submitStage !== 'idle') return;
    if (selectedPairs.includes(pair)) {
      if (selectedPairs.length > 1) {
        setSelectedPairs(selectedPairs.filter((p) => p !== pair));
      }
    } else {
      setSelectedPairs([...selectedPairs, pair]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0 || !isAgreed || submitStage !== 'idle') return;

    clearAllTimers();

    // STEP 1: Progress Bar Fill from Left to Right (1200ms)
    setSubmitStage('progress');

    // STEP 2: Full Green -> Pop Checkmark in Dead Center (1000ms pause)
    const t1 = setTimeout(() => {
      setSubmitStage('check_center');

      // STEP 3: After 1s pause -> Checkmark slides to left & Success text fades in from blur
      const t2 = setTimeout(() => {
        setSubmitStage('check_slide_text');

        // STEP 4: After 2s pause -> Close modal and trigger callback
        const t3 = setTimeout(() => {
          setSubmitStage('done');
          onConfirmCopy(
            trader.id,
            numAmount,
            stopLossPercent,
            leverageMode === 'follow' ? 'Follow Master' : `${customLeverage}x Custom`,
            parseFloat(maxMarginPerOrder) || undefined
          );
          handleClose();
        }, 2000);
        timersRef.current.push(t3);
      }, 1000);
      timersRef.current.push(t2);
    }, 1200);
    timersRef.current.push(t1);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#1F1E25] border border-white/10 shadow-2xl p-6 flex flex-col gap-5 overflow-hidden max-h-[92vh]">
        {/* Glow Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00E163] to-transparent" />

        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#26252E] border border-white/10 flex items-center justify-center font-extrabold text-sm text-[#00E163]">
              {trader.avatar}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white font-heading">
                  {trader.name}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${trader.badgeColor}`}>
                  {trader.badge}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                Profit Share: <strong className="text-white">{trader.profitShare}%</strong> • Win Rate: <strong className="text-[#00E163] font-mono-num">{trader.winRate}%</strong>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl bg-[#26252E] hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <Cancel01Icon className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body with Internal Scroll */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto custom-positions-scrollbar pr-1 max-h-[65vh]">
          {/* 1. Copy Mode Selector (Fixed Amount vs Proportional) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400">Metode Copy</label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#18171E] border border-white/5">
              <button
                type="button"
                disabled={submitStage !== 'idle'}
                onClick={() => setCopyMode('fixed')}
                className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  copyMode === 'fixed'
                    ? 'bg-[#00E163] text-black shadow-sm font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Fixed Margin ($)
              </button>
              <button
                type="button"
                disabled={submitStage !== 'idle'}
                onClick={() => setCopyMode('proportional')}
                className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  copyMode === 'proportional'
                    ? 'bg-[#00E163] text-black shadow-sm font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Rasio Proporsional
              </button>
            </div>
          </div>

          {/* 2. Amount Input & Quick Chips */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-400">Total Modal Copy (USDT)</label>
              <span className="text-[11px] text-slate-500 font-mono-num">
                Saldo Tersedia: <strong className="text-white font-mono-num">${availableBalance.toLocaleString()}</strong>
              </span>
            </div>

            <div className="relative flex items-center h-12 px-3.5 rounded-2xl bg-[#18171E] border border-white/10 focus-within:border-[#00E163]/60 transition-colors">
              <input
                type="number"
                min="10"
                max={availableBalance}
                disabled={submitStage !== 'idle'}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Min. 50 USDT"
                className="w-full bg-transparent text-sm font-bold text-white font-mono-num focus:outline-none disabled:opacity-60"
              />
              <span className="text-xs font-extrabold text-[#00E163] font-mono-num">USDT</span>
            </div>

            {/* Quick % Chips */}
            <div className="grid grid-cols-4 gap-2 mt-1">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  disabled={submitStage !== 'idle'}
                  onClick={() => handleQuickPercent(pct)}
                  className="py-1.5 rounded-xl bg-[#26252E] hover:bg-[#00E163] text-slate-300 hover:text-black text-[11px] font-bold font-mono-num transition-colors border border-white/5 cursor-pointer disabled:opacity-40"
                >
                  {pct === 100 ? 'MAX' : `${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Risk Protection (Max Drawdown Stop Loss Slider) */}
          <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-[#18171E] border border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Shield01Icon className="w-4 h-4 text-amber-400" />
                <span>Proteksi Stop Copy (Max Drawdown)</span>
              </div>
              <span className="text-xs font-black text-[#FF5C77] font-mono-num">
                -{stopLossPercent}%
              </span>
            </div>

            <input
              type="range"
              min="5"
              max="50"
              step="5"
              disabled={submitStage !== 'idle'}
              value={stopLossPercent}
              onChange={(e) => setStopLossPercent(parseInt(e.target.value))}
              className="w-full accent-[#00E163] cursor-pointer"
            />

            <span className="text-[10px] text-slate-400 leading-tight">
              Jika total floating rugi mencapai -{stopLossPercent}%, sistem akan otomatis menutup seluruh posisi copy dan berhenti mengikuti trader ini.
            </span>
          </div>

          {/* 4. Leverage Setting */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#18171E] border border-white/5">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">Pengaturan Leverage</span>
              <span className="text-[10px] text-slate-400">
                {leverageMode === 'follow' ? 'Mengikuti leverage Master Trader secara persis' : `Custom leverage ${customLeverage}x`}
              </span>
            </div>

            <div className="flex items-center gap-1 bg-[#26252E] p-1 rounded-xl">
              <button
                type="button"
                disabled={submitStage !== 'idle'}
                onClick={() => setLeverageMode('follow')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  leverageMode === 'follow' ? 'bg-[#00E163] text-black font-extrabold' : 'text-slate-400'
                }`}
              >
                Ikuti Master
              </button>
              <button
                type="button"
                disabled={submitStage !== 'idle'}
                onClick={() => setLeverageMode('custom')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  leverageMode === 'custom' ? 'bg-[#00E163] text-black font-extrabold' : 'text-slate-400'
                }`}
              >
                Custom
              </button>
            </div>
          </div>

          {/* 5. ADVANCED COPY SETTINGS (BYBIT/BINANCE STANDARD) */}
          <div className="border border-white/10 rounded-2xl p-3 bg-[#18171E] flex flex-col gap-3">
            <button
              type="button"
              disabled={submitStage !== 'idle'}
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <Settings02Icon className="w-4 h-4 text-[#00E163]" />
                <span>Pengaturan Lanjutan (Advanced Copy Mode)</span>
              </div>
              <span className="text-[10px] text-[#00E163] uppercase tracking-wider font-extrabold">
                {isAdvancedOpen ? 'Tutup ▲' : 'Buka ▼'}
              </span>
            </button>

            {isAdvancedOpen && (
              <div className="flex flex-col gap-3 pt-2 border-t border-white/5 animate-fade-in">
                {/* Max Margin Per Order */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-slate-300">Batas Margin Maks. Per Posisi Order</label>
                    <span className="text-[10px] text-slate-500 font-mono-num">Rekomendasi: $20 - $100</span>
                  </div>
                  <div className="relative flex items-center h-10 px-3 rounded-xl bg-[#26252E] border border-white/10">
                    <input
                      type="number"
                      min="5"
                      max={parseFloat(amount) || 500}
                      disabled={submitStage !== 'idle'}
                      value={maxMarginPerOrder}
                      onChange={(e) => setMaxMarginPerOrder(e.target.value)}
                      placeholder="Maksimal $ per order"
                      className="w-full bg-transparent text-xs font-bold text-white font-mono-num focus:outline-none"
                    />
                    <span className="text-[11px] text-[#00E163] font-bold font-mono-num">USDT</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Mencegah saldo copy Anda habis jika Master Trader membuka banyak posisi sekaligus dalam waktu bersamaan.
                  </span>
                </div>

                {/* Whitelist Pairs */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-300">Pasangan yang Diikuti</label>
                  <div className="flex flex-wrap gap-1.5">
                    {trader.pairs.map((pair) => {
                      const isSelected = selectedPairs.includes(pair);
                      return (
                        <button
                          key={pair}
                          type="button"
                          disabled={submitStage !== 'idle'}
                          onClick={() => togglePair(pair)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono-num transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-[#00E163]/15 border-[#00E163] text-[#00E163]'
                              : 'bg-[#26252E] border-white/5 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {pair}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Custom Squircle Checkbox */}
          <div
            onClick={() => submitStage === 'idle' && setIsAgreed(!isAgreed)}
            className="flex items-start gap-2.5 text-[11px] text-slate-400 cursor-pointer select-none group"
          >
            <div
              className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all shrink-0 mt-0.5 ${
                isAgreed
                  ? 'bg-[#00E163] border-[#00E163] text-black shadow-sm'
                  : 'border-white/20 bg-transparent group-hover:border-white/40'
              }`}
            >
              {isAgreed && (
                <Tick01Icon className="w-3 h-3 stroke-[3] text-black" />
              )}
            </div>
            <span className={`transition-colors leading-relaxed ${isAgreed ? 'text-slate-300' : 'text-slate-400 group-hover:text-slate-200'}`}>
              Saya memahami bahwa trading derivatif memiliki risiko pasar dan telah membaca syarat & ketentuan Copy Trading VeloceX.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-3 rounded-2xl bg-[#26252E] hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer border border-white/5"
            >
              Batal
            </button>

            {/* Dynamic 4-Stage Animated Submit Button */}
            <button
              type="submit"
              disabled={!isAgreed || !amount || parseFloat(amount) <= 0 || submitStage !== 'idle'}
              className={`relative flex items-center justify-center h-12 min-w-[200px] px-6 rounded-2xl text-xs font-black overflow-hidden transition-all shadow-lg ${
                submitStage === 'idle'
                  ? 'bg-[#00E163] hover:bg-[#00c957] text-black cursor-pointer disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed'
                  : '!bg-[#00E163] !text-black !opacity-100 cursor-default select-none'
              }`}
            >
              {/* STAGE 1: Progress Bar Fill from Left to Right */}
              {submitStage === 'progress' && (
                <>
                  <div className="absolute inset-0 bg-[#00E163] origin-left animate-[progressBar_1.2s_cubic-bezier(0.25,1,0.5,1)_forwards]" />
                  <span className="relative z-10 font-black text-xs text-black tracking-wide">
                    Memproses Alokasi...
                  </span>
                </>
              )}

              {/* STAGE 0: Idle Button */}
              {submitStage === 'idle' && (
                <span className="relative z-10 flex items-center gap-2">
                  <Copy01Icon className="w-4 h-4" />
                  <span>Mulai Copy Trading</span>
                </span>
              )}

              {/* STAGE 2: Pop Checkmark Centered in Dead Center */}
              {submitStage === 'check_center' && (
                <div className="relative z-10 flex items-center justify-center animate-[popCenter_0.5s_cubic-bezier(0.34,1.56,0.64,1)_forwards]">
                  <CheckmarkCircle01Icon className="w-6 h-6 stroke-[2.5] text-black" />
                </div>
              )}

              {/* STAGE 3: Checkmark Slides to Left & Success Text Unblurs */}
              {(submitStage === 'check_slide_text' || submitStage === 'done') && (
                <div className="relative z-10 flex items-center gap-2">
                  <div className="animate-[slideLeft_0.6s_cubic-bezier(0.25,1,0.5,1)_forwards] flex items-center justify-center">
                    <CheckmarkCircle01Icon className="w-5 h-5 stroke-[2.5] text-black" />
                  </div>
                  <span className="text-black font-black text-xs tracking-wide animate-[fadeBlurIn_0.7s_cubic-bezier(0.25,1,0.5,1)_forwards]">
                    Copy Berhasil Disalin!
                  </span>
                </div>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Embedded Keyframe Styles for the 4-Stage Animation */}
      <style jsx>{`
        @keyframes progressBar {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(0%);
          }
        }
        @keyframes popCenter {
          0% {
            transform: scale(0) rotate(-45deg);
            opacity: 0;
          }
          70% {
            transform: scale(1.2) rotate(5deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        @keyframes slideLeft {
          0% {
            transform: translateX(25px);
          }
          100% {
            transform: translateX(0px);
          }
        }
        @keyframes fadeBlurIn {
          0% {
            opacity: 0;
            filter: blur(8px);
            transform: translateX(10px);
          }
          100% {
            opacity: 1;
            filter: blur(0px);
            transform: translateX(0px);
          }
        }
      `}</style>
    </div>,
    document.body
  );
};
