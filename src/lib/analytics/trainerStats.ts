/**
 * Trainer Statistics
 *
 * 조교사 통계 조회 및 분석
 */

import type { TrainerStats, RankingFilters, RankingResult } from './types';

// 샘플 조교사 데이터
const SAMPLE_TRAINERS: TrainerStats[] = [
  {
    id: 'trainer-001',
    name: '김철수',
    track: '서울',
    totalStarts: 312,
    wins: 68,
    winRate: 21.8,
    roi: 15.2,
    activeHorses: 28,
    formScore: 5,
    byDistance: {
      '1000m': { distance: '1000m', starts: 58, wins: 15, rate: 25.9 },
      '1200m': { distance: '1200m', starts: 85, wins: 19, rate: 22.4 },
      '1400m': { distance: '1400m', starts: 92, wins: 18, rate: 19.6 },
      '1800m': { distance: '1800m', starts: 77, wins: 16, rate: 20.8 },
    },
    byClass: {
      G1: { class: 'G1', starts: 18, wins: 5, rate: 27.8 },
      G2: { class: 'G2', starts: 45, wins: 12, rate: 26.7 },
      G3: { class: 'G3', starts: 88, wins: 20, rate: 22.7 },
    },
    topJockeys: [
      { id: 'jockey-001', name: '유승완', starts: 45, wins: 12, rate: 26.7 },
      { id: 'jockey-002', name: '문세영', starts: 38, wins: 9, rate: 23.7 },
      { id: 'jockey-004', name: '조성곤', starts: 32, wins: 7, rate: 21.9 },
    ],
  },
  {
    id: 'trainer-002',
    name: '박영호',
    track: '서울',
    totalStarts: 278,
    wins: 55,
    winRate: 19.8,
    roi: 11.5,
    activeHorses: 24,
    formScore: 4,
    byDistance: {
      '1000m': { distance: '1000m', starts: 52, wins: 12, rate: 23.1 },
      '1200m': { distance: '1200m', starts: 75, wins: 15, rate: 20.0 },
      '1400m': { distance: '1400m', starts: 82, wins: 15, rate: 18.3 },
      '1800m': { distance: '1800m', starts: 69, wins: 13, rate: 18.8 },
    },
    byClass: {
      G1: { class: 'G1', starts: 12, wins: 3, rate: 25.0 },
      G2: { class: 'G2', starts: 38, wins: 9, rate: 23.7 },
      G3: { class: 'G3', starts: 78, wins: 16, rate: 20.5 },
    },
    topJockeys: [
      { id: 'jockey-001', name: '유승완', starts: 38, wins: 9, rate: 23.7 },
      { id: 'jockey-003', name: '김용근', starts: 30, wins: 6, rate: 20.0 },
    ],
  },
  {
    id: 'trainer-004',
    name: '정상훈',
    track: '서울',
    totalStarts: 245,
    wins: 45,
    winRate: 18.4,
    roi: 8.7,
    activeHorses: 20,
    formScore: 4,
    byDistance: {
      '1000m': { distance: '1000m', starts: 45, wins: 10, rate: 22.2 },
      '1200m': { distance: '1200m', starts: 68, wins: 13, rate: 19.1 },
      '1400m': { distance: '1400m', starts: 72, wins: 12, rate: 16.7 },
      '1800m': { distance: '1800m', starts: 60, wins: 10, rate: 16.7 },
    },
    byClass: {
      G2: { class: 'G2', starts: 32, wins: 7, rate: 21.9 },
      G3: { class: 'G3', starts: 68, wins: 14, rate: 20.6 },
    },
    topJockeys: [
      { id: 'jockey-002', name: '문세영', starts: 35, wins: 9, rate: 25.7 },
      { id: 'jockey-001', name: '유승완', starts: 28, wins: 6, rate: 21.4 },
    ],
  },
  {
    id: 'trainer-006',
    name: '한승우',
    track: '부산',
    totalStarts: 298,
    wins: 52,
    winRate: 17.4,
    roi: 6.3,
    activeHorses: 26,
    formScore: 3,
    byDistance: {
      '1000m': { distance: '1000m', starts: 55, wins: 11, rate: 20.0 },
      '1200m': { distance: '1200m', starts: 82, wins: 15, rate: 18.3 },
      '1400m': { distance: '1400m', starts: 88, wins: 14, rate: 15.9 },
      '1800m': { distance: '1800m', starts: 73, wins: 12, rate: 16.4 },
    },
    byClass: {
      G2: { class: 'G2', starts: 28, wins: 5, rate: 17.9 },
      G3: { class: 'G3', starts: 72, wins: 13, rate: 18.1 },
    },
    topJockeys: [
      { id: 'jockey-003', name: '김용근', starts: 42, wins: 10, rate: 23.8 },
      { id: 'jockey-005', name: '이찬호', starts: 38, wins: 7, rate: 18.4 },
    ],
  },
  {
    id: 'trainer-007',
    name: '임재훈',
    track: '부산',
    totalStarts: 265,
    wins: 42,
    winRate: 15.8,
    roi: 2.1,
    activeHorses: 22,
    formScore: 2,
    byDistance: {
      '1000m': { distance: '1000m', starts: 48, wins: 9, rate: 18.8 },
      '1200m': { distance: '1200m', starts: 72, wins: 12, rate: 16.7 },
      '1400m': { distance: '1400m', starts: 78, wins: 11, rate: 14.1 },
      '1800m': { distance: '1800m', starts: 67, wins: 10, rate: 14.9 },
    },
    byClass: {
      G2: { class: 'G2', starts: 25, wins: 4, rate: 16.0 },
      G3: { class: 'G3', starts: 65, wins: 11, rate: 16.9 },
    },
    topJockeys: [
      { id: 'jockey-003', name: '김용근', starts: 35, wins: 7, rate: 20.0 },
      { id: 'jockey-005', name: '이찬호', starts: 30, wins: 5, rate: 16.7 },
    ],
  },
];

/**
 * 조교사 랭킹 조회
 */
export function getTrainerRanking(filters: RankingFilters = {}): RankingResult<TrainerStats> {
  const { track, sortBy = 'winRate', sortOrder = 'desc', page = 1, limit = 20 } = filters;

  let items = [...SAMPLE_TRAINERS];

  // 경주장 필터
  if (track) {
    items = items.filter((t) => t.track === track);
  }

  // 정렬
  items.sort((a, b) => {
    const aVal = a[sortBy as keyof TrainerStats] as number;
    const bVal = b[sortBy as keyof TrainerStats] as number;
    return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
  });

  // 페이지네이션
  const start = (page - 1) * limit;
  const paginatedItems = items.slice(start, start + limit);

  return {
    items: paginatedItems,
    total: items.length,
    page,
    limit,
    filters,
  };
}

/**
 * 조교사 상세 정보 조회
 */
export function getTrainerById(id: string): TrainerStats | null {
  return SAMPLE_TRAINERS.find((t) => t.id === id) || null;
}

/**
 * 모든 조교사 목록 (드롭다운용)
 */
export function getAllTrainers(): Array<{ id: string; name: string; track: string }> {
  return SAMPLE_TRAINERS.map((t) => ({
    id: t.id,
    name: t.name,
    track: t.track,
  }));
}
