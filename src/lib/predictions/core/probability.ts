/**
 * Probability Calculator
 *
 * 점수를 확률로 변환하는 모듈
 * Softmax 함수 사용
 */

import { SOFTMAX_TEMPERATURE, VALUE_THRESHOLDS } from '../constants';

// =============================================================================
// Softmax Probability
// =============================================================================

/**
 * Softmax 함수로 점수를 확률로 변환
 * @param scores 각 출전마의 점수 배열
 * @param temperature 온도 파라미터 (높을수록 균등 분포)
 * @returns 확률 배열 (합계 = 1)
 */
export function softmax(
  scores: number[],
  temperature: number = SOFTMAX_TEMPERATURE
): number[] {
  if (scores.length === 0) return [];

  // 수치 안정성을 위해 최대값 빼기
  const maxScore = Math.max(...scores);
  const expScores = scores.map((s) => Math.exp((s - maxScore) / temperature));
  const sumExp = expScores.reduce((a, b) => a + b, 0);

  return expScores.map((exp) => exp / sumExp);
}

/**
 * 출전마별 승률 계산
 * @param entries 점수를 가진 엔트리 배열
 * @param getScore 점수 추출 함수
 * @returns 승률 맵
 */
export function calculateWinProbabilities<T>(
  entries: T[],
  getScore: (entry: T) => number
): Map<T, number> {
  const scores = entries.map(getScore);
  const probabilities = softmax(scores);

  const result = new Map<T, number>();
  entries.forEach((entry, i) => {
    result.set(entry, probabilities[i]);
  });

  return result;
}

// =============================================================================
// Place Probability (복승 확률)
// =============================================================================

/**
 * 복승 확률 계산 (3착 이내)
 *
 * 단순화된 모델:
 * P(place) = 1 - (1 - P(win))^k, where k = 경쟁마 수 조정
 *
 * @param winProbability 단승 확률
 * @param fieldSize 출주 두수
 * @returns 복승 확률
 */
export function calculatePlaceProbability(
  winProbability: number,
  fieldSize: number
): number {
  // 필드 크기에 따른 조정
  // 3착 이내 = 3/fieldSize 기본 확률
  const basePlace = 3 / fieldSize;

  // 단승 확률과 기본 확률을 조합
  // 높은 단승 확률 → 높은 복승 확률
  const placeProbability = winProbability + (1 - winProbability) * basePlace * 2;

  return Math.min(0.95, placeProbability);
}

/**
 * 배열에서 복승 확률 일괄 계산
 */
export function calculateAllPlaceProbabilities(
  winProbabilities: number[],
  fieldSize: number
): number[] {
  return winProbabilities.map((wp) =>
    calculatePlaceProbability(wp, fieldSize)
  );
}

// =============================================================================
// Expected Position (예상 순위)
// =============================================================================

/**
 * 예상 순위 계산
 * 확률 기반으로 기대 순위 추정
 */
export function calculateExpectedPosition(
  winProbability: number,
  fieldSize: number
): number {
  // 확률이 높을수록 낮은 순위 (1위에 가까움)
  // P=1 → 1위, P=0 → fieldSize위
  const expectedPos = 1 + (fieldSize - 1) * (1 - winProbability);
  return Math.round(expectedPos * 10) / 10; // 소수점 1자리
}

/**
 * 확률 기반 순위 정렬
 * @returns 예상 순위 배열 (1부터 시작)
 */
export function rankByProbability<T>(
  entries: T[],
  getProbability: (entry: T) => number
): Map<T, number> {
  // 확률로 정렬
  const sorted = [...entries].sort(
    (a, b) => getProbability(b) - getProbability(a)
  );

  const result = new Map<T, number>();
  sorted.forEach((entry, idx) => {
    result.set(entry, idx + 1);
  });

  return result;
}

// =============================================================================
// Value Analysis (가치 분석)
// =============================================================================

/**
 * 배당에서 내재 확률 계산
 * @param odds 배당률 (예: 3.5)
 * @returns 내재 확률 (0-1)
 */
export function calculateImpliedProbability(odds: number): number {
  if (odds <= 1) return 1;
  return 1 / odds;
}

/**
 * 엣지 계산 (모델 확률 - 내재 확률)
 * 양수 = 가치 있음 (over-priced)
 */
export function calculateEdge(
  modelProbability: number,
  impliedProbability: number
): number {
  return modelProbability - impliedProbability;
}

/**
 * Kelly Criterion 계산
 * 최적 베팅 비율 = (bp - q) / b
 * b = 순수익률 (odds - 1)
 * p = 승리 확률
 * q = 패배 확률 (1 - p)
 */
export function calculateKellyFraction(
  modelProbability: number,
  odds: number
): number {
  const b = odds - 1; // 순수익률
  const p = modelProbability;
  const q = 1 - p;

  const kelly = (b * p - q) / b;

  // 음수면 베팅하지 말 것
  if (kelly <= 0) return 0;

  // 최대 베팅 비율 제한
  return Math.min(kelly, VALUE_THRESHOLDS.MAX_KELLY);
}

/**
 * 가치 분석 결과
 */
export interface ValueAnalysisResult {
  /** 배당에서 추정된 확률 */
  impliedProbability: number;
  /** 모델 예측 확률 */
  modelProbability: number;
  /** 엣지 (양수 = 가치) */
  edge: number;
  /** Kelly 비율 */
  kellyFraction: number;
  /** 가치 베팅 여부 */
  isValue: boolean;
}

/**
 * 전체 가치 분석 수행
 */
export function analyzeValue(
  modelProbability: number,
  odds: number
): ValueAnalysisResult {
  const impliedProbability = calculateImpliedProbability(odds);
  const edge = calculateEdge(modelProbability, impliedProbability);
  const kellyFraction = calculateKellyFraction(modelProbability, odds);
  const isValue = edge > VALUE_THRESHOLDS.POSITIVE_EDGE;

  return {
    impliedProbability,
    modelProbability,
    edge,
    kellyFraction,
    isValue,
  };
}

// =============================================================================
// Confidence Calculation
// =============================================================================

/**
 * 데이터 완성도 계산
 * 필수 필드 중 몇 개가 채워져 있는지
 */
export function calculateDataCompleteness(
  fieldsPresent: number,
  totalFields: number
): number {
  if (totalFields === 0) return 1;
  return fieldsPresent / totalFields;
}

/**
 * 예측 일관성 계산
 * 여러 예측 모델의 결과가 얼마나 일치하는지
 * (MVP에서는 단일 모델이므로 기본값 반환)
 */
export function calculatePredictionConsistency(): number {
  return 0.8; // MVP 기본값
}

/**
 * 종합 신뢰도 계산
 */
export function calculateOverallConfidence(
  dataCompleteness: number,
  predictionConsistency: number,
  weights: { data: number; prediction: number } = { data: 0.6, prediction: 0.4 }
): number {
  return (
    dataCompleteness * weights.data +
    predictionConsistency * weights.prediction
  );
}

/**
 * 신뢰도 레벨 결정
 */
export function getConfidenceLevel(
  confidence: number
): 'high' | 'medium' | 'low' {
  if (confidence >= 0.7) return 'high';
  if (confidence >= 0.4) return 'medium';
  return 'low';
}
