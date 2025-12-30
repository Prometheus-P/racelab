/**
 * Jockey Statistics
 *
 * 기수 통계 조회 및 분석
 */

import type { JockeyStats, RankingFilters, RankingResult } from './types';

// 샘플 기수 데이터 (실제로는 DB에서 조회)
const SAMPLE_JOCKEYS: JockeyStats[] = [
  {
    id: 'jockey-001',
    name: '유승완',
    nameEn: 'Yoo Seung-wan',
    track: '서울',
    totalStarts: 245,
    wins: 52,
    places: 46,
    shows: 38,
    winRate: 21.2,
    placeRate: 40.0,
    roi: 18.3,
    recentForm: [1, 3, 2, 5, 1, 2, 1, 4, 3, 1, 2, 6, 1, 3, 2, 1, 4, 2, 1, 3],
    formScore: 5,
    byDistance: {
      '1000m': { distance: '1000m', starts: 45, wins: 12, rate: 26.7 },
      '1200m': { distance: '1200m', starts: 68, wins: 15, rate: 22.1 },
      '1400m': { distance: '1400m', starts: 72, wins: 14, rate: 19.4 },
      '1800m': { distance: '1800m', starts: 60, wins: 11, rate: 18.3 },
    },
    byTrack: {
      서울: { track: '서울', starts: 180, wins: 42, rate: 23.3 },
      부산: { track: '부산', starts: 50, wins: 8, rate: 16.0 },
      제주: { track: '제주', starts: 15, wins: 2, rate: 13.3 },
    },
    byClass: {
      G1: { class: 'G1', starts: 12, wins: 3, rate: 25.0 },
      G2: { class: 'G2', starts: 35, wins: 9, rate: 25.7 },
      G3: { class: 'G3', starts: 68, wins: 15, rate: 22.1 },
    },
    topTrainers: [
      { id: 'trainer-001', name: '김철수', starts: 45, wins: 12, rate: 26.7 },
      { id: 'trainer-002', name: '박영호', starts: 38, wins: 9, rate: 23.7 },
      { id: 'trainer-003', name: '이민수', starts: 32, wins: 7, rate: 21.9 },
    ],
  },
  {
    id: 'jockey-002',
    name: '문세영',
    nameEn: 'Moon Se-young',
    track: '서울',
    totalStarts: 198,
    wins: 38,
    places: 35,
    shows: 28,
    winRate: 19.2,
    placeRate: 36.9,
    roi: 12.1,
    recentForm: [2, 4, 1, 3, 2, 5, 1, 3, 4, 2, 1, 3, 2, 5, 1, 4, 2, 3, 1, 2],
    formScore: 4,
    byDistance: {
      '1000m': { distance: '1000m', starts: 38, wins: 9, rate: 23.7 },
      '1200m': { distance: '1200m', starts: 55, wins: 11, rate: 20.0 },
      '1400m': { distance: '1400m', starts: 58, wins: 10, rate: 17.2 },
      '1800m': { distance: '1800m', starts: 47, wins: 8, rate: 17.0 },
    },
    byTrack: {
      서울: { track: '서울', starts: 145, wins: 30, rate: 20.7 },
      부산: { track: '부산', starts: 40, wins: 6, rate: 15.0 },
      제주: { track: '제주', starts: 13, wins: 2, rate: 15.4 },
    },
    byClass: {
      G1: { class: 'G1', starts: 8, wins: 2, rate: 25.0 },
      G2: { class: 'G2', starts: 28, wins: 6, rate: 21.4 },
      G3: { class: 'G3', starts: 55, wins: 11, rate: 20.0 },
    },
    topTrainers: [
      { id: 'trainer-004', name: '정상훈', starts: 35, wins: 9, rate: 25.7 },
      { id: 'trainer-001', name: '김철수', starts: 28, wins: 6, rate: 21.4 },
      { id: 'trainer-005', name: '최동현', starts: 25, wins: 5, rate: 20.0 },
    ],
  },
  {
    id: 'jockey-003',
    name: '김용근',
    nameEn: 'Kim Yong-geun',
    track: '부산',
    totalStarts: 221,
    wins: 41,
    places: 38,
    shows: 32,
    winRate: 18.6,
    placeRate: 35.7,
    roi: 8.5,
    recentForm: [3, 2, 4, 1, 3, 2, 5, 1, 4, 2, 3, 1, 4, 2, 3, 5, 1, 2, 4, 3],
    formScore: 3,
    byDistance: {
      '1000m': { distance: '1000m', starts: 42, wins: 9, rate: 21.4 },
      '1200m': { distance: '1200m', starts: 62, wins: 12, rate: 19.4 },
      '1400m': { distance: '1400m', starts: 65, wins: 11, rate: 16.9 },
      '1800m': { distance: '1800m', starts: 52, wins: 9, rate: 17.3 },
    },
    byTrack: {
      서울: { track: '서울', starts: 55, wins: 9, rate: 16.4 },
      부산: { track: '부산', starts: 150, wins: 30, rate: 20.0 },
      제주: { track: '제주', starts: 16, wins: 2, rate: 12.5 },
    },
    byClass: {
      G1: { class: 'G1', starts: 10, wins: 2, rate: 20.0 },
      G2: { class: 'G2', starts: 32, wins: 7, rate: 21.9 },
      G3: { class: 'G3', starts: 60, wins: 12, rate: 20.0 },
    },
    topTrainers: [
      { id: 'trainer-006', name: '한승우', starts: 42, wins: 10, rate: 23.8 },
      { id: 'trainer-007', name: '임재훈', starts: 35, wins: 7, rate: 20.0 },
      { id: 'trainer-002', name: '박영호', starts: 30, wins: 6, rate: 20.0 },
    ],
  },
  {
    id: 'jockey-004',
    name: '조성곤',
    track: '서울',
    totalStarts: 187,
    wins: 32,
    places: 30,
    shows: 25,
    winRate: 17.1,
    placeRate: 33.2,
    roi: 5.2,
    recentForm: [4, 3, 2, 5, 1, 4, 2, 3, 5, 1, 4, 2, 3, 6, 1, 4, 2, 5, 3, 1],
    formScore: 2,
    byDistance: {
      '1000m': { distance: '1000m', starts: 35, wins: 7, rate: 20.0 },
      '1200m': { distance: '1200m', starts: 52, wins: 9, rate: 17.3 },
      '1400m': { distance: '1400m', starts: 55, wins: 9, rate: 16.4 },
      '1800m': { distance: '1800m', starts: 45, wins: 7, rate: 15.6 },
    },
    byTrack: {
      서울: { track: '서울', starts: 140, wins: 26, rate: 18.6 },
      부산: { track: '부산', starts: 35, wins: 5, rate: 14.3 },
      제주: { track: '제주', starts: 12, wins: 1, rate: 8.3 },
    },
    byClass: {
      G2: { class: 'G2', starts: 25, wins: 5, rate: 20.0 },
      G3: { class: 'G3', starts: 52, wins: 10, rate: 19.2 },
    },
    topTrainers: [
      { id: 'trainer-001', name: '김철수', starts: 32, wins: 7, rate: 21.9 },
      { id: 'trainer-008', name: '송민호', starts: 28, wins: 5, rate: 17.9 },
    ],
  },
  {
    id: 'jockey-005',
    name: '이찬호',
    track: '부산',
    totalStarts: 203,
    wins: 33,
    places: 32,
    shows: 28,
    winRate: 16.3,
    placeRate: 32.0,
    roi: -2.1,
    recentForm: [5, 4, 3, 2, 6, 1, 4, 3, 5, 2, 4, 3, 6, 1, 5, 4, 2, 3, 6, 4],
    formScore: 1,
    byDistance: {
      '1000m': { distance: '1000m', starts: 40, wins: 8, rate: 20.0 },
      '1200m': { distance: '1200m', starts: 58, wins: 9, rate: 15.5 },
      '1400m': { distance: '1400m', starts: 60, wins: 9, rate: 15.0 },
      '1800m': { distance: '1800m', starts: 45, wins: 7, rate: 15.6 },
    },
    byTrack: {
      서울: { track: '서울', starts: 45, wins: 6, rate: 13.3 },
      부산: { track: '부산', starts: 145, wins: 25, rate: 17.2 },
      제주: { track: '제주', starts: 13, wins: 2, rate: 15.4 },
    },
    byClass: {
      G2: { class: 'G2', starts: 22, wins: 4, rate: 18.2 },
      G3: { class: 'G3', starts: 48, wins: 8, rate: 16.7 },
    },
    topTrainers: [
      { id: 'trainer-006', name: '한승우', starts: 38, wins: 7, rate: 18.4 },
      { id: 'trainer-009', name: '윤정민', starts: 32, wins: 5, rate: 15.6 },
    ],
  },
];

/**
 * 기수 랭킹 조회
 */
export function getJockeyRanking(filters: RankingFilters = {}): RankingResult<JockeyStats> {
  const { track, sortBy = 'winRate', sortOrder = 'desc', page = 1, limit = 20 } = filters;

  let items = [...SAMPLE_JOCKEYS];

  // 경주장 필터
  if (track) {
    items = items.filter((j) => j.track === track);
  }

  // 정렬
  items.sort((a, b) => {
    const aVal = a[sortBy as keyof JockeyStats] as number;
    const bVal = b[sortBy as keyof JockeyStats] as number;
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
 * 기수 상세 정보 조회
 */
export function getJockeyById(id: string): JockeyStats | null {
  return SAMPLE_JOCKEYS.find((j) => j.id === id) || null;
}

/**
 * 폼 점수에 따른 아이콘 반환
 */
export function getFormIcon(formScore: number): string {
  const icons: Record<number, string> = {
    5: '🔥🔥🔥🔥🔥',
    4: '🔥🔥🔥🔥',
    3: '🔥🔥🔥',
    2: '🔥🔥',
    1: '🔥',
  };
  return icons[formScore] || '';
}

/**
 * 모든 기수 목록 (드롭다운용)
 */
export function getAllJockeys(): Array<{ id: string; name: string; track: string }> {
  return SAMPLE_JOCKEYS.map((j) => ({
    id: j.id,
    name: j.name,
    track: j.track,
  }));
}
