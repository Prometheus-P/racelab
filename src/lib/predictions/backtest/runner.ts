/**
 * Backtest Runner
 *
 * 백테스트 실행 및 리포트 생성
 */

import type {
  BacktestConfig,
  BacktestReport,
  RaceBacktestResult,
  ActualResult,
  BacktestProgressCallback,
} from './types';
import {
  calculateAccuracyMetrics,
  calculateCalibration,
  calculateMetricsByMeet,
  calculateMetricsByDistance,
} from './metrics';
import { PredictionEngine } from '../core/predictor';
import { adaptKraRace } from '../adapters/kraAdapter';
import type { KraRaceData, KraRelatedData } from '../adapters/kraAdapter';
import {
  fetchRaceResultAISummary,
  fetchAllJockeyResults,
  fetchAllTrainerResults,
  type RaceResultAISummary,
  type Jockey,
  type Trainer,
} from '@/lib/api/kra';
import { DEFAULT_MODEL_WEIGHTS } from '../constants';

// =============================================================================
// 메인 백테스트 함수
// =============================================================================

/**
 * 백테스트 실행
 *
 * @param config 백테스트 설정
 * @param onProgress 진행 콜백 (선택)
 */
export async function runBacktest(
  config: BacktestConfig,
  onProgress?: BacktestProgressCallback
): Promise<BacktestReport> {
  const startTime = Date.now();
  const warnings: string[] = [];
  const raceResults: RaceBacktestResult[] = [];

  // 엔진 초기화
  const engine = new PredictionEngine(config.weights ?? DEFAULT_MODEL_WEIGHTS);

  // 날짜 범위 생성
  const dates = generateDateRange(config.startDate, config.endDate);

  let processedCount = 0;
  let totalRaces = 0;

  // 각 날짜별로 백테스트 수행
  for (const date of dates) {
    try {
      // 1. 해당 날짜의 경주 결과 조회
      const summaries = await fetchRaceResultAISummary(date, config.meets?.[0]);

      if (summaries.length === 0) {
        continue;
      }

      // 2. 기수/조교사 정보 조회
      const [jockeys, trainers] = await Promise.all([
        fetchAllJockeyResults(date).catch(() => [] as Jockey[]),
        fetchAllTrainerResults(date).catch(() => [] as Trainer[]),
      ]);

      const relatedData = createRelatedDataMaps(jockeys, trainers);

      // 3. 각 경주별로 예측 및 비교
      for (const summary of summaries) {
        // 경마장 필터 적용
        if (config.meets && !config.meets.includes(summary.meet as '1' | '2' | '3')) {
          continue;
        }

        totalRaces++;
        processedCount++;

        if (onProgress) {
          onProgress({
            current: processedCount,
            total: totalRaces,
            raceId: `${summary.meet}-${date}-${summary.raceNo}`,
          });
        }

        try {
          const result = await processRace(summary, date, relatedData, engine);
          if (result) {
            raceResults.push(result);
          }
        } catch (err) {
          warnings.push(
            `경주 처리 실패 (${summary.meet}-${date}-${summary.raceNo}): ${err instanceof Error ? err.message : 'Unknown'}`
          );
        }
      }
    } catch (err) {
      warnings.push(
        `날짜 처리 실패 (${date}): ${err instanceof Error ? err.message : 'Unknown'}`
      );
    }
  }

  // 메트릭 계산
  const metrics = calculateAccuracyMetrics(raceResults, config.topN);
  const calibration = calculateCalibration(raceResults);
  const byMeet = calculateMetricsByMeet(raceResults);
  const byDistance = calculateMetricsByDistance(raceResults);

  return {
    config,
    executedAt: new Date().toISOString(),
    duration: Date.now() - startTime,
    metrics,
    calibration,
    byMeet,
    byDistance,
    raceResults,
    warnings,
  };
}

// =============================================================================
// 개별 경주 처리
// =============================================================================

/**
 * 개별 경주 백테스트 처리
 */
async function processRace(
  summary: RaceResultAISummary,
  date: string,
  relatedData: KraRelatedData,
  engine: PredictionEngine
): Promise<RaceBacktestResult | null> {
  // 출전마가 없으면 스킵
  if (!summary.entries || summary.entries.length < 2) {
    return null;
  }

  // 실제 결과 추출
  const actual = extractActualResult(summary, date);

  // 예측 입력 생성
  const raceData = createRaceDataFromSummary(summary, date);
  const predictionInput = adaptKraRace(raceData, relatedData);

  // 예측 수행
  const prediction = engine.predictRace(predictionInput);

  // 예측 결과 분석
  const sortedPredictions = [...prediction.predictions].sort(
    (a, b) => b.winProbability - a.winProbability
  );

  const predictedWinner = String(sortedPredictions[0]?.entryNo ?? 0);
  const actualWinner = actual.finishOrder[0] ?? '';

  const isTop1Hit = predictedWinner === actualWinner;
  const isTop3Hit = actual.finishOrder.slice(0, 3).includes(predictedWinner);

  // Top-3 오버랩 계산
  const predictedTop3 = sortedPredictions.slice(0, 3).map((p) => String(p.entryNo));
  const actualTop3 = actual.finishOrder.slice(0, 3);
  const top3Overlap = predictedTop3.filter((no) => actualTop3.includes(no)).length;

  return {
    raceId: `${summary.meet}-${date}-${summary.raceNo}`,
    prediction,
    actual,
    predictedWinner,
    actualWinner,
    isTop1Hit,
    isTop3Hit,
    top3Overlap,
    confidence: sortedPredictions[0]?.confidence ?? 0.5,
    predictedProbability: sortedPredictions[0]?.winProbability ?? 0,
  };
}

/**
 * 실제 결과 추출
 */
function extractActualResult(
  summary: RaceResultAISummary,
  date: string
): ActualResult {
  // 순위순 정렬
  const sorted = [...summary.entries].sort((a, b) => a.position - b.position);

  const finishOrder = sorted.map((e) => e.horseNo);
  const winner = sorted.find((e) => e.position === 1);

  return {
    raceId: `${summary.meet}-${date}-${summary.raceNo}`,
    raceDate: date,
    meet: summary.meet,
    raceNo: summary.raceNo,
    fieldSize: summary.entries.length,
    finishOrder,
    winnerOdds: winner?.winOdds,
  };
}

/**
 * RaceResultAISummary에서 KraRaceData 생성
 */
function createRaceDataFromSummary(
  summary: RaceResultAISummary,
  date: string
): KraRaceData {
  const meetCode = getMeetCode(summary.meet);

  return {
    raceId: `${summary.meet}-${date}-${summary.raceNo}`,
    raceDate: date,
    meetCode,
    raceNo: summary.raceNo,
    raceName: summary.raceName,
    distance: summary.distance,
    surface: 'dirt',
    grade: summary.grade,
    entries: summary.entries.map((e) => ({
      meet: summary.meet,
      raceDate: date,
      raceNo: summary.raceNo,
      raceName: summary.raceName,
      distance: summary.distance,
      grade: summary.grade,
      horseNo: e.horseNo,
      horseName: e.horseName,
      sex: e.sex,
      age: e.age,
      burden: e.burden,
      rating: e.rating,
      jockey: e.jockeyName,
      trainer: e.trainerName ?? '',
      owner: e.ownerName,
    })),
    trackConditionCode: getTrackConditionCode(summary.trackCondition),
  };
}

// =============================================================================
// 헬퍼 함수
// =============================================================================

/**
 * 날짜 범위 생성 (YYYYMMDD 형식)
 */
function generateDateRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const startDate = parseDate(start);
  const endDate = parseDate(end);

  const current = new Date(startDate);
  while (current <= endDate) {
    dates.push(formatDate(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * YYYYMMDD 문자열을 Date로 파싱
 */
function parseDate(dateStr: string): Date {
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1;
  const day = parseInt(dateStr.substring(6, 8));
  return new Date(year, month, day);
}

/**
 * Date를 YYYYMMDD로 포맷
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * 경마장명에서 코드 추출
 */
function getMeetCode(meet: string): '1' | '2' | '3' {
  if (meet === '1' || meet === '2' || meet === '3') {
    return meet;
  }

  const nameToCode: Record<string, '1' | '2' | '3'> = {
    서울: '1',
    제주: '2',
    부경: '3',
  };

  return nameToCode[meet] || '1';
}

/**
 * 주로상태에서 코드 추출
 */
function getTrackConditionCode(condition?: string): '1' | '2' | '3' | '4' {
  if (!condition) return '1';

  const conditionMap: Record<string, '1' | '2' | '3' | '4'> = {
    양호: '1',
    약간불량: '2',
    불량: '3',
    극불량: '4',
  };

  return conditionMap[condition] || '1';
}

/**
 * 기수/조교사 맵 생성
 */
function createRelatedDataMaps(
  jockeys: Jockey[],
  trainers: Trainer[]
): KraRelatedData {
  const jockeyMap = new Map<string, Jockey>();
  const trainerMap = new Map<string, Trainer>();

  for (const jockey of jockeys) {
    jockeyMap.set(jockey.name, jockey);
  }

  for (const trainer of trainers) {
    trainerMap.set(trainer.name, trainer);
  }

  return {
    jockeys: jockeyMap,
    trainers: trainerMap,
    horses: new Map(),
  };
}

// =============================================================================
// 편의 함수
// =============================================================================

/**
 * 빠른 백테스트 (최근 7일)
 */
export async function quickBacktest(
  meets?: ('1' | '2' | '3')[]
): Promise<BacktestReport> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  return runBacktest({
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    meets,
  });
}

/**
 * 백테스트 결과 요약 문자열
 */
export function formatBacktestSummary(report: BacktestReport): string {
  const { metrics, duration } = report;

  return [
    `=== 백테스트 결과 ===`,
    `기간: ${report.config.startDate} ~ ${report.config.endDate}`,
    `총 경주: ${metrics.totalRaces}건`,
    `소요 시간: ${(duration / 1000).toFixed(1)}초`,
    ``,
    `[정확도]`,
    `Top-1: ${(metrics.top1Accuracy * 100).toFixed(1)}%`,
    `Top-3: ${(metrics.top3Accuracy * 100).toFixed(1)}%`,
    `평균 Top-3 오버랩: ${metrics.avgTop3Overlap.toFixed(2)}`,
    ``,
    `[신뢰도별]`,
    `고신뢰(70%+): ${(metrics.highConfidenceAccuracy * 100).toFixed(1)}%`,
    `저신뢰(50%-): ${(metrics.lowConfidenceAccuracy * 100).toFixed(1)}%`,
  ].join('\n');
}
