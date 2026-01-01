/**
 * Burden Weight Analysis
 *
 * 부담중량 분석
 * 연구문서: 1kg ≈ 1마신 (2.5m) 차이
 */

// =============================================================================
// Types
// =============================================================================

/** 부담중량 분석 결과 */
export interface BurdenAnalysis {
  /** 마필명 */
  horseName: string;
  /** 부담중량 (kg) */
  burdenWeight: number;
  /** 마체중 (kg) */
  horseWeight: number;
  /** 부담비율 (%) */
  burdenRatio: number;

  /** 최적 부담비율 (%) */
  optimalRatio: number;
  /** 편차 (%) */
  deviation: number;
  /** 예상 영향 (마신) */
  expectedImpact: number;

  /** 적합도 점수 (0-100) */
  fitScore: number;
  /** 판정 */
  assessment: BurdenAssessment;
  /** 분석 근거 */
  reasoning: string[];
}

/** 부담중량 판정 */
export type BurdenAssessment =
  | 'optimal' // 최적
  | 'light' // 가벼움 (유리)
  | 'slightly_heavy' // 약간 무거움
  | 'heavy' // 무거움 (불리)
  | 'very_heavy'; // 매우 무거움

/** 과거 부담중량 기록 */
export interface BurdenHistory {
  date: string;
  burden: number;
  horseWeight: number;
  position: number;
  distance: number;
}

/** 부담중량 최적화 결과 */
export interface BurdenOptimization {
  currentBurden: number;
  optimalBurden: number;
  difference: number;
  expectedPositionChange: number;
  recommendation: string;
}

// =============================================================================
// Constants
// =============================================================================

/** 부담중량 상수 */
export const BURDEN_CONSTANTS = {
  /** 최적 부담비율 (%) - 마체중 대비 */
  OPTIMAL_RATIO: 11.0,
  /** 허용 편차 (%) */
  ACCEPTABLE_DEVIATION: 0.5,
  /** 1kg당 마신 차이 */
  KG_PER_LENGTH: 1.0,
  /** 1마신 거리 (m) */
  LENGTH_METERS: 2.5,
} as const;

/** 성별별 기본 부담 조정 */
export const SEX_BURDEN_ADJUSTMENT: Record<string, number> = {
  male: 0,
  female: -2,
  gelding: 0,
  수: 0,
  암: -2,
  거: 0,
};

/** 연령별 기본 부담 */
export const AGE_BASE_BURDEN: Record<number, number> = {
  2: 52,
  3: 54,
  4: 55,
  5: 56,
  6: 56,
  7: 56,
};

// =============================================================================
// Analysis Functions
// =============================================================================

/**
 * 부담중량 분석 수행
 */
export function analyzeBurden(
  horseName: string,
  burdenWeight: number,
  horseWeight: number,
  sex?: string,
  age?: number
): BurdenAnalysis {
  // 부담비율 계산
  const burdenRatio = horseWeight > 0 ? (burdenWeight / horseWeight) * 100 : 0;

  // 최적 비율 (성별/연령 고려)
  const optimalRatio = getOptimalRatio(sex, age);

  // 편차 계산
  const deviation = burdenRatio - optimalRatio;

  // 예상 영향 (마신 단위)
  const expectedImpact = calculateImpact(deviation, horseWeight);

  // 적합도 점수
  const fitScore = calculateFitScore(deviation);

  // 판정
  const assessment = getAssessment(deviation);

  // 분석 근거
  const reasoning = generateBurdenReasoning(
    burdenWeight,
    horseWeight,
    burdenRatio,
    deviation,
    expectedImpact
  );

  return {
    horseName,
    burdenWeight,
    horseWeight,
    burdenRatio,
    optimalRatio,
    deviation,
    expectedImpact,
    fitScore,
    assessment,
    reasoning,
  };
}

/**
 * 최적 부담비율 계산
 */
export function getOptimalRatio(sex?: string, age?: number): number {
  let ratio = BURDEN_CONSTANTS.OPTIMAL_RATIO;

  // 연령 조정 (어린 말은 약간 낮은 비율)
  if (age && age <= 3) {
    ratio -= 0.3;
  }

  return ratio;
}

/**
 * 예상 영향 계산 (마신 단위)
 */
export function calculateImpact(deviation: number, horseWeight: number): number {
  // 편차(%)를 kg로 변환 후 마신으로 변환
  const kgDeviation = (deviation / 100) * horseWeight;
  return kgDeviation * BURDEN_CONSTANTS.KG_PER_LENGTH;
}

/**
 * 적합도 점수 계산
 */
export function calculateFitScore(deviation: number): number {
  // 편차가 클수록 점수 감소
  // 허용 편차 내: 100점
  // 1% 편차: 약 75점
  // 2% 편차: 약 50점

  const absDeviation = Math.abs(deviation);

  if (absDeviation <= BURDEN_CONSTANTS.ACCEPTABLE_DEVIATION) {
    return 100;
  }

  const score = 100 - (absDeviation - BURDEN_CONSTANTS.ACCEPTABLE_DEVIATION) * 25;
  return Math.max(0, Math.min(100, score));
}

/**
 * 부담중량 판정
 */
export function getAssessment(deviation: number): BurdenAssessment {
  if (Math.abs(deviation) <= BURDEN_CONSTANTS.ACCEPTABLE_DEVIATION) {
    return 'optimal';
  }

  if (deviation < -BURDEN_CONSTANTS.ACCEPTABLE_DEVIATION) {
    return 'light'; // 가벼움 = 유리
  }

  if (deviation <= 1.0) {
    return 'slightly_heavy';
  }

  if (deviation <= 2.0) {
    return 'heavy';
  }

  return 'very_heavy';
}

/**
 * 분석 근거 생성
 */
function generateBurdenReasoning(
  burden: number,
  horseWeight: number,
  ratio: number,
  deviation: number,
  impact: number
): string[] {
  const reasons: string[] = [];

  reasons.push(`부담중량 ${burden}kg / 마체중 ${horseWeight}kg = ${ratio.toFixed(1)}%`);

  if (Math.abs(deviation) <= BURDEN_CONSTANTS.ACCEPTABLE_DEVIATION) {
    reasons.push('최적 부담비율 범위 내');
  } else if (deviation > 0) {
    reasons.push(
      `최적 비율 대비 ${deviation.toFixed(1)}% 초과 (약 ${Math.abs(impact).toFixed(1)}마신 불리)`
    );
  } else {
    reasons.push(
      `최적 비율 대비 ${Math.abs(deviation).toFixed(1)}% 미만 (약 ${Math.abs(impact).toFixed(1)}마신 유리)`
    );
  }

  return reasons;
}

// =============================================================================
// Optimization Functions
// =============================================================================

/**
 * 최적 부담중량 계산
 */
export function findOptimalBurden(
  horseWeight: number,
  sex?: string,
  age?: number
): number {
  const optimalRatio = getOptimalRatio(sex, age);
  return Math.round(horseWeight * (optimalRatio / 100));
}

/**
 * 부담중량 최적화 분석
 */
export function optimizeBurden(
  currentBurden: number,
  horseWeight: number,
  sex?: string,
  age?: number
): BurdenOptimization {
  const optimalBurden = findOptimalBurden(horseWeight, sex, age);
  const difference = currentBurden - optimalBurden;
  const expectedPositionChange = difference * BURDEN_CONSTANTS.KG_PER_LENGTH;

  let recommendation: string;

  if (Math.abs(difference) <= 1) {
    recommendation = '현재 부담중량 적정';
  } else if (difference > 0) {
    recommendation = `${difference}kg 초과 - 약 ${expectedPositionChange.toFixed(1)}마신 불리 예상`;
  } else {
    recommendation = `${Math.abs(difference)}kg 미만 - 약 ${Math.abs(expectedPositionChange).toFixed(1)}마신 유리 예상`;
  }

  return {
    currentBurden,
    optimalBurden,
    difference,
    expectedPositionChange,
    recommendation,
  };
}

// =============================================================================
// Historical Analysis
// =============================================================================

/**
 * 과거 부담중량 성적 분석
 */
export function analyzeHistoricalBurden(
  history: BurdenHistory[]
): {
  avgBurden: number;
  avgRatio: number;
  bestPerformanceBurden: number;
  winningRatioRange: { min: number; max: number };
  correlation: number;
} {
  if (history.length === 0) {
    return {
      avgBurden: 0,
      avgRatio: 0,
      bestPerformanceBurden: 0,
      winningRatioRange: { min: 10, max: 12 },
      correlation: 0,
    };
  }

  // 평균 부담
  const avgBurden = history.reduce((sum, h) => sum + h.burden, 0) / history.length;

  // 평균 비율
  const ratios = history.map(
    (h) => (h.horseWeight > 0 ? (h.burden / h.horseWeight) * 100 : 0)
  );
  const avgRatio = ratios.reduce((sum, r) => sum + r, 0) / ratios.length;

  // 최고 성적 시 부담중량
  const bestRace = history.reduce((best, h) =>
    h.position < best.position ? h : best
  );
  const bestPerformanceBurden = bestRace.burden;

  // 1-3착 시 비율 범위
  const winningRaces = history.filter((h) => h.position <= 3);
  const winningRatios = winningRaces.map(
    (h) => (h.horseWeight > 0 ? (h.burden / h.horseWeight) * 100 : 0)
  );

  const winningRatioRange =
    winningRatios.length > 0
      ? {
          min: Math.min(...winningRatios),
          max: Math.max(...winningRatios),
        }
      : { min: 10, max: 12 };

  // 부담중량-순위 상관관계 (단순 계산)
  const positions = history.map((h) => h.position);
  const burdens = history.map((h) => h.burden);
  const correlation = calculateCorrelation(burdens, positions);

  return {
    avgBurden,
    avgRatio,
    bestPerformanceBurden,
    winningRatioRange,
    correlation,
  };
}

/**
 * 상관계수 계산 (피어슨)
 */
function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length < 2) return 0;

  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
  const sumX2 = x.reduce((total, xi) => total + xi * xi, 0);
  const sumY2 = y.reduce((total, yi) => total + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
  );

  if (denominator === 0) return 0;
  return numerator / denominator;
}

// =============================================================================
// Prediction Integration
// =============================================================================

/**
 * 예측 엔진용 부담중량 점수 계산
 */
export function getBurdenScoreForPrediction(
  burdenWeight: number,
  horseWeight: number
): number {
  if (horseWeight <= 0) return 50;

  const analysis = analyzeBurden('', burdenWeight, horseWeight);
  return analysis.fitScore;
}

/**
 * 부담중량 비교 점수
 */
export function compareBurdenAdvantage(
  myBurden: number,
  opponentBurdens: number[]
): number {
  if (opponentBurdens.length === 0) return 50;

  const avgOpponent =
    opponentBurdens.reduce((sum, b) => sum + b, 0) / opponentBurdens.length;
  const diff = avgOpponent - myBurden;

  // 1kg 경량 = +10점
  const advantage = diff * 10;
  return Math.max(0, Math.min(100, 50 + advantage));
}
