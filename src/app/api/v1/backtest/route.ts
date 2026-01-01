/**
 * B2B Backtest API - Create Job Endpoint
 *
 * POST /api/v1/backtest
 *
 * Creates a new backtest job for async processing.
 * Requires Gold or QuantLab tier.
 */

import { NextResponse } from 'next/server';
import { Client } from '@upstash/qstash';
import YAML from 'yaml';
import {
  withB2BAuth,
  createFeatureDeniedResponse,
  type B2BRequest,
} from '@/lib/api-helpers/apiAuth';
import {
  createJob,
  checkQuota,
  calculatePeriodDays,
  getQueuePosition,
  incrementQuotaUsage,
} from '@/lib/backtest/jobManager';
import { validateBacktestRequest, validateAnyStrategy, parseAnyStrategy } from '@/lib/strategy/validator';
import { isDSLStrategy } from '@/lib/strategy/dsl/transformer';
import { hasBacktestAccess } from '@/lib/db/schema/clients';
import type {
  CreateBacktestJobRequest,
  CreateBacktestJobResponse,
  QStashBacktestPayload,
} from '@/lib/backtest/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// QStash client
const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
});

// Worker endpoint URL
const WORKER_URL = process.env.BACKTEST_WORKER_URL
  || `${process.env.NEXT_PUBLIC_SITE_URL}/api/jobs/backtest/worker`;

async function handler(request: B2BRequest) {
  const client = request.b2bClient!;

  // 1. 백테스트 접근 권한 확인
  if (!hasBacktestAccess(client.tier)) {
    return createFeatureDeniedResponse('Backtest', 'Gold');
  }

  // 2. 요청 본문 파싱 (YAML/JSON 듀얼 포맷 지원)
  let body: CreateBacktestJobRequest;
  const contentType = request.headers.get('content-type') || '';
  const isYamlRequest = contentType.includes('yaml') || contentType.includes('text/plain');

  try {
    if (isYamlRequest) {
      // YAML 파싱
      const text = await request.text();
      body = YAML.parse(text) as CreateBacktestJobRequest;
    } else {
      // JSON 파싱 (기본)
      body = await request.json();
    }
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: `Invalid ${isYamlRequest ? 'YAML' : 'JSON'} in request body`,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }

  // 3. 전략 검증 및 정규화 (DSL/Legacy 듀얼 포맷 지원)
  // body.request 내부의 strategy가 DSL 또는 Legacy 포맷일 수 있음
  if (body.request?.strategy && isDSLStrategy({ strategy: body.request.strategy })) {
    // DSL 포맷인 경우 검증 및 Legacy로 변환
    const strategyValidation = validateAnyStrategy({ strategy: body.request.strategy });
    if (!strategyValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid DSL strategy',
            details: strategyValidation.errors,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Legacy 포맷으로 정규화
    const normalized = parseAnyStrategy({ strategy: body.request.strategy });
    if (!normalized.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Strategy normalization failed',
            details: normalized.result.errors,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }
    body.request.strategy = normalized.data;
  }

  // Legacy 포맷 백테스트 요청 검증
  const validation = validateBacktestRequest(body.request);
  if (!validation.valid) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid backtest request',
          details: validation.errors,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }

  // 4. 기간 계산 및 할당량 확인
  const periodDays = calculatePeriodDays(body.request.dateRange);
  const quotaCheck = await checkQuota(client.clientId, client.tier, periodDays);

  if (!quotaCheck.allowed) {
    const messages: Record<string, string> = {
      MONTHLY_LIMIT_EXCEEDED: `Monthly backtest quota exceeded. Used: ${quotaCheck.quota.used}/${quotaCheck.quota.monthlyLimit}`,
      CONCURRENT_LIMIT_EXCEEDED: `Too many concurrent backtests. Running: ${quotaCheck.quota.currentRunning}/${quotaCheck.quota.concurrentLimit}`,
      PERIOD_LIMIT_EXCEEDED: `Period too long. Max: ${quotaCheck.quota.maxPeriodDays} days, requested: ${periodDays} days`,
    };

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'QUOTA_EXCEEDED',
          message: messages[quotaCheck.reason!] || 'Quota exceeded',
          quota: quotaCheck.quota,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 429 }
    );
  }

  // 5. 작업 생성
  const job = await createJob(client.clientId, body.request, body.priority);

  // 6. 할당량 사용량 증가
  await incrementQuotaUsage(client.clientId);

  // 7. QStash에 작업 발행
  const payload: QStashBacktestPayload = {
    jobId: job.id,
    clientId: client.clientId,
    request: body.request,
  };

  try {
    const qstashResponse = await qstash.publishJSON({
      url: WORKER_URL,
      body: payload,
      retries: 3,
      delay: 0,
    });

    // QStash 메시지 ID 저장 (옵션)
    console.log(`[Backtest] Job ${job.id} published to QStash: ${qstashResponse.messageId}`);
  } catch (qstashError) {
    console.error('[Backtest] Failed to publish to QStash:', qstashError);
    // QStash 실패해도 작업은 생성됨 - 수동 처리 가능
  }

  // 8. 큐 위치 조회
  const queuePosition = await getQueuePosition(job.id, client.clientId);

  // 9. 응답 생성
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://api.racelab.kr';
  const response: CreateBacktestJobResponse = {
    jobId: job.id,
    status: job.status,
    estimatedDuration: job.estimatedDuration ?? 30,
    queuePosition,
    statusUrl: `${baseUrl}/api/v1/backtest/${job.id}`,
    resultUrl: `${baseUrl}/api/v1/backtest/${job.id}/result`,
  };

  return NextResponse.json(
    {
      success: true,
      data: response,
      quota: {
        remaining: quotaCheck.quota.remaining,
        monthlyLimit: quotaCheck.quota.monthlyLimit,
        resetAt: quotaCheck.quota.resetAt,
      },
      timestamp: new Date().toISOString(),
    },
    { status: 202 }
  );
}

export const POST = withB2BAuth(handler);

/**
 * GET /api/v1/backtest
 *
 * List client's backtest jobs
 */
async function listHandler(request: B2BRequest) {
  const client = request.b2bClient!;

  // 백테스트 접근 권한 확인
  if (!hasBacktestAccess(client.tier)) {
    return createFeatureDeniedResponse('Backtest', 'Gold');
  }

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100);
  const status = url.searchParams.get('status');

  const { getClientJobs } = await import('@/lib/backtest/jobManager');
  const { jobs, total } = await getClientJobs(client.clientId, {
    limit,
    offset: (page - 1) * limit,
    status: status ? [status as 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'] : undefined,
  });

  return NextResponse.json({
    success: true,
    data: {
      jobs: jobs.map((job) => ({
        jobId: job.id,
        status: job.status,
        strategyName: job.request.strategy.name,
        dateRange: job.request.dateRange,
        progress: job.progress,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
    timestamp: new Date().toISOString(),
  });
}

export const GET = withB2BAuth(listHandler);
