import React from 'react';
import { Package, Search, FileQuestion } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from './Button';

export type EmptyStateType = 'default' | 'no-data' | 'no-result' | 'error';

interface EmptyStateProps {
  /** 空状态类型 */
  type?: EmptyStateType;
  /** 主标题 */
  title?: string;
  /** 描述文字 */
  description?: string;
  /** 自定义图标（覆盖默认） */
  icon?: React.ReactNode;
  /** 操作按钮文字 */
  actionText?: string;
  /** 操作按钮点击事件 */
  onAction?: () => void;
  /** 次要操作按钮文字 */
  secondaryActionText?: string;
  /** 次要操作按钮点击事件 */
  onSecondaryAction?: () => void;
  /** 附加样式类名 */
  className?: string;
  /** 紧凑模式（适用于小空间） */
  compact?: boolean;
}

/**
 * 空状态组件
 * - 带图标 + 说明文字 + 可选操作按钮
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'default',
  title,
  description,
  icon,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  className,
  compact = false,
}) => {
  // 默认配置
  const defaultConfig: Record<
    EmptyStateType,
    {
      icon: React.ReactNode;
      title: string;
      description: string;
      iconBg: string;
      iconColor: string;
    }
  > = {
    default: {
      icon: <Package className="w-12 h-12 sm:w-16 sm:h-16" strokeWidth={1.5} />,
      title: '暂无数据',
      description: '当前列表为空，稍后再来看看吧',
      iconBg: 'bg-gradient-to-br from-slate-100 to-slate-200',
      iconColor: 'text-slate-500',
    },
    'no-data': {
      icon: <Package className="w-12 h-12 sm:w-16 sm:h-16" strokeWidth={1.5} />,
      title: '还没有任何记录',
      description: '开始查询以生成您的第一条记录',
      iconBg: 'bg-gradient-to-br from-blue-100 to-cyan-100',
      iconColor: 'text-blue-600',
    },
    'no-result': {
      icon: <Search className="w-12 h-12 sm:w-16 sm:h-16" strokeWidth={1.5} />,
      title: '未找到匹配结果',
      description: '请检查追溯码是否正确，或尝试其他条件',
      iconBg: 'bg-gradient-to-br from-amber-100 to-orange-100',
      iconColor: 'text-amber-600',
    },
    error: {
      icon: <FileQuestion className="w-12 h-12 sm:w-16 sm:h-16" strokeWidth={1.5} />,
      title: '加载失败',
      description: '网络异常或服务错误，请稍后重试',
      iconBg: 'bg-gradient-to-br from-red-100 to-rose-100',
      iconColor: 'text-red-600',
    },
  };

  const config = defaultConfig[type];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'py-8 px-4' : 'py-12 sm:py-20 px-6',
        className
      )}
    >
      {/* 图标容器 */}
      <div
        className={cn(
          'flex items-center justify-center rounded-3xl',
          compact ? 'w-20 h-20 mb-4' : 'w-28 h-28 sm:w-36 sm:h-36 mb-6 sm:mb-8',
          config.iconBg,
          'shadow-inner'
        )}
      >
        <div className={config.iconColor}>
          {icon || config.icon}
        </div>
      </div>

      {/* 主标题 */}
      <h3
        className={cn(
          'font-bold text-slate-800 mb-2 sm:mb-3',
          compact ? 'text-base sm:text-lg' : 'text-xl sm:text-2xl'
        )}
      >
        {title || config.title}
      </h3>

      {/* 描述文字 */}
      <p
        className={cn(
          'text-slate-500 max-w-md mx-auto leading-relaxed',
          compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
        )}
      >
        {description || config.description}
      </p>

      {/* 操作按钮区域 */}
      {(actionText || secondaryActionText) && (
        <div
          className={cn(
            'flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4',
            compact ? 'mt-5' : 'mt-8 sm:mt-10'
          )}
        >
          {secondaryActionText && onSecondaryAction && (
            <Button
              variant="secondary"
              size={compact ? 'md' : 'lg'}
              onClick={onSecondaryAction}
            >
              {secondaryActionText}
            </Button>
          )}
          {actionText && onAction && (
            <Button
              variant="primary"
              size={compact ? 'md' : 'lg'}
              onClick={onAction}
            >
              {actionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
