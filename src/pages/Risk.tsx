import { useOutletContext } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, ShieldCheck, Clock, AlertCircle, Phone, FileWarning, Hash, TrendingUp, QrCode, Search, History, Link as LinkIcon, Printer, FileDown } from 'lucide-react';
import type { DrugTraceInfo, QueryEntryLog, RiskResult } from '@/types';
import { useQueryStore } from '@/store';

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
  const getAllQueryRecords = useQueryStore((s) => s.getAllQueryRecords);
  const getRiskLevelForRecord = useQueryStore((s) => s.getRiskLevelForRecord);

  function escapeCSV(v: string | number): string {
    const s = String(v ?? '');
    if (/[",\n\r]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  }

  function triggerCSVDownload(filename: string, rows: (string | number)[][], headers: string[]) {
    const bom = '\uFEFF';
    const lines = [headers, ...rows].map((row) => row.map(escapeCSV).join(','));
    const csv = bom + lines.join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function handleExportCurrent() {
    if (!risk) return;
    const records = getAllQueryRecords();
    const current = records.find((r) => r.traceCode === drug.traceCode);
    const logs = current?.queryLogs?.length ? current.queryLogs : risk.queryLogs || [];
    const level = current
      ? getRiskLevelForRecord(current)
      : (risk.level || 'safe');
    const levelMap = { safe: '安全', warning: '注意', danger: '风险' };
    const headers = ['追溯码', '药品名称', '入口来源', '查询时间', '风险等级', '累计查询次数', '导出时间'];
    const rows = logs.map((log) => [
      drug.traceCode,
      drug.productName,
      `${log.sourceLabel} (${log.source})`,
      log.queryTime,
      levelMap[level as keyof typeof levelMap],
      String(current?.queryCount ?? qc),
      new Date().toLocaleString('zh-CN'),
    ]);
    if (!rows.length) {
      rows.push([
        drug.traceCode,
        drug.productName,
        '-',
        new Date().toLocaleString('zh-CN'),
        levelMap[level as keyof typeof levelMap],
        String(qc),
        new Date().toLocaleString('zh-CN'),
      ]);
    }
    triggerCSVDownload(
      `追溯码_${drug.traceCode}_查询记录_${Date.now()}.csv`,
      rows,
      headers
    );
  }

  const daysToExpiry = Math.max(
    0,
    Math.ceil(
      (new Date(drug.expiryDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
    )
  );

  const isNearExpiry = risk?.isNearExpiry && !risk?.isExpired;

  const expiryCheck = (() => {
    if (risk?.isExpired) {
      return {
        key: 'expiry',
        icon: <Clock className="w-6 h-6" />,
        label: '有效期检查',
        passed: false,
        detail: `有效期至 ${drug.expiryDate}，已过期 ${Math.max(1, Math.abs(daysToExpiry))} 天`,
        passedText: '在有效期内',
        failedText: '药品已过期，请勿使用',
        level: 'error' as const,
      };
    }
    if (isNearExpiry) {
      return {
        key: 'expiry',
        icon: <Clock className="w-6 h-6" />,
        label: '有效期检查',
        passed: false,
        detail: `有效期至 ${drug.expiryDate}，距到期还剩约 ${daysToExpiry} 天，建议尽快使用`,
        passedText: '在有效期内',
        failedText: '临近效期（不足30天）',
        level: 'warning' as const,
      };
    }
    return {
      key: 'expiry',
      icon: <Clock className="w-6 h-6" />,
      label: '有效期检查',
      passed: true,
      detail: `有效期至 ${drug.expiryDate}，剩余约 ${daysToExpiry} 天`,
      passedText: '在有效期内',
      failedText: '药品已过期',
      level: 'ok' as const,
    };
  })();

  const authenticityLevel = (() => {
    if (!risk?.isAuthentic) return 'error' as const;
    return 'ok' as const;
  })();

  const recallLevel = (() => {
    if (risk?.isRecalled) return 'error' as const;
    return 'ok' as const;
  })();

  const checks = [
    {
      key: 'authentic',
      icon: <ShieldCheck className="w-6 h-6" />,
      label: '真伪验证',
      passed: risk?.isAuthentic ?? false,
      detail: risk?.authenticitySource || '',
      passedText: '正品验证通过',
      failedText: '验证异常，请联系客服',
      level: authenticityLevel,
    },
    expiryCheck,
    {
      key: 'recall',
      icon: <FileWarning className="w-6 h-6" />,
      label: '召回检查',
      passed: !risk?.isRecalled,
      detail: risk?.isRecalled
        ? `${risk.recallInfo?.recallLevel}召回 · 原因：${risk.recallInfo?.recallReason || ''}`
        : '该批次无召回记录',
      passedText: '无召回通知',
      failedText: `该批次${risk?.recallInfo?.recallLevel}召回`,
      level: recallLevel,
    },
  ];

  const queryCheckPassed = qc < 4;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-md p-8 border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-700 text-center">风险仪表盘</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCurrent}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-sm font-medium transition-colors"
            >
              <FileDown className="w-4 h-4" />
              导出当前追溯码记录
            </button>
          </div>
        </div>
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
          {checks.map((check) => {
            const level = (check as { level?: 'ok' | 'warning' | 'error' }).level || (check.passed ? 'ok' : 'error');
            const levelStyle = {
              ok: { border: 'border-emerald-100 bg-emerald-50/50', iconBg: 'bg-emerald-100 text-emerald-600', tag: 'bg-emerald-100 text-emerald-700', passIcon: <CheckCircle2 className="w-6 h-6" /> },
              warning: { border: 'border-amber-200 bg-amber-50/60', iconBg: 'bg-amber-100 text-amber-600', tag: 'bg-amber-100 text-amber-700', passIcon: <AlertTriangle className="w-6 h-6" /> },
              error: { border: 'border-red-100 bg-red-50/50', iconBg: 'bg-red-100 text-red-600', tag: 'bg-red-100 text-red-700', passIcon: check.icon },
            }[level];
            return (
              <div
                key={check.key}
                className={`p-5 rounded-xl border-2 transition-all ${levelStyle.border}`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${levelStyle.iconBg}`}
                  >
                    {level === 'ok' ? levelStyle.passIcon : levelStyle.passIcon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-slate-700">{check.label}</h4>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${levelStyle.tag}`}
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
            );
          })}
        </div>
      </div>

      {/* 风险项详解：分块报告 */}
      <RiskSectionsBlock drug={drug} risk={risk} daysToExpiry={daysToExpiry} />
    </div>
  );
}

interface RiskBlock {
  key: string;
  badge: string;
  badgeColor: string;
  title: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  trigger: string;
  impact: string;
  nextStep: string;
  suggestion?: string;
}

function RiskSectionsBlock({ drug, risk, daysToExpiry }: { drug: DrugTraceInfo; risk: RiskResult | null; daysToExpiry: number }) {
  if (!risk) return null;

  const blocks: RiskBlock[] = [];
  const qc = risk.queryCount ?? 0;
  const avgCompare = 2;

  if (risk.isRecalled && risk.recallInfo) {
    blocks.push({
      key: 'recall',
      badge: '最高优先级',
      badgeColor: 'bg-red-100 text-red-700',
      title: '产品召回风险',
      icon: <FileWarning className="w-6 h-6" />,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      trigger: `批次号 ${risk.recallInfo.batchNumber || drug.batchNumber} 于 ${risk.recallInfo.recallDate} 启动${risk.recallInfo.recallLevel}，召回原因：${risk.recallInfo.recallReason || '待补充'}。召回范围：${risk.recallInfo.recallScope || '该批次所有流通药品'}。`,
      impact: '根据《药品召回管理办法》，该批次药品存在已知质量问题或安全隐患，继续使用可能导致不良反应或治疗失败。',
      nextStep: '① 立即停止使用该药品；② 将药品连同包装带回购买药店办理退回；③ 如已服用并出现不适，请及时就医；④ 可拨打召回电话咨询详情。',
    });
  }

  if (risk.isExpired) {
    const overdue = Math.max(1, Math.abs(daysToExpiry));
    blocks.push({
      key: 'expired',
      badge: '高危',
      badgeColor: 'bg-red-100 text-red-700',
      title: '药品已过期',
      icon: <Clock className="w-6 h-6" />,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      trigger: `有效期标注为 ${drug.expiryDate}，当前已超出有效期约 ${overdue} 天。`,
      impact: '过期药品有效成分可能降解，药效下降甚至失效；部分药品可能产生有毒降解物，增加不良反应风险。',
      nextStep: '① 切勿服用该药品；② 参照当地生活垃圾/过期药品回收规定妥善处理，不要随意丢弃；③ 如需继续用药请重新购买有效期内产品。',
      suggestion: '建议家庭常备药品每 3 个月清理一次效期，优先使用临近效期的产品。',
    });
  }

  if (qc >= 6) {
    blocks.push({
      key: 'dup-high',
      badge: '高危',
      badgeColor: 'bg-rose-100 text-rose-700',
      title: '频繁查询风险（异常高）',
      icon: <ShieldCheck className="w-6 h-6" />,
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600',
      trigger: `该追溯码累计查询 ${qc} 次，首次查询于 ${risk.firstQueryTime}，最近一次 ${risk.lastQueryTime}；同批次平均查询次数约 ${avgCompare} 次，当前查询频次明显偏高。`,
      impact: '同一盒药品在短时间内被多名消费者查询，通常意味着包装盒被多次流转，可能存在回收正规包装盒装入假药/劣药重新销售的风险。',
      nextStep: '① 暂停购买使用；② 与药店确认该盒药品是否被退回或二次销售；③ 如仍有疑问，可直接拨打生产厂家 400 电话或向当地药监部门举报。',
    });
  }

  if (risk.isNearExpiry && !risk.isExpired) {
    blocks.push({
      key: 'near-expiry',
      badge: '提示',
      badgeColor: 'bg-amber-100 text-amber-700',
      title: '临近效期提醒',
      icon: <Clock className="w-6 h-6" />,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      trigger: `该药品有效期至 ${drug.expiryDate}，距到期还剩约 ${daysToExpiry} 天（＜ 30 天 阈值）。`,
      impact: '药品仍在有效期内可正常使用，但若短期内无法用完，后续可能面临过期浪费；部分药效敏感剂型在临近效期时疗效可能轻微下降。',
      nextStep: '① 确认实际用药疗程是否能在到期日前完成；② 若预计无法用完可与药店协商是否可更换更远效期产品；③ 存储条件请严格遵循说明书（冷藏/避光/密封）。',
      suggestion: `建议按每日 ${Math.ceil(Number(drug.specification.match(/\d+/)?.[0] || 1))} 剂量估算 ${daysToExpiry} 天约可使用 ${Math.max(1, Math.round(daysToExpiry / Math.max(1, Number(drug.specification.match(/\d+/)?.[0] || 1))))} 个疗程，请按需使用。`,
    });
  }

  if (qc >= 4 && qc < 6) {
    blocks.push({
      key: 'dup-warn',
      badge: '提示',
      badgeColor: 'bg-amber-100 text-amber-700',
      title: '重复查询风险（偏高）',
      icon: <Hash className="w-6 h-6" />,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      trigger: `该追溯码累计查询 ${qc} 次，略高于同批次平均 ${avgCompare} 次；首次查询于 ${risk.firstQueryTime}，最近一次 ${risk.lastQueryTime}。`,
      impact: '该药品可能被多人查看过（如退回、调拨、陈列样展示），药品本身未必有问题，但建议购买前核对包装完整性和塑封是否完好。',
      nextStep: '① 检查包装盒封口、防伪标签、电子监管码涂层是否完好；② 如包装有明显拆封或二次粘贴痕迹，建议更换同批次其他未拆封产品；③ 保留小票及凭证以备后续追溯。',
    });
  }

  if (!risk.isAuthentic) {
    blocks.push({
      key: 'auth-fail',
      badge: '高危',
      badgeColor: 'bg-red-100 text-red-700',
      title: '真伪验证异常',
      icon: <AlertCircle className="w-6 h-6" />,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      trigger: `在 ${risk.authenticitySource || '追溯平台'} 未查询到该码对应的正品登记，或返回不一致记录。`,
      impact: '药品可能为假冒伪劣产品，存在成分不对、剂量不足、甚至有害添加的风险，严重危害用药安全。',
      nextStep: '① 切勿服用；② 立即与购买药店沟通要求换货或退款；③ 可拨打 12315 或当地药监部门投诉举报，并提供药品照片、小票、追溯码截图。',
    });
  }

  if (blocks.length === 0) {
    blocks.push({
      key: 'safe',
      badge: '通过',
      badgeColor: 'bg-emerald-100 text-emerald-700',
      title: '全部核验项通过',
      icon: <CheckCircle2 className="w-6 h-6" />,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      trigger: `共核验 5 项：真伪验证（✓）、有效期状态（✓）、召回通知（✓）、查询频次（✓）、临期检查（✓）。`,
      impact: '该药品来源合法、质量合格，不存在当前系统可识别的风险因素。',
      nextStep: '① 建议使用前再核对一次医嘱或说明书的用法用量；② 按说明书条件妥善储存；③ 保留购物小票或发票，如有异常可凭小票追溯。',
      suggestion: `可扫描凭证二维码或访问药品档案页随时复查，同一盒药品如后续出现异常查询频次，系统会自动升级风险等级。`,
    });
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800">风险核验报告</h2>
            <p className="text-sm text-slate-500 mt-1">
              共识别 <span className="font-semibold text-slate-700">{blocks.length}</span> 项说明，按风险优先级从高到低排列
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            risk.level === 'danger' ? 'bg-red-100 text-red-700' :
            risk.level === 'warning' ? 'bg-amber-100 text-amber-700' :
            'bg-emerald-100 text-emerald-700'
          }`}>
            总体等级：{risk.level === 'danger' ? '存在风险' : risk.level === 'warning' ? '注意提示' : '综合安全'}
          </span>
        </div>

        <div className="space-y-5">
          {blocks.map((block) => (
            <div
              key={block.key}
              className={`rounded-xl border-2 p-5 ${
                block.badgeColor.includes('red') || block.badgeColor.includes('rose')
                  ? 'bg-red-50/40 border-red-200/70'
                  : block.badgeColor.includes('amber')
                  ? 'bg-amber-50/40 border-amber-200/70'
                  : 'bg-emerald-50/40 border-emerald-200/70'
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${block.iconBg} ${block.iconColor}`}>
                  {block.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className={`text-lg font-bold ${block.iconColor.includes('red') || block.iconColor.includes('rose') ? 'text-red-700' : block.iconColor.includes('amber') ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {block.title}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${block.badgeColor}`}>
                      {block.badge}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="text-xs uppercase tracking-wide text-slate-400 mb-1.5 font-semibold">触发原因</div>
                  <p className="text-sm text-slate-700 leading-relaxed">{block.trigger}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="text-xs uppercase tracking-wide text-slate-400 mb-1.5 font-semibold">影响与建议</div>
                  <p className="text-sm text-slate-700 leading-relaxed">{block.impact}</p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="text-xs uppercase tracking-wide text-slate-400 mb-1.5 font-semibold">下一步处理</div>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{block.nextStep}</p>
                </div>
                {block.suggestion && (
                  <div className="bg-sky-50 rounded-lg p-4 border border-sky-200">
                    <div className="text-xs uppercase tracking-wide text-sky-500 mb-1.5 font-semibold">贴心建议</div>
                    <p className="text-sm text-sky-800 leading-relaxed">{block.suggestion}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
