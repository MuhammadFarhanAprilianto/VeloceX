'use client';

import React, { useState, useMemo } from 'react';
import {
  Coins01Icon,
  Shield01Icon,
  TradeUpIcon,
  ArrowUpRight01Icon,
  ArrowDownLeft01Icon,
  ArrowRight01Icon,
  Exchange01Icon,
  Download01Icon,
  ViewIcon,
  ViewOffSlashIcon,
  Search01Icon,
  SparklesIcon,
  ChartHistogramIcon,
  Layers01Icon,
  Globe02Icon,
  Tick01Icon,
  AlertCircleIcon,
  Activity01Icon,
  Clock01Icon,
  FlashIcon,
  ArrowDown01Icon,
  ArrowUpDownIcon,
  Calendar03Icon,
  Cancel01Icon,
} from 'hugeicons-react';
import { MarketIcon } from '@/components/MarketIcon';

export interface PortfolioHolding {
  id: string;
  symbol: string;
  name: string;
  category: 'crypto' | 'forex' | 'cfd';
  amount: number;
  available: number;
  inOrderAmount: number;
  avgBuyPrice: number;
  currentPrice: number;
  decimals: number;
  prefix: string;
  allocationPct: number;
  subAccount: 'spot' | 'futures' | 'lightning' | 'earn';
}

export interface AccountAllocation {
  id: string;
  name: string;
  balanceUsd: number;
  pct: number;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface DailyPnlRecord {
  day: number;
  dateStr: string;
  pnlUsd: number;
  pnlPct: number;
  isProfit: boolean;
}

// Complete 18 Assets across Kripto, Forex, and CFD & Komoditas matching VeloceX Standard
const INITIAL_HOLDINGS: PortfolioHolding[] = [
  // 1. KRIPTO (7 Aset)
  { id: 'USDT', symbol: 'USDT', name: 'Tether USD', category: 'crypto', amount: 48500.00, available: 48500.00, inOrderAmount: 0.00, avgBuyPrice: 1.00, currentPrice: 1.00, decimals: 2, prefix: '$', allocationPct: 24.5, subAccount: 'spot' },
  { id: 'BTC', symbol: 'BTC', name: 'Bitcoin', category: 'crypto', amount: 2.3450, available: 2.3450, inOrderAmount: 0.0000, avgBuyPrice: 68420.00, currentPrice: 75368.45, decimals: 4, prefix: '$', allocationPct: 38.8, subAccount: 'spot' },
  { id: 'ETH', symbol: 'ETH', name: 'Ethereum', category: 'crypto', amount: 4.8500, available: 4.5000, inOrderAmount: 0.3500, avgBuyPrice: 3620.50, currentPrice: 4149.74, decimals: 4, prefix: '$', allocationPct: 18.4, subAccount: 'spot' },
  { id: 'SOL', symbol: 'SOL', name: 'Solana', category: 'crypto', amount: 35.50, available: 32.00, inOrderAmount: 3.50, avgBuyPrice: 142.10, currentPrice: 175.03, decimals: 2, prefix: '$', allocationPct: 6.1, subAccount: 'spot' },
  { id: 'LTC', symbol: 'LTC', name: 'Litecoin', category: 'crypto', amount: 45.00, available: 45.00, inOrderAmount: 0.00, avgBuyPrice: 82.50, currentPrice: 94.92, decimals: 2, prefix: '$', allocationPct: 2.1, subAccount: 'spot' },
  { id: 'BNB', symbol: 'BNB', name: 'Binance Coin', category: 'crypto', amount: 12.00, available: 10.50, inOrderAmount: 1.50, avgBuyPrice: 580.00, currentPrice: 614.35, decimals: 2, prefix: '$', allocationPct: 3.6, subAccount: 'earn' },
  { id: 'ADA', symbol: 'ADA', name: 'Cardano', category: 'crypto', amount: 5400.00, available: 5400.00, inOrderAmount: 0.00, avgBuyPrice: 0.48, currentPrice: 0.562, decimals: 3, prefix: '$', allocationPct: 1.5, subAccount: 'earn' },

  // 2. FOREX (6 Aset)
  { id: 'EURUSD', symbol: 'EUR/USD', name: 'Euro / US Dollar', category: 'forex', amount: 2500.00, available: 2500.00, inOrderAmount: 0.00, avgBuyPrice: 1.0750, currentPrice: 1.0842, decimals: 4, prefix: '', allocationPct: 1.3, subAccount: 'futures' },
  { id: 'GBPUSD', symbol: 'GBP/USD', name: 'British Pound / USD', category: 'forex', amount: 1800.00, available: 1800.00, inOrderAmount: 0.00, avgBuyPrice: 1.2800, currentPrice: 1.2915, decimals: 4, prefix: '', allocationPct: 1.1, subAccount: 'futures' },
  { id: 'USDJPY', symbol: 'USD/JPY', name: 'USD / Japanese Yen', category: 'forex', amount: 1200.00, available: 1200.00, inOrderAmount: 0.00, avgBuyPrice: 152.00, currentPrice: 154.60, decimals: 2, prefix: '¥', allocationPct: 0.6, subAccount: 'futures' },
  { id: 'AUDUSD', symbol: 'AUD/USD', name: 'Australian Dollar / USD', category: 'forex', amount: 1500.00, available: 1500.00, inOrderAmount: 0.00, avgBuyPrice: 0.6450, currentPrice: 0.6580, decimals: 4, prefix: '', allocationPct: 0.5, subAccount: 'lightning' },
  { id: 'USDCAD', symbol: 'USD/CAD', name: 'USD / Canadian Dollar', category: 'forex', amount: 800.00, available: 800.00, inOrderAmount: 0.00, avgBuyPrice: 1.3700, currentPrice: 1.3820, decimals: 4, prefix: '', allocationPct: 0.4, subAccount: 'lightning' },
  { id: 'USDCHF', symbol: 'USD/CHF', name: 'USD / Swiss Franc', category: 'forex', amount: 650.00, available: 650.00, inOrderAmount: 0.00, avgBuyPrice: 0.8750, currentPrice: 0.8840, decimals: 4, prefix: '', allocationPct: 0.3, subAccount: 'lightning' },

  // 3. CFD & KOMODITAS (6 Aset)
  { id: 'XAUUSD', symbol: 'XAU/USD', name: 'Gold (Emas Spot)', category: 'cfd', amount: 2.50, available: 2.10, inOrderAmount: 0.40, avgBuyPrice: 2420.00, currentPrice: 2514.80, decimals: 2, prefix: '$', allocationPct: 3.1, subAccount: 'lightning' },
  { id: 'XAGUSD', symbol: 'XAG/USD', name: 'Silver (Perak Spot)', category: 'cfd', amount: 60.00, available: 60.00, inOrderAmount: 0.00, avgBuyPrice: 27.50, currentPrice: 29.45, decimals: 2, prefix: '$', allocationPct: 0.9, subAccount: 'lightning' },
  { id: 'USOIL', symbol: 'USOIL', name: 'Crude Oil WTI', category: 'cfd', amount: 25.00, available: 25.00, inOrderAmount: 0.00, avgBuyPrice: 72.00, currentPrice: 74.60, decimals: 2, prefix: '$', allocationPct: 0.9, subAccount: 'futures' },
  { id: 'SPX500', symbol: 'SPX500', name: 'S&P 500 Index', category: 'cfd', amount: 1.00, available: 1.00, inOrderAmount: 0.00, avgBuyPrice: 5500.00, currentPrice: 5648.40, decimals: 2, prefix: '$', allocationPct: 2.8, subAccount: 'futures' },
  { id: 'NAS100', symbol: 'NAS100', name: 'Nasdaq 100 Index', category: 'cfd', amount: 0.50, available: 0.50, inOrderAmount: 0.00, avgBuyPrice: 19200.00, currentPrice: 19720.50, decimals: 2, prefix: '$', allocationPct: 4.8, subAccount: 'futures' },
  { id: 'US30', symbol: 'US30', name: 'Dow Jones 30 Index', category: 'cfd', amount: 0.20, available: 0.20, inOrderAmount: 0.00, avgBuyPrice: 40500.00, currentPrice: 41250.00, decimals: 2, prefix: '$', allocationPct: 4.1, subAccount: 'futures' },
];

const ACCOUNT_ALLOCATIONS: AccountAllocation[] = [
  { id: 'spot', name: 'Dompet Utama (Spot)', balanceUsd: 18450.60, pct: 44.3, color: '#00E163', icon: Coins01Icon },
  { id: 'futures', name: 'Futures & Leverage', balanceUsd: 12500.00, pct: 30.0, color: '#3875F6', icon: TradeUpIcon },
  { id: 'lightning', name: 'Lightning Scalping', balanceUsd: 6200.00, pct: 14.9, color: '#FFB800', icon: FlashIcon },
  { id: 'earn', name: 'Staking & Earn Yield', balanceUsd: 4520.40, pct: 10.8, color: '#A855F7', icon: SparklesIcon },
];

// Equity Curve Growth Data Points
const EQUITY_CURVE_DATA = {
  '7D': [39400, 39850, 39620, 40150, 40900, 41200, 41671],
  '30D': [34500, 35200, 34900, 36100, 37400, 36800, 38200, 39100, 38700, 40200, 41671],
  '90D': [28400, 29800, 31200, 30500, 32900, 34800, 36500, 38200, 40100, 41671],
  '1Y': [18500, 21400, 24600, 23800, 27500, 31200, 34500, 38100, 41671],
  'ALL': [12000, 16500, 21200, 26800, 32400, 36800, 41671],
};

// 28 Days Monthly PnL Consistency Heatmap Dataset
const DAILY_PNL_CALENDAR: DailyPnlRecord[] = [
  { day: 1, dateStr: '01 Agt', pnlUsd: 320.50, pnlPct: 1.2, isProfit: true },
  { day: 2, dateStr: '02 Agt', pnlUsd: 540.20, pnlPct: 1.8, isProfit: true },
  { day: 3, dateStr: '03 Agt', pnlUsd: -120.00, pnlPct: -0.4, isProfit: false },
  { day: 4, dateStr: '04 Agt', pnlUsd: 890.40, pnlPct: 2.7, isProfit: true },
  { day: 5, dateStr: '05 Agt', pnlUsd: 410.10, pnlPct: 1.3, isProfit: true },
  { day: 6, dateStr: '06 Agt', pnlUsd: 215.00, pnlPct: 0.7, isProfit: true },
  { day: 7, dateStr: '07 Agt', pnlUsd: -85.50, pnlPct: -0.3, isProfit: false },
  { day: 8, dateStr: '08 Agt', pnlUsd: 650.00, pnlPct: 2.1, isProfit: true },
  { day: 9, dateStr: '09 Agt', pnlUsd: 1120.00, pnlPct: 3.4, isProfit: true },
  { day: 10, dateStr: '10 Agt', pnlUsd: -210.00, pnlPct: -0.6, isProfit: false },
  { day: 11, dateStr: '11 Agt', pnlUsd: 430.80, pnlPct: 1.4, isProfit: true },
  { day: 12, dateStr: '12 Agt', pnlUsd: 780.00, pnlPct: 2.3, isProfit: true },
  { day: 13, dateStr: '13 Agt', pnlUsd: 310.40, pnlPct: 0.9, isProfit: true },
  { day: 14, dateStr: '14 Agt', pnlUsd: 940.20, pnlPct: 2.8, isProfit: true },
  { day: 15, dateStr: '15 Agt', pnlUsd: -150.00, pnlPct: -0.5, isProfit: false },
  { day: 16, dateStr: '16 Agt', pnlUsd: 620.00, pnlPct: 1.9, isProfit: true },
  { day: 17, dateStr: '17 Agt', pnlUsd: 840.50, pnlPct: 2.5, isProfit: true },
  { day: 18, dateStr: '18 Agt', pnlUsd: 1250.00, pnlPct: 3.7, isProfit: true },
  { day: 19, dateStr: '19 Agt', pnlUsd: -95.00, pnlPct: -0.3, isProfit: false },
  { day: 20, dateStr: '20 Agt', pnlUsd: 510.00, pnlPct: 1.5, isProfit: true },
  { day: 21, dateStr: '21 Agt', pnlUsd: 690.40, pnlPct: 2.0, isProfit: true },
  { day: 22, dateStr: '22 Agt', pnlUsd: 380.00, pnlPct: 1.1, isProfit: true },
  { day: 23, dateStr: '23 Agt', pnlUsd: -180.00, pnlPct: -0.5, isProfit: false },
  { day: 24, dateStr: '24 Agt', pnlUsd: 820.00, pnlPct: 2.4, isProfit: true },
  { day: 25, dateStr: '25 Agt', pnlUsd: 970.50, pnlPct: 2.9, isProfit: true },
  { day: 26, dateStr: '26 Agt', pnlUsd: 1140.00, pnlPct: 3.3, isProfit: true },
  { day: 27, dateStr: '27 Agt', pnlUsd: 1320.00, pnlPct: 3.8, isProfit: true },
  { day: 28, dateStr: '28 Agt', pnlUsd: 1420.50, pnlPct: 3.5, isProfit: true },
];

interface PortfolioViewProps {
  onOrderSuccess?: (msg: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  onOrderSuccess,
  onNavigateTab,
}) => {
  // Privacy Eye Toggle
  const [hideBalance, setHideBalance] = useState<boolean>(false);

  // Sub-Account Overview Tab: 'all' | 'spot' | 'futures' | 'lightning' | 'earn'
  const [activeSubAccount, setActiveSubAccount] = useState<'all' | 'spot' | 'futures' | 'lightning' | 'earn'>('all');

  // Timeframe for Growth Equity Curve
  const [curveTimeframe, setCurveTimeframe] = useState<'7D' | '30D' | '90D' | '1Y' | 'ALL'>('30D');
  const [benchmarkMode, setBenchmarkMode] = useState<'NONE' | 'BTC' | 'SPX'>('BTC');

  // Holdings Filter & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'crypto' | 'forex' | 'cfd'>('all');
  const [hideSmallBalances, setHideSmallBalances] = useState<boolean>(false);

  // Holdings State
  const [holdings, setHoldings] = useState<PortfolioHolding[]>(INITIAL_HOLDINGS);

  // Transfer Modal State & Custom Dropdowns
  const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false);
  const [transferFrom, setTransferFrom] = useState<string>('spot');
  const [isFromDropdownOpen, setIsFromDropdownOpen] = useState<boolean>(false);
  const [transferTo, setTransferTo] = useState<string>('lightning');
  const [isToDropdownOpen, setIsToDropdownOpen] = useState<boolean>(false);
  const [isSwapping, setIsSwapping] = useState<boolean>(false);
  const [transferAmount, setTransferAmount] = useState<string>('500');
  const [transferPhase, setTransferPhase] = useState<'idle' | 'progress' | 'checkmark_center' | 'checkmark_shift' | 'success_revealed'>('idle');

  // Convert Dust Modal State with 4-Step Animated Flow
  const [isDustModalOpen, setIsDustModalOpen] = useState<boolean>(false);
  const [selectedDustIds, setSelectedDustIds] = useState<string[]>(['ADA', 'EURUSD', 'USDCAD', 'USDCHF']);
  const [dustPhase, setDustPhase] = useState<'idle' | 'progress' | 'checkmark_center' | 'checkmark_shift' | 'success_revealed'>('idle');

  const handleSwapTransferAccounts = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsSwapping(true);
    setIsFromDropdownOpen(false);
    setIsToDropdownOpen(false);
    const temp = transferFrom;
    setTransferFrom(transferTo);
    setTransferTo(temp);
    setTimeout(() => setIsSwapping(false), 400);
  };

  // Total Portfolio Equity Calculation
  const totalNetWorth = useMemo(() => {
    return holdings.reduce((sum, h) => sum + h.amount * h.currentPrice, 0);
  }, [holdings]);

  const todayPnlUsd = 1420.50;
  const todayPnlPct = 3.52;
  const allTimePnlUsd = 19671.00;
  const allTimePnlPct = 89.41;

  // Filtered Holdings by SubAccount, Category, Search, Small Balances
  const filteredHoldings = useMemo(() => {
    return holdings.filter((h) => {
      const matchSub = activeSubAccount === 'all' || h.subAccount === activeSubAccount;
      const matchSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === 'all' || h.category === selectedCategory;
      const totalVal = h.amount * h.currentPrice;
      const matchSmall = !hideSmallBalances || totalVal >= 1.0;
      return matchSub && matchSearch && matchCategory && matchSmall;
    });
  }, [holdings, activeSubAccount, searchQuery, selectedCategory, hideSmallBalances]);

  // Handle Internal Balance Transfer with 4-Step Animated Flow
  const handleExecuteTransfer = () => {
    if (transferPhase !== 'idle') return;

    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0) {
      onOrderSuccess?.('Nominal transfer harus lebih besar dari 0.');
      return;
    }
    if (transferFrom === transferTo) {
      onOrderSuccess?.('Akun sumber dan akun tujuan transfer harus berbeda.');
      return;
    }

    const fromAcc = ACCOUNT_ALLOCATIONS.find((a) => a.id === transferFrom)?.name || transferFrom;
    const toAcc = ACCOUNT_ALLOCATIONS.find((a) => a.id === transferTo)?.name || transferTo;

    // 1. Loading Progress Bar Hijau dari Kiri ke Kanan (700ms)
    setTransferPhase('progress');

    // 2. Setelah Full Hijau -> Centang Pop di Rata Tengah (Center)
    setTimeout(() => {
      setTransferPhase('checkmark_center');

      // 3. Jeda 1 detik (1000ms) -> Geser ke Kiri & Teks Success muncul dari burem ke jelas
      setTimeout(() => {
        setTransferPhase('checkmark_shift');

        setTimeout(() => {
          setTransferPhase('success_revealed');

          // 4. Setelah transisi selesai -> Jeda 2 detik (2000ms) langsung tutup modal & kembali ke Portofolio
          setTimeout(() => {
            setIsTransferModalOpen(false);
            setTransferPhase('idle');
            onOrderSuccess?.(`Transfer internal $${amt.toLocaleString()} USDT dari ${fromAcc} ke ${toAcc} berhasil.`);
          }, 2000);
        }, 150);
      }, 1000);
    }, 700);
  };

  // Handle Dust Conversion Execution with 4-Step Animated Flow
  const handleExecuteConvertDust = () => {
    if (dustPhase !== 'idle') return;

    if (selectedDustIds.length === 0) {
      onOrderSuccess?.('Pilih minimal 1 aset saldo kecil untuk dikonversi.');
      return;
    }

    const totalConvertedUsd = holdings
      .filter((h) => selectedDustIds.includes(h.id))
      .reduce((sum, h) => sum + h.amount * h.currentPrice, 0);

    // 1. Loading Progress Bar Hijau dari Kiri ke Kanan (700ms)
    setDustPhase('progress');

    // 2. Setelah Full Hijau -> Centang Pop di Rata Tengah (Center)
    setTimeout(() => {
      setDustPhase('checkmark_center');

      // 3. Jeda 1 detik (1000ms) -> Geser ke Kiri & Teks Success muncul dari burem ke jelas
      setTimeout(() => {
        setDustPhase('checkmark_shift');

        setTimeout(() => {
          setDustPhase('success_revealed');

          // 4. Setelah transisi selesai -> Jeda 2 detik (2000ms) langsung tutup modal & kembali ke Portofolio
          setTimeout(() => {
            setIsDustModalOpen(false);
            setDustPhase('idle');
            onOrderSuccess?.(`Konversi ${selectedDustIds.length} saldo debu ke $${totalConvertedUsd.toFixed(2)} USDT berhasil dilakukan (0% Fee).`);
          }, 2000);
        }, 150);
      }, 1000);
    }, 700);
  };

  // Handle Export Audit CSV
  const handleExportCSV = () => {
    const headers = 'ID,Symbol,Name,Category,Amount,InOrder,AvgBuyPrice,CurrentPrice,TotalValueUSD,UnrealizedPnLUSD,UnrealizedPnLPct\n';
    const rows = holdings.map((h) => {
      const val = h.amount * h.currentPrice;
      const pnl = (h.currentPrice - h.avgBuyPrice) * h.amount;
      const pnlPct = ((h.currentPrice - h.avgBuyPrice) / h.avgBuyPrice) * 100;
      return `${h.id},${h.symbol},${h.name},${h.category},${h.amount},${h.inOrderAmount},${h.avgBuyPrice},${h.currentPrice},${val.toFixed(2)},${pnl.toFixed(2)},${pnlPct.toFixed(2)}%`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `VeloceX_Portfolio_Audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    onOrderSuccess?.('Laporan audit portofolio (CSV) berhasil diunduh.');
  };

  // Generate Smooth Cubic Spline Path for Equity Curve SVG
  const getSplinePath = (data: number[]) => {
    if (data.length < 2) return { path: '', fillPath: '' };
    const min = Math.min(...data) * 0.96;
    const max = Math.max(...data) * 1.04;
    const range = max - min || 1;
    const width = 640;
    const height = 180;
    const padX = 15;
    const padY = 15;

    const pts = data.map((val, idx) => {
      const x = padX + (idx / (data.length - 1)) * (width - 2 * padX);
      const y = height - padY - ((val - min) / range) * (height - 2 * padY);
      return { x, y };
    });

    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 4;
      const cp1y = p1.y + (p2.y - p0.y) / 4;
      const cp2x = p2.x - (p3.x - p1.x) / 4;
      const cp2y = p2.y - (p3.y - p1.y) / 4;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }

    const last = pts[pts.length - 1];
    const fillPath = `${d} L ${last.x.toFixed(1)} ${height} L ${pts[0].x.toFixed(1)} ${height} Z`;

    return { path: d, fillPath, lastPt: last };
  };

  const activeCurvePoints = EQUITY_CURVE_DATA[curveTimeframe];
  const splineData = getSplinePath(activeCurvePoints);

  return (
    <div className="flex flex-col gap-6 p-3 sm:p-5 md:p-6 pb-24 md:pb-6 max-w-[1600px] mx-auto w-full font-sans animate-fade-in text-slate-100">
      {/* 1. EXECUTIVE NET WORTH & QUICK ACTIONS HEADER (2x2 Grid Layout for Buttons) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#18171E] via-[#1F1E25] to-[#18171E] border border-white/5 p-6 md:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xl">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Nilai Bersih Portofolio (Net Equity)
            </span>
            <button
              type="button"
              onClick={() => setHideBalance(!hideBalance)}
              className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              {hideBalance ? <ViewOffSlashIcon className="w-4 h-4" /> : <ViewIcon className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-baseline gap-3">
            <h1 className="text-3xl md:text-4xl font-black text-white font-mono-num tracking-tight">
              {hideBalance ? '••••••••' : `$${totalNetWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </h1>
            <span className="text-sm font-extrabold text-[#00E163] font-mono-num">USD</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
            {/* Today's PnL */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">PnL Hari Ini:</span>
              <span className="font-extrabold text-[#00E163] font-mono-num">
                {hideBalance ? '••••' : `+$${todayPnlUsd.toLocaleString()} (+${todayPnlPct}%)`}
              </span>
            </div>

            <span className="text-slate-600 hidden sm:inline">•</span>

            {/* Cumulative All-time PnL */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Total Akumulasi Keuntungan:</span>
              <span className="font-extrabold text-[#00E163] font-mono-num">
                {hideBalance ? '••••' : `+$${allTimePnlUsd.toLocaleString()} (+${allTimePnlPct}%)`}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons: Symmetrical 2x2 Grid Layout with 1000ms VeloceX Sweep */}
        <div className="grid grid-cols-2 gap-2.5 w-full sm:w-auto lg:w-[380px] shrink-0">
          {/* 1. Deposit Button */}
          <button
            type="button"
            onClick={() => onNavigateTab ? onNavigateTab('wallet') : onOrderSuccess?.('Membuka menu deposit dompet.')}
            className="group relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#00E163] text-black text-xs font-black shadow-lg shadow-[#00E163]/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer select-none"
          >
            <ArrowDownLeft01Icon className="w-4 h-4 stroke-[3]" />
            <span>Setor Dana</span>
          </button>

          {/* 2. Withdraw Button */}
          <button
            type="button"
            onClick={() => onNavigateTab ? onNavigateTab('wallet') : onOrderSuccess?.('Membuka menu penarikan dana.')}
            className="group relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#18171E] hover:text-black border border-white/5 text-xs font-bold text-slate-200 overflow-hidden cursor-pointer select-none transition-all duration-1000"
          >
            <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
            <span className="relative z-10 flex items-center gap-2 transition-colors duration-1000">
              <ArrowUpRight01Icon className="w-4 h-4" />
              <span>Tarik Dana</span>
            </span>
          </button>

          {/* 3. Internal Transfer Button */}
          <button
            type="button"
            onClick={() => setIsTransferModalOpen(true)}
            className="group relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#18171E] hover:text-black border border-white/5 text-xs font-bold text-slate-200 overflow-hidden cursor-pointer select-none transition-all duration-1000"
          >
            <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
            <span className="relative z-10 flex items-center gap-2 transition-colors duration-1000">
              <Exchange01Icon className="w-4 h-4" />
              <span>Transfer Saldo</span>
            </span>
          </button>

          {/* 4. Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="group relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#18171E] hover:text-black border border-white/5 text-xs font-bold text-slate-200 overflow-hidden cursor-pointer select-none transition-all duration-1000"
          >
            <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
            <span className="relative z-10 flex items-center gap-2 transition-colors duration-1000">
              <Download01Icon className="w-4 h-4" />
              <span>Unduh Audit (CSV)</span>
            </span>
          </button>
        </div>
      </div>

      {/* FEATURE 1: SUB-ACCOUNT OVERVIEW TABS (Binance/Bybit Standard) */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-1 border-b border-white/5">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#18171E] border border-white/5 overflow-x-auto custom-positions-scrollbar">
          {[
            { id: 'all', label: 'Ringkasan Terpadu', icon: Layers01Icon },
            { id: 'spot', label: 'Dompet Spot', icon: Coins01Icon },
            { id: 'futures', label: 'Futures Margin', icon: TradeUpIcon },
            { id: 'lightning', label: 'Lightning Scalp', icon: FlashIcon },
            { id: 'earn', label: 'Staking Earn', icon: SparklesIcon },
          ].map((tab) => {
            const isActive = activeSubAccount === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubAccount(tab.id as any)}
                className={`group relative flex items-center gap-2 px-4 h-9 rounded-xl text-xs font-bold transition-all duration-1000 overflow-hidden cursor-pointer select-none ${
                  isActive
                    ? 'bg-[#00E163] text-black font-black shadow-md shadow-[#00E163]/20'
                    : 'text-slate-400 hover:text-black'
                }`}
              >
                {!isActive && (
                  <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                )}
                <Icon className={`w-3.5 h-3.5 relative z-10 transition-colors duration-1000 ${isActive ? 'text-black stroke-[3]' : 'text-slate-400 group-hover:text-black'}`} />
                <span className="relative z-10 transition-colors duration-1000">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setIsDustModalOpen(true)}
          className="group relative flex items-center gap-2 px-4 h-9 rounded-2xl bg-[#18171E] hover:text-black border border-white/5 text-xs font-bold text-slate-300 overflow-hidden cursor-pointer select-none transition-all duration-1000"
        >
          <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
          <SparklesIcon className="w-4 h-4 text-[#FFB800] group-hover:text-black relative z-10 transition-colors duration-1000" />
          <span className="relative z-10 transition-colors duration-1000">Konversi Saldo Kecil (&lt; $50)</span>
        </button>
      </div>

      {/* 2. GRID: SMART ALLOCATION (LEFT 5 COLS) & EQUITY GROWTH CURVE (RIGHT 7 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* LEFT: SMART ASSET & ACCOUNT ALLOCATION (5 COLS) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-3xl bg-[#1F1E25] border border-white/5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers01Icon className="w-5 h-5 text-[#00E163]" />
              <h3 className="text-sm font-extrabold text-white">Distribusi Alokasi Akun</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400">4 Sub-Akun Terhubung</span>
          </div>

          {/* Progress Bar Allocation */}
          <div className="w-full h-3.5 rounded-xl bg-[#14131A] overflow-hidden flex p-0.5 gap-0.5 mb-5 border border-white/5">
            {ACCOUNT_ALLOCATIONS.map((acc) => (
              <div
                key={acc.id}
                style={{ width: `${acc.pct}%`, backgroundColor: acc.color }}
                className="h-full rounded-lg transition-all duration-500"
                title={`${acc.name}: ${acc.pct}%`}
              />
            ))}
          </div>

          {/* Account Breakdown Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            {ACCOUNT_ALLOCATIONS.map((acc) => {
              const Icon = acc.icon;
              return (
                <div
                  key={acc.id}
                  onClick={() => setActiveSubAccount(acc.id as any)}
                  className={`p-3 rounded-2xl bg-[#18171E] border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    activeSubAccount === acc.id ? 'border-[#00E163]' : 'border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: acc.color }} />
                      <span className="text-[11px] font-bold text-slate-300 truncate">{acc.name}</span>
                    </div>
                    <span className="text-[10px] font-mono-num font-black" style={{ color: acc.color }}>
                      {acc.pct}%
                    </span>
                  </div>

                  <span className="text-xs font-black text-white font-mono-num">
                    {hideBalance ? '••••' : `$${acc.balanceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Currency Distribution Chips */}
          <div className="pt-4 border-t border-white/5 mt-4 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px] font-bold">Aset Terbesar:</span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-[#26252E] text-white font-mono-num text-[10px] font-bold">
                BTC: 38.8%
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-[#26252E] text-white font-mono-num text-[10px] font-bold">
                USDT: 24.5%
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-[#26252E] text-white font-mono-num text-[10px] font-bold">
                ETH: 18.4%
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: PORTFOLIO EQUITY GROWTH CURVE & BENCHMARK (7 COLS) */}
        <div className="lg:col-span-7 flex flex-col justify-between p-6 rounded-3xl bg-[#1F1E25] border border-white/5 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
            <div className="flex items-center gap-2">
              <ChartHistogramIcon className="w-5 h-5 text-[#00E163]" />
              <h3 className="text-sm font-extrabold text-white">Kurva Pertumbuhan Ekuitas Akun</h3>
            </div>

            {/* Timeframe Chips with 1000ms Sweep */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#18171E] border border-white/5">
              {(['7D', '30D', '90D', '1Y', 'ALL'] as const).map((tf) => {
                const isTfActive = curveTimeframe === tf;
                return (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setCurveTimeframe(tf)}
                    className={`group relative flex items-center justify-center px-3 h-7 rounded-xl text-xs font-bold font-mono-num transition-all duration-1000 overflow-hidden cursor-pointer select-none ${
                      isTfActive ? 'bg-[#00E163] text-black font-black shadow-sm' : 'text-slate-400 hover:text-black'
                    }`}
                  >
                    {!isTfActive && (
                      <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                    )}
                    <span className="relative z-10 transition-colors duration-1000">{tf}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SVG Smooth Growth Curve */}
          <div className="relative w-full h-[180px] rounded-2xl bg-[#14131A] border border-white/5 p-2 overflow-hidden flex items-center justify-center">
            <svg width="100%" height="100%" viewBox="0 0 640 180" preserveAspectRatio="none" className="w-full h-full overflow-hidden">
              <defs>
                <linearGradient id="growth-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00E163" stopOpacity="0.30" />
                  <stop offset="70%" stopColor="#00E163" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#00E163" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="45" x2="640" y2="45" stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" strokeWidth="1" />
              <line x1="0" y1="90" x2="640" y2="90" stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" strokeWidth="1" />
              <line x1="0" y1="135" x2="640" y2="135" stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" strokeWidth="1" />

              {splineData.fillPath && (
                <path d={splineData.fillPath} fill="url(#growth-grad)" />
              )}

              {splineData.path && (
                <path
                  d={splineData.path}
                  fill="none"
                  stroke="#00E163"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {splineData.lastPt && (
                <>
                  <circle cx={splineData.lastPt.x} cy={splineData.lastPt.y} r="7" fill="#00E163" opacity="0.3" className="animate-ping" />
                  <circle cx={splineData.lastPt.x} cy={splineData.lastPt.y} r="3.5" fill="#00E163" />
                </>
              )}
            </svg>
          </div>

          {/* Benchmark Performance Comparators */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-3 text-xs flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px] font-bold">Benchmark Pasar:</span>
              <button
                type="button"
                onClick={() => setBenchmarkMode(benchmarkMode === 'BTC' ? 'NONE' : 'BTC')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold font-mono-num transition-colors cursor-pointer border ${
                  benchmarkMode === 'BTC' ? 'bg-[#FFB800]/15 text-[#FFB800] border-[#FFB800]/40' : 'bg-[#18171E] text-slate-400 border-white/5'
                }`}
              >
                vs Bitcoin (+18.4%)
              </button>
              <button
                type="button"
                onClick={() => setBenchmarkMode(benchmarkMode === 'SPX' ? 'NONE' : 'SPX')}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold font-mono-num transition-colors cursor-pointer border ${
                  benchmarkMode === 'SPX' ? 'bg-[#3875F6]/15 text-[#3875F6] border-[#3875F6]/40' : 'bg-[#18171E] text-slate-400 border-white/5'
                }`}
              >
                vs S&P500 (+8.2%)
              </button>
            </div>

            <span className="text-[11px] font-bold text-[#00E163]">
              Portofolio Mengungguli Pasar: +16.8% Alpha
            </span>
          </div>
        </div>
      </div>

      {/* 3. PORTFOLIO RISK HEALTH INDEX & SAFETY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Account Health Score */}
        <div className="p-4 rounded-3xl bg-[#1F1E25] border border-white/5 flex flex-col gap-2 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Skor Kesehatan Akun</span>
            <Shield01Icon className="w-4 h-4 text-[#00E163]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono-num">96/100</span>
            <span className="text-[11px] font-extrabold text-[#00E163]">Sangat Aman</span>
          </div>
          <span className="text-[10px] text-slate-500">Margin leverage dalam batas optimal standar Binance</span>
        </div>

        {/* 2. Margin Utilization Ratio */}
        <div className="p-4 rounded-3xl bg-[#1F1E25] border border-white/5 flex flex-col gap-2 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Rasio Utilisasi Margin</span>
            <Activity01Icon className="w-4 h-4 text-[#3875F6]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#3875F6] font-mono-num">24.5%</span>
            <span className="text-[11px] font-extrabold text-slate-400">Terpakai</span>
          </div>
          <span className="text-[10px] text-slate-500">75.5% Saldo likuid siap digunakan untuk trading</span>
        </div>

        {/* 3. Liquidation Safety Buffer */}
        <div className="p-4 rounded-3xl bg-[#1F1E25] border border-white/5 flex flex-col gap-2 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Buffer Jarak Likuidasi</span>
            <Tick01Icon className="w-4 h-4 text-[#00E163]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#00E163] font-mono-num">+48.2%</span>
            <span className="text-[11px] font-extrabold text-[#00E163]">Jarak Aman</span>
          </div>
          <span className="text-[10px] text-slate-500">Posisi aktif memiliki toleransi drawdown sangat tinggi</span>
        </div>

        {/* 4. Diversification Score */}
        <div className="p-4 rounded-3xl bg-[#1F1E25] border border-white/5 flex flex-col gap-2 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Indeks Diversifikasi</span>
            <Globe02Icon className="w-4 h-4 text-[#A855F7]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#A855F7] font-mono-num">8.8/10</span>
            <span className="text-[11px] font-extrabold text-slate-300">Terdiversifikasi</span>
          </div>
          <span className="text-[10px] text-slate-500">Terdistribusi pada Kripto, Forex, dan Komoditas Emas</span>
        </div>
      </div>

      {/* FEATURE 3: MONTHLY PNL CONSISTENCY CALENDAR HEATMAP (Binance & Bybit Standard) */}
      <div className="p-6 rounded-3xl bg-[#1F1E25] border border-white/5 shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Calendar03Icon className="w-5 h-5 text-[#00E163]" />
            <h3 className="text-sm font-extrabold text-white">Kalender Konsistensi PnL Harian (30 Hari Terakhir)</h3>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono-num">
            <span className="text-[#00E163] font-bold">22 Hari Profit</span>
            <span className="text-slate-600">•</span>
            <span className="text-[#FF5C77] font-bold">6 Hari Loss</span>
            <span className="text-slate-600">•</span>
            <span className="text-white font-black">Winrate: 78.5%</span>
          </div>
        </div>

        {/* Heatmap Grid (4 Weeks x 7 Days) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 pt-1">
          {DAILY_PNL_CALENDAR.map((d) => (
            <div
              key={d.day}
              className={`p-2.5 rounded-2xl border transition-all flex flex-col justify-between h-16 ${
                d.isProfit
                  ? 'bg-[#00E163]/5 border-[#00E163]/20 hover:border-[#00E163]/60'
                  : 'bg-[#FF5C77]/5 border-[#FF5C77]/20 hover:border-[#FF5C77]/60'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-bold">{d.dateStr}</span>
                <span className={`font-mono-num font-extrabold ${d.isProfit ? 'text-[#00E163]' : 'text-[#FF5C77]'}`}>
                  {d.isProfit ? '+' : ''}{d.pnlPct}%
                </span>
              </div>
              <span className={`text-xs font-black font-mono-num ${d.isProfit ? 'text-[#00E163]' : 'text-[#FF5C77]'}`}>
                {d.isProfit ? '+' : ''}${d.pnlUsd.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. COMPLETE HOLDINGS & ASSET BREAKDOWN TABLE (All 18 Scrollable Assets) */}
      <div className="p-6 rounded-3xl bg-[#1F1E25] border border-white/5 shadow-xl flex flex-col gap-5">
        {/* Table Controls: Search, Category Filters, Small Balance Toggle */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter Chips with 1000ms Sweep */}
            {(['all', 'crypto', 'forex', 'cfd'] as const).map((cat) => {
              const isActive = selectedCategory === cat;
              const label = cat === 'all' ? 'Semua Aset' : cat === 'crypto' ? 'Kripto' : cat === 'forex' ? 'Forex' : 'CFD & Komoditas';
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`group relative flex items-center justify-center px-4 h-9 rounded-2xl text-xs font-bold transition-all duration-1000 overflow-hidden cursor-pointer select-none ${
                    isActive
                      ? 'bg-[#00E163] text-black font-black shadow-md shadow-[#00E163]/20 border border-[#00E163]'
                      : 'bg-[#18171E] text-slate-300 hover:text-black border border-white/5'
                  }`}
                >
                  {!isActive && (
                    <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                  )}
                  <span className="relative z-10 transition-colors duration-1000">{label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            {/* Hide Small Balance Custom Checkbox (Matching User Reference Image 2) */}
            <div
              onClick={() => setHideSmallBalances(!hideSmallBalances)}
              className="flex items-center gap-2 cursor-pointer select-none group py-1 px-1.5 rounded-xl hover:bg-white/5 transition-colors"
            >
              <div
                className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                  hideSmallBalances
                    ? 'bg-[#00E163] border-[#00E163]'
                    : 'border-white/20 bg-transparent group-hover:border-white/40'
                }`}
              >
                {hideSmallBalances && <Tick01Icon className="w-3 h-3 stroke-[3] text-black" />}
              </div>
              <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors">
                Sembunyikan &lt; $1
              </span>
            </div>

            {/* Search Input */}
            <div className="relative flex items-center h-9 px-3 rounded-2xl bg-[#18171E] border border-white/10 focus-within:border-[#00E163]/50 transition-colors w-48">
              <Search01Icon className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari aset..."
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Scrollable Table Content for All 18 Assets with Sticky Header */}
        <div className="max-h-[460px] overflow-y-auto overflow-x-auto custom-positions-scrollbar pr-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-30 bg-[#1F1E25] text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-white/5 shadow-md">
              <tr>
                <th className="py-3.5 px-4 bg-[#1F1E25] sticky top-0 z-30">Asset</th>
                <th className="py-3.5 px-4 bg-[#1F1E25] sticky top-0 z-30">Total Balance</th>
                <th className="py-3.5 px-4 bg-[#1F1E25] sticky top-0 z-30">Available</th>
                <th className="py-3.5 px-4 bg-[#1F1E25] sticky top-0 z-30">In Orders</th>
                <th className="py-3.5 px-4 bg-[#1F1E25] sticky top-0 z-30">USD Value</th>
                <th className="py-3.5 px-4 text-right bg-[#1F1E25] sticky top-0 z-30">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-200 font-medium">
              {filteredHoldings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-500">
                    Tidak ada aset yang sesuai dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredHoldings.map((h) => {
                  const totalVal = h.amount * h.currentPrice;

                  return (
                    <tr key={h.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Asset: Icon, Name & Symbol */}
                      <td className="py-3.5 px-4 flex items-center gap-3">
                        <MarketIcon symbol={h.symbol} size="sm" />
                        <div className="flex flex-col">
                          <span className="font-extrabold text-white text-xs">{h.name}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-mono-num">{h.symbol}</span>
                        </div>
                      </td>

                      {/* Total Balance */}
                      <td className="py-3.5 px-4 font-mono-num font-bold text-white">
                        {hideBalance ? '••••' : h.amount.toLocaleString(undefined, { minimumFractionDigits: h.decimals, maximumFractionDigits: h.decimals })}
                      </td>

                      {/* Available (Green) */}
                      <td className="py-3.5 px-4 font-mono-num font-bold text-[#00E163]">
                        {hideBalance ? '••••' : h.available.toLocaleString(undefined, { minimumFractionDigits: h.decimals, maximumFractionDigits: h.decimals })}
                      </td>

                      {/* In Orders */}
                      <td className="py-3.5 px-4 font-mono-num text-slate-400 font-medium">
                        {hideBalance ? '••••' : h.inOrderAmount.toLocaleString(undefined, { minimumFractionDigits: h.decimals, maximumFractionDigits: h.decimals })}
                      </td>

                      {/* USD Value */}
                      <td className="py-3.5 px-4 font-mono-num font-bold text-white">
                        {hideBalance ? '••••' : `$${totalVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </td>

                      {/* Actions: Trade, Transfer, Earn (Restored as requested) */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onNavigateTab ? onNavigateTab('dashboard') : onOrderSuccess?.(`Membuka pasar trading ${h.symbol}.`)}
                            className="px-2.5 py-1 rounded-xl bg-[#26252E] hover:bg-[#00E163] text-slate-300 hover:text-black text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Trade
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsTransferModalOpen(true);
                              setTransferAmount((h.amount * 0.5).toFixed(2));
                            }}
                            className="px-2.5 py-1 rounded-xl bg-[#26252E] hover:bg-white/10 text-slate-300 text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Transfer
                          </button>
                          <button
                            type="button"
                            onClick={() => onOrderSuccess?.(`Staking Earn untuk ${h.symbol} diaktifkan dengan estimasi APY +6.4%.`)}
                            className="px-2.5 py-1 rounded-xl bg-[#26252E] hover:bg-[#A855F7] text-slate-300 hover:text-white text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Earn
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. INTERNAL TRANSFER MODAL (With Custom Dropdowns & 4-Step Animated Flow) */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#1F1E25] border border-white/10 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Exchange01Icon className="w-5 h-5 text-[#00E163]" />
                <h3 className="text-sm font-extrabold text-white">Transfer Saldo Internal</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* From & To Selectors with Custom VeloceX Dropdowns */}
            <div className="flex flex-col gap-3">
              {/* FROM ACCOUNT DROPDOWN */}
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-slate-400">Dari Akun</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsFromDropdownOpen(!isFromDropdownOpen);
                    setIsToDropdownOpen(false);
                  }}
                  className="flex items-center justify-between w-full h-11 px-3.5 rounded-2xl bg-[#18171E] border border-white/10 hover:border-white/20 transition-all text-xs font-bold text-white cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: ACCOUNT_ALLOCATIONS.find((a) => a.id === transferFrom)?.color || '#00E163' }}
                    />
                    <span>{ACCOUNT_ALLOCATIONS.find((a) => a.id === transferFrom)?.name || transferFrom}</span>
                  </div>
                  <ArrowDown01Icon className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isFromDropdownOpen ? 'rotate-180 text-white' : ''}`} />
                </button>

                {isFromDropdownOpen && (
                  <div className="absolute left-0 right-0 top-[68px] bg-[#1F1E25] border border-white/10 rounded-2xl shadow-2xl p-1.5 flex flex-col gap-1 z-50 backdrop-blur-xl animate-fade-in">
                    {ACCOUNT_ALLOCATIONS.map((acc) => {
                      const isSelected = transferFrom === acc.id;
                      return (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => {
                            setTransferFrom(acc.id);
                            setIsFromDropdownOpen(false);
                          }}
                          className={`group relative flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-xs font-bold overflow-hidden transition-all duration-1000 cursor-pointer ${
                            isSelected
                              ? 'bg-[#00E163] text-black font-black shadow-sm'
                              : 'text-slate-300 hover:text-black'
                          }`}
                        >
                          {!isSelected && (
                            <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                          )}
                          <div className="relative z-10 flex items-center gap-2 transition-colors duration-1000">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: acc.color }} />
                            <span>{acc.name}</span>
                          </div>
                          {isSelected && <Tick01Icon className="relative z-10 w-4 h-4 text-black stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SWAP DIRECTION BUTTON */}
              <div className="relative flex items-center justify-center -my-1 z-20">
                <div className="w-full h-[1px] bg-white/5" />
                <button
                  type="button"
                  onClick={handleSwapTransferAccounts}
                  className={`absolute flex items-center justify-center w-8 h-8 rounded-full bg-[#18171E] border border-white/10 hover:border-[#00E163] text-slate-300 hover:text-[#00E163] transition-all duration-300 cursor-pointer shadow-lg active:scale-90 ${
                    isSwapping ? 'rotate-180 text-[#00E163] border-[#00E163] scale-110' : ''
                  }`}
                  title="Tukar Arah Transfer"
                >
                  <ArrowUpDownIcon className="w-4 h-4" />
                </button>
              </div>

              {/* TO ACCOUNT DROPDOWN */}
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-slate-400">Ke Akun Tujuan</label>
                <button
                  type="button"
                  onClick={() => {
                    setIsToDropdownOpen(!isToDropdownOpen);
                    setIsFromDropdownOpen(false);
                  }}
                  className="flex items-center justify-between w-full h-11 px-3.5 rounded-2xl bg-[#18171E] border border-white/10 hover:border-white/20 transition-all text-xs font-bold text-white cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: ACCOUNT_ALLOCATIONS.find((a) => a.id === transferTo)?.color || '#3875F6' }}
                    />
                    <span>{ACCOUNT_ALLOCATIONS.find((a) => a.id === transferTo)?.name || transferTo}</span>
                  </div>
                  <ArrowDown01Icon className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isToDropdownOpen ? 'rotate-180 text-white' : ''}`} />
                </button>

                {isToDropdownOpen && (
                  <div className="absolute left-0 right-0 top-[68px] bg-[#1F1E25] border border-white/10 rounded-2xl shadow-2xl p-1.5 flex flex-col gap-1 z-50 backdrop-blur-xl animate-fade-in">
                    {ACCOUNT_ALLOCATIONS.map((acc) => {
                      const isSelected = transferTo === acc.id;
                      return (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => {
                            setTransferTo(acc.id);
                            setIsToDropdownOpen(false);
                          }}
                          className={`group relative flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-xs font-bold overflow-hidden transition-all duration-1000 cursor-pointer ${
                            isSelected
                              ? 'bg-[#00E163] text-black font-black shadow-sm'
                              : 'text-slate-300 hover:text-black'
                          }`}
                        >
                          {!isSelected && (
                            <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                          )}
                          <div className="relative z-10 flex items-center gap-2 transition-colors duration-1000">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: acc.color }} />
                            <span>{acc.name}</span>
                          </div>
                          {isSelected && <Tick01Icon className="relative z-10 w-4 h-4 text-black stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-400">Jumlah Transfer (USDT)</label>
                  <span className="text-[10px] text-slate-500 font-mono-num">Biaya: $0.00 (Gratis)</span>
                </div>
                <div className="relative flex items-center h-11 px-3.5 rounded-2xl bg-[#18171E] border border-white/10 focus-within:border-[#00E163]/50">
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="100"
                    className="w-full bg-transparent text-xs font-bold text-white font-mono-num focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setTransferAmount('2500')}
                    className="text-[10px] font-black text-[#00E163] hover:underline cursor-pointer"
                  >
                    MAX
                  </button>
                </div>
              </div>
            </div>

            {/* Confirm Transfer Action Buttons with 4-Step Animated Flow */}
            <div className="flex items-center gap-3 pt-3">
              {transferPhase === 'idle' && (
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="w-28 py-3 rounded-2xl bg-[#26252E] hover:bg-white/10 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
                >
                  Batal
                </button>
              )}

              {/* Confirm Transfer Action Button with 4-Step Animated Motion */}
              <button
                type="button"
                onClick={handleExecuteTransfer}
                disabled={transferPhase !== 'idle'}
                className="relative flex-1 h-12 rounded-2xl overflow-hidden font-black text-xs transition-all duration-300 cursor-pointer flex items-center justify-center bg-white/5 hover:bg-white/10 text-white select-none shadow-lg border border-white/5 group"
              >
                {/* 1. Green Progress Fill from Left to Right (700ms) */}
                <div
                  className={`absolute left-0 top-0 bottom-0 bg-[#00E163] shadow-lg shadow-[#00E163]/30 transition-all ease-out pointer-events-none ${
                    transferPhase === 'idle'
                      ? 'w-0'
                      : 'w-full duration-700'
                  }`}
                />

                {/* Initial Idle Text "Konfirmasi Transfer" */}
                {transferPhase === 'idle' && (
                  <span className="relative z-10 transition-opacity duration-300 text-white group-hover:text-white uppercase tracking-wider text-xs font-black">
                    Konfirmasi Transfer
                  </span>
                )}

                {/* Step 1: While filling progress bar */}
                {transferPhase === 'progress' && (
                  <span className="relative z-10 text-black font-black tracking-wider text-xs animate-pulse">
                    Memproses Transfer...
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
                        Transfer Berhasil
                      </span>
                    </div>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FEATURE 2: CONVERT DUST BALANCES MODAL (Binance & Bybit Standard) */}
      {isDustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-[#1F1E25] border border-white/10 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-[#FFB800]" />
                <h3 className="text-sm font-extrabold text-white">Konversi Saldo Debu ke USDT</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDustModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <Cancel01Icon className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <p>Pilih aset yang ingin dikonversi menjadi saldo liquid USDT (0% Fee):</p>
              <button
                type="button"
                onClick={() => {
                  const allIds = holdings.map((h) => h.id);
                  if (selectedDustIds.length === allIds.length) {
                    setSelectedDustIds([]);
                  } else {
                    setSelectedDustIds(allIds);
                  }
                }}
                className="text-[11px] font-bold text-[#00E163] hover:underline cursor-pointer select-none"
              >
                {selectedDustIds.length === holdings.length ? 'Batal Pilih Semua' : 'Pilih Semua (18 Aset)'}
              </button>
            </div>

            {/* Scrollable List of All 18 Assets */}
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto custom-positions-scrollbar pr-1">
              {holdings.map((h) => {
                const isSelected = selectedDustIds.includes(h.id);
                const val = h.amount * h.currentPrice;
                return (
                  <div
                    key={h.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedDustIds(selectedDustIds.filter((id) => id !== h.id));
                      } else {
                        setSelectedDustIds([...selectedDustIds, h.id]);
                      }
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between select-none ${
                      isSelected ? 'bg-[#00E163]/10 border-[#00E163]' : 'bg-[#18171E] border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                          isSelected ? 'bg-[#00E163] border-[#00E163]' : 'border-white/20 bg-transparent'
                        }`}
                      >
                        {isSelected && <Tick01Icon className="w-3 h-3 stroke-[3] text-black" />}
                      </div>
                      <MarketIcon symbol={h.symbol} size="sm" />
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-xs">{h.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono-num">{h.amount.toLocaleString(undefined, { minimumFractionDigits: h.decimals })} {h.symbol}</span>
                      </div>
                    </div>

                    <div className="flex flex-col text-right font-mono-num">
                      <span className="text-xs font-black text-white">${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      <span className="text-[10px] text-[#00E163] font-bold">Est. USDT: ~${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Estimated USDT Output */}
            <div className="p-3.5 rounded-2xl bg-[#14131A] border border-white/5 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-400">Total Estimasi Diterima ({selectedDustIds.length} Aset Dipilih):</span>
              <span className="font-black text-base text-[#00E163] font-mono-num">
                ~${holdings
                  .filter((h) => selectedDustIds.includes(h.id))
                  .reduce((sum, h) => sum + h.amount * h.currentPrice, 0)
                  .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
              </span>
            </div>

            {/* Action Buttons with 4-Step Animated Flow */}
            <div className="flex items-center gap-3 pt-2">
              {dustPhase === 'idle' && (
                <button
                  type="button"
                  onClick={() => setIsDustModalOpen(false)}
                  className="w-28 py-3 rounded-2xl bg-[#26252E] hover:bg-white/10 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
                >
                  Batal
                </button>
              )}

              {/* Confirm Dust Conversion Action Button with 4-Step Animated Motion */}
              <button
                type="button"
                onClick={handleExecuteConvertDust}
                disabled={dustPhase !== 'idle'}
                className="relative flex-1 h-12 rounded-2xl overflow-hidden font-black text-xs transition-all duration-300 cursor-pointer flex items-center justify-center bg-white/5 hover:bg-white/10 text-white select-none shadow-lg border border-white/5 group"
              >
                {/* 1. Green Progress Fill from Left to Right (700ms) */}
                <div
                  className={`absolute left-0 top-0 bottom-0 bg-[#00E163] shadow-lg shadow-[#00E163]/30 transition-all ease-out pointer-events-none ${
                    dustPhase === 'idle'
                      ? 'w-0'
                      : 'w-full duration-700'
                  }`}
                />

                {/* Initial Idle Text "Konversi Sekarang" */}
                {dustPhase === 'idle' && (
                  <span className="relative z-10 flex items-center gap-1.5 transition-opacity duration-300 text-white group-hover:text-white uppercase tracking-wider text-xs font-black">
                    <SparklesIcon className="w-4 h-4 text-[#FFB800]" />
                    <span>Konversi Sekarang</span>
                  </span>
                )}

                {/* Step 1: While filling progress bar */}
                {dustPhase === 'progress' && (
                  <span className="relative z-10 text-black font-black tracking-wider text-xs animate-pulse">
                    Mengonversi ke USDT...
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
                        Konversi Berhasil
                      </span>
                    </div>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
