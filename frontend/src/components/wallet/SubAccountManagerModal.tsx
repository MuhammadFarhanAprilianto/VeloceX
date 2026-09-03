import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Cancel01Icon,
  UserGroupIcon,
  CheckmarkCircle01Icon,
  ArrowRight01Icon,
  PlusSignIcon,
  Building01Icon,
  Tick01Icon,
} from 'hugeicons-react';

export interface SubAccountItem {
  id: string;
  name: string;
  type: 'BOT' | 'SCALPING' | 'HODL' | 'API';
  balanceUSDT: number;
  status: 'Active' | 'Paused';
  apiKeyCount: number;
}

interface SubAccountManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  masterBalance: number;
  onTransferToSub: (subId: string, amount: number) => void;
}

const INITIAL_SUB_ACCOUNTS: SubAccountItem[] = [
  { id: 'sub_1', name: 'Algorithmic Bot Alpha', type: 'BOT', balanceUSDT: 45200.0, status: 'Active', apiKeyCount: 2 },
  { id: 'sub_2', name: 'High-Frequency Scalping', type: 'SCALPING', balanceUSDT: 28400.0, status: 'Active', apiKeyCount: 1 },
  { id: 'sub_3', name: 'Long-Term Cold Vault', type: 'HODL', balanceUSDT: 65000.0, status: 'Active', apiKeyCount: 0 },
];

export const SubAccountManagerModal: React.FC<SubAccountManagerModalProps> = ({
  isOpen,
  onClose,
  masterBalance,
  onTransferToSub,
}) => {
  const [subAccounts, setSubAccounts] = useState<SubAccountItem[]>(INITIAL_SUB_ACCOUNTS);
  const [newSubName, setNewSubName] = useState('');
  const [newSubType, setNewSubType] = useState<'BOT' | 'SCALPING' | 'HODL' | 'API'>('BOT');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedSubForFund, setSelectedSubForFund] = useState<SubAccountItem | null>(null);
  const [fundAmount, setFundAmount] = useState('5000');

  if (!isOpen || typeof document === 'undefined') return null;

  const handleCreateSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;

    const newSub: SubAccountItem = {
      id: `sub_${Date.now()}`,
      name: newSubName.trim(),
      type: newSubType,
      balanceUSDT: 0.0,
      status: 'Active',
      apiKeyCount: 1,
    };
    setSubAccounts((prev) => [...prev, newSub]);
    setNewSubName('');
    setIsCreating(false);
  };

  const handleAllocateFund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubForFund) return;
    const amt = parseFloat(fundAmount) || 0;
    if (amt <= 0 || amt > masterBalance) return;

    setSubAccounts((prev) =>
      prev.map((s) => (s.id === selectedSubForFund.id ? { ...s, balanceUSDT: s.balanceUSDT + amt } : s))
    );
    onTransferToSub(selectedSubForFund.id, amt);
    setSelectedSubForFund(null);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in font-sans">
      <div className="flex flex-col w-full max-w-xl bg-[#1F1E25] border border-white/10 rounded-3xl p-6 shadow-2xl gap-5 select-none max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#00E163]/15 text-[#00E163]">
              <UserGroupIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-base font-heading">
                Sub-Account Multi-Trading Manager
              </span>
              <span className="text-xs text-slate-400">
                Kelola sub-akun bot, strategi terpisah, dan isolasi risiko modal
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

        {/* Master Balance Summary */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#26252E] border border-white/5 font-mono-num flex-shrink-0">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-sans">Saldo Master Account (Spot Wallet):</span>
            <strong className="text-white text-lg font-black">
              ${masterBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT
            </strong>
          </div>

          <button
            type="button"
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00E163] text-black font-extrabold text-xs hover:brightness-110 transition-all cursor-pointer"
          >
            <PlusSignIcon className="w-4 h-4" />
            <span>Tambah Sub-Akun</span>
          </button>
        </div>

        {/* Create Sub-Account Form */}
        {isCreating && (
          <form onSubmit={handleCreateSub} className="flex flex-col p-4 rounded-2xl bg-[#1B1A21] border border-[#00E163]/30 gap-3 animate-fade-in flex-shrink-0">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span>Buat Sub-Akun Baru</span>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Cancel01Icon className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                placeholder="Nama Sub-Akun (contoh: Grid Bot Binance)"
                value={newSubName}
                onChange={(e) => setNewSubName(e.target.value)}
                className="flex-1 w-full bg-[#26252E] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E163]"
              />

              <select
                value={newSubType}
                onChange={(e) => setNewSubType(e.target.value as any)}
                className="w-full sm:w-auto bg-[#26252E] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                <option value="BOT">Trading Bot</option>
                <option value="SCALPING">Manual Scalping</option>
                <option value="HODL">Cold HODL</option>
                <option value="API">API Integration</option>
              </select>

              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#00E163] text-black font-extrabold text-xs hover:brightness-110 cursor-pointer shrink-0"
              >
                Buat Sekarang
              </button>
            </div>
          </form>
        )}

        {/* Allocate Funds Drawer */}
        {selectedSubForFund && (
          <form onSubmit={handleAllocateFund} className="flex flex-col p-4 rounded-2xl bg-[#26252E] border border-cyan-400/30 gap-3 animate-fade-in flex-shrink-0">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span>Transfer Dana ke {selectedSubForFund.name}</span>
              <button
                type="button"
                onClick={() => setSelectedSubForFund(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Cancel01Icon className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                step="100"
                placeholder="Nominal USDT"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                className="flex-1 bg-[#1F1E25] border border-white/10 rounded-xl px-3 py-2 text-sm font-black font-mono-num text-white focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#00E163] text-black font-extrabold text-xs hover:brightness-110 cursor-pointer shrink-0"
              >
                Kirim Dana
              </button>
            </div>
          </form>
        )}

        {/* Sub-Accounts List */}
        <div className="flex flex-col gap-2.5 overflow-y-auto pr-1.5 custom-positions-scrollbar flex-1">
          {subAccounts.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center justify-between p-4 rounded-2xl bg-[#26252E] border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 text-slate-300 font-bold text-xs font-mono">
                  {sub.type}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-white">{sub.name}</span>
                    <span className="px-2 py-0.2 rounded bg-[#00E163]/15 text-[#00E163] text-[9px] font-bold">
                      {sub.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    API Keys: {sub.apiKeyCount} Active
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end font-mono-num">
                  <span className="text-sm font-black text-white">
                    ${sub.balanceUSDT.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-slate-400">USDT Balance</span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedSubForFund(sub)}
                  className="px-3 py-1.5 rounded-xl bg-[#1F1E25] hover:bg-[#00E163] text-slate-300 hover:text-black font-bold text-xs transition-colors cursor-pointer"
                >
                  Alokasi Dana
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
};
