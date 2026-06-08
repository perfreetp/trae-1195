import React, { useState, useEffect } from 'react';
import { Pill, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

/**
 * 头部导航组件
 * - Logo + 系统名称
 * - 当前时间实时显示
 * - 返回首页按钮
 * - 医疗蓝渐变背景，玻璃拟态效果
 */
const Header: React.FC = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState<string>('');

  // 实时更新当前时间
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      const weekDay = weekDays[now.getDay()];
      setCurrentTime(`${year}-${month}-${day} ${weekDay} ${hours}:${minutes}:${seconds}`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // 返回首页
  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* 医疗蓝渐变背景 + 玻璃拟态 */}
      <div
        className={cn(
          'bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-500',
          'backdrop-blur-xl bg-opacity-90',
          'shadow-lg shadow-blue-500/20',
          'border-b border-white/20'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* 左侧：Logo + 系统名称 */}
            <div className="flex items-center space-x-3">
              {/* Logo - 药片图标 */}
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl shadow-inner">
                <Pill className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={2.5} />
              </div>
              {/* 系统名称 */}
              <div className="flex flex-col">
                <h1 className="text-lg sm:text-2xl font-bold text-white tracking-wide drop-shadow-sm">
                  药品追溯查询系统
                </h1>
                <span className="hidden sm:block text-xs text-blue-100/80 mt-0.5">
                  Drug Traceability Query System
                </span>
              </div>
            </div>

            {/* 右侧：时间 + 返回首页按钮 */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* 当前时间 */}
              <div className="hidden sm:flex items-center px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-lg">
                <span className="text-sm font-medium text-white/95 tabular-nums">
                  {currentTime}
                </span>
              </div>
              {/* 移动端显示简化时间 */}
              <div className="sm:hidden flex items-center px-2 py-1 bg-white/15 backdrop-blur-sm rounded-lg">
                <span className="text-xs font-medium text-white/95 tabular-nums">
                  {currentTime.slice(0, 10)}
                </span>
              </div>

              {/* 返回首页按钮 */}
              <button
                onClick={handleGoHome}
                className={cn(
                  'flex items-center space-x-1.5 sm:space-x-2',
                  'px-3 sm:px-5 py-2 sm:py-2.5',
                  'bg-white/20 hover:bg-white/30 active:bg-white/40',
                  'backdrop-blur-sm rounded-xl',
                  'text-white font-medium text-sm sm:text-base',
                  'border border-white/30',
                  'transition-all duration-200 ease-out',
                  'hover:shadow-lg hover:shadow-white/10',
                  'active:scale-95'
                )}
              >
                <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">返回首页</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
