/**
 * Strategy Evaluator Tests
 */

import {
  StrategyEvaluator,
  evaluateRace,
  calculateOddsDrift,
  calculateOddsStdDev,
  calculatePoolPercentage,
  type RaceContext,
  type EntryContext,
} from './evaluator';
import type { StrategyDefinition } from './types';

describe('StrategyEvaluator', () => {
  const baseStrategy: StrategyDefinition = {
    id: 'test-strategy',
    name: '테스트 전략',
    version: '1.0.0',
    conditions: [
      {
        field: 'odds_drift_pct',
        operator: 'lt',
        value: -20,
      },
      {
        field: 'popularity_rank',
        operator: 'lte',
        value: 3,
      },
    ],
    action: 'bet_win',
    metadata: {
      author: 'test',
      createdAt: '2025-01-01T00:00:00Z',
    },
  };

  const baseRace: RaceContext = {
    raceId: 'horse-seoul-1-20250101',
    raceDate: '2025-01-01',
    raceNo: 1,
    track: 'seoul',
    raceType: 'horse',
    entries: [
      {
        raceId: 'horse-seoul-1-20250101',
        entryNo: 1,
        odds_win: 2.5,
        odds_drift_pct: -25, // 25% 하락
        popularity_rank: 1,
        pool_total: 100000000,
        pool_win_pct: 30,
      },
      {
        raceId: 'horse-seoul-1-20250101',
        entryNo: 2,
        odds_win: 5.0,
        odds_drift_pct: -10, // 10% 하락 (조건 미충족)
        popularity_rank: 2,
        pool_total: 100000000,
        pool_win_pct: 20,
      },
      {
        raceId: 'horse-seoul-1-20250101',
        entryNo: 3,
        odds_win: 3.0,
        odds_drift_pct: -30, // 30% 하락
        popularity_rank: 5, // 인기순위 미충족
        pool_total: 100000000,
        pool_win_pct: 15,
      },
    ],
  };

  describe('evaluateRace', () => {
    it('should return matching entries', () => {
      const results = evaluateRace(baseStrategy, baseRace);

      // 엔트리 1만 모든 조건 충족 (drift -25% < -20%, rank 1 <= 3)
      expect(results).toHaveLength(1);
      expect(results[0].entryNo).toBe(1);
      expect(results[0].matched).toBe(true);
      expect(results[0].action).toBe('bet_win');
    });

    it('should return empty when no entries match', () => {
      const strategy: StrategyDefinition = {
        ...baseStrategy,
        conditions: [
          {
            field: 'odds_drift_pct',
            operator: 'lt',
            value: -50, // 아무도 50% 이상 하락 안함
          },
        ],
      };

      const results = evaluateRace(strategy, baseRace);
      expect(results).toHaveLength(0);
    });

    it('should apply race type filter', () => {
      const strategy: StrategyDefinition = {
        ...baseStrategy,
        filters: {
          raceTypes: ['cycle'], // cycle만 허용
        },
      };

      const results = evaluateRace(strategy, baseRace); // horse 경주
      expect(results).toHaveLength(0);
    });

    it('should apply track filter', () => {
      const strategy: StrategyDefinition = {
        ...baseStrategy,
        filters: {
          tracks: ['busan'], // busan만 허용
        },
      };

      const results = evaluateRace(strategy, baseRace); // seoul 경주
      expect(results).toHaveLength(0);
    });

    it('should apply minEntries filter', () => {
      const strategy: StrategyDefinition = {
        ...baseStrategy,
        filters: {
          minEntries: 10, // 최소 10마리
        },
      };

      const results = evaluateRace(strategy, baseRace); // 3마리
      expect(results).toHaveLength(0);
    });
  });

  describe('evaluateEntry', () => {
    it('should evaluate all conditions', () => {
      const evaluator = new StrategyEvaluator(baseStrategy);
      const result = evaluator.evaluateEntry(baseRace.entries[0], baseRace);

      expect(result.conditionResults).toHaveLength(2);
      expect(result.conditionResults[0].field).toBe('odds_drift_pct');
      expect(result.conditionResults[0].matched).toBe(true);
      expect(result.conditionResults[1].field).toBe('popularity_rank');
      expect(result.conditionResults[1].matched).toBe(true);
    });

    it('should stop on first failed condition', () => {
      const evaluator = new StrategyEvaluator(baseStrategy);
      const result = evaluator.evaluateEntry(baseRace.entries[1], baseRace);

      // drift 조건 실패 후 중단
      expect(result.matched).toBe(false);
      expect(result.conditionResults).toHaveLength(1);
      expect(result.conditionResults[0].matched).toBe(false);
    });

    it('should handle missing field values', () => {
      const evaluator = new StrategyEvaluator(baseStrategy);
      const entryWithMissingData: EntryContext = {
        raceId: 'test',
        entryNo: 1,
        // odds_drift_pct is missing
      };

      const result = evaluator.evaluateEntry(entryWithMissingData, baseRace);
      expect(result.matched).toBe(false);
      expect(result.conditionResults[0].error).toContain('no value');
    });
  });

  describe('condition operators', () => {
    it('should handle eq operator', () => {
      const strategy: StrategyDefinition = {
        ...baseStrategy,
        conditions: [{ field: 'popularity_rank', operator: 'eq', value: 1 }],
      };

      const results = evaluateRace(strategy, baseRace);
      expect(results).toHaveLength(1);
      expect(results[0].entryNo).toBe(1);
    });

    it('should handle ne operator', () => {
      const strategy: StrategyDefinition = {
        ...baseStrategy,
        conditions: [{ field: 'popularity_rank', operator: 'ne', value: 1 }],
      };

      const results = evaluateRace(strategy, baseRace);
      expect(results).toHaveLength(2);
      expect(results.map((r) => r.entryNo)).toEqual([2, 3]);
    });

    it('should handle between operator', () => {
      const strategy: StrategyDefinition = {
        ...baseStrategy,
        conditions: [{ field: 'odds_win', operator: 'between', value: [2.0, 4.0] }],
      };

      const results = evaluateRace(strategy, baseRace);
      expect(results).toHaveLength(2);
      expect(results.map((r) => r.entryNo).sort()).toEqual([1, 3]);
    });

    it('should handle in operator', () => {
      const strategy: StrategyDefinition = {
        ...baseStrategy,
        conditions: [{ field: 'popularity_rank', operator: 'in', value: [1, 2] }],
      };

      const results = evaluateRace(strategy, baseRace);
      expect(results).toHaveLength(2);
      expect(results.map((r) => r.entryNo).sort()).toEqual([1, 2]);
    });
  });

  describe('time reference', () => {
    it('should use first odds when timeRef is first', () => {
      const entryWithTimeline: EntryContext = {
        raceId: 'test',
        entryNo: 1,
        odds_win: 3.0, // current
        popularity_rank: 1,
        oddsTimeline: [
          { time: new Date('2025-01-01T10:00:00Z'), odds_win: 5.0 },
          { time: new Date('2025-01-01T11:00:00Z'), odds_win: 4.0 },
          { time: new Date('2025-01-01T12:00:00Z'), odds_win: 3.0 },
        ],
      };

      const strategy: StrategyDefinition = {
        ...baseStrategy,
        conditions: [{ field: 'odds_win', operator: 'eq', value: 5.0, timeRef: 'first' }],
      };

      const evaluator = new StrategyEvaluator(strategy);
      const result = evaluator.evaluateEntry(
        entryWithTimeline,
        { ...baseRace, entries: [entryWithTimeline] }
      );

      expect(result.matched).toBe(true);
      expect(result.conditionResults[0].actualValue).toBe(5.0);
    });

    it('should use last odds when timeRef is last', () => {
      const entryWithTimeline: EntryContext = {
        raceId: 'test',
        entryNo: 1,
        odds_win: 3.0,
        popularity_rank: 1,
        oddsTimeline: [
          { time: new Date('2025-01-01T10:00:00Z'), odds_win: 5.0 },
          { time: new Date('2025-01-01T11:00:00Z'), odds_win: 4.0 },
          { time: new Date('2025-01-01T12:00:00Z'), odds_win: 3.0 },
        ],
      };

      const strategy: StrategyDefinition = {
        ...baseStrategy,
        conditions: [{ field: 'odds_win', operator: 'eq', value: 3.0, timeRef: 'last' }],
      };

      const evaluator = new StrategyEvaluator(strategy);
      const result = evaluator.evaluateEntry(
        entryWithTimeline,
        { ...baseRace, entries: [entryWithTimeline] }
      );

      expect(result.matched).toBe(true);
      expect(result.conditionResults[0].actualValue).toBe(3.0);
    });
  });

  describe('entry_count field', () => {
    it('should evaluate entry_count from race entries', () => {
      const strategy: StrategyDefinition = {
        ...baseStrategy,
        conditions: [{ field: 'entry_count', operator: 'eq', value: 3 }],
      };

      const results = evaluateRace(strategy, baseRace);
      expect(results).toHaveLength(3); // 모든 엔트리가 매칭
    });
  });
});

describe('Helper Functions', () => {
  describe('calculateOddsDrift', () => {
    it('should calculate positive drift', () => {
      const drift = calculateOddsDrift(2.0, 3.0);
      expect(drift).toBe(50); // +50%
    });

    it('should calculate negative drift', () => {
      const drift = calculateOddsDrift(4.0, 2.0);
      expect(drift).toBe(-50); // -50%
    });

    it('should handle zero first odds', () => {
      const drift = calculateOddsDrift(0, 2.0);
      expect(drift).toBe(0);
    });
  });

  describe('calculateOddsStdDev', () => {
    it('should calculate standard deviation', () => {
      const stddev = calculateOddsStdDev([2, 4, 4, 4, 5, 5, 7, 9]);
      expect(stddev).toBeCloseTo(2.0, 1);
    });

    it('should return 0 for empty array', () => {
      const stddev = calculateOddsStdDev([]);
      expect(stddev).toBe(0);
    });

    it('should return 0 for single value', () => {
      const stddev = calculateOddsStdDev([5]);
      expect(stddev).toBe(0);
    });
  });

  describe('calculatePoolPercentage', () => {
    it('should calculate percentage', () => {
      const pct = calculatePoolPercentage(30000000, 100000000);
      expect(pct).toBe(30);
    });

    it('should handle zero total', () => {
      const pct = calculatePoolPercentage(1000, 0);
      expect(pct).toBe(0);
    });
  });
});

describe('StrategyEvaluator.getSupportedFields', () => {
  it('should return Phase 0 fields by default', () => {
    const fields = StrategyEvaluator.getSupportedFields(0);
    expect(fields).toContain('odds_win');
    expect(fields).toContain('odds_drift_pct');
    expect(fields).toContain('popularity_rank');
    expect(fields).not.toContain('horse_rating'); // Phase 1
  });

  it('should return Phase 0 and 1 fields', () => {
    const fields = StrategyEvaluator.getSupportedFields(1);
    expect(fields).toContain('odds_win');
    expect(fields).toContain('horse_rating');
    expect(fields).toContain('burden_weight');
  });
});
