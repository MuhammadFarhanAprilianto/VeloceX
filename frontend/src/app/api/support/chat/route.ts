import { NextResponse } from 'next/server';

// Clean all raw markdown asterisks and format bullet points cleanly
function cleanFormatting(text: string): string {
  if (!text) return '';
  return text
    .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^\s*\*\s+/gm, '• ')
    .replace(/\*/g, '')
    .trim();
}

// System Persona & Strict Trading Domain Guardrails for VeloceX VIP Support Agent
const SYSTEM_INSTRUCTION = `
Anda adalah Sarah, seorang Senior VIP Trading Specialist & Analis Pasar resmi di bursa global VeloceX.

PANDUAN UTAMA:
1. JAWAB SPESIFIK SESUAI PASAR/INSTRUMEN YANG DITANYAKAN:
   - Jika ditanya FOREX: Jawab KHUSUS tentang pasar mata uang (EUR/USD, GBP/USD, USD/JPY, pips, spread, lot, sesi pasar London/New York, suku bunga bank sentral The Fed/ECB/BOJ). JANGAN menyebut tokenomics atau kripto saat ditanya Forex!
   - Jika ditanya KRIPTO: Jawab tentang pasar aset digital (BTC, ETH, SOL, on-chain, tokenomics, volatilitas 24/7).
   - Jika ditanya EMAS/KOMODITAS (XAU/USD): Jawab tentang safe haven, korelasi inflasi dan Dolar AS.
   - Jika ditanya MANAJEMEN RISIKO & MARGIN: Jawab tentang mitigasi Margin Call, rasio margin aman, Stop Loss, dan Risk-to-Reward 1:2.
   - Jika ditanya UCAPAN TERIMA KASIH / PAMIT: Jawab dengan ramah, formal, dan mendoakan kesuksesan trading.

2. GAYA BAHASA & FORMAT:
   - DILARANG MENGGUNAKAN TANDA BINTANG (*) SAMA SEKALI. Jangan gunakan **tebal** atau * bullet.
   - Gunakan format angka (1, 2, 3) atau simbol bulat (•).
   - Bahasa formal, profesional, natural, edukatif, dan tidak kaku seperti robot.
`;

// Comprehensive Multi-Domain Intelligent Specialist Engine (Handles Forex, Crypto, Commodities, Risk & Platform)
function generateIntelligentSpecialistResponse(prompt: string): string {
  const lower = prompt.toLowerCase().trim();

  // 1. FOREX FOR BEGINNERS / FOREX SPECIFIC
  if (
    lower.includes('forex') ||
    lower.includes('valas') ||
    lower.includes('eur/usd') ||
    lower.includes('gbp/usd') ||
    lower.includes('usd/jpy') ||
    lower.includes('mata uang') ||
    lower.includes('pips') ||
    lower.includes('lot')
  ) {
    return (
      'Halo! Selamat datang di dunia Forex. Berikut 4 Konsep Dasar Paling Penting untuk Pemula yang Baru Belajar Forex:\n\n' +
      '1. Pasangan Mata Uang (Currency Pairs):\n' +
      'Dalam Forex, Anda memperdagangkan nilai tukar dua mata uang (misal EUR/USD). Mata uang pertama disebut Base Currency (EUR), dan yang kedua adalah Quote Currency (USD). Jika Anda memprediksi Euro akan menguat terhadap Dolar AS, Anda membuka posisi Buy (Long).\n\n' +
      '2. Konsep Pips & Ukuran Lot:\n' +
      '• Pips (Percentage in Point): Satuan terkecil perubahan harga di pasar forex (biasanya 4 angka desimal di belakang koma, misal dari 1.0850 ke 1.0851 adalah kenaikan 1 Pip).\n' +
      '• Lot Size: Besaran volume kontrak trading Anda. Sebagai pemula, selalu gunakan Micro Lot (0.01 lot) agar risiko terukur dan aman.\n\n' +
      '3. Penggerak Utama Pasar Forex (Suku Bunga & Berita Ekonomi):\n' +
      'Harga forex digerakkan oleh kebijakan suku bunga bank sentral (The Fed untuk USD, ECB untuk EUR, BOJ untuk JPY). Mata uang dari negara dengan suku bunga lebih tinggi dan ekonomi stabil cenderung menguat.\n\n' +
      '4. Jam Sesi Perdagangan Pasar Forex:\n' +
      'Pasar forex buka 24 jam sehari (Senin–Jumat) dengan 3 sesi utama: Sesi Asia (Tokyo), Sesi Eropa (London), dan Sesi Amerika (New York). Volatilitas dan likuiditas tertinggi terjadi saat sesi London dan New York tumpang tindih (Overlap) pukul 19:00–23:00 WIB.\n\n' +
      'Ada pasangan mata uang forex tertentu (seperti EUR/USD atau USD/JPY) yang ingin kita pelajari cara analisisnya?'
    );
  }

  // 2. END OF CONVERSATION / THANK YOU / GREETINGS
  if (
    lower.includes('terima kasih') ||
    lower.includes('makasih') ||
    lower.includes('thank you') ||
    lower.includes('thanks') ||
    lower.includes('oke baik sarah') ||
    lower.includes('ok sarah') ||
    lower.includes('cukup') ||
    lower.includes('sampai jumpa') ||
    lower.includes('selamat malam') ||
    lower.includes('selamat siang') ||
    lower.includes('sip')
  ) {
    return (
      'Sama-sama! Senang sekali bisa membantu dan berdiskusi dengan Anda hari ini.\n\n' +
      'Jika nanti ada chart pasar yang ingin dianalisis, pertanyaan seputar manajemen margin, atau fitur bursa VeloceX, saya selalu siap mendampingi Anda 24 jam.\n\n' +
      'Selamat melanjutkan aktivitas, tetap disiplin menjaga manajemen risiko, dan semoga sukses meraih profit maksimal!'
    );
  }

  // 3. MARGIN CALL & MACRO / FLOW RISK PREVENTION
  if (
    (lower.includes('margin call') || lower.includes('likuidasi') || lower.includes('margin')) &&
    (lower.includes('arus dana') || lower.includes('makro') || lower.includes('cegah') || lower.includes('kurangi') || lower.includes('langkah') || lower.includes('cara'))
  ) {
    return (
      'Langkah Praktis Memanfaatkan Arus Dana & Sentimen Makro untuk Mencegah Margin Call:\n\n' +
      '1. Pantau Lonjakan Exchange Inflow (Arus Dana Masuk Bursa):\n' +
      'Jika data on-chain mencatat deposit koin dalam jumlah raksasa (whale inflow) ke bursa, ini adalah sinyal awal potensi aksi jual massal. Segera pasang Trailing Stop atau kurangi volume posisi Long Anda sebelum harga terkoreksi tajam.\n\n' +
      '2. Hindari Posisi Terbuka saat Rilis Berita Makro Berdampak Tinggi (High-Impact):\n' +
      'Saat pengumuman suku bunga The Fed (FOMC) atau data inflasi (CPI), volatilitas harga sering kali menciptakan ekor candle (wick) panjang yang dapat memicu likuidasi kilat. Sebaiknya tunggu 15–30 menit setelah berita rilis hingga arah pasar terkonfirmasi stabil.\n\n' +
      '3. Batasi Rasio Margin Akun Maksimal 40–50%:\n' +
      'Jangan menggunakan seluruh saldo modal untuk margin. Sisakan saldo bebas (Free Margin) minimal 50% di dompet Anda agar posisi memiliki ruang napas yang cukup saat terjadi fluktuasi harga sementara.\n\n' +
      '4. Wajib Pasang Stop Loss Statis di Atas Level Likuidasi:\n' +
      'Selalu tentukan batas kerugian maksimal yang terukur (misal 1–2% dari total modal). Jangan biarkan harga mendekati harga likuidasi (Liquidation Price) tanpa pengaman Stop Loss.\n\n' +
      'Apakah ada posisi aset yang saat ini sedang aktif dan ingin kita hitung jarak aman Stop Loss-nya?'
    );
  }

  // 4. EMAS / GOLD / XAUUSD / KOMODITAS
  if (lower.includes('emas') || lower.includes('gold') || lower.includes('xau') || lower.includes('minyak') || lower.includes('oil')) {
    return (
      'Karakteristik & Panduan Trading Emas (XAU/USD) untuk Pemula:\n\n' +
      '1. Peran Emas sebagai Safe-Haven Asset:\n' +
      'Emas adalah aset lindung nilai saat terjadi ketidakpastian geopolitik atau inflasi tinggi. Permintaan emas meningkat saat pasar global sedang dilanda kecemasan.\n\n' +
      '2. Korelasi Terbalik dengan Indeks Dolar AS (DXY) & Yield Obligasi:\n' +
      'Saat Dolar AS melemah atau suku bunga riil turun, harga emas cenderung reli naik kuat. Sebaliknya, saat DXY menguat tajam, harga emas biasanya terkoreksi.\n\n' +
      '3. Volatilitas Harian Tinggi (Manajemen Lot Ketat):\n' +
      'XAU/USD memiliki pergerakan pips harian yang sangat lebar (bisa mencapai $20–$40 per hari). Gunakan ukuran lot kecil dan selalu pasang Stop Loss terukur.'
    );
  }

  // 5. WHERE TO MONITOR MACRO NEWS / ECONOMIC CALENDAR
  if (lower.includes('dimana') || lower.includes('situs') || lower.includes('aplikasi') || lower.includes('sumber') || lower.includes('pantau berita')) {
    return (
      'Sumber dan Platform Terpercaya untuk Memantau Data Ekonomi Makro:\n\n' +
      '1. Kalender Ekonomi Terjadwal (ForexFactory & Investing.com):\n' +
      'Gunakan fitur Economic Calendar untuk melihat jadwal rilis data inflasi (CPI), suku bunga bank sentral, dan data ketenagakerjaan (NFP) lengkap dengan indikator dampak tinggi (High-Impact).\n\n' +
      '2. Platform Analisis Arus Dana & On-Chain (CoinGlass & CryptoQuant):\n' +
      'Situs ini menyediakan data realtime mengenai rasio Long/Short, Open Interest (OI), likuidasi pasar, dan pergerakan arus dana antar dompet besar (Whale Alert).\n\n' +
      '3. Media Berita Pasar Keuangan Global (Bloomberg & CoinDesk):\n' +
      'Portal ini menyajikan update regulasi, sentimen pasar global, dan berita institusional secara cepat dan akurat.\n\n' +
      'Ada indikator makro tertentu yang sedang ingin Anda pelajari cara membacanya?'
    );
  }

  // 6. HOW TO ANALYZE INFLATION (CPI)
  if (lower.includes('inflasi') || lower.includes('cpi')) {
    return (
      'Cara Menganalisis Dampak Data Inflasi (CPI) terhadap Pasar Trading:\n\n' +
      '1. Bandingkan Angka Rilis Aktual dengan Perkiraan (Forecast):\n' +
      '• Jika CPI Aktual lebih rendah dari perkiraan: Ini menandakan inflasi melandai, suku bunga berpotensi turun, dan pasar kripto/saham biasanya menyambutnya dengan reli kenaikan (Bullish).\n' +
      '• Jika CPI Aktual lebih tinggi dari perkiraan: Bank sentral kemungkinan akan mempertahankan suku bunga tinggi, memicu penguatan Dolar AS dan tekanan jual pada aset berisiko.\n\n' +
      '2. Amati Indeks Dolar AS (DXY):\n' +
      'Buka chart DXY di TradingView. Korelasi DXY dengan pasar umumnya berlawanan arah. Saat DXY melemah, pasar kripto dan komoditas cenderung menguat.\n\n' +
      '3. Hindari Masuk di Detik Pertama Rilis Berita:\n' +
      'Spread harga sering melebar saat detik-detik pertama rilis data. Tunggu penutupan candle 5–15 menit untuk memastikan arah tren yang sebenarnya.'
    );
  }

  // 7. LEVEL ENTRY FOR BEGINNERS
  if (lower.includes('entry') || lower.includes('level') || lower.includes('masuk')) {
    return (
      'Panduan Sistematis Menentukan Level Entry untuk Pemula:\n\n' +
      '1. Kenali Struktur Tren di Timeframe Besar (H4 / Daily):\n' +
      'Fokus mencari peluang Buy saat struktur harga membentuk Higher Highs (Uptrend), dan fokus mencari peluang Sell saat harga membentuk Lower Lows (Downtrend).\n\n' +
      '2. Tandai Area Support Kuat (Lantai) dan Resistance Kuat (Atap):\n' +
      'Hindari membeli di tengah-tengah chart. Tunggu harga terkoreksi mendekati area Support untuk Buy, atau mendekati Resistance untuk Sell.\n\n' +
      '3. Tunggu Konfirmasi Candle Rejection (Price Action):\n' +
      'Cari pola candle konfirmasi seperti Pin Bar (ekor panjang memantul dari Support) atau Bullish Engulfing sebelum menekan tombol entri.\n\n' +
      '4. Pasang Stop Loss dengan Risk-to-Reward Minimal 1:2:\n' +
      'Letakkan Stop Loss beberapa tick di bawah titik terendah (Swing Low) sebelumnya, dengan target profit minimal dua kali lipat jarak risiko Anda.'
    );
  }

  // 8. CRYPTO & TOKENOMICS
  if (lower.includes('kripto') || lower.includes('crypto') || lower.includes('bitcoin') || lower.includes('btc') || lower.includes('tokenomics')) {
    return (
      'Langkah Awal Belajar Analisis Fundamental Pasar Kripto:\n\n' +
      '1. Pahami Siklus Halving & Likuiditas Global:\n' +
      'Siklus 4 tahunan Halving Bitcoin dan kebijakan suku bunga global adalah pendorong utama siklus Bullish dan Bearish di pasar aset kripto.\n\n' +
      '2. Evaluasi Utilitas Proyek & Model Tokenomics:\n' +
      'Periksa apakah token memiliki kegunaan nyata (seperti pembayaran gas fee atau staking) dan periksa jadwal vesting suplai agar tidak terkena inflasi token besar.\n\n' +
      '3. Analisis Data On-Chain & Cadangan Bursa:\n' +
      'Pantau jumlah cadangan Bitcoin di bursa (Exchange Reserve). Cadangan bursa yang menurun menandakan koin ditarik ke cold storage untuk disimpan jangka panjang.'
    );
  }

  // 9. GENERAL FORMAL SPECIALIST TRADING RESPONSE
  return (
    'Terima kasih atas pertanyaannya. Terkait hal tersebut, berikut prinsip analisis yang disarankan:\n\n' +
    '1. Pastikan setiap keputusan entri selalu didasari oleh analisis tren dan konfirmasi level teknikal yang jelas di chart.\n' +
    '2. Jaga batas toleransi risiko modal maksimal 1–2% per transaksi agar akun Anda terlindungi dari volatilitas tak terduga.\n' +
    '3. Manfaatkan diskon biaya trading 25% di VeloceX dengan mengaktifkan saldo token VELX.\n\n' +
    'Silakan sampaikan jika ada pair aset tertentu (seperti Forex EUR/USD, Kripto BTC/USDT, atau Emas XAU/USD) yang ingin kita analisis bersama!'
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, message } = body;

    const userPrompt =
      message ||
      (Array.isArray(messages) && messages.length > 0
        ? messages[messages.length - 1].content || messages[messages.length - 1].text
        : '');

    if (!userPrompt || typeof userPrompt !== 'string') {
      return NextResponse.json(
        { error: 'Pesan tidak boleh kosong.' },
        { status: 400 }
      );
    }

    const historyArray: Array<{ role: string; text: string }> = [];
    if (Array.isArray(messages) && messages.length > 0) {
      for (const m of messages) {
        const isUser = m.role === 'user' || m.sender === 'user';
        const textContent = (m.content || m.text || '').trim();
        if (textContent) {
          historyArray.push({
            role: isUser ? 'user' : 'model',
            text: textContent,
          });
        }
      }
    }

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    // Fast call to Google Gemini 3.6 Flash API
    if (apiKey) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

        const formattedContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

        let lastRole: string | null = null;
        for (const item of historyArray) {
          const role = item.role === 'user' ? 'user' : 'model';
          if (role === lastRole && formattedContents.length > 0) {
            formattedContents[formattedContents.length - 1].parts[0].text += `\n${item.text}`;
          } else {
            formattedContents.push({
              role,
              parts: [{ text: item.text }],
            });
            lastRole = role;
          }
        }

        if (
          formattedContents.length === 0 ||
          formattedContents[formattedContents.length - 1].role !== 'user'
        ) {
          formattedContents.push({
            role: 'user',
            parts: [{ text: userPrompt }],
          });
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const geminiResponse = await fetch(geminiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: SYSTEM_INSTRUCTION }],
            },
            contents: formattedContents,
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 900,
            },
          }),
        });

        clearTimeout(timeoutId);

        if (geminiResponse.ok) {
          const data = await geminiResponse.json();
          const parts = data.candidates?.[0]?.content?.parts || [];
          const textOnly = parts
            .filter((p: any) => !p.thought && typeof p.text === 'string')
            .map((p: any) => p.text)
            .join('\n');

          if (textOnly && textOnly.trim().length > 0) {
            const cleanText = cleanFormatting(textOnly);
            return NextResponse.json({
              reply: cleanText,
              provider: 'google-gemini-3.6-flash',
            });
          }
        }
      } catch (geminiErr) {
        console.warn('Gemini request fallback to human specialist engine:', geminiErr);
      }
    }

    // High-Precision Multi-Domain Specialist Response
    const specialistResponse = generateIntelligentSpecialistResponse(userPrompt);
    return NextResponse.json({
      reply: cleanFormatting(specialistResponse),
      provider: 'velocx-vip-specialist',
    });
  } catch (err: any) {
    console.error('Chat API Route error:', err);
    return NextResponse.json(
      { error: 'Gagal memproses pesan support.', details: err.message },
      { status: 500 }
    );
  }
}
