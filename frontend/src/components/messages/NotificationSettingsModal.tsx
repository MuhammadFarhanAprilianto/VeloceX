'use client';

import React, { useState } from 'react';
import {
  Cancel01Icon,
  Shield01Icon,
  TradeUpIcon,
  Wallet01Icon,
  Megaphone01Icon,
  GiftIcon,
  CheckmarkCircle01Icon,
  Tick01Icon,
  Notification02Icon,
  Settings02Icon,
} from 'hugeicons-react';

interface NotificationChannel {
  push: boolean;
  email: boolean;
  sms: boolean;
}

export interface NotificationPreferences {
  security: NotificationChannel;
  trading: NotificationChannel;
  wallet: NotificationChannel;
  announcements: NotificationChannel;
  rewards: NotificationChannel;
}

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePreferences: (prefs: NotificationPreferences) => void;
}

const INITIAL_PREFERENCES: NotificationPreferences = {
  security: { push: true, email: true, sms: true },
  trading: { push: true, email: true, sms: false },
  wallet: { push: true, email: true, sms: true },
  announcements: { push: true, email: false, sms: false },
  rewards: { push: true, email: true, sms: false },
};

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  onSavePreferences,
}) => {
  const [prefs, setPrefs] = useState<NotificationPreferences>(INITIAL_PREFERENCES);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const toggleOption = (category: keyof NotificationPreferences, channel: keyof NotificationChannel) => {
    setPrefs((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [channel]: !prev[category][channel],
      },
    }));
  };

  const handleSave = () => {
    onSavePreferences(prefs);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  const CATEGORIES = [
    {
      key: 'security' as const,
      label: 'Keamanan Akun & Akses',
      desc: 'Login baru, perubahan 2FA, verifikasi sandi, otorisasi API key.',
      icon: Shield01Icon,
      iconColor: 'text-amber-400',
    },
    {
      key: 'trading' as const,
      label: 'Trading & Eksekusi Order',
      desc: 'Order filled, stop-loss trigger, peringatan likuidasi posisi.',
      icon: TradeUpIcon,
      iconColor: 'text-[#00E163]',
    },
    {
      key: 'wallet' as const,
      label: 'Deposit, WD & Transfer',
      desc: 'Konfirmasi setoran crypto on-chain, status penarikan dana.',
      icon: Wallet01Icon,
      iconColor: 'text-cyan-400',
    },
    {
      key: 'announcements' as const,
      label: 'Pengumuman & Listing Aset',
      desc: 'Listing pair baru, jadwal maintenance server, update regulasi.',
      icon: Megaphone01Icon,
      iconColor: 'text-indigo-400',
    },
    {
      key: 'rewards' as const,
      label: 'Promosi & Hadiah VeloceX',
      desc: 'Cashback fee rebate, airdrop hadiah, kompetisi trading bulanan.',
      icon: GiftIcon,
      iconColor: 'text-pink-400',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#1F1E25] border border-white/10 shadow-2xl p-6 flex flex-col gap-5 overflow-hidden">
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00E163] to-transparent" />

        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#26252E] border border-white/5 flex items-center justify-center">
              <Settings02Icon className="w-5 h-5 text-[#00E163]" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-base font-extrabold text-white font-heading">
                Preferensi Notifikasi
              </h3>
              <p className="text-xs text-slate-400">
                Atur saluran pengiriman notifikasi instan sesuai kebutuhan Anda
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-[#26252E] hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <Cancel01Icon className="w-4 h-4" />
          </button>
        </div>

        {/* Channel Table Headers */}
        <div className="grid grid-cols-12 gap-2 px-3 py-2 rounded-xl bg-[#18171E] text-[11px] font-bold text-slate-400 select-none">
          <div className="col-span-6">Kategori Notifikasi</div>
          <div className="col-span-2 text-center">In-App / Push</div>
          <div className="col-span-2 text-center">Email</div>
          <div className="col-span-2 text-center">SMS</div>
        </div>

        {/* Preference Rows List */}
        <div className="flex flex-col gap-2.5 max-h-[340px] overflow-y-auto custom-positions-scrollbar pr-1">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const current = prefs[cat.key];

            return (
              <div
                key={cat.key}
                className="grid grid-cols-12 gap-2 items-center p-3 rounded-2xl bg-[#26252E]/60 border border-white/5 hover:border-white/10 transition-colors"
              >
                {/* Info */}
                <div className="col-span-6 flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-[#18171E] shrink-0 mt-0.5">
                    <Icon className={`w-4 h-4 ${cat.iconColor}`} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-extrabold text-white leading-snug">{cat.label}</span>
                    <span className="text-[10px] text-slate-400 leading-tight mt-0.5 line-clamp-2">
                      {cat.desc}
                    </span>
                  </div>
                </div>

                {/* Push Toggle */}
                <div className="col-span-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => toggleOption(cat.key, 'push')}
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                      current.push
                        ? 'bg-[#00E163] border-[#00E163] text-black shadow-sm'
                        : 'border-white/20 bg-transparent hover:border-white/40'
                    }`}
                  >
                    {current.push && <Tick01Icon className="w-3.5 h-3.5 stroke-[3] text-black" />}
                  </button>
                </div>

                {/* Email Toggle */}
                <div className="col-span-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => toggleOption(cat.key, 'email')}
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                      current.email
                        ? 'bg-[#00E163] border-[#00E163] text-black shadow-sm'
                        : 'border-white/20 bg-transparent hover:border-white/40'
                    }`}
                  >
                    {current.email && <Tick01Icon className="w-3.5 h-3.5 stroke-[3] text-black" />}
                  </button>
                </div>

                {/* SMS Toggle */}
                <div className="col-span-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => toggleOption(cat.key, 'sms')}
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                      current.sms
                        ? 'bg-[#00E163] border-[#00E163] text-black shadow-sm'
                        : 'border-white/20 bg-transparent hover:border-white/40'
                    }`}
                  >
                    {current.sms && <Tick01Icon className="w-3.5 h-3.5 stroke-[3] text-black" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <span className="text-[11px] text-slate-500 font-sans">
            Perubahan preferensi akan aktif seketika untuk semua perangkat.
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#26252E] hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer border border-white/5"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="group relative flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#00E163] hover:bg-[#00c957] text-black font-extrabold text-xs shadow-[0_0_15px_rgba(0,225,99,0.25)] overflow-hidden cursor-pointer transition-all"
            >
              {isSaved ? (
                <>
                  <CheckmarkCircle01Icon className="w-4 h-4 text-black stroke-[3]" />
                  <span>Tersimpan!</span>
                </>
              ) : (
                <span>Simpan Preferensi</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
