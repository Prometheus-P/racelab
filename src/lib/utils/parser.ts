// src/lib/utils/parser.ts

/**
 * Helper function to parse odds value from string
 */
export function parseOddsValue(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}