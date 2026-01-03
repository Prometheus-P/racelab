/**
 * Backtest Module
 *
 * 예측 모델 백테스트 및 정확도 검증
 */

// Types
export type {
  BacktestConfig,
  BacktestReport,
  RaceBacktestResult,
  ActualResult,
  AccuracyMetrics,
  CalibrationResult,
  BacktestProgressCallback,
} from './types';

// Metrics
export {
  calculateAccuracyMetrics,
  calculateCalibration,
  calculateECE,
  calculateMetricsByMeet,
  calculateMetricsByDistance,
  calculateBrierScore,
  calculateROI,
} from './metrics';

// Runner
export {
  runBacktest,
  quickBacktest,
  formatBacktestSummary,
} from './runner';
