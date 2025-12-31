/**
 * Score Calculator
 *
 * 예측 요소별 점수 계산
 */

import type {
  EntryInput,
  RaceContext,
  FactorScore,
  ScoreBreakdown,
  ModelWeights,
} from '@/types/prediction';
import type { TrackCondition } from '@/types/track-condition';
import { getGateFactor } from '@/types/track-condition';
import {
  normalizeRating,
  normalizeRecentForm,
  normalizeBurdenFit,
  normalizeRestDays,
  normalizeWinRate,
  normalizeComboSynergy,
  minMaxNormalize,
} from './normalizer';
import { DEFAULT_MODEL_WEIGHTS, getPositionScore } from '../constants';

// =============================================================================
// Factor Score Calculation
// =============================================================================

/**
 * 주로상태 점수 계산
 * 연구문서: 함수율에 따른 선행/추입 유불리
 */
export function calculateTrackConditionScore(
  entry: EntryInput,
  trackCondition: TrackCondition
): FactorScore {
  // 기본 점수: 주로상태가 말에게 미치는 영향
  // 함수율이 높을수록 선행마 유리 (frontRunnerAdvantage)
  // 함수율이 낮을수록 추입마 유리 (closerAdvantage)

  // 기수 스타일에 따른 보너스
  const style = entry.jockey.style ?? 'versatile';
  let styleBonus = 0;

  if (style === 'front-runner') {
    styleBonus = trackCondition.frontRunnerAdvantage * 20;
  } else if (style === 'closer') {
    styleBonus = trackCondition.closerAdvantage * 20;
  }

  // 기본 점수 (양호=50, 불량=변동)
  const baseScore = 50;
  const score = Math.max(0, Math.min(100, baseScore + styleBonus));

  return {
    factor: 'trackCondition',
    label: '주로상태',
    score,
    weight: DEFAULT_MODEL_WEIGHTS.external.trackCondition,
    contribution: score * DEFAULT_MODEL_WEIGHTS.external.trackCondition,
    rawValue: trackCondition.moisture,
    unit: '%',
  };
}

/**
 * 게이트 위치 점수 계산
 * 연구문서: 서울 1000m 내측 게이트 유리
 */
export function calculateGatePositionScore(
  entry: EntryInput,
  race: RaceContext
): FactorScore {
  const gateFactor = getGateFactor(race.meetCode, race.distance, entry.no);

  // 게이트 유불리를 0-100 점수로 변환
  // gateFactor: -0.1 ~ +0.1 → 0 ~ 100
  const score = 50 + gateFactor * 500;

  return {
    factor: 'gatePosition',
    label: '게이트 위치',
    score: Math.max(0, Math.min(100, score)),
    weight: DEFAULT_MODEL_WEIGHTS.external.gatePosition,
    contribution:
      Math.max(0, Math.min(100, score)) *
      DEFAULT_MODEL_WEIGHTS.external.gatePosition,
    rawValue: entry.no,
    unit: '번',
  };
}

/**
 * 거리 적합도 점수 계산
 */
export function calculateDistanceFitScore(
  entry: EntryInput,
  raceDistance: number
): FactorScore {
  // 혈통 기반 거리 적성
  const distanceApt = entry.bloodline?.distanceAptitude ?? 3;

  // 1-5 스케일을 0-100으로 변환
  const score = (distanceApt - 1) * 25;

  return {
    factor: 'distanceFit',
    label: '거리 적합도',
    score,
    weight: DEFAULT_MODEL_WEIGHTS.external.trackFit,
    contribution: score * DEFAULT_MODEL_WEIGHTS.external.trackFit,
    rawValue: distanceApt,
  };
}

/**
 * 필드 크기 점수 계산
 * 연구문서: 출주두수가 많을수록 경쟁 치열
 */
export function calculateFieldSizeScore(
  entry: EntryInput,
  fieldSize: number
): FactorScore {
  // 필드 크기가 작을수록 유리 (8두 미만 = 보너스)
  // 필드 크기가 클수록 불리 (12두 이상 = 패널티)
  let score = 50;

  if (fieldSize <= 6) score = 70;
  else if (fieldSize <= 8) score = 60;
  else if (fieldSize <= 10) score = 50;
  else if (fieldSize <= 12) score = 40;
  else score = 30;

  // 레이팅 높은 말은 필드가 커도 유리
  if (entry.rating && entry.rating > 80) {
    score += 10;
  }

  return {
    factor: 'fieldSize',
    label: '필드 크기',
    score: Math.min(100, score),
    weight: DEFAULT_MODEL_WEIGHTS.external.fieldSize,
    contribution:
      Math.min(100, score) * DEFAULT_MODEL_WEIGHTS.external.fieldSize,
    rawValue: fieldSize,
    unit: '두',
  };
}

/**
 * 주로 표면 점수 계산
 */
export function calculateSurfaceScore(
  entry: EntryInput,
  surface: 'turf' | 'dirt'
): FactorScore {
  // 한국은 대부분 더트, 더트 적성 기준
  const dirtApt = entry.bloodline?.dirtAptitude ?? 3;

  let score = 50;
  if (surface === 'dirt') {
    // 더트 적성 반영
    score = (dirtApt - 1) * 25;
  } else {
    // 잔디는 더트 적성의 역
    score = 100 - (dirtApt - 1) * 25;
  }

  return {
    factor: 'surface',
    label: '주로 표면',
    score,
    weight: DEFAULT_MODEL_WEIGHTS.external.surface,
    contribution: score * DEFAULT_MODEL_WEIGHTS.external.surface,
    rawValue: dirtApt,
  };
}

/**
 * 마 레이팅 점수 계산
 */
export function calculateRatingScore(entry: EntryInput): FactorScore {
  const rating = entry.rating ?? 50;
  const score = normalizeRating(rating);

  return {
    factor: 'rating',
    label: '마 레이팅',
    score,
    weight: DEFAULT_MODEL_WEIGHTS.internal.rating,
    contribution: score * DEFAULT_MODEL_WEIGHTS.internal.rating,
    rawValue: rating,
  };
}

/**
 * 최근 폼 점수 계산
 */
export function calculateFormScore(entry: EntryInput): FactorScore {
  const score = normalizeRecentForm(entry.recentFinishes);

  return {
    factor: 'recentForm',
    label: '최근 폼',
    score,
    weight: DEFAULT_MODEL_WEIGHTS.internal.recentForm,
    contribution: score * DEFAULT_MODEL_WEIGHTS.internal.recentForm,
    rawValue: entry.recentFinishes.length > 0 ? entry.recentFinishes[0] : undefined,
  };
}

/**
 * 부담중량 적합도 점수 계산
 */
export function calculateBurdenFitScore(entry: EntryInput): FactorScore {
  const horseWeight = entry.currentWeight ?? 480;
  const score = normalizeBurdenFit(entry.burdenWeight, horseWeight);

  return {
    factor: 'burdenFit',
    label: '부담중량',
    score,
    weight: DEFAULT_MODEL_WEIGHTS.internal.burdenFit,
    contribution: score * DEFAULT_MODEL_WEIGHTS.internal.burdenFit,
    rawValue: entry.burdenWeight,
    unit: 'kg',
  };
}

/**
 * 기수 점수 계산
 */
export function calculateJockeyScore(entry: EntryInput): FactorScore {
  const winRate = entry.jockey.winRate;
  const formScore = entry.jockey.formScore;

  // 승률과 폼 점수 조합
  const winRateScore = normalizeWinRate(winRate);
  const formContribution = (formScore - 1) * 12.5; // 1-5 → 0-50

  const score = winRateScore * 0.7 + formContribution * 0.3;

  return {
    factor: 'jockeyWinRate',
    label: '기수 능력',
    score,
    weight: DEFAULT_MODEL_WEIGHTS.internal.jockeyWinRate,
    contribution: score * DEFAULT_MODEL_WEIGHTS.internal.jockeyWinRate,
    rawValue: winRate,
    unit: '%',
  };
}

/**
 * 조교사 점수 계산
 */
export function calculateTrainerScore(entry: EntryInput): FactorScore {
  const winRate = entry.trainer.winRate;
  const score = normalizeWinRate(winRate);

  return {
    factor: 'trainerWinRate',
    label: '조교사 능력',
    score,
    weight: DEFAULT_MODEL_WEIGHTS.internal.trainerWinRate,
    contribution: score * DEFAULT_MODEL_WEIGHTS.internal.trainerWinRate,
    rawValue: winRate,
    unit: '%',
  };
}

/**
 * 기수-조교사 콤보 점수 계산
 */
export function calculateComboScore(entry: EntryInput): FactorScore {
  if (!entry.combo?.winRate) {
    return {
      factor: 'comboSynergy',
      label: '기수-조교사 궁합',
      score: 50, // 데이터 없으면 중립
      weight: DEFAULT_MODEL_WEIGHTS.internal.jockeyTrainerCombo,
      contribution: 50 * DEFAULT_MODEL_WEIGHTS.internal.jockeyTrainerCombo,
    };
  }

  const score = normalizeComboSynergy(
    entry.combo.winRate,
    entry.jockey.winRate,
    entry.trainer.winRate,
    entry.combo.starts ?? 10
  );

  return {
    factor: 'comboSynergy',
    label: '기수-조교사 궁합',
    score,
    weight: DEFAULT_MODEL_WEIGHTS.internal.jockeyTrainerCombo,
    contribution: score * DEFAULT_MODEL_WEIGHTS.internal.jockeyTrainerCombo,
    rawValue: entry.combo.winRate,
    unit: '%',
  };
}

/**
 * 혈통 적성 점수 계산 (MVP에서는 간소화)
 */
export function calculateBloodlineScore(entry: EntryInput): FactorScore {
  // MVP에서는 가중치 0이므로 기본값
  return {
    factor: 'bloodlineAptitude',
    label: '혈통 적성',
    score: 50,
    weight: DEFAULT_MODEL_WEIGHTS.internal.bloodlineAptitude,
    contribution: 0,
  };
}

// =============================================================================
// Aggregate Score Calculation
// =============================================================================

/**
 * 출전마의 전체 요소별 점수 계산
 */
export function calculateAllFactorScores(
  entry: EntryInput,
  race: RaceContext
): FactorScore[] {
  return [
    // External
    calculateTrackConditionScore(entry, race.trackCondition),
    calculateGatePositionScore(entry, race),
    calculateDistanceFitScore(entry, race.distance),
    calculateFieldSizeScore(entry, race.fieldSize),
    calculateSurfaceScore(entry, race.surface),
    // Internal
    calculateRatingScore(entry),
    calculateFormScore(entry),
    calculateBurdenFitScore(entry),
    calculateJockeyScore(entry),
    calculateTrainerScore(entry),
    calculateComboScore(entry),
    calculateBloodlineScore(entry),
  ];
}

/**
 * 요소 점수에서 ScoreBreakdown 생성
 */
export function createScoreBreakdown(factors: FactorScore[]): ScoreBreakdown {
  const getScore = (factorId: string): number => {
    const factor = factors.find((f) => f.factor === factorId);
    return factor?.score ?? 0;
  };

  const trackConditionScore = getScore('trackCondition');
  const gatePositionScore = getScore('gatePosition');
  const distanceFitScore = getScore('distanceFit');
  const fieldSizeScore = getScore('fieldSize');
  const surfaceScore = getScore('surface');

  const ratingScore = getScore('rating');
  const formScore = getScore('recentForm');
  const burdenFitScore = getScore('burdenFit');
  const jockeyScore = getScore('jockeyWinRate');
  const trainerScore = getScore('trainerWinRate');
  const comboSynergyScore = getScore('comboSynergy');
  const bloodlineScore = getScore('bloodlineAptitude');

  // 카테고리별 합계 (기여도 합산)
  const externalTotal = factors
    .filter((f) =>
      ['trackCondition', 'gatePosition', 'distanceFit', 'fieldSize', 'surface'].includes(
        f.factor
      )
    )
    .reduce((sum, f) => sum + f.contribution, 0);

  const internalTotal = factors
    .filter((f) =>
      [
        'rating',
        'recentForm',
        'burdenFit',
        'jockeyWinRate',
        'trainerWinRate',
        'comboSynergy',
        'bloodlineAptitude',
      ].includes(f.factor)
    )
    .reduce((sum, f) => sum + f.contribution, 0);

  return {
    trackConditionScore,
    gatePositionScore,
    distanceFitScore,
    fieldSizeScore,
    surfaceScore,
    ratingScore,
    formScore,
    burdenFitScore,
    distancePreferenceScore: distanceFitScore,
    jockeyScore,
    trainerScore,
    comboSynergyScore,
    bloodlineScore,
    externalTotal,
    internalTotal,
  };
}

/**
 * 총점 계산 (0-100)
 */
export function calculateTotalScore(factors: FactorScore[]): number {
  const total = factors.reduce((sum, f) => sum + f.contribution, 0);
  // contribution 합계가 대략 0-100 범위
  return Math.max(0, Math.min(100, total));
}

/**
 * 가중치 적용된 총점 계산
 */
export function calculateWeightedScore(
  factors: FactorScore[],
  weights: ModelWeights = DEFAULT_MODEL_WEIGHTS
): number {
  let total = 0;

  for (const factor of factors) {
    // 가중치를 weights에서 동적으로 가져오기
    let weight = factor.weight;

    // External weights
    if (factor.factor === 'trackCondition')
      weight = weights.external.trackCondition;
    if (factor.factor === 'gatePosition')
      weight = weights.external.gatePosition;
    if (factor.factor === 'distanceFit') weight = weights.external.trackFit;
    if (factor.factor === 'fieldSize') weight = weights.external.fieldSize;
    if (factor.factor === 'surface') weight = weights.external.surface;

    // Internal weights
    if (factor.factor === 'rating') weight = weights.internal.rating;
    if (factor.factor === 'recentForm') weight = weights.internal.recentForm;
    if (factor.factor === 'burdenFit') weight = weights.internal.burdenFit;
    if (factor.factor === 'jockeyWinRate')
      weight = weights.internal.jockeyWinRate;
    if (factor.factor === 'trainerWinRate')
      weight = weights.internal.trainerWinRate;
    if (factor.factor === 'comboSynergy')
      weight = weights.internal.jockeyTrainerCombo;
    if (factor.factor === 'bloodlineAptitude')
      weight = weights.internal.bloodlineAptitude;

    total += factor.score * weight;
  }

  return Math.max(0, Math.min(100, total));
}
