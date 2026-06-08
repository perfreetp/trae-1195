import React from 'react';
import { AlertTriangle, ShieldCheck, ShieldAlert, Clock, Repeat, Phone, MapPin, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RiskResult } from '@/types';

interface AlertBannerProps {
  /** 风险检测结果 */
  risk: RiskResult;
  /** 是否可以关闭 */
  dismissible?: boolean;
  /** 关闭回调 */
  onDismiss?: () => void;
  /** 附加样式类名 */
  className?: string;
}

/**
 * 风险告警横幅组件
 * - 接收RiskResult prop
 * - 全屏宽度，根据level显示不同颜色背景
 * - 召回：红色 + AlertTriangle图标 + 详细召回信息
 * - 过期：红色
 * - 临期/重复查询：橙色
 * - 安全：绿色 + ShieldCheck
 */
const AlertBanner: React.FC<AlertBannerProps> = ({
  risk,
  dismissible = false,
  onDismiss,
  className,
}) => {
  const { level, isExpired, isRecalled, recallInfo, duplicateQuery, queryCount, firstQueryTime, isAuthentic } = risk;

  // 根据风险等级配置样式和内容
  const getBannerConfig = () => {
    // 召回 - 最高优先级
    if (isRecalled && recallInfo) {
      return {
        bgClass: 'bg-gradient-to-r from-red-600 via-red-500 to-rose-600',
        borderClass: 'border-red-400',
        iconClass: 'text-white',
        textClass: 'text-white',
        subTextClass: 'text-red-100',
        icon: <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8" />,
        badgeBg: 'bg-white/20',
        badgeText: 'text-white',
        animate: 'animate-pulse',
      };
    }

    // 过期
    if (isExpired) {
      return {
        bgClass: 'bg-gradient-to-r from-red-500 via-rose-500 to-red-600',
        borderClass: 'border-red-300',
        iconClass: 'text-white',
        textClass: 'text-white',
        subTextClass: 'text-red-100',
        icon: <ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8" />,
        badgeBg: 'bg-white/20',
        badgeText: 'text-white',
        animate: 'animate-pulse',
      };
    }

    // 临期或重复查询
    if (level === 'warning') {
      return {
        bgClass: 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600',
        borderClass: 'border-amber-300',
        iconClass: 'text-white',
        textClass: 'text-white',
        subTextClass: 'text-amber-100',
        icon: <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8" />,
        badgeBg: 'bg-white/20',
        badgeText: 'text-white',
        animate: '',
      };
    }

    // 安全
    return {
      bgClass: 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500',
      borderClass: 'border-green-300',
      iconClass: 'text-white',
      textClass: 'text-white',
      subTextClass: 'text-green-100',
      icon: <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8" />,
      badgeBg: 'bg-white/20',
      badgeText: 'text-white',
      animate: '',
    };
  };

  // 获取主标题
  const getMainTitle = (): string => {
    if (isRecalled) return '产品召回预警';
    if (isExpired) return '药品已过期';
    if (level === 'warning') {
      const warnings: string[] = [];
      if (duplicateQuery) warnings.push('重复查询');
      return warnings.length > 0 ? warnings.join(' · ') : '注意事项';
    }
    return '安全验证通过';
  };

  const config = getBannerConfig();

  return (
    <div
      className={cn(
        'w-full overflow-hidden',
        'rounded-2xl border-2',
        'shadow-xl',
        'transition-all duration-500',
        config.bgClass,
        config.borderClass,
        className
      )}
      role="alert"
    >
      <div className="px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex items-start justify-between gap-4">
          {/* 左侧图标 + 内容 */}
          <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
            {/* 主图标 */}
            <div
              className={cn(
                'shrink-0 p-2 sm:p-3 rounded-xl',
                'bg-white/20 backdrop-blur-sm',
                config.iconClass,
                config.animate
              )}
            >
              {config.icon}
            </div>

            {/* 文字内容区 */}
            <div className="flex-1 min-w-0">
              {/* 标题 + 标签 */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                <h3 className={cn('text-lg sm:text-xl font-bold', config.textClass)}>
                  {getMainTitle()}
                </h3>
                {isRecalled && recallInfo && (
                  <span className={cn(
                    'px-2.5 py-1 rounded-full text-xs sm:text-sm font-bold',
                    config.badgeBg,
                    config.badgeText
                  )}>
                    {recallInfo.recallLevel}召回
                  </span>
                )}
              </div>

              {/* 召回详情 */}
              {isRecalled && recallInfo && (
                <div className={cn('space-y-2 sm:space-y-3 mt-3 sm:mt-4', config.subTextClass)}>
                  <p className="text-sm sm:text-base leading-relaxed">
                    <span className="font-semibold">召回原因：</span>
                    {recallInfo.recallReason}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                      <span><span className="font-semibold">召回日期：</span>{recallInfo.recallDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                      <span><span className="font-semibold">召回范围：</span>{recallInfo.recallScope}</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:col-span-2">
                      <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                      <span><span className="font-semibold">联系电话：</span>{recallInfo.contactPhone}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 过期详情 */}
              {isExpired && !isRecalled && (
                <p className={cn('text-sm sm:text-base mt-2', config.subTextClass)}>
                  该药品已超过有效期，请立即停止使用，并联系购买药店或医疗机构。
                </p>
              )}

              {/* 警告详情 */}
              {level === 'warning' && !isExpired && !isRecalled && (
                <div className={cn('space-y-2 mt-2 sm:mt-3', config.subTextClass)}>
                  {duplicateQuery && (
                    <div className="flex items-start gap-2 text-sm sm:text-base">
                      <Repeat className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">重复查询：</span>
                        该追溯码已被查询 <span className="font-bold">{queryCount}</span> 次
                        {firstQueryTime && (
                          <span>，首次查询时间：{firstQueryTime}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 安全详情 */}
              {level === 'safe' && (
                <div className={cn('space-y-2 mt-2 sm:mt-3', config.subTextClass)}>
                  <p className="text-sm sm:text-base">
                    该药品追溯信息完整，检验合格，来源可溯，去向可追，请放心使用。
                  </p>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                    <span className="inline-flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      {isAuthentic ? '正品验证通过' : '验证中'}
                    </span>
                    {!duplicateQuery && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        首次查询
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 右侧关闭按钮 */}
          {dismissible && (
            <button
              onClick={onDismiss}
              className={cn(
                'shrink-0 p-2 rounded-lg',
                'bg-white/10 hover:bg-white/20',
                'transition-all duration-200 active:scale-90',
                config.textClass
              )}
              aria-label="关闭提醒"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 底部装饰条 */}
      <div className="h-1 w-full bg-black/10">
        <div
          className={cn(
            'h-full transition-all duration-1000',
            level === 'danger' ? 'w-full bg-white/40' : level === 'warning' ? 'w-3/4 bg-white/40' : 'w-full bg-white/30'
          )}
        />
      </div>
    </div>
  );
};

export default AlertBanner;
