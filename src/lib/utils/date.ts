// src/lib/utils/date.ts

const KOREA_TIMEZONE = 'Asia/Seoul';

export function formatYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function getKoreanDateParts(date: Date): { year: number; month: string; day: string } {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return { year, month, day };
}

/**
 * Get current date/time in Korean timezone (Asia/Seoul)
 * Returns a Date object representing the current time in Korea
 */
export function getKoreanDate(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: KOREA_TIMEZONE }));
}

/**
 * Returns today's date in YYYYMMDD format (Korean timezone)
 */
export function getTodayYYYYMMDD(): string {
  const koreanDate = getKoreanDate();
  const { year, month, day } = getKoreanDateParts(koreanDate);
  return `${year}${month}${day}`;
}

/**
 * Format a Date object to YYYY-MM-DD string
 */
export function formatDate(date: Date): string {
  const { year, month, day } = getKoreanDateParts(date);
  return `${year}-${month}-${day}`;
}

export function getKoreanDateRange(days: number): { start: string; end: string } {
  const endDate = getKoreanDate();
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - days);

  return {
    start: formatYYYYMMDD(startDate),
    end: formatYYYYMMDD(endDate),
  };
}

/**
 * Check if a given date is today (in Korean timezone)
 */
export function isToday(date: Date): boolean {
  const today = getKoreanDate();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

// ============================================================================
// Production Hardening Functions (006-production-hardening)
// ============================================================================

/**
 * Normalize race date to YYYY-MM-DD format
 * Handles both YYYYMMDD and YYYY-MM-DD inputs
 * Returns today's date if input is undefined or empty
 */
export function normalizeRaceDate(date: string | undefined): string {
  if (!date) {
    return formatDate(getKoreanDate());
  }

  // Already in YYYY-MM-DD format
  if (date.includes('-')) {
    return date;
  }

  // Convert YYYYMMDD to YYYY-MM-DD
  if (date.length === 8) {
    return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
  }

  return formatDate(getKoreanDate());
}

/**
 * Build ISO 8601 datetime string with KST timezone
 * @param date - Date in YYYY-MM-DD or YYYYMMDD format
 * @param time - Time in HH:mm format
 * @returns ISO 8601 string with +09:00 timezone
 */
export function buildRaceStartDateTime(date: string | undefined, time: string): string {
  const normalizedDate = normalizeRaceDate(date);
  return `${normalizedDate}T${time}:00+09:00`;
}

/**
 * Get formatted Korean date string for display
 * @returns Format: "2025년 12월 11일 (목)"
 */
export function getFormattedKoreanDate(): string {
  const date = getKoreanDate();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];

  return `${year}년 ${month}월 ${day}일 (${dayOfWeek})`;
}

/**
 * Get a date range from today going back N days
 * @param daysAgo - Number of days to go back from today
 * @returns Object with start and end dates in YYYY-MM-DD format
 */
export function getKoreanDateRange(daysAgo: number): { start: string; end: string } {
  const endDate = getKoreanDate();
  const startDate = getKoreanDate();
  startDate.setDate(startDate.getDate() - daysAgo);

  return {
    start: formatDate(startDate),
    end: formatDate(endDate),
  };
}
