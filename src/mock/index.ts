import type { BatchCompareItem, DrugTraceInfo, FlowNode, MedicationGuide, PharmacistInfo, RecallInfo } from '../types';
import { drugs, getDrugByCode, getDrugsByBatch } from './drugs';
import { flowNodesMap, getFlowNodesByCode } from './flowNodes';
import { authenticityMap, getAuthenticity, getRecallInfo, isBatchRecalled, recallMap } from './risks';
import { getGuideByProductName, guidesMap } from './guides';
import { getAllPharmacists, getOnlinePharmacists, getPharmacistById, pharmacists } from './pharmacists';

const queryLocations = [
  '北京市朝阳区康和大药房',
  '上海市浦东新区益丰药房',
  '广州市天河区大参林药店',
  '深圳市南山区同仁堂药店',
  '成都市武侯区一心堂药房',
  '杭州市西湖区老百姓大药房',
  '武汉市江汉区中联大药房',
  '南京市鼓楼区先声再康药店',
];

function padCode(code: string, idx: number): string {
  const prefix = code.substring(0, 14);
  const suffix = String(idx).padStart(4, '0');
  const base = prefix + suffix;
  let sum = 0;
  for (let i = 0; i < base.length; i++) sum += Number(base[i]);
  const check = String(sum % 97).padStart(2, '0');
  return base + check;
}

export function getBatchCompareList(batchNumber: string): BatchCompareItem[] {
  const batchDrugs = getDrugsByBatch(batchNumber);
  if (batchDrugs.length === 0) return [];
  const sample = batchDrugs[0];
  const result: BatchCompareItem[] = [];
  const isRecalled = isBatchRecalled(batchNumber);
  const today = new Date('2026-06-09');
  const expiry = new Date(sample.expiryDate);
  const isExpired = expiry < today;

  for (let i = 0; i < 5; i++) {
    const qDate = new Date(today);
    qDate.setDate(qDate.getDate() - Math.floor(Math.random() * 30));
    const qHour = 9 + Math.floor(Math.random() * 10);
    const qMin = Math.floor(Math.random() * 60);
    const qTimeStr = `${qDate.getFullYear()}-${String(qDate.getMonth() + 1).padStart(2, '0')}-${String(qDate.getDate()).padStart(2, '0')} ${String(qHour).padStart(2, '0')}:${String(qMin).padStart(2, '0')}`;

    result.push({
      traceCode: i === 0 ? sample.traceCode : padCode(sample.traceCode, i + 1),
      queryLocation: queryLocations[(i * 3) % queryLocations.length],
      queryTime: qTimeStr,
      isExpired,
      isRecalled,
    });
  }
  return result;
}

export function getFaqList(): { q: string; a: string }[] {
  return [
    {
      q: '药品追溯码是什么？如何查询？',
      a: '药品追溯码是国家药监局为每盒药品赋予的唯一电子标识，共20位数字。您可在本平台首页输入追溯码查询药品全流程信息，也可使用微信、支付宝扫描药品包装盒上的二维码进行查询。',
    },
    {
      q: '为什么我查询的追溯码显示不存在？',
      a: '可能原因包括：1) 追溯码输入错误，请核对20位数字；2) 药品为假冒伪劣产品；3) 追溯信息尚未同步至国家平台（通常生产后3-7个工作日上传）。如持续异常，请联系药店或生产企业核实。',
    },
    {
      q: '查询到药品临近过期还能服用吗？',
      a: '药品在有效期内且外观、气味无异常时，按规定贮藏条件保存的可正常使用。建议优先使用距有效期3个月以上的药品。临期药品（距效期不足30天）请谨慎使用，必要时咨询药师。',
    },
    {
      q: '显示召回状态的药品如何处理？',
      a: '召回药品请立即停止使用。可凭购买凭证和药品包装联系原购药药店办理退换货，或拨打召回公告中生产企业客服电话咨询处理方案。如有身体不适请及时就医。',
    },
    {
      q: '如何判断药品是不是正品？',
      a: '本平台通过对接国家药监局电子追溯平台验证追溯码真实性。显示"已验证为正品"且来源为"国家药品监督管理局电子追溯平台"的，即为官方验证通过的正品。同时建议从正规渠道购药。',
    },
    {
      q: '药品过期了还能吃吗？有什么危害？',
      a: '过期药品严禁使用。药品过期后有效成分含量下降、可能产生有害降解产物，轻则疗效降低延误治疗，重则引发过敏、中毒等严重不良反应，危害身体健康。请按垃圾分类处理过期药品。',
    },
    {
      q: '流通节点中的温湿度数据重要吗？',
      a: '非常重要。药品特别是生物制剂、冷藏药品（如胰岛素、部分抗生素）对温湿度敏感。运输和仓储超出规定温度范围可能导致药品失效。本平台显示的温湿度数据来源于GSP冷链监控设备实时记录。',
    },
    {
      q: '我对药品质量有疑问如何反馈？',
      a: '您可通过本平台"意见反馈"页面提交反馈，也可拨打国家药品投诉举报电话12315。请保留好药品原包装、购买小票等凭证，描述详细问题（如外观异常、服用后不适等）。',
    },
  ];
}

export {
  drugs,
  flowNodesMap,
  recallMap,
  authenticityMap,
  guidesMap,
  pharmacists,
  getDrugByCode,
  getDrugsByBatch,
  getFlowNodesByCode,
  getRecallInfo,
  getAuthenticity,
  isBatchRecalled,
  getGuideByProductName,
  getAllPharmacists,
  getOnlinePharmacists,
  getPharmacistById,
};

export type {
  DrugTraceInfo,
  FlowNode,
  RecallInfo,
  MedicationGuide,
  PharmacistInfo,
  BatchCompareItem,
};
