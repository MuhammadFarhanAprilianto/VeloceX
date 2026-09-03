'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Cancel01Icon,
  Award01Icon,
  CheckmarkCircle01Icon,
  SparklesIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Tick01Icon,
} from 'hugeicons-react';

interface BecomeMasterTraderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

type SubmitStage = 'idle' | 'progress' | 'check_center' | 'check_slide_text' | 'done';

const STYLE_OPTIONS = [
  { id: 'Scalping', label: 'Scalping (Menit)' },
  { id: 'Day Trading', label: 'Day Trading (Harian)' },
  { id: 'Swing Trading', label: 'Swing Trading (Mingguan)' },
  { id: 'Algo Bot', label: 'Algorithmic Bot' },
];

const PROFIT_SHARE_OPTIONS = [
  { id: 10, label: '10% (Rekomendasi Pemula)' },
  { id: 12, label: '12%' },
  { id: 15, label: '15% (Maksimal)' },
];

export const BecomeMasterTraderModal: React.FC<BecomeMasterTraderModalProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess,
}) => {
  const [mounted, setMounted] = useState(false);
  const [strategyName, setStrategyName] = useState('');
  const [style, setStyle] = useState('Scalping');
  const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
  const [profitShare, setProfitShare] = useState<number>(10);
  const [isProfitDropdownOpen, setIsProfitDropdownOpen] = useState(false);
  const [bio, setBio] = useState('');
  const [isAgreed, setIsAgreed] = useState(true);
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

  if (!isOpen || !mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!strategyName || !bio || !isAgreed || submitStage !== 'idle') return;

    clearAllTimers();

    // STEP 1: Start Loading Progress Bar (0% to 100% bright neon green #00E163 fill from left to right)
    setSubmitStage('progress');

    // STEP 2: After 1.2s progress completes -> Pop Checkmark in Dead Center
    const t1 = setTimeout(() => {
      setSubmitStage('check_center');

      // STEP 3: After 1s pause -> Checkmark slides to left & Success text fades in from blur
      const t2 = setTimeout(() => {
        setSubmitStage('check_slide_text');

        // STEP 4: After 2s pause -> Close modal and stay on Community page
        const t3 = setTimeout(() => {
          setSubmitStage('done');
          handleClose();
          onSubmitSuccess();
        }, 2000);
        timersRef.current.push(t3);
      }, 1000);
      timersRef.current.push(t2);
    }, 1200);
    timersRef.current.push(t1);
  };

  return createPortal(
    <div
      onClick={() => {
        setIsStyleDropdownOpen(false);
        setIsProfitDropdownOpen(false);
      }}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in font-sans"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-3xl bg-[#1F1E25] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-6 flex flex-col gap-5 max-h-[90vh] overflow-visible"
      >
        {/* Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00E163] to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00E163]/10 border border-[#00E163]/30 flex items-center justify-center text-[#00E163]">
              <Award01Icon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-base font-black text-white font-heading">
                Daftar Menjadi Master Trader
              </h3>
              <span className="text-xs text-slate-400">
                Dapatkan bagi hasil profit hingga <strong className="text-[#00E163]">15%</strong> dari pengikut Anda
              </span>
            </div>
          </div>

          {/* Close Button: Always clickable at all stages */}
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl bg-[#26252E] hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <Cancel01Icon className="w-4 h-4" />
          </button>
        </div>

        {/* Benefits Strip */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#18171E] border border-white/5 text-center">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400">Profit Sharing</span>
            <span className="text-xs font-black text-[#00E163] font-mono-num">10% - 15%</span>
          </div>
          <div className="flex flex-col items-center border-x border-white/5">
            <span className="text-[10px] text-slate-400">Maks. Copier</span>
            <span className="text-xs font-black text-white font-mono-num">Hingga 500</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-400">Badge Khusus</span>
            <span className="text-xs font-black text-amber-400">VIP Master</span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Strategy Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400">Nama Akun Strategi</label>
            <input
              type="text"
              required
              disabled={submitStage !== 'idle'}
              value={strategyName}
              onChange={(e) => setStrategyName(e.target.value)}
              placeholder="Contoh: Alpha Trend Pro, Scalp Master"
              className="h-11 px-3.5 rounded-2xl bg-[#18171E] border border-white/10 focus:border-[#00E163]/60 text-xs font-bold text-white focus:outline-none transition-colors disabled:opacity-50"
            />
          </div>

          {/* Style & Profit Share Selector with Custom Interactive Dropdowns */}
          <div className="grid grid-cols-2 gap-3">
            {/* 1. Gaya Trading Dropdown */}
            <div className="relative flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400">Gaya Trading</label>
              <button
                type="button"
                disabled={submitStage !== 'idle'}
                onClick={() => {
                  setIsStyleDropdownOpen(!isStyleDropdownOpen);
                  setIsProfitDropdownOpen(false);
                }}
                className="flex items-center justify-between gap-2 px-3.5 h-11 w-full rounded-2xl bg-[#18171E] border border-white/10 hover:border-[#00E163]/50 text-xs text-white font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{STYLE_OPTIONS.find((s) => s.id === style)?.label || style}</span>
                {isStyleDropdownOpen ? (
                  <ArrowUp01Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                ) : (
                  <ArrowDown01Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
              </button>

              {/* Custom Floating Menu */}
              {isStyleDropdownOpen && (
                <div className="absolute left-0 top-[68px] z-50 w-full bg-[#1F1E25] border border-white/10 rounded-2xl p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex flex-col gap-1 backdrop-blur-xl animate-fade-in">
                  {STYLE_OPTIONS.map((opt) => {
                    const isSelected = style === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setStyle(opt.id);
                          setIsStyleDropdownOpen(false);
                        }}
                        className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all duration-1000 overflow-hidden cursor-pointer text-left ${
                          isSelected
                            ? 'bg-[#00E163] text-black font-extrabold shadow-sm'
                            : 'text-slate-200 hover:text-black font-bold'
                        }`}
                      >
                        {!isSelected && (
                          <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                        )}
                        <span className="relative z-10 transition-colors duration-500">{opt.label}</span>
                        {isSelected && (
                          <Tick01Icon className="relative z-10 w-3.5 h-3.5 stroke-[3] text-black shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Bagi Hasil Profit Dropdown */}
            <div className="relative flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400">Bagi Hasil Profit (%)</label>
              <button
                type="button"
                disabled={submitStage !== 'idle'}
                onClick={() => {
                  setIsProfitDropdownOpen(!isProfitDropdownOpen);
                  setIsStyleDropdownOpen(false);
                }}
                className="flex items-center justify-between gap-2 px-3.5 h-11 w-full rounded-2xl bg-[#18171E] border border-white/10 hover:border-[#00E163]/50 text-xs text-[#00E163] font-bold font-mono-num transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{PROFIT_SHARE_OPTIONS.find((p) => p.id === profitShare)?.label || `${profitShare}%`}</span>
                {isProfitDropdownOpen ? (
                  <ArrowUp01Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                ) : (
                  <ArrowDown01Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
              </button>

              {/* Custom Floating Menu */}
              {isProfitDropdownOpen && (
                <div className="absolute left-0 top-[68px] z-50 w-full bg-[#1F1E25] border border-white/10 rounded-2xl p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex flex-col gap-1 backdrop-blur-xl animate-fade-in">
                  {PROFIT_SHARE_OPTIONS.map((opt) => {
                    const isSelected = profitShare === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setProfitShare(opt.id);
                          setIsProfitDropdownOpen(false);
                        }}
                        className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono-num transition-all duration-1000 overflow-hidden cursor-pointer text-left ${
                          isSelected
                            ? 'bg-[#00E163] text-black font-extrabold shadow-sm'
                            : 'text-slate-200 hover:text-black font-bold'
                        }`}
                      >
                        {!isSelected && (
                          <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                        )}
                        <span className="relative z-10 transition-colors duration-500">{opt.label}</span>
                        {isSelected && (
                          <Tick01Icon className="relative z-10 w-3.5 h-3.5 stroke-[3] text-black shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Bio / Strategy Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400">Deskripsi Strategi & Manajemen Risiko</label>
            <textarea
              required
              rows={3}
              disabled={submitStage !== 'idle'}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Jelaskan secara singkat metode analisis Anda, toleransi draw-down harian, dan pasangan koin yang biasa Anda tradingkan..."
              className="p-3 rounded-2xl bg-[#18171E] border border-white/10 focus:border-[#00E163]/60 text-xs text-white focus:outline-none transition-colors resize-none disabled:opacity-50"
            />
          </div>

          {/* Custom Squircle Checkbox matching VeloceX Hide Checkbox */}
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
              Saya bersedia mematuhi kode etik Master Trader VeloceX dan tidak melakukan manipulasi trading atau trading berisiko ekstrem.
            </span>
          </div>

          {/* Buttons with Interactive 4-Stage Animation Flow */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
            {submitStage === 'idle' && (
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-3 rounded-2xl bg-[#26252E] hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer border border-white/5"
              >
                Batal
              </button>
            )}

            {/* Main Animated Submit Button with Bright Pure Neon Green #00E163 */}
            <button
              type="submit"
              disabled={submitStage === 'idle' && (!isAgreed || !strategyName || !bio)}
              className={`group relative flex items-center justify-center min-w-[220px] h-12 px-6 rounded-2xl font-extrabold text-xs overflow-hidden select-none transition-all duration-300 ${
                submitStage === 'idle'
                  ? `bg-[#26252E] border border-white/10 text-white cursor-pointer ${
                      !isAgreed || !strategyName || !bio ? 'opacity-50 cursor-not-allowed' : 'shadow-md'
                    }`
                  : '!bg-[#00E163] !opacity-100 border border-[#00E163] text-black shadow-[0_0_25px_rgba(0,225,99,0.5)] cursor-default'
              }`}
            >
              {/* STAGE 0: Standard 1000ms Green Hover Sweep (Before Clicked) */}
              {submitStage === 'idle' && (
                <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
              )}

              {/* STAGE 1: Left-to-Right Bright Neon Green Progress Bar Fill */}
              {submitStage === 'progress' && (
                <span className="absolute inset-0 bg-[#00E163] animate-[progressBar_1.2s_cubic-bezier(0.4,0,0.2,1)_forwards] pointer-events-none" />
              )}

              {/* IDLE CONTENT */}
              {submitStage === 'idle' && (
                <span className="relative z-10 flex items-center gap-2 group-hover:text-black transition-colors duration-500">
                  <SparklesIcon className="w-4 h-4 text-[#00E163] group-hover:text-black transition-colors duration-500" />
                  <span>Kirim Pendaftaran Master</span>
                </span>
              )}

              {/* STAGE 1: Progress Text */}
              {submitStage === 'progress' && (
                <span className="relative z-10 flex items-center gap-2 text-black font-black tracking-wide animate-pulse">
                  <span>Memproses Pendaftaran...</span>
                </span>
              )}

              {/* STAGE 2: Pop Center Checkmark */}
              {submitStage === 'check_center' && (
                <div className="relative z-10 flex items-center justify-center animate-[popCenter_0.5s_cubic-bezier(0.34,1.56,0.64,1)_forwards]">
                  <CheckmarkCircle01Icon className="w-7 h-7 stroke-[2.5] text-black" />
                </div>
              )}

              {/* STAGE 3: Checkmark Slides Left + Success Text Fades in from Blur */}
              {(submitStage === 'check_slide_text' || submitStage === 'done') && (
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {/* Sliding Checkmark */}
                  <div className="animate-[slideLeft_0.6s_cubic-bezier(0.25,1,0.5,1)_forwards] flex items-center justify-center">
                    <CheckmarkCircle01Icon className="w-5 h-5 stroke-[2.5] text-black" />
                  </div>

                  {/* Fading from Blur Success Text */}
                  <span className="text-black font-black text-xs tracking-wide animate-[fadeBlurIn_0.7s_cubic-bezier(0.25,1,0.5,1)_forwards]">
                    Pendaftaran Berhasil!
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
