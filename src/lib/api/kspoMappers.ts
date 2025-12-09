// src/lib/api/kspoMappers.ts
// KSPO(경륜/경정) 전용 매핑 모듈

import {
  Race,
  Entry,
  Odds,
  KSPOOddsResponse,
  HistoricalRace,
  HistoricalRaceResult,
  Dividend,
  Racer,
  RaceType,
} from '@/types';
import { generateRaceId } from '../utils/race';
import { parseOddsValue } from '../utils/parser';

// Raw API response item interfaces for KSPO
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
  meet_nm?: string; // 경기장명 (광명/창원/부산)
  stnd_yr?: string; // 기준년도
  week_tcnt?: string; // 주회차
  day_tcnt?: string; // 일회차
  race_no?: string; // 경주번호
  back_no?: string; // 배번
  racer_nm?: string; // 선수명
  racer_age?: string; // 선수연령
  win_rate?: string; // 승률
  gear_rate?: string; // 기어배율
  rec_200m_scr?: string; // 200m 기록
  // 추가 필드 (출주표 상세)
  run_day_tcnt?: string;
  pre_win_cnt?: string;
  pas_win_cnt?: string;
  brk_win_cnt?: string;
  mrk_win_cnt?: string;
  racer_grd_cur_cd?: string;
  racer_grd_bef_cd?: string;
  area_tms3_avg_scr?: string;
  tot_tms_avg_scr?: string;
  bf1_meet_nm_nm?: string;
  bf1_day1_ymd?: string;
  bf1_day1_rank?: string;
  bf1_day2_rank?: string;
  bf1_day3_rank?: string;
  bf2_meet_nm?: string;
  race_ymd?: string;
  color_nm?: string;
  period_no?: string;
  trng_plc_nm?: string;
  high_rate?: string;
  high_3_rate?: string;
  racer_grd_cd?: string;
  dptre_tm?: string;
  round_cnt?: string;
  race_len?: string;
  win_tot_tcnt?: string;
  bf2_day1_ymd?: string;
  bf2_day1_rank?: string;
  bf2_day2_rank?: string;
  bf2_day3_rank?: string;
  bf3_meet_nm?: string;
  bf3_day1_ymd?: string;
  bf3_day1_rank?: string;
  bf3_day2_rank?: string;
  bf3_day3_rank?: string;
  row_num?: string;
}

// New approved API format: SRVC_OD_API_VWEB_MBR_RACE_INFO (경정 출주표)
export interface KSPOBoatRaceInfoItem {
  meet_nm?: string; // 경기장명 (미사리)
  stnd_yr?: string; // 기준년도
  week_tcnt?: string; // 주회차
  day_tcnt?: string; // 일회차
  race_no?: string; // 경주번호
  back_no?: string; // 배번
  racer_nm?: string; // 선수명
  racer_age?: string; // 선수연령
  wght?: string; // 체중
  motor_no?: string; // 모터번호
  boat_no?: string; // 보트번호
  tms_6_avg_rank_scr?: string; // 최근6회차 평균착순점수
}

// 경정 경주결과
export interface KSPOBoatRaceResultItem {
  stnd_yr: string;
  race_no: string;
  rank1: string;
  rank2: string;
  rank3: string;
  pool1_val: string;
  pool2_val: string;
  pool3_val: string;
  pool4_val: string;
  pool5_val: string;
  pool6_val: string;
  week_tcnt: number | string;
  day_tcnt: string;
  row_num: string;
}

// 경정 배당률
export interface KSPOBoatPayoffItem {
  stnd_yr: string;
  race_ymd: string;
  race_no: string;
  pool1_val: string;
  pool2_1_val: string;
  pool2_2_val: string;
  pool4_val: string;
  pool5_val: string;
  pool6_val: string;
  week_tcnt: number | string;
  day_tcnt: number | string;
  row_num: string;
}

// 경정 선수정보
export interface KSPOBoatRacerInfoItem {
  rank1_tcnt: string;
  rank2_tcnt: string;
  rank3_tcnt: string;
  rank4_tcnt: string;
  rank5_tcnt: string;
  rank6_tcnt: string;
  stnd_yr: string;
  racer_nm: string;
  race_tcnt: string;
  avg_rank: string;
  avg_acdnt_scr: string;
  avg_scr: string;
  avg_strt_tm: string;
  win_ratio: string;
  high_rate: string;
  high_3_rank_ratio: string;
  row_num: string;
  racer_perio_no: string;
  racer_grd_cd: string;
}

// 경정 경주결과 순위 정보
export interface KSPOBoatRaceRankItem {
  row_num: string;
  stnd_year: string;
  tms: string;
  day_ord: string;
  race_no: string;
  race_day: string;
  racer_no: string;
  racer_nm: string;
  race_rank: string;
  mbr_nm: string;
}

// 경정 부품 마스터
export interface KSPOBoatPartMasterItem {
  parts_item_cd_nm: string;
  supp_spec_nm: string;
  row_num: string;
}

// 경정 공급 정보
export interface KSPOBoatSupplierItem {
  supp_nm: string;
  supp_spec_nm: string;
  row_num: string;
}

// 경정 장비 고장/보수 보고
export interface KSPOBoatEquipmentReportItem {
  stnd_yr: string;
  repr_ymd: string;
  equip_tpe_nm: string;
  repr_tpe_nms_yr?: string;
  mjr_parts_nm: string;
  repr_desc_cn: string;
  row_num: string;
}

// 경정 경주별 틸트/추가중량
export interface KSPOBoatRacerTiltItem {
  race_no: string;
  tilt_val: string;
  jacket_add_wght: string;
  boat_add_wght_cn: string;
  body_wght: number;
  day_tcnt: number;
  week_tcnt: number;
  stnd_yr: string;
  racer_no: string;
  row_num: string;
}

// 경정 선수 인터뷰/컨디션
export interface KSPOBoatRacerConditionItem {
  stnd_yr: string;
  week_tcnt: number;
  racer_no: string;
  heal_stat_cn: string;
  trng_stat_cn: string;
  row_num: string;
}

// 경륜 경주결과 순위 정보
export interface KSPOCycleRaceRankItem {
  row_num: string;
  stnd_year: string;
  meet_nm: string;
  tms: string;
  day_ord: string;
  race_no: string;
  race_day: string;
  racer_no: string;
  racer_nm: string;
  race_rank: string;
}

// 경륜 선수정보
export interface KSPOCycleRacerInfoItem {
  racer_nm: string;
  racer_grd_cd: string;
  run_cnt: string;
  run_day_tcnt: string;
  rank1_tcnt: string;
  win_rate: string;
  rank2_tcnt: string;
  high_rate: string;
  rank3_tcnt: string;
  high_3_rate: string;
  rank4_tcnt: string;
  stnd_yr: string;
  rank5_tcnt: string;
  rank6_tcnt: string;
  rank7_tcnt: string;
  rank8_tcnt: string;
  rank9_tcnt: string;
  elim_tcnt: string;
  down_po_cnt: string;
  go_po_tcnt: string;
  period_no: string;
  row_num: string;
}

// 경륜 배당률
export interface KSPOCyclePayoffItem {
  stnd_yr: string;
  race_ymd: string;
  race_no: string;
  pool1_val: string;
  pool2_1_val: string;
  pool2_2_val: string;
  pool4_val: string;
  pool5_val: string;
  pool6_val: string;
  week_tcnt: number | string;
  day_tcnt: number | string;
  row_num: string;
}

// 경륜 운영정보 - 훈련/운동 통계
export interface KSPOCycleExerciseItem {
  starting_nope: number;
  eclnt_nope: number;
  get_eclet_nope: number;
  tak_nope: number;
  rora_nope: number;
  repr_nope: number;
  stnd_yr: string;
  week_tcnt: number;
  day_tcnt: number;
  race_ymd: string;
  row_num: string;
}

// 경륜 운영정보 - 부품 교체/수리 단위
export interface KSPOCyclePartItem {
  mstr_unit_nm: string;
  salv_unit_nm: string;
  row_num: string;
}

// 경륜 운영정보 - 정비/점검 이력
export interface KSPOCycleInspectItem {
  bf_strt2_tcnt: number;
  bf_strt3_tcnt: number;
  bf_strt4_tcnt: number;
  bf_strt5_tcnt: number;
  now_str1_tcnt: number;
  now_str2_tcnt: number;
  now_str3_tcnt: number;
  now_str4_tcnt: number;
  now_str5_tcnt: number;
  af_str1_tcnt: number;
  af_str2_tcnt: number;
  af_str3_tcnt: number;
  af_str4_tcnt: number;
  af_str5_tcnt: number;
  max_race_ymd: string;
  cfm_insp_cnt: number;
  bf_strt1_tcnt: number;
  stnd_yr: string;
  week_tcnt: number;
  dmag_cd: string;
  row_num: string;
}

// 경륜 운영정보 - 자전거 입출고
export interface KSPOCycleInOutItem {
  day_tcnt: number;
  cycle_keep_cnt: number;
  cycle_out_cnt: number;
  week_tcnt: number;
  stnd_yr: string;
  row_num: string;
}

// 경륜 경주결과
export interface KSPOCycleRaceResultItem {
  stnd_yr: string;
  race_ymd: string;
  meet_nm: string;
  race_no: string;
  rank1: string;
  rank2: string;
  rank3: string;
  pool1_val: string;
  pool2_val: string;
  pool4_val: string;
  pool5_val: string;
  pool6_val: string;
  pool7_val: string;
  pool8_val: string;
  week_tcnt: number | string;
  day_tcnt: number | string;
  row_num: string;
}

// Helper function to map KSPO Cycle API response item to our internal Race type
export function mapKSPOCycleRaceToRace(item: KSPORaceItem): Race {
  // Extract entry data for cycle races
  const entries: Entry[] = [];
  if (item.hrNo && item.hrName) {
    // hrNo from test mock implies entry data
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
    track: item.meet === '1' ? '광명' : item.meet === '2' ? '창원' : '3',
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
  if (item.hrNo && item.hrName) {
    // hrNo from test mock implies entry data
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
export function mapKSPOCycleRaceOrganToRaces(
  items: KSPOCycleRaceOrganItem[],
  rcDate: string
): Race[] {
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
 * Map KSPO boat race results to HistoricalRace[]
 */
export function mapKSPOBoatRaceResults(
  items: KSPOBoatRaceResultItem[],
  rcDate: string
): HistoricalRace[] {
  return items.map((item) => {
    const raceNo = parseInt(item.race_no, 10) || 0;
    const id = `boat-1-${raceNo}-${rcDate}`;

    const results: HistoricalRaceResult[] = [];
    [item.rank1, item.rank2, item.rank3].forEach((rankStr, idx) => {
      const entryNo = parseInt(rankStr, 10);
      if (!Number.isNaN(entryNo)) {
        results.push({ rank: idx + 1, entryNo, name: '' });
      }
    });

    const num = (v: string) => parseFloat(v) || 0;
    const dividends: Dividend[] = [
      { type: 'win', entries: [parseInt(item.rank1, 10) || 0], amount: num(item.pool1_val) },
      { type: 'place', entries: [parseInt(item.rank2, 10) || 0], amount: num(item.pool2_val) },
      {
        type: 'quinella',
        entries: [parseInt(item.rank1, 10) || 0, parseInt(item.rank2, 10) || 0],
        amount: num(item.pool3_val),
      },
      { type: 'place', entries: [parseInt(item.rank3, 10) || 0], amount: num(item.pool4_val) },
      {
        type: 'quinella',
        entries: [parseInt(item.rank2, 10) || 0, parseInt(item.rank3, 10) || 0],
        amount: num(item.pool5_val),
      },
      {
        type: 'quinella',
        entries: [parseInt(item.rank1, 10) || 0, parseInt(item.rank3, 10) || 0],
        amount: num(item.pool6_val),
      },
    ];

    return {
      id,
      type: 'boat',
      raceNo,
      track: '미사리',
      date: rcDate,
      startTime: '',
      status: 'finished',
      results,
      dividends,
    };
  });
}

/**
 * Map KSPO boat payoffs to Dividend[]
 */
export function mapKSPOBoatPayoffs(items: KSPOBoatPayoffItem[]): Dividend[] {
  const num = (v: string) => parseFloat(v) || 0;

  return items.flatMap((item) => [
    { type: 'win', entries: [1], amount: num(item.pool1_val) },
    { type: 'place', entries: [1], amount: num(item.pool2_1_val) },
    { type: 'place', entries: [2], amount: num(item.pool2_2_val) },
    { type: 'quinella', entries: [1, 2], amount: num(item.pool4_val) },
    { type: 'quinella', entries: [1, 3], amount: num(item.pool5_val) },
    { type: 'quinella', entries: [2, 3], amount: num(item.pool6_val) },
  ]);
}

/**
 * Map KSPO boat racer info to Racer[]
 */
export function mapKSPOBoatRacerInfo(items: KSPOBoatRacerInfoItem[]): Racer[] {
  return items.map((item) => ({
    id: item.racer_perio_no,
    name: item.racer_nm,
    grade: item.racer_grd_cd,
    totalStarts: parseInt(item.race_tcnt, 10) || undefined,
    avgRank: parseFloat(item.avg_rank) || null,
    winRate: parseFloat(item.win_ratio) || null,
    topRate: parseFloat(item.high_rate) || null,
    top3Rate: parseFloat(item.high_3_rank_ratio) || null,
    avgStartTime: parseFloat(item.avg_strt_tm) || null,
    accidentScore: parseFloat(item.avg_acdnt_scr) || null,
  }));
}

/**
 * Map KSPO boat race rank info to HistoricalRace[]
 */
export function mapKSPOBoatRaceRankings(items: KSPOBoatRaceRankItem[]): HistoricalRace[] {
  return items.map((item) => {
    const raceNo = parseInt(item.race_no, 10) || 0;
    const date = item.race_day?.replace(/-/g, '') || '';
    const id = `boat-1-${raceNo}-${date}`;
    const rank = parseInt(item.race_rank, 10) || 0;
    const entryNo = parseInt(item.racer_no, 10) || rank || 0;

    const result: HistoricalRaceResult = {
      rank: rank || 1,
      entryNo,
      name: item.racer_nm,
      jockey: item.mbr_nm,
    };

    return {
      id,
      type: 'boat',
      raceNo,
      track: '미사리',
      date,
      startTime: '',
      status: 'finished',
      results: [result],
      dividends: [],
    };
  });
}

export function mapKSPOBoatPartMaster(items: KSPOBoatPartMasterItem[]) {
  return items.map((item) => ({
    codeName: item.parts_item_cd_nm,
    spec: item.supp_spec_nm,
  }));
}

export function mapKSPOBoatSupplier(items: KSPOBoatSupplierItem[]) {
  return items.map((item) => ({
    name: item.supp_nm,
    spec: item.supp_spec_nm,
  }));
}

export function mapKSPOBoatEquipmentReports(items: KSPOBoatEquipmentReportItem[]) {
  return items.map((item) => ({
    year: item.stnd_yr,
    reprDate: item.repr_ymd,
    equipmentType: item.equip_tpe_nm,
    description: item.repr_desc_cn,
    mainParts: item.mjr_parts_nm,
  }));
}

export function mapKSPOBoatRacerTilts(items: KSPOBoatRacerTiltItem[]) {
  return items.map((item) => ({
    raceNo: parseInt(item.race_no, 10) || 0,
    tilt: item.tilt_val,
    jacketWeight: item.jacket_add_wght,
    boatWeight: item.boat_add_wght_cn,
    bodyWeight: item.body_wght,
    week: item.week_tcnt,
    day: item.day_tcnt,
    racerNo: item.racer_no,
  }));
}

export function mapKSPOBoatRacerConditions(items: KSPOBoatRacerConditionItem[]) {
  return items.map((item) => ({
    year: item.stnd_yr,
    week: item.week_tcnt,
    racerNo: item.racer_no,
    health: item.heal_stat_cn,
    training: item.trng_stat_cn,
  }));
}

/**
 * Map KSPO cycle race rank info to HistoricalRace[]
 */
export function mapKSPOCycleRaceRankings(items: KSPOCycleRaceRankItem[]): HistoricalRace[] {
  return items.map((item) => {
    const raceNo = parseInt(item.race_no, 10) || 0;
    const date = item.race_day?.replace(/-/g, '') || '';
    const meetCode = item.meet_nm === '광명' ? '1' : item.meet_nm === '창원' ? '2' : '3';
    const id = `cycle-${meetCode}-${raceNo}-${date}`;
    const rank = parseInt(item.race_rank, 10) || 0;
    const entryNo = parseInt(item.racer_no, 10) || rank || 0;

    const result: HistoricalRaceResult = {
      rank: rank || 1,
      entryNo,
      name: item.racer_nm,
    };

    return {
      id,
      type: 'cycle',
      raceNo,
      track: item.meet_nm || '광명',
      date,
      startTime: '',
      status: 'finished',
      results: [result],
      dividends: [],
    };
  });
}

export function mapKSPOCyclePayoffs(items: KSPOCyclePayoffItem[]): Dividend[] {
  const num = (v: string) => parseFloat(v) || 0;

  return items.flatMap((item) => [
    { type: 'win', entries: [1], amount: num(item.pool1_val) },
    { type: 'place', entries: [1], amount: num(item.pool2_1_val) },
    { type: 'place', entries: [2], amount: num(item.pool2_2_val) },
    { type: 'quinella', entries: [1, 2], amount: num(item.pool4_val) },
    { type: 'quinella', entries: [1, 3], amount: num(item.pool5_val) },
    { type: 'quinella', entries: [2, 3], amount: num(item.pool6_val) },
  ]);
}

export function mapKSPOCycleExercise(items: KSPOCycleExerciseItem[]) {
  return items.map((item) => ({
    year: item.stnd_yr,
    week: item.week_tcnt,
    day: item.day_tcnt,
    raceDate: item.race_ymd,
    startCount: item.starting_nope,
    excellenceCount: item.eclnt_nope,
    getExcellenceCount: item.get_eclet_nope,
    takCount: item.tak_nope,
    roraCount: item.rora_nope,
    reprCount: item.repr_nope,
  }));
}

export function mapKSPOCycleParts(items: KSPOCyclePartItem[]) {
  return items.map((item) => ({
    masterUnit: item.mstr_unit_nm,
    salvageUnit: item.salv_unit_nm,
  }));
}

export function mapKSPOCycleInspects(items: KSPOCycleInspectItem[]) {
  return items.map((item) => ({
    year: item.stnd_yr,
    week: item.week_tcnt,
    damageCode: item.dmag_cd,
    maxRaceDate: item.max_race_ymd,
    confirmInspectCount: item.cfm_insp_cnt,
    bf_strt1_tcnt: item.bf_strt1_tcnt,
    bf_strt2_tcnt: item.bf_strt2_tcnt,
    bf_strt3_tcnt: item.bf_strt3_tcnt,
    bf_strt4_tcnt: item.bf_strt4_tcnt,
    bf_strt5_tcnt: item.bf_strt5_tcnt,
    now_str1_tcnt: item.now_str1_tcnt,
    now_str2_tcnt: item.now_str2_tcnt,
    now_str3_tcnt: item.now_str3_tcnt,
    now_str4_tcnt: item.now_str4_tcnt,
    now_str5_tcnt: item.now_str5_tcnt,
    af_str1_tcnt: item.af_str1_tcnt,
    af_str2_tcnt: item.af_str2_tcnt,
    af_str3_tcnt: item.af_str3_tcnt,
    af_str4_tcnt: item.af_str4_tcnt,
    af_str5_tcnt: item.af_str5_tcnt,
    row_num: item.row_num,
  }));
}

export function mapKSPOCycleInOut(items: KSPOCycleInOutItem[]) {
  return items.map((item) => ({
    year: item.stnd_yr,
    week: item.week_tcnt,
    day: item.day_tcnt,
    keepCount: item.cycle_keep_cnt,
    outCount: item.cycle_out_cnt,
  }));
}

/**
 * Map KRA horse result detail items to RaceResult[]
 */
export function mapKRAHorseResultDetails(
  items: KRAHorseResultDetailItem[]
): HistoricalRaceResult[] {
  return items.map((item) => ({
    rank: parseInt(item.rsutRk, 10) || 0,
    entryNo: parseInt(item.pthrHrno, 10) || 0,
    name: item.pthrHrnm,
    jockey: item.hrmJckyNm,
    trainer: item.hrmTrarNm,
    time: item.rsutRaceRcd,
    timeDiff: item.rsutMargin,
  }));
}

/**
 * Map KRA horse race info (API187 monthly stats) to summary objects
 */
export function mapKRAHorseRaceInfo(items: KRAHorseRaceInfoItem[]) {
  return items.map((item) => ({
    track: item.meet,
    grade: item.rank,
    originFlag: item.rcKrFlag,
    originText: item.rcKrFlagText,
    raceCount: item.rccnt,
    yearMonth: item.yyyymm,
  }));
}

/**
 * Map API23_1 entry registration to Race[] with entries
 */
export function mapKRAHorseEntryRegistration(items: KRAHorseEntryItem[]): Race[] {
  const raceMap = new Map<string, Race>();

  for (const item of items) {
    const rcDate = item.pgDate || '';
    const raceNo = item.pgNo ? parseInt(item.pgNo, 10) : 0;
    const raceId = `horse-${item.meet || '1'}-${raceNo}-${rcDate}`;

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

    race.entries?.push({
      no: item.enNo ? parseInt(item.enNo, 10) : race.entries.length + 1,
      name: item.hrName || item.name,
      age: item.age ? parseInt(item.age, 10) : undefined,
      trainer: item.trName,
      recentRecord: item.recentRating,
    });
  }

  return Array.from(raceMap.values()).sort((a, b) => a.raceNo - b.raceNo);
}

/**
 * Map API26_2 entry detail items to simplified objects
 */
export function mapKRAHorseEntryDetails(items: KRAHorseEntryDetailItem[]) {
  return items.map((item) => ({
    track: item.meet,
    raceDate: item.rcDate,
    raceDay: item.rcDay,
    raceNo: parseInt(item.rcNo, 10) || 0,
    entryNo: parseInt(item.chulNo, 10) || 0,
    horseName: item.hrName,
    horseNumber: item.hrNo,
    trainer: item.trName,
    owner: item.owName,
    jockey: item.jkName,
    rating: item.rating,
    age: item.age,
    sex: item.sex,
    weight: item.wgBudam,
    prizeCondition: item.prizeCond,
    distance: item.rcDist,
    startTime: item.stTime,
    recentRecord: item.chaksunT,
  }));
}

/**
 * Map API301 dividend summary to simplified result summaries
 */
export function mapKRAHorseDividendSummary(items: KRAHorseDividendSummaryItem[]) {
  return items.map((item) => ({
    track: item.meet,
    raceDate: item.rcDate,
    raceNo: parseInt(item.rcNo, 10) || 0,
    horseName: item.hrName || item.name,
    entryNo: parseInt(item.chulNo, 10) || 0,
    finish: parseInt(item.ord, 10) || 0,
    jockey: item.jkName,
    trainer: item.trName,
    weight: parseFloat(item.wgHr) || undefined,
    burdenWeight: parseFloat(item.wgBudam) || undefined,
    odds: parseFloat(item.finalBit) || undefined,
    raceTime: item.rcTime || item.stTime,
  }));
}

/**
 * Map KSPO cycle racer info to Racer[]
 */
export function mapKSPOCycleRacerInfo(items: KSPOCycleRacerInfoItem[]): Racer[] {
  return items.map((item) => ({
    id: item.period_no,
    name: item.racer_nm,
    grade: item.racer_grd_cd,
    totalStarts: parseInt(item.run_cnt, 10) || undefined,
    winRate: parseFloat(item.win_rate) || null,
    topRate: parseFloat(item.high_rate) || null,
    top3Rate: parseFloat(item.high_3_rate) || null,
  }));
}

/**
 * Map KSPO cycle race results to HistoricalRace[]
 */
export function mapKSPOCycleRaceResults(
  items: KSPOCycleRaceResultItem[],
  rcDate: string
): HistoricalRace[] {
  return items.map((item) => {
    const raceNo = parseInt(item.race_no, 10) || 0;
    const meetCode = item.meet_nm === '광명' ? '1' : item.meet_nm === '창원' ? '2' : '3';
    const date = rcDate || item.race_ymd?.replace(/-/g, '') || '';
    const id = `cycle-${meetCode}-${raceNo}-${date}`;

    const results: HistoricalRaceResult[] = [];
    [item.rank1, item.rank2, item.rank3].forEach((rankStr, idx) => {
      const entryNo = parseInt(rankStr, 10);
      if (!Number.isNaN(entryNo)) {
        results.push({ rank: idx + 1, entryNo, name: '' });
      }
    });

    const num = (v: string) => parseFloat(v) || 0;
    const rank1 = parseInt(item.rank1, 10) || 0;
    const rank2 = parseInt(item.rank2, 10) || 0;
    const rank3 = parseInt(item.rank3, 10) || 0;

    const dividends: Dividend[] = [
      { type: 'win', entries: [rank1], amount: num(item.pool1_val) },
      { type: 'place', entries: [rank2 || rank1], amount: num(item.pool2_val) },
      {
        type: 'quinella',
        entries: [rank1, rank2].filter(Boolean) as number[],
        amount: num(item.pool4_val),
      },
      {
        type: 'quinella',
        entries: [rank1, rank3].filter(Boolean) as number[],
        amount: num(item.pool5_val),
      },
      {
        type: 'quinella',
        entries: [rank2, rank3].filter(Boolean) as number[],
        amount: num(item.pool6_val),
      },
      {
        type: 'quinella',
        entries: [rank1, rank2, rank3].filter(Boolean) as number[],
        amount: num(item.pool7_val),
      },
      { type: 'place', entries: [rank3 || rank1], amount: num(item.pool8_val) },
    ];

    return {
      id,
      type: 'cycle',
      raceNo,
      track: item.meet_nm || '광명',
      date,
      startTime: '',
      status: 'finished',
      results,
      dividends,
    };
  });
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
        ? new Date(item.schStTime).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          })
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

// Helper function to map KSPO odds response to our internal Odds type
export function mapOddsResponse(kspoResponse: KSPOOddsResponse): Odds {
  return {
    win: parseOddsValue(kspoResponse.oddsDansng),
    place: parseOddsValue(kspoResponse.oddsBoksng),
    quinella: parseOddsValue(kspoResponse.oddsSsangsng),
  };
}
