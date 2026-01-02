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

// =====================
// 배당률 매퍼
// =====================

import type {
  KraOddsItem,
  RaceOdds,
  KraRaceInfoItem,
  RaceInfo,
  RaceSchedule,
  KraRaceResultAIItem,
  RaceResultAI,
  RaceResultAISummary,
} from './types';

/**
 * 배당률 원본 데이터 → 내부 모델 변환
 *
 * API에서 받은 개별 배당 항목들을 경주별로 그룹화하여 RaceOdds 구조로 변환
 */
export function mapOddsItems(items: KraOddsItem[]): RaceOdds[] {
  // 경주별로 그룹화
  const raceMap = new Map<string, RaceOdds>();

  for (const item of items) {
    const key = `${item.rcDate}-${item.meet}-${item.rcNo}`;

    if (!raceMap.has(key)) {
      raceMap.set(key, {
        raceDate: item.rcDate,
        meet: MEET_NAMES[item.meet] || item.meet,
        raceNo: parseNumber(item.rcNo),
        win: {},
        place: {},
      });
    }

    const raceOdds = raceMap.get(key)!;
    const oddsValue = parseNumber(item.odds);

    // 승식별로 배당률 할당
    switch (item.betType) {
      case 'WIN': // 단승
        raceOdds.win[item.hrNo1] = oddsValue;
        break;
      case 'PLC': // 연승
        raceOdds.place[item.hrNo1] = oddsValue;
        break;
      case 'QNL': // 복승
        if (item.hrNo2) {
          const qnlKey = [item.hrNo1, item.hrNo2].sort().join('-');
          raceOdds.quinella = raceOdds.quinella || {};
          raceOdds.quinella[qnlKey] = oddsValue;
        }
        break;
      case 'EXA': // 쌍승
        if (item.hrNo2) {
          const exaKey = `${item.hrNo1}-${item.hrNo2}`;
          raceOdds.exacta = raceOdds.exacta || {};
          raceOdds.exacta[exaKey] = oddsValue;
        }
        break;
      case 'QPL': // 복연승
        if (item.hrNo2) {
          const qplKey = [item.hrNo1, item.hrNo2].sort().join('-');
          raceOdds.quinellaPlace = raceOdds.quinellaPlace || {};
          raceOdds.quinellaPlace[qplKey] = oddsValue;
        }
        break;
      case 'TLA': // 삼복승/삼쌍승
        if (item.hrNo2 && item.hrNo3) {
          const tlaKey = `${item.hrNo1}-${item.hrNo2}-${item.hrNo3}`;
          raceOdds.trifecta = raceOdds.trifecta || {};
          raceOdds.trifecta[tlaKey] = oddsValue;
        }
        break;
    }
  }

  return Array.from(raceMap.values());
}

/**
 * 특정 경주의 배당률 추출
 */
export function filterOddsByRace(
  allOdds: RaceOdds[],
  meet: string,
  raceNo: number
): RaceOdds | null {
  const meetName = MEET_NAMES[meet] || meet;
  return allOdds.find((o) => o.meet === meetName && o.raceNo === raceNo) || null;
}

// =====================
// 경주정보 매퍼
// =====================

/**
 * 경주정보 원본 → 내부 모델 변환
 */
export function mapRaceInfo(item: KraRaceInfoItem): RaceInfo {
  const meetName = MEET_NAMES[item.meet] || item.meet;

  return {
    meet: item.meet,
    meetName,
    raceDate: item.rcDate,
    raceNo: parseNumber(item.rcNo),
    raceName: item.rcName,
    distance: parseNumber(item.rcDist),
    grade: item.rcClass,
    condition: item.rcCond,
    ageCondition: item.rcAge,
    sexCondition: item.rcSex,
    prize: parseNumber(item.rcPrize),
    startTime: item.rcTime,
    trackCondition: item.rcTrack,
    weather: item.rcWeather,
    entryCount: parseNumber(item.hrCnt),
  };
}

/**
 * 경주정보 목록 변환
 */
export function mapRaceInfoList(items: KraRaceInfoItem[]): RaceInfo[] {
  return items.map(mapRaceInfo);
}

/**
 * 경주정보를 일자/경마장별로 그룹화
 */
export function groupRacesByDateAndMeet(races: RaceInfo[]): RaceSchedule[] {
  const scheduleMap = new Map<string, RaceSchedule>();

  for (const race of races) {
    const key = `${race.raceDate}-${race.meet}`;

    if (!scheduleMap.has(key)) {
      scheduleMap.set(key, {
        meet: race.meet,
        meetName: race.meetName,
        raceDate: race.raceDate,
        totalRaces: 0,
        races: [],
      });
    }

    const schedule = scheduleMap.get(key)!;
    schedule.races.push(race);
    schedule.totalRaces = schedule.races.length;
  }

  // 경주번호순 정렬
  const schedules = Array.from(scheduleMap.values());
  for (const schedule of schedules) {
    schedule.races.sort((a: RaceInfo, b: RaceInfo) => a.raceNo - b.raceNo);
  }

  return schedules;
}

/**
 * 특정 경주 조회
 */
export function filterRaceByNo(
  races: RaceInfo[],
  meet: string,
  raceNo: number
): RaceInfo | null {
  return races.find((r) => r.meet === meet && r.raceNo === raceNo) || null;
}

// =====================
// AI 학습용 경주결과 매퍼
// =====================

/**
 * AI 학습용 경주결과 원본 → 내부 모델 변환
 */
export function mapRaceResultAI(item: KraRaceResultAIItem): RaceResultAI {
  const meetName = MEET_NAMES[item.meet] || item.meet;

  return {
    // 경주 기본정보
    meet: item.meet,
    meetName,
    raceDate: item.rcDate,
    raceNo: parseNumber(item.rcNo),
    raceName: item.rcName,
    distance: parseNumber(item.rcDist),
    grade: item.rcClass,
    trackCondition: item.rcTrack,
    weather: item.rcWeather,

    // 출전마 정보
    horseNo: item.hrNo,
    horseName: item.hrName,
    gateNo: parseNumber(item.chulNo),
    sex: SEX_NAMES[item.sex] || item.sex,
    age: parseNumber(item.age),
    burden: parseNumber(item.wgBu),
    weight: parseNumber(item.wgHr),
    rating: parseNumber(item.rating),

    // 관계자
    jockeyNo: item.jkNo,
    jockeyName: item.jkName,
    trainerNo: item.trNo,
    trainerName: item.trName,
    ownerName: item.owName,

    // 결과
    position: parseNumber(item.ord),
    finishTime: item.rcTime,
    timeDiff: item.diffTime,

    // 구간 기록
    sectionTimes: {
      g1f: parseNumber(item.g1f) || undefined,
      g2f: parseNumber(item.g2f) || undefined,
      g3f: parseNumber(item.g3f) || undefined,
      g4f: parseNumber(item.g4f) || undefined,
    },

    // 선두와의 거리
    distanceFromLead: {
      s1f: parseNumber(item.s1f) || undefined,
      s2f: parseNumber(item.s2f) || undefined,
      s3f: parseNumber(item.s3f) || undefined,
      s4f: parseNumber(item.s4f) || undefined,
    },

    // 배당률
    winOdds: parseNumber(item.oddWin),
    placeOdds: parseNumber(item.oddPlc),
  };
}

/**
 * AI 학습용 경주결과 목록 변환
 */
export function mapRaceResultAIList(items: KraRaceResultAIItem[]): RaceResultAI[] {
  return items.map(mapRaceResultAI);
}

/**
 * AI 학습용 경주결과를 경주별로 그룹화
 */
export function groupRaceResultsByRace(results: RaceResultAI[]): RaceResultAISummary[] {
  const summaryMap = new Map<string, RaceResultAISummary>();

  for (const result of results) {
    const key = `${result.raceDate}-${result.meet}-${result.raceNo}`;

    if (!summaryMap.has(key)) {
      summaryMap.set(key, {
        meet: result.meet,
        meetName: result.meetName,
        raceDate: result.raceDate,
        raceNo: result.raceNo,
        raceName: result.raceName,
        distance: result.distance,
        grade: result.grade,
        trackCondition: result.trackCondition,
        weather: result.weather,
        entries: [],
        totalEntries: 0,
      });
    }

    const summary = summaryMap.get(key)!;
    summary.entries.push(result);
    summary.totalEntries = summary.entries.length;
  }

  // 순위순 정렬
  const summaries = Array.from(summaryMap.values());
  for (const summary of summaries) {
    summary.entries.sort((a: RaceResultAI, b: RaceResultAI) => a.position - b.position);
  }

  return summaries;
}
