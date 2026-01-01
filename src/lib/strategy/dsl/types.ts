/**
 * DSL Strategy Type Definitions
 *
 * PRD v3.0 기반 DSL 전략 정의 타입
 * YAML/JSON 입력을 지원하며, 기존 JSON 조건 시스템과 하위 호환
 */

import type {
  ConditionOperator,
  TimeReference,
  BetAction,
  ConditionField,
} from '../types';

// =============================================================================
// DSL Field Mapping - Dot Notation to Flat
// =============================================================================

/**
 * DSL dot notation 필드를 기존 flat 필드로 매핑
 */
export const DSL_FIELD_MAPPING: Record<string, ConditionField> = {
  // 배당률
  'odds.win': 'odds_win',
  'odds.place': 'odds_place',
  'odds.drift_pct': 'odds_drift_pct',
  'odds.stddev': 'odds_stddev',
  // 수급
  'popularity.rank': 'popularity_rank',
  'pool.total': 'pool_total',
  'pool.win_pct': 'pool_win_pct',
  // 경주마
  'horse.rating': 'horse_rating',
  'burden.weight': 'burden_weight',
  'entry.count': 'entry_count',
};

/**
 * 역매핑 (flat → dot notation)
 */
export const REVERSE_FIELD_MAPPING: Record<ConditionField, string> = Object.entries(
  DSL_FIELD_MAPPING
).reduce(
  (acc, [dotNotation, flatField]) => {
    acc[flatField] = dotNotation;
    return acc;
  },
  {} as Record<ConditionField, string>
);

/**
 * 허용된 DSL 필드 목록 (dot notation)
 */
export const ALLOWED_DSL_FIELDS = Object.keys(DSL_FIELD_MAPPING);

// =============================================================================
// DSL Filter - 조건 정의
// =============================================================================

/**
 * DSL 필터 (조건) 정의
 * dot notation 필드명 지원 (예: 'odds.win')
 */
export interface DSLFilter {
  /** 필드명 (dot notation: 'odds.win' 또는 flat: 'odds_win') */
  field: string;

  /** 비교 연산자 */
  operator: ConditionOperator;

  /**
   * 비교 값
   * - 단일 값: number | string
   * - between: [min, max]
   * - in: number[] | string[]
   */
  value: number | string | [number, number] | number[] | string[];

  /** 시간 참조점 (선택) */
  timeRef?: TimeReference;
}

// =============================================================================
// DSL Scoring - 수식 기반 점수 계산
// =============================================================================

/**
 * 스코어링 설정
 * 수학 수식을 통한 후보 점수 계산
 */
export interface DSLScoring {
  /**
   * 수식 문자열 (최대 200자)
   * 예: "(odds_win * horse_rating) / 100 - 1"
   *
   * 지원 연산자: +, -, *, /, ^, ()
   * 지원 함수: min, max, abs, floor, ceil, round, sqrt
   */
  formula: string;

  /**
   * 최소 점수 임계값 (선택)
   * 이 값 미만인 후보는 제외
   */
  threshold?: number;
}

// =============================================================================
// DSL Execution - Sandbox 실행 (Phase 2+)
// =============================================================================

/**
 * Sandbox 실행 설정
 * Phase 2+에서 구현 예정, 현재는 필드만 예약
 */
export interface DSLExecution {
  /** Sandbox 유형 */
  sandbox?: 'javascript' | 'wasm';

  /** 사용자 정의 코드 */
  code?: string;
}

// =============================================================================
// DSL Stake - 베팅 금액 설정
// =============================================================================

/**
 * 베팅 금액 설정
 */
export interface DSLStake {
  /** 고정 금액 (KRW) */
  fixed?: number;

  /** 자본 대비 비율 (0-100%) */
  percentOfBankroll?: number;

  /** Kelly Criterion 사용 여부 */
  useKelly?: boolean;
}

// =============================================================================
// DSL Race Filters - 경주 필터
// =============================================================================

/**
 * 경주 필터 설정
 */
export interface DSLRaceFilters {
  /** 경주 유형 */
  raceTypes?: ('horse' | 'cycle' | 'boat')[];

  /** 경주장 코드 */
  tracks?: string[];

  /** 등급 */
  grades?: string[];

  /** 최소 출주 마리 수 */
  minEntries?: number;
}

// =============================================================================
// DSL Metadata - 메타데이터
// =============================================================================

/**
 * 전략 메타데이터
 */
export interface DSLMetadata {
  /** 작성자 */
  author?: string;

  /** 설명 */
  description?: string;

  /** 태그 */
  tags?: string[];

  /** 생성일 (ISO 8601) */
  createdAt?: string;

  /** 수정일 (ISO 8601) */
  updatedAt?: string;
}

// =============================================================================
// DSL Strategy Definition - 전체 전략 정의
// =============================================================================

/**
 * DSL 전략의 내부 구조
 */
export interface DSLStrategyBody {
  /** 전략 이름 */
  name: string;

  /** 버전 (정수) */
  version: number;

  /** 필터 조건 목록 (최대 10개) */
  filters: DSLFilter[];

  /** 스코어링 설정 (선택) */
  scoring?: DSLScoring;

  /** Sandbox 실행 설정 (Phase 2+, 선택) */
  execution?: DSLExecution;

  /** 베팅 액션 (기본값: 'bet_win') */
  action?: BetAction;

  /** 베팅 금액 설정 (선택) */
  stake?: DSLStake;

  /** 경주 필터 (선택) */
  raceFilters?: DSLRaceFilters;

  /** 메타데이터 (선택) */
  metadata?: DSLMetadata;
}

/**
 * 완전한 DSL 전략 정의
 * YAML/JSON 루트 구조
 */
export interface DSLStrategyDefinition {
  strategy: DSLStrategyBody;
}

// =============================================================================
// Parsed Expression - 파싱된 수식
// =============================================================================

/**
 * 파싱된 수식 객체
 */
export interface ParsedExpression {
  /** 원본 수식 문자열 */
  formula: string;

  /** 파싱된 표현식 (mathjs EvalFunction) */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expression: any;

  /** 수식에서 사용된 변수 목록 */
  variables: string[];
}

/**
 * 스코어링 컨텍스트 (변수 값 맵)
 */
export interface ScoringContext {
  [key: string]: number | undefined;
}

/**
 * 스코어링 결과
 */
export interface ScoringResult {
  /** 계산된 점수 */
  score: number;

  /** 사용된 수식 */
  formula: string;

  /** 변수별 사용된 값 */
  variables: Record<string, number>;
}

// =============================================================================
// DSL Parse Result - 파싱 결과
// =============================================================================

/**
 * DSL 파싱 결과
 */
export interface DSLParseResult {
  /** 성공 여부 */
  success: boolean;

  /** 파싱된 전략 (성공 시) */
  data?: DSLStrategyDefinition;

  /** 오류 메시지 (실패 시) */
  error?: string;

  /** 감지된 포맷 */
  format?: 'yaml' | 'json';
}

// =============================================================================
// Formula Error - 수식 오류
// =============================================================================

/**
 * 수식 관련 오류 코드
 */
export type FormulaErrorCode =
  | 'FORMULA_TOO_LONG'
  | 'INVALID_VARIABLE'
  | 'PARSE_ERROR'
  | 'EVALUATION_ERROR'
  | 'MISSING_VARIABLE';

/**
 * 수식 오류
 */
export class FormulaError extends Error {
  constructor(
    public readonly code: FormulaErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'FormulaError';
  }
}

// =============================================================================
// Constants
// =============================================================================

/** 수식 최대 길이 */
export const MAX_FORMULA_LENGTH = 200;

/** 허용된 수학 함수 */
export const ALLOWED_FUNCTIONS = [
  'min',
  'max',
  'abs',
  'floor',
  'ceil',
  'round',
  'sqrt',
] as const;

/** 허용된 수식 변수 (flat 필드명) */
export const ALLOWED_FORMULA_VARIABLES = [
  'odds_win',
  'odds_place',
  'odds_drift_pct',
  'odds_stddev',
  'popularity_rank',
  'pool_total',
  'pool_win_pct',
  'horse_rating',
  'burden_weight',
  'entry_count',
] as const;
