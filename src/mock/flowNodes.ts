import type { FlowNode } from '../types';

const createFlowNodes = (
  traceCode: string,
  baseDate: string,
  manufacturer: string,
  city: string
): FlowNode[] => {
  const [year, month, day] = baseDate.split('-').map(Number);
  const d = (offsetDays: number, hour: number, minute: number) => {
    const date = new Date(year, month - 1, day + offsetDays);
    date.setHours(hour, minute, 0, 0);
    return date.toISOString().replace('T', ' ').substring(0, 19);
  };

  return [
    {
      id: `${traceCode}-01`,
      nodeType: 'production',
      nodeName: '生产车间',
      operator: manufacturer + ' 生产部 张工',
      location: `${city}生产基地A区3号车间`,
      timestamp: d(0, 8, 30),
      description: '投料生产，完成制剂、填充、包装全过程',
      status: 'completed',
    },
    {
      id: `${traceCode}-02`,
      nodeType: 'inspection',
      nodeName: '质量检验',
      operator: manufacturer + ' QC部 李检验员',
      location: `${city}质检中心2号楼`,
      timestamp: d(2, 9, 15),
      description: '按照药典标准完成全项检验，含性状、鉴别、含量测定、溶出度、微生物限度等',
      status: 'completed',
    },
    {
      id: `${traceCode}-03`,
      nodeType: 'warehouse',
      nodeName: '成品入库',
      operator: manufacturer + ' 仓储部 王主管',
      location: `${city}成品仓库B区03排12位`,
      timestamp: d(3, 14, 20),
      temperature: 22,
      humidity: 55,
      description: '验收入库，扫码建档，温湿度记录正常',
      status: 'completed',
    },
    {
      id: `${traceCode}-04`,
      nodeType: 'wholesale',
      nodeName: '区域批发',
      operator: '华北大药房医药批发有限公司',
      location: `${city}医药产业园批发中心`,
      timestamp: d(10, 10, 0),
      description: '批发企业采购验收，GSP冷链仓储',
      status: 'completed',
    },
    {
      id: `${traceCode}-05`,
      nodeType: 'transport',
      nodeName: '冷链运输',
      operator: '顺丰医药冷链物流',
      location: `${city}至北京朝阳`,
      timestamp: d(12, 6, 45),
      temperature: 5,
      humidity: 60,
      transportNo: `SFYL${traceCode.substring(4, 14)}`,
      receiver: '北京康和大药房 收货组',
      description: '专业医药冷藏车运输，全程2-8℃温湿度监控，运输时长约6小时',
      status: 'completed',
    },
    {
      id: `${traceCode}-06`,
      nodeType: 'retail',
      nodeName: '药店零售',
      operator: '北京康和大药房（朝阳店）',
      location: '北京市朝阳区建国路88号SOHO现代城底商',
      timestamp: d(15, 15, 30),
      description: '消费者购买，药师审核通过，已录入销售记录',
      status: 'completed',
    },
  ];
};

export const flowNodesMap: Record<string, FlowNode[]> = {
  '81100100001000000101': createFlowNodes('81100100001000000101', '2025-03-15', '中美天津史克制药有限公司', '天津市'),
  '81100100001000000208': createFlowNodes('81100100001000000208', '2025-06-20', '中美天津史克制药有限公司', '天津市'),
  '81100100001000000315': createFlowNodes('81100100001000000315', '2025-09-10', '中美天津史克制药有限公司', '天津市'),
  '81100200002000000122': createFlowNodes('81100200002000000122', '2025-12-05', '海药集团有限公司', '海口市'),
  '81100200002000000229': createFlowNodes('81100200002000000229', '2025-08-15', '海药集团有限公司', '海口市'),
  '81100200002000000336': createFlowNodes('81100200002000000336', '2025-10-20', '海药集团有限公司', '海口市'),
  '81100300003000000143': createFlowNodes('81100300003000000143', '2023-05-15', '广州白云山和记黄埔中药有限公司', '广州市'),
  '81100300003000000250': createFlowNodes('81100300003000000250', '2023-08-20', '广州白云山和记黄埔中药有限公司', '广州市'),
  '81100300003000000367': createFlowNodes('81100300003000000367', '2023-11-25', '广州白云山和记黄埔中药有限公司', '广州市'),
  '81100400004000000174': createFlowNodes('81100400004000000174', '2025-04-10', '拜耳医药保健有限公司', '北京市'),
  '81100400004000000281': createFlowNodes('81100400004000000281', '2025-05-22', '拜耳医药保健有限公司', '北京市'),
  '81100400004000000398': createFlowNodes('81100400004000000398', '2025-07-28', '拜耳医药保健有限公司', '北京市'),
  '81100500005000000105': createFlowNodes('81100500005000000105', '2025-02-20', '石家庄以岭药业股份有限公司', '石家庄市'),
  '81100500005000000212': createFlowNodes('81100500005000000212', '2025-05-30', '石家庄以岭药业股份有限公司', '石家庄市'),
  '81100500005000000329': createFlowNodes('81100500005000000329', '2025-08-18', '石家庄以岭药业股份有限公司', '石家庄市'),
};

export function getFlowNodesByCode(code: string): FlowNode[] {
  return flowNodesMap[code] || [];
}
