'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShieldCheck } from 'lucide-react';
import { useTradingStore } from '@/store/useTradingStore';
import { MarketIcon } from '@/components/MarketIcon';
import { getAssetConfig } from '@/lib/assetConfig';

interface CreateOrderCardProps {
  onOrderSuccess?: (msg: string) => void;
}

export const CreateOrderCard: React.FC<CreateOrderCardProps> = ({ onOrderSuccess }) => {
  const { selectedSymbol, tickers, addOrder } = useTradingStore();
  const config = getAssetConfig(selectedSymbol);

  const currentTicker = tickers[selectedSymbol];
  const unitPrice = currentTicker?.price ?? config.defaultPrice;

  const [orderSide, setOrderSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderTab, setOrderTab] = useState<'Price Limit' | 'Market Price' | 'Stop Limit'>('Price Limit');
  const [priceInput, setPriceInput] = useState<string>(unitPrice.toString());
  const [stopPriceInput, setStopPriceInput] = useState<string>((unitPrice * 0.99).toFixed(config.decimals));
  const [amountInput, setAmountInput] = useState<string>('0.10');
  const [percentActive, setPercentActive] = useState<number | null>(25);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // TP / SL (Take Profit & Stop Loss) State
  const [isTPSLEnabled, setIsTPSLEnabled] = useState<boolean>(false);
  const [tpInput, setTpInput] = useState<string>('');
  const [slInput, setSlInput] = useState<string>('');

  // Sync price when selectedSymbol changes or ticker updates
  useEffect(() => {
    if (orderTab === 'Market Price') {
      setPriceInput(unitPrice.toFixed(config.decimals));
    } else {
      setPriceInput(unitPrice.toFixed(config.decimals));
      setStopPriceInput((unitPrice * 0.99).toFixed(config.decimals));
    }
  }, [selectedSymbol, unitPrice, orderTab, config.decimals]);

  // Auto-calculate suggested default TP / SL prices when unitPrice or orderSide changes
  useEffect(() => {
    if (orderSide === 'BUY') {
      setTpInput((unitPrice * 1.025).toFixed(config.decimals));
      setSlInput((unitPrice * 0.985).toFixed(config.decimals));
    } else {
      setTpInput((unitPrice * 0.975).toFixed(config.decimals));
      setSlInput((unitPrice * 1.015).toFixed(config.decimals));
    }
  }, [selectedSymbol, unitPrice, orderSide, config.decimals]);

  const priceNum = parseFloat(priceInput) || unitPrice;
  const amountNum = parseFloat(amountInput) || 0;
  const tpNum = parseFloat(tpInput) || 0;
  const slNum = parseFloat(slInput) || 0;

  // Authentic Broker Contract Multiplier Calculation
  const getContractMultiplier = () => {
    if (config.category === 'forex') return 100000; // 1 Standard Lot = 100,000 units
    if (config.symbol === 'XAUUSD') return 100;    // 1 Gold Lot = 100 oz
    if (config.symbol === 'XAGUSD') return 5000;   // 1 Silver Lot = 5,000 oz
    if (config.symbol === 'USOIL') return 1000;    // 1 Oil Lot = 1,000 Barrels
    return 1; // Crypto & Stock Indices: 1 Lot = 1 Coin / Unit
  };

  const contractMultiplier = getContractMultiplier();
  const total =
    config.category === 'crypto' || config.symbol === 'SPX500' || config.symbol === 'NAS100' || config.symbol === 'US30'
      ? priceNum * amountNum
      : amountNum * contractMultiplier * priceNum;

  // Stepper handlers for smooth increment/decrement
  const handlePriceStep = (delta: number) => {
    const cur = parseFloat(priceInput) || unitPrice;
    const next = Math.max(config.tickSize, cur + delta);
    setPriceInput(next.toFixed(config.decimals));
    setPercentActive(null);
  };

  const handleStopPriceStep = (delta: number) => {
    const cur = parseFloat(stopPriceInput) || unitPrice;
    const next = Math.max(config.tickSize, cur + delta);
    setStopPriceInput(next.toFixed(config.decimals));
  };

  const handleAmountStep = (delta: number) => {
    const cur = parseFloat(amountInput) || 0.01;
    const next = Math.max(0.01, Math.round((cur + delta) * 100) / 100);
    setAmountInput(next.toFixed(2));
    setPercentActive(null);
  };

  const handleTpStep = (delta: number) => {
    const cur = parseFloat(tpInput) || unitPrice;
    const next = Math.max(config.tickSize, cur + delta);
    setTpInput(next.toFixed(config.decimals));
  };

  const handleSlStep = (delta: number) => {
    const cur = parseFloat(slInput) || unitPrice;
    const next = Math.max(config.tickSize, cur + delta);
    setSlInput(next.toFixed(config.decimals));
  };

  // Calculate Projected Est. PnL for TP & SL (Binance / Bybit / Exness Formula)
  const calculateEstPnL = (targetPrice: number) => {
    if (!targetPrice || !priceNum || !amountNum) return { usd: 0, pct: 0 };
    const diff = orderSide === 'BUY' ? targetPrice - priceNum : priceNum - targetPrice;
    const pnlUsd =
      config.category === 'crypto' || config.symbol === 'SPX500' || config.symbol === 'NAS100' || config.symbol === 'US30'
        ? diff * amountNum
        : diff * contractMultiplier * amountNum;
    const pnlPct = (diff / priceNum) * 100;
    return { usd: pnlUsd, pct: pnlPct };
  };

  const tpPnL = calculateEstPnL(tpNum);
  const slPnL = calculateEstPnL(slNum);

  // Broker Standard Lot Allocation: 25% = 0.10 Lot, 50% = 0.50 Lot, 75% = 0.75 Lot, 100% = 1.00 Lot
  const handlePercentClick = (pct: number) => {
    setPercentActive(pct);
    let lotVal = '0.10';
    if (pct === 25) lotVal = '0.10';
    else if (pct === 50) lotVal = '0.50';
    else if (pct === 75) lotVal = '0.75';
    else if (pct === 100) lotVal = '1.00';

    setAmountInput(lotVal);
  };

  const handlePlaceOrder = () => {
    if (!amountNum || amountNum <= 0) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const newOrder = {
        id: `ord_${Date.now()}`,
        user_id: 'user_1',
        symbol: selectedSymbol,
        side: orderSide,
        type: (orderTab === 'Market Price' ? 'MARKET' : 'LIMIT') as any,
        price: orderTab === 'Market Price' ? unitPrice : priceNum,
        amount: amountNum,
        filled_amount: 0,
        status: 'OPEN' as const,
        created_at: new Date().toISOString(),
      };

      addOrder(newOrder);
      setIsSubmitting(false);

      const formattedTotal = total.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      const tpslNotice = isTPSLEnabled ? ` (TP: $${tpNum} | SL: $${slNum})` : '';

      onOrderSuccess?.(
        `Order Placed: ${orderSide} ${amountNum} LOT ${config.symbol} @ ${config.prefix}${priceNum.toLocaleString('en-US', {
          minimumFractionDigits: config.decimals,
        })}${tpslNotice} - Total: $${formattedTotal}`
      );
    }, 300);
  };

  const isBrokerLotAsset = config.category === 'forex' || config.category === 'cfd';

  return (
    <div className="flex flex-col w-full bg-[#1F1E25] border border-white/5 rounded-3xl p-5 select-none transition-all">
      {/* Title */}
      <h3 className="text-sm font-bold text-white mb-3 tracking-wide font-heading">
        Create Order
      </h3>

      {/* Side Toggle: BUY / LONG vs SELL / SHORT with Left-to-Right Sweep (1000ms) */}
      <div className="grid grid-cols-2 p-1 bg-[#26252E] border border-white/5 rounded-xl mb-3 text-xs font-bold gap-1">
        {/* BUY Button */}
        <button
          type="button"
          onClick={() => setOrderSide('BUY')}
          className={`group relative py-2 rounded-lg font-bold overflow-hidden transition-colors duration-1000 cursor-pointer ${
            orderSide === 'BUY'
              ? 'bg-[#00E163] text-black font-bold'
              : 'text-slate-400 hover:text-black'
          }`}
        >
          {orderSide !== 'BUY' && (
            <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
          )}
          <span className="relative z-10 transition-colors duration-1000">BUY / LONG</span>
        </button>

        {/* SELL Button */}
        <button
          type="button"
          onClick={() => setOrderSide('SELL')}
          className={`group relative py-2 rounded-lg font-bold overflow-hidden transition-colors duration-1000 cursor-pointer ${
            orderSide === 'SELL'
              ? 'bg-[#362227] text-[#FF5C77] border border-[#FF5C77]/30 font-bold'
              : 'text-slate-400 hover:text-[#FF5C77]'
          }`}
        >
          {orderSide !== 'SELL' && (
            <span className="absolute inset-0 bg-[#362227] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
          )}
          <span className="relative z-10 transition-colors duration-1000">SELL / SHORT</span>
        </button>
      </div>

      {/* Tabs (Price Limit vs Market Price vs Stop Limit) with Left-to-Right Green Sweep (1000ms) */}
      <div className="flex items-center w-full p-1 bg-[#26252E] border border-white/5 rounded-xl mb-4 text-[11px] font-semibold gap-1">
        {(['Price Limit', 'Market Price', 'Stop Limit'] as const).map((tab) => {
          const isActive = orderTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setOrderTab(tab)}
              className={`group relative flex-1 py-2 rounded-lg overflow-hidden transition-colors duration-1000 cursor-pointer ${
                isActive
                  ? 'bg-[#00E163] text-black font-bold'
                  : 'text-slate-400 hover:text-black'
              }`}
            >
              {!isActive && (
                <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
              )}
              <span className="relative z-10 transition-colors duration-1000">{tab}</span>
            </button>
          );
        })}
      </div>

      {/* Side & Asset Info Row with Authentic Vector Logo */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <MarketIcon symbol={selectedSymbol} size="sm" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white tracking-wide">
              {config.name}
            </span>
            <span
              className={`text-[9px] font-bold uppercase ${
                orderSide === 'BUY' ? 'text-[#00E163]' : 'text-[#FF5C77]'
              }`}
            >
              {orderSide} Order
            </span>
          </div>
        </div>
        <span className="text-[11px] font-mono-num font-semibold text-slate-400">
          1 {config.unit} = ${unitPrice.toLocaleString('en-US', {
            minimumFractionDigits: config.decimals,
            maximumFractionDigits: config.decimals,
          })}
        </span>
      </div>

      {/* Form Inputs with Custom Sleek Steppers */}
      <div className="flex flex-col space-y-3">
        {/* Stop Price Input (Only for Stop Limit) */}
        {orderTab === 'Stop Limit' && (
          <div>
            <label className="block text-[11px] text-slate-400 font-medium mb-1">
              Stop Price
            </label>
            <div className="relative flex items-center w-full bg-[#26252E] border border-white/5 rounded-xl overflow-hidden focus-within:border-[#00E163]/50 transition-colors">
              <button
                type="button"
                onClick={() => handleStopPriceStep(-config.tickSize)}
                className="w-9 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all cursor-pointer font-bold text-base select-none shrink-0"
                title="Decrease stop price"
              >
                −
              </button>

              <input
                type="number"
                step="any"
                value={stopPriceInput}
                onChange={(e) => setStopPriceInput(e.target.value)}
                className="min-w-0 flex-1 w-0 h-10 px-1 text-xs font-bold text-white font-mono-num bg-transparent focus:outline-none text-center"
              />

              <button
                type="button"
                onClick={() => handleStopPriceStep(config.tickSize)}
                className="w-9 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all cursor-pointer font-bold text-base select-none shrink-0"
                title="Increase stop price"
              >
                +
              </button>

              <div className="pr-3 pl-1 flex items-center gap-1 shrink-0 border-l border-white/5 my-auto h-6">
                <div className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#00E163] text-[8px] font-black text-black">
                  $
                </div>
                <span className="text-[10px] font-bold text-slate-300">USD</span>
              </div>
            </div>
          </div>
        )}

        {/* Price Input with Custom Stepper Buttons */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] text-slate-400 font-medium">
              {orderTab === 'Market Price' ? 'Market Execution Price' : 'Price Limit'}
            </label>
            {orderTab === 'Market Price' && (
              <span className="text-[10px] text-[#00E163] font-bold">Best Market Rate</span>
            )}
          </div>
          <div className="relative flex items-center w-full bg-[#26252E] border border-white/5 rounded-xl overflow-hidden focus-within:border-[#00E163]/50 transition-colors">
            {orderTab !== 'Market Price' && (
              <button
                type="button"
                onClick={() => handlePriceStep(-config.tickSize)}
                className="w-9 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all cursor-pointer font-bold text-base select-none shrink-0"
                title="Decrease price"
              >
                −
              </button>
            )}

            <input
              type="number"
              step="any"
              disabled={orderTab === 'Market Price'}
              value={priceInput}
              onChange={(e) => {
                setPriceInput(e.target.value);
                setPercentActive(null);
              }}
              className={`min-w-0 flex-1 w-0 h-10 px-1 text-xs font-bold text-white font-mono-num bg-transparent focus:outline-none text-center ${
                orderTab === 'Market Price' ? 'opacity-80 cursor-not-allowed' : ''
              }`}
            />

            {orderTab !== 'Market Price' && (
              <button
                type="button"
                onClick={() => handlePriceStep(config.tickSize)}
                className="w-9 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all cursor-pointer font-bold text-base select-none shrink-0"
                title="Increase price"
              >
                +
              </button>
            )}

            <div className="pr-3 pl-1 flex items-center gap-1 shrink-0 border-l border-white/5 my-auto h-6">
              <div className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#00E163] text-[8px] font-black text-black">
                $
              </div>
              <span className="text-[10px] font-bold text-slate-300">USD</span>
            </div>
          </div>
        </div>

        {/* Amount / Lot Input with Custom Stepper Buttons */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] text-slate-400 font-medium">
              {isBrokerLotAsset ? 'Volume (Lot)' : `Amount (${config.unit})`}
            </label>
            {isBrokerLotAsset && (
              <span className="text-[10px] text-slate-500 font-mono">
                1 Lot = {contractMultiplier.toLocaleString('en-US')} {config.unit}
              </span>
            )}
          </div>
          <div className="relative flex items-center w-full bg-[#26252E] border border-white/5 rounded-xl overflow-hidden focus-within:border-[#00E163]/50 transition-colors">
            {/* Decrement Button */}
            <button
              type="button"
              onClick={() => handleAmountStep(-0.01)}
              className="w-9 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all cursor-pointer font-bold text-base select-none shrink-0"
              title="Decrease amount"
            >
              −
            </button>

            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amountInput}
              onChange={(e) => {
                setAmountInput(e.target.value);
                setPercentActive(null);
              }}
              className="min-w-0 flex-1 w-0 h-10 px-1 text-xs font-bold text-white font-mono-num bg-transparent focus:outline-none text-center"
            />

            {/* Increment Button */}
            <button
              type="button"
              onClick={() => handleAmountStep(0.01)}
              className="w-9 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all cursor-pointer font-bold text-base select-none shrink-0"
              title="Increase amount"
            >
              +
            </button>

            <div className="pr-3 pl-1 flex items-center shrink-0 border-l border-white/5 my-auto h-6">
              <span className="text-[10px] font-extrabold text-[#00E163] font-mono">
                {isBrokerLotAsset ? 'LOT' : config.unit}
              </span>
            </div>
          </div>
        </div>

        {/* Broker Standard Quick Lot Sizing with 1000ms Left-to-Right Sweep */}
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {[
            { pct: 25, label: '25%', sub: '0.1 LOT' },
            { pct: 50, label: '50%', sub: '0.5 LOT' },
            { pct: 75, label: '75%', sub: '0.75 LOT' },
            { pct: 100, label: '100%', sub: '1.0 LOT' },
          ].map(({ pct, label, sub }) => {
            const isActive = percentActive === pct;
            return (
              <button
                key={pct}
                type="button"
                onClick={() => handlePercentClick(pct)}
                className={`group relative flex flex-col items-center py-1.5 px-1 rounded-lg border overflow-hidden transition-colors duration-1000 cursor-pointer select-none ${
                  isActive
                    ? 'bg-[#00E163] border-[#00E163] text-black font-bold'
                    : 'bg-[#26252E] border-white/5 text-slate-400 hover:text-black hover:border-[#00E163]/40'
                }`}
              >
                {!isActive && (
                  <span className="absolute inset-0 bg-[#00E163] -translate-x-[105%] opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none" />
                )}
                <span className="relative z-10 text-[11px] font-black leading-none transition-colors duration-1000">
                  {label}
                </span>
                <span
                  className={`relative z-10 text-[9px] font-mono font-bold mt-0.5 leading-none transition-colors duration-1000 ${
                    isActive ? 'text-black/80' : 'text-slate-500 group-hover:text-black/80'
                  }`}
                >
                  {sub}
                </span>
              </button>
            );
          })}
        </div>

        {/* TAKE PROFIT (TP) & STOP LOSS (SL) PRO BROKER ACCORDION MODULE */}
        <div className="pt-2 border-t border-white/5">
          {/* Checkbox Trigger Row with smooth hover */}
          <div
            onClick={() => setIsTPSLEnabled(!isTPSLEnabled)}
            className="group relative flex items-center justify-between py-2 px-2.5 rounded-xl bg-[#26252E] border border-white/5 hover:border-[#00E163]/30 overflow-hidden cursor-pointer select-none transition-all duration-300"
          >
            <div className="flex items-center gap-2 relative z-10">
              <div
                className={`flex items-center justify-center w-4 h-4 rounded border transition-all ${
                  isTPSLEnabled
                    ? 'bg-[#00E163] border-[#00E163] text-black'
                    : 'border-white/30 bg-transparent group-hover:border-[#00E163]'
                }`}
              >
                {isTPSLEnabled && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck
                  className={`w-3.5 h-3.5 transition-colors ${
                    isTPSLEnabled ? 'text-[#00E163]' : 'text-slate-400 group-hover:text-[#00E163]'
                  }`}
                />
                <span className="text-[11px] font-bold text-white group-hover:text-[#00E163] transition-colors">
                  Take Profit / Stop Loss (TP / SL)
                </span>
              </div>
            </div>
            <span
              className={`relative z-10 text-[10px] font-mono font-bold px-2 py-0.5 rounded transition-colors ${
                isTPSLEnabled
                  ? 'bg-[#00E163] text-black'
                  : 'bg-white/5 text-slate-400 group-hover:text-white'
              }`}
            >
              {isTPSLEnabled ? 'ON' : 'OFF'}
            </span>
          </div>

          {/* TP & SL Active Inputs with Custom Stepper Buttons */}
          <AnimatePresence>
            {isTPSLEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -4 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col space-y-2 pt-2"
              >
                {/* Take Profit (TP) Container */}
                <div className="p-2.5 rounded-xl bg-[#26252E] border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-[#00E163] uppercase">
                      Take Profit (TP)
                    </span>
                    <span className="text-[10px] font-mono-num font-bold text-[#00E163]">
                      Est. Profit: +${Math.max(0, tpPnL.usd).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{' '}
                      (+{Math.max(0, tpPnL.pct).toFixed(2)}%)
                    </span>
                  </div>
                  <div className="relative flex items-center bg-[#1B1A21] border border-white/5 rounded-lg overflow-hidden focus-within:border-[#00E163]/50">
                    <button
                      type="button"
                      onClick={() => handleTpStep(-config.tickSize)}
                      className="w-7 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer font-bold text-sm select-none shrink-0"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      step="any"
                      value={tpInput}
                      onChange={(e) => setTpInput(e.target.value)}
                      placeholder="Harga Take Profit..."
                      className="min-w-0 flex-1 w-0 h-8 px-1 text-xs font-bold text-white font-mono-num bg-transparent focus:outline-none text-center"
                    />
                    <button
                      type="button"
                      onClick={() => handleTpStep(config.tickSize)}
                      className="w-7 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer font-bold text-sm select-none shrink-0"
                    >
                      +
                    </button>
                    <span className="pr-2.5 pl-1 text-[10px] font-bold text-slate-400 shrink-0 border-l border-white/5 my-auto h-4">
                      USD
                    </span>
                  </div>
                </div>

                {/* Stop Loss (SL) Container */}
                <div className="p-2.5 rounded-xl bg-[#362227]/70 border border-[#FF5C77]/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-[#FF5C77] uppercase">
                      Stop Loss (SL)
                    </span>
                    <span className="text-[10px] font-mono-num font-bold text-[#FF5C77]">
                      Est. Loss: -${Math.abs(Math.min(0, slPnL.usd)).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{' '}
                      ({slPnL.pct.toFixed(2)}%)
                    </span>
                  </div>
                  <div className="relative flex items-center bg-[#1B1A21] border border-white/5 rounded-lg overflow-hidden focus-within:border-[#FF5C77]/50">
                    <button
                      type="button"
                      onClick={() => handleSlStep(-config.tickSize)}
                      className="w-7 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer font-bold text-sm select-none shrink-0"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      step="any"
                      value={slInput}
                      onChange={(e) => setSlInput(e.target.value)}
                      placeholder="Harga Stop Loss..."
                      className="min-w-0 flex-1 w-0 h-8 px-1 text-xs font-bold text-white font-mono-num bg-transparent focus:outline-none text-center"
                    />
                    <button
                      type="button"
                      onClick={() => handleSlStep(config.tickSize)}
                      className="w-7 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer font-bold text-sm select-none shrink-0"
                    >
                      +
                    </button>
                    <span className="pr-2.5 pl-1 text-[10px] font-bold text-slate-400 shrink-0 border-l border-white/5 my-auto h-4">
                      USD
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Total Contract Price Display */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-400 font-medium">
            {isBrokerLotAsset ? 'Total Contract Value' : 'Total'}
          </span>
          <span className="text-sm font-extrabold text-[#00E163] font-mono-num">
            ${total.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        {/* Place Order CTA Button (Dynamic BUY Green / SELL Red) */}
        <button
          onClick={handlePlaceOrder}
          disabled={isSubmitting || amountNum <= 0}
          className={`w-full h-11 mt-2 text-xs font-extrabold tracking-wider rounded-xl hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 ${
            orderSide === 'BUY'
              ? 'bg-[#00E163] text-black font-bold'
              : 'bg-[#362227] text-[#FF5C77] border border-[#FF5C77]/40 hover:bg-[#462b32] font-bold'
          }`}
        >
          {isSubmitting
            ? 'PROCESSING...'
            : `${orderSide} ${amountNum} ${isBrokerLotAsset ? 'LOT' : config.unit}`}
        </button>
      </div>
    </div>
  );
};
