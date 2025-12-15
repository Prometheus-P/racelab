// src/types/index.ts

// Import Race type for use in TodayRacesData
import type { Race } from './race';

export type RaceType = 'horse' | 'cycle' | 'boat';
export type RaceStatus = 'upcoming' | 'live' | 'finished' | 'canceled';
export type EntryStatus = 'active' | 'scratched'; // Example, will be refined in Entry type

export * from './race';
export * from './entry';
export * from './result';
export * from './oddsSnapshot';

export type DividendType = 'win' | 'place' | 'quinella';

export interface Dividend {
  type: DividendType;
  entries: number[]; // 해당 배당에 포함된 출전번호들
  amount: number; // 배당금액 (원)
}

// Other types that remain in index.ts or will be moved
export interface ResultsSearchParams {
  dateFrom?: string;
  dateTo?: string;
  types?: RaceType[];
  track?: string;
  jockey?: string;
  page?: number;
  limit?: number;
  /**
   * Indicates that the API supplied a default date range (today) rather than a user-provided filter.
   * Used to determine whether mock data should ignore strict date filtering when upstream APIs fail.
   */
  useDefaultDateRange?: boolean;
}

export interface PaginatedResults<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface HistoricalRaceResult {
  rank: number;
  entryNo: number;
  name: string;
  jockey?: string;
  trainer?: string;
  time?: string;
  timeDiff?: string;
}

export interface HistoricalRace {
  id: string;
  type: RaceType;
  raceNo: number;
  track: string;
  date: string;
  startTime: string;
  distance?: number;
  grade?: string;
  status: 'finished' | 'canceled';
  results: HistoricalRaceResult[];
  dividends: Dividend[];
}

// Track information by race type
export interface Track {
  code: string;
  name: string;
  raceType: RaceType;
}

// Racer information (경정/경륜 선수)
export interface Racer {
  id: string; // 선수 번호
  name: string; // 선수명
  grade?: string; // 등급 코드
  totalStarts?: number; // 출주 수
  avgRank?: number | null;
  winRate?: number | null;
  topRate?: number | null; // 입상률
  top3Rate?: number | null; // 3위 내 입상률
  avgStartTime?: number | null;
  accidentScore?: number | null;
}

// Boat operation/support info
export interface BoatPartMaster {
  codeName: string; // parts_item_cd_nm
  spec: string; // supp_spec_nm
}

export interface BoatSupplierInfo {
  name: string; // supp_nm
  spec: string; // supp_spec_nm
}

export interface BoatEquipmentReport {
  year: string; // stnd_yr
  reprDate: string; // repr_ymd
  equipmentType: string; // equip_tpe_nm
  description: string; // repr_desc_cn
  mainParts: string; // mjr_parts_nm
}

export interface BoatRacerTilt {
  raceNo: number;
  tilt: string;
  jacketWeight: string;
  boatWeight: string;
  bodyWeight: number;
  week: number;
  day: number;
  racerNo: string;
}

export interface BoatRacerCondition {
  year: string;
  week: number;
  racerNo: string;
  health: string;
  training: string;
}

// ============================================================================
// Production Hardening Types (006-production-hardening)
// ============================================================================

/**
 * API fetch 결과 상태
 * - OK: 정상 응답
 * - NOT_FOUND: 요청한 리소스가 존재하지 않음
 * - UPSTREAM_ERROR: 외부 API 오류 또는 타임아웃
 */
export type RaceFetchStatus = 'OK' | 'NOT_FOUND' | 'UPSTREAM_ERROR';

/**
 * API fetch 결과 래퍼
 * @template T - 성공 시 반환되는 데이터 타입
 */
export interface RaceFetchResult<T> {
  /** 결과 상태 */
  status: RaceFetchStatus;
  /** 성공 시 데이터, 실패 시 null */
  data: T | null;
  /** 에러 발생 시 메시지 (선택) */
  error?: string;
}

/**
 * 오늘의 전체 경주 데이터
 * 홈 페이지에서 한 번 fetch 후 TodayRaces, QuickStats에 전달
 */
export interface TodayRacesData {
  /** 경마 경주 목록 */
  horse: Race[];
  /** 경륜 경주 목록 */
  cycle: Race[];
  /** 경정 경주 목록 */
  boat: Race[];
  /** 각 종목별 fetch 상태 (부분 실패 처리용) */
  status: {
    horse: RaceFetchStatus;
    cycle: RaceFetchStatus;
    boat: RaceFetchStatus;
  };
}

