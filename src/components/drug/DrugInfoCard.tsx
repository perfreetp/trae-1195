import React from 'react';
import { Pill, CalendarDays, Factory, FileCheck, Barcode } from 'lucide-react';
import { cn } from '@/lib/utils';
import Card from '@/components/common/Card';
import StatusBadge from '@/components/common/StatusBadge';
import type { DrugTraceInfo } from '@/types';

interface DrugInfoCardProps {
  /** 药品追溯信息 */
  drug: DrugTraceInfo;
  /** 附加样式类名 */
  className?: string;
}

/**
 * 药品信息网格卡片
 * - 接收drug prop，2列网格展示所有DrugTraceInfo字段
 * - 关键字段高亮（品名、批号、有效期等）
 */
const DrugInfoCard: React.FC<DrugInfoCardProps> = ({ drug, className }) => {
  // 定义字段显示配置
  const highlightFields = ['productName', 'brandName', 'batchNumber', 'expiryDate'];

  interface FieldConfig {
    key: keyof DrugTraceInfo;
    label: string;
    icon?: React.ReactNode;
    highlight?: boolean;
    fullWidth?: boolean;
    render?: (value: string) => React.ReactNode;
  }

  const fields: FieldConfig[] = [
    {
      key: 'productName',
      label: '药品通用名',
      icon: <Pill className="w-4 h-4" />,
      highlight: true,
      fullWidth: true,
    },
    {
      key: 'brandName',
      label: '商品名',
      highlight: true,
    },
    {
      key: 'specification',
      label: '规格',
    },
    {
      key: 'dosageForm',
      label: '剂型',
    },
    {
      key: 'batchNumber',
      label: '批号',
      icon: <Barcode className="w-4 h-4" />,
      highlight: true,
    },
    {
      key: 'productionDate',
      label: '生产日期',
      icon: <CalendarDays className="w-4 h-4" />,
    },
    {
      key: 'expiryDate',
      label: '有效期至',
      icon: <CalendarDays className="w-4 h-4" />,
      highlight: true,
      render: (value) => {
        const expiryDate = new Date(value);
        const now = new Date();
        const diffDays = Math.ceil(
          (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        let statusType: 'safe' | 'warning' | 'danger' = 'safe';
        let statusText = value;

        if (diffDays < 0) {
          statusType = 'danger';
          statusText = `${value}（已过期 ${Math.abs(diffDays)} 天）`;
        } else if (diffDays <= 30) {
          statusType = 'warning';
          statusText = `${value}（仅剩 ${diffDays} 天）`;
        } else {
          statusText = `${value}（剩余 ${diffDays} 天）`;
        }

        return (
          <div className="flex items-center flex-wrap gap-2">
            <span className="font-mono">{value}</span>
            <StatusBadge type={statusType} text={statusType === 'safe' ? '有效' : statusType === 'warning' ? '临期' : '过期'} size="sm" />
          </div>
        );
      },
    },
    {
      key: 'manufacturer',
      label: '生产企业',
      icon: <Factory className="w-4 h-4" />,
      fullWidth: true,
    },
    {
      key: 'manufacturerLicense',
      label: '生产许可证号',
    },
    {
      key: 'approvalNumber',
      label: '批准文号',
    },
    {
      key: 'gmpCertificate',
      label: 'GMP证书号',
    },
    {
      key: 'inspectionReportNo',
      label: '检验报告书编号',
      icon: <FileCheck className="w-4 h-4" />,
    },
    {
      key: 'inspectionDate',
      label: '检验日期',
      icon: <CalendarDays className="w-4 h-4" />,
    },
    {
      key: 'inspectionConclusion',
      label: '检验结论',
      render: (value) => {
        const type =
          value === '合格' ? 'safe' : value === '不合格' ? 'danger' : 'warning';
        return <StatusBadge type={type} text={value} size="md" />;
      },
    },
    {
      key: 'ingredients',
      label: '成份',
      fullWidth: true,
    },
  ];

  // 渲染单个字段
  const renderField = (field: FieldConfig) => {
    const value = drug[field.key] as string;
    const isHighlight = highlightFields.includes(field.key as string) || field.highlight;

    return (
      <div
        key={field.key as string}
        className={cn(
          'group relative rounded-xl p-3 sm:p-4 transition-all duration-200',
          isHighlight
            ? 'bg-gradient-to-br from-blue-50/80 to-cyan-50/60 border border-blue-100/80'
            : 'bg-slate-50/50 border border-slate-100/60 hover:bg-slate-50',
          field.fullWidth ? 'col-span-1 sm:col-span-2' : ''
        )}
      >
        {/* 字段标签 */}
        <div className="flex items-center space-x-1.5 mb-1.5">
          {field.icon && (
            <span className="text-slate-400 group-hover:text-blue-500 transition-colors">
              {field.icon}
            </span>
          )}
          <span className={cn(
            'text-xs font-medium',
            isHighlight ? 'text-blue-600' : 'text-slate-500'
          )}>
            {field.label}
          </span>
        </div>

        {/* 字段值 */}
        <div className={cn(
          'text-sm sm:text-base leading-relaxed break-words',
          isHighlight ? 'font-bold text-slate-800' : 'text-slate-700',
          field.key === 'traceCode' || field.key === 'batchNumber' ? 'font-mono tracking-wider' : ''
        )}>
          {field.render ? field.render(value) : (
            value ? <span>{value}</span> : <span className="text-slate-400 italic">—</span>
          )}
        </div>

        {/* 高亮标记 */}
        {isHighlight && (
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 shadow-sm" />
        )}
      </div>
    );
  };

  return (
    <Card
      className={className}
      title="药品追溯档案"
      subtitle={
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-slate-400">追溯码：</span>
          <code className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 font-mono text-xs sm:text-sm tracking-wider">
            {drug.traceCode.replace(/(\d{2})(\d{6})(\d{6})(\d{6})/, '$1 $2 $3 $4')}
          </code>
        </div>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {fields.map(renderField)}
      </div>
    </Card>
  );
};

export default DrugInfoCard;
