'use client';

import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Cancel01Icon,
  SparklesIcon,
  Tick01Icon,
} from 'hugeicons-react';
import { MarketIcon } from '@/components/MarketIcon';

export interface DustAsset {
  symbol: string;
  name: string;
  category: 'crypto' | 'forex' | 'cfd';
  amount: number;
  usdValue: number;
}

interface DustConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableDustAssets: DustAsset[];
  onConvertSuccess: (convertedUSDT: number, convertedSymbols: string[]) => void;
}

export const DustConverterModal: React.FC<DustConverterModalProps> = ({
  isOpen,
  onClose,
  availableDustAssets,
  onConvertSuccess,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'crypto' | 'forex' | 'cfd'>('all');
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(
    availableDustAssets.map((a) => a.symbol)
  );
  const [dustPhase, setDustPhase] = useState<'idle' | 'progress' | 'checkmark_center' | 'checkmark_shift' | 'success_revealed'>('idle');

  const filteredDustAssets = useMemo(() => {
    if (selectedCategory === 'all') return availableDustAssets;
    return availableDustAssets.filter((a) => a.category === selectedCategory);
  }, [availableDustAssets, selectedCategory]);

  const totalEstimatedUSDT = useMemo(() => {
    return availableDustAssets
      .filter((a) => selectedSymbols.includes(a.symbol))
      .reduce((acc, curr) => acc + curr.usdValue, 0);
  }, [availableDustAssets, selectedSymbols]);

  const toggleSymbol = (symbol: string) => {
    setSelectedSymbols((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  };

  const areAllFilteredSelected =
    filteredDustAssets.length > 0 &&
    filteredDustAssets.every((a) => selectedSymbols.includes(a.symbol));

  const toggleSelectAll = () => {
    const currentFilteredSymbols = filteredDustAssets.map((a) => a.symbol);
    if (areAllFilteredSelected) {
      setSelectedSymbols((prev) => prev.filter((s) => !currentFilteredSymbols.includes(s)));
    } else {
      setSelectedSymbols((prev) => Array.from(new Set([...prev, ...currentFilteredSymbols])));
    }
  };

  const handleConvert = () => {
    if (dustPhase !== 'idle' || selectedSymbols.length === 0 || totalEstimatedUSDT <= 0) return;

    // Langkah 1: Loading Progress Bar Hijau dari Kiri ke Kanan (700ms)
    setDustPhase('progress');

    // Langkah 2: Setelah Full Hijau -> Centang Pop di Rata Tengah (Center)
    setTimeout(() => {
      setDustPhase('checkmark_center');

      // Jeda 1 detik (1000ms) lalu geser ke kiri
      setTimeout(() => {
        setDustPhase('checkmark_shift');

        // Langkah 3: Teks Success muncul dari burem (blur) ke jelas (sharp)
        setTimeout(() => {
          setDustPhase('success_revealed');

          // Langkah 4: Jeda 2 detik (2000ms) langsung tutup modal & kembali ke Wallet
          setTimeout(() => {
            onConvertSuccess(totalEstimatedUSDT, selectedSymbols);
            setDustPhase('idle');
            onClose();
          }, 2000);
        }, 150);
      }, 1000);
    }, 700);
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in font-sans">
      <div className="flex flex-col w-full max-w-lg bg-[#1F1E25] border border-white/10 rounded-3xl p-6 shadow-2xl gap-4 select-none max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#00E163]/15 text-[#00E163]">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-base font-heading">
                Convert Small Balances to USDT
              </span>
              <span className="text-xs text-slate-400">
                Tukar saldo kecil & sisa koin menjadi USDT dalam 1 klik
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

        {/* Category Filter Chips */}
        <div className="flex items-center p-1 rounded-2xl bg-[#26252E] border border-white/5 text-xs font-bold flex-shrink-0">
          {[
            { id: 'all', label: 'All Dust' },
            { id: 'crypto', label: 'Crypto' },
            { id: 'forex', label: 'Forex' },
            { id: 'cfd', label: 'CFD' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#00E163] text-black font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Scrollable Dust Assets List */}
        <div className="flex flex-col gap-3 overflow-y-auto pr-1.5 custom-positions-scrollbar flex-1">
          {/* Select All Row */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#26252E] border border-white/5 text-xs">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="group flex items-center gap-2 font-bold cursor-pointer select-none"
            >
              <div
                className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                  areAllFilteredSelected
                    ? 'bg-[#00E163] border-[#00E163] text-black shadow-sm'
                    : 'border-white/20 bg-transparent group-hover:border-white/40'
                }`}
              >
                {areAllFilteredSelected && (
                  <Tick01Icon className="w-3 h-3 stroke-[3] text-black" />
                )}
              </div>
              <span className="text-slate-300 group-hover:text-white">
                Select All ({selectedSymbols.length}/{availableDustAssets.length})
              </span>
            </button>

            <span className="text-slate-400 font-mono-num text-[11px]">
              Est. Value: <strong className="text-[#00E163]">${totalEstimatedUSDT.toFixed(2)} USDT</strong>
            </span>
          </div>

          {/* List of Small Balance Coins */}
          <div className="flex flex-col gap-2">
            {filteredDustAssets.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs font-bold">
                Tidak ada saldo kecil pada kategori ini.
              </div>
            ) : (
              filteredDustAssets.map((asset) => {
                const isSelected = selectedSymbols.includes(asset.symbol);
                return (
                  <button
                    key={asset.symbol}
                    type="button"
                    onClick={() => toggleSymbol(asset.symbol)}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#26252E] border-[#00E163]/40 shadow-sm'
                        : 'bg-[#1B1A21] border-white/5 hover:border-white/10 opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                          isSelected
                            ? 'bg-[#00E163] border-[#00E163] text-black'
                            : 'border-white/20'
                        }`}
                      >
                        {isSelected && <Tick01Icon className="w-3 h-3 stroke-[3] text-black" />}
                      </div>

                      <MarketIcon symbol={asset.symbol} size="sm" />

                      <div className="flex flex-col text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-xs text-white">{asset.symbol}</span>
                          <span className="text-[10px] text-slate-500 font-sans uppercase">
                            {asset.category}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {asset.amount} {asset.symbol}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end font-mono-num">
                      <span className="text-xs font-bold text-white">${asset.usdValue.toFixed(2)}</span>
                      <span className="text-[10px] text-[#00E163] font-bold">➔ ~{asset.usdValue.toFixed(2)} USDT</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Summary & Action Button with 4-Step Animated Motion */}
        <div className="flex flex-col gap-3 pt-3 border-t border-white/5 flex-shrink-0">
          <div className="flex items-center justify-between text-xs font-mono-num">
            <span className="font-sans text-slate-400 font-medium">You will receive approximately:</span>
            <span className="text-base font-black text-[#00E163]">${totalEstimatedUSDT.toFixed(2)} USDT</span>
          </div>

          <button
            type="button"
            onClick={handleConvert}
            disabled={dustPhase !== 'idle' || selectedSymbols.length === 0 || totalEstimatedUSDT <= 0}
            className="relative w-full h-14 rounded-2xl overflow-hidden font-black text-xs transition-all duration-300 cursor-pointer flex-shrink-0 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white select-none shadow-lg border border-white/5 group"
          >
            {/* 1. Green Progress Fill from Left to Right */}
            <div
              className={`absolute left-0 top-0 bottom-0 bg-[#00E163] shadow-lg shadow-[#00E163]/30 transition-all ease-out pointer-events-none ${
                dustPhase === 'idle'
                  ? 'w-0'
                  : 'w-full duration-700'
              }`}
            />

            {/* Initial Idle Text "Convert X Assets to USDT" */}
            {dustPhase === 'idle' && (
              <span className="relative z-10 transition-opacity duration-300 text-white group-hover:text-white uppercase tracking-wider text-xs font-black flex items-center gap-1.5">
                <SparklesIcon className="w-4 h-4 text-amber-400" />
                <span>Convert {selectedSymbols.length} Assets to USDT</span>
              </span>
            )}

            {/* Step 1: While filling progress bar */}
            {dustPhase === 'progress' && (
              <span className="relative z-10 text-black font-black tracking-wider text-xs animate-pulse">
                Mengonversi {selectedSymbols.length} Saldo Kecil...
              </span>
            )}

            {/* Step 2 & 3: Centered Checkmark & Success Text Motion */}
            {(dustPhase === 'checkmark_center' || dustPhase === 'checkmark_shift' || dustPhase === 'success_revealed') && (
              <div className="relative z-10 flex items-center justify-center gap-2.5">
                {/* Checkmark Icon with Smooth Centered Pop & Left Shift */}
                <div
                  className={`transition-all duration-500 ease-out flex items-center justify-center ${
                    dustPhase === 'checkmark_center'
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
                    dustPhase === 'success_revealed'
                      ? 'opacity-100 blur-0 translate-x-0 max-w-[220px]'
                      : 'opacity-0 blur-sm -translate-x-3 max-w-0 overflow-hidden'
                  }`}
                >
                  <span className="font-black text-black text-xs tracking-wider uppercase whitespace-nowrap">
                    Dust Converted
                  </span>
                </div>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
