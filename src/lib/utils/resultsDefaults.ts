import { getKoreanDateRange } from '@/lib/utils/date';

export const DEFAULT_DAYS = 6; // last 7 days inclusive

export function getResultsDefaultRange(): { dateFrom: string; dateTo: string } {
  const range = getKoreanDateRange(DEFAULT_DAYS);
  return { dateFrom: range.start, dateTo: range.end };
}