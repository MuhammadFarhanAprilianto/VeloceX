'use client';

import React from 'react';
import {
  Cancel01Icon,
  Clock01Icon,
  Shield01Icon,
  TradeUpIcon,
  Wallet01Icon,
  Megaphone01Icon,
  GiftIcon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  Copy01Icon,
  Tick01Icon,
} from 'hugeicons-react';

export interface MessageRecord {
  id: string;
  category: 'security' | 'trading' | 'wallet' | 'announcements' | 'rewards' | 'system';
  title: string;
  summary: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  priority: 'high' | 'medium' | 'low';
  referenceId?: string;
  referenceType?: 'order' | 'txid' | 'ip' | 'promo';
  actionUrl?: string;
  actionLabel?: string;
}

interface MessageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: MessageRecord | null;
  onToggleStar?: (id: string) => void;
  onDeleteMessage?: (id: string) => void;
  onNavigateAction?: (url: string) => void;
}

export const MessageDetailModal: React.FC<MessageDetailModalProps> = ({
  isOpen,
  onClose,
  message,
  onDeleteMessage,
  onNavigateAction,
}) => {
  const [isCopied, setIsCopied] = React.useState(false);

  if (!isOpen || !message) return null;

  const handleCopyRef = () => {
    if (message.referenceId) {
      navigator.clipboard.writeText(message.referenceId);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const getCategoryIcon = () => {
    switch (message.category) {
      case 'security':
        return <Shield01Icon className="w-5 h-5 text-amber-400" />;
      case 'trading':
        return <TradeUpIcon className="w-5 h-5 text-[#00E163]" />;
      case 'wallet':
        return <Wallet01Icon className="w-5 h-5 text-cyan-400" />;
      case 'announcements':
        return <Megaphone01Icon className="w-5 h-5 text-indigo-400" />;
      case 'rewards':
        return <GiftIcon className="w-5 h-5 text-pink-400" />;
      default:
        return <CheckmarkCircle01Icon className="w-5 h-5 text-[#00E163]" />;
    }
  };

  const getCategoryBadge = () => {
    switch (message.category) {
      case 'security':
        return 'bg-amber-400/15 text-amber-400 border-amber-400/20';
      case 'trading':
        return 'bg-[#00E163]/15 text-[#00E163] border-[#00E163]/20';
      case 'wallet':
        return 'bg-cyan-400/15 text-cyan-400 border-cyan-400/20';
      case 'announcements':
        return 'bg-indigo-400/15 text-indigo-400 border-indigo-400/20';
      case 'rewards':
        return 'bg-pink-400/15 text-pink-400 border-pink-400/20';
      default:
        return 'bg-white/10 text-slate-300 border-white/10';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#1F1E25] border border-white/10 shadow-2xl p-6 flex flex-col gap-5 overflow-hidden">
        {/* Glow Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00E163] to-transparent" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#26252E] border border-white/5 flex items-center justify-center shrink-0">
              {getCategoryIcon()}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${getCategoryBadge()}`}>
                  {message.category}
                </span>
                {message.priority === 'high' && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FF5C77]/15 text-[#FF5C77] border border-[#FF5C77]/20">
                    <AlertCircleIcon className="w-3 h-3" />
                    Penting
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-1 font-mono-num">
                <Clock01Icon className="w-3 h-3 text-slate-500" />
                {message.timestamp}
              </span>
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

        {/* Message Title */}
        <h3 className="text-base font-extrabold text-white font-heading leading-snug">
          {message.title}
        </h3>

        {/* Message Body Content */}
        <div className="p-4 rounded-2xl bg-[#18171E] border border-white/5 text-xs text-slate-300 leading-relaxed space-y-3 font-sans max-h-60 overflow-y-auto custom-positions-scrollbar">
          <p className="whitespace-pre-line">{message.content}</p>

          {/* Reference Info Card if available */}
          {message.referenceId && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#26252E] border border-white/5 font-mono-num text-[11px] text-slate-300">
              <span className="text-slate-400 font-sans">
                {message.referenceType === 'txid'
                  ? 'Blockchain TxID:'
                  : message.referenceType === 'order'
                  ? 'Order ID:'
                  : message.referenceType === 'ip'
                  ? 'IP Address & Device:'
                  : 'Ref Kode:'}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-white font-bold">{message.referenceId}</span>
                <button
                  type="button"
                  onClick={handleCopyRef}
                  className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Salin Referensi"
                >
                  {isCopied ? <Tick01Icon className="w-3 h-3 text-[#00E163]" /> : <Copy01Icon className="w-3 h-3" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              onDeleteMessage?.(message.id);
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl bg-[#26252E] hover:bg-[#FF5C77]/20 text-slate-400 hover:text-[#FF5C77] text-xs font-bold transition-colors cursor-pointer border border-white/5"
          >
            Hapus Pesan
          </button>

          <div className="flex items-center gap-2">
            {message.actionLabel && message.actionUrl && (
              <button
                type="button"
                onClick={() => {
                  onNavigateAction?.(message.actionUrl!);
                  onClose();
                }}
                className="group relative flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#00E163] text-black font-extrabold text-xs shadow-[0_0_15px_rgba(0,225,99,0.25)] overflow-hidden cursor-pointer"
              >
                <span className="relative z-10">{message.actionLabel}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#26252E] hover:bg-white/10 text-white text-xs font-bold transition-colors cursor-pointer border border-white/5"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
