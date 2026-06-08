import type { RecallInfo } from '../types';

export const recallMap: Record<string, RecallInfo> = {
  'XBD20250402': {
    recallLevel: '二级',
    recallReason: '经检测发现部分批次铝塑包装密封性存在质量风险，可能影响药品稳定性',
    recallDate: '2026-05-12',
    recallScope: '全国范围内2025年4月生产的XBD20250402批次产品，涉及流通渠道药店、医院共计约12,500盒',
    contactPhone: '400-810-1828',
  },
  'XBD20250518': {
    recallLevel: '三级',
    recallReason: '收到部分地区反馈外盒印刷信息模糊，主动预防性召回',
    recallDate: '2026-03-20',
    recallScope: '华东地区部分连锁药店，约3,200盒',
    contactPhone: '400-810-1828',
  },
};

export const authenticityMap: Record<string, { authentic: boolean; source: string }> = {
  '81100100001000000101': { authentic: true, source: '国家药品监督管理局电子追溯平台' },
  '81100100001000000208': { authentic: true, source: '国家药品监督管理局电子追溯平台' },
  '81100100001000000315': { authentic: true, source: '国家药品监督管理局电子追溯平台' },
  '81100200002000000122': { authentic: true, source: '国家药品监督管理局电子追溯平台' },
  '81100200002000000229': { authentic: true, source: '国家药品监督管理局电子追溯平台' },
  '81100200002000000336': { authentic: true, source: '国家药品监督管理局电子追溯平台' },
  '81100300003000000143': { authentic: true, source: '国家药品监督管理局电子追溯平台' },
  '81100300003000000250': { authentic: true, source: '国家药品监督管理局电子追溯平台' },
  '81100300003000000367': { authentic: true, source: '国家药品监督管理局电子追溯平台' },
  '81100400004000000174': { authentic: true, source: '国家药品监督管理局电子追溯平台' },
  '81100400004000000281': { authentic: true, source: '国家药品监督管理局电子追溯平台' },
  '81100400004000000398': { authentic: true, source: '国家药品监督管理局电子追溯平台' },
  '81100500005000000105': { authentic: true, source: '国家药品监督管理局电子追溯平台' },
  '81100500005000000212': { authentic: true, source: '国家药品监督管理局电子追溯平台' },
  '81100500005000000329': { authentic: true, source: '国家药品监督管理局电子追溯平台' },
};

export function getRecallInfo(batchNumber: string): RecallInfo | undefined {
  return recallMap[batchNumber];
}

export function getAuthenticity(code: string): { authentic: boolean; source: string } {
  return authenticityMap[code] || { authentic: false, source: '未匹配到追溯信息' };
}

export function isBatchRecalled(batchNumber: string): boolean {
  return batchNumber in recallMap;
}
