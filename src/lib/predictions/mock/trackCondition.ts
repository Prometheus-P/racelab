/**
 * Track Condition Mock Generator
 *
 * KRA API에서 제공하지 않는 주로상태 데이터 생성
 * 연구문서 기반 함수율 추정
 */

import type { TrackCondition, TrackConditionCode } from '@/types/track-condition';
import { createTrackConditionFromMoisture } from '@/types/track-condition';

// =============================================================================
// Types
// =============================================================================

export interface WeatherData {
  /** 강수량 (mm) */
  precipitation: number;
  /** 습도 (%) */
  humidity: number;
  /** 최근 24시간 강수량 (mm) */
  precipitation24h?: number;
  /** 기온 (°C) */
  temperature?: number;
}

export interface TrackConditionOptions {
  /** 경마장 코드 */
  meetCode: '1' | '2' | '3';
  /** 날씨 데이터 (선택) */
  weather?: WeatherData;
  /** 고정 주로상태 코드 (테스트용) */
  fixedCode?: TrackConditionCode;
  /** 시드값 (재현 가능한 랜덤용) */
  seed?: number;
}

// =============================================================================
// Mock Generator
// =============================================================================

/**
 * 주로상태 Mock 생성
 */
export function generateMockTrackCondition(
  options: TrackConditionOptions = { meetCode: '1' }
): TrackCondition {
  const { fixedCode, weather, meetCode } = options;

  // 고정 코드 지정된 경우
  if (fixedCode) {
    return createTrackConditionFromCode(fixedCode, meetCode);
  }

  // 날씨 데이터 있으면 추정
  if (weather) {
    return estimateFromWeather(weather, meetCode);
  }

  // 기본: 랜덤 생성 (양호~약간불량)
  return generateRandomCondition(options);
}

/**
 * 주로상태 코드에서 TrackCondition 생성
 */
function createTrackConditionFromCode(
  code: TrackConditionCode,
  meetCode: string
): TrackCondition {
  // 코드별 함수율 범위 중간값
  const moistureMap: Record<TrackConditionCode, number> = {
    '1': 8, // 양호: 5-10%
    '2': 12.5, // 약간불량: 10-15%
    '3': 20, // 불량: 15-25%
    '4': 30, // 극불량: 25%+
  };

  const moisture = moistureMap[code];
  const condition = createTrackConditionFromMoisture(moisture);

  // 경마장별 조정
  return applyMeetAdjustment(condition, meetCode);
}

/**
 * 날씨 데이터에서 함수율 추정
 */
function estimateFromWeather(
  weather: WeatherData,
  meetCode: string
): TrackCondition {
  let estimatedMoisture = 8; // 기본 양호

  // 현재 강수량 영향
  if (weather.precipitation > 0) {
    estimatedMoisture += weather.precipitation * 2;
  }

  // 24시간 누적 강수량 영향
  if (weather.precipitation24h) {
    estimatedMoisture += weather.precipitation24h * 0.5;
  }

  // 습도 영향 (80% 이상이면 추가)
  if (weather.humidity > 80) {
    estimatedMoisture += (weather.humidity - 80) * 0.1;
  }

  // 기온 영향 (낮은 기온은 건조 느림)
  if (weather.temperature !== undefined && weather.temperature < 10) {
    estimatedMoisture += 2;
  }

  // 범위 제한 (5-35%)
  estimatedMoisture = Math.max(5, Math.min(35, estimatedMoisture));

  const condition = createTrackConditionFromMoisture(estimatedMoisture);
  return applyMeetAdjustment(condition, meetCode);
}

/**
 * 랜덤 주로상태 생성
 */
function generateRandomCondition(options: TrackConditionOptions): TrackCondition {
  const { meetCode, seed } = options;

  // 시드 기반 랜덤 (재현 가능)
  const random = seed !== undefined ? seededRandom(seed) : Math.random;

  // 대부분 양호 (70%), 약간불량 (20%), 불량 (8%), 극불량 (2%)
  const roll = random();
  let moisture: number;

  if (roll < 0.7) {
    // 양호: 5-10%
    moisture = 5 + random() * 5;
  } else if (roll < 0.9) {
    // 약간불량: 10-15%
    moisture = 10 + random() * 5;
  } else if (roll < 0.98) {
    // 불량: 15-25%
    moisture = 15 + random() * 10;
  } else {
    // 극불량: 25-35%
    moisture = 25 + random() * 10;
  }

  const condition = createTrackConditionFromMoisture(moisture);
  return applyMeetAdjustment(condition, meetCode);
}

/**
 * 경마장별 조정 적용
 */
function applyMeetAdjustment(
  condition: TrackCondition,
  meetCode: string
): TrackCondition {
  // 서울은 배수가 좋아 약간 낮은 함수율
  // 부경은 해안가라 약간 높은 함수율
  // 제주는 기후 영향으로 변동성 큼

  let adjustment = 0;

  switch (meetCode) {
    case '1': // 서울
      adjustment = -1;
      break;
    case '2': // 제주
      adjustment = 0;
      break;
    case '3': // 부경
      adjustment = 1;
      break;
  }

  const adjustedMoisture = (condition.moisture ?? 10) + adjustment;
  return createTrackConditionFromMoisture(Math.max(5, Math.min(35, adjustedMoisture)));
}

/**
 * 시드 기반 랜덤 함수
 */
function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

// =============================================================================
// Batch Generation
// =============================================================================

/**
 * 여러 경주의 주로상태 일괄 생성
 */
export function generateBatchTrackConditions(
  count: number,
  options: Omit<TrackConditionOptions, 'seed'> = { meetCode: '1' }
): TrackCondition[] {
  return Array.from({ length: count }, (_, i) =>
    generateMockTrackCondition({ ...options, seed: i })
  );
}

/**
 * 테스트용 극단적 주로상태 생성
 */
export function createExtremeConditions(): {
  dry: TrackCondition;
  wet: TrackCondition;
  optimal: TrackCondition;
} {
  return {
    dry: createTrackConditionFromMoisture(5), // 매우 건조 - 추입마 유리
    wet: createTrackConditionFromMoisture(30), // 매우 습함 - 선행마 유리
    optimal: createTrackConditionFromMoisture(12), // 최적 - 균형
  };
}
