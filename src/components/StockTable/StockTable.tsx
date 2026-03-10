import React from 'react';
import { Quote } from '@/types';
import { PriceChange, PriceChangePercent } from '@/components/Common/PriceChange';

interface StockTableProps {
  quotes: Quote[];
  onRowClick?: (quote: Quote) => void;
}

export const StockTable: React.FC<StockTableProps> = ({ quotes, onRowClick }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-800/30">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">代码</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">名称</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">最新价</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">涨跌</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">涨跌幅</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">成交量</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">成交额</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">换手率</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {quotes.map((quote) => {
            const isPositive = quote.change > 0;
            const isZero = quote.change === 0;
            const rowClass = isZero ? '' : isPositive ? 'hover:bg-red-500/5' : 'hover:bg-green-500/5';
            
            return (
              <tr 
                key={quote.id} 
                onClick={() => onRowClick?.(quote)}
                className={`transition-colors cursor-pointer ${rowClass}`}
              >
                <td className="px-4 py-3 font-mono text-cyan-400">{quote.symbol}</td>
                <td className="px-4 py-3 text-slate-300">{quote.name}</td>
                <td className="px-4 py-3 text-right font-semibold text-white">{quote.price.toFixed(2)}</td>
                <td className="px-4 py-3 text-right">
                  <span className={isZero ? 'text-slate-500' : isPositive ? 'text-red-400' : 'text-green-400'}>
                    {isPositive ? '+' : ''}{quote.change.toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-sm font-medium ${
                    isZero ? 'bg-slate-800 text-slate-500' : 
                    isPositive ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                  }`}>
                    {isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-slate-400">
                  {(quote.volume / 10000).toFixed(2)}万
                </td>
                <td className="px-4 py-3 text-right text-slate-400">
                  {(quote.amount / 100000000).toFixed(2)}亿
                </td>
                <td className="px-4 py-3 text-right text-slate-400">
                  {quote.turnover.toFixed(2)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
