/**
 * DSL Strategy Module
 *
 * YAML/JSON DSL 전략 정의 파싱 및 처리
 */

// Types
export type {
  DSLStrategyDefinition,
  DSLStrategyBody,
  DSLFilter,
  DSLScoring,
  DSLExecution,
  DSLStake,
  DSLRaceFilters,
  DSLMetadata,
  DSLParseResult,
  ParsedExpression,
  ScoringContext,
  ScoringResult,
  FormulaErrorCode,
} from './types';

export {
  DSL_FIELD_MAPPING,
  REVERSE_FIELD_MAPPING,
  ALLOWED_DSL_FIELDS,
  MAX_FORMULA_LENGTH,
  ALLOWED_FUNCTIONS,
  ALLOWED_FORMULA_VARIABLES,
  FormulaError,
} from './types';

// Parser
export type {
  DSLValidationErrorCode,
  DSLValidationError,
  DSLValidationResult,
} from './parser';

export {
  detectFormat,
  parseYAML,
  parseJSON,
  parseDSL,
  validateDSLStructure,
} from './parser';

// Expression Engine
export type {
  FormulaValidationError,
  FormulaValidationResult,
} from './expression';

export {
  parseFormula,
  evaluateFormula,
  validateFormula,
  extractVariables,
  evaluateFormulaString,
  isValidFormula,
} from './expression';

// Transformer
export {
  isLegacyStrategy,
  isDSLStrategy,
  normalizeStrategy,
  transformDSLToLegacy,
  transformLegacyToDSL,
} from './transformer';
