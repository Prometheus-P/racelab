/**
 * DSL Parser Tests
 *
 * TDD 기반 YAML/JSON DSL 파서 테스트
 * Phase 1: Foundation
 */

import {
  parseDSL,
  parseYAML,
  parseJSON,
  detectFormat,
  validateDSLStructure,
} from './parser';
import type { DSLStrategyDefinition } from './types';

// =============================================================================
// Test Fixtures
// =============================================================================

const VALID_DSL_JSON: DSLStrategyDefinition = {
  strategy: {
    name: 'Value Bet Scanner',
    version: 1,
    filters: [
      { field: 'odds.win', operator: 'gte', value: 5.0 },
      { field: 'popularity.rank', operator: 'lte', value: 3 },
    ],
    scoring: {
      formula: 'odds_win * 0.5 - 1',
      threshold: 0.5,
    },
    action: 'bet_win',
    stake: { fixed: 10000 },
    metadata: {
      author: 'test-user',
      description: 'High value bet strategy',
    },
  },
};

const VALID_DSL_YAML = `
strategy:
  name: Value Bet Scanner
  version: 1
  filters:
    - field: odds.win
      operator: gte
      value: 5.0
    - field: popularity.rank
      operator: lte
      value: 3
  scoring:
    formula: odds_win * 0.5 - 1
    threshold: 0.5
  action: bet_win
  stake:
    fixed: 10000
  metadata:
    author: test-user
    description: High value bet strategy
`;

const MINIMAL_DSL_JSON: DSLStrategyDefinition = {
  strategy: {
    name: 'Minimal Strategy',
    version: 1,
    filters: [{ field: 'odds_win', operator: 'gte', value: 2.0 }],
  },
};

const MINIMAL_DSL_YAML = `
strategy:
  name: Minimal Strategy
  version: 1
  filters:
    - field: odds_win
      operator: gte
      value: 2.0
`;

// =============================================================================
// Format Detection Tests
// =============================================================================

describe('detectFormat', () => {
  it('should detect JSON format', () => {
    const json = JSON.stringify(VALID_DSL_JSON);
    expect(detectFormat(json)).toBe('json');
  });

  it('should detect JSON format with whitespace', () => {
    const json = '  \n  ' + JSON.stringify(VALID_DSL_JSON);
    expect(detectFormat(json)).toBe('json');
  });

  it('should detect YAML format', () => {
    expect(detectFormat(VALID_DSL_YAML)).toBe('yaml');
  });

  it('should detect YAML format with document marker', () => {
    const yamlWithMarker = '---\n' + VALID_DSL_YAML;
    expect(detectFormat(yamlWithMarker)).toBe('yaml');
  });

  it('should return undefined for empty string', () => {
    expect(detectFormat('')).toBeUndefined();
  });

  it('should return undefined for invalid input', () => {
    expect(detectFormat('not valid anything')).toBeUndefined();
  });
});

// =============================================================================
// YAML Parsing Tests
// =============================================================================

describe('parseYAML', () => {
  it('should parse valid YAML', () => {
    const result = parseYAML(VALID_DSL_YAML);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.strategy.name).toBe('Value Bet Scanner');
    expect(result.format).toBe('yaml');
  });

  it('should parse minimal YAML', () => {
    const result = parseYAML(MINIMAL_DSL_YAML);
    expect(result.success).toBe(true);
    expect(result.data?.strategy.filters).toHaveLength(1);
  });

  it('should preserve numeric values', () => {
    const result = parseYAML(VALID_DSL_YAML);
    expect(result.data?.strategy.version).toBe(1);
    expect(result.data?.strategy.filters[0].value).toBe(5.0);
    expect(result.data?.strategy.stake?.fixed).toBe(10000);
  });

  it('should handle YAML with document marker', () => {
    const yamlWithMarker = '---\n' + MINIMAL_DSL_YAML;
    const result = parseYAML(yamlWithMarker);
    expect(result.success).toBe(true);
  });

  it('should return error for invalid YAML syntax', () => {
    const invalidYaml = `
strategy:
  name: Test
  filters:
    - field: odds.win
      value: [invalid unclosed
    `;
    const result = parseYAML(invalidYaml);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should return error for empty YAML', () => {
    const result = parseYAML('');
    expect(result.success).toBe(false);
    expect(result.error).toContain('empty');
  });
});

// =============================================================================
// JSON Parsing Tests
// =============================================================================

describe('parseJSON', () => {
  it('should parse valid JSON', () => {
    const json = JSON.stringify(VALID_DSL_JSON);
    const result = parseJSON(json);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.strategy.name).toBe('Value Bet Scanner');
    expect(result.format).toBe('json');
  });

  it('should parse minimal JSON', () => {
    const json = JSON.stringify(MINIMAL_DSL_JSON);
    const result = parseJSON(json);
    expect(result.success).toBe(true);
    expect(result.data?.strategy.filters).toHaveLength(1);
  });

  it('should preserve numeric values', () => {
    const json = JSON.stringify(VALID_DSL_JSON);
    const result = parseJSON(json);
    expect(result.data?.strategy.version).toBe(1);
    expect(result.data?.strategy.filters[0].value).toBe(5.0);
  });

  it('should handle JSON with whitespace', () => {
    const json = '  \n  ' + JSON.stringify(MINIMAL_DSL_JSON) + '  \n  ';
    const result = parseJSON(json);
    expect(result.success).toBe(true);
  });

  it('should return error for invalid JSON syntax', () => {
    const invalidJson = '{ "strategy": { "name": "Test", }';
    const result = parseJSON(invalidJson);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should return error for empty JSON', () => {
    const result = parseJSON('');
    expect(result.success).toBe(false);
    expect(result.error).toContain('empty');
  });
});

// =============================================================================
// Auto-Detect Parsing Tests (parseDSL)
// =============================================================================

describe('parseDSL', () => {
  it('should auto-detect and parse JSON', () => {
    const json = JSON.stringify(VALID_DSL_JSON);
    const result = parseDSL(json);
    expect(result.success).toBe(true);
    expect(result.format).toBe('json');
    expect(result.data?.strategy.name).toBe('Value Bet Scanner');
  });

  it('should auto-detect and parse YAML', () => {
    const result = parseDSL(VALID_DSL_YAML);
    expect(result.success).toBe(true);
    expect(result.format).toBe('yaml');
    expect(result.data?.strategy.name).toBe('Value Bet Scanner');
  });

  it('should return error for unrecognized format', () => {
    const result = parseDSL('random text that is neither JSON nor YAML');
    expect(result.success).toBe(false);
    expect(result.error).toContain('format');
  });

  it('should return error for null input', () => {
    const result = parseDSL(null as unknown as string);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should return error for undefined input', () => {
    const result = parseDSL(undefined as unknown as string);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

// =============================================================================
// Structure Validation Tests
// =============================================================================

describe('validateDSLStructure', () => {
  it('should validate complete DSL structure', () => {
    const result = validateDSLStructure(VALID_DSL_JSON);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should validate minimal DSL structure', () => {
    const result = validateDSLStructure(MINIMAL_DSL_JSON);
    expect(result.valid).toBe(true);
  });

  it('should reject missing strategy wrapper', () => {
    const invalid = { name: 'Test', version: 1, filters: [] };
    const result = validateDSLStructure(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('MISSING_STRATEGY_WRAPPER');
  });

  it('should reject missing name', () => {
    const invalid = { strategy: { version: 1, filters: [] } };
    const result = validateDSLStructure(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.path.includes('name'))).toBe(true);
  });

  it('should reject missing version', () => {
    const invalid = { strategy: { name: 'Test', filters: [] } };
    const result = validateDSLStructure(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.path.includes('version'))).toBe(true);
  });

  it('should reject missing filters', () => {
    const invalid = { strategy: { name: 'Test', version: 1 } };
    const result = validateDSLStructure(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.path.includes('filters'))).toBe(true);
  });

  it('should reject empty filters array', () => {
    const invalid = { strategy: { name: 'Test', version: 1, filters: [] } };
    const result = validateDSLStructure(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('EMPTY_FILTERS');
  });

  it('should reject too many filters', () => {
    const filters = Array.from({ length: 15 }, (_, i) => ({
      field: 'odds_win',
      operator: 'gte' as const,
      value: i,
    }));
    const invalid = { strategy: { name: 'Test', version: 1, filters } };
    const result = validateDSLStructure(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('TOO_MANY_FILTERS');
  });

  it('should reject invalid operator', () => {
    const invalid = {
      strategy: {
        name: 'Test',
        version: 1,
        filters: [{ field: 'odds_win', operator: 'invalid', value: 5 }],
      },
    };
    const result = validateDSLStructure(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('INVALID_OPERATOR');
  });

  it('should reject invalid field name', () => {
    const invalid = {
      strategy: {
        name: 'Test',
        version: 1,
        filters: [{ field: 'invalid_field', operator: 'gte', value: 5 }],
      },
    };
    const result = validateDSLStructure(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('INVALID_FIELD');
  });

  it('should accept dot notation fields', () => {
    const valid = {
      strategy: {
        name: 'Test',
        version: 1,
        filters: [{ field: 'odds.win', operator: 'gte', value: 5 }],
      },
    };
    const result = validateDSLStructure(valid);
    expect(result.valid).toBe(true);
  });

  it('should reject between operator without array value', () => {
    const invalid = {
      strategy: {
        name: 'Test',
        version: 1,
        filters: [{ field: 'odds_win', operator: 'between', value: 5 }],
      },
    };
    const result = validateDSLStructure(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('INVALID_VALUE');
  });

  it('should validate scoring formula length', () => {
    const longFormula = 'a'.repeat(250);
    const invalid = {
      strategy: {
        name: 'Test',
        version: 1,
        filters: [{ field: 'odds_win', operator: 'gte', value: 5 }],
        scoring: { formula: longFormula },
      },
    };
    const result = validateDSLStructure(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('FORMULA_TOO_LONG');
  });

  it('should validate action value', () => {
    const invalid = {
      strategy: {
        name: 'Test',
        version: 1,
        filters: [{ field: 'odds_win', operator: 'gte', value: 5 }],
        action: 'invalid_action',
      },
    };
    const result = validateDSLStructure(invalid);
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe('INVALID_ACTION');
  });
});

// =============================================================================
// Field Mapping Tests
// =============================================================================

describe('field mapping', () => {
  it('should accept both dot notation and flat field names', () => {
    const dotNotation = {
      strategy: {
        name: 'Test',
        version: 1,
        filters: [{ field: 'odds.win', operator: 'gte', value: 5 }],
      },
    };
    const flatNotation = {
      strategy: {
        name: 'Test',
        version: 1,
        filters: [{ field: 'odds_win', operator: 'gte', value: 5 }],
      },
    };

    expect(validateDSLStructure(dotNotation).valid).toBe(true);
    expect(validateDSLStructure(flatNotation).valid).toBe(true);
  });

  it('should validate all supported dot notation fields', () => {
    const supportedFields = [
      'odds.win',
      'odds.place',
      'odds.drift_pct',
      'odds.stddev',
      'popularity.rank',
      'pool.total',
      'pool.win_pct',
      'horse.rating',
      'burden.weight',
      'entry.count',
    ];

    for (const field of supportedFields) {
      const dsl = {
        strategy: {
          name: 'Test',
          version: 1,
          filters: [{ field, operator: 'gte', value: 1 }],
        },
      };
      const result = validateDSLStructure(dsl);
      expect(result.valid).toBe(true);
    }
  });
});

// =============================================================================
// Scoring Validation Tests
// =============================================================================

describe('scoring validation', () => {
  it('should accept valid scoring config', () => {
    const valid = {
      strategy: {
        name: 'Test',
        version: 1,
        filters: [{ field: 'odds_win', operator: 'gte', value: 5 }],
        scoring: {
          formula: 'odds_win * 0.5',
          threshold: 0.5,
        },
      },
    };
    const result = validateDSLStructure(valid);
    expect(result.valid).toBe(true);
  });

  it('should accept scoring without threshold', () => {
    const valid = {
      strategy: {
        name: 'Test',
        version: 1,
        filters: [{ field: 'odds_win', operator: 'gte', value: 5 }],
        scoring: {
          formula: 'odds_win * 0.5',
        },
      },
    };
    const result = validateDSLStructure(valid);
    expect(result.valid).toBe(true);
  });
});

// =============================================================================
// Execution (Reserved) Validation Tests
// =============================================================================

describe('execution validation (Phase 2+ reserved)', () => {
  it('should accept execution config but not execute it', () => {
    const valid = {
      strategy: {
        name: 'Test',
        version: 1,
        filters: [{ field: 'odds_win', operator: 'gte', value: 5 }],
        execution: {
          sandbox: 'javascript',
          code: 'return candidates.filter(c => c.score > 0.5)',
        },
      },
    };
    const result = validateDSLStructure(valid);
    expect(result.valid).toBe(true);
    // Execution is reserved but not processed
  });

  it('should warn about execution being reserved', () => {
    const valid = {
      strategy: {
        name: 'Test',
        version: 1,
        filters: [{ field: 'odds_win', operator: 'gte', value: 5 }],
        execution: {
          sandbox: 'javascript',
          code: 'some code',
        },
      },
    };
    const result = validateDSLStructure(valid);
    expect(result.warnings).toBeDefined();
    expect(result.warnings?.some((w) => w.includes('execution'))).toBe(true);
  });
});
