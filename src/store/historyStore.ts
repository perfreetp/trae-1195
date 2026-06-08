import { create } from 'zustand';
import type { QueryHistory } from '@/types';

interface HistoryState {
  historyList: QueryHistory[];
}

interface HistoryActions {
  addHistoryItem: (code: string, productName: string) => void;
  removeHistory: (code: string) => void;
  clearAllHistory: () => void;
}

const STORAGE_KEY = 'drug_query_history';

function loadFromStorage(): QueryHistory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveToStorage(list: QueryHistory[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
  }
}

export const useHistoryStore = create<HistoryState & HistoryActions>((set) => {
  const initial = loadFromStorage();

  return {
    historyList: initial,

    addHistoryItem: (code: string, productName: string) => {
      set((state) => {
        const filtered = state.historyList.filter((item) => item.traceCode !== code);
        const newItem: QueryHistory = {
          traceCode: code,
          productName,
          queryTime: new Date().toLocaleString('zh-CN'),
        };
        const newList = [newItem, ...filtered].slice(0, 20);
        saveToStorage(newList);
        return { historyList: newList };
      });
    },

    removeHistory: (code: string) => {
      set((state) => {
        const newList = state.historyList.filter((item) => item.traceCode !== code);
        saveToStorage(newList);
        return { historyList: newList };
      });
    },

    clearAllHistory: () => {
      saveToStorage([]);
      set({ historyList: [] });
    },
  };
});
