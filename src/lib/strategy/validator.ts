/**
 * Strategy DSL Validator
 *
 * Zod 기반 전략 정의 검증
 * 보안: whitelist 기반 필드/연산자만 허용
 */

import { z } from 'zod';
import {
  type StrategyDefinition,
  type StrategyCondition,
  type ValidationResult,
  type StrategyValidationError,
  type ConditionField,
  type ConditionOperator,
  type TimeReference,
  type BetAction,
  FIELD_METADATA,
  OPERATOR_METADATA,
  MAX_CONDITIONS,
} from './types';

// =============================================================================
// Allowed Values (Whitelist)
// =============================================================================

const ALLOWED_FIELDS: readonly ConditionField[] = Object.keys(FIELD_METADATA) as ConditionField[];

const ALLOWED_OPERATORS: readonly ConditionOperator[] = Object.keys(
  OPERATOR_METADATA
) as ConditionOperator[];

const ALLOWED_TIME_REFS: readonly TimeReference[] = [
  'first',
  'last',
  'T-5m',
  'T-15m',
  'T-30m',
  'T-60m',
];

const ALLOWED_ACTIONS: readonly BetAction[] = ['bet_win', 'bet_place', 'bet_quinella', 'skip'];

const ALLOWED_RACE_TYPES = ['horse', 'cycle', 'boat'] as const;

// =============================================================================
// Zod Schemas
// =============================================================================

/**
 * 조건 필드 스키마
 */
const conditionFieldSchema = z.enum(ALLOWED_FIELDS as [ConditionField, ...ConditionField[]]);

/**
 * 조건 연산자 스키마
 */
const conditionOperatorSchema = z.enum(
  ALLOWED_OPERATORS as [ConditionOperator, ...ConditionOperator[]]
);

/**
 * 시간 참조 스키마
 */
const timeRefSchema = z.enum(ALLOWED_TIME_REFS as [TimeReference, ...TimeReference[]]);

/**
 * 조건 값 스키마 - 연산자에 따라 다른 값 타입 허용
 */
const conditionValueSchema = z.union([
  z.number(),
  z.string(),
  z.tuple([z.number(), z.number()]), // between 범위
  z.array(z.number()), // in 목록
  z.array(z.string()), // in 목록 (문자열)
]);

/**
 * 단일 조건 스키마
 */
const strategyConditionSchema = z
  .object({
    field: conditionFieldSchema,
    operator: conditionOperatorSchema,
    value: conditionValueSchema,
    timeRef: timeRefSchema.optional(),
  })
  .refine(
    (data) => {
      const op = data.operator as string;
      // between 연산자는 [min, max] 배열 필요
      if (op === 'between') {
        return (
          Array.isArray(data.value) &&
          data.value.length === 2 &&
          typeof data.value[0] === 'number' &&
          typeof data.value[1] === 'number'
        );
      }
      // in 연산자는 배열 필요
      if (op === 'in') {
        return Array.isArray(data.value) && data.value.length > 0;
      }
      // 다른 연산자는 단일 값 (배열이면 안됨)
      return !Array.isArray(data.value);
    },
    {
      message: 'Invalid value type for operator',
    }
  );

/**
 * 베팅 액션 스키마
 */
const betActionSchema = z.enum(ALLOWED_ACTIONS as [BetAction, ...BetAction[]]);

/**
 * 스테이크 설정 스키마
 */
const stakeSchema = z
  .object({
    fixed: z.number().positive().optional(),
    percentOfBankroll: z.number().min(0).max(100).optional(),
    useKelly: z.boolean().optional(),
  })
  .optional();

/**
 * 필터 스키마
 */
const filtersSchema = z
  .object({
    raceTypes: z.array(z.enum(ALLOWED_RACE_TYPES)).optional(),
    tracks: z.array(z.string().min(1)).optional(),
    grades: z.array(z.string().min(1)).optional(),
    minEntries: z.number().int().min(2).max(20).optional(),
  })
  .optional();

/**
 * 메타데이터 스키마
 */
const metadataSchema = z.object({
  author: z.string().min(1).max(100),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string().min(1).max(50)).max(10).optional(),
});

/**
 * 전체 전략 정의 스키마
 */
const strategyDefinitionSchema = z
  .object({
    id: z
      .string()
      .min(1)
      .max(100)
      .regex(/^[a-zA-Z0-9_-]+$/, 'ID must be alphanumeric with _ or -'),
    name: z.string().min(1).max(200),
    version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be semver format (x.y.z)'),
    conditions: z.array(strategyConditionSchema).min(1).max(MAX_CONDITIONS),
    action: betActionSchema,
    stake: stakeSchema,
    filters: filtersSchema,
    metadata: metadataSchema,
  })
  .strict(); // 추가 필드 허용 안함

/**
 * 백테스트 요청 스키마
 */
const backtestRequestSchema = z.object({
  strategy: strategyDefinitionSchema,
  dateRange: z.object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  }),
  initialCapital: z.number().positive().optional(),
  filters: filtersSchema,
});

// =============================================================================
// Validation Functions
// =============================================================================

/**
 * 전략 정의 검증
 */
export function validateStrategy(input: unknown): ValidationResult {
  const result = strategyDefinitionSchema.safeParse(input);

  if (result.success) {
    // 추가 비즈니스 로직 검증
    const warnings: string[] = [];
    const strategy = result.data as StrategyDefinition;

    // Phase 1+ 필드 사용 경고
    for (const condition of strategy.conditions) {
      const metadata = FIELD_METADATA[condition.field];
      if (metadata.phase > 0) {
        warnings.push(
          `Field '${condition.field}' is Phase ${metadata.phase} feature and may have limited data`
        );
      }
    }

    // 배당 변화율 사용 시 timeRef 권장
    const hasDriftCondition = strategy.conditions.some((c) => c.field === 'odds_drift_pct');
    if (hasDriftCondition) {
      const driftConditions = strategy.conditions.filter((c) => c.field === 'odds_drift_pct');
      for (const c of driftConditions) {
        if (!c.timeRef) {
          warnings.push(
            "odds_drift_pct condition without timeRef will use default 'last' (final odds)"
          );
        }
      }
    }

    return {
      valid: true,
      errors: [],
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  // Zod 오류를 ValidationError로 변환
  // Zod 4.x uses .issues, Zod 3.x uses .errors
  const zodErrors = result.error?.issues ?? [];
  const errors: StrategyValidationError[] = zodErrors.map((err: z.ZodIssue) => ({
    path: err.path.join('.'),
    message: err.message,
    code: mapZodErrorToCode(err),
  }));

  return {
    valid: false,
    errors,
  };
}

/**
 * 백테스트 요청 검증
 */
export function validateBacktestRequest(input: unknown): ValidationResult {
  const result = backtestRequestSchema.safeParse(input);

  if (result.success) {
    const data = result.data;

    // 날짜 범위 검증
    const fromDate = new Date(data.dateRange.from);
    const toDate = new Date(data.dateRange.to);

    if (fromDate > toDate) {
      return {
        valid: false,
        errors: [
          {
            path: 'dateRange',
            message: 'from date must be before to date',
            code: 'INVALID_DATE_RANGE',
          },
        ],
      };
    }

    // 최대 기간 검증은 티어별로 다르므로 여기서는 기본 검증만
    const daysDiff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 365) {
      return {
        valid: false,
        errors: [
          {
            path: 'dateRange',
            message: 'Maximum backtest period is 365 days',
            code: 'INVALID_DATE_RANGE',
          },
        ],
      };
    }

    return { valid: true, errors: [] };
  }

  const zodErrors = result.error?.issues ?? [];
  const errors: StrategyValidationError[] = zodErrors.map((err: z.ZodIssue) => ({
    path: err.path.join('.'),
    message: err.message,
    code: mapZodErrorToCode(err),
  }));

  return { valid: false, errors };
}

/**
 * 단일 조건 검증 (유틸리티)
 */
export function validateCondition(input: unknown): ValidationResult {
  const result = strategyConditionSchema.safeParse(input);

  if (result.success) {
    return { valid: true, errors: [] };
  }

  const zodErrors = result.error?.issues ?? [];
  const errors: StrategyValidationError[] = zodErrors.map((err: z.ZodIssue) => ({
    path: err.path.join('.'),
    message: err.message,
    code: mapZodErrorToCode(err),
  }));

  return { valid: false, errors };
}

// =============================================================================
// Type Guards
// =============================================================================

/**
 * StrategyDefinition 타입 가드
 */
export function isValidStrategy(input: unknown): input is StrategyDefinition {
  return validateStrategy(input).valid;
}

/**
 * StrategyCondition 타입 가드
 */
export function isValidCondition(input: unknown): input is StrategyCondition {
  return validateCondition(input).valid;
}

// =============================================================================
// Parsing Functions (with validation)
// =============================================================================

/**
 * JSON 문자열을 StrategyDefinition으로 파싱
 * @throws Error if invalid JSON or validation fails
 */
export function parseStrategy(jsonString: string): StrategyDefinition {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error('Invalid JSON format');
  }

  const validation = validateStrategy(parsed);
  if (!validation.valid) {
    const errorMessages = validation.errors.map((e) => `${e.path}: ${e.message}`).join('; ');
    throw new Error(`Strategy validation failed: ${errorMessages}`);
  }

  return parsed as StrategyDefinition;
}

/**
 * 안전한 파싱 (에러 대신 결과 객체 반환)
 */
export function safeParseStrategy(jsonString: string): {
  success: boolean;
  data?: StrategyDefinition;
  error?: string;
} {
  try {
    const data = parseStrategy(jsonString);
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Zod 오류를 커스텀 오류 코드로 매핑
 */
function mapZodErrorToCode(
  err: z.ZodIssue
): StrategyValidationError['code'] {
  const path = err.path.join('.');

  if (path.includes('field')) return 'INVALID_FIELD';
  if (path.includes('operator')) return 'INVALID_OPERATOR';
  if (path.includes('value')) return 'INVALID_VALUE';
  if (path.includes('timeRef')) return 'INVALID_TIME_REF';
  if (path.includes('conditions') && err.code === 'too_small') return 'EMPTY_CONDITIONS';
  if (path.includes('conditions') && err.code === 'too_big') return 'TOO_MANY_CONDITIONS';
  if (path.includes('dateRange')) return 'INVALID_DATE_RANGE';

  return 'SCHEMA_ERROR';
}

/**
 * 허용된 필드 목록 반환 (UI용)
 */
export function getAllowedFields(): readonly ConditionField[] {
  return ALLOWED_FIELDS;
}

/**
 * 허용된 연산자 목록 반환 (UI용)
 */
export function getAllowedOperators(): readonly ConditionOperator[] {
  return ALLOWED_OPERATORS;
}

/**
 * 허용된 시간 참조 목록 반환 (UI용)
 */
export function getAllowedTimeRefs(): readonly TimeReference[] {
  return ALLOWED_TIME_REFS;
}

/**
 * 특정 Phase까지의 필드만 반환
 */
export function getFieldsByPhase(maxPhase: 0 | 1 | 2): ConditionField[] {
  return ALLOWED_FIELDS.filter((field) => FIELD_METADATA[field].phase <= maxPhase);
}

// =============================================================================
// Export Schemas (for external validation)
// =============================================================================

export {
  strategyDefinitionSchema,
  strategyConditionSchema,
  backtestRequestSchema,
  conditionFieldSchema,
  conditionOperatorSchema,
};
