import { create } from 'zustand';
import type { FeedbackRecord } from '@/types';

interface FeedbackState {
  feedbackList: FeedbackRecord[];
}

type SubmitFeedbackData = Omit<FeedbackRecord, 'id' | 'createTime' | 'status' | 'statusLabel'>;

interface FeedbackActions {
  submitFeedback: (data: SubmitFeedbackData) => FeedbackRecord;
}

const STORAGE_KEY = 'drug_feedback_list';

function loadFromStorage(): FeedbackRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveToStorage(list: FeedbackRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export const useFeedbackStore = create<FeedbackState & FeedbackActions>((set) => {
  const initial = loadFromStorage();

  return {
    feedbackList: initial,

    submitFeedback: (data: SubmitFeedbackData) => {
      const record: FeedbackRecord = {
        ...data,
        id: generateId(),
        createTime: new Date().toLocaleString('zh-CN'),
        status: 'submitted',
        statusLabel: '已提交',
      };

      set((state) => {
        const newList = [record, ...state.feedbackList];
        saveToStorage(newList);
        return { feedbackList: newList };
      });

      return record;
    },
  };
});
