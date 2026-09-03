'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Award01Icon,
  Copy01Icon,
  Message01Icon,
  SparklesIcon,
  Search01Icon,
  FilterIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  StarIcon,
  CheckmarkCircle01Icon,
  Shield01Icon,
  SentIcon,
  Share01Icon,
  ThumbsUpIcon,
  BubbleChatIcon,
  Tick01Icon,
  ChartLineData01Icon,
  FireIcon,
  FlashIcon,
  CpuIcon,
} from 'hugeicons-react';

import { CopyTradingModal, MasterTrader } from './CopyTradingModal';
import { MasterTraderDetailModal } from './MasterTraderDetailModal';
import { BecomeMasterTraderModal } from './BecomeMasterTraderModal';
import { FeedCommentsModal, FeedComment } from './FeedCommentsModal';

// Rich Mock Dataset of VeloceX Master Traders with Sparklines & Allocations
const INITIAL_MASTER_TRADERS: MasterTrader[] = [
  {
    id: 'trader-1',
    name: 'Alexandre_Quant',
    avatar: 'AQ',
    badge: 'VIP Master',
    badgeColor: 'bg-amber-400/10 text-amber-400 border border-amber-400/30',
    quickTag: 'bot',
    style: 'Algo Bot',
    roi7d: 18.4,
    roi30d: 84.6,
    roi90d: 215.2,
    winRate: 88.5,
    totalPnl: 48520.0,
    maxDrawdown: 6.2,
    copiers: 485,
    maxCopiers: 500,
    aum: 420000,
    profitShare: 10,
    tradesCount: 342,
    bio: 'Algorithmic grid & momentum bot pada pair likuiditas tinggi (BTC, ETH, SOL). Disiplin stop loss ketat 1.5% per order.',
    pairs: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'],
    sparkline: [10, 18, 14, 26, 38, 30, 52, 65, 58, 74, 68, 81, 76, 84.6],
    assetAllocations: [
      { symbol: 'BTC/USDT', percent: 60, color: '#F7931A' },
      { symbol: 'ETH/USDT', percent: 25, color: '#627EEA' },
      { symbol: 'SOL/USDT', percent: 15, color: '#14F195' },
    ],
  },
  {
    id: 'trader-2',
    name: 'Satoshi_Sniper',
    avatar: 'SS',
    badge: 'Top Scalper',
    badgeColor: 'bg-[#00E163]/10 text-[#00E163] border border-[#00E163]/30',
    quickTag: 'top',
    style: 'Scalping',
    roi7d: 24.2,
    roi30d: 112.4,
    roi90d: 340.8,
    winRate: 82.1,
    totalPnl: 65140.0,
    maxDrawdown: 9.8,
    copiers: 498,
    maxCopiers: 500,
    aum: 580000,
    profitShare: 12,
    tradesCount: 890,
    bio: 'Scalping timeframe 1m-5m memanfaatkan rejection orderbook depth & imbalance spread. High frequency, quick profit.',
    pairs: ['SOL/USDT', 'AVAX/USDT', 'NEAR/USDT', 'DOGE/USDT'],
    sparkline: [14, 25, 19, 36, 52, 42, 68, 86, 75, 96, 88, 106, 98, 112.4],
    assetAllocations: [
      { symbol: 'SOL/USDT', percent: 45, color: '#14F195' },
      { symbol: 'AVAX/USDT', percent: 25, color: '#E84142' },
      { symbol: 'NEAR/USDT', percent: 20, color: '#00E163' },
      { symbol: 'DOGE/USDT', percent: 10, color: '#C2A633' },
    ],
  },
  {
    id: 'trader-3',
    name: 'Macro_Vanguard',
    avatar: 'MV',
    badge: 'Swing King',
    badgeColor: 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/30',
    quickTag: 'low_risk',
    style: 'Swing Trading',
    roi7d: 8.5,
    roi30d: 54.2,
    roi90d: 148.0,
    winRate: 76.4,
    totalPnl: 32400.0,
    maxDrawdown: 4.8,
    copiers: 320,
    maxCopiers: 400,
    aum: 310000,
    profitShare: 10,
    tradesCount: 115,
    bio: 'Analisis fundamental makroekonomi & struktur pasar H4-Daily. Rasio Risk-to-Reward minimal 1:3 dengan posisi multi-hari.',
    pairs: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT'],
    sparkline: [6, 12, 9, 18, 26, 21, 32, 40, 35, 45, 41, 50, 47, 54.2],
    assetAllocations: [
      { symbol: 'BTC/USDT', percent: 70, color: '#F7931A' },
      { symbol: 'ETH/USDT', percent: 20, color: '#627EEA' },
      { symbol: 'BNB/USDT', percent: 10, color: '#F3BA2F' },
    ],
  },
  {
    id: 'trader-4',
    name: 'Elena_DayTrader',
    avatar: 'ED',
    badge: 'Pro Trader',
    badgeColor: 'bg-purple-400/10 text-purple-400 border border-purple-400/30',
    quickTag: 'high_freq',
    style: 'Day Trading',
    roi7d: 14.8,
    roi30d: 68.9,
    roi90d: 172.5,
    winRate: 79.8,
    totalPnl: 28900.0,
    maxDrawdown: 7.5,
    copiers: 260,
    maxCopiers: 350,
    aum: 240000,
    profitShare: 10,
    tradesCount: 280,
    bio: 'Spesialis breakout sesi London & New York overlap. Menghindari posisi hold overnight untuk meminimalisir funding fee.',
    pairs: ['ETH/USDT', 'SOL/USDT', 'SUI/USDT'],
    sparkline: [8, 16, 12, 24, 35, 28, 44, 54, 47, 59, 53, 64, 60, 68.9],
    assetAllocations: [
      { symbol: 'ETH/USDT', percent: 50, color: '#627EEA' },
      { symbol: 'SOL/USDT', percent: 35, color: '#14F195' },
      { symbol: 'SUI/USDT', percent: 15, color: '#4DA2FF' },
    ],
  },
  {
    id: 'trader-5',
    name: 'Zenith_Futures',
    avatar: 'ZF',
    badge: 'VIP Master',
    badgeColor: 'bg-amber-400/10 text-amber-400 border border-amber-400/30',
    quickTag: 'low_risk',
    style: 'Algo Bot',
    roi7d: 11.2,
    roi30d: 49.5,
    roi90d: 130.2,
    winRate: 85.0,
    totalPnl: 21500.0,
    maxDrawdown: 3.9,
    copiers: 195,
    maxCopiers: 300,
    aum: 185000,
    profitShare: 10,
    tradesCount: 190,
    bio: 'Low risk statistical arbitrage bot. Max drawdown sangat rendah (<4%). Sangat cocok untuk investor modal besar yang konservatif.',
    pairs: ['BTC/USDT', 'ETH/USDT'],
    sparkline: [5, 11, 8, 16, 24, 19, 29, 37, 32, 41, 38, 45, 42, 49.5],
    assetAllocations: [
      { symbol: 'BTC/USDT', percent: 65, color: '#F7931A' },
      { symbol: 'ETH/USDT', percent: 35, color: '#627EEA' },
    ],
  },
  {
    id: 'trader-6',
    name: 'Crypto_Hawk',
    avatar: 'CH',
    badge: 'Top Gainer',
    badgeColor: 'bg-[#00E163]/10 text-[#00E163] border border-[#00E163]/30',
    quickTag: 'high_freq',
    style: 'Scalping',
    roi7d: 31.5,
    roi30d: 128.0,
    roi90d: 295.4,
    winRate: 74.2,
    totalPnl: 41200.0,
    maxDrawdown: 11.4,
    copiers: 380,
    maxCopiers: 450,
    aum: 340000,
    profitShare: 15,
    tradesCount: 610,
    bio: 'Aggressive price action trader pada koin volatilitas tinggi. Target profit cepat dengan leverage terukur 10x-20x.',
    pairs: ['SOL/USDT', 'PEPE/USDT', 'WIF/USDT', 'DOGE/USDT'],
    sparkline: [16, 30, 22, 44, 65, 52, 82, 102, 90, 114, 102, 122, 114, 128.0],
    assetAllocations: [
      { symbol: 'SOL/USDT', percent: 40, color: '#14F195' },
      { symbol: 'PEPE/USDT', percent: 25, color: '#55AC5E' },
      { symbol: 'WIF/USDT', percent: 20, color: '#E1B057' },
      { symbol: 'DOGE/USDT', percent: 15, color: '#C2A633' },
    ],
  },
];

// Helper: Catmull-Rom Cubic Bezier Spline Path Generator with Boundary Clamping
const getCatmullRomSplinePath = (
  pts: { x: number; y: number }[],
  minY: number,
  maxY: number
) => {
  if (pts.length < 2) return '';
  const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? 0 : i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 5.5;
    const cp1y = clamp(p1.y + (p2.y - p0.y) / 5.5, minY, maxY);
    const cp2x = p2.x - (p3.x - p1.x) / 5.5;
    const cp2y = clamp(p2.y - (p3.y - p1.y) / 5.5, minY, maxY);

    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
};

// SVG Sparkline Component (High-End Smooth Bezier Spline with Bound Safety)
const TraderSparkline: React.FC<{ data: number[]; isPositive?: boolean }> = ({
  data,
  isPositive = true,
}) => {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 280;
  const height = 75;
  const paddingX = 10;
  const paddingTop = 12;
  const paddingBottom = 10;

  const pts = data.map((val, idx) => {
    const x = paddingX + (idx / (data.length - 1)) * (width - 2 * paddingX);
    const y = height - paddingBottom - ((val - min) / range) * (height - paddingTop - paddingBottom);
    return { x, y };
  });

  const smoothCurve = getCatmullRomSplinePath(pts, paddingTop, height - paddingBottom);
  const strokeColor = isPositive ? '#00E163' : '#FF5C77';
  const lastPt = pts[pts.length - 1];
  const fillPath = `${smoothCurve} L ${lastPt.x.toFixed(2)} ${height} L ${pts[0].x.toFixed(2)} ${height} Z`;

  return (
    <div className="w-full h-20 relative flex items-center justify-center overflow-hidden rounded-2xl bg-[#14131A]/80 border border-white/[0.04] p-1">
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-full overflow-hidden">
        <defs>
          <linearGradient id={`spark-grad-${isPositive ? 'pos' : 'neg'}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.4" />
            <stop offset="60%" stopColor={strokeColor} stopOpacity="0.12" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* 3 Horizontal Dashed Guide Grid Lines */}
        <line x1="0" y1="20" x2={width} y2="20" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" strokeWidth="1" />
        <line x1="0" y1="40" x2={width} y2="40" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" strokeWidth="1" />
        <line x1="0" y1="60" x2={width} y2="60" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" strokeWidth="1" />

        {/* Gradient Fill Under the Wave */}
        <path d={fillPath} fill={`url(#spark-grad-${isPositive ? 'pos' : 'neg'})`} />

        {/* Smooth Bezier Line Wave */}
        <path
          d={smoothCurve}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Glowing End Peak Dot */}
        <circle
          cx={lastPt.x}
          cy={lastPt.y}
          r="3"
          fill={strokeColor}
        />
      </svg>
    </div>
  );
};

// User Active Copies
interface ActiveCopy {
  id: string;
  traderId: string;
  traderName: string;
  traderAvatar: string;
  allocatedMargin: number;
  floatingPnl: number;
  floatingPnlPct: number;
  realizedPnl: number;
  stopLossPct: number;
  leverageMode: string;
  startDate: string;
}

const INITIAL_USER_COPIES: ActiveCopy[] = [
  {
    id: 'copy-1',
    traderId: 'trader-1',
    traderName: 'Alexandre_Quant',
    traderAvatar: 'AQ',
    allocatedMargin: 500,
    floatingPnl: 42.5,
    floatingPnlPct: 8.5,
    realizedPnl: 128.4,
    stopLossPct: 15,
    leverageMode: 'Follow Master',
    startDate: '2026-08-20',
  },
  {
    id: 'copy-2',
    traderId: 'trader-2',
    traderName: 'Satoshi_Sniper',
    traderAvatar: 'SS',
    allocatedMargin: 300,
    floatingPnl: 18.2,
    floatingPnlPct: 6.07,
    realizedPnl: 85.0,
    stopLossPct: 15,
    leverageMode: 'Follow Master',
    startDate: '2026-08-25',
  },
];

// Community Social Feed Posts
interface FeedPost {
  id: string;
  author: string;
  avatar: string;
  badge: string;
  time: string;
  content: string;
  signal?: {
    pair: string;
    type: 'LONG' | 'SHORT';
    entry: string;
    target: string;
    stopLoss: string;
    leverage: string;
  };
  likes: number;
  comments: number;
  isLiked: boolean;
  commentList: FeedComment[];
}

const INITIAL_FEED_POSTS: FeedPost[] = [
  {
    id: 'post-1',
    author: 'Alexandre_Quant',
    avatar: 'AQ',
    badge: 'VIP Master',
    time: '20 menit lalu',
    content:
      'BTC berhasil breakout dari pola Bull Flag di timeframe H4 dengan volume spike yang sangat sehat. Kami baru saja menambah posisi Long untuk seluruh copier dengan target $69,500.',
    signal: {
      pair: 'BTC/USDT',
      type: 'LONG',
      entry: '$67,400',
      target: '$69,500',
      stopLoss: '$66,200',
      leverage: '20x Cross',
    },
    likes: 64,
    comments: 3,
    isLiked: false,
    commentList: [
      { id: 'c1', author: 'CryptoWhale_ID', avatar: 'CW', badge: 'PRO', time: '15m lalu', content: 'Entry sudah masuk gan, target $69.5k sangat masuk akal sebelum weekly close.', likes: 4, isLiked: false },
      { id: 'c2', author: 'TraderSantuy', avatar: 'TS', time: '10m lalu', content: 'Mantap master Alexandre, PnL saya sudah hijau +14% hari ini.', likes: 2, isLiked: false },
      { id: 'c3', author: 'Budi_Futures', avatar: 'BF', time: '5m lalu', content: 'Apakah stop loss perlu digeser ke breakeven (BEP)?', likes: 1, isLiked: false },
    ],
  },
  {
    id: 'post-2',
    author: 'Satoshi_Sniper',
    avatar: 'SS',
    badge: 'Top Scalper',
    time: '1 jam lalu',
    content:
      'SOL sedang menguji resisten kuat $185.0. Kami melihat ada orderbook imbalance di sisi ask. Siap-siap entry scalping cepat jika candle 15m close di atas $185.5!',
    signal: {
      pair: 'SOL/USDT',
      type: 'LONG',
      entry: '$185.50',
      target: '$192.00',
      stopLoss: '$182.80',
      leverage: '15x Isolated',
    },
    likes: 42,
    comments: 2,
    isLiked: false,
    commentList: [
      { id: 'c4', author: 'SolanaLover', avatar: 'SL', time: '40m lalu', content: 'Siap eksekusi sinyalnya master! Menunggu candle close.', likes: 3, isLiked: false },
      { id: 'c5', author: 'Dika_Trader', avatar: 'DT', time: '20m lalu', content: 'Volume SOL 24h naik 30%, momentumnya kencang.', likes: 1, isLiked: false },
    ],
  },
  {
    id: 'post-3',
    author: 'Macro_Vanguard',
    avatar: 'MV',
    badge: 'Swing King',
    time: '3 jam lalu',
    content:
      'Data inflasi AS (CPI) akan dirilis minggu depan. Volatilitas pasar diperkirakan meningkat tajam. Kami menyarankan copier untuk mengatur Stop Loss maksimal 10% dan menjaga margin rasio sehat.',
    likes: 89,
    comments: 1,
    isLiked: true,
    commentList: [
      { id: 'c6', author: 'InvestMakro', avatar: 'IM', badge: 'VIP', time: '2 jam lalu', content: 'Setuju, cash is king sebelum rilis CPI untuk hindari fake breakout.', likes: 5, isLiked: false },
    ],
  },
];

// Filter Options
const STYLE_FILTER_OPTIONS = [
  { id: 'all', label: 'Semua Gaya Trading' },
  { id: 'Scalping', label: 'Scalping' },
  { id: 'Day Trading', label: 'Day Trading' },
  { id: 'Swing Trading', label: 'Swing Trading' },
  { id: 'Algo Bot', label: 'Algo Bot' },
];

const SORT_OPTIONS = [
  { id: 'roi', label: 'ROI Tertinggi' },
  { id: 'winRate', label: 'Win Rate Tertinggi' },
  { id: 'copiers', label: 'Copier Terbanyak' },
  { id: 'aum', label: 'AUM Terbesar' },
  { id: 'drawdown', label: 'Drawdown Terendah' },
];

interface CommunityViewProps {
  onOrderSuccess?: (msg: string) => void;
  onNavigateTab?: (newTab: string) => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  onOrderSuccess,
  onNavigateTab,
}) => {
  // Navigation sub-tabs: 'leaderboard' | 'my_copies' | 'feed' | 'apply_master'
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'my_copies' | 'feed' | 'apply_master'>('leaderboard');

  // Master Trader State
  const [masterTraders, setMasterTraders] = useState<MasterTrader[]>(INITIAL_MASTER_TRADERS);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [selectedStyle, setSelectedStyle] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'roi' | 'winRate' | 'copiers' | 'aum' | 'drawdown'>('roi');
  const [searchQuery, setSearchQuery] = useState('');

  // Dropdown Floating Open States
  const [isStyleFilterOpen, setIsStyleFilterOpen] = useState(false);
  const [isSortFilterOpen, setIsSortFilterOpen] = useState(false);

  // Modals state
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [selectedTraderForCopy, setSelectedTraderForCopy] = useState<MasterTrader | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTraderForDetail, setSelectedTraderForDetail] = useState<MasterTrader | null>(null);

  const [isApplyMasterModalOpen, setIsApplyMasterModalOpen] = useState(false);
  const [isMasterRegistered, setIsMasterRegistered] = useState<boolean>(false);

  // User Active Copies
  const [userCopies, setUserCopies] = useState<ActiveCopy[]>(INITIAL_USER_COPIES);

  // Social Feed Posts State
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>(INITIAL_FEED_POSTS);
  const [newPostText, setNewPostText] = useState('');

  // Interactive Comments Modal State (Binance Square Standard)
  const [selectedPostForComments, setSelectedPostForComments] = useState<FeedPost | null>(null);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState<boolean>(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.relative')) {
        setIsStyleFilterOpen(false);
        setIsSortFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check master registered state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('velocx_is_master_registered');
      if (saved === 'true') {
        setIsMasterRegistered(true);
      }
    } catch (e) {}
  }, []);

  // Filter & Sort Master Traders
  const filteredTraders = masterTraders
    .filter((trader) => {
      const matchesStyle = selectedStyle === 'all' || trader.style === selectedStyle;
      const matchesSearch =
        trader.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trader.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trader.pairs.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStyle && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'roi') {
        const roiA = selectedPeriod === '7d' ? a.roi7d : selectedPeriod === '30d' ? a.roi30d : a.roi90d;
        const roiB = selectedPeriod === '7d' ? b.roi7d : selectedPeriod === '30d' ? b.roi30d : b.roi90d;
        return roiB - roiA;
      }
      if (sortBy === 'winRate') return b.winRate - a.winRate;
      if (sortBy === 'copiers') return b.copiers - a.copiers;
      if (sortBy === 'aum') return b.aum - a.aum;
      if (sortBy === 'drawdown') return a.maxDrawdown - b.maxDrawdown;
      return 0;
    });

  // Handle Confirm Copy
  const handleConfirmCopy = (
    traderId: string,
    amount: number,
    stopLossPercent: number,
    leverageMode: string
  ) => {
    const target = masterTraders.find((t) => t.id === traderId);
    if (!target) return;

    const newCopy: ActiveCopy = {
      id: `copy-${Date.now()}`,
      traderId: target.id,
      traderName: target.name,
      traderAvatar: target.avatar,
      allocatedMargin: amount,
      floatingPnl: 0,
      floatingPnlPct: 0,
      realizedPnl: 0,
      stopLossPct: stopLossPercent,
      leverageMode,
      startDate: new Date().toISOString().split('T')[0],
    };

    setUserCopies([newCopy, ...userCopies]);
    setMasterTraders((prev) =>
      prev.map((t) => (t.id === traderId ? { ...t, copiers: t.copiers + 1 } : t))
    );
  };

  // Handle Stop Copy
  const handleStopCopy = (copyId: string, traderName: string) => {
    setUserCopies((prev) => prev.filter((c) => c.id !== copyId));
    showToast(`Berhenti menyalin ${traderName}. Seluruh sisa margin telah dikembalikan ke Dompet.`);
  };

  // Handle Create Post in Feed
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newPost: FeedPost = {
      id: `post-${Date.now()}`,
      author: 'Anda (Trader)',
      avatar: 'ME',
      badge: 'PRO',
      time: 'Baru saja',
      content: newPostText,
      likes: 0,
      comments: 0,
      isLiked: false,
      commentList: [],
    };

    setFeedPosts([newPost, ...feedPosts]);
    setNewPostText('');
    showToast('Postingan Anda berhasil dibagikan ke Komunitas VeloceX!');
  };

  // Handle Toggle Like on Post
  const handleToggleLike = (postId: string) => {
    setFeedPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              isLiked: !post.isLiked,
            }
          : post
      )
    );
  };

  // Handle Add Comment in Comments Modal
  const handleAddCommentToPost = (postId: string, text: string) => {
    const newCommentObj: FeedComment = {
      id: `c_${Date.now()}`,
      author: 'Anda (Trader)',
      avatar: 'ME',
      badge: 'PRO',
      time: 'Baru saja',
      content: text,
      likes: 0,
      isLiked: false,
    };

    setFeedPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              comments: p.comments + 1,
              commentList: [newCommentObj, ...p.commentList],
            }
          : p
      )
    );

    if (selectedPostForComments && selectedPostForComments.id === postId) {
      setSelectedPostForComments({
        ...selectedPostForComments,
        comments: selectedPostForComments.comments + 1,
        commentList: [newCommentObj, ...selectedPostForComments.commentList],
      });
    }
  };

  // Quick Badge Helper for Master Trader Card (Pure HugeIcons, No Emojis)
  const renderQuickBadge = (trader: MasterTrader) => {
    if (trader.quickTag === 'top') {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border bg-amber-400/10 text-amber-400 border-amber-400/30">
          <FireIcon className="w-3 h-3 text-amber-400" />
          <span>Top Performer</span>
        </span>
      );
    }
    if (trader.quickTag === 'low_risk' || trader.maxDrawdown <= 5) {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border bg-emerald-400/10 text-emerald-400 border-emerald-400/30">
          <Shield01Icon className="w-3 h-3 text-emerald-400" />
          <span>Low Risk</span>
        </span>
      );
    }
    if (trader.quickTag === 'high_freq' || trader.style === 'Scalping') {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border bg-cyan-400/10 text-cyan-400 border-cyan-400/30">
          <FlashIcon className="w-3 h-3 text-cyan-400" />
          <span>High Frequency</span>
        </span>
      );
    }
    if (trader.quickTag === 'bot' || trader.style === 'Algo Bot') {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border bg-purple-400/10 text-purple-400 border-purple-400/30">
          <CpuIcon className="w-3 h-3 text-purple-400" />
          <span>Bot Strategy</span>
        </span>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1600px] mx-auto w-full font-sans animate-fade-in text-slate-100">
      {/* TOAST POPUP */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[99999] flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[#1F1E25] border border-[#00E163]/40 text-white shadow-2xl backdrop-blur-xl animate-bounce-short">
          <CheckmarkCircle01Icon className="w-5 h-5 text-[#00E163] shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* 1. HERO HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#18171E] via-[#1F1E25] to-[#18171E] border border-white/5 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        {/* Glow Ambient */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00E163]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-2 z-10 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#00E163]/10 text-[#00E163] border border-[#00E163]/30 tracking-wider uppercase">
              VeloceX Copy & Social Hub
            </span>
            <span className="text-xs text-slate-400">• Standar Bursa Global Tier-1</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight font-heading">
            Salin Trader Profesional & Dapatkan Profit Konsisten
          </h1>

          <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
            Pilih dari ratusan Master Trader terverifikasi dengan rekam jejak transparan, otomatisasi eksekusi tanpa delay, dan proteksi Stop Loss risiko terukur.
          </p>
        </div>

        {/* Master Trader Application Header Button */}
        <div className="flex items-center gap-3 z-10 shrink-0">
          {isMasterRegistered ? (
            <div className="flex items-center gap-2 px-6 h-12 rounded-2xl bg-[#00E163]/10 border border-[#00E163]/30 text-[#00E163] font-black text-xs">
              <CheckmarkCircle01Icon className="w-4 h-4 text-[#00E163]" />
              <span>Pendaftaran Sedang Ditinjau</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsApplyMasterModalOpen(true)}
              className="group relative flex items-center justify-center gap-2 px-6 h-12 rounded-2xl bg-[#26252E] hover:bg-[#00E163] text-white hover:text-black font-extrabold text-xs shadow-lg transition-all duration-1000 overflow-hidden cursor-pointer border border-white/5"
            >
              <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
              <span className="relative z-10 flex items-center gap-2 transition-colors duration-1000">
                <Award01Icon className="w-4 h-4 text-amber-400 group-hover:text-black transition-colors duration-1000" />
                <span>Daftar Menjadi Master</span>
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 2. SUB-NAVIGATION TABS (LEADERBOARD, MY COPIES, FEED, APPLY) */}
      <div className="flex flex-wrap items-center gap-2.5 p-2 rounded-2xl bg-[#1F1E25] border border-white/5 w-fit">
        {[
          { id: 'leaderboard', label: 'Leaderboard Master', icon: Award01Icon },
          { id: 'my_copies', label: 'Portofolio Copy', icon: Copy01Icon, count: userCopies.length },
          { id: 'feed', label: 'Feed & Sinyal Komunitas', icon: Message01Icon },
          { id: 'apply_master', label: 'Program Master Trader', icon: SparklesIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`group relative flex items-center justify-center gap-2.5 px-6 h-11 rounded-2xl text-xs font-bold transition-all duration-1000 overflow-hidden cursor-pointer select-none ${
                isActive
                  ? 'bg-[#00E163] text-black shadow-lg shadow-[#00E163]/25 font-black border border-[#00E163]'
                  : 'bg-[#18171E] text-slate-300 hover:text-black border border-white/5'
              }`}
            >
              {!isActive && (
                <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
              )}
              <span className="relative z-10 flex items-center gap-2.5 transition-colors duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                    isActive ? 'text-black stroke-[2.5]' : 'text-slate-400 group-hover:text-black'
                  }`}
                />
                <span className="whitespace-nowrap">{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`ml-0.5 px-2 py-0.5 rounded-full text-[10px] font-mono-num font-extrabold transition-colors duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                      isActive
                        ? 'bg-black text-[#00E163]'
                        : 'bg-[#26252E] text-slate-300 group-hover:bg-black group-hover:text-[#00E163]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. TAB 1: LEADERBOARD MASTER TRADER */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-5">
          {/* 4 Summary Metric Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-3xl bg-[#1F1E25] border border-white/5 flex flex-col gap-1">
              <span className="text-xs text-slate-400 font-bold">Total AUM Copy Trading</span>
              <span className="text-xl font-black text-white font-mono-num">$2,075,000</span>
              <span className="text-[10px] text-[#00E163] font-mono-num">+18.5% bulan ini</span>
            </div>

            <div className="p-4 rounded-3xl bg-[#1F1E25] border border-white/5 flex flex-col gap-1">
              <span className="text-xs text-slate-400 font-bold">Master Trader Aktif</span>
              <span className="text-xl font-black text-white font-mono-num">148 Trader</span>
              <span className="text-[10px] text-slate-500">Terverifikasi KYC & Audit</span>
            </div>

            <div className="p-4 rounded-3xl bg-[#1F1E25] border border-white/5 flex flex-col gap-1">
              <span className="text-xs text-slate-400 font-bold">Rata-rata Win Rate 30D</span>
              <span className="text-xl font-black text-[#00E163] font-mono-num">81.4%</span>
              <span className="text-[10px] text-slate-500">Berdasarkan 10,000+ trade</span>
            </div>

            <div className="p-4 rounded-3xl bg-[#1F1E25] border border-white/5 flex flex-col gap-1">
              <span className="text-xs text-slate-400 font-bold">Total Keuntungan Copier</span>
              <span className="text-xl font-black text-[#00E163] font-mono-num">+$438,920</span>
              <span className="text-[10px] text-slate-500">Telah ditarik ke Wallet</span>
            </div>
          </div>

          {/* Filter Bar (Search + Period + Style Dropdown + Sort Dropdown) */}
          <div className="p-4 rounded-3xl bg-[#1F1E25] border border-white/5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex items-center flex-1 max-w-md h-11 px-3.5 rounded-2xl bg-[#18171E] border border-white/5 focus-within:border-[#00E163]/50 transition-colors">
              <Search01Icon className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama master, strategi, atau koin..."
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-bold"
              />
            </div>

            {/* Filter Tools */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Period Chips with 1000ms Hover Sweep */}
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#18171E] border border-white/5">
                {[
                  { id: '7d', label: '7D' },
                  { id: '30d', label: '30D' },
                  { id: '90d', label: '90D' },
                ].map((p) => {
                  const isPActive = selectedPeriod === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPeriod(p.id as any)}
                      className={`group relative flex items-center justify-center px-4 h-8 rounded-xl text-xs font-bold font-mono-num transition-all duration-1000 overflow-hidden cursor-pointer select-none ${
                        isPActive
                          ? 'bg-[#00E163] text-black font-black shadow-sm'
                          : 'text-slate-400 hover:text-black'
                      }`}
                    >
                      {!isPActive && (
                        <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                      )}
                      <span className="relative z-10 transition-colors duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]">
                        {p.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* 1. Custom Style Filter Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsStyleFilterOpen(!isStyleFilterOpen);
                    setIsSortFilterOpen(false);
                  }}
                  className="flex items-center justify-between gap-2 px-3.5 h-10 min-w-[160px] rounded-xl bg-[#18171E] border border-white/10 hover:border-[#00E163]/50 text-xs font-bold text-white transition-all cursor-pointer"
                >
                  <span>{STYLE_FILTER_OPTIONS.find((s) => s.id === selectedStyle)?.label || 'Semua Gaya'}</span>
                  {isStyleFilterOpen ? (
                    <ArrowUp01Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  ) : (
                    <ArrowDown01Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                </button>

                {isStyleFilterOpen && (
                  <div className="absolute right-0 top-12 z-50 w-48 bg-[#1F1E25] border border-white/10 rounded-2xl p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex flex-col gap-1 backdrop-blur-xl animate-fade-in">
                    {STYLE_FILTER_OPTIONS.map((opt) => {
                      const isSelected = selectedStyle === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setSelectedStyle(opt.id);
                            setIsStyleFilterOpen(false);
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

              {/* 2. Custom Sort Filter Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsSortFilterOpen(!isSortFilterOpen);
                    setIsStyleFilterOpen(false);
                  }}
                  className="flex items-center justify-between gap-2 px-3.5 h-10 min-w-[170px] rounded-xl bg-[#18171E] border border-white/10 hover:border-[#00E163]/50 text-xs font-bold text-white transition-all cursor-pointer"
                >
                  <span>{SORT_OPTIONS.find((s) => s.id === sortBy)?.label || 'Urutkan'}</span>
                  {isSortFilterOpen ? (
                    <ArrowUp01Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  ) : (
                    <ArrowDown01Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                </button>

                {isSortFilterOpen && (
                  <div className="absolute right-0 top-12 z-50 w-56 bg-[#1F1E25] border border-white/10 rounded-2xl p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex flex-col gap-1 backdrop-blur-xl animate-fade-in">
                    {SORT_OPTIONS.map((opt) => {
                      const isSelected = sortBy === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setSortBy(opt.id as any);
                            setIsSortFilterOpen(false);
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
            </div>
          </div>

          {/* Master Trader Grid Container with Internal Scroll */}
          <div className="max-h-[580px] overflow-y-auto custom-positions-scrollbar pr-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTraders.map((trader) => {
              const activeRoi =
                selectedPeriod === '7d'
                  ? trader.roi7d
                  : selectedPeriod === '30d'
                  ? trader.roi30d
                  : trader.roi90d;

              const isFull = trader.copiers >= trader.maxCopiers;

              return (
                <div
                  key={trader.id}
                  className="p-5 rounded-3xl bg-[#1F1E25] border border-white/5 hover:border-[#00E163]/40 transition-all flex flex-col justify-between gap-4 shadow-lg group relative overflow-hidden"
                >
                  {/* Top Trader Card Info */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-[#26252E] border border-white/10 flex items-center justify-center font-black text-sm text-[#00E163] shadow-inner">
                          {trader.avatar}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-extrabold text-white group-hover:text-[#00E163] transition-colors">
                              {trader.name}
                            </h3>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            Gaya: <strong className="text-slate-200">{trader.style}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${trader.badgeColor}`}>
                          {trader.badge}
                        </span>
                        {renderQuickBadge(trader)}
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {trader.bio}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#18171E] border border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{selectedPeriod} ROI</span>
                        <span className="text-sm font-black text-[#00E163] font-mono-num">
                          +{activeRoi}%
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Win Rate</span>
                        <span className="text-sm font-black text-white font-mono-num">
                          {trader.winRate}%
                        </span>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Max DD</span>
                        <span className="text-sm font-black text-[#FF5C77] font-mono-num">
                          -{trader.maxDrawdown}%
                        </span>
                      </div>
                    </div>

                    {/* FEATURE #1: MINI SPARKLINE PNL CURVE (BINANCE/BYBIT STANDARD) */}
                    <div className="p-2.5 rounded-2xl bg-[#18171E]/60 border border-white/5 flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                        <span className="flex items-center gap-1">
                          <ChartLineData01Icon className="w-3 h-3 text-[#00E163]" />
                          <span>Kurva Stabilitas PnL 30D</span>
                        </span>
                        <span className="text-[#00E163] font-mono-num font-black">+{trader.roi30d}%</span>
                      </div>
                      <TraderSparkline data={trader.sparkline} isPositive={activeRoi >= 0} />
                    </div>

                    {/* Copiers Progress Bar */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Copiers</span>
                        <span className="font-bold text-white font-mono-num">
                          {trader.copiers} / {trader.maxCopiers}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#18171E] overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isFull ? 'bg-[#FF5C77]' : 'bg-[#00E163]'
                          }`}
                          style={{ width: `${(trader.copiers / trader.maxCopiers) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Action Buttons (Clean Standard Buttons without Sweep Hover) */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                    {/* Lihat Profil Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTraderForDetail(trader);
                        setIsDetailModalOpen(true);
                      }}
                      className="py-2.5 rounded-2xl bg-[#26252E] hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer border border-white/5 flex items-center justify-center gap-1.5"
                    >
                      <span>Lihat Profil</span>
                    </button>

                    {/* Copy Button */}
                    <button
                      type="button"
                      disabled={isFull}
                      onClick={() => {
                        setSelectedTraderForCopy(trader);
                        setIsCopyModalOpen(true);
                      }}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-[#00E163] hover:bg-[#00c957] disabled:bg-slate-800 text-black disabled:text-slate-500 font-extrabold text-xs shadow-md transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                      <Copy01Icon className="w-3.5 h-3.5" />
                      <span>{isFull ? 'Slot Penuh' : 'Salin (Copy)'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. TAB 2: MY COPIES (PORTOFOLIO COPY SAYA) */}
      {activeTab === 'my_copies' && (
        <div className="space-y-5">
          {/* Summary Metric Strip */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-3xl bg-[#1F1E25] border border-white/5 flex flex-col gap-1">
              <span className="text-xs text-slate-400 font-bold">Total Alokasi Modal Copy</span>
              <span className="text-xl font-black text-white font-mono-num">
                ${userCopies.reduce((acc, c) => acc + c.allocatedMargin, 0).toLocaleString()} USDT
              </span>
            </div>

            <div className="p-4 rounded-3xl bg-[#1F1E25] border border-white/5 flex flex-col gap-1">
              <span className="text-xs text-slate-400 font-bold">Floating PnL Saat Ini</span>
              <span className="text-xl font-black text-[#00E163] font-mono-num">
                +${userCopies.reduce((acc, c) => acc + c.floatingPnl, 0).toFixed(2)} USDT
              </span>
            </div>

            <div className="p-4 rounded-3xl bg-[#1F1E25] border border-white/5 flex flex-col gap-1">
              <span className="text-xs text-slate-400 font-bold">Total Realized Profit</span>
              <span className="text-xl font-black text-[#00E163] font-mono-num">
                +${userCopies.reduce((acc, c) => acc + c.realizedPnl, 0).toFixed(2)} USDT
              </span>
            </div>

            <div className="p-4 rounded-3xl bg-[#1F1E25] border border-white/5 flex flex-col gap-1">
              <span className="text-xs text-slate-400 font-bold">Master Trader yang Diikuti</span>
              <span className="text-xl font-black text-white font-mono-num">{userCopies.length} Trader</span>
            </div>
          </div>

          {/* Table of Active Copies */}
          <div className="p-5 rounded-3xl bg-[#1F1E25] border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white">Daftar Trader yang Sedang Disalin</h3>
              <span className="text-xs text-slate-400">Status sinkronisasi: Real-time aktif</span>
            </div>

            {userCopies.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center text-center gap-3">
                <Copy01Icon className="w-12 h-12 text-slate-600" />
                <p className="text-sm font-bold text-slate-400">Anda belum menyalin Master Trader manapun.</p>
                <button
                  type="button"
                  onClick={() => setActiveTab('leaderboard')}
                  className="px-5 py-2.5 rounded-2xl bg-[#00E163] text-black font-extrabold text-xs cursor-pointer shadow-md"
                >
                  Pilih Master Trader Sekarang
                </button>
              </div>
            ) : (
              <div className="max-h-[420px] overflow-y-auto custom-positions-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#18171E] text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-white/5 sticky top-0">
                    <tr>
                      <th className="p-4">Master Trader</th>
                      <th className="p-4">Modal Alokasi</th>
                      <th className="p-4">Floating PnL</th>
                      <th className="p-4">Total Profit Bersih</th>
                      <th className="p-4">Stop Loss Proteksi</th>
                      <th className="p-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-200 font-medium">
                    {userCopies.map((copy) => (
                      <tr key={copy.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#26252E] border border-white/10 flex items-center justify-center font-black text-xs text-[#00E163]">
                            {copy.traderAvatar}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-extrabold text-white">{copy.traderName}</span>
                            <span className="text-[10px] text-slate-500">Mulai: {copy.startDate}</span>
                          </div>
                        </td>

                        <td className="p-4 font-mono-num font-bold">
                          ${copy.allocatedMargin.toLocaleString()} USDT
                        </td>

                        <td className="p-4 font-mono-num">
                          <span className="font-black text-[#00E163]">
                            +${copy.floatingPnl.toFixed(2)} (+{copy.floatingPnlPct}%)
                          </span>
                        </td>

                        <td className="p-4 font-mono-num font-bold text-[#00E163]">
                          +${copy.realizedPnl.toFixed(2)} USDT
                        </td>

                        <td className="p-4 font-mono-num text-[#FF5C77] font-bold">
                          -{copy.stopLossPct}% Max DD
                        </td>

                        <td className="p-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleStopCopy(copy.id, copy.traderName)}
                            className="group relative px-3.5 py-1.5 rounded-xl bg-[#26252E] hover:bg-[#FF5C77] text-[#FF5C77] hover:text-black font-extrabold text-xs transition-all duration-1000 overflow-hidden cursor-pointer border border-[#FF5C77]/30"
                          >
                            <span className="absolute inset-0 bg-[#FF5C77] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                            <span className="relative z-10 transition-colors duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]">
                              Berhenti Copy
                            </span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. TAB 3: SOCIAL COMMUNITY FEED & TRADING SIGNALS */}
      {activeTab === 'feed' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column: Create Post & Feed Stream (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Create Post Card */}
            <form onSubmit={handleCreatePost} className="p-5 rounded-3xl bg-[#1F1E25] border border-white/5 flex flex-col gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#26252E] border border-white/10 flex items-center justify-center font-black text-xs text-[#00E163]">
                  ME
                </div>
                <input
                  type="text"
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  placeholder="Bagikan analisa pasar atau sinyal trading Anda..."
                  className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-bold"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-[11px] text-slate-500">
                  Tip: Anda dapat menyematkan tag aset seperti #BTC atau #SOL
                </span>

                <button
                  type="submit"
                  disabled={!newPostText.trim()}
                  className="group relative flex items-center justify-center gap-2 px-5 py-2 rounded-2xl bg-[#26252E] hover:bg-[#00E163] disabled:bg-slate-800 text-white hover:text-black disabled:text-slate-600 font-extrabold text-xs shadow-md overflow-hidden cursor-pointer transition-all duration-1000 disabled:cursor-not-allowed border border-white/5"
                >
                  <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                  <span className="relative z-10 flex items-center gap-1.5 transition-colors duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]">
                    <SentIcon className="w-3.5 h-3.5" />
                    <span>Posting</span>
                  </span>
                </button>
              </div>
            </form>

            {/* Posts Stream with Internal Scroll */}
            <div className="max-h-[560px] overflow-y-auto custom-positions-scrollbar pr-1 space-y-4">
              {feedPosts.map((post) => (
                <div key={post.id} className="p-5 rounded-3xl bg-[#1F1E25] border border-white/5 space-y-3.5 shadow-md">
                  {/* Post Author Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#26252E] border border-white/10 flex items-center justify-center font-black text-xs text-[#00E163]">
                        {post.avatar}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-xs">{post.author}</span>
                          <span className="px-2 py-0.2 rounded-md bg-[#00E163]/10 text-[#00E163] text-[9px] font-black">
                            {post.badge}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500">{post.time}</span>
                      </div>
                    </div>

                    <button type="button" className="text-slate-500 hover:text-white transition-colors cursor-pointer">
                      <Share01Icon className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Post Content */}
                  <p className="text-xs text-slate-300 leading-relaxed">{post.content}</p>

                  {/* Embedded Signal Card (if present) */}
                  {post.signal && (
                    <div className="p-3.5 rounded-2xl bg-[#18171E] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-black font-mono-num ${
                          post.signal.type === 'LONG' ? 'bg-[#00E163]/15 text-[#00E163]' : 'bg-[#FF5C77]/15 text-[#FF5C77]'
                        }`}>
                          {post.signal.type} {post.signal.leverage}
                        </span>
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-xs font-mono-num">{post.signal.pair}</span>
                          <span className="text-[10px] text-slate-400 font-mono-num">
                            Entry: {post.signal.entry} • Target: {post.signal.target} • SL: {post.signal.stopLoss}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => showToast(`Sinyal ${post.signal?.pair} disalin ke Form Order!`)}
                        className="group relative flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#26252E] hover:bg-[#00E163] text-white hover:text-black font-extrabold text-xs shadow-sm overflow-hidden transition-all duration-1000 cursor-pointer border border-white/5"
                      >
                        <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                        <span className="relative z-10 transition-colors duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]">
                          Salin Sinyal
                        </span>
                      </button>
                    </div>
                  )}

                  {/* Likes & Comments Action Bar */}
                  <div className="flex items-center gap-4 pt-2 border-t border-white/5 text-xs text-slate-400">
                    <button
                      type="button"
                      onClick={() => handleToggleLike(post.id)}
                      className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                        post.isLiked ? 'text-[#00E163] font-bold' : 'hover:text-white'
                      }`}
                    >
                      <ThumbsUpIcon className="w-4 h-4" />
                      <span>{post.likes}</span>
                    </button>

                    {/* FEATURE #4: INTERACTIVE COMMENTS MODAL TRIGGER (BINANCE SQUARE STANDARD) */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPostForComments(post);
                        setIsCommentsModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 hover:text-[#00E163] transition-colors cursor-pointer"
                    >
                      <BubbleChatIcon className="w-4 h-4" />
                      <span>{post.comments} Komentar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Trending Discussions & Top Topics (1 Col) */}
          <div className="space-y-4">
            <div className="p-5 rounded-3xl bg-[#1F1E25] border border-white/5 flex flex-col gap-3 shadow-md">
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <SparklesIcon className="w-4 h-4 text-[#00E163]" />
                <span>Topik Populer Komunitas</span>
              </h3>
              <div className="space-y-2">
                {[
                  { tag: '#BTC_Breakout', count: '1,420 Diskusi', change: '+24%' },
                  { tag: '#Fed_RateCut', count: '980 Diskusi', change: '+18%' },
                  { tag: '#Solana_Scalp', count: '850 Diskusi', change: '+12%' },
                  { tag: '#CopyTradingTips', count: '610 Diskusi', change: '+9%' },
                ].map((item, i) => (
                  <div key={i} className="p-2.5 rounded-2xl bg-[#18171E] border border-white/5 flex items-center justify-between hover:border-[#00E163]/30 transition-colors cursor-pointer">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">{item.tag}</span>
                      <span className="text-[10px] text-slate-500">{item.count}</span>
                    </div>
                    <span className="text-xs font-bold text-[#00E163] font-mono-num">{item.change}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Rules / Guidelines Card */}
            <div className="p-5 rounded-3xl bg-[#1F1E25] border border-white/5 space-y-2.5 text-xs text-slate-400 shadow-md">
              <div className="flex items-center gap-2 text-white font-bold">
                <Shield01Icon className="w-4 h-4 text-[#00E163]" />
                <span>Pedoman Komunitas VeloceX</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                1. Dilarang mempromosikan skema penipuan atau link phishing pihak ketiga.
                <br />
                2. Sinyal trading harus dilengkapi dengan batas Stop Loss yang jelas.
                <br />
                3. Jaga etika diskusi dan hindari ujaran kebencian.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 6. TAB 4: PROGRAM MASTER TRADER */}
      {activeTab === 'apply_master' && (
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1F1E25] via-[#18171E] to-[#1F1E25] border border-white/5 p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
            <div className="flex flex-col gap-3 max-w-xl z-10">
              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-amber-400/10 text-amber-400 border border-amber-400/30 uppercase tracking-wider w-fit">
                Bagi Hasil Hingga 15% Profit
              </span>
              <h2 className="text-2xl font-black text-white font-heading">
                Monetisasi Keahlian Trading Anda Bersama Ribuan Copier VeloceX
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sebagai Master Trader VeloceX, Anda akan mendapatkan bagi hasil profit otomatis dari seluruh pengikut setia Anda, verifikasi profil VIP eksklusif, serta akses ke kolam likuiditas institusional.
              </p>

              <div className="pt-2">
                {isMasterRegistered ? (
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#00E163]/10 border border-[#00E163]/30">
                    <CheckmarkCircle01Icon className="w-6 h-6 text-[#00E163] shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-[#00E163]">Pendaftaran Anda Sedang Ditinjau</span>
                      <span className="text-[11px] text-slate-400">Tim risk management VeloceX sedang memvalidasi riwayat trading Anda.</span>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsApplyMasterModalOpen(true)}
                    className="group relative flex items-center justify-center gap-2 h-12 px-7 rounded-2xl bg-[#26252E] hover:bg-[#00E163] text-white hover:text-black font-bold text-sm border border-white/5 overflow-hidden transition-colors duration-1000 cursor-pointer shadow-lg"
                  >
                    <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                    <span className="relative z-10 flex items-center gap-2 transition-colors duration-1000">
                      <Award01Icon className="w-5 h-5 text-amber-400 group-hover:text-black transition-colors duration-1000" />
                      <span>Daftar Sekarang Sebagai Master</span>
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* 3 Tier Cards */}
            <div className="grid grid-cols-3 gap-3 w-full md:w-auto z-10">
              <div className="p-4 rounded-3xl bg-[#18171E] border border-white/5 flex flex-col items-center text-center gap-2">
                <Award01Icon className="w-7 h-7 text-slate-400" />
                <span className="text-xs font-bold text-white">Silver Master</span>
                <span className="text-sm font-black text-[#00E163] font-mono-num">10% Share</span>
                <span className="text-[10px] text-slate-500">Maks. 100 Copier</span>
              </div>

              <div className="p-4 rounded-3xl bg-[#18171E] border border-[#00E163]/30 flex flex-col items-center text-center gap-2 shadow-lg">
                <Award01Icon className="w-7 h-7 text-[#00E163]" />
                <span className="text-xs font-bold text-white">Gold Master</span>
                <span className="text-sm font-black text-[#00E163] font-mono-num">12% Share</span>
                <span className="text-[10px] text-slate-500">Maks. 300 Copier</span>
              </div>

              <div className="p-4 rounded-3xl bg-[#18171E] border border-amber-400/30 flex flex-col items-center text-center gap-2">
                <Award01Icon className="w-7 h-7 text-amber-400" />
                <span className="text-xs font-bold text-white">Platinum Elite</span>
                <span className="text-sm font-black text-amber-400 font-mono-num">15% Share</span>
                <span className="text-[10px] text-slate-500">Maks. 500 Copier</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <CopyTradingModal
        isOpen={isCopyModalOpen}
        onClose={() => setIsCopyModalOpen(false)}
        trader={selectedTraderForCopy}
        onConfirmCopy={handleConfirmCopy}
      />

      <MasterTraderDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        trader={selectedTraderForDetail}
        onOpenCopyModal={(trader) => {
          setSelectedTraderForCopy(trader);
          setIsCopyModalOpen(true);
        }}
      />

      <BecomeMasterTraderModal
        isOpen={isApplyMasterModalOpen && !isMasterRegistered}
        onClose={() => setIsApplyMasterModalOpen(false)}
        onSubmitSuccess={() => {
          setIsMasterRegistered(true);
          try {
            localStorage.setItem('velocx_is_master_registered', 'true');
          } catch (e) {}
          setActiveTab('leaderboard');
        }}
      />

      <FeedCommentsModal
        isOpen={isCommentsModalOpen}
        onClose={() => {
          setIsCommentsModalOpen(false);
          setSelectedPostForComments(null);
        }}
        postId={selectedPostForComments?.id || ''}
        postAuthor={selectedPostForComments?.author || ''}
        postContent={selectedPostForComments?.content || ''}
        comments={selectedPostForComments?.commentList || []}
        onAddComment={handleAddCommentToPost}
      />
    </div>
  );
};
