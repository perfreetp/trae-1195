import { useOutletContext } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, ShieldCheck, Clock, AlertCircle, Phone, FileWarning, Hash, TrendingUp, QrCode, Search, History, Link as LinkIcon, Printer } from 'lucide-react';
import type { DrugTraceInfo, QueryEntryLog, RiskResult } from '@/types';

type ContextType = { drug: DrugTraceInfo; risk: RiskResult | null };

function RiskGauge({ risk }: { risk: RiskResult | null }) {
  const level = risk?.level || 'safe';
  const config = {
    safe: { color: 'text-emerald-500', bg: 'bg-emerald-500', label: '安全', percent: 100 },
    warning: { color: 'text-amber-500', bg: 'bg-amber-500', label: '警告', percent: 50 },
    danger: { color: 'text-red-500', bg: 'bg-red-500', label: '危险', percent: 0 },
  }[level];

  return (
    <div className="relative w-52 h-52 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
        <circle
          cx="80"
          cy="80"
          r="65"
          fill="none"
          stroke="#f1f5f9"
          strokeWidth="12"
        />
        <circle
          cx="80"
          cy="80"
          r="65"
          fill="none"
          className={config.bg.replace('bg-', 'stroke-')}
          stroke="currentColor"
          strokeWidth="12"
          strokeDasharray={`${(config.percent / 100) * 408} 408`}
          strokeLinecap="round"
          style={{ color: config.color.includes('emerald') ? '#10b981' : config.color.includes('amber') ? '#f59e0b' : '#ef4444' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {level === 'safe' && <ShieldCheck className={`w-14 h-14 ${config.color} mb-2`} />}
        {level === 'warning' && <AlertTriangle className={`w-14 h-14 ${config.color} mb-2`} />}
        {level === 'danger' && <AlertCircle className={`w-14 h-14 ${config.color} mb-2`} />}
        <div className={`text-3xl font-bold ${config.color}`}>{config.label}</div>
        <div className="text-sm text-slate-400 mt-1">风险等级</div>
      </div>
    </div>
  );
}

function getQueryFrequencyLevel(queryCount: number): {
  level: 'normal' | 'high' | 'abnormal';
  label: string;
  color: string;
  avgCompare: number;
} {
  const avgCompare = 2;
  if (queryCount >= 6) {
    return { level: 'abnormal', label: '异常高', color: 'text-rose-600 bg-rose-100', avgCompare };
  }
  if (queryCount >= 4) {
    return { level: 'high', label: '偏高', color: 'text-amber-600 bg-amber-100', avgCompare };
  }
  return { level: 'normal', label: '正常', color: 'text-emerald-600 bg-emerald-100', avgCompare };
}

export default function RiskPage() {
  const { drug, risk } = useOutletContext<ContextType>();
  const qc = risk?.queryCount ?? 0;
  const freqInfo = getQueryFrequencyLevel(qc);

  const checks = [
    {
      key: 'authentic',
      icon: <ShieldCheck className="w-6 h-6" />,
      label: '真伪验证',
      passed: risk?.isAuthentic ?? false,
      detail: risk?.authenticitySource || '',
      passedText: '正品验证通过',
      failedText: '验证异常，请联系客服',
    },
    {
      key: 'expiry',
      icon: <Clock className="w-6 h-6" />,
      label: '有效期检查',
      passed: !risk?.isExpired,
      detail: `有效期至 ${drug.expiryDate}`,
      passedText: '在有效期内',
      failedText: '药品已过期，请勿使用',
    },
    {
      key: 'recall',
      icon: <FileWarning className="w-6 h-6" />,
      label: '召回检查',
      passed: !risk?.isRecalled,
      detail: risk?.isRecalled ? `${risk.recallInfo?.recallLevel}召回` : '该批次无召回记录',
      passedText: '无召回通知',
      failedText: `该批次${risk?.recallInfo?.recallLevel}召回`,
    },
  ];

  const queryCheckPassed = qc < 4;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-md p-8 border border-slate-100">
        <h2 className="text-lg font-semibold text-slate-700 mb-6 text-center">风险仪表盘</h2>
        <RiskGauge risk={risk} />
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-slate-50 rounded-xl">
            <div className="text-2xl font-bold text-sky-600">{qc}</div>
            <div className="text-sm text-slate-500 mt-1">查询次数</div>
          </div>
          <div className={`p-4 rounded-xl ${risk?.isExpired ? 'bg-red-50' : 'bg-emerald-50'}`}>
            <div className={`text-2xl font-bold ${risk?.isExpired ? 'text-red-600' : 'text-emerald-600'}`}>
              {risk?.isExpired ? '已过期' : '有效'}
            </div>
            <div className="text-sm text-slate-500 mt-1">有效期</div>
          </div>
          <div className={`p-4 rounded-xl ${risk?.isRecalled ? 'bg-red-50' : 'bg-emerald-50'}`}>
            <div className={`text-2xl font-bold ${risk?.isRecalled ? 'text-red-600' : 'text-emerald-600'}`}>
              {risk?.isRecalled ? '已召回' : '正常'}
            </div>
            <div className="text-sm text-slate-500 mt-1">召回状态</div>
          </div>
          <div className={`p-4 rounded-xl ${risk?.isAuthentic ? 'bg-emerald-50' : 'bg-red-50'}`}>
            <div className={`text-2xl font-bold ${risk?.isAuthentic ? 'text-emerald-600' : 'text-red-600'}`}>
              {risk?.isAuthentic ? '正品' : '异常'}
            </div>
            <div className="text-sm text-slate-500 mt-1">真伪状态</div>
          </div>
        </div>
      </div>

      {risk?.isRecalled && risk.recallInfo && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 shadow-md">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <FileWarning className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-red-700 mb-4">
                {risk.recallInfo.recallLevel}召回公告
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-red-600/70 mb-1">召回日期</div>
                  <div className="font-medium text-red-800">{risk.recallInfo.recallDate}</div>
                </div>
                <div>
                  <div className="text-red-600/70 mb-1">召回范围</div>
                  <div className="font-medium text-red-800">{risk.recallInfo.recallScope}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-red-600/70 mb-1">召回原因</div>
                  <div className="font-medium text-red-800">{risk.recallInfo.recallReason}</div>
                </div>
              </div>
              <div className="mt-5 pt-5 border-t border-red-200 flex items-center justify-between">
                <div className="text-red-700">如您已购买此药品，请立即停止使用并联系：</div>
                <a
                  href={`tel:${risk.recallInfo.contactPhone}`}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  {risk.recallInfo.contactPhone}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`rounded-2xl shadow-md p-6 border-2 transition-all ${
        queryCheckPassed
          ? 'border-emerald-100 bg-emerald-50/50'
          : 'border-rose-200 bg-rose-50/50'
      }`}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            queryCheckPassed ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
          }`}>
            <Hash className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700">查询频次</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="p-5 bg-white rounded-xl shadow-sm border border-slate-100 text-center">
            <div className="text-slate-500 text-sm mb-2">累计查询次数</div>
            <div className={`text-5xl font-bold ${qc >= 6 ? 'text-rose-600' : qc >= 4 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {qc}
            </div>
            <div className="mt-3">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${freqInfo.color}`}>
                <TrendingUp className="w-4 h-4 inline mr-1" />
                {freqInfo.label}
              </span>
            </div>
          </div>
          <div className="p-5 bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="text-slate-500 text-sm mb-2">首次查询时间</div>
            <div className="text-lg font-semibold text-slate-700">
              {risk?.firstQueryTime || '-'}
            </div>
            <div className="mt-4 text-slate-500 text-sm mb-2">最近一次查询时间</div>
            <div className="text-lg font-semibold text-slate-700">
              {risk?.lastQueryTime || '-'}
            </div>
          </div>
          <div className="p-5 bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="text-slate-500 text-sm mb-2">查询频次等级</div>
            <div className={`text-xl font-bold ${qc >= 6 ? 'text-rose-600' : qc >= 4 ? 'text-amber-600' : 'text-emerald-600'}`}>
              {freqInfo.label}
            </div>
            <div className="mt-4 text-slate-500 text-sm mb-2">同批次平均查询次数</div>
            <div className="text-xl font-bold text-slate-700">
              约 {freqInfo.avgCompare} 次
            </div>
          </div>
        </div>

        {freqInfo.level !== 'normal' && (
          <div className="p-4 rounded-xl border border-rose-200 bg-white">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="text-rose-700 text-sm leading-relaxed">
                同批次其他药品查询次数约 <span className="font-bold">{freqInfo.avgCompare}</span> 次，
                该码明显高于平均水平，警惕可能为回收包装重复利用或伪造的追溯码，建议谨慎购买或拒收。
              </div>
            </div>
          </div>
        )}

        {freqInfo.level === 'normal' && (
          <div className="p-4 rounded-xl border border-emerald-200 bg-white">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="text-emerald-700 text-sm leading-relaxed">
                查询频次正常，符合同批次药品的平均查询水平。
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-700">最近查询入口来源</h3>
            <p className="text-sm text-slate-500">展示该追溯码最近 5 次查询的入口途径，帮您了解查询来源情况</p>
          </div>
        </div>

        {(risk?.queryLogs && risk.queryLogs.length > 0) ? (
          <div className="space-y-3">
            {risk.queryLogs.map((log: QueryEntryLog, idx: number) => {
              const iconMap: Record<QueryEntryLog['source'], { icon: React.ReactNode; bg: string; color: string }> = {
                home_scan: {
                  icon: <QrCode className="w-5 h-5" />, bg: 'bg-emerald-100', color: 'text-emerald-600' },
                manual_input: {
                  icon: <Search className="w-5 h-5" />, bg: 'bg-sky-100', color: 'text-sky-600' },
                history: {
                  icon: <History className="w-5 h-5" />, bg: 'bg-amber-100', color: 'text-amber-600' },
                direct_link: {
                  icon: <LinkIcon className="w-5 h-5" />, bg: 'bg-violet-100', color: 'text-violet-600' },
                print_page: {
                  icon: <Printer className="w-5 h-5" />, bg: 'bg-slate-100', color: 'text-slate-600' },
              };
              const cfg = iconMap[log.source] || iconMap.direct_link;
              return (
                <div key={`${log.source}-${log.queryTime}-${idx}`} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.color}`}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="font-medium text-slate-700">
                        {log.sourceLabel}
                      </div>
                      {idx === 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-600 shrink-0">
                          本次
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-500 mt-0.5">
                      查询时间：{log.queryTime}
                    </div>
                  </div>
                  <div className="text-sm font-mono text-slate-400 shrink-0">
                    #{risk.queryLogs.length - idx}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-slate-500 p-8 text-center bg-slate-50 rounded-xl">
            暂无查询入口记录
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
        <h3 className="text-lg font-semibold text-slate-700 mb-6">其他核验详情</h3>
        <div className="space-y-4">
          {checks.map((check) => (
            <div
              key={check.key}
              className={`p-5 rounded-xl border-2 transition-all ${
                check.passed
                  ? 'border-emerald-100 bg-emerald-50/50'
                  : 'border-red-100 bg-red-50/50'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                    check.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                  }`}
                >
                  {check.passed ? <CheckCircle2 className="w-6 h-6" /> : check.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-slate-700">{check.label}</h4>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        check.passed
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {check.passed ? check.passedText : check.failedText}
                    </span>
                  </div>
                  {check.detail && (
                    <p className="text-sm text-slate-500 mt-1">{check.detail}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
