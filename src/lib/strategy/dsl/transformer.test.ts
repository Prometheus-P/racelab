/**
 * Transformer Tests
 *
 * DSL ↔ Legacy 변환 테스트
 * Phase 3: Transformer
 */

import {
  isLegacyStrategy,
  isDSLStrategy,
  normalizeStrategy,
  transformDSLToLegacy,
  transformLegacyToDSL,
} from './transformer';
import type { StrategyDefinition } from '../types';
import type { DSLStrategyDefinition } from './types';

// =============================================================================
// Test Fixtures
// =============================================================================

const LEGACY_STRATEGY: StrategyDefinition = {
  id: 'legacy-001',
  name: 'Legacy Value Bet',
  version: '1.0.0',
  conditions: [
    { field: 'odds_win', operator: 'gte', value: 5.0 },
    { field: 'popularity_rank', operator: 'lte', value: 3 },
  ],
  action: 'bet_win',
  stake: {
    fixed: 10000,
  },
  metadata: {
    author: 'test-user',
    createdAt: '2024-01-01T00:00:00Z',
    description: 'Legacy format strategy',
  },
};

const DSL_STRATEGY: DSLStrategyDefinition = {
  strategy: {
    name: 'DSL Value Bet',
    version: 1,
    filters: [
      { field: 'odds.win', operator: 'gte', value: 5.0 },
      { field: 'popularity.rank', operator: 'lte', value: 3 },
    ],
    scoring: {
      formula: 'odds_win * 0.5 - 1',
      threshold: 0.5,
    },
    action: 'bet_win',
    stake: {
      fixed: 10000,
    },
    metadata: {
      author: 'test-user',
      description: 'DSL format strategy',
    },
  },
};

const DSL_STRATEGY_FLAT_FIELDS: DSLStrategyDefinition = {
  strategy: {
    name: 'DSL Flat Fields',
    version: 1,
    filters: [
      { field: 'odds_win', operator: 'gte', value: 5.0 },
      { field: 'popularity_rank', operator: 'lte', value: 3 },
    ],
    action: 'bet_win',
  },
};

const MINIMAL_DSL: DSLStrategyDefinition = {
  strategy: {
    name: 'Minimal DSL',
    version: 1,
    filters: [{ field: 'odds.win', operator: 'gte', value: 2.0 }],
  },
};

// =============================================================================
// Format Detection Tests
// =============================================================================

describe('isLegacyStrategy', () => {
  it('should return true for legacy format', () => {
    expect(isLegacyStrategy(LEGACY_STRATEGY)).toBe(true);
  });

  it('should return false for DSL format', () => {
    expect(isLegacyStrategy(DSL_STRATEGY)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isLegacyStrategy(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isLegacyStrategy(undefined)).toBe(false);
  });

  it('should return false for primitive', () => {
    expect(isLegacyStrategy('string')).toBe(false);
    expect(isLegacyStrategy(123)).toBe(false);
  });

  it('should return false for empty object', () => {
    expect(isLegacyStrategy({})).toBe(false);
  });

  it('should check for conditions array', () => {
    const hasConditions = { conditions: [], id: 'test', name: 'test', version: '1.0.0' };
    expect(isLegacyStrategy(hasConditions)).toBe(true);
  });
});

describe('isDSLStrategy', () => {
  it('should return true for DSL format', () => {
    expect(isDSLStrategy(DSL_STRATEGY)).toBe(true);
  });

  it('should return false for legacy format', () => {
    expect(isDSLStrategy(LEGACY_STRATEGY)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isDSLStrategy(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isDSLStrategy(undefined)).toBe(false);
  });

  it('should return false for primitive', () => {
    expect(isDSLStrategy('string')).toBe(false);
    expect(isDSLStrategy(123)).toBe(false);
  });

  it('should return false for empty object', () => {
    expect(isDSLStrategy({})).toBe(false);
  });

  it('should check for strategy wrapper', () => {
    const hasStrategy = { strategy: { name: 'test', version: 1, filters: [] } };
    expect(isDSLStrategy(hasStrategy)).toBe(true);
  });
});

// =============================================================================
// DSL to Legacy Transformation Tests
// =============================================================================

describe('transformDSLToLegacy', () => {
  it('should transform DSL to legacy format', () => {
    const result = transformDSLToLegacy(DSL_STRATEGY);

    expect(result.name).toBe('DSL Value Bet');
    expect(result.version).toBe('1');
    expect(result.conditions).toHaveLength(2);
    expect(result.action).toBe('bet_win');
  });

  it('should generate UUID for id', () => {
    const result = transformDSLToLegacy(DSL_STRATEGY);
    expect(result.id).toBeDefined();
    expect(result.id.length).toBeGreaterThan(0);
  });

  it('should convert dot notation fields to flat', () => {
    const result = transformDSLToLegacy(DSL_STRATEGY);

    expect(result.conditions[0].field).toBe('odds_win');
    expect(result.conditions[1].field).toBe('popularity_rank');
  });

  it('should preserve flat field names', () => {
    const result = transformDSLToLegacy(DSL_STRATEGY_FLAT_FIELDS);

    expect(result.conditions[0].field).toBe('odds_win');
    expect(result.conditions[1].field).toBe('popularity_rank');
  });

  it('should preserve operators and values', () => {
    const result = transformDSLToLegacy(DSL_STRATEGY);

    expect(result.conditions[0].operator).toBe('gte');
    expect(result.conditions[0].value).toBe(5.0);
    expect(result.conditions[1].operator).toBe('lte');
    expect(result.conditions[1].value).toBe(3);
  });

  it('should transform stake config', () => {
    const result = transformDSLToLegacy(DSL_STRATEGY);

    expect(result.stake).toBeDefined();
    expect(result.stake?.fixed).toBe(10000);
  });

  it('should transform metadata', () => {
    const result = transformDSLToLegacy(DSL_STRATEGY);

    expect(result.metadata.author).toBe('test-user');
    expect(result.metadata.description).toBe('DSL format strategy');
    expect(result.metadata.createdAt).toBeDefined();
  });

  it('should use default action when not specified', () => {
    const result = transformDSLToLegacy(MINIMAL_DSL);
    expect(result.action).toBe('bet_win');
  });

  it('should create default metadata when not specified', () => {
    const result = transformDSLToLegacy(MINIMAL_DSL);

    expect(result.metadata).toBeDefined();
    expect(result.metadata.author).toBe('anonymous');
    expect(result.metadata.createdAt).toBeDefined();
  });

  it('should handle filters with timeRef', () => {
    const dslWithTimeRef: DSLStrategyDefinition = {
      strategy: {
        name: 'With TimeRef',
        version: 1,
        filters: [
          { field: 'odds.win', operator: 'gte', value: 5.0, timeRef: 'T-5m' },
        ],
      },
    };

    const result = transformDSLToLegacy(dslWithTimeRef);
    expect(result.conditions[0].timeRef).toBe('T-5m');
  });

  it('should transform race filters', () => {
    const dslWithRaceFilters: DSLStrategyDefinition = {
      strategy: {
        name: 'With Race Filters',
        version: 1,
        filters: [{ field: 'odds_win', operator: 'gte', value: 5.0 }],
        raceFilters: {
          raceTypes: ['horse'],
          tracks: ['Seoul'],
          minEntries: 8,
        },
      },
    };

    const result = transformDSLToLegacy(dslWithRaceFilters);
    expect(result.filters).toBeDefined();
    expect(result.filters?.raceTypes).toEqual(['horse']);
    expect(result.filters?.tracks).toEqual(['Seoul']);
    expect(result.filters?.minEntries).toBe(8);
  });
});

// =============================================================================
// Legacy to DSL Transformation Tests
// =============================================================================

describe('transformLegacyToDSL', () => {
  it('should transform legacy to DSL format', () => {
    const result = transformLegacyToDSL(LEGACY_STRATEGY);

    expect(result.strategy.name).toBe('Legacy Value Bet');
    expect(result.strategy.version).toBe(1);
    expect(result.strategy.filters).toHaveLength(2);
  });

  it('should convert flat field names to dot notation', () => {
    const result = transformLegacyToDSL(LEGACY_STRATEGY);

    // 변환 후에도 flat field는 그대로 유지 (매핑은 선택적)
    expect(result.strategy.filters[0].field).toBe('odds_win');
    expect(result.strategy.filters[1].field).toBe('popularity_rank');
  });

  it('should preserve operators and values', () => {
    const result = transformLegacyToDSL(LEGACY_STRATEGY);

    expect(result.strategy.filters[0].operator).toBe('gte');
    expect(result.strategy.filters[0].value).toBe(5.0);
  });

  it('should transform stake config', () => {
    const result = transformLegacyToDSL(LEGACY_STRATEGY);

    expect(result.strategy.stake).toBeDefined();
    expect(result.strategy.stake?.fixed).toBe(10000);
  });

  it('should transform action', () => {
    const result = transformLegacyToDSL(LEGACY_STRATEGY);
    expect(result.strategy.action).toBe('bet_win');
  });

  it('should transform metadata', () => {
    const result = transformLegacyToDSL(LEGACY_STRATEGY);

    expect(result.strategy.metadata).toBeDefined();
    expect(result.strategy.metadata?.author).toBe('test-user');
    expect(result.strategy.metadata?.description).toBe('Legacy format strategy');
  });

  it('should handle conditions with timeRef', () => {
    const legacyWithTimeRef: StrategyDefinition = {
      ...LEGACY_STRATEGY,
      conditions: [
        { field: 'odds_win', operator: 'gte', value: 5.0, timeRef: 'T-15m' },
      ],
    };

    const result = transformLegacyToDSL(legacyWithTimeRef);
    expect(result.strategy.filters[0].timeRef).toBe('T-15m');
  });

  it('should transform filters to raceFilters', () => {
    const legacyWithFilters: StrategyDefinition = {
      ...LEGACY_STRATEGY,
      filters: {
        raceTypes: ['horse', 'cycle'],
        tracks: ['Seoul', 'Busan'],
        grades: ['G1'],
        minEntries: 6,
      },
    };

    const result = transformLegacyToDSL(legacyWithFilters);
    expect(result.strategy.raceFilters).toBeDefined();
    expect(result.strategy.raceFilters?.raceTypes).toEqual(['horse', 'cycle']);
    expect(result.strategy.raceFilters?.tracks).toEqual(['Seoul', 'Busan']);
    expect(result.strategy.raceFilters?.grades).toEqual(['G1']);
    expect(result.strategy.raceFilters?.minEntries).toBe(6);
  });

  it('should extract version number from semver', () => {
    const result = transformLegacyToDSL(LEGACY_STRATEGY);
    expect(result.strategy.version).toBe(1); // '1.0.0' → 1
  });

  it('should handle version string without semver', () => {
    const legacyWithSimpleVersion: StrategyDefinition = {
      ...LEGACY_STRATEGY,
      version: '2',
    };

    const result = transformLegacyToDSL(legacyWithSimpleVersion);
    expect(result.strategy.version).toBe(2);
  });
});

// =============================================================================
// Normalize Strategy Tests
// =============================================================================

describe('normalizeStrategy', () => {
  it('should return legacy strategy as-is', () => {
    const result = normalizeStrategy(LEGACY_STRATEGY);

    expect(result.id).toBe(LEGACY_STRATEGY.id);
    expect(result.name).toBe(LEGACY_STRATEGY.name);
    expect(result.conditions).toEqual(LEGACY_STRATEGY.conditions);
  });

  it('should transform DSL to legacy', () => {
    const result = normalizeStrategy(DSL_STRATEGY);

    expect(result.name).toBe('DSL Value Bet');
    expect(result.conditions).toHaveLength(2);
    expect(result.conditions[0].field).toBe('odds_win');
  });

  it('should throw error for unknown format', () => {
    const unknown = { random: 'object' };
    expect(() => normalizeStrategy(unknown)).toThrow(/unknown.*format/i);
  });

  it('should throw error for null', () => {
    expect(() => normalizeStrategy(null)).toThrow();
  });

  it('should throw error for undefined', () => {
    expect(() => normalizeStrategy(undefined)).toThrow();
  });

  it('should throw error for primitive', () => {
    expect(() => normalizeStrategy('string')).toThrow();
    expect(() => normalizeStrategy(123)).toThrow();
  });
});

// =============================================================================
// Round-Trip Tests
// =============================================================================

describe('round-trip transformation', () => {
  it('should preserve data in DSL → Legacy → DSL', () => {
    // DSL → Legacy
    const legacy = transformDSLToLegacy(DSL_STRATEGY);

    // Legacy → DSL
    const dsl = transformLegacyToDSL(legacy);

    // 주요 필드 보존 확인
    expect(dsl.strategy.name).toBe(DSL_STRATEGY.strategy.name);
    expect(dsl.strategy.filters).toHaveLength(DSL_STRATEGY.strategy.filters.length);
    expect(dsl.strategy.action).toBe(DSL_STRATEGY.strategy.action);
  });

  it('should preserve data in Legacy → DSL → Legacy', () => {
    // Legacy → DSL
    const dsl = transformLegacyToDSL(LEGACY_STRATEGY);

    // DSL → Legacy
    const legacy = transformDSLToLegacy(dsl);

    // 주요 필드 보존 확인
    expect(legacy.name).toBe(LEGACY_STRATEGY.name);
    expect(legacy.conditions).toHaveLength(LEGACY_STRATEGY.conditions.length);
    expect(legacy.action).toBe(LEGACY_STRATEGY.action);
    expect(legacy.stake).toEqual(LEGACY_STRATEGY.stake);
  });
});

// =============================================================================
// Edge Cases
// =============================================================================

describe('edge cases', () => {
  it('should handle empty filters array', () => {
    const dsl: DSLStrategyDefinition = {
      strategy: {
        name: 'Empty Filters',
        version: 1,
        filters: [],
      },
    };

    const result = transformDSLToLegacy(dsl);
    expect(result.conditions).toHaveLength(0);
  });

  it('should handle between operator value', () => {
    const dsl: DSLStrategyDefinition = {
      strategy: {
        name: 'Between Test',
        version: 1,
        filters: [
          { field: 'odds.win', operator: 'between', value: [3.0, 10.0] },
        ],
      },
    };

    const result = transformDSLToLegacy(dsl);
    expect(result.conditions[0].value).toEqual([3.0, 10.0]);
  });

  it('should handle in operator value', () => {
    const dsl: DSLStrategyDefinition = {
      strategy: {
        name: 'In Test',
        version: 1,
        filters: [
          { field: 'popularity.rank', operator: 'in', value: [1, 2, 3] },
        ],
      },
    };

    const result = transformDSLToLegacy(dsl);
    expect(result.conditions[0].value).toEqual([1, 2, 3]);
  });

  it('should handle Kelly stake config', () => {
    const dsl: DSLStrategyDefinition = {
      strategy: {
        name: 'Kelly Test',
        version: 1,
        filters: [{ field: 'odds_win', operator: 'gte', value: 2.0 }],
        stake: {
          useKelly: true,
          percentOfBankroll: 5,
        },
      },
    };

    const result = transformDSLToLegacy(dsl);
    expect(result.stake?.useKelly).toBe(true);
    expect(result.stake?.percentOfBankroll).toBe(5);
  });

  it('should handle all bet actions', () => {
    const actions = ['bet_win', 'bet_place', 'bet_quinella', 'skip'] as const;

    for (const action of actions) {
      const dsl: DSLStrategyDefinition = {
        strategy: {
          name: `Action ${action}`,
          version: 1,
          filters: [{ field: 'odds_win', operator: 'gte', value: 2.0 }],
          action,
        },
      };

      const result = transformDSLToLegacy(dsl);
      expect(result.action).toBe(action);
    }
  });
});
