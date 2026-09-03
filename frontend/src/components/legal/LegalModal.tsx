'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Cancel01Icon,
  Shield01Icon,
  LockPasswordIcon,
  InformationCircleIcon,
  Alert02Icon,
  CheckmarkCircle01Icon,
} from 'hugeicons-react';

export type LegalDocType = 'terms' | 'privacy' | 'risk' | 'aml';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDoc?: LegalDocType;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialDoc = 'terms',
}) => {
  const [activeDoc, setActiveDoc] = useState<LegalDocType>(initialDoc);

  if (!isOpen || typeof document === 'undefined') return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[85vh] bg-[#18171C] border border-white/10 rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-1 bg-[#00E163] shadow-[0_0_32px_#00E163]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#00E163]/15 text-[#00E163] border border-[#00E163]/30">
              <Shield01Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">VeloceX Compliance & Legal Center</h3>
              <p className="text-xs text-slate-400">Pernyataan Hukum, Kepatuhan Regulasi & Perlindungan Investor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Cancel01Icon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 pb-2 border-b border-white/5 bg-[#1F1E25]/60 overflow-x-auto">
          {[
            { id: 'terms', label: 'Terms of Service' },
            { id: 'privacy', label: 'Privacy Policy' },
            { id: 'risk', label: 'Risk Warning Disclaimer' },
            { id: 'aml', label: 'AML & KYC Compliance' },
          ].map((tab) => {
            const isActive = activeDoc === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveDoc(tab.id as LegalDocType)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#00E163] text-black shadow-md shadow-[#00E163]/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Scrollable Document Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
          {activeDoc === 'terms' && (
            <div className="space-y-4">
              <h4 className="text-sm font-extrabold text-white">1. Ketentuan Penggunaan Layanan (Terms of Service)</h4>
              <p>
                Selamat datang di <b>VeloceX Trading Terminal</b>. Dengan mengakses, mendaftar, atau menggunakan platform kami, Anda menyatakan telah berusia sekurang-kurangnya 18 tahun dan setuju untuk terikat oleh syarat dan ketentuan ini.
              </p>
              <h5 className="font-bold text-white">2. Akun & Keamanan Pengguna</h5>
              <p>
                Pengguna bertanggung jawab penuh untuk menjaga kerahasiaan kata sandi dan kunci Two-Factor Authentication (2FA). VeloceX tidak bertanggung jawab atas kerugian yang diakibatkan oleh kelalaian keamanan di sisi pengguna.
              </p>
              <h5 className="font-bold text-white">3. Eksekusi Transaksi & Likuiditas Pasar</h5>
              <p>
                Semua pesanan yang dimasukkan ke dalam buku pesanan dieksekusi berdasarkan ketersediaan likuiditas harga secara instan. VeloceX menerapkan sistem penyelesaian (*settlement*) otomatis tanpa slippage tersembunyi.
              </p>
            </div>
          )}

          {activeDoc === 'privacy' && (
            <div className="space-y-4">
              <h4 className="text-sm font-extrabold text-white">Kebijakan Privasi Data Pengguna (Privacy Policy)</h4>
              <p>
                Privasi dan keamanan data identitas Anda adalah prioritas utama VeloceX. Dokumen ini menjelaskan bagaimana kami mengumpulkan, mengenkripsi, dan melindungi data pribadi Anda.
              </p>
              <h5 className="font-bold text-white">1. Data yang Dikumpulkan</h5>
              <p>
                Kami mengumpulkan alamat email, alamat dompet publik (untuk deposit/penarikan), dan riwayat log transaksi untuk tujuan kepatuhan audit keamanan.
              </p>
              <h5 className="font-bold text-white">2. Enkripsi Tingkat Militer</h5>
              <p>
                Semua data sensitif disimpan menggunakan enkripsi AES-256 dan protokol transmisi aman TLS 1.3. Kami tidak pernah membagikan atau menjual data pengguna kepada pihak ketiga tanpa izin hukum.
              </p>
            </div>
          )}

          {activeDoc === 'risk' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Alert02Icon className="w-5 h-5 shrink-0" />
                  <span>Peringatan Risiko Finansial Tingkat Tinggi</span>
                </div>
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  Perdagangan aset kripto, kontrak derivatif, forex, dan komoditas memiliki tingkat volatilitas yang sangat tinggi dan dapat mengakibatkan kerugian modal sebagian atau seluruhnya.
                </p>
              </div>
              <h5 className="font-bold text-white">Manajemen Risiko Pengguna</h5>
              <p>
                Pastikan Anda memahami sepenuhnya risiko yang terlibat sebelum melakukan transaksi dengan uang sungguhan. Selalu gunakan fitur pengaman seperti **Stop Loss** dan **Take Profit** untuk mengendalikan eksposur risiko portofolio Anda.
              </p>
            </div>
          )}

          {activeDoc === 'aml' && (
            <div className="space-y-4">
              <h4 className="text-sm font-extrabold text-white">Kebijakan Anti-Pencucian Uang & Pencegahan Pendanaan Ilegal (AML / KYC)</h4>
              <p>
                VeloceX menerapkan standar internasional kepatuhan **Anti-Money Laundering (AML)** dan **Counter-Terrorist Financing (CTF)**.
              </p>
              <h5 className="font-bold text-white">Pemantauan Transaksi On-Chain</h5>
              <p>
                Semua setoran dan penarikan dipantau secara otomatis untuk mendeteksi alamat yang masuk dalam daftar hitam (*Sanction Lists*) atau terkait dengan aktivitas ilegal on-chain.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-white/10 bg-[#1F1E25]/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#00E163] font-semibold">
            <CheckmarkCircle01Icon className="w-4 h-4" />
            <span>Versi Legal v2.4 • Berlaku 2026</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#00E163] hover:bg-[#00c957] text-black font-extrabold text-xs transition-all shadow-md shadow-[#00E163]/20"
          >
            Saya Mengerti & Setuju
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
