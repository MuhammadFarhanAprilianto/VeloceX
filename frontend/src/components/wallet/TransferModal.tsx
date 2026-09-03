'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Cancel01Icon,
  ArrowDown01Icon,
  ArrowUpDownIcon,
  Exchange01Icon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  Tick01Icon,
} from 'hugeicons-react';
import { MarketIcon } from '@/components/MarketIcon';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  spotBalance: number;
  futuresBalance: number;
  fundingBalance: number;
  onTransferSuccess: (amount: number, from: string, to: string, symbol: string) => void;
}

const WALLET_TYPES = [
  { id: 'spot', label: 'Spot Trading Wallet' },
  { id: 'futures', label: 'Futures / Margin Wallet' },
  { id: 'funding', label: 'Funding & Vault Wallet' },
];

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  spotBalance,
  futuresBalance,
  fundingBalance,
  onTransferSuccess,
}) => {
  const [fromWallet, setFromWallet] = useState('spot');
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [toWallet, setToWallet] = useState('futures');
  const [isToOpen, setIsToOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [transferPhase, setTransferPhase] = useState<'idle' | 'progress' | 'checkmark_center' | 'checkmark_shift' | 'success_revealed'>('idle');

  if (!isOpen || typeof document === 'undefined') return null;

  const getWalletBalance = (walletId: string) => {
    if (walletId === 'spot') return spotBalance;
    if (walletId === 'futures') return futuresBalance;
    return fundingBalance;
  };

  const availableSourceBalance = getWalletBalance(fromWallet);

  const handleSwapDirection = () => {
    const temp = fromWallet;
    setFromWallet(toWallet);
    setToWallet(temp);
    setErrorMsg(null);
  };

  const handleQuickPercent = (pct: number) => {
    const val = (availableSourceBalance * pct) / 100;
    setAmount(val.toFixed(2));
    setErrorMsg(null);
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferPhase !== 'idle') return;

    const parsedAmount = parseFloat(amount) || 0;
    if (parsedAmount <= 0) {
      setErrorMsg('Please enter a valid transfer amount.');
      return;
    }
    if (parsedAmount > availableSourceBalance) {
      setErrorMsg('Transfer amount exceeds available source wallet balance.');
      return;
    }
    if (fromWallet === toWallet) {
      setErrorMsg('Source and destination wallets must be different.');
      return;
    }

    setErrorMsg(null);

    // Langkah 1: Loading Progress Bar Hijau dari Kiri ke Kanan (700ms)
    setTransferPhase('progress');

    // Langkah 2: Setelah Full Hijau -> Centang Pop di Rata Tengah (Center)
    setTimeout(() => {
      setTransferPhase('checkmark_center');

      // Jeda 1 detik (1000ms) lalu geser ke kiri
      setTimeout(() => {
        setTransferPhase('checkmark_shift');

        // Langkah 3: Teks Success muncul dari burem (blur) ke jelas (sharp)
        setTimeout(() => {
          setTransferPhase('success_revealed');

          // Langkah 4: Jeda 2 detik (2000ms) langsung tutup modal & kembali ke Wallet
          setTimeout(() => {
            onTransferSuccess(
              parsedAmount,
              WALLET_TYPES.find((w) => w.id === fromWallet)?.label || fromWallet,
              WALLET_TYPES.find((w) => w.id === toWallet)?.label || toWallet,
              'USDT'
            );
            setTransferPhase('idle');
            onClose();
          }, 2000);
        }, 150);
      }, 1000);
    }, 700);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in font-sans">
      <div className="flex flex-col w-full max-w-lg bg-[#1F1E25] border border-white/10 rounded-3xl p-6 shadow-2xl gap-5 select-none max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#00E163]/15 text-[#00E163]">
              <Exchange01Icon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-base font-heading">
                Internal Wallet Transfer
              </span>
              <span className="text-xs text-slate-400">
                Instantly transfer funds between your sub-accounts (0 Fees)
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

        <form onSubmit={handleTransferSubmit} className="flex flex-col gap-4 overflow-y-auto pr-1.5 custom-positions-scrollbar flex-1">
          {/* Transfer Source & Destination Selector Box */}
          <div className="relative flex flex-col p-4 rounded-2xl bg-[#26252E] border border-white/5 gap-3">
            {/* From Row with Custom Dropdown */}
            <div className="flex items-center justify-between relative z-20">
              <span className="text-xs font-bold text-slate-400">From:</span>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsFromOpen(!isFromOpen);
                    setIsToOpen(false);
                  }}
                  className="flex items-center justify-between gap-3 min-w-[210px] px-3.5 py-2 rounded-xl bg-[#1B1A21] border border-white/10 hover:border-white/20 transition-all text-xs font-bold text-white cursor-pointer"
                >
                  <span>{WALLET_TYPES.find((w) => w.id === fromWallet)?.label}</span>
                  <ArrowDown01Icon className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isFromOpen ? 'rotate-180 text-white' : ''}`} />
                </button>

                {isFromOpen && (
                  <div className="absolute right-0 top-11 w-56 bg-[#1F1E25] border border-white/10 rounded-2xl shadow-2xl p-1.5 flex flex-col gap-1 z-50 backdrop-blur-xl animate-fade-in">
                    {WALLET_TYPES.map((w) => {
                      const isSelected = fromWallet === w.id;
                      return (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => {
                            setFromWallet(w.id);
                            setIsFromOpen(false);
                            setErrorMsg(null);
                          }}
                          className={`group relative flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-bold overflow-hidden transition-colors duration-1000 cursor-pointer ${
                            isSelected
                              ? 'bg-[#00E163] text-black font-extrabold'
                              : 'text-slate-300 hover:text-black'
                          }`}
                        >
                          {!isSelected && (
                            <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                          )}
                          <span className="relative z-10 transition-colors duration-1000">{w.label}</span>
                          {isSelected && <span className="relative z-10 text-xs font-bold">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Swap Direction Divider Button */}
            <div className="relative flex items-center justify-center my-1 z-10">
              <div className="w-full h-[1px] bg-white/5" />
              <button
                type="button"
                onClick={handleSwapDirection}
                className="absolute flex items-center justify-center w-8 h-8 rounded-full bg-[#1F1E25] border border-white/10 hover:border-[#00E163] text-slate-300 hover:text-[#00E163] transition-colors cursor-pointer shadow-lg"
                title="Swap Direction"
              >
                <ArrowUpDownIcon className="w-4 h-4" />
              </button>
            </div>

            {/* To Row with Custom Dropdown */}
            <div className="flex items-center justify-between relative z-10">
              <span className="text-xs font-bold text-slate-400">To:</span>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsToOpen(!isToOpen);
                    setIsFromOpen(false);
                  }}
                  className="flex items-center justify-between gap-3 min-w-[210px] px-3.5 py-2 rounded-xl bg-[#1B1A21] border border-white/10 hover:border-white/20 transition-all text-xs font-bold text-white cursor-pointer"
                >
                  <span>{WALLET_TYPES.find((w) => w.id === toWallet)?.label}</span>
                  <ArrowDown01Icon className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isToOpen ? 'rotate-180 text-white' : ''}`} />
                </button>

                {isToOpen && (
                  <div className="absolute right-0 top-11 w-56 bg-[#1F1E25] border border-white/10 rounded-2xl shadow-2xl p-1.5 flex flex-col gap-1 z-50 backdrop-blur-xl animate-fade-in">
                    {WALLET_TYPES.map((w) => {
                      const isSelected = toWallet === w.id;
                      return (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => {
                            setToWallet(w.id);
                            setIsToOpen(false);
                            setErrorMsg(null);
                          }}
                          className={`group relative flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-bold overflow-hidden transition-colors duration-1000 cursor-pointer ${
                            isSelected
                              ? 'bg-[#00E163] text-black font-extrabold'
                              : 'text-slate-300 hover:text-black'
                          }`}
                        >
                          {!isSelected && (
                            <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                          )}
                          <span className="relative z-10 transition-colors duration-1000">{w.label}</span>
                          {isSelected && <span className="relative z-10 text-xs font-bold">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Amount Input & Available Balance */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">Transfer Amount</span>
              <span className="text-slate-400 font-mono-num text-[11px]">
                Available: <strong className="text-[#00E163]">${availableSourceBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT</strong>
              </span>
            </div>

            <div className="relative flex items-center justify-between h-12 px-3.5 rounded-xl bg-[#26252E] border border-white/5 focus-within:border-white/20 transition-colors">
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="0.00"
                className="w-full text-xs font-mono font-bold text-white bg-transparent focus:outline-none"
              />
              <span className="text-xs font-mono font-bold text-slate-400 pl-2">USDT</span>
            </div>

            {/* Quick Percentage Chips with 1000ms Sweep */}
            <div className="grid grid-cols-4 gap-1.5 mt-1">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handleQuickPercent(pct)}
                  className="group relative py-1 rounded-lg bg-[#26252E] border border-white/5 overflow-hidden text-[10px] font-bold text-slate-400 hover:text-black font-mono transition-colors duration-1000 cursor-pointer text-center"
                >
                  <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                  <span className="relative z-10 transition-colors duration-1000">{pct === 100 ? 'MAX' : `${pct}%`}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Fee Notice */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#26252E] border border-white/5 text-[11px] font-mono-num">
            <span className="font-sans text-slate-400">Transfer Fee:</span>
            <span className="font-bold text-[#00E163]">Free (Instant)</span>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#362227] border border-[#FF5C77]/30 text-[#FF5C77] text-xs font-bold animate-fade-in">
              <AlertCircleIcon className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Confirm Transfer Action Button with Enlarged Height, Sleek Rounded-2xl, and 4-Step Animated Motion */}
          <button
            type="submit"
            disabled={transferPhase !== 'idle'}
            className="relative w-full h-14 rounded-2xl overflow-hidden font-black text-xs transition-all duration-300 cursor-pointer flex-shrink-0 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white select-none shadow-lg border border-white/5 group"
          >
            {/* 1. Green Progress Fill from Left to Right */}
            <div
              className={`absolute left-0 top-0 bottom-0 bg-[#00E163] shadow-lg shadow-[#00E163]/30 transition-all ease-out pointer-events-none ${
                transferPhase === 'idle'
                  ? 'w-0'
                  : 'w-full duration-700'
              }`}
            />

            {/* Initial Idle Text "Confirm Transfer" */}
            {transferPhase === 'idle' && (
              <span className="relative z-10 transition-opacity duration-300 text-white group-hover:text-white uppercase tracking-wider text-xs font-black">
                Confirm Transfer
              </span>
            )}

            {/* Step 1: While filling progress bar */}
            {transferPhase === 'progress' && (
              <span className="relative z-10 text-black font-black tracking-wider text-xs animate-pulse">
                Memproses Transfer Antar Wallet...
              </span>
            )}

            {/* Step 2 & 3: Centered Checkmark & Success Text Motion */}
            {(transferPhase === 'checkmark_center' || transferPhase === 'checkmark_shift' || transferPhase === 'success_revealed') && (
              <div className="relative z-10 flex items-center justify-center gap-2.5">
                {/* Checkmark Icon with Smooth Centered Pop & Left Shift */}
                <div
                  className={`transition-all duration-500 ease-out flex items-center justify-center ${
                    transferPhase === 'checkmark_center'
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
                    transferPhase === 'success_revealed'
                      ? 'opacity-100 blur-0 translate-x-0 max-w-[220px]'
                      : 'opacity-0 blur-sm -translate-x-3 max-w-0 overflow-hidden'
                  }`}
                >
                  <span className="font-black text-black text-xs tracking-wider uppercase whitespace-nowrap">
                    Transfer Success
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
