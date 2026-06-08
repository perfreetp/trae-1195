// 药品追溯码信息
export interface DrugTraceInfo {
  traceCode: string;           // 20位追溯码
  productName: string;         // 药品通用名
  brandName: string;           // 商品名
  specification: string;       // 规格
  batchNumber: string;         // 批号
  productionDate: string;      // 生产日期 YYYY-MM-DD
  expiryDate: string;          // 有效期至 YYYY-MM-DD
  manufacturer: string;        // 生产企业
  manufacturerLicense: string; // 生产许可证号
  approvalNumber: string;      // 批准文号
  gmpCertificate: string;      // GMP证书号
  inspectionReportNo: string;  // 检验报告书编号
  inspectionConclusion: '合格' | '不合格' | '待复检';
  inspectionDate: string;      // 检验日期
  drugImage: string;           // 药品图片URL
  dosageForm: string;          // 剂型
  ingredients: string;         // 成份
}

// 流通节点
export interface FlowNode {
  id: string;
  nodeType: 'production' | 'inspection' | 'warehouse' | 'wholesale' | 'transport' | 'retail';
  nodeName: string;            // 节点名称
  operator: string;            // 操作人/企业
  location: string;            // 地点
  timestamp: string;           // 操作时间
  temperature?: number;        // 运输温度
  humidity?: number;           // 湿度
  receiver?: string;           // 签收人
  transportNo?: string;        // 运输单号
  description: string;         // 操作描述
  status: 'completed' | 'in_progress' | 'pending';
}

export type QuerySource =
  | 'home_scan'
  | 'manual_input'
  | 'history'
  | 'direct_link'
  | 'print_page';

export interface QueryEntryLog {
  source: QuerySource;
  sourceLabel: string;
  queryTime: string;
}

// 风险检测结果
export interface RiskResult {
  level: 'safe' | 'warning' | 'danger';
  isExpired: boolean;          // 是否过期
  isRecalled: boolean;         // 是否召回
  recallInfo?: RecallInfo;     // 召回详情
  duplicateQuery: boolean;     // 是否重复查询
  queryCount: number;          // 查询次数
  firstQueryTime: string;      // 首次查询时间
  lastQueryTime: string;       // 最近一次查询时间
  isAuthentic: boolean;        // 是否为正品
  authenticitySource: string;  // 验证来源
  queryLogs: QueryEntryLog[];  // 最近几次查询入口来源记录
  isNearExpiry?: boolean;      // 是否临期（不足30天）
}

// 召回信息
export interface RecallInfo {
  recallLevel: '一级' | '二级' | '三级';
  recallReason: string;
  recallDate: string;
  recallScope: string;
  contactPhone: string;
}

// 用药指导
export interface MedicationGuide {
  indications: string;         // 适应症
  usageDosage: string;         // 用法用量
  contraindications: string[]; // 禁忌
  adverseReactions: string[];  // 不良反应
  precautions: Precaution[];   // 注意事项
  interactions: string[];      // 药物相互作用
  storage: string;             // 贮藏方法
}

export interface Precaution {
  group: string;               // 人群：孕妇/哺乳期/儿童/老人/肝肾功能不全
  content: string;
  severity: 'normal' | 'warning' | 'danger';
}

// 反馈记录
export interface FeedbackRecord {
  id: string;
  traceCode: string;
  productName: string;
  category: 'quality' | 'safety' | 'service' | 'other';
  categoryLabel: string;
  content: string;
  contact: string;
  createTime: string;
  status: 'submitted' | 'processing' | 'resolved';
  statusLabel: string;
  reply?: string;
}

// 查询历史
export interface QueryHistory {
  traceCode: string;
  productName: string;
  queryTime: string;
}

// 药师信息
export interface PharmacistInfo {
  id: string;
  name: string;
  avatar: string;
  licenseNo: string;           // 执业药师证号
  specialty: string;           // 专业领域
  rating: number;              // 评分
  experienceYears: number;     // 从业年限
  isOnline: boolean;           // 是否在线
  serviceHours: string;        // 服务时间
}

// 同批次药品对比
export interface BatchCompareItem {
  traceCode: string;
  queryLocation: string;
  queryTime: string;
  isExpired: boolean;
  isRecalled: boolean;
  expiryDate?: string;
  daysToExpiry?: number;
  recallLevel?: '一级' | '二级' | '三级';
  isCurrentQuery?: boolean;
}

// Toast消息类型
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}
