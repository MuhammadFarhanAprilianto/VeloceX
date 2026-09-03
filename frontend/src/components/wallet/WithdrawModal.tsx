import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Cancel01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  InformationCircleIcon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  Tick01Icon,
} from 'hugeicons-react';
import { MarketIcon } from '@/components/MarketIcon';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableUSDT: number;
  onWithdrawSuccess: (amount: number, symbol: string, address: string) => void;
}

const WITHDRAW_ASSETS = [
  { symbol: 'USDT', name: 'Tether USD', minWithdraw: 10, fee: 1.0, network: 'Tron (TRC20)' },
  { symbol: 'BTC', name: 'Bitcoin', minWithdraw: 0.001, fee: 0.0002, network: 'Bitcoin Network' },
  { symbol: 'ETH', name: 'Ethereum', minWithdraw: 0.02, fee: 0.002, network: 'Ethereum (ERC20)' },
  { symbol: 'SOL', name: 'Solana', minWithdraw: 0.2, fee: 0.01, network: 'Solana Network' },
];

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  availableUSDT,
  onWithdrawSuccess,
}) => {
  const [selectedAsset, setSelectedAsset] = useState(WITHDRAW_ASSETS[0]);
  const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState(false);
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [withdrawPhase, setWithdrawPhase] = useState<'idle' | 'progress' | 'checkmark_center' | 'checkmark_shift' | 'success_revealed'>('idle');

  if (!isOpen || typeof document === 'undefined') return null;

  const parsedAmount = parseFloat(amount) || 0;
  const netFee = selectedAsset.fee;
  const receiveAmount = Math.max(0, parsedAmount - netFee);

  const handleMaxClick = (percent: number) => {
    const val = (availableUSDT * percent) / 100;
    setAmount(val.toFixed(2));
    setErrorMsg(null);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawPhase !== 'idle') return;

    if (!address || address.length < 10) {
      setErrorMsg('Please enter a valid recipient destination address.');
      return;
    }
    if (parsedAmount < selectedAsset.minWithdraw) {
      setErrorMsg(`Minimum withdrawal amount is ${selectedAsset.minWithdraw} ${selectedAsset.symbol}.`);
      return;
    }
    if (parsedAmount > availableUSDT) {
      setErrorMsg('Insufficient balance in your Spot/Funding Wallet.');
      return;
    }

    setErrorMsg(null);

    // Langkah 1: Loading Progress Bar Hijau dari Kiri ke Kanan (700ms)
    setWithdrawPhase('progress');

    // Langkah 2: Setelah Full Hijau -> Centang Pop di Rata Tengah (Center)
    setTimeout(() => {
      setWithdrawPhase('checkmark_center');

      // Jeda 1 detik (1000ms) lalu geser ke kiri
      setTimeout(() => {
        setWithdrawPhase('checkmark_shift');

        // Langkah 3: Teks Success muncul dari burem (blur) ke jelas (sharp)
        setTimeout(() => {
          setWithdrawPhase('success_revealed');

          // Langkah 4: Jeda 2 detik (2000ms) langsung tutup modal & kembali ke Wallet
          setTimeout(() => {
            onWithdrawSuccess(parsedAmount, selectedAsset.symbol, address);
            setWithdrawPhase('idle');
            onClose();
          }, 2000);
        }, 150);
      }, 1000);
    }, 700);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in font-sans">
      <div className="flex flex-col w-full max-w-lg bg-[#1F1E25] border border-white/10 rounded-3xl p-6 shadow-2xl gap-5 select-none max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#FF5C77]/15 text-[#FF5C77]">
              <ArrowUp01Icon className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-base font-heading">
                Withdraw Crypto
              </span>
              <span className="text-xs text-slate-400">
                Transfer digital assets out to an external wallet or exchange
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

        <form onSubmit={handleWithdrawSubmit} className="flex flex-col gap-4 overflow-y-auto pr-1.5 custom-positions-scrollbar flex-1">
          {/* 1. Select Asset Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300">1. Select Coin</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsAssetDropdownOpen(!isAssetDropdownOpen)}
                className="flex items-center justify-between w-full h-12 px-3.5 rounded-xl bg-[#26252E] border border-white/5 hover:border-white/15 transition-all text-xs font-bold text-white cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <MarketIcon symbol={selectedAsset.symbol} size="sm" />
                  <span className="font-extrabold">{selectedAsset.name} ({selectedAsset.symbol})</span>
                </div>
                <ArrowDown01Icon className={`w-4 h-4 text-slate-400 transition-transform ${isAssetDropdownOpen ? 'rotate-180 text-white' : ''}`} />
              </button>

              {isAssetDropdownOpen && (
                <div className="absolute left-0 top-14 w-full bg-[#26252E] border border-white/10 rounded-2xl shadow-2xl p-1.5 flex flex-col gap-1 z-50 backdrop-blur-xl">
                  {WITHDRAW_ASSETS.map((asset) => (
                    <button
                      key={asset.symbol}
                      type="button"
                      onClick={() => {
                        setSelectedAsset(asset);
                        setIsAssetDropdownOpen(false);
                      }}
                      className={`group relative flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-semibold overflow-hidden transition-colors duration-1000 cursor-pointer ${
                        selectedAsset.symbol === asset.symbol
                          ? 'bg-[#00E163] text-black font-bold'
                          : 'text-slate-300 hover:text-black'
                      }`}
                    >
                      {selectedAsset.symbol !== asset.symbol && (
                        <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                      )}
                      <div className="relative z-10 flex items-center gap-2">
                        <MarketIcon symbol={asset.symbol} size="sm" />
                        <span>{asset.name}</span>
                        <span className="text-[10px] opacity-70 font-mono">({asset.symbol})</span>
                      </div>
                      {selectedAsset.symbol === asset.symbol && <span className="relative z-10 text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 2. Destination Address Input with Whitelist Address Book */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-300">2. Destination Address</label>
              <span className="text-[10px] text-slate-400 font-mono">24H Limit: 2,000,000 USDT</span>
            </div>
            <div className="relative flex items-center h-12 px-3.5 rounded-xl bg-[#26252E] border border-white/5 focus-within:border-white/20 transition-colors">
              <input
                type="text"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder={`Paste recipient ${selectedAsset.symbol} address`}
                className="w-full text-xs font-mono font-bold text-white bg-transparent focus:outline-none placeholder-slate-500"
              />
            </div>

            {/* Quick Address Book Whitelist Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto custom-positions-scrollbar py-0.5">
              <span className="text-[10px] font-bold text-slate-500 flex-shrink-0">Saved:</span>
              {[
                { label: 'Binance Main', addr: 'TX9yZ8QnB5V2M1aK4jH7gF6dE3cW8pL0m' },
                { label: 'Ledger Cold', addr: '0x71C8982c712E1B964593C4b802' },
                { label: 'MetaMask Mobile', addr: '0x89205A3A3b2A69De6Dbf7f01ED' },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setAddress(item.addr);
                    setErrorMsg(null);
                  }}
                  className="px-2 py-0.5 rounded-md bg-[#1B1A21] border border-white/5 hover:border-[#00E163]/40 text-slate-400 hover:text-[#00E163] text-[10px] font-bold font-mono transition-colors cursor-pointer flex-shrink-0"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Withdrawal Amount & Quick Percent Chips */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">3. Withdrawal Amount</span>
              <span className="text-slate-400 font-mono-num text-[11px]">
                Available: <strong className="text-[#00E163]">${availableUSDT.toLocaleString('en-US', { minimumFractionDigits: 2 })} USDT</strong>
              </span>
            </div>

            <div className="relative flex items-center justify-between h-12 px-3.5 rounded-xl bg-[#26252E] border border-white/5 focus-within:border-white/20 transition-colors">
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="0.00"
                className="w-full text-xs font-mono font-bold text-white bg-transparent focus:outline-none"
              />
              <span className="text-xs font-mono font-bold text-slate-400 pl-2">{selectedAsset.symbol}</span>
            </div>

            {/* Quick Percentage Chips with 1000ms Sweep */}
            <div className="grid grid-cols-4 gap-1.5 mt-1">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handleMaxClick(pct)}
                  className="group relative py-1 rounded-lg bg-[#26252E] border border-white/5 overflow-hidden text-[10px] font-bold text-slate-400 hover:text-black font-mono transition-colors duration-1000 cursor-pointer text-center"
                >
                  <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                  <span className="relative z-10 transition-colors duration-1000">{pct === 100 ? 'MAX' : `${pct}%`}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Fee & Net Received Breakdown */}
          <div className="flex flex-col p-3.5 rounded-2xl bg-[#26252E] border border-white/5 text-xs font-mono-num gap-2">
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span className="font-sans">Network Fee:</span>
              <span className="text-slate-200 font-bold">{selectedAsset.fee} {selectedAsset.symbol}</span>
            </div>
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span className="font-sans">Estimated Time:</span>
              <span className="text-slate-200 font-bold">~2 minutes</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-white/5">
              <span className="font-sans text-xs font-bold text-white">You will receive:</span>
              <span className="text-sm font-black text-[#00E163]">
                {receiveAmount.toFixed(4)} {selectedAsset.symbol}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#362227] border border-[#FF5C77]/30 text-[#FF5C77] text-xs font-bold animate-fade-in">
              <AlertCircleIcon className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Confirm Withdrawal Button with Enlarged Height, Sleek Rounded-2xl, and 4-Step Animated Motion */}
          <button
            type="submit"
            disabled={withdrawPhase !== 'idle'}
            className="relative w-full h-14 rounded-2xl overflow-hidden font-black text-xs transition-all duration-300 cursor-pointer flex-shrink-0 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white select-none shadow-lg border border-white/5 group"
          >
            {/* 1. Green Progress Fill from Left to Right */}
            <div
              className={`absolute left-0 top-0 bottom-0 bg-[#00E163] shadow-lg shadow-[#00E163]/30 transition-all ease-out pointer-events-none ${
                withdrawPhase === 'idle'
                  ? 'w-0'
                  : 'w-full duration-700'
              }`}
            />

            {/* Initial Idle Text "Confirm Withdrawal" */}
            {withdrawPhase === 'idle' && (
              <span className="relative z-10 transition-opacity duration-300 text-white group-hover:text-white uppercase tracking-wider text-xs font-black">
                Confirm Withdrawal
              </span>
            )}

            {/* Step 1: While filling progress bar */}
            {withdrawPhase === 'progress' && (
              <span className="relative z-10 text-black font-black tracking-wider text-xs animate-pulse">
                Memproses Penarikan...
              </span>
            )}

            {/* Step 2 & 3: Centered Checkmark & Success Text Motion */}
            {(withdrawPhase === 'checkmark_center' || withdrawPhase === 'checkmark_shift' || withdrawPhase === 'success_revealed') && (
              <div className="relative z-10 flex items-center justify-center gap-2.5">
                {/* Checkmark Icon with Smooth Centered Pop & Left Shift */}
                <div
                  className={`transition-all duration-500 ease-out flex items-center justify-center ${
                    withdrawPhase === 'checkmark_center'
                      ? 'scale-110 translate-x-0'
                      : 'scale-100'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center shadow-md animate-in zoom-in duration-300">
                    <Tick01Icon className="w-4 h-4 text-[#00E163] stroke-[3.5]" />
                  </div>
                </div>

                {/* Step 3: Success Text with Blur-to-Sharp Fade-In */}
                <div
                  className={`transition-all duration-500 ease-out ${
                    withdrawPhase === 'success_revealed'
                      ? 'opacity-100 blur-0 translate-x-0 max-w-[220px]'
                      : 'opacity-0 blur-sm -translate-x-3 max-w-0 overflow-hidden'
                  }`}
                >
                  <span className="font-black text-black text-xs tracking-wider uppercase whitespace-nowrap">
                    Withdrawal Success
                  </span>
                </div>
              </div>
            )}
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};
