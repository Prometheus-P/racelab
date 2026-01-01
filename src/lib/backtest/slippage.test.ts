/**
 * Slippage Module Tests
 *
 * TDD 기반 슬리피지 모델링 테스트
 * Phase 2: 배당률 변동 시뮬레이션
 */

import {
  applySlippage,
  createSeededRng,
  DEFAULT_SLIPPAGE_CONFIG,
  type SlippageConfig,
} from './slippage';

// =============================================================================
// SlippageConfig Tests
// =============================================================================

describe('SlippageConfig', () => {
  describe('DEFAULT_SLIPPAGE_CONFIG', () => {
    it('should have enabled set to false by default', () => {
      expect(DEFAULT_SLIPPAGE_CONFIG.enabled).toBe(false);
    });

    it('should have minPercent set to -5', () => {
      expect(DEFAULT_SLIPPAGE_CONFIG.minPercent).toBe(-5);
    });

    it('should have maxPercent set to +5', () => {
      expect(DEFAULT_SLIPPAGE_CONFIG.maxPercent).toBe(5);
    });

    it('should use gaussian distribution by default', () => {
      expect(DEFAULT_SLIPPAGE_CONFIG.distribution).toBe('gaussian');
    });
  });
});

// =============================================================================
// applySlippage Function Tests
// =============================================================================

describe('applySlippage', () => {
  describe('when disabled', () => {
    it('should return original odds when slippage is disabled', () => {
      const config: SlippageConfig = {
        ...DEFAULT_SLIPPAGE_CONFIG,
        enabled: false,
      };

      const originalOdds = 2.5;
      const result = applySlippage(originalOdds, config);

      expect(result).toBe(originalOdds);
    });
  });

  describe('when enabled', () => {
    it('should modify odds when slippage is enabled', () => {
      const config: SlippageConfig = {
        ...DEFAULT_SLIPPAGE_CONFIG,
        enabled: true,
      };

      const originalOdds = 2.5;
      const result = applySlippage(originalOdds, config);

      // 슬리피지가 활성화되면 원래 값과 다를 수 있음 (확률적)
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
    });

    it('should apply slippage within ±5% range', () => {
      const config: SlippageConfig = {
        enabled: true,
        minPercent: -5,
        maxPercent: 5,
        distribution: 'uniform',
      };

      const originalOdds = 10.0;

      // 여러 번 실행하여 범위 내에 있는지 확인
      for (let i = 0; i < 100; i++) {
        const result = applySlippage(originalOdds, config);
        expect(result).toBeGreaterThanOrEqual(originalOdds * 0.95); // -5%
        expect(result).toBeLessThanOrEqual(originalOdds * 1.05); // +5%
      }
    });

    it('should support custom percentage range', () => {
      const config: SlippageConfig = {
        enabled: true,
        minPercent: -10,
        maxPercent: 10,
        distribution: 'uniform',
      };

      const originalOdds = 10.0;

      for (let i = 0; i < 100; i++) {
        const result = applySlippage(originalOdds, config);
        expect(result).toBeGreaterThanOrEqual(originalOdds * 0.90); // -10%
        expect(result).toBeLessThanOrEqual(originalOdds * 1.10); // +10%
      }
    });
  });

  describe('uniform distribution', () => {
    it('should distribute slippage uniformly', () => {
      const config: SlippageConfig = {
        enabled: true,
        minPercent: -5,
        maxPercent: 5,
        distribution: 'uniform',
      };

      const originalOdds = 10.0;
      const results: number[] = [];

      for (let i = 0; i < 1000; i++) {
        results.push(applySlippage(originalOdds, config));
      }

      // 평균은 원래 값에 가까워야 함
      const mean = results.reduce((a, b) => a + b, 0) / results.length;
      expect(mean).toBeCloseTo(originalOdds, 0);
    });
  });

  describe('gaussian distribution', () => {
    it('should distribute slippage with gaussian', () => {
      const config: SlippageConfig = {
        enabled: true,
        minPercent: -5,
        maxPercent: 5,
        distribution: 'gaussian',
      };

      const originalOdds = 10.0;
      const results: number[] = [];

      for (let i = 0; i < 1000; i++) {
        results.push(applySlippage(originalOdds, config));
      }

      // 평균은 원래 값에 가까워야 함
      const mean = results.reduce((a, b) => a + b, 0) / results.length;
      expect(mean).toBeCloseTo(originalOdds, 0);
    });

    it('should have more values near the mean than at extremes', () => {
      const config: SlippageConfig = {
        enabled: true,
        minPercent: -5,
        maxPercent: 5,
        distribution: 'gaussian',
      };

      const originalOdds = 10.0;
      const results: number[] = [];

      for (let i = 0; i < 1000; i++) {
        results.push(applySlippage(originalOdds, config));
      }

      // 중간 범위 (-1% ~ +1%) 에 있는 값의 비율
      const nearMean = results.filter(
        (r) => r >= originalOdds * 0.99 && r <= originalOdds * 1.01
      ).length;

      // 극단 범위 (-5% ~ -4% 또는 +4% ~ +5%) 에 있는 값의 비율
      const atExtremes = results.filter(
        (r) =>
          (r >= originalOdds * 0.95 && r <= originalOdds * 0.96) ||
          (r >= originalOdds * 1.04 && r <= originalOdds * 1.05)
      ).length;

      // Gaussian에서는 중간값이 극단값보다 많아야 함
      expect(nearMean).toBeGreaterThan(atExtremes);
    });
  });

  describe('reproducibility with seed', () => {
    it('should produce same results with same seed', () => {
      const config: SlippageConfig = {
        enabled: true,
        minPercent: -5,
        maxPercent: 5,
        distribution: 'uniform',
        seed: 12345,
      };

      const originalOdds = 10.0;

      // 첫 번째 실행
      const rng1 = createSeededRng(config.seed!);
      const results1: number[] = [];
      for (let i = 0; i < 10; i++) {
        results1.push(applySlippage(originalOdds, config, rng1));
      }

      // 두 번째 실행 (같은 시드)
      const rng2 = createSeededRng(config.seed!);
      const results2: number[] = [];
      for (let i = 0; i < 10; i++) {
        results2.push(applySlippage(originalOdds, config, rng2));
      }

      // 결과가 같아야 함
      expect(results1).toEqual(results2);
    });

    it('should produce different results with different seeds', () => {
      const config1: SlippageConfig = {
        enabled: true,
        minPercent: -5,
        maxPercent: 5,
        distribution: 'uniform',
        seed: 12345,
      };

      const config2: SlippageConfig = {
        ...config1,
        seed: 67890,
      };

      const originalOdds = 10.0;

      const rng1 = createSeededRng(config1.seed!);
      const results1: number[] = [];
      for (let i = 0; i < 10; i++) {
        results1.push(applySlippage(originalOdds, config1, rng1));
      }

      const rng2 = createSeededRng(config2.seed!);
      const results2: number[] = [];
      for (let i = 0; i < 10; i++) {
        results2.push(applySlippage(originalOdds, config2, rng2));
      }

      // 결과가 달라야 함
      expect(results1).not.toEqual(results2);
    });
  });

  describe('edge cases', () => {
    it('should handle zero odds', () => {
      const config: SlippageConfig = {
        ...DEFAULT_SLIPPAGE_CONFIG,
        enabled: true,
      };

      const result = applySlippage(0, config);
      expect(result).toBe(0);
    });

    it('should handle very low odds', () => {
      const config: SlippageConfig = {
        enabled: true,
        minPercent: -5,
        maxPercent: 5,
        distribution: 'uniform',
      };

      const originalOdds = 1.01;
      const result = applySlippage(originalOdds, config);

      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(originalOdds * 1.05);
    });

    it('should handle very high odds', () => {
      const config: SlippageConfig = {
        enabled: true,
        minPercent: -5,
        maxPercent: 5,
        distribution: 'uniform',
      };

      const originalOdds = 999.0;
      const result = applySlippage(originalOdds, config);

      expect(result).toBeGreaterThanOrEqual(originalOdds * 0.95);
      expect(result).toBeLessThanOrEqual(originalOdds * 1.05);
    });
  });
});

// =============================================================================
// createSeededRng Tests
// =============================================================================

describe('createSeededRng', () => {
  it('should create a function that returns numbers between 0 and 1', () => {
    const rng = createSeededRng(12345);

    for (let i = 0; i < 100; i++) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('should be deterministic with same seed', () => {
    const rng1 = createSeededRng(12345);
    const rng2 = createSeededRng(12345);

    for (let i = 0; i < 100; i++) {
      expect(rng1()).toEqual(rng2());
    }
  });
});
