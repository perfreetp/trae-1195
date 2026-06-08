import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, QrCode, ShieldCheck, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useQueryStore } from '@/store';

export default function PrintPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const queryDrug = useQueryStore((s) => s.queryDrug);
  const loading = useQueryStore((s) => s.loading);
  const drug = useQueryStore((s) => s.currentDrug);
  const risk = useQueryStore((s) => s.currentRisk);
  const [printTime] = useState(new Date().toLocaleString('zh-CN'));

  useEffect(() => {
    if (code) {
      queryDrug(code);
    }
  }, [code]);

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

  const verifyUrl = `${window.location.origin}/#/drug/${drug.traceCode}`;

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
              <div className="mt-4 flex justify-center gap-8 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  查询时间：{printTime}
                </span>
                <span>凭证编号：{Date.now().toString().slice(-10)}</span>
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

              <div className="flex flex-col items-center justify-center bg-slate-50 rounded-2xl p-6">
                <div className="bg-white p-4 rounded-xl shadow-md">
                  <QRCodeSVG
                    value={verifyUrl}
                    size={140}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <div className="mt-4 text-center">
                  <div className="text-xs text-slate-500 mb-1">扫码再次验证</div>
                  <div className="font-mono text-xs text-slate-600 break-all text-left">
                    {drug.traceCode}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-slate-200 pt-6 mb-8">
              <h3 className="text-lg font-bold text-slate-800 mb-4">核验结果</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-xl ${risk?.isAuthentic ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="text-xs text-slate-500 mb-1">真伪验证</div>
                  <div className={`font-bold ${risk?.isAuthentic ? 'text-emerald-700' : 'text-red-700'}`}>
                    {risk?.isAuthentic ? '✓ 正品' : '✗ 异常'}
                  </div>
                </div>
                <div className={`p-4 rounded-xl ${!risk?.isExpired ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="text-xs text-slate-500 mb-1">有效期状态</div>
                  <div className={`font-bold ${!risk?.isExpired ? 'text-emerald-700' : 'text-red-700'}`}>
                    {!risk?.isExpired ? '✓ 在有效期' : '✗ 已过期'}
                  </div>
                </div>
                <div className={`p-4 rounded-xl ${!risk?.isRecalled ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="text-xs text-slate-500 mb-1">召回状态</div>
                  <div className={`font-bold ${!risk?.isRecalled ? 'text-emerald-700' : 'text-red-700'}`}>
                    {!risk?.isRecalled ? '✓ 正常' : '✗ 已召回'}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-sky-50 border border-sky-200">
                  <div className="text-xs text-slate-500 mb-1">累计查询</div>
                  <div className="font-bold text-sky-700">{risk?.queryCount ?? 0} 次</div>
                </div>
              </div>
            </div>

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
