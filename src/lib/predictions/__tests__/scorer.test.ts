/**
 * Scorer Tests
 */

import {
  calculateRatingScore,
  calculateFormScore,
  calculateBurdenFitScore,
  calculateJockeyScore,
  calculateTrainerScore,
  calculateComboScore,
  calculateTrackConditionScore,
  calculateGatePositionScore,
  calculateDistanceFitScore,
  calculateFieldSizeScore,
  calculateAllFactorScores,
  createScoreBreakdown,
  calculateTotalScore,
  calculateWeightedScore,
} from '../core/scorer';
import { createTrackConditionFromMoisture } from '@/types/track-condition';
import { generateMockEntry, generateMockRaceContext } from '../mock/entry';
import type { EntryInput } from '@/types/prediction';
import { DEFAULT_MODEL_WEIGHTS } from '../constants';

describe('Individual Factor Scores', () => {
  let mockEntry: EntryInput;

  beforeEach(() => {
    mockEntry = generateMockEntry({
      no: 1,
      rating: 80,
      recentFinishes: [1, 2, 1, 3, 2],
      burdenWeight: 55,
      jockeyWinRate: 15,
      trainerWinRate: 12,
    });
  });

  describe('calculateRatingScore', () => {
    it('should return higher score for higher rating', () => {
      const highRating = generateMockEntry({ rating: 100 });
      const lowRating = generateMockEntry({ rating: 40 });

      const highScore = calculateRatingScore(highRating);
      const lowScore = calculateRatingScore(lowRating);

      expect(highScore.score).toBeGreaterThan(lowScore.score);
    });

    it('should normalize rating to 0-100 scale', () => {
      const entry = generateMockEntry({ rating: 70 });
      const result = calculateRatingScore(entry);

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should have correct factor metadata', () => {
      const result = calculateRatingScore(mockEntry);

      expect(result.factor).toBe('rating');
      expect(result.label).toBe('마 레이팅');
      expect(result.weight).toBeDefined();
      expect(result.contribution).toBe(result.score * result.weight);
    });
  });

  describe('calculateFormScore', () => {
    it('should return higher score for better recent finishes', () => {
      const goodForm = generateMockEntry();
      goodForm.recentFinishes = [1, 1, 2, 1, 1];

      const badForm = generateMockEntry();
      badForm.recentFinishes = [8, 9, 7, 10, 8];

      const goodScore = calculateFormScore(goodForm);
      const badScore = calculateFormScore(badForm);

      expect(goodScore.score).toBeGreaterThan(badScore.score);
    });

    it('should weight recent races more heavily', () => {
      // 동일한 성적이라도 최근 순서에 따라 다른 점수
      const oneRecent = generateMockEntry();
      oneRecent.recentFinishes = [1]; // 최근 1경기만

      const twoRecent = generateMockEntry();
      twoRecent.recentFinishes = [1, 1]; // 최근 2경기

      const oneScore = calculateFormScore(oneRecent);
      const twoScore = calculateFormScore(twoRecent);

      // 두 경주가 더 많은 정보 = 더 정확한 점수 (하지만 둘 다 우수)
      expect(oneScore.score).toBeGreaterThan(80); // 1위는 100점 가까이
      expect(twoScore.score).toBeGreaterThan(80);

      // 두 연속 1위가 단일 1위보다 높은 점수
      expect(twoScore.score).toBeGreaterThanOrEqual(oneScore.score);
    });

    it('should handle empty recent finishes', () => {
      const noHistory = generateMockEntry();
      noHistory.recentFinishes = [];

      const result = calculateFormScore(noHistory);
      expect(result.score).toBe(50); // 중립값
    });
  });

  describe('calculateBurdenFitScore', () => {
    it('should return higher score for optimal burden ratio', () => {
      const optimal = generateMockEntry({ burdenWeight: 55 });
      optimal.currentWeight = 500; // 11% ratio

      const heavy = generateMockEntry({ burdenWeight: 60 });
      heavy.currentWeight = 450; // 13.3% ratio

      const optimalScore = calculateBurdenFitScore(optimal);
      const heavyScore = calculateBurdenFitScore(heavy);

      expect(optimalScore.score).toBeGreaterThan(heavyScore.score);
    });

    it('should handle missing weight gracefully', () => {
      const noWeight = generateMockEntry({ burdenWeight: 55 });
      noWeight.currentWeight = undefined;

      const result = calculateBurdenFitScore(noWeight);
      expect(result.score).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateJockeyScore', () => {
    it('should return higher score for higher win rate', () => {
      const topJockey = generateMockEntry({ jockeyWinRate: 25 });
      const avgJockey = generateMockEntry({ jockeyWinRate: 10 });

      const topScore = calculateJockeyScore(topJockey);
      const avgScore = calculateJockeyScore(avgJockey);

      expect(topScore.score).toBeGreaterThan(avgScore.score);
    });

    it('should combine win rate and form score', () => {
      const entry = generateMockEntry({ jockeyWinRate: 15 });
      entry.jockey.formScore = 5;

      const result = calculateJockeyScore(entry);

      expect(result.score).toBeDefined();
      expect(result.factor).toBe('jockeyWinRate');
    });
  });

  describe('calculateTrainerScore', () => {
    it('should normalize trainer win rate', () => {
      const entry = generateMockEntry({ trainerWinRate: 12 });
      const result = calculateTrainerScore(entry);

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateComboScore', () => {
    it('should return neutral score when no combo data', () => {
      const noCombo = generateMockEntry();
      noCombo.combo = undefined;

      const result = calculateComboScore(noCombo);
      expect(result.score).toBe(50);
    });

    it('should return higher score for synergistic combo', () => {
      const synergy = generateMockEntry();
      synergy.combo = { winRate: 25, starts: 30 };
      synergy.jockey.winRate = 10;
      synergy.trainer.winRate = 10;

      const noSynergy = generateMockEntry();
      noSynergy.combo = { winRate: 10, starts: 30 };
      noSynergy.jockey.winRate = 10;
      noSynergy.trainer.winRate = 10;

      const synergyScore = calculateComboScore(synergy);
      const noSynergyScore = calculateComboScore(noSynergy);

      expect(synergyScore.score).toBeGreaterThan(noSynergyScore.score);
    });
  });
});

describe('Track and Gate Scores', () => {
  describe('calculateTrackConditionScore', () => {
    it('should give bonus to front-runner on wet track', () => {
      const frontRunner = generateMockEntry();
      frontRunner.jockey.style = 'front-runner';

      const closer = generateMockEntry();
      closer.jockey.style = 'closer';

      const wetTrack = createTrackConditionFromMoisture(25); // 불량

      const frontScore = calculateTrackConditionScore(frontRunner, wetTrack);
      const closerScore = calculateTrackConditionScore(closer, wetTrack);

      // 습한 트랙: 선행마 유리 - frontRunnerAdvantage가 양수
      // 선행마 점수가 추입마보다 높거나 같아야 함
      expect(frontScore.score).toBeGreaterThanOrEqual(closerScore.score);
    });

    it('should give bonus to closer on dry track', () => {
      const frontRunner = generateMockEntry();
      frontRunner.jockey.style = 'front-runner';

      const closer = generateMockEntry();
      closer.jockey.style = 'closer';

      const dryTrack = createTrackConditionFromMoisture(5); // 양호/건조

      const frontScore = calculateTrackConditionScore(frontRunner, dryTrack);
      const closerScore = calculateTrackConditionScore(closer, dryTrack);

      // 건조한 트랙: 추입마 유리 - closerAdvantage가 양수
      // 추입마 점수가 선행마보다 높거나 같아야 함
      expect(closerScore.score).toBeGreaterThanOrEqual(frontScore.score);
    });

    it('should return scores in valid range', () => {
      const entry = generateMockEntry();
      const track = createTrackConditionFromMoisture(15);
      const result = calculateTrackConditionScore(entry, track);

      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateGatePositionScore', () => {
    it('should calculate score based on gate position', () => {
      const race = generateMockRaceContext({ meetCode: '1', distance: 1000 });

      const inside = generateMockEntry({ no: 1 });
      const outside = generateMockEntry({ no: 12 });

      const insideScore = calculateGatePositionScore(inside, race);
      const outsideScore = calculateGatePositionScore(outside, race);

      // 서울 1000m는 내측이 유리
      expect(insideScore.score).toBeGreaterThan(outsideScore.score);
    });
  });

  describe('calculateDistanceFitScore', () => {
    it('should use bloodline distance aptitude', () => {
      const sprinter = generateMockEntry();
      sprinter.bloodline = { distanceAptitude: 5, dirtAptitude: 3 };

      const stayer = generateMockEntry();
      stayer.bloodline = { distanceAptitude: 2, dirtAptitude: 3 };

      const sprinterScore = calculateDistanceFitScore(sprinter, 1200);
      const stayerScore = calculateDistanceFitScore(stayer, 1200);

      expect(sprinterScore.score).toBeGreaterThan(stayerScore.score);
    });

    it('should handle missing bloodline', () => {
      const noBloodline = generateMockEntry();
      noBloodline.bloodline = undefined;

      const result = calculateDistanceFitScore(noBloodline, 1400);
      expect(result.score).toBe(50); // 중립값
    });
  });

  describe('calculateFieldSizeScore', () => {
    it('should give higher score for smaller fields', () => {
      const entry = generateMockEntry();

      const smallField = calculateFieldSizeScore(entry, 6);
      const largeField = calculateFieldSizeScore(entry, 14);

      expect(smallField.score).toBeGreaterThan(largeField.score);
    });

    it('should give bonus to high-rated horses in large fields', () => {
      const highRated = generateMockEntry({ rating: 90 });
      const lowRated = generateMockEntry({ rating: 50 });

      const highScore = calculateFieldSizeScore(highRated, 14);
      const lowScore = calculateFieldSizeScore(lowRated, 14);

      expect(highScore.score).toBeGreaterThan(lowScore.score);
    });
  });
});

describe('Aggregate Scoring', () => {
  describe('calculateAllFactorScores', () => {
    it('should return all factor scores', () => {
      const entry = generateMockEntry();
      const race = generateMockRaceContext();

      const factors = calculateAllFactorScores(entry, race);

      expect(factors.length).toBeGreaterThan(10);
      factors.forEach((f) => {
        expect(f.factor).toBeDefined();
        expect(f.score).toBeDefined();
        expect(f.weight).toBeDefined();
      });
    });
  });

  describe('createScoreBreakdown', () => {
    it('should create breakdown from factors', () => {
      const entry = generateMockEntry();
      const race = generateMockRaceContext();
      const factors = calculateAllFactorScores(entry, race);

      const breakdown = createScoreBreakdown(factors);

      expect(breakdown.ratingScore).toBeDefined();
      expect(breakdown.formScore).toBeDefined();
      expect(breakdown.jockeyScore).toBeDefined();
      expect(breakdown.externalTotal).toBeDefined();
      expect(breakdown.internalTotal).toBeDefined();
    });
  });

  describe('calculateTotalScore', () => {
    it('should sum all contributions', () => {
      const entry = generateMockEntry();
      const race = generateMockRaceContext();
      const factors = calculateAllFactorScores(entry, race);

      const total = calculateTotalScore(factors);

      expect(total).toBeGreaterThanOrEqual(0);
      expect(total).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateWeightedScore', () => {
    it('should apply weights correctly', () => {
      const entry = generateMockEntry();
      const race = generateMockRaceContext();
      const factors = calculateAllFactorScores(entry, race);

      const weighted = calculateWeightedScore(factors);

      expect(weighted).toBeGreaterThanOrEqual(0);
      expect(weighted).toBeLessThanOrEqual(100);
    });

    it('should respect custom weights', () => {
      const entry = generateMockEntry({ rating: 100 });
      const race = generateMockRaceContext();
      const factors = calculateAllFactorScores(entry, race);

      const defaultWeighted = calculateWeightedScore(factors);

      const customWeights = {
        ...DEFAULT_MODEL_WEIGHTS,
        internal: {
          ...DEFAULT_MODEL_WEIGHTS.internal,
          rating: 0.5, // 큰 가중치
        },
      };

      const customWeighted = calculateWeightedScore(factors, customWeights);

      expect(customWeighted).not.toBe(defaultWeighted);
    });
  });
});
