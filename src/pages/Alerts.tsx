import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Bell, BellOff, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import { Alert, Stock } from '@/types';

export const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [alertType, setAlertType] = useState('price_above');
  const [threshold, setThreshold] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await api.getAlerts();
      setAlerts(data);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      const results = await api.searchStocks(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleSave = async () => {
    if (!selectedStock || !threshold) return;
    
    setSaving(true);
    try {
      await api.createAlert({
        userId: 'user1',
        stockId: selectedStock.id,
        type: alertType as any,
        threshold: parseFloat(threshold),
        enabled: true,
      });
      setShowForm(false);
      setSelectedStock(null);
      setThreshold('');
      setSearchQuery('');
      loadAlerts();
    } catch (error) {
      console.error('Failed to create alert:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await api.deleteAlert(id);
    loadAlerts();
  };

  const getAlertTypeLabel = (type: string) => {
    switch (type) {
      case 'price_above':
        return '价格高于';
      case 'price_below':
        return '价格低于';
      case 'change_percent':
        return '涨跌幅达到';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center animate-pulse">
            <Bell className="w-6 h-6 text-white" />
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center border border-orange-500/20">
            <Bell className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">价格提醒</h1>
            <p className="text-xs text-slate-500">设置价格预警通知</p>
          </div>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-orange-500/20"
        >
          <Plus className="w-4 h-4" />
          创建提醒
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-6 mb-6">
          <h3 className="font-medium text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            新建价格提醒
          </h3>
          
          {/* 股票搜索 */}
          <div className="mb-4">
            <label className="block text-sm text-slate-500 mb-2">选择股票</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="搜索股票代码或名称"
                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/30 text-sm text-slate-200 placeholder-slate-600"
              />
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                  {searchResults.map((stock) => (
                    <button
                      key={stock.id}
                      onClick={() => {
                        setSelectedStock(stock);
                        setSearchQuery(stock.name);
                        setSearchResults([]);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-slate-800/50 text-sm"
                    >
                      <span className="font-mono text-cyan-400">{stock.symbol}</span>
                      <span className="ml-2 text-slate-300">{stock.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedStock && (
              <div className="mt-2 text-sm text-green-400">
                已选择: {selectedStock.symbol} - {selectedStock.name}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-500 mb-2">条件</label>
              <select
                value={alertType}
                onChange={(e) => setAlertType(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/30 text-sm text-slate-200"
              >
                <option value="price_above">价格高于</option>
                <option value="price_below">价格低于</option>
                <option value="change_percent">涨跌幅达到</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-500 mb-2">
                阈值 {alertType === 'change_percent' ? '(%)' : '(元)'}
              </label>
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder="输入数值"
                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/30 text-sm text-slate-200 placeholder-slate-600"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSave}
                disabled={!selectedStock || !threshold || saving}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button 
              onClick={() => {
                setShowForm(false);
                setSelectedStock(null);
                setThreshold('');
                setSearchQuery('');
              }}
              className="px-4 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {alerts.length === 0 ? (
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
            <BellOff className="w-8 h-8 text-slate-600" />
          </div>
          <p className="text-slate-400">暂无价格提醒</p>
          <p className="text-sm text-slate-600 mt-1">点击上方按钮创建价格提醒</p>
        </div>
      ) : (
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800/50 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-800/30">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">股票</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">条件</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">状态</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">创建时间</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {alerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-white">{alert.stock?.name || '未知'}</div>
                    <div className="text-sm text-slate-500 font-mono">{alert.stock?.symbol || '-'}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {getAlertTypeLabel(alert.type)} <span className="text-cyan-400 font-medium">{alert.threshold}</span>
                    {alert.type === 'change_percent' ? '%' : '元'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      alert.enabled 
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}>
                      {alert.enabled ? '生效中' : '已暂停'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500 text-sm">
                    {new Date(alert.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDelete(alert.id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
