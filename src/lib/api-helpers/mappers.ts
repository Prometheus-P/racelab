// src/lib/api-helpers/mappers.ts
import { Race, Entry, Odds, KSPOOddsResponse } from '@/types';

// Type definitions for raw API response items (legacy API214 format)
export interface KRAHorseRaceItem {
  meet?: string;
  rcNo?: string;
  rcDate?: string;
  rcTime?: string;
  rcDist?: string;
  rank?: string;
  hrNo?: string;
  hrName?: string;
  jkName?: string;
  trName?: string;
  age?: string;
  wgHr?: string;
  rcRst?: string;
}

// API323 출전등록현황 response format
export interface KRA323EntryItem {
  ag?: number;          // 연령
  gndr?: string;        // 성별 (수/암/거)
  hrnm?: string;        // 마명
  raceDt?: number;      // 경주일자 (YYYYMMDD)
  raceDotw?: string;    // 경주요일
  raceNo?: number;      // 경주번호
  ratg?: number;        // 레이팅
  rcptNo?: number;      // 접수번호
  trarNm?: string;      // 조교사명
  ownerNm?: string;     // 마주명
  prds?: string;        // 산지 (한/미/일 등)
  erngSump?: string;    // 총상금
  loyProdNm?: string;   // 부마명
}

// API299 경주결과종합 response format
export interface KRA299ResultItem {
  meet?: string;        // 경마장명
  rcDate?: number;      // 경주일자
  rcNo?: number;        // 경주번호
  chulNo?: number;      // 출전번호
  ord?: number;         // 순위
  hrName?: string;      // 마명
  hrNo?: string;        // 마번
  jkName?: string;      // 기수명
  jkNo?: string;        // 기수번호
  rcTime?: number;      // 주파기록
  age?: number;         // 연령
  rank?: string;        // 등급
  schStTime?: string;   // 발주예정시각
  seG1fAccTime?: number; // 결승 1F 누적시간
  seG3fAccTime?: number; // 결승 3F 누적시간
  seS1fAccTime?: number; // 출발 1F 누적시간
}

// Legacy API214 format (deprecated)
export interface KSPORaceItem {
  meet?: string;
  rcNo?: string;
  rcDate?: string;
  rcTime?: string;
  rcDist?: string;
  hrNo?: string;
  hrName?: string;
  age?: string;
  recentRecord?: string;
}

// New approved API format: SRVC_OD_API_CRA_RACE_ORGAN (경륜 출주표)
export interface KSPOCycleRaceOrganItem {
  meet_nm?: string;      // 경기장명 (광명/창원/부산)
  stnd_yr?: string;      // 기준년도
  week_tcnt?: string;    // 주회차
  day_tcnt?: string;     // 일회차
  race_no?: string;      // 경주번호
  back_no?: string;      // 배번
  racer_nm?: string;     // 선수명
  racer_age?: string;    // 선수연령
  win_rate?: string;     // 승률
  gear_rate?: string;    // 기어배율
  rec_200m_scr?: string; // 200m 기록
}

// New approved API format: SRVC_OD_API_VWEB_MBR_RACE_INFO (경정 출주표)
export interface KSPOBoatRaceInfoItem {
  meet_nm?: string;      // 경기장명 (미사리)
  stnd_yr?: string;      // 기준년도
  week_tcnt?: string;    // 주회차
  day_tcnt?: string;     // 일회차
  race_no?: string;      // 경주번호
  back_no?: string;      // 배번
  racer_nm?: string;     // 선수명
  racer_age?: string;    // 선수연령
  wght?: string;         // 체중
  motor_no?: string;     // 모터번호
  boat_no?: string;      // 보트번호
  tms_6_avg_rank_scr?: string; // 최근6회차 평균착순점수
}

/**
 * Generate a unique race ID with validation
 * Throws error if required fields are missing to prevent invalid/duplicate IDs
 */
function generateRaceId(
  type: 'horse' | 'cycle' | 'boat',
  meet: string | undefined,
  rcNo: string | undefined,
  rcDate: string | undefined
): string {
  if (!meet || !rcNo || !rcDate) {
    // Log warning but don't throw to avoid breaking the app for bad API data
    console.warn(`Missing required fields for race ID generation: meet=${meet}, rcNo=${rcNo}, rcDate=${rcDate}`);
    // Generate a fallback ID with timestamp to ensure uniqueness
    const timestamp = Date.now();
    return `${type}-unknown-${timestamp}`;
  }
  return `${type}-${meet}-${rcNo}-${rcDate}`;
}

// Helper function to map KRA API response item to our internal Race type
export function mapKRAHorseRaceToRace(item: KRAHorseRaceItem): Race {
  // Extract entry data for horse races
  const entries: Entry[] = [];
  // For KRA API, entry data seems to be directly within the race item
  // based on API_SPECIFICATION.md and test mock.
  // Note: This is a simplified mapping. Real API might require separate calls for entries.
  if (item.hrNo && item.hrName) { // Check if entry data is present
    entries.push({
      no: parseInt(item.hrNo),
      name: item.hrName,
      jockey: item.jkName,
      trainer: item.trName,
      age: item.age ? parseInt(item.age) : undefined,
      weight: item.wgHr ? parseInt(item.wgHr) : undefined,
      recentRecord: item.rcRst,
      // odds will be added in Phase 2
    });
  }

  return {
    id: generateRaceId('horse', item.meet, item.rcNo, item.rcDate),
    type: 'horse',
    raceNo: item.rcNo ? parseInt(item.rcNo) : 0,
    track: item.meet === '1' ? '서울' : item.meet === '2' ? '부산경남' : '제주',
    startTime: item.rcTime || '',
    distance: item.rcDist ? parseInt(item.rcDist) : undefined,
    grade: item.rank,
    status: 'upcoming',
    entries: entries,
  };
}

// Helper function to map KSPO Cycle API response item to our internal Race type
export function mapKSPOCycleRaceToRace(item: KSPORaceItem): Race {
  // Extract entry data for cycle races
  const entries: Entry[] = [];
  if (item.hrNo && item.hrName) { // hrNo from test mock implies entry data
    entries.push({
      no: parseInt(item.hrNo),
      name: item.hrName,
      age: item.age ? parseInt(item.age) : undefined,
      recentRecord: item.recentRecord,
    });
  }

  return {
    id: generateRaceId('cycle', item.meet, item.rcNo, item.rcDate),
    type: 'cycle',
    raceNo: item.rcNo ? parseInt(item.rcNo) : 0,
    track: item.meet === '1' ? '광명' : item.meet === '2' ? '창원' : '부산',
    startTime: item.rcTime || '',
    distance: item.rcDist ? parseInt(item.rcDist) : undefined,
    grade: undefined,
    status: 'upcoming',
    entries: entries,
  };
}

// Helper function to map KSPO Boat API response item to our internal Race type
export function mapKSPOBoatRaceToRace(item: KSPORaceItem): Race {
  // Extract entry data for boat races
  const entries: Entry[] = [];
  if (item.hrNo && item.hrName) { // hrNo from test mock implies entry data
    entries.push({
      no: parseInt(item.hrNo),
      name: item.hrName,
      age: item.age ? parseInt(item.age) : undefined,
      recentRecord: item.recentRecord,
    });
  }

  return {
    id: generateRaceId('boat', item.meet, item.rcNo, item.rcDate),
    type: 'boat',
    raceNo: item.rcNo ? parseInt(item.rcNo) : 0,
    track: '미사리',
    startTime: item.rcTime || '',
    distance: undefined,
    grade: undefined,
    status: 'upcoming',
    entries: entries,
  };
}

/**
 * Map new SRVC_OD_API_CRA_RACE_ORGAN items to Race objects
 * Groups entries by race number for cycle races
 */
export function mapKSPOCycleRaceOrganToRaces(items: KSPOCycleRaceOrganItem[], rcDate: string): Race[] {
  const raceMap = new Map<string, Race>();

  for (const item of items) {
    const raceNo = item.race_no || '0';
    const meetCode = item.meet_nm === '광명' ? '1' : item.meet_nm === '창원' ? '2' : '3';
    const raceId = `cycle-${meetCode}-${raceNo}-${rcDate}`;

    let race = raceMap.get(raceId);
    if (!race) {
      race = {
        id: raceId,
        type: 'cycle',
        raceNo: parseInt(raceNo),
        track: item.meet_nm || '광명',
        startTime: '',
        status: 'upcoming',
        entries: [],
      };
      raceMap.set(raceId, race);
    }

    // Add entry to race
    if (item.racer_nm) {
      race.entries = race.entries || [];
      race.entries.push({
        no: item.back_no ? parseInt(item.back_no) : race.entries.length + 1,
        name: item.racer_nm,
        age: item.racer_age ? parseInt(item.racer_age) : undefined,
        recentRecord: item.win_rate ? `승률 ${item.win_rate}%` : undefined,
      });
    }
  }

  return Array.from(raceMap.values()).sort((a, b) => a.raceNo - b.raceNo);
}

/**
 * Map new SRVC_OD_API_VWEB_MBR_RACE_INFO items to Race objects
 * Groups entries by race number for boat races
 */
export function mapKSPOBoatRaceInfoToRaces(items: KSPOBoatRaceInfoItem[], rcDate: string): Race[] {
  const raceMap = new Map<string, Race>();

  for (const item of items) {
    const raceNo = item.race_no || '0';
    const raceId = `boat-1-${raceNo}-${rcDate}`;

    let race = raceMap.get(raceId);
    if (!race) {
      race = {
        id: raceId,
        type: 'boat',
        raceNo: parseInt(raceNo),
        track: item.meet_nm || '미사리',
        startTime: '',
        status: 'upcoming',
        entries: [],
      };
      raceMap.set(raceId, race);
    }

    // Add entry to race
    if (item.racer_nm) {
      race.entries = race.entries || [];
      race.entries.push({
        no: item.back_no ? parseInt(item.back_no) : race.entries.length + 1,
        name: item.racer_nm,
        age: item.racer_age ? parseInt(item.racer_age) : undefined,
        recentRecord: item.tms_6_avg_rank_scr ? `평균착순 ${item.tms_6_avg_rank_scr}` : undefined,
      });
    }
  }

  return Array.from(raceMap.values()).sort((a, b) => a.raceNo - b.raceNo);
}

/**
 * Map API323 출전등록현황 items to Race objects
 * Groups entries by race number
 */
export function mapKRA323ToRaces(items: KRA323EntryItem[]): Race[] {
  const raceMap = new Map<string, Race>();

  for (const item of items) {
    const rcDate = item.raceDt?.toString() || '';
    const raceNo = item.raceNo || 0;
    const raceId = `horse-1-${raceNo}-${rcDate}`;

    let race = raceMap.get(raceId);
    if (!race) {
      race = {
        id: raceId,
        type: 'horse',
        raceNo: raceNo,
        track: '서울',
        startTime: '',
        status: 'upcoming',
        entries: [],
      };
      raceMap.set(raceId, race);
    }

    // Add entry to race
    if (item.hrnm) {
      race.entries = race.entries || [];
      race.entries.push({
        no: item.rcptNo || race.entries.length + 1,
        name: item.hrnm,
        trainer: item.trarNm,
        age: item.ag,
      });
    }
  }

  return Array.from(raceMap.values()).sort((a, b) => a.raceNo - b.raceNo);
}

/**
 * Map API299 경주결과종합 items to Race objects
 * Groups entries by race number, includes result data
 */
export function mapKRA299ToRaces(items: KRA299ResultItem[]): Race[] {
  const raceMap = new Map<string, Race>();

  for (const item of items) {
    const rcDate = item.rcDate?.toString() || '';
    const raceNo = item.rcNo || 0;
    const meet = item.meet === '서울' ? '1' : item.meet === '부산' ? '3' : '2';
    const raceId = `horse-${meet}-${raceNo}-${rcDate}`;

    let race = raceMap.get(raceId);
    if (!race) {
      // Parse start time from schStTime (ISO format)
      const startTime = item.schStTime
        ? new Date(item.schStTime).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
        : '';

      race = {
        id: raceId,
        type: 'horse',
        raceNo: raceNo,
        track: item.meet || '서울',
        startTime: startTime,
        grade: item.rank,
        status: 'finished',
        entries: [],
      };
      raceMap.set(raceId, race);
    }

    // Add entry to race
    if (item.hrName) {
      race.entries = race.entries || [];
      race.entries.push({
        no: item.chulNo || race.entries.length + 1,
        name: item.hrName,
        jockey: item.jkName,
        age: item.age,
      });
    }
  }

  return Array.from(raceMap.values()).sort((a, b) => a.raceNo - b.raceNo);
}

// Helper function to parse odds value from string
function parseOddsValue(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}

// Helper function to map KSPO odds response to our internal Odds type
export function mapOddsResponse(kspoResponse: KSPOOddsResponse): Odds {
  return {
    win: parseOddsValue(kspoResponse.oddsDansng),
    place: parseOddsValue(kspoResponse.oddsBoksng),
    quinella: parseOddsValue(kspoResponse.oddsSsangsng),
  };
}