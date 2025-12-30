/**
 * 경주 조건 기반 전략들
 *
 * 거리, 주로, 등급 적성 분석
 */

import type { PresetStrategy } from './types';

export const RACE_CONDITION_STRATEGIES: PresetStrategy[] = [
  {
    id: 'distance-spec',
    name: '거리 스페셜리스트',
    description: '해당 거리에서 승률 30% 이상인 말에 베팅.',
    category: 'race',
    difficulty: 'medium',
    riskLevel: 'medium',
    tags: ['거리', '적성', '스페셜리스트'],
    strategy: {
      id: 'distance-spec',
      name: '거리 스페셜리스트',
      version: '1.0.0',
      conditions: [
        { field: 'distance_pref', operator: 'gte', value: 4 },
        { field: 'horse_win_rate', operator: 'gte', value: 20 },
        { field: 'popularity_rank', operator: 'between', value: [2, 6] },
      ],
      action: 'bet_win',
      metadata: {
        author: 'RaceLab',
        createdAt: '2024-01-15',
        description: '거리 스페셜리스트 전략',
        tags: ['distance', 'specialist'],
      },
    },
    benchmarkStats: {
      period: '2023-01 ~ 2023-12',
      winRate: 23.4,
      roi: 11.8,
      sampleSize: 378,
    },
  },
  {
    id: 'track-bias',
    name: '트랙 바이어스',
    description: '해당 경주장에서 복승률 상위인 말에 베팅.',
    category: 'race',
    difficulty: 'medium',
    riskLevel: 'medium',
    tags: ['경주장', '적성', '트랙'],
    strategy: {
      id: 'track-bias',
      name: '트랙 바이어스',
      version: '1.0.0',
      conditions: [
        { field: 'track_pref', operator: 'gte', value: 4 },
        { field: 'horse_place_rate', operator: 'gte', value: 40 },
        { field: 'popularity_rank', operator: 'between', value: [1, 5] },
      ],
      action: 'bet_place',
      metadata: {
        author: 'RaceLab',
        createdAt: '2024-01-15',
        description: '트랙 바이어스 전략',
        tags: ['track', 'bias'],
      },
    },
    benchmarkStats: {
      period: '2023-01 ~ 2023-12',
      winRate: 52.1,
      roi: 6.3,
      sampleSize: 456,
    },
  },
  {
    id: 'wet-track',
    name: '불량 주로 강자',
    description: '불량 주로에서 좋은 성적을 내는 말에 베팅.',
    category: 'race',
    difficulty: 'hard',
    riskLevel: 'medium',
    tags: ['주로', '불량', '날씨'],
    strategy: {
      id: 'wet-track',
      name: '불량 주로 강자',
      version: '1.0.0',
      conditions: [
        { field: 'race_condition', operator: 'gte', value: 2 },
        { field: 'surface_pref', operator: 'gte', value: 4 },
        { field: 'horse_career_wins', operator: 'gte', value: 2 },
      ],
      action: 'bet_win',
      metadata: {
        author: 'RaceLab',
        createdAt: '2024-01-15',
        description: '불량 주로 강자 전략',
        tags: ['wet', 'track', 'weather'],
      },
    },
    benchmarkStats: {
      period: '2023-01 ~ 2023-12',
      winRate: 19.7,
      roi: 18.4,
      sampleSize: 203,
    },
  },
];
