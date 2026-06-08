import React from 'react';
import Header from './Header';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  /** 是否显示底部信息 */
  showFooter?: boolean;
  /** 内容区最大宽度 */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

/**
 * 通用页面布局容器
 * - 包含 Header + 内容区 + Footer
 * - 内容区带padding，最大宽度适配
 */
const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  className,
  showFooter = true,
  maxWidth = '7xl',
}) => {
  const maxWidthClasses: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/40">
      {/* 头部导航 */}
      <Header />

      {/* 主内容区 */}
      <main className="flex-1 w-full">
        <div
          className={cn(
            'mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10',
            maxWidthClasses[maxWidth === '7xl' ? '2xl' : maxWidth],
            className
          )}
        >
          {children}
        </div>
      </main>

      {/* 底部信息 */}
      {showFooter && (
        <footer className="w-full bg-white/60 backdrop-blur-sm border-t border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
              {/* 左侧版权信息 */}
              <div className="text-center sm:text-left">
                <p className="text-sm text-slate-600 font-medium">
                  © {new Date().getFullYear()} 药品追溯查询系统
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  国家药品监督管理局电子追溯平台
                </p>
              </div>

              {/* 右侧链接 */}
              <div className="flex items-center space-x-4 sm:space-x-6">
                <a
                  href="/privacy"
                  className="text-sm text-slate-500 hover:text-blue-600 transition-colors duration-200"
                >
                  隐私政策
                </a>
                <span className="text-slate-300">|</span>
                <a
                  href="/pharmacist"
                  className="text-sm text-slate-500 hover:text-blue-600 transition-colors duration-200"
                >
                  药师协助
                </a>
                <span className="text-slate-300">|</span>
                <a
                  href="/feedback"
                  className="text-sm text-slate-500 hover:text-blue-600 transition-colors duration-200"
                >
                  反馈建议
                </a>
              </div>
            </div>

            {/* 技术支持信息 */}
            <div className="mt-4 pt-4 border-t border-slate-200/60 text-center">
              <p className="text-xs text-slate-400">
                技术支持热线：400-888-12345 | 服务时间：周一至周日 8:00-22:00
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default PageLayout;
