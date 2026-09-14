import { NextRequest, NextResponse } from 'next/server';
import { ASSET_REGISTRY } from '@/lib/assetConfig';
import { Candlestick } from '@/types/trading';

const YAHOO_SYMBOLS: Record<string, string> = {
  // 1. Forex Pairs
  EURUSD: 'EURUSD=X',
  GBPUSD: 'GBPUSD=X',
  USDJPY: 'JPY=X',
  AUDUSD: 'AUDUSD=X',
  USDCAD: 'CAD=X',
  USDCHF: 'CHF=X',

  // 2. CFD & Commodities
  XAUUSD: 'GC=F',
  XAGUSD: 'SI=F',
  USOIL: 'CL=F',
  SPX500: '^GSPC',
  NAS100: '^NDX',
  US30: '^DJI',

  // 3. Crypto Assets (Real Market Feeds)
  BTCUSDT: 'BTC-USD',
  ETHUSDT: 'ETH-USD',
  SOLUSDT: 'SOL-USD',
  BNBUSDT: 'BNB-USD',
  LTCUSDT: 'LTC-USD',
  ADAUSDT: 'ADA-USD',
  USDTUSD: 'USDT-USD',
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get('symbol') || 'EURUSD').toUpperCase();
  const limit = parseInt(searchParams.get('limit') || '120', 10);

  const meta = ASSET_REGISTRY[symbol];
  const targetPrice = meta?.defaultPrice || 100;
  const decimals = meta?.decimals ?? 2;

  // 1. Forex EURUSD: Try TwelveData OANDA first
  if (symbol === 'EURUSD') {
    try {
      const tdRes = await fetch(
        `https://api.twelvedata.com/time_series?symbol=EUR/USD&exchange=OANDA&interval=1min&outputsize=${limit}&apikey=demo`,
        { next: { revalidate: 2 } }
      );
      if (tdRes.ok) {
        const tdData = await tdRes.json();
        if (tdData.status === 'ok' && Array.isArray(tdData.values) && tdData.values.length > 0) {
          const nowSec = Math.floor(Date.now() / 1000);
          const intervalSec = 60;
          const currentBucket = Math.floor(nowSec / intervalSec) * intervalSec;
          const total = tdData.values.length;
          const startTime = currentBucket - (total - 1) * intervalSec;

          const rawCandles = [...tdData.values].reverse().map((v: any, idx: number) => ({
            time: startTime + idx * intervalSec,
            open: parseFloat(v.open),
            high: parseFloat(v.high),
            low: parseFloat(v.low),
            close: parseFloat(v.close),
            volume: Math.floor(35 + Math.random() * 50),
          }));

          const lastClose = rawCandles[rawCandles.length - 1].close;
          const ratio = targetPrice / lastClose;

          const candles: Candlestick[] = rawCandles.map((c) => ({
            time: c.time,
            open: Number((c.open * ratio).toFixed(decimals)),
            high: Number((c.high * ratio).toFixed(decimals)),
            low: Number((c.low * ratio).toFixed(decimals)),
            close: Number((c.close * ratio).toFixed(decimals)),
            volume: c.volume,
          }));

          candles[candles.length - 1].close = targetPrice;
          return NextResponse.json(candles);
        }
      }
    } catch (_) {}
  }

  // 2. Real Market Historical Klines for Forex, CFD, and Crypto via Yahoo Finance
  const yahooSym = YAHOO_SYMBOLS[symbol];
  if (yahooSym) {
    try {
      const yUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSym)}?interval=1m&range=1d`;
      const res = await fetch(yUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        next: { revalidate: 5 },
      });

      if (res.ok) {
        const data = await res.json();
        const result = data?.chart?.result?.[0];
        const timestamps: number[] = result?.timestamp || [];
        const quotes = result?.indicators?.quote?.[0];

        if (timestamps.length > 0 && quotes) {
          const validBars: { time: number; open: number; high: number; low: number; close: number; volume: number }[] = [];
          for (let i = 0; i < timestamps.length; i++) {
            const o = quotes.open?.[i];
            const h = quotes.high?.[i];
            const l = quotes.low?.[i];
            const c = quotes.close?.[i];
            const v = quotes.volume?.[i] ?? 30;

            if (o != null && c != null && !isNaN(o) && !isNaN(c)) {
              validBars.push({
                time: timestamps[i],
                open: o,
                high: h ?? Math.max(o, c),
                low: l ?? Math.min(o, c),
                close: c,
                volume: v || 30,
              });
            }
          }

          if (validBars.length > 0) {
            const sliced = validBars.slice(-limit);
            const lastClose = sliced[sliced.length - 1].close;
            const ratio = targetPrice / lastClose;

            const candles: Candlestick[] = sliced.map((bar) => ({
              time: bar.time,
              open: Number((bar.open * ratio).toFixed(decimals)),
              high: Number((bar.high * ratio).toFixed(decimals)),
              low: Number((bar.low * ratio).toFixed(decimals)),
              close: Number((bar.close * ratio).toFixed(decimals)),
              volume: bar.volume,
            }));

            // Anchor last candle close exactly to targetPrice so live ticks stream seamlessly
            candles[candles.length - 1].close = targetPrice;
            candles[candles.length - 1].high = Math.max(candles[candles.length - 1].high, targetPrice);
            candles[candles.length - 1].low = Math.min(candles[candles.length - 1].low, targetPrice);

            return NextResponse.json(candles);
          }
        }
      }
    } catch (_) {}
  }

  // 3. Fallback for Crypto: Binance REST API if accessible
  const isCrypto = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'LTCUSDT', 'ADAUSDT'].includes(symbol);
  if (isCrypto) {
    try {
      const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&limit=${limit}`, {
        next: { revalidate: 2 },
      });
      if (res.ok) {
        const raw = await res.json();
        if (Array.isArray(raw) && raw.length > 0) {
          const candles: Candlestick[] = raw.map((k: any) => ({
            time: Math.floor(Number(k[0]) / 1000),
            open: Number(parseFloat(k[1]).toFixed(decimals)),
            high: Number(parseFloat(k[2]).toFixed(decimals)),
            low: Number(parseFloat(k[3]).toFixed(decimals)),
            close: Number(parseFloat(k[4]).toFixed(decimals)),
            volume: Number(parseFloat(k[5]).toFixed(2)),
          }));
          return NextResponse.json(candles);
        }
      }
    } catch (_) {}
  }

  // 4. Fallback: query Go backend
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const res = await fetch(`${apiUrl}/api/v1/market/candles/${symbol}?limit=${limit}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return NextResponse.json(data);
      }
    }
  } catch (_) {}

  return NextResponse.json([], { status: 404 });
}
