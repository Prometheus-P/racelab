/**
 * Strategy Module
 *
 * Strategy DSL 정의, 검증, 평가를 위한 모듈
 */

// Types
export type {
  ConditionField,
  ConditionOperator,
  TimeReference,
  BetAction,
  StrategyCondition,
  StrategyDefinition,
  BacktestRequest,
  BetRecord,
  BacktestSummary,
  EquityPoint,
  BacktestResult,
  StrategyValidationError,
  ValidationResult,
  FieldMetadata,
  OperatorMetadata,
} from './types';

// Constants
export {
  FIELD_METADATA,
  OPERATOR_METADATA,
  MAX_CONDITIONS,
  MAX_BACKTEST_DAYS,
  DEFAULT_INITIAL_CAPITAL,
  DEFAULT_BET_AMOUNT,
} from './types';

// Validator
export {
  validateStrategy,
  validateCondition,
  validateBacktestRequest,
  parseStrategy,
  safeParseStrategy,
  isValidStrategy,
  isValidCondition,
  getAllowedFields,
  getAllowedOperators,
  getAllowedTimeRefs,
  getFieldsByPhase,
} from './validator';

// Evaluator
export {
  StrategyEvaluator,
  evaluateRace,
  evaluateRaces,
  calculateOddsDrift,
  calculateOddsStdDev,
  calculatePoolPercentage,
  type EntryContext,
  type RaceContext,
  type EvaluationResult,
  type ConditionResult,
} from './evaluator';
