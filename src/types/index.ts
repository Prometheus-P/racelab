// src/types/index.ts

export type RaceType = 'horse' | 'cycle' | 'boat';
export type RaceStatus = 'upcoming' | 'live' | 'finished' | 'canceled';
export type EntryStatus = 'active' | 'scratched'; // Example, will be refined in Entry type

export * from './race';
export * from './entry';
export * from './result';
export * from './oddsSnapshot';

export type DividendType = 'win' | 'place' | 'quinella';

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

