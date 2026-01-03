/**
 * Prediction Cache Module
 */

export {
  // Cache operations
  getCachedPrediction,
  cachePrediction,
  invalidatePrediction,
  invalidateDatePredictions,
  getOrCreatePrediction,

  // Key helpers
  createPredictionCacheKey,
  createDateCachePattern,

  // Constants
  PREDICTION_CACHE_TTL,
  PREDICTION_CACHE_NAMESPACE,

  // Types
  type CachedPrediction,
  type PredictionCacheStats,
} from './predictionCache';

export {
  // Horse data cache
  getCachedHorseData,
  cacheHorseData,
  getCachedHorseInfo,
  cacheHorseInfo,
  getCachedHistory,
  cacheHistory,

  // Adaptive batching
  getCurrentBatchSize,
  recordResponseTime,
  resetBatchSize,
  getBatchMetrics,

  // Constants
  HORSE_CACHE_TTL,
  BATCH_CONFIG,

  // Types
  type HorseData,
  type CachedHorseData,
  type BatchMetrics,
} from './horseDataCache';
