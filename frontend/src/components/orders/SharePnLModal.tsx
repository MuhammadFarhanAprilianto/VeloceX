'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Cancel01Icon,
  Download01Icon,
  Copy01Icon,
  Share01Icon,
  Tick01Icon,
  FlashIcon,
  SparklesIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  QrCodeIcon,
} from 'hugeicons-react';

import { ClosedPositionRecord } from './OrdersView';

interface SharePnLModalProps {
  isOpen: boolean;
  position: ClosedPositionRecord | null;
  onClose: () => void;
  onSuccessToast?: (msg: string) => void;
}

export const SharePnLModal: React.FC<SharePnLModalProps> = ({
  isOpen,
  position,
  onClose,
  onSuccessToast,
}) => {
  const [downloadPhase, setDownloadPhase] = useState<
    'idle' | 'progress' | 'checkmark_center' | 'checkmark_shift' | 'success_revealed'
  >('idle');
  const [theme, setTheme] = useState<'neon' | 'cyber' | 'minimal'>('neon');

  if (!isOpen || !position || typeof document === 'undefined') return null;

  const isProfit = position.closedPnl >= 0;

  const handleDownloadPoster = () => {
    if (downloadPhase !== 'idle') return;

    // Step 1: 0ms -> Progress fills from left to right (700ms)
    setDownloadPhase('progress');

    // Step 2: 700ms -> Centered Pop Checkmark badge with 1s pause
    setTimeout(() => {
      setDownloadPhase('checkmark_center');

      // Step 3: 1700ms -> Checkmark shifts left & text reveals from blur
      setTimeout(() => {
        setDownloadPhase('checkmark_shift');

        setTimeout(() => {
          setDownloadPhase('success_revealed');

          // Step 4: 3850ms -> Complete & Close
          setTimeout(() => {
            onSuccessToast?.(`Poster PnL ${position.symbol} berhasil diunduh ke galeri!`);
            setDownloadPhase('idle');
            onClose();
          }, 2000);
        }, 150);
      }, 1000);
    }, 700);
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`https://velocex.trade/share/pnl/${position.id}`);
      onSuccessToast?.('Tautan Share PnL berhasil disalin ke clipboard!');
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in font-sans">
      <div className="relative w-full max-w-md rounded-3xl bg-[#1F1E25] border border-white/10 p-6 shadow-2xl flex flex-col gap-5 overflow-hidden">
        {/* Glow Accent Background */}
        <div
          className={`absolute -top-24 -right-24 w-60 h-60 rounded-full blur-3xl pointer-events-none ${
            isProfit ? 'bg-[#00E163]/15' : 'bg-[#FF5C77]/15'
          }`}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#00E163]/10 border border-[#00E163]/20 text-[#00E163]">
              <Share01Icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Share PnL Poster</h2>
              <p className="text-xs text-slate-400">Bagikan hasil trading profesional Anda</p>
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

        {/* Theme Selector */}
        <div className="flex items-center justify-center gap-2 p-1 rounded-2xl bg-[#17161C] border border-white/5">
          {(['neon', 'cyber', 'minimal'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTheme(t)}
              className={`group relative flex-1 py-1.5 rounded-xl text-xs font-bold capitalize transition-all duration-1000 overflow-hidden cursor-pointer ${
                theme === t
                  ? 'bg-[#00E163] text-black font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-black'
              }`}
            >
              {theme !== t && (
                <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
              )}
              <span className="relative z-10 transition-colors duration-500">{t} Theme</span>
            </button>
          ))}
        </div>

        {/* PnL Graphical Card Preview (The Exportable Poster) */}
        <div
          id="pnl-poster-card"
          className="relative flex flex-col p-5 rounded-2xl bg-gradient-to-br from-[#18171F] via-[#22212B] to-[#14131A] border border-white/10 shadow-2xl overflow-hidden gap-4"
        >
          {/* Top Brand & Market Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-wider text-white">
                VELOCE<span className="text-[#00E163]">X</span>
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 text-[9px] font-bold font-mono">
                PRO TRADER
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">{position.closeTime}</span>
          </div>

          {/* Symbol & Side Badge */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-white">{position.symbol}</span>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                position.side === 'LONG'
                  ? 'bg-[#00E163]/20 text-[#00E163] border border-[#00E163]/30'
                  : 'bg-[#FF5C77]/20 text-[#FF5C77] border border-[#FF5C77]/30'
              }`}
            >
              {position.side} {position.leverage || '20X'}
            </span>
          </div>

          {/* Big Hero ROI % */}
          <div className="flex flex-col gap-0.5 my-1">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Realized ROI Rate
            </span>
            <div className="flex items-baseline gap-2 font-mono-num">
              <span
                className={`text-4xl font-black tracking-tight ${
                  isProfit ? 'text-[#00E163] drop-shadow-[0_0_20px_rgba(0,225,99,0.3)]' : 'text-[#FF5C77]'
                }`}
              >
                {isProfit ? `+${position.roiPct.toFixed(2)}%` : `${position.roiPct.toFixed(2)}%`}
              </span>
              <span
                className={`text-sm font-bold ${
                  isProfit ? 'text-[#00E163]' : 'text-[#FF5C77]'
                }`}
              >
                ({isProfit ? `+$${position.closedPnl.toFixed(2)}` : `-$${Math.abs(position.closedPnl).toFixed(2)}`})
              </span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-black/40 border border-white/5 text-xs font-mono-num">
            <div>
              <span className="text-[10px] text-slate-400 font-sans block">Entry Price</span>
              <span className="text-white font-bold">${position.entryPrice.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-sans block">Exit Price</span>
              <span className="text-white font-bold">${position.closePrice.toLocaleString()}</span>
            </div>
          </div>

          {/* Poster Footer with QR & Watermark */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-sans">Trade with 0% Fee</span>
              <span className="text-xs font-black text-white">velocex.trade</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/5 text-slate-300 text-[10px] font-mono">
              <QrCodeIcon className="w-3.5 h-3.5 text-[#00E163]" />
              <span>Scan to Copy Trade</span>
            </div>
          </div>
        </div>

        {/* Action Buttons with 4-Step Animated Motion on Download */}
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleDownloadPoster}
            disabled={downloadPhase !== 'idle'}
            className="relative w-full h-14 rounded-2xl overflow-hidden font-black text-xs transition-all duration-300 cursor-pointer flex-shrink-0 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white select-none shadow-lg border border-white/5 group"
          >
            {/* 1. Green Progress Fill from Left to Right */}
            <div
              className={`absolute left-0 top-0 bottom-0 bg-[#00E163] shadow-lg shadow-[#00E163]/30 transition-all ease-out pointer-events-none ${
                downloadPhase === 'idle' ? 'w-0' : 'w-full duration-700'
              }`}
            />

            {/* Initial Idle Text */}
            {downloadPhase === 'idle' && (
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Download01Icon className="w-4 h-4 text-[#00E163]" />
                <span className="tracking-wide">Download PnL Card Poster</span>
              </span>
            )}

            {/* Step 2 & 3: Centered Checkmark Badge and Left Shift + Text Reveal */}
            {downloadPhase !== 'idle' && (
              <div className="relative z-10 flex items-center justify-center w-full">
                <div
                  className={`flex items-center transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    downloadPhase === 'checkmark_center' ? 'translate-x-0' : '-translate-x-20'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shadow-lg border border-white/20 animate-scale-up">
                    <Tick01Icon className="w-5 h-5 text-[#00E163] stroke-[3]" />
                  </div>
                </div>

                <div
                  className={`absolute left-[54%] transition-all duration-500 ease-out font-black text-xs tracking-wider text-black ${
                    downloadPhase === 'success_revealed'
                      ? 'opacity-100 blur-0 translate-x-0'
                      : 'opacity-0 blur-sm -translate-x-3 pointer-events-none'
                  }`}
                >
                  SAVED TO GALLERY
                </div>
              </div>
            )}
          </button>

          {/* Copy Share Link Button with 1000ms Sweep */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="group relative flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-[#26252E] hover:bg-[#00E163] text-slate-300 hover:text-black border border-white/5 text-xs font-bold transition-all duration-1000 overflow-hidden cursor-pointer"
          >
            <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
            <span className="relative z-10 flex items-center gap-2 transition-colors duration-500">
              <Copy01Icon className="w-4 h-4" />
              <span>Salin Tautan Poster PnL</span>
            </span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
