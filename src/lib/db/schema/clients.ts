/**
 * B2B Client Schema
 *
 * Manages B2B API customers with tiered pricing and rate limiting.
 */

import {
  pgTable,
  varchar,
  timestamp,
  pgEnum,
  serial,
  integer,
  text,
  index,
} from 'drizzle-orm/pg-core';

// Enum definitions
export const clientTierEnum = pgEnum('client_tier', ['Bronze', 'Silver', 'Gold']);
export const clientStatusEnum = pgEnum('client_status', ['active', 'suspended', 'expired']);

/**
 * B2B Clients Table
 *
 * Stores API customer information with tier-based access control.
 */
export const clients = pgTable(
  'clients',
  {
    id: serial('id').primaryKey(),
    clientId: varchar('client_id', { length: 50 }).notNull().unique(),
    name: varchar('name', { length: 100 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    apiKeyHash: varchar('api_key_hash', { length: 128 }).notNull(),
    apiKeyPrefix: varchar('api_key_prefix', { length: 8 }).notNull(),
    tier: clientTierEnum('tier').notNull().default('Bronze'),
    status: clientStatusEnum('status').notNull().default('active'),
    rateLimitOverride: integer('rate_limit_override'),
    metadata: text('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    expiresAt: timestamp('expires_at'),
  },
  (table) => [
    index('idx_clients_api_key_prefix').on(table.apiKeyPrefix),
    index('idx_clients_status').on(table.status),
    index('idx_clients_tier').on(table.tier),
  ]
);

/**
 * API Usage Table
 *
 * Tracks API usage for billing and analytics.
 * Designed as TimescaleDB hypertable for efficient time-series queries.
 */
export const apiUsage = pgTable(
  'api_usage',
  {
    id: serial('id').primaryKey(),
    clientId: integer('client_id')
      .references(() => clients.id)
      .notNull(),
    endpoint: varchar('endpoint', { length: 255 }).notNull(),
    method: varchar('method', { length: 10 }).notNull(),
    statusCode: integer('status_code').notNull(),
    responseTimeMs: integer('response_time_ms'),
    requestSizeBytes: integer('request_size_bytes'),
    responseSizeBytes: integer('response_size_bytes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('idx_api_usage_client_time').on(table.clientId, table.createdAt)]
);

// Type exports
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type ClientTier = 'Bronze' | 'Silver' | 'Gold';
export type ClientStatus = 'active' | 'suspended' | 'expired';

export type ApiUsage = typeof apiUsage.$inferSelect;
export type NewApiUsage = typeof apiUsage.$inferInsert;

/**
 * Tier configuration for rate limiting and feature access
 */
export interface TierConfig {
  requestsPerMinute: number; // -1 = unlimited
  allowCsv: boolean;
  allowStreaming: boolean;
  realTimeIntervalSeconds: number; // 0 = unlimited, higher = less frequent
}

export const TIER_CONFIGS: Record<ClientTier, TierConfig> = {
  Bronze: {
    requestsPerMinute: 10,
    allowCsv: false,
    allowStreaming: false,
    realTimeIntervalSeconds: 300, // 5 minutes
  },
  Silver: {
    requestsPerMinute: 60,
    allowCsv: true,
    allowStreaming: true,
    realTimeIntervalSeconds: 30,
  },
  Gold: {
    requestsPerMinute: -1, // unlimited
    allowCsv: true,
    allowStreaming: true,
    realTimeIntervalSeconds: 0, // no restriction
  },
};
