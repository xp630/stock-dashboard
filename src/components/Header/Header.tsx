import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Settings, Command } from 'lucide-react';
import { api } from '@/lib/api';
import { Stock } from '@/types';

interface HeaderProps {
  onSearchSelect?: (stock: Stock) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearchSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Stock[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (value.length < 1) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const stocks = await api.searchStocks(value);
      setResults(stocks);
      setShowResults(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (stock: Stock) => {
    setQuery('');
    setShowResults(false);
    onSearchSelect?.(stock);
  };

  return (
    <header className="h-16 bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/50 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div ref={searchRef} className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="搜索股票代码/名称..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-80 pl-12 pr-20 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/30 text-sm text-slate-200 placeholder-slate-500 transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 bg-slate-700/50 rounded-md text-xs text-slate-500">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          </div>
          
          {showResults && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl shadow-cyan-500/5 z-50 max-h-72 overflow-y-auto">
              {results.map((stock) => (
                <button
                  key={stock.id}
                  onClick={() => handleSelect(stock)}
                  className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-purple-500/10 flex items-center justify-between border-b border-slate-800/50 last:border-0 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                      <span className="text-xs font-mono text-cyan-400">{stock.symbol.slice(0, 3)}</span>
                    </div>
                    <div>
                      <span className="font-mono font-medium text-slate-200">{stock.symbol}</span>
                      <span className="ml-2 text-slate-400">{stock.name}</span>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-slate-800 rounded text-slate-500">{stock.market}</span>
                </button>
              ))}
            </div>
          )}
          
          {showResults && query.length >= 1 && results.length === 0 && !loading && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-lg z-50 p-4 text-center text-slate-500 text-sm">
              未找到相关股票
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button className="p-2.5 hover:bg-slate-800/50 rounded-xl transition-all group relative">
          <Bell className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <button className="p-2.5 hover:bg-slate-800/50 rounded-xl transition-all group">
          <Settings className="w-5 h-5 text-slate-400 group-hover:text-purple-400 transition-colors" />
        </button>
        <div className="ml-2 w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-sm font-medium">
          U
        </div>
      </div>
    </header>
  );
};
