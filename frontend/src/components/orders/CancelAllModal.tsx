import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Cancel01Icon,
  AlertCircleIcon,
  Delete02Icon,
} from 'hugeicons-react';

interface CancelAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  openOrderCount: number;
  onConfirmCancelAll: (categoryFilter: 'all' | 'crypto' | 'forex' | 'cfd') => void;
}

export const CancelAllModal: React.FC<CancelAllModalProps> = ({
  isOpen,
  onClose,
  openOrderCount,
  onConfirmCancelAll,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'crypto' | 'forex' | 'cfd'>('all');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onConfirmCancelAll(selectedCategory);
      onClose();
    }, 600);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in font-sans">
      <div className="flex flex-col w-full max-w-md bg-[#1F1E25] border border-white/10 rounded-3xl p-6 shadow-2xl gap-5 select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#FF5C77]/15 text-[#FF5C77]">
              <Delete02Icon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-base font-heading">
                Cancel All Open Orders
              </span>
              <span className="text-xs text-slate-400">
                Batalkan seluruh antrean order yang sedang aktif di pasar
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <Cancel01Icon className="w-4 h-4" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#FF5C77]/10 border border-[#FF5C77]/30 text-xs text-[#FF5C77] leading-relaxed">
          <AlertCircleIcon className="w-5 h-5 shrink-0 mt-0.5" />
          <span>
            Tindakan ini akan membatalkan <strong>{openOrderCount} order aktif</strong> dan mengembalikan seluruh margin tertahan ke Spot / Futures Wallet Anda.
          </span>
        </div>

        {/* Category Scope Filter */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-400">Pilih Cakupan Pembatalan</span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'all', label: 'Semua Kategori' },
              { id: 'crypto', label: 'Hanya Kripto' },
              { id: 'forex', label: 'Hanya Forex' },
              { id: 'cfd', label: 'Hanya CFD' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#FF5C77]/15 border-[#FF5C77] text-white shadow-sm'
                    : 'bg-[#26252E] border-white/5 text-slate-400 hover:border-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl bg-[#26252E] hover:bg-white/10 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
          >
            Kembali
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing || openOrderCount === 0}
            className="group relative flex-1 flex items-center justify-center h-12 rounded-2xl bg-[#FF5C77] text-black font-extrabold text-xs overflow-hidden transition-all duration-300 hover:brightness-110 shadow-lg shadow-[#FF5C77]/25 cursor-pointer disabled:opacity-50"
          >
            <span className="absolute inset-0 bg-white/20 -translate-x-[120%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
            <span className="relative z-10 flex items-center gap-1.5">
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  <span>Membatalkan Order...</span>
                </>
              ) : (
                <>
                  <Delete02Icon className="w-4 h-4 stroke-[2.5]" />
                  <span>Konfirmasi Batalkan Semua</span>
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
