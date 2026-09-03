'use client';

import React, { useState } from 'react';
import {
  Settings01Icon,
  Shield01Icon,
  TradeUpIcon,
  CpuIcon,
  Notification01Icon,
  Key01Icon,
  FingerPrintIcon,
  LockPasswordIcon,
  Tick01Icon,
  Cancel01Icon,
  Copy01Icon,
  SparklesIcon,
  VolumeHighIcon,
  HelpCircleIcon,
  AlertCircleIcon,
  Delete01Icon,
  Clock01Icon,
  Globe02Icon,
} from 'hugeicons-react';

interface ApiKeyItem {
  id: string;
  name: string;
  keyMasked: string;
  createdAt: string;
  permissions: string[];
}

interface SettingsViewProps {
  onOrderSuccess?: (msg: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onOrderSuccess }) => {
  const [activeTab, setActiveTab] = useState<'security' | 'trading' | 'api' | 'notifications'>('security');

  // Security States
  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean>(true);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState<boolean>(true);
  const [antiPhishingCode, setAntiPhishingCode] = useState<string>('VELOCEX-SECURE-99');
  const [savePhase, setSavePhase] = useState<'idle' | 'progress' | 'checkmark_center' | 'checkmark_shift' | 'success_revealed'>('idle');

  // Trading Preferences States
  const [defaultLeverage, setDefaultLeverage] = useState<number>(20);
  const [isOneClickTrade, setIsOneClickTrade] = useState<boolean>(false);
  const [slippageTolerance, setSlippageTolerance] = useState<string>('0.5');
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);

  // API Management States
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([
    {
      id: 'API-1',
      name: 'Binance & Bybit Arbitrage Bot',
      keyMasked: 'vx_live_9f81a7b...491c',
      createdAt: '12 Agustus 2026',
      permissions: ['Read-Only', 'Spot Trading', 'Futures Trading'],
    },
    {
      id: 'API-2',
      name: 'TradingView Webhook Scalper',
      keyMasked: 'vx_live_382ca10...771e',
      createdAt: '28 Agustus 2026',
      permissions: ['Read-Only', 'Futures Trading'],
    },
  ]);
  const [newKeyName, setNewKeyName] = useState<string>('');
  const [isCreatingApi, setIsCreatingApi] = useState<boolean>(false);

  // Save Settings with 4-Step Animated Flow
  const handleSaveSettings = () => {
    if (savePhase !== 'idle') return;

    setSavePhase('progress');

    setTimeout(() => {
      setSavePhase('checkmark_center');

      setTimeout(() => {
        setSavePhase('checkmark_shift');

        setTimeout(() => {
          setSavePhase('success_revealed');

          setTimeout(() => {
            setSavePhase('idle');
            onOrderSuccess?.('Preferensi pengaturan akun berhasil disimpan.');
          }, 2000);
        }, 150);
      }, 1000);
    }, 700);
  };

  // Add API Key
  const handleCreateApiKey = () => {
    if (!newKeyName.trim()) {
      onOrderSuccess?.('Harap masukkan nama label kunci API.');
      return;
    }

    const newKey: ApiKeyItem = {
      id: `API-${apiKeys.length + 1}`,
      name: newKeyName,
      keyMasked: `vx_live_${Math.random().toString(36).substring(2, 9)}...${Math.random().toString(36).substring(2, 6)}`,
      createdAt: 'Hari ini',
      permissions: ['Read-Only', 'Spot Trading', 'Futures Trading'],
    };

    setApiKeys([newKey, ...apiKeys]);
    setNewKeyName('');
    setIsCreatingApi(false);
    onOrderSuccess?.(`Kunci API ${newKey.name} berhasil dibuat.`);
  };

  return (
    <div className="flex flex-col gap-6 p-3 sm:p-5 md:p-6 pb-24 md:pb-6 max-w-[1600px] mx-auto w-full font-sans animate-fade-in text-slate-100">
      {/* 1. EXECUTIVE SETTINGS HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#18171E] via-[#1F1E25] to-[#18171E] border border-white/5 p-6 md:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xl">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-xl bg-[#00E163]/10 border border-[#00E163]/30 text-[#00E163] text-[10px] font-black uppercase tracking-wider">
              Pusat Pengaturan Akun
            </span>
            <span className="text-xs font-bold text-slate-400">UID: 849201948 (Terverifikasi KYC Pro)</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white font-heading tracking-tight">
            Pengaturan &amp; Keamanan
          </h1>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-mono-num">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Level Keamanan:</span>
              <span className="font-extrabold text-[#00E163]">Level 3 (Maksimal)</span>
            </div>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">2FA Otentikasi:</span>
              <span className="font-extrabold text-[#00E163]">{is2FAEnabled ? 'Aktif' : 'Nonaktif'}</span>
            </div>
          </div>
        </div>

        {/* Account Tier Badge */}
        <div className="p-4 rounded-2xl bg-[#14131A] border border-white/5 flex items-center gap-4 w-full lg:w-auto shadow-inner">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Status Hak Akses</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#00E163] font-mono-num">VIP Tier 2</span>
              <span className="text-xs font-extrabold text-[#00E163]">Tingkat Biaya 0.02%</span>
            </div>
            <span className="text-[10px] text-slate-500">Batas Penarikan: $1,000,000 USDT / 24 Jam</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#00E163]/10 border border-[#00E163]/30 flex items-center justify-center text-[#00E163] shrink-0">
            <Shield01Icon className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* 2. SUB-NAVIGATION TABS (1000ms HOVER SWEEP) */}
      <div className="flex flex-wrap items-center gap-2.5">
        {[
          { id: 'security', label: 'Keamanan & 2FA', icon: Shield01Icon },
          { id: 'trading', label: 'Preferensi Trading', icon: TradeUpIcon },
          { id: 'api', label: 'Manajemen Kunci API', icon: Key01Icon },
          { id: 'notifications', label: 'Notifikasi & Suara', icon: Notification01Icon },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`group relative flex items-center gap-2 px-5 h-11 rounded-2xl text-xs font-bold transition-all duration-1000 overflow-hidden cursor-pointer select-none ${
                isActive
                  ? 'bg-[#00E163] text-black font-black shadow-lg shadow-[#00E163]/20 border border-[#00E163]'
                  : 'bg-[#18171E] text-slate-300 hover:text-black border border-white/5'
              }`}
            >
              {!isActive && (
                <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
              )}
              <Icon className="w-4 h-4 relative z-10 transition-colors duration-1000 shrink-0" />
              <span className="relative z-10 transition-colors duration-1000">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. TAB 1: SECURITY & 2FA */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Main Security Controls (8 Cols) */}
          <div className="lg:col-span-8 p-6 md:p-7 rounded-3xl bg-[#1F1E25] border border-white/5 shadow-xl flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2.5">
                <LockPasswordIcon className="w-5 h-5 text-[#00E163]" />
                <h2 className="text-base font-black text-white font-heading">Otentikasi &amp; Perlindungan Akun</h2>
              </div>
              <span className="text-[11px] font-bold text-[#00E163]">Tingkat Perlindungan 100%</span>
            </div>

            {/* 2FA Google Authenticator Toggle */}
            <div className="p-5 rounded-2xl bg-[#18171E] border border-white/5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#00E163]/10 border border-[#00E163]/30 flex items-center justify-center text-[#00E163] shrink-0">
                  <Shield01Icon className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold text-white">Google Authenticator (2FA)</span>
                  <span className="text-xs text-slate-400">Digunakan untuk penarikan dana dan login perangkat baru.</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIs2FAEnabled(!is2FAEnabled);
                  onOrderSuccess?.(`Google 2FA ${!is2FAEnabled ? 'diaktifkan' : 'dinonaktifkan'}.`);
                }}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  is2FAEnabled ? 'bg-[#00E163]' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-black transition-transform absolute top-1 ${
                    is2FAEnabled ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Biometric Passkey */}
            <div className="p-5 rounded-2xl bg-[#18171E] border border-white/5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#A855F7]/10 border border-[#A855F7]/30 flex items-center justify-center text-[#A855F7] shrink-0">
                  <FingerPrintIcon className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold text-white">Login Biometrik &amp; Passkey</span>
                  <span className="text-xs text-slate-400">Masuk instan menggunakan Touch ID, Face ID, atau Windows Hello.</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsBiometricEnabled(!isBiometricEnabled);
                  onOrderSuccess?.(`Login Biometrik ${!isBiometricEnabled ? 'diaktifkan' : 'dinonaktifkan'}.`);
                }}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  isBiometricEnabled ? 'bg-[#00E163]' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-black transition-transform absolute top-1 ${
                    isBiometricEnabled ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Anti-Phishing Code */}
            <div className="flex flex-col gap-2 p-5 rounded-2xl bg-[#18171E] border border-white/5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">Kode Anti-Phishing Email</label>
                <span className="text-[10px] text-slate-500">Akan dicantumkan pada seluruh email resmi VeloceX</span>
              </div>
              <div className="relative flex items-center h-11 px-3.5 rounded-2xl bg-[#14131A] border border-white/10 focus-within:border-[#00E163]/50">
                <input
                  type="text"
                  value={antiPhishingCode}
                  onChange={(e) => setAntiPhishingCode(e.target.value)}
                  className="w-full bg-transparent text-xs font-bold font-mono-num text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Save Button */}
            <button
              type="button"
              onClick={handleSaveSettings}
              disabled={savePhase !== 'idle'}
              className="relative w-full h-12 rounded-2xl overflow-hidden font-black text-xs transition-all duration-300 cursor-pointer flex items-center justify-center bg-white/5 hover:bg-white/10 text-white select-none shadow-lg border border-white/5 group mt-2"
            >
              <div
                className={`absolute left-0 top-0 bottom-0 bg-[#00E163] shadow-lg shadow-[#00E163]/30 transition-all ease-out pointer-events-none ${
                  savePhase === 'idle' ? 'w-0' : 'w-full duration-700'
                }`}
              />
              {savePhase === 'idle' && (
                <span className="relative z-10 flex items-center gap-1.5 text-white uppercase tracking-wider text-xs font-black">
                  <SparklesIcon className="w-4 h-4" />
                  <span>Simpan Pengaturan Keamanan</span>
                </span>
              )}
              {savePhase === 'progress' && (
                <span className="relative z-10 text-black font-black tracking-wider text-xs animate-pulse">
                  Menyimpan...
                </span>
              )}
              {(savePhase === 'checkmark_center' || savePhase === 'checkmark_shift' || savePhase === 'success_revealed') && (
                <div className="relative z-10 flex items-center justify-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center shadow-md animate-in zoom-in duration-300">
                    <Tick01Icon className="w-4 h-4 text-[#00E163] stroke-[3.5]" />
                  </div>
                  <span className="font-black text-black text-xs tracking-wider uppercase">
                    Tersimpan
                  </span>
                </div>
              )}
            </button>
          </div>

          {/* Device & Session History (4 Cols) */}
          <div className="lg:col-span-4 p-6 md:p-7 rounded-3xl bg-[#1F1E25] border border-white/5 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Globe02Icon className="w-5 h-5 text-[#00E163]" />
                <h3 className="text-sm font-extrabold text-white">Sesi Login Perangkat</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400">2 Aktif</span>
            </div>

            <div className="flex flex-col gap-3">
              <div className="p-3.5 rounded-2xl bg-[#18171E] border border-[#00E163]/30 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-white">Windows Chrome 128</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-[#00E163]/15 text-[#00E163] text-[9px] font-black uppercase">
                    Perangkat Ini
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">Jakarta, Indonesia • 103.119.x.x</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#18171E] border border-white/5 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-white">iPhone 15 Pro • VeloceX App</span>
                  <span className="text-[10px] text-slate-500">2 jam lalu</span>
                </div>
                <span className="text-[11px] text-slate-400">Jakarta, Indonesia • 182.253.x.x</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2: TRADING PREFERENCES */}
      {activeTab === 'trading' && (
        <div className="p-6 md:p-7 rounded-3xl bg-[#1F1E25] border border-white/5 shadow-xl flex flex-col gap-6 max-w-3xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <TradeUpIcon className="w-5 h-5 text-[#00E163]" />
              <h2 className="text-base font-black text-white font-heading">Preferensi Eksekusi Trading</h2>
            </div>
            <span className="text-[11px] text-slate-400">Pengaturan Terminal &amp; Slippage</span>
          </div>

          {/* Default Leverage Preset */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">Default Leverage Buka Posisi</label>
              <span className="text-xs font-black font-mono-num text-[#00E163]">{defaultLeverage}x</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[5, 10, 20, 50, 100].map((lev) => (
                <button
                  key={lev}
                  type="button"
                  onClick={() => setDefaultLeverage(lev)}
                  className={`py-2.5 rounded-2xl text-xs font-black font-mono-num transition-all cursor-pointer ${
                    defaultLeverage === lev
                      ? 'bg-[#00E163] text-black shadow-md shadow-[#00E163]/20'
                      : 'bg-[#18171E] border border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {lev}x
                </button>
              ))}
            </div>
          </div>

          {/* One-Click Fast Order Mode */}
          <div className="p-5 rounded-2xl bg-[#18171E] border border-white/5 flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-white">Eksekusi Order 1-Klik (*One-Click Mode*)</span>
              <span className="text-xs text-slate-400">Melewati dialog konfirmasi untuk eksekusi scalping secepat kilat.</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsOneClickTrade(!isOneClickTrade);
                onOrderSuccess?.(`Mode 1-Klik ${!isOneClickTrade ? 'diaktifkan' : 'dinonaktifkan'}.`);
              }}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                isOneClickTrade ? 'bg-[#00E163]' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-black transition-transform absolute top-1 ${
                  isOneClickTrade ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Slippage Tolerance */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-300">Toleransi Slippage Harga</label>
            <div className="grid grid-cols-4 gap-2">
              {['0.1', '0.5', '1.0', '2.0'].map((slip) => (
                <button
                  key={slip}
                  type="button"
                  onClick={() => setSlippageTolerance(slip)}
                  className={`py-2 rounded-2xl text-xs font-bold font-mono-num transition-all cursor-pointer ${
                    slippageTolerance === slip
                      ? 'bg-[#00E163] text-black font-black'
                      : 'bg-[#18171E] border border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {slip}%
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={savePhase !== 'idle'}
            className="relative w-full h-12 rounded-2xl overflow-hidden font-black text-xs transition-all duration-300 cursor-pointer flex items-center justify-center bg-white/5 hover:bg-white/10 text-white select-none shadow-lg border border-white/5 group mt-2"
          >
            <div
              className={`absolute left-0 top-0 bottom-0 bg-[#00E163] shadow-lg shadow-[#00E163]/30 transition-all ease-out pointer-events-none ${
                savePhase === 'idle' ? 'w-0' : 'w-full duration-700'
              }`}
            />
            {savePhase === 'idle' && (
              <span className="relative z-10 flex items-center gap-1.5 text-white uppercase tracking-wider text-xs font-black">
                <SparklesIcon className="w-4 h-4" />
                <span>Simpan Preferensi Trading</span>
              </span>
            )}
            {savePhase === 'progress' && (
              <span className="relative z-10 text-black font-black tracking-wider text-xs animate-pulse">
                Menyimpan...
              </span>
            )}
            {(savePhase === 'checkmark_center' || savePhase === 'checkmark_shift' || savePhase === 'success_revealed') && (
              <div className="relative z-10 flex items-center justify-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center shadow-md animate-in zoom-in duration-300">
                  <Tick01Icon className="w-4 h-4 text-[#00E163] stroke-[3.5]" />
                </div>
                <span className="font-black text-black text-xs tracking-wider uppercase">
                  Tersimpan
                </span>
              </div>
            )}
          </button>
        </div>
      )}

      {/* 5. TAB 3: API MANAGEMENT */}
      {activeTab === 'api' && (
        <div className="p-6 md:p-7 rounded-3xl bg-[#1F1E25] border border-white/5 shadow-xl flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <Key01Icon className="w-5 h-5 text-[#00E163]" />
              <h2 className="text-base font-black text-white font-heading">Kunci API &amp; Webhook Trading</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsCreatingApi(true)}
              className="px-4 py-2 rounded-2xl bg-[#00E163] hover:bg-[#00E163]/90 text-black text-xs font-black transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Key01Icon className="w-4 h-4 stroke-[2.5]" />
              <span>Buat Kunci API Baru</span>
            </button>
          </div>

          {/* New API Key Form Modal */}
          {isCreatingApi && (
            <div className="p-5 rounded-2xl bg-[#18171E] border border-[#00E163]/30 flex flex-col gap-3 animate-fade-in">
              <span className="text-xs font-black text-white">Label Nama Kunci API Baru</span>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Contoh: TradingView Bot Scalper"
                  className="flex-1 h-10 px-3.5 rounded-2xl bg-[#14131A] border border-white/10 text-xs text-white focus:outline-none focus:border-[#00E163]"
                />
                <button
                  type="button"
                  onClick={handleCreateApiKey}
                  className="px-4 h-10 rounded-2xl bg-[#00E163] text-black text-xs font-black hover:bg-[#00E163]/90 transition-colors cursor-pointer"
                >
                  Generate
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingApi(false)}
                  className="px-4 h-10 rounded-2xl bg-[#26252E] text-slate-300 text-xs font-bold hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* Existing Keys Table */}
          <div className="flex flex-col gap-3">
            {apiKeys.map((k) => (
              <div
                key={k.id}
                className="p-5 rounded-2xl bg-[#18171E] border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-white">{k.name}</span>
                    <span className="px-2 py-0.5 rounded-md bg-[#00E163]/10 text-[#00E163] text-[10px] font-mono-num font-bold">
                      Aktif
                    </span>
                  </div>
                  <span className="text-xs font-mono-num text-slate-400">{k.keyMasked}</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {k.permissions.map((p) => (
                      <span key={p} className="px-2 py-0.5 rounded-md bg-white/5 text-slate-400 text-[9px] font-bold">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOrderSuccess?.('Kunci API berhasil disalin ke clipboard.')}
                    className="p-2 rounded-xl bg-[#26252E] hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
                    title="Salin Kunci"
                  >
                    <Copy01Icon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setApiKeys(apiKeys.filter((item) => item.id !== k.id));
                      onOrderSuccess?.(`Kunci API ${k.name} telah dihapus.`);
                    }}
                    className="p-2 rounded-xl bg-[#26252E] hover:bg-[#FF5C77]/20 text-[#FF5C77] transition-colors cursor-pointer"
                    title="Hapus Kunci"
                  >
                    <Delete01Icon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. TAB 4: NOTIFICATIONS & SOUND */}
      {activeTab === 'notifications' && (
        <div className="p-6 md:p-7 rounded-3xl bg-[#1F1E25] border border-white/5 shadow-xl flex flex-col gap-5 max-w-2xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <Notification01Icon className="w-5 h-5 text-[#00E163]" />
              <h2 className="text-base font-black text-white font-heading">Notifikasi Suara &amp; Peringatan</h2>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#18171E] border border-white/5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <VolumeHighIcon className="w-5 h-5 text-[#00E163]" />
              <div className="flex flex-col">
                <span className="text-sm font-extrabold text-white">Efek Suara Terminal (Audio Beeper)</span>
                <span className="text-xs text-slate-400">Berbunyi saat order filled, TP/SL tersentuh, atau likuidasi.</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsSoundEnabled(!isSoundEnabled);
                onOrderSuccess?.(`Efek Suara ${!isSoundEnabled ? 'diaktifkan' : 'dinonaktifkan'}.`);
              }}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                isSoundEnabled ? 'bg-[#00E163]' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-black transition-transform absolute top-1 ${
                  isSoundEnabled ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
