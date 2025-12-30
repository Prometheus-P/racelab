/**
 * Analytics Types
 *
 * 기수/조교사 분석을 위한 타입 정의
 */

/**
 * 기수 통계
 */
export interface JockeyStats {
  /** ID */
  id: string;

  /** 이름 */
  name: string;

  /** 영문 이름 */
  nameEn?: string;

  /** 소속 경주장 */
  track: string;

  // 전체 성적
  /** 총 출전 수 */
  totalStarts: number;

  /** 1착 수 */
  wins: number;

  /** 2-3착 수 */
  places: number;

  /** 4착 이내 수 */
  shows: number;

  /** 승률 (%) */
  winRate: number;

  /** 복승률 (%) */
  placeRate: number;

  /** ROI (%) */
  roi: number;

  // 최근 폼
  /** 최근 20경주 순위 */
  recentForm: number[];

  /** 폼 점수 (1-5) */
  formScore: number;

  // 세부 분석
  /** 거리별 성적 */
  byDistance: Record<string, DistanceStats>;

  /** 경주장별 성적 */
  byTrack: Record<string, TrackStats>;

  /** 등급별 성적 */
  byClass: Record<string, ClassStats>;

  // 콤보 통계
  /** 상위 조교사 콤보 */
  topTrainers: ComboStats[];
}

/**
 * 조교사 통계
 */
export interface TrainerStats {
  /** ID */
  id: string;

  /** 이름 */
  name: string;

  /** 소속 경주장 */
  track: string;

  // 전체 성적
  /** 총 출전 수 */
  totalStarts: number;

  /** 1착 수 */
  wins: number;

  /** 승률 (%) */
  winRate: number;

  /** ROI (%) */
  roi: number;

  /** 관리 마필 수 */
  activeHorses: number;

  // 최근 폼
  /** 폼 점수 (1-5) */
  formScore: number;

  // 세부 분석
  /** 거리별 성적 */
  byDistance: Record<string, DistanceStats>;

  /** 등급별 성적 */
  byClass: Record<string, ClassStats>;

  // 콤보 통계
  /** 상위 기수 콤보 */
  topJockeys: ComboStats[];
}

/**
 * 거리별 성적
 */
export interface DistanceStats {
  distance: string;
  starts: number;
  wins: number;
  rate: number;
}

/**
 * 경주장별 성적
 */
export interface TrackStats {
  track: string;
  starts: number;
  wins: number;
  rate: number;
}

/**
 * 등급별 성적
 */
export interface ClassStats {
  class: string;
  starts: number;
  wins: number;
  rate: number;
}

/**
 * 콤보 통계 (기수-조교사)
 */
export interface ComboStats {
  id: string;
  name: string;
  starts: number;
  wins: number;
  rate: number;
}

/**
 * 랭킹 필터 옵션
 */
export interface RankingFilters {
  /** 경주장 */
  track?: string;

  /** 기간 (year) */
  period?: string;

  /** 정렬 기준 */
  sortBy?: 'winRate' | 'wins' | 'roi' | 'totalStarts';

  /** 정렬 방향 */
  sortOrder?: 'asc' | 'desc';

  /** 페이지 */
  page?: number;

  /** 페이지 크기 */
  limit?: number;
}

/**
 * 랭킹 결과
 */
export interface RankingResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  filters: RankingFilters;
}
