/**
 * Prediction Constants
 *
 * 예측 모델의 가중치 및 상수 정의
 */

import type { ModelWeights } from '@/types/prediction';

// =============================================================================
// 기본 모델 가중치
// =============================================================================

/**
 * 기본 모델 가중치
 *
 * External Factors (40%):
 * - 주로상태 12%: 함수율이 선행/추입에 미치는 영향
 * - 게이트 8%: 서울 1000m 등 특수 케이스
 * - 거리 적합도 10%: 마필의 거리 선호도
 * - 필드 크기 5%: 출주 두수에 따른 경쟁 강도
 * - 주로 표면 5%: 더트/잔디 적성
 *
 * Internal Factors (60%):
 * - 레이팅 15%: 마필의 종합 능력
 * - 최근 폼 10%: 최근 5경주 성적
 * - 부담중량 8%: 마체중 대비 부담비율
 * - 거리 선호도 7%: 해당 거리 성적
 * - 기수 승률 8%: 기수의 최근 1년 성적
 * - 조교사 5%: 조교사의 성적
 * - 기수-조교사 콤보 7%: 시너지 효과
 */
export const DEFAULT_MODEL_WEIGHTS: ModelWeights = {
  id: 'default-v1',
  name: 'RaceLab Default Model',
  version: '1.0.0',

  external: {
    trackCondition: 0.12,
    gatePosition: 0.08,
    trackFit: 0.1,
    fieldSize: 0.05,
    surface: 0.05,
  },

  internal: {
    rating: 0.15,
    recentForm: 0.1,
    burdenFit: 0.08,
    distancePreference: 0.07,
    jockeyWinRate: 0.08,
    trainerWinRate: 0.05,
    jockeyTrainerCombo: 0.07,
    bloodlineAptitude: 0.0, // Phase 2에서 활성화
  },

  adjustments: {
    seoulMultiplier: 1.0,
    busanMultiplier: 1.0,
    jejuMultiplier: 1.0,
    sprintBonus: 0,
    routeBonus: 0,
    wetTrackCloserBonus: 0.05,
    dryTrackFrontBonus: 0.03,
  },

  createdAt: new Date().toISOString(),
};

// =============================================================================
// Softmax 파라미터
// =============================================================================

/** Softmax temperature (높을수록 확률 분포가 균등해짐) */
export const SOFTMAX_TEMPERATURE = 20;

// =============================================================================
// 신뢰도 임계값
// =============================================================================

/** 데이터 완성도 기준 */
export const DATA_COMPLETENESS_THRESHOLDS = {
  /** 고신뢰 */
  HIGH: 0.8,
  /** 중신뢰 */
  MEDIUM: 0.5,
  /** 저신뢰 */
  LOW: 0.0,
} as const;

/** 샘플 수 기준 (콤보 통계 등) */
export const SAMPLE_SIZE_THRESHOLDS = {
  /** 고신뢰: 30회 이상 */
  HIGH: 30,
  /** 중신뢰: 10회 이상 */
  MEDIUM: 10,
  /** 저신뢰: 10회 미만 */
  LOW: 0,
} as const;

// =============================================================================
// 추천 임계값
// =============================================================================

/** 추천 액션 결정 임계값 */
export const RECOMMENDATION_THRESHOLDS = {
  /** 강력 추천: 상위 10% */
  STRONG_BET: 0.9,
  /** 추천: 상위 25% */
  BET: 0.75,
  /** 검토: 상위 50% */
  CONSIDER: 0.5,
  /** 회피: 하위 50% */
  AVOID: 0.0,
} as const;

/** 가치 베팅 임계값 */
export const VALUE_THRESHOLDS = {
  /** 양수 엣지 임계값 */
  POSITIVE_EDGE: 0.05,
  /** Kelly 최대 비율 */
  MAX_KELLY: 0.25,
} as const;

// =============================================================================
// 거리 분류
// =============================================================================

/** 거리 분류 (m) */
export const DISTANCE_CATEGORIES = {
  SPRINT: { min: 0, max: 1200, label: '단거리' },
  MILE: { min: 1201, max: 1600, label: '마일' },
  MIDDLE: { min: 1601, max: 2000, label: '중거리' },
  LONG: { min: 2001, max: 9999, label: '장거리' },
} as const;

/**
 * 거리 카테고리 조회
 */
export function getDistanceCategory(
  distance: number
): keyof typeof DISTANCE_CATEGORIES {
  if (distance <= DISTANCE_CATEGORIES.SPRINT.max) return 'SPRINT';
  if (distance <= DISTANCE_CATEGORIES.MILE.max) return 'MILE';
  if (distance <= DISTANCE_CATEGORIES.MIDDLE.max) return 'MIDDLE';
  return 'LONG';
}

// =============================================================================
// 성별 분류
// =============================================================================

/** 성별 코드 */
export const SEX_CODES = {
  MALE: 'male',
  FEMALE: 'female',
  GELDING: 'gelding',
} as const;

/** 성별 한글명 */
export const SEX_NAMES: Record<string, string> = {
  male: '수말',
  female: '암말',
  gelding: '거세마',
  M: '수말',
  F: '암말',
  G: '거세마',
  수: '수말',
  암: '암말',
  거: '거세마',
};

// =============================================================================
// 폼 점수 계산
// =============================================================================

/** 폼 점수 가중치 (최근 경주일수록 높음) */
export const FORM_WEIGHTS = [0.35, 0.25, 0.2, 0.12, 0.08]; // 최신 5경주

/** 순위별 점수 */
export const POSITION_SCORES: Record<number, number> = {
  1: 100,
  2: 80,
  3: 60,
  4: 45,
  5: 35,
  6: 25,
  7: 20,
  8: 15,
  9: 12,
  10: 10,
};

/**
 * 순위에서 점수 계산
 */
export function getPositionScore(position: number): number {
  if (position <= 10) return POSITION_SCORES[position] ?? 10;
  return Math.max(5, 15 - position); // 11위 이후는 점진적 감소
}

// =============================================================================
// 모델 버전
// =============================================================================

export const MODEL_VERSION = '1.0.0';
