/**
 * Upstash Redis Rate Limiter
 *
 * Implements sliding window rate limiting using Redis for B2B API.
 * Supports tier-based rate limits with atomic operations.
 */

import { getRedisClient } from './redisClient';
import type { ClientTier, TierConfig } from '@/lib/db/schema';
import { TIER_CONFIGS } from '@/lib/db/schema';

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
 * In-memory fallback store (used when Redis is unavailable)
 */
const memoryStore = new Map<string, { count: number; resetTime: number }>();

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

  const redis = await getRedisClient();

  // Fallback to memory if Redis unavailable
  if (!redis) {
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

    return {
      allowed: result[0] === 1,
      remaining: result[1],
      limit: config.requestsPerMinute,
      resetIn: result[2],
    };
  } catch (error) {
    console.error('[RateLimiter] Redis error, falling back to memory:', error);
    return checkRateLimitMemory(clientId, config.requestsPerMinute);
  }
}

/**
 * In-memory rate limit fallback
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
    console.error('[RateLimiter] Failed to cache client info:', error);
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
    console.error('[RateLimiter] Failed to get cached client info:', error);
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
    console.error('[RateLimiter] Failed to clear client cache:', error);
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
    console.error('[RateLimiter] Failed to get rate limit status:', error);
    return {
      allowed: true,
      remaining: config.requestsPerMinute,
      limit: config.requestsPerMinute,
      resetIn: WINDOW_SECONDS,
    };
  }
}
