import { daysToExpiry, isExpired } from './date';
import type { QueryHistory } from '../types';

export function calcRiskLevel(
  expiryDate: string,
  isRecalled: boolean,
  queryCount: number
): 'safe' | 'warning' | 'danger' {
  if (isRecalled) {
    return 'danger';
  }

  if (isExpired(expiryDate)) {
    return 'danger';
  }

  const days = daysToExpiry(expiryDate);
  if (days < 30) {
    return 'warning';
  }

  if (queryCount > 3) {
    return 'warning';
  }

  return 'safe';
}

export function detectDuplicateQuery(
  traceCode: string,
  history: QueryHistory[]
): { count: number; firstTime: string } {
  const matched = history.filter(h => h.traceCode === traceCode);
  if (matched.length === 0) {
    return { count: 0, firstTime: '' };
  }

  const sorted = [...matched].sort((a, b) =>
    new Date(a.queryTime.replace(/-/g, '/')).getTime() -
    new Date(b.queryTime.replace(/-/g, '/')).getTime()
  );

  return {
    count: matched.length,
    firstTime: sorted[0].queryTime,
  };
}
