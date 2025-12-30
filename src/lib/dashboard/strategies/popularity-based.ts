/**
 * 인기순위 기반 전략들
 *
 * 인기순위와 배당률 괴리를 활용하는 전략
 */

import type { PresetStrategy } from './types';

export const POPULARITY_BASED_STRATEGIES: PresetStrategy[] = [
  {
    id: 'stable-combo',
    name: '안정형 복합 베팅',
    description: '인기 1-3위 말의 복승식 조합에 베팅. 초보자에게 추천합니다.',
    category: 'popularity',
    difficulty: 'easy',
    riskLevel: 'low',
    tags: ['안정적', '복승식', '초보추천'],
    strategy: {
      id: 'stable-combo',
      name: '안정형 복합 베팅',
      version: '1.0.0',
      conditions: [
        { field: 'popularity_rank', operator: 'between', value: [1, 3] },
      ],
      action: 'bet_place',
      metadata: {
        author: 'RaceLab',
        createdAt: '2024-01-15',
        description: '안정형 복합 베팅 전략',
        tags: ['stable', 'combo'],
      },
    },
    benchmarkStats: {
      period: '2023-01 ~ 2023-12',
      winRate: 68.2,
      roi: 2.5,
      sampleSize: 1247,
    },
  },
  {
    id: 'dark-horse',
    name: '다크호스 발굴',
    description: '인기 5위 이하이면서 배당률이 하락 중인 말에 베팅.',
    category: 'popularity',
    difficulty: 'medium',
    riskLevel: 'high',
    tags: ['다크호스', '역발상', '고배당'],
    strategy: {
      id: 'dark-horse',
      name: '다크호스 발굴',
      version: '1.0.0',
      conditions: [
        { field: 'popularity_rank', operator: 'gte', value: 5 },
        { field: 'odds_drift_pct', operator: 'lte', value: -10 },
        { field: 'odds_win', operator: 'between', value: [8, 30] },
      ],
      action: 'bet_win',
      metadata: {
        author: 'RaceLab',
        createdAt: '2024-01-15',
        description: '다크호스 발굴 전략',
        tags: ['dark-horse', 'longshot'],
      },
    },
    benchmarkStats: {
      period: '2023-01 ~ 2023-12',
      winRate: 9.8,
      roi: 42.3,
      sampleSize: 234,
    },
  },
  {
    id: 'favorite-fade',
    name: '페이버릿 페이드',
    description: '1인기를 피하고 2-4인기에 집중 베팅. 대중 심리 역이용.',
    category: 'popularity',
    difficulty: 'medium',
    riskLevel: 'medium',
    tags: ['역발상', '중배당', '심리'],
    strategy: {
      id: 'favorite-fade',
      name: '페이버릿 페이드',
      version: '1.0.0',
      conditions: [
        { field: 'popularity_rank', operator: 'between', value: [2, 4] },
        { field: 'odds_win', operator: 'between', value: [3, 7] },
      ],
      action: 'bet_win',
      metadata: {
        author: 'RaceLab',
        createdAt: '2024-01-15',
        description: '페이버릿 페이드 전략',
        tags: ['fade', 'contrarian'],
      },
    },
    benchmarkStats: {
      period: '2023-01 ~ 2023-12',
      winRate: 22.4,
      roi: 8.7,
      sampleSize: 567,
    },
  },
  {
    id: 'longshot-value',
    name: '롱샷 밸류',
    description: '8인기 이하 + 배당 10배 이상. 대박을 노리는 전략.',
    category: 'popularity',
    difficulty: 'hard',
    riskLevel: 'high',
    tags: ['롱샷', '고배당', '대박'],
    strategy: {
      id: 'longshot-value',
      name: '롱샷 밸류',
      version: '1.0.0',
      conditions: [
        { field: 'popularity_rank', operator: 'gte', value: 8 },
        { field: 'odds_win', operator: 'gte', value: 10 },
        { field: 'horse_career_wins', operator: 'gte', value: 1 },
      ],
      action: 'bet_win',
      metadata: {
        author: 'RaceLab',
        createdAt: '2024-01-15',
        description: '롱샷 밸류 전략',
        tags: ['longshot', 'value'],
      },
    },
    benchmarkStats: {
      period: '2023-01 ~ 2023-12',
      winRate: 5.2,
      roi: 28.6,
      sampleSize: 389,
    },
  },
];
