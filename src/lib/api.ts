import { Stock, Quote, WatchlistItem, Alert, Position, UserSettings } from '@/types';

// 东方财富实时行情API接口
const EF_API_BASE = 'https://push2.eastmoney.com/api/qt';

// 股票代码映射：东方财富使用 secid 格式 (0.深市, 1.沪市)
const getSecId = (symbol: string): string => {
  if (symbol.startsWith('6')) return `1.${symbol}`; // 沪市
  if (symbol.startsWith('0') || symbol.startsWith('3')) return `0.${symbol}`; // 深市
  if (symbol.startsWith('8') || symbol.startsWith('4')) return `0.${symbol}`; // 北交所
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

// 从本地存储获取或使用默认列表
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

// Mock数据作为备用
const generateMockQuote = (stock: Stock): Quote => {
  const basePrice = stock.symbol === '600519' ? 1720 : 
                    stock.symbol === '300750' ? 365 :
                    stock.symbol === '000001' ? 12 :
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
  // 批量获取股票行情 (使用集合)
  async fetchQuotes(stocks: Stock[]): Promise<Quote[]> {
    if (stocks.length === 0) return [];

    // 构建secids参数
    const secids = stocks.map(s => getSecId(s.symbol)).join(',');
    const url = `${EF_API_BASE}/ulist.np/get?pn=1&pz=${stocks.length}&po=1&np=1&fltt=2&invt=2&fid=f3&fs=m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23&secids=${secids}&fields=f1,f2,f3,f4,f12,f13,f14,f21,f22,f23`;
    
    try {
      console.log('Fetching quotes from:', url);
      const response = await fetch(url);
      const json = await response.json();
      
      console.log('API Response:', json);
      
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
      console.error('Failed to fetch quotes:', error);
    }
    
    // 如果API失败，使用Mock数据
    console.log('Using mock data as fallback');
    return stocks.map(generateMockQuote);
  }

  // Stock APIs
  async searchStocks(query: string): Promise<Stock[]> {
    const q = query.toLowerCase();
    const stocks = getWatchlistSymbols();
    
    // 先尝试从本地列表搜索
    const localResults = stocks.filter(s => 
      s.symbol.toLowerCase().includes(q) || 
      s.name.toLowerCase().includes(q)
    );
    
    if (localResults.length > 0) {
      return localResults.slice(0, 10);
    }
    
    // 如果本地没有，尝试API搜索
    try {
      const url = `${EF_API_BASE}/ulist.np/get?pn=1&pz=20&po=1&np=1&fltt=2&invt=2&fid=f3&fs=m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23&fields=f12,f13,f14,f3`;
      const response = await fetch(url);
      const json = await response.json();
      
      if (json.data && json.data.diff) {
        return json.data.diff
          .filter((item: any) => {
            const code = String(item.f12).toLowerCase();
            const name = (item.f14 || '').toLowerCase();
            return code.includes(q) || name.includes(q);
          })
          .slice(0, 10)
          .map((item: any) => ({
            id: String(item.f12),
            symbol: String(item.f12),
            name: item.f14 || '',
            market: item.f13 === 1 ? 'SH' as const : 'SZ' as const,
            sector: '',
          }));
      }
    } catch (error) {
      console.error('Search failed:', error);
    }
    
    return [];
  }

  async getStock(id: string): Promise<Stock | undefined> {
    const stocks = getWatchlistSymbols();
    return stocks.find(s => s.id === id || s.symbol === id);
  }

  // Quote APIs
  async getQuote(stockId: string): Promise<Quote | undefined> {
    const stocks = getWatchlistSymbols();
    const stock = stocks.find(s => s.symbol === stockId || s.id === stockId);
    if (!stock) return undefined;
    
    const quotes = await this.fetchQuotes([stock]);
    return quotes[0];
  }

  async getQuotes(stockIds: string[]): Promise<Quote[]> {
    const stocks = stockIds.map(id => {
      const all = getWatchlistSymbols();
      return all.find(s => s.symbol === id || s.id === id) || { symbol: id, name: id, id, market: 'SH' as const } as Stock;
    }).filter(s => s.symbol);
    
    return this.fetchQuotes(stocks);
  }

  // Watchlist APIs
  async getWatchlist(): Promise<WatchlistItem[]> {
    await this.delay(200);
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
    await this.delay(300);
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
    await this.delay(200);
    const stocks = getWatchlistSymbols();
    const filtered = stocks.filter(s => s.id !== id);
    localStorage.setItem('watchlist_stocks', JSON.stringify(filtered));
  }

  // Alert APIs
  async getAlerts(): Promise<Alert[]> {
    await this.delay(200);
    const stored = localStorage.getItem('alerts');
    return stored ? JSON.parse(stored) : [];
  }

  async createAlert(alertData: { userId: string; stockId: string; type: string; threshold: number; enabled: boolean }): Promise<Alert> {
    await this.delay(300);
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
    await this.delay(200);
    const alerts = await this.getAlerts();
    const filtered = alerts.filter(a => a.id !== id);
    localStorage.setItem('alerts', JSON.stringify(filtered));
  }

  // Settings APIs
  async getSettings(): Promise<UserSettings> {
    await this.delay(200);
    const stored = localStorage.getItem('settings');
    if (stored) {
      return JSON.parse(stored);
    }
    const defaultSettings: UserSettings = {
      theme: 'light',
      refreshInterval: 5,
      priceAlertEnabled: true,
      soundEnabled: false,
    };
    localStorage.setItem('settings', JSON.stringify(defaultSettings));
    return defaultSettings;
  }

  async updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    await this.delay(200);
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem('settings', JSON.stringify(updated));
    return updated;
  }

  // Dashboard APIs
  async getDashboardSummary() {
    await this.delay(400);
    const watchlist = await this.getWatchlist();
    const quotes = await this.fetchQuotes(watchlist.map(w => w.stock));
    
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
