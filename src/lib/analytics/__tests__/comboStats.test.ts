/**
 * Combo Stats Analysis Tests
 */

import {
  analyzeCombo,
  filterSynergyticCombos,
  rankCombos,
  summarizeComboStats,
  toJockeyTrainerCombo,
  getComboScoreForPrediction,
  isPositiveSynergy,
  getComboReliability,
  type ComboAnalysis,
  type ComboSearchFilters,
} from '../comboStats';
import type { ComboStats } from '../types';

const createMockComboStats = (overrides: Partial<ComboStats> = {}): ComboStats => ({
  id: 'JK001-TR001',
  name: '김용근 - 박상복',
  starts: 30,
  wins: 6,
  rate: 20,
  ...overrides,
});

describe('Combo Analysis Core', () => {
  describe('analyzeCombo', () => {
    it('should calculate basic combo metrics', () => {
      const combo = createMockComboStats();
      const result = analyzeCombo(combo, 15, 10);

      expect(result.jockeyId).toBe('JK001');
      expect(result.trainerId).toBe('TR001');
      expect(result.starts).toBe(30);
      expect(result.wins).toBe(6);
      expect(result.winRate).toBe(20); // 6/30 * 100
    });

    it('should calculate place rate with seconds and thirds', () => {
      const combo = createMockComboStats();
      const result = analyzeCombo(combo, 15, 10, {
        seconds: 5,
        thirds: 4,
      });

      // places = 6 + 5 + 4 = 15
      expect(result.placeRate).toBe(50); // 15/30 * 100
    });

    it('should calculate synergy score', () => {
      const combo = createMockComboStats({ wins: 9 }); // 30% win rate
      const result = analyzeCombo(combo, 15, 10); // avg 12.5%

      expect(result.synergyScore).toBeGreaterThan(50);
      expect(result.upliftPercent).toBeGreaterThan(0);
    });

    it('should assign synergy grade', () => {
      const combo = createMockComboStats({ wins: 12 }); // 40% win rate
      const result = analyzeCombo(combo, 15, 10, {
        recentForm: [1, 1, 2, 1, 1],
      });

      expect(['S', 'A', 'B', 'C', 'D']).toContain(result.synergyGrade);
    });

    it('should handle zero starts', () => {
      const combo = createMockComboStats({ starts: 0, wins: 0 });
      const result = analyzeCombo(combo, 15, 10);

      expect(result.winRate).toBe(0);
      expect(result.placeRate).toBe(0);
    });
  });
});

describe('Combo Filtering', () => {
  let combos: ComboAnalysis[];

  beforeEach(() => {
    combos = [
      analyzeCombo(createMockComboStats({ id: 'JK001-TR001', starts: 50, wins: 15 }), 15, 10),
      analyzeCombo(createMockComboStats({ id: 'JK002-TR002', starts: 20, wins: 4 }), 12, 8),
      analyzeCombo(createMockComboStats({ id: 'JK003-TR003', starts: 10, wins: 1 }), 10, 6),
    ];
  });

  describe('filterSynergyticCombos', () => {
    it('should filter by minimum starts', () => {
      const filtered = filterSynergyticCombos(combos, { minStarts: 30 });

      expect(filtered.length).toBe(1);
      expect(filtered[0].starts).toBeGreaterThanOrEqual(30);
    });

    it('should filter by minimum win rate', () => {
      const filtered = filterSynergyticCombos(combos, { minWinRate: 20 });

      expect(filtered.every((c) => c.winRate >= 20)).toBe(true);
    });

    it('should filter by synergy grade', () => {
      const filtered = filterSynergyticCombos(combos, { synergyGrade: 'B' });

      const gradeOrder = ['S', 'A', 'B', 'C', 'D'];
      expect(filtered.every((c) => gradeOrder.indexOf(c.synergyGrade) <= 2)).toBe(true);
    });

    it('should combine multiple filters', () => {
      const filtered = filterSynergyticCombos(combos, {
        minStarts: 15,
        minWinRate: 10,
      });

      expect(filtered.every((c) => c.starts >= 15 && c.winRate >= 10)).toBe(true);
    });
  });
});

describe('Combo Ranking', () => {
  let combos: ComboAnalysis[];

  beforeEach(() => {
    combos = [
      analyzeCombo(createMockComboStats({ id: 'A', starts: 30, wins: 6 }), 15, 10),
      analyzeCombo(createMockComboStats({ id: 'B', starts: 50, wins: 20 }), 15, 10),
      analyzeCombo(createMockComboStats({ id: 'C', starts: 20, wins: 4 }), 15, 10),
    ];
  });

  describe('rankCombos', () => {
    it('should sort by synergy score descending', () => {
      const ranked = rankCombos(combos, 'synergyScore', 'desc');

      for (let i = 0; i < ranked.length - 1; i++) {
        expect(ranked[i].synergyScore).toBeGreaterThanOrEqual(ranked[i + 1].synergyScore);
      }
    });

    it('should sort by win rate ascending', () => {
      const ranked = rankCombos(combos, 'winRate', 'asc');

      for (let i = 0; i < ranked.length - 1; i++) {
        expect(ranked[i].winRate).toBeLessThanOrEqual(ranked[i + 1].winRate);
      }
    });

    it('should sort by starts', () => {
      const ranked = rankCombos(combos, 'starts', 'desc');

      expect(ranked[0].starts).toBe(50);
      expect(ranked[2].starts).toBe(20);
    });

    it('should sort by uplift', () => {
      const ranked = rankCombos(combos, 'uplift', 'desc');

      for (let i = 0; i < ranked.length - 1; i++) {
        expect(ranked[i].upliftPercent).toBeGreaterThanOrEqual(ranked[i + 1].upliftPercent);
      }
    });
  });
});

describe('Combo Statistics Summary', () => {
  describe('summarizeComboStats', () => {
    it('should return defaults for empty array', () => {
      const summary = summarizeComboStats([]);

      expect(summary.totalCombos).toBe(0);
      expect(summary.avgWinRate).toBe(0);
      expect(summary.topPerformers).toHaveLength(0);
    });

    it('should calculate averages correctly', () => {
      const combos = [
        analyzeCombo(createMockComboStats({ starts: 10, wins: 2 }), 15, 10), // 20%
        analyzeCombo(createMockComboStats({ starts: 10, wins: 3 }), 15, 10), // 30%
      ];

      const summary = summarizeComboStats(combos);

      expect(summary.avgWinRate).toBe(25); // (20 + 30) / 2
    });

    it('should count grade distribution', () => {
      const combos = [
        analyzeCombo(createMockComboStats({ starts: 50, wins: 20 }), 10, 10, {
          recentForm: [1, 1, 1, 1, 1],
        }),
        analyzeCombo(createMockComboStats({ starts: 30, wins: 3 }), 15, 10),
        analyzeCombo(createMockComboStats({ starts: 10, wins: 1 }), 15, 10),
      ];

      const summary = summarizeComboStats(combos);

      const total = Object.values(summary.gradeDistribution).reduce((a, b) => a + b, 0);
      expect(total).toBe(3);
    });

    it('should return top 5 performers', () => {
      const combos = Array.from({ length: 10 }, (_, i) =>
        analyzeCombo(createMockComboStats({ id: `JK-TR${i}`, starts: 30, wins: i + 1 }), 15, 10)
      );

      const summary = summarizeComboStats(combos);

      expect(summary.topPerformers).toHaveLength(5);
    });
  });
});

describe('Prediction Integration', () => {
  describe('toJockeyTrainerCombo', () => {
    it('should convert analysis to JockeyTrainerCombo', () => {
      const analysis = analyzeCombo(createMockComboStats(), 15, 10);
      const combo = toJockeyTrainerCombo(analysis);

      expect(combo.jockeyId).toBe(analysis.jockeyId);
      expect(combo.trainerId).toBe(analysis.trainerId);
      expect(combo.meet).toBe('1');
      expect(combo.meetName).toBe('서울');
    });

    it('should accept custom meet', () => {
      const analysis = analyzeCombo(createMockComboStats(), 15, 10);
      const combo = toJockeyTrainerCombo(analysis, '3', '부산');

      expect(combo.meet).toBe('3');
      expect(combo.meetName).toBe('부산');
    });
  });

  describe('getComboScoreForPrediction', () => {
    it('should return neutral for insufficient data', () => {
      const score = getComboScoreForPrediction(20, 15, 10, 2);

      expect(score).toBe(50);
    });

    it('should return neutral for undefined win rate', () => {
      const score = getComboScoreForPrediction(undefined, 15, 10, 30);

      expect(score).toBe(50);
    });

    it('should calculate synergy score for sufficient data', () => {
      const score = getComboScoreForPrediction(25, 15, 10, 30);

      expect(score).toBeGreaterThan(50);
    });
  });

  describe('isPositiveSynergy', () => {
    it('should return true for significant uplift', () => {
      // Expected: (15 + 10) / 2 = 12.5
      // Threshold: 12.5 * 1.1 = 13.75
      const result = isPositiveSynergy(15, 15, 10);

      expect(result).toBe(true);
    });

    it('should return false for minor uplift', () => {
      const result = isPositiveSynergy(13, 15, 10);

      expect(result).toBe(false);
    });

    it('should return false for negative synergy', () => {
      const result = isPositiveSynergy(10, 15, 10);

      expect(result).toBe(false);
    });
  });

  describe('getComboReliability', () => {
    it('should return high for 30+ starts', () => {
      expect(getComboReliability(30)).toBe('high');
      expect(getComboReliability(50)).toBe('high');
    });

    it('should return medium for 10-29 starts', () => {
      expect(getComboReliability(10)).toBe('medium');
      expect(getComboReliability(29)).toBe('medium');
    });

    it('should return low for under 10 starts', () => {
      expect(getComboReliability(9)).toBe('low');
      expect(getComboReliability(1)).toBe('low');
    });
  });
});
