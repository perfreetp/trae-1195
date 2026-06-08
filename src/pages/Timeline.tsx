import { useOutletContext } from 'react-router-dom';
import { Factory, FileCheck, Warehouse, Truck, Thermometer, Store, Building2 } from 'lucide-react';
import type { DrugTraceInfo, RiskResult, FlowNode } from '@/types';
import { useQueryStore } from '@/store';

type ContextType = { drug: DrugTraceInfo; risk: RiskResult | null };

const nodeTypeConfig: Record<FlowNode['nodeType'], { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  production: {
    label: '生产',
    icon: <Factory className="w-5 h-5" />,
    color: 'text-sky-600',
    bg: 'bg-sky-500',
  },
  inspection: {
    label: '质检',
    icon: <FileCheck className="w-5 h-5" />,
    color: 'text-emerald-600',
    bg: 'bg-emerald-500',
  },
  warehouse: {
    label: '仓储',
    icon: <Warehouse className="w-5 h-5" />,
    color: 'text-indigo-600',
    bg: 'bg-indigo-500',
  },
  wholesale: {
    label: '批发',
    icon: <Building2 className="w-5 h-5" />,
    color: 'text-purple-600',
    bg: 'bg-purple-500',
  },
  transport: {
    label: '运输',
    icon: <Truck className="w-5 h-5" />,
    color: 'text-amber-600',
    bg: 'bg-amber-500',
  },
  retail: {
    label: '零售',
    icon: <Store className="w-5 h-5" />,
    color: 'text-teal-600',
    bg: 'bg-teal-500',
  },
};

export default function TimelinePage() {
  const { drug } = useOutletContext<ContextType>();
  const nodes = useQueryStore((s) => s.currentNodes);

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
        <h2 className="text-lg font-semibold text-slate-700 mb-2">流通流向时间轴</h2>
        <p className="text-sm text-slate-500">
          {drug.productName}（批次：{drug.batchNumber}）全流通环节追溯记录
        </p>
      </div>

      <div className="relative">
        <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gradient-to-b from-sky-400 via-emerald-400 to-teal-400"></div>

        <div className="space-y-8">
          {nodes.map((node, index) => {
            const config = nodeTypeConfig[node.nodeType];
            return (
              <div key={node.id} className="relative pl-20">
                <div
                  className={`absolute left-0 w-14 h-14 rounded-full ${config.bg} text-white flex items-center justify-center shadow-lg ring-4 ring-white`}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  {config.icon}
                </div>

                <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium bg-slate-100 ${config.color}`}>
                        {config.label}
                      </span>
                      <h3 className="font-semibold text-slate-700">{node.nodeName}</h3>
                    </div>
                    <div className="text-sm text-slate-500">{node.timestamp}</div>
                  </div>

                  <div className="p-6">
                    <p className="text-slate-600 mb-4">{node.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <div className="text-slate-400 mb-1">操作方</div>
                        <div className="font-medium text-slate-700">{node.operator}</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <div className="text-slate-400 mb-1">地点</div>
                        <div className="font-medium text-slate-700">{node.location}</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <div className="text-slate-400 mb-1">状态</div>
                        <div className="font-medium flex items-center gap-1">
                          {node.status === 'completed' && (
                            <span className="text-emerald-600">✓ 已完成</span>
                          )}
                          {node.status === 'in_progress' && (
                            <span className="text-amber-600">● 进行中</span>
                          )}
                          {node.status === 'pending' && (
                            <span className="text-slate-500">○ 待处理</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {(node.temperature !== undefined || node.humidity !== undefined || node.transportNo || node.receiver) && (
                      <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {node.temperature !== undefined && (
                          <div className="flex items-center gap-2 p-2 bg-sky-50 rounded-lg">
                            <Thermometer className="w-4 h-4 text-sky-500" />
                            <div>
                              <div className="text-xs text-slate-400">温度</div>
                              <div className="font-medium text-slate-700">{node.temperature}℃</div>
                            </div>
                          </div>
                        )}
                        {node.humidity !== undefined && (
                          <div className="p-2 bg-teal-50 rounded-lg">
                            <div className="text-xs text-slate-400">湿度</div>
                            <div className="font-medium text-slate-700">{node.humidity}%</div>
                          </div>
                        )}
                        {node.transportNo && (
                          <div className="p-2 bg-indigo-50 rounded-lg">
                            <div className="text-xs text-slate-400">运输单号</div>
                            <div className="font-medium text-slate-700 font-mono">{node.transportNo}</div>
                          </div>
                        )}
                        {node.receiver && (
                          <div className="p-2 bg-purple-50 rounded-lg">
                            <div className="text-xs text-slate-400">签收人</div>
                            <div className="font-medium text-slate-700">{node.receiver}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
