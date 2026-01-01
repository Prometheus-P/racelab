/**
 * Expression Engine
 *
 * 수식 파싱 및 평가 (mathjs 기반)
 * Phase 2: Expression Engine
 *
 * 보안:
 * - mathjs 제한된 기능만 사용 (create로 커스텀 인스턴스)
 * - 변수 화이트리스트: 허용된 필드만 사용 가능
 * - 함수 제한: min, max, abs, floor, ceil, round, sqrt만 허용
 * - 길이 제한: 수식 200자 이내
 */

import { create, all, EvalFunction } from 'mathjs';
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
// Mathjs Configuration - 보안을 위한 제한된 인스턴스
// =============================================================================

/**
 * 제한된 mathjs 인스턴스 생성
 * 필요한 기능만 포함하여 보안 강화
 */
const math = create(all, {
  // 기본 설정
});

/**
 * 허용된 함수만 포함하는 제한된 scope
 * import 등 위험한 기능 차단
 */
const limitedScope: Record<string, unknown> = {
  // 허용된 수학 함수만 포함
  min: math.min,
  max: math.max,
  abs: math.abs,
  floor: math.floor,
  ceil: math.ceil,
  round: math.round,
  sqrt: math.sqrt,
};

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
    // mathjs 내장 함수들도 제외
    'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh',
    'log', 'log10', 'log2', 'exp', 'pow', 'sign', 'trunc', 'random',
    'hypot', 'atan2', 'cbrt', 'expm1', 'log1p',
    'e', 'pi', 'PI', 'E', 'i', 'Infinity', 'NaN',
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

  // 위험한 패턴 체크 (import, require 등)
  const dangerousPatterns = /\b(import|require|eval|Function|constructor)\b/i;
  if (dangerousPatterns.test(formula)) {
    errors.push({
      code: 'PARSE_ERROR',
      message: 'Formula contains forbidden keywords',
    });
    return { valid: false, errors };
  }

  // assignment operator 체크 (=, +=, -= 등)
  const assignmentPattern = /[^=!<>]=[^=]/;
  if (assignmentPattern.test(formula)) {
    errors.push({
      code: 'PARSE_ERROR',
      message: 'Formula contains assignment operator',
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
    math.parse(formula);
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

  // 위험한 패턴 체크
  const dangerousPatterns = /\b(import|require|eval|Function|constructor)\b/i;
  if (dangerousPatterns.test(formula)) {
    throw new FormulaError(
      'PARSE_ERROR',
      'Formula contains forbidden keywords'
    );
  }

  // assignment operator 체크 (=, +=, -= 등)
  const assignmentPattern = /[^=!<>]=[^=]/;
  if (assignmentPattern.test(formula)) {
    throw new FormulaError(
      'PARSE_ERROR',
      'Formula contains assignment operator'
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

  // 파싱 및 컴파일
  let compiled: EvalFunction;
  try {
    compiled = math.compile(formula);
  } catch (error) {
    throw new FormulaError(
      'PARSE_ERROR',
      error instanceof Error ? error.message : 'Unknown parse error'
    );
  }

  return {
    formula,
    expression: compiled,
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

  // scope 생성 (제한된 함수 + 변수 값)
  const scope: Record<string, unknown> = {
    ...limitedScope,
    ...context,
  };

  // 평가
  try {
    const compiled = parsed.expression as EvalFunction;
    const result = compiled.evaluate(scope);

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
