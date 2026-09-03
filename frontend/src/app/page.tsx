'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { LeftSidebar } from '@/components/LeftSidebar';
import { TradeflareHeader } from '@/components/TradeflareHeader';
import { WatchlistPanel } from '@/components/WatchlistPanel';
import { RunningTradePanel } from '@/components/RunningTradePanel';
import { MainChartCard } from '@/components/MainChartCard';
import { DualOrderBook } from '@/components/DualOrderBook';
import { CreateOrderCard } from '@/components/CreateOrderCard';
import { MyOrdersCard } from '@/components/MyOrdersCard';
import { OrderFilledCard } from '@/components/OrderFilledCard';
import { AuthModal } from '@/components/AuthModal';
import { OrderSuccessModal } from '@/components/OrderSuccessModal';
import { AnalyticsView } from '@/components/analytics/AnalyticsView';
import { WalletView } from '@/components/wallet/WalletView';
import { OrdersView } from '@/components/orders/OrdersView';
import { MessagesView } from '@/components/messages/MessagesView';
import { CommunityView } from '@/components/community/CommunityView';
import { LightningView } from '@/components/lightning/LightningView';
import { PortfolioView } from '@/components/portfolio/PortfolioView';
import { MarketplaceView } from '@/components/marketplace/MarketplaceView';
import { SupportView } from '@/components/support/SupportView';
import { SettingsView } from '@/components/settings/SettingsView';
import { HelpView } from '@/components/help/HelpView';
import { ProChartsView } from '@/components/procharts/ProChartsView';
import { useTradingWebSocket } from '@/hooks/useTradingWebSocket';
import { useTradingStore } from '@/store/useTradingStore';
import { Tick01Icon } from 'hugeicons-react';

function TradeflareTerminalContent() {
  // Connect live WebSocket stream
  useTradingWebSocket();

  const { executedTrade, setExecutedTrade } = useTradingStore();
  
  // Synchronous client initializer directly from URL hash or localStorage
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const hash = window.location.hash.replace('#', '');
        if (hash && ['dashboard', 'analytics', 'wallet', 'orders', 'messages', 'community', 'lightning', 'portfolio', 'market', 'procharts', 'support', 'settings', 'help'].includes(hash)) {
          return hash;
        }
        const saved = localStorage.getItem('velocx_active_tab');
        if (saved) return saved;
      } catch {
        // ignore
      }
    }
    return 'dashboard';
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state with URL hash on popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) setActiveTab(hash);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Save active tab on change
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    try {
      localStorage.setItem('velocx_active_tab', newTab);
      window.history.replaceState(null, '', `#${newTab}`);
    } catch {
      // ignore
    }
  };

  const handleOrderSuccess = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="flex w-full min-h-screen bg-[#131118] text-slate-100 font-sans selection:bg-[#00E163] selection:text-black overflow-x-hidden">
      {/* 1. Left Slim Sidebar (Full Height Edge-to-Edge) */}
      <LeftSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* 2. Main Dashboard Area (Full Width Edge-to-Edge) */}
      <div className="flex flex-col flex-1 min-w-0 min-h-screen bg-[#131118]">
        {/* Top Header */}
        <TradeflareHeader onOpenAuthModal={() => setIsAuthModalOpen(true)} />

        {/* Dynamic View: Analytics vs Wallet vs Orders vs Messages vs Community vs Lightning vs Portfolio vs Dashboard */}
        {activeTab === 'analytics' ? (
          <AnalyticsView onOrderSuccess={handleOrderSuccess} />
        ) : activeTab === 'wallet' ? (
          <WalletView onOrderSuccess={handleOrderSuccess} />
        ) : activeTab === 'orders' ? (
          <OrdersView onOrderSuccess={handleOrderSuccess} />
        ) : activeTab === 'messages' ? (
          <MessagesView onOrderSuccess={handleOrderSuccess} />
        ) : activeTab === 'community' ? (
          <CommunityView onOrderSuccess={handleOrderSuccess} onNavigateTab={handleTabChange} />
        ) : activeTab === 'lightning' ? (
          <LightningView onOrderSuccess={handleOrderSuccess} />
        ) : activeTab === 'portfolio' ? (
          <PortfolioView onOrderSuccess={handleOrderSuccess} onNavigateTab={handleTabChange} />
        ) : activeTab === 'market' ? (
          <MarketplaceView onOrderSuccess={handleOrderSuccess} onNavigateTab={handleTabChange} />
        ) : activeTab === 'procharts' ? (
          <ProChartsView />
        ) : activeTab === 'support' ? (
          <SupportView onOrderSuccess={handleOrderSuccess} />
        ) : activeTab === 'settings' ? (
          <SettingsView onOrderSuccess={handleOrderSuccess} />
        ) : activeTab === 'help' ? (
          <HelpView onOrderSuccess={handleOrderSuccess} onNavigateTab={handleTabChange} />
        ) : (
          /* Default 3-Column Trading Workspace Grid */
          <main className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-5 md:p-6 flex-1 bg-[#131118]">
            {/* Column 1: Watchlist & Running Trades */}
            <div className="flex flex-col gap-5 lg:col-span-3">
              <WatchlistPanel />
              <RunningTradePanel />
            </div>

            {/* Column 2: Main Chart & Dual Order Book */}
            <div className="flex flex-col gap-5 lg:col-span-6">
              <MainChartCard />
              <DualOrderBook />
            </div>

            {/* Column 3: Create Order, My Order & Order Filled */}
            <div className="flex flex-col gap-5 lg:col-span-3">
              <CreateOrderCard onOrderSuccess={handleOrderSuccess} />
              <MyOrdersCard />
              <OrderFilledCard />
            </div>
          </main>
        )}
      </div>

      {/* Clean Toast Feedback with HugeIcons */}
      {toastMessage && (
        <div className="fixed bottom-8 right-8 z-50 flex items-center gap-3 px-5 py-3.5 bg-[#1F1E25] border border-[#00E163]/40 rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.6)] text-xs font-bold text-white backdrop-blur-xl animate-fade-in pointer-events-none">
          <div className="w-6 h-6 rounded-lg bg-[#00E163]/15 border border-[#00E163]/30 flex items-center justify-center text-[#00E163] shrink-0">
            <Tick01Icon className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span className="font-semibold text-slate-100">{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <OrderSuccessModal
        trade={executedTrade}
        onClose={() => setExecutedTrade(null)}
      />
    </div>
  );
}

export default dynamic(() => Promise.resolve(TradeflareTerminalContent), {
  ssr: false,
  loading: () => <div className="w-full min-h-screen bg-[#131118]" />,
});
