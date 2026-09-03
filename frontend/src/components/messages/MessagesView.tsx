'use client';

import React, { useState, useMemo } from 'react';
import {
  Search01Icon,
  FilterIcon,
  Calendar03Icon,
  Notification02Icon,
  Shield01Icon,
  TradeUpIcon,
  Wallet01Icon,
  Megaphone01Icon,
  GiftIcon,
  Message01Icon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  StarIcon,
  Delete02Icon,
  Mail01Icon,
  MailOpen01Icon,
  Settings02Icon,
  Tick01Icon,
  ArrowUp01Icon,
  ArrowDown01Icon,
  SentIcon,
  Attachment01Icon,
  SparklesIcon,
  Clock01Icon,
  Copy01Icon,
  UserIcon,
} from 'hugeicons-react';
import { MessageDetailModal, MessageRecord } from './MessageDetailModal';
import { NotificationSettingsModal, NotificationPreferences } from './NotificationSettingsModal';

// Initial Mock Dataset for Tier-1 Binance & Bybit Standard Messages & Alerts
const INITIAL_MESSAGES: MessageRecord[] = [
  // 1. Keamanan & Akun
  {
    id: 'MSG-SEC-901',
    category: 'security',
    title: 'Otorisasi Login Perangkat Baru Terdeteksi',
    summary: 'Login terdeteksi dari IP 182.253.140.22 (Jakarta, ID) menggunakan Chrome di Windows.',
    content: 'Akun Anda berhasil masuk dari perangkat Windows baru pada 03 Sep 2026 01:45:20 WIB.\n\nLokasi Perkiraan: Jakarta, Indonesia\nIP Address: 182.253.140.22\n\nJika ini bukan Anda, segera bekukan akun Anda dan ubah kata sandi serta kunci keamanan 2FA Anda.',
    timestamp: '10 menit yang lalu',
    isRead: false,
    isStarred: true,
    priority: 'high',
    referenceId: '182.253.140.22 (Windows/Chrome)',
    referenceType: 'ip',
    actionLabel: 'Amankan Akun',
    actionUrl: '#security',
  },
  {
    id: 'MSG-SEC-902',
    category: 'security',
    title: 'Kunci API Trading Spot Berhasil Dibuat',
    summary: 'API Key "VeloceX-Algo-Bot-01" dengan izin Read & Trade telah aktif.',
    content: 'Kunci API baru Anda "VeloceX-Algo-Bot-01" telah berhasil diaktifkan dengan batasan IP Whitelist. Izin penarikan (Withdrawal) dinonaktifkan secara otomatis demi keselamatan aset Anda.',
    timestamp: '2 jam yang lalu',
    isRead: true,
    isStarred: false,
    priority: 'medium',
    referenceId: 'ak_live_88f92a10bc39',
    referenceType: 'promo',
    actionLabel: 'Kelola API Key',
    actionUrl: '#api',
  },

  // 2. Trading & Order Alerts
  {
    id: 'MSG-TRD-801',
    category: 'trading',
    title: 'Order Filled: BUY 1.5 BTC @ $74,200 USDT',
    summary: 'Limit order BTC/USDT Anda telah terisi 100% pada harga rata-rata $74,200.00.',
    content: 'Detail Eksekusi Order:\nPasar: BTC/USDT Perpetual\nTipe: Limit Order (Maker)\nJumlah Terisi: 1.50000000 BTC\nHarga Rata-rata: $74,200.00 USDT\nTotal Nilai: $111,300.00 USDT\nBiaya Trading: 12.24 USDT (Diskon 25% Token VELX)',
    timestamp: '35 menit yang lalu',
    isRead: false,
    isStarred: true,
    priority: 'medium',
    referenceId: 'ORD-88219-BTC',
    referenceType: 'order',
    actionLabel: 'Lihat di Halaman Orders',
    actionUrl: '#orders',
  },
  {
    id: 'MSG-TRD-802',
    category: 'trading',
    title: 'Take Profit Tercapai: LONG SOL/USDT (+51.5% ROI)',
    summary: 'Target TP tercapai pada $149.00. Realisasi profit +$1,700.00 USDT.',
    content: 'Selamat! Posisi Long SOL/USDT Anda telah tertutup otomatis oleh Take Profit order.\n\nHarga Masuk: $132.00\nHarga Exit: $149.00\nLeverage: 15x\nRealisasi Laba Bersih: +$1,700.00 USDT (+51.5% ROI)',
    timestamp: '3 jam yang lalu',
    isRead: true,
    isStarred: true,
    priority: 'low',
    referenceId: 'POS-SOL-15X-TP',
    referenceType: 'order',
    actionLabel: 'Bagikan Poster PnL',
    actionUrl: '#orders',
  },
  {
    id: 'MSG-TRD-803',
    category: 'trading',
    title: 'Peringatan Margin: Posisi ETH/USDT Rasio Margin 68%',
    summary: 'Tingkat risiko margin posisi ETH mendekati batas waspada 80%. Pertimbangkan menambah margin.',
    content: 'Volatilitas pasar ETH meningkat pesat. Rasio margin posisi Short Anda saat ini berada di 68.4%.\n\nJika rasio margin mencapai 100%, sistem likuidasi bertahap akan dieksekusi secara otomatis. Anda disarankan untuk menambah margin atau memasang Stop Loss.',
    timestamp: 'Kemarin, 21:15',
    isRead: false,
    isStarred: false,
    priority: 'high',
    referenceId: 'POS-ETH-SHORT-10X',
    referenceType: 'order',
    actionLabel: 'Atur Margin Posisi',
    actionUrl: '#orders',
  },

  // 3. Deposit & Penarikan (Wallet)
  {
    id: 'MSG-WLT-701',
    category: 'wallet',
    title: 'Deposit Berhasil: +5,000.00 USDT (TRC-20)',
    summary: 'Setoran USDT Anda telah dikonfirmasi oleh 20 konfirmasi blockchain dan masuk ke Saldo Spot.',
    content: 'Setoran on-chain telah berhasil diterima dan dikreditkan ke dompet VeloceX Anda.\n\nAset: USDT (Tether USD)\nJaringan: TRC-20 (Tron Network)\nJumlah Bersih: 5,000.00 USDT\nStatus: 20/20 Konfirmasi Blockchain Selesai\nSaldo Tersedia: $45,820.50 USDT',
    timestamp: '1 jam yang lalu',
    isRead: false,
    isStarred: false,
    priority: 'medium',
    referenceId: '0x9a8f2c1b4e5d6a78...90cf',
    referenceType: 'txid',
    actionLabel: 'Buka Halaman Wallet',
    actionUrl: '#wallet',
  },
  {
    id: 'MSG-WLT-702',
    category: 'wallet',
    title: 'Penarikan Selesai: 0.50 BTC ke External Cold Wallet',
    summary: 'Penarikan BTC telah diproses ke jaringan Bitcoin on-chain.',
    content: 'Transaksi penarikan Bitcoin Anda telah divalidasi dan disiarkan ke mempool Bitcoin.\n\nJumlah: 0.50000000 BTC\nBiaya Jaringan: 0.00015 BTC\nAlamat Tujuan: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    timestamp: 'Kemarin, 16:40',
    isRead: true,
    isStarred: false,
    priority: 'low',
    referenceId: 'tx-btc-9884210a-33bf',
    referenceType: 'txid',
    actionLabel: 'Riwayat Transaksi',
    actionUrl: '#wallet',
  },

  // 4. Pengumuman Resmi & Listing
  {
    id: 'MSG-ANN-601',
    category: 'announcements',
    title: 'Listing Perdana: Pasangan Trading Baru SUI/USDT & TON/USDT',
    summary: 'VeloceX resmi membuka perdagangan spot & futures untuk SUI dan TON dengan leverage hingga 50x.',
    content: 'Pengguna yang terhormat,\n\nVeloceX dengan bangga mengumumkan pencatatan aset baru berikut:\n1. SUI / USDT (Spot & Perpetual Margin)\n2. TON / USDT (Spot & Perpetual Margin)\n\nJadwal Perdagangan: Mulai 03 September 2026, Pukul 15:00 WIB.\nBiaya Maker 0% selama 14 hari pertama!',
    timestamp: '4 jam yang lalu',
    isRead: true,
    isStarred: false,
    priority: 'medium',
    referenceId: 'ANN-2026-09-001',
    referenceType: 'promo',
    actionLabel: 'Mulai Trading',
    actionUrl: '#dashboard',
  },
  {
    id: 'MSG-ANN-602',
    category: 'announcements',
    title: 'Pemberitahuan Peningkatan Server Matching Engine (Zero Downtime)',
    summary: 'Peningkatan kecepatan matching engine ke latensi < 0.8ms pada 05 Sep 2026, 03:00 - 03:30 WIB.',
    content: 'Untuk meningkatkan kapasitas transaksi hingga 250,000 TPS, VeloceX akan melakukan hot-upgrade pada server matching engine.\n\nPerdagangan live dan WebSocket orderbook tidak akan terganggu (Zero Downtime).',
    timestamp: 'Kemarin, 10:00',
    isRead: true,
    isStarred: false,
    priority: 'low',
    referenceId: 'SYS-UPG-SEPT',
    referenceType: 'promo',
    actionLabel: 'Detail Upgrade',
    actionUrl: '#announcements',
  },

  // 5. Reward & Promosi
  {
    id: 'MSG-RWD-501',
    category: 'rewards',
    title: 'Voucher Cashback Trading Fee 50 USDT Diterima!',
    summary: 'Anda telah memenuhi syarat volume bulanan VIP Tier 1. Voucher telah dikreditkan ke Rewards Hub.',
    content: 'Selamat! Sebagai apresiasi atas aktivitas trading Anda di VeloceX, Anda mendapatkan:\n\nVoucher: 50 USDT Fee Rebate Voucher\nMasa Berlaku: 30 Hari\nCara Pakai: Biaya trading Anda berikutnya akan otomatis dipotong dari saldo voucher ini.',
    timestamp: '5 jam yang lalu',
    isRead: false,
    isStarred: true,
    priority: 'low',
    referenceId: 'VCH-CASHBACK-50U',
    referenceType: 'promo',
    actionLabel: 'Klaim di Rewards Hub',
    actionUrl: '#wallet',
  },
  {
    id: 'MSG-RWD-502',
    category: 'rewards',
    title: 'Bunga Simple Earn Harian Masuk: +8.42 USDT',
    summary: 'Hasil staking harian produk USDT Flexible Staking (12.5% APY) telah dikreditkan ke Saldo Spot Anda.',
    content: 'Imbal hasil harian program Simple Earn Anda telah berhasil dihitung dan ditransfer.\n\nProduk: USDT Flexible Earn\nSuku Bunga: 12.5% APY\nHasil Hari Ini: +8.423000 USDT\nAuto-Compound: Aktif',
    timestamp: 'Hari ini, 07:00',
    isRead: true,
    isStarred: false,
    priority: 'low',
    referenceId: 'EARN-DIST-8821',
    referenceType: 'promo',
    actionLabel: 'Cek Simple Earn',
    actionUrl: '#wallet',
  },
];

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  time: string;
}

const INITIAL_CHAT_HISTORY: ChatMessage[] = [
  {
    id: 'c1',
    sender: 'agent',
    text: 'Halo! Selamat datang di Layanan Dukungan VIP 24/7 VeloceX. Saya Sarah, spesialis akun Anda. Ada yang bisa saya bantu terkait transaksi, deposit, atau fitur trading hari ini?',
    time: '01:40',
  },
];

interface MessagesViewProps {
  onOrderSuccess?: (msg: string) => void;
}

export const MessagesView: React.FC<MessagesViewProps> = ({ onOrderSuccess }) => {
  // Messages State
  const [messages, setMessages] = useState<MessageRecord[]>(INITIAL_MESSAGES);
  const [activeTab, setActiveTab] = useState<
    'all' | 'security' | 'trading' | 'wallet' | 'announcements' | 'rewards' | 'support_chat'
  >('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'unread' | 'starred'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState<'all' | '24h' | '7d' | '30d'>('all');
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);

  // Multi-select Checkboxes
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);

  // Modals State
  const [selectedMessage, setSelectedMessage] = useState<MessageRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Live Support Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_HISTORY);
  const [inputChatText, setInputChatText] = useState('');
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const chatBottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (activeTab === 'support_chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isAgentTyping, activeTab]);

  const showToast = (msg: string) => {
    onOrderSuccess?.(msg);
  };

  // Filtered dataset
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      // Category Tab Filter
      if (activeTab !== 'all' && activeTab !== 'support_chat' && msg.category !== activeTab) {
        return false;
      }

      // Status Pill Filter
      if (selectedStatusFilter === 'unread' && msg.isRead) return false;
      if (selectedStatusFilter === 'starred' && !msg.isStarred) return false;

      // Search Query
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase();
        const matchTitle = msg.title.toLowerCase().includes(query);
        const matchSummary = msg.summary.toLowerCase().includes(query);
        const matchRef = msg.referenceId?.toLowerCase().includes(query) ?? false;
        if (!matchTitle && !matchSummary && !matchRef) return false;
      }

      return true;
    });
  }, [messages, activeTab, selectedStatusFilter, searchQuery]);

  // Metric Computations
  const unreadCount = useMemo(() => messages.filter((m) => !m.isRead).length, [messages]);
  const securityAlertsCount = useMemo(
    () => messages.filter((m) => m.category === 'security' && m.priority === 'high').length,
    [messages]
  );
  const tradingAlerts24h = useMemo(
    () => messages.filter((m) => m.category === 'trading').length,
    [messages]
  );

  // Handlers
  const handleMarkAsRead = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isRead: true } : m))
    );
  };

  const handleToggleStar = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isStarred: !m.isStarred } : m))
    );
    showToast('Status tanda bintang pesan diperbarui');
  };

  const handleDeleteSingle = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setMessages((prev) => prev.filter((m) => m.id !== id));
    setSelectedMessageIds((prev) => prev.filter((item) => item !== id));
    showToast('Pesan berhasil dihapus');
  };

  const handleMarkAllRead = () => {
    setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
    showToast('Semua pesan ditandai telah dibaca');
  };

  const handleBatchMarkRead = () => {
    if (selectedMessageIds.length === 0) return;
    setMessages((prev) =>
      prev.map((m) => (selectedMessageIds.includes(m.id) ? { ...m, isRead: true } : m))
    );
    showToast(`${selectedMessageIds.length} pesan ditandai dibaca`);
    setSelectedMessageIds([]);
  };

  const handleBatchDelete = () => {
    if (selectedMessageIds.length === 0) return;
    setMessages((prev) => prev.filter((m) => !selectedMessageIds.includes(m.id)));
    showToast(`${selectedMessageIds.length} pesan berhasil dihapus`);
    setSelectedMessageIds([]);
  };

  const handleSelectAll = () => {
    if (selectedMessageIds.length === filteredMessages.length) {
      setSelectedMessageIds([]);
    } else {
      setSelectedMessageIds(filteredMessages.map((m) => m.id));
    }
  };

  const handleToggleCheckbox = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMessageIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenDetail = (msg: MessageRecord) => {
    handleMarkAsRead(msg.id);
    setSelectedMessage(msg);
    setIsDetailModalOpen(true);
  };

  // Live Support Chat Action powered by Gemini AI
  const handleSendChat = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = inputChatText.trim();
    if (!text) return;

    const newMsg: ChatMessage = {
      id: `c_${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setInputChatText('');
    setIsAgentTyping(true);

    try {
      const res = await fetch('/api/support/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          messages: [...chatMessages, newMsg].map((m) => ({
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const replyText =
          data.reply ||
          'Mohon maaf, saya sedang menganalisis data pasar. Silakan coba sesaat lagi.';

        setChatMessages((prev) => [
          ...prev,
          {
            id: `c_agent_${Date.now()}`,
            sender: 'agent',
            text: replyText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        throw new Error('Gagal menghubungi AI Server');
      }
    } catch (err) {
      console.error('Support chat error:', err);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `c_agent_${Date.now()}`,
          sender: 'agent',
          text:
            'Halo! Terjadi kendala saat menyinkronkan dengan Gemini AI. Sebagai pedoman rasional trading:\n• Selalu gunakan Risk-to-Reward Ratio terukur (1:2)\n• Batasi eksposur risiko modal per trade maksimal 2-5%\n• Pasang Stop Loss sebelum konfirmasi entri order.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsAgentTyping(false);
    }
  };

  const handleSendQuickPrompt = (promptText: string) => {
    setInputChatText(promptText);
  };

  const TABS_CONFIG = [
    { id: 'all', label: 'Semua Pesan', icon: Notification02Icon, count: unreadCount },
    { id: 'security', label: 'Keamanan & Akun', icon: Shield01Icon, count: securityAlertsCount },
    { id: 'trading', label: 'Trading & Orders', icon: TradeUpIcon, count: 0 },
    { id: 'wallet', label: 'Deposit & Penarikan', icon: Wallet01Icon, count: 0 },
    { id: 'announcements', label: 'Pengumuman & Listing', icon: Megaphone01Icon, count: 0 },
    { id: 'rewards', label: 'Reward & Promosi', icon: GiftIcon, count: 0 },
    { id: 'support_chat', label: 'Live Support 24/7', icon: Message01Icon, count: 0 },
  ];

  return (
    <main className="flex flex-col flex-1 p-3 sm:p-5 md:p-6 pb-24 md:pb-6 space-y-6 max-w-7xl mx-auto w-full font-sans select-none animate-fade-in text-slate-100">
      {/* TAB NAVIGATION BAR (3x2 Grid on Left + 1 Full-Height Live Support Card on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Left Side: 3x2 Grid (6 Main Notification Tabs) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:col-span-3 gap-2.5">
          {TABS_CONFIG.slice(0, 6).map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`group relative flex items-center justify-between px-3.5 h-12 rounded-2xl text-xs font-bold transition-all duration-1000 overflow-hidden cursor-pointer ${
                  isActive
                    ? 'bg-[#00E163] text-black shadow-md font-extrabold'
                    : 'bg-[#1F1E25] text-slate-300 hover:text-black border border-white/5'
                }`}
              >
                {!isActive && (
                  <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                )}
                <span className="relative z-10 flex items-center gap-2 transition-colors duration-500 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-black' : 'text-slate-400 group-hover:text-black'}`} />
                  <span className="truncate">{tab.label}</span>
                </span>
                {tab.count > 0 && (
                  <span
                    className={`relative z-10 px-2 py-0.5 rounded-full text-[10px] font-mono-num font-extrabold shrink-0 ${
                      isActive ? 'bg-black text-[#00E163]' : 'bg-[#00E163] text-black'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right Side: 7th Tab (Live Support 24/7) Spanning Both Rows */}
        <div className="lg:col-span-1 flex">
          {(() => {
            const liveTab = TABS_CONFIG[6];
            const Icon = liveTab.icon;
            const isActive = activeTab === 'support_chat';

            return (
              <button
                type="button"
                onClick={() => setActiveTab('support_chat')}
                className={`group relative flex flex-col items-center justify-center p-3.5 rounded-2xl w-full h-full min-h-[52px] lg:min-h-full transition-all duration-1000 overflow-hidden cursor-pointer gap-1.5 text-center ${
                  isActive
                    ? 'bg-[#00E163] text-black shadow-md font-extrabold'
                    : 'bg-[#1F1E25] text-slate-300 hover:text-black border border-white/5'
                }`}
              >
                {!isActive && (
                  <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                )}
                <div className="relative z-10 flex items-center gap-2">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-black' : 'text-pink-400 group-hover:text-black'}`} />
                  <span className="text-xs font-black font-heading">{liveTab.label}</span>
                </div>
                <div className="relative z-10 flex items-center justify-center text-[10px]">
                  <span className={`${isActive ? 'text-black font-bold' : 'text-[#00E163] group-hover:text-black font-bold'} transition-colors duration-500`}>
                    VIP Agent Online
                  </span>
                </div>
              </button>
            );
          })()}
        </div>
      </div>

      {/* 3. CONTROLS, SEARCH, BATCH ACTIONS & NOTIFICATION SETTINGS */}
      {activeTab !== 'support_chat' && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-3xl bg-[#1F1E25] border border-white/5 shadow-xl">
          {/* Left: Quick Status Filters (Semua, Belum Dibaca, Berbintang) */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'Semua Pesan' },
              { id: 'unread', label: 'Belum Dibaca' },
              { id: 'starred', label: 'Berbintang / Penting' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setSelectedStatusFilter(st.id as any)}
                className={`group relative px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-1000 overflow-hidden cursor-pointer ${
                  selectedStatusFilter === st.id
                    ? 'bg-[#00E163] text-black shadow-sm font-extrabold'
                    : 'bg-[#26252E] text-slate-300 hover:text-black border border-white/5'
                }`}
              >
                {selectedStatusFilter !== st.id && (
                  <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                )}
                <span className="relative z-10 transition-colors duration-500">{st.label}</span>
              </button>
            ))}

            {/* Batch Operation Buttons when items are selected */}
            {selectedMessageIds.length > 0 && (
              <div className="flex items-center gap-2 pl-2 border-l border-white/10">
                <button
                  type="button"
                  onClick={handleBatchMarkRead}
                  className="group relative flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#26252E] hover:bg-[#00E163] text-slate-200 hover:text-black border border-white/5 text-xs font-bold transition-all duration-1000 overflow-hidden cursor-pointer"
                >
                  <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                  <span className="relative z-10 flex items-center gap-1">
                    <MailOpen01Icon className="w-3.5 h-3.5" />
                    <span>Tandai Dibaca ({selectedMessageIds.length})</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleBatchDelete}
                  className="group relative flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#26252E] hover:bg-[#FF5C77] text-slate-200 hover:text-black border border-white/5 text-xs font-bold transition-all duration-1000 overflow-hidden cursor-pointer"
                >
                  <span className="absolute inset-0 bg-[#FF5C77] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                  <span className="relative z-10 flex items-center gap-1">
                    <Delete02Icon className="w-3.5 h-3.5" />
                    <span>Hapus ({selectedMessageIds.length})</span>
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Right: Search Box, Mark All Read & Notification Settings */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex items-center h-10 px-3 rounded-xl bg-[#26252E] border border-white/5 text-xs text-white">
              <Search01Icon className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search judul, ID, TxID..."
                className="bg-transparent placeholder:text-slate-500 focus:outline-none w-36 sm:w-48 text-xs font-sans text-white"
              />
            </div>

            {/* Mark All Read Button */}
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="group relative flex items-center gap-1.5 px-3.5 h-10 rounded-xl bg-[#26252E] hover:bg-[#00E163] text-slate-300 hover:text-black border border-white/5 text-xs font-bold transition-all duration-1000 overflow-hidden cursor-pointer"
              title="Tandai Semua Sudah Dibaca"
            >
              <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
              <span className="relative z-10 flex items-center gap-1.5 transition-colors duration-500">
                <CheckmarkCircle01Icon className="w-4 h-4" />
                <span>Tandai Semua Dibaca</span>
              </span>
            </button>

            {/* Settings Button */}
            <button
              type="button"
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-2.5 h-10 rounded-xl bg-[#26252E] hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-colors cursor-pointer"
              title="Pengaturan Notifikasi"
            >
              <Settings02Icon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 4. MAIN CONTENT CONTAINER (FEED & INTERNAL SCROLL) */}
      {activeTab !== 'support_chat' ? (
        <div className="flex flex-col p-6 rounded-3xl bg-[#1F1E25] border border-white/10 shadow-2xl gap-4">
          {/* Header Row with Select All Checkbox */}
          <div className="flex items-center justify-between pb-3 border-b border-white/5 text-xs text-slate-400 font-bold">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSelectAll}
                className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                  filteredMessages.length > 0 && selectedMessageIds.length === filteredMessages.length
                    ? 'bg-[#00E163] border-[#00E163] text-black'
                    : 'border-white/20 bg-transparent hover:border-white/40'
                }`}
                title="Pilih Semua Pesan"
              >
                {filteredMessages.length > 0 && selectedMessageIds.length === filteredMessages.length && (
                  <Tick01Icon className="w-3 h-3 stroke-[3] text-black" />
                )}
              </button>
              <span>Daftar Pemberitahuan ({filteredMessages.length})</span>
            </div>

            <span className="text-[11px] text-slate-500 font-mono-num">
              Auto-sync Realtime
            </span>
          </div>

          {/* Internal Box Scrollable Messages List (Max ~4-5 messages visible, matching Wallet style) */}
          <div className="max-h-[380px] overflow-y-auto custom-positions-scrollbar flex flex-col gap-2.5 pr-1">
            {filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3 font-sans text-xs">
                <Notification02Icon className="w-10 h-10 text-slate-600 opacity-40" />
                <span>Tidak ada pesan atau notifikasi di kategori ini.</span>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedMessageIds.includes(msg.id);

                return (
                  <div
                    key={msg.id}
                    onClick={() => handleOpenDetail(msg)}
                    className={`group relative flex items-start justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                      msg.isRead
                        ? 'bg-[#26252E]/40 border-white/5 hover:bg-[#26252E] hover:border-white/10'
                        : 'bg-[#26252E] border-white/10 hover:border-[#00E163]/40 shadow-sm'
                    }`}
                  >
                    {/* Left: Checkbox + Icon + Content */}
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      {/* Select Checkbox */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleCheckbox(msg.id, e)}
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all cursor-pointer shrink-0 mt-1 ${
                          isSelected
                            ? 'bg-[#00E163] border-[#00E163] text-black'
                            : 'border-white/20 bg-transparent hover:border-white/40'
                        }`}
                      >
                        {isSelected && <Tick01Icon className="w-3 h-3 stroke-[3] text-black" />}
                      </button>

                      {/* Category Icon */}
                      <div className="p-2.5 rounded-xl bg-[#18171E] border border-white/5 shrink-0">
                        {msg.category === 'security' ? (
                          <Shield01Icon className="w-4 h-4 text-amber-400" />
                        ) : msg.category === 'trading' ? (
                          <TradeUpIcon className="w-4 h-4 text-[#00E163]" />
                        ) : msg.category === 'wallet' ? (
                          <Wallet01Icon className="w-4 h-4 text-cyan-400" />
                        ) : msg.category === 'announcements' ? (
                          <Megaphone01Icon className="w-4 h-4 text-indigo-400" />
                        ) : (
                          <GiftIcon className="w-4 h-4 text-pink-400" />
                        )}
                      </div>

                      {/* Message Text Snippet */}
                      <div className="flex flex-col min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-extrabold truncate ${
                              msg.isRead ? 'text-slate-300 font-sans' : 'text-white font-heading font-black'
                            }`}
                          >
                            {msg.title}
                          </span>
                          {msg.priority === 'high' && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-[#FF5C77]/15 text-[#FF5C77] uppercase shrink-0">
                              Urgent
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 font-sans">
                          {msg.summary}
                        </p>
                      </div>
                    </div>

                    {/* Right: Timestamp & Action Controls */}
                    <div className="flex items-center gap-3 shrink-0 self-center">
                      <span className="text-[11px] text-slate-500 font-mono-num whitespace-nowrap hidden sm:inline-block">
                        {msg.timestamp}
                      </span>

                      {/* Star Button */}
                      <button
                        type="button"
                        onClick={(e) => handleToggleStar(msg.id, e)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          msg.isStarred
                            ? 'text-amber-400'
                            : 'text-slate-500 hover:text-amber-400 bg-white/5 hover:bg-white/10'
                        }`}
                        title={msg.isStarred ? 'Hapus Bintang' : 'Beri Bintang'}
                      >
                        <StarIcon className={`w-4 h-4 ${msg.isStarred ? 'fill-amber-400' : ''}`} />
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteSingle(msg.id, e)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-[#FF5C77]/20 text-slate-500 hover:text-[#FF5C77] transition-colors cursor-pointer"
                        title="Hapus Notifikasi"
                      >
                        <Delete02Icon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* 5. TAB 7: LIVE SUPPORT 24/7 INTERACTIVE CHAT PANEL */
        <div className="flex flex-col h-[560px] rounded-3xl bg-[#1F1E25] border border-white/10 shadow-2xl overflow-hidden">
          {/* Chat Agent Header */}
          <div className="flex items-center justify-between p-4 bg-[#26252E] border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-[#18171E] border border-white/10 flex items-center justify-center font-extrabold text-sm text-[#00E163]">
                  SX
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#00E163] border-2 border-[#26252E]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-white font-heading">Sarah • VIP Support Specialist</span>
                <span className="text-[10px] text-[#00E163] font-bold">Online • Respon Cepat 24 Jam</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-[#00E163]/15 text-[#00E163] text-[10px] font-extrabold">
                Tier-1 Encrypted
              </span>
            </div>
          </div>

          {/* Quick FAQ / Prompt Chips */}
          <div className="flex items-center gap-2 p-3 bg-[#18171E] border-b border-white/5 overflow-x-auto custom-positions-scrollbar">
            <span className="text-[10px] text-slate-400 font-bold shrink-0">Bantuan Cepat:</span>
            {[
              'Berapa lama deposit TRC-20 masuk?',
              'Bagaimana cara verifikasi KYC?',
              'Berapa diskon fee token VELX?',
              'Cara menghubungkan API Key?',
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleSendQuickPrompt(chip)}
                className="px-3 py-1 rounded-xl bg-[#26252E] hover:bg-[#00E163] text-slate-300 hover:text-black text-[10px] font-bold transition-colors shrink-0 border border-white/5 cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Chat Bubbles Scroll Area */}
          <div className="flex-1 p-5 overflow-y-auto custom-positions-scrollbar space-y-4 bg-[#18171E]">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#00E163] text-black font-semibold rounded-br-none shadow-md'
                      : 'bg-[#26252E] text-slate-200 border border-white/5 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 font-mono-num">{msg.time}</span>
              </div>
            ))}

            {/* Agent Typing Indicator */}
            {isAgentTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
                <span className="w-2 h-2 rounded-full bg-[#00E163] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#00E163] animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-[#00E163] animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px]">Sarah sedang mengetik jawaban...</span>
              </div>
            )}

            {/* Auto-scroll Anchor */}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendChat} className="p-3.5 bg-[#26252E] border-t border-white/5 flex items-center gap-3">
            <div className="relative flex items-center flex-1 h-11 px-3.5 rounded-xl bg-[#18171E] border border-white/5 text-xs text-white">
              <input
                type="text"
                value={inputChatText}
                onChange={(e) => setInputChatText(e.target.value)}
                placeholder="Tulis pertanyaan Anda ke Tim VIP Support..."
                className="bg-transparent placeholder:text-slate-500 focus:outline-none w-full text-xs font-sans text-white"
              />
            </div>

            <button
              type="submit"
              disabled={!inputChatText.trim()}
              className="group relative flex items-center justify-center px-4 h-11 rounded-xl bg-[#00E163] disabled:bg-slate-700 text-black font-extrabold text-xs shadow-md overflow-hidden cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                <SentIcon className="w-4 h-4" />
                <span>Kirim</span>
              </span>
            </button>
          </form>
        </div>
      )}

      {/* ALL MODALS */}
      <MessageDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        message={selectedMessage}
        onDeleteMessage={handleDeleteSingle}
        onNavigateAction={(url) => {
          showToast(`Navigasi ke ${url}`);
        }}
      />

      <NotificationSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSavePreferences={() => {
          showToast('Preferensi notifikasi berhasil disimpan!');
        }}
      />
    </main>
  );
};
