/**
 * B2B Client Info Endpoint
 *
 * GET /api/v1/client/info
 *
 * Returns authenticated client's tier information and permissions.
 */

import { NextResponse } from 'next/server';
import {
  withB2BAuth,
  type B2BRequest,
} from '@/lib/api-helpers/apiAuth';
import { TIER_CONFIGS } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

async function handler(request: B2BRequest) {
  const client = request.b2bClient!;

  const tierConfig = TIER_CONFIGS[client.tier];

  return NextResponse.json({
    success: true,
    data: {
      clientId: client.clientId,
      tier: client.tier,
      permissions: {
        csv: client.permissions.allowCsv,
        streaming: client.permissions.allowStreaming,
        realTimeIntervalSeconds: client.permissions.realTimeInterval,
      },
      rateLimit: {
        limit: tierConfig.requestsPerMinute === -1 ? 'unlimited' : tierConfig.requestsPerMinute,
        remaining: client.rateLimitRemaining === -1 ? 'unlimited' : client.rateLimitRemaining,
        resetInSeconds: client.rateLimitReset,
      },
      features: {
        oddsHistory: true,
        raceSchedules: true,
        entriesData: true,
        csvExport: client.permissions.allowCsv,
        streamingExport: client.permissions.allowStreaming,
      },
    },
    timestamp: new Date().toISOString(),
  });
}

export const GET = withB2BAuth(handler);
