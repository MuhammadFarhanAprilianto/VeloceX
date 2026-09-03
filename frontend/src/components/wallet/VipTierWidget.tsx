'use client';

import React, { useState } from 'react';
import {
  CrownIcon,
  SparklesIcon,
  CheckmarkCircle01Icon,
  Cancel01Icon,
  InformationCircleIcon,
  ArrowRight01Icon,
  Tick01Icon,
} from 'hugeicons-react';

interface VipTierWidgetProps {
  currentTier?: number;
  currentVolume30d?: number;
  targetVolume?: number;
  useVelxDiscount?: boolean;
  onToggleVelxDiscount?: (val: boolean) => void;
}

const VIP_TIERS = [
  { level: 0, name: 'Regular User', minVol: '$0', maker: '0.020%', taker: '0.040%', velxDiscount: '0.015% / 0.030%' },
  { level: 1, name: 'VIP 1 Institutional', minVol: '$1,000,000', maker: '0.015%', taker: '0.035%', velxDiscount: '0.011% / 0.026%' },
  { level: 2, name: 'VIP 2 Pro Market Maker', minVol: '$2,000,000', maker: '0.010%', taker: '0.030%', velxDiscount: '0.007% / 0.022%' },
  { level: 3, name: 'VIP 3 Elite Liquidity', minVol: '$5,000,000', maker: '0.005%', taker: '0.025%', velxDiscount: '0.003% / 0.018%' },
  { level: 4, name: 'VIP 4 Prime Institutional', minVol: '$15,000,000', maker: '0.000%', taker: '0.020%', velxDiscount: '0.000% / 0.015%' },
];

export const VipTierWidget: React.FC<VipTierWidgetProps> = ({
  currentTier = 1,
  currentVolume30d = 1420500,
  targetVolume = 2000000,
  useVelxDiscount = true,
  onToggleVelxDiscount,
}) => {
  const [isDiscountActive, setIsDiscountActive] = useState(useVelxDiscount);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const progressPct = Math.min(100, Math.max(0, (currentVolume30d / targetVolume) * 100));

  const handleToggle = () => {
    const nextVal = !isDiscountActive;
    setIsDiscountActive(nextVal);
    onToggleVelxDiscount?.(nextVal);
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-5 rounded-3xl bg-[#1F1E25] border border-white/10 shadow-xl gap-4 font-sans select-none">
        {/* Left: VIP Badge & Volume Progress */}
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-400/15 text-amber-400 border border-amber-400/25 shrink-0 shadow-lg shadow-amber-400/10">
            <CrownIcon className="w-6 h-6 stroke-[2]" />
          </div>

          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-white font-heading">
                VIP {currentTier} Institutional Level
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 text-[10px] font-bold font-mono">
                Tier Benefits Active
              </span>
            </div>

            {/* 30D Volume Bar */}
            <div className="flex flex-col gap-1 max-w-md">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono-num">
                <span>30D Trading Volume:</span>
                <span className="text-white font-bold">
                  ${currentVolume30d.toLocaleString()} / ${targetVolume.toLocaleString()}{' '}
                  <span className="text-slate-500">({progressPct.toFixed(1)}%)</span>
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-[#00E163] transition-all duration-1000 rounded-full"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Fee Rates & VELX 25% Discount Toggle */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Fee Chips */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#26252E] border border-white/5 text-xs font-mono-num">
            <div className="flex flex-col px-2.5 py-0.5">
              <span className="text-[10px] text-slate-400 font-sans">Maker Fee</span>
              <strong className="text-[#00E163]">
                {isDiscountActive ? '0.011%' : '0.015%'}
              </strong>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="flex flex-col px-2.5 py-0.5">
              <span className="text-[10px] text-slate-400 font-sans">Taker Fee</span>
              <strong className="text-white">
                {isDiscountActive ? '0.026%' : '0.035%'}
              </strong>
            </div>
          </div>

          {/* VELX 25% Fee Discount Toggle */}
          <button
            type="button"
            onClick={handleToggle}
            className={`flex items-center gap-2 px-3 py-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
              isDiscountActive
                ? 'bg-[#00E163]/15 border-[#00E163]/40 text-[#00E163]'
                : 'bg-[#26252E] border-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <SparklesIcon className={`w-3.5 h-3.5 ${isDiscountActive ? 'text-[#00E163]' : 'text-slate-400'}`} />
            <span>25% VELX Fee Discount</span>
            <div
              className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center transition-all ${
                isDiscountActive
                  ? 'bg-[#00E163] border-[#00E163] text-black'
                  : 'border-white/20'
              }`}
            >
              {isDiscountActive && (
                <Tick01Icon className="w-2.5 h-2.5 stroke-[3] text-black" />
              )}
            </div>
          </button>

          {/* View Tier Table Modal Button */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="group relative flex items-center justify-center px-3.5 py-2 rounded-2xl bg-[#26252E] hover:bg-[#00E163] text-slate-300 hover:text-black font-bold text-xs border border-white/10 overflow-hidden transition-colors duration-1000 cursor-pointer"
          >
            <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
            <span className="relative z-10 transition-colors duration-1000 flex items-center gap-1">
              <span>Tier Rate</span>
              <ArrowRight01Icon className="w-3.5 h-3.5" />
            </span>
          </button>
        </div>
      </div>

      {/* VIP TIERS DETAIL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in font-sans">
          <div className="flex flex-col w-full max-w-2xl bg-[#1F1E25] border border-white/10 rounded-3xl p-6 shadow-2xl gap-5 select-none max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-amber-400/15 text-amber-400">
                  <CrownIcon className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-white text-base font-heading">
                    VeloceX VIP & Fee Tier Structure
                  </span>
                  <span className="text-xs text-slate-400">
                    Diskon biaya trading institusional berdasarkan volume 30 hari
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <Cancel01Icon className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto custom-positions-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 font-bold pb-2">
                    <th className="py-2.5 px-3">VIP Tier</th>
                    <th className="py-2.5 px-3 text-right">30D Volume</th>
                    <th className="py-2.5 px-3 text-right">Maker / Taker</th>
                    <th className="py-2.5 px-3 text-right text-[#00E163]">With 25% VELX Discount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono-num">
                  {VIP_TIERS.map((tier) => {
                    const isCurrent = tier.level === currentTier;
                    return (
                      <tr
                        key={tier.level}
                        className={`transition-colors ${
                          isCurrent ? 'bg-[#00E163]/10 font-bold' : 'hover:bg-white/[0.02]'
                        }`}
                      >
                        <td className="py-3 px-3 font-sans">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-white">{tier.name}</span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-md bg-[#00E163] text-black text-[10px] font-black">
                                Current
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right text-slate-300">{tier.minVol}</td>
                        <td className="py-3 px-3 text-right text-slate-300">
                          {tier.maker} / {tier.taker}
                        </td>
                        <td className="py-3 px-3 text-right text-[#00E163] font-bold">
                          {tier.velxDiscount}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#26252E] border border-white/5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <InformationCircleIcon className="w-4 h-4 text-[#00E163]" />
                <span>Volume dihitung otomatis setiap 24 jam sekali pada pukul 00:00 UTC.</span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-[#00E163] text-black font-extrabold text-xs cursor-pointer hover:brightness-110"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
