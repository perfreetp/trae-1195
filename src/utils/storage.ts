import type { QueryHistory, FeedbackRecord } from '../types';

const HISTORY_KEY = 'drug_trace_history';
const FEEDBACK_KEY = 'drug_trace_feedback';

export function getHistory(): QueryHistory[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function addHistory(item: QueryHistory): void {
  const history = getHistory();
  const existing = history.findIndex(h => h.traceCode === item.traceCode);
  if (existing >= 0) {
    history.splice(existing, 1);
  }
  history.unshift(item);
  if (history.length > 100) {
    history.length = 100;
  }
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

export function getFeedbacks(): FeedbackRecord[] {
  try {
    const data = localStorage.getItem(FEEDBACK_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveFeedback(record: FeedbackRecord): void {
  const feedbacks = getFeedbacks();
  feedbacks.unshift(record);
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedbacks));
}
