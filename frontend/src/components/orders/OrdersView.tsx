'use client';

import React, { useState, useMemo } from 'react';
import { MarketIcon } from '@/components/MarketIcon';
import { EditOrderModal, EditableOrder } from './EditOrderModal';
import { CancelAllModal } from './CancelAllModal';
import { OrderDetailsModal, OrderDetailRecord } from './OrderDetailsModal';
import { SharePnLModal } from './SharePnLModal';
import { EditTPSLModal } from './EditTPSLModal';
import {
  Search01Icon,
  Download01Icon,
  Delete02Icon,
  Edit01Icon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  Cancel01Icon,
  Tick01Icon,
  Coins01Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  FlashIcon,
  SparklesIcon,
  CpuIcon,
  Note01Icon,
  Clock01Icon,
  Calendar03Icon,
  Share01Icon,
  Target01Icon,
} from 'hugeicons-react';

export interface OrderItem {
  id: string;
  clientOrderId: string;
  symbol: string;
  name: string;
  category: 'crypto' | 'forex' | 'cfd';
  side: 'BUY' | 'SELL';
  type: 'Limit' | 'Market' | 'Stop Limit' | 'Trailing Stop' | 'OCO';
  price: number;
  avgPrice: number;
  amount: number;
  filledAmount: number;
  status: 'Open' | 'Filled' | 'Partially Filled' | 'Canceled' | 'Expired';
  role: 'Maker' | 'Taker';
  fee: number;
  feeAsset: string;
  timestamp: string;
  txHash: string;
}

export interface ClosedPositionRecord {
  id: string;
  symbol: string;
  category: 'crypto' | 'forex' | 'cfd';
  side: 'LONG' | 'SHORT';
  leverage: string;
  size: number;
  entryPrice: number;
  closePrice: number;
  closedPnl: number;
  roiPct: number;
  fundingFee: number;
  closeType: 'Market Close' | 'Take Profit' | 'Stop Loss' | 'Liquidation';
  closeTime: string;
}

export interface BotOrderRecord {
  id: string;
  botName: string;
  strategy: 'Spot Grid' | 'Futures Grid' | 'DCA Infinity' | 'TWAP Whale';
  symbol: string;
  category: 'crypto' | 'forex' | 'cfd';
  status: 'Running' | 'Paused' | 'Completed';
  totalInvestment: number;
  gridProfit: number;
  runtime: string;
  arbitrageCount: number;
}

export interface SubscriptionOrderRecord {
  id: string;
  productName: string;
  symbol: string;
  category: 'crypto' | 'cfd';
  stakedAmount: number;
  apy: number;
  dailyYield: number;
  cumulativeYield: number;
  autoCompound: boolean;
  startDate: string;
}

// Initial Mock Dataset with all 18 assets across Crypto, Forex, and CFD (Binance/Bybit Standard)
const INITIAL_ORDERS: OrderItem[] = [
  // 1. Kripto (8 Assets)
  {
    id: 'ORD-88219',
    clientOrderId: 'c-btc-limit-01',
    symbol: 'BTC',
    name: 'Bitcoin',
    category: 'crypto',
    side: 'BUY',
    type: 'Limit',
    price: 74200.0,
    avgPrice: 74200.0,
    amount: 1.5,
    filledAmount: 0.75,
    status: 'Partially Filled',
    role: 'Maker',
    fee: 12.24,
    feeAsset: 'USDT',
    timestamp: 'Today, 14:15:20',
    txHash: '0x8f72a1b94c3d2e...9a41',
  },
  {
    id: 'ORD-88220',
    clientOrderId: 'c-eth-limit-02',
    symbol: 'ETH',
    name: 'Ethereum',
    category: 'crypto',
    side: 'SELL',
    type: 'Limit',
    price: 4250.0,
    avgPrice: 4250.0,
    amount: 5.0,
    filledAmount: 0.0,
    status: 'Open',
    role: 'Maker',
    fee: 0.0,
    feeAsset: 'USDT',
    timestamp: 'Today, 13:40:10',
    txHash: '0x3c91f0e2b8d7...41fa',
  },
  {
    id: 'ORD-88223',
    clientOrderId: 'c-sol-limit-03',
    symbol: 'SOL',
    name: 'Solana',
    category: 'crypto',
    side: 'BUY',
    type: 'Limit',
    price: 148.5,
    avgPrice: 148.5,
    amount: 25.0,
    filledAmount: 0.0,
    status: 'Open',
    role: 'Maker',
    fee: 0.0,
    feeAsset: 'USDT',
    timestamp: 'Today, 12:25:00',
    txHash: '0x992fae3810...55df',
  },
  {
    id: 'ORD-88225',
    clientOrderId: 'c-ltc-stop-04',
    symbol: 'LTC',
    name: 'Litecoin',
    category: 'crypto',
    side: 'BUY',
    type: 'Stop Limit',
    price: 78.2,
    avgPrice: 78.2,
    amount: 40.0,
    filledAmount: 0.0,
    status: 'Open',
    role: 'Taker',
    fee: 0.0,
    feeAsset: 'USDT',
    timestamp: 'Today, 11:50:18',
    txHash: '0x71a2c890f...44bc',
  },
  {
    id: 'ORD-88226',
    clientOrderId: 'c-doge-limit-05',
    symbol: 'DOGE',
    name: 'Dogecoin',
    category: 'crypto',
    side: 'SELL',
    type: 'Limit',
    price: 0.125,
    avgPrice: 0.125,
    amount: 25000.0,
    filledAmount: 0.0,
    status: 'Open',
    role: 'Maker',
    fee: 0.0,
    feeAsset: 'USDT',
    timestamp: 'Today, 10:15:30',
    txHash: '0x55dc8910b...33ef',
  },
  {
    id: 'ORD-88227',
    clientOrderId: 'c-xrp-limit-06',
    symbol: 'XRP',
    name: 'Ripple',
    category: 'crypto',
    side: 'BUY',
    type: 'Limit',
    price: 0.585,
    avgPrice: 0.585,
    amount: 8000.0,
    filledAmount: 0.0,
    status: 'Open',
    role: 'Maker',
    fee: 0.0,
    feeAsset: 'USDT',
    timestamp: 'Today, 09:40:22',
    txHash: '0x12bb9934e...88cd',
  },
  {
    id: 'ORD-88228',
    clientOrderId: 'c-usdc-limit-07',
    symbol: 'USDC',
    name: 'USD Coin',
    category: 'crypto',
    side: 'BUY',
    type: 'Limit',
    price: 0.9998,
    avgPrice: 0.9998,
    amount: 10000.0,
    filledAmount: 0.0,
    status: 'Open',
    role: 'Maker',
    fee: 0.0,
    feeAsset: 'USDT',
    timestamp: 'Today, 08:30:10',
    txHash: '0x44fa7812c...11ae',
  },
  {
    id: 'ORD-88229',
    clientOrderId: 'c-usdt-limit-08',
    symbol: 'USDT',
    name: 'Tether USD',
    category: 'crypto',
    side: 'SELL',
    type: 'Limit',
    price: 1.0002,
    avgPrice: 1.0002,
    amount: 15000.0,
    filledAmount: 0.0,
    status: 'Open',
    role: 'Maker',
    fee: 0.0,
    feeAsset: 'USDT',
    timestamp: 'Today, 07:15:00',
    txHash: '0x99ea6651f...00ba',
  },

  // 2. Forex (6 Assets)
  {
    id: 'ORD-88230',
    clientOrderId: 'c-eur-limit-09',
    symbol: 'EUR',
    name: 'EUR / USD',
    category: 'forex',
    side: 'BUY',
    type: 'Limit',
    price: 1.085,
    avgPrice: 1.085,
    amount: 50000,
    filledAmount: 0.0,
    status: 'Open',
    role: 'Maker',
    fee: 0.0,
    feeAsset: 'USDT',
    timestamp: 'Today, 14:05:10',
    txHash: '0x7e8b21c90f...14ea',
  },
  {
    id: 'ORD-88231',
    clientOrderId: 'c-gbp-limit-10',
    symbol: 'GBP',
    name: 'GBP / USD',
    category: 'forex',
    side: 'SELL',
    type: 'Limit',
    price: 1.294,
    avgPrice: 1.294,
    amount: 35000,
    filledAmount: 0.0,
    status: 'Open',
    role: 'Maker',
    fee: 0.0,
    feeAsset: 'USDT',
    timestamp: 'Today, 13:20:45',
    txHash: '0x22ab8841c...99de',
  },
  {
    id: 'ORD-88232',
    clientOrderId: 'c-jpy-limit-11',
    symbol: 'JPY',
    name: 'USD / JPY',
    category: 'forex',
    side: 'BUY',
    type: 'Limit',
    price: 154.2,
    avgPrice: 154.2,
    amount: 40000,
    filledAmount: 0.0,
    status: 'Open',
    role: 'Maker',
    fee: 0.0,
    feeAsset: 'USDT',
    timestamp: 'Today, 12:10:30',
    txHash: '0x66fe1102b...44fa',
  },
  {
    id: 'ORD-88233',
    clientOrderId: 'c-aud-limit-12',
    symbol: 'AUD',
    name: 'AUD / USD',
    category: 'forex',
    side: 'BUY',
    type: 'Limit',
    price: 0.665,
    avgPrice: 0.665,
    amount: 45000,
    filledAmount: 0.0,
    status: 'Open',
    role: 'Maker',
    fee: 0.0,
    feeAsset: 'USDT',
    timestamp: 'Today, 11:35:12',
    txHash: '0x88cd4419a...77be',
  },
  {
    id: 'ORD-88234',
    clientOrderId: 'c-cad-limit-13',
    symbol: 'CAD',
    name: 'USD / CAD',
    category: 'forex',
    side: 'SELL',
    type: 'Limit',
    price: 1.378,
    avgPrice: 1.378,
    amount: 30000,
    filledAmount: 0.0,
    status: 'Open',
    role: 'Maker',
    fee: 0.0,
    feeAsset: 'USDT',
    timestamp: 'Today, 10:45:00',
    txHash: '0x11de5523f...66ca',
  },
  {
    id: 'ORD-88235',
    clientOrderId: 'c-chf-limit-14',
    symbol: 'CHF',
    name: 'USD / CHF',
    category: 'forex',
    side: 'BUY',
    type: 'Limit',
    price: 0.885,
    avgPrice: 0.885,
    amount: 35000,
    filledAmount: 0.0,
    status: 'Open',
    role: 'Maker',
    fee: 0.0,
    feeAsset: 'USDT',
    timestamp: 'Today, 09:20:15',
    txHash: '0x33fa9912e...22bc',
  },

  // 3. CFD & Commodities (6 Assets)
  {
    id: 'ORD-88221',
    clientOrderId: 'c-xau-stop-15',
    symbol: 'XAU',
    name: 'Gold (Emas)',
    category: 'cfd',
    side: 'BUY',
    type: 'Stop Limit',
    price: 2510.0,
    avgPrice: 2510.0,
    amount: 10.0,
    filledAmount: 0.0,
    status: 'Open',
    role: 'Taker',
    fee: 0.0,
    feeAsset: 'USDT',
    timestamp: 'Today, 11:10:05',
    txHash: '0x19ad37c54ef...77c2',
  },
  {
    id: 'ORD-88236',
    clientOrderId: 'c-xag-limit-16',
    symbol: 'XAG',
    name: 'Silver (Perak)',
    category: 'cfd',
    side: 'BUY',
    type: 'Limit',
    price: 29.4,
    avgPrice: 29.4,
    amount: 500.0,
    filledAmount: 0.0,
    status: 'Open',
    role: 'Maker',
    fee: 0.0,
    feeAsset: 'USDT',
    timestamp: 'Today, 10:50:22',
    txHash: '0x55ac9941d...33eb',
  },
  {
    id: 'ORD-88237',
    clientOrderId: 'c-usoil-limit-17',
    symbol: 'USOIL',
    name: 'Crude Oil WTI',
    category: 'cfd',
    side: 'BUY',
    type: 'Limit',
    price: 72.8,
    avgPrice: 72.8,
    amount: 200.0,
    filledAmount: 0.0,
    status: 'Open',
    role: 'Maker',
    fee: 0.0,
    feeAsset: 'USDT',
    timestamp: 'Today, 10:05:40',
    txHash: '0x221ca498b...90ac',
  },
  {
    id: 'ORD-88238',
    clientOrderId: 'c-spx-limit-18',
    symbol: 'SPX500',
    name: 'S&P 500 Index',
    category: 'cfd',
    side: 'BUY',
    type: 'Limit',
    price: 5620.0,
    avgPrice: 5620.0,
    amount: 5.0,
    filledAmount: 0.0,
    status: 'Open',
    role: 'Maker',
    fee: 0.0,
    feeAsset: 'USDT',
    timestamp: 'Today, 09:15:30',
    txHash: '0x77ab4422f...11da',
  },
  {
    id: 'ORD-88239',
    clientOrderId: 'c-nas-limit-19',
    symbol: 'NAS100',
    name: 'Nasdaq 100',
    category: 'cfd',
    side: 'SELL',
    type: 'Limit',
    price: 19850.0,
    avgPrice: 19850.0,
    amount: 2.0,
    filledAmount: 0.0,
    status: 'Open',
    role: 'Maker',
    fee: 0.0,
    feeAsset: 'USDT',
    timestamp: 'Today, 08:45:00',
    txHash: '0x88ba1133c...55ea',
  },
  {
    id: 'ORD-88240',
    clientOrderId: 'c-us30-limit-20',
    symbol: 'US30',
    name: 'Dow Jones 30',
    category: 'cfd',
    side: 'BUY',
    type: 'Limit',
    price: 41200.0,
    avgPrice: 41200.0,
    amount: 1.0,
    filledAmount: 0.0,
    status: 'Open',
    role: 'Maker',
    fee: 0.0,
    feeAsset: 'USDT',
    timestamp: 'Today, 08:10:15',
    txHash: '0x44ca6677e...99bf',
  },
];

const INITIAL_CLOSED_POSITIONS: ClosedPositionRecord[] = [
  {
    id: 'POS-01',
    symbol: 'BTC',
    category: 'crypto',
    side: 'LONG',
    leverage: '20x',
    size: 2.0,
    entryPrice: 72100.0,
    closePrice: 75200.0,
    closedPnl: 6200.0,
    roiPct: 43.0,
    fundingFee: -18.5,
    closeType: 'Take Profit',
    closeTime: 'Today, 15:45:10',
  },
  {
    id: 'POS-02',
    symbol: 'ETH',
    category: 'crypto',
    side: 'SHORT',
    leverage: '10x',
    size: 15.0,
    entryPrice: 4280.0,
    closePrice: 4140.0,
    closedPnl: 2100.0,
    roiPct: 32.7,
    fundingFee: 4.2,
    closeType: 'Market Close',
    closeTime: 'Yesterday, 22:10:05',
  },
  {
    id: 'POS-03',
    symbol: 'SOL',
    category: 'crypto',
    side: 'LONG',
    leverage: '15x',
    size: 40.0,
    entryPrice: 132.0,
    closePrice: 149.0,
    closedPnl: 1700.0,
    roiPct: 51.5,
    fundingFee: -6.2,
    closeType: 'Take Profit',
    closeTime: 'Yesterday, 19:20:00',
  },
  {
    id: 'POS-04',
    symbol: 'EUR',
    category: 'forex',
    side: 'LONG',
    leverage: '50x',
    size: 100000.0,
    entryPrice: 1.072,
    closePrice: 1.085,
    closedPnl: 1300.0,
    roiPct: 60.7,
    fundingFee: -12.0,
    closeType: 'Take Profit',
    closeTime: 'Yesterday, 18:10:00',
  },
  {
    id: 'POS-05',
    symbol: 'XAU',
    category: 'cfd',
    side: 'LONG',
    leverage: '50x',
    size: 25.0,
    entryPrice: 2485.0,
    closePrice: 2515.0,
    closedPnl: 7500.0,
    roiPct: 60.4,
    fundingFee: -35.0,
    closeType: 'Take Profit',
    closeTime: 'Yesterday, 16:30:00',
  },
  {
    id: 'POS-06',
    symbol: 'USOIL',
    category: 'cfd',
    side: 'LONG',
    leverage: '20x',
    size: 500.0,
    entryPrice: 69.5,
    closePrice: 73.2,
    closedPnl: 3700.0,
    roiPct: 53.2,
    fundingFee: -15.4,
    closeType: 'Take Profit',
    closeTime: 'Yesterday, 14:05:00',
  },
];

const INITIAL_BOT_ORDERS: BotOrderRecord[] = [
  {
    id: 'BOT-01',
    botName: 'Spot Grid Bot Alpha',
    strategy: 'Spot Grid',
    symbol: 'BTC',
    category: 'crypto',
    status: 'Running',
    totalInvestment: 25000.0,
    gridProfit: 1420.5,
    runtime: '14D 8H',
    arbitrageCount: 184,
  },
  {
    id: 'BOT-02',
    botName: 'ETH Infinity DCA Vault',
    strategy: 'DCA Infinity',
    symbol: 'ETH',
    category: 'crypto',
    status: 'Running',
    totalInvestment: 15000.0,
    gridProfit: 890.2,
    runtime: '7D 12H',
    arbitrageCount: 42,
  },
];

const INITIAL_SUBSCRIPTIONS: SubscriptionOrderRecord[] = [
  {
    id: 'EARN-01',
    productName: 'USDT Flexible Savings',
    symbol: 'USDT',
    category: 'crypto',
    stakedAmount: 48500.0,
    apy: 11.8,
    dailyYield: 15.68,
    cumulativeYield: 248.5,
    autoCompound: true,
    startDate: '2026-08-15',
  },
  {
    id: 'EARN-02',
    productName: 'Bitcoin Flexible Yield',
    symbol: 'BTC',
    category: 'crypto',
    stakedAmount: 2.345,
    apy: 3.5,
    dailyYield: 0.00022,
    cumulativeYield: 0.0041,
    autoCompound: true,
    startDate: '2026-08-20',
  },
];

interface OrdersViewProps {
  onOrderSuccess?: (msg: string) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ onOrderSuccess }) => {
  // Navigation Tabs
  type NavTab = 'open_orders' | 'order_history' | 'trade_history' | 'closed_pnl' | 'bot_orders' | 'subscriptions';
  const [activeTab, setActiveTab] = useState<NavTab>('open_orders');

  // Datasets State
  const [orders, setOrders] = useState<OrderItem[]>(INITIAL_ORDERS);
  const [closedPositions] = useState<ClosedPositionRecord[]>(INITIAL_CLOSED_POSITIONS);
  const [botOrders] = useState<BotOrderRecord[]>(INITIAL_BOT_ORDERS);
  const [subscriptions] = useState<SubscriptionOrderRecord[]>(INITIAL_SUBSCRIPTIONS);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'crypto' | 'forex' | 'cfd'>('all');
  const [selectedSide, setSelectedSide] = useState<'all' | 'BUY' | 'SELL'>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<'all' | 'today' | '7d' | '30d' | '90d'>('all');
  const [hideCanceled, setHideCanceled] = useState(false);
  const [isSideDropdownOpen, setIsSideDropdownOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);

  // Modals State
  const [selectedEditableOrder, setSelectedEditableOrder] = useState<EditableOrder | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCancelAllModalOpen, setIsCancelAllModalOpen] = useState(false);
  const [selectedDetailRecord, setSelectedDetailRecord] = useState<OrderDetailRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTPSLOrder, setSelectedTPSLOrder] = useState<OrderItem | null>(null);
  const [isTPSLModalOpen, setIsTPSLModalOpen] = useState(false);
  const [selectedSharePosition, setSelectedSharePosition] = useState<ClosedPositionRecord | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const showToast = (msg: string) => {
    onOrderSuccess?.(msg);
  };

  const SIDE_OPTIONS = [
    { id: 'all', label: 'Semua Sisi (Buy & Sell)' },
    { id: 'BUY', label: 'Buy / Long' },
    { id: 'SELL', label: 'Sell / Short' },
  ];

  const TYPE_OPTIONS = [
    { id: 'all', label: 'Semua Tipe Order' },
    { id: 'Limit', label: 'Limit Order' },
    { id: 'Market', label: 'Market Order' },
    { id: 'Stop Limit', label: 'Stop Limit' },
    { id: 'Trailing Stop', label: 'Trailing Stop' },
  ];

  const DATE_OPTIONS = [
    { id: 'all', label: 'Semua Waktu (All Time)' },
    { id: 'today', label: 'Hari Ini (Today)' },
    { id: '7d', label: '7 Hari Terakhir' },
    { id: '30d', label: '30 Hari Terakhir' },
    { id: '90d', label: '90 Hari Terakhir' },
  ];

  const handleSaveTPSL = (orderId: string, tpPrice: number | null, slPrice: number | null) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              price: o.price,
            }
          : o
      )
    );
    showToast(`Pengaturan TP/SL untuk order ${orderId} berhasil disimpan.`);
  };

  const handleCancelFilteredOrders = () => {
    if (!searchQuery) return;
    const targetOrders = filteredOrders.filter((o) => o.status === 'Open' || o.status === 'Partially Filled');
    const count = targetOrders.length;
    if (count === 0) {
      showToast(`Tidak ada open order aktif untuk "${searchQuery}".`);
      return;
    }
    setOrders((prev) =>
      prev.map((o) => {
        if (
          (o.status === 'Open' || o.status === 'Partially Filled') &&
          (o.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.id.toLowerCase().includes(searchQuery.toLowerCase()))
        ) {
          return { ...o, status: 'Canceled' };
        }
        return o;
      })
    );
    showToast(`${count} open order untuk "${searchQuery.toUpperCase()}" berhasil dibatalkan.`);
  };

  // Open Orders Dataset
  const openOrdersList = useMemo(() => {
    return orders.filter((o) => o.status === 'Open' || o.status === 'Partially Filled');
  }, [orders]);

  // Filtered Orders Calculation
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Tab Filter
      if (activeTab === 'open_orders' && o.status !== 'Open' && o.status !== 'Partially Filled') return false;
      if (activeTab === 'order_history' && o.status === 'Open') return false;

      // Category Filter
      if (selectedCategory !== 'all' && o.category !== selectedCategory) return false;

      // Side Filter
      if (selectedSide !== 'all' && o.side !== selectedSide) return false;

      // Type Filter
      if (selectedType !== 'all' && o.type !== selectedType) return false;

      // Hide Canceled
      if (hideCanceled && o.status === 'Canceled') return false;

      // Search Query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchSym = o.symbol.toLowerCase().includes(q);
        const matchName = o.name.toLowerCase().includes(q);
        const matchId = o.id.toLowerCase().includes(q);
        if (!matchSym && !matchName && !matchId) return false;
      }

      return true;
    });
  }, [orders, activeTab, selectedCategory, selectedSide, selectedType, hideCanceled, searchQuery]);

  // Capital in Open Orders
  const capitalInOpenOrders = useMemo(() => {
    return openOrdersList.reduce((acc, curr) => {
      const remaining = curr.amount - curr.filledAmount;
      return acc + remaining * curr.price;
    }, 0);
  }, [openOrdersList]);

  // Cancel Single Order Handler
  const handleCancelSingleOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'Canceled' } : o))
    );
    showToast(`Order ${orderId} berhasil dibatalkan.`);
  };

  // Save Edit Order Handler
  const handleSaveOrder = (orderId: string, newPrice: number, newAmount: number) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, price: newPrice, amount: newAmount } : o
      )
    );
    showToast(`Order ${orderId} berhasil diperbarui (Harga: $${newPrice}, Kuantitas: ${newAmount})`);
  };

  // Cancel All Orders Handler
  const handleConfirmCancelAll = (categoryFilter: 'all' | 'crypto' | 'forex' | 'cfd') => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.status === 'Open' || o.status === 'Partially Filled') {
          if (categoryFilter === 'all' || o.category === categoryFilter) {
            return { ...o, status: 'Canceled' };
          }
        }
        return o;
      })
    );
    showToast('Seluruh order aktif berhasil dibatalkan.');
  };

  // Export CSV Handler
  const handleExportOrdersCSV = () => {
    const headers = ['Order_ID', 'Symbol', 'Category', 'Side', 'Type', 'Price', 'Avg_Price', 'Amount', 'Filled', 'Status', 'Fee', 'Time'];
    const rows = filteredOrders.map((o) => [
      o.id,
      o.symbol,
      o.category,
      o.side,
      o.type,
      o.price,
      o.avgPrice,
      o.amount,
      o.filledAmount,
      o.status,
      `${o.fee} ${o.feeAsset}`,
      `"${o.timestamp}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `VeloceX_Orders_Statement_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Laporan orders CSV berhasil diunduh.');
  };

  return (
    <main className="flex flex-col flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full font-sans select-none animate-fade-in text-slate-100">
      {/* 1. TOP SUMMARY HERO BAR (ORDERS METRICS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Capital in Open Orders */}
        <div className="flex flex-col p-5 rounded-3xl bg-[#1F1E25] border border-white/10 gap-2 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>Capital in Open Orders</span>
            <span className="px-2 py-0.5 rounded-md bg-[#00E163]/15 text-[#00E163] text-[10px]">
              {openOrdersList.length} Active
            </span>
          </div>
          <div className="flex items-baseline gap-2 font-mono-num">
            <span className="text-2xl font-black text-white">
              ${capitalInOpenOrders.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-slate-400 font-mono">USDT</span>
          </div>
        </div>

        {/* Metric 2: 30D Executed Volume */}
        <div className="flex flex-col p-5 rounded-3xl bg-[#1F1E25] border border-white/10 gap-2 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>30D Executed Volume</span>
            <span className="px-2 py-0.5 rounded-md bg-amber-400/15 text-amber-300 text-[10px]">
              VIP 1 Tier
            </span>
          </div>
          <div className="flex items-baseline gap-2 font-mono-num">
            <span className="text-2xl font-black text-white">$1,420,500.00</span>
            <span className="text-xs text-slate-400 font-mono">USDT</span>
          </div>
        </div>

        {/* Metric 3: 30D Realized Net PnL */}
        <div className="flex flex-col p-5 rounded-3xl bg-[#1F1E25] border border-white/10 gap-2 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>30D Realized Net PnL</span>
            <span className="text-[#00E163] font-mono-num font-bold text-xs flex items-center gap-0.5">
              <ArrowUp01Icon className="w-3.5 h-3.5" />
              +18.4% ROI
            </span>
          </div>
          <div className="flex items-baseline gap-2 font-mono-num">
            <span className="text-2xl font-black text-[#00E163]">+$24,680.50</span>
            <span className="text-xs text-slate-400 font-mono">USDT</span>
          </div>
        </div>

        {/* Metric 4: Win Rate Gauge */}
        <div className="flex flex-col p-5 rounded-3xl bg-[#1F1E25] border border-white/10 gap-2 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
            <span>Overall Win Rate</span>
            <span className="text-white font-mono-num text-[11px]">110W / 38L</span>
          </div>
          <div className="flex items-baseline gap-2 font-mono-num">
            <span className="text-2xl font-black text-white">74.2%</span>
            <span className="text-xs text-[#00E163] font-bold font-sans">High Performance</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mt-1">
            <div className="h-full bg-[#00E163] rounded-full" style={{ width: '74.2%' }} />
          </div>
        </div>
      </div>

      {/* 2. MAIN ORDERS TERMINAL CARD */}
      <div className="flex flex-col p-6 rounded-3xl bg-[#1F1E25] border border-white/10 shadow-2xl gap-5">
        {/* Navigation Tabs Bar & Action Buttons */}
        <div className="flex flex-col gap-4 pb-4 border-b border-white/5">
          {/* Top Row: Toolbar Action Tools (Cancel All & Export CSV) */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-white font-heading">
                Orders Terminal
              </span>
              <span className="text-xs text-slate-400">
                Real-Time Execution & Trading History
              </span>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {/* Cancel All Orders Button (Only visible on Open Orders tab) */}
              {activeTab === 'open_orders' && openOrdersList.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsCancelAllModalOpen(true)}
                  className="group relative flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#26252E] hover:bg-[#FF5C77] text-slate-300 hover:text-black border border-white/5 text-xs font-bold transition-colors duration-1000 overflow-hidden cursor-pointer"
                >
                  <span className="absolute inset-0 bg-[#FF5C77] -translate-x-[120%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                  <span className="relative z-10 flex items-center gap-1.5 transition-colors duration-500">
                    <Delete02Icon className="w-3.5 h-3.5" />
                    <span>Cancel All ({openOrdersList.length})</span>
                  </span>
                </button>
              )}

              {/* Export CSV Button */}
              <button
                type="button"
                onClick={handleExportOrdersCSV}
                className="group relative flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#26252E] hover:bg-[#00E163] text-slate-300 hover:text-black border border-white/5 text-xs font-bold transition-colors duration-1000 overflow-hidden cursor-pointer"
              >
                <span className="absolute inset-0 bg-[#00E163] -translate-x-[120%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                <span className="relative z-10 flex items-center gap-1.5 transition-colors duration-500">
                  <Download01Icon className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </span>
              </button>
            </div>
          </div>

          {/* 6 Binance / Bybit Standard Nav Tabs in 3-Column Grid Layout with 1000ms Sweep Hover */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 w-full">
            {[
              { id: 'open_orders', label: 'Open Orders', count: openOrdersList.length },
              { id: 'order_history', label: 'Order History' },
              { id: 'trade_history', label: 'Trade History' },
              { id: 'closed_pnl', label: 'Position & Closed PnL' },
              { id: 'bot_orders', label: 'Bot Orders', badge: 'Alpha' },
              { id: 'subscriptions', label: 'Subscription Orders' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`group relative flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-1000 overflow-hidden cursor-pointer outline-none focus:outline-none focus:ring-0 select-none ${
                    isActive
                      ? 'bg-[#00E163] text-black shadow-lg shadow-[#00E163]/25 font-black border border-[#00E163]'
                      : 'bg-[#26252E] text-slate-300 hover:text-black border border-white/5'
                  }`}
                >
                  {!isActive && (
                    <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                  )}
                  <span className="relative z-10 flex items-center justify-center gap-2 transition-colors duration-500 w-full">
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono-num font-bold ${
                          isActive
                            ? 'bg-black text-[#00E163]'
                            : 'bg-white/10 text-slate-300 group-hover:bg-black group-hover:text-[#00E163]'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                    {tab.badge && (
                      <span
                        className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold ${
                          isActive
                            ? 'bg-black text-cyan-300'
                            : 'bg-cyan-400/20 text-cyan-300 group-hover:bg-black'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. ADVANCED FILTER CONTROLS BAR (2x2 GRID + RATA KANAN SEARCH) */}
        {(activeTab === 'open_orders' || activeTab === 'order_history' || activeTab === 'trade_history') && (
          <div className="flex flex-col md:flex-row items-stretch md:items-start justify-between gap-4 p-4 rounded-3xl bg-[#1B1A21] border border-white/5">
            {/* Left: 2x2 Grid of Filter Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
              {/* [Row 1, Col 1] Market Category Filter with 1000ms Sweep Hover */}
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#26252E] border border-white/5 h-11 w-full">
                {[
                  { id: 'all', label: 'Semua' },
                  { id: 'crypto', label: 'Kripto' },
                  { id: 'forex', label: 'Forex' },
                  { id: 'cfd', label: 'CFD' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id as any)}
                    className={`group relative flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-1000 overflow-hidden cursor-pointer outline-none focus:outline-none text-center ${
                      selectedCategory === cat.id
                        ? 'bg-[#00E163] text-black font-extrabold shadow-sm border border-[#00E163]'
                        : 'text-slate-300 hover:text-black border border-transparent'
                    }`}
                  >
                    {selectedCategory !== cat.id && (
                      <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                    )}
                    <span className="relative z-10 transition-colors duration-500">{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* [Row 1, Col 2] Side Filter Custom Floating Dropdown */}
              <div className="relative w-full">
                <button
                  type="button"
                  onClick={() => {
                    setIsSideDropdownOpen(!isSideDropdownOpen);
                    setIsTypeDropdownOpen(false);
                    setIsDateDropdownOpen(false);
                  }}
                  className="flex items-center justify-between gap-2 px-3.5 h-11 w-full rounded-xl bg-[#26252E] border border-white/10 hover:border-white/20 text-xs text-white font-bold transition-all cursor-pointer"
                >
                  <span>{SIDE_OPTIONS.find((s) => s.id === selectedSide)?.label || 'Semua Sisi'}</span>
                  {isSideDropdownOpen ? (
                    <ArrowUp01Icon className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ArrowDown01Icon className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {isSideDropdownOpen && (
                  <div className="absolute left-0 top-12 z-50 w-full min-w-[200px] bg-[#1F1E25] border border-white/10 rounded-2xl p-1.5 shadow-2xl flex flex-col gap-1 backdrop-blur-xl animate-fade-in">
                    {SIDE_OPTIONS.map((opt) => {
                      const isSelected = selectedSide === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setSelectedSide(opt.id as any);
                            setIsSideDropdownOpen(false);
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
                          {isSelected && <Tick01Icon className="relative z-10 w-3.5 h-3.5 stroke-[3] text-black shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* [Row 2, Col 1] Order Type Filter Custom Floating Dropdown */}
              <div className="relative w-full">
                <button
                  type="button"
                  onClick={() => {
                    setIsTypeDropdownOpen(!isTypeDropdownOpen);
                    setIsSideDropdownOpen(false);
                    setIsDateDropdownOpen(false);
                  }}
                  className="flex items-center justify-between gap-2 px-3.5 h-11 w-full rounded-xl bg-[#26252E] border border-white/10 hover:border-white/20 text-xs text-white font-bold transition-all cursor-pointer"
                >
                  <span>{TYPE_OPTIONS.find((t) => t.id === selectedType)?.label || 'Semua Tipe Order'}</span>
                  {isTypeDropdownOpen ? (
                    <ArrowUp01Icon className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ArrowDown01Icon className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {isTypeDropdownOpen && (
                  <div className="absolute left-0 top-12 z-50 w-full min-w-[200px] bg-[#1F1E25] border border-white/10 rounded-2xl p-1.5 shadow-2xl flex flex-col gap-1 backdrop-blur-xl animate-fade-in">
                    {TYPE_OPTIONS.map((opt) => {
                      const isSelected = selectedType === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setSelectedType(opt.id);
                            setIsTypeDropdownOpen(false);
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
                          {isSelected && <Tick01Icon className="relative z-10 w-3.5 h-3.5 stroke-[3] text-black shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* [Row 2, Col 2] Date Range Filter Custom Floating Dropdown */}
              <div className="relative w-full">
                <button
                  type="button"
                  onClick={() => {
                    setIsDateDropdownOpen(!isDateDropdownOpen);
                    setIsSideDropdownOpen(false);
                    setIsTypeDropdownOpen(false);
                  }}
                  className="flex items-center justify-between gap-2 px-3.5 h-11 w-full rounded-xl bg-[#26252E] border border-white/10 hover:border-white/20 text-xs text-white font-bold transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Calendar03Icon className="w-3.5 h-3.5 text-[#00E163]" />
                    <span>{DATE_OPTIONS.find((d) => d.id === selectedDateRange)?.label || 'Semua Waktu'}</span>
                  </span>
                  {isDateDropdownOpen ? (
                    <ArrowUp01Icon className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ArrowDown01Icon className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {isDateDropdownOpen && (
                  <div className="absolute left-0 top-12 z-50 w-full min-w-[210px] bg-[#1F1E25] border border-white/10 rounded-2xl p-1.5 shadow-2xl flex flex-col gap-1 backdrop-blur-xl animate-fade-in">
                    {DATE_OPTIONS.map((opt) => {
                      const isSelected = selectedDateRange === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setSelectedDateRange(opt.id as any);
                            setIsDateDropdownOpen(false);
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
                          {isSelected && <Tick01Icon className="relative z-10 w-3.5 h-3.5 stroke-[3] text-black shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Search Coin & Actions (Rata Kanan & Sejajar) */}
            <div className="flex flex-col items-stretch md:items-end justify-between gap-3 shrink-0 self-stretch min-w-[240px]">
              {/* Row 1 Aligned: Search Coin Input */}
              <div className="relative flex items-center h-11 px-3.5 rounded-xl bg-[#26252E] border border-white/10 hover:border-white/20 text-xs text-white w-full">
                <Search01Icon className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search symbol / ID..."
                  className="bg-transparent placeholder:text-slate-500 focus:outline-none w-full text-xs font-sans text-white"
                />
              </div>

              {/* Row 2 Aligned: Cancel By Filtered Symbol & Hide Canceled Toggle */}
              <div className="flex items-center gap-2.5 justify-end h-11 w-full">
                {/* Cancel By Filtered Symbol Button */}
                {activeTab === 'open_orders' && searchQuery.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={handleCancelFilteredOrders}
                    className="group relative flex items-center gap-1.5 px-3.5 h-11 rounded-xl bg-[#26252E] hover:bg-[#FF5C77] text-slate-300 hover:text-black border border-white/5 text-xs font-bold transition-all duration-1000 overflow-hidden cursor-pointer shrink-0"
                  >
                    <span className="absolute inset-0 bg-[#FF5C77] -translate-x-[120%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                    <span className="relative z-10 flex items-center gap-1 transition-colors duration-500">
                      <Delete02Icon className="w-3.5 h-3.5" />
                      <span>Batal Semua &ldquo;{searchQuery.toUpperCase()}&rdquo;</span>
                    </span>
                  </button>
                )}

                {/* Hide Canceled Toggle */}
                {activeTab === 'order_history' && (
                  <button
                    type="button"
                    onClick={() => setHideCanceled(!hideCanceled)}
                    className="flex items-center gap-2 px-3 h-11 rounded-xl bg-[#26252E] border border-white/5 text-xs font-bold select-none cursor-pointer group"
                  >
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                        hideCanceled
                          ? 'bg-[#00E163] border-[#00E163] text-black shadow-sm'
                          : 'border-white/20 bg-transparent group-hover:border-white/40'
                      }`}
                    >
                      {hideCanceled && (
                        <Tick01Icon className="w-3 h-3 stroke-[3] text-black" />
                      )}
                    </div>
                    <span className={`transition-colors text-[11px] ${hideCanceled ? 'text-white font-bold' : 'text-slate-400 group-hover:text-white'}`}>
                      Hide Canceled
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. TAB CONTENT RENDERER */}

        {/* TAB 1: OPEN ORDERS */}
        {activeTab === 'open_orders' && (
          <div className="overflow-x-auto custom-positions-scrollbar">
            <div className="max-h-[260px] overflow-y-auto custom-positions-scrollbar relative">
              <table className="w-full text-left text-xs font-sans border-collapse">
                <thead className="sticky top-0 z-30 bg-[#1F1E25] border-b border-white/5">
                  <tr className="border-b border-white/5 text-slate-400 font-bold bg-[#1F1E25]">
                    <th className="py-3 px-3 bg-[#1F1E25] sticky top-0 z-30">Order ID / Market</th>
                    <th className="py-3 px-3 bg-[#1F1E25] sticky top-0 z-30">Type / Side</th>
                    <th className="py-3 px-3 text-right bg-[#1F1E25] sticky top-0 z-30">Order Price</th>
                    <th className="py-3 px-3 text-right bg-[#1F1E25] sticky top-0 z-30">Amount</th>
                    <th className="py-3 px-3 bg-[#1F1E25] sticky top-0 z-30">Filled Progress</th>
                    <th className="py-3 px-3 text-right bg-[#1F1E25] sticky top-0 z-30">Total USD</th>
                    <th className="py-3 px-3 bg-[#1F1E25] sticky top-0 z-30">TP / SL Target</th>
                    <th className="py-3 px-3 bg-[#1F1E25] sticky top-0 z-30">Time</th>
                    <th className="py-3 px-3 text-center bg-[#1F1E25] sticky top-0 z-30">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono-num relative z-0">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-14 text-center text-slate-500 font-sans text-xs">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Note01Icon className="w-8 h-8 text-slate-600 opacity-50" />
                          <span>Tidak ada open order yang aktif saat ini.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => {
                      const fillPct = (ord.filledAmount / ord.amount) * 100;
                      const totalUSD = ord.amount * ord.price;
                      return (
                        <tr key={ord.id} className="hover:bg-white/[0.02] transition-colors">
                          {/* ID & Market */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2.5">
                              <MarketIcon symbol={ord.symbol} size="sm" />
                              <div className="flex flex-col">
                                <span className="font-extrabold text-white text-xs">{ord.symbol}</span>
                                <span className="text-[10px] text-slate-500 font-mono">{ord.id}</span>
                              </div>
                            </div>
                          </td>

                          {/* Type & Side */}
                          <td className="py-3.5 px-3 font-sans">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                                  ord.side === 'BUY'
                                    ? 'bg-[#00E163]/15 text-[#00E163]'
                                    : 'bg-[#FF5C77]/15 text-[#FF5C77]'
                                }`}
                              >
                                {ord.side}
                              </span>
                              <span className="text-slate-300 font-bold text-xs">{ord.type}</span>
                            </div>
                          </td>

                          {/* Order Price */}
                          <td className="py-3.5 px-3 text-right text-white font-bold">
                            ${ord.price.toLocaleString()}
                          </td>

                          {/* Amount */}
                          <td className="py-3.5 px-3 text-right text-slate-300 font-bold">
                            {ord.amount.toLocaleString()} {ord.symbol}
                          </td>

                          {/* Filled Progress Bar */}
                          <td className="py-3.5 px-3 min-w-[130px]">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between text-[10px] text-slate-400">
                                <span>{fillPct.toFixed(1)}%</span>
                                <span>{ord.filledAmount} / {ord.amount}</span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div
                                  className="h-full bg-[#00E163] rounded-full transition-all duration-500"
                                  style={{ width: `${fillPct}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Total USD */}
                          <td className="py-3.5 px-3 text-right text-white font-bold">
                            ${totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>

                          {/* TP / SL Column with Quick Edit Button */}
                          <td className="py-3.5 px-3">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTPSLOrder(ord);
                                setIsTPSLModalOpen(true);
                              }}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#26252E] hover:bg-white/10 border border-white/5 text-[10px] text-slate-300 hover:text-white transition-colors cursor-pointer group/tp"
                            >
                              <Target01Icon className="w-3 h-3 text-[#00E163]" />
                              <span className="font-mono">
                                ${(ord.price * 1.05).toFixed(0)} / ${(ord.price * 0.95).toFixed(0)}
                              </span>
                              <Edit01Icon className="w-2.5 h-2.5 text-slate-500 group-hover/tp:text-[#00E163] ml-0.5" />
                            </button>
                          </td>

                          {/* Timestamp */}
                          <td className="py-3.5 px-3 text-slate-400 font-sans text-[11px] whitespace-nowrap">
                            {ord.timestamp}
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => {
                                 setSelectedEditableOrder(ord);
                                 setIsEditModalOpen(true);
                                }}
                                className="group/btn relative px-2.5 py-1 rounded-lg bg-[#26252E] hover:bg-[#00E163] text-slate-300 hover:text-black font-bold text-[10px] transition-colors duration-1000 overflow-hidden cursor-pointer"
                                title="Edit Harga / Kuantitas"
                              >
                                <span className="absolute inset-0 bg-[#00E163] -translate-x-[120%] opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                                <span className="relative z-10 transition-colors duration-1000 flex items-center gap-1">
                                  <Edit01Icon className="w-3 h-3" />
                                  <span>Edit</span>
                                </span>
                              </button>

                              {/* Cancel Button */}
                              <button
                                type="button"
                                onClick={() => handleCancelSingleOrder(ord.id)}
                                className="group/btn relative px-2.5 py-1 rounded-lg bg-[#26252E] hover:bg-[#FF5C77] text-slate-300 hover:text-black font-bold text-[10px] transition-colors duration-1000 overflow-hidden cursor-pointer"
                                title="Batalkan Order"
                              >
                                <span className="absolute inset-0 bg-[#FF5C77] -translate-x-[120%] opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                                <span className="relative z-10 transition-colors duration-1000 flex items-center gap-1">
                                  <Cancel01Icon className="w-3 h-3" />
                                  <span>Cancel</span>
                                </span>
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
        )}

        {/* TAB 2: ORDER HISTORY */}
        {activeTab === 'order_history' && (
          <div className="overflow-x-auto custom-positions-scrollbar">
            <div className="max-h-[260px] overflow-y-auto custom-positions-scrollbar relative">
              <table className="w-full text-left text-xs font-sans border-collapse">
                <thead className="sticky top-0 z-30 bg-[#1F1E25] border-b border-white/5">
                  <tr className="border-b border-white/5 text-slate-400 font-bold bg-[#1F1E25]">
                    <th className="py-3 px-3 bg-[#1F1E25] sticky top-0 z-30">Order ID / Market</th>
                    <th className="py-3 px-3 bg-[#1F1E25] sticky top-0 z-30">Side / Type</th>
                    <th className="py-3 px-3 text-right bg-[#1F1E25] sticky top-0 z-30">Order Price</th>
                    <th className="py-3 px-3 text-right bg-[#1F1E25] sticky top-0 z-30">Avg Filled</th>
                    <th className="py-3 px-3 text-right bg-[#1F1E25] sticky top-0 z-30">Executed / Total</th>
                    <th className="py-3 px-3 bg-[#1F1E25] sticky top-0 z-30">Status</th>
                    <th className="py-3 px-3 bg-[#1F1E25] sticky top-0 z-30">Time</th>
                    <th className="py-3 px-3 text-center bg-[#1F1E25] sticky top-0 z-30">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono-num relative z-0">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <MarketIcon symbol={ord.symbol} size="sm" />
                          <div className="flex flex-col">
                            <span className="font-extrabold text-white text-xs">{ord.symbol}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{ord.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-sans">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                              ord.side === 'BUY'
                                ? 'bg-[#00E163]/15 text-[#00E163]'
                                : 'bg-[#FF5C77]/15 text-[#FF5C77]'
                            }`}
                          >
                            {ord.side}
                          </span>
                          <span className="text-slate-300 font-bold text-xs">{ord.type}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-right text-slate-300 font-bold">
                        ${ord.price.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-3 text-right text-white font-bold">
                        ${ord.avgPrice.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-3 text-right text-slate-300 font-bold">
                        {ord.filledAmount} / {ord.amount}
                      </td>

                      <td className="py-3.5 px-3 font-sans">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                            ord.status === 'Filled'
                              ? 'bg-[#00E163]/15 text-[#00E163]'
                              : ord.status === 'Partially Filled'
                              ? 'bg-amber-400/15 text-amber-300'
                              : 'bg-white/10 text-slate-400'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-slate-400 font-sans text-[11px] whitespace-nowrap">
                        {ord.timestamp}
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDetailRecord({
                              ...ord,
                              createdAt: ord.timestamp,
                              updatedAt: 'Just now',
                            });
                            setIsDetailModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#26252E] hover:bg-white/10 text-slate-300 font-bold text-[10px] transition-colors cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: TRADE HISTORY (FILLS LOG) */}
        {activeTab === 'trade_history' && (
          <div className="overflow-x-auto custom-positions-scrollbar">
            <div className="max-h-[260px] overflow-y-auto custom-positions-scrollbar relative">
              <table className="w-full text-left text-xs font-sans border-collapse">
                <thead className="sticky top-0 z-30 bg-[#1F1E25] border-b border-white/5">
                  <tr className="border-b border-white/5 text-slate-400 font-bold bg-[#1F1E25]">
                    <th className="py-3 px-3 bg-[#1F1E25] sticky top-0 z-30">Trade ID / Market</th>
                    <th className="py-3 px-3 bg-[#1F1E25] sticky top-0 z-30">Side</th>
                    <th className="py-3 px-3 text-right bg-[#1F1E25] sticky top-0 z-30">Executed Price</th>
                    <th className="py-3 px-3 text-right bg-[#1F1E25] sticky top-0 z-30">Filled Quantity</th>
                    <th className="py-3 px-3 text-right bg-[#1F1E25] sticky top-0 z-30">Total Transacted</th>
                    <th className="py-3 px-3 bg-[#1F1E25] sticky top-0 z-30">Liquidity Role</th>
                    <th className="py-3 px-3 bg-[#1F1E25] sticky top-0 z-30">Trading Fee</th>
                    <th className="py-3 px-3 bg-[#1F1E25] sticky top-0 z-30">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono-num relative z-0">
                  {orders
                    .filter((o) => o.filledAmount > 0)
                    .map((tr) => {
                      const transacted = tr.filledAmount * tr.avgPrice;
                      return (
                        <tr key={tr.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2.5">
                              <MarketIcon symbol={tr.symbol} size="sm" />
                              <div className="flex flex-col">
                                <span className="font-extrabold text-white text-xs">{tr.symbol}</span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  FILL-{tr.id.substring(4)}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 font-sans">
                            <span
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                                tr.side === 'BUY'
                                  ? 'bg-[#00E163]/15 text-[#00E163]'
                                  : 'bg-[#FF5C77]/15 text-[#FF5C77]'
                              }`}
                            >
                              {tr.side}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 text-right text-white font-bold">
                            ${tr.avgPrice.toLocaleString()}
                          </td>

                          <td className="py-3.5 px-3 text-right text-slate-200 font-bold">
                            {tr.filledAmount} {tr.symbol}
                          </td>

                          <td className="py-3.5 px-3 text-right text-[#00E163] font-bold">
                            ${transacted.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT
                          </td>

                          <td className="py-3.5 px-3 font-sans">
                            <span className="px-2 py-0.5 rounded bg-white/10 text-slate-300 font-bold text-[10px]">
                              {tr.role}
                            </span>
                          </td>

                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-amber-400 font-bold">{tr.fee} USDT</span>
                              <span className="px-1.5 py-0.2 rounded bg-[#00E163]/15 text-[#00E163] text-[9px] font-bold">
                                25% OFF
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 text-slate-400 font-sans text-[11px] whitespace-nowrap">
                            {tr.timestamp}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: POSITION & CLOSED PNL HISTORY */}
        {activeTab === 'closed_pnl' && (
          <div className="overflow-x-auto custom-positions-scrollbar">
            <div className="max-h-[260px] overflow-y-auto custom-positions-scrollbar relative">
              <table className="w-full text-left text-xs font-sans border-collapse">
                <thead className="sticky top-0 z-30 bg-[#1F1E25] border-b border-white/5">
                  <tr className="border-b border-white/5 text-slate-400 font-bold bg-[#1F1E25]">
                    <th className="py-3 px-3 bg-[#1F1E25] sticky top-0 z-30">Position / Leverage</th>
                    <th className="py-3 px-3 bg-[#1F1E25] sticky top-0 z-30">Side</th>
                    <th className="py-3 px-3 text-right bg-[#1F1E25] sticky top-0 z-30">Entry Price</th>
                    <th className="py-3 px-3 text-right bg-[#1F1E25] sticky top-0 z-30">Exit Price</th>
                    <th className="py-3 px-3 text-right bg-[#1F1E25] sticky top-0 z-30">Closed Net PnL</th>
                    <th className="py-3 px-3 text-right bg-[#1F1E25] sticky top-0 z-30">ROI (%)</th>
                    <th className="py-3 px-3 bg-[#1F1E25] sticky top-0 z-30">Close Reason</th>
                    <th className="py-3 px-3 bg-[#1F1E25] sticky top-0 z-30">Close Time</th>
                    <th className="py-3 px-3 text-center bg-[#1F1E25] sticky top-0 z-30">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono-num relative z-0">
                  {closedPositions.map((pos) => {
                    const isProfit = pos.closedPnl >= 0;
                    return (
                      <tr key={pos.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <MarketIcon symbol={pos.symbol} size="sm" />
                            <div className="flex flex-col">
                              <span className="font-extrabold text-white text-xs">{pos.symbol}</span>
                              <span className="text-[10px] text-amber-400 font-mono font-bold">
                                {pos.leverage} Leverage
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 font-sans">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                              pos.side === 'LONG'
                                ? 'bg-[#00E163]/15 text-[#00E163]'
                                : 'bg-[#FF5C77]/15 text-[#FF5C77]'
                            }`}
                          >
                            {pos.side}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-right text-slate-300 font-bold">
                          ${pos.entryPrice.toLocaleString()}
                        </td>

                        <td className="py-3.5 px-3 text-right text-white font-bold">
                          ${pos.closePrice.toLocaleString()}
                        </td>

                        <td className="py-3.5 px-3 text-right font-black">
                          <span className={isProfit ? 'text-[#00E163]' : 'text-[#FF5C77]'}>
                            {isProfit ? '+' : ''}${pos.closedPnl.toLocaleString()} USDT
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-right font-bold">
                          <span className={isProfit ? 'text-[#00E163]' : 'text-[#FF5C77]'}>
                            {isProfit ? '+' : ''}{pos.roiPct}%
                          </span>
                        </td>

                        <td className="py-3.5 px-3 font-sans">
                          <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-slate-200 font-bold text-[10px]">
                            {pos.closeType}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-slate-400 font-sans text-[11px] whitespace-nowrap">
                          {pos.closeTime}
                        </td>

                        {/* Share PnL Poster Button */}
                        <td className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSharePosition(pos);
                              setIsShareModalOpen(true);
                            }}
                            className="group/btn relative px-2.5 py-1 rounded-lg bg-[#26252E] hover:bg-[#00E163] text-slate-300 hover:text-black font-bold text-[10px] transition-colors duration-1000 overflow-hidden cursor-pointer"
                            title="Generate Poster PnL Shareable"
                          >
                            <span className="absolute inset-0 bg-[#00E163] -translate-x-[120%] opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                            <span className="relative z-10 transition-colors duration-1000 flex items-center gap-1">
                              <Share01Icon className="w-3 h-3" />
                              <span>Share</span>
                            </span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: BOT ORDERS (GRID & ALGO) */}
        {activeTab === 'bot_orders' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {botOrders.map((bot) => (
              <div
                key={bot.id}
                className="flex flex-col p-5 rounded-3xl bg-[#26252E] border border-white/5 hover:border-[#00E163]/30 transition-all gap-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MarketIcon symbol={bot.symbol} size="md" />
                    <div className="flex flex-col">
                      <span className="font-extrabold text-sm text-white">{bot.botName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {bot.strategy} • {bot.symbol}
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full bg-[#00E163]/15 text-[#00E163] text-[10px] font-bold">
                    {bot.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-[#1B1A21] font-mono-num text-xs">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-sans">Total Modal</span>
                    <strong className="text-white font-bold">${bot.totalInvestment.toLocaleString()}</strong>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-sans">Grid Profit</span>
                    <strong className="text-[#00E163] font-bold">+${bot.gridProfit.toLocaleString()}</strong>
                  </div>

                  <div className="flex flex-col text-right">
                    <span className="text-[10px] text-slate-400 font-sans">Arbitrase</span>
                    <strong className="text-white font-bold">{bot.arbitrageCount} Fills</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <span>Waktu Berjalan: <strong className="text-slate-200">{bot.runtime}</strong></span>
                  <button
                    type="button"
                    onClick={() => showToast(`Manajemen strategi ${bot.botName} dibuka`)}
                    className="px-3 py-1.5 rounded-xl bg-[#1F1E25] hover:bg-[#00E163] text-slate-300 hover:text-black font-bold text-xs transition-colors cursor-pointer"
                  >
                    Atur Strategi
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 6: SUBSCRIPTION ORDERS (SIMPLE EARN) */}
        {activeTab === 'subscriptions' && (
          <div className="overflow-x-auto custom-positions-scrollbar">
            <div className="max-h-[260px] overflow-y-auto custom-positions-scrollbar relative">
              <table className="w-full text-left text-xs font-sans border-collapse">
                <thead className="sticky top-0 z-30 bg-[#1F1E25] border-b border-white/5">
                  <tr className="border-b border-white/5 text-slate-400 font-bold bg-[#1F1E25]">
                    <th className="py-3 px-3 bg-[#1F1E25] sticky top-0 z-30">Product / Asset</th>
                    <th className="py-3 px-3 text-right bg-[#1F1E25] sticky top-0 z-30">Staked Capital</th>
                    <th className="py-3 px-3 text-right bg-[#1F1E25] sticky top-0 z-30">APY Rate</th>
                    <th className="py-3 px-3 text-right bg-[#1F1E25] sticky top-0 z-30">Daily Yield</th>
                    <th className="py-3 px-3 text-right bg-[#1F1E25] sticky top-0 z-30">Cumulative Yield</th>
                    <th className="py-3 px-3 text-center bg-[#1F1E25] sticky top-0 z-30">Auto-Compound</th>
                    <th className="py-3 px-3 bg-[#1F1E25] sticky top-0 z-30">Start Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono-num relative z-0">
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <MarketIcon symbol={sub.symbol} size="sm" />
                          <div className="flex flex-col">
                            <span className="font-extrabold text-white text-xs">{sub.productName}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{sub.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-right text-white font-bold">
                        {sub.stakedAmount.toLocaleString()} {sub.symbol}
                      </td>

                      <td className="py-3.5 px-3 text-right text-[#00E163] font-black text-sm">
                        +{sub.apy}%
                      </td>

                      <td className="py-3.5 px-3 text-right text-[#00E163] font-bold">
                        +{sub.dailyYield} {sub.symbol}/day
                      </td>

                      <td className="py-3.5 px-3 text-right text-white font-bold">
                        +{sub.cumulativeYield} {sub.symbol}
                      </td>

                      <td className="py-3.5 px-3 text-center font-sans">
                        <span className="px-2 py-0.5 rounded-md bg-[#00E163]/15 text-[#00E163] text-[10px] font-bold">
                          Active
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-slate-400 font-sans text-[11px] whitespace-nowrap">
                        {sub.startDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ALL MODALS */}
      <EditOrderModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        order={selectedEditableOrder}
        onSaveOrder={handleSaveOrder}
      />

      <CancelAllModal
        isOpen={isCancelAllModalOpen}
        onClose={() => setIsCancelAllModalOpen(false)}
        openOrderCount={openOrdersList.length}
        onConfirmCancelAll={handleConfirmCancelAll}
      />

      <OrderDetailsModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        order={selectedDetailRecord}
      />

      <SharePnLModal
        isOpen={isShareModalOpen}
        position={selectedSharePosition}
        onClose={() => setIsShareModalOpen(false)}
        onSuccessToast={showToast}
      />

      <EditTPSLModal
        isOpen={isTPSLModalOpen}
        order={selectedTPSLOrder}
        onClose={() => setIsTPSLModalOpen(false)}
        onSaveTPSL={handleSaveTPSL}
      />
    </main>
  );
};
