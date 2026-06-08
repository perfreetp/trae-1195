import React, { useState } from 'react';
import {
  Factory,
  Microscope,
  Warehouse,
  Truck,
  Store,
  Building2,
  ChevronDown,
  ChevronUp,
  MapPin,
  User,
  Clock,
  Thermometer,
  Droplets,
  Clipboard,
  Package,
  CheckCircle2,
  Loader2,
  Circle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FlowNode } from '@/types';

interface TimelineProps {
  /** 流通节点数据 */
  nodes: FlowNode[];
  /** 是否默认展开所有节点 */
  defaultExpandAll?: boolean;
  /** 附加样式类名 */
  className?: string;
}

interface TimelineNodeProps {
  node: FlowNode;
  index: number;
  total: number;
  isExpanded: boolean;
  onToggle: () => void;
}

/**
 * 单个时间轴节点组件
 */
const TimelineNode: React.FC<TimelineNodeProps> = ({
  node,
  index,
  total,
  isExpanded,
  onToggle,
}) => {
  // 节点类型配置
  const nodeTypeConfig: Record<
    FlowNode['nodeType'],
    {
      label: string;
      icon: React.ReactNode;
      color: string;
      bgGradient: string;
      ringColor: string;
    }
  > = {
    production: {
      label: '生产',
      icon: <Factory className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'text-purple-600',
      bgGradient: 'from-purple-500 to-indigo-500',
      ringColor: 'ring-purple-200',
    },
    inspection: {
      label: '质检',
      icon: <Microscope className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'text-cyan-600',
      bgGradient: 'from-cyan-500 to-blue-500',
      ringColor: 'ring-cyan-200',
    },
    warehouse: {
      label: '入库',
      icon: <Warehouse className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'text-blue-600',
      bgGradient: 'from-blue-500 to-sky-500',
      ringColor: 'ring-blue-200',
    },
    wholesale: {
      label: '批发',
      icon: <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'text-indigo-600',
      bgGradient: 'from-indigo-500 to-violet-500',
      ringColor: 'ring-indigo-200',
    },
    transport: {
      label: '运输',
      icon: <Truck className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'text-amber-600',
      bgGradient: 'from-amber-500 to-orange-500',
      ringColor: 'ring-amber-200',
    },
    retail: {
      label: '零售',
      icon: <Store className="w-5 h-5 sm:w-6 sm:h-6" />,
      color: 'text-emerald-600',
      bgGradient: 'from-emerald-500 to-teal-500',
      ringColor: 'ring-emerald-200',
    },
  };

  // 状态配置
  const statusConfig: Record<
    FlowNode['status'],
    {
      label: string;
      icon: React.ReactNode;
      textClass: string;
      bgClass: string;
    }
  > = {
    completed: {
      label: '已完成',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      textClass: 'text-emerald-700',
      bgClass: 'bg-emerald-100',
    },
    in_progress: {
      label: '进行中',
      icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
      textClass: 'text-blue-700',
      bgClass: 'bg-blue-100',
    },
    pending: {
      label: '待处理',
      icon: <Circle className="w-3.5 h-3.5" />,
      textClass: 'text-slate-600',
      bgClass: 'bg-slate-100',
    },
  };

  const typeCfg = nodeTypeConfig[node.nodeType];
  const statusCfg = statusConfig[node.status];
  const isLast = index === total - 1;

  return (
    <div className="relative flex gap-3 sm:gap-6">
      {/* 左侧：彩色竖线 + 节点图标 */}
      <div className="flex flex-col items-center shrink-0 w-10 sm:w-14">
        {/* 节点图标容器 */}
        <div
          className={cn(
            'relative z-10 flex items-center justify-center',
            'w-10 h-10 sm:w-14 sm:h-14 rounded-2xl',
            'bg-gradient-to-br shadow-lg',
            'ring-4 ring-opacity-60',
            typeCfg.bgGradient,
            typeCfg.ringColor,
            node.status !== 'completed' ? 'opacity-80' : ''
          )}
        >
          <span className="text-white drop-shadow-sm">
            {typeCfg.icon}
          </span>
        </div>

        {/* 竖线 */}
        {!isLast && (
          <div className="flex-1 w-1 mt-2 mb-2 relative overflow-hidden rounded-full">
            <div
              className={cn(
                'absolute inset-0 w-full',
                'bg-gradient-to-b',
                node.status === 'completed'
                  ? typeCfg.bgGradient
                  : 'from-slate-300 to-slate-200'
              )}
            />
          </div>
        )}
      </div>

      {/* 右侧：节点卡片内容 */}
      <div className="flex-1 pb-6 sm:pb-8">
        <div
          className={cn(
            'bg-white rounded-2xl border overflow-hidden',
            'shadow-sm hover:shadow-md transition-all duration-300',
            'border-slate-200/80',
            node.status !== 'completed' ? 'opacity-90' : ''
          )}
        >
          {/* 卡片头部 */}
          <button
            onClick={onToggle}
            className={cn(
              'w-full flex items-start justify-between gap-3 sm:gap-4',
              'px-4 sm:px-5 py-3 sm:py-4',
              'text-left hover:bg-slate-50/80 transition-colors duration-200'
            )}
          >
            <div className="flex-1 min-w-0">
              {/* 第一行：节点类型标签 + 状态 + 节点名 */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span
                  className={cn(
                    'inline-flex items-center px-2.5 py-1 rounded-lg text-xs sm:text-sm font-bold',
                    'bg-gradient-to-r text-white shadow-sm',
                    typeCfg.bgGradient
                  )}
                >
                  {typeCfg.label}
                </span>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded-full',
                    'text-xs font-medium',
                    statusCfg.bgClass,
                    statusCfg.textClass
                  )}
                >
                  {statusCfg.icon}
                  {statusCfg.label}
                </span>
              </div>

              {/* 节点名称 */}
              <h4 className="text-base sm:text-lg font-bold text-slate-800 mb-1">
                {node.nodeName}
              </h4>

              {/* 时间 + 地点 */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                  {node.timestamp}
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                  {node.location}
                </span>
              </div>
            </div>

            {/* 展开/收起图标 */}
            <div className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </div>
          </button>

          {/* 展开的详情内容 */}
          <div
            className={cn(
              'overflow-hidden transition-all duration-300 ease-out',
              isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
            )}
          >
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
              {/* 分隔线 */}
              <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-4" />

              {/* 描述 */}
              <div className="mb-4 p-3 sm:p-4 bg-gradient-to-br from-slate-50 to-slate-100/60 rounded-xl">
                <div className="flex items-start gap-2">
                  <Clipboard className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 mt-0.5 shrink-0" />
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                    {node.description}
                  </p>
                </div>
              </div>

              {/* 详细信息网格 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 操作人/企业 */}
                <div className="flex items-start gap-2 p-3 bg-blue-50/60 rounded-xl border border-blue-100/60">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-blue-600 mb-0.5">操作方</p>
                    <p className="text-sm text-slate-800 font-medium break-words">{node.operator}</p>
                  </div>
                </div>

                {/* 签收人（如果有） */}
                {node.receiver && (
                  <div className="flex items-start gap-2 p-3 bg-green-50/60 rounded-xl border border-green-100/60">
                    <Package className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-green-600 mb-0.5">签收人</p>
                      <p className="text-sm text-slate-800 font-medium break-words">{node.receiver}</p>
                    </div>
                  </div>
                )}

                {/* 运输单号（如果有） */}
                {node.transportNo && (
                  <div className="flex items-start gap-2 p-3 bg-amber-50/60 rounded-xl border border-amber-100/60">
                    <Clipboard className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-amber-600 mb-0.5">运输单号</p>
                      <p className="text-sm text-slate-800 font-mono break-words">{node.transportNo}</p>
                    </div>
                  </div>
                )}

                {/* 温度/湿度（如果有） */}
                {(node.temperature !== undefined || node.humidity !== undefined) && (
                  <div className="flex items-start gap-2 p-3 bg-cyan-50/60 rounded-xl border border-cyan-100/60">
                    <div className="flex flex-col gap-1 mt-0.5">
                      {node.temperature !== undefined && (
                        <Thermometer className="w-4 h-4 text-cyan-500 shrink-0" />
                      )}
                      {node.humidity !== undefined && (
                        <Droplets className="w-4 h-4 text-cyan-500 shrink-0" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-cyan-600 mb-0.5">环境监测</p>
                      <div className="space-y-0.5">
                        {node.temperature !== undefined && (
                          <p className="text-sm text-slate-800 font-medium">
                            温度：<span className="font-mono">{node.temperature}°C</span>
                          </p>
                        )}
                        {node.humidity !== undefined && (
                          <p className="text-sm text-slate-800 font-medium">
                            湿度：<span className="font-mono">{node.humidity}%RH</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 流向时间轴组件
 * - 接收FlowNode[] prop
 * - 左侧彩色竖线，节点交替卡片
 * - 节点可点击展开详情
 * - 节点状态图标：Factory/Microscope/Warehouse/Truck/Store等
 */
const Timeline: React.FC<TimelineProps> = ({
  nodes,
  defaultExpandAll = false,
  className,
}) => {
  // 展开状态管理
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    if (defaultExpandAll) {
      return new Set(nodes.map((n) => n.id));
    }
    // 默认展开第一个节点
    return new Set(nodes.length > 0 ? [nodes[0].id] : []);
  });

  // 切换节点展开状态
  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  // 展开/收起全部
  const toggleAll = (expand: boolean) => {
    if (expand) {
      setExpandedNodes(new Set(nodes.map((n) => n.id)));
    } else {
      setExpandedNodes(new Set());
    }
  };

  if (!nodes || nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-4">
          <Package className="w-12 h-12 text-slate-400" strokeWidth={1.5} />
        </div>
        <h4 className="text-lg font-semibold text-slate-700 mb-1">暂无流向数据</h4>
        <p className="text-sm text-slate-500">该药品的流通信息暂未上传</p>
      </div>
    );
  }

  const allExpanded = expandedNodes.size === nodes.length;

  return (
    <div className={cn(className)}>
      {/* 统计栏 + 全部展开/收起 */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100/60">
            <span className="text-sm sm:text-base font-bold text-blue-700">
              共 {nodes.length} 个流通节点
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-full text-emerald-700">
              <CheckCircle2 className="w-3 h-3" />
              {nodes.filter((n) => n.status === 'completed').length} 已完成
            </span>
          </div>
        </div>

        <button
          onClick={() => toggleAll(!allExpanded)}
          className={cn(
            'inline-flex items-center gap-1.5',
            'px-3 sm:px-4 py-1.5 sm:py-2',
            'text-xs sm:text-sm font-medium',
            'bg-white border border-slate-200 rounded-xl',
            'text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50',
            'transition-all duration-200 active:scale-95'
          )}
        >
          {allExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              <span>全部收起</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              <span>全部展开</span>
            </>
          )}
        </button>
      </div>

      {/* 时间轴主体 */}
      <div className="relative">
        {nodes.map((node, index) => (
          <TimelineNode
            key={node.id}
            node={node}
            index={index}
            total={nodes.length}
            isExpanded={expandedNodes.has(node.id)}
            onToggle={() => toggleNode(node.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Timeline;
