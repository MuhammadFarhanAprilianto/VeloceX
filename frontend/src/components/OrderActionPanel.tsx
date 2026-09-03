'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTradingStore } from '@/store/useTradingStore';
import { useAuthStore } from '@/store/useAuthStore';
import { fetchWithAuth } from '@/lib/api';
import { Wallet, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';

interface OrderActionPanelProps {
  initialPrice?: number;
  onOrderSuccess?: (msg: string) => void;
}

export const OrderActionPanel: React.FC<OrderActionPanelProps> = ({ initialPrice, onOrderSuccess }) => {
  const { selectedSymbol, tickers, addOrder, portfolio, setPortfolio } = useTradingStore();
  const { isAuthenticated } = useAuthStore();

  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'LIMIT' | 'MARKET'>('LIMIT');
  const [price, setPrice] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [sliderPercent, setSliderPercent] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentTicker = tickers[selectedSymbol];
  const baseCurrency = selectedSymbol.replace('USDT', '');

  // Fill default price
  useEffect(() => {
    if (initialPrice) {
      setPrice(initialPrice.toString());
    } else if (currentTicker && !price) {
      setPrice(currentTicker.price.toString());
    }
  }, [initialPrice, currentTicker?.price]);

  // Find user available balance
  const quoteWallet = portfolio?.assets.find((a) => a.currency === 'USDT');
  const baseWallet = portfolio?.assets.find((a) => a.currency === baseCurrency);

  const availableBalance = side === 'BUY'
    ? (quoteWallet?.balance ?? 50000.0)
    : (baseWallet?.balance ?? 1.5);

  const currencyLabel = side === 'BUY' ? 'USDT' : baseCurrency;

  // Percentage slider change with automatic amount calculation
  const handleSliderChange = (percent: number) => {
    setSliderPercent(percent);
    if (availableBalance <= 0) return;

    if (side === 'BUY') {
      const execPrice = orderType === 'LIMIT' ? parseFloat(price) || currentTicker?.price || 1 : currentTicker?.price || 1;
      const totalUSDT = availableBalance * (percent / 100);
      const calculatedAmount = totalUSDT / execPrice;
      setAmount(calculatedAmount.toFixed(4));
    } else {
      const calculatedAmount = availableBalance * (percent / 100);
      setAmount(calculatedAmount.toFixed(4));
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setErrorMessage('Please enter a valid amount');
      return;
    }

    const parsedPrice = orderType === 'LIMIT' ? parseFloat(price) : (currentTicker?.price ?? 0);
    if (orderType === 'LIMIT' && (!parsedPrice || parsedPrice <= 0)) {
      setErrorMessage('Please enter a valid limit price');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetchWithAuth('/orders', {
        method: 'POST',
        body: JSON.stringify({
          symbol: selectedSymbol,
          side,
          type: orderType,
          price: parsedPrice,
          amount: parsedAmount,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to place order');
      }

      const createdOrder = await res.json();
      addOrder(createdOrder);
      onOrderSuccess?.(`${side} ${parsedAmount} ${baseCurrency} order submitted!`);

      // Reset fields
      setAmount('');
      setSliderPercent(0);
    } catch (err: any) {
      setErrorMessage(err.message || 'Order execution error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col border-l border-dark-800 bg-dark-900 p-4 text-xs">
      {/* Side Selector Tabs (Buy vs Sell) with Framer Motion layoutId */}
      <div className="relative mb-4 grid grid-cols-2 rounded-xl bg-dark-850 p-1">
        <button
          type="button"
          onClick={() => {
            setSide('BUY');
            setSliderPercent(0);
            setAmount('');
          }}
          className={`relative z-10 py-2 text-center text-sm font-bold transition-colors ${
            side === 'BUY' ? 'text-slate-950' : 'text-slate-400 hover:text-white'
          }`}
        >
          Buy {baseCurrency}
          {side === 'BUY' && (
            <motion.div
              layoutId="active-tab"
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="absolute inset-0 z-[-1] rounded-lg bg-emerald-400 shadow-md shadow-emerald-500/30"
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setSide('SELL');
            setSliderPercent(0);
            setAmount('');
          }}
          className={`relative z-10 py-2 text-center text-sm font-bold transition-colors ${
            side === 'SELL' ? 'text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Sell {baseCurrency}
          {side === 'SELL' && (
            <motion.div
              layoutId="active-tab"
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="absolute inset-0 z-[-1] rounded-lg bg-rose-500 shadow-md shadow-rose-500/30"
            />
          )}
        </button>
      </div>

      {/* Order Type Toggle (Limit vs Market) */}
      <div className="mb-4 flex items-center gap-2 border-b border-dark-800 pb-2">
        <button
          type="button"
          onClick={() => setOrderType('LIMIT')}
          className={`rounded-lg px-3 py-1 font-semibold transition-colors ${
            orderType === 'LIMIT'
              ? 'bg-dark-800 text-white border border-dark-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Limit
        </button>
        <button
          type="button"
          onClick={() => setOrderType('MARKET')}
          className={`rounded-lg px-3 py-1 font-semibold transition-colors ${
            orderType === 'MARKET'
              ? 'bg-dark-800 text-white border border-dark-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Market
        </button>
      </div>

      {/* Balance Indicator */}
      <div className="mb-4 flex items-center justify-between rounded-lg bg-dark-850 px-3 py-2 text-slate-400">
        <span className="flex items-center gap-1.5 font-medium">
          <Wallet className="h-3.5 w-3.5 text-slate-400" />
          Avail. Balance:
        </span>
        <span className="font-mono-num font-bold text-slate-200">
          {availableBalance.toLocaleString('en-US', { maximumFractionDigits: 4 })} {currencyLabel}
        </span>
      </div>

      {/* Form Inputs */}
      <form onSubmit={handleSubmitOrder} className="flex flex-1 flex-col justify-between space-y-4">
        <div className="space-y-3.5">
          {/* Price Input (if LIMIT) */}
          {orderType === 'LIMIT' && (
            <div>
              <label className="mb-1 block font-medium text-slate-400">Order Price</label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-dark-700 bg-dark-850 px-3.5 py-2.5 font-mono-num text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <span className="absolute right-3.5 text-slate-500 font-semibold text-xs">USDT</span>
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="mb-1 block font-medium text-slate-400">Order Amount</label>
            <div className="relative flex items-center">
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setSliderPercent(0);
                }}
                placeholder="0.0000"
                className="w-full rounded-xl border border-dark-700 bg-dark-850 px-3.5 py-2.5 font-mono-num text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="absolute right-3.5 text-slate-500 font-semibold text-xs">
                {baseCurrency}
              </span>
            </div>
          </div>

          {/* Percentage Chips & Spring Physics Slider */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Quick Allocation</span>
              <span className="font-mono-num text-[11px] font-bold text-slate-300">
                {sliderPercent}%
              </span>
            </div>

            {/* Slider with spring physics */}
            <div className="relative my-2">
              <input
                type="range"
                min={0}
                max={100}
                step={25}
                value={sliderPercent}
                onChange={(e) => handleSliderChange(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-dark-750 accent-emerald-400"
              />
            </div>

            {/* Percentage Chips with spring hover animation */}
            <div className="grid grid-cols-4 gap-1.5">
              {[25, 50, 75, 100].map((pct) => (
                <motion.button
                  key={pct}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSliderChange(pct)}
                  className={`rounded-lg py-1 font-mono-num text-[11px] font-semibold transition-colors ${
                    sliderPercent === pct
                      ? side === 'BUY'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : 'bg-dark-850 text-slate-400 hover:bg-dark-800 hover:text-slate-200'
                  }`}
                >
                  {pct}%
                </motion.button>
              ))}
            </div>
          </div>

          {/* Estimated Total Calculation */}
          <div className="rounded-lg bg-dark-850/80 p-3 text-[11px] space-y-1 border border-dark-800">
            <div className="flex justify-between text-slate-400">
              <span>Order Value:</span>
              <span className="font-mono-num font-semibold text-slate-200">
                ≈ ${(
                  (parseFloat(amount) || 0) *
                  (orderType === 'LIMIT' ? parseFloat(price) || currentTicker?.price || 0 : currentTicker?.price || 0)
                ).toFixed(2)}{' '}
                USDT
              </span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Est. Fee (0.1%):</span>
              <span className="font-mono-num text-slate-400">
                ${(
                  (parseFloat(amount) || 0) *
                  (orderType === 'LIMIT' ? parseFloat(price) || currentTicker?.price || 0 : currentTicker?.price || 0) *
                  0.001
                ).toFixed(3)}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-lg bg-rose-500/15 p-2.5 text-[11px] text-rose-400 border border-rose-500/30"
            >
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}
        </div>

        {/* CTA Submit Button */}
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-extrabold shadow-lg transition-all ${
            side === 'BUY'
              ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/25 hover:bg-emerald-400'
              : 'bg-rose-500 text-white shadow-rose-500/25 hover:bg-rose-600'
          } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? (
            <span>Executing Transaction...</span>
          ) : (
            <>
              <span>
                {side} {baseCurrency}
              </span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
};
