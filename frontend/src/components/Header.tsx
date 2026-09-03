'use client';

import React from 'react';
import { useTradingStore } from '@/store/useTradingStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Wallet, User as UserIcon, LogOut, ArrowUpRight, Radio, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface HeaderProps {
  onOpenAuthModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuthModal }) => {
  const { wsStatus, portfolio } = useTradingStore();
  const { user, isAuthenticated, logout } = useAuthStore();

  const totalEquity = portfolio?.total_equity_usdt ?? 0.0;

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-dark-800 bg-dark-900 px-6 backdrop-blur-md">
      {/* Brand & Logo */}
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center aspect-square shrink-0">
            <img
              src="/logo.png"
              alt="VeloceX Logo"
              className="h-8 w-8 aspect-square object-contain shrink-0 drop-shadow-[0_0_8px_rgba(0,225,99,0.3)]"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-white">
              Veloce<span className="text-[#00E163]">X</span>
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              Terminal v2.6
            </span>
          </div>
        </Link>

        {/* WebSocket Real-time Status Badge */}
        <div className="flex items-center gap-2 rounded-full border border-dark-800 bg-dark-850/80 px-3 py-1 text-xs">
          <span className="relative flex h-2 w-2">
            {wsStatus === 'connected' ? (
              <>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </>
            ) : wsStatus === 'reconnecting' ? (
              <>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
              </>
            ) : (
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500"></span>
            )}
          </span>
          <span
            className={`font-medium capitalize ${
              wsStatus === 'connected'
                ? 'text-emerald-400'
                : wsStatus === 'reconnecting'
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
          >
            {wsStatus === 'connected' ? 'Live WebSocket' : wsStatus}
          </span>
        </div>
      </div>

      {/* Right Side: Total Balance & User Profile */}
      <div className="flex items-center gap-5">
        {/* Total Balance Card */}
        <div className="hidden items-center gap-3 rounded-xl border border-dark-800 bg-dark-850/90 px-4 py-2 sm:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/80 text-emerald-400">
            <Wallet className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Total Equity
            </span>
            <span className="font-mono-num text-sm font-bold text-white">
              ${totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="ml-1 text-xs font-normal text-slate-400">USDT</span>
            </span>
          </div>
        </div>

        {/* User Account / Profile */}
        {isAuthenticated && user ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 rounded-xl border border-dark-800 bg-dark-850 px-3.5 py-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
                {user.name ? user.name.slice(0, 2).toUpperCase() : 'VX'}
              </div>
              <div className="hidden flex-col text-left lg:flex">
                <span className="text-xs font-semibold text-white">{user.name}</span>
                <span className="text-[10px] text-slate-400">{user.email}</span>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-dark-800 bg-dark-850 text-slate-400 transition-colors hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-400"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/25 transition-transform hover:scale-105 active:scale-95"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Connect Account</span>
          </button>
        )}
      </div>
    </header>
  );
};
