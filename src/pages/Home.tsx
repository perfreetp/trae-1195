import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Search, UserCircle2, FileQuestion, ShieldCheck, XCircle, Scan, Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { useQueryStore, useUIStore, useHistoryStore } from '@/store';

type ScanStatus = 'idle' | 'scanning' | 'querying' | 'error';

interface ErrorDetail {
  type: 'empty' | 'length' | 'prefix' | 'notfound';
  message: string;
}

const DEMO_DRUG_CODES = [
  { code: '81100100001000000101', name: '布洛芬缓释胶囊' },
  { code: '81100200002000000122', name: '阿莫西林胶囊' },
  { code: '81100300003000000143', name: '复方板蓝根颗粒' },
  { code: '81100400004000000174', name: '硝苯地平控释片' },
  { code: '81100500005000000105', name: '连花清瘟胶囊' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const queryDrug = useQueryStore((s) => s.queryDrug);
  const currentDrug = useQueryStore((s) => s.currentDrug);
  const queryLoading = useQueryStore((s) => s.loading);
  const queryError = useQueryStore((s) => s.error);
  const clearAll = useQueryStore((s) => s.clearAll);
  const showToast = useUIStore((s) => s.showToast);
  const addHistoryItem = useHistoryStore((s) => s.addHistoryItem);

  const [inputValue, setInputValue] = useState('');
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [errorDetail, setErrorDetail] = useState<ErrorDetail | null>(null);
  const [formatWarning, setFormatWarning] = useState('');

  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<number | null>(null);

  const focusInput = useCallback(() => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  }, []);

  const clearDebounceTimer = useCallback(() => {
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  const validateFormat = useCallback((code: string): ErrorDetail | null => {
    if (!code || code.trim() === '') {
      return { type: 'empty', message: '未识别到追溯码，请重新扫描' };
    }
    if (code.length !== 20) {
      return { type: 'length', message: `追溯码必须为20位数字，当前${code.length}位` };
    }
    if (!code.startsWith('81')) {
      return { type: 'prefix', message: '追溯码格式错误，须以81开头' };
    }
    return null;
  }, []);

  const checkRealTimeWarning = useCallback((code: string) => {
    if (code.length > 0 && code.length < 20 && !code.startsWith('81')) {
      setFormatWarning('⚠️ 格式可能有问题，不是以81开头');
    } else if (code.length > 0 && code.length < 20 && !/^\d+$/.test(code)) {
      setFormatWarning('⚠️ 追溯码必须全部为数字');
    } else {
      setFormatWarning('');
    }
  }, []);

  const executeQuery = useCallback(async (rawCode: string) => {
    const code = rawCode.trim();
    const validationError = validateFormat(code);
    if (validationError) {
      setScanStatus('error');
      setErrorDetail(validationError);
      return;
    }

    setScanStatus('querying');
    setErrorDetail(null);

    await queryDrug(code);

    const state = useQueryStore.getState();
    if (state.currentDrug) {
      addHistoryItem(code, state.currentDrug.productName);
      showToast('查询成功，正在跳转至药品详情...', 'success');
      navigate(`/drug/${code}`);
      return;
    }

    if (state.error) {
      setScanStatus('error');
      setErrorDetail({
        type: 'notfound',
        message: '未找到该追溯码对应的药品信息',
      });
    }
  }, [queryDrug, validateFormat, addHistoryItem, showToast, navigate]);

  const handleInputChange = useCallback((value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 20);

    if (digits === inputValue) return;

    setInputValue(digits);
    checkRealTimeWarning(digits);

    if (digits.length === 0) {
      setScanStatus('idle');
      clearDebounceTimer();
      return;
    }

    setScanStatus('scanning');
    clearDebounceTimer();

    if (digits.length === 20) {
      executeQuery(digits);
      return;
    }

    debounceTimerRef.current = window.setTimeout(() => {
      if (digits.length > 0) {
        executeQuery(digits);
      }
    }, 300);
  }, [inputValue, checkRealTimeWarning, clearDebounceTimer, executeQuery]);

  const handleReset = useCallback(() => {
    clearDebounceTimer();
    setInputValue('');
    setScanStatus('idle');
    setErrorDetail(null);
    setFormatWarning('');
    clearAll();
    setTimeout(() => focusInput(), 0);
  }, [clearDebounceTimer, clearAll, focusInput]);

  const handleDemoScan = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * DEMO_DRUG_CODES.length);
    const demo = DEMO_DRUG_CODES[randomIndex];
    setInputValue(demo.code);
    showToast(`已选择演示药品：${demo.name}`, 'info');
    executeQuery(demo.code);
  }, [showToast, executeQuery]);

  useEffect(() => {
    focusInput();

    const handleDocumentKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        clearDebounceTimer();
        executeQuery(inputValue);
        return;
      }

      if (/^[0-9]$/.test(e.key)) {
        const target = e.target as HTMLElement;
        const tagName = target?.tagName;
        if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
          return;
        }
        focusInput();
      }
    };

    document.addEventListener('keydown', handleDocumentKeyDown);

    const handleDocumentClick = () => {
      if (!queryLoading) {
        focusInput();
      }
    };
    document.addEventListener('click', handleDocumentClick);

    return () => {
      document.removeEventListener('keydown', handleDocumentKeyDown);
      document.removeEventListener('click', handleDocumentClick);
      clearDebounceTimer();
    };
  }, [focusInput, clearDebounceTimer, executeQuery, inputValue, queryLoading]);

  useEffect(() => {
    if (queryLoading) {
      setScanStatus('querying');
    }
  }, [queryLoading]);

  const renderProgressBar = () => {
    const length = inputValue.length;
    const colors = [
      'bg-sky-400', 'bg-sky-400', 'bg-sky-500', 'bg-sky-500',
      'bg-teal-400', 'bg-teal-400', 'bg-teal-500', 'bg-teal-500',
      'bg-emerald-400', 'bg-emerald-400', 'bg-emerald-500', 'bg-emerald-500',
      'bg-amber-400', 'bg-amber-400', 'bg-amber-500', 'bg-amber-500',
      'bg-orange-400', 'bg-orange-400', 'bg-orange-500', 'bg-orange-500',
    ];

    return (
      <div className="w-full space-y-2">
        <div className="flex gap-1 justify-center">
          {Array.from({ length: 20 }).map((_, idx) => (
            <div
              key={idx}
              className={`h-4 flex-1 rounded-sm transition-all duration-200 ${
                idx < length ? colors[idx] + ' shadow-sm scale-105' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-slate-500 px-1">
          <span>第 1 位</span>
          <span className="font-medium text-slate-600">
            {length > 0 ? `已输入 ${length} / 20 位` : '等待扫码'}
          </span>
          <span>第 20 位</span>
        </div>
      </div>
    );
  };

  const renderStatusContent = () => {
    if (scanStatus === 'querying') {
      return (
        <div className="space-y-4">
          <div className="flex flex-col items-center py-4">
            <div className="relative">
              <Loader2 className="w-16 h-16 text-sky-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-full" />
              </div>
            </div>
          </div>
          <div className="text-center space-y-2">
            <p className="text-xl font-semibold text-slate-700">正在查询药品信息，请稍候...</p>
            <p className="text-sm text-slate-500">
              正在验证追溯码 <span className="font-mono font-medium text-sky-600">{inputValue}</span>
            </p>
          </div>
        </div>
      );
    }

    if (scanStatus === 'error' && errorDetail) {
      return (
        <div className="space-y-4">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-semibold text-red-700 mb-1">扫码异常</h4>
                <p className="text-red-600 leading-relaxed">{errorDetail.message}</p>
                {inputValue.length > 0 && (
                  <p className="mt-2 text-xs font-mono bg-red-100 text-red-600 px-3 py-1 rounded-lg inline-block">
                    当前输入：{inputValue || '(空)'}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-sky-500 to-teal-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              重新扫码
            </button>
          </div>
        </div>
      );
    }

    if (scanStatus === 'scanning') {
      return (
        <div className="space-y-5">
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-slate-700">
              💡 已输入 {inputValue.length} 位，继续扫描...
            </p>
            <p className="text-sm font-mono text-slate-500 tracking-wider">
              {inputValue}
              <span className="inline-block w-0.5 h-4 bg-sky-500 animate-pulse ml-0.5 align-middle" />
            </p>
          </div>
          {renderProgressBar()}
          {formatWarning && (
            <div className="text-center">
              <p className="text-amber-600 text-sm bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 inline-block">
                {formatWarning}
              </p>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <div className="flex flex-col items-center py-2">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 border-4 border-sky-400 rounded-2xl" />
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-sky-600 rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-sky-600 rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-sky-600 rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-sky-600 rounded-br-xl" />
            <div className="absolute inset-3 flex items-center justify-center">
              <Scan className="w-12 h-12 text-sky-500" />
            </div>
            <div
              className="absolute left-3 right-3 h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent rounded-full animate-[scanline_2s_ease-in-out_infinite]"
              style={{
                animation: 'scanline 2s ease-in-out infinite',
              }}
            />
          </div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-lg font-semibold text-slate-700">等待扫码...</p>
          <p className="text-sm text-slate-500">使用扫码枪对准追溯码，或直接键盘输入</p>
        </div>
        {renderProgressBar()}
        <style>{`
          @keyframes scanline {
            0% { top: 12px; opacity: 0.2; }
            50% { top: calc(100% - 16px); opacity: 1; }
            100% { top: 12px; opacity: 0.2; }
          }
        `}</style>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-teal-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10 pt-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-3">药品追溯查询系统</h1>
          <p className="text-lg text-slate-500">药品全链路追溯 · 安全用药可信赖</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-10 border border-slate-100">
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-36 h-36 rounded-full bg-gradient-to-br from-sky-100 to-teal-100 flex items-center justify-center relative">
                <QrCode className="w-20 h-20 text-sky-600" strokeWidth={1.5} />
                <div
                  className="absolute inset-0 rounded-full border-4 border-sky-400 border-dashed animate-spin"
                  style={{ animationDuration: '8s' }}
                />
              </div>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleDemoScan}
                  disabled={scanStatus === 'querying'}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Sparkles className="w-5 h-5" />
                  模拟扫码体验
                </button>
                <p className="text-xs text-slate-400 text-center max-w-[140px]">
                  随机选择药品演示查询流程
                </p>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-slate-700">扫描药品追溯码</h2>
            <p className="text-slate-500 mt-2">请将药品包装上的20位追溯码对准扫描框</p>
          </div>

          <div className="border-t border-slate-100 pt-6">
            {renderStatusContent()}
          </div>

          <div className="mt-6 border-t border-slate-100 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <button
                onClick={() => navigate('/manual')}
                className="flex items-center justify-center gap-4 p-5 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
              >
                <Search className="w-7 h-7" />
                <div className="text-left">
                  <div className="text-lg font-semibold">手动输入查询</div>
                  <div className="text-sm text-sky-100">手动输入20位追溯码</div>
                </div>
              </button>

              <button
                onClick={() => navigate('/pharmacist')}
                className="flex items-center justify-center gap-4 p-5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
              >
                <UserCircle2 className="w-7 h-7" />
                <div className="text-left">
                  <div className="text-lg font-semibold">药师协助</div>
                  <div className="text-sm text-teal-100">在线咨询执业药师</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <button
            onClick={() => navigate('/feedback')}
            className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all border border-slate-100 text-left"
          >
            <FileQuestion className="w-10 h-10 text-amber-500 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-1">问题反馈</h3>
            <p className="text-sm text-slate-500">查询异常？提交反馈给我们</p>
          </button>

          <button
            onClick={() => navigate('/privacy')}
            className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all border border-slate-100 text-left"
          >
            <ShieldCheck className="w-10 h-10 text-emerald-500 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-1">隐私说明</h3>
            <p className="text-sm text-slate-500">了解我们的数据保护政策</p>
          </button>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-xl">💊</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">正品保障</h3>
            <p className="text-sm text-slate-500">国家药监局追溯平台验证</p>
          </div>
        </div>

        <input
          ref={hiddenInputRef}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {}}
          className="absolute opacity-0 z-[-100] left-[-9999px] top-0 w-1 h-1"
          style={{ caretColor: 'transparent' }}
          aria-label="扫码枪输入框"
        />
      </div>
    </div>
  );
}
