/**
 * KRA API Module
 *
 * 공공데이터 포털 한국마사회 API 통합 모듈
 *
 * @example
 * import { fetchJockeyRanking, fetchTrainerRanking, fetchHorseInfo } from '@/lib/api/kra';
 *
 * // 기수 랭킹 조회
 * const jockeys = await fetchJockeyRanking('1', 20);
 *
 * // 조교사 랭킹 조회
 * const trainers = await fetchTrainerRanking();
 *
 * // 마필 상세정보 조회
 * const horse = await fetchHorseInfo('12345');
 */

// Registry
export {
  KRA_API_REGISTRY,
  KRA_BASE_URL,
  MEET_CODES,
  type ApiEndpoint,
  type KraApiKey,
  type MeetCode,
} from './registry';

// Types
export {
  // API 응답 타입
  type KraApiResponse,
  type KraJockeyResultItem,
  type KraJockeyInfoItem,
  type KraTrainerInfoItem,
  type KraHorseInfoItem,
  type KraHorseResultItem,
  type KraHorseTotalInfoItem,
  type KraEntryHorseItem,
  type KraOddsItem,
  type KraRaceInfoItem,
  // 내부 모델
  type Jockey,
  type Trainer,
  type Horse,
  type HorseRaceRecord,
  type RaceEntry,
  type RaceOdds,
  type RaceInfo,
  type RaceSchedule,
  // 상수
  MEET_NAMES,
  SEX_NAMES,
  // 유틸리티
  parseNumber,
  parsePercent,
} from './types';

// Client
export {
  kraApi,
  kraApiSafe,
  kraApiAllMeets,
  getTodayDate,
  getTodayYearMonth,
  formatDateParam,
  parseDateParam,
  type KraApiOptions,
} from './client';

// Mappers
export {
  // 기수
  mapJockeyResult,
  mapJockeyResults,
  mergeJockeyInfo,
  sortJockeysByWinRate,
  // 조교사
  mapTrainerInfo,
  mapTrainerInfoList,
  sortTrainersByWinRate,
  // 마필
  mapHorseInfo,
  mapHorseInfoList,
  mapHorseRaceRecord,
  mapHorseRaceRecords,
  mergeHorseTotalInfo,
  sortHorsesByRating,
  // 출마표
  mapEntryHorse,
  mapEntryHorseList,
  // 배당률
  mapOddsItems,
  filterOddsByRace,
  // 경주정보
  mapRaceInfo,
  mapRaceInfoList,
  groupRacesByDateAndMeet,
  filterRaceByNo,
} from './mappers';

// Jockey API
export {
  fetchJockeyResults,
  fetchAllJockeyResults,
  fetchJockeyInfo,
  searchJockeysByName,
  fetchJockeyRanking,
  fetchJockeyResultsSafe,
} from './jockey';

// Trainer API
export {
  fetchTrainerResults,
  fetchAllTrainerResults,
  fetchTrainerInfo,
  searchTrainersByName,
  fetchTrainerRanking,
  fetchTrainerHorseCount,
  fetchTrainerResultsSafe,
} from './trainer';

// Horse API
export {
  fetchHorseList,
  fetchAllHorses,
  fetchHorseInfo,
  fetchHorseRaceHistory,
  searchHorsesByName,
  fetchHorseRanking,
  fetchHorsesByGrade,
  fetchHorseListSafe,
  fetchHorseDetail,
} from './horse';

// Entry API
export {
  fetchEntryHorses,
  fetchEntryHorsesSafe,
  fetchEntriesByRace,
  fetchEntriesForRace,
  groupEntriesByRace,
  hasTodayRaces,
  getRaceCount,
  getFieldSizes,
} from './entry';

// Odds API
export {
  fetchOdds,
  fetchAllOdds,
  fetchRaceOdds,
  fetchOddsSafe,
  extractWinOdds,
  extractPlaceOdds,
  getOddsFavoriteOrder,
  getHorseOdds,
} from './odds';

// Race Info API
export {
  fetchRaceInfo,
  fetchAllRaceInfo,
  fetchRaceSchedule,
  fetchRace,
  fetchRaceInfoSafe,
  hasRacesToday,
  getTotalRaceCount,
  filterRacesByGrade,
  filterRacesByDistance,
  sortRacesByStartTime,
} from './race';
