import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Ingestion API Authentication Middleware
 *
 * Validates requests to internal ingestion endpoints using API key
 * or Vercel Cron secret for scheduled jobs.
 */

const INGESTION_API_KEY = process.env.INGESTION_API_KEY;
const CRON_SECRET = process.env.CRON_SECRET;

/**
 * Timing-safe string comparison to prevent timing attacks
 *
 * Uses crypto.timingSafeEqual which runs in constant time regardless
 * of where the strings differ, preventing attackers from inferring
 * secret values by measuring response times.
 *
 * @param a - First string to compare
 * @param b - Second string to compare
 * @returns true if strings are equal, false otherwise
 */
function timingSafeCompare(a: string, b: string): boolean {
  // If lengths differ, we still need to do constant-time comparison
  // to avoid leaking length information
  if (a.length !== b.length) {
    // Compare against a dummy value to maintain constant time
    const dummy = Buffer.from(a);
    crypto.timingSafeEqual(dummy, dummy);
    return false;
  }

  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return crypto.timingSafeEqual(bufA, bufB);
}

export interface AuthResult {
  authenticated: boolean;
  source: 'api_key' | 'cron_secret' | null;
  error?: string;
}

/**
 * Validates ingestion API request authentication
 *
 * Supports two authentication methods:
 * 1. X-Ingestion-Key header for manual/programmatic triggers
 * 2. Authorization: Bearer header for Vercel Cron jobs
 *
 * @param request - The incoming Next.js request
 * @returns Authentication result with source information
 */
export function validateIngestionAuth(request: NextRequest): AuthResult {
  // Check for API key in X-Ingestion-Key header
  const apiKey = request.headers.get('x-ingestion-key');
  if (apiKey && INGESTION_API_KEY && timingSafeCompare(apiKey, INGESTION_API_KEY)) {
    return { authenticated: true, source: 'api_key' };
  }

  // Check for Vercel Cron secret in Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && CRON_SECRET) {
    const expectedAuth = `Bearer ${CRON_SECRET}`;
    if (timingSafeCompare(authHeader, expectedAuth)) {
      return { authenticated: true, source: 'cron_secret' };
    }
  }

  return {
    authenticated: false,
    source: null,
    error: 'Invalid or missing authentication',
  };
}

/**
 * Helper function to create unauthorized response
 */
export function unauthorizedResponse(): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or missing API key',
      },
      timestamp: new Date().toISOString(),
    },
    { status: 401 }
  );
}

/**
 * Higher-order function to wrap API route handlers with authentication
 *
 * @example
 * ```typescript
 * export const POST = withIngestionAuth(async (request) => {
 *   // Handler logic - only runs if authenticated
 * });
 * ```
 */
export function withIngestionAuth(
  handler: (request: NextRequest) => Promise<NextResponse>
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    const auth = validateIngestionAuth(request);

    if (!auth.authenticated) {
      return unauthorizedResponse();
    }

    return handler(request);
  };
}
