/**
 * Backtest Metrics Tests
 */

import {
  calculateAccuracyMetrics,
  calculateCalibration,
  calculateECE,
  calculateBrierScore,
  calculateROI,
  calculateMetricsByMeet,
} from '../metrics';
import type { RaceBacktestResult, ActualResult } from '../types';
import type { RacePrediction } from '@/types/prediction';

// =============================================================================
// Test Helpers
// =============================================================================

function createMockPrediction(
  entryNo: number,
  winProbability: number
): RacePrediction {
  return {
    raceId: 'test-race',
    meetCode: '1',
    raceNo: 1,
    trackCondition: {
      moisture: 5,
      firmness: 7,
      label: '양호',
      going: 'good',
    },
    predictions: [
      {
        entryNo,
        horseName: `Horse${entryNo}`,
        winProbability,
        placeProbability: winProbability * 1.5,
        expectedPosition: 1,
        totalScore: winProbability * 100,
        confidence: winProbability,
        confidenceLevel: winProbability >= 0.7 ? 'high' : winProbability >= 0.5 ? 'medium' : 'low',
        recommendation: {
          action: 'consider',
          reasoning: ['Test'],
        },
        factors: [],
        scoreBreakdown: {
          trackConditionScore: 0,
          gatePositionScore: 0,
          distanceFitScore: 0,
          fieldSizeScore: 0,
          surfaceScore: 0,
          ratingScore: 0,
          formScore: 0,
          burdenFitScore: 0,
          distancePreferenceScore: 0,
          jockeyScore: 0,
          trainerScore: 0,
          comboSynergyScore: 0,
          bloodlineScore: 0,
          externalTotal: 0,
          internalTotal: 0,
        },
      },
    ],
    recommendations: [],
    generatedAt: new Date().toISOString(),
    modelVersion: 'test',
  };
}

function createMockActualResult(
  winner: string,
  meet: string = '1'
): ActualResult {
  return {
    raceId: 'test-race',
    raceDate: '20241201',
    meet,
    raceNo: 1,
    fieldSize: 10,
    finishOrder: [winner, '2', '3', '4', '5'],
    winnerOdds: 5.0,
  };
}

function createMockBacktestResult(
  predictedWinner: string,
  actualWinner: string,
  confidence: number = 0.6,
  meet: string = '1'
): RaceBacktestResult {
  const isTop1Hit = predictedWinner === actualWinner;
  return {
    raceId: `test-${predictedWinner}-${actualWinner}`,
    prediction: createMockPrediction(parseInt(predictedWinner), confidence),
    actual: createMockActualResult(actualWinner, meet),
    predictedWinner,
    actualWinner,
    isTop1Hit,
    isTop3Hit: ['1', '2', '3'].includes(predictedWinner),
    top3Overlap: isTop1Hit ? 1 : 0,
    confidence,
    predictedProbability: confidence,
  };
}

// =============================================================================
// Tests
// =============================================================================

describe('calculateAccuracyMetrics', () => {
  it('빈 결과에 대해 0 반환', () => {
    const result = calculateAccuracyMetrics([]);

    expect(result.totalRaces).toBe(0);
    expect(result.top1Accuracy).toBe(0);
    expect(result.top3Accuracy).toBe(0);
    expect(result.avgTop3Overlap).toBe(0);
  });

  it('모두 적중 시 100% 정확도', () => {
    const results = [
      createMockBacktestResult('1', '1'),
      createMockBacktestResult('2', '2'),
      createMockBacktestResult('3', '3'),
    ];

    const metrics = calculateAccuracyMetrics(results);

    expect(metrics.totalRaces).toBe(3);
    expect(metrics.top1Accuracy).toBe(1);
  });

  it('모두 실패 시 0% 정확도', () => {
    const results = [
      createMockBacktestResult('1', '5'),
      createMockBacktestResult('2', '6'),
      createMockBacktestResult('3', '7'),
    ];

    const metrics = calculateAccuracyMetrics(results);

    expect(metrics.top1Accuracy).toBe(0);
  });

  it('일부 적중 시 정확한 비율 계산', () => {
    const results = [
      createMockBacktestResult('1', '1'), // hit
      createMockBacktestResult('2', '5'), // miss
      createMockBacktestResult('3', '3'), // hit
      createMockBacktestResult('4', '8'), // miss
    ];

    const metrics = calculateAccuracyMetrics(results);

    expect(metrics.totalRaces).toBe(4);
    expect(metrics.top1Accuracy).toBe(0.5);
  });

  it('고신뢰/저신뢰 별 정확도 계산', () => {
    const results = [
      createMockBacktestResult('1', '1', 0.8), // high conf, hit
      createMockBacktestResult('2', '5', 0.75), // high conf, miss
      createMockBacktestResult('3', '6', 0.4), // low conf, miss
      createMockBacktestResult('4', '4', 0.3), // low conf, hit
    ];

    const metrics = calculateAccuracyMetrics(results);

    expect(metrics.highConfidenceAccuracy).toBe(0.5);
    expect(metrics.lowConfidenceAccuracy).toBe(0.5);
  });
});

describe('calculateCalibration', () => {
  it('빈 결과에 대해 빈 배열 반환', () => {
    const result = calculateCalibration([]);
    expect(result).toEqual([]);
  });

  it('신뢰도 구간별로 결과 분류', () => {
    const results = [
      createMockBacktestResult('1', '1', 0.85),
      createMockBacktestResult('2', '2', 0.75),
      createMockBacktestResult('3', '5', 0.25),
    ];

    const calibration = calculateCalibration(results);

    expect(calibration.length).toBeGreaterThan(0);
    const highConfBin = calibration.find((c) => c.confidenceBin.includes('80'));
    expect(highConfBin?.count).toBe(1);
  });
});

describe('calculateECE', () => {
  it('빈 캘리브레이션에 대해 0 반환', () => {
    expect(calculateECE([])).toBe(0);
  });

  it('캘리브레이션 오차 가중 평균 계산', () => {
    const calibration = [
      {
        confidenceBin: '60-70%',
        count: 10,
        actualAccuracy: 0.6,
        expectedAccuracy: 0.65,
        calibrationError: 0.05,
      },
      {
        confidenceBin: '70-80%',
        count: 10,
        actualAccuracy: 0.75,
        expectedAccuracy: 0.75,
        calibrationError: 0,
      },
    ];

    const ece = calculateECE(calibration);
    expect(ece).toBeCloseTo(0.025, 3);
  });
});

describe('calculateBrierScore', () => {
  it('빈 결과에 대해 0 반환', () => {
    expect(calculateBrierScore([])).toBe(0);
  });

  it('완벽한 예측에 대해 0에 가까운 점수', () => {
    const results = [
      createMockBacktestResult('1', '1', 0.99),
      createMockBacktestResult('2', '2', 0.98),
    ];

    const score = calculateBrierScore(results);
    expect(score).toBeLessThan(0.01);
  });

  it('나쁜 예측에 대해 높은 점수', () => {
    const results = [
      createMockBacktestResult('1', '5', 0.9),
      createMockBacktestResult('2', '6', 0.85),
    ];

    const score = calculateBrierScore(results);
    expect(score).toBeGreaterThan(0.7);
  });
});

describe('calculateROI', () => {
  it('빈 결과에 대해 0 반환', () => {
    const roi = calculateROI([]);
    expect(roi.roi).toBe(0);
    expect(roi.profit).toBe(0);
    expect(roi.totalBet).toBe(0);
  });

  it('적중 시 배당에 따른 수익 계산', () => {
    const results = [
      createMockBacktestResult('1', '1'), // hit with 5.0 odds
      createMockBacktestResult('2', '5'), // miss
    ];

    const roi = calculateROI(results, 1000);

    expect(roi.totalBet).toBe(2000);
    expect(roi.profit).toBe(3000); // 5.0 * 1000 - 2000 = 3000
    expect(roi.roi).toBe(150); // 3000 / 2000 * 100
  });
});

describe('calculateMetricsByMeet', () => {
  it('경마장별로 메트릭 분리', () => {
    const results = [
      createMockBacktestResult('1', '1', 0.6, '1'), // 서울
      createMockBacktestResult('2', '2', 0.6, '1'), // 서울
      createMockBacktestResult('3', '5', 0.6, '3'), // 부경
    ];

    const byMeet = calculateMetricsByMeet(results);

    expect(byMeet['1'].totalRaces).toBe(2);
    expect(byMeet['1'].top1Accuracy).toBe(1);
    expect(byMeet['3'].totalRaces).toBe(1);
    expect(byMeet['3'].top1Accuracy).toBe(0);
  });
});
