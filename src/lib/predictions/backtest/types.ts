/**
 * Backtest Types
 *
 * 백테스트 프레임워크 타입 정의
 */

import type { RacePrediction, ModelWeights } from '@/types/prediction';

// =============================================================================
// 입력 타입
// =============================================================================

/**
 * 백테스트 설정
 */
export interface BacktestConfig {
  /** 시작일 (YYYYMMDD) */
  startDate: string;
  /** 종료일 (YYYYMMDD) */
  endDate: string;
  /** 경마장 필터 (선택) */
  meets?: ('1' | '2' | '3')[];
  /** 모델 가중치 (기본값 사용 시 생략) */
  weights?: ModelWeights;
  /** Top-N 정확도 계산용 */
  topN?: number[];
}

/**
 * 실제 경주 결과
 */
export interface ActualResult {
  /** 경주 ID */
  raceId: string;
  /** 경주일자 */
  raceDate: string;
  /** 경마장 코드 */
  meet: string;
  /** 경주번호 */
  raceNo: number;
  /** 출전마 수 */
  fieldSize: number;
  /** 순위별 마번 (1등부터) */
  finishOrder: string[];
  /** 우승마 배당률 */
  winnerOdds?: number;
}

// =============================================================================
// 결과 타입
// =============================================================================

/**
 * 개별 경주 백테스트 결과
 */
export interface RaceBacktestResult {
  /** 경주 ID */
  raceId: string;
  /** 예측 결과 */
  prediction: RacePrediction;
  /** 실제 결과 */
  actual: ActualResult;
  /** 예측 1위 마번 */
  predictedWinner: string;
  /** 실제 1위 마번 */
  actualWinner: string;
  /** Top-1 적중 여부 */
  isTop1Hit: boolean;
  /** Top-3 적중 여부 (예측 1위가 실제 3위 이내) */
  isTop3Hit: boolean;
  /** 예측 상위 3마리가 실제 3위 이내에 포함된 수 */
  top3Overlap: number;
  /** 예측 신뢰도 */
  confidence: number;
  /** 예측 확률 */
  predictedProbability: number;
}

/**
 * 정확도 메트릭
 */
export interface AccuracyMetrics {
  /** 총 경주 수 */
  totalRaces: number;
  /** Top-1 적중률 */
  top1Accuracy: number;
  /** Top-3 적중률 (예측 1위가 3위 이내) */
  top3Accuracy: number;
  /** Top-N 적중률 배열 */
  topNAccuracy: Record<number, number>;
  /** 평균 Top-3 오버랩 */
  avgTop3Overlap: number;
  /** 고신뢰 예측 정확도 */
  highConfidenceAccuracy: number;
  /** 저신뢰 예측 정확도 */
  lowConfidenceAccuracy: number;
}

/**
 * 신뢰도 캘리브레이션 결과
 */
export interface CalibrationResult {
  /** 신뢰도 구간 */
  confidenceBin: string;
  /** 해당 구간 예측 수 */
  count: number;
  /** 실제 적중률 */
  actualAccuracy: number;
  /** 예상 적중률 (평균 신뢰도) */
  expectedAccuracy: number;
  /** 캘리브레이션 오차 */
  calibrationError: number;
}

/**
 * 전체 백테스트 결과
 */
export interface BacktestReport {
  /** 백테스트 설정 */
  config: BacktestConfig;
  /** 실행 시간 */
  executedAt: string;
  /** 소요 시간 (ms) */
  duration: number;
  /** 정확도 메트릭 */
  metrics: AccuracyMetrics;
  /** 신뢰도 캘리브레이션 */
  calibration: CalibrationResult[];
  /** 경마장별 정확도 */
  byMeet: Record<string, AccuracyMetrics>;
  /** 거리별 정확도 */
  byDistance: Record<string, AccuracyMetrics>;
  /** 개별 경주 결과 (선택) */
  raceResults?: RaceBacktestResult[];
  /** 경고/오류 */
  warnings: string[];
}

// =============================================================================
// 유틸리티 타입
// =============================================================================

/**
 * 백테스트 진행 콜백
 */
export type BacktestProgressCallback = (progress: {
  current: number;
  total: number;
  raceId: string;
}) => void;
