/**
 * Prediction Engine Module
 *
 * 경마 예측 시스템의 Public API
 *
 * @example
 * ```typescript
 * import { predictRace, PredictionEngine } from '@/lib/predictions';
 *
 * // 간편 예측
 * const result = predictRace({ race, entries });
 *
 * // 커스텀 가중치 사용
 * const engine = new PredictionEngine(customWeights);
 * const result = engine.predictRace({ race, entries });
 * ```
 */

// =============================================================================
// Core Prediction Engine
// =============================================================================

export {
  // Main Engine
  PredictionEngine,
  predictRace,
  quickPrediction,
  getDefaultEngine,
  type PredictionOptions,
} from './core/predictor';

// =============================================================================
// Scoring & Probability
// =============================================================================

export {
  // Factor Scoring
  calculateAllFactorScores,
  createScoreBreakdown,
  calculateTotalScore,
  calculateWeightedScore,
  calculateTrackConditionScore,
  calculateGatePositionScore,
  calculateRatingScore,
  calculateFormScore,
  calculateJockeyScore,
  calculateTrainerScore,
  calculateComboScore,
} from './core/scorer';

export {
  // Probability
  softmax,
  calculateWinProbabilities,
  calculatePlaceProbability,
  calculateExpectedPosition,
  calculateImpliedProbability,
  calculateKellyFraction,
  analyzeValue,
  type ValueAnalysisResult,

  // Confidence
  calculateDataCompleteness,
  calculateOverallConfidence,
  getConfidenceLevel,
} from './core/probability';

export {
  // Normalization
  minMaxNormalize,
  zScoreNormalize,
  normalizeByField,
  normalizeWinRate,
  normalizeRating,
  normalizeBurdenFit,
  normalizeRecentForm,
  normalizeRestDays,
  normalizeComboSynergy,
  normalizeWithinRace,
  calculateMean,
  calculateStdDev,
} from './core/normalizer';

// =============================================================================
// Constants
// =============================================================================

export {
  DEFAULT_MODEL_WEIGHTS,
  SOFTMAX_TEMPERATURE,
  DATA_COMPLETENESS_THRESHOLDS,
  SAMPLE_SIZE_THRESHOLDS,
  RECOMMENDATION_THRESHOLDS,
  VALUE_THRESHOLDS,
  DISTANCE_CATEGORIES,
  getDistanceCategory,
  SEX_CODES,
  SEX_NAMES,
  FORM_WEIGHTS,
  POSITION_SCORES,
  getPositionScore,
  MODEL_VERSION,
} from './constants';

// =============================================================================
// Adapters
// =============================================================================

export {
  adaptKraRace,
  createRaceId,
  getSurfaceByMeet,
  getDefaultBurden,
  type KraRaceData,
  type KraHorseData,
  type KraRelatedData,
} from './adapters/kraAdapter';

// =============================================================================
// Mock Data
// =============================================================================

export {
  generateMockTrackCondition,
  generateBatchTrackConditions,
  createExtremeConditions,
  type WeatherData,
  type TrackConditionOptions,
} from './mock/trackCondition';

export {
  generateMockEntry,
  generateMockEntries,
  generateMockRaceContext,
  createStrongFavorite,
  createLongshot,
  createMidPack,
  createFullFieldScenario,
  createSmallFieldScenario,
  type MockEntryOptions,
  type MockRaceOptions,
} from './mock/entry';
