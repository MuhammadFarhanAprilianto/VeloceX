'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useTradingStore } from '@/store/useTradingStore';
import { Candlestick } from '@/types/trading';
import { Maximize2, RefreshCw } from 'lucide-react';

export const CandlestickChart: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<any>(null);
  const candleSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);

  const { selectedSymbol, latestCandle, tickers } = useTradingStore();
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '15m' | '1h' | '1D'>('1m');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize and load historical data
  useEffect(() => {
    let isDisposed = false;

    async function initChart() {
      if (!chartContainerRef.current) return;

      // Dynamically load Lightweight Charts on client
      const { createChart, ColorType, CrosshairMode } = await import('lightweight-charts');

      if (isDisposed) return;

      // Clear previous container content
      if (chartContainerRef.current) {
        chartContainerRef.current.innerHTML = '';
      }

      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight || 460,
        layout: {
          background: { type: ColorType.Solid, color: '#0b0f19' },
          textColor: '#94a3b8',
          fontSize: 12,
          fontFamily: "'JetBrains Mono', monospace",
        },
        grid: {
          vertLines: { color: 'rgba(30, 41, 59, 0.4)' },
          horzLines: { color: 'rgba(30, 41, 59, 0.4)' },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: {
            color: '#38bdf8',
            width: 1,
            style: 3,
            labelBackgroundColor: '#0f172a',
          },
          horzLine: {
            color: '#38bdf8',
            width: 1,
            style: 3,
            labelBackgroundColor: '#0f172a',
          },
        },
        rightPriceScale: {
          borderColor: 'rgba(51, 65, 85, 0.5)',
          scaleMargins: {
            top: 0.1,
            bottom: 0.2,
          },
        },
        timeScale: {
          borderColor: 'rgba(51, 65, 85, 0.5)',
          timeVisible: true,
          secondsVisible: false,
        },
      });

      chartInstanceRef.current = chart;

      // Add Candlestick Series
      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#10b981',
        downColor: '#f43f5e',
        borderVisible: false,
        wickUpColor: '#10b981',
        wickDownColor: '#f43f5e',
      });
      candleSeriesRef.current = candlestickSeries;

      // Add Volume Series
      const volumeSeries = chart.addHistogramSeries({
        color: '#26a69a',
        priceFormat: { type: 'volume' },
        priceScaleId: '', // overlay
      });
      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });
      volumeSeriesRef.current = volumeSeries;

      // Fetch or generate initial candles
      try {
        setIsLoading(true);
        const res = await fetch(`http://localhost:8080/api/v1/market/candles?symbol=${selectedSymbol}`);
        let data: Candlestick[] = [];
        if (res.ok) {
          data = await res.json();
        }

        // If backend returned candles or fallback
        if (data && data.length > 0) {
          candlestickSeries.setData(
            data.map((c) => ({
              time: c.time as any,
              open: c.open,
              high: c.high,
              low: c.low,
              close: c.close,
            }))
          );

          volumeSeries.setData(
            data.map((c) => ({
              time: c.time as any,
              value: c.volume,
              color: c.close >= c.open ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)',
            }))
          );
        } else {
          // Fallback client-generated baseline series
          generateMockCandles(candlestickSeries, volumeSeries);
        }
      } catch (e) {
        generateMockCandles(candlestickSeries, volumeSeries);
      } finally {
        setIsLoading(false);
      }

      chart.timeScale().fitContent();

      // Resize listener
      const handleResize = () => {
        if (chartContainerRef.current) {
          chart.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
      };
    }

    initChart();

    return () => {
      isDisposed = true;
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
      }
    };
  }, [selectedSymbol]);

  // Update chart when live ticker ticks arrive
  const currentTicker = tickers[selectedSymbol];
  useEffect(() => {
    if (!candleSeriesRef.current || !currentTicker) return;

    const nowSeconds = Math.floor(Date.now() / 1000);
    const minuteSeconds = nowSeconds - (nowSeconds % 60);

    candleSeriesRef.current.update({
      time: minuteSeconds as any,
      open: currentTicker.price * 0.9995,
      high: Math.max(currentTicker.price, currentTicker.price * 1.0005),
      low: Math.min(currentTicker.price, currentTicker.price * 0.999),
      close: currentTicker.price,
    });
  }, [currentTicker]);

  function generateMockCandles(candleSeries: any, volumeSeries: any) {
    const base = selectedSymbol.startsWith('BTC') ? 67400 : selectedSymbol.startsWith('ETH') ? 3520 : 154;
    const now = Math.floor(Date.now() / 1000);
    const minuteAligned = now - (now % 60);
    const count = 100;

    let price = base * 0.97;
    const candleData: any[] = [];
    const volData: any[] = [];

    for (let i = 0; i < count; i++) {
      const time = minuteAligned - (count - i) * 60;
      const delta = (Math.random() - 0.48) * (price * 0.003);
      const open = price;
      const close = price + delta;
      const high = Math.max(open, close) + Math.random() * (price * 0.0015);
      const low = Math.min(open, close) - Math.random() * (price * 0.0015);
      const vol = 10 + Math.random() * 40;

      candleData.push({ time, open, high, low, close });
      volData.push({
        time,
        value: vol,
        color: close >= open ? 'rgba(16, 185, 129, 0.35)' : 'rgba(244, 63, 94, 0.35)',
      });
      price = close;
    }

    candleSeries.setData(candleData);
    volumeSeries.setData(volData);
  }

  const timeframes: ('1m' | '5m' | '15m' | '1h' | '1D')[] = ['1m', '5m', '15m', '1h', '1D'];

  return (
    <div className="flex h-full w-full flex-col bg-dark-900">
      {/* Chart Top Bar Controls */}
      <div className="flex items-center justify-between border-b border-dark-800 px-4 py-2 text-xs">
        <div className="flex items-center gap-1">
          <span className="mr-2 font-bold text-slate-400">Time:</span>
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`rounded-md px-2.5 py-1 font-semibold transition-colors ${
                timeframe === tf
                  ? 'bg-dark-700 text-emerald-400'
                  : 'text-slate-400 hover:bg-dark-800 hover:text-slate-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-slate-400">
          <span className="flex items-center gap-1 font-mono-num text-[11px] text-emerald-400/90">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Ticks
          </span>
          <button
            onClick={() => {
              if (chartInstanceRef.current) {
                chartInstanceRef.current.timeScale().fitContent();
              }
            }}
            className="hover:text-white"
            title="Fit Content"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative flex-1 w-full min-h-[440px]">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-dark-900/60 backdrop-blur-xs">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
              <span>Loading Candlestick Data...</span>
            </div>
          </div>
        )}
        <div ref={chartContainerRef} className="h-full w-full" />
      </div>
    </div>
  );
};
