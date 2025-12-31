/**
 * Normalizer
 *
 * 예측 요소들을 0-100 스케일로 정규화
 * field-metadata의 min/max 값을 활용
 */

import {
  EXTENDED_FIELD_METADATA,
  type ExtendedConditionField,
} from '@/lib/strategy/field-metadata';

// =============================================================================
// Min-Max Normalization
// =============================================================================

/**
 * Min-Max 정규화
 * @param value 원본 값
 * @param min 최소값
 * @param max 최대값
 * @returns 0-100 스케일의 정규화된 값
 */
export function minMaxNormalize(value: number, min: number, max: number): number {
  if (max === min) return 50;
  const normalized = ((value - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, normalized));
}

/**
 * 역방향 Min-Max 정규화 (높은 값이 나쁜 경우)
 * 예: 순위 (1위 = 100점, 높은 순위 = 낮은 점수)
 */
export function minMaxNormalizeInverse(
  value: number,
  min: number,
  max: number
): number {
  return 100 - minMaxNormalize(value, min, max);
}

// =============================================================================
// Z-Score Normalization
// =============================================================================

/**
 * Z-Score 정규화 (경주 내 상대 비교용)
 * @param value 원본 값
 * @param mean 평균
 * @param stdDev 표준편차
 * @returns 0-100 스케일의 정규화된 값
 */
export function zScoreNormalize(
  value: number,
  mean: number,
  stdDev: number
): number {
  if (stdDev === 0) return 50;
  const zScore = (value - mean) / stdDev;
  // Z-score를 0-100으로 변환 (대부분 -3 ~ +3 범위)
  return Math.max(0, Math.min(100, 50 + zScore * 16.67));
}

/**
 * 배열에서 평균 계산
 */
export function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * 배열에서 표준편차 계산
 */
export function calculateStdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = calculateMean(values);
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
  return Math.sqrt(calculateMean(squaredDiffs));
}

// =============================================================================
// Field-Based Normalization
// =============================================================================

/**
 * field-metadata 기반 정규화
 * @param field 필드 ID
 * @param value 원본 값
 * @param inverse 역방향 여부 (높은 값이 나쁜 경우)
 * @returns 정규화된 값 (0-100)
 */
export function normalizeByField(
  field: ExtendedConditionField,
  value: number,
  inverse: boolean = false
): number {
  const metadata = EXTENDED_FIELD_METADATA[field];

  if (!metadata) {
    console.warn(`Unknown field: ${field}, using default 0-100 range`);
    return Math.max(0, Math.min(100, value));
  }

  const min = metadata.min ?? 0;
  const max = metadata.max ?? 100;

  return inverse
    ? minMaxNormalizeInverse(value, min, max)
    : minMaxNormalize(value, min, max);
}

// =============================================================================
// Specialized Normalizers
// =============================================================================

/**
 * 승률 정규화 (0-100% → 0-100 점수)
 * 비선형: 낮은 승률 구간에서는 민감하게, 높은 구간에서는 둔감하게
 */
export function normalizeWinRate(winRate: number): number {
  // 승률 0-50% 범위를 0-100으로 매핑 (50% 이상은 100)
  // 실제 경마에서 20% 이상 승률은 매우 높음
  const cappedRate = Math.min(winRate, 50);
  return cappedRate * 2;
}

/**
 * 레이팅 정규화 (0-150 → 0-100)
 * 연구문서: 레이팅 1-140 스케일
 */
export function normalizeRating(rating: number): number {
  return minMaxNormalize(rating, 0, 140);
}

/**
 * 부담중량 적합도 정규화
 * 마체중 대비 부담중량 비율 분석
 * 연구문서: 1kg ≈ 1마신 (2.5m) 차이
 */
export function normalizeBurdenFit(
  burdenWeight: number,
  horseWeight: number,
  optimalRatio: number = 0.11 // 11% 기준
): number {
  if (horseWeight <= 0) return 50;

  const actualRatio = burdenWeight / horseWeight;
  const deviation = Math.abs(actualRatio - optimalRatio);

  // 편차가 클수록 점수 감소
  // 2% 편차 = 약 50점 감소
  const score = 100 - deviation * 2500;
  return Math.max(0, Math.min(100, score));
}

/**
 * 최근 폼 정규화
 * 최근 5경주 순위 배열에서 폼 점수 계산
 */
export function normalizeRecentForm(
  recentFinishes: number[],
  weights: number[] = [0.35, 0.25, 0.2, 0.12, 0.08]
): number {
  if (recentFinishes.length === 0) return 50;

  let weightedSum = 0;
  let totalWeight = 0;

  for (let i = 0; i < Math.min(recentFinishes.length, weights.length); i++) {
    const position = recentFinishes[i];
    // 순위를 점수로 변환 (1위=100, 10위=10)
    const positionScore = Math.max(0, 110 - position * 10);
    weightedSum += positionScore * weights[i];
    totalWeight += weights[i];
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 50;
}

/**
 * 휴양일수 정규화
 * 연구문서: 적절한 휴식은 좋지만 너무 길면 나쁨
 */
export function normalizeRestDays(days: number): number {
  // 최적 휴양: 14-28일
  if (days >= 14 && days <= 28) return 100;
  // 짧은 휴양 (7-14일): 약간 감점
  if (days >= 7 && days < 14) return 85;
  // 중간 휴양 (28-60일): 점진적 감점
  if (days > 28 && days <= 60) return 100 - (days - 28) * 1.5;
  // 긴 휴양 (60일 이상): 급격히 감점
  if (days > 60) return Math.max(20, 70 - (days - 60));
  // 매우 짧은 휴양 (7일 미만): 감점
  return Math.max(60, 70 + days);
}

/**
 * 콤보 시너지 정규화
 * 기수-조교사 조합의 시너지 점수
 */
export function normalizeComboSynergy(
  comboWinRate: number,
  jockeyWinRate: number,
  trainerWinRate: number,
  sampleSize: number
): number {
  // 기대 승률 (개별 평균)
  const expectedRate = (jockeyWinRate + trainerWinRate) / 2;
  if (expectedRate === 0) return 50;

  // 상승률 계산
  const uplift = (comboWinRate - expectedRate) / expectedRate;

  // 상승률을 점수로 변환 (-50% ~ +100% → 0-100)
  let score = 50 + uplift * 50;

  // 샘플 수에 따른 보정 (적은 샘플은 50에 수렴)
  const sampleFactor = Math.min(1, sampleSize / 30);
  score = 50 + (score - 50) * sampleFactor;

  return Math.max(0, Math.min(100, score));
}

// =============================================================================
// Batch Normalization (경주 내 상대 비교)
// =============================================================================

/**
 * 경주 내 상대 점수 계산
 * 필드의 모든 출전마 값을 Z-Score로 비교
 */
export function normalizeWithinRace<T>(
  entries: T[],
  getValue: (entry: T) => number | undefined
): Map<T, number> {
  const values = entries
    .map((e) => getValue(e))
    .filter((v): v is number => v !== undefined);

  const mean = calculateMean(values);
  const stdDev = calculateStdDev(values);

  const result = new Map<T, number>();

  for (const entry of entries) {
    const value = getValue(entry);
    if (value !== undefined) {
      result.set(entry, zScoreNormalize(value, mean, stdDev));
    } else {
      result.set(entry, 50); // 데이터 없으면 중립
    }
  }

  return result;
}
