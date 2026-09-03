'use client';

import React from 'react';
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
} from 'lucide-react';

interface SidebarItemConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TOP_NAV_ITEMS: SidebarItemConfig[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'orders', label: 'Orders', icon: FileText },
  { id: 'messages', label: 'Messages', icon: Mail },
  { id: 'community', label: 'Community', icon: Users },
];

const MIDDLE_NAV_ITEMS: SidebarItemConfig[] = [
  { id: 'lightning', label: 'Lightning Trade', icon: Zap },
  { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
  { id: 'market', label: 'Marketplace', icon: ShoppingCart },
  { id: 'procharts', label: 'TradingView Pro', icon: CandlestickChart },
];

const BOTTOM_NAV_ITEMS: SidebarItemConfig[] = [
  { id: 'support', label: 'Support', icon: Headphones },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'help', label: 'Help', icon: HelpCircle },
];

interface LeftSidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  activeTab = 'dashboard',
  onTabChange,
}) => {
  const handleItemClick = (id: string) => {
    onTabChange?.(id);
  };

  const renderNavButton = (item: SidebarItemConfig) => {
    const isActive = activeTab === item.id;
    const Icon = item.icon;

    return (
      <div
        key={item.id}
        onClick={() => handleItemClick(item.id)}
        className="group relative flex items-center justify-center w-11 h-11 cursor-pointer select-none"
        title={item.label}
      >
        {/* SQUIRCLE BOX CONTAINER */}
        <div
          className={`relative w-10 h-10 rounded-[14px] overflow-hidden flex items-center justify-center transition-all duration-300 ${
            isActive
              ? 'bg-[#00E163] text-black shadow-[0_0_12px_rgba(0,225,99,0.3)]'
              : 'bg-[#1F1E25] border border-white/5 group-hover:border-[#00E163]/40'
          }`}
        >
          {/* CLOCKWISE 360° RADIAL GREEN FILL FROM 12 O'CLOCK TO 12 O'CLOCK */}
          <svg
            viewBox="0 0 40 40"
            className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none z-0 overflow-visible"
          >
            <circle
              cx="20"
              cy="20"
              r="11"
              fill="none"
              stroke="#00E163"
              strokeWidth="24"
              pathLength="100"
              strokeDasharray="100"
              className={isActive ? '' : 'sidebar-circle-sweep'}
              style={{ strokeDashoffset: isActive ? 0 : undefined }}
            />
          </svg>

          {/* LOGO ICON WITH CLEAN WHITE-TO-BLACK COLOR TRANSITION */}
          <div className="relative z-10 flex items-center justify-center pointer-events-none">
            <Icon
              className={`w-5 h-5 transition-colors duration-[1500ms] ${
                isActive
                  ? 'text-black'
                  : 'text-slate-300 group-hover:text-black'
              }`}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <aside className="hidden md:flex flex-col items-center justify-between w-16 min-h-screen py-4 bg-[#131118] border-r border-white/5 select-none shrink-0 z-30">
      {/* Top Main Navigation */}
      <div className="flex flex-col items-center gap-2">
        {TOP_NAV_ITEMS.map(renderNavButton)}

        {/* Divider */}
        <div className="w-7 h-[1px] bg-white/10 my-1" />

        {/* Middle Feature Navigation */}
        {MIDDLE_NAV_ITEMS.map(renderNavButton)}
      </div>

      {/* Bottom Auxiliary Navigation */}
      <div className="flex flex-col items-center gap-2">
        {BOTTOM_NAV_ITEMS.map(renderNavButton)}
      </div>
    </aside>
  );
};
