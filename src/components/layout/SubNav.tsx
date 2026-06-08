import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FileText, Clock, ShieldAlert, Pill } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SubNavTab = 'info' | 'timeline' | 'risk' | 'guide';

interface SubNavProps {
  /** 当前激活的Tab */
  activeTab: SubNavTab;
  /** 药品追溯码 */
  traceCode: string;
}

/**
 * 药品详情子导航组件
 * - Tab式导航：药品档案 | 流向时间轴 | 风险核验 | 用药提示
 * - 点击跳转对应路由
 */
const SubNav: React.FC<SubNavProps> = ({ activeTab, traceCode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Tab配置
  const tabs: Array<{
    key: SubNavTab;
    label: string;
    icon: React.ReactNode;
    route: string;
  }> = [
    {
      key: 'info',
      label: '药品档案',
      icon: <FileText className="w-4 h-4 sm:w-5 sm:h-5" />,
      route: `/drug/${traceCode}`,
    },
    {
      key: 'timeline',
      label: '流向时间轴',
      icon: <Clock className="w-4 h-4 sm:w-5 sm:h-5" />,
      route: `/drug/${traceCode}/timeline`,
    },
    {
      key: 'risk',
      label: '风险核验',
      icon: <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />,
      route: `/drug/${traceCode}/risk`,
    },
    {
      key: 'guide',
      label: '用药提示',
      icon: <Pill className="w-4 h-4 sm:w-5 sm:h-5" />,
      route: `/drug/${traceCode}/guide`,
    },
  ];

  // 处理Tab点击
  const handleTabClick = (route: string) => {
    // 如果当前已在该路由，不做跳转
    if (location.pathname === route) return;
    navigate(route);
  };

  return (
    <nav className="w-full">
      {/* 桌面端：Tab导航条 */}
      <div className="hidden sm:block">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-1.5 shadow-sm border border-slate-200/60">
          <div className="flex items-center justify-between">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabClick(tab.route)}
                  className={cn(
                    'flex-1 flex items-center justify-center space-x-2',
                    'px-4 py-3 mx-0.5 rounded-xl',
                    'text-sm font-medium transition-all duration-300 ease-out',
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30 scale-[1.02]'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50/60',
                    'active:scale-95'
                  )}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 移动端：可滑动Tab导航 */}
      <div className="sm:hidden">
        <div className="flex items-center overflow-x-auto -mx-4 px-4 pb-2 scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab.route)}
                className={cn(
                  'flex items-center space-x-1.5',
                  'flex-shrink-0 px-4 py-2.5 mr-2 rounded-xl',
                  'text-sm font-medium transition-all duration-200 ease-out',
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/30'
                    : 'bg-white/80 text-slate-600 border border-slate-200/60',
                  'active:scale-95'
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 当前位置提示（面包屑） */}
      <div className="mt-3 sm:mt-4 flex items-center text-xs text-slate-500">
        <span className="inline-flex items-center">
          <span className="text-slate-400">追溯码：</span>
          <code className="ml-1 px-2 py-0.5 bg-slate-100 rounded-md text-slate-700 font-mono text-xs">
            {traceCode.replace(/(\d{2})(\d{6})(\d{6})(\d{6})/, '$1 $2 $3 $4')}
          </code>
        </span>
      </div>
    </nav>
  );
};

export default SubNav;
