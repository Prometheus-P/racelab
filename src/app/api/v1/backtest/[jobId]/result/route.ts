/**
 * B2B Backtest API - Job Result Endpoint
 *
 * GET /api/v1/backtest/[jobId]/result
 *
 * Returns the result of a completed backtest job.
 */

import { NextResponse } from 'next/server';
import {
  withB2BAuthParams,
  createFeatureDeniedResponse,
  type B2BRequest,
} from '@/lib/api-helpers/apiAuth';
import { getJob, getResult } from '@/lib/backtest/jobManager';
import { hasBacktestAccess } from '@/lib/db/schema/clients';
import type { GetJobResultResponse } from '@/lib/backtest/types';

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

  // 완료되지 않은 작업
  if (job.status !== 'completed') {
    const response: GetJobResultResponse = {
      jobId: job.id,
      status: job.status,
    };

    // 진행 중인 경우 상태 정보 제공
    const statusInfo =
      job.status === 'pending'
        ? 'Job is waiting in queue'
        : job.status === 'running'
          ? `Job is processing (${job.progress}%)`
          : job.status === 'failed'
            ? `Job failed: ${job.error?.message || 'Unknown error'}`
            : 'Job was cancelled';

    return NextResponse.json(
      {
        success: true,
        data: response,
        message: statusInfo,
        timestamp: new Date().toISOString(),
      },
      { status: job.status === 'failed' || job.status === 'cancelled' ? 200 : 202 }
    );
  }

  // 결과 조회
  const result = await getResult(jobId);

  if (!result) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RESULT_EXPIRED',
          message: 'Result has expired or was not stored properly',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 410 }
    );
  }

  // 전체 결과 포함 여부 확인 (query param)
  const url = new URL(request.url);
  const includeFull = url.searchParams.get('full') === 'true';
  const includeBets = url.searchParams.get('bets') === 'true';
  const includeEquityCurve = url.searchParams.get('equity') === 'true';

  // 응답 생성
  const response: GetJobResultResponse = {
    jobId: job.id,
    status: job.status,
    summary: result.summary,
    expiresAt: result.expiresAt,
  };

  // 전체 결과 포함 (요청 시)
  if (includeFull && result.fullResult) {
    response.fullResult = result.fullResult;
  } else if (result.fullResult) {
    // 부분 데이터 포함
    if (includeBets) {
      response.fullResult = {
        ...response.fullResult!,
        request: result.fullResult.request,
        summary: result.fullResult.summary,
        bets: result.fullResult.bets,
        equityCurve: [],
        executedAt: result.fullResult.executedAt,
        executionTimeMs: result.fullResult.executionTimeMs,
      };
    }
    if (includeEquityCurve) {
      response.fullResult = {
        ...response.fullResult!,
        request: result.fullResult.request,
        summary: result.fullResult.summary,
        bets: response.fullResult?.bets ?? [],
        equityCurve: result.fullResult.equityCurve,
        executedAt: result.fullResult.executedAt,
        executionTimeMs: result.fullResult.executionTimeMs,
      };
    }
  }

  // 다운로드 URL 생성 (대용량 결과용 - 추후 구현)
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://api.racelab.kr';
  response.downloadUrl = `${baseUrl}/api/v1/backtest/${jobId}/result?full=true`;

  return NextResponse.json({
    success: true,
    data: response,
    timestamp: new Date().toISOString(),
  });
}

export const GET = withB2BAuthParams<{ jobId: string }>(handler);
