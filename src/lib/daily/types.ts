/**
 * Daily Selections Types
 *
 * 자동 일일 추천 시스템의 타입 정의
 */

import type { StrategyDefinition } from '@/lib/strategy/types';

/**
 * 일일 추천 마필 정보
 */
export interface DailySelection {
  /** 경주 ID */
  raceId: string;

  /** 경주 시간 */
  raceTime: string;

  /** 경주장 */
  track: string;

  /** 경주 번호 */
  raceNo: number;

  /** 마번 */
  entryNo: number;

  /** 마명 */
  horseName: string;

  /** 현재 배당률 */
  odds: number;

  /** 배당률 변화율 (%) */
  oddsChange: number;

  /** 인기순위 */
  popularity: number;

  /** 충족된 조건 목록 */
  matchedConditions: MatchedCondition[];

  /** 매칭 점수 (0-100) */
  matchScore: number;

  /** 결과 (경주 후) */
  result?: SelectionResult;
}

/**
 * 충족된 조건 정보
 */
export interface MatchedCondition {
  /** 필드명 */
  field: string;

  /** 필드 라벨 */
  label: string;

  /** 연산자 */
  operator: string;

  /** 기대값 */
  expectedValue: unknown;

  /** 실제값 */
  actualValue: unknown;
}

/**
 * 추천 결과 (경주 후)
 */
export interface SelectionResult {
  /** 순위 */
  finishPosition: number;

  /** 승리 여부 */
  won: boolean;

  /** 복승 여부 (1-3위) */
  placed: boolean;

  /** 손익 */
  profit: number;
}

/**
 * 일일 성과 요약
 */
export interface DailyPerformance {
  /** 날짜 */
  date: string;

  /** 전략 ID */
  strategyId: string;

  /** 전략 이름 */
  strategyName: string;

  /** 총 추천 수 */
  totalSelections: number;

  /** 완료된 경주 수 */
  completedRaces: number;

  /** 승리 수 */
  wins: number;

  /** 복승 수 */
  places: number;

  /** 승률 (%) */
  winRate: number;

  /** 복승률 (%) */
  placeRate: number;

  /** 총 수익 */
  profit: number;

  /** ROI (%) */
  roi: number;
}

/**
 * 스크리닝 요청
 */
export interface ScreeningRequest {
  /** 전략 정의 */
  strategy: StrategyDefinition;

  /** 대상 날짜 (YYYY-MM-DD) */
  date?: string;

  /** 경주장 필터 */
  tracks?: string[];

  /** 최대 추천 수 */
  limit?: number;
}

/**
 * 스크리닝 결과
 */
export interface ScreeningResult {
  /** 요청 정보 */
  request: {
    strategyId: string;
    strategyName: string;
    date: string;
  };

  /** 추천 목록 */
  selections: DailySelection[];

  /** 스크리닝된 총 경주 수 */
  totalRacesScreened: number;

  /** 스크리닝된 총 마필 수 */
  totalEntriesScreened: number;

  /** 캐시 정보 */
  cache?: {
    hit: boolean;
    ttl: number;
    updatedAt: string;
  };
}

/**
 * 경주 정보 (스크리닝용)
 */
export interface RaceForScreening {
  id: string;
  date: string;
  track: string;
  raceNo: number;
  startTime: string;
  grade?: string;
  distance?: number;
  raceType: 'horse' | 'cycle' | 'boat';
}

/**
 * 출주마 정보 (스크리닝용)
 */
export interface EntryForScreening {
  raceId: string;
  entryNo: number;
  horseName: string;

  // 배당률 관련
  odds_win?: number;
  odds_place?: number;
  odds_drift_pct?: number;
  odds_stddev?: number;

  // 인기순위
  popularity_rank?: number;
  pool_total?: number;
  pool_win_pct?: number;

  // 경주마 정보
  horse_rating?: number;
  burden_weight?: number;

  // 확장 필드 지원
  [key: string]: unknown;
}
