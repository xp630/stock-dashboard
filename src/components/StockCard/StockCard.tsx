import React from 'react';
import { Quote } from '@/types';
import { PriceChange, PriceChangePercent } from '@/components/Common/PriceChange';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';

interface StockCardProps {
  quote: Quote;
  onClick?: () => void;
}

export const StockCard: React.FC<StockCardProps> = ({ quote, onClick }) => {
  const isPositive = quote.change > 0;
  const isZero = quote.change === 0;
  
  return (
    <div 
      onClick={onClick}
      className="group relative bg-slate-900/60 backdrop-blur-xl rounded-2xl p-5 cursor-pointer hover:bg-slate-800/60 transition-all duration-300 border border-slate-800/50 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10"
    >
      {/* 发光背景效果 */}
      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
        isZero ? '' : isPositive ? 'bg-gradient-to-br from-red-500/5 to-transparent' : 'bg-gradient-to-br from-green-500/5 to-transparent'
      }`}></div>
      
      <div className="relative">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors">{quote.symbol}</span>
              <Zap className="w-3 h-3 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-slate-500 text-sm">{quote.name}</div>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isZero ? 'bg-slate-800' : isPositive ? 'bg-gradient-to-br from-red-500/20 to-red-600/10' : 'bg-gradient-to-br from-green-500/20 to-green-600/10'
          }`}>
            {isZero ? (
              <div className="w-4 h-4" />
            ) : isPositive ? (
              <TrendingUp className="w-5 h-5 text-red-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-green-400" />
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-end">
          <div className="text-3xl font-bold text-white tracking-tight">
            {quote.price.toFixed(2)}
          </div>
          <div className="text-right">
            <div className={isZero ? 'text-slate-500' : isPositive ? 'text-red-400' : 'text-green-400'}>
              {isPositive ? '+' : ''}{quote.change.toFixed(2)}
            </div>
            <div className={`text-sm font-medium ${isZero ? 'text-slate-500' : isPositive ? 'text-red-400' : 'text-green-400'}`}>
              {isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-800/50 grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">成交量</span>
            <span className="text-slate-300">{(quote.volume / 10000).toFixed(2)}万</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">成交额</span>
            <span className="text-slate-300">{(quote.amount / 100000000).toFixed(2)}亿</span>
          </div>
        </div>
      </div>
    </div>
  );
};
