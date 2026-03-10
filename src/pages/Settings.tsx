import React, { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Moon, Sun, Bell, Volume2, RefreshCw, Shield } from 'lucide-react';
import { api } from '@/lib/api';
import { UserSettings } from '@/types';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'light',
    refreshInterval: 5,
    priceAlertEnabled: true,
    soundEnabled: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = async (key: keyof UserSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await api.updateSettings(newSettings);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center animate-pulse">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div className="text-slate-400">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 标题 */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/20">
          <SettingsIcon className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">设置</h1>
          <p className="text-xs text-slate-500">自定义您的使用体验</p>
        </div>
      </div>

      <div className="space-y-4 max-w-2xl">
        {/* Theme */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                settings.theme === 'dark' ? 'bg-purple-500/20' : 'bg-amber-500/20'
              }`}>
                {settings.theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-purple-400" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-400" />
                )}
              </div>
              <div>
                <div className="font-medium text-white">主题</div>
                <div className="text-sm text-slate-500">选择界面配色方案</div>
              </div>
            </div>
            <select
              value={settings.theme}
              onChange={(e) => handleChange('theme', e.target.value)}
              className="px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/30 text-sm text-slate-200"
            >
              <option value="light">浅色</option>
              <option value="dark">深色</option>
            </select>
          </div>
        </div>

        {/* Refresh Interval */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-cyan-500/20">
                <RefreshCw className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <div className="font-medium text-white">行情刷新间隔</div>
                <div className="text-sm text-slate-500">实时行情自动刷新时间</div>
              </div>
            </div>
            <select
              value={settings.refreshInterval}
              onChange={(e) => handleChange('refreshInterval', Number(e.target.value))}
              className="px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/30 text-sm text-slate-200"
            >
              <option value={3}>3秒</option>
              <option value={5}>5秒</option>
              <option value={10}>10秒</option>
              <option value={30}>30秒</option>
            </select>
          </div>
        </div>

        {/* Price Alert */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-orange-500/20">
                <Bell className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <div className="font-medium text-white">价格提醒</div>
                <div className="text-sm text-slate-500">启用价格到达时推送通知</div>
              </div>
            </div>
            <button
              onClick={() => handleChange('priceAlertEnabled', !settings.priceAlertEnabled)}
              className={`w-14 h-7 rounded-full transition-all duration-300 ${
                settings.priceAlertEnabled 
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500' 
                  : 'bg-slate-700'
              }`}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform duration-300 ${
                settings.priceAlertEnabled ? 'translate-x-7' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>

        {/* Sound */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-pink-500/20">
                <Volume2 className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <div className="font-medium text-white">声音提示</div>
                <div className="text-sm text-slate-500">触发提醒时播放提示音</div>
              </div>
            </div>
            <button
              onClick={() => handleChange('soundEnabled', !settings.soundEnabled)}
              className={`w-14 h-7 rounded-full transition-all duration-300 ${
                settings.soundEnabled 
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500' 
                  : 'bg-slate-700'
              }`}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform duration-300 ${
                settings.soundEnabled ? 'translate-x-7' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-green-500/20">
              <Shield className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="font-medium text-white">数据安全</div>
              <div className="text-sm text-slate-500">本地存储，保护您的隐私数据</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
