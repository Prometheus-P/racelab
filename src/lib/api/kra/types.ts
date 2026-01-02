/**
 * KRA API Types
 *
 * 공공데이터 포털 한국마사회 API 타입 정의
 */

// =====================
// 공통 타입
// =====================

/** API 응답 공통 구조 */
export interface KraApiResponse<T> {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: T[];
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

// =====================
// 기수 관련 타입 (Jockey)
// =====================

/** API11_1: 기수 성적 원본 응답 */
export interface KraJockeyResultItem {
  meet: string; // 경마장코드 (1:서울, 2:제주, 3:부경)
  jkNo: string; // 기수번호
  jkName: string; // 기수명
  part: string; // 소속조
  rcCnt: string; // 통산출주횟수
  ord1Cnt: string; // 통산1착횟수
  ord2Cnt: string; // 통산2착횟수
  ord3Cnt: string; // 통산3착횟수
  ordCnt: string; // 통산입상횟수
  winRate: string; // 승률
  ordRate: string; // 입상률
  rcCnt1y: string; // 최근1년출주횟수
  ord1Cnt1y: string; // 최근1년1착횟수
  ord2Cnt1y: string; // 최근1년2착횟수
  ord3Cnt1y: string; // 최근1년3착횟수
  ordCnt1y: string; // 최근1년입상횟수
  winRate1y: string; // 최근1년승률
  ordRate1y: string; // 최근1년입상률
}

/** API12_1: 기수 상세정보 원본 응답 */
export interface KraJockeyInfoItem {
  meet: string; // 경마장코드
  jkNo: string; // 기수번호
  jkName: string; // 기수명
  jkNameEn?: string; // 기수영문명
  part: string; // 소속조
  birthday?: string; // 생년월일
  debut?: string; // 데뷔일
  rcCnt: string; // 통산출주횟수
  ord1Cnt: string; // 통산1착횟수
  rating?: string; // 기수레이팅
}

/** 내부 기수 모델 */
export interface Jockey {
  id: string; // jkNo
  name: string;
  nameEn?: string;
  meet: string;
  meetName: string;
  part: string; // 소속조
  birthday?: string;
  debutDate?: string;

  // 통산 성적
  totalStarts: number;
  totalWins: number;
  totalSeconds: number;
  totalThirds: number;
  totalPlaces: number;
  winRate: number;
  placeRate: number;

  // 최근 1년 성적
  recentStarts: number;
  recentWins: number;
  recentSeconds: number;
  recentThirds: number;
  recentPlaces: number;
  recentWinRate: number;
  recentPlaceRate: number;

  rating?: number;
}

// =====================
// 조교사 관련 타입 (Trainer)
// =====================

/** API308: 조교사 정보 원본 응답 */
export interface KraTrainerInfoItem {
  meet: string; // 경마장코드
  trNo: string; // 조교사번호
  trName: string; // 조교사명
  trNameEn?: string; // 조교사영문명
  part?: string; // 소속조
  rcCnt: string; // 통산출주횟수
  ord1Cnt: string; // 통산1착횟수
  ord2Cnt: string; // 통산2착횟수
  ord3Cnt: string; // 통산3착횟수
  winRate: string; // 통산승률
  ordRate: string; // 통산입상률
  rcCnt1y: string; // 최근1년출주횟수
  ord1Cnt1y: string; // 최근1년1착횟수
  winRate1y: string; // 최근1년승률
  hrCnt?: string; // 관리마두수
}

/** 내부 조교사 모델 */
export interface Trainer {
  id: string; // trNo
  name: string;
  nameEn?: string;
  meet: string;
  meetName: string;
  part?: string;

  // 통산 성적
  totalStarts: number;
  totalWins: number;
  totalSeconds: number;
  totalThirds: number;
  winRate: number;
  placeRate: number;

  // 최근 1년 성적
  recentStarts: number;
  recentWins: number;
  recentWinRate: number;

  // 관리마
  horseCount?: number;
}

// =====================
// 마필 관련 타입 (Horse)
// =====================

/** API8_2: 마필 상세정보 원본 응답 */
export interface KraHorseInfoItem {
  meet: string; // 경마장코드
  hrNo: string; // 마번
  hrName: string; // 마명
  hrNameEn?: string; // 영문마명
  sex: string; // 성별 (암, 수, 거)
  age: string; // 연령
  birthday?: string; // 생년월일
  wlClass?: string; // 등급
  trName: string; // 조교사명
  owName?: string; // 마주명
  rating?: string; // 레이팅
  rcCnt: string; // 통산출주횟수
  ord1Cnt: string; // 통산1착횟수
  ord2Cnt: string; // 통산2착횟수
  ord3Cnt: string; // 통산3착횟수
  prize?: string; // 총수득상금
  rcCnt1y: string; // 최근1년출주횟수
  ord1Cnt1y: string; // 최근1년1착횟수
}

/** API15_2: 마필 성적정보 원본 응답 */
export interface KraHorseResultItem {
  hrNo: string; // 마번
  rcDate: string; // 경주일자
  meet: string; // 경마장코드
  rcNo: string; // 경주번호
  rcDist: string; // 경주거리
  ord: string; // 순위
  rcTime?: string; // 경주기록
  jkName: string; // 기수명
  wgHr?: string; // 마체중
  wgBu?: string; // 부담중량
  oddWin?: string; // 단승배당
  oddPlc?: string; // 연승배당
}

/** API42: 마필 종합정보 원본 응답 */
export interface KraHorseTotalInfoItem {
  hrNo: string; // 마번
  hrName: string; // 마명
  hrNameEn?: string; // 영문마명
  birthNa?: string; // 생산국가
  impNa?: string; // 수입국가
  breedNm?: string; // 품종
  coatColor?: string; // 털색
  fatherHr?: string; // 부마명
  motherHr?: string; // 모마명
  grandfatherHr?: string; // 외조부마명
}

/** 내부 마필 모델 */
export interface Horse {
  id: string; // hrNo
  name: string;
  nameEn?: string;
  meet: string;
  meetName: string;

  // 기본 정보
  sex: string;
  sexName: string;
  age: number;
  birthday?: string;
  grade?: string;

  // 관계자
  trainer: string;
  owner?: string;

  // 성적
  totalStarts: number;
  totalWins: number;
  totalSeconds: number;
  totalThirds: number;
  winRate: number;
  placeRate: number;
  totalPrize?: number;

  // 최근 1년
  recentStarts: number;
  recentWins: number;

  // 혈통
  sire?: string; // 부마
  dam?: string; // 모마
  grandsire?: string; // 외조부

  // 기타
  rating?: number;
  birthCountry?: string;
  importCountry?: string;
  breed?: string;
  coatColor?: string;
}

/** 마필 경주 기록 */
export interface HorseRaceRecord {
  date: string;
  meet: string;
  raceNo: number;
  distance: number;
  position: number;
  time?: string;
  jockey: string;
  weight?: number;
  burden?: number;
  winOdds?: number;
  placeOdds?: number;
}

// =====================
// 출마표 관련 타입 (Entry)
// =====================

/** API23_1: 출전 등록말 원본 응답 */
export interface KraEntryHorseItem {
  meet: string; // 경마장코드
  rcDate: string; // 경주일자
  rcNo: string; // 경주번호
  rcName?: string; // 경주명
  rcDist: string; // 경주거리
  wlClass?: string; // 등급조건
  hrNo: string; // 마번
  hrName: string; // 마명
  sex: string; // 성별
  age: string; // 연령
  jkName?: string; // 기수명
  trName: string; // 조교사명
  owName?: string; // 마주명
  wgBu?: string; // 부담중량
  rating?: string; // 레이팅
}

/** 내부 출마표 엔트리 모델 */
export interface RaceEntry {
  raceDate: string;
  meet: string;
  raceNo: number;
  raceName?: string;
  distance: number;
  grade?: string;

  // 마필 정보
  horseNo: string;
  horseName: string;
  sex: string;
  age: number;

  // 관계자
  jockey?: string;
  trainer: string;
  owner?: string;

  // 부담
  burden?: number;
  rating?: number;
}

// =====================
// 배당률 관련 타입 (Odds)
// =====================

/** 배당률 원본 응답 */
export interface KraOddsItem {
  meet: string; // 경마장코드
  rcDate: string; // 경주일자
  rcNo: string; // 경주번호
  betType: string; // 승식코드 (WIN, PLC, QNL, EXA, QPL, TLA 등)
  hrNo1: string; // 1번 마번
  hrNo2?: string; // 2번 마번 (복승 이상)
  hrNo3?: string; // 3번 마번 (삼복승)
  odds: string; // 배당률
}

/** 내부 배당률 모델 */
export interface RaceOdds {
  raceDate: string;
  meet: string;
  raceNo: number;

  // 단승/연승
  win: Record<string, number>; // { "1": 2.5, "2": 3.1, ... }
  place: Record<string, number>; // 연승

  // 복승/쌍승
  quinella?: Record<string, number>; // 복승 "1-2": 5.3
  exacta?: Record<string, number>; // 쌍승 (순서 있음)

  // 기타
  quinellaPlace?: Record<string, number>; // 복연승
  trifecta?: Record<string, number>; // 삼복승
  trio?: Record<string, number>; // 삼쌍승
}

// =====================
// AI 학습용 경주결과 타입 (Race Result AI)
// =====================

/** API156: AI학습용 경주결과 원본 응답 */
export interface KraRaceResultAIItem {
  meet: string; // 경마장코드 (1:서울, 2:제주, 3:부경)
  rcDate: string; // 경주일자 (YYYYMMDD)
  rcNo: string; // 경주번호
  rcName?: string; // 경주명
  rcDist: string; // 경주거리 (미터)
  rcClass?: string; // 등급조건
  rcTrack?: string; // 주로상태
  rcWeather?: string; // 날씨

  // 출전마 정보
  hrNo: string; // 마번
  hrName: string; // 마명
  chulNo: string; // 출전번호 (게이트번호)
  sex: string; // 성별
  age: string; // 연령
  wgBu?: string; // 부담중량
  wgHr?: string; // 마체중
  rating?: string; // 레이팅

  // 관계자
  jkNo?: string; // 기수번호
  jkName: string; // 기수명
  trNo?: string; // 조교사번호
  trName?: string; // 조교사명
  owName?: string; // 마주명

  // 결과
  ord: string; // 순위
  rcTime?: string; // 주파기록
  diffTime?: string; // 착차시간
  g1f?: string; // 1구간 시간
  g2f?: string; // 2구간 시간
  g3f?: string; // 3구간 시간
  g4f?: string; // 4구간 시간
  s1f?: string; // 선두에서의 거리 (1구간)
  s2f?: string; // 선두에서의 거리 (2구간)
  s3f?: string; // 선두에서의 거리 (3구간)
  s4f?: string; // 선두에서의 거리 (4구간)

  // 배당률
  oddWin?: string; // 단승배당
  oddPlc?: string; // 연승배당
}

/** 내부 AI 학습용 경주결과 모델 */
export interface RaceResultAI {
  // 경주 기본정보
  meet: string;
  meetName: string;
  raceDate: string;
  raceNo: number;
  raceName?: string;
  distance: number;
  grade?: string;
  trackCondition?: string;
  weather?: string;

  // 출전마 정보
  horseNo: string;
  horseName: string;
  gateNo: number;
  sex: string;
  age: number;
  burden?: number;
  weight?: number;
  rating?: number;

  // 관계자
  jockeyNo?: string;
  jockeyName: string;
  trainerNo?: string;
  trainerName?: string;
  ownerName?: string;

  // 결과
  position: number;
  finishTime?: string;
  timeDiff?: string;

  // 구간 기록
  sectionTimes?: {
    g1f?: number;
    g2f?: number;
    g3f?: number;
    g4f?: number;
  };

  // 선두와의 거리
  distanceFromLead?: {
    s1f?: number;
    s2f?: number;
    s3f?: number;
    s4f?: number;
  };

  // 배당률
  winOdds?: number;
  placeOdds?: number;
}

/** AI 학습용 경주 요약 (경주별 그룹화) */
export interface RaceResultAISummary {
  meet: string;
  meetName: string;
  raceDate: string;
  raceNo: number;
  raceName?: string;
  distance: number;
  grade?: string;
  trackCondition?: string;
  weather?: string;
  entries: RaceResultAI[];
  totalEntries: number;
}

// =====================
// 경주정보 관련 타입 (Race Info)
// =====================

/** API187: 경마경주정보 원본 응답 */
export interface KraRaceInfoItem {
  meet: string; // 경마장코드 (1:서울, 2:제주, 3:부경)
  rcDate: string; // 경주일자 (YYYYMMDD)
  rcNo: string; // 경주번호
  rcName?: string; // 경주명
  rcDist: string; // 경주거리 (미터)
  rcClass?: string; // 등급조건
  rcCond?: string; // 경주조건
  rcAge?: string; // 연령조건
  rcSex?: string; // 성별조건
  rcPrize?: string; // 1착상금
  rcTime?: string; // 발주예정시각
  rcTrack?: string; // 주로상태 (양호, 불량 등)
  rcWeather?: string; // 날씨
  hrCnt?: string; // 출전두수
}

/** 내부 경주정보 모델 */
export interface RaceInfo {
  meet: string;
  meetName: string;
  raceDate: string;
  raceNo: number;
  raceName?: string;
  distance: number;
  grade?: string;
  condition?: string;
  ageCondition?: string;
  sexCondition?: string;
  prize?: number;
  startTime?: string;
  trackCondition?: string;
  weather?: string;
  entryCount?: number;
}

/** 경주일정 요약 (경마장/일자별) */
export interface RaceSchedule {
  meet: string;
  meetName: string;
  raceDate: string;
  totalRaces: number;
  races: RaceInfo[];
}

// =====================
// 유틸리티 타입
// =====================

/** 경마장 코드 → 이름 매핑 */
export const MEET_NAMES: Record<string, string> = {
  '1': '서울',
  '2': '제주',
  '3': '부경',
};

/** 성별 코드 → 이름 매핑 */
export const SEX_NAMES: Record<string, string> = {
  암: '암말',
  수: '수말',
  거: '거세마',
  F: '암말',
  M: '수말',
  G: '거세마',
};

/** 숫자 문자열을 숫자로 변환 (기본값 0) */
export function parseNumber(value: string | undefined | null): number {
  if (!value) return 0;
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

/** 퍼센트 문자열을 숫자로 변환 */
export function parsePercent(value: string | undefined | null): number {
  if (!value) return 0;
  const num = parseFloat(value.replace('%', ''));
  return isNaN(num) ? 0 : num;
}
