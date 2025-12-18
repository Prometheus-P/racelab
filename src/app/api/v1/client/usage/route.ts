/**
 * B2B Client Usage Statistics Endpoint
 *
 * GET /api/v1/client/usage
 *
 * Returns authenticated client's API usage statistics.
 *
 * Query Parameters:
 * - days: Number of days to look back (default: 30, max: 90)
 */

import { NextResponse } from 'next/server';
import {
  withB2BAuth,
  type B2BRequest,
} from '@/lib/api-helpers/apiAuth';
import { getClientUsageStats } from '@/lib/db/queries/clients';

export const dynamic = 'force-dynamic';

async function handler(request: B2BRequest) {
  const client = request.b2bClient!;

  // Parse query parameters
  const url = new URL(request.url);
  const daysParam = url.searchParams.get('days');
  const days = Math.min(Math.max(parseInt(daysParam ?? '30', 10) || 30, 1), 90);

  try {
    const stats = await getClientUsageStats(client.dbId, days);

    return NextResponse.json({
      success: true,
      data: {
        period: {
          days,
          startDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          endDate: new Date().toISOString().slice(0, 10),
        },
        summary: {
          totalRequests: stats.totalRequests,
          successfulRequests: stats.successfulRequests,
          errorRequests: stats.errorRequests,
          successRate: stats.totalRequests > 0
            ? ((stats.successfulRequests / stats.totalRequests) * 100).toFixed(2) + '%'
            : '0%',
          avgResponseTimeMs: stats.avgResponseTimeMs,
          totalDataTransferBytes: stats.totalResponseBytes,
        },
        byEndpoint: stats.requestsByEndpoint,
        byDay: stats.requestsByDay,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[B2B Usage] Failed to fetch usage stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to retrieve usage statistics',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export const GET = withB2BAuth(handler);
