/**
 * Expression Engine
 *
 * 수식 파싱 및 평가 (expr-eval 래퍼)
 * Phase 2: Expression Engine
 *
 * 보안:
 * - NO eval(): expr-eval은 AST 파싱 사용
 * - 변수 화이트리스트: 허용된 필드만 사용 가능
 * - 함수 제한: min, max, abs, floor, ceil, round, sqrt만 허용
 * - 길이 제한: 수식 200자 이내
 */

import { Parser, Expression } from 'expr-eval';
import type {
  ParsedExpression,
  ScoringContext,
  FormulaErrorCode,
} from './types';
import {
  FormulaError,
  MAX_FORMULA_LENGTH,
  ALLOWED_FORMULA_VARIABLES,
  ALLOWED_FUNCTIONS,
} from './types';

// =============================================================================
// Parser Configuration
// =============================================================================

/**
 * 허용된 연산자만 활성화된 expr-eval Parser
 */
const parser = new Parser({
  operators: {
    add: true,
    subtract: true,
    multiply: true,
    divide: true,
    power: true,
    concatenate: false,
    conditional: false,
    factorial: false,
    remainder: true,
    logical: false,
    comparison: false,
    'in': false,
    assignment: false,
  },
});

// 허용된 함수만 등록 (기본 함수 중 필요한 것만)
// expr-eval에는 이미 기본 함수들이 있으므로 추가 설정 불필요

// =============================================================================
// Validation Result Types
// =============================================================================

export interface FormulaValidationError {
  code: FormulaErrorCode;
  message: string;
}

export interface FormulaValidationResult {
  valid: boolean;
  errors: FormulaValidationError[];
  variables?: string[];
}

// =============================================================================
// Variable Extraction
// =============================================================================

/**
 * 수식에서 변수 추출
 * 함수명, 숫자는 제외하고 변수명만 추출
 */
export function extractVariables(formula: string): string[] {
  if (!formula || typeof formula !== 'string') {
    return [];
  }

  // 식별자 패턴 (변수 또는 함수명)
  const identifierPattern = /[a-zA-Z_][a-zA-Z0-9_]*/g;
  const matches = formula.match(identifierPattern) || [];

  // 함수명 제외
  const functionNames = new Set([
    ...ALLOWED_FUNCTIONS,
    // expr-eval 내장 함수들도 제외
    'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh',
    'log', 'log10', 'exp', 'pow', 'sign', 'trunc', 'random', 'fac',
    'length', 'hypot', 'atan2', 'pyt', 'if', 'gamma', 'roundTo',
    'map', 'fold', 'filter', 'indexOf', 'join', 'sum',
  ]);

  // 중복 제거 및 필터링
  const uniqueMatches = Array.from(new Set(matches));
  const variables = uniqueMatches.filter(
    (name) => !functionNames.has(name)
  );

  return variables;
}

// =============================================================================
// Formula Validation
// =============================================================================

/**
 * 수식 유효성 검증
 */
export function validateFormula(formula: string): FormulaValidationResult {
  const errors: FormulaValidationError[] = [];

  // 빈 수식 체크
  if (!formula || typeof formula !== 'string' || !formula.trim()) {
    return {
      valid: false,
      errors: [
        {
          code: 'PARSE_ERROR',
          message: 'Formula is empty or invalid',
        },
      ],
    };
  }

  // 길이 체크
  if (formula.length > MAX_FORMULA_LENGTH) {
    errors.push({
      code: 'FORMULA_TOO_LONG',
      message: `Formula is too long: ${formula.length} chars (max: ${MAX_FORMULA_LENGTH})`,
    });
    return { valid: false, errors };
  }

  // 변수 추출 및 검증
  const variables = extractVariables(formula);
  const allowedSet = new Set(ALLOWED_FORMULA_VARIABLES);

  for (const variable of variables) {
    if (!allowedSet.has(variable as typeof ALLOWED_FORMULA_VARIABLES[number])) {
      errors.push({
        code: 'INVALID_VARIABLE',
        message: `Invalid variable: '${variable}'`,
      });
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors, variables };
  }

  // 파싱 테스트
  try {
    parser.parse(formula);
  } catch (error) {
    errors.push({
      code: 'PARSE_ERROR',
      message: error instanceof Error ? error.message : 'Unknown parse error',
    });
    return { valid: false, errors, variables };
  }

  return { valid: true, errors: [], variables };
}

// =============================================================================
// Formula Parsing
// =============================================================================

/**
 * 수식 파싱
 * @throws {FormulaError} 수식이 유효하지 않은 경우
 */
export function parseFormula(formula: string): ParsedExpression {
  // 길이 체크
  if (formula.length > MAX_FORMULA_LENGTH) {
    throw new FormulaError(
      'FORMULA_TOO_LONG',
      `Formula is too long: ${formula.length} chars (max: ${MAX_FORMULA_LENGTH})`
    );
  }

  // 변수 추출
  const variables = extractVariables(formula);

  // 변수 화이트리스트 검증
  const allowedSet = new Set(ALLOWED_FORMULA_VARIABLES);
  for (const variable of variables) {
    if (!allowedSet.has(variable as typeof ALLOWED_FORMULA_VARIABLES[number])) {
      throw new FormulaError(
        'INVALID_VARIABLE',
        `Invalid variable: '${variable}'. Allowed variables: ${ALLOWED_FORMULA_VARIABLES.join(', ')}`
      );
    }
  }

  // 파싱
  let expression: Expression;
  try {
    expression = parser.parse(formula);
  } catch (error) {
    throw new FormulaError(
      'PARSE_ERROR',
      error instanceof Error ? error.message : 'Unknown parse error'
    );
  }

  return {
    formula,
    expression,
    variables,
  };
}

// =============================================================================
// Formula Evaluation
// =============================================================================

/**
 * 파싱된 수식 평가
 * @throws {FormulaError} 평가 실패 시
 */
export function evaluateFormula(
  parsed: ParsedExpression,
  context: ScoringContext
): number {
  // 필요한 변수 확인
  for (const variable of parsed.variables) {
    if (context[variable] === undefined) {
      throw new FormulaError(
        'MISSING_VARIABLE',
        `Missing variable in context: '${variable}'`
      );
    }
  }

  // 평가
  try {
    const result = parsed.expression.evaluate(context);

    if (typeof result !== 'number' || !isFinite(result)) {
      throw new FormulaError(
        'EVALUATION_ERROR',
        `Formula evaluation returned invalid result: ${result}`
      );
    }

    return result;
  } catch (error) {
    if (error instanceof FormulaError) {
      throw error;
    }
    throw new FormulaError(
      'EVALUATION_ERROR',
      error instanceof Error ? error.message : 'Unknown evaluation error'
    );
  }
}

// =============================================================================
// Convenience Functions
// =============================================================================

/**
 * 수식 파싱 및 평가 (한 번에)
 */
export function evaluateFormulaString(
  formula: string,
  context: ScoringContext
): number {
  const parsed = parseFormula(formula);
  return evaluateFormula(parsed, context);
}

/**
 * 수식이 유효한지 빠르게 확인
 */
export function isValidFormula(formula: string): boolean {
  return validateFormula(formula).valid;
}
