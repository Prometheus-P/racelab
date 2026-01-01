/**
 * DSL Parser
 *
 * YAML/JSON DSL 파싱 및 구조 검증
 * Phase 1: Foundation
 */

import YAML from 'yaml';
import type {
  DSLStrategyDefinition,
  DSLParseResult,
  DSLFilter,
} from './types';
import {
  DSL_FIELD_MAPPING,
  ALLOWED_DSL_FIELDS,
  MAX_FORMULA_LENGTH,
} from './types';
import type { ConditionOperator, BetAction } from '../types';

// =============================================================================
// Constants
// =============================================================================

/** 허용된 연산자 목록 */
const ALLOWED_OPERATORS: ConditionOperator[] = [
  'eq',
  'ne',
  'gt',
  'gte',
  'lt',
  'lte',
  'between',
  'in',
];

/** 허용된 액션 목록 */
const ALLOWED_ACTIONS: BetAction[] = ['bet_win', 'bet_place', 'bet_quinella', 'skip'];

/** 허용된 flat 필드 목록 */
const ALLOWED_FLAT_FIELDS = Object.values(DSL_FIELD_MAPPING);

/** 최대 필터 개수 */
const MAX_FILTERS = 10;

// =============================================================================
// Validation Error Types
// =============================================================================

export type DSLValidationErrorCode =
  | 'MISSING_STRATEGY_WRAPPER'
  | 'MISSING_NAME'
  | 'MISSING_VERSION'
  | 'MISSING_FILTERS'
  | 'EMPTY_FILTERS'
  | 'TOO_MANY_FILTERS'
  | 'INVALID_OPERATOR'
  | 'INVALID_FIELD'
  | 'INVALID_VALUE'
  | 'INVALID_ACTION'
  | 'FORMULA_TOO_LONG';

export interface DSLValidationError {
  path: string;
  message: string;
  code: DSLValidationErrorCode;
}

export interface DSLValidationResult {
  valid: boolean;
  errors: DSLValidationError[];
  warnings?: string[];
}

// =============================================================================
// Format Detection
// =============================================================================

/**
 * 입력 문자열의 포맷 감지 (JSON vs YAML)
 */
export function detectFormat(input: string): 'json' | 'yaml' | undefined {
  if (!input || typeof input !== 'string') {
    return undefined;
  }

  const trimmed = input.trim();

  if (!trimmed) {
    return undefined;
  }

  // JSON 감지: { 또는 [ 로 시작
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return 'json';
  }

  // YAML 감지: document marker 또는 key: value 패턴
  if (trimmed.startsWith('---') || /^[a-zA-Z_][a-zA-Z0-9_]*\s*:/m.test(trimmed)) {
    return 'yaml';
  }

  return undefined;
}

// =============================================================================
// YAML Parsing
// =============================================================================

/**
 * YAML 문자열 파싱
 */
export function parseYAML(input: string): DSLParseResult {
  if (!input || typeof input !== 'string' || !input.trim()) {
    return {
      success: false,
      error: 'Input is empty or invalid',
      format: 'yaml',
    };
  }

  try {
    const parsed = YAML.parse(input);

    if (!parsed) {
      return {
        success: false,
        error: 'YAML parsing returned empty result',
        format: 'yaml',
      };
    }

    return {
      success: true,
      data: parsed as DSLStrategyDefinition,
      format: 'yaml',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown YAML parsing error',
      format: 'yaml',
    };
  }
}

// =============================================================================
// JSON Parsing
// =============================================================================

/**
 * JSON 문자열 파싱
 */
export function parseJSON(input: string): DSLParseResult {
  if (!input || typeof input !== 'string' || !input.trim()) {
    return {
      success: false,
      error: 'Input is empty or invalid',
      format: 'json',
    };
  }

  try {
    const parsed = JSON.parse(input);

    if (!parsed) {
      return {
        success: false,
        error: 'JSON parsing returned empty result',
        format: 'json',
      };
    }

    return {
      success: true,
      data: parsed as DSLStrategyDefinition,
      format: 'json',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown JSON parsing error',
      format: 'json',
    };
  }
}

// =============================================================================
// Auto-Detect Parsing
// =============================================================================

/**
 * 포맷 자동 감지 후 파싱
 */
export function parseDSL(input: string): DSLParseResult {
  if (input === null || input === undefined) {
    return {
      success: false,
      error: 'Input is null or undefined',
    };
  }

  if (typeof input !== 'string') {
    return {
      success: false,
      error: 'Input must be a string',
    };
  }

  const format = detectFormat(input);

  if (!format) {
    return {
      success: false,
      error: 'Unable to detect format: input is neither valid JSON nor YAML',
    };
  }

  if (format === 'json') {
    return parseJSON(input);
  }

  return parseYAML(input);
}

// =============================================================================
// Field Validation Helpers
// =============================================================================

/**
 * 필드명이 유효한지 확인 (dot notation 또는 flat)
 */
function isValidField(field: string): boolean {
  // Dot notation 체크
  if (ALLOWED_DSL_FIELDS.includes(field)) {
    return true;
  }

  // Flat notation 체크
  if (ALLOWED_FLAT_FIELDS.includes(field as typeof ALLOWED_FLAT_FIELDS[number])) {
    return true;
  }

  return false;
}

/**
 * 연산자가 유효한지 확인
 */
function isValidOperator(operator: string): operator is ConditionOperator {
  return ALLOWED_OPERATORS.includes(operator as ConditionOperator);
}

/**
 * 액션이 유효한지 확인
 */
function isValidAction(action: string): action is BetAction {
  return ALLOWED_ACTIONS.includes(action as BetAction);
}

/**
 * 필터 값 검증
 */
function validateFilterValue(filter: DSLFilter): DSLValidationError | null {
  const { operator, value, field } = filter;

  // between 연산자는 [min, max] 배열 필요
  if (operator === 'between') {
    if (!Array.isArray(value) || value.length !== 2) {
      return {
        path: `strategy.filters[].value`,
        message: `'between' operator requires [min, max] array for field '${field}'`,
        code: 'INVALID_VALUE',
      };
    }
  }

  // in 연산자는 배열 필요
  if (operator === 'in') {
    if (!Array.isArray(value)) {
      return {
        path: `strategy.filters[].value`,
        message: `'in' operator requires array value for field '${field}'`,
        code: 'INVALID_VALUE',
      };
    }
  }

  return null;
}

// =============================================================================
// Structure Validation
// =============================================================================

/**
 * DSL 구조 검증
 */
export function validateDSLStructure(input: unknown): DSLValidationResult {
  const errors: DSLValidationError[] = [];
  const warnings: string[] = [];

  // 기본 타입 체크
  if (!input || typeof input !== 'object') {
    return {
      valid: false,
      errors: [
        {
          path: '',
          message: 'Input must be an object',
          code: 'MISSING_STRATEGY_WRAPPER',
        },
      ],
    };
  }

  const obj = input as Record<string, unknown>;

  // strategy 래퍼 체크
  if (!('strategy' in obj)) {
    return {
      valid: false,
      errors: [
        {
          path: 'strategy',
          message: "Missing 'strategy' wrapper",
          code: 'MISSING_STRATEGY_WRAPPER',
        },
      ],
    };
  }

  const strategy = obj.strategy as Record<string, unknown>;

  if (!strategy || typeof strategy !== 'object') {
    return {
      valid: false,
      errors: [
        {
          path: 'strategy',
          message: "'strategy' must be an object",
          code: 'MISSING_STRATEGY_WRAPPER',
        },
      ],
    };
  }

  // name 체크
  if (!strategy.name || typeof strategy.name !== 'string') {
    errors.push({
      path: 'strategy.name',
      message: "'name' is required and must be a string",
      code: 'MISSING_NAME',
    });
  }

  // version 체크
  if (strategy.version === undefined || typeof strategy.version !== 'number') {
    errors.push({
      path: 'strategy.version',
      message: "'version' is required and must be a number",
      code: 'MISSING_VERSION',
    });
  }

  // filters 체크
  if (!strategy.filters) {
    errors.push({
      path: 'strategy.filters',
      message: "'filters' is required",
      code: 'MISSING_FILTERS',
    });
  } else if (!Array.isArray(strategy.filters)) {
    errors.push({
      path: 'strategy.filters',
      message: "'filters' must be an array",
      code: 'MISSING_FILTERS',
    });
  } else if (strategy.filters.length === 0) {
    errors.push({
      path: 'strategy.filters',
      message: "'filters' cannot be empty",
      code: 'EMPTY_FILTERS',
    });
  } else if (strategy.filters.length > MAX_FILTERS) {
    errors.push({
      path: 'strategy.filters',
      message: `Too many filters: ${strategy.filters.length} (max: ${MAX_FILTERS})`,
      code: 'TOO_MANY_FILTERS',
    });
  } else {
    // 개별 필터 검증
    for (let i = 0; i < strategy.filters.length; i++) {
      const filter = strategy.filters[i] as DSLFilter;

      // 연산자 검증
      if (!isValidOperator(filter.operator)) {
        errors.push({
          path: `strategy.filters[${i}].operator`,
          message: `Invalid operator: '${filter.operator}'`,
          code: 'INVALID_OPERATOR',
        });
      }

      // 필드 검증
      if (!isValidField(filter.field)) {
        errors.push({
          path: `strategy.filters[${i}].field`,
          message: `Invalid field: '${filter.field}'`,
          code: 'INVALID_FIELD',
        });
      }

      // 값 검증
      const valueError = validateFilterValue(filter);
      if (valueError) {
        errors.push(valueError);
      }
    }
  }

  // scoring 검증 (선택적)
  if (strategy.scoring) {
    const scoring = strategy.scoring as Record<string, unknown>;

    if (scoring.formula && typeof scoring.formula === 'string') {
      if (scoring.formula.length > MAX_FORMULA_LENGTH) {
        errors.push({
          path: 'strategy.scoring.formula',
          message: `Formula too long: ${scoring.formula.length} chars (max: ${MAX_FORMULA_LENGTH})`,
          code: 'FORMULA_TOO_LONG',
        });
      }
    }
  }

  // action 검증 (선택적)
  if (strategy.action !== undefined) {
    if (!isValidAction(strategy.action as string)) {
      errors.push({
        path: 'strategy.action',
        message: `Invalid action: '${strategy.action}'`,
        code: 'INVALID_ACTION',
      });
    }
  }

  // execution 경고 (Phase 2+ 예약)
  if (strategy.execution) {
    warnings.push(
      "'execution' field is reserved for Phase 2+ and will not be processed in the current version"
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}
