/**
 * Backtest Module
 *
 * 백테스팅 실행, 메트릭 계산, Job 관리를 위한 모듈
 */

// Job Types
export type {
  JobStatus,
  JobPriority,
  BacktestJob,
  JobError,
  JobErrorCode,
  StoredBacktestResult,
  CreateBacktestJobRequest,
  CreateBacktestJobResponse,
  GetJobStatusResponse,
  GetJobResultResponse,
  ListJobsRequest,
  ListJobsResponse,
  BacktestQuota,
  QuotaCheckResult,
  QStashBacktestPayload,
  QStashWebhookHeaders,
  WorkerContext,
  WorkerCheckpoint,
} from './types';

// Job Constants
export {
  KV_KEY_PATTERNS,
  DEFAULT_JOB_TTL_SECONDS,
  DEFAULT_RESULT_TTL_SECONDS,
  DEFAULT_MAX_RETRIES,
  WORKER_TIMEOUT_MS,
  PROGRESS_UPDATE_INTERVAL,
  ESTIMATED_MS_PER_RACE,
} from './types';

// Executor
export {
  BacktestExecutor,
  MockRaceDataSource,
  runBacktest,
  type ExecutorOptions,
  type RaceDataSource,
  type RaceFilters,
  type RaceResultData,
} from './executor';

// Metrics
export {
  calculateWinRate,
  calculateROI,
  calculateCapitalReturn,
  calculateMaxDrawdown,
  calculateDrawdownPeriods,
  calculateStreaks,
  calculateSharpeRatio,
  calculateProfitFactor,
  calculateAvgWinLossRatio,
  calculateExpectedValue,
  calculateDailyReturns,
  calculateMonthlyReturns,
  calculateStdDev,
  enhanceSummary,
  type EnhancedBacktestSummary,
} from './metrics';

// Job Manager
export {
  createJob,
  getJob,
  updateJobStatus,
  updateJobProgress,
  failJob,
  getClientJobs,
  saveResult,
  getResult,
  getQuota,
  checkQuota,
  incrementQuotaUsage,
  saveCheckpoint,
  getCheckpoint,
  deleteCheckpoint,
  calculatePeriodDays,
  getQueuePosition,
} from './jobManager';
