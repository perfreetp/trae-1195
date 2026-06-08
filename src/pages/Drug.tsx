import { useEffect } from 'react';
import { useParams, Link, useNavigate, Outlet } from 'react-router-dom';
import { ArrowLeft, Pill, Calendar, MapPin, AlertTriangle, CheckCircle2, FileText, Clock, XCircle, GitCompare, ShieldAlert } from 'lucide-react';
import { useQueryStore, useUIStore, useHistoryStore } from '@/store';

export default function DrugPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const queryDrug = useQueryStore((s) => s.queryDrug);
  const loading = useQueryStore((s) => s.loading);
  const drug = useQueryStore((s) => s.currentDrug);
  const risk = useQueryStore((s) => s.currentRisk);
  const error = useQueryStore((s) => s.error);
  const showToast = useUIStore((s) => s.showToast);
  const addHistory = useHistoryStore((s) => s.addHistoryItem);

  useEffect(() => {
    if (code) {
      queryDrug(code).then(() => {
        const d = useQueryStore.getState().currentDrug;
        if (d) {
          addHistory(d.traceCode, d.productName);
        }
      });
    }
    return () => {};
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">正在查询药品信息...</p>
        </div>
      </div>
    );
  }

  if (error || !drug) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-teal-50 p-6">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            返回
          </button>
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-slate-100">
            <XCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-700 mb-3">未找到药品信息</h2>
            <p className="text-slate-500 mb-8">{error || '请检查追溯码是否正确'}</p>
            <Link
              to="/manual"
              className="inline-block px-8 py-4 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all"
            >
              重新输入追溯码
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const riskBanner = (() => {
    const qc = risk?.queryCount ?? 0;
    const isHighDuplicateDanger = !risk?.isRecalled && !risk?.isExpired && qc >= 6;
    const isWarningDuplicate = qc >= 4 && qc < 6;

    if (risk?.isRecalled) {
      return {
        bg: 'bg-red-50 border-red-200',
        text: 'text-red-700',
        icon: <AlertTriangle className="w-6 h-6" />,
        title: '⚠️ 产品召回警告',
        subtitle: '该批次药品已启动召回，请立即停止使用并联系购买药店',
        showDetailBtn: false,
      };
    }
    if (risk?.isExpired) {
      return {
        bg: 'bg-red-50 border-red-200',
        text: 'text-red-700',
        icon: <AlertTriangle className="w-6 h-6" />,
        title: '🚨 药品已过期',
        subtitle: '该药品已超过有效期，请勿服用',
        showDetailBtn: false,
      };
    }
    if (isHighDuplicateDanger) {
      return {
        bg: 'bg-rose-50 border-rose-300',
        text: 'text-rose-700',
        icon: <ShieldAlert className="w-6 h-6" />,
        title: '🚨 追溯码查询异常',
        subtitle: `该码在短时间内被多人查询，共${qc}次，首次查询于${risk?.firstQueryTime}，可能为回收包装重复利用或伪造，强烈建议拒收`,
        showDetailBtn: true,
      };
    }
    if (risk?.level === 'warning') {
      let subtitle = '';
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      const expiryDate = new Date(drug.expiryDate);
      const now = new Date();
      const nearExpiry = expiryDate.getTime() - now.getTime() < thirtyDaysMs;
      if (nearExpiry) {
        subtitle = '该药品临近效期（不足30天），请尽快使用';
      } else if (isWarningDuplicate) {
        subtitle = `⚠️ 该追溯码近期被频繁查询，共${qc}次，请谨慎购买`;
      } else {
        subtitle = `该追溯码已被查询 ${qc} 次，请谨慎使用`;
      }
      return {
        bg: 'bg-amber-50 border-amber-200',
        text: 'text-amber-700',
        icon: <AlertTriangle className="w-6 h-6" />,
        title: '⚠️ 风险提示',
        subtitle,
        showDetailBtn: isWarningDuplicate,
      };
    }
    return {
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-700',
      icon: <CheckCircle2 className="w-6 h-6" />,
      title: '✅ 正品验证通过',
      subtitle: '该药品来源渠道合法，质量检验合格',
      showDetailBtn: false,
    };
  })();

  const navItems = [
    { path: '', label: '药品档案', icon: <Pill className="w-5 h-5" /> },
    { path: 'timeline', label: '流向时间轴', icon: <Clock className="w-5 h-5" /> },
    { path: 'risk', label: '风险核验', icon: <AlertTriangle className="w-5 h-5" /> },
    { path: 'guide', label: '用药提示', icon: <FileText className="w-5 h-5" /> },
    { path: 'compare', label: '批次比对', icon: <GitCompare className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-teal-50">
      <div className={`px-8 py-5 border-b ${riskBanner.bg} ${riskBanner.text}`}>
        <div className="max-w-6xl mx-auto flex items-start gap-4">
          {riskBanner.icon}
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{riskBanner.title}</h3>
            <p className="opacity-90 text-sm mt-1">{riskBanner.subtitle}</p>
          </div>
          {risk?.isRecalled && risk.recallInfo && (
            <a
              href={`tel:${risk.recallInfo.contactPhone}`}
              className="px-5 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors whitespace-nowrap"
            >
              联系召回 {risk.recallInfo.contactPhone}
            </a>
          )}
          {riskBanner.showDetailBtn && (
            <button
              onClick={() => navigate(`/drug/${code}/risk`)}
              className="px-5 py-2 bg-white/80 backdrop-blur rounded-xl hover:bg-white transition-colors whitespace-nowrap font-medium border border-current/20"
            >
              查看核验详情
            </button>
          )}
        </div>
      </div>

      <div className="px-8 py-5 border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {drug.productName}
                <span className="ml-3 text-base font-normal text-slate-500">
                  ({drug.brandName})
                </span>
              </h1>
              <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                <span className="font-mono">追溯码：{drug.traceCode}</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {drug.manufacturer}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/print/${drug.traceCode}`)}
              className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
            >
              打印凭证
            </button>
            <button
              onClick={() => {
                navigate('/feedback');
                showToast('请在反馈页填写问题详情', 'info');
              }}
              className="px-5 py-2.5 border-2 border-sky-500 text-sky-600 rounded-xl hover:bg-sky-50 transition-colors font-medium"
            >
              问题反馈
            </button>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-8 flex gap-2 overflow-x-auto">
          {navItems.map((item) => {
            const to = item.path ? `/drug/${code}/${item.path}` : `/drug/${code}`;
            const isActive = !item.path
              ? location.pathname === `/drug/${code}`
              : location.pathname.startsWith(`/drug/${code}/${item.path}`);
            return (
              <Link
                key={item.path || 'base'}
                to={to}
                className={`flex items-center gap-2 px-5 py-4 border-b-2 font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-sky-500 text-sky-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        <Outlet context={{ drug, risk }} />
      </div>
    </div>
  );
}
