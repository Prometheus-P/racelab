/**
 * Bloodline Analysis Tests
 */

import {
  analyzeBloodline,
  getSireStats,
  calculateDistanceFitScore,
  calculateSurfaceFitScore,
  getDistanceCategory,
  getBloodlineForPrediction,
  DISTANCE_CATEGORIES,
  BLOODLINE_WEIGHTS,
  FAMOUS_SIRES,
} from '../bloodlineAnalysis';

describe('Bloodline Analysis Core', () => {
  describe('analyzeBloodline', () => {
    it('should analyze known sire', () => {
      const result = analyzeBloodline('TestHorse', '에이피인디');

      expect(result.horseName).toBe('TestHorse');
      expect(result.sire).toBe('에이피인디');
      expect(result.sireStats).toBeDefined();
      expect(result.distanceAptitude).toBeDefined();
      expect(result.dirtAptitude).toBeDefined();
    });

    it('should combine sire and grandsire aptitudes', () => {
      const result = analyzeBloodline('TestHorse', '에이피인디', undefined, '타핏');

      // 부마 70% + 외조부 30%
      expect(result.reliability).toBe('high');
      expect(result.reasoning.length).toBeGreaterThan(0);
    });

    it('should calculate turf aptitude as inverse of dirt', () => {
      const result = analyzeBloodline('TestHorse', '블루치퍼');

      // 블루치퍼: dirtAptitude = 5
      expect(result.dirtAptitude).toBe(5);
      expect(result.turfAptitude).toBe(1); // 6 - 5 = 1
    });

    it('should handle unknown sire with defaults', () => {
      const result = analyzeBloodline('TestHorse', '알수없는씨수마');

      expect(result.distanceAptitude).toBe(3);
      expect(result.dirtAptitude).toBe(3);
      expect(result.reliability).toBe('low');
    });

    it('should handle no bloodline info', () => {
      const result = analyzeBloodline('TestHorse');

      expect(result.distanceAptitude).toBe(3);
      expect(result.optimalDistance).toBe(1600);
      // 기본값이 적용되어도 적성 정보는 표시됨
      expect(result.reasoning.length).toBeGreaterThan(0);
      expect(result.reliability).toBe('low');
    });
  });

  describe('getSireStats', () => {
    it('should return known sire stats', () => {
      const stats = getSireStats('에이피인디');

      expect(stats).toBeDefined();
      expect(stats!.name).toBe('에이피인디');
      expect(stats!.distanceAptitude).toBe(FAMOUS_SIRES['에이피인디']!.distanceAptitude);
    });

    it('should return default stats for unknown sire', () => {
      const stats = getSireStats('UnknownSire');

      expect(stats).toBeDefined();
      expect(stats!.distanceAptitude).toBe(3);
      expect(stats!.optimalDistance).toBe(1600);
    });
  });
});

describe('Distance Aptitude', () => {
  describe('getDistanceCategory', () => {
    it('should classify sprint distances', () => {
      expect(getDistanceCategory(1000)).toBe('sprint');
      expect(getDistanceCategory(1200)).toBe('sprint');
    });

    it('should classify mile distances', () => {
      expect(getDistanceCategory(1400)).toBe('mile');
      expect(getDistanceCategory(1600)).toBe('mile');
    });

    it('should classify middle distances', () => {
      expect(getDistanceCategory(1800)).toBe('middle');
      expect(getDistanceCategory(2000)).toBe('middle');
    });

    it('should classify long distances', () => {
      expect(getDistanceCategory(2200)).toBe('long');
      expect(getDistanceCategory(3000)).toBe('long');
    });
  });

  describe('calculateDistanceFitScore', () => {
    it('should score sprinter high at sprint distance', () => {
      const score = calculateDistanceFitScore(1, 1000); // aptitude 1 = sprinter

      expect(score).toBe(100);
    });

    it('should score stayer high at long distance', () => {
      const score = calculateDistanceFitScore(5, 2400); // aptitude 5 = stayer

      expect(score).toBe(100);
    });

    it('should score middle-distance horse high at middle', () => {
      const score = calculateDistanceFitScore(3, 1800); // aptitude 3 = middle

      expect(score).toBe(100);
    });

    it('should penalize mismatch', () => {
      const sprinterLong = calculateDistanceFitScore(1, 2400);
      const stayerSprint = calculateDistanceFitScore(5, 1000);

      expect(sprinterLong).toBeLessThan(20);
      expect(stayerSprint).toBeLessThan(20);
    });
  });
});

describe('Surface Aptitude', () => {
  describe('calculateSurfaceFitScore', () => {
    it('should score high dirt aptitude on dirt', () => {
      const score = calculateSurfaceFitScore(5, 'dirt');

      expect(score).toBe(100);
    });

    it('should score low dirt aptitude on turf', () => {
      const score = calculateSurfaceFitScore(1, 'turf');

      expect(score).toBe(100);
    });

    it('should penalize mismatch', () => {
      const dirtOnTurf = calculateSurfaceFitScore(5, 'turf');
      const turfOnDirt = calculateSurfaceFitScore(1, 'dirt');

      expect(dirtOnTurf).toBe(0);
      expect(turfOnDirt).toBe(0);
    });

    it('should score neutral aptitude moderately', () => {
      const score = calculateSurfaceFitScore(3, 'dirt');

      expect(score).toBe(50);
    });
  });
});

describe('Bloodline Weights', () => {
  it('should have sire weight at 70%', () => {
    expect(BLOODLINE_WEIGHTS.sire).toBe(0.7);
  });

  it('should have grandsire weight at 30%', () => {
    expect(BLOODLINE_WEIGHTS.grandsire).toBe(0.3);
  });

  it('should sum to 100%', () => {
    expect(BLOODLINE_WEIGHTS.sire + BLOODLINE_WEIGHTS.grandsire).toBe(1);
  });
});

describe('Distance Categories', () => {
  it('should have correct sprint range', () => {
    expect(DISTANCE_CATEGORIES.sprint.max).toBe(1200);
  });

  it('should have correct mile range', () => {
    expect(DISTANCE_CATEGORIES.mile.min).toBe(1201);
    expect(DISTANCE_CATEGORIES.mile.max).toBe(1600);
  });

  it('should have correct middle range', () => {
    expect(DISTANCE_CATEGORIES.middle.min).toBe(1601);
    expect(DISTANCE_CATEGORIES.middle.max).toBe(2000);
  });

  it('should have correct long range', () => {
    expect(DISTANCE_CATEGORIES.long.min).toBe(2001);
  });
});

describe('Famous Sires', () => {
  it('should include key Korean sires', () => {
    expect(FAMOUS_SIRES['에이피인디']).toBeDefined();
    expect(FAMOUS_SIRES['타핏']).toBeDefined();
    expect(FAMOUS_SIRES['블루치퍼']).toBeDefined();
  });

  it('should have valid aptitude scores', () => {
    Object.values(FAMOUS_SIRES).forEach((sire) => {
      if (sire.distanceAptitude) {
        expect(sire.distanceAptitude).toBeGreaterThanOrEqual(1);
        expect(sire.distanceAptitude).toBeLessThanOrEqual(5);
      }
      if (sire.dirtAptitude) {
        expect(sire.dirtAptitude).toBeGreaterThanOrEqual(1);
        expect(sire.dirtAptitude).toBeLessThanOrEqual(5);
      }
    });
  });
});

describe('Prediction Integration', () => {
  describe('getBloodlineForPrediction', () => {
    it('should return aptitudes for known sire', () => {
      const result = getBloodlineForPrediction('에이피인디');

      expect(result.sire).toBe('에이피인디');
      expect(result.distanceAptitude).toBeDefined();
      expect(result.dirtAptitude).toBeDefined();
    });

    it('should return defaults for no bloodline', () => {
      const result = getBloodlineForPrediction();

      expect(result.distanceAptitude).toBe(3);
      expect(result.dirtAptitude).toBe(3);
    });

    it('should combine sire and grandsire', () => {
      const result = getBloodlineForPrediction('에이피인디', undefined, '타핏');

      // 에이피인디: distance 3, 타핏: distance 4
      // Combined: 3*0.7 + 4*0.3 = 2.1 + 1.2 = 3.3 → 3
      expect(result.distanceAptitude).toBeGreaterThanOrEqual(3);
    });
  });
});
