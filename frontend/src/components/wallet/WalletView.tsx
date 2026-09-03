'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTradingStore } from '@/store/useTradingStore';
import { MarketIcon } from '@/components/MarketIcon';
import { DepositModal } from './DepositModal';
import { WithdrawModal } from './WithdrawModal';
import { TransferModal } from './TransferModal';
import { DustConverterModal } from './DustConverterModal';
import { QuickSwapModal } from './QuickSwapModal';
import { EarnSubscribeModal, EarnProduct } from './EarnSubscribeModal';
import { VipTierWidget } from './VipTierWidget';
import { P2PExpressModal } from './P2PExpressModal';
import { CryptoLoanModal } from './CryptoLoanModal';
import { CryptoCardModal } from './CryptoCardModal';
import { SubAccountManagerModal } from './SubAccountManagerModal';
import {
  Wallet01Icon,
  Search01Icon,
  Copy01Icon,
  CheckmarkCircle01Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  FlashIcon,
  SparklesIcon,
  Coins01Icon,
  ArrowUpDownIcon,
  Download01Icon,
  Shield01Icon,
  LockPasswordIcon,
  CreditCardIcon,
  BankIcon,
  UserGroupIcon,
  CrownIcon,
  ViewIcon,
  ViewOffSlashIcon,
  Tick01Icon,
  Cancel01Icon,
  Exchange01Icon,
} from 'hugeicons-react';

interface WalletAsset {
  symbol: string;
  name: string;
  category: 'crypto' | 'forex' | 'cfd';
  amount: number;
  inOrders: number;
  decimals: number;
  tickerKey: string;
}

const INITIAL_WALLET_ASSETS: WalletAsset[] = [
  // 1. Kripto (Saldo Awal Akun Baru: 0.0)
  { symbol: 'USDT', name: 'Tether USD', category: 'crypto', amount: 0.0, inOrders: 0.0, decimals: 2, tickerKey: 'BTCUSDT' },
  { symbol: 'BTC', name: 'Bitcoin', category: 'crypto', amount: 0.0, inOrders: 0.0, decimals: 4, tickerKey: 'BTCUSDT' },
  { symbol: 'ETH', name: 'Ethereum', category: 'crypto', amount: 0.0, inOrders: 0.0, decimals: 4, tickerKey: 'ETHUSDT' },
  { symbol: 'SOL', name: 'Solana', category: 'crypto', amount: 0.0, inOrders: 0.0, decimals: 2, tickerKey: 'SOLUSDT' },
  { symbol: 'BNB', name: 'Binance Coin', category: 'crypto', amount: 0.0, inOrders: 0.0, decimals: 2, tickerKey: 'BNBUSDT' },
  { symbol: 'LTC', name: 'Litecoin', category: 'crypto', amount: 0.0, inOrders: 0.0, decimals: 2, tickerKey: 'LTCUSDT' },
  { symbol: 'ADA', name: 'Cardano', category: 'crypto', amount: 0.0, inOrders: 0.0, decimals: 2, tickerKey: 'ADAUSDT' },
  { symbol: 'DOGE', name: 'Dogecoin', category: 'crypto', amount: 0.0, inOrders: 0.0, decimals: 1, tickerKey: 'DOGEUSDT' },
  { symbol: 'XRP', name: 'Ripple', category: 'crypto', amount: 0.0, inOrders: 0.0, decimals: 1, tickerKey: 'XRPUSDT' },
  { symbol: 'USDC', name: 'USD Coin', category: 'crypto', amount: 0.0, inOrders: 0.0, decimals: 2, tickerKey: 'BTCUSDT' },

  // 2. Forex (Saldo Awal: 0.0)
  { symbol: 'EUR', name: 'EUR / USD', category: 'forex', amount: 0.0, inOrders: 0.0, decimals: 2, tickerKey: 'EURUSD' },
  { symbol: 'GBP', name: 'GBP / USD', category: 'forex', amount: 0.0, inOrders: 0.0, decimals: 2, tickerKey: 'GBPUSD' },
  { symbol: 'JPY', name: 'USD / JPY', category: 'forex', amount: 0.0, inOrders: 0.0, decimals: 0, tickerKey: 'USDJPY' },
  { symbol: 'AUD', name: 'AUD / USD', category: 'forex', amount: 0.0, inOrders: 0.0, decimals: 2, tickerKey: 'AUDUSD' },
  { symbol: 'CAD', name: 'USD / CAD', category: 'forex', amount: 0.0, inOrders: 0.0, decimals: 2, tickerKey: 'USDCAD' },
  { symbol: 'CHF', name: 'USD / CHF', category: 'forex', amount: 0.0, inOrders: 0.0, decimals: 2, tickerKey: 'USDCHF' },

  // 3. CFD & Commodities (Saldo Awal: 0.0)
  { symbol: 'XAU', name: 'Gold (Emas)', category: 'cfd', amount: 0.0, inOrders: 0.0, decimals: 2, tickerKey: 'XAUUSD' },
  { symbol: 'XAG', name: 'Silver (Perak)', category: 'cfd', amount: 0.0, inOrders: 0.0, decimals: 2, tickerKey: 'XAGUSD' },
  { symbol: 'USOIL', name: 'Crude Oil WTI', category: 'cfd', amount: 0.0, inOrders: 0.0, decimals: 2, tickerKey: 'USOIL' },
  { symbol: 'SPX500', name: 'S&P 500 Index', category: 'cfd', amount: 0.0, inOrders: 0.0, decimals: 2, tickerKey: 'SPX500' },
  { symbol: 'NAS100', name: 'Nasdaq 100', category: 'cfd', amount: 0.0, inOrders: 0.0, decimals: 2, tickerKey: 'NAS100' },
  { symbol: 'US30', name: 'Dow Jones 30', category: 'cfd', amount: 0.0, inOrders: 0.0, decimals: 2, tickerKey: 'US30' },
];

interface WalletTx {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER' | 'FAUCET' | 'SWAP' | 'EARN' | 'P2P' | 'LOAN';
  asset: string;
  amount: number;
  timestamp: string;
  status: 'Completed' | 'Processing';
  txid: string;
  detail: string;
}

const INITIAL_TRANSACTIONS: WalletTx[] = [];

const EARN_PRODUCTS: EarnProduct[] = [
  {
    id: 'earn_usdt',
    symbol: 'USDT',
    name: 'USDT Flexible Savings',
    category: 'crypto',
    apy: 11.8,
    duration: 'Flexible • Daily Interest',
    minAmount: 10,
    availableBalance: 0.0,
  },
  {
    id: 'earn_btc',
    symbol: 'BTC',
    name: 'Bitcoin Flexible Yield',
    category: 'crypto',
    apy: 3.5,
    duration: 'Flexible • Daily Interest',
    minAmount: 0.001,
    availableBalance: 0.0,
  },
  {
    id: 'earn_eth',
    symbol: 'ETH',
    name: 'Ethereum 2.0 Staking Pool',
    category: 'crypto',
    apy: 4.2,
    duration: 'Flexible • Daily Auto-Compound',
    minAmount: 0.01,
    availableBalance: 0.0,
  },
  {
    id: 'earn_xau',
    symbol: 'XAU',
    name: 'Gold (Emas) CFD Yield',
    category: 'cfd',
    apy: 2.8,
    duration: 'Flexible • Commodity Yield',
    minAmount: 0.01,
    availableBalance: 0.0,
  },
];

interface WalletViewProps {
  onOrderSuccess?: (msg: string) => void;
}

export const WalletView: React.FC<WalletViewProps> = ({ onOrderSuccess }) => {
  const { portfolio, tickers, setPortfolio } = useTradingStore();

  // Sub-Wallet Balances (Fresh 0.0 for new user accounts)
  const [spotBalance, setSpotBalance] = useState(0.0);
  const [futuresBalance, setFuturesBalance] = useState(0.0);
  const [fundingBalance, setFundingBalance] = useState(0.0);
  const [stakedEarnTotal, setStakedEarnTotal] = useState(0.0);

  // Asset Balances & Transactions
  const [assets, setAssets] = useState<WalletAsset[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('velocex_wallet_assets_v2');
        if (saved) return JSON.parse(saved);
      } catch (_) {}
    }
    return INITIAL_WALLET_ASSETS;
  });
  const [transactions, setTransactions] = useState<WalletTx[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('velocex_wallet_txs_v2');
        if (saved) return JSON.parse(saved);
      } catch (_) {}
    }
    return INITIAL_TRANSACTIONS;
  });

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'crypto' | 'forex' | 'cfd'>('all');
  const [hideZeroBalances, setHideZeroBalances] = useState(false);
  const [activeTxTab, setActiveTxTab] = useState<'all' | 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER'>('all');
  const [activeDateRange, setActiveDateRange] = useState<'all' | '7d' | '30d' | '90d'>('all');
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  
  // 4-Step Faucet Choreography State
  type FaucetPhase = 'idle' | 'loading' | 'center_check' | 'shift_success';
  const [faucetPhase, setFaucetPhase] = useState<FaucetPhase>('idle');

  // Modals
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isDustModalOpen, setIsDustModalOpen] = useState(false);
  const [isSwapOpen, setIsSwapOpen] = useState(false);
  const [selectedSwapFromSymbol, setSelectedSwapFromSymbol] = useState('BTC');
  const [isEarnOpen, setIsEarnOpen] = useState(false);
  const [selectedEarnProduct, setSelectedEarnProduct] = useState<EarnProduct>(EARN_PRODUCTS[0]);
  const [isPorModalOpen, setIsPorModalOpen] = useState(false);
  const [isP2pOpen, setIsP2pOpen] = useState(false);
  const [isLoanOpen, setIsLoanOpen] = useState(false);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [isSubAccountOpen, setIsSubAccountOpen] = useState(false);
  const [copiedTxid, setCopiedTxid] = useState<string | null>(null);

  const showToast = (msg: string) => {
    onOrderSuccess?.(msg);
  };

  // 1. Calculate Live Asset Valuation
  const calculatedAssets = useMemo(() => {
    return assets.map((asset) => {
      let unitPrice = 1.0;
      if (asset.symbol === 'USDT' || asset.symbol === 'USDC') {
        unitPrice = 1.0;
      } else {
        const liveTicker = tickers[asset.tickerKey];
        if (asset.symbol === 'JPY') {
          unitPrice = liveTicker && liveTicker.price > 0 ? 1 / liveTicker.price : 0.0065;
        } else if (liveTicker && liveTicker.price > 0) {
          unitPrice = liveTicker.price;
        } else {
          if (asset.symbol === 'BTC') unitPrice = 75368.45;
          else if (asset.symbol === 'ETH') unitPrice = 4149.74;
          else if (asset.symbol === 'SOL') unitPrice = 145.0;
          else if (asset.symbol === 'LTC') unitPrice = 85.0;
          else if (asset.symbol === 'DOGE') unitPrice = 0.14;
          else if (asset.symbol === 'XRP') unitPrice = 0.58;
          else if (asset.symbol === 'EUR') unitPrice = 1.0842;
          else if (asset.symbol === 'GBP') unitPrice = 1.2915;
          else if (asset.symbol === 'AUD') unitPrice = 0.658;
          else if (asset.symbol === 'CAD') unitPrice = 0.724;
          else if (asset.symbol === 'CHF') unitPrice = 1.13;
          else if (asset.symbol === 'XAU') unitPrice = 2514.8;
          else if (asset.symbol === 'XAG') unitPrice = 29.45;
          else if (asset.symbol === 'USOIL') unitPrice = 74.6;
          else if (asset.symbol === 'SPX500') unitPrice = 5648.4;
          else if (asset.symbol === 'NAS100') unitPrice = 19720.5;
          else if (asset.symbol === 'US30') unitPrice = 41250.0;
        }
      }

      const totalValUSD = (asset.amount + asset.inOrders) * unitPrice;
      return {
        ...asset,
        unitPrice,
        totalValUSD,
      };
    });
  }, [assets, tickers]);

  // Total Net Worth
  const totalCalculatedNetWorth = useMemo(() => {
    return calculatedAssets.reduce((acc, curr) => acc + curr.totalValUSD, 0) + stakedEarnTotal;
  }, [calculatedAssets, stakedEarnTotal]);

  // Keep Global Header Balance in Sync with Live Wallet Net Worth
  useEffect(() => {
    if (totalCalculatedNetWorth > 0 && portfolio?.total_equity_usdt !== totalCalculatedNetWorth) {
      setPortfolio({
        total_equity_usdt: totalCalculatedNetWorth,
        daily_pnl_usdt: portfolio?.daily_pnl_usdt ?? 4210.5,
        daily_pnl_percent: portfolio?.daily_pnl_percent ?? 1.46,
        assets: portfolio?.assets ?? [],
      });
    }
  }, [totalCalculatedNetWorth]);

  // Small Dust Balances available for conversion (All 3 Categories Complete)
  const availableDustAssets = useMemo(() => {
    return [
      // 1. Kripto
      { symbol: 'ETH', name: 'Ethereum', category: 'crypto' as const, amount: 0.002, usdValue: 8.30 },
      { symbol: 'SOL', name: 'Solana', category: 'crypto' as const, amount: 0.045, usdValue: 6.52 },
      { symbol: 'LTC', name: 'Litecoin', category: 'crypto' as const, amount: 0.082, usdValue: 6.97 },
      { symbol: 'DOGE', name: 'Dogecoin', category: 'crypto' as const, amount: 45.0, usdValue: 6.30 },
      { symbol: 'XRP', name: 'Ripple', category: 'crypto' as const, amount: 12.0, usdValue: 6.96 },
      { symbol: 'USDC', name: 'USD Coin', category: 'crypto' as const, amount: 7.50, usdValue: 7.50 },

      // 2. Forex
      { symbol: 'EUR', name: 'EUR / USD', category: 'forex' as const, amount: 5.50, usdValue: 5.96 },
      { symbol: 'GBP', name: 'GBP / USD', category: 'forex' as const, amount: 4.20, usdValue: 5.42 },
      { symbol: 'JPY', name: 'USD / JPY', category: 'forex' as const, amount: 850, usdValue: 5.50 },
      { symbol: 'AUD', name: 'AUD / USD', category: 'forex' as const, amount: 8.50, usdValue: 5.59 },
      { symbol: 'CAD', name: 'USD / CAD', category: 'forex' as const, amount: 7.20, usdValue: 5.21 },
      { symbol: 'CHF', name: 'USD / CHF', category: 'forex' as const, amount: 6.00, usdValue: 6.78 },

      // 3. CFD
      { symbol: 'XAU', name: 'Gold (Emas)', category: 'cfd' as const, amount: 0.003, usdValue: 7.54 },
      { symbol: 'XAG', name: 'Silver (Perak)', category: 'cfd' as const, amount: 0.25, usdValue: 7.36 },
      { symbol: 'USOIL', name: 'Crude Oil WTI', category: 'cfd' as const, amount: 0.08, usdValue: 5.97 },
      { symbol: 'SPX500', name: 'S&P 500 Index', category: 'cfd' as const, amount: 0.0012, usdValue: 6.78 },
      { symbol: 'NAS100', name: 'Nasdaq 100', category: 'cfd' as const, amount: 0.0004, usdValue: 7.88 },
      { symbol: 'US30', name: 'Dow Jones 30', category: 'cfd' as const, amount: 0.0002, usdValue: 8.25 },
    ];
  }, []);

  // Swap Assets Data Format
  const swapAssetsList = useMemo(() => {
    return calculatedAssets.map((a) => ({
      symbol: a.symbol,
      name: a.name,
      category: a.category,
      amount: a.amount,
      usdPrice: a.unitPrice,
    }));
  }, [calculatedAssets]);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return calculatedAssets.filter((asset) => {
      const matchesSearch =
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
      const matchesZero = hideZeroBalances ? asset.amount > 0 || asset.inOrders > 0 : true;
      return matchesSearch && matchesCategory && matchesZero;
    });
  }, [calculatedAssets, searchQuery, selectedCategory, hideZeroBalances]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    if (activeTxTab === 'all') return transactions;
    return transactions.filter((tx) => tx.type === activeTxTab);
  }, [transactions, activeTxTab]);

  // Dust Convert Handler
  const handleDustConvertSuccess = (convertedUSDT: number, convertedSymbols: string[]) => {
    setSpotBalance((prev) => prev + convertedUSDT);
    setAssets((prev) =>
      prev.map((a) => (a.symbol === 'USDT' ? { ...a, amount: a.amount + convertedUSDT } : a))
    );

    const newTx: WalletTx = {
      id: `tx-${Date.now()}`,
      type: 'DEPOSIT',
      asset: 'USDT',
      amount: convertedUSDT,
      timestamp: 'Just now',
      status: 'Completed',
      txid: `DUST-SWAP-${Math.floor(1000 + Math.random() * 9000)}`,
      detail: `Converted ${convertedSymbols.length} small assets to USDT (0 Fee)`,
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Converted ${convertedSymbols.length} assets to +$${convertedUSDT.toFixed(2)} USDT`);
  };

  // Quick Swap Handler
  const handleSwapSuccess = (
    fromSym: string,
    toSym: string,
    fromAmt: number,
    toAmt: number
  ) => {
    setAssets((prev) =>
      prev.map((a) => {
        if (a.symbol === fromSym) return { ...a, amount: Math.max(0, a.amount - fromAmt) };
        if (a.symbol === toSym) return { ...a, amount: a.amount + toAmt };
        return a;
      })
    );

    const newTx: WalletTx = {
      id: `tx-${Date.now()}`,
      type: 'SWAP',
      asset: toSym,
      amount: toAmt,
      timestamp: 'Just now',
      status: 'Completed',
      txid: `SWAP-${Math.floor(1000 + Math.random() * 9000)}`,
      detail: `Swapped ${fromAmt} ${fromSym} ➔ ${toAmt.toFixed(4)} ${toSym} (0% Fee)`,
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Berhasil swap ${fromAmt} ${fromSym} menjadi ${toAmt.toFixed(4)} ${toSym}`);
  };

  // Simple Earn Subscribe Handler
  const handleSubscribeSuccess = (
    productId: string,
    sym: string,
    amt: number,
    dailyYield: number
  ) => {
    if (sym === 'USDT') setSpotBalance((prev) => Math.max(0, prev - amt));
    setAssets((prev) =>
      prev.map((a) => (a.symbol === sym ? { ...a, amount: Math.max(0, a.amount - amt) } : a))
    );
    setStakedEarnTotal((prev) => prev + amt * (sym === 'BTC' ? 75368.45 : 1));

    const newTx: WalletTx = {
      id: `tx-${Date.now()}`,
      type: 'EARN',
      asset: sym,
      amount: amt,
      timestamp: 'Just now',
      status: 'Completed',
      txid: `EARN-STAKE-${Math.floor(1000 + Math.random() * 9000)}`,
      detail: `Subscribed to Simple Earn (${productId}) • +${dailyYield.toFixed(4)} ${sym}/day`,
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Langganan Earn aktif: +${dailyYield.toFixed(4)} ${sym}/hari`);
  };

  // P2P Express Handler
  const handleP2pExpressSuccess = (
    type: 'BUY' | 'SELL',
    fiatAmount: number,
    cryptoAmount: number,
    method: string
  ) => {
    if (type === 'BUY') {
      setSpotBalance((prev) => prev + cryptoAmount);
      setAssets((prev) =>
        prev.map((a) => (a.symbol === 'USDT' ? { ...a, amount: a.amount + cryptoAmount } : a))
      );
    } else {
      setSpotBalance((prev) => Math.max(0, prev - cryptoAmount));
      setAssets((prev) =>
        prev.map((a) => (a.symbol === 'USDT' ? { ...a, amount: Math.max(0, a.amount - cryptoAmount) } : a))
      );
    }

    const newTx: WalletTx = {
      id: `tx-${Date.now()}`,
      type: 'P2P',
      asset: 'USDT',
      amount: cryptoAmount,
      timestamp: 'Just now',
      status: 'Completed',
      txid: `P2P-EXP-${Math.floor(1000 + Math.random() * 9000)}`,
      detail: `${type === 'BUY' ? 'Beli' : 'Jual'} USDT via ${method} (Rp ${fiatAmount.toLocaleString()})`,
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(`P2P Express ${type}: ${cryptoAmount.toFixed(2)} USDT selesai!`);
  };

  // Crypto Loan Handler
  const handleLoanSuccess = (
    collateralAsset: string,
    collateralAmount: number,
    borrowedUSDT: number
  ) => {
    setAssets((prev) =>
      prev.map((a) => (a.symbol === collateralAsset ? { ...a, amount: Math.max(0, a.amount - collateralAmount) } : a))
    );
    setSpotBalance((prev) => prev + borrowedUSDT);
    setAssets((prev) =>
      prev.map((a) => (a.symbol === 'USDT' ? { ...a, amount: a.amount + borrowedUSDT } : a))
    );

    const newTx: WalletTx = {
      id: `tx-${Date.now()}`,
      type: 'LOAN',
      asset: 'USDT',
      amount: borrowedUSDT,
      timestamp: 'Just now',
      status: 'Completed',
      txid: `LOAN-BORROW-${Math.floor(1000 + Math.random() * 9000)}`,
      detail: `Pinjam ${borrowedUSDT.toLocaleString()} USDT (Agunan: ${collateralAmount} ${collateralAsset})`,
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Pinjaman +$${borrowedUSDT.toLocaleString()} USDT berhasil dicairkan!`);
  };

  // Sub-Account Allocation Handler
  const handleSubAccountTransfer = (subId: string, amount: number) => {
    setSpotBalance((prev) => Math.max(0, prev - amount));
    const newTx: WalletTx = {
      id: `tx-${Date.now()}`,
      type: 'TRANSFER',
      asset: 'USDT',
      amount: amount,
      timestamp: 'Just now',
      status: 'Completed',
      txid: `SUB-TRANSFER-${Math.floor(1000 + Math.random() * 9000)}`,
      detail: `Master Spot ➔ Sub-Account (${subId})`,
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Alokasi $${amount.toLocaleString()} USDT ke sub-akun berhasil!`);
  };

  // Export CSV Statement Generator
  const handleExportCSV = () => {
    const headers = ['ID', 'Date_Time', 'Type', 'Asset', 'Amount', 'TXID', 'Status', 'Details'];
    const rows = transactions.map((t) => [
      t.id,
      t.timestamp,
      t.type,
      t.asset,
      t.amount,
      t.txid,
      t.status,
      `"${t.detail.replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `VeloceX_Wallet_Statement_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Laporan transaksi berhasil diunduh (CSV)');
  };

  // Faucet Logic (+$10,000 USDT) - Choreographed 4-Step Animation
  const handleClaimFaucet = () => {
    if (faucetPhase !== 'idle') return;

    const boostAmount = 10000;
    setSpotBalance((prev) => prev + boostAmount);
    setAssets((prev) =>
      prev.map((a) => (a.symbol === 'USDT' ? { ...a, amount: a.amount + boostAmount } : a))
    );

    const newTx: WalletTx = {
      id: `tx-${Date.now()}`,
      type: 'FAUCET',
      asset: 'USDT',
      amount: boostAmount,
      timestamp: 'Just now',
      status: 'Completed',
      txid: `DEMO-FAUCET-${Math.floor(1000 + Math.random() * 9000)}`,
      detail: 'Institutional Sandbox Faucet Claim',
    };
    setTransactions((prev) => [newTx, ...prev]);

    // Step 1: Loading Progress Fill (500ms)
    setFaucetPhase('loading');

    // Step 2: Full Green + Center Checkmark Pop
    setTimeout(() => {
      setFaucetPhase('center_check');
    }, 500);

    // Step 3: Shift left + unblur "Success"
    setTimeout(() => {
      setFaucetPhase('shift_success');
    }, 1500);

    // Step 4: Revert to idle
    setTimeout(() => {
      setFaucetPhase('idle');
    }, 3500);
  };

  // Deposit Success Handler
  const handleDepositSuccess = (
    amount: number,
    asset: string,
    network: string = 'TRC20',
    txid: string = `0x${Math.random().toString(16).substring(2, 10)}`
  ) => {
    setSpotBalance((prev) => prev + amount);
    setAssets((prev) =>
      prev.map((a) => (a.symbol === asset ? { ...a, amount: a.amount + amount } : a))
    );

    const newTx: WalletTx = {
      id: `tx-${Date.now()}`,
      type: 'DEPOSIT',
      asset: asset,
      amount: amount,
      timestamp: 'Just now',
      status: 'Completed',
      txid: txid,
      detail: `${network} Network Deposit`,
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Deposit +$${amount.toLocaleString()} ${asset} (${network}) Berhasil!`);
  };

  // Withdraw Success Handler
  const handleWithdrawSuccess = (amount: number, asset: string, toAddress: string) => {
    setSpotBalance((prev) => Math.max(0, prev - amount));
    setAssets((prev) =>
      prev.map((a) => (a.symbol === asset ? { ...a, amount: Math.max(0, a.amount - amount) } : a))
    );

    const newTx: WalletTx = {
      id: `tx-${Date.now()}`,
      type: 'WITHDRAW',
      asset: asset,
      amount: amount,
      timestamp: 'Just now',
      status: 'Processing',
      txid: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      detail: `Transfer to ${toAddress.substring(0, 8)}...`,
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Withdrawal -$${amount.toLocaleString()} ${asset} Diproses!`);
  };

  // Transfer Success Handler
  const handleTransferSuccess = (
    amount: number,
    asset: string,
    fromWallet: string,
    toWallet: string
  ) => {
    if (fromWallet === 'Spot Trading Wallet') setSpotBalance((p) => Math.max(0, p - amount));
    else if (fromWallet === 'Futures & Margin Wallet') setFuturesBalance((p) => Math.max(0, p - amount));
    else if (fromWallet === 'Funding & Vault Wallet') setFundingBalance((p) => Math.max(0, p - amount));

    if (toWallet === 'Spot Trading Wallet') setSpotBalance((p) => p + amount);
    else if (toWallet === 'Futures & Margin Wallet') setFuturesBalance((p) => p + amount);
    else if (toWallet === 'Funding & Vault Wallet') setFundingBalance((p) => p + amount);

    const newTx: WalletTx = {
      id: `tx-${Date.now()}`,
      type: 'TRANSFER',
      asset: asset,
      amount: amount,
      timestamp: 'Just now',
      status: 'Completed',
      txid: `INT-${Math.floor(1000 + Math.random() * 9000)}`,
      detail: `${fromWallet} ➔ ${toWallet}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Transfer $${amount.toLocaleString()} ${asset} Selesai!`);
  };

  const handleCopyTxid = (txid: string) => {
    navigator.clipboard.writeText(txid);
    setCopiedTxid(txid);
    setTimeout(() => setCopiedTxid(null), 2000);
  };

  return (
    <main className="flex flex-col flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full font-sans select-none animate-fade-in text-slate-100">
      {/* 1. TOP OVERVIEW VALUATION HERO CARD */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-6 sm:p-8 rounded-3xl bg-[#1F1E25] border border-white/10 shadow-2xl relative overflow-hidden gap-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00E163]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col gap-2 z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <Wallet01Icon className="w-4 h-4 text-[#00E163]" />
            <span>Estimated Total Valuation</span>
            {/* Eye Privacy Toggle */}
            <button
              type="button"
              onClick={() => setIsPrivacyMode(!isPrivacyMode)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={isPrivacyMode ? 'Tampilkan Saldo' : 'Sembunyikan Saldo'}
            >
              {isPrivacyMode ? (
                <ViewOffSlashIcon className="w-4 h-4 text-slate-400" />
              ) : (
                <ViewIcon className="w-4 h-4 text-slate-400" />
              )}
            </button>
            <span className="px-2 py-0.5 rounded-full bg-[#00E163]/10 text-[#00E163] text-[10px] font-bold">
              LIVE
            </span>
          </div>

          {/* Large Portfolio Valuation */}
          <div className="flex items-baseline gap-2 font-mono-num">
            <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {isPrivacyMode ? '******' : `$${totalCalculatedNetWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </span>
            <span className="text-sm font-bold text-slate-400 font-mono">USDT</span>
          </div>

          {/* Daily Realized PnL */}
          <div className="flex items-center gap-2 text-xs font-mono-num">
            <span className="text-slate-400">Today's Realized PnL:</span>
            <span className="text-[#00E163] font-bold flex items-center gap-0.5">
              <ArrowUp01Icon className="w-3.5 h-3.5 stroke-[2.5]" />
              +$4,210.50 (+1.46%)
            </span>
          </div>

          {/* Asset Allocation Multi-Asset Bar */}
          <div className="flex flex-col gap-1.5 pt-2 max-w-sm">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono-num">
              <span>Asset Allocation</span>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#00E163]" />
                  <span>USDT 21.5%</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>BTC 78.5%</span>
                </span>
              </div>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden flex">
              <div className="h-full bg-[#00E163]" style={{ width: '21.5%' }} />
              <div className="h-full bg-amber-400" style={{ width: '78.5%' }} />
            </div>
          </div>
        </div>

        {/* Action Buttons Bar - Clean 4x2 Grid (4 Buttons Top, 4 Buttons Bottom) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 z-10 w-full lg:w-auto">
          {/* Row 1 - 1: Deposit Button */}
          <button
            type="button"
            onClick={() => setIsDepositOpen(true)}
            className="group relative flex items-center justify-center gap-2 h-11 px-4 rounded-2xl bg-[#26252E] hover:bg-[#00E163] text-white hover:text-black font-bold text-xs border border-white/5 overflow-hidden transition-colors duration-1000 cursor-pointer w-full"
          >
            <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
            <span className="relative z-10 flex items-center gap-2 transition-colors duration-1000">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-[3]">
                <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Deposit</span>
            </span>
          </button>

          {/* Row 1 - 2: Withdraw Button */}
          <button
            type="button"
            onClick={() => setIsWithdrawOpen(true)}
            className="group relative flex items-center justify-center gap-2 h-11 px-4 rounded-2xl bg-[#26252E] hover:bg-[#FF5C77] text-white hover:text-black font-bold text-xs border border-white/5 overflow-hidden transition-colors duration-1000 cursor-pointer w-full"
          >
            <span className="absolute inset-0 bg-[#FF5C77] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
            <span className="relative z-10 flex items-center gap-2 transition-colors duration-1000">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-[3]">
                <path d="M5 15l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Withdraw</span>
            </span>
          </button>

          {/* Row 1 - 3: P2P Express Button */}
          <button
            type="button"
            onClick={() => setIsP2pOpen(true)}
            className="group relative flex items-center justify-center gap-1.5 h-11 px-4 rounded-2xl bg-[#26252E] hover:bg-[#00E163] text-slate-300 hover:text-black font-bold text-xs border border-white/5 overflow-hidden transition-colors duration-1000 cursor-pointer w-full"
          >
            <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
            <span className="relative z-10 flex items-center gap-1.5 transition-colors duration-1000">
              <CreditCardIcon className="w-4 h-4" />
              <span>P2P Express</span>
            </span>
          </button>

          {/* Row 1 - 4: Quick Convert Button */}
          <button
            type="button"
            onClick={() => {
              setSelectedSwapFromSymbol('BTC');
              setIsSwapOpen(true);
            }}
            className="group relative flex items-center justify-center gap-1.5 h-11 px-4 rounded-2xl bg-[#26252E] hover:bg-[#00E163] text-slate-300 hover:text-black font-bold text-xs border border-white/5 overflow-hidden transition-colors duration-1000 cursor-pointer w-full"
          >
            <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
            <span className="relative z-10 flex items-center gap-1.5 transition-colors duration-1000">
              <ArrowUpDownIcon className="w-4 h-4" />
              <span>Convert</span>
            </span>
          </button>

          {/* Row 2 - 1: Crypto Loan Button */}
          <button
            type="button"
            onClick={() => setIsLoanOpen(true)}
            className="group relative flex items-center justify-center gap-1.5 h-11 px-4 rounded-2xl bg-[#26252E] hover:bg-[#00E163] text-slate-300 hover:text-black font-bold text-xs border border-white/5 overflow-hidden transition-colors duration-1000 cursor-pointer w-full"
          >
            <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
            <span className="relative z-10 flex items-center gap-1.5 transition-colors duration-1000">
              <BankIcon className="w-4 h-4" />
              <span>Loan</span>
            </span>
          </button>

          {/* Row 2 - 2: Crypto Card Button */}
          <button
            type="button"
            onClick={() => setIsCardOpen(true)}
            className="group relative flex items-center justify-center gap-1.5 h-11 px-4 rounded-2xl bg-[#26252E] hover:bg-[#00E163] text-slate-300 hover:text-black font-bold text-xs border border-white/5 overflow-hidden transition-colors duration-1000 cursor-pointer w-full"
          >
            <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
            <span className="relative z-10 flex items-center gap-1.5 transition-colors duration-1000">
              <CreditCardIcon className="w-4 h-4 text-cyan-400 group-hover:text-black" />
              <span>Card</span>
            </span>
          </button>

          {/* Row 2 - 3: Transfer Button */}
          <button
            type="button"
            onClick={() => setIsTransferOpen(true)}
            className="group relative flex items-center justify-center gap-1.5 h-11 px-4 rounded-2xl bg-[#26252E] hover:bg-[#00E163] text-slate-300 hover:text-black font-bold text-xs border border-white/5 overflow-hidden transition-colors duration-1000 cursor-pointer w-full"
          >
            <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
            <span className="relative z-10 flex items-center gap-1.5 transition-colors duration-1000">
              <Exchange01Icon className="w-4 h-4" />
              <span>Transfer</span>
            </span>
          </button>

          {/* Row 2 - 4: Demo Faucet +$10k Button with exact 4-step choreographed animation */}
          <button
            type="button"
            onClick={handleClaimFaucet}
            disabled={faucetPhase !== 'idle'}
            className={`group relative flex items-center justify-center h-11 px-4 rounded-2xl font-bold text-xs border overflow-hidden transition-all duration-500 cursor-pointer w-full ${
              faucetPhase === 'idle'
                ? 'bg-[#26252E] hover:bg-[#00E163] text-[#00E163] hover:text-black border-[#00E163]/30'
                : 'border-[#00E163] text-black shadow-lg shadow-[#00E163]/25 bg-[#26252E]'
            }`}
          >
            {faucetPhase === 'idle' && (
              <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
            )}

            {faucetPhase !== 'idle' && (
              <span
                className={`absolute inset-0 bg-[#00E163] pointer-events-none transition-all ${
                  faucetPhase === 'loading'
                    ? 'w-full duration-500 ease-out origin-left'
                    : 'w-full opacity-100'
                }`}
              />
            )}

            <div className="relative z-10 flex items-center justify-center w-full h-full">
              {faucetPhase === 'idle' && (
                <span className="flex items-center gap-1.5 transition-colors duration-500">
                  <FlashIcon className="w-4 h-4" />
                  <span>+$10k Faucet</span>
                </span>
              )}

              {(faucetPhase === 'center_check' || faucetPhase === 'shift_success' || faucetPhase === 'loading') && (
                <div className="flex items-center justify-center">
                  <div
                    className={`flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                      faucetPhase === 'shift_success' ? '-translate-x-1 scale-100' : 'translate-x-0 scale-110'
                    }`}
                  >
                    <Tick01Icon
                      className={`w-4 h-4 stroke-[3] text-black transition-all duration-300 ${
                        faucetPhase === 'loading' ? 'opacity-0 scale-50' : 'opacity-100 scale-100'
                      }`}
                    />
                  </div>
                  <span
                    className={`font-black text-xs text-black tracking-wide transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ml-1 ${
                      faucetPhase === 'shift_success'
                        ? 'opacity-100 blur-0 translate-x-0 max-w-[80px]'
                        : 'opacity-0 blur-sm -translate-x-2 max-w-0 overflow-hidden'
                    }`}
                  >
                    Success
                  </span>
                </div>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* 2. VIP TIER & 25% VELX FEE DISCOUNT WIDGET (BINANCE VIP STANDARD) */}
      <VipTierWidget />

      {/* 3. THREE MULTI-WALLET SUB-ACCOUNTS (SPOT vs FUTURES vs FUNDING) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Spot Wallet Card */}
        <div className="flex flex-col p-5 rounded-3xl bg-[#1F1E25] border border-white/10 gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Spot Trading Wallet</span>
            <span className="px-2 py-0.5 rounded-lg bg-[#00E163]/15 text-[10px] font-bold text-[#00E163]">
              Active
            </span>
          </div>
          <div className="flex items-baseline gap-2 font-mono-num">
            <span className="text-2xl font-black text-white">
              {isPrivacyMode ? '******' : `$${spotBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            </span>
            <span className="text-xs text-slate-400 font-mono">USDT</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400">
            <span>Available for Spot Orders:</span>
            <strong className="text-slate-200 font-mono">98.5%</strong>
          </div>
        </div>

        {/* Futures / Margin Wallet Card */}
        <div className="flex flex-col p-5 rounded-3xl bg-[#1F1E25] border border-white/10 gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Futures & Margin Wallet</span>
            <span className="px-2 py-0.5 rounded-lg bg-amber-400/15 text-[10px] font-bold text-amber-300">
              100x Max
            </span>
          </div>
          <div className="flex items-baseline gap-2 font-mono-num">
            <span className="text-2xl font-black text-white">
              {isPrivacyMode ? '******' : `$${futuresBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            </span>
            <span className="text-xs text-slate-400 font-mono">USDT</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400">
            <span>Margin Usage Ratio:</span>
            <strong className="text-[#00E163] font-mono">24.5% (Safe)</strong>
          </div>
        </div>

        {/* Funding & Vault Wallet Card */}
        <div className="flex flex-col p-5 rounded-3xl bg-[#1F1E25] border border-white/10 gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Funding & Vault Wallet</span>
            <button
              type="button"
              onClick={() => setIsSubAccountOpen(true)}
              className="px-2 py-0.5 rounded-lg bg-cyan-400/15 hover:bg-cyan-400/25 text-[10px] font-bold text-cyan-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <UserGroupIcon className="w-3 h-3" />
              <span>Sub-Accounts</span>
            </button>
          </div>
          <div className="flex items-baseline gap-2 font-mono-num">
            <span className="text-2xl font-black text-white">
              {isPrivacyMode ? '******' : `$${fundingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            </span>
            <span className="text-xs text-slate-400 font-mono">USDT</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400">
            <span>Debit Card & P2P Linked:</span>
            <strong className="text-slate-200 font-mono">Active</strong>
          </div>
        </div>
      </div>

      {/* 4. VELOCEX SIMPLE EARN / YIELD WIDGET (BINANCE EARN / BYBIT SAVINGS STANDARD) */}
      <div className="flex flex-col p-6 rounded-3xl bg-[#1F1E25] border border-white/10 shadow-2xl gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#00E163]/15 text-[#00E163]">
              <Coins01Icon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-white font-heading">
                  VeloceX Simple Earn
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#00E163]/15 text-[#00E163] text-[10px] font-bold">
                  Up to 11.8% APY
                </span>
              </div>
              <span className="text-xs text-slate-400">
                Tabungan bunga fleksibel harian dengan pencairan instan kapan saja (0 Fee)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono-num text-xs bg-[#26252E] px-4 py-2 rounded-2xl border border-white/5">
            <span className="text-slate-400">Total Staked:</span>
            <strong className="text-white">
              ${stakedEarnTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT
            </strong>
          </div>
        </div>

        {/* Earn Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {EARN_PRODUCTS.map((prod) => (
            <div
              key={prod.id}
              className="flex flex-col justify-between p-4 rounded-2xl bg-[#26252E] border border-white/5 hover:border-[#00E163]/30 transition-all gap-3 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <MarketIcon symbol={prod.symbol} size="sm" />
                  <div className="flex flex-col">
                    <span className="font-extrabold text-xs text-white">{prod.symbol}</span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[110px]">
                      {prod.name}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end font-mono-num">
                  <span className="text-sm font-black text-[#00E163]">+{prod.apy}%</span>
                  <span className="text-[9px] text-slate-400">EST APY</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400">
                <span>Durasi:</span>
                <span className="text-slate-200 font-bold">Fleksibel</span>
              </div>

              {/* Subscribe Stake Button */}
              <button
                type="button"
                onClick={() => {
                  setSelectedEarnProduct(prod);
                  setIsEarnOpen(true);
                }}
                className="group/btn relative flex items-center justify-center py-2 rounded-xl bg-[#1F1E25] hover:bg-[#00E163] text-slate-200 hover:text-black font-bold text-xs border border-white/10 overflow-hidden transition-colors duration-1000 cursor-pointer w-full"
              >
                <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                <span className="relative z-10 transition-colors duration-1000 flex items-center gap-1.5">
                  <span>Stake Sekarang</span>
                  <span>➔</span>
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 5. ASSET BALANCES LIST (TABLE & SEARCH BAR) */}
      <div className="flex flex-col p-6 rounded-3xl bg-[#1F1E25] border border-white/10 shadow-2xl gap-5">
        {/* Table Controls & Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-extrabold text-base text-white font-heading pr-2">Asset Balances</span>
            {[
              { id: 'all', label: 'Semua' },
              { id: 'forex', label: 'Forex' },
              { id: 'cfd', label: 'CFD' },
              { id: 'crypto', label: 'Kripto' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#00E163] text-black shadow-sm'
                    : 'bg-[#26252E] text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}

            {/* Convert Dust to USDT Button (Binance/Bybit Standard) */}
            <button
              type="button"
              onClick={() => setIsDustModalOpen(true)}
              className="group relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#26252E] text-slate-300 hover:text-black border border-white/5 text-xs font-bold overflow-hidden cursor-pointer ml-1"
            >
              <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
              <span className="relative z-10 flex items-center gap-1.5 transition-colors duration-500">
                <SparklesIcon className="w-3.5 h-3.5 text-amber-400 group-hover:text-black transition-colors duration-500" />
                <span>Convert Dust to USDT</span>
              </span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative flex items-center h-10 px-3 rounded-xl bg-[#26252E] border border-white/5 text-xs text-white">
              <Search01Icon className="w-4 h-4 text-slate-400 mr-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search coin / pair..."
                className="bg-transparent placeholder:text-slate-500 focus:outline-none w-36 sm:w-48 text-xs font-sans"
              />
            </div>

            {/* Hide 0 Balances Toggle */}
            <button
              type="button"
              onClick={() => setHideZeroBalances(!hideZeroBalances)}
              className="flex items-center gap-2 text-xs font-bold select-none cursor-pointer group"
            >
              <div
                className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                  hideZeroBalances
                    ? 'bg-[#00E163] border-[#00E163] text-black shadow-sm'
                    : 'border-white/20 bg-transparent group-hover:border-white/40'
                }`}
              >
                {hideZeroBalances && (
                  <Tick01Icon className="w-3 h-3 stroke-[3] text-black" />
                )}
              </div>
              <span className={`transition-colors ${hideZeroBalances ? 'text-white font-bold' : 'text-slate-400 group-hover:text-white'}`}>
                Hide 0 Balances
              </span>
            </button>
          </div>
        </div>

        {/* Assets Table (Scrollable with max 4 items visible & solid opaque sticky header) */}
        <div className="overflow-x-auto custom-positions-scrollbar">
          <div className="max-h-[260px] overflow-y-auto custom-positions-scrollbar relative">
            <table className="w-full text-left text-xs font-sans border-collapse">
              <thead className="sticky top-0 z-30 bg-[#1F1E25] border-b border-white/5">
                <tr className="border-b border-white/5 text-slate-400 font-bold bg-[#1F1E25]">
                  <th className="py-3 px-3 bg-[#1F1E25] sticky top-0 z-30">Asset</th>
                  <th className="py-3 px-3 text-right bg-[#1F1E25] sticky top-0 z-30">Total Balance</th>
                  <th className="py-3 px-3 text-right bg-[#1F1E25] sticky top-0 z-30">Available</th>
                  <th className="py-3 px-3 text-right bg-[#1F1E25] sticky top-0 z-30">In Orders</th>
                  <th className="py-3 px-3 text-right bg-[#1F1E25] sticky top-0 z-30">USD Value</th>
                  <th className="py-3 px-3 text-center bg-[#1F1E25] sticky top-0 z-30">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono-num relative z-0">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-500 font-sans text-xs font-semibold">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Wallet01Icon className="w-8 h-8 text-slate-600 opacity-50" />
                      <span>Tidak ada aset dengan saldo aktif saat ini.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAssets.map((item) => (
                  <tr key={item.symbol} className="hover:bg-white/[0.02] transition-colors">
                    {/* Asset Name & Icon */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <MarketIcon symbol={item.symbol} size="sm" />
                        <div className="flex flex-col">
                          <span className="font-extrabold text-white text-xs">{item.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{item.symbol}</span>
                        </div>
                      </div>
                    </td>

                    {/* Total Balance */}
                    <td className="py-3.5 px-3 text-right font-bold text-white">
                      {isPrivacyMode ? '••••••' : item.amount.toLocaleString('en-US', { minimumFractionDigits: item.decimals })}
                    </td>

                    {/* Available */}
                    <td className="py-3.5 px-3 text-right text-[#00E163] font-bold">
                      {isPrivacyMode ? '••••••' : item.amount.toLocaleString('en-US', { minimumFractionDigits: item.decimals })}
                    </td>

                    {/* In Orders */}
                    <td className="py-3.5 px-3 text-right text-slate-400 font-bold">
                      {isPrivacyMode ? '••••••' : item.inOrders.toLocaleString('en-US', { minimumFractionDigits: item.decimals })}
                    </td>

                    {/* USD Value */}
                    <td className="py-3.5 px-3 text-right font-bold text-white">
                      {isPrivacyMode ? '••••••' : `$${item.totalValUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </td>

                    {/* Action Buttons with 1000ms Sweep */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Swap Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSwapFromSymbol(item.symbol);
                            setIsSwapOpen(true);
                          }}
                          className="group relative px-2.5 py-1 rounded-lg bg-[#26252E] hover:bg-[#00E163] text-slate-300 hover:text-black font-bold text-[10px] transition-colors duration-1000 overflow-hidden cursor-pointer"
                        >
                          <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                          <span className="relative z-10 transition-colors duration-1000">Swap</span>
                        </button>

                        {/* Deposit Button */}
                        <button
                          type="button"
                          onClick={() => setIsDepositOpen(true)}
                          className="group relative px-2.5 py-1 rounded-lg bg-[#26252E] hover:bg-[#00E163] text-slate-300 hover:text-black font-bold text-[10px] transition-colors duration-1000 overflow-hidden cursor-pointer"
                        >
                          <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                          <span className="relative z-10 transition-colors duration-1000">Deposit</span>
                        </button>

                        {/* Transfer Button */}
                        <button
                          type="button"
                          onClick={() => setIsTransferOpen(true)}
                          className="group relative px-2.5 py-1 rounded-lg bg-[#26252E] hover:bg-[#00E163] text-slate-300 hover:text-black font-bold text-[10px] transition-colors duration-1000 overflow-hidden cursor-pointer"
                        >
                          <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                          <span className="relative z-10 transition-colors duration-1000">Transfer</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* 6. INTERACTIVE TRANSACTION LOG & CSV EXPORT */}
      <div className="flex flex-col p-6 rounded-3xl bg-[#1F1E25] border border-white/10 shadow-2xl gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-base text-white font-heading">
              Recent Transaction Log
            </span>
            {/* Date Range Selector */}
            <div className="flex items-center p-0.5 rounded-lg bg-[#26252E] border border-white/5 text-[11px] font-bold gap-0.5">
              {[
                { id: 'all', label: 'All' },
                { id: '7d', label: '7D' },
                { id: '30d', label: '30D' },
                { id: '90d', label: '90D' },
              ].map((range) => (
                <button
                  key={range.id}
                  type="button"
                  onClick={() => setActiveDateRange(range.id as any)}
                  className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    activeDateRange === range.id
                      ? 'bg-white/15 text-white font-extrabold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#26252E] hover:bg-[#00E163] text-slate-300 hover:text-black border border-white/5 text-xs font-bold transition-colors duration-1000 overflow-hidden cursor-pointer"
            >
              <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
              <span className="relative z-10 flex items-center gap-1.5 transition-colors duration-500">
                <Download01Icon className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </span>
            </button>

            {/* Type Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-[#26252E] border border-white/5 text-xs font-bold gap-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'DEPOSIT', label: 'Deposits' },
                { id: 'WITHDRAW', label: 'Withdrawals' },
                { id: 'TRANSFER', label: 'Transfers' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTxTab(tab.id as any)}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    activeTxTab === tab.id
                      ? 'bg-[#00E163] text-black font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="overflow-x-auto custom-positions-scrollbar">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 font-bold pb-3">
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Details</th>
                <th className="py-3 px-3">TXID</th>
                <th className="py-3 px-3">Time</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono-num">
              {filteredTransactions.map((tx) => {
                const isPositive = tx.type === 'DEPOSIT' || tx.type === 'FAUCET' || tx.type === 'SWAP' || tx.type === 'EARN' || tx.type === 'P2P' || tx.type === 'LOAN';
                return (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Type Badge */}
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-sans ${
                          isPositive
                            ? 'bg-[#00E163]/15 text-[#00E163]'
                            : tx.type === 'WITHDRAW'
                            ? 'bg-[#FF5C77]/15 text-[#FF5C77]'
                            : 'bg-white/10 text-slate-300'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-3 font-bold">
                      <span className={isPositive ? 'text-[#00E163]' : 'text-[#FF5C77]'}>
                        {isPositive ? '+' : '-'}${tx.amount.toLocaleString()} {tx.asset}
                      </span>
                    </td>

                    {/* Details */}
                    <td className="py-3.5 px-3 font-sans text-slate-300">{tx.detail}</td>

                    {/* TXID with Copy */}
                    <td className="py-3.5 px-3 font-mono text-[11px] text-slate-400">
                      <button
                        type="button"
                        onClick={() => handleCopyTxid(tx.txid)}
                        className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                        title="Copy TXID"
                      >
                        <span>{tx.txid}</span>
                        {copiedTxid === tx.txid ? (
                          <CheckmarkCircle01Icon className="w-3.5 h-3.5 text-[#00E163]" />
                        ) : (
                          <Copy01Icon className="w-3 h-3 text-slate-500" />
                        )}
                      </button>
                    </td>

                    {/* Time */}
                    <td className="py-3.5 px-3 text-slate-400 font-sans text-[11px]">{tx.timestamp}</td>

                    {/* Status */}
                    <td className="py-3.5 px-3 text-right">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#00E163]/10 text-[#00E163] text-[10px] font-bold">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. PROOF OF RESERVES (POR) & SECURITY TRUST BANNER (BINANCE/BYBIT STANDARD) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-3xl bg-[#1B1A21] border border-white/10 shadow-xl gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[#00E163]/10 text-[#00E163] shrink-0 border border-[#00E163]/20">
            <Shield01Icon className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-white">
                100% Backed Proof of Reserves (PoR)
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#00E163]/15 text-[#00E163] text-[10px] font-bold">
                Merkle-Tree Verified
              </span>
            </div>
            <span className="text-xs text-slate-400 mt-0.5">
              Seluruh dana pengguna disimpan dengan rasio cadangan 1:1 di Cold Storage multi-signature institusional.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#26252E] border border-white/5 text-[11px] font-bold text-slate-300">
            <LockPasswordIcon className="w-3.5 h-3.5 text-[#00E163]" />
            <span>2FA & Whitelist Guard: Active</span>
          </div>

          <button
            type="button"
            onClick={() => setIsPorModalOpen(true)}
            className="group relative flex items-center justify-center px-4 py-2 rounded-xl bg-[#26252E] hover:bg-[#00E163] text-slate-200 hover:text-black font-bold text-xs border border-white/10 overflow-hidden transition-colors duration-1000 cursor-pointer shrink-0"
          >
            <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
            <span className="relative z-10 transition-colors duration-1000">
              Audit Cadangan
            </span>
          </button>
        </div>
      </div>

      {/* PROOF OF RESERVES MODAL */}
      {isPorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in font-sans">
          <div className="flex flex-col w-full max-w-md bg-[#1F1E25] border border-white/10 rounded-3xl p-6 shadow-2xl gap-5 select-none">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#00E163]/15 text-[#00E163]">
                  <Shield01Icon className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-white text-base font-heading">
                    Proof of Reserves Audit
                  </span>
                  <span className="text-xs text-slate-400">
                    Verifikasi Kriptografis Merkle-Tree VeloceX
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPorModalOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <Cancel01Icon className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3 font-mono-num text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#26252E] border border-white/5">
                <span className="text-slate-400 font-sans">Cadangan USDT:</span>
                <strong className="text-[#00E163] font-bold">104.2% (Solvent)</strong>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#26252E] border border-white/5">
                <span className="text-slate-400 font-sans">Cadangan BTC:</span>
                <strong className="text-[#00E163] font-bold">101.8% (Solvent)</strong>
              </div>
              <div className="flex flex-col p-3 rounded-xl bg-[#26252E] border border-white/5 gap-1">
                <span className="text-slate-400 font-sans">Merkle Root Hash:</span>
                <span className="text-[10px] text-slate-300 break-all font-mono">
                  0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                showToast('Merkle Hash berhasil disalin');
                setIsPorModalOpen(false);
              }}
              className="py-3 rounded-2xl bg-[#00E163] text-black font-extrabold text-xs hover:brightness-110 transition-all cursor-pointer"
            >
              Salin Merkle Hash & Tutup
            </button>
          </div>
        </div>
      )}

      {/* ALL MODALS */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        onDepositSuccess={handleDepositSuccess}
      />

      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        availableUSDT={spotBalance}
        onWithdrawSuccess={handleWithdrawSuccess}
      />

      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        spotBalance={spotBalance}
        futuresBalance={futuresBalance}
        fundingBalance={fundingBalance}
        onTransferSuccess={handleTransferSuccess}
      />

      <DustConverterModal
        isOpen={isDustModalOpen}
        onClose={() => setIsDustModalOpen(false)}
        availableDustAssets={availableDustAssets}
        onConvertSuccess={handleDustConvertSuccess}
      />

      <QuickSwapModal
        isOpen={isSwapOpen}
        onClose={() => setIsSwapOpen(false)}
        availableAssets={swapAssetsList}
        defaultFromSymbol={selectedSwapFromSymbol}
        onSwapSuccess={handleSwapSuccess}
      />

      <EarnSubscribeModal
        isOpen={isEarnOpen}
        onClose={() => setIsEarnOpen(false)}
        product={selectedEarnProduct}
        onSubscribeSuccess={handleSubscribeSuccess}
      />

      <P2PExpressModal
        isOpen={isP2pOpen}
        onClose={() => setIsP2pOpen(false)}
        onExpressSuccess={handleP2pExpressSuccess}
      />

      <CryptoLoanModal
        isOpen={isLoanOpen}
        onClose={() => setIsLoanOpen(false)}
        availableBTC={2.345}
        availableETH={1.5}
        onLoanSuccess={handleLoanSuccess}
      />

      <CryptoCardModal
        isOpen={isCardOpen}
        onClose={() => setIsCardOpen(false)}
        fundingBalance={fundingBalance}
      />

      <SubAccountManagerModal
        isOpen={isSubAccountOpen}
        onClose={() => setIsSubAccountOpen(false)}
        masterBalance={spotBalance}
        onTransferToSub={handleSubAccountTransfer}
      />
    </main>
  );
};
