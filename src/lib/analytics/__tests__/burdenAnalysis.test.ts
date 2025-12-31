/**
 * Burden Weight Analysis Tests
 */

import {
  analyzeBurden,
  getOptimalRatio,
  calculateImpact,
  calculateFitScore,
  getAssessment,
  findOptimalBurden,
  optimizeBurden,
  analyzeHistoricalBurden,
  getBurdenScoreForPrediction,
  compareBurdenAdvantage,
  BURDEN_CONSTANTS,
  type BurdenHistory,
} from '../burdenAnalysis';

describe('Burden Analysis Core', () => {
  describe('analyzeBurden', () => {
    it('should calculate burden ratio correctly', () => {
      const result = analyzeBurden('TestHorse', 55, 500);

      expect(result.horseName).toBe('TestHorse');
      expect(result.burdenWeight).toBe(55);
      expect(result.horseWeight).toBe(500);
      expect(result.burdenRatio).toBe(11); // 55/500 * 100 = 11%
    });

    it('should identify optimal burden ratio', () => {
      // 최적 비율 11% ± 0.5%
      const result = analyzeBurden('OptimalHorse', 55, 500);

      expect(result.assessment).toBe('optimal');
      expect(result.fitScore).toBe(100);
    });

    it('should identify light burden', () => {
      // 10% = 1% below optimal
      const result = analyzeBurden('LightHorse', 50, 500);

      expect(result.burdenRatio).toBe(10);
      expect(result.assessment).toBe('light');
      expect(result.fitScore).toBeLessThan(100);
    });

    it('should identify heavy burden', () => {
      // 13% = 2% above optimal
      const result = analyzeBurden('HeavyHorse', 65, 500);

      expect(result.burdenRatio).toBe(13);
      expect(result.assessment).toBe('heavy');
      expect(result.fitScore).toBeLessThan(75); // 편차 2%는 약 62.5점
    });

    it('should calculate expected impact in lengths', () => {
      // 1kg ≈ 1마신 (2.5m)
      const result = analyzeBurden('TestHorse', 60, 500);

      // 12% ratio, 1% deviation = 5kg deviation = 5 lengths
      expect(result.expectedImpact).toBeGreaterThan(0);
    });

    it('should handle zero horse weight', () => {
      const result = analyzeBurden('ZeroWeight', 55, 0);

      expect(result.burdenRatio).toBe(0);
      // 마체중 0일 때 burdenRatio=0, deviation=-11 → fitScore=0
      expect(result.fitScore).toBe(0);
    });
  });

  describe('getOptimalRatio', () => {
    it('should return default optimal ratio', () => {
      const ratio = getOptimalRatio();

      expect(ratio).toBe(BURDEN_CONSTANTS.OPTIMAL_RATIO);
    });

    it('should adjust for young horses', () => {
      const youngRatio = getOptimalRatio(undefined, 3);

      expect(youngRatio).toBeLessThan(BURDEN_CONSTANTS.OPTIMAL_RATIO);
    });

    it('should not adjust for older horses', () => {
      const oldRatio = getOptimalRatio(undefined, 5);

      expect(oldRatio).toBe(BURDEN_CONSTANTS.OPTIMAL_RATIO);
    });
  });

  describe('calculateImpact', () => {
    it('should convert deviation to lengths', () => {
      // 1% deviation at 500kg = 5kg = 5 lengths
      const impact = calculateImpact(1, 500);

      expect(impact).toBe(5);
    });

    it('should handle negative deviation', () => {
      const impact = calculateImpact(-1, 500);

      expect(impact).toBe(-5);
    });
  });

  describe('calculateFitScore', () => {
    it('should return 100 for optimal deviation', () => {
      const score = calculateFitScore(0);
      expect(score).toBe(100);

      const smallDev = calculateFitScore(0.4); // within acceptable
      expect(smallDev).toBe(100);
    });

    it('should decrease score for larger deviation', () => {
      const score1 = calculateFitScore(1);
      const score2 = calculateFitScore(2);

      expect(score1).toBeLessThan(100);
      expect(score2).toBeLessThan(score1);
    });

    it('should not go below 0', () => {
      const score = calculateFitScore(10);
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getAssessment', () => {
    it('should classify deviations correctly', () => {
      expect(getAssessment(0)).toBe('optimal');
      expect(getAssessment(0.3)).toBe('optimal');
      expect(getAssessment(-1)).toBe('light');
      expect(getAssessment(0.8)).toBe('slightly_heavy');
      expect(getAssessment(1.5)).toBe('heavy');
      expect(getAssessment(3)).toBe('very_heavy');
    });
  });
});

describe('Burden Optimization', () => {
  describe('findOptimalBurden', () => {
    it('should calculate optimal burden for horse weight', () => {
      const optimal = findOptimalBurden(500);

      expect(optimal).toBe(55); // 500 * 0.11 = 55
    });

    it('should round to nearest kg', () => {
      const optimal = findOptimalBurden(480);

      expect(optimal).toBe(53); // 480 * 0.11 = 52.8 → 53
    });
  });

  describe('optimizeBurden', () => {
    it('should recommend no change for optimal burden', () => {
      const result = optimizeBurden(55, 500);

      expect(result.difference).toBe(0);
      expect(result.recommendation).toContain('적정');
    });

    it('should calculate position change for heavy burden', () => {
      const result = optimizeBurden(60, 500);

      expect(result.difference).toBe(5);
      expect(result.expectedPositionChange).toBe(5);
      expect(result.recommendation).toContain('초과');
    });

    it('should calculate advantage for light burden', () => {
      const result = optimizeBurden(50, 500);

      expect(result.difference).toBe(-5);
      expect(result.recommendation).toContain('유리');
    });
  });
});

describe('Historical Burden Analysis', () => {
  describe('analyzeHistoricalBurden', () => {
    it('should return defaults for empty history', () => {
      const result = analyzeHistoricalBurden([]);

      expect(result.avgBurden).toBe(0);
      expect(result.avgRatio).toBe(0);
      expect(result.correlation).toBe(0);
    });

    it('should calculate averages correctly', () => {
      const history: BurdenHistory[] = [
        { date: '2024-01-01', burden: 55, horseWeight: 500, position: 1, distance: 1400 },
        { date: '2024-01-08', burden: 56, horseWeight: 510, position: 2, distance: 1400 },
      ];

      const result = analyzeHistoricalBurden(history);

      expect(result.avgBurden).toBe(55.5);
      expect(result.bestPerformanceBurden).toBe(55);
    });

    it('should find winning ratio range', () => {
      const history: BurdenHistory[] = [
        { date: '2024-01-01', burden: 54, horseWeight: 500, position: 1, distance: 1400 },
        { date: '2024-01-08', burden: 56, horseWeight: 500, position: 2, distance: 1400 },
        { date: '2024-01-15', burden: 55, horseWeight: 500, position: 3, distance: 1400 },
        { date: '2024-01-22', burden: 58, horseWeight: 500, position: 8, distance: 1400 },
      ];

      const result = analyzeHistoricalBurden(history);

      expect(result.winningRatioRange.min).toBeCloseTo(10.8, 1); // 54/500
      expect(result.winningRatioRange.max).toBeCloseTo(11.2, 1); // 56/500
    });

    it('should calculate correlation between burden and position', () => {
      const history: BurdenHistory[] = [
        { date: '2024-01-01', burden: 54, horseWeight: 500, position: 1, distance: 1400 },
        { date: '2024-01-08', burden: 55, horseWeight: 500, position: 2, distance: 1400 },
        { date: '2024-01-15', burden: 56, horseWeight: 500, position: 3, distance: 1400 },
        { date: '2024-01-22', burden: 57, horseWeight: 500, position: 4, distance: 1400 },
      ];

      const result = analyzeHistoricalBurden(history);

      // 높은 양의 상관관계 (무거울수록 순위 떨어짐)
      expect(result.correlation).toBeGreaterThan(0.9);
    });
  });
});

describe('Prediction Integration', () => {
  describe('getBurdenScoreForPrediction', () => {
    it('should return fit score', () => {
      const score = getBurdenScoreForPrediction(55, 500);

      expect(score).toBe(100); // optimal burden
    });

    it('should return 50 for zero horse weight', () => {
      const score = getBurdenScoreForPrediction(55, 0);

      expect(score).toBe(50);
    });
  });

  describe('compareBurdenAdvantage', () => {
    it('should return 50 for empty opponents', () => {
      const score = compareBurdenAdvantage(55, []);

      expect(score).toBe(50);
    });

    it('should give higher score for lighter burden', () => {
      const score = compareBurdenAdvantage(52, [55, 56, 57]);

      expect(score).toBeGreaterThan(50);
    });

    it('should give lower score for heavier burden', () => {
      const score = compareBurdenAdvantage(58, [55, 56, 57]);

      expect(score).toBeLessThan(50);
    });

    it('should cap scores at 0-100', () => {
      const veryLight = compareBurdenAdvantage(45, [60, 62, 65]);
      const veryHeavy = compareBurdenAdvantage(65, [50, 52, 55]);

      expect(veryLight).toBeLessThanOrEqual(100);
      expect(veryLight).toBeGreaterThanOrEqual(0);
      expect(veryHeavy).toBeLessThanOrEqual(100);
      expect(veryHeavy).toBeGreaterThanOrEqual(0);
    });
  });
});
