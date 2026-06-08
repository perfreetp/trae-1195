import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';

// 兼容store的Toast类型（包含warning）
type InternalToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * Toast消息组件
 * - 监听uiStore的toast状态自动显示
 * - success绿/error红/info蓝/warning橙
 */
const Toast: React.FC = () => {
  const toast = useUIStore((state) => state.toast);
  const hideToast = useUIStore((state) => state.hideToast);

  const visible = toast.visible;
  const message = toast.message;
  const rawType = toast.type;
  const type = (rawType as InternalToastType);

  // 类型配置
  const typeConfig: Record<
    InternalToastType,
    {
      icon: React.ReactNode;
      bgClass: string;
      borderClass: string;
      iconColor: string;
      textClass: string;
      shadowClass: string;
    }
  > = {
    success: {
      icon: <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />,
      bgClass: 'bg-gradient-to-r from-green-50 to-emerald-50',
      borderClass: 'border-green-200',
      iconColor: 'text-green-600',
      textClass: 'text-green-800',
      shadowClass: 'shadow-lg shadow-green-500/20',
    },
    error: {
      icon: <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />,
      bgClass: 'bg-gradient-to-r from-red-50 to-rose-50',
      borderClass: 'border-red-200',
      iconColor: 'text-red-600',
      textClass: 'text-red-800',
      shadowClass: 'shadow-lg shadow-red-500/20',
    },
    info: {
      icon: <Info className="w-5 h-5 sm:w-6 sm:h-6" />,
      bgClass: 'bg-gradient-to-r from-blue-50 to-cyan-50',
      borderClass: 'border-blue-200',
      iconColor: 'text-blue-600',
      textClass: 'text-blue-800',
      shadowClass: 'shadow-lg shadow-blue-500/20',
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />,
      bgClass: 'bg-gradient-to-r from-amber-50 to-orange-50',
      borderClass: 'border-amber-200',
      iconColor: 'text-amber-600',
      textClass: 'text-amber-800',
      shadowClass: 'shadow-lg shadow-amber-500/20',
    },
  };

  const config = typeConfig[type];

  // ESC键关闭
  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        hideToast();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, hideToast]);

  return (
    <div
      className={cn(
        'fixed top-20 left-1/2 -translate-x-1/2 z-[9999]',
        'w-full max-w-md px-4 sm:px-0',
        'pointer-events-none',
        'transition-all duration-500 ease-out',
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 -translate-y-4 pointer-events-none'
      )}
      aria-live="polite"
      role="alert"
    >
      <div
        className={cn(
          'flex items-start sm:items-center space-x-3 sm:space-x-4',
          'px-4 py-3.5 sm:px-5 sm:py-4',
          'rounded-2xl border',
          'backdrop-blur-sm',
          config.bgClass,
          config.borderClass,
          config.shadowClass
        )}
      >
        {/* 图标 */}
        <div className={cn('shrink-0 mt-0.5 sm:mt-0', config.iconColor)}>
          {config.icon}
        </div>

        {/* 消息内容 */}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'text-sm sm:text-base font-medium leading-relaxed',
              config.textClass
            )}
          >
            {message}
          </p>
        </div>

        {/* 关闭按钮 */}
        <button
          onClick={hideToast}
          className={cn(
            'shrink-0 p-1.5 rounded-lg',
            'transition-all duration-200',
            'hover:bg-white/60 active:scale-90',
            config.iconColor
          )}
          aria-label="关闭消息"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
