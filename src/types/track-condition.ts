/**
 * Track Condition Types
 *
 * 주로상태 및 함수율 관련 타입 정의
 * 연구 문서: 함수율에 따른 모래의 역학적 변화
 *
 * - 건조(1-5%): 무거운 주로, 추입마 유리
 * - 양호(6-14%): 표준 상태
 * - 다습(15-20%): 가벼운 주로, 선행마 유리
 * - 불량(20%+): 빠른 주로, 선행마 절대 유리
 */

// =============================================================================
// 주로상태 코드
// =============================================================================

/** 주로상태 코드 (1=양호, 2=약간불량, 3=불량, 4=극악) */
export type TrackConditionCode = '1' | '2' | '3' | '4';

/** 주로상태 코드 → 이름 매핑 */
export const TRACK_CONDITION_NAMES: Record<TrackConditionCode, string> = {
  '1': '양호',
  '2': '약간불량',
  '3': '불량',
  '4': '극악',
};

/** 주로상태 코드 → 영문명 매핑 */
export const TRACK_CONDITION_NAMES_EN: Record<TrackConditionCode, string> = {
  '1': 'Good',
  '2': 'Slightly Off',
  '3': 'Off',
  '4': 'Heavy',
};

/** 주로 표면 타입 */
export type TrackSurface = 'turf' | 'dirt';

// =============================================================================
// 주로상태 도메인 모델
// =============================================================================

/**
 * 주로상태 도메인 모델
 *
 * 연구 문서 참고:
 * - 함수율 1-5%: 건조, 추입마 유리, 기록 지연
 * - 함수율 6-14%: 양호, 표준 상태
 * - 함수율 15%+: 다습/불량, 선행마 유리, 기록 단축
 */
export interface TrackCondition {
  /** 상태 코드 (1-4) */
  code: TrackConditionCode;
  /** 상태명 (한글) */
  name: string;
  /** 상태명 (영문) */
  nameEn: string;
  /** 함수율 (%) - 0~100, undefined면 추정값 사용 */
  moisture?: number;
  /** 주로 표면 */
  surface: TrackSurface;
  /**
   * 속도 영향 계수
   * - 1.0 = 기준 (양호)
   * - >1.0 = 느림 (건조한 모래)
   * - <1.0 = 빠름 (젖은 주로)
   */
  speedImpactFactor: number;
  /** 선행마 유리 정도 (-1.0 ~ 1.0, 양수=선행 유리) */
  frontRunnerAdvantage: number;
  /** 추입마 유리 정도 (-1.0 ~ 1.0, 양수=추입 유리) */
  closerAdvantage: number;
}

// =============================================================================
// 함수율 구간 상수
// =============================================================================

/** 함수율 구간 정의 */
export const MOISTURE_RANGES = {
  /** 건조 (1-5%): 무거운 주로 */
  DRY: { min: 0, max: 5 },
  /** 양호 (6-14%): 표준 */
  GOOD: { min: 6, max: 14 },
  /** 다습 (15-20%): 가벼운 주로 */
  DAMP: { min: 15, max: 20 },
  /** 불량 (20%+): 매우 빠른 주로 */
  WET: { min: 20, max: 100 },
} as const;

/** 함수율에 따른 속도 영향 계수 */
export const MOISTURE_SPEED_FACTORS: Record<string, number> = {
  /** 건조: 느림 (모래 저항) */
  DRY: 1.08,
  /** 양호: 기준 */
  GOOD: 1.0,
  /** 다습: 빠름 (패킹 효과) */
  DAMP: 0.97,
  /** 불량: 매우 빠름 */
  WET: 0.95,
};

/** 함수율에 따른 주행 스타일 보너스 */
export const MOISTURE_STYLE_BONUS: Record<string, { frontRunner: number; closer: number }> = {
  /** 건조: 추입마 유리 */
  DRY: { frontRunner: -0.05, closer: 0.08 },
  /** 양호: 중립 */
  GOOD: { frontRunner: 0, closer: 0 },
  /** 다습: 선행마 유리 */
  DAMP: { frontRunner: 0.05, closer: -0.03 },
  /** 불량: 선행마 절대 유리 (모래 튀김) */
  WET: { frontRunner: 0.1, closer: -0.08 },
};

// =============================================================================
// 유틸리티 함수
// =============================================================================

/**
 * 함수율에서 구간 이름 추출
 */
export function getMoistureRange(moisture: number): keyof typeof MOISTURE_RANGES {
  if (moisture <= MOISTURE_RANGES.DRY.max) return 'DRY';
  if (moisture <= MOISTURE_RANGES.GOOD.max) return 'GOOD';
  if (moisture <= MOISTURE_RANGES.DAMP.max) return 'DAMP';
  return 'WET';
}

/**
 * 함수율에서 속도 영향 계수 계산
 */
export function calculateSpeedFactor(moisture: number): number {
  const range = getMoistureRange(moisture);
  return MOISTURE_SPEED_FACTORS[range];
}

/**
 * 함수율에서 주행 스타일 보너스 계산
 */
export function calculateStyleBonus(
  moisture: number
): { frontRunner: number; closer: number } {
  const range = getMoistureRange(moisture);
  return MOISTURE_STYLE_BONUS[range];
}

/**
 * 주로상태 코드에서 TrackCondition 생성
 * @param code 주로상태 코드
 * @param surface 주로 표면
 * @param moisture 함수율 (없으면 코드 기반 추정)
 */
export function createTrackCondition(
  code: TrackConditionCode,
  surface: TrackSurface = 'dirt',
  moisture?: number
): TrackCondition {
  // 함수율이 없으면 코드 기반 추정
  const estimatedMoisture = moisture ?? getEstimatedMoisture(code);
  const range = getMoistureRange(estimatedMoisture);
  const styleBonus = MOISTURE_STYLE_BONUS[range];

  return {
    code,
    name: TRACK_CONDITION_NAMES[code],
    nameEn: TRACK_CONDITION_NAMES_EN[code],
    moisture: estimatedMoisture,
    surface,
    speedImpactFactor: MOISTURE_SPEED_FACTORS[range],
    frontRunnerAdvantage: styleBonus.frontRunner,
    closerAdvantage: styleBonus.closer,
  };
}

/**
 * 주로상태 코드에서 함수율 추정
 * 연구 문서 기반 중앙값 사용
 */
function getEstimatedMoisture(code: TrackConditionCode): number {
  switch (code) {
    case '1':
      return 10; // 양호: 10%
    case '2':
      return 17; // 약간불량: 17%
    case '3':
      return 23; // 불량: 23%
    case '4':
      return 30; // 극악: 30%
    default:
      return 10;
  }
}

// =============================================================================
// 게이트 위치 분석 (서울 1000m 특수성)
// =============================================================================

/**
 * 게이트 위치 유불리 계수
 * 연구 문서: 서울 1000m는 내측 게이트 승률 높음
 */
export interface GateAdvantage {
  /** 경마장 코드 */
  meetCode: string;
  /** 거리 (m) */
  distance: number;
  /** 게이트별 유불리 (-1.0 ~ 1.0) */
  gateFactors: Record<number, number>;
}

/**
 * 서울 1000m 게이트 유불리
 * 내측(1-4번): 유리, 외측(9-12번): 불리
 */
export const SEOUL_1000M_GATE_FACTORS: GateAdvantage = {
  meetCode: '1',
  distance: 1000,
  gateFactors: {
    1: 0.08,
    2: 0.06,
    3: 0.04,
    4: 0.02,
    5: 0,
    6: 0,
    7: -0.02,
    8: -0.03,
    9: -0.05,
    10: -0.06,
    11: -0.07,
    12: -0.08,
    13: -0.09,
    14: -0.1,
  },
};

/**
 * 기본 게이트 유불리 (다른 거리/경마장)
 * 내측 약간 유리
 */
export const DEFAULT_GATE_FACTORS: Record<number, number> = {
  1: 0.02,
  2: 0.02,
  3: 0.01,
  4: 0.01,
  5: 0,
  6: 0,
  7: 0,
  8: -0.01,
  9: -0.01,
  10: -0.02,
  11: -0.02,
  12: -0.03,
  13: -0.03,
  14: -0.04,
};

/**
 * 게이트 유불리 계수 조회
 */
export function getGateFactor(
  meetCode: string,
  distance: number,
  gateNo: number
): number {
  // 서울 1000m 특수 케이스
  if (meetCode === '1' && distance === 1000) {
    return SEOUL_1000M_GATE_FACTORS.gateFactors[gateNo] ?? 0;
  }
  // 기본값
  return DEFAULT_GATE_FACTORS[gateNo] ?? 0;
}

/**
 * 함수율에서 주로상태 코드 결정
 */
export function getTrackConditionCodeFromMoisture(moisture: number): TrackConditionCode {
  if (moisture <= 10) return '1'; // 양호
  if (moisture <= 17) return '2'; // 약간불량
  if (moisture <= 25) return '3'; // 불량
  return '4'; // 극악
}

/**
 * 함수율 값에서 TrackCondition 생성
 * @param moisture 함수율 (%)
 * @param surface 주로 표면 (기본: dirt)
 */
export function createTrackConditionFromMoisture(
  moisture: number,
  surface: TrackSurface = 'dirt'
): TrackCondition {
  const code = getTrackConditionCodeFromMoisture(moisture);
  return createTrackCondition(code, surface, moisture);
}
