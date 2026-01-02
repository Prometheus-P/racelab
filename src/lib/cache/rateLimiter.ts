/**
 * Upstash Redis Rate Limiter
 *
 * Implements sliding window rate limiting using Redis for B2B API.
 * Supports tier-based rate limits with atomic operations.
 * Includes circuit breaker for graceful degradation on Redis failures.
 */

import { getRedisClient } from './redisClient';
import type { ClientTier, TierConfig } from '@/lib/db/schema';
import { TIER_CONFIGS } from '@/lib/db/schema';
import {
  isCircuitAllowed,
  recordSuccess,
  recordFailure,
  getCircuitInfo,
} from './circuitBreaker';
import { safeError, safeWarn, safeInfo } from '@/lib/utils/safeLogger';

/** Redis circuit breaker 이름 */
const REDIS_CIRCUIT = 'redis-rate-limiter';

/**
 * Rate limit check result
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetIn: number; // seconds until reset
}

/**
 * In-memory fallback store (DEVELOPMENT ONLY - not safe for production)
 * In production, Redis is required for distributed rate limiting
 */
const memoryStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Check if we're in production environment
 */
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Rate limit window in seconds
 */
const WINDOW_SECONDS = 60;

/**
 * Client info cache TTL in seconds
 */
const CLIENT_CACHE_TTL = 300; // 5 minutes

/**
 * Lua script for atomic sliding window rate limiting
 *
 * KEYS[1] = rate limit key
 * ARGV[1] = window size in seconds
 * ARGV[2] = max requests
 * ARGV[3] = current timestamp
 *
 * Returns: [allowed (0/1), remaining, resetIn]
 */
const RATE_LIMIT_SCRIPT = `
local key = KEYS[1]
local window = tonumber(ARGV[1])
local max_requests = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

-- Remove old entries outside the window
local window_start = now - window
redis.call('ZREMRANGEBYSCORE', key, '-inf', window_start)

-- Count current requests in window
local current = redis.call('ZCARD', key)

if current < max_requests then
  -- Add new request
  redis.call('ZADD', key, now, now .. ':' .. math.random())
  redis.call('EXPIRE', key, window)
  return {1, max_requests - current - 1, window}
else
  -- Rate limited
  local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
  local reset_in = window
  if oldest[2] then
    reset_in = math.ceil(tonumber(oldest[2]) + window - now)
  end
  return {0, 0, reset_in}
end
`;

/**
 * Check rate limit for a client using Redis
 *
 * @param clientId - Client UUID
 * @param tier - Client tier
 * @param tierConfig - Optional tier configuration override
 * @returns Rate limit result
 */
export async function checkRateLimit(
  clientId: string,
  tier: ClientTier,
  tierConfig?: TierConfig
): Promise<RateLimitResult> {
  const config = tierConfig ?? TIER_CONFIGS[tier];

  // Unlimited tier
  if (config.requestsPerMinute === -1) {
    return {
      allowed: true,
      remaining: -1, // Indicates unlimited
      limit: -1,
      resetIn: 0,
    };
  }

  // Circuit breaker check - if Redis is failing too often, allow requests through
  if (!isCircuitAllowed(REDIS_CIRCUIT)) {
    const circuitInfo = getCircuitInfo(REDIS_CIRCUIT);
    safeWarn('[RateLimiter] Circuit OPEN - allowing request without rate limit check', {
      failures: circuitInfo.failures,
      timeSinceLastFailure: circuitInfo.timeSinceLastFailure,
    });
    // Graceful degradation: allow request when Redis is unavailable
    return {
      allowed: true,
      remaining: config.requestsPerMinute,
      limit: config.requestsPerMinute,
      resetIn: WINDOW_SECONDS,
    };
  }

  const redis = await getRedisClient();

  // Redis client unavailable
  if (!redis) {
    if (isProduction) {
      recordFailure(REDIS_CIRCUIT);
      safeError('[RateLimiter] Redis unavailable - graceful degradation active');
      // Graceful degradation: allow request when Redis is unavailable
      return {
        allowed: true,
        remaining: config.requestsPerMinute,
        limit: config.requestsPerMinute,
        resetIn: WINDOW_SECONDS,
      };
    }
    // Development only: fallback to in-memory
    safeWarn('[RateLimiter] DEV: Using in-memory fallback (not safe for production)');
    return checkRateLimitMemory(clientId, config.requestsPerMinute);
  }

  try {
    const key = `ratelimit:v1:${clientId}`;
    const now = Math.floor(Date.now() / 1000);

    const result = (await redis.eval(RATE_LIMIT_SCRIPT, 1, key, WINDOW_SECONDS, config.requestsPerMinute, now)) as [
      number,
      number,
      number
    ];

    // Success - record for circuit breaker
    recordSuccess(REDIS_CIRCUIT);

    return {
      allowed: result[0] === 1,
      remaining: result[1],
      limit: config.requestsPerMinute,
      resetIn: result[2],
    };
  } catch (error) {
    recordFailure(REDIS_CIRCUIT);
    safeError('[RateLimiter] Redis error:', error);

    // Graceful degradation: allow request when Redis errors occur
    // Circuit breaker will prevent repeated failures from overwhelming the system
    if (isProduction) {
      safeInfo('[RateLimiter] Graceful degradation - allowing request');
      return {
        allowed: true,
        remaining: config.requestsPerMinute,
        limit: config.requestsPerMinute,
        resetIn: WINDOW_SECONDS,
      };
    }
    // Development only: fallback to in-memory
    return checkRateLimitMemory(clientId, config.requestsPerMinute);
  }
}

/**
 * In-memory rate limit fallback (DEVELOPMENT ONLY)
 * WARNING: Not safe for production - requests are not distributed across instances
 */
function checkRateLimitMemory(clientId: string, maxRequests: number): RateLimitResult {
  const now = Date.now();
  const windowMs = WINDOW_SECONDS * 1000;
  const record = memoryStore.get(clientId);

  if (!record || now > record.resetTime) {
    // New window
    memoryStore.set(clientId, { count: 1, resetTime: now + windowMs });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      limit: maxRequests,
      resetIn: WINDOW_SECONDS,
    };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      limit: maxRequests,
      resetIn: Math.ceil((record.resetTime - now) / 1000),
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    limit: maxRequests,
    resetIn: Math.ceil((record.resetTime - now) / 1000),
  };
}

/**
 * Cache client info in Redis
 *
 * @param clientId - Client UUID
 * @param data - Client data to cache
 */
export async function cacheClientInfo(
  clientId: string,
  data: { tier: ClientTier; dbId: number; status: string }
): Promise<void> {
  const redis = await getRedisClient();
  if (!redis) return;

  try {
    const key = `client:info:${clientId}`;
    await redis.setex(key, CLIENT_CACHE_TTL, JSON.stringify(data));
  } catch (error) {
    safeError('[RateLimiter] Failed to cache client info:', error);
  }
}

/**
 * Get cached client info from Redis
 *
 * @param clientId - Client UUID
 * @returns Cached client data or null
 */
export async function getCachedClientInfo(
  clientId: string
): Promise<{ tier: ClientTier; dbId: number; status: string } | null> {
  const redis = await getRedisClient();
  if (!redis) return null;

  try {
    const key = `client:info:${clientId}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    safeError('[RateLimiter] Failed to get cached client info:', error);
    return null;
  }
}

/**
 * Clear client info cache (call when client data changes)
 *
 * @param clientId - Client UUID
 */
export async function clearClientCache(clientId: string): Promise<void> {
  const redis = await getRedisClient();
  if (!redis) return;

  try {
    await redis.del(`client:info:${clientId}`);
  } catch (error) {
    safeError('[RateLimiter] Failed to clear client cache:', error);
  }
}

/**
 * Get current rate limit status without incrementing
 *
 * @param clientId - Client UUID
 * @param tier - Client tier
 * @returns Current rate limit status
 */
export async function getRateLimitStatus(clientId: string, tier: ClientTier): Promise<RateLimitResult> {
  const config = TIER_CONFIGS[tier];

  if (config.requestsPerMinute === -1) {
    return {
      allowed: true,
      remaining: -1,
      limit: -1,
      resetIn: 0,
    };
  }

  const redis = await getRedisClient();
  if (!redis) {
    const record = memoryStore.get(clientId);
    if (!record) {
      return {
        allowed: true,
        remaining: config.requestsPerMinute,
        limit: config.requestsPerMinute,
        resetIn: WINDOW_SECONDS,
      };
    }

    const now = Date.now();
    if (now > record.resetTime) {
      return {
        allowed: true,
        remaining: config.requestsPerMinute,
        limit: config.requestsPerMinute,
        resetIn: WINDOW_SECONDS,
      };
    }

    return {
      allowed: record.count < config.requestsPerMinute,
      remaining: Math.max(0, config.requestsPerMinute - record.count),
      limit: config.requestsPerMinute,
      resetIn: Math.ceil((record.resetTime - now) / 1000),
    };
  }

  try {
    const key = `ratelimit:v1:${clientId}`;
    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - WINDOW_SECONDS;

    // Count requests in current window
    const count = await redis.zcount(key, windowStart, '+inf');
    const remaining = Math.max(0, config.requestsPerMinute - count);

    return {
      allowed: count < config.requestsPerMinute,
      remaining,
      limit: config.requestsPerMinute,
      resetIn: WINDOW_SECONDS,
    };
  } catch (error) {
    safeError('[RateLimiter] Failed to get rate limit status:', error);
    return {
      allowed: true,
      remaining: config.requestsPerMinute,
      limit: config.requestsPerMinute,
      resetIn: WINDOW_SECONDS,
    };
  }
}
