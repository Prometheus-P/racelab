/**
 * Prediction Cache Tests
 */

import {
  createPredictionCacheKey,
  createDateCachePattern,
  PREDICTION_CACHE_TTL,
} from '../cache/predictionCache';

describe('Prediction Cache', () => {
  describe('createPredictionCacheKey', () => {
    it('should create a properly formatted cache key', () => {
      const key = createPredictionCacheKey('1-20241225-05', 'v1.0.0');
      expect(key).toBe('predictions:v1:v1.0.0:1-20241225-05');
    });

    it('should handle different model versions', () => {
      const key1 = createPredictionCacheKey('race-123', 'v1.0.0');
      const key2 = createPredictionCacheKey('race-123', 'v2.0.0');

      expect(key1).not.toBe(key2);
      expect(key1).toContain('v1.0.0');
      expect(key2).toContain('v2.0.0');
    });
  });

  describe('createDateCachePattern', () => {
    it('should create a wildcard pattern for date-based deletion', () => {
      const pattern = createDateCachePattern('20241225');
      expect(pattern).toBe('predictions:v1:*:*-20241225-*');
    });
  });

  describe('PREDICTION_CACHE_TTL', () => {
    it('should have appropriate TTL values', () => {
      expect(PREDICTION_CACHE_TTL.PRE_RACE).toBe(300); // 5 minutes
      expect(PREDICTION_CACHE_TTL.LIVE).toBe(60); // 1 minute
      expect(PREDICTION_CACHE_TTL.POST_RACE).toBe(86400); // 24 hours
    });

    it('should have LIVE TTL shorter than PRE_RACE', () => {
      expect(PREDICTION_CACHE_TTL.LIVE).toBeLessThan(PREDICTION_CACHE_TTL.PRE_RACE);
    });

    it('should have POST_RACE TTL longest', () => {
      expect(PREDICTION_CACHE_TTL.POST_RACE).toBeGreaterThan(PREDICTION_CACHE_TTL.PRE_RACE);
      expect(PREDICTION_CACHE_TTL.POST_RACE).toBeGreaterThan(PREDICTION_CACHE_TTL.LIVE);
    });
  });
});
