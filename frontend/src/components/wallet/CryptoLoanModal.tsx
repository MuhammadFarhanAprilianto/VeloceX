import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Cancel01Icon,
  CheckmarkCircle01Icon,
  BankIcon,
  InformationCircleIcon,
  FlashIcon,
  Tick01Icon,
} from 'hugeicons-react';
import { MarketIcon } from '@/components/MarketIcon';

interface CryptoLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBTC: number;
  availableETH: number;
  onLoanSuccess: (collateralAsset: string, collateralAmount: number, borrowedUSDT: number) => void;
}

export const CryptoLoanModal: React.FC<CryptoLoanModalProps> = ({
  isOpen,
  onClose,
  availableBTC,
  availableETH,
  onLoanSuccess,
}) => {
  const [collateralAsset, setCollateralAsset] = useState<'BTC' | 'ETH'>('BTC');
  const [collateralAmount, setCollateralAmount] = useState('1.0');
  const [borrowTermDays, setBorrowTermDays] = useState<7 | 30 | 90>(30);
  const [borrowUSDT, setBorrowUSDT] = useState('25000');
  const parsedBorrowUSDT = parseFloat(borrowUSDT) || 0;
  const [loanPhase, setLoanPhase] = useState<'idle' | 'progress' | 'checkmark_center' | 'checkmark_shift' | 'success_revealed'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const BTC_PRICE = 75368.45;
  const ETH_PRICE = 4149.74;
  const unitPrice = collateralAsset === 'BTC' ? BTC_PRICE : ETH_PRICE;
  const availableCollateral = collateralAsset === 'BTC' ? availableBTC : availableETH;

  const parsedCollateral = parseFloat(collateralAmount) || 0;
  const collateralValueUSD = parsedCollateral * unitPrice;

  // Max Borrowable at 65% Initial LTV
  const maxBorrowUSDT = collateralValueUSD * 0.65;

  // Current LTV = (borrowUSDT / collateralValueUSD) * 100
  const currentLtv = useMemo(() => {
    if (collateralValueUSD <= 0 || parsedBorrowUSDT <= 0) return 0;
    return (parsedBorrowUSDT / collateralValueUSD) * 100;
  }, [parsedBorrowUSDT, collateralValueUSD]);

  // Hourly interest rate (0.015% per day / 24)
  const dailyInterest = parsedBorrowUSDT * 0.00015;
  const totalInterest = dailyInterest * borrowTermDays;

  const handlePercentage = (pct: number) => {
    const val = (availableCollateral * pct) / 100;
    setCollateralAmount(val.toFixed(collateralAsset === 'BTC' ? 4 : 2));
    setErrorMsg(null);
  };

  const handleLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loanPhase !== 'idle') return;

    if (parsedCollateral <= 0 || parsedBorrowUSDT <= 0) {
      setErrorMsg('Masukkan nominal agunan dan pinjaman yang valid.');
      return;
    }
    if (parsedCollateral > availableCollateral) {
      setErrorMsg(`Saldo ${collateralAsset} tidak mencukupi (Tersedia: ${availableCollateral}).`);
      return;
    }
    if (currentLtv > 75) {
      setErrorMsg('Rasio LTV terlalu tinggi (> 75%). Kurangi pinjaman atau tambah jaminan.');
      return;
    }

    setErrorMsg(null);

    // Langkah 1: Loading Progress Bar Hijau dari Kiri ke Kanan (700ms)
    setLoanPhase('progress');

    // Langkah 2: Setelah Full Hijau -> Centang Pop di Rata Tengah (Center)
    setTimeout(() => {
      setLoanPhase('checkmark_center');

      // Jeda 1 detik (1000ms) lalu geser ke kiri
      setTimeout(() => {
        setLoanPhase('checkmark_shift');

        // Langkah 3: Teks Success muncul dari burem (blur) ke jelas (sharp)
        setTimeout(() => {
          setLoanPhase('success_revealed');

          // Langkah 4: Jeda 2 detik (2000ms) langsung tutup modal & kembali ke Wallet
          setTimeout(() => {
            onLoanSuccess(collateralAsset, parsedCollateral, parsedBorrowUSDT);
            setLoanPhase('idle');
            onClose();
          }, 2000);
        }, 150);
      }, 1000);
    }, 700);
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in font-sans">
      <div className="flex flex-col w-full max-w-lg bg-[#1F1E25] border border-white/10 rounded-3xl p-6 shadow-2xl gap-5 select-none max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#00E163]/15 text-[#00E163]">
              <BankIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-base font-heading">
                VeloceX Crypto Loans
              </span>
              <span className="text-xs text-slate-400">
                Pinjam Likuiditas Instan Beragunan Kripto • Bunga Harian 0.015%
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

        <form onSubmit={handleLoanSubmit} className="flex flex-col gap-4 overflow-y-auto pr-1 custom-positions-scrollbar">
          {/* Collateral Asset Box */}
          <div className="flex flex-col p-4 rounded-2xl bg-[#26252E] border border-white/5 gap-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold">Agunan Jaminan (Collateral)</span>
              <span className="font-mono-num text-[11px]">
                Tersedia: <strong className="text-white">{availableCollateral} {collateralAsset}</strong>
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={collateralAmount}
                onChange={(e) => {
                  setCollateralAmount(e.target.value);
                  setErrorMsg(null);
                }}
                className="w-full bg-transparent text-xl font-black text-white font-mono-num focus:outline-none placeholder:text-slate-600"
              />

              <div className="flex items-center gap-1 p-1 rounded-xl bg-[#1F1E25] border border-white/10">
                {(['BTC', 'ETH'] as const).map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => {
                      setCollateralAsset(sym);
                      setErrorMsg(null);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      collateralAsset === sym
                        ? 'bg-[#00E163] text-black font-extrabold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <MarketIcon symbol={sym} size="sm" />
                    <span>{sym}</span>
                  </button>
                ))}
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

          {/* Borrow Amount Input */}
          <div className="flex flex-col p-4 rounded-2xl bg-[#26252E] border border-white/5 gap-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold">Nominal Pinjaman Diterima (Borrow)</span>
              <span className="font-mono-num text-[11px]">
                Maksimal (65% LTV):{' '}
                <strong className="text-[#00E163]">${maxBorrowUSDT.toFixed(2)} USDT</strong>
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <input
                type="number"
                step="100"
                placeholder="0.00"
                value={borrowUSDT}
                onChange={(e) => {
                  setBorrowUSDT(e.target.value);
                  setErrorMsg(null);
                }}
                className="w-full bg-transparent text-xl font-black text-[#00E163] font-mono-num focus:outline-none placeholder:text-slate-600"
              />
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1F1E25] text-xs font-bold text-white font-mono">
                <MarketIcon symbol="USDT" size="sm" />
                <span>USDT</span>
              </div>
            </div>
          </div>

          {/* LTV Safety Meter Gauge */}
          <div className="flex flex-col p-4 rounded-2xl bg-[#1B1A21] border border-white/5 gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold">Rasio Risiko LTV (Loan-to-Value):</span>
              <span
                className={`font-mono-num font-extrabold text-sm ${
                  currentLtv > 75 ? 'text-[#FF5C77]' : currentLtv > 65 ? 'text-amber-400' : 'text-[#00E163]'
                }`}
              >
                {currentLtv.toFixed(1)}% {currentLtv <= 65 ? '(Aman)' : currentLtv <= 75 ? '(Waspada)' : '(Tinggi)'}
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  currentLtv > 75 ? 'bg-[#FF5C77]' : currentLtv > 65 ? 'bg-amber-400' : 'bg-[#00E163]'
                }`}
                style={{ width: `${Math.min(100, currentLtv)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono-num">
              <span>Aman: &lt; 65%</span>
              <span>Margin Call: 75%</span>
              <span className="text-[#FF5C77]">Likuidasi: 85%</span>
            </div>
          </div>

          {/* Term Selection & Interest Info */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#26252E] border border-white/5 text-xs text-slate-400 font-mono-num">
            <div className="flex items-center gap-1.5">
              <span>Tenor:</span>
              {[7, 30, 90].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setBorrowTermDays(days as any)}
                  className={`px-2 py-0.5 rounded-md font-bold cursor-pointer transition-colors ${
                    borrowTermDays === days
                      ? 'bg-[#00E163] text-black'
                      : 'bg-[#1F1E25] text-slate-400 hover:text-white'
                  }`}
                >
                  {days}D
                </button>
              ))}
            </div>

            <div className="text-right">
              <span>Total Estimasi Bunga: </span>
              <strong className="text-white">+${totalInterest.toFixed(2)} USDT</strong>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#FF5C77]/10 border border-[#FF5C77]/30 text-xs text-[#FF5C77] font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Submit Loan Button with Enlarged Height, Sleek Rounded-2xl, and 4-Step Animated Motion */}
          <button
            type="submit"
            disabled={loanPhase !== 'idle'}
            className="relative w-full h-14 rounded-2xl overflow-hidden font-black text-xs transition-all duration-300 cursor-pointer flex-shrink-0 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white select-none shadow-lg border border-white/5 group"
          >
            {/* 1. Green Progress Fill from Left to Right */}
            <div
              className={`absolute left-0 top-0 bottom-0 bg-[#00E163] shadow-lg shadow-[#00E163]/30 transition-all ease-out pointer-events-none ${
                loanPhase === 'idle'
                  ? 'w-0'
                  : 'w-full duration-700'
              }`}
            />

            {/* Initial Idle Text */}
            {loanPhase === 'idle' && (
              <span className="relative z-10 transition-opacity duration-300 text-white group-hover:text-white uppercase tracking-wider text-xs font-black">
                Pinjam ${parsedBorrowUSDT.toLocaleString()} USDT Sekarang
              </span>
            )}

            {/* Step 1: While filling progress bar */}
            {loanPhase === 'progress' && (
              <span className="relative z-10 text-black font-black tracking-wider text-xs animate-pulse">
                Mencairkan Pinjaman Likuiditas...
              </span>
            )}

            {/* Step 2 & 3: Centered Checkmark & Success Text Motion */}
            {(loanPhase === 'checkmark_center' || loanPhase === 'checkmark_shift' || loanPhase === 'success_revealed') && (
              <div className="relative z-10 flex items-center justify-center gap-2.5">
                {/* Checkmark Icon with Smooth Centered Pop & Left Shift */}
                <div
                  className={`transition-all duration-500 ease-out flex items-center justify-center ${
                    loanPhase === 'checkmark_center'
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
                    loanPhase === 'success_revealed'
                      ? 'opacity-100 blur-0 translate-x-0 max-w-[220px]'
                      : 'opacity-0 blur-sm -translate-x-3 max-w-0 overflow-hidden'
                  }`}
                >
                  <span className="font-black text-black text-xs tracking-wider uppercase whitespace-nowrap">
                    Loan Success
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
