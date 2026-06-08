import { create } from 'zustand';
import type { DrugTraceInfo, FlowNode, QueryEntryLog, QuerySource, RiskResult, MedicationGuide } from '@/types';
import {
  getDrugByCode,
  getFlowNodesByCode,
  getAuthenticity,
  getRecallInfo,
  getGuideByProductName,
} from '@/mock';

interface QueryState {
  traceCode: string;
  loading: boolean;
  currentDrug: DrugTraceInfo | null;
  currentNodes: FlowNode[];
  currentRisk: RiskResult | null;
  currentGuide: MedicationGuide | null;
  error: string | null;
  justQueriedCode: string | null;
}

interface QueryActions {
  setTraceCode: (code: string) => void;
  clearAll: () => void;
  setLoading: (loading: boolean) => void;
  queryDrug: (code: string, source?: QuerySource) => Promise<void>;
  consumeJustQueriedFlag: () => string | null;
  getAllQueryRecords: () => FullQueryRecord[];
  getRiskLevelForRecord: (record: FullQueryRecord) => 'safe' | 'warning' | 'danger';
}

export interface FullQueryRecord {
  traceCode: string;
  productName: string;
  queryCount: number;
  firstQueryTime: string;
  lastQueryTime: string;
  queryLogs: QueryEntryLog[];
}

const initialState: QueryState = {
  traceCode: '',
  loading: false,
  currentDrug: null,
  currentNodes: [],
  currentRisk: null,
  currentGuide: null,
  error: null,
  justQueriedCode: null,
};

const HISTORY_KEY = 'drug_query_count_v2';

interface QueryCountRecord {
  queryCount: number;
  firstQueryTime: string;
  lastQueryTime: string;
  productName: string;
  queryLogs: QueryEntryLog[];
}

type QueryCountStorage = Record<string, QueryCountRecord>;

const SOURCE_LABEL_MAP: Record<QuerySource, string> = {
  home_scan: '首页扫码',
  manual_input: '手动输入',
  history: '历史记录',
  direct_link: '直接打开链接',
  print_page: '打印凭证',
};

function isValid20DigitCode(code: string): boolean {
  return /^\d{20}$/.test(code);
}

function getQueryCountStorage(): QueryCountStorage {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function setQueryCountStorage(storage: QueryCountStorage): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(storage));
  } catch {
  }
}

function getQueryHistoryFromStorage(code: string): QueryCountRecord {
  const storage = getQueryCountStorage();
  const now = new Date().toLocaleString('zh-CN');
  if (storage[code]) {
    const record = storage[code];
    return {
      queryCount: record.queryCount,
      firstQueryTime: record.firstQueryTime,
      lastQueryTime: record.lastQueryTime || now,
      productName: record.productName,
      queryLogs: Array.isArray(record.queryLogs) ? record.queryLogs : [],
    };
  }
  return {
    queryCount: 1,
    firstQueryTime: now,
    lastQueryTime: now,
    productName: '',
    queryLogs: [],
  };
}

function incrementQueryCountInStorage(
  code: string,
  productName: string,
  source: QuerySource = 'direct_link'
): QueryCountRecord {
  const storage = getQueryCountStorage();
  const now = new Date().toLocaleString('zh-CN');
  const newLog: QueryEntryLog = {
    source,
    sourceLabel: SOURCE_LABEL_MAP[source],
    queryTime: now,
  };
  if (storage[code]) {
    const record = storage[code];
    const oldLogs = Array.isArray(record.queryLogs) ? record.queryLogs : [];
    const updatedLogs = [newLog, ...oldLogs].slice(0, 5);
    const updated: QueryCountRecord = {
      queryCount: record.queryCount + 1,
      firstQueryTime: record.firstQueryTime,
      lastQueryTime: now,
      productName: productName || record.productName,
      queryLogs: updatedLogs,
    };
    storage[code] = updated;
    setQueryCountStorage(storage);
    return updated;
  } else {
    const newRecord: QueryCountRecord = {
      queryCount: 1,
      firstQueryTime: now,
      lastQueryTime: now,
      productName: productName || '',
      queryLogs: [newLog],
    };
    storage[code] = newRecord;
    setQueryCountStorage(storage);
    return newRecord;
  }
}

function computeRisk(
  drug: DrugTraceInfo,
  history: QueryCountRecord,
  now: Date = new Date()
): RiskResult {
  const expiryDate = new Date(drug.expiryDate);
  const isExpired = expiryDate < now;
  const auth = getAuthenticity(drug.traceCode);
  const recallInfo = getRecallInfo(drug.batchNumber);
  const isRecalled = !!recallInfo;
  const duplicateQuery = history.queryCount > 1;

  let level: RiskResult['level'] = 'safe';
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const nearExpiry = !isExpired && expiryDate.getTime() - now.getTime() < thirtyDaysMs;

  if (isRecalled || isExpired) {
    level = 'danger';
  } else if (history.queryCount >= 6) {
    level = 'danger';
  } else if (nearExpiry || history.queryCount >= 4) {
    level = 'warning';
  }

  return {
    level,
    isExpired,
    isRecalled,
    recallInfo: recallInfo,
    duplicateQuery,
    queryCount: history.queryCount,
    firstQueryTime: history.firstQueryTime,
    lastQueryTime: history.lastQueryTime,
    isAuthentic: auth.authentic,
    authenticitySource: auth.source,
    queryLogs: history.queryLogs,
    isNearExpiry: nearExpiry,
  };
}

export const useQueryStore = create<QueryState & QueryActions>((set, get) => ({
  ...initialState,

  setTraceCode: (code: string) => set({ traceCode: code }),

  clearAll: () => set({ ...initialState }),

  setLoading: (loading: boolean) => set({ loading }),

  consumeJustQueriedFlag: () => {
    const flag = get().justQueriedCode;
    set({ justQueriedCode: null });
    return flag;
  },

  getAllQueryRecords: (): FullQueryRecord[] => {
    const storage = getQueryCountStorage();
    const now = new Date().toLocaleString('zh-CN');
    return Object.keys(storage).map((code) => {
      const r = storage[code];
      return {
        traceCode: code,
        productName: r.productName || '',
        queryCount: r.queryCount,
        firstQueryTime: r.firstQueryTime || now,
        lastQueryTime: r.lastQueryTime || now,
        queryLogs: Array.isArray(r.queryLogs) ? r.queryLogs : [],
      };
    });
  },

  getRiskLevelForRecord: (record: FullQueryRecord): 'safe' | 'warning' | 'danger' => {
    const drug = getDrugByCode(record.traceCode);
    let isExpired = false;
    let isRecalled = false;
    let isNearExpiry = false;
    if (drug) {
      const expiry = new Date(drug.expiryDate);
      const now = new Date();
      isExpired = expiry < now;
      isNearExpiry = !isExpired && expiry.getTime() - now.getTime() < 30 * 86400000;
      isRecalled = !!getRecallInfo(drug.batchNumber);
    }
    if (isRecalled || isExpired) return 'danger';
    if (record.queryCount >= 6) return 'danger';
    if (isNearExpiry || record.queryCount >= 4) return 'warning';
    return 'safe';
  },

  queryDrug: async (code: string, source: QuerySource = 'direct_link') => {
    set({ loading: true, error: null });

    await new Promise((resolve) => setTimeout(resolve, 600));

    const drug = getDrugByCode(code);
    const productName = drug?.productName || '';

    if (isValid20DigitCode(code)) {
      incrementQueryCountInStorage(code, productName, source);
    }

    if (!drug) {
      set({
        loading: false,
        error: '未找到该追溯码对应的药品信息，请确认追溯码是否正确。',
        currentDrug: null,
        currentNodes: [],
        currentRisk: null,
        currentGuide: null,
        justQueriedCode: null,
      });
      return;
    }

    const history = getQueryHistoryFromStorage(code);
    const nodes = getFlowNodesByCode(code);
    const risk = computeRisk(drug, history);
    const guide = getGuideByProductName(drug.productName) || null;

    set({
      traceCode: code,
      currentDrug: drug,
      currentNodes: nodes,
      currentRisk: risk,
      currentGuide: guide,
      loading: false,
      error: null,
      justQueriedCode: code,
    });
  },
}));
