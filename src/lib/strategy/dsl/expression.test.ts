/**
 * Expression Engine Tests
 *
 * TDD 기반 수식 파싱 및 평가 테스트
 * Phase 2: Expression Engine
 */

import {
  parseFormula,
  evaluateFormula,
  validateFormula,
  extractVariables,
} from './expression';
import { FormulaError, ALLOWED_FORMULA_VARIABLES } from './types';

// =============================================================================
// Test Fixtures
// =============================================================================

const SIMPLE_FORMULAS = {
  addition: 'odds_win + 1',
  subtraction: 'odds_win - 1',
  multiplication: 'odds_win * 0.5',
  division: 'odds_win / 2',
  complex: '(odds_win * horse_rating) / 100 - 1',
};

const FUNCTION_FORMULAS = {
  min: 'min(odds_win, 10)',
  max: 'max(odds_win, 1)',
  abs: 'abs(odds_drift_pct)',
  floor: 'floor(odds_win)',
  ceil: 'ceil(odds_win)',
  round: 'round(odds_win)',
  sqrt: 'sqrt(odds_win)',
};

const SAMPLE_CONTEXT = {
  odds_win: 5.5,
  odds_place: 2.3,
  odds_drift_pct: -10.5,
  odds_stddev: 1.2,
  popularity_rank: 3,
  pool_total: 1000000,
  pool_win_pct: 15.5,
  horse_rating: 85,
  burden_weight: 54,
  entry_count: 10,
};

// =============================================================================
// Formula Parsing Tests
// =============================================================================

describe('parseFormula', () => {
  it('should parse simple addition', () => {
    const result = parseFormula(SIMPLE_FORMULAS.addition);
    expect(result).toBeDefined();
    expect(result.formula).toBe(SIMPLE_FORMULAS.addition);
    expect(result.variables).toContain('odds_win');
  });

  it('should parse complex formula', () => {
    const result = parseFormula(SIMPLE_FORMULAS.complex);
    expect(result).toBeDefined();
    expect(result.variables).toContain('odds_win');
    expect(result.variables).toContain('horse_rating');
  });

  it('should parse formula with functions', () => {
    const result = parseFormula(FUNCTION_FORMULAS.min);
    expect(result).toBeDefined();
    expect(result.variables).toContain('odds_win');
  });

  it('should extract all variables correctly', () => {
    const formula = 'odds_win * popularity_rank + horse_rating';
    const result = parseFormula(formula);
    expect(result.variables).toHaveLength(3);
    expect(result.variables).toContain('odds_win');
    expect(result.variables).toContain('popularity_rank');
    expect(result.variables).toContain('horse_rating');
  });

  it('should throw FormulaError for too long formula', () => {
    const longFormula = 'odds_win + ' + '1 + '.repeat(100);
    expect(() => parseFormula(longFormula)).toThrow(FormulaError);
    expect(() => parseFormula(longFormula)).toThrow(/too long/i);
  });

  it('should throw FormulaError for invalid variable', () => {
    const invalidFormula = 'invalid_var + 1';
    expect(() => parseFormula(invalidFormula)).toThrow(FormulaError);
    expect(() => parseFormula(invalidFormula)).toThrow(/invalid.*variable/i);
  });

  it('should throw FormulaError for syntax error', () => {
    const syntaxError = 'odds_win + (1'; // unclosed parenthesis
    expect(() => parseFormula(syntaxError)).toThrow(FormulaError);
  });

  it('should handle parentheses correctly', () => {
    const formula = '(odds_win + 1) * 2';
    const result = parseFormula(formula);
    expect(result).toBeDefined();
  });

  it('should handle power operator', () => {
    const formula = 'odds_win ^ 2';
    const result = parseFormula(formula);
    expect(result).toBeDefined();
  });

  it('should handle negative numbers', () => {
    const formula = 'odds_win * -1';
    const result = parseFormula(formula);
    expect(result).toBeDefined();
  });
});

// =============================================================================
// Formula Evaluation Tests
// =============================================================================

describe('evaluateFormula', () => {
  it('should evaluate simple addition', () => {
    const parsed = parseFormula(SIMPLE_FORMULAS.addition);
    const result = evaluateFormula(parsed, SAMPLE_CONTEXT);
    expect(result).toBe(6.5); // 5.5 + 1
  });

  it('should evaluate simple subtraction', () => {
    const parsed = parseFormula(SIMPLE_FORMULAS.subtraction);
    const result = evaluateFormula(parsed, SAMPLE_CONTEXT);
    expect(result).toBe(4.5); // 5.5 - 1
  });

  it('should evaluate simple multiplication', () => {
    const parsed = parseFormula(SIMPLE_FORMULAS.multiplication);
    const result = evaluateFormula(parsed, SAMPLE_CONTEXT);
    expect(result).toBe(2.75); // 5.5 * 0.5
  });

  it('should evaluate simple division', () => {
    const parsed = parseFormula(SIMPLE_FORMULAS.division);
    const result = evaluateFormula(parsed, SAMPLE_CONTEXT);
    expect(result).toBe(2.75); // 5.5 / 2
  });

  it('should evaluate complex formula', () => {
    const parsed = parseFormula(SIMPLE_FORMULAS.complex);
    const result = evaluateFormula(parsed, SAMPLE_CONTEXT);
    // (5.5 * 85) / 100 - 1 = 467.5 / 100 - 1 = 4.675 - 1 = 3.675
    expect(result).toBeCloseTo(3.675, 2);
  });

  it('should evaluate min function', () => {
    const parsed = parseFormula(FUNCTION_FORMULAS.min);
    const result = evaluateFormula(parsed, SAMPLE_CONTEXT);
    expect(result).toBe(5.5); // min(5.5, 10) = 5.5
  });

  it('should evaluate max function', () => {
    const parsed = parseFormula(FUNCTION_FORMULAS.max);
    const result = evaluateFormula(parsed, SAMPLE_CONTEXT);
    expect(result).toBe(5.5); // max(5.5, 1) = 5.5
  });

  it('should evaluate abs function', () => {
    const parsed = parseFormula(FUNCTION_FORMULAS.abs);
    const result = evaluateFormula(parsed, SAMPLE_CONTEXT);
    expect(result).toBe(10.5); // abs(-10.5) = 10.5
  });

  it('should evaluate floor function', () => {
    const parsed = parseFormula(FUNCTION_FORMULAS.floor);
    const result = evaluateFormula(parsed, SAMPLE_CONTEXT);
    expect(result).toBe(5); // floor(5.5) = 5
  });

  it('should evaluate ceil function', () => {
    const parsed = parseFormula(FUNCTION_FORMULAS.ceil);
    const result = evaluateFormula(parsed, SAMPLE_CONTEXT);
    expect(result).toBe(6); // ceil(5.5) = 6
  });

  it('should evaluate round function', () => {
    const parsed = parseFormula(FUNCTION_FORMULAS.round);
    const result = evaluateFormula(parsed, SAMPLE_CONTEXT);
    expect(result).toBe(6); // round(5.5) = 6
  });

  it('should evaluate sqrt function', () => {
    const parsed = parseFormula(FUNCTION_FORMULAS.sqrt);
    const result = evaluateFormula(parsed, SAMPLE_CONTEXT);
    expect(result).toBeCloseTo(2.345, 2); // sqrt(5.5) ≈ 2.345
  });

  it('should evaluate power operator', () => {
    const parsed = parseFormula('odds_win ^ 2');
    const result = evaluateFormula(parsed, SAMPLE_CONTEXT);
    expect(result).toBeCloseTo(30.25, 2); // 5.5 ^ 2 = 30.25
  });

  it('should throw FormulaError for missing variable', () => {
    const parsed = parseFormula('odds_win + popularity_rank');
    const incompleteContext = { odds_win: 5.5 }; // missing popularity_rank
    expect(() => evaluateFormula(parsed, incompleteContext)).toThrow(FormulaError);
    expect(() => evaluateFormula(parsed, incompleteContext)).toThrow(/missing.*variable/i);
  });

  it('should handle zero values correctly', () => {
    const parsed = parseFormula('odds_win * 0');
    const result = evaluateFormula(parsed, SAMPLE_CONTEXT);
    expect(result).toBe(0);
  });

  it('should handle division by non-zero', () => {
    const parsed = parseFormula('pool_total / entry_count');
    const result = evaluateFormula(parsed, SAMPLE_CONTEXT);
    expect(result).toBe(100000); // 1000000 / 10
  });
});

// =============================================================================
// Formula Validation Tests
// =============================================================================

describe('validateFormula', () => {
  it('should return valid for correct formula', () => {
    const result = validateFormula(SIMPLE_FORMULAS.addition);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should return valid for complex formula', () => {
    const result = validateFormula(SIMPLE_FORMULAS.complex);
    expect(result.valid).toBe(true);
  });

  it('should return valid for formula with functions', () => {
    const result = validateFormula(FUNCTION_FORMULAS.min);
    expect(result.valid).toBe(true);
  });

  it('should return invalid for too long formula', () => {
    const longFormula = 'odds_win + ' + '1 + '.repeat(100);
    const result = validateFormula(longFormula);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'FORMULA_TOO_LONG')).toBe(true);
  });

  it('should return invalid for invalid variable', () => {
    const result = validateFormula('invalid_var + 1');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'INVALID_VARIABLE')).toBe(true);
  });

  it('should return invalid for syntax error', () => {
    const result = validateFormula('odds_win + (1'); // unclosed parenthesis
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.code === 'PARSE_ERROR')).toBe(true);
  });

  it('should return invalid for empty formula', () => {
    const result = validateFormula('');
    expect(result.valid).toBe(false);
  });

  it('should allow all supported variables', () => {
    for (const variable of ALLOWED_FORMULA_VARIABLES) {
      const result = validateFormula(`${variable} + 1`);
      expect(result.valid).toBe(true);
    }
  });
});

// =============================================================================
// Variable Extraction Tests
// =============================================================================

describe('extractVariables', () => {
  it('should extract single variable', () => {
    const variables = extractVariables('odds_win + 1');
    expect(variables).toContain('odds_win');
    expect(variables).toHaveLength(1);
  });

  it('should extract multiple variables', () => {
    const variables = extractVariables('odds_win * popularity_rank + horse_rating');
    expect(variables).toContain('odds_win');
    expect(variables).toContain('popularity_rank');
    expect(variables).toContain('horse_rating');
    expect(variables).toHaveLength(3);
  });

  it('should not include numbers as variables', () => {
    const variables = extractVariables('odds_win + 100');
    expect(variables).not.toContain('100');
    expect(variables).toHaveLength(1);
  });

  it('should not include function names as variables', () => {
    const variables = extractVariables('min(odds_win, 10)');
    expect(variables).not.toContain('min');
    expect(variables).toContain('odds_win');
  });

  it('should deduplicate variables', () => {
    const variables = extractVariables('odds_win + odds_win * odds_win');
    expect(variables).toHaveLength(1);
    expect(variables).toContain('odds_win');
  });

  it('should return empty array for constant-only formula', () => {
    const variables = extractVariables('1 + 2 * 3');
    expect(variables).toHaveLength(0);
  });
});

// =============================================================================
// Edge Case Tests
// =============================================================================

describe('edge cases', () => {
  it('should handle whitespace in formula', () => {
    const parsed = parseFormula('  odds_win  +  1  ');
    const result = evaluateFormula(parsed, SAMPLE_CONTEXT);
    expect(result).toBe(6.5);
  });

  it('should handle nested functions', () => {
    const parsed = parseFormula('max(min(odds_win, 10), 1)');
    const result = evaluateFormula(parsed, SAMPLE_CONTEXT);
    expect(result).toBe(5.5);
  });

  it('should handle multiple function calls', () => {
    const parsed = parseFormula('abs(odds_drift_pct) + floor(odds_win)');
    const result = evaluateFormula(parsed, SAMPLE_CONTEXT);
    expect(result).toBe(15.5); // 10.5 + 5
  });

  it('should handle complex nested expression', () => {
    const formula = '((odds_win + 1) * 2 - horse_rating / 10) ^ 0.5';
    const parsed = parseFormula(formula);
    const result = evaluateFormula(parsed, SAMPLE_CONTEXT);
    // ((5.5 + 1) * 2 - 85 / 10) ^ 0.5 = (6.5 * 2 - 8.5) ^ 0.5 = (13 - 8.5) ^ 0.5 = 4.5 ^ 0.5 ≈ 2.12
    expect(result).toBeCloseTo(2.12, 1);
  });

  it('should reject dangerous patterns', () => {
    // No eval(), no Function constructor
    expect(() => parseFormula('eval("alert(1)")')).toThrow();
    expect(() => parseFormula('Function("return 1")')).toThrow();
  });

  it('should reject assignment operators', () => {
    expect(() => parseFormula('odds_win = 10')).toThrow();
  });
});

// =============================================================================
// Real-World Formula Tests
// =============================================================================

describe('real-world formulas', () => {
  it('should evaluate value bet formula', () => {
    // Value = (odds * probability) - 1
    // If horse rating represents win probability proxy
    const formula = '(odds_win * (horse_rating / 100)) - 1';
    const parsed = parseFormula(formula);
    const result = evaluateFormula(parsed, SAMPLE_CONTEXT);
    // (5.5 * (85 / 100)) - 1 = (5.5 * 0.85) - 1 = 4.675 - 1 = 3.675
    expect(result).toBeCloseTo(3.675, 2);
  });

  it('should evaluate momentum formula', () => {
    // Momentum = -drift% * odds (positive drift = odds going up = less backed)
    const formula = 'abs(odds_drift_pct) * odds_win / 100';
    const parsed = parseFormula(formula);
    const result = evaluateFormula(parsed, SAMPLE_CONTEXT);
    // 10.5 * 5.5 / 100 = 0.5775
    expect(result).toBeCloseTo(0.5775, 3);
  });

  it('should evaluate risk-adjusted score', () => {
    const formula = 'odds_win / (popularity_rank + 1) - odds_stddev';
    const parsed = parseFormula(formula);
    const result = evaluateFormula(parsed, SAMPLE_CONTEXT);
    // 5.5 / (3 + 1) - 1.2 = 5.5 / 4 - 1.2 = 1.375 - 1.2 = 0.175
    expect(result).toBeCloseTo(0.175, 3);
  });
});
