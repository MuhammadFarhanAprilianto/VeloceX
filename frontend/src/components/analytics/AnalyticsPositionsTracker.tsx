'use client';

import React, { useState } from 'react';
import {
  InformationCircleIcon,
  Share01Icon,
  Settings01Icon,
  Cancel01Icon,
  Copy01Icon,
  Download01Icon,
  CheckmarkCircle01Icon,
} from 'hugeicons-react';
import { MarketIcon } from '@/components/MarketIcon';
import { useTradingStore } from '@/store/useTradingStore';
import { FuturesPosition } from '@/types/trading';
import { getAssetConfig } from '@/lib/assetConfig';

export const AnalyticsPositionsTracker: React.FC = () => {
  const { positions, updatePosition, closePosition, tickers, selectedSymbol, portfolio, setPortfolio } =
    useTradingStore();

  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Open, Pending, Cancelled');
  const [hideOtherPairs, setHideOtherPairs] = useState(false);

  // Modal States
  const [activeInfoPos, setActiveInfoPos] = useState<FuturesPosition | null>(null);
  const [activeSharePos, setActiveSharePos] = useState<FuturesPosition | null>(null);
  const [activeSettingsPos, setActiveSettingsPos] = useState<FuturesPosition | null>(null);
  const [activeClosePos, setActiveClosePos] = useState<FuturesPosition | null>(null);
  const [closePercent, setClosePercent] = useState<number>(100);

  // Settings Edit State
  const [editTpPrice, setEditTpPrice] = useState('');
  const [editSlPrice, setEditSlPrice] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleOpenSettings = (pos: FuturesPosition) => {
    setActiveSettingsPos(pos);
    setEditTpPrice(pos.tpPrice ? pos.tpPrice.toString() : '');
    setEditSlPrice(pos.slPrice ? pos.slPrice.toString() : '');
  };

  const handleSaveSettings = () => {
    if (!activeSettingsPos) return;
    updatePosition(activeSettingsPos.id, {
      tpPrice: parseFloat(editTpPrice) || undefined,
      slPrice: parseFloat(editSlPrice) || undefined,
    });
    setActiveSettingsPos(null);
    showToast(`TP/SL settings updated for ${activeSettingsPos.symbol}`);
  };

  const handleCopyCard = () => {
    setIsCopied(true);
    showToast('PnL Trading Card copied to clipboard!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleExecuteClose = () => {
    if (!activeClosePos) return;
    const liveTicker = tickers[activeClosePos.symbol];
    const assetCfg = getAssetConfig(activeClosePos.symbol);
    const curPrice = liveTicker?.price ?? activeClosePos.entryPrice ?? assetCfg.defaultPrice;
    const isLong = activeClosePos.type === 'Long';
    const priceDiff = isLong ? curPrice - activeClosePos.entryPrice : activeClosePos.entryPrice - curPrice;
    const sizeNum = parseFloat(activeClosePos.size) || 1;
    const totalPnl = priceDiff * sizeNum;
    const realizedPnl = (totalPnl * closePercent) / 100;

    if (closePercent === 100) {
      closePosition(activeClosePos.id);
      showToast(`Position ${activeClosePos.symbol} closed. Realized PnL: ${realizedPnl >= 0 ? '+' : ''}$${realizedPnl.toFixed(2)} USDT`);
    } else {
      const remainingSize = (sizeNum * (1 - closePercent / 100)).toFixed(2);
      updatePosition(activeClosePos.id, { size: remainingSize });
      showToast(`Closed ${closePercent}% of ${activeClosePos.symbol}. Realized PnL: ${realizedPnl >= 0 ? '+' : ''}$${realizedPnl.toFixed(2)} USDT`);
    }

    if (portfolio) {
      setPortfolio({
        ...portfolio,
        total_equity_usdt: portfolio.total_equity_usdt + realizedPnl,
        daily_pnl_usdt: portfolio.daily_pnl_usdt + realizedPnl,
      });
    }

    setActiveClosePos(null);
    setActiveInfoPos(null);
  };

  // Filter Positions
  const filteredPositions = positions.filter((pos) => {
    if (hideOtherPairs && pos.symbol !== selectedSymbol) return false;
    if (selectedFilter === 'Open Positions') return pos.status === 'Open';
    if (selectedFilter === 'Completed Orders') return pos.status === 'Completed';
    if (selectedFilter === 'Pending Orders') return pos.status === 'Pending';
    if (selectedFilter === 'Cancelled Orders') return pos.status === 'Cancelled';
    return true;
  });

  return (
    <div className="flex flex-col w-full bg-[#1F1E25] border border-white/5 rounded-3xl p-5 md:p-6 select-none transition-all gap-5 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 right-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-[#00E163] text-black font-bold text-xs rounded-xl shadow-2xl animate-fade-in">
          <CheckmarkCircle01Icon className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Top Filter Bar matching Gambar 2 */}
      <div className="flex items-center justify-between">
        {/* Dropdown Filter Pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#1B1A21] border border-white/5 text-xs text-slate-300 hover:text-white hover:border-white/15 transition-all cursor-pointer select-none"
          >
            <span className="font-normal text-slate-300">{selectedFilter}</span>
            <svg
              viewBox="0 0 10 6"
              className={`w-2 h-2 text-slate-400 fill-current transition-transform duration-200 ${
                filterDropdownOpen ? 'rotate-180 text-white' : ''
              }`}
            >
              <path d="M0 0 L10 0 L5 6 Z" />
            </svg>
          </button>

          {filterDropdownOpen && (
            <div className="absolute left-0 top-11 w-52 bg-[#26252E] border border-white/10 rounded-2xl shadow-2xl p-1.5 flex flex-col gap-1 z-50 backdrop-blur-xl">
              {[
                'Open, Pending, Cancelled',
                'Open Positions',
                'Pending Orders',
                'Completed Orders',
                'Cancelled Orders',
              ].map((filter) => {
                const isSelected = selectedFilter === filter;
                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => {
                      setSelectedFilter(filter);
                      setFilterDropdownOpen(false);
                    }}
                    className={`group relative flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-semibold overflow-hidden transition-colors duration-1000 cursor-pointer ${
                      isSelected
                        ? 'bg-[#00E163] text-black font-bold'
                        : 'text-slate-300 hover:text-black'
                    }`}
                  >
                    {!isSelected && (
                      <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                    )}
                    <span className="relative z-10 transition-colors duration-1000">{filter}</span>
                    {isSelected && <span className="relative z-10 text-[10px]">✓</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Hide Other Pairs Custom Checkbox */}
        <div
          onClick={() => setHideOtherPairs(!hideOtherPairs)}
          className="flex items-center gap-2.5 text-xs font-medium text-slate-400 hover:text-slate-200 cursor-pointer select-none group transition-colors"
        >
          <div
            className={`flex items-center justify-center w-4 h-4 rounded-[5px] transition-all ${
              hideOtherPairs
                ? 'bg-[#00E163] border border-[#00E163] shadow-[0_0_8px_rgba(0,225,99,0.4)]'
                : 'bg-transparent border border-white/20 group-hover:border-white/40'
            }`}
          >
            {hideOtherPairs && (
              <svg viewBox="0 0 12 12" className="w-3 h-3">
                <path
                  d="M2.5 6.5 L4.8 8.8 L9.5 3.2"
                  fill="none"
                  stroke="#000000"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <span className="text-slate-400 group-hover:text-slate-200 transition-colors">
            Hide Other Pairs
          </span>
        </div>
      </div>

      {/* 2. Position Cards List with Custom Neon-Green Scrollbar */}
      <div className="flex flex-col space-y-3.5 max-h-[360px] overflow-y-auto pr-2.5 custom-positions-scrollbar">
        {filteredPositions.map((pos) => {
          const liveTicker = tickers[pos.symbol];
          const assetCfg = getAssetConfig(pos.symbol);
          const curPrice = liveTicker?.price ?? pos.entryPrice ?? assetCfg.defaultPrice;
          const isLong = pos.type === 'Long';
          const priceDiff = isLong ? curPrice - pos.entryPrice : pos.entryPrice - curPrice;
          const sizeNum = parseFloat(pos.size) || 1;
          const pnlUsdVal = priceDiff * sizeNum;
          const pnlPctVal = (priceDiff / (pos.entryPrice || 1)) * 100 * (pos.leverage || 1);
          const isPnlPositive = pnlUsdVal >= 0;

          const tpPriceVal = pos.tpPrice || (isLong ? pos.entryPrice * 1.075 : pos.entryPrice * 0.925);
          const slPriceVal = pos.slPrice || (isLong ? pos.entryPrice * 0.971 : pos.entryPrice * 1.029);

          const tpPctStr = `(+${Math.abs(((tpPriceVal - pos.entryPrice) / pos.entryPrice) * 100).toFixed(1)}%)`;
          const slPctStr = `(-${Math.abs(((pos.entryPrice - slPriceVal) / pos.entryPrice) * 100).toFixed(1)}%)`;

          return (
            <div
              key={pos.id}
              className="relative flex items-center justify-between p-5 md:p-6 bg-[#26252E] border border-white/5 rounded-3xl gap-6 hover:border-white/15 transition-all group overflow-hidden shadow-sm"
            >
              {/* LEFT SECTION: Asset Logo + Pair + Status + 4 Stats Grid */}
              <div className="flex flex-col gap-3 min-w-[320px]">
                {/* Top Row: Asset Icon + Pair Name + Status Badge */}
                <div className="flex items-center gap-3">
                  <MarketIcon symbol={pos.symbol} size="sm" />
                  <span className="font-black text-white text-sm font-heading tracking-wide">
                    {pos.symbol.replace('USDT', '-USDT')}
                  </span>
                  <span
                    className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide ${
                      pos.status === 'Completed'
                        ? 'bg-[#00E163]/15 text-[#00E163] border border-[#00E163]/30'
                        : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                    }`}
                  >
                    {pos.status}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 font-mono-num text-slate-400 font-bold">
                    {pos.leverage}x
                  </span>
                </div>

                {/* Bottom Row: 4 Metric Columns (Type, Size, Entry Price, Margin Usage) */}
                <div className="grid grid-cols-4 gap-4 font-mono-num">
                  {/* Type */}
                  <div className="flex flex-col">
                    <span className="text-[10px] font-sans font-medium text-slate-500">Type</span>
                    <span
                      className={`text-xs font-black ${
                        pos.type === 'Long' ? 'text-[#00E163]' : 'text-[#FF5C77]'
                      }`}
                    >
                      {pos.type}
                    </span>
                  </div>

                  {/* Size */}
                  <div className="flex flex-col">
                    <span className="text-[10px] font-sans font-medium text-slate-500">
                      Size ({pos.sizeUnit})
                    </span>
                    <span className="text-xs font-extrabold text-white">{pos.size}</span>
                  </div>

                  {/* Entry Price */}
                  <div className="flex flex-col">
                    <span className="text-[10px] font-sans font-medium text-slate-500">Entry Price</span>
                    <span className="text-xs font-extrabold text-slate-200">
                      ${pos.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Margin Usage */}
                  <div className="flex flex-col">
                    <span className="text-[10px] font-sans font-medium text-slate-500">
                      Margin Usage
                    </span>
                    <span className="text-xs font-extrabold text-slate-200">{pos.marginUsage}</span>
                  </div>
                </div>
              </div>

              {/* MIDDLE SECTION: Dynamic Visual TP / SL Range Progress Bar */}
              <div className="flex flex-col flex-1 max-w-sm px-4">
                {/* Top Numbers Row */}
                <div className="flex items-center justify-between text-xs font-mono-num mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500 font-semibold">{slPctStr}</span>
                    <span className="font-black text-white text-xs">
                      ${slPriceVal.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <span className="font-black text-[#00E163] text-xs">
                    ${curPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500 font-semibold">{tpPctStr}</span>
                    <span className="font-black text-white text-xs">
                      ${tpPriceVal.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>

                {/* Visual Dynamic Range Bar */}
                <div className="relative w-full h-[3px] bg-[#2D2C35] rounded-full my-2">
                  <div
                    className="absolute left-0 h-[3px] rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.max(10, ((curPrice - slPriceVal) / (tpPriceVal - slPriceVal || 1)) * 100))}%`,
                      backgroundColor: isPnlPositive ? '#00E163' : '#FF5C77',
                      boxShadow: isPnlPositive ? '0 0 8px rgba(0,225,99,0.5)' : '0 0 8px rgba(255,92,119,0.5)',
                    }}
                  />
                </div>

                {/* Bottom Status Labels Row */}
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-500 tracking-wider">SL 1/2</span>
                  <div className="flex items-center gap-1.5 font-mono-num text-xs">
                    <span className="text-slate-500 font-sans">PNL</span>
                    <span className={`font-black ${isPnlPositive ? 'text-[#00E163]' : 'text-[#FF5C77]'}`}>
                      {isPnlPositive ? '+' : ''}${pnlUsdVal.toFixed(2)} USDT
                    </span>
                    <span className={`font-extrabold ${isPnlPositive ? 'text-[#00E163]' : 'text-[#FF5C77]'}`}>
                      ({isPnlPositive ? '+' : ''}{pnlPctVal.toFixed(2)}%)
                    </span>
                  </div>
                  <span className="text-slate-500 tracking-wider">TP 1/2</span>
                </div>
              </div>

              {/* RIGHT SECTION: Vertically Stacked Action Icons */}
              <div className="flex flex-col items-center justify-center gap-2 text-slate-400 pl-2">
                {/* 1. Information Button */}
                <button
                  type="button"
                  onClick={() => setActiveInfoPos(pos)}
                  className="flex items-center justify-center w-8 h-8 rounded-xl bg-transparent hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                  title="Position Information & Details"
                >
                  <InformationCircleIcon className="w-4 h-4" />
                </button>

                {/* 2. Share PnL Card Button */}
                <button
                  type="button"
                  onClick={() => setActiveSharePos(pos)}
                  className="flex items-center justify-center w-8 h-8 rounded-xl bg-transparent hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                  title="Share Position PnL Card"
                >
                  <Share01Icon className="w-4 h-4" />
                </button>

                {/* 3. Settings / TP-SL Button */}
                <button
                  type="button"
                  onClick={() => handleOpenSettings(pos)}
                  className="flex items-center justify-center w-8 h-8 rounded-xl bg-transparent hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                  title="Adjust TP / SL & Position Settings"
                >
                  <Settings01Icon className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredPositions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-xs">
            <span>Tidak ada posisi aktif saat ini.</span>
          </div>
        )}
      </div>

      {/* MODAL 1: Position Information & Partial Close Modal */}
      {activeInfoPos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="flex flex-col w-full max-w-md bg-[#1F1E25] border border-white/10 rounded-3xl p-6 shadow-2xl gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-3">
                <MarketIcon symbol={activeInfoPos.symbol} size="sm" />
                <div className="flex flex-col">
                  <span className="font-extrabold text-white text-sm font-heading">
                    {activeInfoPos.symbol.replace('USDT', '-USDT')} Position Details
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono-num">
                    ID: {activeInfoPos.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveInfoPos(null)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <Cancel01Icon className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono-num">
              <div className="p-3 rounded-2xl bg-[#26252E] border border-white/5">
                <span className="text-[10px] text-slate-400 font-sans block mb-0.5">Position Size</span>
                <span className="font-black text-white text-sm">
                  {activeInfoPos.size} {activeInfoPos.sizeUnit}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#26252E] border border-white/5">
                <span className="text-[10px] text-slate-400 font-sans block mb-0.5">Entry Price</span>
                <span className="font-black text-white text-sm">
                  ${activeInfoPos.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#26252E] border border-white/5">
                <span className="text-[10px] text-slate-400 font-sans block mb-0.5">Leverage</span>
                <span className="font-black text-[#00E163] text-sm">{activeInfoPos.leverage}x</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#26252E] border border-white/5">
                <span className="text-[10px] text-slate-400 font-sans block mb-0.5">Margin Usage</span>
                <span className="font-black text-white text-sm">{activeInfoPos.marginUsage}</span>
              </div>
            </div>

            {/* Partial Close Slider */}
            <div className="flex flex-col p-3 rounded-2xl bg-[#26252E] border border-white/5 gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Close Amount:</span>
                <span className="font-bold text-[#00E163] font-mono-num">{closePercent}%</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setClosePercent(pct)}
                    className={`py-1 rounded-lg text-[10px] font-bold font-mono-num transition-all ${
                      closePercent === pct
                        ? 'bg-[#00E163] text-black shadow-sm'
                        : 'bg-[#1B1A21] text-slate-400 hover:text-white'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveClosePos(activeInfoPos);
                  handleExecuteClose();
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#362227] hover:bg-[#4a2e35] text-[#FF5C77] font-bold text-xs border border-[#FF5C77]/30 transition-colors"
              >
                Confirm Close ({closePercent}%)
              </button>
              <button
                type="button"
                onClick={() => setActiveInfoPos(null)}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Share PnL Card Modal */}
      {activeSharePos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="flex flex-col w-full max-w-sm bg-[#1F1E25] border border-white/10 rounded-3xl p-6 shadow-2xl gap-5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-white text-xs font-heading tracking-wide uppercase">
                Share PnL Trading Card
              </span>
              <button
                onClick={() => setActiveSharePos(null)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <Cancel01Icon className="w-4 h-4" />
              </button>
            </div>

            {/* Poster Card */}
            <div className="relative flex flex-col p-5 bg-gradient-to-br from-[#18171E] to-[#26252E] border border-white/10 rounded-2xl shadow-xl overflow-hidden font-mono-num">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MarketIcon symbol={activeSharePos.symbol} size="sm" />
                  <span className="font-black text-white text-xs tracking-wide">
                    {activeSharePos.symbol.replace('USDT', '-USDT')}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                    activeSharePos.type === 'Long'
                      ? 'bg-[#00E163]/20 text-[#00E163]'
                      : 'bg-[#FF5C77]/20 text-[#FF5C77]'
                  }`}
                >
                  {activeSharePos.type.toUpperCase()} {activeSharePos.leverage}X
                </span>
              </div>

              <span className="text-[10px] text-slate-400 font-sans block mb-1">
                Return on Investment (ROI)
              </span>
              <span className="text-3xl font-black mb-4 tracking-tight text-[#00E163]">
                +32.8%
              </span>

              <div className="flex justify-between items-center text-[11px] pt-3 border-t border-white/5 text-slate-300">
                <div>
                  <span className="text-[9px] text-slate-500 font-sans block">Entry Price</span>
                  <span className="font-bold text-white">
                    ${activeSharePos.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-500 font-sans block">Last Price</span>
                  <span className="font-bold text-white">
                    ${(tickers[activeSharePos.symbol]?.price ?? activeSharePos.entryPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 pt-2 text-[9px] text-slate-500 font-sans">
                <span>VeloceX Trading Terminal</span>
                <span className="text-slate-400">velocex.trade</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyCard}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#00E163] text-black font-extrabold text-xs shadow-lg shadow-[#00E163]/20 hover:brightness-110 transition-all cursor-pointer"
              >
                {isCopied ? <CheckmarkCircle01Icon className="w-4 h-4" /> : <Copy01Icon className="w-4 h-4" />}
                <span>{isCopied ? 'Copied!' : 'Copy Poster'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('Trading card image downloaded!');
                  setActiveSharePos(null);
                }}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#26252E] hover:bg-white/10 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                <Download01Icon className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Adjust TP / SL & Position Settings */}
      {activeSettingsPos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="flex flex-col w-full max-w-sm bg-[#1F1E25] border border-white/10 rounded-3xl p-6 shadow-2xl gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <span className="font-extrabold text-white text-xs font-heading tracking-wide">
                Adjust TP / SL — {activeSettingsPos.symbol.replace('USDT', '-USDT')}
              </span>
              <button
                onClick={() => setActiveSettingsPos(null)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <Cancel01Icon className="w-4 h-4" />
              </button>
            </div>

            {/* Take Profit Setting */}
            <div>
              <label className="block text-[11px] text-slate-400 font-medium mb-1.5">
                Take Profit (TP) Trigger Price
              </label>
              <div className="flex items-center justify-between h-10 px-3 rounded-xl bg-[#26252E] border border-white/5 focus-within:border-[#00E163]/40 transition-colors">
                <input
                  type="text"
                  value={editTpPrice}
                  onChange={(e) => setEditTpPrice(e.target.value)}
                  className="flex-1 text-xs font-bold text-white font-mono-num bg-transparent focus:outline-none"
                  placeholder="e.g. 3400"
                />
                <span className="text-xs font-bold text-[#00E163] font-mono-num">USDT</span>
              </div>
            </div>

            {/* Stop Loss Setting */}
            <div>
              <label className="block text-[11px] text-slate-400 font-medium mb-1.5">
                Stop Loss (SL) Trigger Price
              </label>
              <div className="flex items-center justify-between h-10 px-3 rounded-xl bg-[#26252E] border border-white/5 focus-within:border-[#FF5C77]/40 transition-colors">
                <input
                  type="text"
                  value={editSlPrice}
                  onChange={(e) => setEditSlPrice(e.target.value)}
                  className="flex-1 text-xs font-bold text-white font-mono-num bg-transparent focus:outline-none"
                  placeholder="e.g. 3100"
                />
                <span className="text-xs font-bold text-[#FF5C77] font-mono-num">USDT</span>
              </div>
            </div>

            {/* Confirm Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleSaveSettings}
                className="flex-1 py-2.5 rounded-xl bg-[#00E163] hover:brightness-110 text-black font-extrabold text-xs shadow-lg shadow-[#00E163]/20 transition-all cursor-pointer"
              >
                Confirm Changes
              </button>
              <button
                type="button"
                onClick={() => setActiveSettingsPos(null)}
                className="px-4 py-2.5 rounded-xl bg-[#26252E] hover:bg-white/10 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
