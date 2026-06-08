import React from 'react';
import { cn } from '@/lib/utils';

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

interface SpinnerProps {
  /** 尺寸 */
  size?: SpinnerSize;
  /** 自定义颜色（默认医疗蓝） */
  color?: string;
  /** 附加样式类名 */
  className?: string;
}

/**
 * 加载动画组件
 * - 医疗蓝旋转圆环
 * - 支持不同尺寸
 */
const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color,
  className,
}) => {
  // 尺寸配置
  const sizeClasses: Record<SpinnerSize, string> = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-[5px]',
  };

  return (
    <div
      role="status"
      aria-label="加载中"
      className={cn(
        'inline-flex items-center justify-center',
        'rounded-full',
        'animate-spin',
        // 尺寸
        sizeClasses[size],
        // 边框颜色（透明底部+医疗蓝）
        color
          ? `border-t-transparent border-l-transparent border-b-transparent border-r-[${color}]`
          : 'border-t-transparent border-l-transparent border-b-transparent border-r-blue-600',
        // 自定义样式
        className
      )}
      style={color ? { borderRightColor: color } : undefined}
    >
      {/* 辅助圆环 - 增加层次感 */}
      <span
        className={cn(
          'absolute rounded-full',
          'animate-pulse',
          color ? `bg-[${color}]/10` : 'bg-blue-500/10'
        )}
        style={{
          width: '50%',
          height: '50%',
          backgroundColor: color ? `${color}1A` : undefined,
        }}
      />
    </div>
  );
};

/**
 * 全屏加载遮罩组件
 */
export const SpinnerOverlay: React.FC<{
  visible: boolean;
  text?: string;
}> = ({ visible, text = '加载中...' }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center space-y-4 p-8 bg-white rounded-2xl shadow-2xl">
        <Spinner size="lg" />
        <p className="text-sm font-medium text-slate-600">{text}</p>
      </div>
    </div>
  );
};

export default Spinner;
