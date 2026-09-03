import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Cancel01Icon,
  CreditCardIcon,
  SparklesIcon,
  LockPasswordIcon,
  CheckmarkCircle01Icon,
  Tick01Icon,
} from 'hugeicons-react';

interface CryptoCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  fundingBalance: number;
}

export const CryptoCardModal: React.FC<CryptoCardModalProps> = ({
  isOpen,
  onClose,
  fundingBalance,
}) => {
  const [isFrozen, setIsFrozen] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(5000);
  const [isCopied, setIsCopied] = useState(false);
  const [cardholderName, setCardholderName] = useState('DIANE LITTEL');
  const [cardPhase, setCardPhase] = useState<'idle' | 'progress' | 'checkmark_center' | 'checkmark_shift' | 'success_revealed'>('idle');

  if (!isOpen || typeof document === 'undefined') return null;

  const handleCopyCard = () => {
    navigator.clipboard.writeText('5412 7532 9918 4209');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveCard = () => {
    if (cardPhase !== 'idle') return;

    // Langkah 1: Loading Progress Bar Hijau dari Kiri ke Kanan (700ms)
    setCardPhase('progress');

    // Langkah 2: Setelah Full Hijau -> Centang Pop di Rata Tengah (Center)
    setTimeout(() => {
      setCardPhase('checkmark_center');

      // Jeda 1 detik (1000ms) lalu geser ke kiri
      setTimeout(() => {
        setCardPhase('checkmark_shift');

        // Langkah 3: Teks Success muncul dari burem (blur) ke jelas (sharp)
        setTimeout(() => {
          setCardPhase('success_revealed');

          // Langkah 4: Jeda 2 detik (2000ms) langsung tutup modal & kembali ke Wallet
          setTimeout(() => {
            setCardPhase('idle');
            onClose();
          }, 2000);
        }, 150);
      }, 1000);
    }, 700);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in font-sans">
      <div className="flex flex-col w-full max-w-lg bg-[#1F1E25] border border-white/10 rounded-3xl p-6 shadow-2xl gap-5 select-none max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#00E163]/15 text-[#00E163]">
              <CreditCardIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-base font-heading">
                VeloceX Crypto Debit Card
              </span>
              <span className="text-xs text-slate-400">
                Kartu Belanja Mastercard Global • Cashback Kripto 8%
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

        {/* VIRTUAL DEBIT CARD PREVIEW (Black & Neon Hologram) */}
        <div className="relative flex flex-col justify-between w-full h-52 p-6 rounded-3xl bg-gradient-to-br from-[#131118] via-[#1F1E25] to-[#0A090C] border border-[#00E163]/30 shadow-2xl overflow-hidden group">
          {/* Card Holographic Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#00E163]/10 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />

          {/* Top Row: Brand & Chip */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[#00E163] flex items-center justify-center font-black text-black text-xs font-mono">
                VX
              </div>
              <span className="font-black text-white text-sm tracking-wider font-heading">
                VELOCEX PRIME
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00E163]/20 border border-[#00E163]/30 text-[#00E163] text-[10px] font-bold">
              <SparklesIcon className="w-3 h-3" />
              <span>8% CASHBACK</span>
            </div>
          </div>

          {/* Middle: EMV Chip & Frozen Overlay */}
          <div className="flex items-center justify-between z-10 my-1">
            <div className="w-9 h-7 rounded-lg bg-gradient-to-r from-amber-300 to-amber-500 border border-amber-200/50 shadow-inner flex items-center justify-center">
              <div className="w-full h-0.5 bg-amber-700/30" />
            </div>

            {isFrozen && (
              <span className="px-3 py-1 rounded-xl bg-[#FF5C77]/20 border border-[#FF5C77]/40 text-[#FF5C77] text-xs font-black tracking-widest uppercase">
                CARD FROZEN
              </span>
            )}
          </div>

          {/* Bottom Row: Number & Cardholder */}
          <div className="flex items-end justify-between z-10">
            <div className="flex flex-col">
              <span className="font-mono text-base font-bold text-white tracking-widest">
                5412 •••• •••• 4209
              </span>
              <div className="flex items-center gap-3 mt-1 text-[11px] font-mono text-slate-400">
                <span className="font-sans font-bold text-slate-200">{cardholderName}</span>
                <span>EXP: 08/29</span>
                <span>CVV: •••</span>
              </div>
            </div>

            {/* Mastercard Double Circles */}
            <div className="flex items-center -space-x-2">
              <div className="w-7 h-7 rounded-full bg-[#EB001B] opacity-90" />
              <div className="w-7 h-7 rounded-full bg-[#F79E1B] opacity-80" />
            </div>
          </div>
        </div>

        {/* Card Management Controls */}
        <div className="flex flex-col gap-3 font-sans text-xs">
          {/* Linked Funding Balance */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#26252E] border border-white/5 font-mono-num">
            <div className="flex flex-col">
              <span className="text-slate-400 text-[11px] font-sans">Saldo Terhubung (Funding Wallet):</span>
              <strong className="text-white text-sm font-black">
                ${fundingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT
              </strong>
            </div>
            <button
              type="button"
              onClick={handleCopyCard}
              className="px-3 py-1.5 rounded-xl bg-[#1F1E25] hover:bg-white/10 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
            >
              {isCopied ? 'Tersalin ✓' : 'Salin Nomor Kartu'}
            </button>
          </div>

          {/* Freeze Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#26252E] border border-white/5">
            <div className="flex items-center gap-2.5">
              <LockPasswordIcon className={`w-4 h-4 ${isFrozen ? 'text-[#FF5C77]' : 'text-[#00E163]'}`} />
              <div className="flex flex-col">
                <span className="font-bold text-white">Status Kartu: {isFrozen ? 'Beku (Frozen)' : 'Aktif (Active)'}</span>
                <span className="text-[11px] text-slate-400">
                  {isFrozen ? 'Kartu dinonaktifkan sementara dari semua transaksi' : 'Siap digunakan untuk transaksi merchant online & offline'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsFrozen(!isFrozen)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                isFrozen ? 'bg-[#FF5C77]' : 'bg-[#00E163]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-black transition-transform absolute top-0.5 left-0.5 ${
                  isFrozen ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Daily Limit Slider */}
          <div className="flex flex-col p-3.5 rounded-2xl bg-[#26252E] border border-white/5 gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold">Limit Belanja Harian:</span>
              <strong className="text-[#00E163] font-mono-num font-bold">
                ${dailyLimit.toLocaleString()} USDT / hari
              </strong>
            </div>
            <input
              type="range"
              min="500"
              max="25000"
              step="500"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(parseInt(e.target.value))}
              className="w-full accent-[#00E163] cursor-pointer"
            />
          </div>
        </div>

        {/* Selesai & Simpan Action Button with Enlarged Height, Sleek Rounded-2xl, and 4-Step Animated Motion */}
        <button
          type="button"
          onClick={handleSaveCard}
          disabled={cardPhase !== 'idle'}
          className="relative w-full h-14 rounded-2xl overflow-hidden font-black text-xs transition-all duration-300 cursor-pointer flex-shrink-0 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white select-none shadow-lg border border-white/5 group"
        >
          {/* 1. Green Progress Fill from Left to Right */}
          <div
            className={`absolute left-0 top-0 bottom-0 bg-[#00E163] shadow-lg shadow-[#00E163]/30 transition-all ease-out pointer-events-none ${
              cardPhase === 'idle'
                ? 'w-0'
                : 'w-full duration-700'
            }`}
          />

          {/* Initial Idle Text "Selesai & Simpan" */}
          {cardPhase === 'idle' && (
            <span className="relative z-10 transition-opacity duration-300 text-white group-hover:text-white uppercase tracking-wider text-xs font-black">
              Selesai & Simpan
            </span>
          )}

          {/* Step 1: While filling progress bar */}
          {cardPhase === 'progress' && (
            <span className="relative z-10 text-black font-black tracking-wider text-xs animate-pulse">
              Menyimpan Pengaturan...
            </span>
          )}

          {/* Step 2 & 3: Centered Checkmark & Success Text Motion */}
          {(cardPhase === 'checkmark_center' || cardPhase === 'checkmark_shift' || cardPhase === 'success_revealed') && (
            <div className="relative z-10 flex items-center justify-center gap-2.5">
              {/* Checkmark Icon with Smooth Centered Pop & Left Shift */}
              <div
                className={`transition-all duration-500 ease-out flex items-center justify-center ${
                  cardPhase === 'checkmark_center'
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
                  cardPhase === 'success_revealed'
                    ? 'opacity-100 blur-0 translate-x-0 max-w-[220px]'
                    : 'opacity-0 blur-sm -translate-x-3 max-w-0 overflow-hidden'
                }`}
              >
                <span className="font-black text-black text-xs tracking-wider uppercase whitespace-nowrap">
                  Success
                </span>
              </div>
            </div>
          )}
        </button>
      </div>
    </div>,
    document.body
  );
};
