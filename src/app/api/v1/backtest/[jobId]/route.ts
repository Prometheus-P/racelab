/**
 * B2B Backtest API - Job Status Endpoint
 *
 * GET /api/v1/backtest/[jobId]
 *
 * Returns current status of a backtest job.
 */

import { NextResponse } from 'next/server';
import {
  withB2BAuthParams,
  createFeatureDeniedResponse,
  type B2BRequest,
} from '@/lib/api-helpers/apiAuth';
import { getJob, updateJobStatus } from '@/lib/backtest/jobManager';
import { hasBacktestAccess } from '@/lib/db/schema/clients';
import type { GetJobStatusResponse } from '@/lib/backtest/types';
import { ESTIMATED_MS_PER_RACE } from '@/lib/backtest/types';

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ jobId: string }> };

async function handler(request: B2BRequest, { params }: RouteContext) {
  const client = request.b2bClient!;
  const { jobId } = await params;

  // 백테스트 접근 권한 확인
  if (!hasBacktestAccess(client.tier)) {
    return createFeatureDeniedResponse('Backtest', 'Gold');
  }

  // 작업 조회
  const job = await getJob(jobId);

  if (!job) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Backtest job not found: ${jobId}`,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 404 }
    );
  }

  // 권한 확인 (본인 작업만 조회 가능)
  if (job.clientId !== client.clientId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this job',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 403 }
    );
  }

  // 예상 남은 시간 계산
  let estimatedRemainingSeconds: number | undefined;
  if (job.status === 'running' && job.totalRaces && job.processedRaces) {
    const remaining = job.totalRaces - job.processedRaces;
    estimatedRemainingSeconds = Math.ceil((remaining * ESTIMATED_MS_PER_RACE) / 1000);
  }

  // 응답 생성
  const response: GetJobStatusResponse = {
    jobId: job.id,
    status: job.status,
    progress: job.progress,
    progressMessage: job.progressMessage,
    processed:
      job.processedRaces !== undefined && job.totalRaces !== undefined
        ? { races: job.processedRaces, total: job.totalRaces }
        : undefined,
    error:
      job.error
        ? { code: job.error.code, message: job.error.message }
        : undefined,
    estimatedRemainingSeconds,
    createdAt: job.createdAt,
    startedAt: job.startedAt,
    completedAt: job.completedAt,
  };

  return NextResponse.json({
    success: true,
    data: response,
    timestamp: new Date().toISOString(),
  });
}

export const GET = withB2BAuthParams<{ jobId: string }>(handler);

/**
 * DELETE /api/v1/backtest/[jobId]
 *
 * Cancel a pending or running backtest job.
 */
async function deleteHandler(request: B2BRequest, { params }: RouteContext) {
  const client = request.b2bClient!;
  const { jobId } = await params;

  // 백테스트 접근 권한 확인
  if (!hasBacktestAccess(client.tier)) {
    return createFeatureDeniedResponse('Backtest', 'Gold');
  }

  // 작업 조회
  const job = await getJob(jobId);

  if (!job) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Backtest job not found: ${jobId}`,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 404 }
    );
  }

  // 권한 확인
  if (job.clientId !== client.clientId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have access to this job',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 403 }
    );
  }

  // 이미 완료된 작업은 취소 불가
  if (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: `Cannot cancel job with status: ${job.status}`,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }

  // 작업 취소
  const updatedJob = await updateJobStatus(jobId, 'cancelled', {
    error: {
      code: 'CANCELLED',
      message: 'Job cancelled by user',
      retryable: false,
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      jobId,
      status: updatedJob?.status ?? 'cancelled',
      message: 'Job has been cancelled',
    },
    timestamp: new Date().toISOString(),
  });
}

export const DELETE = withB2BAuthParams<{ jobId: string }>(deleteHandler);
