import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  /** 卡片内容 */
  children: React.ReactNode;
  /** 卡片头部内容 */
  header?: React.ReactNode;
  /** 卡片标题（简化用法，与header二选一） */
  title?: string;
  /** 卡片副标题 */
  subtitle?: React.ReactNode;
  /** 卡片右上角操作区 */
  actions?: React.ReactNode;
  /** 是否可点击（有悬停效果） */
  hoverable?: boolean;
  /** 是否可选中 */
  selected?: boolean;
  /** 点击事件 */
  onClick?: () => void;
  /** 附加样式类名 */
  className?: string;
  /** 头部附加样式 */
  headerClassName?: string;
  /** 内容区附加样式 */
  contentClassName?: string;
  /** 是否显示阴影 */
  shadow?: boolean;
  /** 是否有边框 */
  bordered?: boolean;
}

/**
 * 通用卡片组件
 * - 圆角20px + 柔和阴影 + 可选header
 */
const Card: React.FC<CardProps> = ({
  children,
  header,
  title,
  subtitle,
  actions,
  hoverable = false,
  selected = false,
  onClick,
  className,
  headerClassName,
  contentClassName,
  shadow = true,
  bordered = true,
}) => {
  const hasHeader = header || title || subtitle || actions;

  return (
    <div
      onClick={onClick}
      className={cn(
        // 基础样式
        'bg-white rounded-[20px] overflow-hidden',
        // 边框
        bordered ? 'border border-slate-200/80' : '',
        // 阴影
        shadow
          ? 'shadow-sm shadow-slate-200/50 hover:shadow-md hover:shadow-slate-300/50'
          : '',
        // 悬停效果
        hoverable || onClick
          ? 'cursor-pointer transition-all duration-300 ease-out hover:-translate-y-0.5 active:translate-y-0'
          : '',
        // 选中状态
        selected
          ? 'ring-2 ring-blue-500 ring-offset-2 border-blue-200 bg-blue-50/30'
          : '',
        // 自定义样式
        className
      )}
    >
      {/* 卡片头部 */}
      {hasHeader && (
        <div
          className={cn(
            'px-5 sm:px-6 py-4 sm:py-5',
            'border-b border-slate-100',
            'bg-gradient-to-r from-slate-50/80 to-transparent',
            headerClassName
          )}
        >
          {header ? (
            // 自定义头部
            header
          ) : (
            // 默认头部布局
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {title && (
                  <h3 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </div>
              {actions && (
                <div className="shrink-0 flex items-center space-x-2">
                  {actions}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 卡片内容区 */}
      <div
        className={cn(
          'px-5 sm:px-6 py-4 sm:py-5',
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  );
};

export default Card;
