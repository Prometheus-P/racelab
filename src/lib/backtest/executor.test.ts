/**
 * Backtest Executor Tests
 *
 * TDD 기반 백테스트 엔진 테스트
 * Phase 1: Tax Enforcement (27% 세금 강제 적용)
 */

import {
  MockRaceDataSource,
  runBacktest,
  type RaceResultData,
} from './executor';
import type { RaceContext } from '../strategy/evaluator';
import type { BacktestRequest, BetRecord } from '../strategy/types';
import { TAX_RATE } from './types';

// =============================================================================
// Test Fixtures
// =============================================================================

const createTestStrategy = () => ({
  id: 'test-strategy',
  name: '테스트 전략',
  version: '1.0.0',
  conditions: [
    {
      field: 'odds_win' as const,
      operator: 'gte' as const,
      value: 2.0,
    },
  ],
  action: 'bet_win' as const,
  stake: {
    fixed: 10000, // 10,000원 고정 베팅
  },
  metadata: {
    author: 'test',
    createdAt: '2025-01-01T00:00:00Z',
  },
});

const createTestRace = (raceId: string, date: string): RaceContext => ({
  raceId,
  raceDate: date,
  raceNo: 1,
  track: 'seoul',
  raceType: 'horse',
  entries: [
    {
      raceId,
      entryNo: 1,
      odds_win: 2.5, // 2.5배 배당
      popularity_rank: 1,
      pool_total: 100000000,
      pool_win_pct: 30,
    },
    {
      raceId,
      entryNo: 2,
      odds_win: 5.0, // 5.0배 배당
      popularity_rank: 2,
      pool_total: 100000000,
      pool_win_pct: 20,
    },
  ],
});

const createWinResult = (raceId: string, winnerEntryNo: number): RaceResultData => ({
  raceId,
  finishPositions: new Map([
    [winnerEntryNo, 1],
    [winnerEntryNo === 1 ? 2 : 1, 2],
  ]),
  dividends: {
    win: new Map([[winnerEntryNo, winnerEntryNo === 1 ? 2.5 : 5.0]]),
  },
});

// =============================================================================
// Phase 1: Tax Enforcement Tests
// =============================================================================

describe('Tax Enforcement', () => {
  describe('TAX_RATE constant', () => {
    it('should have TAX_RATE defined as 0.27 (27%)', () => {
      expect(TAX_RATE).toBeDefined();
      expect(TAX_RATE).toBe(0.27);
    });

    it('should not allow TAX_RATE to be modified (const)', () => {
      // TAX_RATE is exported as const, so TypeScript prevents modification
      // This test ensures the value is exactly 27%
      expect(TAX_RATE).toEqual(0.27);
    });
  });

  describe('Winning bet tax deduction', () => {
    it('should deduct 27% tax from winning bets', async () => {
      // Setup
      const dataSource = new MockRaceDataSource();
      const race = createTestRace('horse-seoul-1-20250101', '2025-01-01');
      const result = createWinResult('horse-seoul-1-20250101', 1); // 엔트리 1 승리
      dataSource.addRace(race, result);

      const request: BacktestRequest = {
        strategy: createTestStrategy(),
        dateRange: { from: '2025-01-01', to: '2025-01-01' },
        initialCapital: 1000000,
      };

      // Execute
      const backtestResult = await runBacktest(request, dataSource);

      // Verify
      // 10,000원 베팅 @ 2.5배 → 총 지급액 25,000원
      // 세금: 25,000 * 0.27 = 6,750원
      // 순지급: 25,000 - 6,750 = 18,250원
      // 수익: 18,250 - 10,000 = 8,250원
      expect(backtestResult.bets.length).toBeGreaterThan(0);

      const winningBet = backtestResult.bets.find((b) => b.result === 'win');
      expect(winningBet).toBeDefined();
      expect(winningBet!.betAmount).toBe(10000);
      expect(winningBet!.profit).toBe(8250);
    });

    it('should calculate correct gross payout before tax', async () => {
      const dataSource = new MockRaceDataSource();
      const race = createTestRace('horse-seoul-1-20250101', '2025-01-01');
      const result = createWinResult('horse-seoul-1-20250101', 1);
      dataSource.addRace(race, result);

      const request: BacktestRequest = {
        strategy: createTestStrategy(),
        dateRange: { from: '2025-01-01', to: '2025-01-01' },
        initialCapital: 1000000,
      };

      const backtestResult = await runBacktest(request, dataSource);
      const winningBet = backtestResult.bets.find((b) => b.result === 'win');

      // grossPayout = betAmount * odds = 10,000 * 2.5 = 25,000
      expect(winningBet!.grossPayout).toBe(25000);
    });

    it('should record taxDeducted in BetRecord', async () => {
      const dataSource = new MockRaceDataSource();
      const race = createTestRace('horse-seoul-1-20250101', '2025-01-01');
      const result = createWinResult('horse-seoul-1-20250101', 1);
      dataSource.addRace(race, result);

      const request: BacktestRequest = {
        strategy: createTestStrategy(),
        dateRange: { from: '2025-01-01', to: '2025-01-01' },
        initialCapital: 1000000,
      };

      const backtestResult = await runBacktest(request, dataSource);
      const winningBet = backtestResult.bets.find((b) => b.result === 'win');

      // taxDeducted = grossPayout * 0.27 = 25,000 * 0.27 = 6,750
      expect(winningBet!.taxDeducted).toBe(6750);
    });

    it('should have taxDeducted as 0 for losing bets', async () => {
      const dataSource = new MockRaceDataSource();
      const race = createTestRace('horse-seoul-1-20250101', '2025-01-01');
      // 엔트리 2가 승리 (우리가 베팅한 엔트리 1은 패배)
      const result = createWinResult('horse-seoul-1-20250101', 2);
      dataSource.addRace(race, result);

      // 전략을 수정하여 엔트리 1에만 베팅하도록 설정
      const strategy = {
        ...createTestStrategy(),
        conditions: [
          {
            field: 'odds_win' as const,
            operator: 'eq' as const,
            value: 2.5, // 엔트리 1만 매칭
          },
        ],
      };

      const request: BacktestRequest = {
        strategy,
        dateRange: { from: '2025-01-01', to: '2025-01-01' },
        initialCapital: 1000000,
      };

      const backtestResult = await runBacktest(request, dataSource);
      const losingBet = backtestResult.bets.find((b) => b.result === 'lose');

      expect(losingBet).toBeDefined();
      expect(losingBet!.taxDeducted).toBe(0);
      expect(losingBet!.grossPayout).toBe(0);
      expect(losingBet!.profit).toBe(-10000);
    });

    it('should have taxDeducted as 0 for refunded bets', async () => {
      const dataSource = new MockRaceDataSource();
      const race = createTestRace('horse-seoul-1-20250101', '2025-01-01');
      const result: RaceResultData = {
        raceId: 'horse-seoul-1-20250101',
        finishPositions: new Map(),
        dividends: { win: new Map() },
        canceled: true, // 경주 취소
      };
      dataSource.addRace(race, result);

      const request: BacktestRequest = {
        strategy: createTestStrategy(),
        dateRange: { from: '2025-01-01', to: '2025-01-01' },
        initialCapital: 1000000,
      };

      const backtestResult = await runBacktest(request, dataSource);
      const refundedBet = backtestResult.bets.find((b) => b.result === 'refund');

      expect(refundedBet).toBeDefined();
      expect(refundedBet!.taxDeducted).toBe(0);
      expect(refundedBet!.grossPayout).toBe(0);
      expect(refundedBet!.profit).toBe(0);
    });
  });

  describe('Tax impact on summary', () => {
    it('should reflect tax in totalProfit calculation', async () => {
      const dataSource = new MockRaceDataSource();

      // 여러 경주 추가
      for (let i = 1; i <= 3; i++) {
        const raceId = `horse-seoul-${i}-20250101`;
        const race = createTestRace(raceId, '2025-01-01');
        // 모든 경주에서 엔트리 1 승리
        const result = createWinResult(raceId, 1);
        dataSource.addRace(race, result);
      }

      const request: BacktestRequest = {
        strategy: {
          ...createTestStrategy(),
          conditions: [
            {
              field: 'odds_win' as const,
              operator: 'eq' as const,
              value: 2.5, // 엔트리 1만 매칭
            },
          ],
        },
        dateRange: { from: '2025-01-01', to: '2025-01-01' },
        initialCapital: 1000000,
      };

      const backtestResult = await runBacktest(request, dataSource);

      // 3번 승리: 각 8,250원 수익 = 24,750원 총 수익
      expect(backtestResult.summary.totalProfit).toBe(24750);
      expect(backtestResult.summary.wins).toBe(3);
    });

    it('should reflect tax in ROI calculation', async () => {
      const dataSource = new MockRaceDataSource();
      const race = createTestRace('horse-seoul-1-20250101', '2025-01-01');
      const result = createWinResult('horse-seoul-1-20250101', 1);
      dataSource.addRace(race, result);

      const request: BacktestRequest = {
        strategy: {
          ...createTestStrategy(),
          conditions: [
            {
              field: 'odds_win' as const,
              operator: 'eq' as const,
              value: 2.5,
            },
          ],
        },
        dateRange: { from: '2025-01-01', to: '2025-01-01' },
        initialCapital: 1000000,
      };

      const backtestResult = await runBacktest(request, dataSource);

      // ROI = totalProfit / totalBetAmount * 100
      // 수익 8,250원 / 베팅 10,000원 * 100 = 82.5%
      expect(backtestResult.summary.roi).toBe(82.5);
    });

    it('should reflect tax in finalCapital calculation', async () => {
      const dataSource = new MockRaceDataSource();
      const race = createTestRace('horse-seoul-1-20250101', '2025-01-01');
      const result = createWinResult('horse-seoul-1-20250101', 1);
      dataSource.addRace(race, result);

      const request: BacktestRequest = {
        strategy: {
          ...createTestStrategy(),
          conditions: [
            {
              field: 'odds_win' as const,
              operator: 'eq' as const,
              value: 2.5,
            },
          ],
        },
        dateRange: { from: '2025-01-01', to: '2025-01-01' },
        initialCapital: 1000000,
      };

      const backtestResult = await runBacktest(request, dataSource);

      // 초기 1,000,000 + 수익 8,250 = 1,008,250
      expect(backtestResult.summary.finalCapital).toBe(1008250);
    });
  });

  describe('Tax edge cases', () => {
    it('should handle high odds correctly', async () => {
      const dataSource = new MockRaceDataSource();
      const race: RaceContext = {
        raceId: 'horse-seoul-1-20250101',
        raceDate: '2025-01-01',
        raceNo: 1,
        track: 'seoul',
        raceType: 'horse',
        entries: [
          {
            raceId: 'horse-seoul-1-20250101',
            entryNo: 1,
            odds_win: 100.0, // 100배 고배당
            popularity_rank: 10,
            pool_total: 100000000,
            pool_win_pct: 1,
          },
        ],
      };
      // 고배당 결과 데이터 직접 생성
      const result: RaceResultData = {
        raceId: 'horse-seoul-1-20250101',
        finishPositions: new Map([[1, 1]]),
        dividends: { win: new Map([[1, 100.0]]) }, // 100배 배당
      };
      dataSource.addRace(race, result);

      const strategy = {
        ...createTestStrategy(),
        conditions: [
          {
            field: 'odds_win' as const,
            operator: 'gte' as const,
            value: 50.0,
          },
        ],
      };

      const request: BacktestRequest = {
        strategy,
        dateRange: { from: '2025-01-01', to: '2025-01-01' },
        initialCapital: 1000000,
      };

      const backtestResult = await runBacktest(request, dataSource);
      const winningBet = backtestResult.bets.find((b) => b.result === 'win');

      // 10,000원 @ 100배 = 1,000,000원 총 지급
      // 세금: 1,000,000 * 0.27 = 270,000원
      // 순지급: 730,000원
      // 수익: 720,000원
      expect(winningBet!.grossPayout).toBe(1000000);
      expect(winningBet!.taxDeducted).toBe(270000);
      expect(winningBet!.profit).toBe(720000);
    });

    it('should use floor for tax calculation (no decimal won)', async () => {
      const dataSource = new MockRaceDataSource();
      const race: RaceContext = {
        raceId: 'horse-seoul-1-20250101',
        raceDate: '2025-01-01',
        raceNo: 1,
        track: 'seoul',
        raceType: 'horse',
        entries: [
          {
            raceId: 'horse-seoul-1-20250101',
            entryNo: 1,
            odds_win: 3.3, // 소수점 배당
            popularity_rank: 1,
            pool_total: 100000000,
            pool_win_pct: 20,
          },
        ],
      };
      const result: RaceResultData = {
        raceId: 'horse-seoul-1-20250101',
        finishPositions: new Map([[1, 1]]),
        dividends: { win: new Map([[1, 3.3]]) },
      };
      dataSource.addRace(race, result);

      const request: BacktestRequest = {
        strategy: {
          ...createTestStrategy(),
          conditions: [
            {
              field: 'odds_win' as const,
              operator: 'gte' as const,
              value: 3.0,
            },
          ],
        },
        dateRange: { from: '2025-01-01', to: '2025-01-01' },
        initialCapital: 1000000,
      };

      const backtestResult = await runBacktest(request, dataSource);
      const winningBet = backtestResult.bets.find((b) => b.result === 'win');

      // 10,000 * 3.3 = 33,000원
      // 세금: floor(33,000 * 0.27) = floor(8,910) = 8,910원
      // 순지급: 33,000 - 8,910 = 24,090원
      // 수익: 24,090 - 10,000 = 14,090원
      expect(winningBet!.grossPayout).toBe(33000);
      expect(winningBet!.taxDeducted).toBe(8910);
      expect(winningBet!.profit).toBe(14090);
    });
  });
});

// =============================================================================
// BetRecord Type Tests
// =============================================================================

describe('BetRecord type', () => {
  it('should have taxDeducted field', async () => {
    const dataSource = new MockRaceDataSource();
    const race = createTestRace('horse-seoul-1-20250101', '2025-01-01');
    const result = createWinResult('horse-seoul-1-20250101', 1);
    dataSource.addRace(race, result);

    const request: BacktestRequest = {
      strategy: createTestStrategy(),
      dateRange: { from: '2025-01-01', to: '2025-01-01' },
      initialCapital: 1000000,
    };

    const backtestResult = await runBacktest(request, dataSource);

    // BetRecord should have taxDeducted property
    backtestResult.bets.forEach((bet: BetRecord) => {
      expect(bet).toHaveProperty('taxDeducted');
      expect(typeof bet.taxDeducted).toBe('number');
    });
  });

  it('should have grossPayout field', async () => {
    const dataSource = new MockRaceDataSource();
    const race = createTestRace('horse-seoul-1-20250101', '2025-01-01');
    const result = createWinResult('horse-seoul-1-20250101', 1);
    dataSource.addRace(race, result);

    const request: BacktestRequest = {
      strategy: createTestStrategy(),
      dateRange: { from: '2025-01-01', to: '2025-01-01' },
      initialCapital: 1000000,
    };

    const backtestResult = await runBacktest(request, dataSource);

    backtestResult.bets.forEach((bet: BetRecord) => {
      expect(bet).toHaveProperty('grossPayout');
      expect(typeof bet.grossPayout).toBe('number');
    });
  });
});

// =============================================================================
// Phase 2: Slippage Integration Tests
// =============================================================================

describe('Slippage Integration', () => {
  describe('when slippage is disabled', () => {
    it('should not modify odds', async () => {
      const dataSource = new MockRaceDataSource();
      const race = createTestRace('horse-seoul-1-20250101', '2025-01-01');
      const result = createWinResult('horse-seoul-1-20250101', 1);
      dataSource.addRace(race, result);

      const request: BacktestRequest = {
        strategy: {
          ...createTestStrategy(),
          conditions: [{ field: 'odds_win' as const, operator: 'eq' as const, value: 2.5 }],
        },
        dateRange: { from: '2025-01-01', to: '2025-01-01' },
        initialCapital: 1000000,
      };

      // 슬리피지 비활성화 (기본값)
      const backtestResult = await runBacktest(request, dataSource, {
        slippage: { enabled: false, minPercent: -5, maxPercent: 5, distribution: 'uniform' },
      });

      const winningBet = backtestResult.bets.find((b) => b.result === 'win');
      expect(winningBet).toBeDefined();
      expect(winningBet!.oddsAfterSlippage).toBeUndefined();
      // grossPayout should be based on original odds (2.5 * 10000 = 25000)
      expect(winningBet!.grossPayout).toBe(25000);
    });
  });

  describe('when slippage is enabled', () => {
    it('should record oddsAfterSlippage in BetRecord', async () => {
      const dataSource = new MockRaceDataSource();
      const race = createTestRace('horse-seoul-1-20250101', '2025-01-01');
      const result = createWinResult('horse-seoul-1-20250101', 1);
      dataSource.addRace(race, result);

      const request: BacktestRequest = {
        strategy: {
          ...createTestStrategy(),
          conditions: [{ field: 'odds_win' as const, operator: 'eq' as const, value: 2.5 }],
        },
        dateRange: { from: '2025-01-01', to: '2025-01-01' },
        initialCapital: 1000000,
      };

      const backtestResult = await runBacktest(request, dataSource, {
        slippage: {
          enabled: true,
          minPercent: -5,
          maxPercent: 5,
          distribution: 'uniform',
          seed: 12345,
        },
      });

      const winningBet = backtestResult.bets.find((b) => b.result === 'win');
      expect(winningBet).toBeDefined();
      expect(winningBet!.oddsAfterSlippage).toBeDefined();
      expect(typeof winningBet!.oddsAfterSlippage).toBe('number');
    });

    it('should apply slippage within configured range', async () => {
      const dataSource = new MockRaceDataSource();
      const race = createTestRace('horse-seoul-1-20250101', '2025-01-01');
      const result = createWinResult('horse-seoul-1-20250101', 1);
      dataSource.addRace(race, result);

      const request: BacktestRequest = {
        strategy: {
          ...createTestStrategy(),
          conditions: [{ field: 'odds_win' as const, operator: 'eq' as const, value: 2.5 }],
        },
        dateRange: { from: '2025-01-01', to: '2025-01-01' },
        initialCapital: 1000000,
      };

      const backtestResult = await runBacktest(request, dataSource, {
        slippage: {
          enabled: true,
          minPercent: -5,
          maxPercent: 5,
          distribution: 'uniform',
        },
      });

      const winningBet = backtestResult.bets.find((b) => b.result === 'win');
      expect(winningBet).toBeDefined();
      // Odds should be within ±5% of 2.5 (2.375 - 2.625)
      expect(winningBet!.oddsAfterSlippage).toBeGreaterThanOrEqual(2.5 * 0.95);
      expect(winningBet!.oddsAfterSlippage).toBeLessThanOrEqual(2.5 * 1.05);
    });

    it('should produce reproducible results with same seed', async () => {
      const dataSource = new MockRaceDataSource();
      const race = createTestRace('horse-seoul-1-20250101', '2025-01-01');
      const result = createWinResult('horse-seoul-1-20250101', 1);
      dataSource.addRace(race, result);

      const request: BacktestRequest = {
        strategy: {
          ...createTestStrategy(),
          conditions: [{ field: 'odds_win' as const, operator: 'eq' as const, value: 2.5 }],
        },
        dateRange: { from: '2025-01-01', to: '2025-01-01' },
        initialCapital: 1000000,
      };

      const slippageConfig = {
        enabled: true,
        minPercent: -5,
        maxPercent: 5,
        distribution: 'uniform' as const,
        seed: 12345,
      };

      // 첫 번째 실행
      const result1 = await runBacktest(request, dataSource, { slippage: slippageConfig });
      const bet1 = result1.bets.find((b) => b.result === 'win');

      // 두 번째 실행 (같은 시드)
      const result2 = await runBacktest(request, dataSource, { slippage: slippageConfig });
      const bet2 = result2.bets.find((b) => b.result === 'win');

      expect(bet1!.oddsAfterSlippage).toBe(bet2!.oddsAfterSlippage);
      expect(bet1!.grossPayout).toBe(bet2!.grossPayout);
      expect(bet1!.profit).toBe(bet2!.profit);
    });
  });
});

// =============================================================================
// Phase 3: Mandatory Disclaimer Integration Tests
// =============================================================================

describe('Mandatory Disclaimer Integration', () => {
  it('should always include disclaimer in BacktestResult', async () => {
    const dataSource = new MockRaceDataSource();
    const race = createTestRace('horse-seoul-1-20250101', '2025-01-01');
    const result = createWinResult('horse-seoul-1-20250101', 1);
    dataSource.addRace(race, result);

    const request: BacktestRequest = {
      strategy: createTestStrategy(),
      dateRange: { from: '2025-01-01', to: '2025-01-01' },
      initialCapital: 1000000,
    };

    const backtestResult = await runBacktest(request, dataSource);

    // 면책조항이 반드시 포함되어야 함
    expect(backtestResult.disclaimer).toBeDefined();
    expect(backtestResult.disclaimer.title).toBeDefined();
    expect(backtestResult.disclaimer.items).toBeDefined();
    expect(Array.isArray(backtestResult.disclaimer.items)).toBe(true);
    expect(backtestResult.disclaimer.helpline).toBeDefined();
    expect(backtestResult.disclaimer.language).toBe('ko');
    expect(backtestResult.disclaimer.generatedAt).toBeDefined();
  });

  it('should include tax notice in disclaimer (27% always applied)', async () => {
    const dataSource = new MockRaceDataSource();
    const race = createTestRace('horse-seoul-1-20250101', '2025-01-01');
    const result = createWinResult('horse-seoul-1-20250101', 1);
    dataSource.addRace(race, result);

    const request: BacktestRequest = {
      strategy: createTestStrategy(),
      dateRange: { from: '2025-01-01', to: '2025-01-01' },
      initialCapital: 1000000,
    };

    const backtestResult = await runBacktest(request, dataSource);

    // 세금 안내가 포함되어야 함
    expect(backtestResult.disclaimer.items.some((item) => item.includes('세금'))).toBe(true);
  });

  it('should include slippage notice when slippage is enabled', async () => {
    const dataSource = new MockRaceDataSource();
    const race = createTestRace('horse-seoul-1-20250101', '2025-01-01');
    const result = createWinResult('horse-seoul-1-20250101', 1);
    dataSource.addRace(race, result);

    const request: BacktestRequest = {
      strategy: createTestStrategy(),
      dateRange: { from: '2025-01-01', to: '2025-01-01' },
      initialCapital: 1000000,
    };

    const backtestResult = await runBacktest(request, dataSource, {
      slippage: {
        enabled: true,
        minPercent: -5,
        maxPercent: 5,
        distribution: 'uniform',
      },
    });

    // 슬리피지 안내가 포함되어야 함
    expect(backtestResult.disclaimer.items.some((item) => item.includes('슬리피지'))).toBe(true);
  });

  it('should NOT include slippage notice when slippage is disabled', async () => {
    const dataSource = new MockRaceDataSource();
    const race = createTestRace('horse-seoul-1-20250101', '2025-01-01');
    const result = createWinResult('horse-seoul-1-20250101', 1);
    dataSource.addRace(race, result);

    const request: BacktestRequest = {
      strategy: createTestStrategy(),
      dateRange: { from: '2025-01-01', to: '2025-01-01' },
      initialCapital: 1000000,
    };

    const backtestResult = await runBacktest(request, dataSource, {
      slippage: {
        enabled: false,
        minPercent: -5,
        maxPercent: 5,
        distribution: 'uniform',
      },
    });

    // 슬리피지 안내가 포함되지 않아야 함
    expect(backtestResult.disclaimer.items.some((item) => item.includes('슬리피지'))).toBe(false);
  });

  it('should always include mandatory warnings', async () => {
    const dataSource = new MockRaceDataSource();
    const race = createTestRace('horse-seoul-1-20250101', '2025-01-01');
    const result = createWinResult('horse-seoul-1-20250101', 1);
    dataSource.addRace(race, result);

    const request: BacktestRequest = {
      strategy: createTestStrategy(),
      dateRange: { from: '2025-01-01', to: '2025-01-01' },
      initialCapital: 1000000,
    };

    const backtestResult = await runBacktest(request, dataSource);

    // 필수 경고 문구 포함 확인
    expect(backtestResult.disclaimer.items.some((item) => item.includes('과거'))).toBe(true);
    expect(backtestResult.disclaimer.items.some((item) => item.includes('교육'))).toBe(true);
    expect(backtestResult.disclaimer.items.some((item) => item.includes('손실'))).toBe(true);
  });

  it('should include gambling helpline', async () => {
    const dataSource = new MockRaceDataSource();
    const race = createTestRace('horse-seoul-1-20250101', '2025-01-01');
    const result = createWinResult('horse-seoul-1-20250101', 1);
    dataSource.addRace(race, result);

    const request: BacktestRequest = {
      strategy: createTestStrategy(),
      dateRange: { from: '2025-01-01', to: '2025-01-01' },
      initialCapital: 1000000,
    };

    const backtestResult = await runBacktest(request, dataSource);

    // 도박 문제 상담 전화번호 포함 확인
    expect(backtestResult.disclaimer.helpline).toContain('1336');
  });
});
