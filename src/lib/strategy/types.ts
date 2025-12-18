/**
 * Strategy DSL Type Definitions
 *
 * JSON 기반 베팅 전략 정의를 위한 타입 시스템
 * 보안을 위해 eval() 없이 whitelist 기반 파싱만 허용
 */

// =============================================================================
// Condition Fields - 전략 조건에 사용 가능한 필드
// =============================================================================

/**
 * 조건 평가에 사용할 수 있는 필드 목록
 * Phase 0: 배당률 관련 기본 필드
 * Phase 2+: 기수/조교사 통계 확장 예정
 */
export type ConditionField =
  // 배당률 관련 (Phase 0)
  | 'odds_win' // 단승 배당률
  | 'odds_place' // 복승 배당률
  | 'odds_drift_pct' // 배당률 변화율 (%) = (last - first) / first * 100
  | 'odds_stddev' // 배당률 표준편차 (변동성)
  // 수급 관련 (Phase 0)
  | 'popularity_rank' // 인기순위 (1 = 가장 인기)
  | 'pool_total' // 총 매출액 (KRW)
  | 'pool_win_pct' // 단승 매출 비율 (%)
  // 경주마 정보 (Phase 1)
  | 'horse_rating' // 마 레이팅
  | 'burden_weight' // 부담중량 (kg)
  | 'entry_count'; // 출주 마리 수
// 기수/조교사 (Phase 2 - 외부 데이터 필요)
// | 'jockey_win_rate'    // 기수 승률
// | 'trainer_win_rate'   // 조교사 승률

/**
 * 필드별 메타데이터 - 검증 및 UI 표시용
 */
export interface FieldMetadata {
  field: ConditionField;
  label: string;
  description: string;
  unit?: string;
  min?: number;
  max?: number;
  phase: 0 | 1 | 2; // 구현 단계
}

export const FIELD_METADATA: Record<ConditionField, FieldMetadata> = {
  odds_win: {
    field: 'odds_win',
    label: '단승 배당률',
    description: '해당 마번의 단승 배당률',
    unit: '배',
    min: 1.0,
    max: 999.9,
    phase: 0,
  },
  odds_place: {
    field: 'odds_place',
    label: '복승 배당률',
    description: '해당 마번의 복승 배당률',
    unit: '배',
    min: 1.0,
    max: 999.9,
    phase: 0,
  },
  odds_drift_pct: {
    field: 'odds_drift_pct',
    label: '배당 변화율',
    description: '경주 시작 전 배당률 변화 (음수 = 하락)',
    unit: '%',
    min: -100,
    max: 1000,
    phase: 0,
  },
  odds_stddev: {
    field: 'odds_stddev',
    label: '배당 변동성',
    description: '배당률의 표준편차 (높을수록 변동 큼)',
    unit: '',
    min: 0,
    max: 100,
    phase: 0,
  },
  popularity_rank: {
    field: 'popularity_rank',
    label: '인기순위',
    description: '매출 기준 인기순위 (1 = 가장 인기)',
    min: 1,
    max: 20,
    phase: 0,
  },
  pool_total: {
    field: 'pool_total',
    label: '총 매출액',
    description: '해당 경주의 총 베팅 매출액',
    unit: 'KRW',
    min: 0,
    phase: 0,
  },
  pool_win_pct: {
    field: 'pool_win_pct',
    label: '단승 매출 비율',
    description: '총 매출 중 해당 마번의 단승 매출 비율',
    unit: '%',
    min: 0,
    max: 100,
    phase: 0,
  },
  horse_rating: {
    field: 'horse_rating',
    label: '마 레이팅',
    description: '경주마의 능력 지수',
    min: 0,
    max: 150,
    phase: 1,
  },
  burden_weight: {
    field: 'burden_weight',
    label: '부담중량',
    description: '경주마가 지는 중량',
    unit: 'kg',
    min: 45,
    max: 65,
    phase: 1,
  },
  entry_count: {
    field: 'entry_count',
    label: '출주 마리 수',
    description: '해당 경주의 총 출주 마리 수',
    min: 2,
    max: 16,
    phase: 1,
  },
};

// =============================================================================
// Condition Operators - 비교 연산자
// =============================================================================

/**
 * 지원하는 비교 연산자
 */
export type ConditionOperator =
  | 'eq' // 같다 (==)
  | 'ne' // 다르다 (!=)
  | 'gt' // 크다 (>)
  | 'gte' // 크거나 같다 (>=)
  | 'lt' // 작다 (<)
  | 'lte' // 작거나 같다 (<=)
  | 'between' // 범위 내 (min <= x <= max)
  | 'in'; // 목록 포함

/**
 * 연산자별 메타데이터
 */
export interface OperatorMetadata {
  operator: ConditionOperator;
  label: string;
  symbol: string;
  requiresRange: boolean; // between용
  requiresList: boolean; // in용
}

export const OPERATOR_METADATA: Record<ConditionOperator, OperatorMetadata> = {
  eq: { operator: 'eq', label: '같다', symbol: '=', requiresRange: false, requiresList: false },
  ne: { operator: 'ne', label: '다르다', symbol: '≠', requiresRange: false, requiresList: false },
  gt: { operator: 'gt', label: '크다', symbol: '>', requiresRange: false, requiresList: false },
  gte: {
    operator: 'gte',
    label: '크거나 같다',
    symbol: '≥',
    requiresRange: false,
    requiresList: false,
  },
  lt: { operator: 'lt', label: '작다', symbol: '<', requiresRange: false, requiresList: false },
  lte: {
    operator: 'lte',
    label: '작거나 같다',
    symbol: '≤',
    requiresRange: false,
    requiresList: false,
  },
  between: {
    operator: 'between',
    label: '범위 내',
    symbol: '∈',
    requiresRange: true,
    requiresList: false,
  },
  in: { operator: 'in', label: '포함', symbol: '∈', requiresRange: false, requiresList: true },
};

// =============================================================================
// Time Reference - 시간 참조점
// =============================================================================

/**
 * 시계열 데이터의 시간 참조점
 * 배당률은 경주 전까지 계속 변하므로 어느 시점의 값을 사용할지 지정
 */
export type TimeReference =
  | 'first' // 최초 수집 시점
  | 'last' // 최종 수집 시점 (경주 직전)
  | 'T-5m' // 경주 5분 전
  | 'T-15m' // 경주 15분 전
  | 'T-30m' // 경주 30분 전
  | 'T-60m'; // 경주 60분 전

// =============================================================================
// Strategy Condition - 단일 조건
// =============================================================================

/**
 * 단일 조건 정의
 */
export interface StrategyCondition {
  /** 평가할 필드 */
  field: ConditionField;

  /** 비교 연산자 */
  operator: ConditionOperator;

  /**
   * 비교 값
   * - 단일 값: number | string
   * - between: [min, max]
   * - in: number[] | string[]
   */
  value: number | string | [number, number] | number[] | string[];

  /**
   * 시간 참조점 (선택)
   * 기본값: 'last' (최종 배당률)
   */
  timeRef?: TimeReference;
}

// =============================================================================
// Bet Action - 베팅 액션
// =============================================================================

/**
 * 조건 충족 시 실행할 액션
 */
export type BetAction =
  | 'bet_win' // 단승 베팅
  | 'bet_place' // 복승 베팅
  | 'bet_quinella' // 연승 베팅 (추후)
  | 'skip'; // 베팅 안함

// =============================================================================
// Strategy Definition - 전략 정의
// =============================================================================

/**
 * 완전한 전략 정의
 */
export interface StrategyDefinition {
  /** 고유 식별자 (UUID 권장) */
  id: string;

  /** 전략 이름 */
  name: string;

  /** 버전 (semver) */
  version: string;

  /**
   * 진입 조건 목록
   * 모든 조건이 AND로 결합됨
   * 복잡한 OR 조건은 별도 전략으로 분리 권장
   */
  conditions: StrategyCondition[];

  /** 조건 충족 시 실행할 액션 */
  action: BetAction;

  /**
   * 베팅 금액 설정 (선택)
   */
  stake?: {
    /** 고정 금액 (KRW) */
    fixed?: number;
    /** 자본 대비 비율 (%) */
    percentOfBankroll?: number;
    /** Kelly Criterion 적용 여부 */
    useKelly?: boolean;
  };

  /**
   * 필터 조건 (선택)
   * 백테스트 대상 경주 제한
   */
  filters?: {
    /** 경주 유형 */
    raceTypes?: ('horse' | 'cycle' | 'boat')[];
    /** 경주장 코드 */
    tracks?: string[];
    /** 등급 */
    grades?: string[];
    /** 최소 출주 마리 수 */
    minEntries?: number;
  };

  /** 메타데이터 */
  metadata: {
    /** 작성자 */
    author: string;
    /** 생성일 (ISO 8601) */
    createdAt: string;
    /** 수정일 (ISO 8601) */
    updatedAt?: string;
    /** 설명 */
    description?: string;
    /** 태그 */
    tags?: string[];
  };
}

// =============================================================================
// Backtest Request/Result Types
// =============================================================================

/**
 * 백테스트 요청
 */
export interface BacktestRequest {
  /** 테스트할 전략 */
  strategy: StrategyDefinition;

  /** 테스트 기간 */
  dateRange: {
    from: string; // ISO date (YYYY-MM-DD)
    to: string; // ISO date (YYYY-MM-DD)
  };

  /** 초기 자본금 (KRW) */
  initialCapital?: number;

  /** 추가 필터 (전략 필터 오버라이드) */
  filters?: StrategyDefinition['filters'];
}

/**
 * 개별 베팅 기록
 */
export interface BetRecord {
  /** 경주 ID */
  raceId: string;

  /** 경주 날짜 */
  raceDate: string;

  /** 경주장 */
  track: string;

  /** 경주 번호 */
  raceNo: number;

  /** 베팅한 마번 */
  entryNo: number;

  /** 베팅 금액 */
  betAmount: number;

  /** 베팅 시점 배당률 */
  oddsAtBet: number;

  /** 결과 */
  result: 'win' | 'lose' | 'refund';

  /** 손익 */
  profit: number;

  /** 베팅 후 누적 자본 */
  cumulativeCapital: number;
}

/**
 * 백테스트 결과 요약
 */
export interface BacktestSummary {
  /** 분석 대상 총 경주 수 */
  totalRaces: number;

  /** 조건 충족한 경주 수 */
  matchedRaces: number;

  /** 실제 베팅 횟수 */
  totalBets: number;

  /** 승리 횟수 */
  wins: number;

  /** 패배 횟수 */
  losses: number;

  /** 환불 횟수 */
  refunds: number;

  /** 승률 (%) */
  winRate: number;

  /** 총 수익 (KRW) */
  totalProfit: number;

  /** ROI (%) = 총수익 / 총베팅액 * 100 */
  roi: number;

  /** 최대 낙폭 MDD (%) */
  maxDrawdown: number;

  /** 최종 자본 (KRW) */
  finalCapital: number;

  /** 자본 대비 수익률 (%) */
  capitalReturn: number;

  /** 평균 배당률 */
  avgOdds: number;

  /** 평균 베팅 금액 */
  avgBetAmount: number;

  /** 최대 연승 */
  maxWinStreak: number;

  /** 최대 연패 */
  maxLoseStreak: number;
}

/**
 * 자본 곡선 데이터 포인트
 */
export interface EquityPoint {
  date: string;
  capital: number;
  drawdown: number;
}

/**
 * 완전한 백테스트 결과
 */
export interface BacktestResult {
  /** 요청 정보 */
  request: BacktestRequest;

  /** 결과 요약 */
  summary: BacktestSummary;

  /** 개별 베팅 기록 */
  bets: BetRecord[];

  /** 자본 곡선 */
  equityCurve: EquityPoint[];

  /** 실행 메타데이터 */
  executedAt: string;
  executionTimeMs: number;
}

// =============================================================================
// Validation Error Types
// =============================================================================

/**
 * 전략 검증 오류
 */
export interface StrategyValidationError {
  path: string; // e.g., "conditions[0].field"
  message: string;
  code:
    | 'INVALID_FIELD'
    | 'INVALID_OPERATOR'
    | 'INVALID_VALUE'
    | 'INVALID_TIME_REF'
    | 'EMPTY_CONDITIONS'
    | 'TOO_MANY_CONDITIONS'
    | 'INVALID_DATE_RANGE'
    | 'SCHEMA_ERROR';
}

/**
 * 검증 결과
 */
export interface ValidationResult {
  valid: boolean;
  errors: StrategyValidationError[];
  warnings?: string[];
}

// =============================================================================
// Constants
// =============================================================================

/** 최대 조건 수 */
export const MAX_CONDITIONS = 10;

/** 최대 백테스트 기간 (일) - 티어별로 다름 */
export const MAX_BACKTEST_DAYS = {
  Gold: 90,
  QuantLab: 365,
} as const;

/** 기본 초기 자본금 */
export const DEFAULT_INITIAL_CAPITAL = 1_000_000; // 100만원

/** 기본 고정 베팅 금액 */
export const DEFAULT_BET_AMOUNT = 10_000; // 1만원
