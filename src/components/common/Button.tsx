import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮变体样式 */
  variant?: ButtonVariant;
  /** 按钮尺寸 */
  size?: ButtonSize;
  /** 是否显示加载状态 */
  loading?: boolean;
  /** 是否占满整行宽度 */
  fullWidth?: boolean;
  /** 左侧图标 */
  leftIcon?: React.ReactNode;
  /** 右侧图标 */
  rightIcon?: React.ReactNode;
}

/**
 * 通用按钮组件
 * - variants: primary / secondary / danger / ghost / outline
 * - sizes: sm / md / lg / xl（xl为触屏大按钮）
 * - 支持loading、disabled、fullWidth
 * - hover/press动画
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  onClick,
  ...props
}) => {
  // 变体样式配置
  const variantClasses: Record<ButtonVariant, string> = {
    primary: cn(
      'bg-gradient-to-r from-blue-600 to-cyan-500 text-white',
      'hover:from-blue-700 hover:to-cyan-600',
      'shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40',
      'border border-transparent'
    ),
    secondary: cn(
      'bg-slate-100 text-slate-800',
      'hover:bg-slate-200',
      'shadow-sm hover:shadow-md',
      'border border-slate-200'
    ),
    danger: cn(
      'bg-gradient-to-r from-red-500 to-rose-600 text-white',
      'hover:from-red-600 hover:to-rose-700',
      'shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40',
      'border border-transparent'
    ),
    ghost: cn(
      'bg-transparent text-slate-700',
      'hover:bg-slate-100',
      'border border-transparent'
    ),
    outline: cn(
      'bg-white text-blue-600',
      'hover:bg-blue-50',
      'border-2 border-blue-500 hover:border-blue-600',
      'shadow-sm hover:shadow-md'
    ),
  };

  // 尺寸配置
  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-xs space-x-1.5',
    md: 'px-5 py-2.5 text-sm space-x-2',
    lg: 'px-7 py-3.5 text-base space-x-2.5',
    xl: 'px-8 py-5 text-lg space-x-3', // 触屏大按钮
  };

  // 禁用/加载状态样式
  const disabledClasses =
    disabled || loading
      ? 'opacity-60 cursor-not-allowed pointer-events-none'
      : 'cursor-pointer active:scale-[0.97]';

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) return;
    onClick?.(e);
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      onClick={handleClick}
      className={cn(
        // 基础样式
        'inline-flex items-center justify-center',
        'font-semibold rounded-xl',
        'transition-all duration-200 ease-out',
        'select-none whitespace-nowrap',
        // 变体
        variantClasses[variant],
        // 尺寸
        sizeClasses[size],
        // 宽度
        fullWidth ? 'w-full' : '',
        // 禁用/加载
        disabledClasses,
        // 自定义样式
        className
      )}
    >
      {/* 加载图标 */}
      {loading && (
        <Loader2
          className={cn(
            'animate-spin',
            size === 'sm' ? 'w-3.5 h-3.5' : '',
            size === 'md' ? 'w-4 h-4' : '',
            size === 'lg' ? 'w-5 h-5' : '',
            size === 'xl' ? 'w-6 h-6' : ''
          )}
        />
      )}

      {/* 左侧图标 */}
      {!loading && leftIcon && <span className="shrink-0">{leftIcon}</span>}

      {/* 按钮文字 */}
      {children && <span className="leading-tight">{children}</span>}

      {/* 右侧图标 */}
      {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};

export default Button;
