/**
 * Database Queries Index
 *
 * Central export for all database query functions.
 */

// Race queries
export {
  getRacesByDate,
  getRaceById,
  getRaceWithEntries,
  getRacesByTrack,
  getRacesWithTrack,
  getUpcomingRaces,
  getRaceCountsByStatus,
} from './races';

// Entry queries
export {
  getEntriesByRace,
  getEntryById,
  getEntriesForRaces,
  getEntryStats,
  getEntriesByJockey,
  getEntriesByName,
  getEntryCountsByType,
} from './entries';

// Odds queries
export {
  getOddsHistory,
  getOddsSummary,
  getLatestOdds,
  getOddsTimeSeries,
  getOddsDrift,
  getSnapshotCount,
  getOddsHistoryStream,
  getOddsTimeSeriesStream,
  getOddsExportData,
} from './odds';

// Result queries
export {
  getResultsByRace,
  getResultsWithEntries,
  getHorseWinRate,
  getJockeyStats,
  getTrainerStats,
  getDividends,
  getResultsByDateRange,
  getTopPerformers,
} from './results';

// Client queries
export {
  hashApiKey,
  getApiKeyPrefix,
  getClientByApiKeyPrefix,
  validateClientApiKey,
  getClientById,
  getClientTierConfig,
  isClientActive,
  logApiUsage,
  getClientUsageStats,
  createClient,
  updateClientStatus,
  updateClientTier,
} from './clients';

// Re-export types
export type { OddsHistoryOptions, StreamingOddsOptions } from './odds';
export type { GetRacesOptions } from './races';
export type { UsageStats } from './clients';
