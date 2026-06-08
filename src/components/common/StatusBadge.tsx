import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  Info,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatusBadgeType = 'safe' | 'warning' | 'danger' | 'info' | 'neutral';
export type StatusBadgeSize = 'sm' | 'md' | 'lg';

interface StatusBadgeProps {
  /** 状态类型 */
  type: StatusBadgeType;
  /** 显示文字（不传则使用默认） */
  text?: string;
  /** 是否显示图标 */
  showIcon?: boolean;
  /** 尺寸 */
  size?: StatusBadgeSize;
  /** 是否有脉冲动画（用于警告类） */
  pulse?: boolean;
  /** 附加样式类名 */
  className?: string;
}

/**
 * 状态徽章组件
 * - types: safe(绿) / warning(橙) / danger(红) / info(蓝) / neutral(灰)
 * - 带图标和文字
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({
  type,
  text,
  showIcon = true,
  size = 'md',
  pulse = false,
  className,
}) => {
  // 类型配置
  const typeConfig: Record<
    StatusBadgeType,
    {
      icon: React.ReactNode;
      defaultText: string;
      bgClass: string;
      borderClass: string;
      textClass: string;
      iconClass: string;
    }
  > = {
    safe: {
      icon: <ShieldCheck />,
      defaultText: '安全',
      bgClass: 'bg-gradient-to-r from-green-50 to-emerald-50',
      borderClass: 'border-green-200',
      textClass: 'text-green-700',
      iconClass: 'text-green-600',
    },
    warning: {
      icon: <AlertTriangle />,
      defaultText: '警告',
      bgClass: 'bg-gradient-to-r from-amber-50 to-orange-50',
      borderClass: 'border-amber-200',
      textClass: 'text-amber-700',
      iconClass: 'text-amber-600',
    },
    danger: {
      icon: <ShieldAlert />,
      defaultText: '危险',
      bgClass: 'bg-gradient-to-r from-red-50 to-rose-50',
      borderClass: 'border-red-200',
      textClass: 'text-red-700',
      iconClass: 'text-red-600',
    },
    info: {
      icon: <Info />,
      defaultText: '信息',
      bgClass: 'bg-gradient-to-r from-blue-50 to-cyan-50',
      borderClass: 'border-blue-200',
      textClass: 'text-blue-700',
      iconClass: 'text-blue-600',
    },
    neutral: {
      icon: <Minus />,
      defaultText: '未知',
      bgClass: 'bg-gradient-to-r from-slate-50 to-gray-100',
      borderClass: 'border-slate-200',
      textClass: 'text-slate-700',
      iconClass: 'text-slate-500',
    },
  };

  // 尺寸配置
  const sizeConfig: Record<
    StatusBadgeSize,
    {
      container: string;
      icon: string;
      text: string;
      spacing: string;
    }
  > = {
    sm: {
      container: 'px-2 py-1 rounded-lg',
      icon: 'w-3.5 h-3.5',
      text: 'text-xs',
      spacing: 'space-x-1',
    },
    md: {
      container: 'px-3 py-1.5 rounded-xl',
      icon: 'w-4 h-4',
      text: 'text-sm',
      spacing: 'space-x-1.5',
    },
    lg: {
      container: 'px-4 py-2 rounded-xl',
      icon: 'w-5 h-5',
      text: 'text-base',
      spacing: 'space-x-2',
    },
  };

  const config = typeConfig[type];
  const sizeCfg = sizeConfig[size];

  return (
    <span
      className={cn(
        'inline-flex items-center',
        'border font-semibold',
        'transition-all duration-200',
        // 类型样式
        config.bgClass,
        config.borderClass,
        config.textClass,
        // 尺寸
        sizeCfg.container,
        // 脉冲动画
        pulse && (type === 'warning' || type === 'danger')
          ? 'animate-pulse'
          : '',
        // 自定义样式
        className
      )}
    >
      {/* 图标 */}
      {showIcon && (
        <span className={cn('shrink-0', sizeCfg.icon, config.iconClass)}>
          {config.icon}
        </span>
      )}

      {/* 文字 */}
      <span className={cn('whitespace-nowrap', sizeCfg.text)}>
        {text || config.defaultText}
      </span>
    </span>
  );
};

export default StatusBadge;
