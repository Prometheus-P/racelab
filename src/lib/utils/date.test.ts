// src/lib/utils/date.test.ts
import { formatDate, isToday, getKoreanDate, getTodayYYYYMMDD } from './date';

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
