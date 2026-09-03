'use client';

import React from 'react';
import {
  LayoutGrid,
  CandlestickChart,
  Zap,
  Wallet,
  Menu,
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenMobileMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenMobileMenu,
}) => {
  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Terminal', icon: LayoutGrid },
    { id: 'procharts', label: 'ProCharts', icon: CandlestickChart },
    { id: 'lightning', label: 'Lightning', icon: Zap },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#131118]/95 backdrop-blur-xl border-t border-white/10 px-3 py-2 flex items-center justify-around select-none shadow-[0_-8px_24px_rgba(0,0,0,0.6)]">
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.id;
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-300 relative ${
              isActive ? 'text-[#00E163]' : 'text-slate-400 hover:text-white'
            }`}
          >
            {/* Active Glow Pill */}
            {isActive && (
              <span className="absolute -top-2 w-8 h-1 bg-[#00E163] rounded-full shadow-[0_0_12px_#00E163]" />
            )}

            <div
              className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all ${
                isActive
                  ? 'bg-[#00E163]/15 text-[#00E163]'
                  : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold tracking-tight mt-0.5">
              {item.label}
            </span>
          </button>
        );
      })}

      {/* More / Menu Drawer Toggle Button */}
      <button
        onClick={onOpenMobileMenu}
        className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-400 hover:text-white transition-all"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/5 text-slate-300">
          <Menu className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-bold tracking-tight mt-0.5">Menu</span>
      </button>
    </nav>
  );
};
