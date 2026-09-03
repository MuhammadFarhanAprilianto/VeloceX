export type OrderSide = 'BUY' | 'SELL';
export type OrderType = 'LIMIT' | 'MARKET';
export type OrderStatus = 'OPEN' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELLED';

export interface MarketTicker {
  symbol: string;
  price: number;
  high_24h: number;
  low_24h: number;
  change_24h: number;
  change_percent: number;
  volume_24h: number;
  timestamp: string;
}

export interface DepthLevel {
  price: number;
  amount: number;
  total: number;
}

export interface OrderBookDepth {
  symbol: string;
  asks: DepthLevel[]; // Ascending order
  bids: DepthLevel[]; // Descending order
  timestamp: string;
}

export interface Candlestick {
  time: number; // Unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface AssetBalance {
  currency: string;
  balance: number;
  locked_balance: number;
  total: number;
  usdt_value: number;
}

export interface Portfolio {
  total_equity_usdt: number;
  daily_pnl_usdt: number;
  daily_pnl_percent: number;
  assets: AssetBalance[];
}

export interface Order {
  id: string;
  user_id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  price: number;
  amount: number;
  filled_amount: number;
  status: OrderStatus;
  created_at: string;
}

export interface Trade {
  id: string;
  buy_order_id: string;
  sell_order_id: string;
  symbol: string;
  price: number;
  amount: number;
  executed_at: string;
}

export interface FuturesPosition {
  id: string;
  symbol: string;
  status: 'Completed' | 'Open' | 'Pending' | 'Cancelled';
  type: 'Short' | 'Long';
  size: string;
  sizeUnit: string;
  entryPrice: number;
  marginUsage: string;
  slPrice?: number;
  tpPrice?: number;
  leverage: number;
  liquidationPrice?: number;
  margin: number;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

