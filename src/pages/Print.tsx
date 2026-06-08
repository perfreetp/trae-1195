import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, QrCode, ShieldCheck, Clock, ArrowRight, Factory, ClipboardCheck, Warehouse, Truck, Store, Search } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useQueryStore } from '@/store';
import type { FlowNode } from '@/types';

export default function PrintPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const queryDrug = useQueryStore((s) => s.queryDrug);
  const loading = useQueryStore((s) => s.loading);
  const drug = useQueryStore((s) => s.currentDrug);
  const risk = useQueryStore((s) => s.currentRisk);
  const flowNodes = useQueryStore((s) => s.currentNodes);
  const [printTime] = useState(new Date().toLocaleString('zh-CN'));

  useEffect(() => {
    if (code) {
      queryDrug(code, 'print_page');
    }
  }, [code]);

  // 稳定凭证编号：基于traceCode + lastQueryTime 做哈希生成，保证同码同时段一致
  const certificateId = useMemo(() => {
    const base = `${drug?.traceCode || code}-${risk?.lastQueryTime || 'new'}`;
    let hash = 0;
    for (let i = 0; i < base.length; i++) {
      hash = (hash * 31 + base.charCodeAt(i)) & 0xffffffff;
    }
    const stablePart = Math.abs(hash).toString(36).padStart(8, '0').toUpperCase().slice(0, 8);
    const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    return `DT-${datePart}-${stablePart}`;
  }, [drug?.traceCode, risk?.lastQueryTime, code]);

  const verifyUrl = `${window.location.origin}/#/drug/${drug?.traceCode || code}`;

  // 风险项清单（复用 Risk 页逻辑）
  const riskItems: Array<{
    label: string;
    level: 'safe' | 'warn' | 'danger';
    detail: string;
  }> = useMemo(() => {
    const items: Array<{ label: string; level: 'safe' | 'warn' | 'danger'; detail: string }> = [];
    const qc = risk?.queryCount ?? 0;
    if (risk?.isRecalled && risk.recallInfo) {
      items.push({
        label: '⚠️ 产品召回',
        level: 'danger',
        detail: `${risk.recallInfo.recallLevel} · 批次 ${risk.recallInfo.batchNumber || '不详'} · ${risk.recallInfo.recallDate || '近期'}`,
      });
    }
    if (risk?.isExpired) {
      const daysToExpiry = Math.max(
        1,
        Math.abs(Math.ceil((new Date(drug.expiryDate).getTime() - Date.now()) / 86400000))
      );
      items.push({
        label: '🚨 已过期',
        level: 'danger',
        detail: `有效期至 ${drug.expiryDate}，已过期约 ${daysToExpiry} 天`,
      });
    }
    if (qc >= 6) {
      items.push({
        label: '🚨 频繁查询',
        level: 'danger',
        detail: `累计查询 ${qc} 次，同批次平均约 2 次，异常偏高`,
      });
    }
    if (risk?.isNearExpiry && !risk?.isExpired) {
      const daysLeft = Math.max(
        0,
        Math.ceil((new Date(drug.expiryDate).getTime() - Date.now()) / 86400000)
      );
      items.push({
        label: '▲ 临近效期',
        level: 'warn',
        detail: `剩余约 ${daysLeft} 天（＜ 30 天），建议尽快使用`,
      });
    }
    if (qc >= 4 && qc < 6) {
      items.push({
        label: '▲ 重复查询',
        level: 'warn',
        detail: `累计查询 ${qc} 次，略高于平均水平，建议核对包装`,
      });
    }
    if (!risk?.isAuthentic) {
      items.push({
        label: '🚨 真伪异常',
        level: 'danger',
        detail: `未在 ${risk?.authenticitySource || '追溯平台'} 查询到正品登记`,
      });
    }
    if (items.length === 0) {
      items.push({
        label: '✅ 核验通过',
        level: 'safe',
        detail: '真伪、效期、召回、查询频次全部正常，药品来源合法可放心使用',
      });
    }
    return items;
  }, [risk, drug]);

  const handlePrint = () => {
    window.print();
  };

  if (loading || !drug) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">加载凭证数据中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6 print:hidden">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow hover:shadow-md transition-all text-slate-600"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all font-medium"
          >
            <Printer className="w-5 h-5" />
            打印凭证
          </button>
        </div>

        <div
          className="bg-white shadow-2xl rounded-sm p-12 print:shadow-none print:p-8"
          style={{ width: '210mm', minHeight: '297mm', margin: '0 auto' }}
        >
          <div className="border-4 border-double border-slate-800 p-8">
            <div className="text-center border-b-2 border-slate-800 pb-6 mb-8">
              <div className="flex items-center justify-center gap-3 mb-3">
                <ShieldCheck className="w-10 h-10 text-sky-600" />
                <h1 className="text-3xl font-bold text-slate-800 tracking-wider">
                  药品追溯查询凭证
                </h1>
              </div>
              <p className="text-slate-600">Drug Traceability Verification Certificate</p>
              <div className="mt-5 grid grid-cols-2 md:grid-cols-5 gap-4 text-xs text-slate-600 border border-slate-200 rounded-xl p-3 bg-slate-50">
                <div>
                  <div className="text-slate-400 mb-1">凭证编号</div>
                  <div className="font-mono font-semibold text-slate-800">{certificateId}</div>
                </div>
                <div>
                  <div className="text-slate-400 mb-1">首次查询时间</div>
                  <div className="font-medium text-slate-700">{risk?.firstQueryTime || '-'}</div>
                </div>
                <div>
                  <div className="text-slate-400 mb-1">最近追溯查询</div>
                  <div className="font-medium text-slate-700">{risk?.lastQueryTime || '-'}</div>
                </div>
                <div>
                  <div className="text-slate-400 mb-1">本次查询时间</div>
                  <div className="font-medium text-slate-700">{risk?.lastQueryTime || printTime}</div>
                </div>
                <div>
                  <div className="text-slate-400 mb-1">凭证生成时间</div>
                  <div className="font-medium text-slate-700">{printTime}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8 mb-8">
              <div className="col-span-2 space-y-5">
                <div>
                  <div className="text-sm text-slate-500 mb-1">药品名称</div>
                  <div className="text-2xl font-bold text-slate-800">
                    {drug.productName}
                    <span className="ml-2 text-base font-normal text-slate-500">
                      （{drug.brandName}）
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-slate-400">追溯码</span>
                    <code className="font-mono font-semibold bg-slate-100 rounded-md px-2 py-1 text-slate-700 tracking-wider">
                      {drug.traceCode}
                    </code>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  {[
                    ['规格', drug.specification],
                    ['剂型', drug.dosageForm],
                    ['批号', drug.batchNumber],
                    ['生产日期', drug.productionDate],
                    ['有效期至', drug.expiryDate],
                    ['批准文号', drug.approvalNumber],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="text-xs text-slate-500 mb-0.5">{label}</div>
                      <div className="font-semibold text-slate-800">{value}</div>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="text-xs text-slate-500 mb-0.5">生产企业</div>
                  <div className="font-semibold text-slate-800">{drug.manufacturer}</div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <div className="bg-white p-4 rounded-xl shadow-md border border-slate-100">
                  <QRCodeSVG
                    value={verifyUrl}
                    size={132}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <div className="mt-4 text-center w-full">
                  <div className="text-xs text-slate-500 mb-1.5">扫码或点击链接复核凭证</div>
                  <a
                    href={verifyUrl}
                    className="text-sky-600 hover:text-sky-700 hover:underline text-[11px] font-mono break-all leading-snug block"
                  >
                    {verifyUrl}
                  </a>
                  <div className="mt-2.5 text-xs text-slate-400">
                    复核码：<span className="font-mono font-semibold text-slate-600">{certificateId}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-slate-200 pt-6 mb-8">
              <h3 className="text-lg font-bold text-slate-800 mb-4">核验结果</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className={`p-4 rounded-xl ${risk?.isAuthentic ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="text-xs text-slate-500 mb-1">真伪验证</div>
                  <div className={`font-bold ${risk?.isAuthentic ? 'text-emerald-700' : 'text-red-700'}`}>
                    {risk?.isAuthentic ? '✓ 正品' : '✗ 异常'}
                  </div>
                </div>
                <div className={`p-4 rounded-xl ${!risk?.isExpired ? (risk?.isNearExpiry ? 'bg-amber-50 border border-amber-200' : 'bg-emerald-50 border border-emerald-200') : 'bg-red-50 border border-red-200'}`}>
                  <div className="text-xs text-slate-500 mb-1">有效期状态</div>
                  <div className={`font-bold ${!risk?.isExpired ? (risk?.isNearExpiry ? 'text-amber-700' : 'text-emerald-700') : 'text-red-700'}`}>
                    {risk?.isExpired ? '✗ 已过期' : risk?.isNearExpiry ? '▲ 临近效期' : '✓ 在有效期'}
                  </div>
                </div>
                <div className={`p-4 rounded-xl ${!risk?.isRecalled ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="text-xs text-slate-500 mb-1">召回状态</div>
                  <div className={`font-bold ${!risk?.isRecalled ? 'text-emerald-700' : 'text-red-700'}`}>
                    {!risk?.isRecalled ? '✓ 正常' : '✗ 已召回'}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-sky-50 border border-sky-200">
                  <div className="text-xs text-slate-500 mb-1">累计查询次数</div>
                  <div className="font-bold text-sky-700">{risk?.queryCount ?? 0} 次</div>
                </div>
                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
                  <div className="text-xs text-slate-500 mb-1">首次查询时间</div>
                  <div className="font-bold text-indigo-700 text-sm">{risk?.firstQueryTime || '-'}</div>
                </div>
                <div className="p-4 rounded-xl bg-violet-50 border border-violet-200">
                  <div className="text-xs text-slate-500 mb-1">最近查询时间</div>
                  <div className="font-bold text-violet-700 text-sm">{risk?.lastQueryTime || '-'}</div>
                </div>
                <div className={`p-4 rounded-xl md:col-span-1 ${
                  risk?.level === 'danger' ? 'bg-red-50 border border-red-200' :
                  risk?.level === 'warning' ? 'bg-amber-50 border border-amber-200' :
                  'bg-emerald-50 border border-emerald-200'
                }`}>
                  <div className="text-xs text-slate-500 mb-1">风险综合结论</div>
                  <div className={`font-bold ${
                    risk?.level === 'danger' ? 'text-red-700' :
                    risk?.level === 'warning' ? 'text-amber-700' :
                    'text-emerald-700'
                  }`}>
                    {risk?.level === 'danger' ? '⚠ 存在风险' :
                     risk?.level === 'warning' ? '▲ 注意提示' :
                     '✓ 综合安全'}
                  </div>
                </div>
              </div>

              {/* 风险项清单：纸质版可见具体原因 */}
              <div className="mt-5 border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
                  <span className="text-sm font-bold text-slate-700">风险项清单</span>
                  <span className="text-xs text-slate-500 ml-2">共 {riskItems.length} 项，纸质凭证留档请核对</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {riskItems.map((item, idx) => (
                    <div key={`${item.label}-${idx}`} className="flex items-start gap-3 px-4 py-3">
                      <div
                        className={`shrink-0 px-2 py-0.5 rounded-md text-xs font-bold ${
                          item.level === 'danger'
                            ? 'bg-red-100 text-red-700'
                            : item.level === 'warn'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {item.level === 'danger' ? '风险' : item.level === 'warn' ? '提示' : '正常'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-800 text-sm">{item.label}</div>
                        <div className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {(risk?.level !== 'safe') && (
                <div className={`mt-5 p-4 rounded-xl border-2 ${
                  risk?.level === 'danger' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                }`}>
                  <div className={`font-bold mb-2 text-sm ${
                    risk?.level === 'danger' ? 'text-red-700' : 'text-amber-700'
                  }`}>
                    综合说明
                  </div>
                  <div className="text-sm leading-relaxed text-slate-700 space-y-1">
                    {risk?.isRecalled && (
                      <div>• 该批次药品已启动召回，请立即停止使用并联系购买药店</div>
                    )}
                    {risk?.isExpired && (
                      <div>• 该药品已超过有效期，请勿服用</div>
                    )}
                    {(risk?.queryCount ?? 0) >= 6 && (
                      <div>• 该追溯码累计查询 {risk?.queryCount} 次，明显偏高（同批次平均约 2 次），警惕可能为回收包装重复利用或伪造追溯码</div>
                    )}
                    {risk?.isNearExpiry && !risk?.isExpired && (
                      <div>• 该药品临近效期（不足 30 天），请尽快使用</div>
                    )}
                    {(risk?.queryCount ?? 0) >= 4 && (risk?.queryCount ?? 0) < 6 && !risk?.isNearExpiry && !risk?.isRecalled && !risk?.isExpired && (
                      <div>• 该追溯码累计查询 {risk?.queryCount} 次，略高于平均水平，建议谨慎购买</div>
                    )}
                    {!risk?.isAuthentic && (
                      <div>• 真伪验证未通过，请勿服用并联系购买渠道处理</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {(flowNodes && flowNodes.length > 0) && (
              <div className="border-t-2 border-slate-200 pt-6 mb-8">
                <h3 className="text-lg font-bold text-slate-800 mb-4">流向摘要</h3>
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    {flowNodes.map((node: FlowNode, idx: number) => {
                      const iconByStage: Record<string, React.ReactNode> = {
                        production: <Factory className="w-4 h-4" />,
                        inspection: <ClipboardCheck className="w-4 h-4" />,
                        warehouse: <Warehouse className="w-4 h-4" />,
                        wholesale: <Warehouse className="w-4 h-4" />,
                        transport: <Truck className="w-4 h-4" />,
                        retail: <Store className="w-4 h-4" />,
                      };
                      const icon = iconByStage[node.nodeType] || <Store className="w-4 h-4" />;
                      return (
                        <div key={node.id} className="flex items-center gap-2">
                          <div className="bg-white rounded-lg px-3 py-2 border border-slate-200 shadow-sm min-w-[88px] text-center">
                            <div className="flex items-center justify-center gap-1 text-sky-600 mb-0.5">
                              {icon}
                              <span className="text-[11px] font-semibold text-slate-700">{node.nodeName}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 leading-tight">{node.timestamp}</div>
                          </div>
                          {idx < flowNodes.length - 1 && (
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden md:block" />
                          )}
                          {idx < flowNodes.length - 1 && (
                            <ArrowRight className="w-3 h-3 text-slate-400 shrink-0 md:hidden" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 text-[11px] text-slate-500 leading-relaxed">
                    追溯链路：{flowNodes.map(n => n.nodeName).join(' → ')}
                  </div>
                </div>
              </div>
            )}

            <div className="border-t-2 border-slate-200 pt-6 mb-8">
              <h3 className="text-lg font-bold text-slate-800 mb-4">检验信息</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">检验报告书编号</div>
                  <div className="font-semibold text-slate-800 font-mono">{drug.inspectionReportNo}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">检验结论</div>
                  <div className={`font-bold ${drug.inspectionConclusion === '合格' ? 'text-emerald-700' : 'text-red-700'}`}>
                    {drug.inspectionConclusion === '合格' ? '✓ ' : '⚠ '}
                    {drug.inspectionConclusion}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">检验日期</div>
                  <div className="font-semibold text-slate-800">{drug.inspectionDate}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-0.5">GMP证书号</div>
                  <div className="font-semibold text-slate-800 font-mono text-xs">{drug.gmpCertificate}</div>
                </div>
              </div>
            </div>

            <div className="flex items-end justify-between mt-12 pt-8 border-t-2 border-slate-200">
              <div className="text-sm text-slate-600 space-y-1">
                <p>验证来源：{risk?.authenticitySource || '国家药品追溯平台'}</p>
                <p>本凭证仅供查询参考，不构成任何购销凭证</p>
              </div>
              <div className="text-right">
                <div className="relative w-32 h-32">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-500/70 flex items-center justify-center rotate-[-12deg]">
                    <div className="text-center">
                      <div className="text-emerald-600 font-bold text-sm">药品追溯专用章</div>
                      <div className="text-emerald-500 text-[10px] mt-1">VERIFIED</div>
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-emerald-500/10" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            <p>
              验证码：{drug.traceCode} · 请妥善保存本凭证以备查验 ·{' '}
              <a href={verifyUrl} className="text-sky-500 hover:underline">
                在线验证
              </a>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            background: white !important;
          }
          .print\\\\:hidden {
            display: none !important;
          }
          .print\\\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\\\:p-8 {
            padding: 32px !important;
          }
        }
      `}</style>
    </div>
  );
}
