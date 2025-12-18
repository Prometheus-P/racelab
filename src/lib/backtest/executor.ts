/**
 * Backtest Executor
 *
 * 전략을 과거 데이터에 적용하여 성과를 측정하는 백테스팅 엔진
 */

import {
  StrategyEvaluator,
  type RaceContext,
  type EvaluationResult,
} from '../strategy/evaluator';
import type {
  BacktestRequest,
  BacktestResult,
  BacktestSummary,
  BetRecord,
  EquityPoint,
} from '../strategy/types';
import type { WorkerCheckpoint } from './types';
import { PROGRESS_UPDATE_INTERVAL } from './types';

// =============================================================================
// Types
// =============================================================================

/**
 * 백테스트 실행 옵션
 */
export interface ExecutorOptions {
  /** 초기 자본금 */
  initialCapital: number;

  /** 기본 베팅 금액 */
  defaultBetAmount: number;

  /** 진행률 콜백 */
  onProgress?: (progress: number, message: string) => Promise<void>;

  /** 체크포인트 저장 콜백 */
  onCheckpoint?: (checkpoint: WorkerCheckpoint) => Promise<void>;

  /** 타임아웃 체크 콜백 */
  shouldStop?: () => boolean;
}

/**
 * 경주 데이터 소스 인터페이스
 */
export interface RaceDataSource {
  /** 날짜 범위의 경주 ID 목록 가져오기 */
  getRaceIds(dateFrom: string, dateTo: string, filters?: RaceFilters): Promise<string[]>;

  /** 경주 상세 데이터 가져오기 */
  getRaceContext(raceId: string): Promise<RaceContext | null>;

  /** 경주 결과 가져오기 */
  getRaceResult(raceId: string): Promise<RaceResultData | null>;
}

export interface RaceFilters {
  raceTypes?: ('horse' | 'cycle' | 'boat')[];
  tracks?: string[];
  grades?: string[];
}

export interface RaceResultData {
  raceId: string;
  finishPositions: Map<number, number>; // entryNo -> position (1, 2, 3, ...)
  dividends: {
    win: Map<number, number>; // entryNo -> 배당률
    place?: Map<number, number>;
  };
  canceled?: boolean;
}

// =============================================================================
// Backtest Executor
// =============================================================================

/**
 * 백테스트 실행기
 */
export class BacktestExecutor {
  private evaluator: StrategyEvaluator;
  private dataSource: RaceDataSource;
  private options: ExecutorOptions;

  constructor(
    request: BacktestRequest,
    dataSource: RaceDataSource,
    options: Partial<ExecutorOptions> = {}
  ) {
    this.evaluator = new StrategyEvaluator(request.strategy);
    this.dataSource = dataSource;
    this.options = {
      initialCapital: options.initialCapital ?? request.initialCapital ?? 1_000_000,
      defaultBetAmount: options.defaultBetAmount ?? 10_000,
      onProgress: options.onProgress,
      onCheckpoint: options.onCheckpoint,
      shouldStop: options.shouldStop,
    };
  }

  /**
   * 백테스트 실행
   */
  async execute(request: BacktestRequest): Promise<BacktestResult> {
    const startTime = Date.now();
    const strategy = request.strategy;

    // 경주 ID 목록 가져오기
    const raceIds = await this.dataSource.getRaceIds(
      request.dateRange.from,
      request.dateRange.to,
      {
        raceTypes: request.filters?.raceTypes ?? strategy.filters?.raceTypes,
        tracks: request.filters?.tracks ?? strategy.filters?.tracks,
        grades: request.filters?.grades ?? strategy.filters?.grades,
      }
    );

    const totalRaces = raceIds.length;
    let processedRaces = 0;
    let matchedRaces = 0;

    // 베팅 기록
    const bets: BetRecord[] = [];
    let currentCapital = this.options.initialCapital;
    let peakCapital = currentCapital;
    let maxDrawdown = 0;

    // 자본 곡선
    const equityCurve: EquityPoint[] = [];
    let lastEquityDate = '';

    // 연승/연패 추적
    let currentStreak = 0;
    let maxWinStreak = 0;
    let maxLoseStreak = 0;

    // 각 경주 처리
    for (const raceId of raceIds) {
      // 타임아웃 체크
      if (this.options.shouldStop?.()) {
        break;
      }

      // 경주 데이터 가져오기
      const raceContext = await this.dataSource.getRaceContext(raceId);
      if (!raceContext) {
        processedRaces++;
        continue;
      }

      // 전략 평가
      const matchedEntries = this.evaluator.evaluateRace(raceContext);

      if (matchedEntries.length > 0) {
        matchedRaces++;

        // 경주 결과 가져오기
        const result = await this.dataSource.getRaceResult(raceId);

        for (const evaluation of matchedEntries) {
          // 베팅 금액 계산
          const betAmount = this.calculateBetAmount(
            strategy,
            currentCapital,
            evaluation
          );

          // 자본 부족 체크
          if (betAmount > currentCapital) {
            continue;
          }

          // 베팅 처리
          const betRecord = this.processBet(
            raceContext,
            evaluation,
            result,
            betAmount,
            currentCapital
          );

          bets.push(betRecord);

          // 자본 업데이트
          currentCapital = betRecord.cumulativeCapital;

          // 최대 낙폭 계산
          if (currentCapital > peakCapital) {
            peakCapital = currentCapital;
          }
          const drawdown = ((peakCapital - currentCapital) / peakCapital) * 100;
          if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown;
          }

          // 연승/연패 추적
          if (betRecord.result === 'win') {
            if (currentStreak > 0) {
              currentStreak++;
            } else {
              currentStreak = 1;
            }
            maxWinStreak = Math.max(maxWinStreak, currentStreak);
          } else if (betRecord.result === 'lose') {
            if (currentStreak < 0) {
              currentStreak--;
            } else {
              currentStreak = -1;
            }
            maxLoseStreak = Math.max(maxLoseStreak, Math.abs(currentStreak));
          }

          // 자본 곡선 업데이트 (일별)
          if (betRecord.raceDate !== lastEquityDate) {
            equityCurve.push({
              date: betRecord.raceDate,
              capital: currentCapital,
              drawdown,
            });
            lastEquityDate = betRecord.raceDate;
          }
        }
      }

      processedRaces++;

      // 진행률 업데이트
      if (processedRaces % PROGRESS_UPDATE_INTERVAL === 0 || processedRaces === totalRaces) {
        const progress = Math.round((processedRaces / totalRaces) * 100);
        await this.options.onProgress?.(
          progress,
          `Processing ${processedRaces}/${totalRaces} races...`
        );
      }
    }

    // 결과 요약 계산
    const summary = this.calculateSummary(
      bets,
      totalRaces,
      matchedRaces,
      this.options.initialCapital,
      currentCapital,
      maxDrawdown,
      maxWinStreak,
      maxLoseStreak
    );

    const executionTimeMs = Date.now() - startTime;

    return {
      request,
      summary,
      bets,
      equityCurve,
      executedAt: new Date().toISOString(),
      executionTimeMs,
    };
  }

  /**
   * 베팅 금액 계산
   */
  private calculateBetAmount(
    strategy: BacktestRequest['strategy'],
    currentCapital: number,
    _evaluation: EvaluationResult
  ): number {
    const stake = strategy.stake;

    // 고정 금액
    if (stake?.fixed) {
      return stake.fixed;
    }

    // 자본 대비 비율
    if (stake?.percentOfBankroll) {
      return Math.floor(currentCapital * (stake.percentOfBankroll / 100));
    }

    // Kelly Criterion (간소화된 버전)
    if (stake?.useKelly) {
      // 실제 Kelly는 승률과 배당률이 필요
      // 여기서는 보수적으로 2%로 제한
      return Math.floor(currentCapital * 0.02);
    }

    // 기본값
    return this.options.defaultBetAmount;
  }

  /**
   * 베팅 처리 및 결과 계산
   */
  private processBet(
    race: RaceContext,
    evaluation: EvaluationResult,
    result: RaceResultData | null,
    betAmount: number,
    currentCapital: number
  ): BetRecord {
    const entryNo = evaluation.entryNo;

    // 경주 취소된 경우
    if (result?.canceled) {
      return {
        raceId: race.raceId,
        raceDate: race.raceDate,
        track: race.track,
        raceNo: race.raceNo,
        entryNo,
        betAmount,
        oddsAtBet: this.getEntryOdds(race, entryNo),
        result: 'refund',
        profit: 0,
        cumulativeCapital: currentCapital,
      };
    }

    // 결과가 없는 경우 (데이터 누락)
    if (!result) {
      return {
        raceId: race.raceId,
        raceDate: race.raceDate,
        track: race.track,
        raceNo: race.raceNo,
        entryNo,
        betAmount,
        oddsAtBet: this.getEntryOdds(race, entryNo),
        result: 'refund',
        profit: 0,
        cumulativeCapital: currentCapital,
      };
    }

    const position = result.finishPositions.get(entryNo);
    const action = evaluation.action;
    const oddsAtBet = this.getEntryOdds(race, entryNo);

    let isWin = false;
    let payout = 0;

    // 베팅 유형에 따른 승리 판정
    if (action === 'bet_win') {
      // 단승: 1등만
      isWin = position === 1;
      if (isWin) {
        const winOdds = result.dividends.win.get(entryNo) ?? oddsAtBet;
        payout = Math.floor(betAmount * winOdds);
      }
    } else if (action === 'bet_place') {
      // 복승: 1~3등 (경마 기준)
      isWin = position !== undefined && position <= 3;
      if (isWin) {
        const placeOdds = result.dividends.place?.get(entryNo) ?? oddsAtBet * 0.5;
        payout = Math.floor(betAmount * placeOdds);
      }
    }

    const profit = isWin ? payout - betAmount : -betAmount;
    const newCapital = currentCapital + profit;

    return {
      raceId: race.raceId,
      raceDate: race.raceDate,
      track: race.track,
      raceNo: race.raceNo,
      entryNo,
      betAmount,
      oddsAtBet,
      result: isWin ? 'win' : 'lose',
      profit,
      cumulativeCapital: newCapital,
    };
  }

  /**
   * 엔트리의 배당률 가져오기
   */
  private getEntryOdds(race: RaceContext, entryNo: number): number {
    const entry = race.entries.find((e) => e.entryNo === entryNo);
    return entry?.odds_win ?? 0;
  }

  /**
   * 결과 요약 계산
   */
  private calculateSummary(
    bets: BetRecord[],
    totalRaces: number,
    matchedRaces: number,
    initialCapital: number,
    finalCapital: number,
    maxDrawdown: number,
    maxWinStreak: number,
    maxLoseStreak: number
  ): BacktestSummary {
    const wins = bets.filter((b) => b.result === 'win').length;
    const losses = bets.filter((b) => b.result === 'lose').length;
    const refunds = bets.filter((b) => b.result === 'refund').length;

    const totalBets = wins + losses; // 환불 제외
    const winRate = totalBets > 0 ? (wins / totalBets) * 100 : 0;

    const totalBetAmount = bets
      .filter((b) => b.result !== 'refund')
      .reduce((sum, b) => sum + b.betAmount, 0);
    const totalProfit = finalCapital - initialCapital;
    const roi = totalBetAmount > 0 ? (totalProfit / totalBetAmount) * 100 : 0;
    const capitalReturn = ((finalCapital - initialCapital) / initialCapital) * 100;

    const avgOdds =
      bets.length > 0
        ? bets.reduce((sum, b) => sum + b.oddsAtBet, 0) / bets.length
        : 0;
    const avgBetAmount =
      totalBets > 0
        ? bets.filter((b) => b.result !== 'refund').reduce((sum, b) => sum + b.betAmount, 0) /
          totalBets
        : 0;

    return {
      totalRaces,
      matchedRaces,
      totalBets,
      wins,
      losses,
      refunds,
      winRate: Math.round(winRate * 100) / 100,
      totalProfit,
      roi: Math.round(roi * 100) / 100,
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,
      finalCapital,
      capitalReturn: Math.round(capitalReturn * 100) / 100,
      avgOdds: Math.round(avgOdds * 100) / 100,
      avgBetAmount: Math.round(avgBetAmount),
      maxWinStreak,
      maxLoseStreak,
    };
  }
}

// =============================================================================
// Mock Data Source (for testing)
// =============================================================================

/**
 * 테스트용 Mock 데이터 소스
 */
export class MockRaceDataSource implements RaceDataSource {
  private races: Map<string, RaceContext> = new Map();
  private results: Map<string, RaceResultData> = new Map();

  addRace(race: RaceContext, result?: RaceResultData): void {
    this.races.set(race.raceId, race);
    if (result) {
      this.results.set(race.raceId, result);
    }
  }

  async getRaceIds(
    dateFrom: string,
    dateTo: string,
    filters?: RaceFilters
  ): Promise<string[]> {
    const ids: string[] = [];

    for (const [id, race] of Array.from(this.races.entries())) {
      // 날짜 필터
      if (race.raceDate < dateFrom || race.raceDate > dateTo) {
        continue;
      }

      // 유형 필터
      if (filters?.raceTypes && !filters.raceTypes.includes(race.raceType)) {
        continue;
      }

      // 트랙 필터
      if (filters?.tracks && !filters.tracks.includes(race.track)) {
        continue;
      }

      ids.push(id);
    }

    return ids.sort();
  }

  async getRaceContext(raceId: string): Promise<RaceContext | null> {
    return this.races.get(raceId) ?? null;
  }

  async getRaceResult(raceId: string): Promise<RaceResultData | null> {
    return this.results.get(raceId) ?? null;
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * 백테스트 실행 편의 함수
 */
export async function runBacktest(
  request: BacktestRequest,
  dataSource: RaceDataSource,
  options?: Partial<ExecutorOptions>
): Promise<BacktestResult> {
  const executor = new BacktestExecutor(request, dataSource, options);
  return executor.execute(request);
}
