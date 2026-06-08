import { useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  GitCompare,
  AlertTriangle,
  CheckCircle2,
  Package,
  Calendar,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Phone,
  ArrowLeft,
} from 'lucide-react';
import type { DrugTraceInfo, RiskResult, BatchCompareItem, RecallInfo } from '@/types';
import { getBatchCompareList, getRecallInfo } from '@/mock';

type ContextType = { drug: DrugTraceInfo; risk: RiskResult | null };

function maskTraceCode(code: string): string {
  if (code.length < 8) return code;
  const first4 = code.substring(0, 4);
  const last4 = code.substring(code.length - 4);
  return `${first4}****${last4}`;
}

function getExpiryStatus(item: BatchCompareItem): {
  label: string;
  className: string;
  bgClass: string;
} {
  const days = item.daysToExpiry ?? 0;
  if (item.isExpired || days < 0) {
    return {
      label: '已过期',
      className: 'text-red-700',
      bgClass: 'bg-red-100',
    };
  }
  if (days <= 30) {
    return {
      label: `临期${days}天`,
      className: 'text-amber-700',
      bgClass: 'bg-amber-100',
    };
  }
  return {
    label: '正常',
    className: 'text-emerald-700',
    bgClass: 'bg-emerald-100',
  };
}

function getRecallStatus(item: BatchCompareItem): {
  label: string;
  className: string;
  bgClass: string;
} {
  if (!item.isRecalled) {
    return {
      label: '正常',
      className: 'text-emerald-700',
      bgClass: 'bg-emerald-100',
    };
  }
  const level = item.recallLevel || '三级';
  return {
    label: `召回中（${level}）`,
    className: 'text-red-700',
    bgClass: 'bg-red-100',
  };
}

function StatCard({
  title,
  value,
  icon,
  textColor,
  bgColor,
  borderColor,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  textColor: string;
  bgColor: string;
  borderColor: string;
}) {
  return (
    <div
      className={`flex items-center gap-4 p-5 rounded-2xl border-2 ${bgColor} ${borderColor}`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgColor} border ${borderColor}`}>
        {icon}
      </div>
      <div>
        <div className="text-sm text-slate-500 mb-1">{title}</div>
        <div className={`text-3xl font-bold ${textColor}`}>{value}</div>
      </div>
    </div>
  );
}

export default function BatchCompare() {
  const { drug, risk } = useOutletContext<ContextType>();
  const navigate = useNavigate();
  const batchNumber = drug.batchNumber;

  const compareList = useMemo(
    () => getBatchCompareList(batchNumber),
    [batchNumber]
  );

  const recallInfo = useMemo(
    () => getRecallInfo(batchNumber) as RecallInfo | undefined,
    [batchNumber]
  );

  const stats = useMemo(() => {
    let recalled = 0;
    let expired = 0;
    let normal = 0;

    compareList.forEach((item) => {
      if (item.isRecalled) {
        recalled++;
      } else if (item.isExpired) {
        expired++;
      } else {
        normal++;
      }
    });

    return { recalled, expired, normal, total: compareList.length };
  }, [compareList]);

  const hasRecalled = stats.recalled > 0;
  const hasExpired = stats.expired > 0;
  const allNormal = !hasRecalled && !hasExpired;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <GitCompare className="w-7 h-7 text-sky-500" />
              <h2 className="text-2xl font-bold text-slate-800">
                批次【{batchNumber}】流向查询比对
              </h2>
            </div>
            <p className="text-slate-500 ml-10">
              共 <span className="font-semibold text-sky-600">{stats.total}</span> 盒同批次药品查询记录
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="召回盒数"
          value={stats.recalled}
          icon={<ShieldAlert className="w-6 h-6 text-red-600" />}
          textColor="text-red-600"
          bgColor="bg-red-50"
          borderColor="border-red-200"
        />
        <StatCard
          title="过期盒数"
          value={stats.expired}
          icon={<Calendar className="w-6 h-6 text-amber-600" />}
          textColor="text-amber-600"
          bgColor="bg-amber-50"
          borderColor="border-amber-200"
        />
        <StatCard
          title="正常盒数"
          value={stats.normal}
          icon={<ShieldCheck className="w-6 h-6 text-emerald-600" />}
          textColor="text-emerald-600"
          bgColor="bg-emerald-50"
          borderColor="border-emerald-200"
        />
      </div>

      {hasRecalled && recallInfo && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-7 h-7 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-red-700 mb-3">
                ⚠️ 产品召回警告【{recallInfo.recallLevel}召回】
              </h3>
              <div className="space-y-2 text-red-800">
                <p className="font-medium">
                  <span className="text-red-600">召回原因：</span>
                  {recallInfo.recallReason}
                </p>
                <p>
                  <span className="text-red-600">召回日期：</span>
                  {recallInfo.recallDate}
                </p>
                <p>
                  <span className="text-red-600">召回范围：</span>
                  {recallInfo.recallScope}
                </p>
              </div>
              <a
                href={`tel:${recallInfo.contactPhone}`}
                className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium shadow-md"
              >
                <Phone className="w-4 h-4" />
                联系召回：{recallInfo.contactPhone}
              </a>
            </div>
          </div>
        </div>
      )}

      {hasExpired && !hasRecalled && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Calendar className="w-7 h-7 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-amber-700 mb-2">
                ⚠️ 过期药品提示
              </h3>
              <p className="text-amber-800">
                本批次共有 <span className="font-bold text-amber-700">{stats.expired}</span> 盒已过期，
                请留意存放条件和周转速度。过期药品严禁服用，建议及时清理并联系当地药监部门回收处理。
              </p>
            </div>
          </div>
        </div>
      )}

      {allNormal && (
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-emerald-700 mb-2">
                ✅ 批次状态安全
              </h3>
              <p className="text-emerald-800">
                本批次目前已查询记录均正常，未见召回或批量过期风险。
                请继续按照说明书要求的贮藏条件保存药品，确保用药安全。
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <Package className="w-5 h-5 text-sky-500" />
          <h3 className="text-lg font-semibold text-slate-700">同批次查询记录明细</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 whitespace-nowrap">
                  追溯码
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 whitespace-nowrap">
                  查询地点
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 whitespace-nowrap">
                  查询时间
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 whitespace-nowrap">
                  有效期状态
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 whitespace-nowrap">
                  召回状态
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600 whitespace-nowrap">
                  状态标签
                </th>
              </tr>
            </thead>
            <tbody>
              {compareList.map((item, idx) => {
                const expiryStatus = getExpiryStatus(item);
                const recallStatus = getRecallStatus(item);
                const isAbnormal = item.isExpired || item.isRecalled;
                const isRecallAbnormal = item.isRecalled;

                return (
                  <tr
                    key={idx}
                    className={`border-b border-slate-100 last:border-0 transition-colors ${
                      isRecallAbnormal
                        ? 'bg-red-50/70'
                        : item.isExpired
                        ? 'bg-orange-50/70'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-sm text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                          {maskTraceCode(item.traceCode)}
                        </code>
                        {item.isCurrentQuery && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-xs font-medium">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            当前查询
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 whitespace-nowrap">
                      {item.queryLocation}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {item.queryTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${expiryStatus.bgClass} ${expiryStatus.className}`}
                      >
                        {expiryStatus.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${recallStatus.bgClass} ${recallStatus.className}`}
                      >
                        {recallStatus.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isAbnormal ? (
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium ${
                            isRecallAbnormal
                              ? 'bg-red-100 text-red-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          <AlertTriangle className="w-4 h-4" />
                          {isRecallAbnormal ? '需召回' : '异常'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="w-4 h-4" />
                          正常
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
