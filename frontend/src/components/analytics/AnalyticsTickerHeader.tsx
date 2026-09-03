'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Settings01Icon, ArrowDown01Icon, Search01Icon, Cancel01Icon } from 'hugeicons-react';
import { MarketIcon } from '@/components/MarketIcon';
import { useTradingStore } from '@/store/useTradingStore';
import { ASSET_REGISTRY, getAssetConfig } from '@/lib/assetConfig';

type MarketCategory = 'all' | 'forex' | 'cfd' | 'crypto';

interface CategorizedAsset {
  pair: string;
  symbol: string;
  name: string;
  category: 'forex' | 'cfd' | 'crypto';
  defaultPrice: number;
  decimals: number;
  prefix: string;
}

const ALL_ASSETS: CategorizedAsset[] = [
  // Forex
  { pair: 'EURUSD', symbol: 'EURUSD', name: 'EUR / USD', category: 'forex', defaultPrice: 1.0842, decimals: 4, prefix: '' },
  { pair: 'GBPUSD', symbol: 'GBPUSD', name: 'GBP / USD', category: 'forex', defaultPrice: 1.2915, decimals: 4, prefix: '' },
  { pair: 'USDJPY', symbol: 'USDJPY', name: 'USD / JPY', category: 'forex', defaultPrice: 154.60, decimals: 2, prefix: '¥' },
  { pair: 'AUDUSD', symbol: 'AUDUSD', name: 'AUD / USD', category: 'forex', defaultPrice: 0.6580, decimals: 4, prefix: '' },
  { pair: 'USDCAD', symbol: 'USDCAD', name: 'USD / CAD', category: 'forex', defaultPrice: 1.3820, decimals: 4, prefix: '' },
  { pair: 'USDCHF', symbol: 'USDCHF', name: 'USD / CHF', category: 'forex', defaultPrice: 0.8840, decimals: 4, prefix: '' },
  // CFD
  { pair: 'XAUUSD', symbol: 'XAUUSD', name: 'Gold (Emas)', category: 'cfd', defaultPrice: 2514.80, decimals: 2, prefix: '$' },
  { pair: 'XAGUSD', symbol: 'XAGUSD', name: 'Silver (Perak)', category: 'cfd', defaultPrice: 29.45, decimals: 2, prefix: '$' },
  { pair: 'USOIL', symbol: 'USOIL', name: 'Crude Oil WTI', category: 'cfd', defaultPrice: 74.60, decimals: 2, prefix: '$' },
  { pair: 'SPX500', symbol: 'SPX500', name: 'S&P 500 Index', category: 'cfd', defaultPrice: 5648.40, decimals: 2, prefix: '$' },
  { pair: 'NAS100', symbol: 'NAS100', name: 'Nasdaq 100', category: 'cfd', defaultPrice: 19720.50, decimals: 2, prefix: '$' },
  { pair: 'US30', symbol: 'US30', name: 'Dow Jones 30', category: 'cfd', defaultPrice: 41250.00, decimals: 2, prefix: '$' },
  // Crypto
  { pair: 'BTCUSDT', symbol: 'BTC', name: 'Bitcoin', category: 'crypto', defaultPrice: 75368.45, decimals: 2, prefix: '$' },
  { pair: 'ETHUSDT', symbol: 'ETH', name: 'Ethereum', category: 'crypto', defaultPrice: 4149.74, decimals: 2, prefix: '$' },
  { pair: 'LTCUSDT', symbol: 'LTC', name: 'Litecoin', category: 'crypto', defaultPrice: 94.92, decimals: 2, prefix: '$' },
  { pair: 'SOLUSDT', symbol: 'SOL', name: 'Solana', category: 'crypto', defaultPrice: 175.03, decimals: 2, prefix: '$' },
  { pair: 'BNBUSDT', symbol: 'BNB', name: 'Binance', category: 'crypto', defaultPrice: 614.35, decimals: 2, prefix: '$' },
  { pair: 'ADAUSDT', symbol: 'ADA', name: 'Cardano', category: 'crypto', defaultPrice: 0.56, decimals: 4, prefix: '$' },
];

export const AnalyticsTickerHeader: React.FC = () => {
  const { selectedSymbol, setSelectedSymbol, tickers } = useTradingStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<MarketCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Terminal Settings Modal States
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [showMarkPriceLine, setShowMarkPriceLine] = useState(true);
  const [highPerformanceMode, setHighPerformanceMode] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const config = getAssetConfig(selectedSymbol);

  const currentTicker = tickers[selectedSymbol];
  const price = currentTicker?.price ?? config.defaultPrice;
  const changePercent = currentTicker?.change_percent ?? -0.44;
  const isPositive = changePercent >= 0;

  // Clean Display Pair Name
  const getDisplayName = (pair: string) => {
    const item = ALL_ASSETS.find((a) => a.pair === pair);
    if (!item) return pair;
    if (item.category === 'forex') return item.name;
    if (item.category === 'cfd') return `${item.name} (${item.symbol})`;
    return `${item.name} (${item.symbol}/USDT)`;
  };

  // Close on Click Outside or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDropdownOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const filteredAssets = ALL_ASSETS.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.pair.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-wrap items-center justify-between w-full px-5 py-3.5 bg-[#1F1E25] border border-white/5 rounded-3xl select-none gap-4">
      {/* Left: Asset Selector with Full Categorized Dropdown & Live Center Price */}
      <div className="flex items-center gap-4">
        <div ref={dropdownRef} className="relative">
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <MarketIcon symbol={selectedSymbol} size="md" />

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-white font-heading tracking-wide">
                  {getDisplayName(selectedSymbol)}
                </span>
                <ArrowDown01Icon className={`w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform duration-300 ${
                  isDropdownOpen ? 'rotate-180 text-white' : ''
                }`} />
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                <span className="uppercase text-[9px] px-1.5 py-0.2 rounded bg-white/5 font-semibold text-slate-300">
                  {config.category}
                </span>
                <span>•</span>
                <span className="text-slate-300 font-semibold">Perpetual Futures</span>
              </div>
            </div>
          </div>

          {/* Full Categorized Dropdown Popover matching Dashboard Categories */}
          {isDropdownOpen && (
            <div className="absolute left-0 top-14 w-80 bg-[#1F1E25] border border-white/10 rounded-2xl shadow-2xl p-3 z-50 backdrop-blur-xl">
              {/* Search Bar inside Dropdown */}
              <div className="relative flex items-center w-full h-8 mb-2 px-2.5 rounded-xl bg-[#26252E] border border-white/5">
                <Search01Icon className="w-3.5 h-3.5 text-slate-500 mr-2" />
                <input
                  type="text"
                  placeholder="Cari aset (BTC, XAU, EUR...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs text-white placeholder-slate-500 bg-transparent focus:outline-none"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white">
                    <Cancel01Icon className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Category Filter Pills (All, Forex, CFD, Kripto) */}
              <div className="flex items-center p-1 bg-[#26252E] rounded-xl text-[10px] font-bold gap-1 mb-2">
                {[
                  { id: 'all', label: 'Semua' },
                  { id: 'forex', label: 'Forex' },
                  { id: 'cfd', label: 'CFD' },
                  { id: 'crypto', label: 'Kripto' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id as MarketCategory)}
                    className={`flex-1 py-1 rounded-lg transition-all cursor-pointer ${
                      activeCategory === cat.id
                        ? 'bg-[#00E163] text-black font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Assets List with Authentic Vector/WEBP Logos */}
              <div className="flex flex-col space-y-1 max-h-64 overflow-y-auto pr-1">
                {filteredAssets.map((asset) => {
                  const isSelected = selectedSymbol === asset.pair;
                  const liveTicker = tickers[asset.pair];
                  const curPrice = liveTicker ? liveTicker.price : asset.defaultPrice;
                  const curChange = liveTicker ? liveTicker.change_percent : 1.25;

                  return (
                    <div
                      key={asset.pair}
                      onClick={() => {
                        setSelectedSymbol(asset.pair);
                        setIsDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#00E163]/15 border border-[#00E163]/30'
                          : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <MarketIcon symbol={asset.symbol} size="sm" />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white leading-tight">
                            {asset.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {asset.pair}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end font-mono-num">
                        <span className="text-xs font-bold text-white">
                          {asset.prefix}
                          {curPrice.toLocaleString('en-US', {
                            minimumFractionDigits: asset.decimals,
                            maximumFractionDigits: asset.decimals,
                          })}
                        </span>
                        <span
                          className={`text-[9px] font-bold ${
                            curChange >= 0 ? 'text-[#00E163]' : 'text-[#FF5C77]'
                          }`}
                        >
                          {curChange >= 0 ? '+' : ''}{curChange.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  );
                })}

                {filteredAssets.length === 0 && (
                  <div className="py-6 text-center text-xs text-slate-500">
                    Tidak ada aset yang sesuai.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Live Center Price */}
        <div className="flex items-center pl-3 border-l border-white/10">
          <span
            className={`text-xl font-black font-mono-num ${
              isPositive ? 'text-[#00E163]' : 'text-[#FF5C77]'
            }`}
          >
            {config.prefix}
            {price.toLocaleString('en-US', {
              minimumFractionDigits: config.decimals,
              maximumFractionDigits: config.decimals,
            })}
          </span>
        </div>
      </div>

      {/* Middle/Right: Live Market Stats matching Gambar 1 */}
      <div className="flex items-center gap-6 font-mono-num text-xs">
        {/* Mark Price */}
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 font-sans font-medium">Mark</span>
          <span className="font-bold text-white">
            {config.prefix}{price.toLocaleString('en-US', { minimumFractionDigits: config.decimals })}
          </span>
        </div>

        {/* Index Price */}
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 font-sans font-medium">Index</span>
          <span className="font-bold text-slate-300">
            {config.prefix}{(price * 0.9999).toLocaleString('en-US', { minimumFractionDigits: config.decimals, maximumFractionDigits: config.decimals })}
          </span>
        </div>

        {/* 24H Change */}
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 font-sans font-medium">24H Change</span>
          <div className="flex items-center gap-1 font-bold">
            <span className={isPositive ? 'text-[#00E163]' : 'text-[#FF5C77]'}>
              {isPositive ? '+' : ''}{config.prefix}{(price * changePercent * 0.01).toFixed(2)}
            </span>
            <span className={isPositive ? 'text-[#00E163]' : 'text-[#FF5C77]'}>
              {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* 24H High / Low Range Visualizer */}
        <div className="flex flex-col min-w-[120px]">
          <div className="flex justify-between text-[10px] text-slate-500 font-sans font-medium mb-1">
            <span>24H Range</span>
            <span className="font-mono text-slate-400">
              {((price - (currentTicker?.low_24h || price * 0.985)) /
                ((currentTicker?.high_24h || price * 1.015) - (currentTicker?.low_24h || price * 0.985)) *
                100
              ).toFixed(0)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden flex">
            <div
              style={{
                width: `${Math.min(
                  100,
                  Math.max(
                    5,
                    ((price - (currentTicker?.low_24h || price * 0.985)) /
                      ((currentTicker?.high_24h || price * 1.015) - (currentTicker?.low_24h || price * 0.985))) *
                      100
                  )
                )}%`,
              }}
              className="h-full bg-gradient-to-r from-[#FF5C77] via-amber-400 to-[#00E163] rounded-full"
            />
          </div>
          <div className="flex justify-between text-[9px] text-slate-400 font-mono mt-0.5">
            <span>{config.prefix}{(currentTicker?.low_24h || price * 0.985).toLocaleString('en-US', { minimumFractionDigits: config.decimals > 2 ? 2 : 0, maximumFractionDigits: config.decimals > 2 ? 2 : 0 })}</span>
            <span>{config.prefix}{(currentTicker?.high_24h || price * 1.015).toLocaleString('en-US', { minimumFractionDigits: config.decimals > 2 ? 2 : 0, maximumFractionDigits: config.decimals > 2 ? 2 : 0 })}</span>
          </div>
        </div>

        {/* 24H Volume */}
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 font-sans font-medium">24H Volume</span>
          <span className="font-bold text-slate-200">
            {currentTicker?.volume_24h ? `$${(currentTicker.volume_24h / 1e6).toFixed(1)}M` : '335K / 2.2B'}
          </span>
        </div>

        {/* Settings Button with Squircle Hover */}
        <button
          type="button"
          onClick={() => setIsSettingsModalOpen(true)}
          className="flex items-center justify-center w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
          title="Terminal Settings"
        >
          <Settings01Icon className="w-4 h-4" />
        </button>
      </div>

      {/* Terminal Settings Modal (Binance / Bybit Institutional Pro Style) */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="flex flex-col w-full max-w-md bg-[#1F1E25] border border-white/10 rounded-3xl p-6 shadow-2xl gap-5 select-none">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#00E163]/10 text-[#00E163]">
                  <Settings01Icon className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-white text-sm font-heading">
                    Futures Terminal Settings
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Customize your trading terminal preferences
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <Cancel01Icon className="w-4 h-4" />
              </button>
            </div>

            {/* Settings Options List */}
            <div className="flex flex-col space-y-3 text-xs">
              {/* Option 1: Order Confirmation Modal */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#26252E] border border-white/5">
                <div className="flex flex-col">
                  <span className="font-bold text-white">Order Placement Confirmation</span>
                  <span className="text-[10px] text-slate-400">
                    Show confirmation popover before sending futures orders
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOrderConfirmation(!showOrderConfirmation)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    showOrderConfirmation ? 'bg-[#00E163] justify-end' : 'bg-[#1B1A21] justify-start'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full ${showOrderConfirmation ? 'bg-black' : 'bg-slate-400'}`} />
                </button>
              </div>

              {/* Option 2: Sound Alerts */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#26252E] border border-white/5">
                <div className="flex flex-col">
                  <span className="font-bold text-white">Trading Sound Alerts</span>
                  <span className="text-[10px] text-slate-400">
                    Play chime on order fill, liquidation warning, and TP/SL trigger
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSoundAlerts(!soundAlerts)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    soundAlerts ? 'bg-[#00E163] justify-end' : 'bg-[#1B1A21] justify-start'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full ${soundAlerts ? 'bg-black' : 'bg-slate-400'}`} />
                </button>
              </div>

              {/* Option 3: Mark Price Guide Line */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#26252E] border border-white/5">
                <div className="flex flex-col">
                  <span className="font-bold text-white">Show Mark Price Line</span>
                  <span className="text-[10px] text-slate-400">
                    Overlay live mark price reference line on chart
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMarkPriceLine(!showMarkPriceLine)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    showMarkPriceLine ? 'bg-[#00E163] justify-end' : 'bg-[#1B1A21] justify-start'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full ${showMarkPriceLine ? 'bg-black' : 'bg-slate-400'}`} />
                </button>
              </div>

              {/* Option 4: High Performance Mode */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#26252E] border border-white/5">
                <div className="flex flex-col">
                  <span className="font-bold text-white">Ultra-Low Latency Mode</span>
                  <span className="text-[10px] text-slate-400">
                    Optimize WebGL canvas and WebSocket frame rendering
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setHighPerformanceMode(!highPerformanceMode)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    highPerformanceMode ? 'bg-[#00E163] justify-end' : 'bg-[#1B1A21] justify-start'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full ${highPerformanceMode ? 'bg-black' : 'bg-slate-400'}`} />
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsSettingsModalOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#00E163] hover:brightness-110 text-black font-extrabold text-xs shadow-lg shadow-[#00E163]/20 transition-all cursor-pointer"
              >
                Save Preferences
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowOrderConfirmation(true);
                  setSoundAlerts(true);
                  setShowMarkPriceLine(true);
                  setHighPerformanceMode(false);
                  setIsSettingsModalOpen(false);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#26252E] hover:bg-white/10 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Reset Defaults
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
