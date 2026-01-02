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
