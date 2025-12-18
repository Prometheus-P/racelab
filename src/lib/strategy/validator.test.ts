/**
 * Strategy DSL Validator Tests
 */

import {
  validateStrategy,
  validateCondition,
  validateBacktestRequest,
  parseStrategy,
  safeParseStrategy,
  isValidStrategy,
  getFieldsByPhase,
} from './validator';
import type { StrategyDefinition, StrategyCondition } from './types';

describe('Strategy Validator', () => {
  const validStrategy: StrategyDefinition = {
    id: 'test-strategy-1',
    name: '테스트 전략',
    version: '1.0.0',
    conditions: [
      {
        field: 'odds_drift_pct',
        operator: 'lt',
        value: -20,
        timeRef: 'last',
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
      description: '배당률 급락 모멘텀 전략',
    },
  };

  describe('validateStrategy', () => {
    it('should validate a correct strategy', () => {
      const result = validateStrategy(validStrategy);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject strategy with invalid field', () => {
      const invalid = {
        ...validStrategy,
        conditions: [
          {
            field: 'invalid_field',
            operator: 'gt',
            value: 10,
          },
        ],
      };
      const result = validateStrategy(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('INVALID_FIELD');
    });

    it('should reject strategy with invalid operator', () => {
      const invalid = {
        ...validStrategy,
        conditions: [
          {
            field: 'odds_win',
            operator: 'invalid_op',
            value: 10,
          },
        ],
      };
      const result = validateStrategy(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('INVALID_OPERATOR');
    });

    it('should reject strategy with empty conditions', () => {
      const invalid = {
        ...validStrategy,
        conditions: [],
      };
      const result = validateStrategy(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('EMPTY_CONDITIONS');
    });

    it('should reject strategy with too many conditions', () => {
      const invalid = {
        ...validStrategy,
        conditions: Array(11).fill({
          field: 'odds_win',
          operator: 'gt',
          value: 2,
        }),
      };
      const result = validateStrategy(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('TOO_MANY_CONDITIONS');
    });

    it('should validate between operator with range value', () => {
      const strategy = {
        ...validStrategy,
        conditions: [
          {
            field: 'odds_win',
            operator: 'between',
            value: [2.0, 10.0],
          },
        ],
      };
      const result = validateStrategy(strategy);
      expect(result.valid).toBe(true);
    });

    it('should reject between operator with non-range value', () => {
      const invalid = {
        ...validStrategy,
        conditions: [
          {
            field: 'odds_win',
            operator: 'between',
            value: 5, // Should be [min, max]
          },
        ],
      };
      const result = validateStrategy(invalid);
      expect(result.valid).toBe(false);
    });

    it('should validate in operator with array value', () => {
      const strategy = {
        ...validStrategy,
        conditions: [
          {
            field: 'popularity_rank',
            operator: 'in',
            value: [1, 2, 3],
          },
        ],
      };
      const result = validateStrategy(strategy);
      expect(result.valid).toBe(true);
    });

    it('should warn when using Phase 1+ fields', () => {
      const strategy = {
        ...validStrategy,
        conditions: [
          {
            field: 'horse_rating', // Phase 1 field
            operator: 'gte',
            value: 100,
          },
        ],
      };
      const result = validateStrategy(strategy);
      expect(result.valid).toBe(true);
      expect(result.warnings).toBeDefined();
      expect(result.warnings?.[0]).toContain('Phase 1');
    });

    it('should reject invalid version format', () => {
      const invalid = {
        ...validStrategy,
        version: 'v1.0', // Should be x.y.z
      };
      const result = validateStrategy(invalid);
      expect(result.valid).toBe(false);
    });

    it('should reject invalid ID format', () => {
      const invalid = {
        ...validStrategy,
        id: 'invalid id with spaces',
      };
      const result = validateStrategy(invalid);
      expect(result.valid).toBe(false);
    });

    it('should validate optional stake configuration', () => {
      const strategy = {
        ...validStrategy,
        stake: {
          fixed: 10000,
          percentOfBankroll: 5,
          useKelly: true,
        },
      };
      const result = validateStrategy(strategy);
      expect(result.valid).toBe(true);
    });

    it('should validate optional filters', () => {
      const strategy = {
        ...validStrategy,
        filters: {
          raceTypes: ['horse', 'cycle'],
          tracks: ['seoul', 'busan'],
          minEntries: 8,
        },
      };
      const result = validateStrategy(strategy);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateCondition', () => {
    it('should validate a correct condition', () => {
      const condition: StrategyCondition = {
        field: 'odds_win',
        operator: 'gte',
        value: 2.5,
      };
      const result = validateCondition(condition);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid field', () => {
      const result = validateCondition({
        field: 'not_a_field',
        operator: 'gt',
        value: 1,
      });
      expect(result.valid).toBe(false);
    });
  });

  describe('validateBacktestRequest', () => {
    const validRequest = {
      strategy: validStrategy,
      dateRange: {
        from: '2024-01-01',
        to: '2024-03-31',
      },
      initialCapital: 1000000,
    };

    it('should validate a correct backtest request', () => {
      const result = validateBacktestRequest(validRequest);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid date format', () => {
      const invalid = {
        ...validRequest,
        dateRange: {
          from: '2024/01/01',
          to: '2024-03-31',
        },
      };
      const result = validateBacktestRequest(invalid);
      expect(result.valid).toBe(false);
    });

    it('should reject when from > to', () => {
      const invalid = {
        ...validRequest,
        dateRange: {
          from: '2024-03-31',
          to: '2024-01-01',
        },
      };
      const result = validateBacktestRequest(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('INVALID_DATE_RANGE');
    });

    it('should reject period exceeding 365 days', () => {
      const invalid = {
        ...validRequest,
        dateRange: {
          from: '2022-01-01',
          to: '2024-01-01',
        },
      };
      const result = validateBacktestRequest(invalid);
      expect(result.valid).toBe(false);
      expect(result.errors[0].code).toBe('INVALID_DATE_RANGE');
    });
  });

  describe('parseStrategy', () => {
    it('should parse valid JSON string', () => {
      const jsonString = JSON.stringify(validStrategy);
      const parsed = parseStrategy(jsonString);
      expect(parsed.id).toBe(validStrategy.id);
      expect(parsed.conditions).toHaveLength(2);
    });

    it('should throw on invalid JSON', () => {
      expect(() => parseStrategy('not valid json')).toThrow('Invalid JSON format');
    });

    it('should throw on validation failure', () => {
      const invalid = JSON.stringify({ ...validStrategy, conditions: [] });
      expect(() => parseStrategy(invalid)).toThrow('Strategy validation failed');
    });
  });

  describe('safeParseStrategy', () => {
    it('should return success for valid strategy', () => {
      const result = safeParseStrategy(JSON.stringify(validStrategy));
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should return error for invalid strategy', () => {
      const result = safeParseStrategy('invalid');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('isValidStrategy', () => {
    it('should return true for valid strategy', () => {
      expect(isValidStrategy(validStrategy)).toBe(true);
    });

    it('should return false for invalid strategy', () => {
      expect(isValidStrategy({ invalid: true })).toBe(false);
    });
  });

  describe('getFieldsByPhase', () => {
    it('should return only Phase 0 fields', () => {
      const fields = getFieldsByPhase(0);
      expect(fields).toContain('odds_win');
      expect(fields).toContain('odds_drift_pct');
      expect(fields).toContain('popularity_rank');
      expect(fields).not.toContain('horse_rating'); // Phase 1
    });

    it('should return Phase 0 and 1 fields', () => {
      const fields = getFieldsByPhase(1);
      expect(fields).toContain('odds_win');
      expect(fields).toContain('horse_rating');
      expect(fields).toContain('burden_weight');
    });
  });
});
