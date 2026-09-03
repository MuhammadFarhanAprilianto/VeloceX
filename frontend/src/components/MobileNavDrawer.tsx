'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import {
  LayoutGrid,
  BarChart2,
  Wallet,
  FileText,
  Mail,
  Users,
  Zap,
  Briefcase,
  ShoppingCart,
  CandlestickChart,
  Headphones,
  Settings,
  HelpCircle,
  X,
  ShieldCheck,
} from 'lucide-react';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
}) => {
  if (!isOpen || typeof document === 'undefined') return null;

  const NAV_SECTIONS = [
    {
      title: 'Trading & Market',
      items: [
        { id: 'dashboard', label: 'Trading Terminal', desc: 'Real-time 3-column workspace', icon: LayoutGrid },
        { id: 'procharts', label: 'TradingView Pro', desc: 'Advanced candlestick charts', icon: CandlestickChart },
        { id: 'lightning', label: 'Lightning 5s-60s', desc: 'Binary turbo contracts', icon: Zap },
        { id: 'analytics', label: 'Market Analytics', desc: 'Technical indicators & heatmaps', icon: BarChart2 },
        { id: 'market', label: 'Marketplace', desc: 'Signals, bots & copy traders', icon: ShoppingCart },
      ],
    },
    {
      title: 'Finance & Portfolio',
      items: [
        { id: 'wallet', label: 'Wallet & Sub-Accounts', desc: 'Deposit, Withdraw, Earn & P2P', icon: Wallet },
        { id: 'orders', label: 'Orders & History', desc: 'Open, Filled, Edit & Stop Orders', icon: FileText },
        { id: 'portfolio', label: 'Portfolio Tracker', desc: 'PnL analytics & allocation', icon: Briefcase },
      ],
    },
    {
      title: 'Social & Support',
      items: [
        { id: 'community', label: 'Community Feed', desc: 'Master traders & discussions', icon: Users },
        { id: 'messages', label: 'Direct Messages', desc: 'Notifications & system alerts', icon: Mail },
        { id: 'support', label: 'VIP Support Desk', desc: 'Live ticketing & assistance', icon: Headphones },
        { id: 'settings', label: 'Security & Settings', desc: '2FA, API keys & preferences', icon: Settings },
        { id: 'help', label: 'Help Center', desc: 'Guides, FAQs & tutorials', icon: HelpCircle },
      ],
    },
  ];

  const handleSelectTab = (id: string) => {
    onTabChange(id);
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex justify-end bg-black/80 backdrop-blur-md animate-fade-in md:hidden">
      <div className="relative w-full max-w-sm h-full bg-[#131118] border-l border-white/10 flex flex-col p-5 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 aspect-square shrink-0">
              <img src="/logo.png" alt="VeloceX" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <span className="font-heading text-lg font-black text-white">VeloceX</span>
              <span className="text-[10px] block text-[#00E163] font-bold">Pro Mobile Terminal</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 py-4 space-y-6">
          {NAV_SECTIONS.map((sec, secIdx) => (
            <div key={secIdx} className="space-y-2">
              <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 px-2">
                {sec.title}
              </h4>
              <div className="space-y-1">
                {sec.items.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center gap-3.5 p-3 rounded-2xl transition-all text-left cursor-pointer ${
                        isActive
                          ? 'bg-[#00E163] text-black shadow-lg shadow-[#00E163]/20 font-bold'
                          : 'bg-[#1F1E25] hover:bg-white/5 text-slate-300 hover:text-white border border-white/5'
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 ${
                          isActive
                            ? 'bg-black/20 text-black'
                            : 'bg-white/5 text-[#00E163]'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block text-xs font-bold truncate">{item.label}</span>
                        <span
                          className={`block text-[10px] truncate ${
                            isActive ? 'text-black/70 font-medium' : 'text-slate-500'
                          }`}
                        >
                          {item.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Security Badge */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 text-[#00E163] font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>256-bit SSL Protected</span>
          </div>
          <span className="font-mono-num font-bold">v2.6 Pro</span>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
