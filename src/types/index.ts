// Stock types
export interface Stock {
  id: string;
  symbol: string;
  name: string;
  market: 'SH' | 'SZ' | 'HK' | 'US';
  sector?: string;
}

export interface Quote {
  id: string;
  stockId: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  amount: number;
  turnover: number;
  timestamp: Date;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  stockId: string;
  stock: Stock;
  addedAt: Date;
  note?: string;
}

export interface Alert {
  id: string;
  userId: string;
  stockId: string;
  stock: Stock;
  type: 'price_above' | 'price_below' | 'change_percent';
  threshold: number;
  enabled: boolean;
  triggeredAt?: Date;
  createdAt: Date;
}

export interface Position {
  id: string;
  userId: string;
  stockId: string;
  stock: Stock;
  quantity: number;
  costPrice: number;
  currentPrice: number;
  profitLoss: number;
  profitLossPercent: number;
  purchaseDate: Date;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  refreshInterval: number;
  priceAlertEnabled: boolean;
  soundEnabled: boolean;
}
