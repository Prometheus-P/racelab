/**
 * Prediction Engine
 *
 * 경마 예측의 핵심 엔진
 * 모든 요소를 조합하여 최종 예측 생성
 */

import type {
  HorsePrediction,
  RacePrediction,
  PredictionInput,
  EntryInput,
  RaceContext,
  ModelWeights,
  FactorScore,
  PredictionRecommendation,
} from '@/types/prediction';
import {
  calculateAllFactorScores,
  createScoreBreakdown,
  calculateWeightedScore,
} from './scorer';
import {
  softmax,
  calculatePlaceProbability,
  calculateExpectedPosition,
  analyzeValue,
  calculatePredictionConsistency,
  calculateOverallConfidence,
  getConfidenceLevel,
} from './probability';
import {
  DEFAULT_MODEL_WEIGHTS,
  RECOMMENDATION_THRESHOLDS,
  MODEL_VERSION,
} from '../constants';

// =============================================================================
// Prediction Engine
// =============================================================================

export interface PredictionOptions {
  /** 모델 가중치 (기본값 사용 시 생략) */
  weights?: ModelWeights;
  /** 배당률 포함 여부 */
  includeOdds?: boolean;
  /** 신뢰도 계산 포함 여부 */
  includeConfidence?: boolean;
}

/**
 * 예측 엔진 클래스
 */
export class PredictionEngine {
  private weights: ModelWeights;

  constructor(weights: ModelWeights = DEFAULT_MODEL_WEIGHTS) {
    this.weights = weights;
  }

  /**
   * 경주 전체 예측 수행
   */
  predictRace(input: PredictionInput, options: PredictionOptions = {}): RacePrediction {
    const { weights = this.weights, includeConfidence = true } = options;

    // 1. 각 출전마별 요소 점수 계산
    const entryScores = input.entries.map((entry) => ({
      entry,
      factors: calculateAllFactorScores(entry, input.race),
      totalScore: 0,
    }));

    // 2. 가중치 적용 총점 계산
    for (const item of entryScores) {
      item.totalScore = calculateWeightedScore(item.factors, weights);
    }

    // 3. Softmax로 확률 변환
    const scores = entryScores.map((e) => e.totalScore);
    const probabilities = softmax(scores);

    // 4. 개별 예측 생성
    const predictions: HorsePrediction[] = entryScores.map((item, idx) => {
      const winProbability = probabilities[idx];
      const placeProbability = calculatePlaceProbability(
        winProbability,
        input.entries.length
      );
      const expectedPosition = calculateExpectedPosition(
        winProbability,
        input.entries.length
      );

      // 신뢰도 계산
      let confidence = 0.7;
      let confidenceLevel: 'high' | 'medium' | 'low' = 'medium';

      if (includeConfidence) {
        const dataCompleteness = this.calculateEntryDataCompleteness(item.entry);
        const predictionConsistency = calculatePredictionConsistency();
        confidence = calculateOverallConfidence(dataCompleteness, predictionConsistency);
        confidenceLevel = getConfidenceLevel(confidence);
      }

      // 추천 생성
      const recommendation = this.generateRecommendation(
        winProbability,
        item.factors,
        input.entries.length
      );

      // 가치 분석 (배당이 있는 경우)
      let valueAnalysis;
      if (item.entry.odds) {
        valueAnalysis = analyzeValue(winProbability, item.entry.odds);
      }

      return {
        entryNo: item.entry.no,
        horseName: item.entry.horseName,
        winProbability,
        placeProbability,
        expectedPosition,
        totalScore: item.totalScore,
        factors: item.factors,
        scoreBreakdown: createScoreBreakdown(item.factors),
        confidence,
        confidenceLevel,
        recommendation,
        valueAnalysis,
      };
    });

    // 5. 순위별 정렬
    predictions.sort((a, b) => b.winProbability - a.winProbability);

    // 6. 순위 할당
    predictions.forEach((pred, idx) => {
      pred.predictedRank = idx + 1;
    });

    // 7. 경주 전체 추천 생성
    const raceRecommendations = this.generateRaceRecommendations(predictions);

    return {
      raceId: input.race.raceId,
      meetCode: input.race.meetCode,
      raceNo: input.race.raceNo,
      predictions,
      trackCondition: input.race.trackCondition,
      recommendations: raceRecommendations,
      modelVersion: MODEL_VERSION,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * 단일 출전마 예측
   */
  predictEntry(
    entry: EntryInput,
    race: RaceContext,
    allEntries: EntryInput[]
  ): HorsePrediction {
    const input: PredictionInput = {
      race,
      entries: allEntries,
    };

    const result = this.predictRace(input);
    const prediction = result.predictions.find((p) => p.entryNo === entry.no);

    if (!prediction) {
      throw new Error(`Entry ${entry.no} not found in predictions`);
    }

    return prediction;
  }

  /**
   * 출전마 데이터 완성도 계산
   */
  private calculateEntryDataCompleteness(entry: EntryInput): number {
    const requiredFields = [
      entry.rating !== undefined,
      entry.recentFinishes.length > 0,
      entry.burdenWeight !== undefined,
      entry.jockey?.winRate !== undefined,
      entry.trainer?.winRate !== undefined,
    ];

    const optionalFields = [
      entry.currentWeight !== undefined,
      entry.bloodline !== undefined,
      entry.combo !== undefined,
      entry.odds !== undefined,
    ];

    const requiredCount = requiredFields.filter(Boolean).length;
    const optionalCount = optionalFields.filter(Boolean).length;

    // 필수 필드 70%, 선택 필드 30%
    return (requiredCount / requiredFields.length) * 0.7 +
           (optionalCount / optionalFields.length) * 0.3;
  }

  /**
   * 개별 추천 생성
   */
  private generateRecommendation(
    winProbability: number,
    factors: FactorScore[],
    fieldSize: number
  ): PredictionRecommendation {
    // 상대적 순위 계산 (확률 기준)
    const relativeStrength = winProbability * fieldSize;

    let action: PredictionRecommendation['action'];
    let betType: PredictionRecommendation['betType'];
    const reasoning: string[] = [];

    // 액션 결정
    if (relativeStrength >= RECOMMENDATION_THRESHOLDS.STRONG_BET * fieldSize / 10) {
      action = 'strong_bet';
      betType = 'win';
      reasoning.push('상위권 예상마');
    } else if (relativeStrength >= RECOMMENDATION_THRESHOLDS.BET * fieldSize / 10) {
      action = 'bet';
      betType = 'place';
      reasoning.push('복승 후보');
    } else if (relativeStrength >= RECOMMENDATION_THRESHOLDS.CONSIDER * fieldSize / 10) {
      action = 'consider';
      betType = 'place';
      reasoning.push('검토 가능');
    } else {
      action = 'avoid';
      reasoning.push('추천하지 않음');
    }

    // 주요 요인 분석
    const sortedFactors = [...factors].sort((a, b) => b.contribution - a.contribution);
    const topFactors = sortedFactors.slice(0, 3);

    for (const factor of topFactors) {
      if (factor.score >= 70) {
        reasoning.push(`${factor.label} 우수 (${factor.score.toFixed(0)}점)`);
      } else if (factor.score <= 30) {
        reasoning.push(`${factor.label} 약점 (${factor.score.toFixed(0)}점)`);
      }
    }

    return { action, betType, reasoning };
  }

  /**
   * 경주 전체 추천 생성
   */
  private generateRaceRecommendations(
    predictions: HorsePrediction[]
  ): PredictionRecommendation[] {
    const recommendations: PredictionRecommendation[] = [];

    // 단승 추천 (1위)
    const top = predictions[0];
    if (top && top.winProbability > 0.15) {
      recommendations.push({
        action: 'strong_bet',
        betType: 'win',
        reasoning: [
          `${top.horseName} 단승 추천`,
          `예상 승률 ${(top.winProbability * 100).toFixed(1)}%`,
        ],
      });
    }

    // 복승 추천 (상위 3마)
    const topThree = predictions.slice(0, 3);
    const avgPlaceProb =
      topThree.reduce((sum, p) => sum + (p.placeProbability ?? 0), 0) / 3;

    if (avgPlaceProb > 0.4) {
      recommendations.push({
        action: 'bet',
        betType: 'place',
        reasoning: [
          `상위 3마 복승 권장`,
          `${topThree.map((p) => p.horseName).join(', ')}`,
        ],
      });
    }

    // 가치 베팅 추천
    const valueBets = predictions.filter(
      (p) => p.valueAnalysis?.isValue && p.valueAnalysis.edge > 0.1
    );

    for (const vb of valueBets.slice(0, 2)) {
      recommendations.push({
        action: 'consider',
        betType: 'win',
        reasoning: [
          `${vb.horseName} 가치베팅 가능`,
          `엣지 ${((vb.valueAnalysis?.edge ?? 0) * 100).toFixed(1)}%`,
        ],
      });
    }

    return recommendations;
  }

  /**
   * 가중치 업데이트
   */
  setWeights(weights: ModelWeights): void {
    this.weights = weights;
  }

  /**
   * 현재 가중치 조회
   */
  getWeights(): ModelWeights {
    return { ...this.weights };
  }
}

// =============================================================================
// Factory & Utilities
// =============================================================================

/** 기본 예측 엔진 인스턴스 */
let defaultEngine: PredictionEngine | null = null;

/**
 * 기본 예측 엔진 가져오기 (싱글톤)
 */
export function getDefaultEngine(): PredictionEngine {
  if (!defaultEngine) {
    defaultEngine = new PredictionEngine();
  }
  return defaultEngine;
}

/**
 * 간편 예측 함수
 */
export function predictRace(
  input: PredictionInput,
  options?: PredictionOptions
): RacePrediction {
  return getDefaultEngine().predictRace(input, options);
}

/**
 * 빠른 승률 계산 (점수만 반환)
 */
export function quickPrediction(
  entries: EntryInput[],
  race: RaceContext
): { entryNo: number; winProbability: number }[] {
  const result = predictRace({ race, entries });
  return result.predictions.map((p) => ({
    entryNo: p.entryNo,
    winProbability: p.winProbability,
  }));
}
