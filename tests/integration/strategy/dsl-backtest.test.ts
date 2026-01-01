/**
 * DSL Strategy Integration Tests
 *
 * DSL 전략 → 백테스트 통합 플로우 테스트
 * Issue #110: DSL 통합 테스트 및 E2E 테스트 추가
 */

import {
  parseDSL,
  validateDSLStructure,
  transformDSLToLegacy,
  isDSLStrategy,
  evaluateFormulaString,
  validateFormula,
  extractVariables,
} from '@/lib/strategy/dsl';
import { StrategyEvaluator } from '@/lib/strategy/evaluator';
import {
  BacktestExecutor,
  MockRaceDataSource,
  type RaceResultData,
} from '@/lib/backtest/executor';
import type { RaceContext, EntryContext } from '@/lib/strategy/evaluator';
import type { BacktestRequest } from '@/lib/strategy/types';

// =============================================================================
// Test Fixtures
// =============================================================================

const YAML_VALUE_BET_STRATEGY = `
strategy:
  name: Value Bet Scanner
  version: 1
  filters:
    - field: odds.win
      operator: gte
      value: 5.0
    - field: popularity.rank
      operator: lte
      value: 5
  scoring:
    formula: "odds_win * 0.5 - 1"
    threshold: 1.5
  action: bet_win
  stake:
    fixed: 10000
  metadata:
    author: test-user
    description: High value bet strategy
    tags:
      - value-bet
      - high-odds
`;

const YAML_MOMENTUM_STRATEGY = `
strategy:
  name: Momentum Strategy
  version: 1
  filters:
    - field: odds.drift_pct
      operator: lt
      value: -10
    - field: odds.win
      operator: between
      value: [2.0, 8.0]
  scoring:
    formula: "abs(odds_drift_pct) * odds_win / 10"
    threshold: 2.0
  action: bet_win
  stake:
    percentOfBankroll: 3
  raceFilters:
    raceTypes:
      - horse
    minEntries: 8
`;

const YAML_COMPLEX_STRATEGY = `
strategy:
  name: Complex Scoring Strategy
  version: 1
  filters:
    - field: odds.win
      operator: between
      value: [3.0, 10.0]
    - field: horse.rating
      operator: gte
      value: 70
    - field: popularity.rank
      operator: in
      value: [1, 2, 3, 4, 5]
    - field: pool.win_pct
      operator: gte
      value: 10
  scoring:
    formula: "(odds_win - 1) * horse_rating / 100 + sqrt(popularity_rank)"
    threshold: 3.0
  action: bet_win
  stake:
    fixed: 20000
    useKelly: true
`;

const YAML_MAX_FILTERS_STRATEGY = `
strategy:
  name: Max Filters Strategy
  version: 1
  filters:
    - field: odds.win
      operator: gte
      value: 2.0
    - field: odds.place
      operator: gte
      value: 1.5
    - field: odds.drift_pct
      operator: lt
      value: 0
    - field: odds.stddev
      operator: lt
      value: 1.0
    - field: popularity.rank
      operator: lte
      value: 10
    - field: pool.total
      operator: gte
      value: 1000000
    - field: pool.win_pct
      operator: gte
      value: 5
    - field: horse.rating
      operator: gte
      value: 60
    - field: burden.weight
      operator: lte
      value: 60
    - field: entry.count
      operator: gte
      value: 8
  action: bet_win
`;

/**
 * 테스트용 경주 데이터 생성
 */
function createMockRaceContext(
  raceId: string,
  date: string,
  entries: Partial<EntryContext>[]
): RaceContext {
  return {
    raceId,
    raceDate: date,
    raceType: 'horse',
    track: '서울',
    raceNo: 1,
    grade: 'G1',
    entries: entries.map((e, i) => ({
      raceId,
      entryNo: e.entryNo ?? i + 1,
      odds_win: e.odds_win ?? 5.0,
      odds_place: e.odds_place ?? 2.5,
      odds_drift_pct: e.odds_drift_pct ?? 0,
      odds_stddev: e.odds_stddev ?? 0.5,
      popularity_rank: e.popularity_rank ?? i + 1,
      pool_total: e.pool_total ?? 10000000,
      pool_win_pct: e.pool_win_pct ?? 20,
      horse_rating: e.horse_rating ?? 80,
      burden_weight: e.burden_weight ?? 55,
      entry_count: e.entry_count ?? 10,
    })),
  };
}

/**
 * 테스트용 경주 결과 생성
 */
function createMockRaceResult(
  raceId: string,
  winnerEntryNo: number,
  winOdds: number
): RaceResultData {
  return {
    raceId,
    finishPositions: new Map([
      [winnerEntryNo, 1],
      [winnerEntryNo + 1, 2],
      [winnerEntryNo + 2, 3],
    ]),
    dividends: {
      win: new Map([[winnerEntryNo, winOdds]]),
      place: new Map([
        [winnerEntryNo, winOdds * 0.5],
        [winnerEntryNo + 1, 3.0],
        [winnerEntryNo + 2, 2.5],
      ]),
    },
  };
}

// =============================================================================
// 1. YAML 파싱 → DSL 검증 통합 테스트
// =============================================================================

describe('YAML Parsing Integration', () => {
  describe('parseDSL with YAML input', () => {
    it('should parse value bet strategy YAML', () => {
      const result = parseDSL(YAML_VALUE_BET_STRATEGY);

      expect(result.success).toBe(true);
      expect(result.data?.strategy.name).toBe('Value Bet Scanner');
      expect(result.data?.strategy.filters).toHaveLength(2);
      expect(result.data?.strategy.scoring?.formula).toBe('odds_win * 0.5 - 1');
    });

    it('should parse momentum strategy YAML', () => {
      const result = parseDSL(YAML_MOMENTUM_STRATEGY);

      expect(result.success).toBe(true);
      expect(result.data?.strategy.name).toBe('Momentum Strategy');
      expect(result.data?.strategy.raceFilters?.raceTypes).toEqual(['horse']);
    });

    it('should parse complex strategy with multiple filters', () => {
      const result = parseDSL(YAML_COMPLEX_STRATEGY);

      expect(result.success).toBe(true);
      expect(result.data?.strategy.filters).toHaveLength(4);
      expect(result.data?.strategy.scoring?.formula).toContain('sqrt');
    });

    it('should parse strategy with max filters (10)', () => {
      const result = parseDSL(YAML_MAX_FILTERS_STRATEGY);

      expect(result.success).toBe(true);
      expect(result.data?.strategy.filters).toHaveLength(10);
    });

    it('should reject strategy with more than 10 filters via validation', () => {
      const tooManyFilters = `
strategy:
  name: Too Many
  version: 1
  filters:
    - { field: odds.win, operator: gte, value: 1 }
    - { field: odds.win, operator: gte, value: 2 }
    - { field: odds.win, operator: gte, value: 3 }
    - { field: odds.win, operator: gte, value: 4 }
    - { field: odds.win, operator: gte, value: 5 }
    - { field: odds.win, operator: gte, value: 6 }
    - { field: odds.win, operator: gte, value: 7 }
    - { field: odds.win, operator: gte, value: 8 }
    - { field: odds.win, operator: gte, value: 9 }
    - { field: odds.win, operator: gte, value: 10 }
    - { field: odds.win, operator: gte, value: 11 }
`;
      // parseDSL only parses, doesn't validate
      const parsed = parseDSL(tooManyFilters);
      expect(parsed.success).toBe(true);

      // validateDSLStructure catches too many filters
      const validation = validateDSLStructure(parsed.data!);
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.code === 'TOO_MANY_FILTERS')).toBe(true);
    });
  });

  describe('validateDSLStructure', () => {
    it('should validate parsed DSL structure', () => {
      const parsed = parseDSL(YAML_VALUE_BET_STRATEGY);
      expect(parsed.success).toBe(true);

      const validation = validateDSLStructure(parsed.data!);
      expect(validation.valid).toBe(true);
    });

    it('should detect invalid field names', () => {
      const invalidField = `
strategy:
  name: Invalid Field
  version: 1
  filters:
    - field: invalid.field.name
      operator: gte
      value: 5
`;
      // parseDSL only parses
      const parsed = parseDSL(invalidField);
      expect(parsed.success).toBe(true);

      // validateDSLStructure catches invalid fields
      const validation = validateDSLStructure(parsed.data!);
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.code === 'INVALID_FIELD')).toBe(true);
    });

    it('should detect invalid operators', () => {
      const invalidOp = `
strategy:
  name: Invalid Op
  version: 1
  filters:
    - field: odds.win
      operator: invalid_op
      value: 5
`;
      // parseDSL only parses
      const parsed = parseDSL(invalidOp);
      expect(parsed.success).toBe(true);

      // validateDSLStructure catches invalid operators
      const validation = validateDSLStructure(parsed.data!);
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.code === 'INVALID_OPERATOR')).toBe(true);
    });
  });
});

// =============================================================================
// 2. DSL → Legacy 변환 통합 테스트
// =============================================================================

describe('DSL to Legacy Transformation Integration', () => {
  it('should transform YAML strategy to legacy format', () => {
    const parsed = parseDSL(YAML_VALUE_BET_STRATEGY);
    expect(parsed.success).toBe(true);

    const legacy = transformDSLToLegacy(parsed.data!);

    expect(legacy.name).toBe('Value Bet Scanner');
    expect(legacy.conditions).toHaveLength(2);
    expect(legacy.conditions[0].field).toBe('odds_win'); // dot → flat
    expect(legacy.conditions[1].field).toBe('popularity_rank');
    expect(legacy.action).toBe('bet_win');
    expect(legacy.stake?.fixed).toBe(10000);
  });

  it('should preserve between operator values', () => {
    const parsed = parseDSL(YAML_MOMENTUM_STRATEGY);
    expect(parsed.success).toBe(true);

    const legacy = transformDSLToLegacy(parsed.data!);

    const betweenCondition = legacy.conditions.find(c => c.operator === 'between');
    expect(betweenCondition).toBeDefined();
    expect(betweenCondition?.value).toEqual([2.0, 8.0]);
  });

  it('should preserve in operator values', () => {
    const parsed = parseDSL(YAML_COMPLEX_STRATEGY);
    expect(parsed.success).toBe(true);

    const legacy = transformDSLToLegacy(parsed.data!);

    const inCondition = legacy.conditions.find(c => c.operator === 'in');
    expect(inCondition).toBeDefined();
    expect(inCondition?.value).toEqual([1, 2, 3, 4, 5]);
  });

  it('should transform race filters', () => {
    const parsed = parseDSL(YAML_MOMENTUM_STRATEGY);
    expect(parsed.success).toBe(true);

    const legacy = transformDSLToLegacy(parsed.data!);

    expect(legacy.filters).toBeDefined();
    expect(legacy.filters?.raceTypes).toEqual(['horse']);
    expect(legacy.filters?.minEntries).toBe(8);
  });

  it('should be recognized as DSL before transformation', () => {
    const parsed = parseDSL(YAML_VALUE_BET_STRATEGY);
    expect(isDSLStrategy(parsed.data)).toBe(true);

    const legacy = transformDSLToLegacy(parsed.data!);
    expect(isDSLStrategy(legacy)).toBe(false);
  });
});

// =============================================================================
// 3. 스코어링 수식 통합 테스트
// =============================================================================

describe('Scoring Formula Integration', () => {
  const mockContext = {
    odds_win: 6.0,
    odds_place: 2.5,
    odds_drift_pct: -15,
    odds_stddev: 0.3,
    popularity_rank: 3,
    pool_total: 15000000,
    pool_win_pct: 25,
    horse_rating: 85,
    burden_weight: 54,
    entry_count: 12,
  };

  describe('formula validation', () => {
    it('should validate simple formula', () => {
      const result = validateFormula('odds_win * 0.5 - 1');
      expect(result.valid).toBe(true);
    });

    it('should validate formula with functions', () => {
      const result = validateFormula('max(odds_win, 3) * sqrt(horse_rating)');
      expect(result.valid).toBe(true);
    });

    it('should reject formula with invalid variables', () => {
      const result = validateFormula('invalid_var * 2');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_VARIABLE')).toBe(true);
    });

    it('should reject formula exceeding max length', () => {
      const longFormula = 'odds_win + '.repeat(25) + 'odds_win';
      const result = validateFormula(longFormula);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'FORMULA_TOO_LONG')).toBe(true);
    });

    it('should reject formula with forbidden keywords', () => {
      const malicious = 'eval("malicious")';
      const result = validateFormula(malicious);
      expect(result.valid).toBe(false);
    });
  });

  describe('formula evaluation', () => {
    it('should evaluate simple arithmetic', () => {
      const result = evaluateFormulaString('odds_win * 0.5 - 1', mockContext);
      expect(result).toBe(6.0 * 0.5 - 1); // 2.0
    });

    it('should evaluate abs function', () => {
      const result = evaluateFormulaString('abs(odds_drift_pct)', mockContext);
      expect(result).toBe(15);
    });

    it('should evaluate sqrt function', () => {
      const result = evaluateFormulaString('sqrt(popularity_rank)', mockContext);
      expect(result).toBeCloseTo(Math.sqrt(3), 5);
    });

    it('should evaluate min/max functions', () => {
      const minResult = evaluateFormulaString('min(odds_win, 4)', mockContext);
      expect(minResult).toBe(4);

      const maxResult = evaluateFormulaString('max(odds_win, 4)', mockContext);
      expect(maxResult).toBe(6);
    });

    it('should evaluate complex formula', () => {
      const formula = '(odds_win - 1) * horse_rating / 100 + sqrt(popularity_rank)';
      const result = evaluateFormulaString(formula, mockContext);

      const expected = (6.0 - 1) * 85 / 100 + Math.sqrt(3);
      expect(result).toBeCloseTo(expected, 5);
    });

    it('should handle missing variables gracefully', () => {
      const incompleteContext = { odds_win: 5.0 };

      expect(() => {
        evaluateFormulaString('odds_win + horse_rating', incompleteContext);
      }).toThrow(/Missing variable/);
    });
  });

  describe('variable extraction', () => {
    it('should extract variables from formula', () => {
      const vars = extractVariables('odds_win * horse_rating / 100');
      expect(vars).toContain('odds_win');
      expect(vars).toContain('horse_rating');
      expect(vars).toHaveLength(2);
    });

    it('should extract variables from complex formula', () => {
      const vars = extractVariables(
        '(odds_win - 1) * horse_rating / pool_win_pct + sqrt(popularity_rank)'
      );
      expect(vars).toContain('odds_win');
      expect(vars).toContain('horse_rating');
      expect(vars).toContain('pool_win_pct');
      expect(vars).toContain('popularity_rank');
    });
  });
});

// =============================================================================
// 4. 전략 평가 통합 테스트
// =============================================================================

describe('Strategy Evaluation Integration', () => {
  it('should evaluate DSL strategy against race data', () => {
    // Parse DSL
    const parsed = parseDSL(YAML_VALUE_BET_STRATEGY);
    expect(parsed.success).toBe(true);

    // Transform to legacy
    const legacy = transformDSLToLegacy(parsed.data!);

    // Create evaluator
    const evaluator = new StrategyEvaluator(legacy);

    // Create mock race
    const race = createMockRaceContext('race-001', '2024-01-15', [
      { entryNo: 1, odds_win: 6.0, popularity_rank: 2 }, // matches
      { entryNo: 2, odds_win: 3.0, popularity_rank: 1 }, // odds too low
      { entryNo: 3, odds_win: 8.0, popularity_rank: 8 }, // rank too high
      { entryNo: 4, odds_win: 5.5, popularity_rank: 4 }, // matches
    ]);

    // Evaluate
    const results = evaluator.evaluateRace(race);

    // Should match entries 1 and 4
    expect(results.length).toBe(2);
    expect(results.map(r => r.entryNo).sort()).toEqual([1, 4]);
  });

  it('should apply between operator correctly', () => {
    // Use a simple strategy with just between operator (no race filters)
    const betweenStrategy = `
strategy:
  name: Between Test
  version: 1
  filters:
    - field: odds.win
      operator: between
      value: [2.0, 8.0]
    - field: odds.drift_pct
      operator: lt
      value: -10
`;
    const parsed = parseDSL(betweenStrategy);
    const legacy = transformDSLToLegacy(parsed.data!);
    const evaluator = new StrategyEvaluator(legacy);

    const race = createMockRaceContext('race-002', '2024-01-15', [
      { entryNo: 1, odds_win: 5.0, odds_drift_pct: -15 }, // matches
      { entryNo: 2, odds_win: 1.5, odds_drift_pct: -20 }, // odds too low
      { entryNo: 3, odds_win: 10.0, odds_drift_pct: -12 }, // odds too high
      { entryNo: 4, odds_win: 4.0, odds_drift_pct: 5 }, // drift positive (not < -10)
    ]);

    const results = evaluator.evaluateRace(race);

    expect(results.length).toBe(1);
    expect(results[0].entryNo).toBe(1);
  });

  it('should apply in operator correctly', () => {
    const parsed = parseDSL(YAML_COMPLEX_STRATEGY);
    const legacy = transformDSLToLegacy(parsed.data!);
    const evaluator = new StrategyEvaluator(legacy);

    const race = createMockRaceContext('race-003', '2024-01-15', [
      { entryNo: 1, odds_win: 5.0, horse_rating: 80, popularity_rank: 3, pool_win_pct: 15 }, // matches
      { entryNo: 2, odds_win: 5.0, horse_rating: 80, popularity_rank: 7, pool_win_pct: 15 }, // rank not in [1-5]
      { entryNo: 3, odds_win: 5.0, horse_rating: 60, popularity_rank: 2, pool_win_pct: 15 }, // rating too low
    ]);

    const results = evaluator.evaluateRace(race);

    expect(results.length).toBe(1);
    expect(results[0].entryNo).toBe(1);
  });
});

// =============================================================================
// 5. 백테스트 실행 통합 테스트
// =============================================================================

describe('Backtest Execution Integration', () => {
  it('should run backtest with DSL strategy', async () => {
    // Parse DSL
    const parsed = parseDSL(YAML_VALUE_BET_STRATEGY);
    const legacy = transformDSLToLegacy(parsed.data!);

    // Create mock data source
    const dataSource = new MockRaceDataSource();

    // Add test races
    const race1 = createMockRaceContext('race-001', '2024-01-15', [
      { entryNo: 1, odds_win: 6.0, popularity_rank: 2 },
      { entryNo: 2, odds_win: 3.0, popularity_rank: 1 },
    ]);
    dataSource.addRace(race1, createMockRaceResult('race-001', 1, 6.0)); // Entry 1 wins

    const race2 = createMockRaceContext('race-002', '2024-01-16', [
      { entryNo: 1, odds_win: 8.0, popularity_rank: 3 },
      { entryNo: 2, odds_win: 2.0, popularity_rank: 1 },
    ]);
    dataSource.addRace(race2, createMockRaceResult('race-002', 2, 2.0)); // Entry 2 wins (not matched)

    // Create backtest request
    const request: BacktestRequest = {
      strategy: legacy,
      dateRange: { from: '2024-01-01', to: '2024-01-31' },
      initialCapital: 1000000,
    };

    // Execute backtest
    const executor = new BacktestExecutor(request, dataSource);
    const result = await executor.execute(request);

    // Verify results
    expect(result.summary.totalRaces).toBe(2);
    expect(result.summary.matchedRaces).toBeGreaterThan(0);
    expect(result.bets.length).toBeGreaterThan(0);
  });

  it('should calculate correct profit on win', async () => {
    const parsed = parseDSL(YAML_VALUE_BET_STRATEGY);
    const legacy = transformDSLToLegacy(parsed.data!);

    const dataSource = new MockRaceDataSource();

    // Single race where our pick wins
    const race = createMockRaceContext('race-win', '2024-01-15', [
      { entryNo: 1, odds_win: 6.0, popularity_rank: 2 }, // matches & wins
    ]);
    dataSource.addRace(race, createMockRaceResult('race-win', 1, 6.0));

    const request: BacktestRequest = {
      strategy: legacy,
      dateRange: { from: '2024-01-01', to: '2024-01-31' },
      initialCapital: 1000000,
    };

    const executor = new BacktestExecutor(request, dataSource);
    const result = await executor.execute(request);

    // Verify win calculation
    expect(result.bets.length).toBe(1);
    expect(result.bets[0].result).toBe('win');
    expect(result.bets[0].betAmount).toBe(10000); // fixed stake
    expect(result.bets[0].profit).toBe(10000 * 6.0 - 10000); // payout - bet
  });

  it('should calculate correct loss', async () => {
    const parsed = parseDSL(YAML_VALUE_BET_STRATEGY);
    const legacy = transformDSLToLegacy(parsed.data!);

    const dataSource = new MockRaceDataSource();

    // Single race where our pick loses
    const race = createMockRaceContext('race-lose', '2024-01-15', [
      { entryNo: 1, odds_win: 6.0, popularity_rank: 2 }, // matches but loses
      { entryNo: 2, odds_win: 2.0, popularity_rank: 1 },
    ]);
    dataSource.addRace(race, createMockRaceResult('race-lose', 2, 2.0)); // Entry 2 wins

    const request: BacktestRequest = {
      strategy: legacy,
      dateRange: { from: '2024-01-01', to: '2024-01-31' },
      initialCapital: 1000000,
    };

    const executor = new BacktestExecutor(request, dataSource);
    const result = await executor.execute(request);

    // Verify loss calculation
    expect(result.bets.length).toBe(1);
    expect(result.bets[0].result).toBe('lose');
    expect(result.bets[0].profit).toBe(-10000);
  });

  it('should handle percent of bankroll stake', async () => {
    // Create a simple strategy with percentOfBankroll stake (no race filters)
    const pctStrategy = `
strategy:
  name: Percent Stake Test
  version: 1
  filters:
    - field: odds.win
      operator: gte
      value: 3.0
  action: bet_win
  stake:
    percentOfBankroll: 3
`;
    const parsed = parseDSL(pctStrategy);
    const legacy = transformDSLToLegacy(parsed.data!);

    const dataSource = new MockRaceDataSource();

    const race = createMockRaceContext('race-pct', '2024-01-15', [
      { entryNo: 1, odds_win: 5.0, popularity_rank: 2 }, // matches
    ]);
    dataSource.addRace(race, createMockRaceResult('race-pct', 1, 5.0));

    const request: BacktestRequest = {
      strategy: legacy,
      dateRange: { from: '2024-01-01', to: '2024-01-31' },
      initialCapital: 1000000,
    };

    const executor = new BacktestExecutor(request, dataSource);
    const result = await executor.execute(request);

    // 3% of 1,000,000 = 30,000
    expect(result.bets.length).toBeGreaterThan(0);
    expect(result.bets[0].betAmount).toBe(30000);
  });

  it('should handle canceled race', async () => {
    const parsed = parseDSL(YAML_VALUE_BET_STRATEGY);
    const legacy = transformDSLToLegacy(parsed.data!);

    const dataSource = new MockRaceDataSource();

    const race = createMockRaceContext('race-cancel', '2024-01-15', [
      { entryNo: 1, odds_win: 6.0, popularity_rank: 2 },
    ]);
    dataSource.addRace(race, {
      raceId: 'race-cancel',
      finishPositions: new Map(),
      dividends: { win: new Map() },
      canceled: true,
    });

    const request: BacktestRequest = {
      strategy: legacy,
      dateRange: { from: '2024-01-01', to: '2024-01-31' },
      initialCapital: 1000000,
    };

    const executor = new BacktestExecutor(request, dataSource);
    const result = await executor.execute(request);

    expect(result.bets[0].result).toBe('refund');
    expect(result.bets[0].profit).toBe(0);
  });
});

// =============================================================================
// 6. 성능 벤치마크 테스트
// =============================================================================

describe('Performance Benchmarks', () => {
  it('should parse YAML strategy within 50ms', () => {
    const start = performance.now();

    for (let i = 0; i < 100; i++) {
      parseDSL(YAML_COMPLEX_STRATEGY);
    }

    const elapsed = performance.now() - start;
    const avgTime = elapsed / 100;

    console.log(`Average YAML parse time: ${avgTime.toFixed(2)}ms`);
    expect(avgTime).toBeLessThan(50);
  });

  it('should evaluate formula within 1ms', () => {
    const context = {
      odds_win: 5.0,
      odds_place: 2.5,
      odds_drift_pct: -10,
      odds_stddev: 0.3,
      popularity_rank: 3,
      pool_total: 10000000,
      pool_win_pct: 20,
      horse_rating: 80,
      burden_weight: 55,
      entry_count: 10,
    };

    const formula = '(odds_win - 1) * horse_rating / 100 + sqrt(popularity_rank)';

    const start = performance.now();

    for (let i = 0; i < 1000; i++) {
      evaluateFormulaString(formula, context);
    }

    const elapsed = performance.now() - start;
    const avgTime = elapsed / 1000;

    console.log(`Average formula evaluation time: ${avgTime.toFixed(3)}ms`);
    expect(avgTime).toBeLessThan(1);
  });

  it('should evaluate strategy against 1000 entries within 100ms', () => {
    const parsed = parseDSL(YAML_VALUE_BET_STRATEGY);
    const legacy = transformDSLToLegacy(parsed.data!);
    const evaluator = new StrategyEvaluator(legacy);

    // Create race with 1000 entries
    const entries: Partial<EntryContext>[] = [];
    for (let i = 0; i < 1000; i++) {
      entries.push({
        entryNo: i + 1,
        odds_win: 2 + Math.random() * 10,
        popularity_rank: Math.floor(Math.random() * 20) + 1,
      });
    }
    const race = createMockRaceContext('perf-race', '2024-01-15', entries);

    const start = performance.now();

    for (let i = 0; i < 10; i++) {
      evaluator.evaluateRace(race);
    }

    const elapsed = performance.now() - start;
    const avgTime = elapsed / 10;

    console.log(`Average 1000-entry evaluation time: ${avgTime.toFixed(2)}ms`);
    expect(avgTime).toBeLessThan(100);
  });

  it('should transform DSL to legacy within 5ms', () => {
    const parsed = parseDSL(YAML_MAX_FILTERS_STRATEGY);
    expect(parsed.success).toBe(true);

    const start = performance.now();

    for (let i = 0; i < 100; i++) {
      transformDSLToLegacy(parsed.data!);
    }

    const elapsed = performance.now() - start;
    const avgTime = elapsed / 100;

    console.log(`Average DSL→Legacy transform time: ${avgTime.toFixed(3)}ms`);
    expect(avgTime).toBeLessThan(5);
  });
});

// =============================================================================
// 7. 에러 처리 시나리오
// =============================================================================

describe('Error Handling Scenarios', () => {
  it('should handle malformed YAML gracefully', () => {
    const malformed = `
strategy:
  name: Bad YAML
  version: 1
  filters:
    - field: odds.win
      operator: gte
      value: [unclosed
`;
    const result = parseDSL(malformed);

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should handle missing required fields via validateDSLStructure', () => {
    const missingName = `
strategy:
  version: 1
  filters:
    - field: odds.win
      operator: gte
      value: 5
`;
    // parseDSL only parses, doesn't validate
    const parsed = parseDSL(missingName);
    expect(parsed.success).toBe(true);

    // validateDSLStructure performs validation
    const validation = validateDSLStructure(parsed.data!);
    expect(validation.valid).toBe(false);
    expect(validation.errors.some(e => e.code === 'MISSING_NAME')).toBe(true);
  });

  it('should handle invalid action type via validateDSLStructure', () => {
    const invalidAction = `
strategy:
  name: Invalid Action
  version: 1
  filters:
    - field: odds.win
      operator: gte
      value: 5
  action: invalid_action
`;
    const parsed = parseDSL(invalidAction);
    expect(parsed.success).toBe(true);

    const validation = validateDSLStructure(parsed.data!);
    expect(validation.valid).toBe(false);
    expect(validation.errors.some(e => e.code === 'INVALID_ACTION')).toBe(true);
  });

  it('should handle division by zero in formula', () => {
    // The expression engine rejects Infinity as invalid - throws FormulaError
    expect(() => {
      evaluateFormulaString('odds_win / 0', { odds_win: 5.0 });
    }).toThrow(/invalid result.*Infinity/i);
  });

  it('should handle negative sqrt in formula', () => {
    // sqrt of negative in mathjs returns complex number 'i', which is rejected
    expect(() => {
      evaluateFormulaString('sqrt(-1)', { odds_win: 1 });
    }).toThrow(/invalid result/i);
  });
});
