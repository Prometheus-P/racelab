/**
 * @jest-environment jsdom
 */
// src/lib/utils/accessibility.test.ts
import {
  M3_MIN_TOUCH_TARGET,
  WCAG_AA_NORMAL_CONTRAST,
  WCAG_AA_LARGE_CONTRAST,
  validateTouchTarget,
  getRelativeLuminance,
  getContrastRatio,
  checkContrastCompliance,
  hexToRgb,
  touchTargetClasses,
  prefersReducedMotionFromHeader,
} from './accessibility';

describe('Accessibility Utilities', () => {
  describe('constants', () => {
    it('has M3 minimum touch target size of 48', () => {
      expect(M3_MIN_TOUCH_TARGET).toBe(48);
    });

    it('has WCAG AA normal contrast of 4.5', () => {
      expect(WCAG_AA_NORMAL_CONTRAST).toBe(4.5);
    });

    it('has WCAG AA large text contrast of 3', () => {
      expect(WCAG_AA_LARGE_CONTRAST).toBe(3);
    });
  });

  describe('validateTouchTarget', () => {
    it('returns invalid for null element', () => {
      const result = validateTouchTarget(null);
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Element not found');
    });

    it('returns valid for element meeting touch target requirements', () => {
      const element = document.createElement('button');
      // Mock getBoundingClientRect since jsdom doesn't calculate layout
      element.getBoundingClientRect = jest.fn(() => ({
        width: 50,
        height: 50,
        top: 0,
        left: 0,
        right: 50,
        bottom: 50,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }));

      const result = validateTouchTarget(element);
      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('returns issues for element too small', () => {
      const element = document.createElement('button');
      // Mock getBoundingClientRect with small dimensions
      element.getBoundingClientRect = jest.fn(() => ({
        width: 30,
        height: 30,
        top: 0,
        left: 0,
        right: 30,
        bottom: 30,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }));

      const result = validateTouchTarget(element);
      expect(result.isValid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('getRelativeLuminance', () => {
    it('returns 0 for black', () => {
      expect(getRelativeLuminance(0, 0, 0)).toBe(0);
    });

    it('returns 1 for white', () => {
      expect(getRelativeLuminance(255, 255, 255)).toBe(1);
    });

    it('returns correct luminance for primary blue (#1d4ed8)', () => {
      const luminance = getRelativeLuminance(29, 78, 216);
      expect(luminance).toBeGreaterThan(0);
      expect(luminance).toBeLessThan(1);
    });
  });

  describe('getContrastRatio', () => {
    it('returns 21 for black on white', () => {
      const ratio = getContrastRatio([0, 0, 0], [255, 255, 255]);
      expect(ratio).toBe(21);
    });

    it('returns 1 for same colors', () => {
      const ratio = getContrastRatio([128, 128, 128], [128, 128, 128]);
      expect(ratio).toBe(1);
    });

    it('returns same ratio regardless of order', () => {
      const ratio1 = getContrastRatio([0, 0, 0], [255, 255, 255]);
      const ratio2 = getContrastRatio([255, 255, 255], [0, 0, 0]);
      expect(ratio1).toBe(ratio2);
    });
  });

  describe('checkContrastCompliance', () => {
    it('passes for black text on white background', () => {
      const result = checkContrastCompliance([0, 0, 0], [255, 255, 255]);
      expect(result.passes).toBe(true);
      expect(result.ratio).toBe(21);
      expect(result.required).toBe(4.5);
    });

    it('fails for low contrast combination', () => {
      const result = checkContrastCompliance([200, 200, 200], [255, 255, 255]);
      expect(result.passes).toBe(false);
    });

    it('uses lower threshold for large text', () => {
      const result = checkContrastCompliance([100, 100, 100], [255, 255, 255], true);
      expect(result.required).toBe(3);
    });
  });

  describe('hexToRgb', () => {
    it('parses hex with hash', () => {
      expect(hexToRgb('#1d4ed8')).toEqual([29, 78, 216]);
    });

    it('parses hex without hash', () => {
      expect(hexToRgb('1d4ed8')).toEqual([29, 78, 216]);
    });

    it('parses white', () => {
      expect(hexToRgb('#ffffff')).toEqual([255, 255, 255]);
    });

    it('parses black', () => {
      expect(hexToRgb('#000000')).toEqual([0, 0, 0]);
    });

    it('returns null for invalid hex', () => {
      expect(hexToRgb('invalid')).toBeNull();
    });

    it('returns null for short hex', () => {
      expect(hexToRgb('#fff')).toBeNull();
    });
  });

  describe('touchTargetClasses', () => {
    it('has full touch target class', () => {
      expect(touchTargetClasses.full).toBe('min-h-[48px] min-w-[48px]');
    });

    it('has height-only touch target class', () => {
      expect(touchTargetClasses.height).toBe('min-h-[48px]');
    });

    it('has width-only touch target class', () => {
      expect(touchTargetClasses.width).toBe('min-w-[48px]');
    });
  });

  describe('prefersReducedMotionFromHeader', () => {
    it('returns true for "reduce"', () => {
      expect(prefersReducedMotionFromHeader('reduce')).toBe(true);
    });

    it('returns false for undefined', () => {
      expect(prefersReducedMotionFromHeader(undefined)).toBe(false);
    });

    it('returns false for other values', () => {
      expect(prefersReducedMotionFromHeader('no-preference')).toBe(false);
    });
  });
});
