/**
 * B2B API Health Check Endpoint
 *
 * GET /api/v1/health
 *
 * Returns API health status and version information.
 * Does not require authentication.
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      status: 'healthy',
      version: 'v1',
      timestamp: new Date().toISOString(),
      service: 'racelab-b2b-api',
    },
    timestamp: new Date().toISOString(),
  });
}
