'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search01Icon,
  Notification01Icon,
  Wallet01Icon,
  ArrowDown01Icon,
  Tick01Icon,
  Copy01Icon,
  UserIcon,
  Logout01Icon,
  Settings01Icon,
  Cancel01Icon,
  CreditCardAddIcon,
  MoreHorizontalIcon,
  ComputerIcon,
  CreditCardIcon,
  Clock01Icon,
  CheckmarkCircle02Icon,
  TradeUpIcon,
  FlashIcon,
  Shield01Icon,
  Coins01Icon,
  SparklesIcon,
} from 'hugeicons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTradingStore } from '@/store/useTradingStore';
import { useAuthStore } from '@/store/useAuthStore';
import { MarketIcon } from '@/components/MarketIcon';

interface TradeflareHeaderProps {
  onOpenAuthModal?: () => void;
}

interface NotificationItem {
  id: string;
  category: 'All' | 'Signals' | 'Orders' | 'System' | 'Whales';
  title: string;
  desc: string;
  time: string;
  type: 'signal' | 'order' | 'system' | 'whale';
  hasActionBtn?: boolean;
  actionBtnLabel?: string;
  unread: boolean;
}

const AVAILABLE_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1.0 },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', rate: 15800 },
  { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 154.5 },
];

const SEARCHABLE_PAIRS = [
  // Forex
  { pair: 'EURUSD', name: 'EUR / USD', symbol: 'EURUSD', category: 'Forex', price: '1.0842' },
  { pair: 'GBPUSD', name: 'GBP / USD', symbol: 'GBPUSD', category: 'Forex', price: '1.2915' },
  { pair: 'USDJPY', name: 'USD / JPY', symbol: 'USDJPY', category: 'Forex', price: '¥154.60' },
  { pair: 'AUDUSD', name: 'AUD / USD', symbol: 'AUDUSD', category: 'Forex', price: '0.6580' },
  { pair: 'USDCAD', name: 'USD / CAD', symbol: 'USDCAD', category: 'Forex', price: '1.3820' },
  { pair: 'USDCHF', name: 'USD / CHF', symbol: 'USDCHF', category: 'Forex', price: '0.8840' },
  // CFD
  { pair: 'XAUUSD', name: 'Gold (Emas)', symbol: 'XAUUSD', category: 'CFD', price: '$2,514.80' },
  { pair: 'XAGUSD', name: 'Silver (Perak)', symbol: 'XAGUSD', category: 'CFD', price: '$29.45' },
  { pair: 'USOIL', name: 'Crude Oil WTI', symbol: 'USOIL', category: 'CFD', price: '$74.60' },
  { pair: 'SPX500', name: 'S&P 500 Index', symbol: 'SPX500', category: 'CFD', price: '$5,648.40' },
  { pair: 'NAS100', name: 'Nasdaq 100', symbol: 'NAS100', category: 'CFD', price: '$19,720.50' },
  { pair: 'US30', name: 'Dow Jones 30', symbol: 'US30', category: 'CFD', price: '$41,250.00' },
  // Crypto
  { pair: 'BTCUSDT', name: 'Bitcoin', symbol: 'BTC', category: 'Kripto', price: '$75,368.45' },
  { pair: 'ETHUSDT', name: 'Ethereum', symbol: 'ETH', category: 'Kripto', price: '$4,149.74' },
  { pair: 'SOLUSDT', name: 'Solana', symbol: 'SOL', category: 'Kripto', price: '$175.03' },
  { pair: 'LTCUSDT', name: 'Litecoin', symbol: 'LTC', category: 'Kripto', price: '$94.92' },
  { pair: 'BNBUSDT', name: 'Binance Coin', symbol: 'BNB', category: 'Kripto', price: '$614.35' },
  { pair: 'ADAUSDT', name: 'Cardano', symbol: 'ADA', category: 'Kripto', price: '$0.56' },
];

export const TradeflareHeader: React.FC<TradeflareHeaderProps> = ({ onOpenAuthModal }) => {
  const { portfolio, selectedSymbol, setSelectedSymbol } = useTradingStore();
  const { user, isAuthenticated, logout } = useAuthStore();

  // Dropdown & Hover States
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchHovered, setIsSearchHovered] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Notification tab & detail state
  const [activeNotifTab, setActiveNotifTab] = useState<'All' | 'Signals' | 'Orders' | 'System' | 'Whales'>('All');
  const [activeMenuNotifId, setActiveMenuNotifId] = useState<string | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  const [selectedCurrency, setSelectedCurrency] = useState(AVAILABLE_CURRENCIES[0]);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      category: 'Signals',
      title: 'Sinyal Breakout: BTC/USDT Bullish',
      desc: 'Indikator RSI & MACD 4H mengonfirmasi momentum breakout menembus resistance $75,500.',
      time: '2m lalu',
      type: 'signal',
      hasActionBtn: true,
      actionBtnLabel: 'Buka Grafik BTC',
      unread: true,
    },
    {
      id: '2',
      category: 'Orders',
      title: 'Order Limit Beli Berhasil Dipenuhi',
      desc: 'Order beli 0.25 BTC pada harga $74,800.00 telah dieksekusi 100% oleh Matching Engine.',
      time: '8m lalu',
      type: 'order',
      hasActionBtn: true,
      actionBtnLabel: 'Lihat Riwayat Order',
      unread: true,
    },
    {
      id: '3',
      category: 'Whales',
      title: 'Whale Alert: 4,500 BTC Terdeteksi',
      desc: 'Perpindahan volume besar $338,400,000 USDT dari Cold Storage ke Liquidity Pool VeloceX.',
      time: '15m lalu',
      type: 'whale',
      unread: true,
    },
    {
      id: '4',
      category: 'System',
      title: 'Setoran USDT TRC20 Diterima',
      desc: 'Deposit $2,500.00 USDT telah selesai dikonfirmasi jaringan dan masuk ke Dompet Spot.',
      time: '35m lalu',
      type: 'system',
      unread: false,
    },
    {
      id: '5',
      category: 'Signals',
      title: 'Gold XAU/USD Momentum Trend',
      desc: 'Emas Spot menembus level tertinggi $2,520.00 didorong oleh volume pembeli institusi.',
      time: '1j lalu',
      type: 'signal',
      hasActionBtn: true,
      actionBtnLabel: 'Trade Gold',
      unread: false,
    },
    {
      id: '6',
      category: 'System',
      title: 'Proteksi Google 2FA Diperbarui',
      desc: 'Otentikasi dua faktor perangkat Windows Anda berhasil diverifikasi dengan aman.',
      time: 'Kemarin',
      type: 'system',
      unread: false,
    },
  ]);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notifContainerRef = useRef<HTMLDivElement>(null);
  const walletContainerRef = useRef<HTMLDivElement>(null);
  const currencyContainerRef = useRef<HTMLDivElement>(null);
  const profileContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) {
        setIsSearchOpen(false);
      }
      if (notifContainerRef.current && !notifContainerRef.current.contains(target)) {
        setIsNotificationOpen(false);
        setActiveMenuNotifId(null);
      }
      if (walletContainerRef.current && !walletContainerRef.current.contains(target)) {
        setIsWalletOpen(false);
      }
      if (currencyContainerRef.current && !currencyContainerRef.current.contains(target)) {
        setIsCurrencyOpen(false);
      }
      if (profileContainerRef.current && !profileContainerRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsNotificationOpen(false);
        setIsWalletOpen(false);
        setIsCurrencyOpen(false);
        setIsProfileOpen(false);
        setActiveMenuNotifId(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const totalEquityUSD = portfolio?.total_equity_usdt ?? 0.0;
  const convertedTotalEquity = totalEquityUSD * selectedCurrency.rate;
  const displayName = user?.name || 'Farhan';
  const displayAddress = '0x4cB652...cdKF';

  const unreadCount = notifications.filter((n) => n.unread).length;

  const filteredPairs = SEARCHABLE_PAIRS.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.pair.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredNotifications = notifications.filter((item) => {
    if (activeNotifTab === 'All') return true;
    return item.category === activeNotifTab;
  });

  const handleCopyAddress = () => {
    navigator.clipboard.writeText('0x4cB65293A7b4200B9cde479cdKF');
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleSnooze = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setActiveMenuNotifId(null);
  };

  const handleResolve = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
    setActiveMenuNotifId(null);
  };

  return (
    <header className="relative flex items-center justify-between w-full h-16 px-6 bg-[#131118] border-b border-white/5 select-none z-40">
      {/* Left: Brand Logo & Functional Search */}
      <div className="flex items-center gap-7">
        {/* Logo */}
        <div
          onClick={() => setSelectedSymbol('BTCUSDT')}
          className="flex items-center gap-3 cursor-pointer group"
          title="Back to Bitcoin"
        >
          <div className="flex items-center justify-center w-8 h-8 aspect-square shrink-0">
            <img
              src="/logo.png"
              alt="VeloceX Logo"
              className="w-8 h-8 aspect-square object-contain shrink-0 drop-shadow-[0_0_8px_rgba(0,225,99,0.3)]"
            />
          </div>
          <span className="font-heading text-xl font-extrabold tracking-tight text-white select-none">
            VeloceX
          </span>
        </div>

        {/* 1. FUNCTIONAL SEARCH BAR WITH DUAL PERIMETER LASER BEAM */}
        <div
          ref={searchContainerRef}
          onMouseEnter={() => setIsSearchHovered(true)}
          onMouseLeave={() => setIsSearchHovered(false)}
          className="relative w-80 h-10"
        >
          {/* Base Background Box */}
          <div className="absolute inset-0 rounded-xl bg-[#1F1E25] border border-white/5 pointer-events-none" />

          {/* Dual SVG Glowing Neon Laser Beam */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-10"
            viewBox="0 0 320 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <filter id="softDiffusedGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="6" result="wideBloom" />
              <feGaussianBlur stdDeviation="2.5" result="softGlow" />
              <feMerge>
                <feMergeNode in="wideBloom" />
                <feMergeNode in="softGlow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {(isSearchOpen || isSearchHovered) && (
              <>
                {/* Right Branch */}
                <motion.path
                  d="M 160 39 L 307 39 A 12 12 0 0 0 319 27 L 319 13 A 12 12 0 0 0 307 1 L 160 1"
                  stroke="rgba(0, 225, 99, 0.35)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  filter="url(#softDiffusedGlow)"
                  initial={{ pathLength: 0.35, pathOffset: 0, opacity: 0 }}
                  animate={{
                    pathOffset: [0, 0.65],
                    opacity: [0, 0.7, 0.7, 0],
                  }}
                  transition={{
                    duration: 2.3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <motion.path
                  d="M 160 39 L 307 39 A 12 12 0 0 0 319 27 L 319 13 A 12 12 0 0 0 307 1 L 160 1"
                  stroke="rgba(0, 225, 99, 0.7)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  filter="url(#softDiffusedGlow)"
                  initial={{ pathLength: 0.35, pathOffset: 0, opacity: 0 }}
                  animate={{
                    pathOffset: [0, 0.65],
                    opacity: [0, 0.75, 0.75, 0],
                  }}
                  transition={{
                    duration: 2.3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />

                {/* Left Branch */}
                <motion.path
                  d="M 160 39 L 13 39 A 12 12 0 0 1 1 27 L 1 13 A 12 12 0 0 1 13 1 L 160 1"
                  stroke="rgba(0, 225, 99, 0.35)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  filter="url(#softDiffusedGlow)"
                  initial={{ pathLength: 0.35, pathOffset: 0, opacity: 0 }}
                  animate={{
                    pathOffset: [0, 0.65],
                    opacity: [0, 0.7, 0.7, 0],
                  }}
                  transition={{
                    duration: 2.3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <motion.path
                  d="M 160 39 L 13 39 A 12 12 0 0 1 1 27 L 1 13 A 12 12 0 0 1 13 1 L 160 1"
                  stroke="rgba(0, 225, 99, 0.7)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  filter="url(#softDiffusedGlow)"
                  initial={{ pathLength: 0.35, pathOffset: 0, opacity: 0 }}
                  animate={{
                    pathOffset: [0, 0.65],
                    opacity: [0, 0.75, 0.75, 0],
                  }}
                  transition={{
                    duration: 2.3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </>
            )}
          </svg>

          {/* Interactive Search Input */}
          <div className="relative flex items-center w-full h-full z-20">
            <Search01Icon
              className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none"
              strokeWidth={1.75}
            />
            <input
              type="text"
              placeholder="Search coin (BTC, ETH, SOL...)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full h-full pl-10 pr-8 text-xs text-white placeholder-slate-400 bg-transparent rounded-xl focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-3 text-slate-400 hover:text-white"
              >
                <Cancel01Icon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown Popover */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-12 w-80 bg-[#1F1E25] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-2 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between px-2.5 py-1 mb-1 border-b border-white/5 pb-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Markets ({filteredPairs.length})
                  </span>
                  <span className="text-[10px] text-slate-400">Forex • CFD • Kripto</span>
                </div>

                <div className="flex flex-col space-y-1 max-h-72 overflow-y-auto pr-1">
                  {filteredPairs.map((p) => {
                    const isCurrent = selectedSymbol === p.pair;
                    return (
                      <div
                        key={p.pair}
                        onClick={() => {
                          setSelectedSymbol(p.pair);
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-colors ${
                          isCurrent
                            ? 'bg-[#00E163]/15 border border-[#00E163]/30'
                            : 'hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <MarketIcon symbol={p.symbol} size="sm" />
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white">
                                {p.name}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-slate-400 font-semibold">
                                {p.category}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {p.symbol}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end">
                          <span className="text-xs font-bold text-white font-mono-num">
                            {p.price}
                          </span>
                          {isCurrent && (
                            <span className="text-[9px] font-bold text-[#00E163]">
                              ACTIVE
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {filteredPairs.length === 0 && (
                    <div className="py-8 text-center text-xs text-slate-500">
                      No matching market pairs found.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right: Functional Action Dropdowns */}
      <div className="flex items-center gap-3">
        {/* 2. NOTIFICATION BUTTON */}
        <div ref={notifContainerRef} className="relative">
          <button
            onClick={() => {
              setIsNotificationOpen(!isNotificationOpen);
              setIsWalletOpen(false);
              setIsCurrencyOpen(false);
              setIsProfileOpen(false);
            }}
            className={`group relative flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden bg-[#1F1E25] border transition-colors duration-1000 ${
              isNotificationOpen
                ? 'border-[#00E163] text-black shadow-[0_0_15px_rgba(0,225,99,0.3)]'
                : 'border-white/5 hover:border-[#00E163]'
            }`}
            title="Notifications"
          >
            {/* Left-to-Right Sliding Green Layer */}
            <span
              className={`absolute inset-0 bg-[#00E163] transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none ${
                isNotificationOpen ? 'translate-x-0 opacity-100' : '-translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0'
              }`}
            />

            <span className="relative z-10 flex items-center justify-center">
              <Notification01Icon
                className={`w-5 h-5 transition-colors duration-1000 ${
                  isNotificationOpen ? 'text-black' : 'text-slate-300 group-hover:text-black'
                }`}
                strokeWidth={1.75}
              />
              {unreadCount > 0 && (
                <span
                  className={`absolute top-0 right-0 w-2 h-2 rounded-full transition-colors duration-1000 ${
                    isNotificationOpen ? 'bg-black' : 'bg-[#00E163] group-hover:bg-black'
                  }`}
                />
              )}
            </span>
          </button>

          {/* Notification Popover Layout */}
          <AnimatePresence>
            {isNotificationOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-[360px] bg-[#1F1E25] border border-white/10 rounded-2xl shadow-2xl z-50 p-4 backdrop-blur-xl"
              >
                {selectedNotification ? (
                  /* DETAIL VIEW */
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
                      <button
                        onClick={() => setSelectedNotification(null)}
                        className="flex items-center gap-1 text-xs font-bold text-[#00E163] hover:underline cursor-pointer"
                      >
                        ← Kembali
                      </button>
                      <span className="text-xs font-bold text-slate-300">
                        Detail Pesan
                      </span>
                      <button
                        onClick={() => {
                          setIsNotificationOpen(false);
                          setSelectedNotification(null);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Cancel01Icon className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-col space-y-3 py-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#00E163]/15 text-[#00E163] font-bold">
                          {selectedNotification.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {selectedNotification.time}
                        </span>
                      </div>

                      <h4 className="text-sm font-extrabold text-white leading-snug">
                        {selectedNotification.title}
                      </h4>

                      <div className="p-3 bg-[#26252E] border border-white/5 rounded-xl text-xs text-slate-300 leading-relaxed">
                        {selectedNotification.desc}
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        {selectedNotification.hasActionBtn && (
                          <button
                            onClick={() => {
                              alert(`Executing action: ${selectedNotification.actionBtnLabel}`);
                            }}
                            className="flex-1 py-2 bg-[#00E163] text-black font-extrabold text-xs rounded-xl hover:brightness-110 transition-all cursor-pointer"
                          >
                            {selectedNotification.actionBtnLabel}
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setNotifications((prev) =>
                              prev.filter((n) => n.id !== selectedNotification.id)
                            );
                            setSelectedNotification(null);
                          }}
                          className="px-3 py-2 bg-[#362227] hover:bg-[#462b32] text-[#FF5C77] text-xs font-bold rounded-xl border border-white/10 transition-colors cursor-pointer"
                        >
                          Hapus Pesan
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* NOTIFICATION LIST VIEW */
                  <>
                    <div className="flex items-center justify-between pb-2 mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white tracking-wide">
                          Notifications
                        </h3>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-[#00E163] text-black text-[10px] font-black">
                            {unreadCount}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={() => {
                              setNotifications((prev) =>
                                prev.map((n) => ({ ...n, unread: false }))
                              );
                            }}
                            className="text-[10px] font-bold text-[#00E163] hover:underline cursor-pointer"
                          >
                            Tandai dibaca
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setNotifications([]);
                          }}
                          className="text-[10px] text-slate-500 hover:text-[#FF5C77] hover:underline cursor-pointer"
                        >
                          Hapus semua
                        </button>
                        <button
                          onClick={() => setIsNotificationOpen(false)}
                          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          <Cancel01Icon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-semibold text-slate-400 border-b border-white/5 pb-2 mb-3 overflow-x-auto custom-positions-scrollbar">
                      {(['All', 'Signals', 'Orders', 'System', 'Whales'] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveNotifTab(tab)}
                          className={`relative pb-1 text-xs transition-colors cursor-pointer shrink-0 ${
                            activeNotifTab === tab
                              ? 'text-white font-bold'
                              : 'hover:text-slate-200'
                          }`}
                        >
                          {tab === 'All' ? 'Semua' : tab === 'Signals' ? 'Sinyal' : tab === 'Orders' ? 'Order' : tab === 'System' ? 'Sistem' : 'Whale'}
                          {activeNotifTab === tab && (
                            <motion.div
                              layoutId="activeNotifUnderline"
                              className="absolute bottom-[-9px] left-0 right-0 h-[2px] bg-[#00E163]"
                            />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-col space-y-2 max-h-[340px] overflow-y-auto pr-1 custom-positions-scrollbar">
                      {filteredNotifications.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setNotifications((prev) =>
                              prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
                            );
                            setSelectedNotification(item);
                          }}
                          className={`relative flex items-start justify-between gap-3 group p-2.5 rounded-xl cursor-pointer transition-colors border ${
                            item.unread
                              ? 'bg-[#26252E] border-[#00E163]/20'
                              : 'hover:bg-white/[0.04] border-transparent'
                          }`}
                        >
                          <div className="shrink-0 mt-0.5">
                            {item.type === 'signal' && (
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#00E163]/10 border border-[#00E163]/30 text-[#00E163]">
                                <TradeUpIcon className="w-4 h-4" />
                              </div>
                            )}
                            {item.type === 'order' && (
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#A855F7]/10 border border-[#A855F7]/30 text-[#A855F7]">
                                <Tick01Icon className="w-4 h-4 stroke-[3]" />
                              </div>
                            )}
                            {item.type === 'system' && (
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 text-slate-300">
                                <Shield01Icon className="w-4 h-4" />
                              </div>
                            )}
                            {item.type === 'whale' && (
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FFB800]/10 border border-[#FFB800]/30 text-[#FFB800]">
                                <FlashIcon className="w-4 h-4" />
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 leading-none mb-1">
                              <span className="text-xs font-bold text-white truncate">
                                {item.title}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                • {item.time}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                              {item.desc}
                            </p>

                            {item.hasActionBtn && (
                              <div className="mt-2 flex items-center gap-2">
                                <span className="px-2.5 py-0.5 bg-black/80 text-[#00E163] text-[10px] font-bold rounded-lg border border-white/15">
                                  {item.actionBtnLabel}
                                </span>
                              </div>
                            )}
                          </div>

                          <div
                            className="relative"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() =>
                                setActiveMenuNotifId(activeMenuNotifId === item.id ? null : item.id)
                              }
                              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                            >
                              <MoreHorizontalIcon className="w-4 h-4" />
                            </button>

                            <AnimatePresence>
                              {activeMenuNotifId === item.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  className="absolute right-0 top-6 w-36 bg-[#26252E] border border-white/15 rounded-xl shadow-xl z-50 p-1 text-xs font-semibold text-slate-200"
                                >
                                  <button
                                    onClick={() => handleSnooze(item.id)}
                                    className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                                  >
                                    <Clock01Icon className="w-3.5 h-3.5 text-slate-400" />
                                    Snooze
                                  </button>
                                  <button
                                    onClick={() => handleResolve(item.id)}
                                    className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                                  >
                                    <CheckmarkCircle02Icon className="w-3.5 h-3.5 text-[#00E163]" />
                                    Selesai
                                  </button>
                                  <button
                                    onClick={() => {
                                      setNotifications((prev) =>
                                        prev.filter((n) => n.id !== item.id)
                                      );
                                      setActiveMenuNotifId(null);
                                    }}
                                    className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg bg-[#362227] text-[#FF5C77] transition-colors"
                                  >
                                    <Cancel01Icon className="w-3.5 h-3.5" />
                                    Hapus
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      ))}

                      {filteredNotifications.length === 0 && (
                        <div className="py-8 text-center text-xs text-slate-500">
                          Tidak ada notifikasi di kategori ini
                        </div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. WALLET BALANCE CAPSULE */}
        <div ref={walletContainerRef} className="relative">
          <div
            onClick={() => {
              setIsWalletOpen(!isWalletOpen);
              setIsNotificationOpen(false);
              setIsCurrencyOpen(false);
              setIsProfileOpen(false);
            }}
            className={`group relative flex items-center gap-2.5 h-10 px-4 rounded-xl overflow-hidden bg-[#1F1E25] border cursor-pointer transition-colors duration-1000 ${
              isWalletOpen
                ? 'border-[#00E163] text-black shadow-[0_0_15px_rgba(0,225,99,0.3)]'
                : 'border-white/5 hover:border-[#00E163]'
            }`}
            title="Click to view assets"
          >
            {/* Left-to-Right Sliding Green Layer */}
            <span
              className={`absolute inset-0 bg-[#00E163] transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none ${
                isWalletOpen ? 'translate-x-0 opacity-100' : '-translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0'
              }`}
            />

            <div className="relative z-10 flex items-center gap-2.5">
              <Wallet01Icon
                className={`w-4 h-4 transition-colors duration-1000 ${
                  isWalletOpen ? 'text-black' : 'text-slate-300 group-hover:text-black'
                }`}
                strokeWidth={1.75}
              />
              <span
                className={`text-xs font-bold font-mono-num tracking-wide transition-colors duration-1000 ${
                  isWalletOpen ? 'text-black' : 'text-white group-hover:text-black'
                }`}
              >
                {selectedCurrency.symbol}
                {convertedTotalEquity.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          <AnimatePresence>
            {isWalletOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-80 bg-[#1F1E25] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-4 backdrop-blur-xl"
              >
                <div className="pb-3 border-b border-white/5 mb-3">
                  <span className="text-[10px] text-slate-500 font-semibold block uppercase">
                    TOTAL ESTIMATED BALANCE
                  </span>
                  <span className="text-xl font-black text-white font-mono-num mt-0.5 block">
                    {selectedCurrency.symbol}
                    {convertedTotalEquity.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="flex flex-col space-y-2 mb-4">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#26252E] text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#26A17B] text-xs font-bold text-white">
                        ₮
                      </div>
                      <span className="font-bold text-white text-xs">USDT</span>
                    </div>
                    <div className="text-right font-mono-num">
                      <span className="font-bold text-white block text-xs">50,000.00</span>
                      <span className="text-[10px] text-slate-500">Available</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#26252E] text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#F7931A] text-xs font-bold text-white">
                        ₿
                      </div>
                      <span className="font-bold text-white text-xs">BTC</span>
                    </div>
                    <div className="text-right font-mono-num">
                      <span className="font-bold text-white block text-xs">1.5000</span>
                      <span className="text-[10px] text-[#00E163]">≈ $97,760</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#26252E] text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#434857] text-xs font-bold text-white">
                        ♦
                      </div>
                      <span className="font-bold text-white text-xs">ETH</span>
                    </div>
                    <div className="text-right font-mono-num">
                      <span className="font-bold text-white block text-xs">10.0000</span>
                      <span className="text-[10px] text-[#00E163]">≈ $34,285</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => {
                      alert('Demo deposit added: +$10,000 USDT');
                      setIsWalletOpen(false);
                    }}
                    className="flex items-center justify-center gap-1.5 h-9 rounded-xl bg-[#00E163] text-black font-bold text-xs hover:brightness-110 transition-colors"
                  >
                    <CreditCardAddIcon className="w-4 h-4" />
                    Deposit
                  </button>
                  <button
                    onClick={() => {
                      alert('Withdrawal request simulated.');
                      setIsWalletOpen(false);
                    }}
                    className="flex items-center justify-center gap-1.5 h-9 rounded-xl bg-[#26252E] border border-white/10 text-white font-bold text-xs hover:bg-white/10 transition-colors"
                  >
                    Withdraw
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 4. CURRENCY SWITCHER CAPSULE */}
        <div ref={currencyContainerRef} className="relative">
          <div
            onClick={() => {
              setIsCurrencyOpen(!isCurrencyOpen);
              setIsNotificationOpen(false);
              setIsWalletOpen(false);
              setIsProfileOpen(false);
            }}
            className={`group relative flex items-center gap-2 h-10 px-3 rounded-xl overflow-hidden bg-[#1F1E25] border cursor-pointer transition-colors duration-1000 ${
              isCurrencyOpen
                ? 'border-[#00E163] text-black shadow-[0_0_15px_rgba(0,225,99,0.3)]'
                : 'border-white/5 hover:border-[#00E163]'
            }`}
          >
            {/* Left-to-Right Sliding Green Layer */}
            <span
              className={`absolute inset-0 bg-[#00E163] transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none ${
                isCurrencyOpen ? 'translate-x-0 opacity-100' : '-translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0'
              }`}
            />

            <div className="relative z-10 flex items-center gap-2">
              <div className="flex items-center justify-center w-4 h-4 rounded-full bg-amber-500 text-[10px] font-black text-black">
                {selectedCurrency.symbol}
              </div>
              <span
                className={`text-xs font-bold transition-colors duration-1000 ${
                  isCurrencyOpen ? 'text-black' : 'text-white group-hover:text-black'
                }`}
              >
                {selectedCurrency.code}
              </span>
              <ArrowDown01Icon
                className={`w-3.5 h-3.5 transition-colors duration-1000 ${
                  isCurrencyOpen ? 'text-black' : 'text-slate-400 group-hover:text-black'
                }`}
                strokeWidth={2}
              />
            </div>
          </div>

          <AnimatePresence>
            {isCurrencyOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-48 bg-[#1F1E25] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-2 backdrop-blur-xl"
              >
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 py-1 mb-1">
                  Display Currency
                </div>
                <div className="flex flex-col space-y-1">
                  {AVAILABLE_CURRENCIES.map((curr) => {
                    const isSelected = curr.code === selectedCurrency.code;
                    return (
                      <div
                        key={curr.code}
                        onClick={() => {
                          setSelectedCurrency(curr);
                          setIsCurrencyOpen(false);
                        }}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#00E163]/15 text-[#00E163] font-bold'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-4 text-center font-bold">{curr.symbol}</span>
                          <span>{curr.name}</span>
                        </div>
                        {isSelected && <Tick01Icon className="w-3.5 h-3.5" />}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 5. USER PROFILE CAPSULE */}
        <div ref={profileContainerRef} className="relative">
          <div
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotificationOpen(false);
              setIsWalletOpen(false);
              setIsCurrencyOpen(false);
            }}
            className={`group relative flex items-center gap-2.5 h-11 pl-2 pr-3.5 rounded-xl overflow-hidden bg-[#1F1E25] border cursor-pointer transition-colors duration-1000 ${
              isProfileOpen
                ? 'border-[#00E163] text-black shadow-[0_0_15px_rgba(0,225,99,0.3)]'
                : 'border-white/5 hover:border-[#00E163]'
            }`}
          >
            {/* Bottom-to-Top Sliding Green Layer */}
            <span
              className={`absolute inset-0 bg-[#00E163] transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none ${
                isProfileOpen ? 'translate-y-0 opacity-100' : 'translate-y-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-y-0'
              }`}
            />

            <div className="relative z-10 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/10 group-hover:border-black/20 transition-colors duration-1000">
                <img
                  src="/avatar.jpg"
                  alt="Diane Littel Avatar"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col text-left leading-tight">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-xs font-bold tracking-wide transition-colors duration-500 ${
                      isProfileOpen ? 'text-black' : 'text-white group-hover:text-black'
                    }`}
                  >
                    {displayName}
                  </span>
                  <ArrowDown01Icon
                    className={`w-3 h-3 transition-colors duration-500 ${
                      isProfileOpen ? 'text-black' : 'text-slate-400 group-hover:text-black'
                    }`}
                    strokeWidth={2.5}
                  />
                </div>
                <span
                  className={`text-[10px] font-mono transition-colors duration-500 ${
                    isProfileOpen ? 'text-black/80' : 'text-slate-400 group-hover:text-black/80'
                  }`}
                >
                  {displayAddress}
                </span>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-13 w-64 bg-[#1F1E25] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-3 backdrop-blur-xl"
              >
                <div className="flex items-center gap-3 pb-3 border-b border-white/5 mb-2">
                  <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-white/15">
                    <img src="/avatar.jpg" alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">{displayName}</span>
                    <span className="text-[10px] text-[#00E163] font-semibold">VIP 1 Trader</span>
                  </div>
                </div>

                <div
                  onClick={handleCopyAddress}
                  className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-[#26252E] text-xs cursor-pointer hover:bg-[#302e38] transition-colors mb-2"
                >
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500 uppercase font-bold">ETH Wallet</span>
                    <span className="text-[11px] font-mono text-slate-200">0x4cB6...cdKF</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-[#00E163]">
                    {copiedAddress ? (
                      <>
                        <Tick01Icon className="w-3.5 h-3.5" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy01Icon className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col space-y-1">
                  <button
                    onClick={() => {
                      onOpenAuthModal?.();
                      setIsProfileOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    {isAuthenticated ? 'Switch Account' : 'Connect / Register Demo'}
                  </button>

                  <button
                    onClick={() => {
                      alert('Security & Settings panel opened.');
                      setIsProfileOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    <Settings01Icon className="w-4 h-4 text-slate-400" />
                    Settings & API
                  </button>

                  <div className="h-[1px] bg-white/5 my-1" />

                  {isAuthenticated ? (
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileOpen(false);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#FF5C77] hover:bg-[#362227] transition-colors"
                    >
                      <Logout01Icon className="w-4 h-4" />
                      Sign Out
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onOpenAuthModal?.();
                        setIsProfileOpen(false);
                      }}
                      className="flex items-center justify-center w-full h-8 rounded-xl bg-[#00E163] text-black font-bold text-xs hover:brightness-110 transition-colors"
                    >
                      Login / Register
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
