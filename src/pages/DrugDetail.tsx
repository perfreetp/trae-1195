import { useOutletContext } from 'react-router-dom';
import { Pill, CalendarDays, Factory, FileCheck, Award, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { DrugTraceInfo, RiskResult } from '@/types';

type ContextType = { drug: DrugTraceInfo; risk: RiskResult | null };

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex gap-4 py-3 border-b border-slate-100 last:border-0">
      <div className="text-slate-400 w-32 shrink-0 flex items-center gap-2">
        {icon}
        {label}
      </div>
      <div className="text-slate-700 font-medium">{value}</div>
    </div>
  );
}

export default function DrugDetail() {
  const { drug, risk } = useOutletContext<ContextType>();

  const infoGroups = [
    {
      title: '基本信息',
      icon: <Pill className="w-5 h-5 text-sky-500" />,
      items: [
        { label: '通用名', value: drug.productName },
        { label: '商品名', value: drug.brandName },
        { label: '规格', value: drug.specification },
        { label: '剂型', value: drug.dosageForm },
        { label: '成份', value: drug.ingredients },
      ],
    },
    {
      title: '生产信息',
      icon: <Factory className="w-5 h-5 text-teal-500" />,
      items: [
        { label: '生产企业', value: drug.manufacturer },
        { label: '生产许可证号', value: drug.manufacturerLicense },
        { label: '批准文号', value: drug.approvalNumber },
        { label: 'GMP证书号', value: drug.gmpCertificate },
      ],
    },
    {
      title: '质量信息',
      icon: <FileCheck className="w-5 h-5 text-amber-500" />,
      items: [
        { label: '批号', value: drug.batchNumber },
        { label: '检验报告书编号', value: drug.inspectionReportNo },
        {
          label: '检验结论',
          value: drug.inspectionConclusion,
          highlight: drug.inspectionConclusion,
        },
        { label: '检验日期', value: drug.inspectionDate },
      ],
    },
    {
      title: '效期信息',
      icon: <CalendarDays className="w-5 h-5 text-rose-500" />,
      items: [
        { label: '生产日期', value: drug.productionDate },
        { label: '有效期至', value: drug.expiryDate, warning: risk?.isExpired },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        {infoGroups.map((group) => (
          <div
            key={group.title}
            className="bg-white rounded-2xl shadow-md p-6 border border-slate-100"
          >
            <div className="flex items-center gap-3 pb-4 mb-2 border-b border-slate-100">
              {group.icon}
              <h2 className="text-lg font-semibold text-slate-700">{group.title}</h2>
            </div>
            <div>
              {group.items.map((item) => (
                <div key={item.label} className="flex gap-4 py-3 border-b border-slate-100 last:border-0">
                  <div className="text-slate-400 w-36 shrink-0">{item.label}</div>
                  <div
                    className={`font-medium flex items-center gap-2 ${
                      item.warning
                        ? 'text-red-600'
                        : (item.highlight === '合格' ? 'text-emerald-600' : 'text-slate-700')
                    }`}
                  >
                    {item.highlight === '合格' && <CheckCircle2 className="w-4 h-4" />}
                    {item.highlight && item.highlight !== '合格' && <AlertCircle className="w-4 h-4" />}
                    {item.warning && <AlertCircle className="w-4 h-4" />}
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-100">
          <img
            src={drug.drugImage}
            alt={drug.productName}
            className="w-full h-56 object-cover bg-slate-100"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjFmNWY5Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5NGEzYjAiIGZvbnQtc2l6ZT0iMTYiPui/meWtpuWbvuW8oOW8gVzwvdGV4dD48L3N2Zz4=';
            }}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
            <Award className="w-5 h-5 text-sky-500" />
            <h2 className="text-lg font-semibold text-slate-700">状态标识</h2>
          </div>
          <div className="space-y-3">
            <div className={`flex items-center justify-between p-3 rounded-xl ${
              risk?.isAuthentic ? 'bg-emerald-50' : 'bg-red-50'
            }`}>
              <span className="text-slate-600">真伪验证</span>
              <span className={`font-medium flex items-center gap-1 ${
                risk?.isAuthentic ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {risk?.isAuthentic ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {risk?.isAuthentic ? '正品' : '异常'}
              </span>
            </div>
            <div className={`flex items-center justify-between p-3 rounded-xl ${
              risk?.isExpired ? 'bg-red-50' : 'bg-slate-50'
            }`}>
              <span className="text-slate-600">有效期状态</span>
              <span className={`font-medium flex items-center gap-1 ${
                risk?.isExpired ? 'text-red-600' : 'text-emerald-600'
              }`}>
                {risk?.isExpired ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                {risk?.isExpired ? '已过期' : '在有效期'}
              </span>
            </div>
            <div className={`flex items-center justify-between p-3 rounded-xl ${
              risk?.isRecalled ? 'bg-red-50' : 'bg-slate-50'
            }`}>
              <span className="text-slate-600">召回状态</span>
              <span className={`font-medium flex items-center gap-1 ${
                risk?.isRecalled ? 'text-red-600' : 'text-emerald-600'
              }`}>
                {risk?.isRecalled ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                {risk?.isRecalled ? '已召回' : '正常'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
