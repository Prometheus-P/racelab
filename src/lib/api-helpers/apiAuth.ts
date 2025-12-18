// src/lib/api-helpers/apiAuth.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  validateClientApiKey,
  getClientTierConfig,
  isClientActive,
  logApiUsage,
  hashApiKey,
  getApiKeyPrefix,
} from '@/lib/db/queries/clients';
import {
  checkRateLimit as checkRedisRateLimit,
  cacheClientInfo,
  getCachedClientInfo,
} from '@/lib/cache/rateLimiter';
import type { Client, ClientTier, TierConfig } from '@/lib/db/schema';

/**
 * B2B API Authentication & Rate Limiting Middleware
 *
 * Validates customer API keys and enforces rate limits.
 * Supports both legacy simple key validation and new tier-based B2B auth.
 */

// Environment variables for legacy support
const LEGACY_API_KEYS = process.env.B2B_API_KEYS?.split(',') || [];
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.API_RATE_LIMIT || '100', 10);

// In-memory rate limit store (fallback for legacy auth)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export interface ApiAuthResult {
  authenticated: boolean;
  apiKey?: string;
  error?: string;
  errorCode?: 'UNAUTHORIZED' | 'RATE_LIMITED' | 'INVALID_KEY' | 'FORBIDDEN' | 'EXPIRED';
}

/**
 * Authenticated client context for B2B routes
 */
export interface AuthenticatedClient {
  clientId: string;
  dbId: number;
  tier: ClientTier;
  permissions: {
    allowCsv: boolean;
    allowStreaming: boolean;
    realTimeInterval: number;
  };
  rateLimitRemaining: number;
  rateLimitReset: number;
}

/**
 * Extended auth result for B2B routes
 */
export interface B2BAuthResult extends ApiAuthResult {
  client?: AuthenticatedClient;
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
 * Validate API key against allowed keys (legacy support)
 */
function validateApiKey(apiKey: string): boolean {
  // In development, allow any non-empty key or skip auth entirely
  if (process.env.NODE_ENV === 'development' && !LEGACY_API_KEYS.length) {
    return true;
  }
  return LEGACY_API_KEYS.includes(apiKey);
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
  const statusMap: Record<string, number> = {
    UNAUTHORIZED: 401,
    INVALID_KEY: 401,
    RATE_LIMITED: 429,
    FORBIDDEN: 403,
    EXPIRED: 403,
  };

  const status = result.errorCode ? statusMap[result.errorCode] ?? 401 : 401;

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
    if (process.env.NODE_ENV === 'development' && !LEGACY_API_KEYS.length) {
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
    if (process.env.NODE_ENV === 'development' && !LEGACY_API_KEYS.length) {
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

// ====================================================
// B2B API Authentication (Tier-based with Redis)
// ====================================================

/**
 * Request with B2B client context attached
 */
export interface B2BRequest extends NextRequest {
  b2bClient?: AuthenticatedClient;
}

/**
 * Validates B2B API request with database lookup and Redis rate limiting
 *
 * @param request - Incoming request
 * @returns B2B auth result with client context
 */
export async function validateB2BAuth(request: NextRequest): Promise<B2BAuthResult> {
  const apiKey = extractApiKey(request);

  if (!apiKey) {
    return {
      authenticated: false,
      error: 'API key required. Provide via X-API-Key header or Authorization: Bearer token',
      errorCode: 'UNAUTHORIZED',
    };
  }

  // Try to get cached client info first
  const prefix = getApiKeyPrefix(apiKey);
  let cachedInfo = await getCachedClientInfo(prefix);

  let client: Client | null = null;
  let tierConfig: TierConfig | null = null;

  if (cachedInfo) {
    // Verify the full key hash even with cached info
    client = await validateClientApiKey(apiKey);
    if (!client) {
      return {
        authenticated: false,
        error: 'Invalid API key',
        errorCode: 'INVALID_KEY',
      };
    }
    tierConfig = getClientTierConfig(client);
  } else {
    // Full database lookup
    client = await validateClientApiKey(apiKey);

    if (!client) {
      return {
        authenticated: false,
        error: 'Invalid API key',
        errorCode: 'INVALID_KEY',
      };
    }

    tierConfig = getClientTierConfig(client);

    // Cache client info for future requests
    await cacheClientInfo(prefix, {
      tier: client.tier as ClientTier,
      dbId: client.id,
      status: client.status,
    });
  }

  // Check client status
  if (!isClientActive(client)) {
    if (client.status === 'expired' || (client.expiresAt && new Date(client.expiresAt) < new Date())) {
      return {
        authenticated: false,
        apiKey,
        error: 'API key has expired. Please renew your subscription.',
        errorCode: 'EXPIRED',
      };
    }
    return {
      authenticated: false,
      apiKey,
      error: 'API key is suspended. Contact support for assistance.',
      errorCode: 'FORBIDDEN',
    };
  }

  // Check rate limit using Redis
  const rateLimit = await checkRedisRateLimit(client.clientId, client.tier as ClientTier, tierConfig);

  if (!rateLimit.allowed) {
    return {
      authenticated: false,
      apiKey,
      error: `Rate limit exceeded. Try again in ${rateLimit.resetIn} seconds`,
      errorCode: 'RATE_LIMITED',
    };
  }

  // Build authenticated client context
  const authenticatedClient: AuthenticatedClient = {
    clientId: client.clientId,
    dbId: client.id,
    tier: client.tier as ClientTier,
    permissions: {
      allowCsv: tierConfig.allowCsv,
      allowStreaming: tierConfig.allowStreaming,
      realTimeInterval: tierConfig.realTimeIntervalSeconds,
    },
    rateLimitRemaining: rateLimit.remaining,
    rateLimitReset: rateLimit.resetIn,
  };

  return {
    authenticated: true,
    apiKey,
    client: authenticatedClient,
  };
}

/**
 * Create error response for B2B auth failures
 */
export function createB2BAuthErrorResponse(result: B2BAuthResult): NextResponse {
  const statusMap: Record<string, number> = {
    UNAUTHORIZED: 401,
    INVALID_KEY: 401,
    RATE_LIMITED: 429,
    FORBIDDEN: 403,
    EXPIRED: 403,
  };

  const status = result.errorCode ? statusMap[result.errorCode] ?? 401 : 401;

  const response = NextResponse.json(
    {
      success: false,
      error: {
        code: result.errorCode ?? 'UNAUTHORIZED',
        message: result.error ?? 'Authentication failed',
      },
      timestamp: new Date().toISOString(),
    },
    { status }
  );

  if (result.errorCode === 'RATE_LIMITED') {
    response.headers.set('Retry-After', '60');
  }

  return response;
}

/**
 * Add B2B rate limit headers to response
 */
export function addB2BRateLimitHeaders(
  response: NextResponse,
  client: AuthenticatedClient
): NextResponse {
  if (client.rateLimitRemaining === -1) {
    // Unlimited tier
    response.headers.set('X-RateLimit-Limit', 'unlimited');
    response.headers.set('X-RateLimit-Remaining', 'unlimited');
  } else {
    const limit = client.tier === 'Bronze' ? 10 : client.tier === 'Silver' ? 60 : -1;
    response.headers.set('X-RateLimit-Limit', String(limit));
    response.headers.set('X-RateLimit-Remaining', String(client.rateLimitRemaining));
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(Date.now() / 1000) + client.rateLimitReset));
  }
  response.headers.set('X-Client-Tier', client.tier);
  return response;
}

/**
 * Higher-order function for B2B API route handlers
 *
 * @example
 * ```typescript
 * export const GET = withB2BAuth(async (request) => {
 *   const client = (request as B2BRequest).b2bClient!;
 *   // Handler logic with client context
 * });
 * ```
 */
export function withB2BAuth(
  handler: (request: B2BRequest) => Promise<NextResponse>
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    const startTime = Date.now();
    const auth = await validateB2BAuth(request);

    if (!auth.authenticated || !auth.client) {
      return createB2BAuthErrorResponse(auth);
    }

    // Attach client to request
    const b2bRequest = request as B2BRequest;
    b2bRequest.b2bClient = auth.client;

    const response = await handler(b2bRequest);

    // Add rate limit headers
    addB2BRateLimitHeaders(response, auth.client);

    // Log usage asynchronously (don't block response)
    const responseTime = Date.now() - startTime;
    logApiUsage({
      clientId: auth.client.dbId,
      endpoint: new URL(request.url).pathname,
      method: request.method,
      statusCode: response.status,
      responseTimeMs: responseTime,
    }).catch((err) => console.error('[B2B] Failed to log usage:', err));

    return response;
  };
}

/**
 * Higher-order function for B2B routes with params
 *
 * @example
 * ```typescript
 * export const GET = withB2BAuthParams(async (request, { params }) => {
 *   const { raceId } = await params;
 *   const client = (request as B2BRequest).b2bClient!;
 *   // Handler logic
 * });
 * ```
 */
export function withB2BAuthParams<T = Record<string, string>>(
  handler: (request: B2BRequest, context: RouteContext<T>) => Promise<Response>
): (request: NextRequest, context: RouteContext<T>) => Promise<Response> {
  return async (request: NextRequest, context: RouteContext<T>) => {
    const startTime = Date.now();
    const auth = await validateB2BAuth(request);

    if (!auth.authenticated || !auth.client) {
      return createB2BAuthErrorResponse(auth);
    }

    // Attach client to request
    const b2bRequest = request as B2BRequest;
    b2bRequest.b2bClient = auth.client;

    const response = await handler(b2bRequest, context);

    // Add rate limit headers if response supports it
    if (response instanceof NextResponse) {
      addB2BRateLimitHeaders(response, auth.client);
    }

    // Log usage asynchronously
    const responseTime = Date.now() - startTime;
    logApiUsage({
      clientId: auth.client.dbId,
      endpoint: new URL(request.url).pathname,
      method: request.method,
      statusCode: response.status,
      responseTimeMs: responseTime,
    }).catch((err) => console.error('[B2B] Failed to log usage:', err));

    return response;
  };
}

/**
 * Check if client has permission for a specific feature
 */
export function hasPermission(
  client: AuthenticatedClient,
  feature: 'csv' | 'streaming'
): boolean {
  switch (feature) {
    case 'csv':
      return client.permissions.allowCsv;
    case 'streaming':
      return client.permissions.allowStreaming;
    default:
      return false;
  }
}

/**
 * Create forbidden response for feature access denial
 */
export function createFeatureDeniedResponse(feature: string, requiredTier: string): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'FEATURE_DENIED',
        message: `${feature} requires ${requiredTier} tier or higher. Upgrade your subscription to access this feature.`,
      },
      timestamp: new Date().toISOString(),
    },
    { status: 403 }
  );
}
