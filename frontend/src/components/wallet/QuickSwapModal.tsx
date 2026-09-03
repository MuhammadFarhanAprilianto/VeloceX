'use client';

import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Cancel01Icon,
  ArrowUpDownIcon,
  SparklesIcon,
  Tick01Icon,
} from 'hugeicons-react';
import { MarketIcon } from '@/components/MarketIcon';

export interface SwapAssetItem {
  symbol: string;
  name: string;
  category: 'crypto' | 'forex' | 'cfd';
  amount: number;
  usdPrice: number;
}

interface QuickSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableAssets: SwapAssetItem[];
  defaultFromSymbol?: string;
  onSwapSuccess: (fromSymbol: string, toSymbol: string, fromAmount: number, toAmount: number) => void;
}

export const QuickSwapModal: React.FC<QuickSwapModalProps> = ({
  isOpen,
  onClose,
  availableAssets,
  defaultFromSymbol = 'BTC',
  onSwapSuccess,
}) => {
  const [fromSymbol, setFromSymbol] = useState(defaultFromSymbol);
  const [toSymbol, setToSymbol] = useState('USDT');
  const [fromAmount, setFromAmount] = useState('');
  const [isFromDropdownOpen, setIsFromDropdownOpen] = useState(false);
  const [isToDropdownOpen, setIsToDropdownOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [swapPhase, setSwapPhase] = useState<'idle' | 'progress' | 'checkmark_center' | 'checkmark_shift' | 'success_revealed'>('idle');

  const fromAsset = useMemo(
    () => availableAssets.find((a) => a.symbol === fromSymbol) || availableAssets[0],
    [availableAssets, fromSymbol]
  );

  const toAsset = useMemo(
    () => availableAssets.find((a) => a.symbol === toSymbol) || availableAssets[1],
    [availableAssets, toSymbol]
  );

  const parsedFromAmount = parseFloat(fromAmount) || 0;

  // Calculation: (fromAmount * fromPrice) / toPrice
  const estimatedToAmount = useMemo(() => {
    if (parsedFromAmount <= 0 || !fromAsset || !toAsset) return 0;
    const totalUSD = parsedFromAmount * fromAsset.usdPrice;
    return totalUSD / toAsset.usdPrice;
  }, [parsedFromAmount, fromAsset, toAsset]);

  const handlePercentage = (pct: number) => {
    if (!fromAsset) return;
    const val = (fromAsset.amount * pct) / 100;
    setFromAmount(val > 0 ? val.toFixed(4) : '0');
    setErrorMsg(null);
  };

  const handleInvert = () => {
    const temp = fromSymbol;
    setFromSymbol(toSymbol);
    setToSymbol(temp);
    setFromAmount('');
    setErrorMsg(null);
  };

  const handleSwapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (swapPhase !== 'idle') return;

    if (parsedFromAmount <= 0) {
      setErrorMsg('Masukkan nominal swap yang valid.');
      return;
    }
    if (parsedFromAmount > fromAsset.amount) {
      setErrorMsg(`Saldo ${fromAsset.symbol} tidak mencukupi (Tersedia: ${fromAsset.amount}).`);
      return;
    }

    setErrorMsg(null);

    // Langkah 1: Loading Progress Bar Hijau dari Kiri ke Kanan (700ms)
    setSwapPhase('progress');

    // Langkah 2: Setelah Full Hijau -> Centang Pop di Rata Tengah (Center)
    setTimeout(() => {
      setSwapPhase('checkmark_center');

      // Jeda 1 detik (1000ms) lalu geser ke kiri
      setTimeout(() => {
        setSwapPhase('checkmark_shift');

        // Langkah 3: Teks Success muncul dari burem (blur) ke jelas (sharp)
        setTimeout(() => {
          setSwapPhase('success_revealed');

          // Langkah 4: Jeda 2 detik (2000ms) langsung tutup modal & kembali ke Wallet
          setTimeout(() => {
            onSwapSuccess(fromSymbol, toSymbol, parsedFromAmount, estimatedToAmount);
            setSwapPhase('idle');
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
              <SparklesIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-base font-heading">
                VeloceX Convert
              </span>
              <span className="text-xs text-slate-400">
                Konversi Instan • 0% Fee • Zero Slippage
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

        <form onSubmit={handleSwapSubmit} className="flex flex-col gap-4 overflow-y-auto pr-1 custom-positions-scrollbar flex-1">
          {/* FROM ASSET BOX */}
          <div className="flex flex-col p-4 rounded-2xl bg-[#26252E] border border-white/5 gap-2 relative">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold">Dari (From)</span>
              <span className="font-mono-num text-[11px]">
                Tersedia:{' '}
                <strong className="text-white">
                  {fromAsset?.amount?.toLocaleString('en-US', { maximumFractionDigits: 4 }) ?? '0.00'}{' '}
                  {fromAsset?.symbol}
                </strong>
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={fromAmount}
                onChange={(e) => {
                  setFromAmount(e.target.value);
                  setErrorMsg(null);
                }}
                className="w-full bg-transparent text-xl font-black text-white font-mono-num focus:outline-none placeholder:text-slate-600"
              />

              {/* Asset Dropdown Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsFromDropdownOpen(!isFromDropdownOpen);
                    setIsToDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1F1E25] border border-white/10 hover:border-white/20 text-white font-extrabold text-xs cursor-pointer transition-all shrink-0"
                >
                  <MarketIcon symbol={fromAsset?.symbol ?? 'BTC'} size="sm" />
                  <span>{fromAsset?.symbol}</span>
                  <span className="text-slate-400 text-[10px]">▼</span>
                </button>

                {isFromDropdownOpen && (
                  <div className="absolute right-0 top-11 w-48 bg-[#1F1E25] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 max-h-56 overflow-y-auto custom-positions-scrollbar flex flex-col gap-1">
                    {availableAssets.map((asset) => (
                      <button
                        key={asset.symbol}
                        type="button"
                        onClick={() => {
                          setFromSymbol(asset.symbol);
                          setIsFromDropdownOpen(false);
                        }}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          fromSymbol === asset.symbol
                            ? 'bg-[#00E163] text-black font-extrabold'
                            : 'text-slate-200 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MarketIcon symbol={asset.symbol} size="sm" />
                          <span>{asset.symbol}</span>
                        </div>
                        <span className="text-[10px] opacity-75 font-mono">
                          {asset.amount > 0 ? asset.amount.toFixed(2) : '0'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
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

          {/* SWAP INVERT BUTTON */}
          <div className="flex items-center justify-center -my-2 relative z-10">
            <button
              type="button"
              onClick={handleInvert}
              className="p-2.5 rounded-2xl bg-[#1F1E25] border border-white/10 hover:border-[#00E163] hover:text-[#00E163] text-slate-300 shadow-xl transition-all cursor-pointer hover:rotate-180 duration-500"
              title="Tukar Arah Swap"
            >
              <ArrowUpDownIcon className="w-4 h-4" />
            </button>
          </div>

          {/* TO ASSET BOX */}
          <div className="flex flex-col p-4 rounded-2xl bg-[#26252E] border border-white/5 gap-2 relative">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold">Ke (To)</span>
              <span className="font-mono-num text-[11px]">
                Saldo:{' '}
                <strong className="text-white">
                  {toAsset?.amount?.toLocaleString('en-US', { maximumFractionDigits: 4 }) ?? '0.00'}{' '}
                  {toAsset?.symbol}
                </strong>
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <input
                type="text"
                readOnly
                value={
                  estimatedToAmount > 0
                    ? estimatedToAmount.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6,
                      })
                    : '0.00'
                }
                className="w-full bg-transparent text-xl font-black text-[#00E163] font-mono-num focus:outline-none"
              />

              {/* Asset Dropdown Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsToDropdownOpen(!isToDropdownOpen);
                    setIsFromDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1F1E25] border border-white/10 hover:border-white/20 text-white font-extrabold text-xs cursor-pointer transition-all shrink-0"
                >
                  <MarketIcon symbol={toAsset?.symbol ?? 'USDT'} size="sm" />
                  <span>{toAsset?.symbol}</span>
                  <span className="text-slate-400 text-[10px]">▼</span>
                </button>

                {isToDropdownOpen && (
                  <div className="absolute right-0 top-11 w-48 bg-[#1F1E25] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 max-h-56 overflow-y-auto custom-positions-scrollbar flex flex-col gap-1">
                    {availableAssets.map((asset) => (
                      <button
                        key={asset.symbol}
                        type="button"
                        onClick={() => {
                          setToSymbol(asset.symbol);
                          setIsToDropdownOpen(false);
                        }}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          toSymbol === asset.symbol
                            ? 'bg-[#00E163] text-black font-extrabold'
                            : 'text-slate-200 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MarketIcon symbol={asset.symbol} size="sm" />
                          <span>{asset.symbol}</span>
                        </div>
                        <span className="text-[10px] opacity-75 font-mono">
                          {asset.amount > 0 ? asset.amount.toFixed(2) : '0'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 font-mono-num">
              <span>Kurs Konversi:</span>
              <span className="text-slate-200 font-bold">
                1 {fromAsset?.symbol} ≈{' '}
                {((fromAsset?.usdPrice ?? 1) / (toAsset?.usdPrice ?? 1)).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 4,
                })}{' '}
                {toAsset?.symbol}
              </span>
            </div>
          </div>

          {/* Rate & Fee Info */}
          <div className="flex flex-col p-3 rounded-xl bg-[#1B1A21] border border-white/5 gap-1.5 text-xs text-slate-400">
            <div className="flex items-center justify-between">
              <span>Trading Fee:</span>
              <strong className="text-[#00E163] font-bold">0.00% (Free)</strong>
            </div>
            <div className="flex items-center justify-between">
              <span>Tipe Eksekusi:</span>
              <strong className="text-slate-200">Guaranteed Instant Fill</strong>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#FF5C77]/10 border border-[#FF5C77]/30 text-xs text-[#FF5C77] font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Submit Action Button with 4-Step Animated Motion */}
          <button
            type="submit"
            disabled={swapPhase !== 'idle'}
            className="relative w-full h-14 rounded-2xl overflow-hidden font-black text-xs transition-all duration-300 cursor-pointer flex-shrink-0 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white select-none shadow-lg border border-white/5 group"
          >
            {/* 1. Green Progress Fill from Left to Right */}
            <div
              className={`absolute left-0 top-0 bottom-0 bg-[#00E163] shadow-lg shadow-[#00E163]/30 transition-all ease-out pointer-events-none ${
                swapPhase === 'idle'
                  ? 'w-0'
                  : 'w-full duration-700'
              }`}
            />

            {/* Initial Idle Text */}
            {swapPhase === 'idle' && (
              <span className="relative z-10 transition-opacity duration-300 text-white group-hover:text-white uppercase tracking-wider text-xs font-black">
                Konversi {fromAsset?.symbol} ➔ {toAsset?.symbol}
              </span>
            )}

            {/* Step 1: While filling progress bar */}
            {swapPhase === 'progress' && (
              <span className="relative z-10 text-black font-black tracking-wider text-xs animate-pulse">
                Mengonversi {fromAsset?.symbol} ke {toAsset?.symbol}...
              </span>
            )}

            {/* Step 2 & 3: Centered Checkmark & Success Text Motion */}
            {(swapPhase === 'checkmark_center' || swapPhase === 'checkmark_shift' || swapPhase === 'success_revealed') && (
              <div className="relative z-10 flex items-center justify-center gap-2.5">
                {/* Checkmark Icon with Smooth Centered Pop & Left Shift */}
                <div
                  className={`transition-all duration-500 ease-out flex items-center justify-center ${
                    swapPhase === 'checkmark_center'
                      ? 'scale-125 translate-x-0'
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
                    swapPhase === 'success_revealed'
                      ? 'opacity-100 blur-0 translate-x-0 max-w-[200px]'
                      : 'opacity-0 blur-sm -translate-x-3 max-w-0 overflow-hidden'
                  }`}
                >
                  <span className="font-black text-black text-xs tracking-wider uppercase whitespace-nowrap">
                    Convert Success
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
