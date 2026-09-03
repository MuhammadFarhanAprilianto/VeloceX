'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ArrowDown01Icon } from 'hugeicons-react';
import { useTradingStore } from '@/store/useTradingStore';
import { getAssetConfig } from '@/lib/assetConfig';

interface AnalyticsOrderPanelProps {
  onOrderSuccess?: (msg: string) => void;
}

export const AnalyticsOrderPanel: React.FC<AnalyticsOrderPanelProps> = ({ onOrderSuccess }) => {
  const { selectedSymbol, tickers, addOrder, addPosition, portfolio } = useTradingStore();
  const config = getAssetConfig(selectedSymbol);

  const currentTicker = tickers[selectedSymbol];
  const unitPrice = currentTicker?.price ?? config.defaultPrice;

  // Form State
  const [marginMode, setMarginMode] = useState<'Isolated' | 'Cross'>('Isolated');
  const [isMarginDropdownOpen, setIsMarginDropdownOpen] = useState(false);

  const [leverage, setLeverage] = useState<number>(10);
  const [isLeverageDropdownOpen, setIsLeverageDropdownOpen] = useState(false);

  const [side, setSide] = useState<'Long' | 'Short'>('Long');
  const [orderType, setOrderType] = useState<'Market' | 'Limit' | 'Stop'>('Limit');

  const [triggerPrice, setTriggerPrice] = useState<string>((unitPrice * 0.998).toFixed(config.decimals > 2 ? 2 : 2));
  const [triggerPriceType, setTriggerPriceType] = useState<'Mark' | 'Last' | 'Index'>('Mark');
  const [isTriggerDropdownOpen, setIsTriggerDropdownOpen] = useState(false);

  const [orderPrice, setOrderPrice] = useState<string>(unitPrice.toFixed(config.decimals > 2 ? 2 : 2));
  const [orderPriceType, setOrderPriceType] = useState<'Limit' | 'Market' | 'Post Only'>('Limit');
  const [isOrderPriceDropdownOpen, setIsOrderPriceDropdownOpen] = useState(false);

  const [positionAmount, setPositionAmount] = useState<string>('103,000');
  const [positionUnit, setPositionUnit] = useState<string>('USDT');
  const [isUnitDropdownOpen, setIsUnitDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // TP / SL Smart Controls State
  const [enableTPSL, setEnableTPSL] = useState(true);
  const [tpPrice, setTpPrice] = useState<string>((unitPrice * 1.05).toFixed(config.decimals > 2 ? 2 : 2));
  const [slPrice, setSlPrice] = useState<string>((unitPrice * 0.98).toFixed(config.decimals > 2 ? 2 : 2));
  const [activeTpPreset, setActiveTpPreset] = useState<number | null>(5);
  const [activeSlPreset, setActiveSlPreset] = useState<number | null>(2);


  const availableMarginUSD = portfolio?.total_equity_usdt ?? 292000;

  // Available Units based on Selected Asset
  const availableUnits = useMemo(() => {
    const baseSymbol = selectedSymbol.replace('USDT', '');
    return [
      { id: 'USDT', label: 'USDT', icon: '₮' },
      { id: 'USD', label: 'USD', icon: '$' },
      { id: 'USDC', label: 'USDC', icon: 'ⓒ' },
      { id: baseSymbol, label: baseSymbol, icon: '🪙' },
      { id: 'Cont', label: 'Contracts', icon: '📄' },
    ];
  }, [selectedSymbol]);

  // Handle Unit Change with automatic numeric value conversion
  const handleUnitChange = (newUnit: string) => {
    const rawVal = parseFloat(positionAmount.replace(/,/g, '')) || 0;
    if (newUnit === positionUnit) {
      setIsUnitDropdownOpen(false);
      return;
    }

    const cSize = (config as unknown as { contractSize?: number }).contractSize || 1;

    // Convert from old unit to USD, then from USD to new unit
    let valInUSD = rawVal;
    if (positionUnit === selectedSymbol.replace('USDT', '')) {
      valInUSD = rawVal * unitPrice;
    } else if (positionUnit === 'Cont') {
      valInUSD = rawVal * (unitPrice * cSize);
    }

    let convertedVal = valInUSD;
    if (newUnit === selectedSymbol.replace('USDT', '')) {
      convertedVal = valInUSD / unitPrice;
      setPositionAmount(convertedVal.toFixed(4));
    } else if (newUnit === 'Cont') {
      convertedVal = valInUSD / (unitPrice * cSize);
      setPositionAmount(Math.round(convertedVal).toString());
    } else {
      setPositionAmount(Math.round(convertedVal).toLocaleString('en-US'));
    }

    setPositionUnit(newUnit);
    setIsUnitDropdownOpen(false);
  };

  // Sync order price with unit price when switching assets or in Market mode
  useEffect(() => {
    if (orderType === 'Market') {
      setOrderPrice(unitPrice.toFixed(config.decimals > 2 ? 2 : 2));
    }
  }, [unitPrice, orderType, config]);

  // Clean numeric values for dynamic calculations
  const parsedAmount = useMemo(() => {
    const raw = parseFloat(positionAmount.replace(/,/g, '')) || 0;
    const baseSymbol = selectedSymbol.replace('USDT', '');
    const cSize = (config as unknown as { contractSize?: number }).contractSize || 1;
    if (positionUnit === baseSymbol) return raw * unitPrice;
    if (positionUnit === 'Cont') return raw * unitPrice * cSize;
    return raw || 103000;
  }, [positionAmount, positionUnit, selectedSymbol, unitPrice, config]);

  const parsedPrice = useMemo(() => {
    return parseFloat(orderPrice.replace(/,/g, '')) || unitPrice;
  }, [orderPrice, unitPrice]);

  // 1. Dynamic Commission (-0.04% maker/taker fee)
  const commission = useMemo(() => {
    return (parsedAmount * 0.00034).toFixed(1);
  }, [parsedAmount]);

  // 2. Dynamic Liquidation Price
  const liquidationPrice = useMemo(() => {
    if (side === 'Long') {
      const liq = parsedPrice * (1 - 1 / leverage + 0.006);
      return Math.max(0, liq).toLocaleString('en-US', {
        minimumFractionDigits: config.decimals > 2 ? 2 : 0,
        maximumFractionDigits: config.decimals > 2 ? 2 : 0,
      });
    } else {
      const liq = parsedPrice * (1 + 1 / leverage - 0.006);
      return liq.toLocaleString('en-US', {
        minimumFractionDigits: config.decimals > 2 ? 2 : 0,
        maximumFractionDigits: config.decimals > 2 ? 2 : 0,
      });
    }
  }, [parsedPrice, leverage, side, config]);

  // 3. Dynamic Margin Required
  const marginRequired = useMemo(() => {
    return Math.round(parsedAmount / leverage).toLocaleString('en-US');
  }, [parsedAmount, leverage]);

  // 4. Dynamic Max Position Amount
  const maxPositionAmount = useMemo(() => {
    return (availableMarginUSD * leverage).toLocaleString('en-US');
  }, [availableMarginUSD, leverage]);

  // Quick Margin Percentage Click Handler
  const handleQuickPercent = (pct: number) => {
    const totalMaxUSD = availableMarginUSD * leverage;
    const targetAmtUSD = (totalMaxUSD * pct) / 100;
    const baseSymbol = selectedSymbol.replace('USDT', '');
    const cSize = (config as unknown as { contractSize?: number }).contractSize || 1;

    if (positionUnit === baseSymbol) {
      setPositionAmount((targetAmtUSD / unitPrice).toFixed(4));
    } else if (positionUnit === 'Cont') {
      setPositionAmount(Math.round(targetAmtUSD / (unitPrice * cSize)).toString());
    } else {
      setPositionAmount(Math.round(targetAmtUSD).toLocaleString('en-US'));
    }
  };

  // Quick TP Preset Click Handler
  const handleTpPreset = (pct: number) => {
    setActiveTpPreset(pct);
    const targetPrice = side === 'Long' ? parsedPrice * (1 + pct / 100) : parsedPrice * (1 - pct / 100);
    setTpPrice(targetPrice.toFixed(config.decimals > 2 ? 2 : 2));
  };

  // Quick SL Preset Click Handler
  const handleSlPreset = (pct: number) => {
    setActiveSlPreset(pct);
    const targetPrice = side === 'Long' ? parsedPrice * (1 - pct / 100) : parsedPrice * (1 + pct / 100);
    setSlPrice(targetPrice.toFixed(config.decimals > 2 ? 2 : 2));
  };

  // Estimated TP Profit & SL Loss
  const parsedTp = parseFloat(tpPrice) || (side === 'Long' ? parsedPrice * 1.05 : parsedPrice * 0.95);
  const parsedSl = parseFloat(slPrice) || (side === 'Long' ? parsedPrice * 0.98 : parsedPrice * 1.02);

  const estimatedProfitUSD = useMemo(() => {
    const diffPct = Math.abs(parsedTp - parsedPrice) / parsedPrice;
    return (parsedAmount * diffPct * leverage).toFixed(2);
  }, [parsedTp, parsedPrice, parsedAmount, leverage]);

  const estimatedLossUSD = useMemo(() => {
    const diffPct = Math.abs(parsedPrice - parsedSl) / parsedPrice;
    return (parsedAmount * diffPct * leverage).toFixed(2);
  }, [parsedSl, parsedPrice, parsedAmount, leverage]);

  const riskRewardRatio = useMemo(() => {
    const profit = parseFloat(estimatedProfitUSD) || 1;
    const loss = parseFloat(estimatedLossUSD) || 1;
    if (loss <= 0) return '1 : ∞';
    return `1 : ${(profit / loss).toFixed(1)}`;
  }, [estimatedProfitUSD, estimatedLossUSD]);

  // Order Execution Handler (Instantly creates active position)
  const handlePlaceOrder = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const newPosId = `pos_${Date.now()}`;
      const marginVal = parsedAmount / leverage;

      // Add to open orders
      addOrder({
        id: `fut_${Date.now()}`,
        user_id: 'user_1',
        symbol: selectedSymbol,
        side: side === 'Long' ? 'BUY' : 'SELL',
        type: orderType === 'Market' ? 'MARKET' : 'LIMIT',
        price: parsedPrice,
        amount: parsedAmount / unitPrice,
        filled_amount: 0,
        status: 'OPEN',
        created_at: new Date().toISOString(),
      });

      // Add to live futures positions
      addPosition({
        id: newPosId,
        symbol: selectedSymbol,
        status: 'Open',
        type: side,
        size: (parsedAmount / unitPrice).toFixed(2),
        sizeUnit: selectedSymbol.replace('USDT', ''),
        entryPrice: parsedPrice,
        marginUsage: `${((marginVal / availableMarginUSD) * 100).toFixed(2)}%`,
        slPrice: enableTPSL ? parsedSl : undefined,
        tpPrice: enableTPSL ? parsedTp : undefined,
        leverage: leverage,
        liquidationPrice: parseFloat(liquidationPrice.replace(/,/g, '')) || undefined,
        margin: marginVal,
        created_at: new Date().toISOString(),
      });


      onOrderSuccess?.(
        `Futures ${side.toUpperCase()} Position Opened: ${positionAmount} ${positionUnit} (${leverage}x) on ${selectedSymbol}`
      );
    }, 300);
  };


  return (
    <div className="flex flex-col w-full bg-[#1F1E25] border border-white/5 rounded-3xl p-5 select-none transition-all gap-4 relative z-10">
      {/* 1. Top Margin Mode & Leverage Selector with 1000ms Sweep */}
      <div className="grid grid-cols-2 gap-2">
        {/* Margin Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMarginDropdownOpen(!isMarginDropdownOpen)}
            className="group relative flex items-center justify-between w-full px-3.5 py-2 rounded-xl bg-[#26252E] border border-white/5 overflow-hidden text-xs font-bold text-white hover:text-black transition-colors duration-1000 cursor-pointer"
          >
            <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
            <span className="relative z-10 transition-colors duration-1000">{marginMode}</span>
            <ArrowDown01Icon
              className={`relative z-10 w-3.5 h-3.5 text-slate-400 group-hover:text-black transition-all duration-1000 ${
                isMarginDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isMarginDropdownOpen && (
            <div className="absolute left-0 top-11 w-full bg-[#26252E] border border-white/10 rounded-xl shadow-2xl p-1.5 flex flex-col gap-1 z-50 backdrop-blur-xl">
              {(['Isolated', 'Cross'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setMarginMode(mode);
                    setIsMarginDropdownOpen(false);
                  }}
                  className={`group relative flex items-center justify-between w-full px-3 py-1.5 rounded-lg text-xs font-semibold overflow-hidden transition-colors duration-1000 cursor-pointer ${
                    marginMode === mode
                      ? 'bg-[#00E163] text-black font-bold'
                      : 'text-slate-300 hover:text-black'
                  }`}
                >
                  {marginMode !== mode && (
                    <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                  )}
                  <span className="relative z-10 transition-colors duration-1000">{mode}</span>
                  {marginMode === mode && <span className="relative z-10 text-[10px]">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Leverage Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsLeverageDropdownOpen(!isLeverageDropdownOpen)}
            className="group relative flex items-center justify-between w-full px-3.5 py-2 rounded-xl bg-[#26252E] border border-white/5 overflow-hidden text-xs font-bold text-[#00E163] hover:text-black transition-colors duration-1000 cursor-pointer font-mono-num"
          >
            <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
            <span className="relative z-10 transition-colors duration-1000">{leverage}x</span>
            <ArrowDown01Icon
              className={`relative z-10 w-3.5 h-3.5 text-slate-400 group-hover:text-black transition-all duration-1000 ${
                isLeverageDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isLeverageDropdownOpen && (
            <div className="absolute right-0 top-11 w-44 bg-[#26252E] border border-white/10 rounded-xl shadow-2xl p-2 z-50 backdrop-blur-xl">
              <span className="text-[10px] font-bold text-slate-400 block mb-1.5 font-sans">
                Select Leverage Multiplier
              </span>
              <div className="grid grid-cols-4 gap-1">
                {[1, 2, 5, 10, 20, 50, 75, 100].map((lev) => (
                  <button
                    key={lev}
                    onClick={() => {
                      setLeverage(lev);
                      setIsLeverageDropdownOpen(false);
                    }}
                    className={`group relative py-1 rounded-lg text-xs font-bold font-mono-num overflow-hidden transition-colors duration-1000 cursor-pointer ${
                      leverage === lev
                        ? 'bg-[#00E163] text-black font-black'
                        : 'text-slate-300 hover:text-black'
                    }`}
                  >
                    {leverage !== lev && (
                      <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                    )}
                    <span className="relative z-10 transition-colors duration-1000">{lev}x</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Long / Short Toggle Buttons with Left-to-Right 1000ms Sweep */}
      <div className="grid grid-cols-2 p-1 bg-[#26252E] border border-white/5 rounded-2xl gap-1">
        <button
          type="button"
          onClick={() => setSide('Long')}
          className={`group relative py-2.5 rounded-xl font-black text-xs overflow-hidden transition-colors duration-1000 cursor-pointer ${
            side === 'Long'
              ? 'bg-[#00E163] text-black shadow-md shadow-[#00E163]/20'
              : 'text-slate-400 hover:text-black'
          }`}
        >
          {side !== 'Long' && (
            <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
          )}
          <span className="relative z-10 transition-colors duration-1000">Long</span>
        </button>

        <button
          type="button"
          onClick={() => setSide('Short')}
          className={`group relative py-2.5 rounded-xl font-black text-xs overflow-hidden transition-colors duration-1000 cursor-pointer ${
            side === 'Short'
              ? 'bg-[#362227] text-[#FF5C77] border border-[#FF5C77]/40 shadow-md'
              : 'text-slate-400 hover:text-[#FF5C77]'
          }`}
        >
          {side !== 'Short' && (
            <span className="absolute inset-0 bg-[#362227] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
          )}
          <span className="relative z-10 transition-colors duration-1000">Short</span>
        </button>
      </div>

      {/* 3. Order Type Switcher (Market vs Limit vs Stop) with 1000ms Sweep Hover */}
      <div className="flex items-center p-1 bg-[#26252E] border border-white/5 rounded-2xl text-xs font-semibold gap-1">
        {(['Market', 'Limit', 'Stop'] as const).map((type) => {
          const isActive = orderType === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => setOrderType(type)}
              className={`group relative flex-1 py-1.5 rounded-xl text-xs font-bold overflow-hidden transition-colors duration-1000 cursor-pointer ${
                isActive
                  ? 'bg-[#00E163] text-black shadow-sm'
                  : 'text-slate-400 hover:text-black'
              }`}
            >
              {!isActive && (
                <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
              )}
              <span className="relative z-10 transition-colors duration-1000">{type}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Trigger Price & Order Price Inputs */}
      <div className="grid grid-cols-2 gap-2">
        {/* Trigger Price */}
        <div>
          <label className="block text-[10px] text-slate-400 font-medium mb-1">Trigger Price</label>
          <div className="relative flex items-center justify-between h-10 px-2.5 rounded-xl bg-[#26252E] border border-white/5 focus-within:border-[#00E163]/40 transition-colors">
            <input
              type="text"
              disabled={orderType === 'Market'}
              value={orderType === 'Market' ? 'Market' : triggerPrice}
              onChange={(e) => setTriggerPrice(e.target.value)}
              className="w-16 text-xs font-bold text-white font-mono-num bg-transparent focus:outline-none disabled:text-slate-500"
            />
            <button
              type="button"
              onClick={() => setIsTriggerDropdownOpen(!isTriggerDropdownOpen)}
              className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <span>{triggerPriceType}</span>
              <ArrowDown01Icon className="w-3 h-3" />
            </button>

            {isTriggerDropdownOpen && (
              <div className="absolute right-0 top-11 w-24 bg-[#26252E] border border-white/10 rounded-xl shadow-2xl p-1 z-50 flex flex-col gap-1 backdrop-blur-xl">
                {(['Mark', 'Last', 'Index'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTriggerPriceType(t);
                      setIsTriggerDropdownOpen(false);
                    }}
                    className="px-2 py-1 rounded text-[10px] font-semibold text-slate-300 hover:bg-white/5 hover:text-white text-left"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Order Price */}
        <div>
          <label className="block text-[10px] text-slate-400 font-medium mb-1">Order Price</label>
          <div className="relative flex items-center justify-between h-10 px-2.5 rounded-xl bg-[#26252E] border border-white/5 focus-within:border-[#00E163]/40 transition-colors">
            <input
              type="text"
              disabled={orderType === 'Market'}
              value={orderType === 'Market' ? unitPrice.toFixed(2) : orderPrice}
              onChange={(e) => setOrderPrice(e.target.value)}
              className="w-16 text-xs font-bold text-white font-mono-num bg-transparent focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setIsOrderPriceDropdownOpen(!isOrderPriceDropdownOpen)}
              className="flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <span>{orderPriceType}</span>
              <ArrowDown01Icon className="w-3 h-3" />
            </button>

            {isOrderPriceDropdownOpen && (
              <div className="absolute right-0 top-11 w-28 bg-[#26252E] border border-white/10 rounded-xl shadow-2xl p-1 z-50 flex flex-col gap-1 backdrop-blur-xl">
                {(['Limit', 'Market', 'Post Only'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setOrderPriceType(t);
                      setIsOrderPriceDropdownOpen(false);
                    }}
                    className="px-2 py-1 rounded text-[10px] font-semibold text-slate-300 hover:bg-white/5 hover:text-white text-left"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Leverage Multiplier Display Row */}
      <div>
        <label className="block text-[10px] text-slate-400 font-medium mb-1">Leverage Value</label>
        <div className="flex items-center justify-between h-10 px-3 rounded-xl bg-[#26252E] border border-white/5">
          <span className="text-xs font-bold text-slate-200 font-mono-num">
            {parsedPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-[#00E163] font-mono-num">
            {leverage}x
          </span>
        </div>
      </div>

      {/* 6. Position Amount with Quick 25%, 50%, 75%, 100% Buttons */}
      <div>
        <div className="flex items-center justify-between text-[10px] mb-1">
          <span className="text-slate-400 font-medium">Position Amount</span>
          <span className="text-slate-500 font-mono-num">
            Available Margin:{' '}
            <strong className="text-slate-300">
              {availableMarginUSD.toLocaleString('en-US')} USDT
            </strong>
          </span>
        </div>

        <div className="relative flex items-center justify-between h-10 px-3 rounded-xl bg-[#26252E] border border-white/5 focus-within:border-[#00E163]/40 transition-colors">
          <input
            type="text"
            value={positionAmount}
            onChange={(e) => setPositionAmount(e.target.value)}
            className="flex-1 text-xs font-bold text-white font-mono-num bg-transparent focus:outline-none"
          />
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsUnitDropdownOpen(!isUnitDropdownOpen)}
              className="group relative flex items-center gap-1.5 pl-2.5 pr-2 py-1 rounded-lg bg-[#1B1A21] border border-white/5 overflow-hidden font-mono text-xs font-bold text-slate-300 hover:text-black cursor-pointer transition-colors duration-1000"
            >
              <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
              <span className="relative z-10 flex items-center justify-center w-4 h-4 rounded-full bg-[#26A17B] text-[9px] text-white">
                {positionUnit === 'USDT' ? '₮' : positionUnit === 'USDC' ? 'ⓒ' : positionUnit === 'USD' ? '$' : '🪙'}
              </span>
              <span className="relative z-10 transition-colors duration-1000">{positionUnit}</span>
              <ArrowDown01Icon
                className={`relative z-10 w-3 h-3 text-slate-400 group-hover:text-black transition-all duration-1000 ${
                  isUnitDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isUnitDropdownOpen && (
              <div className="absolute right-0 top-9 w-36 bg-[#26252E] border border-white/10 rounded-xl shadow-2xl p-1.5 flex flex-col gap-1 z-50 backdrop-blur-xl">
                {availableUnits.map((u) => {
                  const isSelected = positionUnit === u.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleUnitChange(u.id)}
                      className={`group relative flex items-center justify-between w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold overflow-hidden transition-colors duration-1000 cursor-pointer ${
                        isSelected
                          ? 'bg-[#00E163] text-black font-bold'
                          : 'text-slate-300 hover:text-black'
                      }`}
                    >
                      {!isSelected && (
                        <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                      )}
                      <div className="relative z-10 flex items-center gap-1.5">
                        <span className="text-[11px]">{u.icon}</span>
                        <span>{u.label}</span>
                      </div>
                      {isSelected && <span className="relative z-10 text-[10px]">✓</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Margin Percentage Buttons with 1000ms Sweep */}
        <div className="grid grid-cols-4 gap-1.5 mt-2">
          {[25, 50, 75, 100].map((pct) => (
            <button
              key={pct}
              type="button"
              onClick={() => handleQuickPercent(pct)}
              className="group relative py-1 rounded-lg bg-[#26252E] border border-white/5 overflow-hidden text-[10px] font-bold text-slate-400 hover:text-black font-mono-num transition-colors duration-1000 cursor-pointer text-center"
            >
              <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
              <span className="relative z-10 transition-colors duration-1000">{pct}%</span>
            </button>
          ))}
        </div>
      </div>

      {/* 7. Take Profit & Stop Loss Smart Presets with Risk/Reward Ratio */}
      <div className="flex flex-col p-3 rounded-2xl bg-[#26252E] border border-white/5 gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="tpsl_toggle"
              checked={enableTPSL}
              onChange={(e) => setEnableTPSL(e.target.checked)}
              className="accent-[#00E163] w-3.5 h-3.5 cursor-pointer rounded"
            />
            <label htmlFor="tpsl_toggle" className="text-xs font-bold text-white cursor-pointer select-none">
              TP / SL Smart Target
            </label>
          </div>
          {enableTPSL && (
            <span className="px-2 py-0.5 rounded-md bg-[#00E163]/15 border border-[#00E163]/30 text-[10px] font-bold text-[#00E163] font-mono-num">
              R:R {riskRewardRatio}
            </span>
          )}
        </div>

        {enableTPSL && (
          <div className="flex flex-col gap-2.5 pt-2 border-t border-white/5 animate-fade-in font-sans">
            {/* Take Profit Row */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[10px] font-sans">
                <span className="text-[#00E163] font-bold">Take Profit (TP)</span>
                <span className="text-[#00E163] font-mono text-[11px] font-bold">
                  Est: +${estimatedProfitUSD} USDT
                </span>
              </div>
              <div className="flex items-stretch gap-2">
                <div className="relative flex-1 flex items-center h-16 px-3 rounded-xl bg-[#1B1A21] border border-white/5 focus-within:border-[#00E163]/40 transition-colors">
                  <input
                    type="text"
                    value={tpPrice}
                    onChange={(e) => {
                      setTpPrice(e.target.value);
                      setActiveTpPreset(null);
                    }}
                    className="w-full text-xs font-mono font-bold text-white bg-transparent focus:outline-none"
                    placeholder="TP Price"
                  />
                  <span className="text-[10px] font-mono font-bold text-slate-500 pl-1">USDT</span>
                </div>

                {/* 2x2 Preset Grid for TP with 1000ms Sweep Hover */}
                <div className="grid grid-cols-2 gap-1 w-28">
                  {[5, 10, 25, 50].map((pct) => {
                    const isActive = activeTpPreset === pct;
                    return (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => handleTpPreset(pct)}
                        className={`group relative flex items-center justify-center py-1.5 px-2 rounded-lg text-[10px] font-bold font-mono overflow-hidden transition-colors duration-1000 cursor-pointer ${
                          isActive
                            ? 'bg-[#00E163] text-black font-extrabold shadow-sm'
                            : 'bg-[#1B1A21] border border-white/5 text-slate-300 hover:text-black'
                        }`}
                      >
                        {!isActive && (
                          <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                        )}
                        <span className="relative z-10 transition-colors duration-1000">+{pct}%</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Stop Loss Row */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[10px] font-sans">
                <span className="text-[#FF5C77] font-bold">Stop Loss (SL)</span>
                <span className="text-[#FF5C77] font-mono text-[11px] font-bold">
                  Est: -${estimatedLossUSD} USDT
                </span>
              </div>
              <div className="flex items-stretch gap-2">
                <div className="relative flex-1 flex items-center h-16 px-3 rounded-xl bg-[#1B1A21] border border-white/5 focus-within:border-[#FF5C77]/40 transition-colors">
                  <input
                    type="text"
                    value={slPrice}
                    onChange={(e) => {
                      setSlPrice(e.target.value);
                      setActiveSlPreset(null);
                    }}
                    className="w-full text-xs font-mono font-bold text-white bg-transparent focus:outline-none"
                    placeholder="SL Price"
                  />
                  <span className="text-[10px] font-mono font-bold text-slate-500 pl-1">USDT</span>
                </div>

                {/* 2x2 Preset Grid for SL with 1000ms Sweep Hover */}
                <div className="grid grid-cols-2 gap-1 w-28">
                  {[2, 5, 10, 20].map((pct) => {
                    const isActive = activeSlPreset === pct;
                    return (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => handleSlPreset(pct)}
                        className={`group relative flex items-center justify-center py-1.5 px-2 rounded-lg text-[10px] font-bold font-mono overflow-hidden transition-colors duration-1000 cursor-pointer ${
                          isActive
                            ? 'bg-[#FF5C77] text-white font-extrabold shadow-sm'
                            : 'bg-[#1B1A21] border border-white/5 text-slate-300 hover:text-white'
                        }`}
                      >
                        {!isActive && (
                          <span className="absolute inset-0 bg-[#FF5C77] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                        )}
                        <span className="relative z-10 transition-colors duration-1000">-{pct}%</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 8. Fee and Margin Stats Breakdown (Dynamically Computed) */}
      <div className="flex flex-col space-y-1.5 pt-1 text-[11px] font-mono-num border-t border-white/5">
        <div className="flex justify-between text-slate-400">
          <span className="font-sans">Comission:</span>
          <span className="font-bold text-white">-{commission} USDT</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span className="font-sans">Av. liquidation price:</span>
          <span className="font-bold text-white">{liquidationPrice} USDT</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span className="font-sans">Margin:</span>
          <span className="font-bold text-white">{marginRequired} USDT</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span className="font-sans">Max position amount:</span>
          <span className="font-bold text-white">{maxPositionAmount} USDT</span>
        </div>
      </div>

      {/* 8. Big Place Order CTA Button (Solid Green, No Hover Animation) */}
      <button
        type="button"
        onClick={handlePlaceOrder}
        disabled={isSubmitting}
        className="w-full h-11 rounded-2xl bg-[#00E163] text-black font-black text-xs tracking-wider shadow-lg shadow-[#00E163]/20 cursor-pointer disabled:opacity-50 active:scale-[0.99] transition-transform"
      >
        {isSubmitting ? 'EXECUTING ORDER...' : 'Place Order'}
      </button>

      {/* 9. Margin Usage Box */}
      <div className="flex flex-col space-y-2 pt-3 border-t border-white/5 text-[11px] font-mono-num">
        <h4 className="text-xs font-bold text-white font-heading tracking-wide">
          Margin Usage
        </h4>
        <div className="flex justify-between text-slate-400">
          <span className="font-sans">Margin Balance:</span>
          <span className="font-bold text-slate-200">101,200</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span className="font-sans">USDT Wallet balance:</span>
          <span className="font-bold text-slate-200">100,000</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span className="font-sans">USDT Wallet usage:</span>
          <span className="font-bold text-slate-200">10,000 / 10%</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span className="font-sans">Max Cross margin:</span>
          <span className="font-bold text-slate-200">
            10,000 <span className="text-[#FF5C77]">+300</span>
          </span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span className="font-sans">Unrealised PNL:</span>
          <span className="font-bold text-[#00E163]">+8,000 / ▲ 2%</span>
        </div>
      </div>
    </div>
  );
};
