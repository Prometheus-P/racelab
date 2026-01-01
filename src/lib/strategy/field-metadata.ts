/**
 * Extended Field Metadata
 *
 * 50+ 변수를 카테고리별로 정의
 * #126 글로벌 벤치마크 기능 Parity
 */

// =============================================================================
// Field Categories
// =============================================================================

export type FieldCategory =
  | 'odds' // 배당/수급
  | 'horse' // 경주마 정보
  | 'jockey' // 기수
  | 'trainer' // 조교사
  | 'race' // 경주 조건
  | 'performance'; // 성적/적성

export const FIELD_CATEGORIES: Record<FieldCategory, { label: string; description: string }> = {
  odds: { label: '배당/수급', description: '배당률 및 베팅 수급 관련 지표' },
  horse: { label: '경주마 정보', description: '마령, 체중, 경력 등 경주마 기본 정보' },
  jockey: { label: '기수', description: '기수 성적 및 통계' },
  trainer: { label: '조교사', description: '조교사 성적 및 통계' },
  race: { label: '경주 조건', description: '거리, 등급, 주로 상태 등 경주 조건' },
  performance: { label: '성적/적성', description: '적성 점수 및 페이스 분석' },
};

// =============================================================================
// Extended Condition Fields - 50+ 변수
// =============================================================================

export type ExtendedConditionField =
  // ─────────────────────────────────────────────────────────────────────────
  // 배당/수급 (12개)
  // ─────────────────────────────────────────────────────────────────────────
  | 'odds_win' // 단승 배당률
  | 'odds_place' // 복승 배당률
  | 'odds_exacta' // 연승 배당률
  | 'odds_quinella' // 복연승 배당률
  | 'odds_drift_pct' // 배당률 변화율 (%)
  | 'odds_stddev' // 배당률 표준편차
  | 'odds_morning' // 아침 배당률 (첫 수집)
  | 'odds_final' // 최종 배당률
  | 'popularity_rank' // 인기순위
  | 'pool_total' // 총 매출액
  | 'pool_win_pct' // 단승 매출 비율
  | 'pool_win_amount' // 단승 매출 금액

  // ─────────────────────────────────────────────────────────────────────────
  // 경주마 정보 (15개)
  // ─────────────────────────────────────────────────────────────────────────
  | 'horse_rating' // 마 레이팅
  | 'burden_weight' // 부담중량
  | 'entry_count' // 출주 마리 수
  | 'horse_age' // 마령
  | 'horse_sex' // 성별 (1=수, 2=암, 3=거세)
  | 'horse_career_starts' // 통산 출전 수
  | 'horse_career_wins' // 통산 1착 수
  | 'horse_career_places' // 통산 3착내 수
  | 'horse_win_rate' // 통산 승률
  | 'horse_place_rate' // 통산 복승률
  | 'horse_recent_form' // 최근 5경주 평균 순위
  | 'horse_last_finish' // 직전 경주 순위
  | 'days_since_last_race' // 휴양 일수
  | 'weight_change' // 마체중 변화
  | 'current_weight' // 현재 마체중

  // ─────────────────────────────────────────────────────────────────────────
  // 기수 (6개)
  // ─────────────────────────────────────────────────────────────────────────
  | 'jockey_win_rate' // 기수 승률 (최근 1년)
  | 'jockey_place_rate' // 기수 복승률
  | 'jockey_roi' // 기수 ROI
  | 'jockey_recent_form' // 기수 최근 10경주 성적
  | 'jockey_track_rate' // 기수 해당 경주장 승률
  | 'jockey_distance_rate' // 기수 해당 거리 승률

  // ─────────────────────────────────────────────────────────────────────────
  // 조교사 (6개)
  // ─────────────────────────────────────────────────────────────────────────
  | 'trainer_win_rate' // 조교사 승률
  | 'trainer_place_rate' // 조교사 복승률
  | 'trainer_roi' // 조교사 ROI
  | 'trainer_recent_form' // 조교사 최근 10경주 성적
  | 'trainer_combo_rate' // 기수-조교사 콤보 승률
  | 'trainer_class_rate' // 조교사 해당 등급 승률

  // ─────────────────────────────────────────────────────────────────────────
  // 경주 조건 (8개)
  // ─────────────────────────────────────────────────────────────────────────
  | 'race_class' // 등급 (숫자화: 1=특, 2=1급...)
  | 'race_distance' // 거리 (m)
  | 'race_surface' // 주로 (1=잔디, 2=더트)
  | 'race_condition' // 주로상태 (1=양호, 2=약간불량...)
  | 'race_prize' // 1착 상금
  | 'race_time' // 경주 시간 (분)
  | 'field_size' // 출주 두수
  | 'race_type' // 경주 유형 (1=경마, 2=경륜, 3=경정)

  // ─────────────────────────────────────────────────────────────────────────
  // 성적/적성 (8개)
  // ─────────────────────────────────────────────────────────────────────────
  | 'distance_pref' // 거리 적성 점수 (1-5)
  | 'surface_pref' // 주로 적성 점수
  | 'track_pref' // 경주장 적성 점수
  | 'class_level_change' // 등급 변화 (+1=승급, -1=강등)
  | 'speed_rating' // 속도 레이팅
  | 'best_speed_rating' // 최고 속도 레이팅
  | 'early_pace_score' // 초반 페이스 점수
  | 'late_pace_score' // 후반 페이스 점수

  // ─────────────────────────────────────────────────────────────────────────
  // 예측 모델 전용 (12개) - Phase 2
  // ─────────────────────────────────────────────────────────────────────────
  | 'track_moisture' // 함수율 (%)
  | 'track_speed_impact' // 주로 속도 영향 계수
  | 'equipment_blinkers' // 차안대 착용 여부
  | 'equipment_first_time' // 장구 최초 착용 여부
  | 'combo_synergy_score' // 기수-조교사 시너지 점수
  | 'combo_win_rate' // 기수-조교사 콤보 승률
  | 'burden_ratio' // 부담비율 (부담중량/마체중)
  | 'burden_vs_optimal' // 최적 부담중량 대비 차이
  | 'sire_dirt_rate' // 부마 더트 승률
  | 'sire_distance_apt' // 부마 거리 적성
  | 'bloodline_apt_score' // 혈통 적성 종합 점수
  | 'gate_advantage'; // 게이트 유불리 점수

// =============================================================================
// Extended Field Metadata
// =============================================================================

export interface ExtendedFieldMetadata {
  field: ExtendedConditionField;
  label: string;
  description: string;
  unit?: string;
  min?: number;
  max?: number;
  phase: 0 | 1 | 2; // 구현 단계
  category: FieldCategory;
  /** KRA API 필드명 (직접 매핑되는 경우) */
  kraApiField?: string;
  /** 계산이 필요한 경우 true */
  computed?: boolean;
}

export const EXTENDED_FIELD_METADATA: Record<ExtendedConditionField, ExtendedFieldMetadata> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // 배당/수급 (12개)
  // ═══════════════════════════════════════════════════════════════════════════
  odds_win: {
    field: 'odds_win',
    label: '단승 배당률',
    description: '해당 마번의 단승 배당률',
    unit: '배',
    min: 1.0,
    max: 999.9,
    phase: 0,
    category: 'odds',
    kraApiField: 'winOdds',
  },
  odds_place: {
    field: 'odds_place',
    label: '복승 배당률',
    description: '해당 마번의 복승 배당률',
    unit: '배',
    min: 1.0,
    max: 999.9,
    phase: 0,
    category: 'odds',
    kraApiField: 'plcOdds',
  },
  odds_exacta: {
    field: 'odds_exacta',
    label: '연승 배당률',
    description: '1-2착 순서 맞추기 배당률',
    unit: '배',
    min: 1.0,
    max: 9999.9,
    phase: 1,
    category: 'odds',
  },
  odds_quinella: {
    field: 'odds_quinella',
    label: '복연승 배당률',
    description: '1-2착 순서 무관 배당률',
    unit: '배',
    min: 1.0,
    max: 9999.9,
    phase: 1,
    category: 'odds',
  },
  odds_drift_pct: {
    field: 'odds_drift_pct',
    label: '배당 변화율',
    description: '경주 시작 전 배당률 변화 (음수 = 하락)',
    unit: '%',
    min: -100,
    max: 1000,
    phase: 0,
    category: 'odds',
    computed: true,
  },
  odds_stddev: {
    field: 'odds_stddev',
    label: '배당 변동성',
    description: '배당률의 표준편차 (높을수록 변동 큼)',
    unit: '',
    min: 0,
    max: 100,
    phase: 0,
    category: 'odds',
    computed: true,
  },
  odds_morning: {
    field: 'odds_morning',
    label: '아침 배당률',
    description: '첫 수집 시점의 배당률',
    unit: '배',
    min: 1.0,
    max: 999.9,
    phase: 1,
    category: 'odds',
  },
  odds_final: {
    field: 'odds_final',
    label: '최종 배당률',
    description: '경주 직전 마지막 배당률',
    unit: '배',
    min: 1.0,
    max: 999.9,
    phase: 1,
    category: 'odds',
  },
  popularity_rank: {
    field: 'popularity_rank',
    label: '인기순위',
    description: '매출 기준 인기순위 (1 = 가장 인기)',
    min: 1,
    max: 20,
    phase: 0,
    category: 'odds',
  },
  pool_total: {
    field: 'pool_total',
    label: '총 매출액',
    description: '해당 경주의 총 베팅 매출액',
    unit: 'KRW',
    min: 0,
    phase: 0,
    category: 'odds',
  },
  pool_win_pct: {
    field: 'pool_win_pct',
    label: '단승 매출 비율',
    description: '총 매출 중 해당 마번의 단승 매출 비율',
    unit: '%',
    min: 0,
    max: 100,
    phase: 0,
    category: 'odds',
  },
  pool_win_amount: {
    field: 'pool_win_amount',
    label: '단승 매출 금액',
    description: '해당 마번의 단승 매출 금액',
    unit: 'KRW',
    min: 0,
    phase: 1,
    category: 'odds',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 경주마 정보 (15개)
  // ═══════════════════════════════════════════════════════════════════════════
  horse_rating: {
    field: 'horse_rating',
    label: '마 레이팅',
    description: '경주마의 능력 지수',
    min: 0,
    max: 150,
    phase: 1,
    category: 'horse',
    kraApiField: 'rating',
  },
  burden_weight: {
    field: 'burden_weight',
    label: '부담중량',
    description: '경주마가 지는 중량',
    unit: 'kg',
    min: 45,
    max: 65,
    phase: 1,
    category: 'horse',
    kraApiField: 'wgBudam',
  },
  entry_count: {
    field: 'entry_count',
    label: '출주 마리 수',
    description: '해당 경주의 총 출주 마리 수',
    min: 2,
    max: 16,
    phase: 1,
    category: 'horse',
  },
  horse_age: {
    field: 'horse_age',
    label: '마령',
    description: '경주마의 나이',
    unit: '세',
    min: 2,
    max: 12,
    phase: 1,
    category: 'horse',
    kraApiField: 'age',
  },
  horse_sex: {
    field: 'horse_sex',
    label: '성별',
    description: '경주마 성별 (1=수, 2=암, 3=거세)',
    min: 1,
    max: 3,
    phase: 1,
    category: 'horse',
    kraApiField: 'sex',
  },
  horse_career_starts: {
    field: 'horse_career_starts',
    label: '통산 출전 수',
    description: '경주마의 총 출전 횟수',
    min: 0,
    max: 200,
    phase: 1,
    category: 'horse',
    kraApiField: 'hrRcCnt',
  },
  horse_career_wins: {
    field: 'horse_career_wins',
    label: '통산 1착 수',
    description: '경주마의 통산 1착 횟수',
    min: 0,
    max: 100,
    phase: 1,
    category: 'horse',
    kraApiField: 'hrNo1CnWCnt',
  },
  horse_career_places: {
    field: 'horse_career_places',
    label: '통산 3착내 수',
    description: '경주마의 통산 3착 이내 횟수',
    min: 0,
    max: 150,
    phase: 1,
    category: 'horse',
    kraApiField: 'hrNo3CnWCnt',
  },
  horse_win_rate: {
    field: 'horse_win_rate',
    label: '통산 승률',
    description: '경주마의 통산 승률 (1착/출전)',
    unit: '%',
    min: 0,
    max: 100,
    phase: 1,
    category: 'horse',
    computed: true,
  },
  horse_place_rate: {
    field: 'horse_place_rate',
    label: '통산 복승률',
    description: '경주마의 통산 3착 이내 비율',
    unit: '%',
    min: 0,
    max: 100,
    phase: 1,
    category: 'horse',
    computed: true,
  },
  horse_recent_form: {
    field: 'horse_recent_form',
    label: '최근 5경주 평균순위',
    description: '최근 5경주의 평균 순위 (낮을수록 좋음)',
    min: 1,
    max: 16,
    phase: 1,
    category: 'horse',
    computed: true,
  },
  horse_last_finish: {
    field: 'horse_last_finish',
    label: '직전 경주 순위',
    description: '가장 최근 경주의 순위',
    min: 1,
    max: 16,
    phase: 1,
    category: 'horse',
    kraApiField: 'rcPrvOrd',
  },
  days_since_last_race: {
    field: 'days_since_last_race',
    label: '휴양 일수',
    description: '마지막 경주 이후 경과 일수',
    unit: '일',
    min: 0,
    max: 365,
    phase: 1,
    category: 'horse',
    kraApiField: 'hrRest',
  },
  weight_change: {
    field: 'weight_change',
    label: '마체중 변화',
    description: '전경주 대비 체중 변화',
    unit: 'kg',
    min: -30,
    max: 30,
    phase: 1,
    category: 'horse',
    computed: true,
  },
  current_weight: {
    field: 'current_weight',
    label: '현재 마체중',
    description: '현재 경주마의 체중',
    unit: 'kg',
    min: 400,
    max: 600,
    phase: 1,
    category: 'horse',
    kraApiField: 'wgHr',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 기수 (6개)
  // ═══════════════════════════════════════════════════════════════════════════
  jockey_win_rate: {
    field: 'jockey_win_rate',
    label: '기수 승률',
    description: '최근 1년간 기수의 승률',
    unit: '%',
    min: 0,
    max: 100,
    phase: 2,
    category: 'jockey',
    kraApiField: 'jkNo1OrdRt',
  },
  jockey_place_rate: {
    field: 'jockey_place_rate',
    label: '기수 복승률',
    description: '최근 1년간 기수의 3착 이내 비율',
    unit: '%',
    min: 0,
    max: 100,
    phase: 2,
    category: 'jockey',
    kraApiField: 'jkNo3OrdRt',
  },
  jockey_roi: {
    field: 'jockey_roi',
    label: '기수 ROI',
    description: '기수의 투자 수익률',
    unit: '%',
    min: -100,
    max: 500,
    phase: 2,
    category: 'jockey',
    computed: true,
  },
  jockey_recent_form: {
    field: 'jockey_recent_form',
    label: '기수 최근 10경주 성적',
    description: '최근 10경주의 평균 순위',
    min: 1,
    max: 16,
    phase: 2,
    category: 'jockey',
    computed: true,
  },
  jockey_track_rate: {
    field: 'jockey_track_rate',
    label: '기수 경주장별 승률',
    description: '해당 경주장에서의 기수 승률',
    unit: '%',
    min: 0,
    max: 100,
    phase: 2,
    category: 'jockey',
    computed: true,
  },
  jockey_distance_rate: {
    field: 'jockey_distance_rate',
    label: '기수 거리별 승률',
    description: '해당 거리에서의 기수 승률',
    unit: '%',
    min: 0,
    max: 100,
    phase: 2,
    category: 'jockey',
    computed: true,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 조교사 (6개)
  // ═══════════════════════════════════════════════════════════════════════════
  trainer_win_rate: {
    field: 'trainer_win_rate',
    label: '조교사 승률',
    description: '최근 1년간 조교사의 승률',
    unit: '%',
    min: 0,
    max: 100,
    phase: 2,
    category: 'trainer',
    kraApiField: 'trNo1OrdRt',
  },
  trainer_place_rate: {
    field: 'trainer_place_rate',
    label: '조교사 복승률',
    description: '최근 1년간 조교사의 3착 이내 비율',
    unit: '%',
    min: 0,
    max: 100,
    phase: 2,
    category: 'trainer',
    kraApiField: 'trNo3OrdRt',
  },
  trainer_roi: {
    field: 'trainer_roi',
    label: '조교사 ROI',
    description: '조교사의 투자 수익률',
    unit: '%',
    min: -100,
    max: 500,
    phase: 2,
    category: 'trainer',
    computed: true,
  },
  trainer_recent_form: {
    field: 'trainer_recent_form',
    label: '조교사 최근 10경주 성적',
    description: '최근 10경주의 평균 순위',
    min: 1,
    max: 16,
    phase: 2,
    category: 'trainer',
    computed: true,
  },
  trainer_combo_rate: {
    field: 'trainer_combo_rate',
    label: '기수-조교사 콤보 승률',
    description: '해당 기수-조교사 조합의 승률',
    unit: '%',
    min: 0,
    max: 100,
    phase: 2,
    category: 'trainer',
    computed: true,
  },
  trainer_class_rate: {
    field: 'trainer_class_rate',
    label: '조교사 등급별 승률',
    description: '해당 등급에서의 조교사 승률',
    unit: '%',
    min: 0,
    max: 100,
    phase: 2,
    category: 'trainer',
    computed: true,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 경주 조건 (8개)
  // ═══════════════════════════════════════════════════════════════════════════
  race_class: {
    field: 'race_class',
    label: '등급',
    description: '경주 등급 (1=특, 2=1급...)',
    min: 1,
    max: 10,
    phase: 1,
    category: 'race',
    kraApiField: 'rank',
  },
  race_distance: {
    field: 'race_distance',
    label: '거리',
    description: '경주 거리',
    unit: 'm',
    min: 1000,
    max: 3200,
    phase: 1,
    category: 'race',
    kraApiField: 'distance',
  },
  race_surface: {
    field: 'race_surface',
    label: '주로',
    description: '주로 종류 (1=잔디, 2=더트)',
    min: 1,
    max: 2,
    phase: 1,
    category: 'race',
    kraApiField: 'track',
  },
  race_condition: {
    field: 'race_condition',
    label: '주로 상태',
    description: '주로 상태 (1=양호, 2=약간불량...)',
    min: 1,
    max: 4,
    phase: 1,
    category: 'race',
    kraApiField: 'trackCond',
  },
  race_prize: {
    field: 'race_prize',
    label: '1착 상금',
    description: '1착 상금',
    unit: 'KRW',
    min: 0,
    phase: 1,
    category: 'race',
    kraApiField: 'prizeFirst',
  },
  race_time: {
    field: 'race_time',
    label: '경주 시간',
    description: '경주 시작 시간 (분, 0=00:00)',
    unit: '분',
    min: 0,
    max: 1440,
    phase: 1,
    category: 'race',
  },
  field_size: {
    field: 'field_size',
    label: '출주 두수',
    description: '해당 경주의 출주 두수',
    min: 2,
    max: 16,
    phase: 1,
    category: 'race',
  },
  race_type: {
    field: 'race_type',
    label: '경주 유형',
    description: '경주 유형 (1=경마, 2=경륜, 3=경정)',
    min: 1,
    max: 3,
    phase: 1,
    category: 'race',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 성적/적성 (8개)
  // ═══════════════════════════════════════════════════════════════════════════
  distance_pref: {
    field: 'distance_pref',
    label: '거리 적성',
    description: '거리 적성 점수 (1-5, 높을수록 적합)',
    min: 1,
    max: 5,
    phase: 2,
    category: 'performance',
    computed: true,
  },
  surface_pref: {
    field: 'surface_pref',
    label: '주로 적성',
    description: '주로 적성 점수 (1-5, 높을수록 적합)',
    min: 1,
    max: 5,
    phase: 2,
    category: 'performance',
    computed: true,
  },
  track_pref: {
    field: 'track_pref',
    label: '경주장 적성',
    description: '경주장 적성 점수 (1-5, 높을수록 적합)',
    min: 1,
    max: 5,
    phase: 2,
    category: 'performance',
    computed: true,
  },
  class_level_change: {
    field: 'class_level_change',
    label: '등급 변화',
    description: '등급 변화 (+1=승급, -1=강등, 0=유지)',
    min: -5,
    max: 5,
    phase: 2,
    category: 'performance',
    computed: true,
  },
  speed_rating: {
    field: 'speed_rating',
    label: '속도 레이팅',
    description: '최근 경주의 속도 레이팅',
    min: 0,
    max: 150,
    phase: 2,
    category: 'performance',
    computed: true,
  },
  best_speed_rating: {
    field: 'best_speed_rating',
    label: '최고 속도 레이팅',
    description: '통산 최고 속도 레이팅',
    min: 0,
    max: 150,
    phase: 2,
    category: 'performance',
    computed: true,
  },
  early_pace_score: {
    field: 'early_pace_score',
    label: '초반 페이스',
    description: '초반 페이스 점수 (높을수록 선행형)',
    min: 0,
    max: 100,
    phase: 2,
    category: 'performance',
    computed: true,
  },
  late_pace_score: {
    field: 'late_pace_score',
    label: '후반 페이스',
    description: '후반 페이스 점수 (높을수록 추입형)',
    min: 0,
    max: 100,
    phase: 2,
    category: 'performance',
    computed: true,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 예측 모델 전용 (12개)
  // ═══════════════════════════════════════════════════════════════════════════
  track_moisture: {
    field: 'track_moisture',
    label: '함수율',
    description: '주로의 수분 함유량 (%), 높을수록 빠른 주로',
    unit: '%',
    min: 0,
    max: 100,
    phase: 2,
    category: 'race',
    computed: false,
  },
  track_speed_impact: {
    field: 'track_speed_impact',
    label: '주로 속도영향',
    description: '주로상태에 따른 속도 영향 계수 (1.0=기준)',
    min: 0.9,
    max: 1.2,
    phase: 2,
    category: 'race',
    computed: true,
  },
  equipment_blinkers: {
    field: 'equipment_blinkers',
    label: '차안대 착용',
    description: '차안대(블링커) 착용 여부 (1=착용, 0=미착용)',
    min: 0,
    max: 1,
    phase: 2,
    category: 'horse',
    computed: false,
  },
  equipment_first_time: {
    field: 'equipment_first_time',
    label: '장구 최초착용',
    description: '이번 경주가 장구 최초 착용인지 여부 (1=최초, 0=아님)',
    min: 0,
    max: 1,
    phase: 2,
    category: 'horse',
    computed: false,
  },
  combo_synergy_score: {
    field: 'combo_synergy_score',
    label: '기수-조교사 시너지',
    description: '기수-조교사 조합의 시너지 점수 (0-100)',
    min: 0,
    max: 100,
    phase: 2,
    category: 'trainer',
    computed: true,
  },
  combo_win_rate: {
    field: 'combo_win_rate',
    label: '콤보 승률',
    description: '해당 기수-조교사 조합의 승률 (%)',
    unit: '%',
    min: 0,
    max: 100,
    phase: 2,
    category: 'trainer',
    computed: true,
  },
  burden_ratio: {
    field: 'burden_ratio',
    label: '부담비율',
    description: '부담중량/마체중 비율 (%)',
    unit: '%',
    min: 8,
    max: 15,
    phase: 2,
    category: 'horse',
    computed: true,
  },
  burden_vs_optimal: {
    field: 'burden_vs_optimal',
    label: '최적부담 대비',
    description: '최적 부담중량 대비 차이 (kg)',
    unit: 'kg',
    min: -10,
    max: 10,
    phase: 2,
    category: 'horse',
    computed: true,
  },
  sire_dirt_rate: {
    field: 'sire_dirt_rate',
    label: '부마 더트승률',
    description: '부마(씨수마) 자마들의 더트 주로 승률 (%)',
    unit: '%',
    min: 0,
    max: 100,
    phase: 2,
    category: 'performance',
    computed: true,
  },
  sire_distance_apt: {
    field: 'sire_distance_apt',
    label: '부마 거리적성',
    description: '부마 기반 해당 거리 적성 점수 (1-5)',
    min: 1,
    max: 5,
    phase: 2,
    category: 'performance',
    computed: true,
  },
  bloodline_apt_score: {
    field: 'bloodline_apt_score',
    label: '혈통 적성',
    description: '혈통 기반 종합 적성 점수 (0-100)',
    min: 0,
    max: 100,
    phase: 2,
    category: 'performance',
    computed: true,
  },
  gate_advantage: {
    field: 'gate_advantage',
    label: '게이트 유불리',
    description: '게이트 위치에 따른 유불리 점수 (-10 ~ +10)',
    min: -10,
    max: 10,
    phase: 2,
    category: 'race',
    computed: true,
  },
};

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * 카테고리별 필드 목록 가져오기
 */
export function getFieldsByCategory(category: FieldCategory): ExtendedConditionField[] {
  return Object.values(EXTENDED_FIELD_METADATA)
    .filter((meta) => meta.category === category)
    .map((meta) => meta.field);
}

/**
 * Phase별 필드 목록 가져오기
 */
export function getFieldsByPhase(phase: 0 | 1 | 2): ExtendedConditionField[] {
  return Object.values(EXTENDED_FIELD_METADATA)
    .filter((meta) => meta.phase <= phase)
    .map((meta) => meta.field);
}

/**
 * 계산 필요한 필드 목록
 */
export function getComputedFields(): ExtendedConditionField[] {
  return Object.values(EXTENDED_FIELD_METADATA)
    .filter((meta) => meta.computed)
    .map((meta) => meta.field);
}

/**
 * react-querybuilder용 필드 포맷으로 변환
 */
export function toQueryBuilderFields(category?: FieldCategory) {
  const fields = category
    ? Object.values(EXTENDED_FIELD_METADATA).filter((meta) => meta.category === category)
    : Object.values(EXTENDED_FIELD_METADATA);

  return fields.map((meta) => ({
    name: meta.field,
    label: meta.label,
    inputType: 'number' as const,
    placeholder: meta.description,
    validator: (r: { value: unknown }) => {
      const value = Number(r.value);
      if (meta.min !== undefined && value < meta.min) return false;
      if (meta.max !== undefined && value > meta.max) return false;
      return true;
    },
  }));
}

// 총 필드 수 상수
export const TOTAL_FIELD_COUNT = Object.keys(EXTENDED_FIELD_METADATA).length;
