/**
 * Client Query Functions
 *
 * Database queries for B2B client management and usage tracking.
 */

import { db } from '@/lib/db/client';
import { clients, apiUsage, TIER_CONFIGS } from '@/lib/db/schema';
import { eq, and, gte, sql, desc } from 'drizzle-orm';
import type { Client, NewClient, ClientTier, TierConfig } from '@/lib/db/schema';
import { createHash } from 'crypto';

/**
 * Hash an API key using SHA-256
 */
export function hashApiKey(apiKey: string): string {
  return createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Extract prefix from API key (first 8 characters)
 */
export function getApiKeyPrefix(apiKey: string): string {
  return apiKey.slice(0, 8);
}

/**
 * Get client by API key prefix for initial lookup
 *
 * @param apiKeyPrefix - First 8 characters of the API key
 * @returns Client or null if not found
 */
export async function getClientByApiKeyPrefix(apiKeyPrefix: string): Promise<Client | null> {
  const result = await db
    .select()
    .from(clients)
    .where(eq(clients.apiKeyPrefix, apiKeyPrefix))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Validate client API key and return client if valid
 *
 * @param apiKey - Full API key to validate
 * @returns Client if valid, null otherwise
 */
export async function validateClientApiKey(apiKey: string): Promise<Client | null> {
  const prefix = getApiKeyPrefix(apiKey);
  const hash = hashApiKey(apiKey);

  const result = await db
    .select()
    .from(clients)
    .where(and(eq(clients.apiKeyPrefix, prefix), eq(clients.apiKeyHash, hash)))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Get client by ID
 *
 * @param clientId - Client UUID
 * @returns Client or null
 */
export async function getClientById(clientId: string): Promise<Client | null> {
  const result = await db.select().from(clients).where(eq(clients.clientId, clientId)).limit(1);

  return result[0] ?? null;
}

/**
 * Get tier configuration for a client
 *
 * @param client - Client object
 * @returns Tier configuration with optional overrides applied
 */
export function getClientTierConfig(client: Client): TierConfig {
  const baseConfig = TIER_CONFIGS[client.tier as ClientTier];

  // Apply rate limit override if set
  if (client.rateLimitOverride !== null && client.rateLimitOverride !== undefined) {
    return {
      ...baseConfig,
      requestsPerMinute: client.rateLimitOverride,
    };
  }

  return baseConfig;
}

/**
 * Check if client is active and not expired
 *
 * @param client - Client object
 * @returns true if client can access API
 */
export function isClientActive(client: Client): boolean {
  if (client.status !== 'active') {
    return false;
  }

  if (client.expiresAt && new Date(client.expiresAt) < new Date()) {
    return false;
  }

  return true;
}

/**
 * Log API usage for a client
 *
 * @param usage - Usage record to log
 */
export async function logApiUsage(usage: {
  clientId: number;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTimeMs?: number;
  requestSizeBytes?: number;
  responseSizeBytes?: number;
}): Promise<void> {
  await db.insert(apiUsage).values({
    clientId: usage.clientId,
    endpoint: usage.endpoint,
    method: usage.method,
    statusCode: usage.statusCode,
    responseTimeMs: usage.responseTimeMs ?? null,
    requestSizeBytes: usage.requestSizeBytes ?? null,
    responseSizeBytes: usage.responseSizeBytes ?? null,
  });
}

/**
 * Usage statistics interface
 */
export interface UsageStats {
  totalRequests: number;
  successfulRequests: number;
  errorRequests: number;
  avgResponseTimeMs: number;
  totalResponseBytes: number;
  requestsByEndpoint: Array<{ endpoint: string; count: number }>;
  requestsByDay: Array<{ day: string; count: number }>;
}

/**
 * Get usage statistics for a client
 *
 * @param clientDbId - Client database ID
 * @param days - Number of days to look back (default: 30)
 * @returns Usage statistics
 */
export async function getClientUsageStats(clientDbId: number, days: number = 30): Promise<UsageStats> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get overall stats
  const overallStats = await db
    .select({
      totalRequests: sql<number>`count(*)::int`,
      successfulRequests: sql<number>`count(case when status_code < 400 then 1 end)::int`,
      errorRequests: sql<number>`count(case when status_code >= 400 then 1 end)::int`,
      avgResponseTimeMs: sql<number>`coalesce(avg(response_time_ms), 0)::int`,
      totalResponseBytes: sql<number>`coalesce(sum(response_size_bytes), 0)::bigint`,
    })
    .from(apiUsage)
    .where(and(eq(apiUsage.clientId, clientDbId), gte(apiUsage.createdAt, startDate)));

  // Get requests by endpoint
  const byEndpoint = await db
    .select({
      endpoint: apiUsage.endpoint,
      count: sql<number>`count(*)::int`,
    })
    .from(apiUsage)
    .where(and(eq(apiUsage.clientId, clientDbId), gte(apiUsage.createdAt, startDate)))
    .groupBy(apiUsage.endpoint)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  // Get requests by day
  const byDay = await db
    .select({
      day: sql<string>`to_char(date_trunc('day', created_at), 'YYYY-MM-DD')`,
      count: sql<number>`count(*)::int`,
    })
    .from(apiUsage)
    .where(and(eq(apiUsage.clientId, clientDbId), gte(apiUsage.createdAt, startDate)))
    .groupBy(sql`date_trunc('day', created_at)`)
    .orderBy(sql`date_trunc('day', created_at)`);

  const stats = overallStats[0];

  return {
    totalRequests: stats?.totalRequests ?? 0,
    successfulRequests: stats?.successfulRequests ?? 0,
    errorRequests: stats?.errorRequests ?? 0,
    avgResponseTimeMs: stats?.avgResponseTimeMs ?? 0,
    totalResponseBytes: Number(stats?.totalResponseBytes ?? 0),
    requestsByEndpoint: byEndpoint,
    requestsByDay: byDay,
  };
}

/**
 * Create a new client
 *
 * @param client - Client data
 * @returns Created client
 */
export async function createClient(client: NewClient): Promise<Client> {
  const result = await db.insert(clients).values(client).returning();
  return result[0];
}

/**
 * Update client status
 *
 * @param clientId - Client UUID
 * @param status - New status
 */
export async function updateClientStatus(
  clientId: string,
  status: 'active' | 'suspended' | 'expired'
): Promise<void> {
  await db.update(clients).set({ status }).where(eq(clients.clientId, clientId));
}

/**
 * Update client tier
 *
 * @param clientId - Client UUID
 * @param tier - New tier
 */
export async function updateClientTier(clientId: string, tier: ClientTier): Promise<void> {
  await db.update(clients).set({ tier }).where(eq(clients.clientId, clientId));
}
