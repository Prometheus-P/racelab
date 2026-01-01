/**
 * Probability Calculator Tests
 */

import {
  softmax,
  calculateWinProbabilities,
  calculatePlaceProbability,
  calculateExpectedPosition,
  calculateImpliedProbability,
  calculateEdge,
  calculateKellyFraction,
  analyzeValue,
  calculateDataCompleteness,
  calculateOverallConfidence,
  getConfidenceLevel,
  rankByProbability,
} from '../core/probability';

describe('softmax', () => {
  it('should return empty array for empty input', () => {
    expect(softmax([])).toEqual([]);
  });

  it('should return probabilities that sum to 1', () => {
    const scores = [50, 60, 70, 80, 90];
    const probs = softmax(scores);

    const sum = probs.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 5);
  });

  it('should give higher probability to higher scores', () => {
    const scores = [30, 50, 70];
    const probs = softmax(scores);

    expect(probs[2]).toBeGreaterThan(probs[1]);
    expect(probs[1]).toBeGreaterThan(probs[0]);
  });

  it('should handle equal scores', () => {
    const scores = [50, 50, 50];
    const probs = softmax(scores);

    expect(probs[0]).toBeCloseTo(probs[1], 5);
    expect(probs[1]).toBeCloseTo(probs[2], 5);
    expect(probs[0]).toBeCloseTo(1 / 3, 5);
  });

  it('should be numerically stable with large differences', () => {
    const scores = [0, 100, 200];
    const probs = softmax(scores);

    expect(probs).toHaveLength(3);
    expect(probs.every((p) => p >= 0 && p <= 1)).toBe(true);
    expect(probs.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 5);
  });

  it('should apply temperature parameter', () => {
    const scores = [40, 60];

    const lowTemp = softmax(scores, 5); // 더 차이 큼
    const highTemp = softmax(scores, 50); // 더 균등

    // 낮은 온도 = 더 극단적 분포
    expect(Math.abs(lowTemp[0] - lowTemp[1])).toBeGreaterThan(
      Math.abs(highTemp[0] - highTemp[1])
    );
  });
});

describe('calculateWinProbabilities', () => {
  it('should return map of probabilities', () => {
    const entries = [
      { id: 1, score: 70 },
      { id: 2, score: 60 },
      { id: 3, score: 50 },
    ];

    const probs = calculateWinProbabilities(entries, (e) => e.score);

    expect(probs.size).toBe(3);
    expect(probs.get(entries[0])).toBeDefined();
    expect(probs.get(entries[0])!).toBeGreaterThan(probs.get(entries[2])!);
  });
});

describe('calculatePlaceProbability', () => {
  it('should be higher than win probability', () => {
    const winProb = 0.2;
    const placeProb = calculatePlaceProbability(winProb, 12);

    expect(placeProb).toBeGreaterThan(winProb);
  });

  it('should increase with smaller field size', () => {
    const winProb = 0.15;
    const smallField = calculatePlaceProbability(winProb, 6);
    const largeField = calculatePlaceProbability(winProb, 14);

    expect(smallField).toBeGreaterThan(largeField);
  });

  it('should not exceed 0.95', () => {
    const placeProb = calculatePlaceProbability(0.8, 4);
    expect(placeProb).toBeLessThanOrEqual(0.95);
  });
});

describe('calculateExpectedPosition', () => {
  it('should return 1 for probability 1', () => {
    const pos = calculateExpectedPosition(1, 12);
    expect(pos).toBe(1);
  });

  it('should return fieldSize for probability 0', () => {
    const pos = calculateExpectedPosition(0, 12);
    expect(pos).toBe(12);
  });

  it('should return mid-range for 0.5 probability', () => {
    const pos = calculateExpectedPosition(0.5, 12);
    expect(pos).toBeCloseTo(6.5, 1);
  });
});

describe('Value Analysis', () => {
  describe('calculateImpliedProbability', () => {
    it('should calculate correct implied probability', () => {
      expect(calculateImpliedProbability(2)).toBeCloseTo(0.5, 5);
      expect(calculateImpliedProbability(4)).toBeCloseTo(0.25, 5);
      expect(calculateImpliedProbability(10)).toBeCloseTo(0.1, 5);
    });

    it('should return 1 for odds <= 1', () => {
      expect(calculateImpliedProbability(1)).toBe(1);
      expect(calculateImpliedProbability(0.5)).toBe(1);
    });
  });

  describe('calculateEdge', () => {
    it('should return positive edge when model probability > implied', () => {
      const edge = calculateEdge(0.3, 0.2);
      expect(edge).toBeCloseTo(0.1, 5);
    });

    it('should return negative edge when model probability < implied', () => {
      const edge = calculateEdge(0.1, 0.25);
      expect(edge).toBeCloseTo(-0.15, 5);
    });
  });

  describe('calculateKellyFraction', () => {
    it('should return 0 for negative expected value', () => {
      const kelly = calculateKellyFraction(0.1, 5);
      // 10% chance at 5x odds = negative EV
      expect(kelly).toBe(0);
    });

    it('should return positive fraction for positive expected value', () => {
      const kelly = calculateKellyFraction(0.4, 3);
      // 40% chance at 3x odds = positive EV
      expect(kelly).toBeGreaterThan(0);
    });

    it('should cap at MAX_KELLY', () => {
      const kelly = calculateKellyFraction(0.9, 10);
      expect(kelly).toBeLessThanOrEqual(0.25);
    });
  });

  describe('analyzeValue', () => {
    it('should return complete value analysis', () => {
      const result = analyzeValue(0.25, 3);

      expect(result.impliedProbability).toBeDefined();
      expect(result.modelProbability).toBe(0.25);
      expect(result.edge).toBeDefined();
      expect(result.kellyFraction).toBeDefined();
      expect(result.isValue).toBeDefined();
    });

    it('should identify value bet when edge > threshold', () => {
      const valueResult = analyzeValue(0.4, 3); // 40% vs 33% implied
      expect(valueResult.isValue).toBe(true);
    });

    it('should not identify value when edge is negative', () => {
      const noValueResult = analyzeValue(0.2, 3); // 20% vs 33% implied
      expect(noValueResult.isValue).toBe(false);
    });
  });
});

describe('Confidence Calculation', () => {
  describe('calculateDataCompleteness', () => {
    it('should return 1 for fully complete data', () => {
      expect(calculateDataCompleteness(10, 10)).toBe(1);
    });

    it('should return 0.5 for half complete data', () => {
      expect(calculateDataCompleteness(5, 10)).toBe(0.5);
    });

    it('should return 1 for zero total fields', () => {
      expect(calculateDataCompleteness(0, 0)).toBe(1);
    });
  });

  describe('calculateOverallConfidence', () => {
    it('should combine data and prediction confidence', () => {
      const confidence = calculateOverallConfidence(0.8, 0.7);
      expect(confidence).toBeGreaterThan(0);
      expect(confidence).toBeLessThanOrEqual(1);
    });

    it('should weight data more heavily by default', () => {
      const highData = calculateOverallConfidence(0.9, 0.5);
      const highPred = calculateOverallConfidence(0.5, 0.9);

      expect(highData).toBeGreaterThan(highPred);
    });
  });

  describe('getConfidenceLevel', () => {
    it('should return high for confidence >= 0.7', () => {
      expect(getConfidenceLevel(0.8)).toBe('high');
      expect(getConfidenceLevel(0.7)).toBe('high');
    });

    it('should return medium for confidence >= 0.4', () => {
      expect(getConfidenceLevel(0.5)).toBe('medium');
      expect(getConfidenceLevel(0.4)).toBe('medium');
    });

    it('should return low for confidence < 0.4', () => {
      expect(getConfidenceLevel(0.3)).toBe('low');
      expect(getConfidenceLevel(0.1)).toBe('low');
    });
  });
});

describe('rankByProbability', () => {
  it('should rank entries by probability', () => {
    const entries = [
      { id: 'A', prob: 0.3 },
      { id: 'B', prob: 0.5 },
      { id: 'C', prob: 0.2 },
    ];

    const ranks = rankByProbability(entries, (e) => e.prob);

    expect(ranks.get(entries[1])).toBe(1); // B = highest
    expect(ranks.get(entries[0])).toBe(2); // A = second
    expect(ranks.get(entries[2])).toBe(3); // C = third
  });
});
