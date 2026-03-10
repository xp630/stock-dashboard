import React from 'react';
import { Wallet, Construction } from 'lucide-react';

export const Positions: React.FC = () => {
  return (
    <div className="p-6">
      {/* 标题 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-500/20">
          <Wallet className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">持仓管理</h1>
          <p className="text-xs text-slate-500">追踪您的股票持仓</p>
        </div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-12 text-center">
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-2xl bg-slate-800/50 flex items-center justify-center">
            <Construction className="w-10 h-10 text-slate-600" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center">
            <Construction className="w-3 h-3 text-white" />
          </div>
        </div>
        <p className="text-slate-400 mt-6 font-medium">功能开发中</p>
        <p className="text-sm text-slate-600 mt-2">持仓管理功能即将上线，敬请期待</p>
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
          <span>持续更新中</span>
        </div>
      </div>
    </div>
  );
};
