import { useOutletContext } from 'react-router-dom';
import { AlertTriangle, Pill, AlertOctagon, Heart, ShieldAlert, Users, Package } from 'lucide-react';
import type { DrugTraceInfo, RiskResult, MedicationGuide } from '@/types';
import { useQueryStore } from '@/store';

type ContextType = { drug: DrugTraceInfo; risk: RiskResult | null };

const severityStyle = {
  normal: 'bg-sky-50 border-sky-200 text-sky-700',
  warning: 'bg-amber-50 border-amber-200 text-amber-700',
  danger: 'bg-red-50 border-red-200 text-red-700',
};

const groupIcon: Record<string, React.ReactNode> = {
  '孕妇': <span>🤰</span>,
  '哺乳期': <span>👩‍🍼</span>,
  '儿童': <span>👶</span>,
  '老人': <span>👴</span>,
  '肝肾功能不全': <ShieldAlert className="w-5 h-5" />,
};

export default function GuidePage() {
  const { drug } = useOutletContext<ContextType>();
  const guide = useQueryStore((s) => s.currentGuide) as MedicationGuide | null;

  if (!guide) return null;

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-sky-500 to-teal-500 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm">
            <Pill className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">{drug.productName} - 用药安全提示</h1>
            <p className="opacity-90">
              {drug.specification} · {drug.dosageForm} · 请仔细阅读说明书并在医师指导下使用
            </p>
          </div>
        </div>
      </div>

      {(guide.contraindications.length > 0 || guide.adverseReactions.length > 0) && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertOctagon className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-red-700">⚠️ 安全警示</h3>
          </div>

          {guide.contraindications.length > 0 && (
            <div className="mb-5">
              <h4 className="font-semibold text-red-700 mb-3">禁忌人群（禁用）</h4>
              <ul className="space-y-2">
                {guide.contraindications.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-red-100">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-red-800">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {guide.adverseReactions.length > 0 && (
            <div>
              <h4 className="font-semibold text-red-700 mb-3">可能的不良反应</h4>
              <ul className="space-y-2">
                {guide.adverseReactions.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-red-100">
                    <Heart className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <span className="text-red-800/90">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center">
              <Pill className="w-5 h-5 text-sky-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">适应症</h3>
          </div>
          <p className="text-slate-600 leading-relaxed">{guide.indications}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">用法用量</h3>
          </div>
          <p className="text-slate-600 leading-relaxed">{guide.usageDosage}</p>
        </div>
      </div>

      {guide.precautions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">特殊人群注意事项</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guide.precautions.map((item, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-xl border-2 ${severityStyle[item.severity]}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center text-lg">
                    {groupIcon[item.group] || <Users className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-semibold">{item.group}</h4>
                    <div className="text-xs opacity-75">
                      {item.severity === 'danger' && '⚠️ 严重警告'}
                      {item.severity === 'warning' && '⚠️ 注意'}
                      {item.severity === 'normal' && '提示'}
                    </div>
                  </div>
                </div>
                <p className="text-sm leading-relaxed opacity-95">{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {guide.interactions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">药物相互作用</h3>
          </div>
          <ul className="space-y-3">
            {guide.interactions.map((item, idx) => (
              <li
                key={idx}
                className="p-4 bg-purple-50/60 rounded-xl text-purple-800 border border-purple-100"
              >
                <span className="font-semibold mr-2">{idx + 1}.</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
            <Package className="w-5 h-5 text-teal-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700">贮藏方法</h3>
        </div>
        <p className="text-slate-600 leading-relaxed text-lg">{guide.storage}</p>
      </div>

      <div className="text-center p-6 text-sm text-slate-400">
        💡 以上内容仅供参考，如有疑问请咨询医师或药师
      </div>
    </div>
  );
}
