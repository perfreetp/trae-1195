import React from 'react';
import { cn } from '@/lib/utils';

interface RiskGaugeProps {
  /** 风险分数 0-100（0=最安全，100=最危险） */
  score: number;
  /** 风险等级标签 */
  label?: string;
  /** 尺寸 */
  size?: 'sm' | 'md' | 'lg';
  /** 附加样式类名 */
  className?: string;
}

/**
 * 风险仪表盘组件
 * - 半圆进度条样式
 * - safe绿区 / warning黄区 / danger红区
 * - 指针指示当前风险等级
 */
const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  label,
  size = 'lg',
  className,
}) => {
  // 限制分数在0-100之间
  const clampedScore = Math.max(0, Math.min(100, score));

  // 尺寸配置
  const sizeConfig = {
    sm: {
      width: 160,
      height: 90,
      strokeWidth: 10,
      pointerSize: 8,
      scoreText: 'text-xl sm:text-2xl',
      labelText: 'text-xs',
      rangeText: 'text-[10px]',
    },
    md: {
      width: 240,
      height: 135,
      strokeWidth: 14,
      pointerSize: 10,
      scoreText: 'text-2xl sm:text-3xl',
      labelText: 'text-sm',
      rangeText: 'text-xs',
    },
    lg: {
      width: 320,
      height: 180,
      strokeWidth: 18,
      pointerSize: 14,
      scoreText: 'text-3xl sm:text-5xl',
      labelText: 'text-base sm:text-lg',
      rangeText: 'text-sm',
    },
  };

  const cfg = sizeConfig[size];
  const { width, height, strokeWidth } = cfg;

  // SVG参数
  const centerX = width / 2;
  const centerY = height - 10;
  const radius = width / 2 - strokeWidth - 10;
  const startAngle = Math.PI; // 180° (左)
  const endAngle = 0; // 0° (右)
  const totalAngle = Math.PI; // 半圆

  // 区域划分：safe 0-40, warning 40-70, danger 70-100
  const safeStart = 0;
  const safeEnd = 40;
  const warningStart = 40;
  const warningEnd = 70;
  const dangerStart = 70;
  const dangerEnd = 100;

  // 根据百分比计算角度位置
  const scoreToAngle = (percent: number) => {
    return startAngle + (totalAngle * (100 - percent)) / 100;
  };

  // 生成圆弧路径
  const arcPath = (startPercent: number, endPercent: number) => {
    const angle1 = scoreToAngle(startPercent);
    const angle2 = scoreToAngle(endPercent);

    const x1 = centerX + radius * Math.cos(angle1);
    const y1 = centerY + radius * Math.sin(angle1);
    const x2 = centerX + radius * Math.cos(angle2);
    const y2 = centerY + radius * Math.sin(angle2);

    const largeArc = endPercent - startPercent > 50 ? 1 : 0;
    // 因为角度从180°到0°（逆时针方向），所以 sweep-flag 为 0
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 0 ${x2} ${y2}`;
  };

  // 指针计算：从中心指向分数位置
  const pointerAngle = scoreToAngle(clampedScore);
  const pointerLength = radius - strokeWidth / 2 - 4;
  const pointerEndX = centerX + pointerLength * Math.cos(pointerAngle);
  const pointerEndY = centerY + pointerLength * Math.sin(pointerAngle);

  // 根据分数获取颜色和文本
  const getLevel = () => {
    if (clampedScore >= dangerStart) {
      return {
        color: '#EF4444',
        textColor: 'text-red-600',
        bgColor: 'bg-red-50',
        label: label || '高风险',
        dotColor: '#EF4444',
      };
    }
    if (clampedScore >= warningStart) {
      return {
        color: '#F59E0B',
        textColor: 'text-amber-600',
        bgColor: 'bg-amber-50',
        label: label || '中风险',
        dotColor: '#F59E0B',
      };
    }
    return {
      color: '#10B981',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      label: label || '低风险',
      dotColor: '#10B981',
    };
  };

  const level = getLevel();

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      {/* 仪表盘SVG */}
      <div className="relative" style={{ width, height }}>
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="drop-shadow-lg"
        >
          {/* 背景轨道 */}
          <path
            d={arcPath(0, 100)}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Safe区 - 绿色 */}
          <path
            d={arcPath(safeStart, safeEnd)}
            fill="none"
            stroke="url(#safeGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Warning区 - 黄色 */}
          <path
            d={arcPath(warningStart, warningEnd)}
            fill="none"
            stroke="url(#warningGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Danger区 - 红色 */}
          <path
            d={arcPath(dangerStart, dangerEnd)}
            fill="none"
            stroke="url(#dangerGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* 渐变定义 */}
          <defs>
            <linearGradient id="safeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>
            <linearGradient id="warningGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <linearGradient id="dangerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F87171" />
              <stop offset="100%" stopColor="#EF4444" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 刻度标记 */}
          {[0, 20, 40, 60, 80, 100].map((percent) => {
            const angle = scoreToAngle(percent);
            const outerR = radius + strokeWidth / 2 + 4;
            const innerR = radius + strokeWidth / 2 + 12;
            const x1 = centerX + outerR * Math.cos(angle);
            const y1 = centerY + outerR * Math.sin(angle);
            const x2 = centerX + innerR * Math.cos(angle);
            const y2 = centerY + innerR * Math.sin(angle);
            return (
              <line
                key={percent}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#9CA3AF"
                strokeWidth={percent === 0 || percent === 50 || percent === 100 ? 2 : 1}
                strokeLinecap="round"
              />
            );
          })}

          {/* 指针 */}
          <g filter="url(#glow)">
            <line
              x1={centerX}
              y1={centerY}
              x2={pointerEndX}
              y2={pointerEndY}
              stroke={level.color}
              strokeWidth={4}
              strokeLinecap="round"
            />
            <circle
              cx={pointerEndX}
              cy={pointerEndY}
              r={cfg.pointerSize / 2 + 1}
              fill={level.color}
            />
          </g>

          {/* 中心圆点 */}
          <circle
            cx={centerX}
            cy={centerY}
            r={strokeWidth / 2 + 2}
            fill="#1F2937"
            stroke="white"
            strokeWidth={2}
          />
          <circle
            cx={centerX}
            cy={centerY}
            r={strokeWidth / 4}
            fill={level.color}
          />
        </svg>

        {/* 中央分数显示 */}
        <div
          className="absolute inset-x-0 flex flex-col items-center"
          style={{ bottom: 0 }}
        >
          <div className={cn('font-bold tabular-nums', cfg.scoreText, level.textColor)}>
            {clampedScore}
            <span className="text-sm sm:text-base text-slate-400 ml-0.5">/100</span>
          </div>
        </div>
      </div>

      {/* 区域标签 */}
      <div
        className="flex items-center justify-between w-full px-2 sm:px-4 mt-2 sm:mt-4"
        style={{ maxWidth: width }}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className={cn(cfg.rangeText, 'text-emerald-700 font-medium')}>低风险</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          <span className={cn(cfg.rangeText, 'text-amber-700 font-medium')}>中风险</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <span className={cn(cfg.rangeText, 'text-red-700 font-medium')}>高风险</span>
        </div>
      </div>

      {/* 风险等级标签 */}
      <div
        className={cn(
          'mt-3 sm:mt-4 px-5 py-2 rounded-xl font-bold',
          cfg.labelText,
          level.bgColor,
          level.textColor
        )}
      >
        {level.label}
      </div>
    </div>
  );
};

export default RiskGauge;
