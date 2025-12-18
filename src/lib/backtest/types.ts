/**
 * Backtest Job Types
 *
 * QStash + Vercel KV 기반 비동기 백테스팅 작업 관리
 */

import type { BacktestRequest, BacktestResult, BacktestSummary } from '../strategy/types';

// =============================================================================
// Job Status & State
// =============================================================================

/**
 * 백테스트 작업 상태
 */
export type JobStatus =
  | 'pending' // 대기 중 (큐에 등록됨)
  | 'running' // 실행 중
  | 'completed' // 완료
  | 'failed' // 실패
  | 'cancelled'; // 취소됨

/**
 * 백테스트 작업 우선순위
 */
export type JobPriority = 'low' | 'normal' | 'high';

// =============================================================================
// Job Entity
// =============================================================================

/**
 * 백테스트 작업 엔티티
 */
export interface BacktestJob {
  /** 고유 작업 ID (UUID) */
  id: string;

  /** 소유 클라이언트 ID */
  clientId: string;

  /** 작업 상태 */
  status: JobStatus;

  /** 우선순위 */
  priority: JobPriority;

  /** 백테스트 요청 데이터 */
  request: BacktestRequest;

  /** 진행률 (0-100) */
  progress: number;

  /** 진행 상태 메시지 */
  progressMessage?: string;

  /** 처리된 경주 수 */
  processedRaces?: number;

  /** 총 대상 경주 수 */
  totalRaces?: number;

  /** 생성 시각 */
  createdAt: string;

  /** 시작 시각 */
  startedAt?: string;

  /** 완료 시각 */
  completedAt?: string;

  /** 예상 완료 시간 (초) */
  estimatedDuration?: number;

  /** 실제 실행 시간 (ms) */
  executionTimeMs?: number;

  /** 오류 정보 (실패 시) */
  error?: JobError;

  /** QStash 메시지 ID */
  qstashMessageId?: string;

  /** 재시도 횟수 */
  retryCount: number;

  /** 최대 재시도 횟수 */
  maxRetries: number;
}

/**
 * 작업 오류 정보
 */
export interface JobError {
  code: JobErrorCode;
  message: string;
  details?: string;
  stack?: string;
  retryable: boolean;
}

/**
 * 작업 오류 코드
 */
export type JobErrorCode =
  | 'VALIDATION_ERROR' // 입력 검증 실패
  | 'QUOTA_EXCEEDED' // 할당량 초과
  | 'DATA_NOT_FOUND' // 데이터 없음
  | 'TIMEOUT' // 시간 초과
  | 'INTERNAL_ERROR' // 내부 오류
  | 'CANCELLED'; // 사용자 취소

// =============================================================================
// Job Result Storage
// =============================================================================

/**
 * 저장된 백테스트 결과 (Vercel KV)
 */
export interface StoredBacktestResult {
  /** 작업 ID */
  jobId: string;

  /** 클라이언트 ID */
  clientId: string;

  /** 결과 요약 */
  summary: BacktestSummary;

  /** 결과 데이터 위치 (대용량은 별도 저장) */
  resultDataUrl?: string;

  /** 전체 결과 포함 여부 */
  hasFullResult: boolean;

  /** 만료 시각 (TTL) */
  expiresAt: string;

  /** 생성 시각 */
  createdAt: string;
}

// =============================================================================
// API Request/Response Types
// =============================================================================

/**
 * 백테스트 작업 생성 요청
 */
export interface CreateBacktestJobRequest {
  /** 백테스트 요청 */
  request: BacktestRequest;

  /** 우선순위 (선택) */
  priority?: JobPriority;

  /** 웹훅 URL (완료 시 알림) */
  webhookUrl?: string;
}

/**
 * 백테스트 작업 생성 응답
 */
export interface CreateBacktestJobResponse {
  /** 작업 ID */
  jobId: string;

  /** 초기 상태 */
  status: JobStatus;

  /** 예상 완료 시간 (초) */
  estimatedDuration: number;

  /** 큐 위치 */
  queuePosition: number;

  /** 결과 조회 URL */
  statusUrl: string;

  /** 결과 조회 URL */
  resultUrl: string;
}

/**
 * 작업 상태 조회 응답
 */
export interface GetJobStatusResponse {
  /** 작업 ID */
  jobId: string;

  /** 현재 상태 */
  status: JobStatus;

  /** 진행률 (0-100) */
  progress: number;

  /** 진행 메시지 */
  progressMessage?: string;

  /** 처리 현황 */
  processed?: {
    races: number;
    total: number;
  };

  /** 오류 (실패 시) */
  error?: {
    code: JobErrorCode;
    message: string;
  };

  /** 예상 남은 시간 (초) */
  estimatedRemainingSeconds?: number;

  /** 생성 시각 */
  createdAt: string;

  /** 시작 시각 */
  startedAt?: string;

  /** 완료 시각 */
  completedAt?: string;
}

/**
 * 작업 결과 조회 응답
 */
export interface GetJobResultResponse {
  /** 작업 ID */
  jobId: string;

  /** 상태 (completed만 결과 포함) */
  status: JobStatus;

  /** 결과 요약 */
  summary?: BacktestSummary;

  /** 전체 결과 (옵션) */
  fullResult?: BacktestResult;

  /** 전체 결과 다운로드 URL */
  downloadUrl?: string;

  /** 결과 만료 시각 */
  expiresAt?: string;
}

/**
 * 작업 목록 조회 요청
 */
export interface ListJobsRequest {
  /** 상태 필터 */
  status?: JobStatus | JobStatus[];

  /** 페이지 번호 (1부터) */
  page?: number;

  /** 페이지 크기 */
  limit?: number;

  /** 정렬 기준 */
  sortBy?: 'createdAt' | 'status';

  /** 정렬 방향 */
  sortOrder?: 'asc' | 'desc';
}

/**
 * 작업 목록 조회 응답
 */
export interface ListJobsResponse {
  /** 작업 목록 */
  jobs: Array<{
    jobId: string;
    status: JobStatus;
    strategyName: string;
    dateRange: { from: string; to: string };
    progress: number;
    createdAt: string;
    completedAt?: string;
  }>;

  /** 페이지네이션 */
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// =============================================================================
// Quota Management
// =============================================================================

/**
 * 백테스트 할당량 정보
 */
export interface BacktestQuota {
  /** 월간 한도 (-1 = 무제한) */
  monthlyLimit: number;

  /** 사용량 */
  used: number;

  /** 남은 횟수 (-1 = 무제한) */
  remaining: number;

  /** 리셋 시각 */
  resetAt: string;

  /** 동시 실행 한도 */
  concurrentLimit: number;

  /** 현재 실행 중인 작업 수 */
  currentRunning: number;

  /** 최대 백테스트 기간 (일) */
  maxPeriodDays: number;
}

/**
 * 할당량 확인 결과
 */
export interface QuotaCheckResult {
  /** 실행 가능 여부 */
  allowed: boolean;

  /** 거부 사유 */
  reason?: 'MONTHLY_LIMIT_EXCEEDED' | 'CONCURRENT_LIMIT_EXCEEDED' | 'PERIOD_LIMIT_EXCEEDED';

  /** 현재 할당량 정보 */
  quota: BacktestQuota;
}

// =============================================================================
// QStash Integration
// =============================================================================

/**
 * QStash 메시지 페이로드
 */
export interface QStashBacktestPayload {
  /** 작업 ID */
  jobId: string;

  /** 클라이언트 ID */
  clientId: string;

  /** 백테스트 요청 */
  request: BacktestRequest;

  /** 재시도 컨텍스트 */
  retryContext?: {
    attempt: number;
    previousError?: string;
  };
}

/**
 * QStash 웹훅 헤더
 */
export interface QStashWebhookHeaders {
  'upstash-message-id': string;
  'upstash-retried': string;
  'upstash-schedule-id'?: string;
  'upstash-signature': string;
}

// =============================================================================
// Worker Types
// =============================================================================

/**
 * 워커 실행 컨텍스트
 */
export interface WorkerContext {
  /** 작업 ID */
  jobId: string;

  /** 클라이언트 ID */
  clientId: string;

  /** 시작 시각 */
  startTime: number;

  /** 타임아웃 (ms) */
  timeout: number;

  /** 진행률 업데이트 함수 */
  updateProgress: (progress: number, message?: string) => Promise<void>;

  /** 체크포인트 저장 함수 (장시간 작업용) */
  saveCheckpoint?: (checkpoint: WorkerCheckpoint) => Promise<void>;
}

/**
 * 워커 체크포인트 (장시간 작업 재개용)
 */
export interface WorkerCheckpoint {
  /** 마지막 처리된 경주 ID */
  lastProcessedRaceId: string;

  /** 처리된 경주 수 */
  processedCount: number;

  /** 중간 결과 */
  partialResults: {
    bets: number;
    wins: number;
    totalProfit: number;
    currentCapital: number;
  };

  /** 체크포인트 시각 */
  savedAt: string;
}

// =============================================================================
// Vercel KV Key Patterns
// =============================================================================

/**
 * Vercel KV 키 패턴
 */
export const KV_KEY_PATTERNS = {
  /** 작업 정보: backtest:job:{jobId} */
  job: (jobId: string) => `backtest:job:${jobId}`,

  /** 작업 결과: backtest:result:{jobId} */
  result: (jobId: string) => `backtest:result:${jobId}`,

  /** 클라이언트 할당량: backtest:quota:{clientId} */
  quota: (clientId: string) => `backtest:quota:${clientId}`,

  /** 클라이언트 작업 목록: backtest:jobs:{clientId} */
  clientJobs: (clientId: string) => `backtest:jobs:${clientId}`,

  /** 실행 중인 작업: backtest:running:{clientId} */
  runningJobs: (clientId: string) => `backtest:running:${clientId}`,

  /** 워커 체크포인트: backtest:checkpoint:{jobId} */
  checkpoint: (jobId: string) => `backtest:checkpoint:${jobId}`,
} as const;

// =============================================================================
// Constants
// =============================================================================

/** 기본 작업 TTL (7일) */
export const DEFAULT_JOB_TTL_SECONDS = 7 * 24 * 60 * 60;

/** 결과 TTL (30일) */
export const DEFAULT_RESULT_TTL_SECONDS = 30 * 24 * 60 * 60;

/** 기본 최대 재시도 */
export const DEFAULT_MAX_RETRIES = 3;

/** 워커 타임아웃 (55초 - Vercel 제한 60초보다 약간 작게) */
export const WORKER_TIMEOUT_MS = 55 * 1000;

/** 진행률 업데이트 간격 (경주 수) */
export const PROGRESS_UPDATE_INTERVAL = 10;

/** 예상 경주당 처리 시간 (ms) */
export const ESTIMATED_MS_PER_RACE = 50;
