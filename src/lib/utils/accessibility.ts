/**
 * Accessibility Utilities
 * Feature: 002-design-system
 *
 * Utilities for ensuring WCAG compliance and accessibility best practices.
 */

/**
 * M3 minimum touch target size in dp (density-independent pixels)
 * Per Material Design 3 guidelines: https://m3.material.io/foundations/accessible-design/interaction
 */
export const M3_MIN_TOUCH_TARGET = 48;

/**
 * WCAG AA minimum contrast ratio for normal text
 */
export const WCAG_AA_NORMAL_CONTRAST = 4.5;

/**
 * WCAG AA minimum contrast ratio for large text (18pt or 14pt bold)
 */
export const WCAG_AA_LARGE_CONTRAST = 3;

/**
 * Validates that an element meets M3 minimum touch target requirements
 *
 * @param element - The DOM element to validate
 * @returns Object with validation result and details
 *
 * @example
 * const button = document.querySelector('button');
 * const { isValid, width, height, issues } = validateTouchTarget(button);
 */
export function validateTouchTarget(element: HTMLElement | null): {
  isValid: boolean;
  width: number;
  height: number;
  issues: string[];
} {
  if (!element) {
    return {
      isValid: false,
      width: 0,
      height: 0,
      issues: ['Element not found'],
    };
  }

  const rect = element.getBoundingClientRect();
  const issues: string[] = [];

  if (rect.width < M3_MIN_TOUCH_TARGET) {
    issues.push(`Width ${rect.width.toFixed(0)}px is below ${M3_MIN_TOUCH_TARGET}px minimum`);
  }

  if (rect.height < M3_MIN_TOUCH_TARGET) {
    issues.push(`Height ${rect.height.toFixed(0)}px is below ${M3_MIN_TOUCH_TARGET}px minimum`);
  }

  return {
    isValid: issues.length === 0,
    width: rect.width,
    height: rect.height,
    issues,
  };
}

/**
 * Calculates the relative luminance of a color (for contrast calculations)
 * Based on WCAG 2.1 relative luminance formula
 *
 * @param r - Red channel (0-255)
 * @param g - Green channel (0-255)
 * @param b - Blue channel (0-255)
 * @returns Relative luminance (0-1)
 */
export function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculates contrast ratio between two colors
 * Based on WCAG 2.1 contrast ratio formula
 *
 * @param color1 - First color as [r, g, b] array (0-255 each)
 * @param color2 - Second color as [r, g, b] array (0-255 each)
 * @returns Contrast ratio (1-21)
 */
export function getContrastRatio(
  color1: [number, number, number],
  color2: [number, number, number]
): number {
  const l1 = getRelativeLuminance(...color1);
  const l2 = getRelativeLuminance(...color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Checks if a color combination meets WCAG AA contrast requirements
 *
 * @param foreground - Foreground color as [r, g, b] array
 * @param background - Background color as [r, g, b] array
 * @param isLargeText - Whether the text is large (18pt+ or 14pt bold)
 * @returns Object with pass/fail status and actual ratio
 */
export function checkContrastCompliance(
  foreground: [number, number, number],
  background: [number, number, number],
  isLargeText = false
): {
  passes: boolean;
  ratio: number;
  required: number;
} {
  const ratio = getContrastRatio(foreground, background);
  const required = isLargeText ? WCAG_AA_LARGE_CONTRAST : WCAG_AA_NORMAL_CONTRAST;

  return {
    passes: ratio >= required,
    ratio: Math.round(ratio * 100) / 100,
    required,
  };
}

/**
 * Parses a hex color string to RGB values
 *
 * @param hex - Hex color string (e.g., "#1d4ed8" or "1d4ed8")
 * @returns RGB values as [r, g, b] array, or null if invalid
 */
export function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : null;
}

/**
 * CSS classes for ensuring minimum touch target size
 */
export const touchTargetClasses = {
  /** Full touch target - both width and height */
  full: 'min-h-[48px] min-w-[48px]',
  /** Height only touch target */
  height: 'min-h-[48px]',
  /** Width only touch target */
  width: 'min-w-[48px]',
};

/**
 * Checks if the user prefers reduced motion (for server-side rendering)
 * Note: For client-side, use the useReducedMotion hook instead
 *
 * @param mediaQuery - Media query string from request headers
 * @returns Whether reduced motion is preferred
 */
export function prefersReducedMotionFromHeader(mediaQuery?: string): boolean {
  return mediaQuery === 'reduce';
}
