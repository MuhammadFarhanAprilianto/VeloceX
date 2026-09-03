import { create } from 'zustand';
import { MarketTicker, OrderBookDepth, Candlestick, Portfolio, Order, Trade, FuturesPosition } from '@/types/trading';

const INITIAL_FUTURES_POSITIONS: FuturesPosition[] = [
  {
    id: 'pos_1',
    symbol: 'ETHUSDT',
    status: 'Completed',
    type: 'Short',
    size: '10.51',
    sizeUnit: 'ETH',
    entryPrice: 3219.0,
    marginUsage: '32.97%',
    slPrice: 3280.0,
    tpPrice: 3150.0,
    leverage: 10,
    margin: 3383.17,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'pos_2',
    symbol: 'ETHUSDT',
    status: 'Open',
    type: 'Long',
    size: '14.89',
    sizeUnit: 'ETH',
    entryPrice: 3245.0,
    marginUsage: '23.11%',
    slPrice: 3290.0,
    tpPrice: 3180.0,
    leverage: 20,
    margin: 2415.91,
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
];

interface TradingState {
  // Current active symbol
  selectedSymbol: string;
  setSelectedSymbol: (symbol: string) => void;

  // Real-time market data
  tickers: Record<string, MarketTicker>;
  setTicker: (ticker: MarketTicker) => void;
  setAllTickers: (tickers: MarketTicker[]) => void;

  // Order Book depth
  orderBook: OrderBookDepth | null;
  setOrderBook: (depth: OrderBookDepth) => void;

  // Real-time live candle
  latestCandle: Candlestick | null;
  setLatestCandle: (candle: Candlestick) => void;

  // User portfolio & balances
  portfolio: Portfolio | null;
  setPortfolio: (portfolio: Portfolio | null) => void;

  // User orders
  openOrders: Order[];
  setOpenOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  removeOrder: (orderId: string) => void;

  // Trades history
  trades: Trade[];
  setTrades: (trades: Trade[]) => void;
  addTrade: (trade: Trade) => void;

  // Futures Positions
  positions: FuturesPosition[];
  setPositions: (positions: FuturesPosition[]) => void;
  addPosition: (pos: FuturesPosition) => void;
  updatePosition: (id: string, partial: Partial<FuturesPosition>) => void;
  closePosition: (id: string) => void;

  // WebSocket connection state
  wsStatus: 'connected' | 'reconnecting' | 'disconnected';
  setWsStatus: (status: 'connected' | 'reconnecting' | 'disconnected') => void;

  // Order execution notification modal trigger
  executedTrade: Trade | null;
  setExecutedTrade: (trade: Trade | null) => void;
}

const getInitialSymbol = () => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('velocex_selected_pro_symbol') || localStorage.getItem('velocex_selected_symbol');
      if (saved) return saved;
    } catch (_) {}
  }
  return 'BTCUSDT';
};

export const useTradingStore = create<TradingState>((set) => ({
  selectedSymbol: getInitialSymbol(),
  setSelectedSymbol: (symbol) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('velocex_selected_pro_symbol', symbol);
        localStorage.setItem('velocex_selected_symbol', symbol);
      } catch (_) {}
    }
    set({ selectedSymbol: symbol });
  },

  tickers: {},
  setTicker: (ticker) =>
    set((state) => ({
      tickers: {
        ...state.tickers,
        [ticker.symbol]: ticker,
      },
    })),
  setAllTickers: (tickerList) => {
    const map: Record<string, MarketTicker> = {};
    tickerList.forEach((t) => {
      map[t.symbol] = t;
    });
    set({ tickers: map });
  },

  orderBook: null,
  setOrderBook: (depth) => set({ orderBook: depth }),

  latestCandle: null,
  setLatestCandle: (candle) => set({ latestCandle: candle }),

  portfolio: {
    total_equity_usdt: 0.0,
    daily_pnl_usdt: 0.0,
    daily_pnl_percent: 0.0,
    assets: [],
  },
  setPortfolio: (portfolio) => set({ portfolio }),

  openOrders: [],
  setOpenOrders: (orders) => set({ openOrders: orders }),
  addOrder: (order) =>
    set((state) => ({
      openOrders: [order, ...state.openOrders],
    })),
  removeOrder: (orderId) =>
    set((state) => ({
      openOrders: state.openOrders.filter((o) => o.id !== orderId),
    })),

  trades: [],
  setTrades: (trades) => set({ trades }),
  addTrade: (trade) =>
    set((state) => ({
      trades: [trade, ...state.trades],
    })),

  positions: INITIAL_FUTURES_POSITIONS,
  setPositions: (positions) => set({ positions }),
  addPosition: (pos) =>
    set((state) => ({
      positions: [pos, ...state.positions],
    })),
  updatePosition: (id, partial) =>
    set((state) => ({
      positions: state.positions.map((p) => (p.id === id ? { ...p, ...partial } : p)),
    })),
  closePosition: (id) =>
    set((state) => ({
      positions: state.positions.filter((p) => p.id !== id),
    })),

  wsStatus: 'disconnected',
  setWsStatus: (status) => set({ wsStatus: status }),

  executedTrade: null,
  setExecutedTrade: (trade) => set({ executedTrade: trade }),
}));

