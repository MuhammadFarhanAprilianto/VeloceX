'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trade } from '@/types/trading';
import { X } from 'lucide-react';

interface OrderSuccessModalProps {
  trade: Trade | null;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ trade, onClose }) => {
  if (!trade) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#1F1E25] p-6 shadow-2xl"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          {/* SVG Animated Checkmark Draw Path */}
          <div className="mx-auto my-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#00E163]/15">
            <svg
              className="h-12 w-12 text-[#00E163]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  duration: 0.6,
                  ease: 'easeInOut',
                  delay: 0.1,
                }}
              />
            </svg>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-extrabold tracking-tight text-white font-heading">
              Order Executed!
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Your trade has been matched and settled via ACID transaction.
            </p>
          </div>

          {/* Trade Details */}
          <div className="mt-6 rounded-xl border border-white/5 bg-[#26252E] p-4 space-y-2.5 font-mono-num text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Pair:</span>
              <span className="font-bold text-white">{trade.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Executed Price:</span>
              <span className="font-semibold text-[#00E163]">
                ${trade.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Executed Amount:</span>
              <span className="font-semibold text-slate-200">{trade.amount.toFixed(4)}</span>
            </div>
            <div className="flex justify-between border-t border-white/5 pt-2 font-semibold">
              <span className="text-slate-300">Total Settlement:</span>
              <span className="text-white">
                ${(trade.price * trade.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT
              </span>
            </div>
          </div>

          {/* Dismiss CTA */}
          <button
            onClick={onClose}
            className="mt-6 w-full rounded-xl bg-[#00E163] py-3 text-sm font-bold text-black shadow-lg shadow-[#00E163]/25 transition-transform hover:brightness-110 active:scale-98 cursor-pointer"
          >
            Acknowledge & Continue
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
