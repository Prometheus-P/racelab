// src/lib/utils/date.test.ts
import {
  formatDate,
  isToday,
  getKoreanDate,
  getTodayYYYYMMDD,
  normalizeRaceDate,
  buildRaceStartDateTime,
  getFormattedKoreanDate,
  getKoreanDateRange,
} from './date';

describe('date utilities', () => {
  describe('formatDate', () => {
    it('should format date to YYYY-MM-DD', () => {
      const date = new Date(2025, 10, 25); // Nov 25, 2025 (month is 0-indexed)
      expect(formatDate(date)).toBe('2025-11-25');
    });

    it('should format another date correctly', () => {
      const date = new Date(2024, 0, 15); // Jan 15, 2024
      expect(formatDate(date)).toBe('2024-01-15');
    });

    it('should handle end of year dates', () => {
      const date = new Date(2024, 11, 31); // Dec 31, 2024
      expect(formatDate(date)).toBe('2024-12-31');
    });

    it('should pad single digit months and days', () => {
      const date = new Date(2024, 0, 5); // Jan 5, 2024
      expect(formatDate(date)).toBe('2024-01-05');
    });
  });

  describe('isToday', () => {
    it('should return true for today', () => {
      const today = getKoreanDate();
      expect(isToday(today)).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = getKoreanDate();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });

    it('should return false for tomorrow', () => {
      const tomorrow = getKoreanDate();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isToday(tomorrow)).toBe(false);
    });

    it('should return false for same day last year', () => {
      const lastYear = getKoreanDate();
      lastYear.setFullYear(lastYear.getFullYear() - 1);
      expect(isToday(lastYear)).toBe(false);
    });
  });

  describe('getKoreanDate', () => {
    it('should return date in Korean timezone', () => {
      const result = getKoreanDate();
      expect(result).toBeInstanceOf(Date);
    });

    it('should return a valid date object', () => {
      const result = getKoreanDate();
      expect(result.getTime()).not.toBeNaN();
    });

    it('should return current time components', () => {
      const result = getKoreanDate();
      expect(result.getFullYear()).toBeGreaterThanOrEqual(2024);
      expect(result.getMonth()).toBeGreaterThanOrEqual(0);
      expect(result.getMonth()).toBeLessThanOrEqual(11);
      expect(result.getDate()).toBeGreaterThanOrEqual(1);
      expect(result.getDate()).toBeLessThanOrEqual(31);
    });
  });

  describe('getTodayYYYYMMDD', () => {
    it('should return date in YYYYMMDD format', () => {
      const result = getTodayYYYYMMDD();
      expect(result).toMatch(/^\d{8}$/);
    });

    it('should return 8 characters', () => {
      const result = getTodayYYYYMMDD();
      expect(result.length).toBe(8);
    });

    it('should match Korean date format', () => {
      const result = getTodayYYYYMMDD();
      const koreanDate = getKoreanDate();
      const year = koreanDate.getFullYear();
      const month = String(koreanDate.getMonth() + 1).padStart(2, '0');
      const day = String(koreanDate.getDate()).padStart(2, '0');
      const expected = `${year}${month}${day}`;
      expect(result).toBe(expected);
    });
  });
});

// ============================================================================
// Production Hardening Tests (006-production-hardening)
// ============================================================================

describe('normalizeRaceDate', () => {
  it('should convert YYYYMMDD to YYYY-MM-DD', () => {
    expect(normalizeRaceDate('20251211')).toBe('2025-12-11');
  });

  it('should keep YYYY-MM-DD format unchanged', () => {
    expect(normalizeRaceDate('2025-12-11')).toBe('2025-12-11');
  });

  it('should handle undefined by returning today in YYYY-MM-DD', () => {
    const result = normalizeRaceDate(undefined);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should handle empty string by returning today', () => {
    const result = normalizeRaceDate('');
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should handle single digit month/day in YYYYMMDD', () => {
    expect(normalizeRaceDate('20250105')).toBe('2025-01-05');
  });
});

describe('buildRaceStartDateTime', () => {
  it('should combine date and time with KST timezone', () => {
    const result = buildRaceStartDateTime('2025-12-11', '14:30');
    expect(result).toBe('2025-12-11T14:30:00+09:00');
  });

  it('should handle YYYYMMDD date format', () => {
    const result = buildRaceStartDateTime('20251211', '09:15');
    expect(result).toBe('2025-12-11T09:15:00+09:00');
  });

  it('should handle undefined date by using today', () => {
    const result = buildRaceStartDateTime(undefined, '10:00');
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T10:00:00\+09:00$/);
  });

  it('should handle time without seconds', () => {
    const result = buildRaceStartDateTime('2025-12-11', '16:45');
    expect(result).toContain('T16:45:00+09:00');
  });
});

describe('getFormattedKoreanDate', () => {
  it('should return formatted Korean date string', () => {
    const result = getFormattedKoreanDate();
    // Format: 2025년 12월 11일 (목)
    expect(result).toMatch(/^\d{4}년 \d{1,2}월 \d{1,2}일 \([일월화수목금토]\)$/);
  });

  it('should include day of week in Korean', () => {
    const result = getFormattedKoreanDate();
    expect(result).toMatch(/\([일월화수목금토]\)$/);
  });
});

describe('getKoreanDateRange', () => {
  it('should return start and end dates in YYYY-MM-DD format', () => {
    const result = getKoreanDateRange(6);
    expect(result.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(result.end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should have end date as today', () => {
    const result = getKoreanDateRange(6);
    const today = formatDate(getKoreanDate());
    expect(result.end).toBe(today);
  });

  it('should have start date as days-ago from today', () => {
    const result = getKoreanDateRange(6);
    const startDate = new Date(result.start);
    const endDate = new Date(result.end);
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(6);
  });

  it('should handle 0 days (same day)', () => {
    const result = getKoreanDateRange(0);
    expect(result.start).toBe(result.end);
  });
});
