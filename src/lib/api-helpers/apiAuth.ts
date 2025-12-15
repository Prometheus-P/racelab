// src/lib/api-helpers/apiAuth.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * B2B API Authentication & Rate Limiting Middleware
 *
 * Validates customer API keys and enforces rate limits.
 * Used for all customer-facing /api/races/* endpoints.
 */

// Environment variables
const API_KEYS = process.env.B2B_API_KEYS?.split(',') || [];
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.API_RATE_LIMIT || '100', 10);

// In-memory rate limit store (replace with Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export interface ApiAuthResult {
  authenticated: boolean;
  apiKey?: string;
  error?: string;
  errorCode?: 'UNAUTHORIZED' | 'RATE_LIMITED' | 'INVALID_KEY';
}

/**
 * Extract API key from request headers
 * Supports: X-API-Key header or Authorization: Bearer token
 */
function extractApiKey(request: NextRequest): string | null {
  // Check X-API-Key header (preferred)
  const xApiKey = request.headers.get('x-api-key');
  if (xApiKey) return xApiKey;

  // Check Authorization Bearer token
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return null;
}

/**
 * Validate API key against allowed keys
 */
function validateApiKey(apiKey: string): boolean {
  // In development, allow any non-empty key or skip auth entirely
  if (process.env.NODE_ENV === 'development' && !API_KEYS.length) {
    return true;
  }
  return API_KEYS.includes(apiKey);
}

/**
 * Check rate limit for the given API key
 */
function checkRateLimit(apiKey: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitStore.get(apiKey);

  if (!record || now > record.resetTime) {
    // New window or expired - reset
    rateLimitStore.set(apiKey, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - record.count, resetIn: record.resetTime - now };
}

/**
 * Validates B2B API request authentication and rate limits
 */
export function validateApiAuth(request: NextRequest): ApiAuthResult {
  const apiKey = extractApiKey(request);

  if (!apiKey) {
    return {
      authenticated: false,
      error: 'API key required. Provide via X-API-Key header or Authorization: Bearer token',
      errorCode: 'UNAUTHORIZED',
    };
  }

  if (!validateApiKey(apiKey)) {
    return {
      authenticated: false,
      error: 'Invalid API key',
      errorCode: 'INVALID_KEY',
    };
  }

  const rateLimit = checkRateLimit(apiKey);
  if (!rateLimit.allowed) {
    return {
      authenticated: false,
      apiKey,
      error: `Rate limit exceeded. Try again in ${Math.ceil(rateLimit.resetIn / 1000)} seconds`,
      errorCode: 'RATE_LIMITED',
    };
  }

  return { authenticated: true, apiKey };
}

/**
 * Create error response for authentication failures
 */
export function createAuthErrorResponse(result: ApiAuthResult): NextResponse {
  const statusMap = {
    UNAUTHORIZED: 401,
    INVALID_KEY: 401,
    RATE_LIMITED: 429,
  };

  const status = result.errorCode ? statusMap[result.errorCode] : 401;

  const response = NextResponse.json(
    {
      success: false,
      error: {
        code: result.errorCode || 'UNAUTHORIZED',
        message: result.error || 'Authentication failed',
      },
      timestamp: new Date().toISOString(),
    },
    { status }
  );

  // Add rate limit headers for 429 responses
  if (result.errorCode === 'RATE_LIMITED') {
    response.headers.set('Retry-After', '60');
    response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT_MAX_REQUESTS));
    response.headers.set('X-RateLimit-Remaining', '0');
  }

  return response;
}

/**
 * Add rate limit headers to successful responses
 */
export function addRateLimitHeaders(response: NextResponse, apiKey: string): NextResponse {
  const record = rateLimitStore.get(apiKey);
  if (record) {
    response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT_MAX_REQUESTS));
    response.headers.set('X-RateLimit-Remaining', String(Math.max(0, RATE_LIMIT_MAX_REQUESTS - record.count)));
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(record.resetTime / 1000)));
  }
  return response;
}

/**
 * Higher-order function to wrap API route handlers with authentication
 *
 * @example
 * ```typescript
 * export const GET = withApiAuth(async (request) => {
 *   // Handler logic - only runs if authenticated
 * });
 * ```
 */
export function withApiAuth(
  handler: (request: NextRequest) => Promise<NextResponse>
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    const auth = validateApiAuth(request);

    if (!auth.authenticated) {
      return createAuthErrorResponse(auth);
    }

    const response = await handler(request);

    // Add rate limit headers to successful responses
    if (auth.apiKey) {
      addRateLimitHeaders(response, auth.apiKey);
    }

    return response;
  };
}

/**
 * Optional: Skip auth in development mode
 * Use this wrapper when you want auth to be optional during development
 */
export function withOptionalApiAuth(
  handler: (request: NextRequest) => Promise<NextResponse>
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    // Skip auth in development if no API keys configured
    if (process.env.NODE_ENV === 'development' && !API_KEYS.length) {
      return handler(request);
    }

    return withApiAuth(handler)(request);
  };
}

/**
 * Type for route handlers with params (Next.js App Router dynamic routes)
 */
type RouteContext<T = Record<string, string>> = { params: Promise<T> };

/**
 * Higher-order function for routes with params (e.g., /api/races/[type]/[id]/entries)
 *
 * @example
 * ```typescript
 * export const GET = withApiAuthParams(async (request, { params }) => {
 *   const { id } = await params;
 *   // Handler logic
 * });
 * ```
 */
export function withApiAuthParams<T = Record<string, string>>(
  handler: (request: NextRequest, context: RouteContext<T>) => Promise<NextResponse>
): (request: NextRequest, context: RouteContext<T>) => Promise<NextResponse> {
  return async (request: NextRequest, context: RouteContext<T>) => {
    // Skip auth in development if no API keys configured
    if (process.env.NODE_ENV === 'development' && !API_KEYS.length) {
      return handler(request, context);
    }

    const auth = validateApiAuth(request);

    if (!auth.authenticated) {
      return createAuthErrorResponse(auth);
    }

    const response = await handler(request, context);

    if (auth.apiKey) {
      addRateLimitHeaders(response, auth.apiKey);
    }

    return response;
  };
}
