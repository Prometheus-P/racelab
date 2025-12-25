/**
 * Disclaimer Module Tests
 *
 * TDD 기반 면책조항 테스트
 * Phase 3: 필수 면책조항 생성기
 */

import {
  generateDisclaimer,
  type BacktestDisclaimer,
  DISCLAIMER_TEXTS,
} from './disclaimer';

// =============================================================================
// BacktestDisclaimer Type Tests
// =============================================================================

describe('BacktestDisclaimer Type', () => {
  it('should have required fields', () => {
    const disclaimer = generateDisclaimer();

    expect(disclaimer).toHaveProperty('title');
    expect(disclaimer).toHaveProperty('items');
    expect(disclaimer).toHaveProperty('helpline');
    expect(disclaimer).toHaveProperty('language');
    expect(disclaimer).toHaveProperty('generatedAt');
  });

  it('should have correct field types', () => {
    const disclaimer = generateDisclaimer();

    expect(typeof disclaimer.title).toBe('string');
    expect(Array.isArray(disclaimer.items)).toBe(true);
    expect(typeof disclaimer.helpline).toBe('string');
    expect(typeof disclaimer.language).toBe('string');
    expect(typeof disclaimer.generatedAt).toBe('string');
  });
});

// =============================================================================
// generateDisclaimer Function Tests
// =============================================================================

describe('generateDisclaimer', () => {
  describe('default behavior', () => {
    it('should generate Korean disclaimer by default', () => {
      const disclaimer = generateDisclaimer();

      expect(disclaimer.language).toBe('ko');
    });

    it('should include title', () => {
      const disclaimer = generateDisclaimer();

      expect(disclaimer.title).toBe('주의사항');
    });

    it('should include gambling helpline', () => {
      const disclaimer = generateDisclaimer();

      expect(disclaimer.helpline).toBe('도박 문제 상담: 1336');
    });

    it('should include timestamp', () => {
      const disclaimer = generateDisclaimer();

      expect(disclaimer.generatedAt).toBeDefined();
      // ISO 8601 형식 확인
      expect(() => new Date(disclaimer.generatedAt)).not.toThrow();
    });
  });

  describe('mandatory items', () => {
    it('should always include "past performance" warning', () => {
      const disclaimer = generateDisclaimer();

      expect(disclaimer.items).toContain(DISCLAIMER_TEXTS.ko.pastPerformance);
    });

    it('should always include "educational purpose" notice', () => {
      const disclaimer = generateDisclaimer();

      expect(disclaimer.items).toContain(DISCLAIMER_TEXTS.ko.educationalPurpose);
    });

    it('should always include "risk of loss" warning', () => {
      const disclaimer = generateDisclaimer();

      expect(disclaimer.items).toContain(DISCLAIMER_TEXTS.ko.riskOfLoss);
    });
  });

  describe('conditional items', () => {
    it('should include tax notice when taxApplied is true', () => {
      const disclaimer = generateDisclaimer(true, false);

      expect(disclaimer.items).toContain(DISCLAIMER_TEXTS.ko.taxApplied);
    });

    it('should not include tax notice when taxApplied is false', () => {
      const disclaimer = generateDisclaimer(false, false);

      expect(disclaimer.items).not.toContain(DISCLAIMER_TEXTS.ko.taxApplied);
    });

    it('should include slippage notice when slippageApplied is true', () => {
      const disclaimer = generateDisclaimer(true, true);

      expect(disclaimer.items).toContain(DISCLAIMER_TEXTS.ko.slippageApplied);
    });

    it('should not include slippage notice when slippageApplied is false', () => {
      const disclaimer = generateDisclaimer(true, false);

      expect(disclaimer.items).not.toContain(DISCLAIMER_TEXTS.ko.slippageApplied);
    });
  });

  describe('default parameters', () => {
    it('should assume taxApplied is true by default', () => {
      const disclaimer = generateDisclaimer();

      expect(disclaimer.items).toContain(DISCLAIMER_TEXTS.ko.taxApplied);
    });

    it('should assume slippageApplied is false by default', () => {
      const disclaimer = generateDisclaimer();

      expect(disclaimer.items).not.toContain(DISCLAIMER_TEXTS.ko.slippageApplied);
    });
  });

  describe('item count', () => {
    it('should have at least 3 mandatory items', () => {
      const disclaimer = generateDisclaimer(false, false);

      expect(disclaimer.items.length).toBeGreaterThanOrEqual(3);
    });

    it('should have 4 items when only tax is applied', () => {
      const disclaimer = generateDisclaimer(true, false);

      expect(disclaimer.items.length).toBe(4);
    });

    it('should have 5 items when both tax and slippage are applied', () => {
      const disclaimer = generateDisclaimer(true, true);

      expect(disclaimer.items.length).toBe(5);
    });
  });
});

// =============================================================================
// DISCLAIMER_TEXTS Tests
// =============================================================================

describe('DISCLAIMER_TEXTS', () => {
  it('should have Korean texts defined', () => {
    expect(DISCLAIMER_TEXTS.ko).toBeDefined();
    expect(DISCLAIMER_TEXTS.ko.pastPerformance).toBeDefined();
    expect(DISCLAIMER_TEXTS.ko.educationalPurpose).toBeDefined();
    expect(DISCLAIMER_TEXTS.ko.riskOfLoss).toBeDefined();
    expect(DISCLAIMER_TEXTS.ko.taxApplied).toBeDefined();
    expect(DISCLAIMER_TEXTS.ko.slippageApplied).toBeDefined();
  });

  it('should have meaningful Korean texts', () => {
    expect(DISCLAIMER_TEXTS.ko.pastPerformance).toContain('과거');
    expect(DISCLAIMER_TEXTS.ko.educationalPurpose).toContain('교육');
    expect(DISCLAIMER_TEXTS.ko.riskOfLoss).toContain('손실');
    expect(DISCLAIMER_TEXTS.ko.taxApplied).toContain('세금');
    expect(DISCLAIMER_TEXTS.ko.slippageApplied).toContain('슬리피지');
  });
});
