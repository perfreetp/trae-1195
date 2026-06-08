import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Search, X, Barcode, AlertCircle, CheckCircle2, ScanLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/common/Button';

interface TraceCodeInputProps {
  /** 输入框占位文字 */
  placeholder?: string;
  /** 是否显示查询按钮 */
  showSearchButton?: boolean;
  /** 是否显示清除按钮 */
  showClearButton?: boolean;
  /** 查询回调 */
  onSearch?: (code: string) => void;
  /** 输入变化回调 */
  onChange?: (code: string) => void;
  /** 自定义校验函数（返回错误信息，空字符串表示通过） */
  customValidate?: (code: string) => string;
  /** 加载状态 */
  loading?: boolean;
  /** 禁用状态 */
  disabled?: boolean;
  /** 初始值 */
  defaultValue?: string;
  /** 触屏优化尺寸 */
  touchOptimized?: boolean;
  /** 附加样式类名 */
  className?: string;
  /** 扫码按钮回调（如果提供则显示扫码按钮） */
  onScan?: () => void;
}

/**
 * 追溯码校验函数
 * - 长度校验：必须20位数字
 * - 前缀校验：81开头
 * @param code 追溯码
 * @returns 错误信息，空字符串表示通过
 */
const validateTraceCode = (code: string): string => {
  if (!code) {
    return '请输入药品追溯码';
  }

  if (!/^\d+$/.test(code)) {
    return '追溯码只能包含数字';
  }

  if (code.length !== 20) {
    return `追溯码必须为20位数字（当前${code.length}位）`;
  }

  if (!code.startsWith('81')) {
    return '追溯码必须以"81"开头';
  }

  return '';
};

/**
 * 格式化追溯码显示
 * 20位数字自动分段：81 000000 000000 000000
 * @param code 原始追溯码
 */
const formatTraceCode = (code: string): string => {
  const digits = code.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 8) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  if (digits.length <= 14) return `${digits.slice(0, 2)} ${digits.slice(2, 8)} ${digits.slice(8)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 8)} ${digits.slice(8, 14)} ${digits.slice(14, 20)}`;
};

/**
 * 追溯码输入组件
 * - 大尺寸输入框，实时格式校验
 * - 20位数字自动分段显示（如 81 000000 000000 000000）
 * - 校验错误时红色边框 + 提示
 * - 支持清除按钮、查询按钮
 */
const TraceCodeInput: React.FC<TraceCodeInputProps> = ({
  placeholder = '请输入20位药品追溯码',
  showSearchButton = true,
  showClearButton = true,
  onSearch,
  onChange,
  customValidate,
  loading = false,
  disabled = false,
  defaultValue = '',
  touchOptimized = true,
  className,
  onScan,
}) => {
  // 原始输入值（纯数字）
  const [rawValue, setRawValue] = useState<string>(defaultValue.replace(/\D/g, ''));
  // 是否显示过错误（用于首次输入不立即显示错误）
  const [touched, setTouched] = useState<boolean>(!!defaultValue);
  // 输入框引用
  const inputRef = useRef<HTMLInputElement>(null);

  // 格式化后的值（带空格分段）
  const displayValue = useMemo(() => formatTraceCode(rawValue), [rawValue]);

  // 校验结果
  const errorMessage = useMemo(() => {
    if (!touched && !rawValue) return '';
    const baseError = validateTraceCode(rawValue);
    if (baseError) return baseError;
    if (customValidate) return customValidate(rawValue);
    return '';
  }, [rawValue, touched, customValidate]);

  // 是否有错误
  const hasError = touched && !!errorMessage && rawValue.length > 0;
  // 是否完全有效
  const isValid = !errorMessage && rawValue.length === 20;

  // 处理输入变化
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;

      // 只保留数字，最多20位
      const digits = e.target.value.replace(/\D/g, '').slice(0, 20);
      setRawValue(digits);
      onChange?.(digits);
    },
    [disabled, onChange]
  );

  // 处理失焦
  const handleBlur = useCallback(() => {
    setTouched(true);
  }, []);

  // 处理键盘事件
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onSearch) {
        e.preventDefault();
        setTouched(true);
        if (isValid) {
          onSearch(rawValue);
        }
      }
    },
    [isValid, onSearch, rawValue]
  );

  // 清除输入
  const handleClear = useCallback(() => {
    setRawValue('');
    setTouched(false);
    onChange?.('');
    inputRef.current?.focus();
  }, [onChange]);

  // 查询操作
  const handleSearch = useCallback(() => {
    setTouched(true);
    if (isValid && onSearch) {
      onSearch(rawValue);
    } else if (!isValid) {
      inputRef.current?.focus();
    }
  }, [isValid, onSearch, rawValue]);

  // 粘贴处理 - 自动提取数字
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const digits = pastedText.replace(/\D/g, '').slice(0, 20);
    setRawValue(digits);
    setTouched(true);
    onChange?.(digits);
  }, [onChange]);

  // defaultValue变化时更新
  useEffect(() => {
    if (defaultValue !== undefined) {
      const digits = defaultValue.replace(/\D/g, '');
      setRawValue(digits);
      setTouched(!!digits);
    }
  }, [defaultValue]);

  // 字符计数
  const charCount = rawValue.length;

  return (
    <div className={cn('w-full space-y-3', className)}>
      {/* 输入框主体 */}
      <div
        className={cn(
          'relative w-full',
          'transition-all duration-300 ease-out'
        )}
      >
        <div
          className={cn(
            'relative w-full',
            'rounded-2xl sm:rounded-3xl',
            'bg-white',
            'border-2',
            'shadow-lg shadow-slate-200/60',
            'transition-all duration-300',
            touchOptimized ? 'min-h-[64px] sm:min-h-[72px]' : 'min-h-[56px]',
            hasError
              ? 'border-red-400 focus-within:border-red-500 focus-within:shadow-xl focus-within:shadow-red-500/20'
              : isValid
                ? 'border-green-400 focus-within:border-green-500 focus-within:shadow-xl focus-within:shadow-green-500/20'
                : 'border-slate-200 focus-within:border-blue-500 focus-within:shadow-xl focus-within:shadow-blue-500/20',
            disabled ? 'opacity-60 pointer-events-none bg-slate-50' : ''
          )}
        >
          {/* 左侧条码图标 */}
          <div
            className={cn(
              'absolute left-4 sm:left-5 top-1/2 -translate-y-1/2',
              'p-2 sm:p-2.5 rounded-xl',
              touchOptimized ? 'p-3' : '',
              hasError
                ? 'bg-red-50 text-red-500'
                : isValid
                  ? 'bg-green-50 text-green-500'
                  : 'bg-blue-50 text-blue-500'
            )}
          >
            <Barcode
              className={cn(
                touchOptimized ? 'w-6 h-6 sm:w-7 sm:h-7' : 'w-5 h-5 sm:w-6 sm:h-6'
              )}
              strokeWidth={2}
            />
          </div>

          {/* 输入框 */}
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={displayValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'w-full bg-transparent outline-none',
              'font-mono tracking-wider',
              'text-slate-800 placeholder:text-slate-400',
              'transition-all duration-200',
              touchOptimized
                ? 'pl-[72px] sm:pl-[84px] pr-[180px] sm:pr-[220px] py-4 sm:py-5 text-lg sm:text-xl'
                : 'pl-16 sm:pl-[76px] pr-[160px] sm:pr-[200px] py-3.5 sm:py-4 text-base sm:text-lg',
              hasError ? 'text-red-700' : isValid ? 'text-green-700' : ''
            )}
            maxLength={20 + 3} // 20位数字 + 3个空格分隔符
            autoComplete="off"
            spellCheck={false}
          />

          {/* 右侧操作按钮区 */}
          <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 sm:gap-2">
            {/* 字符计数 */}
            <div
              className={cn(
                'hidden sm:flex items-center',
                'px-2.5 py-1 rounded-lg',
                'text-xs font-mono font-bold',
                hasError
                  ? 'bg-red-50 text-red-600'
                  : isValid
                    ? 'bg-green-50 text-green-600'
                    : 'bg-slate-100 text-slate-500'
              )}
            >
              {charCount}/20
            </div>

            {/* 扫码按钮 */}
            {onScan && (
              <button
                type="button"
                onClick={onScan}
                disabled={disabled}
                className={cn(
                  touchOptimized ? 'p-3 sm:p-3.5' : 'p-2.5 sm:p-3',
                  'rounded-xl',
                  'text-slate-400 hover:text-purple-600 hover:bg-purple-50',
                  'transition-all duration-200 active:scale-95',
                  disabled ? 'opacity-40 pointer-events-none' : ''
                )}
                aria-label="扫码输入"
                title="扫码输入"
              >
                <ScanLine
                  className={cn(
                    touchOptimized ? 'w-5 h-5 sm:w-6 sm:h-6' : 'w-5 h-5 sm:w-6 sm:h-6'
                  )}
                  strokeWidth={2}
                />
              </button>
            )}

            {/* 清除按钮 */}
            {showClearButton && rawValue.length > 0 && !loading && (
              <button
                type="button"
                onClick={handleClear}
                disabled={disabled}
                className={cn(
                  touchOptimized ? 'p-3 sm:p-3.5' : 'p-2.5 sm:p-3',
                  'rounded-xl',
                  'text-slate-400 hover:text-red-500 hover:bg-red-50',
                  'transition-all duration-200 active:scale-95'
                )}
                aria-label="清除输入"
                title="清除"
              >
                <X
                  className={cn(
                    touchOptimized ? 'w-5 h-5 sm:w-6 sm:h-6' : 'w-5 h-5 sm:w-6 sm:h-6'
                  )}
                  strokeWidth={2.5}
                />
              </button>
            )}

            {/* 状态图标（非加载时显示校验结果） */}
            {touched && rawValue.length > 0 && !showClearButton && (
              <div className={cn(touchOptimized ? 'p-3' : 'p-2.5')}>
                {hasError ? (
                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                ) : isValid ? (
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                ) : null}
              </div>
            )}

            {/* 查询按钮 */}
            {showSearchButton && (
              <div className={cn(touchOptimized ? 'ml-1' : 'ml-0.5')}>
                <Button
                  variant="primary"
                  size={touchOptimized ? 'lg' : 'md'}
                  onClick={handleSearch}
                  loading={loading}
                  disabled={disabled || !isValid}
                  leftIcon={<Search className={touchOptimized ? 'w-5 h-5' : 'w-4 h-4'} />}
                  className={cn(
                    touchOptimized ? 'px-5 sm:px-6' : 'px-4 sm:px-5',
                    'rounded-xl'
                  )}
                >
                  <span className={cn(touchOptimized ? 'text-base' : 'text-sm')}>查询</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 错误提示/帮助信息 */}
      <div className="min-h-[20px] sm:min-h-[24px]">
        {hasError ? (
          // 错误提示
          <div className="flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 font-medium leading-relaxed">
              {errorMessage}
            </p>
          </div>
        ) : isValid ? (
          // 成功提示
          <div className="flex items-start gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 shrink-0 mt-0.5" />
            <p className="text-sm text-green-600 font-medium leading-relaxed">
              追溯码格式正确，可以进行查询
            </p>
          </div>
        ) : touched && rawValue.length > 0 && rawValue.length < 20 ? (
          // 输入提示
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Barcode className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-slate-400" />
            <span>
              还需输入 <span className="font-bold text-blue-600">{20 - charCount}</span> 位数字
            </span>
          </div>
        ) : (
          // 默认提示
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
            <InfoIcon className="w-4 h-4 shrink-0" />
            <span>
              追溯码格式：81 ###### ###### ######（以81开头的20位数字）
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// 信息图标小组件
const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" strokeLinecap="round" />
    <path d="M12 8h.01" strokeLinecap="round" />
  </svg>
);

export default TraceCodeInput;
