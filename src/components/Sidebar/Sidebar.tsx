import React from 'react';
import { 
  LayoutDashboard, 
  Star, 
  Wallet, 
  Bell, 
  Settings,
  TrendingUp,
  Activity
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: '监控看板', icon: LayoutDashboard },
  { id: 'watchlist', label: '自选股', icon: Star },
  { id: 'positions', label: '持仓管理', icon: Wallet },
  { id: 'alerts', label: '价格提醒', icon: Bell },
  { id: 'settings', label: '设置', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  return (
    <div className="w-60 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/50 h-screen flex flex-col tech-grid">
      <div className="p-5 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center glow-cyan">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-pulse-glow"></div>
          </div>
          <div>
            <span className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              StockX
            </span>
            <div className="text-xs text-slate-500">实时行情监控</div>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : ''}`} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50"></div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-slate-800/50">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span>系统在线</span>
          <span className="ml-auto">v1.0.0</span>
        </div>
      </div>
    </div>
  );
};
