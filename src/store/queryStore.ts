import { create } from 'zustand';
import type { DrugTraceInfo, FlowNode, RiskResult, MedicationGuide } from '@/types';
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
}

interface QueryActions {
  setTraceCode: (code: string) => void;
  clearAll: () => void;
  setLoading: (loading: boolean) => void;
  queryDrug: (code: string) => Promise<void>;
}

const initialState: QueryState = {
  traceCode: '',
  loading: false,
  currentDrug: null,
  currentNodes: [],
  currentRisk: null,
  currentGuide: null,
  error: null,
};

const HISTORY_KEY = 'drug_query_history';

interface HistoryCounter {
  queryCount: number;
  firstQueryTime: string;
}

function getQueryHistoryFromStorage(code: string): HistoryCounter {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return { queryCount: 1, firstQueryTime: '' };
    const history = JSON.parse(raw);
    const match = history.find((item: any) => item.traceCode === code);
    if (match) {
      return {
        queryCount: (match.queryCount || 0) + 1,
        firstQueryTime: match.firstQueryTime || match.queryTime || '',
      };
    }
    return { queryCount: 1, firstQueryTime: '' };
  } catch {
    return { queryCount: 1, firstQueryTime: '' };
  }
}

function computeRisk(
  drug: DrugTraceInfo,
  history: HistoryCounter,
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
  } else if (nearExpiry || (duplicateQuery && history.queryCount > 3)) {
    level = 'warning';
  }

  return {
    level,
    isExpired,
    isRecalled,
    recallInfo: recallInfo,
    duplicateQuery,
    queryCount: history.queryCount,
    firstQueryTime: history.firstQueryTime || now.toLocaleString('zh-CN'),
    isAuthentic: auth.authentic,
    authenticitySource: auth.source,
  };
}

export const useQueryStore = create<QueryState & QueryActions>((set, get) => ({
  ...initialState,

  setTraceCode: (code: string) => set({ traceCode: code }),

  clearAll: () => set({ ...initialState }),

  setLoading: (loading: boolean) => set({ loading }),

  queryDrug: async (code: string) => {
    set({ loading: true, error: null });

    await new Promise((resolve) => setTimeout(resolve, 600));

    const drug = getDrugByCode(code);
    if (!drug) {
      set({
        loading: false,
        error: '未找到该追溯码对应的药品信息，请确认追溯码是否正确。',
        currentDrug: null,
        currentNodes: [],
        currentRisk: null,
        currentGuide: null,
      });
      return;
    }

    const history = getQueryHistoryFromStorage(code);
    const nodes = getFlowNodesByCode(code);
    const risk = computeRisk(drug, history);
    const guide = getGuideByProductName(drug.productName) || null;

    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      const historyArr = raw ? JSON.parse(raw) : [];
      const existingIdx = historyArr.findIndex((item: any) => item.traceCode === code);
      if (existingIdx >= 0) {
        historyArr[existingIdx].queryCount = history.queryCount;
        historyArr[existingIdx].queryTime = new Date().toLocaleString('zh-CN');
      }
      localStorage.setItem(HISTORY_KEY, JSON.stringify(historyArr));
    } catch {
    }

    set({
      traceCode: code,
      currentDrug: drug,
      currentNodes: nodes,
      currentRisk: risk,
      currentGuide: guide,
      loading: false,
      error: null,
    });
  },
}));
