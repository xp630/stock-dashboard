import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Star, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { WatchlistItem, Quote } from '@/types';
import { PriceChange, PriceChangePercent } from '@/components/Common/PriceChange';

export const Watchlist: React.FC = () => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [watchlistData, quotesData] = await Promise.all([
        api.getWatchlist(),
        api.getDashboardSummary(),
      ]);
      setWatchlist(watchlistData);
      setQuotes(quotesData.quotes);
    } catch (error) {
      console.error('Failed to load watchlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    await api.removeFromWatchlist(id);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center animate-pulse">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div className="text-slate-400">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 标题 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/20">
            <Star className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">自选股管理</h1>
            <p className="text-xs text-slate-500">管理您的自选股票</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/20">
          <Plus className="w-4 h-4" />
          添加自选
        </button>
      </div>

      {watchlist.length === 0 ? (
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-slate-600" />
          </div>
          <p className="text-slate-400">暂无自选股</p>
          <p className="text-sm text-slate-600 mt-1">点击上方按钮添加自选股</p>
        </div>
      ) : (
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800/50 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-800/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">代码</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">名称</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">最新价</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">涨跌</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">涨跌幅</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">添加时间</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {watchlist.map((item) => {
                const quote = quotes.find(q => q.stockId === item.stockId);
                const isPositive = quote?.change ? quote.change > 0 : true;
                
                return (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-cyan-400">{item.stock.symbol}</td>
                    <td className="px-4 py-3 text-slate-300">{item.stock.name}</td>
                    <td className="px-4 py-3 text-right font-semibold text-white">
                      {quote?.price.toFixed(2) || '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {quote && <PriceChange value={quote.change} />}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {quote && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-sm font-medium ${
                          isPositive ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                        }`}>
                          {isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500 text-sm">
                      {new Date(item.addedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
