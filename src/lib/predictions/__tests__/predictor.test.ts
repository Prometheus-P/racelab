/**
 * Prediction Engine Tests
 */

import {
  PredictionEngine,
  predictRace,
  quickPrediction,
} from '../core/predictor';
import {
  generateMockRaceContext,
  createFullFieldScenario,
  createSmallFieldScenario,
  createStrongFavorite,
  createLongshot,
} from '../mock/entry';
import { DEFAULT_MODEL_WEIGHTS } from '../constants';

describe('PredictionEngine', () => {
  let engine: PredictionEngine;

  beforeEach(() => {
    engine = new PredictionEngine();
  });

  describe('predictRace', () => {
    it('should return predictions for all entries', () => {
      const { race, entries } = createFullFieldScenario();
      const result = engine.predictRace({ race, entries });

      expect(result.predictions).toHaveLength(entries.length);
      expect(result.raceId).toBe(race.raceId);
      expect(result.modelVersion).toBeDefined();
    });

    it('should assign win probabilities that sum to 1', () => {
      const { race, entries } = createFullFieldScenario();
      const result = engine.predictRace({ race, entries });

      const totalProb = result.predictions.reduce(
        (sum, p) => sum + p.winProbability,
        0
      );

      expect(totalProb).toBeCloseTo(1, 5);
    });

    it('should sort predictions by win probability (descending)', () => {
      const { race, entries } = createFullFieldScenario();
      const result = engine.predictRace({ race, entries });

      for (let i = 1; i < result.predictions.length; i++) {
        expect(result.predictions[i - 1].winProbability).toBeGreaterThanOrEqual(
          result.predictions[i].winProbability
        );
      }
    });

    it('should assign predicted ranks correctly', () => {
      const { race, entries } = createFullFieldScenario();
      const result = engine.predictRace({ race, entries });

      result.predictions.forEach((pred, idx) => {
        expect(pred.predictedRank).toBe(idx + 1);
      });
    });

    it('should give strong favorite higher probability than longshot', () => {
      const race = generateMockRaceContext({ fieldSize: 3 });
      const entries = [
        createStrongFavorite(1),
        createLongshot(2),
        createLongshot(3),
      ];

      const result = engine.predictRace({ race, entries });

      const favorite = result.predictions.find((p) => p.entryNo === 1);
      const longshot = result.predictions.find((p) => p.entryNo === 2);

      expect(favorite?.winProbability).toBeGreaterThan(
        longshot?.winProbability ?? 0
      );
    });

    it('should calculate place probability higher than win probability', () => {
      const { race, entries } = createSmallFieldScenario();
      const result = engine.predictRace({ race, entries });

      result.predictions.forEach((pred) => {
        expect(pred.placeProbability).toBeGreaterThanOrEqual(
          pred.winProbability
        );
      });
    });

    it('should include factor scores for each prediction', () => {
      const { race, entries } = createSmallFieldScenario();
      const result = engine.predictRace({ race, entries });

      result.predictions.forEach((pred) => {
        expect(pred.factors).toBeDefined();
        expect(pred.factors.length).toBeGreaterThan(0);
        expect(pred.scoreBreakdown).toBeDefined();
      });
    });

    it('should include recommendations', () => {
      const { race, entries } = createFullFieldScenario();
      const result = engine.predictRace({ race, entries });

      result.predictions.forEach((pred) => {
        expect(pred.recommendation).toBeDefined();
        expect(pred.recommendation.action).toBeDefined();
      });

      expect(result.recommendations).toBeDefined();
    });
  });

  describe('custom weights', () => {
    it('should use custom weights when provided', () => {
      const customWeights = {
        ...DEFAULT_MODEL_WEIGHTS,
        internal: {
          ...DEFAULT_MODEL_WEIGHTS.internal,
          rating: 0.5, // 레이팅 가중치 증가
        },
      };

      const customEngine = new PredictionEngine(customWeights);
      const { race, entries } = createSmallFieldScenario();

      const defaultResult = engine.predictRace({ race, entries });
      const customResult = customEngine.predictRace({ race, entries });

      // 결과가 달라야 함
      expect(
        defaultResult.predictions[0].winProbability
      ).not.toBeCloseTo(
        customResult.predictions[0].winProbability,
        3
      );
    });

    it('should allow weight updates via setWeights', () => {
      const { race, entries } = createSmallFieldScenario();
      const result1 = engine.predictRace({ race, entries });

      engine.setWeights({
        ...DEFAULT_MODEL_WEIGHTS,
        internal: {
          ...DEFAULT_MODEL_WEIGHTS.internal,
          rating: 0.4,
        },
      });

      const result2 = engine.predictRace({ race, entries });

      expect(result1.predictions[0].winProbability).not.toBeCloseTo(
        result2.predictions[0].winProbability,
        3
      );
    });

    it('should return current weights via getWeights', () => {
      const weights = engine.getWeights();
      expect(weights.internal.rating).toBe(DEFAULT_MODEL_WEIGHTS.internal.rating);
    });
  });

  describe('confidence calculation', () => {
    it('should calculate confidence when includeConfidence is true', () => {
      const { race, entries } = createSmallFieldScenario();
      const result = engine.predictRace({ race, entries }, { includeConfidence: true });

      result.predictions.forEach((pred) => {
        expect(pred.confidence).toBeGreaterThan(0);
        expect(pred.confidence).toBeLessThanOrEqual(1);
        expect(pred.confidenceLevel).toBeDefined();
      });
    });
  });

  describe('value analysis', () => {
    it('should include value analysis when odds are provided', () => {
      const { race, entries } = createFullFieldScenario();
      const result = engine.predictRace({ race, entries });

      // 배당이 있는 엔트리만 value analysis 포함
      result.predictions.forEach((pred) => {
        if (pred.valueAnalysis) {
          expect(pred.valueAnalysis.impliedProbability).toBeDefined();
          expect(pred.valueAnalysis.edge).toBeDefined();
          expect(pred.valueAnalysis.kellyFraction).toBeDefined();
        }
      });
    });
  });
});

describe('predictRace (convenience function)', () => {
  it('should work without creating engine instance', () => {
    const { race, entries } = createSmallFieldScenario();
    const result = predictRace({ race, entries });

    expect(result.predictions).toHaveLength(entries.length);
    expect(result.raceId).toBe(race.raceId);
  });
});

describe('quickPrediction', () => {
  it('should return simplified prediction results', () => {
    const { race, entries } = createSmallFieldScenario();
    const result = quickPrediction(entries, race);

    expect(result).toHaveLength(entries.length);
    result.forEach((r) => {
      expect(r.entryNo).toBeDefined();
      expect(r.winProbability).toBeDefined();
      expect(r.winProbability).toBeGreaterThan(0);
      expect(r.winProbability).toBeLessThan(1);
    });
  });

  it('should sum probabilities to 1', () => {
    const { race, entries } = createFullFieldScenario();
    const result = quickPrediction(entries, race);

    const total = result.reduce((sum, r) => sum + r.winProbability, 0);
    expect(total).toBeCloseTo(1, 5);
  });
});
