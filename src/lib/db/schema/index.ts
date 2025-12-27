/**
 * Database Schema Index
 * Exports all schema tables and types for Drizzle ORM
 */

// Table schemas
export { tracks, type Track, type NewTrack } from './tracks';
export { races, type Race, type NewRace } from './races';
export { entries, type Entry, type NewEntry } from './entries';
export { oddsSnapshots, type OddsSnapshot, type NewOddsSnapshot } from './oddsSnapshots';
export { results, type Result, type NewResult } from './results';
export { ingestionFailures, type IngestionFailure, type NewIngestionFailure } from './ingestionFailures';
export {
  clients,
  apiUsage,
  clientTierEnum,
  clientStatusEnum,
  TIER_CONFIGS,
  type Client,
  type NewClient,
  type ClientTier,
  type ClientStatus,
  type ApiUsage,
  type NewApiUsage,
  type TierConfig,
} from './clients';

// Auth schemas (NextAuth.js)
export {
  users,
  accounts,
  sessions,
  verificationTokens,
  type User,
  type NewUser,
  type Account,
  type Session,
} from './auth';
