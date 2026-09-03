'use client';

import React, { useState, useMemo } from 'react';
import {
  HelpCircleIcon,
  Search01Icon,
  BookOpen01Icon,
  Layers01Icon,
  Shield01Icon,
  TradeUpIcon,
  Coins01Icon,
  SparklesIcon,
  ArrowRight01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  CheckmarkCircle01Icon,
  Tick01Icon,
} from 'hugeicons-react';

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

interface TutorialCourse {
  id: string;
  title: string;
  level: 'Pemula' | 'Menengah' | 'Tingkat Lanjut';
  readTime: string;
  description: string;
  icon: any;
}

const FAQ_LIST: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'trading',
    question: 'Bagaimana cara membuka posisi Lightning Trade 5 detik?',
    answer: 'Pilih tab Lightning Trade di menu navigasi, tentukan durasi kontrak (5s hingga 60s), masukkan jumlah saldo USDT yang ingin dialokasikan, dan klik Naik (Call) atau Turun (Put). Mesin pencocokan VeloceX akan mengeksekusi order dalam waktu kurang dari 5 milidetik.',
  },
  {
    id: 'faq-2',
    category: 'wallet',
    question: 'Berapa lama proses deposit dan penarikan saldo?',
    answer: 'Deposit kripto (USDT TRC20, SOL, BEP20) diproses otomatis secara instan setelah 1 konfirmasi blockchain (~30 detik). Penarikan dana diproses otomatis 24/7 tanpa penundaan manual.',
  },
  {
    id: 'faq-3',
    category: 'security',
    question: 'Bagaimana cara mengaktifkan Google Authenticator 2FA?',
    answer: 'Buka menu Pengaturan -> Keamanan & 2FA, aktifkan tombol switch Google Authenticator, pindai kode QR menggunakan aplikasi Google Authenticator atau Authy, lalu masukkan 6 digit token untuk konfirmasi.',
  },
  {
    id: 'faq-4',
    category: 'trading',
    question: 'Apa itu fitur Konversi Saldo Debu (Dust Balances)?',
    answer: 'Fitur konversi saldo debu memungkinkan Anda menukarkan seluruh sisa saldo kecil (< $50) dari berbagai aset kripto/forex menjadi USDT cair dalam 1 klik tanpa dikenakan biaya transaksi.',
  },
  {
    id: 'faq-5',
    category: 'fees',
    question: 'Berapa struktur biaya trading (Maker / Taker) di VeloceX?',
    answer: 'Biaya standar Spot VeloceX adalah 0.02% Maker dan 0.04% Taker. Pengguna VIP 2 ke atas mendapatkan diskon hingga 50% serta rebate volume bulanan.',
  },
];

const TUTORIAL_COURSES: TutorialCourse[] = [
  {
    id: 'course-1',
    title: 'Dasar Analisis Teknikal & Candlestick',
    level: 'Pemula',
    readTime: '6 Menit',
    description: 'Pelajari pola candlestick dasar (Pin Bar, Engulfing, Doji) dan cara membaca tren harga.',
    icon: BookOpen01Icon,
  },
  {
    id: 'course-2',
    title: 'Manajemen Risiko & Position Sizing',
    level: 'Pemula',
    readTime: '8 Menit',
    description: 'Kuasai aturan rasio Risk/Reward 1:2 dan cara menghitung stop loss proporsional.',
    icon: Shield01Icon,
  },
  {
    id: 'course-3',
    title: 'Strategi Lightning Scalp Frekuensi Tinggi',
    level: 'Menengah',
    readTime: '10 Menit',
    description: 'Panduan membaca mikro-momentum order flow dan likuiditas buku pesanan 5 detik.',
    icon: TradeUpIcon,
  },
  {
    id: 'course-4',
    title: 'Automasi Bot Grid Trading & DCA',
    level: 'Tingkat Lanjut',
    readTime: '12 Menit',
    description: 'Cara menyusun jaring order otomatis untuk menghasilkan profit stabil di pasar sideways.',
    icon: SparklesIcon,
  },
];

interface HelpViewProps {
  onOrderSuccess?: (msg: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const HelpView: React.FC<HelpViewProps> = ({ onOrderSuccess, onNavigateTab }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-1');

  const filteredFaqs = useMemo(() => {
    return FAQ_LIST.filter((f) => {
      const matchSearch = f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.answer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'all' || f.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1600px] mx-auto w-full font-sans animate-fade-in text-slate-100">
      {/* 1. EXECUTIVE HELP HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#18171E] via-[#1F1E25] to-[#18171E] border border-white/5 p-6 md:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-2xl">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-xl bg-[#00E163]/10 border border-[#00E163]/30 text-[#00E163] text-[10px] font-black uppercase tracking-wider">
              VeloceX Academy &amp; Knowledge Base
            </span>
            <span className="text-xs font-bold text-slate-400">Pusat Dokumentasi Terpadu</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white font-heading tracking-tight">
            Pusat Bantuan &amp; Panduan Akademi
          </h1>

          <p className="text-xs text-slate-400 max-w-xl">
            Temukan jawaban instan seputar eksekusi trading, manajemen akun, keamanan 2FA, dan tutorial strategi.
          </p>
        </div>

        {/* Search Bar in Header */}
        <div className="relative flex items-center h-12 px-4 rounded-2xl bg-[#14131A] border border-white/10 focus-within:border-[#00E163]/50 transition-colors w-full lg:w-80 shadow-inner">
          <Search01Icon className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari topik bantuan..."
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* 2. ACADEMY COURSES GRID */}
      <div className="p-6 md:p-7 rounded-3xl bg-[#1F1E25] border border-white/5 shadow-xl flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookOpen01Icon className="w-5 h-5 text-[#00E163]" />
            <h2 className="text-base font-black text-white font-heading">Kursus &amp; Panduan Trading Akademi</h2>
          </div>
          <span className="text-xs text-slate-400">Gratis untuk seluruh trader VeloceX</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TUTORIAL_COURSES.map((course) => {
            const Icon = course.icon;
            return (
              <div
                key={course.id}
                onClick={() => onOrderSuccess?.(`Membuka modul pembelajaran: ${course.title}.`)}
                className="p-5 rounded-3xl bg-[#18171E] border border-white/5 hover:border-[#00E163]/40 transition-all cursor-pointer flex flex-col justify-between gap-4 shadow-lg group"
              >
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-[#00E163]/10 border border-[#00E163]/30 flex items-center justify-center text-[#00E163] group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-lg bg-white/5 text-slate-300 text-[10px] font-extrabold font-mono-num">
                      {course.readTime}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span
                      className={`text-[10px] font-black uppercase ${
                        course.level === 'Pemula'
                          ? 'text-[#00E163]'
                          : course.level === 'Menengah'
                          ? 'text-[#FFB800]'
                          : 'text-[#A855F7]'
                      }`}
                    >
                      {course.level}
                    </span>
                    <h3 className="font-extrabold text-white text-sm group-hover:text-[#00E163] transition-colors leading-snug">
                      {course.title}
                    </h3>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs font-bold text-slate-400 group-hover:text-white transition-colors">
                  <span>Mulai Belajar</span>
                  <ArrowRight01Icon className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. FAQ ACCORDION & FEE SCHEDULE GRID (7 COLS / 5 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT: FAQ ACCORDION (7 COLS) */}
        <div className="lg:col-span-7 p-6 md:p-7 rounded-3xl bg-[#1F1E25] border border-white/5 shadow-xl flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <HelpCircleIcon className="w-5 h-5 text-[#00E163]" />
              <h2 className="text-base font-black text-white font-heading">Pertanyaan yang Sering Diajukan (FAQ)</h2>
            </div>
          </div>

          {/* Category Filter Pills with 1000ms Sweep */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'trading', label: 'Trading' },
              { id: 'wallet', label: 'Deposit/Tarik' },
              { id: 'security', label: 'Keamanan' },
              { id: 'fees', label: 'Biaya Fee' },
            ].map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`group relative flex items-center justify-center px-3.5 h-8 rounded-xl text-xs font-bold transition-all duration-1000 overflow-hidden cursor-pointer select-none ${
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

          {/* FAQ Accordion List */}
          <div className="flex flex-col gap-3">
            {filteredFaqs.map((faq) => {
              const isExpanded = expandedFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl bg-[#18171E] border border-white/5 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                    className="w-full p-4 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-white/[0.02]"
                  >
                    <span className="font-extrabold text-white text-xs leading-relaxed">{faq.question}</span>
                    {isExpanded ? (
                      <ArrowUp01Icon className="w-4 h-4 text-[#00E163] shrink-0" />
                    ) : (
                      <ArrowDown01Icon className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-white/5 pt-3 animate-fade-in">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: VIP FEE TIER SCHEDULE (5 COLS) */}
        <div className="lg:col-span-5 p-6 md:p-7 rounded-3xl bg-[#1F1E25] border border-white/5 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2">
              <Layers01Icon className="w-5 h-5 text-[#00E163]" />
              <h2 className="text-base font-black text-white font-heading">Struktur Biaya Tier VIP</h2>
            </div>
            <span className="text-[10px] font-bold text-slate-400">Maker / Taker</span>
          </div>

          <div className="flex flex-col divide-y divide-white/5 text-xs font-mono-num">
            {[
              { tier: 'VIP 0', vol: '< $50,000', maker: '0.020%', taker: '0.040%' },
              { tier: 'VIP 1', vol: '≥ $50,000', maker: '0.018%', taker: '0.036%' },
              { tier: 'VIP 2 (Akun Anda)', vol: '≥ $250,000', maker: '0.014%', taker: '0.030%', isCurrent: true },
              { tier: 'VIP 3', vol: '≥ $1,000,000', maker: '0.010%', taker: '0.024%' },
              { tier: 'VIP 4', vol: '≥ $5,000,000', maker: '0.006%', taker: '0.018%' },
              { tier: 'VIP 5', vol: '≥ $20,000,000', maker: '0.000%', taker: '0.012%' },
            ].map((t) => (
              <div
                key={t.tier}
                className={`py-3 px-3 rounded-xl flex items-center justify-between ${
                  t.isCurrent ? 'bg-[#00E163]/10 border border-[#00E163]/30 font-bold' : ''
                }`}
              >
                <div className="flex flex-col">
                  <span className={`font-extrabold ${t.isCurrent ? 'text-[#00E163]' : 'text-white'}`}>{t.tier}</span>
                  <span className="text-[10px] text-slate-500">{t.vol}</span>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500">Maker</span>
                    <span className="text-slate-200">{t.maker}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500">Taker</span>
                    <span className="text-slate-200">{t.taker}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
