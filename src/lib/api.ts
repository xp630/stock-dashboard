import { Stock, Quote, WatchlistItem, Alert, UserSettings } from '@/types';

// 后端API代理地址 - Render部署
const API_PROXY = 'https://stock-dashboard-bcyh.onrender.com';

// 股票代码映射
const getSecId = (symbol: string): string => {
  if (symbol.startsWith('6')) return `1.${symbol}`;
  if (symbol.startsWith('0') || symbol.startsWith('3')) return `0.${symbol}`;
  return `1.${symbol}`;
};

// 默认自选股列表
const DEFAULT_WATCHLIST: Stock[] = [
  { id: '1', symbol: '600446', name: '金证股份', market: 'SH', sector: '软件服务' },
  { id: '2', symbol: '300463', name: '迈克生物', market: 'SZ', sector: '医疗器械' },
  { id: '3', symbol: '000001', name: '平安银行', market: 'SZ', sector: '银行' },
  { id: '4', symbol: '600519', name: '贵州茅台', market: 'SH', sector: '酿酒' },
  { id: '5', symbol: '300750', name: '宁德时代', market: 'SZ', sector: '新能源' },
];

// 从本地存储获取
const getWatchlistSymbols = (): Stock[] => {
  const stored = localStorage.getItem('watchlist_stocks');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse watchlist:', e);
    }
  }
  localStorage.setItem('watchlist_stocks', JSON.stringify(DEFAULT_WATCHLIST));
  return DEFAULT_WATCHLIST;
};

// 生成模拟数据（基于真实价格范围）
const generateMockQuote = (stock: Stock): Quote => {
  const basePrice = stock.symbol === '600519' ? 1403 : 
                    stock.symbol === '300750' ? 374 :
                    stock.symbol === '000001' ? 12 :
                    stock.symbol === '600446' ? 14.5 :
                    stock.symbol === '300463' ? 11.5 :
                    Math.random() * 50 + 10;
  const change = (Math.random() - 0.5) * basePrice * 0.05;
  const changePercent = (change / basePrice) * 100;
  
  return {
    id: `q-${stock.symbol}`,
    stockId: stock.symbol,
    symbol: stock.symbol,
    name: stock.name,
    price: Number((basePrice + change).toFixed(2)),
    change: Number(change.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
    open: Number((basePrice * 0.98).toFixed(2)),
    high: Number((basePrice * 1.02).toFixed(2)),
    low: Number((basePrice * 0.97).toFixed(2)),
    volume: Math.floor(Math.random() * 10000000),
    amount: Math.floor(Math.random() * 100000000),
    turnover: Number((Math.random() * 5).toFixed(2)),
    timestamp: new Date(),
  };
};

class ApiService {
  private useRealApi: boolean = false;

  constructor() {
    // 如果配置了API代理地址，则使用真实API
    if (typeof API_PROXY === 'string' && API_PROXY.trim() !== '') {
      this.useRealApi = true;
    }
  }

  // 从后端获取行情数据
  async fetchQuotesFromProxy(stocks: Stock[]): Promise<Quote[]> {
    if (!this.useRealApi || !API_PROXY) {
      return stocks.map(generateMockQuote);
    }

    try {
      const symbols = stocks.map(s => s.symbol).join(',');
      const response = await fetch(`${API_PROXY}/api/quotes?symbols=${symbols}`);
      const json = await response.json();

      if (json.data && json.data.diff) {
        return json.data.diff.map((item: any) => ({
          id: `q-${item.f12}`,
          stockId: String(item.f12),
          symbol: String(item.f12),
          name: item.f14 || '',
          price: item.f2 === '-' || item.f2 === '' ? 0 : Number(item.f2),
          change: item.f4 === '-' || item.f4 === '' ? 0 : Number(item.f4),
          changePercent: item.f3 === '-' || item.f3 === '' ? 0 : Number(item.f3),
          open: 0,
          high: 0,
          low: 0,
          volume: item.f21 || 0,
          amount: 0,
          turnover: item.f23 === '-' || item.f23 === '' ? 0 : Number(item.f23),
          timestamp: new Date(),
        }));
      }
    } catch (error) {
      console.error('Proxy fetch failed:', error);
    }

    // 如果失败，使用模拟数据
    return stocks.map(generateMockQuote);
  }

  // 搜索股票 - 使用真实API
  async searchStocks(query: string): Promise<Stock[]> {
    const q = query.toLowerCase();
    
    // 尝试从API搜索
    if (this.useRealApi && API_PROXY) {
      try {
        const response = await fetch(`${API_PROXY}/api/search?q=${q}`);
        const json = await response.json();
        
        if (json.data && json.data.diff) {
          return json.data.diff.slice(0, 20).map((item: any) => ({
            id: String(item.f12),
            symbol: String(item.f12),
            name: item.f14 || '',
            market: item.f13 === 1 ? 'SH' as const : 'SZ' as const,
            sector: '',
          }));
        }
      } catch (error) {
        console.error('Search API failed:', error);
      }
    }
    
    // 降级到本地列表
    return this.searchLocal(query);
  }
  
  // 本地搜索备用
  searchLocal(query: string): Stock[] {
    const q = query.toLowerCase();
    const ALL_STOCKS: Stock[] = [
      { id: '1', symbol: '600446', name: '金证股份', market: 'SH', sector: '软件服务' },
      { id: '2', symbol: '300463', name: '迈克生物', market: 'SZ', sector: '医疗器械' },
      { id: '3', symbol: '000001', name: '平安银行', market: 'SZ', sector: '银行' },
      { id: '4', symbol: '600519', name: '贵州茅台', market: 'SH', sector: '酿酒' },
      { id: '5', symbol: '300750', name: '宁德时代', market: 'SZ', sector: '新能源' },
      { id: '6', symbol: '000858', name: '五粮液', market: 'SZ', sector: '酿酒' },
      { id: '7', symbol: '600036', name: '招商银行', market: 'SH', sector: '银行' },
      { id: '8', symbol: '601318', name: '中国平安', market: 'SH', sector: '保险' },
      { id: '9', symbol: '600900', name: '长江电力', market: 'SH', sector: '电力' },
      { id: '10', symbol: '000333', name: '美的集团', market: 'SZ', sector: '家电' },
    ];
    
    return ALL_STOCKS.filter(s => 
      s.symbol.toLowerCase().includes(q) || 
      s.name.toLowerCase().includes(q)
    ).slice(0, 10);
  }

  async getStock(id: string): Promise<Stock | undefined> {
    const stocks = getWatchlistSymbols();
    return stocks.find(s => s.id === id || s.symbol === id);
  }

  async getQuote(stockId: string): Promise<Quote | undefined> {
    const stocks = getWatchlistSymbols();
    const stock = stocks.find(s => s.symbol === stockId || s.id === stockId);
    if (!stock) return undefined;
    
    return generateMockQuote(stock);
  }

  async getQuotes(stockIds: string[]): Promise<Quote[]> {
    const stocks = stockIds.map(id => {
      const all = getWatchlistSymbols();
      return all.find(s => s.symbol === id || s.id === id) || { symbol: id, name: id, id, market: 'SH' as const } as Stock;
    }).filter(s => s.symbol);
    
    return this.fetchQuotesFromProxy(stocks);
  }

  // Watchlist APIs
  async getWatchlist(): Promise<WatchlistItem[]> {
    await this.delay(100);
    const stocks = getWatchlistSymbols();
    return stocks.map((stock, i) => ({
      id: `w-${i + 1}`,
      userId: 'user1',
      stockId: stock.id,
      stock,
      addedAt: new Date(),
    }));
  }

  async addToWatchlist(stockId: string): Promise<WatchlistItem> {
    await this.delay(100);
    const stocks = getWatchlistSymbols();
    let stock = stocks.find(s => s.id === stockId || s.symbol === stockId);
    
    if (!stock) {
      stock = { id: stockId, symbol: stockId, name: stockId, market: 'SH', sector: '' };
      stocks.push(stock);
      localStorage.setItem('watchlist_stocks', JSON.stringify(stocks));
    }
    
    return {
      id: `w-${Date.now()}`,
      userId: 'user1',
      stockId: stock.id,
      stock,
      addedAt: new Date(),
    };
  }

  async removeFromWatchlist(id: string): Promise<void> {
    await this.delay(100);
    const stocks = getWatchlistSymbols();
    const filtered = stocks.filter(s => s.id !== id);
    localStorage.setItem('watchlist_stocks', JSON.stringify(filtered));
  }

  // Alert APIs
  async getAlerts(): Promise<Alert[]> {
    await this.delay(100);
    const stored = localStorage.getItem('alerts');
    return stored ? JSON.parse(stored) : [];
  }

  async createAlert(alertData: { userId: string; stockId: string; type: string; threshold: number; enabled: boolean }): Promise<Alert> {
    await this.delay(100);
    const alerts = await this.getAlerts();
    const stocks = getWatchlistSymbols();
    const stock = stocks.find(s => s.id === alertData.stockId || s.symbol === alertData.stockId);
    
    const newAlert: Alert = {
      userId: alertData.userId,
      stockId: alertData.stockId,
      stock: stock || { id: alertData.stockId, symbol: alertData.stockId, name: '', market: 'SH' as const },
      type: alertData.type as 'price_above' | 'price_below' | 'change_percent',
      threshold: alertData.threshold,
      enabled: alertData.enabled,
      id: `a-${Date.now()}`,
      createdAt: new Date(),
    };
    
    alerts.push(newAlert);
    localStorage.setItem('alerts', JSON.stringify(alerts));
    return newAlert;
  }

  async deleteAlert(id: string): Promise<void> {
    await this.delay(100);
    const alerts = await this.getAlerts();
    const filtered = alerts.filter(a => a.id !== id);
    localStorage.setItem('alerts', JSON.stringify(filtered));
  }

  // Settings APIs
  async getSettings(): Promise<UserSettings> {
    await this.delay(100);
    const stored = localStorage.getItem('settings');
    if (stored) {
      return JSON.parse(stored);
    }
    const defaultSettings: UserSettings = {
      theme: 'dark',
      refreshInterval: 5,
      priceAlertEnabled: true,
      soundEnabled: false,
    };
    localStorage.setItem('settings', JSON.stringify(defaultSettings));
    return defaultSettings;
  }

  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    await this.delay(100);
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem('settings', JSON.stringify(updated));
    return updated;
  }

  // Dashboard APIs
  async getDashboardSummary() {
    await this.delay(200);
    const watchlist = await this.getWatchlist();
    const quotes = await this.getQuotes(watchlist.map(w => w.stockId));
    
    const totalProfitLoss = quotes.reduce((sum, q) => sum + q.change * 1000, 0);
    const upCount = quotes.filter(q => q.change > 0).length;
    const downCount = quotes.filter(q => q.change < 0).length;
    
    return {
      watchlistCount: watchlist.length,
      totalProfitLoss: Number(totalProfitLoss.toFixed(2)),
      upCount,
      downCount,
      quotes,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const api = new ApiService();
