'use client';

import React, { useState } from 'react';
import {
  HeadphonesIcon,
  Message01Icon,
  Mail01Icon,
  Shield01Icon,
  CheckmarkCircle01Icon,
  Tick01Icon,
  Cancel01Icon,
  Clock01Icon,
  AlertCircleIcon,
  ArrowRight01Icon,
  Activity01Icon,
  SentIcon,
  Search01Icon,
  SparklesIcon,
  Globe02Icon,
  Layers01Icon,
} from 'hugeicons-react';

interface SupportTicket {
  id: string;
  category: string;
  subject: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  priority: 'Tinggi' | 'Sedang' | 'Rendah';
}

interface SupportViewProps {
  onOrderSuccess?: (msg: string) => void;
}

export const SupportView: React.FC<SupportViewProps> = ({ onOrderSuccess }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('deposit_withdraw');
  const [ticketSubject, setTicketSubject] = useState<string>('');
  const [ticketMessage, setTicketMessage] = useState<string>('');
  const [ticketPriority, setTicketPriority] = useState<'Tinggi' | 'Sedang' | 'Rendah'>('Sedang');
  const [submitPhase, setSubmitPhase] = useState<'idle' | 'progress' | 'checkmark_center' | 'checkmark_shift' | 'success_revealed'>('idle');

  const [activeTickets, setActiveTickets] = useState<SupportTicket[]>([
    {
      id: 'TICK-8921',
      category: 'Deposit & Penarikan',
      subject: 'Konfirmasi jaringan penarikan USDT TRC20',
      status: 'in_progress',
      createdAt: '10 Menit yang lalu',
      priority: 'Tinggi',
    },
    {
      id: 'TICK-8410',
      category: 'Akun & Keamanan',
      subject: 'Pembaruan kode Anti-Phishing email',
      status: 'resolved',
      createdAt: '2 Hari yang lalu',
      priority: 'Sedang',
    },
    {
      id: 'TICK-7932',
      category: 'API & Integrasi',
      subject: 'Whitelist IP untuk WebSocket private feed',
      status: 'resolved',
      createdAt: '5 Hari yang lalu',
      priority: 'Rendah',
    },
  ]);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitPhase !== 'idle') return;

    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      onOrderSuccess?.('Harap lengkapi judul subjek dan pesan tiket bantuan.');
      return;
    }

    // 1. Loading Progress Bar Hijau (700ms)
    setSubmitPhase('progress');

    // 2. Centang Pop di Tengah
    setTimeout(() => {
      setSubmitPhase('checkmark_center');

      // 3. Jeda 1s -> Geser Kiri + Blur-to-Sharp Teks Sukses
      setTimeout(() => {
        setSubmitPhase('checkmark_shift');

        setTimeout(() => {
          setSubmitPhase('success_revealed');

          // 4. Jeda 2s -> Tambahkan ke list dan reset form
          setTimeout(() => {
            const newTicket: SupportTicket = {
              id: `TICK-${Math.floor(1000 + Math.random() * 9000)}`,
              category:
                selectedCategory === 'deposit_withdraw'
                  ? 'Deposit & Penarikan'
                  : selectedCategory === 'trading'
                  ? 'Trading & Eksekusi'
                  : selectedCategory === 'kyc'
                  ? 'Akun & Verifikasi'
                  : 'API & Teknis',
              subject: ticketSubject,
              status: 'open',
              createdAt: 'Baru saja',
              priority: ticketPriority,
            };

            setActiveTickets([newTicket, ...activeTickets]);
            setTicketSubject('');
            setTicketMessage('');
            setSubmitPhase('idle');
            onOrderSuccess?.(`Tiket bantuan ${newTicket.id} berhasil dikirim ke tim VeloceX VIP Desk.`);
          }, 2000);
        }, 150);
      }, 1000);
    }, 700);
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1600px] mx-auto w-full font-sans animate-fade-in text-slate-100">
      {/* 1. EXECUTIVE SUPPORT HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#18171E] via-[#1F1E25] to-[#18171E] border border-white/5 p-6 md:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xl">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-xl bg-[#00E163]/10 border border-[#00E163]/30 text-[#00E163] text-[10px] font-black uppercase tracking-wider">
              24/7 VIP Customer Desk
            </span>
            <span className="text-xs font-bold text-slate-400">Waktu Respon Rata-rata: &lt; 2 Menit</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white font-heading tracking-tight">
            Pusat Bantuan &amp; Layanan Pelanggan
          </h1>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-mono-num">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Status Sistem:</span>
              <span className="font-extrabold text-[#00E163]">100% Operasional Normal</span>
            </div>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Kepuasan Pelanggan:</span>
              <span className="font-extrabold text-[#00E163]">99.4% CSAT</span>
            </div>
          </div>
        </div>

        {/* VIP Support Badge Card */}
        <div className="p-4 rounded-2xl bg-[#14131A] border border-white/5 flex items-center gap-4 w-full lg:w-auto shadow-inner">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Prioritas Layanan Akun</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#00E163] font-mono-num">VIP 2</span>
              <span className="text-xs font-extrabold text-[#00E163]">Jalur Khusus Prioritas</span>
            </div>
            <span className="text-[10px] text-slate-500">Tiket ditangani langsung oleh Senior Specialist</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#00E163]/10 border border-[#00E163]/30 flex items-center justify-center text-[#00E163] shrink-0">
            <HeadphonesIcon className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* 2. DIRECT VIP CHANNELS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Telegram VIP Desk */}
        <div
          onClick={() => onOrderSuccess?.('Membuka obrolan resmi Telegram VIP Concierge VeloceX.')}
          className="p-5 rounded-3xl bg-[#1F1E25] border border-white/5 hover:border-[#3875F6]/40 transition-all cursor-pointer flex items-center justify-between shadow-xl group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#3875F6]/10 border border-[#3875F6]/30 flex items-center justify-center text-[#3875F6] shrink-0">
              <Message01Icon className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-sm group-hover:text-[#3875F6] transition-colors">
                Telegram VIP Concierge
              </span>
              <span className="text-[11px] text-slate-400">@VeloceX_VIP_Support</span>
            </div>
          </div>
          <ArrowRight01Icon className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
        </div>

        {/* Email Direct Desk */}
        <div
          onClick={() => onOrderSuccess?.('Membuka klien email untuk support@velocex.exchange.')}
          className="p-5 rounded-3xl bg-[#1F1E25] border border-white/5 hover:border-[#00E163]/40 transition-all cursor-pointer flex items-center justify-between shadow-xl group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#00E163]/10 border border-[#00E163]/30 flex items-center justify-center text-[#00E163] shrink-0">
              <Mail01Icon className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-sm group-hover:text-[#00E163] transition-colors">
                Email Dukungan Resmi
              </span>
              <span className="text-[11px] text-slate-400">support@velocex.exchange</span>
            </div>
          </div>
          <ArrowRight01Icon className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
        </div>

        {/* Security & Anti-Fraud */}
        <div
          onClick={() => onOrderSuccess?.('Membuka pusat keamanan dan pelaporan fraud VeloceX.')}
          className="p-5 rounded-3xl bg-[#1F1E25] border border-white/5 hover:border-[#FF5C77]/40 transition-all cursor-pointer flex items-center justify-between shadow-xl group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#FF5C77]/10 border border-[#FF5C77]/30 flex items-center justify-center text-[#FF5C77] shrink-0">
              <Shield01Icon className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-sm group-hover:text-[#FF5C77] transition-colors">
                Pusat Keamanan &amp; Fraud
              </span>
              <span className="text-[11px] text-slate-400">security@velocex.exchange</span>
            </div>
          </div>
          <ArrowRight01Icon className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
        </div>
      </div>

      {/* 3. MAIN FORM & ACTIVE TICKETS GRID (8 COLS / 4 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT: SUBMIT NEW TICKET FORM (7 COLS) */}
        <div className="lg:col-span-7 p-6 md:p-7 rounded-3xl bg-[#1F1E25] border border-white/5 shadow-xl flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <SentIcon className="w-5 h-5 text-[#00E163]" />
              <h2 className="text-base font-black text-white font-heading">Kirim Tiket Bantuan Baru</h2>
            </div>
            <span className="text-[11px] text-slate-400">Formulir Terenkripsi End-to-End</span>
          </div>

          <form onSubmit={handleSubmitTicket} className="flex flex-col gap-4">
            {/* Category Filter Pills with 1000ms Sweep */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400">Kategori Bantuan</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'deposit_withdraw', label: 'Deposit/Tarik' },
                  { id: 'trading', label: 'Trading/Order' },
                  { id: 'kyc', label: 'Akun & KYC' },
                  { id: 'api', label: 'API/Teknis' },
                ].map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`group relative flex items-center justify-center px-3 h-10 rounded-2xl text-xs font-bold transition-all duration-1000 overflow-hidden cursor-pointer select-none ${
                        isActive
                          ? 'bg-[#00E163] text-black font-black shadow-md shadow-[#00E163]/20 border border-[#00E163]'
                          : 'bg-[#18171E] text-slate-300 hover:text-black border border-white/5'
                      }`}
                    >
                      {!isActive && (
                        <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                      )}
                      <span className="relative z-10 transition-colors duration-1000">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subject Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400">Subjek Bantuan</label>
              <div className="relative flex items-center h-11 px-3.5 rounded-2xl bg-[#18171E] border border-white/10 focus-within:border-[#00E163]/50 transition-colors">
                <input
                  type="text"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="Contoh: Pertanyaan batas penarikan harian USDT..."
                  className="w-full bg-transparent text-xs font-bold text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Priority Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400">Tingkat Urgensi / Prioritas</label>
              <div className="flex items-center gap-2">
                {(['Tinggi', 'Sedang', 'Rendah'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setTicketPriority(p)}
                    className={`flex-1 py-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                      ticketPriority === p
                        ? p === 'Tinggi'
                          ? 'bg-[#FF5C77]/15 border-[#FF5C77] text-[#FF5C77]'
                          : p === 'Sedang'
                          ? 'bg-[#FFB800]/15 border-[#FFB800] text-[#FFB800]'
                          : 'bg-[#00E163]/15 border-[#00E163] text-[#00E163]'
                        : 'bg-[#18171E] border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Textarea */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400">Rincian Pertanyaan / Masalah</label>
              <textarea
                rows={4}
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                placeholder="Tuliskan kendala Anda secara rinci..."
                className="w-full p-3.5 rounded-2xl bg-[#18171E] border border-white/10 focus:border-[#00E163]/50 text-xs text-white placeholder-slate-500 focus:outline-none resize-none"
              />
            </div>

            {/* 4-Step Animated Submit Button */}
            <button
              type="submit"
              disabled={submitPhase !== 'idle'}
              className="relative w-full h-12 rounded-2xl overflow-hidden font-black text-xs transition-all duration-300 cursor-pointer flex items-center justify-center bg-white/5 hover:bg-white/10 text-white select-none shadow-lg border border-white/5 group mt-1"
            >
              {/* 1. Green Progress Fill from Left to Right (700ms) */}
              <div
                className={`absolute left-0 top-0 bottom-0 bg-[#00E163] shadow-lg shadow-[#00E163]/30 transition-all ease-out pointer-events-none ${
                  submitPhase === 'idle' ? 'w-0' : 'w-full duration-700'
                }`}
              />

              {/* Initial Idle Text */}
              {submitPhase === 'idle' && (
                <span className="relative z-10 flex items-center gap-1.5 transition-opacity duration-300 text-white group-hover:text-white uppercase tracking-wider text-xs font-black">
                  <SentIcon className="w-4 h-4" />
                  <span>Kirim Tiket ke VIP Desk</span>
                </span>
              )}

              {/* Step 1: While filling progress bar */}
              {submitPhase === 'progress' && (
                <span className="relative z-10 text-black font-black tracking-wider text-xs animate-pulse">
                  Mengirimkan Tiket...
                </span>
              )}

              {/* Step 2 & 3: Centered Checkmark & Success Text Motion */}
              {(submitPhase === 'checkmark_center' || submitPhase === 'checkmark_shift' || submitPhase === 'success_revealed') && (
                <div className="relative z-10 flex items-center justify-center gap-2.5">
                  <div
                    className={`transition-all duration-500 ease-out flex items-center justify-center ${
                      submitPhase === 'checkmark_center' ? 'scale-110 translate-x-0' : 'scale-100'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center shadow-md animate-in zoom-in duration-300">
                      <Tick01Icon className="w-4 h-4 text-[#00E163] stroke-[3.5]" />
                    </div>
                  </div>

                  <div
                    className={`transition-all duration-500 ease-out ${
                      submitPhase === 'success_revealed'
                        ? 'opacity-100 blur-0 translate-x-0 max-w-[220px]'
                        : 'opacity-0 blur-sm -translate-x-3 max-w-0 overflow-hidden'
                    }`}
                  >
                    <span className="font-black text-black text-xs tracking-wider uppercase whitespace-nowrap">
                      Tiket Terkirim
                    </span>
                  </div>
                </div>
              )}
            </button>
          </form>
        </div>

        {/* RIGHT: ACTIVE & PAST TICKETS LIST (5 COLS) */}
        <div className="lg:col-span-5 p-6 md:p-7 rounded-3xl bg-[#1F1E25] border border-white/5 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <Clock01Icon className="w-5 h-5 text-[#00E163]" />
              <h2 className="text-base font-black text-white font-heading">Riwayat Tiket Bantuan</h2>
            </div>
            <span className="text-xs font-mono-num font-bold text-slate-400">{activeTickets.length} Tiket</span>
          </div>

          <div className="flex flex-col gap-3 max-h-[460px] overflow-y-auto custom-positions-scrollbar pr-1">
            {activeTickets.map((t) => (
              <div
                key={t.id}
                onClick={() => onOrderSuccess?.(`Membuka rincian percakapan tiket ${t.id}.`)}
                className="p-4 rounded-2xl bg-[#18171E] border border-white/5 hover:border-white/15 transition-all cursor-pointer flex flex-col gap-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black font-mono-num text-white group-hover:text-[#00E163] transition-colors">
                    {t.id}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
                      t.status === 'in_progress'
                        ? 'bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/30'
                        : t.status === 'open'
                        ? 'bg-[#3875F6]/15 text-[#3875F6] border border-[#3875F6]/30'
                        : 'bg-[#00E163]/15 text-[#00E163] border border-[#00E163]/30'
                    }`}
                  >
                    {t.status === 'in_progress' ? 'Sedang Ditangani' : t.status === 'open' ? 'Menunggu' : 'Selesai'}
                  </span>
                </div>

                <span className="text-xs font-bold text-slate-200 line-clamp-1">{t.subject}</span>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5">
                  <span>{t.category}</span>
                  <span>{t.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
