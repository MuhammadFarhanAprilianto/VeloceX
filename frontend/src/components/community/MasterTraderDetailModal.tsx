'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Cancel01Icon,
  Copy01Icon,
  StarIcon,
  TradeUpIcon,
  Award01Icon,
  Shield01Icon,
  Clock01Icon,
  UserGroupIcon,
  Wallet01Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  ChartLineData01Icon,
  PieChartIcon,
  FireIcon,
  FlashIcon,
  CpuIcon,
} from 'hugeicons-react';
import { MasterTrader } from './CopyTradingModal';

interface MasterTraderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  trader: MasterTrader | null;
  onOpenCopyModal: (trader: MasterTrader) => void;
}

export const MasterTraderDetailModal: React.FC<MasterTraderDetailModalProps> = ({
  isOpen,
  onClose,
  trader,
  onOpenCopyModal,
}) => {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'positions' | 'history'>('overview');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !trader || !mounted) return null;

  // Mock Open Positions
  const openPositions = [
    { pair: 'BTC/USDT', type: 'LONG', leverage: '25x', entryPrice: 67420.5, markPrice: 68150.0, pnl: '+412.30 USDT', pnlPct: '+27.15%' },
    { pair: 'ETH/USDT', type: 'LONG', leverage: '20x', entryPrice: 3480.2, markPrice: 3515.8, pnl: '+142.80 USDT', pnlPct: '+20.45%' },
  ];

  // Mock Trade History
  const tradeHistory = [
    { pair: 'SOL/USDT', type: 'LONG', closePrice: 184.2, pnl: '+240.50 USDT', pnlPct: '+34.2%', time: 'Hari ini, 10:14' },
    { pair: 'BTC/USDT', type: 'SHORT', closePrice: 66890.0, pnl: '+620.00 USDT', pnlPct: '+45.8%', time: 'Kemarin, 21:30' },
    { pair: 'AVAX/USDT', type: 'LONG', closePrice: 38.4, pnl: '-65.20 USDT', pnlPct: '-8.5%', time: '2 hari lalu' },
    { pair: 'BNB/USDT', type: 'LONG', closePrice: 592.1, pnl: '+185.00 USDT', pnlPct: '+19.2%', time: '3 hari lalu' },
  ];

  // Quick Badge mapping (Pure HugeIcons, No Emojis)
  const getQuickBadge = () => {
    if (trader.quickTag === 'top') {
      return { label: 'Top Performer', icon: FireIcon, bg: 'bg-amber-400/10 text-amber-400 border-amber-400/30' };
    }
    if (trader.quickTag === 'low_risk' || trader.maxDrawdown <= 5) {
      return { label: 'Low Risk', icon: Shield01Icon, bg: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/30' };
    }
    if (trader.quickTag === 'high_freq' || trader.style === 'Scalping') {
      return { label: 'High Frequency', icon: FlashIcon, bg: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/30' };
    }
    if (trader.quickTag === 'bot' || trader.style === 'Algo Bot') {
      return { label: 'Bot Strategy', icon: CpuIcon, bg: 'bg-purple-400/10 text-purple-400 border-purple-400/30' };
    }
    return { label: 'Verified Master', icon: StarIcon, bg: 'bg-[#00E163]/10 text-[#00E163] border-[#00E163]/30' };
  };

  const quickBadge = getQuickBadge();
  const QuickBadgeIcon = quickBadge.icon;

  // Fallback asset allocations if empty
  const allocations = trader.assetAllocations && trader.assetAllocations.length > 0
    ? trader.assetAllocations
    : [
        { symbol: 'BTC/USDT', percent: 55, color: '#F7931A' },
        { symbol: 'ETH/USDT', percent: 25, color: '#627EEA' },
        { symbol: 'SOL/USDT', percent: 15, color: '#14F195' },
        { symbol: 'Lainnya', percent: 5, color: '#94A3B8' },
      ];

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#1F1E25] border border-white/10 shadow-2xl p-6 flex flex-col gap-5 overflow-hidden max-h-[92vh]">
        {/* Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00E163] to-transparent" />

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#26252E] border border-white/10 flex items-center justify-center font-black text-xl text-[#00E163] shadow-inner">
              {trader.avatar}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-black text-white font-heading">{trader.name}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${trader.badgeColor}`}>
                  {trader.badge}
                </span>
                <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${quickBadge.bg}`}>
                  <QuickBadgeIcon className="w-3 h-3" />
                  <span>{quickBadge.label}</span>
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-[#26252E] text-slate-300 text-[10px] font-bold">
                  {trader.style}
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-md line-clamp-1">{trader.bio}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#26252E] hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <Cancel01Icon className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Quick Stat Highlights */}
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-[#18171E] border border-white/5 flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold">30D ROI</span>
            <span className="text-base font-black text-[#00E163] font-mono-num">
              +{trader.roi30d}%
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#18171E] border border-white/5 flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold">Win Rate</span>
            <span className="text-base font-black text-[#00E163] font-mono-num">
              {trader.winRate}%
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#18171E] border border-white/5 flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold">Max Drawdown</span>
            <span className="text-base font-black text-[#FF5C77] font-mono-num">
              -{trader.maxDrawdown}%
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#18171E] border border-white/5 flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold">Copiers / AUM</span>
            <span className="text-base font-black text-white font-mono-num">
              {trader.copiers} <span className="text-[10px] text-slate-500 font-normal">(${ (trader.aum / 1000).toFixed(0) }k)</span>
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
          {[
            { id: 'overview', label: 'Ringkasan & Alokasi' },
            { id: 'positions', label: `Posisi Aktif (${openPositions.length})` },
            { id: 'history', label: 'Riwayat Transaksi' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#26252E] text-[#00E163] border border-white/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content (Box with Internal Scrollbar) */}
        <div className="max-h-[260px] overflow-y-auto custom-positions-scrollbar pr-1 flex flex-col gap-3">
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-3">
              {/* Strategy Bio */}
              <div className="p-3.5 rounded-2xl bg-[#18171E] border border-white/5 flex flex-col gap-1.5">
                <span className="text-xs font-bold text-white">Deskripsi Strategi & Manajemen Risiko</span>
                <p className="text-xs text-slate-300 leading-relaxed">{trader.bio}</p>
              </div>

              {/* Asset Allocation Breakdown (Binance / Bybit Standard) */}
              <div className="p-3.5 rounded-2xl bg-[#18171E] border border-white/5 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <PieChartIcon className="w-4 h-4 text-[#00E163]" />
                    <span>Distribusi Alokasi Aset Favorit</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono-num font-bold">Berdasarkan 90 Hari Terakhir</span>
                </div>

                {/* Multi-color Horizontal Progress Bar */}
                <div className="w-full h-3 rounded-full overflow-hidden flex bg-white/5">
                  {allocations.map((a, i) => (
                    <div
                      key={i}
                      style={{ width: `${a.percent}%`, backgroundColor: a.color }}
                      className="h-full transition-all duration-500"
                      title={`${a.symbol}: ${a.percent}%`}
                    />
                  ))}
                </div>

                {/* Legend List */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {allocations.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: a.color }} />
                      <span className="text-slate-300 font-bold font-mono-num">{a.symbol}</span>
                      <span className="text-[#00E163] font-black font-mono-num ml-auto">{a.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'positions' && (
            <div className="flex flex-col gap-2">
              {openPositions.map((pos, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-[#18171E] border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 rounded-md bg-[#00E163]/10 text-[#00E163] text-[10px] font-black font-mono-num">
                      {pos.type} {pos.leverage}
                    </span>
                    <span className="text-xs font-bold text-white font-mono-num">{pos.pair}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] text-slate-500">Entry / Mark</span>
                      <span className="text-xs font-bold text-slate-300 font-mono-num">
                        ${pos.entryPrice.toLocaleString()} / ${pos.markPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-xs font-black text-[#00E163] font-mono-num">{pos.pnl}</span>
                      <span className="text-[10px] font-bold text-[#00E163] font-mono-num">{pos.pnlPct}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="flex flex-col gap-2">
              {tradeHistory.map((th, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-[#18171E] border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black font-mono-num ${
                      th.type === 'LONG' ? 'bg-[#00E163]/10 text-[#00E163]' : 'bg-[#FF5C77]/10 text-[#FF5C77]'
                    }`}>
                      {th.type}
                    </span>
                    <span className="text-xs font-bold text-white font-mono-num">{th.pair}</span>
                    <span className="text-[10px] text-slate-500">{th.time}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold font-mono-num ${
                      th.pnl.startsWith('+') ? 'text-[#00E163]' : 'text-[#FF5C77]'
                    }`}>
                      {th.pnl} ({th.pnlPct})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-400">
              Profit Share: <strong className="text-white">{trader.profitShare}%</strong>
            </span>
            <span className="text-[10px] text-slate-500">
              Sisa Kuota: <strong className="text-[#00E163] font-mono-num">{trader.maxCopiers - trader.copiers} slot</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-[#26252E] hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer border border-white/5"
            >
              Tutup
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCopyModal(trader);
              }}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-[#00E163] hover:bg-[#00c957] text-black font-black text-xs shadow-md transition-colors cursor-pointer"
            >
              <Copy01Icon className="w-4 h-4" />
              <span>Salin Trader Ini</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
