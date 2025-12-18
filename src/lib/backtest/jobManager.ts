/**
 * Backtest Job Manager
 *
 * Vercel KV 기반 백테스트 작업 상태 관리
 */

import { kv } from '@vercel/kv';
import { v4 as uuidv4 } from 'uuid';
import {
  BacktestJob,
  JobStatus,
  JobPriority,
  JobError,
  StoredBacktestResult,
  BacktestQuota,
  QuotaCheckResult,
  KV_KEY_PATTERNS,
  DEFAULT_JOB_TTL_SECONDS,
  DEFAULT_RESULT_TTL_SECONDS,
  DEFAULT_MAX_RETRIES,
  ESTIMATED_MS_PER_RACE,
  WorkerCheckpoint,
} from './types';
import type { BacktestRequest, BacktestSummary, BacktestResult } from '../strategy/types';
import { hasBacktestAccess, getBacktestLimits, type ClientTier } from '../db/schema/clients';

// =============================================================================
// Job CRUD Operations
// =============================================================================

/**
 * 새 백테스트 작업 생성
 */
export async function createJob(
  clientId: string,
  request: BacktestRequest,
  priority: JobPriority = 'normal'
): Promise<BacktestJob> {
  const jobId = uuidv4();
  const now = new Date().toISOString();

  // 예상 경주 수 계산 (대략적 추정)
  const dateFrom = new Date(request.dateRange.from);
  const dateTo = new Date(request.dateRange.to);
  const days = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24));
  const estimatedRaces = days * 12; // 하루 평균 12경주 가정
  const estimatedDuration = Math.ceil((estimatedRaces * ESTIMATED_MS_PER_RACE) / 1000);

  const job: BacktestJob = {
    id: jobId,
    clientId,
    status: 'pending',
    priority,
    request,
    progress: 0,
    progressMessage: 'Queued for processing',
    createdAt: now,
    estimatedDuration,
    retryCount: 0,
    maxRetries: DEFAULT_MAX_RETRIES,
  };

  // KV에 저장
  await kv.set(KV_KEY_PATTERNS.job(jobId), job, {
    ex: DEFAULT_JOB_TTL_SECONDS,
  });

  // 클라이언트 작업 목록에 추가
  await kv.lpush(KV_KEY_PATTERNS.clientJobs(clientId), jobId);

  return job;
}

/**
 * 작업 조회
 */
export async function getJob(jobId: string): Promise<BacktestJob | null> {
  return kv.get<BacktestJob>(KV_KEY_PATTERNS.job(jobId));
}

/**
 * 작업 상태 업데이트
 */
export async function updateJobStatus(
  jobId: string,
  status: JobStatus,
  updates?: Partial<BacktestJob>
): Promise<BacktestJob | null> {
  const job = await getJob(jobId);
  if (!job) return null;

  const updatedJob: BacktestJob = {
    ...job,
    ...updates,
    status,
  };

  // 상태별 타임스탬프 업데이트
  if (status === 'running' && !updatedJob.startedAt) {
    updatedJob.startedAt = new Date().toISOString();
  }
  if (status === 'completed' || status === 'failed' || status === 'cancelled') {
    updatedJob.completedAt = new Date().toISOString();
    if (updatedJob.startedAt) {
      updatedJob.executionTimeMs =
        new Date(updatedJob.completedAt).getTime() - new Date(updatedJob.startedAt).getTime();
    }
  }

  await kv.set(KV_KEY_PATTERNS.job(jobId), updatedJob, {
    ex: DEFAULT_JOB_TTL_SECONDS,
  });

  // 실행 중 작업 추적 업데이트
  if (status === 'running') {
    await kv.sadd(KV_KEY_PATTERNS.runningJobs(job.clientId), jobId);
  } else if (status === 'completed' || status === 'failed' || status === 'cancelled') {
    await kv.srem(KV_KEY_PATTERNS.runningJobs(job.clientId), jobId);
  }

  return updatedJob;
}

/**
 * 작업 진행률 업데이트
 */
export async function updateJobProgress(
  jobId: string,
  progress: number,
  message?: string,
  processedRaces?: number,
  totalRaces?: number
): Promise<void> {
  const job = await getJob(jobId);
  if (!job) return;

  const updatedJob: BacktestJob = {
    ...job,
    progress: Math.min(100, Math.max(0, progress)),
    progressMessage: message ?? job.progressMessage,
    processedRaces: processedRaces ?? job.processedRaces,
    totalRaces: totalRaces ?? job.totalRaces,
  };

  await kv.set(KV_KEY_PATTERNS.job(jobId), updatedJob, {
    ex: DEFAULT_JOB_TTL_SECONDS,
  });
}

/**
 * 작업 실패 처리
 */
export async function failJob(jobId: string, error: JobError): Promise<BacktestJob | null> {
  const job = await getJob(jobId);
  if (!job) return null;

  // 재시도 가능한 오류인 경우 카운트 증가
  if (error.retryable && job.retryCount < job.maxRetries) {
    return updateJobStatus(jobId, 'pending', {
      retryCount: job.retryCount + 1,
      error,
      progressMessage: `Retry ${job.retryCount + 1}/${job.maxRetries} after error`,
    });
  }

  // 최종 실패 처리
  return updateJobStatus(jobId, 'failed', { error });
}

/**
 * 클라이언트의 작업 목록 조회
 */
export async function getClientJobs(
  clientId: string,
  options?: { limit?: number; offset?: number; status?: JobStatus[] }
): Promise<{ jobs: BacktestJob[]; total: number }> {
  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;

  // 클라이언트의 모든 작업 ID 조회
  const jobIds = await kv.lrange<string>(
    KV_KEY_PATTERNS.clientJobs(clientId),
    offset,
    offset + limit - 1
  );
  const total = await kv.llen(KV_KEY_PATTERNS.clientJobs(clientId));

  if (!jobIds || jobIds.length === 0) {
    return { jobs: [], total: 0 };
  }

  // 각 작업 정보 조회
  const jobs: BacktestJob[] = [];
  for (const jobId of jobIds) {
    const job = await getJob(jobId);
    if (job) {
      // 상태 필터 적용
      if (!options?.status || options.status.includes(job.status)) {
        jobs.push(job);
      }
    }
  }

  return { jobs, total };
}

// =============================================================================
// Result Storage
// =============================================================================

/**
 * 백테스트 결과 저장
 */
export async function saveResult(
  jobId: string,
  clientId: string,
  result: BacktestResult
): Promise<StoredBacktestResult> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + DEFAULT_RESULT_TTL_SECONDS * 1000);

  const storedResult: StoredBacktestResult = {
    jobId,
    clientId,
    summary: result.summary,
    hasFullResult: true,
    expiresAt: expiresAt.toISOString(),
    createdAt: now.toISOString(),
  };

  // 결과 저장 (요약 + 전체)
  await kv.set(KV_KEY_PATTERNS.result(jobId), { ...storedResult, fullResult: result }, {
    ex: DEFAULT_RESULT_TTL_SECONDS,
  });

  return storedResult;
}

/**
 * 백테스트 결과 조회
 */
export async function getResult(jobId: string): Promise<{
  summary: BacktestSummary;
  fullResult?: BacktestResult;
  expiresAt: string;
} | null> {
  const stored = await kv.get<StoredBacktestResult & { fullResult?: BacktestResult }>(
    KV_KEY_PATTERNS.result(jobId)
  );

  if (!stored) return null;

  return {
    summary: stored.summary,
    fullResult: stored.fullResult,
    expiresAt: stored.expiresAt,
  };
}

// =============================================================================
// Quota Management
// =============================================================================

/**
 * 클라이언트 할당량 조회
 */
export async function getQuota(clientId: string, tier: ClientTier): Promise<BacktestQuota> {
  const limits = getBacktestLimits(tier);
  const stored = await kv.get<{ used: number; resetAt: string }>(
    KV_KEY_PATTERNS.quota(clientId)
  );

  // 현재 달의 시작
  const now = new Date();
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  let used = 0;
  let resetAt = nextMonthStart.toISOString();

  if (stored) {
    // 리셋 시간이 지났는지 확인
    if (new Date(stored.resetAt) <= now) {
      // 리셋 필요
      used = 0;
    } else {
      used = stored.used;
      resetAt = stored.resetAt;
    }
  }

  // 실행 중인 작업 수 조회
  const runningCount = await kv.scard(KV_KEY_PATTERNS.runningJobs(clientId)) ?? 0;

  return {
    monthlyLimit: limits.quotaMonthly,
    used,
    remaining: limits.quotaMonthly === -1 ? -1 : Math.max(0, limits.quotaMonthly - used),
    resetAt,
    concurrentLimit: limits.maxConcurrent,
    currentRunning: runningCount,
    maxPeriodDays: limits.maxPeriodDays,
  };
}

/**
 * 할당량 확인 (백테스트 실행 가능 여부)
 */
export async function checkQuota(
  clientId: string,
  tier: ClientTier,
  requestPeriodDays: number
): Promise<QuotaCheckResult> {
  // 백테스트 접근 권한 확인
  if (!hasBacktestAccess(tier)) {
    return {
      allowed: false,
      reason: 'MONTHLY_LIMIT_EXCEEDED',
      quota: {
        monthlyLimit: 0,
        used: 0,
        remaining: 0,
        resetAt: '',
        concurrentLimit: 0,
        currentRunning: 0,
        maxPeriodDays: 0,
      },
    };
  }

  const quota = await getQuota(clientId, tier);

  // 기간 제한 확인
  if (requestPeriodDays > quota.maxPeriodDays) {
    return {
      allowed: false,
      reason: 'PERIOD_LIMIT_EXCEEDED',
      quota,
    };
  }

  // 동시 실행 제한 확인
  if (quota.currentRunning >= quota.concurrentLimit) {
    return {
      allowed: false,
      reason: 'CONCURRENT_LIMIT_EXCEEDED',
      quota,
    };
  }

  // 월간 한도 확인 (무제한이 아닌 경우)
  if (quota.monthlyLimit !== -1 && quota.used >= quota.monthlyLimit) {
    return {
      allowed: false,
      reason: 'MONTHLY_LIMIT_EXCEEDED',
      quota,
    };
  }

  return {
    allowed: true,
    quota,
  };
}

/**
 * 할당량 사용량 증가
 */
export async function incrementQuotaUsage(clientId: string): Promise<void> {
  const now = new Date();
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const key = KV_KEY_PATTERNS.quota(clientId);
  const stored = await kv.get<{ used: number; resetAt: string }>(key);

  if (stored && new Date(stored.resetAt) > now) {
    // 기존 레코드 업데이트
    await kv.set(key, {
      used: stored.used + 1,
      resetAt: stored.resetAt,
    });
  } else {
    // 새 레코드 생성
    await kv.set(key, {
      used: 1,
      resetAt: nextMonthStart.toISOString(),
    });
  }
}

// =============================================================================
// Checkpoint Management (장시간 작업용)
// =============================================================================

/**
 * 체크포인트 저장
 */
export async function saveCheckpoint(
  jobId: string,
  checkpoint: WorkerCheckpoint
): Promise<void> {
  await kv.set(KV_KEY_PATTERNS.checkpoint(jobId), checkpoint, {
    ex: 3600, // 1시간 TTL
  });
}

/**
 * 체크포인트 조회
 */
export async function getCheckpoint(jobId: string): Promise<WorkerCheckpoint | null> {
  return kv.get<WorkerCheckpoint>(KV_KEY_PATTERNS.checkpoint(jobId));
}

/**
 * 체크포인트 삭제
 */
export async function deleteCheckpoint(jobId: string): Promise<void> {
  await kv.del(KV_KEY_PATTERNS.checkpoint(jobId));
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * 요청 기간(일) 계산
 */
export function calculatePeriodDays(dateRange: { from: string; to: string }): number {
  const from = new Date(dateRange.from);
  const to = new Date(dateRange.to);
  return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * 큐 위치 조회 (대략적)
 */
export async function getQueuePosition(jobId: string, clientId: string): Promise<number> {
  const jobIds = await kv.lrange<string>(KV_KEY_PATTERNS.clientJobs(clientId), 0, -1);
  if (!jobIds) return 1;

  let position = 1;
  for (const id of jobIds) {
    const job = await getJob(id);
    if (job?.status === 'pending') {
      if (job.id === jobId) return position;
      position++;
    }
  }
  return position;
}
