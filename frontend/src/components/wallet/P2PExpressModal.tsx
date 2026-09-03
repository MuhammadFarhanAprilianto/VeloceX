'use client';

import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Cancel01Icon,
  CreditCardIcon,
  Shield01Icon,
  Tick01Icon,
  Search01Icon,
  CheckmarkCircle01Icon,
  UserIcon,
  FlashIcon,
  Coins01Icon,
  SparklesIcon,
  ArrowRight01Icon,
} from 'hugeicons-react';
import { MarketIcon } from '@/components/MarketIcon';

interface P2PExpressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpressSuccess: (type: 'BUY' | 'SELL', fiatAmount: number, cryptoAmount: number, method: string) => void;
}

interface P2PMerchant {
  id: string;
  name: string;
  avatar: string;
  ordersCount: number;
  completionRate: number;
  pricePerUsdt: number;
  minLimitIdr: number;
  maxLimitIdr: number;
  paymentMethods: string[];
  isVerified: boolean;
}

const PAYMENT_METHODS = [
  { id: 'bca', name: 'Bank Central Asia (BCA)', type: 'Bank Transfer', fee: '0.00%', time: 'Instant (~1 min)' },
  { id: 'mandiri', name: 'Bank Mandiri (Livin)', type: 'Bank Transfer', fee: '0.00%', time: 'Instant (~2 mins)' },
  { id: 'bri', name: 'Bank BRI (BRImo)', type: 'Bank Transfer', fee: '0.00%', time: 'Instant (~2 mins)' },
  { id: 'qris', name: 'QRIS / ShopeePay / GoPay', type: 'E-Wallet', fee: '0.00%', time: 'Instant (~30 secs)' },
  { id: 'dana', name: 'DANA Digital Wallet', type: 'E-Wallet', fee: '0.00%', time: 'Instant (~1 min)' },
  { id: 'ovo', name: 'OVO Cash', type: 'E-Wallet', fee: '0.00%', time: 'Instant (~1 min)' },
];

const VERIFIED_MERCHANTS: P2PMerchant[] = [
  {
    id: 'm-1',
    name: 'IndoCrypto Express VIP',
    avatar: 'IC',
    ordersCount: 2450,
    completionRate: 99.8,
    pricePerUsdt: 15800,
    minLimitIdr: 100000,
    maxLimitIdr: 50000000,
    paymentMethods: ['BCA', 'Mandiri', 'QRIS', 'DANA'],
    isVerified: true,
  },
  {
    id: 'm-2',
    name: 'BCA FastPay Trader',
    avatar: 'BF',
    ordersCount: 1890,
    completionRate: 100.0,
    pricePerUsdt: 15810,
    minLimitIdr: 500000,
    maxLimitIdr: 100000000,
    paymentMethods: ['BCA', 'QRIS'],
    isVerified: true,
  },
  {
    id: 'm-3',
    name: 'Mandiri Sultan Escrow',
    avatar: 'MS',
    ordersCount: 3120,
    completionRate: 99.6,
    pricePerUsdt: 15820,
    minLimitIdr: 250000,
    maxLimitIdr: 75000000,
    paymentMethods: ['Mandiri', 'BRI', 'DANA', 'OVO'],
    isVerified: true,
  },
];

export const P2PExpressModal: React.FC<P2PExpressModalProps> = ({
  isOpen,
  onClose,
  onExpressSuccess,
}) => {
  const [viewMode, setViewMode] = useState<'express' | 'merchants'>('express');
  const [activeTab, setActiveTab] = useState<'BUY' | 'SELL'>('BUY');
  const [fiatAmount, setFiatAmount] = useState('1000000'); // 1 Juta IDR default
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS[0]);
  const [selectedMerchant, setSelectedMerchant] = useState<P2PMerchant>(VERIFIED_MERCHANTS[0]);
  const [p2pPhase, setP2pPhase] = useState<'idle' | 'progress' | 'checkmark_center' | 'checkmark_shift' | 'success_revealed'>('idle');

  // Exchange rate: 1 USDT = 15,800 IDR
  const USDT_RATE = selectedMerchant?.pricePerUsdt || 15800;
  const parsedFiat = parseFloat(fiatAmount) || 0;

  const cryptoAmount = useMemo(() => {
    if (parsedFiat <= 0) return 0;
    return parsedFiat / USDT_RATE;
  }, [parsedFiat, USDT_RATE]);

  const handleQuickAmount = (amt: number) => {
    setFiatAmount(amt.toString());
  };

  const handleExpressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (p2pPhase !== 'idle' || parsedFiat <= 0 || cryptoAmount <= 0) return;

    // Langkah 1: Loading Progress Bar Hijau dari Kiri ke Kanan (700ms)
    setP2pPhase('progress');

    // Langkah 2: Setelah Full Hijau -> Centang Pop di Rata Tengah (Center)
    setTimeout(() => {
      setP2pPhase('checkmark_center');

      // Jeda 1 detik (1000ms) lalu geser ke kiri
      setTimeout(() => {
        setP2pPhase('checkmark_shift');

        // Langkah 3: Teks Success muncul dari burem (blur) ke jelas (sharp)
        setTimeout(() => {
          setP2pPhase('success_revealed');

          // Langkah 4: Jeda 2 detik (2000ms) langsung tutup modal & kembali ke Wallet
          setTimeout(() => {
            onExpressSuccess(activeTab, parsedFiat, cryptoAmount, selectedMethod.name);
            setP2pPhase('idle');
            onClose();
          }, 2000);
        }, 150);
      }, 1000);
    }, 700);
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in font-sans">
      <div className="flex flex-col w-full max-w-lg bg-[#1F1E25] border border-white/10 rounded-3xl p-6 shadow-2xl gap-4 select-none max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#00E163]/15 text-[#00E163]">
              <CreditCardIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-base font-heading">
                P2P &amp; Fiat Express Escrow Hub
              </span>
              <span className="text-xs text-slate-400">
                Beli / Jual USDT dengan Rupiah (BCA, Mandiri, QRIS, DANA) 0% Fee
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

        {/* View Mode Switcher (Express vs Verified Merchants) */}
        <div className="flex items-center p-1 rounded-2xl bg-[#18171E] border border-white/5 text-xs font-bold flex-shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('express')}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              viewMode === 'express' ? 'bg-[#00E163] text-black font-black shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            P2P Express (Instan Otomatis)
          </button>
          <button
            type="button"
            onClick={() => setViewMode('merchants')}
            className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
              viewMode === 'merchants' ? 'bg-[#00E163] text-black font-black shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Katalog Merchant Terverifikasi ({VERIFIED_MERCHANTS.length})
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="p2p-form" onSubmit={handleExpressSubmit} className="flex flex-col gap-3.5 overflow-y-auto pr-1.5 custom-positions-scrollbar flex-1">
          {/* Buy / Sell Tabs */}
          <div className="flex items-center p-1 rounded-2xl bg-[#26252E] border border-white/5 text-xs font-bold flex-shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('BUY')}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'BUY'
                  ? 'bg-[#00E163] text-black font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Beli USDT (Buy)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('SELL')}
              className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'SELL'
                  ? 'bg-[#FF5C77] text-white font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Jual USDT (Sell)
            </button>
          </div>

          {/* VIEW MODE 1: P2P EXPRESS */}
          {viewMode === 'express' && (
            <>
              {/* Fiat Input (IDR) */}
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-300">
                    {activeTab === 'BUY' ? 'Saya Mau Bayar (IDR)' : 'Saya Mau Terima (IDR)'}
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Kurs: 1 USDT = Rp {USDT_RATE.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="relative flex items-center justify-between h-12 px-3.5 rounded-2xl bg-[#26252E] border border-white/5 focus-within:border-[#00E163]/50 transition-colors">
                  <span className="text-xs font-mono font-bold text-slate-400 pr-2">Rp</span>
                  <input
                    type="number"
                    step="10000"
                    value={fiatAmount}
                    onChange={(e) => setFiatAmount(e.target.value)}
                    placeholder="1,000,000"
                    className="w-full text-sm font-mono font-black text-white bg-transparent focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleQuickAmount(10000000)}
                    className="text-[10px] font-bold text-[#00E163] hover:underline cursor-pointer flex-shrink-0"
                  >
                    10 Jt
                  </button>
                </div>

                {/* Quick Fiat Chips with 1000ms Sweep */}
                <div className="grid grid-cols-4 gap-1.5 mt-0.5">
                  {[250000, 500000, 1000000, 5000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleQuickAmount(amt)}
                      className="group relative py-1 rounded-xl bg-[#26252E] border border-white/5 overflow-hidden text-[10px] font-bold text-slate-400 hover:text-black font-mono transition-colors duration-1000 cursor-pointer text-center"
                    >
                      <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                      <span className="relative z-10 transition-colors duration-1000">
                        Rp {(amt / 1000).toLocaleString('id-ID')}k
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Crypto Output (USDT) */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#18171E] border border-white/5 flex-shrink-0">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400">
                    {activeTab === 'BUY' ? 'Estimasi Diterima' : 'Estimasi Dikeluarkan'}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black font-mono-num text-[#00E163]">
                      {cryptoAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs font-bold text-white">USDT</span>
                  </div>
                </div>
                <MarketIcon symbol="USDT" size="md" />
              </div>

              {/* Payment Method Selector */}
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <span className="text-xs font-bold text-slate-400">Pilih Saluran Pembayaran Terverifikasi</span>
                <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto custom-positions-scrollbar pr-1">
                  {PAYMENT_METHODS.map((method) => {
                    const isSelected = selectedMethod.id === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSelectedMethod(method)}
                        className={`flex items-center justify-between p-2.5 rounded-2xl border text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#26252E] border-[#00E163] text-white shadow-sm'
                            : 'bg-[#18171E] border-white/5 text-slate-400 hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-[#00E163] bg-[#00E163]' : 'border-white/20'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                          </div>
                          <span className="font-bold text-white">{method.name}</span>
                        </div>
                        <span className="text-[10px] text-[#00E163] font-bold">{method.time}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* VIEW MODE 2: VERIFIED MERCHANTS LIST */}
          {viewMode === 'merchants' && (
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-bold text-slate-400">Pilih Merchant Escrow P2P Terpercaya:</span>
              <div className="flex flex-col gap-2">
                {VERIFIED_MERCHANTS.map((m) => {
                  const isChosen = selectedMerchant.id === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMerchant(m)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                        isChosen
                          ? 'bg-[#26252E] border-[#00E163] shadow-md shadow-[#00E163]/10'
                          : 'bg-[#18171E] border-white/5 hover:border-white/15'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#00E163]/20 text-[#00E163] font-black text-xs flex items-center justify-center">
                            {m.avatar}
                          </div>
                          <span className="font-extrabold text-white text-xs">{m.name}</span>
                          <span className="px-1.5 py-0.2 rounded bg-[#00E163]/15 text-[#00E163] text-[9px] font-bold">
                            Pro Merchant
                          </span>
                        </div>
                        <span className="text-xs font-black font-mono-num text-[#00E163]">
                          Rp {m.pricePerUsdt.toLocaleString('id-ID')} / USDT
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono-num">
                        <span>{m.ordersCount} Order ({m.completionRate}% Selesai)</span>
                        <span>Limit: Rp {(m.minLimitIdr / 1000).toLocaleString()}k - {(m.maxLimitIdr / 1000000).toLocaleString()}Jt</span>
                      </div>

                      <div className="flex flex-wrap gap-1 pt-1 border-t border-white/5">
                        {m.paymentMethods.map((pm) => (
                          <span key={pm} className="px-2 py-0.5 rounded-md bg-white/5 text-[9px] font-bold text-slate-300">
                            {pm}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Escrow Shield Badge */}
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#14131A] border border-white/5 text-xs text-slate-400 flex-shrink-0">
            <Shield01Icon className="w-4 h-4 text-[#00E163] shrink-0" />
            <span>Escrow Terproteksi: Dana kripto penjual dikunci otomatis 100% oleh sistem VeloceX hingga dana rupiah diterima.</span>
          </div>
        </form>

        {/* Action Button with 4-Step Animated Flow */}
        <div className="flex flex-col pt-2 border-t border-white/5 flex-shrink-0">
          <button
            type="submit"
            form="p2p-form"
            disabled={p2pPhase !== 'idle'}
            className="relative w-full h-12 rounded-2xl overflow-hidden font-black text-xs transition-all duration-300 cursor-pointer flex-shrink-0 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white select-none shadow-lg border border-white/5 group"
          >
            {/* 1. Green Progress Fill from Left to Right */}
            <div
              className={`absolute left-0 top-0 bottom-0 bg-[#00E163] shadow-lg shadow-[#00E163]/30 transition-all ease-out pointer-events-none ${
                p2pPhase === 'idle'
                  ? 'w-0'
                  : 'w-full duration-700'
              }`}
            />

            {/* Initial Idle Text */}
            {p2pPhase === 'idle' && (
              <span className="relative z-10 transition-opacity duration-300 text-white group-hover:text-white uppercase tracking-wider text-xs font-black">
                {activeTab === 'BUY'
                  ? `Beli ${cryptoAmount.toFixed(2)} USDT Sekarang (Escrow)`
                  : `Jual ${cryptoAmount.toFixed(2)} USDT Sekarang (Escrow)`}
              </span>
            )}

            {/* Step 1: While filling progress bar */}
            {p2pPhase === 'progress' && (
              <span className="relative z-10 text-black font-black tracking-wider text-xs animate-pulse">
                Memproses Pesanan Escrow P2P...
              </span>
            )}

            {/* Step 2 & 3: Centered Checkmark & Success Text Motion */}
            {(p2pPhase === 'checkmark_center' || p2pPhase === 'checkmark_shift' || p2pPhase === 'success_revealed') && (
              <div className="relative z-10 flex items-center justify-center gap-2.5">
                <div
                  className={`transition-all duration-500 ease-out flex items-center justify-center ${
                    p2pPhase === 'checkmark_center'
                      ? 'scale-110 translate-x-0'
                      : 'scale-100'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center shadow-md animate-in zoom-in duration-300">
                    <Tick01Icon className="w-4 h-4 text-[#00E163] stroke-[3.5]" />
                  </div>
                </div>

                <div
                  className={`transition-all duration-500 ease-out ${
                    p2pPhase === 'success_revealed'
                      ? 'opacity-100 blur-0 translate-x-0 max-w-[220px]'
                      : 'opacity-0 blur-sm -translate-x-3 max-w-0 overflow-hidden'
                  }`}
                >
                  <span className="font-black text-black text-xs tracking-wider uppercase whitespace-nowrap">
                    P2P Order Aktif
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
