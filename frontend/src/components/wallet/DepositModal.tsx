import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Cancel01Icon,
  Copy01Icon,
  CheckmarkCircle01Icon,
  ArrowDown01Icon,
  Download01Icon,
  QrCodeIcon,
  Tick01Icon,
} from 'hugeicons-react';
import { MarketIcon } from '@/components/MarketIcon';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDepositSuccess: (amount: number, symbol: string) => void;
}

const DEPOSIT_ASSETS = [
  { symbol: 'USDT', name: 'Tether USD', icon: 'USDT', minDeposit: '10' },
  { symbol: 'BTC', name: 'Bitcoin', icon: 'BTC', minDeposit: '0.0005' },
  { symbol: 'ETH', name: 'Ethereum', icon: 'ETH', minDeposit: '0.01' },
  { symbol: 'SOL', name: 'Solana', icon: 'SOL', minDeposit: '0.1' },
  { symbol: 'USDC', name: 'USD Coin', icon: 'USDC', minDeposit: '10' },
];

const NETWORKS: Record<string, { id: string; name: string; time: string; fee: string; address: string }[]> = {
  USDT: [
    { id: 'TRC20', name: 'Tron (TRC20)', time: '~2 mins', fee: '1.00 USDT', address: 'TX9yZ8QnB5V2M1aK4jH7gF6dE3cW8pL0m' },
    { id: 'ERC20', name: 'Ethereum (ERC20)', time: '~4 mins', fee: '4.50 USDT', address: '0x71C...4982c712E1B96459' },
    { id: 'ARB', name: 'Arbitrum One', time: '~1 min', fee: '0.20 USDT', address: '0x71C...4982c712E1B96459' },
    { id: 'SOL', name: 'Solana', time: '~30 secs', fee: '0.10 USDT', address: '7XqJ...48fKp92mZ1' },
  ],
  BTC: [
    { id: 'BTC', name: 'Bitcoin Network', time: '~15 mins', fee: '0.0001 BTC', address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq' },
    { id: 'LN', name: 'Lightning Network', time: 'Instant', fee: 'Free', address: 'lnbc100u1p3...fastpay' },
  ],
  ETH: [
    { id: 'ERC20', name: 'Ethereum (ERC20)', time: '~4 mins', fee: '0.0015 ETH', address: '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7' },
    { id: 'ARB', name: 'Arbitrum One', time: '~1 min', fee: '0.0001 ETH', address: '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7' },
  ],
  SOL: [
    { id: 'SOL', name: 'Solana', time: '~30 secs', fee: '0.005 SOL', address: '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin' },
  ],
  USDC: [
    { id: 'ERC20', name: 'Ethereum (ERC20)', time: '~4 mins', fee: '3.00 USDC', address: '0x71C...4982c712E1B96459' },
    { id: 'SOL', name: 'Solana', time: '~30 secs', fee: '0.10 USDC', address: '7XqJ...48fKp92mZ1' },
  ],
};

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, onDepositSuccess }) => {
  const [selectedAsset, setSelectedAsset] = useState(DEPOSIT_ASSETS[0]);
  const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState(false);

  const availableNetworks = NETWORKS[selectedAsset.symbol] || NETWORKS.USDT;
  const [selectedNetwork, setSelectedNetwork] = useState(availableNetworks[0]);
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);

  const [simulatedAmount, setSimulatedAmount] = useState('1000');
  const [isCopied, setIsCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDoneSuccess, setIsDoneSuccess] = useState(false);
  const [donePhase, setDonePhase] = useState<'idle' | 'progress' | 'checkmark_center' | 'checkmark_shift' | 'success_revealed'>('idle');

  if (!isOpen || typeof document === 'undefined') return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedNetwork.address);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSimulateDeposit = () => {
    const amt = parseFloat(simulatedAmount) || 1000;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsDoneSuccess(true);
      setTimeout(() => {
        onDepositSuccess(amt, selectedAsset.symbol);
        setIsDoneSuccess(false);
        onClose();
      }, 800);
    }, 500);
  };

  const handleDoneClick = () => {
    if (donePhase !== 'idle') return;

    // Langkah 1: Loading Progress Bar Hover Hijau dari Kiri ke Kanan (700ms)
    setDonePhase('progress');

    // Langkah 2: Setelah full hijau, muncul motion centang di rata tengah
    setTimeout(() => {
      setDonePhase('checkmark_center');

      // Jeda 1 detik (1000ms) lalu geser posisi centang ke kiri
      setTimeout(() => {
        setDonePhase('checkmark_shift');

        // Langkah 3: Teks Success muncul dari burem (blur) ke jelas (sharp)
        setTimeout(() => {
          setDonePhase('success_revealed');

          // Langkah 4: Jeda 2 detik (2000ms) langsung pindah/close kembali ke Halaman Wallet
          setTimeout(() => {
            setDonePhase('idle');
            onClose();
          }, 2000);
        }, 150);
      }, 1000);
    }, 700);
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in font-sans">
      <div className="flex flex-col w-full max-w-lg bg-[#1F1E25] border border-white/10 rounded-3xl p-6 shadow-2xl gap-5 select-none max-h-[90vh] overflow-hidden">
        {/* Modal Header (Fixed at Top) */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#00E163]/15 text-[#00E163]">
              <QrCodeIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-base font-heading">
                Deposit Crypto & Funds
              </span>
              <span className="text-xs text-slate-400">
                Instantly deposit digital assets to your VeloceX wallet
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

        {/* Scrollable Content (Contained inside Card) */}
        <div className="flex flex-col gap-5 overflow-y-auto pr-1.5 custom-positions-scrollbar flex-1">

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
                {DEPOSIT_ASSETS.map((asset) => (
                  <button
                    key={asset.symbol}
                    type="button"
                    onClick={() => {
                      setSelectedAsset(asset);
                      setSelectedNetwork(NETWORKS[asset.symbol]?.[0] || NETWORKS.USDT[0]);
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

        {/* 2. Select Deposit Network */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-300">2. Deposit Network</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNetworkDropdownOpen(!isNetworkDropdownOpen)}
              className="flex items-center justify-between w-full h-12 px-3.5 rounded-xl bg-[#26252E] border border-white/5 hover:border-white/15 transition-all text-xs font-bold text-white cursor-pointer"
            >
              <div className="flex flex-col items-start">
                <span className="font-extrabold">{selectedNetwork.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">Arrival: {selectedNetwork.time}</span>
              </div>
              <ArrowDown01Icon className={`w-4 h-4 text-slate-400 transition-transform ${isNetworkDropdownOpen ? 'rotate-180 text-white' : ''}`} />
            </button>

            {isNetworkDropdownOpen && (
              <div className="absolute left-0 top-14 w-full bg-[#26252E] border border-white/10 rounded-2xl shadow-2xl p-1.5 flex flex-col gap-1 z-50 backdrop-blur-xl">
                {availableNetworks.map((net) => (
                  <button
                    key={net.id}
                    type="button"
                    onClick={() => {
                      setSelectedNetwork(net);
                      setIsNetworkDropdownOpen(false);
                    }}
                    className={`group relative flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-semibold overflow-hidden transition-colors duration-1000 cursor-pointer ${
                      selectedNetwork.id === net.id
                        ? 'bg-[#00E163] text-black font-bold'
                        : 'text-slate-300 hover:text-black'
                    }`}
                  >
                    {selectedNetwork.id !== net.id && (
                      <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                    )}
                    <div className="relative z-10 flex flex-col items-start">
                      <span className="font-bold">{net.name}</span>
                      <span className="text-[10px] opacity-75 font-mono">Estimated time: {net.time}</span>
                    </div>
                    {selectedNetwork.id === net.id && <span className="relative z-10 text-xs">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. QR Code & Deposit Address Box */}
        <div className="flex flex-col items-center p-5 rounded-2xl bg-[#26252E] border border-white/5 gap-4">
          {/* Simulated Vector QR Code */}
          <div className="flex items-center justify-center p-3 rounded-2xl bg-white shadow-xl">
            <svg viewBox="0 0 100 100" className="w-28 h-28 text-black fill-current">
              {/* Corner 1 */}
              <rect x="10" y="10" width="26" height="26" rx="4" fill="#000" />
              <rect x="15" y="15" width="16" height="16" rx="2" fill="#fff" />
              <rect x="19" y="19" width="8" height="8" fill="#000" />
              {/* Corner 2 */}
              <rect x="64" y="10" width="26" height="26" rx="4" fill="#000" />
              <rect x="69" y="15" width="16" height="16" rx="2" fill="#fff" />
              <rect x="73" y="19" width="8" height="8" fill="#000" />
              {/* Corner 3 */}
              <rect x="10" y="64" width="26" height="26" rx="4" fill="#000" />
              <rect x="15" y="69" width="16" height="16" rx="2" fill="#fff" />
              <rect x="19" y="73" width="8" height="8" fill="#000" />
              {/* Center Matrix Blocks */}
              <rect x="42" y="14" width="6" height="6" fill="#000" />
              <rect x="52" y="24" width="6" height="6" fill="#000" />
              <rect x="42" y="42" width="16" height="16" rx="2" fill="#000" />
              <rect x="68" y="52" width="6" height="6" fill="#000" />
              <rect x="78" y="68" width="8" height="8" fill="#000" />
              <rect x="42" y="68" width="6" height="6" fill="#000" />
              <rect x="52" y="78" width="6" height="6" fill="#000" />
            </svg>
          </div>

          {/* Deposit Address with Copy Button */}
          <div className="flex flex-col w-full gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Deposit Address</span>
              <span className="text-[10px] text-[#00E163] font-bold">Only send {selectedAsset.symbol} to this address</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#1B1A21] border border-white/5 font-mono text-xs">
              <span className="text-white font-bold truncate pr-2">{selectedNetwork.address}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#26252E] hover:bg-[#00E163] text-slate-300 hover:text-black font-bold text-xs transition-colors duration-1000 cursor-pointer overflow-hidden flex-shrink-0"
              >
                <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                <span className="relative z-10 flex items-center gap-1">
                  {isCopied ? <CheckmarkCircle01Icon className="w-3.5 h-3.5 text-[#00E163]" /> : <Copy01Icon className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied' : 'Copy'}</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 4. Instant Simulation Tester */}
        <div className="flex flex-col p-3.5 rounded-2xl bg-[#1B1A21] border border-white/5 gap-2.5">
          <span className="text-[11px] font-bold text-slate-300">
            ⚡ Test Instant Sandbox Deposit (Demo Simulation)
          </span>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 flex items-center h-10 px-3 rounded-xl bg-[#26252E] border border-white/5">
              <input
                type="number"
                value={simulatedAmount}
                onChange={(e) => setSimulatedAmount(e.target.value)}
                className="w-full text-xs font-mono font-bold text-white bg-transparent focus:outline-none"
                placeholder="Amount"
              />
              <span className="text-xs font-mono font-bold text-[#00E163]">{selectedAsset.symbol}</span>
            </div>
            <button
              type="button"
              onClick={handleSimulateDeposit}
              disabled={isProcessing || isDoneSuccess}
              className="group relative flex items-center justify-center px-4 h-10 rounded-xl bg-[#00E163] text-black font-extrabold text-xs shadow-lg shadow-[#00E163]/20 overflow-hidden transition-all cursor-pointer disabled:opacity-50 shrink-0"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                {isProcessing ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                    <span>Crediting...</span>
                  </>
                ) : isDoneSuccess ? (
                  <>
                    <Tick01Icon className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Success!</span>
                  </>
                ) : (
                  <span>Credit Wallet</span>
                )}
              </span>
            </button>
          </div>
        </div>

        </div>

        {/* Action Done Button with 4-Step Animated Motion */}
        <button
          type="button"
          onClick={handleDoneClick}
          disabled={donePhase !== 'idle'}
          className="relative w-full h-12 rounded-full overflow-hidden font-black text-xs transition-all duration-300 cursor-pointer flex-shrink-0 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white select-none shadow-lg group"
        >
          {/* 1. Green Progress Fill from Left to Right */}
          <div
            className={`absolute left-0 top-0 bottom-0 bg-[#00E163] shadow-lg shadow-[#00E163]/30 transition-all ease-out pointer-events-none ${
              donePhase === 'idle'
                ? 'w-0'
                : 'w-full duration-700'
            }`}
          />

          {/* Initial Idle Text "Done" */}
          {donePhase === 'idle' && (
            <span className="relative z-10 transition-opacity duration-300 group-hover:text-white">
              Done
            </span>
          )}

          {/* Step 1: While filling progress bar */}
          {donePhase === 'progress' && (
            <span className="relative z-10 text-black/60 font-bold tracking-wider text-[11px] animate-pulse">
              Memproses...
            </span>
          )}

          {/* Step 2 & 3: Centered Checkmark & Success Text Motion */}
          {(donePhase === 'checkmark_center' || donePhase === 'checkmark_shift' || donePhase === 'success_revealed') && (
            <div className="relative z-10 flex items-center justify-center gap-2">
              {/* Checkmark Icon with Smooth Centered Pop & Left Shift */}
              <div
                className={`transition-all duration-500 ease-out flex items-center justify-center ${
                  donePhase === 'checkmark_center'
                    ? 'scale-110 translate-x-0'
                    : 'scale-100'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center shadow-md animate-in zoom-in duration-300">
                  <Tick01Icon className="w-3.5 h-3.5 text-[#00E163] stroke-[3.5]" />
                </div>
              </div>

              {/* Step 3: Success Text with Blur-to-Sharp Fade-In */}
              <div
                className={`transition-all duration-500 ease-out ${
                  donePhase === 'success_revealed'
                    ? 'opacity-100 blur-0 translate-x-0 max-w-[120px]'
                    : 'opacity-0 blur-sm -translate-x-2 max-w-0 overflow-hidden'
                }`}
              >
                <span className="font-black text-black text-xs tracking-wider uppercase whitespace-nowrap">
                  Success
                </span>
              </div>
            </div>
          )}
        </button>
      </div>
    </div>,
    document.body
  );
};
