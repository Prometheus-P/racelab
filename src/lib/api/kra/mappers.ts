/**
 * KRA API Mappers
 *
 * API 원본 응답을 내부 도메인 모델로 변환
 */

import {
  type KraJockeyResultItem,
  type KraJockeyInfoItem,
  type KraTrainerInfoItem,
  type KraHorseInfoItem,
  type KraHorseResultItem,
  type KraHorseTotalInfoItem,
  type KraEntryHorseItem,
  type Jockey,
  type Trainer,
  type Horse,
  type HorseRaceRecord,
  type RaceEntry,
  MEET_NAMES,
  SEX_NAMES,
  parseNumber,
  parsePercent,
} from './types';

// =====================
// 기수 매퍼
// =====================

/**
 * 기수 성적 원본 → 내부 모델
 */
export function mapJockeyResult(item: KraJockeyResultItem): Jockey {
  const meetName = MEET_NAMES[item.meet] || item.meet;

  return {
    id: item.jkNo,
    name: item.jkName,
    meet: item.meet,
    meetName,
    part: item.part || '',

    // 통산 성적
    totalStarts: parseNumber(item.rcCnt),
    totalWins: parseNumber(item.ord1Cnt),
    totalSeconds: parseNumber(item.ord2Cnt),
    totalThirds: parseNumber(item.ord3Cnt),
    totalPlaces: parseNumber(item.ordCnt),
    winRate: parsePercent(item.winRate),
    placeRate: parsePercent(item.ordRate),

    // 최근 1년 성적
    recentStarts: parseNumber(item.rcCnt1y),
    recentWins: parseNumber(item.ord1Cnt1y),
    recentSeconds: parseNumber(item.ord2Cnt1y),
    recentThirds: parseNumber(item.ord3Cnt1y),
    recentPlaces: parseNumber(item.ordCnt1y),
    recentWinRate: parsePercent(item.winRate1y),
    recentPlaceRate: parsePercent(item.ordRate1y),
  };
}

/**
 * 기수 상세정보 병합
 */
export function mergeJockeyInfo(
  jockey: Jockey,
  info: KraJockeyInfoItem
): Jockey {
  return {
    ...jockey,
    nameEn: info.jkNameEn,
    birthday: info.birthday,
    debutDate: info.debut,
    rating: parseNumber(info.rating),
  };
}

/**
 * 기수 목록 변환
 */
export function mapJockeyResults(items: KraJockeyResultItem[]): Jockey[] {
  return items.map(mapJockeyResult);
}

// =====================
// 조교사 매퍼
// =====================

/**
 * 조교사 정보 원본 → 내부 모델
 */
export function mapTrainerInfo(item: KraTrainerInfoItem): Trainer {
  const meetName = MEET_NAMES[item.meet] || item.meet;

  return {
    id: item.trNo,
    name: item.trName,
    nameEn: item.trNameEn,
    meet: item.meet,
    meetName,
    part: item.part,

    // 통산 성적
    totalStarts: parseNumber(item.rcCnt),
    totalWins: parseNumber(item.ord1Cnt),
    totalSeconds: parseNumber(item.ord2Cnt),
    totalThirds: parseNumber(item.ord3Cnt),
    winRate: parsePercent(item.winRate),
    placeRate: parsePercent(item.ordRate),

    // 최근 1년 성적
    recentStarts: parseNumber(item.rcCnt1y),
    recentWins: parseNumber(item.ord1Cnt1y),
    recentWinRate: parsePercent(item.winRate1y),

    // 관리마
    horseCount: parseNumber(item.hrCnt),
  };
}

/**
 * 조교사 목록 변환
 */
export function mapTrainerInfoList(items: KraTrainerInfoItem[]): Trainer[] {
  return items.map(mapTrainerInfo);
}

// =====================
// 마필 매퍼
// =====================

/**
 * 마필 상세정보 원본 → 내부 모델
 */
export function mapHorseInfo(item: KraHorseInfoItem): Horse {
  const meetName = MEET_NAMES[item.meet] || item.meet;
  const sexName = SEX_NAMES[item.sex] || item.sex;

  const totalStarts = parseNumber(item.rcCnt);
  const totalWins = parseNumber(item.ord1Cnt);
  const totalPlaces =
    totalWins + parseNumber(item.ord2Cnt) + parseNumber(item.ord3Cnt);

  return {
    id: item.hrNo,
    name: item.hrName,
    nameEn: item.hrNameEn,
    meet: item.meet,
    meetName,

    // 기본 정보
    sex: item.sex,
    sexName,
    age: parseNumber(item.age),
    birthday: item.birthday,
    grade: item.wlClass,

    // 관계자
    trainer: item.trName,
    owner: item.owName,

    // 성적
    totalStarts,
    totalWins,
    totalSeconds: parseNumber(item.ord2Cnt),
    totalThirds: parseNumber(item.ord3Cnt),
    winRate: totalStarts > 0 ? (totalWins / totalStarts) * 100 : 0,
    placeRate: totalStarts > 0 ? (totalPlaces / totalStarts) * 100 : 0,
    totalPrize: parseNumber(item.prize),

    // 최근 1년
    recentStarts: parseNumber(item.rcCnt1y),
    recentWins: parseNumber(item.ord1Cnt1y),

    // 레이팅
    rating: parseNumber(item.rating),
  };
}

/**
 * 마필 종합정보 병합
 */
export function mergeHorseTotalInfo(
  horse: Horse,
  total: KraHorseTotalInfoItem
): Horse {
  return {
    ...horse,
    sire: total.fatherHr,
    dam: total.motherHr,
    grandsire: total.grandfatherHr,
    birthCountry: total.birthNa,
    importCountry: total.impNa,
    breed: total.breedNm,
    coatColor: total.coatColor,
  };
}

/**
 * 마필 경주 기록 변환
 */
export function mapHorseRaceRecord(item: KraHorseResultItem): HorseRaceRecord {
  return {
    date: item.rcDate,
    meet: MEET_NAMES[item.meet] || item.meet,
    raceNo: parseNumber(item.rcNo),
    distance: parseNumber(item.rcDist),
    position: parseNumber(item.ord),
    time: item.rcTime,
    jockey: item.jkName,
    weight: parseNumber(item.wgHr),
    burden: parseNumber(item.wgBu),
    winOdds: parseNumber(item.oddWin),
    placeOdds: parseNumber(item.oddPlc),
  };
}

/**
 * 마필 목록 변환
 */
export function mapHorseInfoList(items: KraHorseInfoItem[]): Horse[] {
  return items.map(mapHorseInfo);
}

/**
 * 마필 경주 기록 목록 변환
 */
export function mapHorseRaceRecords(
  items: KraHorseResultItem[]
): HorseRaceRecord[] {
  return items.map(mapHorseRaceRecord);
}

// =====================
// 출마표 매퍼
// =====================

/**
 * 출마표 엔트리 원본 → 내부 모델
 */
export function mapEntryHorse(item: KraEntryHorseItem): RaceEntry {
  return {
    raceDate: item.rcDate,
    meet: MEET_NAMES[item.meet] || item.meet,
    raceNo: parseNumber(item.rcNo),
    raceName: item.rcName,
    distance: parseNumber(item.rcDist),
    grade: item.wlClass,

    // 마필 정보
    horseNo: item.hrNo,
    horseName: item.hrName,
    sex: SEX_NAMES[item.sex] || item.sex,
    age: parseNumber(item.age),

    // 관계자
    jockey: item.jkName,
    trainer: item.trName,
    owner: item.owName,

    // 부담
    burden: parseNumber(item.wgBu),
    rating: parseNumber(item.rating),
  };
}

/**
 * 출마표 목록 변환
 */
export function mapEntryHorseList(items: KraEntryHorseItem[]): RaceEntry[] {
  return items.map(mapEntryHorse);
}

// =====================
// 정렬 유틸리티
// =====================

/**
 * 기수 승률순 정렬
 */
export function sortJockeysByWinRate(jockeys: Jockey[]): Jockey[] {
  return [...jockeys].sort((a, b) => b.winRate - a.winRate);
}

/**
 * 조교사 승률순 정렬
 */
export function sortTrainersByWinRate(trainers: Trainer[]): Trainer[] {
  return [...trainers].sort((a, b) => b.winRate - a.winRate);
}

/**
 * 마필 레이팅순 정렬
 */
export function sortHorsesByRating(horses: Horse[]): Horse[] {
  return [...horses].sort((a, b) => (b.rating || 0) - (a.rating || 0));
}
