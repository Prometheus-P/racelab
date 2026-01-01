/**
 * Analytics API Integration
 *
 * KRA API와 Analytics 타입 간의 브릿지
 */

import type { JockeyStats, TrainerStats, RankingFilters, RankingResult } from './types';
import {
  fetchJockeyRanking as fetchKraJockeyRanking,
  fetchJockeyInfo as fetchKraJockeyInfo,
  fetchTrainerRanking as fetchKraTrainerRanking,
  fetchTrainerInfo as fetchKraTrainerInfo,
  type Jockey,
  type Trainer,
} from '../api/kra';

// Meet code mapping
const MEET_CODE_MAP: Record<string, string> = {
  서울: '1',
  부산: '3',
  부경: '3',
  제주: '2',
};

/**
 * KRA Jockey → JockeyStats 변환
 */
function mapKraJockeyToStats(jockey: Jockey): JockeyStats {
  // 최근 20경주 폼 (실제 데이터 없으므로 성적 기반 추정)
  const recentForm = generateEstimatedForm(jockey.recentWinRate, 20);

  // 폼 점수 계산 (최근 1년 승률 기반)
  const formScore = calculateFormScore(jockey.recentWinRate);

  return {
    id: jockey.id,
    name: jockey.name,
    nameEn: jockey.nameEn,
    track: jockey.meetName,

    // 성적
    totalStarts: jockey.totalStarts,
    wins: jockey.totalWins,
    places: jockey.totalSeconds,
    shows: jockey.totalThirds,
    winRate: jockey.winRate,
    placeRate: jockey.placeRate,
    roi: estimateRoi(jockey.winRate), // 실제 ROI 데이터 없음

    // 폼
    recentForm,
    formScore,

    // 세부 분석 (API에서 제공하지 않으므로 빈 객체)
    byDistance: {},
    byTrack: {
      [jockey.meetName]: {
        track: jockey.meetName,
        starts: jockey.totalStarts,
        wins: jockey.totalWins,
        rate: jockey.winRate,
      },
    },
    byClass: {},

    // 콤보 (API에서 제공하지 않음)
    topTrainers: [],
  };
}

/**
 * KRA Trainer → TrainerStats 변환
 */
function mapKraTrainerToStats(trainer: Trainer): TrainerStats {
  const formScore = calculateFormScore(trainer.recentWinRate);

  return {
    id: trainer.id,
    name: trainer.name,
    track: trainer.meetName,

    // 성적
    totalStarts: trainer.totalStarts,
    wins: trainer.totalWins,
    winRate: trainer.winRate,
    roi: estimateRoi(trainer.winRate),

    // 관리마
    activeHorses: trainer.horseCount || 0,

    // 폼
    formScore,

    // 세부 분석
    byDistance: {},
    byClass: {},

    // 콤보
    topJockeys: [],
  };
}

/**
 * 폼 점수 계산 (승률 기반)
 */
function calculateFormScore(winRate: number): number {
  if (winRate >= 25) return 5;
  if (winRate >= 20) return 4;
  if (winRate >= 15) return 3;
  if (winRate >= 10) return 2;
  return 1;
}

/**
 * ROI 추정 (승률 기반)
 */
function estimateRoi(winRate: number): number {
  // 대략적인 ROI 추정 (실제 배당 데이터 없음)
  return Math.round((winRate - 15) * 1.5 * 10) / 10;
}

/**
 * 예상 폼 생성 (승률 기반)
 */
function generateEstimatedForm(winRate: number, count: number): number[] {
  const form: number[] = [];
  const avgPosition = Math.max(1, Math.round(100 / winRate / 5));

  for (let _i = 0; _i < count; _i++) {
    // 승률에 기반한 랜덤 순위 (1-10)
    const variation = Math.floor(Math.random() * 4) - 2;
    const position = Math.max(1, Math.min(10, avgPosition + variation));
    form.push(position);
  }

  return form;
}

/**
 * 기수 랭킹 조회 (KRA API 연동)
 */
export async function fetchJockeyRanking(
  filters: RankingFilters = {}
): Promise<RankingResult<JockeyStats>> {
  const { track, sortBy = 'winRate', sortOrder = 'desc', page = 1, limit = 20 } = filters;

  const meetCode = track ? MEET_CODE_MAP[track] : undefined;

  try {
    // KRA API 호출
    const jockeys = await fetchKraJockeyRanking(meetCode, 100);

    // 변환
    let items = jockeys.map(mapKraJockeyToStats);

    // 정렬
    items.sort((a, b) => {
      const aVal = a[sortBy as keyof JockeyStats] as number;
      const bVal = b[sortBy as keyof JockeyStats] as number;
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });

    // 페이지네이션
    const total = items.length;
    const start = (page - 1) * limit;
    items = items.slice(start, start + limit);

    return {
      items,
      total,
      page,
      limit,
      filters,
    };
  } catch (error) {
    console.error('[fetchJockeyRanking] API Error:', error);
    // 빈 결과 반환
    return {
      items: [],
      total: 0,
      page,
      limit,
      filters,
    };
  }
}

/**
 * 기수 상세 조회 (KRA API 연동)
 */
export async function fetchJockeyById(id: string): Promise<JockeyStats | null> {
  try {
    const jockey = await fetchKraJockeyInfo(id);

    if (!jockey) {
      return null;
    }

    return mapKraJockeyToStats(jockey);
  } catch (error) {
    console.error('[fetchJockeyById] API Error:', error);
    return null;
  }
}

/**
 * 조교사 랭킹 조회 (KRA API 연동)
 */
export async function fetchTrainerRanking(
  filters: RankingFilters = {}
): Promise<RankingResult<TrainerStats>> {
  const { track, sortBy = 'winRate', sortOrder = 'desc', page = 1, limit = 20 } = filters;

  const meetCode = track ? MEET_CODE_MAP[track] : undefined;

  try {
    // KRA API 호출
    const trainers = await fetchKraTrainerRanking(meetCode, 100);

    // 변환
    let items = trainers.map(mapKraTrainerToStats);

    // 정렬
    items.sort((a, b) => {
      const aVal = a[sortBy as keyof TrainerStats] as number;
      const bVal = b[sortBy as keyof TrainerStats] as number;
      return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
    });

    // 페이지네이션
    const total = items.length;
    const start = (page - 1) * limit;
    items = items.slice(start, start + limit);

    return {
      items,
      total,
      page,
      limit,
      filters,
    };
  } catch (error) {
    console.error('[fetchTrainerRanking] API Error:', error);
    return {
      items: [],
      total: 0,
      page,
      limit,
      filters,
    };
  }
}

/**
 * 조교사 상세 조회 (KRA API 연동)
 */
export async function fetchTrainerById(id: string): Promise<TrainerStats | null> {
  try {
    const trainer = await fetchKraTrainerInfo(id);

    if (!trainer) {
      return null;
    }

    return mapKraTrainerToStats(trainer);
  } catch (error) {
    console.error('[fetchTrainerById] API Error:', error);
    return null;
  }
}
