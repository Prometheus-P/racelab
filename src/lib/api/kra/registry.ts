/**
 * KRA API Registry
 *
 * 공공데이터 포털 한국마사회 API 엔드포인트 레지스트리
 * Base URL: https://apis.data.go.kr/B551015
 */

export interface ApiEndpoint {
  /** API 엔드포인트 경로 */
  endpoint: string;
  /** 날짜 파라미터 이름 */
  dateParam: string;
  /** API 설명 */
  description: string;
  /** 필수 파라미터 */
  requiredParams?: string[];
  /** 선택 파라미터 */
  optionalParams?: string[];
}

/**
 * KRA API 레지스트리
 *
 * 모든 API 엔드포인트와 파라미터 정보를 중앙 관리
 */
export const KRA_API_REGISTRY = {
  // =====================
  // 경주 정보 (Race)
  // =====================

  /** API299: 경주결과종합 (현재 사용중) */
  RACE_RESULT_TOTAL: {
    endpoint: '/API299/Race_Result_total',
    dateParam: 'rc_date',
    description: '경주결과종합 - 경주일자별 전체 경주 결과',
  },

  /** API187: 경마경주정보 - 연간 경주계획 */
  RACE_INFO: {
    endpoint: '/API187/HorseRaceInfo',
    dateParam: 'ym_fr',
    description: '경마경주정보 - 연간 경주계획 (경마장, 등급별 경주수)',
    optionalParams: ['ym_to', 'meet'],
  },

  // =====================
  // 기수 정보 (Jockey)
  // =====================

  /** API11_1: 기수 성적 정보 */
  JOCKEY_RESULT: {
    endpoint: '/API11_1/jockeyResult_1',
    dateParam: 'rc_date',
    description: '기수 성적 - 통산출주횟수, 통산전적, 승률 등',
    optionalParams: ['meet', 'jkNo'],
  },

  /** API12_1: 기수 상세정보 */
  JOCKEY_INFO: {
    endpoint: '/API12_1/jockeyInfo_1',
    dateParam: 'rc_date',
    description: '기수 상세 - 기수명, 소속조, 통산 1위횟수 등',
    optionalParams: ['meet', 'jkNo'],
  },

  /** API308: 조교사정보_영문추가 (기수 정보도 포함) */
  JOCKEY_INFO_EN: {
    endpoint: '/API308/jockeyInfo',
    dateParam: 'rc_date',
    description: '기수 정보 (영문 포함) - 기수명, 영문명, 통산승률 등',
    optionalParams: ['meet'],
  },

  // =====================
  // 조교사 정보 (Trainer)
  // =====================

  /** API308: 조교사정보_영문추가 */
  TRAINER_INFO: {
    endpoint: '/API308/trainerInfo',
    dateParam: 'rc_date',
    description: '조교사 정보 - 조교사명, 영문명, 통산출주횟수, 승률 등',
    optionalParams: ['meet', 'trNo'],
  },

  /** 조교사별두수 */
  TRAINER_HORSE_COUNT: {
    endpoint: '/hrtrdusu/gethrtrdusu',
    dateParam: 'rc_date',
    description: '조교사별 관리마 두수 - 등급별 마필 수',
    optionalParams: ['meet'],
  },

  // =====================
  // 마필 정보 (Horse)
  // =====================

  /** API8_2: 경주마 상세정보 */
  HORSE_INFO: {
    endpoint: '/API8_2/raceHorseInfo_2',
    dateParam: 'rc_date',
    description: '마필 상세 - 마명, 성별, 생년월일, 조교사, 레이팅 등',
    optionalParams: ['meet', 'hrNo'],
  },

  /** API15_2: 경주마 성적 정보 */
  HORSE_RESULT: {
    endpoint: '/API15_2/raceHorseResult_2',
    dateParam: 'rc_date',
    description: '마필 성적 - 경주기록, 경주성적, 요약성적 등',
    requiredParams: ['hrNo'],
  },

  /** API42: 마필종합 상세정보 */
  HORSE_TOTAL_INFO: {
    endpoint: '/API42/totalHorseInfo',
    dateParam: 'rc_date',
    description: '마필 종합정보 - 생산국, 수입국, 원마명, 품종, 털색 등',
    optionalParams: ['hrNo'],
  },

  /** 경주마명단 */
  HORSE_LIST: {
    endpoint: '/racehorselist/getracehorselist',
    dateParam: 'rc_date',
    description: '경주마 명단 - 전체 마필 목록',
    optionalParams: ['meet'],
  },

  // =====================
  // 출마표/출전 정보 (Entry)
  // =====================

  /** API23_1: 출전 등록말 정보 */
  ENTRY_HORSE: {
    endpoint: '/API23_1/entryRaceHorse_1',
    dateParam: 'rc_date',
    description: '출전 등록말 - 출전신청 현황, 경주명, 등급조건 등',
    optionalParams: ['meet', 'rcNo'],
  },

  /** API9_1: 경주마 출전취소 정보 */
  ENTRY_CANCEL: {
    endpoint: '/API9_1/raceHorseCancelInfo_1',
    dateParam: 'rc_date',
    description: '출전취소 - 취소된 마필 정보, 변경사유',
    optionalParams: ['meet'],
  },

  // =====================
  // 배당률 정보 (Odds)
  // =====================

  /** 확정배당율 통합 정보 */
  ODDS_FINAL: {
    endpoint: '/API???/finalOdds', // TODO: 정확한 엔드포인트 확인 필요
    dateParam: 'rc_date',
    description: '확정배당율 통합 - 단승, 복승, 연승, 쌍승 등',
    optionalParams: ['meet', 'rcNo'],
  },

  /** 당일 확정배당율종합 */
  ODDS_TODAY: {
    endpoint: '/API???/todayOdds', // TODO: 정확한 엔드포인트 확인 필요
    dateParam: 'rc_date',
    description: '당일 확정배당율 - WIN, PLC, QNL, EXA, QPL, TLA 등',
    optionalParams: ['meet', 'rcNo'],
  },
} as const satisfies Record<string, ApiEndpoint>;

export type KraApiKey = keyof typeof KRA_API_REGISTRY;

/**
 * 경마장 코드
 */
export const MEET_CODES = {
  SEOUL: '1', // 서울경마장
  BUSAN: '3', // 부산경남경마장
  JEJU: '2', // 제주경마장
} as const;

export type MeetCode = (typeof MEET_CODES)[keyof typeof MEET_CODES];

/**
 * KRA API Base URL
 */
export const KRA_BASE_URL = 'https://apis.data.go.kr/B551015';
