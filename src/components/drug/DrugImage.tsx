import React from 'react';
import { Pill } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DrugImageProps {
  /** 药品名称（显示在下方） */
  drugName: string;
  /** 商品名（可选，显示在药品名下方） */
  brandName?: string;
  /** 图片尺寸 */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** 渐变颜色变体 */
  variant?: 'blue' | 'green' | 'purple' | 'orange' | 'pink';
  /** 附加样式类名 */
  className?: string;
}

/**
 * 药品图片占位组件
 * - 使用渐变背景 + Lucide Pill图标模拟药品图片
 * - 下方显示药品名
 */
const DrugImage: React.FC<DrugImageProps> = ({
  drugName,
  brandName,
  size = 'md',
  variant = 'blue',
  className,
}) => {
  // 尺寸配置
  const sizeConfig = {
    sm: {
      image: 'w-24 h-24 sm:w-28 sm:h-28',
      icon: 'w-10 h-10 sm:w-12 sm:h-12',
      title: 'text-sm',
      subtitle: 'text-xs',
    },
    md: {
      image: 'w-36 h-36 sm:w-44 sm:h-44',
      icon: 'w-16 h-16 sm:w-20 sm:h-20',
      title: 'text-base sm:text-lg',
      subtitle: 'text-xs sm:text-sm',
    },
    lg: {
      image: 'w-48 h-48 sm:w-56 sm:h-56',
      icon: 'w-20 h-20 sm:w-24 sm:h-24',
      title: 'text-lg sm:text-xl',
      subtitle: 'text-sm sm:text-base',
    },
    xl: {
      image: 'w-64 h-64 sm:w-72 sm:h-72',
      icon: 'w-28 h-28 sm:w-32 sm:h-32',
      title: 'text-xl sm:text-2xl',
      subtitle: 'text-base sm:text-lg',
    },
  };

  // 渐变颜色变体
  const variantConfig = {
    blue: {
      bg: 'bg-gradient-to-br from-blue-400 via-blue-500 to-cyan-500',
      ring: 'ring-blue-200',
      shadow: 'shadow-2xl shadow-blue-500/30',
      text: 'text-blue-100',
    },
    green: {
      bg: 'bg-gradient-to-br from-emerald-400 via-teal-500 to-green-500',
      ring: 'ring-emerald-200',
      shadow: 'shadow-2xl shadow-emerald-500/30',
      text: 'text-emerald-100',
    },
    purple: {
      bg: 'bg-gradient-to-br from-violet-400 via-purple-500 to-fuchsia-500',
      ring: 'ring-violet-200',
      shadow: 'shadow-2xl shadow-violet-500/30',
      text: 'text-violet-100',
    },
    orange: {
      bg: 'bg-gradient-to-br from-amber-400 via-orange-500 to-red-500',
      ring: 'ring-amber-200',
      shadow: 'shadow-2xl shadow-amber-500/30',
      text: 'text-amber-100',
    },
    pink: {
      bg: 'bg-gradient-to-br from-pink-400 via-rose-500 to-red-400',
      ring: 'ring-pink-200',
      shadow: 'shadow-2xl shadow-pink-500/30',
      text: 'text-pink-100',
    },
  };

  const cfg = sizeConfig[size];
  const vcfg = variantConfig[variant];

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* 药品图片占位 */}
      <div
        className={cn(
          'relative rounded-3xl',
          'flex items-center justify-center',
          'ring-4 ring-opacity-50',
          'transition-transform duration-300 hover:scale-105',
          cfg.image,
          vcfg.bg,
          vcfg.ring,
          vcfg.shadow
        )}
      >
        {/* 背景装饰圆 */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white/10 blur-xl" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/10 blur-xl" />
        </div>

        {/* 药片图标 */}
        <div className="relative z-10">
          <Pill
            className={cn(
              'drop-shadow-lg',
              cfg.icon,
              vcfg.text
            )}
            strokeWidth={1.5}
          />
        </div>

        {/* 左上角小标签 */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 px-2 py-1 sm:px-2.5 sm:py-1 bg-white/20 backdrop-blur-sm rounded-lg">
          <span className={cn('text-xs sm:text-sm font-bold', vcfg.text)}>
            RX
          </span>
        </div>
      </div>

      {/* 药品名称 */}
      <div className="mt-4 sm:mt-6 text-center max-w-[200px] sm:max-w-[240px]">
        <h3
          className={cn(
            'font-bold text-slate-800 leading-snug',
            cfg.title
          )}
        >
          {drugName}
        </h3>
        {brandName && (
          <p
            className={cn(
              'mt-1 text-slate-500 font-medium',
              cfg.subtitle
            )}
          >
            {brandName}
          </p>
        )}
      </div>
    </div>
  );
};

export default DrugImage;
