'use client';

import React from 'react';

interface MarketIconProps {
  symbol: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MarketIcon: React.FC<MarketIconProps> = ({ symbol, size = 'md', className = '' }) => {
  const sym = symbol.toUpperCase().replace(/[^A-Z0-9]/g, '').trim();
  const dimension = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-11 h-11' : 'w-9 h-9';

  const dualDim = size === 'sm' ? 'w-8 h-6' : size === 'lg' ? 'w-12 h-9' : 'w-9 h-7';
  const flagSize = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-7 h-7' : 'w-5.5 h-5.5';
  const rightOffset = size === 'sm' ? 'left-3' : size === 'lg' ? 'left-4.5' : 'left-3.5';

  // 1. FOREX - DUAL OVERLAPPING FLAGS (Matches Gambar 2)
  if (sym === 'EURUSD' || sym === 'EUR') {
    return (
      <div className={`relative ${dualDim} shrink-0 flex items-center isolate ${className}`}>
        {/* Left: EU Flag */}
        <div className={`absolute left-0 top-0.5 ${flagSize} rounded-full overflow-hidden border-2 border-[#1F1E25] bg-[#003399] shadow-md z-10 flex items-center justify-center`}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="50" fill="#003399" />
            <circle cx="50" cy="20" r="4.5" fill="#FFCC00" />
            <circle cx="71" cy="29" r="4.5" fill="#FFCC00" />
            <circle cx="80" cy="50" r="4.5" fill="#FFCC00" />
            <circle cx="71" cy="71" r="4.5" fill="#FFCC00" />
            <circle cx="50" cy="80" r="4.5" fill="#FFCC00" />
            <circle cx="29" cy="71" r="4.5" fill="#FFCC00" />
            <circle cx="20" cy="50" r="4.5" fill="#FFCC00" />
            <circle cx="29" cy="29" r="4.5" fill="#FFCC00" />
          </svg>
        </div>
        {/* Right: US Flag */}
        <div className={`absolute ${rightOffset} top-0.5 ${flagSize} rounded-full overflow-hidden border-2 border-[#1F1E25] bg-white shadow-md z-20`}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <rect y="0" width="100" height="15" fill="#B22234" />
            <rect y="15" width="100" height="15" fill="#FFFFFF" />
            <rect y="30" width="100" height="15" fill="#B22234" />
            <rect y="45" width="100" height="15" fill="#FFFFFF" />
            <rect y="60" width="100" height="15" fill="#B22234" />
            <rect y="75" width="100" height="15" fill="#FFFFFF" />
            <rect y="90" width="100" height="10" fill="#B22234" />
            <rect width="48" height="52" fill="#3C3B6E" />
            <circle cx="15" cy="15" r="3.5" fill="#FFF" />
            <circle cx="32" cy="15" r="3.5" fill="#FFF" />
            <circle cx="23.5" cy="27" r="3.5" fill="#FFF" />
            <circle cx="15" cy="39" r="3.5" fill="#FFF" />
            <circle cx="32" cy="39" r="3.5" fill="#FFF" />
          </svg>
        </div>
      </div>
    );
  }

  if (sym === 'GBPUSD' || sym === 'GBP') {
    return (
      <div className={`relative ${dualDim} shrink-0 flex items-center isolate ${className}`}>
        {/* Left: UK Union Jack */}
        <div className={`absolute left-0 top-0.5 ${flagSize} rounded-full overflow-hidden border-2 border-[#1F1E25] bg-[#012169] shadow-md z-10`}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <rect width="100" height="100" fill="#012169" />
            <path d="M0,0 L100,100 M100,0 L0,100" stroke="#FFF" strokeWidth="16" />
            <path d="M0,0 L100,100 M100,0 L0,100" stroke="#C8102E" strokeWidth="10" />
            <path d="M50,0 L50,100 M0,50 L100,50" stroke="#FFF" strokeWidth="24" />
            <path d="M50,0 L50,100 M0,50 L100,50" stroke="#C8102E" strokeWidth="14" />
          </svg>
        </div>
        {/* Right: US Flag */}
        <div className={`absolute ${rightOffset} top-0.5 ${flagSize} rounded-full overflow-hidden border-2 border-[#1F1E25] bg-white shadow-md z-20`}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <rect y="0" width="100" height="15" fill="#B22234" />
            <rect y="15" width="100" height="15" fill="#FFFFFF" />
            <rect y="30" width="100" height="15" fill="#B22234" />
            <rect y="45" width="100" height="15" fill="#FFFFFF" />
            <rect y="60" width="100" height="15" fill="#B22234" />
            <rect y="75" width="100" height="15" fill="#FFFFFF" />
            <rect y="90" width="100" height="10" fill="#B22234" />
            <rect width="48" height="52" fill="#3C3B6E" />
            <circle cx="15" cy="15" r="3.5" fill="#FFF" />
            <circle cx="32" cy="15" r="3.5" fill="#FFF" />
            <circle cx="23.5" cy="27" r="3.5" fill="#FFF" />
            <circle cx="15" cy="39" r="3.5" fill="#FFF" />
            <circle cx="32" cy="39" r="3.5" fill="#FFF" />
          </svg>
        </div>
      </div>
    );
  }

  if (sym === 'USDJPY' || sym === 'JPY') {
    return (
      <div className={`relative ${dualDim} shrink-0 flex items-center isolate ${className}`}>
        {/* Left: US Flag */}
        <div className={`absolute left-0 top-0.5 ${flagSize} rounded-full overflow-hidden border-2 border-[#1F1E25] bg-white shadow-md z-10`}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <rect y="0" width="100" height="15" fill="#B22234" />
            <rect y="15" width="100" height="15" fill="#FFFFFF" />
            <rect y="30" width="100" height="15" fill="#B22234" />
            <rect y="45" width="100" height="15" fill="#FFFFFF" />
            <rect y="60" width="100" height="15" fill="#B22234" />
            <rect y="75" width="100" height="15" fill="#FFFFFF" />
            <rect width="48" height="52" fill="#3C3B6E" />
          </svg>
        </div>
        {/* Right: Japan Flag */}
        <div className={`absolute ${rightOffset} top-0.5 ${flagSize} rounded-full overflow-hidden border-2 border-[#1F1E25] bg-white shadow-md z-20 flex items-center justify-center`}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <rect width="100" height="100" fill="#FFFFFF" />
            <circle cx="50" cy="50" r="28" fill="#BC002D" />
          </svg>
        </div>
      </div>
    );
  }

  if (sym === 'AUDUSD' || sym === 'AUD') {
    return (
      <div className={`relative ${dualDim} shrink-0 flex items-center isolate ${className}`}>
        {/* Left: Australia Flag */}
        <div className={`absolute left-0 top-0.5 ${flagSize} rounded-full overflow-hidden border-2 border-[#1F1E25] bg-[#00008B] shadow-md z-10`}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <rect width="100" height="100" fill="#00008B" />
            <rect width="45" height="45" fill="#012169" />
            <path d="M0,0 L45,45 M45,0 L0,45" stroke="#FFF" strokeWidth="6" />
            <path d="M0,0 L45,45 M45,0 L0,45" stroke="#C8102E" strokeWidth="3" />
            <circle cx="25" cy="75" r="7" fill="#FFF" />
            <circle cx="75" cy="25" r="4" fill="#FFF" />
            <circle cx="85" cy="45" r="4" fill="#FFF" />
            <circle cx="75" cy="75" r="4" fill="#FFF" />
          </svg>
        </div>
        {/* Right: US Flag */}
        <div className={`absolute ${rightOffset} top-0.5 ${flagSize} rounded-full overflow-hidden border-2 border-[#1F1E25] bg-white shadow-md z-20`}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <rect y="0" width="100" height="20" fill="#B22234" />
            <rect y="20" width="100" height="20" fill="#FFFFFF" />
            <rect y="40" width="100" height="20" fill="#B22234" />
            <rect y="60" width="100" height="20" fill="#FFFFFF" />
            <rect y="80" width="100" height="20" fill="#B22234" />
            <rect width="48" height="52" fill="#3C3B6E" />
          </svg>
        </div>
      </div>
    );
  }

  if (sym === 'USDCAD' || sym === 'CAD') {
    return (
      <div className={`relative ${dualDim} shrink-0 flex items-center isolate ${className}`}>
        {/* Left: US Flag */}
        <div className={`absolute left-0 top-0.5 ${flagSize} rounded-full overflow-hidden border-2 border-[#1F1E25] bg-white shadow-md z-10`}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <rect y="0" width="100" height="20" fill="#B22234" />
            <rect y="20" width="100" height="20" fill="#FFFFFF" />
            <rect y="40" width="100" height="20" fill="#B22234" />
            <rect width="48" height="52" fill="#3C3B6E" />
          </svg>
        </div>
        {/* Right: Canada Flag */}
        <div className={`absolute ${rightOffset} top-0.5 ${flagSize} rounded-full overflow-hidden border-2 border-[#1F1E25] bg-white shadow-md z-20 flex items-center justify-center`}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <rect x="0" width="25" height="100" fill="#FF0000" />
            <rect x="25" width="50" height="100" fill="#FFFFFF" />
            <rect x="75" width="25" height="100" fill="#FF0000" />
            <path d="M50,25 L55,42 L68,36 L62,50 L75,55 L60,65 L65,75 L52,70 L50,82 L48,70 L35,75 L40,65 L25,55 L38,50 L32,36 L45,42 Z" fill="#FF0000" />
          </svg>
        </div>
      </div>
    );
  }

  if (sym === 'USDCHF' || sym === 'CHF') {
    return (
      <div className={`relative ${dualDim} shrink-0 flex items-center isolate ${className}`}>
        {/* Left: US Flag */}
        <div className={`absolute left-0 top-0.5 ${flagSize} rounded-full overflow-hidden border-2 border-[#1F1E25] bg-white shadow-md z-10`}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <rect y="0" width="100" height="20" fill="#B22234" />
            <rect y="20" width="100" height="20" fill="#FFFFFF" />
            <rect y="40" width="100" height="20" fill="#B22234" />
            <rect width="48" height="52" fill="#3C3B6E" />
          </svg>
        </div>
        {/* Right: Switzerland Flag */}
        <div className={`absolute ${rightOffset} top-0.5 ${flagSize} rounded-full overflow-hidden border-2 border-[#1F1E25] bg-[#D52B1E] shadow-md z-20 flex items-center justify-center`}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <rect width="100" height="100" fill="#D52B1E" />
            <rect x="40" y="22" width="20" height="56" fill="#FFFFFF" />
            <rect x="22" y="40" width="56" height="20" fill="#FFFFFF" />
          </svg>
        </div>
      </div>
    );
  }

  // 2. CFD - AUTHENTIC CUSTOM WEBP LOGOS (Matches Gambar 3)
  if (sym === 'XAUUSD' || sym === 'XAU') {
    return (
      <div className={`${dimension} rounded-2xl overflow-hidden shrink-0 flex items-center justify-center bg-[#1F1E25] border border-white/10 shadow-md ${className}`}>
        <img src="/emas.webp" alt="Gold (Emas)" className="w-full h-full object-cover rounded-2xl" />
      </div>
    );
  }

  if (sym === 'XAGUSD' || sym === 'XAG') {
    return (
      <div className={`${dimension} rounded-2xl overflow-hidden shrink-0 flex items-center justify-center bg-[#1F1E25] border border-white/10 shadow-md ${className}`}>
        <img src="/silver.webp" alt="Silver (Perak)" className="w-full h-full object-cover rounded-2xl" />
      </div>
    );
  }

  if (sym === 'USOIL') {
    return (
      <div className={`${dimension} rounded-2xl overflow-hidden shrink-0 flex items-center justify-center bg-[#1F1E25] border border-white/10 shadow-md ${className}`}>
        <img src="/crude_oil.webp" alt="Crude Oil WTI" className="w-full h-full object-cover rounded-2xl" />
      </div>
    );
  }

  if (sym === 'SPX500' || sym === 'SPX') {
    return (
      <div className={`${dimension} rounded-2xl overflow-hidden shrink-0 flex items-center justify-center bg-[#1F1E25] border border-white/10 shadow-md ${className}`}>
        <img src="/sp500.webp" alt="S&P 500 Index" className="w-full h-full object-cover rounded-2xl" />
      </div>
    );
  }

  if (sym === 'NAS100' || sym === 'NAS') {
    return (
      <div className={`${dimension} rounded-2xl overflow-hidden shrink-0 flex items-center justify-center bg-[#1F1E25] border border-white/10 shadow-md ${className}`}>
        <img src="/nasdaq.webp" alt="Nasdaq 100" className="w-full h-full object-cover rounded-2xl" />
      </div>
    );
  }

  if (sym === 'US30') {
    return (
      <div className={`${dimension} rounded-2xl overflow-hidden shrink-0 flex items-center justify-center bg-[#1F1E25] border border-white/10 shadow-md ${className}`}>
        <img src="/dowjones.webp" alt="Dow Jones 30" className="w-full h-full object-cover rounded-2xl" />
      </div>
    );
  }

  // 3. CRYPTO - AUTHENTIC CUSTOM WEBP & SVG LOGOS (Matches Gambar 4)
  if (sym === 'BTC' || sym === 'BTCUSDT') {
    return (
      <div className={`${dimension} rounded-2xl overflow-hidden shrink-0 flex items-center justify-center bg-[#1F1E25] border border-white/10 shadow-md ${className}`}>
        <img src="/bitcoin.webp" alt="Bitcoin" className="w-full h-full object-cover rounded-2xl" />
      </div>
    );
  }

  if (sym === 'ETH' || sym === 'ETHUSDT') {
    return (
      <div className={`${dimension} rounded-2xl overflow-hidden shrink-0 flex items-center justify-center bg-[#1F1E25] border border-white/10 shadow-md ${className}`}>
        <img src="/ethereum.webp" alt="Ethereum" className="w-full h-full object-cover rounded-2xl" />
      </div>
    );
  }

  if (sym === 'SOL' || sym === 'SOLUSDT') {
    return (
      <div className={`${dimension} rounded-2xl overflow-hidden shrink-0 flex items-center justify-center bg-[#1F1E25] border border-white/10 shadow-md ${className}`}>
        <img src="/solana.webp" alt="Solana" className="w-full h-full object-cover rounded-2xl" />
      </div>
    );
  }

  if (sym === 'LTC' || sym === 'LTCUSDT') {
    return (
      <div className={`${dimension} rounded-2xl overflow-hidden shrink-0 flex items-center justify-center bg-[#1F1E25] border border-white/10 shadow-md ${className}`}>
        <img src="/litecoin.webp" alt="Litecoin" className="w-full h-full object-cover rounded-2xl" />
      </div>
    );
  }

  if (sym === 'BNB' || sym === 'BNBUSDT') {
    return (
      <div className={`${dimension} rounded-2xl overflow-hidden shrink-0 flex items-center justify-center bg-[#1F1E25] border border-white/10 shadow-md ${className}`}>
        <img src="/binance.webp" alt="Binance" className="w-full h-full object-cover rounded-2xl" />
      </div>
    );
  }

  if (sym === 'ADA' || sym === 'ADAUSDT') {
    return (
      <div className={`${dimension} rounded-2xl overflow-hidden shrink-0 flex items-center justify-center bg-[#1F1E25] border border-white/10 shadow-md ${className}`}>
        <img src="/cardano.webp" alt="Cardano" className="w-full h-full object-cover rounded-2xl" />
      </div>
    );
  }

  // USDT - Tether USD (Green Badge with official Tether ₮ icon)
  if (sym === 'USDT') {
    return (
      <div className={`${dimension} rounded-2xl overflow-hidden shrink-0 flex items-center justify-center bg-[#26A17B] border border-white/10 shadow-md ${className}`}>
        <svg viewBox="0 0 32 32" className="w-5 h-5 fill-white">
          <path d="M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-1.026-6.79-2.052 0-1.028 2.902-1.88 6.79-2.052v3.082c.25.016.961.047 1.971.047 1.265 0 1.832-.034 1.942-.047v-3.082c3.888.172 6.79 1.024 6.79 2.052 0 1.026-2.902 1.881-6.79 2.052zm0-6.195V8h4.864V5H9.214v3h4.864v3.188c-4.63.21-8.078 1.341-8.078 2.702 0 1.36 3.448 2.492 8.078 2.702v7.41h3.914v-7.41c4.63-.21 8.078-1.342 8.078-2.702 0-1.361-3.448-2.492-8.078-2.702z" />
        </svg>
      </div>
    );
  }

  // USDC - USD Coin (Blue Badge with official USD Coin $ icon)
  if (sym === 'USDC') {
    return (
      <div className={`${dimension} rounded-2xl overflow-hidden shrink-0 flex items-center justify-center bg-[#2775CA] border border-white/10 shadow-md ${className}`}>
        <svg viewBox="0 0 32 32" className="w-5 h-5 fill-white">
          <path d="M16 3C8.82 3 3 8.82 3 16s5.82 13 13 13 13-5.82 13-13S23.18 3 16 3zm0 24C9.925 27 5 22.075 5 16S9.925 5 16 5s11 4.925 11 11-4.925 11-11 11zm1.2-17.5h-2.4v1.23c-1.88.24-3.1 1.4-3.1 3.02 0 1.82 1.29 2.72 3.5 3.23 1.63.38 2.2.82 2.2 1.62 0 .86-.73 1.5-2 1.5-1.22 0-2.14-.52-2.52-1.3l-1.88.94c.64 1.32 1.96 2.08 3.8 2.28V23.5h2.4v-1.25c1.94-.28 3.2-1.48 3.2-3.15 0-1.85-1.36-2.78-3.57-3.3-1.55-.37-2.13-.8-2.13-1.55 0-.82.68-1.4 1.83-1.4 1.1 0 1.9.46 2.3 1.15l1.83-.98c-.6-1.18-1.74-1.87-3.46-2.07V9.5z" />
        </svg>
      </div>
    );
  }

  // DOGE - Dogecoin (Golden Badge with official Dogecoin Ð icon)
  if (sym === 'DOGE' || sym === 'DOGEUSDT') {
    return (
      <div className={`${dimension} rounded-2xl overflow-hidden shrink-0 flex items-center justify-center bg-[#C2A633] border border-white/10 shadow-md ${className}`}>
        <svg viewBox="0 0 32 32" className="w-5 h-5 fill-white">
          <path d="M16 3C8.82 3 3 8.82 3 16s5.82 13 13 13 13-5.82 13-13S23.18 3 16 3zm-3.5 6h4.8c4.2 0 7.2 2.8 7.2 7s-3 7-7.2 7h-4.8V9zm3.2 11h1.5c2.3 0 4-1.6 4-4s-1.7-4-4-4h-1.5v8z" />
          <path d="M11 15h6v2h-6z" fill="#C2A633" />
        </svg>
      </div>
    );
  }

  // XRP - Ripple (Dark Navy Badge with official Ripple logo)
  if (sym === 'XRP' || sym === 'XRPUSDT') {
    return (
      <div className={`${dimension} rounded-2xl overflow-hidden shrink-0 flex items-center justify-center bg-[#23292F] border border-white/10 shadow-md ${className}`}>
        <svg viewBox="0 0 32 32" className="w-5 h-5 fill-white">
          <path d="M26.2 7.5L22.5 11.2c-1.8-1.8-4.7-1.8-6.5 0L12.3 7.5c3.6-3.6 9.4-3.6 13.9 0zM5.8 7.5l3.7 3.7c1.8-1.8 4.7-1.8 6.5 0L19.7 7.5c-3.6-3.6-9.4-3.6-13.9 0zM5.8 24.5l3.7-3.7c1.8 1.8 4.7 1.8 6.5 0l3.7 3.7c-3.6 3.6-9.4 3.6-13.9 0zm20.4 0l-3.7-3.7c-1.8 1.8-4.7 1.8-6.5 0l-3.7 3.7c3.6 3.6 9.4 3.6 13.9 0z" />
        </svg>
      </div>
    );
  }

  // Default clean fallback
  return (
    <div className={`${dimension} rounded-2xl bg-[#1e293b] border border-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0 ${className}`}>
      {sym.slice(0, 3)}
    </div>
  );
};
