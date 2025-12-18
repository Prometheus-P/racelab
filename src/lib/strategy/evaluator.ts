/**
 * Strategy Evaluator
 *
 * 전략 조건을 실제 데이터와 대조하여 평가하는 엔진
 * 보안: 모든 필드/연산자는 whitelist 기반으로 처리
 */

import type {
  StrategyDefinition,
  StrategyCondition,
  ConditionField,
  ConditionOperator,
  TimeReference,
  BetAction,
} from './types';
import { FIELD_METADATA } from './types';

// =============================================================================
// Data Context Types
// =============================================================================

/**
 * 단일 경주 엔트리의 평가 데이터 컨텍스트
 */
export interface EntryContext {
  // 식별자
  raceId: string;
  entryNo: number;

  // 배당률 관련 (Phase 0)
  odds_win?: number;
  odds_place?: number;
  odds_drift_pct?: number; // (last - first) / first * 100
  odds_stddev?: number;

  // 수급 관련 (Phase 0)
  popularity_rank?: number;
  pool_total?: number;
  pool_win_pct?: number;

  // 경주마 정보 (Phase 1)
  horse_rating?: number;
  burden_weight?: number;
  entry_count?: number;

  // 시계열 데이터 (시간 참조용)
  oddsTimeline?: Array<{
    time: Date;
    odds_win: number;
    odds_place?: number;
  }>;
}

/**
 * 경주 컨텍스트 (모든 엔트리 포함)
 */
export interface RaceContext {
  raceId: string;
  raceDate: string;
  raceNo: number;
  track: string;
  raceType: 'horse' | 'cycle' | 'boat';
  grade?: string;
  startTime?: Date;
  entries: EntryContext[];
}

/**
 * 평가 결과
 */
export interface EvaluationResult {
  raceId: string;
  entryNo: number;
  matched: boolean;
  action: BetAction;
  conditionResults: ConditionResult[];
  confidence?: number; // 조건 매칭 강도 (추후)
}

/**
 * 개별 조건 평가 결과
 */
export interface ConditionResult {
  field: ConditionField;
  operator: ConditionOperator;
  expectedValue: unknown;
  actualValue: unknown;
  matched: boolean;
  error?: string;
}

// =============================================================================
// Strategy Evaluator Class
// =============================================================================

/**
 * 전략 평가기
 */
export class StrategyEvaluator {
  private strategy: StrategyDefinition;

  constructor(strategy: StrategyDefinition) {
    this.strategy = strategy;
  }

  /**
   * 단일 경주의 모든 엔트리에 대해 전략 평가
   * @returns 조건을 만족하는 엔트리들의 평가 결과
   */
  evaluateRace(race: RaceContext): EvaluationResult[] {
    const results: EvaluationResult[] = [];

    // 필터 조건 확인
    if (!this.passesFilters(race)) {
      return results;
    }

    // 각 엔트리에 대해 조건 평가
    for (const entry of race.entries) {
      const result = this.evaluateEntry(entry, race);
      if (result.matched) {
        results.push(result);
      }
    }

    return results;
  }

  /**
   * 단일 엔트리에 대해 모든 조건 평가
   */
  evaluateEntry(entry: EntryContext, race: RaceContext): EvaluationResult {
    const conditionResults: ConditionResult[] = [];
    let allMatched = true;

    // entry_count는 경주 레벨 데이터이므로 추가
    const entryWithRaceData: EntryContext = {
      ...entry,
      entry_count: race.entries.length,
    };

    // 모든 조건 평가 (AND 조합)
    for (const condition of this.strategy.conditions) {
      const result = this.evaluateCondition(condition, entryWithRaceData);
      conditionResults.push(result);

      if (!result.matched) {
        allMatched = false;
        // 하나라도 실패하면 더 이상 평가할 필요 없음
        break;
      }
    }

    return {
      raceId: entry.raceId,
      entryNo: entry.entryNo,
      matched: allMatched,
      action: allMatched ? this.strategy.action : 'skip',
      conditionResults,
    };
  }

  /**
   * 단일 조건 평가
   */
  private evaluateCondition(
    condition: StrategyCondition,
    entry: EntryContext
  ): ConditionResult {
    const { field, operator, value, timeRef } = condition;

    // 필드 값 추출
    const actualValue = this.getFieldValue(field, entry, timeRef);

    // 값이 없는 경우
    if (actualValue === undefined || actualValue === null) {
      return {
        field,
        operator,
        expectedValue: value,
        actualValue: null,
        matched: false,
        error: `Field '${field}' has no value`,
      };
    }

    // 연산자별 비교
    const matched = this.compareValues(operator, actualValue, value);

    return {
      field,
      operator,
      expectedValue: value,
      actualValue,
      matched,
    };
  }

  /**
   * 필드 값 추출 (시간 참조 포함)
   */
  private getFieldValue(
    field: ConditionField,
    entry: EntryContext,
    timeRef?: TimeReference
  ): number | undefined {
    // 시계열 데이터가 있고 시간 참조가 지정된 경우
    if (timeRef && entry.oddsTimeline && entry.oddsTimeline.length > 0) {
      return this.getTimeRefValue(field, entry, timeRef);
    }

    // 직접 필드 값 반환
    return entry[field] as number | undefined;
  }

  /**
   * 시간 참조 기반 값 추출
   */
  private getTimeRefValue(
    field: ConditionField,
    entry: EntryContext,
    timeRef: TimeReference
  ): number | undefined {
    const timeline = entry.oddsTimeline;
    if (!timeline || timeline.length === 0) {
      return undefined;
    }

    // 시간순 정렬
    const sorted = [...timeline].sort((a, b) => a.time.getTime() - b.time.getTime());

    switch (timeRef) {
      case 'first':
        return this.getOddsFromSnapshot(sorted[0], field);

      case 'last':
        return this.getOddsFromSnapshot(sorted[sorted.length - 1], field);

      case 'T-5m':
      case 'T-15m':
      case 'T-30m':
      case 'T-60m': {
        // T-Xm 형식에서 분 추출
        const minutes = parseInt(timeRef.slice(2, -1), 10);
        return this.findClosestSnapshot(sorted, minutes, field);
      }

      default:
        return entry[field] as number | undefined;
    }
  }

  /**
   * 스냅샷에서 배당률 필드 추출
   */
  private getOddsFromSnapshot(
    snapshot: { odds_win: number; odds_place?: number },
    field: ConditionField
  ): number | undefined {
    if (field === 'odds_win') return snapshot.odds_win;
    if (field === 'odds_place') return snapshot.odds_place;
    return undefined;
  }

  /**
   * 경주 시작 X분 전에 가장 가까운 스냅샷 찾기
   */
  private findClosestSnapshot(
    sorted: Array<{ time: Date; odds_win: number; odds_place?: number }>,
    minutesBefore: number,
    field: ConditionField
  ): number | undefined {
    // 마지막 스냅샷을 경주 시작 시간으로 가정
    const lastTime = sorted[sorted.length - 1].time;
    const targetTime = new Date(lastTime.getTime() - minutesBefore * 60 * 1000);

    // 타겟 시간에 가장 가까운 스냅샷 찾기
    let closest = sorted[0];
    let minDiff = Math.abs(sorted[0].time.getTime() - targetTime.getTime());

    for (const snapshot of sorted) {
      const diff = Math.abs(snapshot.time.getTime() - targetTime.getTime());
      if (diff < minDiff) {
        minDiff = diff;
        closest = snapshot;
      }
    }

    return this.getOddsFromSnapshot(closest, field);
  }

  /**
   * 연산자별 값 비교
   */
  private compareValues(
    operator: ConditionOperator,
    actual: number,
    expected: number | string | [number, number] | number[] | string[]
  ): boolean {
    switch (operator) {
      case 'eq':
        return actual === expected;

      case 'ne':
        return actual !== expected;

      case 'gt':
        return actual > (expected as number);

      case 'gte':
        return actual >= (expected as number);

      case 'lt':
        return actual < (expected as number);

      case 'lte':
        return actual <= (expected as number);

      case 'between': {
        const [min, max] = expected as [number, number];
        return actual >= min && actual <= max;
      }

      case 'in': {
        const list = expected as number[];
        return list.includes(actual);
      }

      default:
        return false;
    }
  }

  /**
   * 필터 조건 확인
   */
  private passesFilters(race: RaceContext): boolean {
    const filters = this.strategy.filters;
    if (!filters) return true;

    // 경주 유형 필터
    if (filters.raceTypes && !filters.raceTypes.includes(race.raceType)) {
      return false;
    }

    // 경주장 필터
    if (filters.tracks && !filters.tracks.includes(race.track)) {
      return false;
    }

    // 등급 필터
    if (filters.grades && race.grade && !filters.grades.includes(race.grade)) {
      return false;
    }

    // 최소 출주 마리 수
    if (filters.minEntries && race.entries.length < filters.minEntries) {
      return false;
    }

    return true;
  }

  /**
   * 전략 정보 조회
   */
  getStrategy(): StrategyDefinition {
    return this.strategy;
  }

  /**
   * 지원하는 필드 목록 반환 (현재 구현된 Phase 기준)
   */
  static getSupportedFields(maxPhase: 0 | 1 | 2 = 0): ConditionField[] {
    return (Object.keys(FIELD_METADATA) as ConditionField[]).filter(
      (field) => FIELD_METADATA[field].phase <= maxPhase
    );
  }
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * 배당률 드리프트 계산
 * @param firstOdds 최초 배당률
 * @param lastOdds 최종 배당률
 * @returns 변화율 (%)
 */
export function calculateOddsDrift(firstOdds: number, lastOdds: number): number {
  if (firstOdds === 0) return 0;
  return ((lastOdds - firstOdds) / firstOdds) * 100;
}

/**
 * 배당률 표준편차 계산
 * @param oddsList 배당률 배열
 * @returns 표준편차
 */
export function calculateOddsStdDev(oddsList: number[]): number {
  if (oddsList.length === 0) return 0;

  const mean = oddsList.reduce((a, b) => a + b, 0) / oddsList.length;
  const squaredDiffs = oddsList.map((x) => Math.pow(x - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / oddsList.length;

  return Math.sqrt(variance);
}

/**
 * 매출 비율 계산
 * @param entryPool 특정 마번의 매출
 * @param totalPool 총 매출
 * @returns 비율 (%)
 */
export function calculatePoolPercentage(entryPool: number, totalPool: number): number {
  if (totalPool === 0) return 0;
  return (entryPool / totalPool) * 100;
}

/**
 * 편의 함수: 전략으로 경주 평가
 */
export function evaluateRace(
  strategy: StrategyDefinition,
  race: RaceContext
): EvaluationResult[] {
  const evaluator = new StrategyEvaluator(strategy);
  return evaluator.evaluateRace(race);
}

/**
 * 편의 함수: 여러 경주 일괄 평가
 */
export function evaluateRaces(
  strategy: StrategyDefinition,
  races: RaceContext[]
): Map<string, EvaluationResult[]> {
  const evaluator = new StrategyEvaluator(strategy);
  const results = new Map<string, EvaluationResult[]>();

  for (const race of races) {
    const raceResults = evaluator.evaluateRace(race);
    if (raceResults.length > 0) {
      results.set(race.raceId, raceResults);
    }
  }

  return results;
}
