/**
 * Backtest Metrics
 *
 * 백테스트 정확도 메트릭 계산
 */

import type {
  RaceBacktestResult,
  AccuracyMetrics,
  CalibrationResult,
} from './types';

// =============================================================================
// 정확도 계산
// =============================================================================

/**
 * 정확도 메트릭 계산
 *
 * @param results 개별 경주 백테스트 결과
 * @param topNValues Top-N 계산할 값들 (기본: [1, 3, 5])
 */
export function calculateAccuracyMetrics(
  results: RaceBacktestResult[],
  topNValues: number[] = [1, 3, 5]
): AccuracyMetrics {
  if (results.length === 0) {
    return {
      totalRaces: 0,
      top1Accuracy: 0,
      top3Accuracy: 0,
      topNAccuracy: {},
      avgTop3Overlap: 0,
      highConfidenceAccuracy: 0,
      lowConfidenceAccuracy: 0,
    };
  }

  const total = results.length;

  // Top-1 적중률
  const top1Hits = results.filter((r) => r.isTop1Hit).length;
  const top1Accuracy = top1Hits / total;

  // Top-3 적중률 (예측 1위가 실제 3위 이내)
  const top3Hits = results.filter((r) => r.isTop3Hit).length;
  const top3Accuracy = top3Hits / total;

  // Top-N 적중률
  const topNAccuracy: Record<number, number> = {};
  for (const n of topNValues) {
    const hits = results.filter((r) => isTopNHit(r, n)).length;
    topNAccuracy[n] = hits / total;
  }

  // 평균 Top-3 오버랩
  const avgTop3Overlap =
    results.reduce((sum, r) => sum + r.top3Overlap, 0) / total;

  // 신뢰도별 정확도
  const highConfResults = results.filter((r) => r.confidence >= 0.7);
  const lowConfResults = results.filter((r) => r.confidence < 0.5);

  const highConfidenceAccuracy =
    highConfResults.length > 0
      ? highConfResults.filter((r) => r.isTop1Hit).length / highConfResults.length
      : 0;

  const lowConfidenceAccuracy =
    lowConfResults.length > 0
      ? lowConfResults.filter((r) => r.isTop1Hit).length / lowConfResults.length
      : 0;

  return {
    totalRaces: total,
    top1Accuracy,
    top3Accuracy,
    topNAccuracy,
    avgTop3Overlap,
    highConfidenceAccuracy,
    lowConfidenceAccuracy,
  };
}

/**
 * Top-N 적중 여부 확인
 */
function isTopNHit(result: RaceBacktestResult, n: number): boolean {
  const topNPredicted = getTopNPredictions(result.prediction.predictions, n);
  const actualTopN = result.actual.finishOrder.slice(0, n);

  // 예측 상위 N개 중 하나라도 실제 상위 N에 있으면 적중
  return topNPredicted.some((horseNo) => actualTopN.includes(horseNo));
}

/**
 * 예측 상위 N개 마번 추출
 */
function getTopNPredictions(
  predictions: { entryNo: number; winProbability: number }[],
  n: number
): string[] {
  return [...predictions]
    .sort((a, b) => b.winProbability - a.winProbability)
    .slice(0, n)
    .map((p) => String(p.entryNo));
}

// =============================================================================
// 신뢰도 캘리브레이션
// =============================================================================

/**
 * 신뢰도 캘리브레이션 계산
 *
 * 예측 신뢰도와 실제 적중률을 비교하여 모델 캘리브레이션 평가
 *
 * @param results 백테스트 결과
 * @param binCount 구간 수 (기본: 10)
 */
export function calculateCalibration(
  results: RaceBacktestResult[],
  binCount: number = 10
): CalibrationResult[] {
  if (results.length === 0) {
    return [];
  }

  const binSize = 1 / binCount;
  const bins: Map<string, RaceBacktestResult[]> = new Map();

  // 신뢰도 구간별로 결과 분류
  for (const result of results) {
    const binIndex = Math.min(
      Math.floor(result.confidence / binSize),
      binCount - 1
    );
    const binLabel = `${(binIndex * binSize * 100).toFixed(0)}-${((binIndex + 1) * binSize * 100).toFixed(0)}%`;

    if (!bins.has(binLabel)) {
      bins.set(binLabel, []);
    }
    bins.get(binLabel)!.push(result);
  }

  // 각 구간별 캘리브레이션 계산
  const calibration: CalibrationResult[] = [];

  const binLabels = Array.from(bins.keys()).sort((a, b) => {
    const aNum = parseInt(a.split('-')[0]);
    const bNum = parseInt(b.split('-')[0]);
    return aNum - bNum;
  });

  for (const binLabel of binLabels) {
    const binResults = bins.get(binLabel)!;
    const count = binResults.length;
    const hits = binResults.filter((r) => r.isTop1Hit).length;
    const actualAccuracy = hits / count;
    const expectedAccuracy =
      binResults.reduce((sum, r) => sum + r.confidence, 0) / count;
    const calibrationError = Math.abs(actualAccuracy - expectedAccuracy);

    calibration.push({
      confidenceBin: binLabel,
      count,
      actualAccuracy,
      expectedAccuracy,
      calibrationError,
    });
  }

  return calibration;
}

/**
 * Expected Calibration Error (ECE) 계산
 *
 * 캘리브레이션 오차의 가중 평균
 */
export function calculateECE(calibration: CalibrationResult[]): number {
  const totalCount = calibration.reduce((sum, bin) => sum + bin.count, 0);

  if (totalCount === 0) {
    return 0;
  }

  const weightedError = calibration.reduce(
    (sum, bin) => sum + (bin.count / totalCount) * bin.calibrationError,
    0
  );

  return weightedError;
}

// =============================================================================
// 그룹별 메트릭
// =============================================================================

/**
 * 경마장별 정확도 계산
 */
export function calculateMetricsByMeet(
  results: RaceBacktestResult[]
): Record<string, AccuracyMetrics> {
  const grouped = groupBy(results, (r) => r.actual.meet);
  const byMeet: Record<string, AccuracyMetrics> = {};

  for (const [meet, meetResults] of Object.entries(grouped)) {
    byMeet[meet] = calculateAccuracyMetrics(meetResults);
  }

  return byMeet;
}

/**
 * 거리별 정확도 계산
 */
export function calculateMetricsByDistance(
  results: RaceBacktestResult[]
): Record<string, AccuracyMetrics> {
  const grouped = groupBy(results, (r) => getDistanceCategory(r.prediction.predictions[0]?.entryNo ?? 0, r));
  const byDistance: Record<string, AccuracyMetrics> = {};

  for (const [distance, distanceResults] of Object.entries(grouped)) {
    byDistance[distance] = calculateAccuracyMetrics(distanceResults);
  }

  return byDistance;
}

/**
 * 거리 카테고리 결정
 */
function getDistanceCategory(
  _entryNo: number,
  result: RaceBacktestResult
): string {
  // RacePrediction에서 거리 정보 추출 시도
  const distance = (result.prediction as { distance?: number }).distance ?? 1400;

  if (distance <= 1200) return 'sprint';
  if (distance <= 1600) return 'mile';
  if (distance <= 2000) return 'middle';
  return 'long';
}

/**
 * 그룹화 유틸리티
 */
function groupBy<T>(
  array: T[],
  keyFn: (item: T) => string
): Record<string, T[]> {
  const result: Record<string, T[]> = {};

  for (const item of array) {
    const key = keyFn(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
  }

  return result;
}

// =============================================================================
// 통계 유틸리티
// =============================================================================

/**
 * 브라이어 스코어 계산
 *
 * 확률 예측의 정확도 측정 (0에 가까울수록 좋음)
 */
export function calculateBrierScore(results: RaceBacktestResult[]): number {
  if (results.length === 0) return 0;

  const scores = results.map((r) => {
    const predicted = r.predictedProbability;
    const actual = r.isTop1Hit ? 1 : 0;
    return Math.pow(predicted - actual, 2);
  });

  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

/**
 * ROI 계산 (단승 기준)
 *
 * @param results 백테스트 결과
 * @param betAmount 경주당 베팅 금액 (기본: 1000)
 */
export function calculateROI(
  results: RaceBacktestResult[],
  betAmount: number = 1000
): { roi: number; profit: number; totalBet: number } {
  if (results.length === 0) {
    return { roi: 0, profit: 0, totalBet: 0 };
  }

  const totalBet = results.length * betAmount;
  let totalReturn = 0;

  for (const result of results) {
    if (result.isTop1Hit && result.actual.winnerOdds) {
      totalReturn += betAmount * result.actual.winnerOdds;
    }
  }

  const profit = totalReturn - totalBet;
  const roi = (profit / totalBet) * 100;

  return { roi, profit, totalBet };
}
