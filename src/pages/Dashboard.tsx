import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Quote, WatchlistItem } from '@/types';
import { StockCard } from '@/components/StockCard/StockCard';
import { StockTable } from '@/components/StockTable/StockTable';
import { PriceChange } from '@/components/Common/PriceChange';
import { Activity, TrendingUp, TrendingDown, Clock, Zap } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [watchlistData, summaryData] = await Promise.all([
        api.getWatchlist(),
        api.getDashboardSummary(),
      ]);
      setWatchlist(watchlistData);
      setQuotes(summaryData.quotes);
      setSummary(summaryData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
              <Activity className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 animate-ping opacity-20"></div>
          </div>
          <div className="text-slate-400">加载行情数据中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 标题区域 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center border border-cyan-500/20">
          <Activity className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">监控看板</h1>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-3 h-3" />
            <span>实时更新</span>
            <span className="w-1 h-1 rounded-full bg-cyan-400"></span>
            <span className="text-cyan-400">5秒</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="group relative bg-slate-900/60 backdrop-blur-xl rounded-2xl p-5 border border-slate-800/50 hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-sm">自选股数量</span>
            <Zap className="w-4 h-4 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-3xl font-bold text-white">{summary?.watchlistCount || 0}</div>
          <div className="text-xs text-slate-600 mt-1">只股票</div>
        </div>
        
        <div className="group relative bg-slate-900/60 backdrop-blur-xl rounded-2xl p-5 border border-slate-800/50 hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-sm">总涨跌</span>
            <TrendingUp className="w-4 h-4 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-3xl font-bold">
            <PriceChange value={summary?.totalProfitLoss || 0} />
          </div>
          <div className="text-xs text-slate-600 mt-1">参考值</div>
        </div>
        
        <div className="group relative bg-slate-900/60 backdrop-blur-xl rounded-2xl p-5 border border-slate-800/50 hover:border-red-500/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-sm">上涨</span>
            <TrendingUp className="w-4 h-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-3xl font-bold text-red-400">{summary?.upCount || 0}</div>
          <div className="text-xs text-slate-600 mt-1">只股票</div>
        </div>
        
        <div className="group relative bg-slate-900/60 backdrop-blur-xl rounded-2xl p-5 border border-slate-800/50 hover:border-green-500/30 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-sm">下跌</span>
            <TrendingDown className="w-4 h-4 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-3xl font-bold text-green-400">{summary?.downCount || 0}</div>
          <div className="text-xs text-slate-600 mt-1">只股票</div>
        </div>
      </div>

      {/* Stock Cards */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-gradient-to-b from-cyan-500 to-purple-500"></span>
            自选股行情
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>实时监控中</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {quotes.map((quote) => (
            <StockCard key={quote.id} quote={quote} />
          ))}
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800/50 overflow-hidden">
        <div className="p-4 border-b border-slate-800/50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-gradient-to-b from-cyan-500 to-purple-500"></span>
            行情列表
          </h2>
          <div className="text-xs text-slate-500">
            共 {quotes.length} 只股票
          </div>
        </div>
        <StockTable quotes={quotes} />
      </div>
    </div>
  );
};
