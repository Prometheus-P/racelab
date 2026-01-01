/**
 * 경주마 상태 기반 전략들
 *
 * 마체중, 휴양, 최근 성적 분석
 */

import type { PresetStrategy } from './types';

export const HORSE_CONDITION_STRATEGIES: PresetStrategy[] = [
  {
    id: 'comeback',
    name: '휴양 복귀',
    description: '30-60일 휴양 후 첫 출전하는 말에 베팅. 재충전 효과 기대.',
    category: 'horse',
    difficulty: 'medium',
    riskLevel: 'medium',
    tags: ['휴양', '복귀', '컨디션'],
    strategy: {
      id: 'comeback',
      name: '휴양 복귀',
      version: '1.0.0',
      conditions: [
        { field: 'days_since_last_race', operator: 'between', value: [30, 60] },
        { field: 'horse_career_wins', operator: 'gte', value: 2 },
        { field: 'popularity_rank', operator: 'between', value: [2, 6] },
      ],
      action: 'bet_win',
      metadata: {
        author: 'RaceLab',
        createdAt: '2024-01-15',
        description: '휴양 복귀 전략',
        tags: ['comeback', 'rest'],
      },
    },
    benchmarkStats: {
      period: '2023-01 ~ 2023-12',
      winRate: 17.8,
      roi: 14.6,
      sampleSize: 312,
    },
  },
  {
    id: 'weight-gain',
    name: '체중 증가 역발상',
    description: '마체중 +8kg 이상 증가한 말에 베팅. 대중의 회피 심리 역이용.',
    category: 'horse',
    difficulty: 'hard',
    riskLevel: 'high',
    tags: ['체중', '역발상', '컨디션'],
    strategy: {
      id: 'weight-gain',
      name: '체중 증가 역발상',
      version: '1.0.0',
      conditions: [
        { field: 'weight_change', operator: 'gte', value: 8 },
        { field: 'odds_drift_pct', operator: 'gte', value: 10 },
        { field: 'horse_win_rate', operator: 'gte', value: 15 },
      ],
      action: 'bet_win',
      metadata: {
        author: 'RaceLab',
        createdAt: '2024-01-15',
        description: '체중 증가 역발상 전략',
        tags: ['weight', 'contrarian'],
      },
    },
    benchmarkStats: {
      period: '2023-01 ~ 2023-12',
      winRate: 11.2,
      roi: 35.4,
      sampleSize: 178,
    },
  },
  {
    id: 'class-drop',
    name: '등급 하락 파워',
    description: '상위 등급에서 강등된 말에 베팅. 상대적 실력 우위 활용.',
    category: 'horse',
    difficulty: 'easy',
    riskLevel: 'low',
    tags: ['등급', '강등', '실력'],
    strategy: {
      id: 'class-drop',
      name: '등급 하락 파워',
      version: '1.0.0',
      conditions: [
        { field: 'class_level_change', operator: 'lt', value: 0 },
        { field: 'horse_place_rate', operator: 'gte', value: 30 },
        { field: 'popularity_rank', operator: 'between', value: [2, 5] },
      ],
      action: 'bet_win',
      metadata: {
        author: 'RaceLab',
        createdAt: '2024-01-15',
        description: '등급 하락 파워 전략',
        tags: ['class-drop', 'power'],
      },
    },
    benchmarkStats: {
      period: '2023-01 ~ 2023-12',
      winRate: 24.3,
      roi: 12.1,
      sampleSize: 423,
    },
  },
  {
    id: 'recent-form',
    name: '최근 폼 상승',
    description: '최근 5경주 성적이 개선 중인 말에 베팅.',
    category: 'horse',
    difficulty: 'medium',
    riskLevel: 'medium',
    tags: ['폼', '상승세', '모멘텀'],
    strategy: {
      id: 'recent-form',
      name: '최근 폼 상승',
      version: '1.0.0',
      conditions: [
        { field: 'horse_recent_form', operator: 'lte', value: 4 },
        { field: 'horse_last_finish', operator: 'between', value: [1, 3] },
        { field: 'popularity_rank', operator: 'between', value: [2, 6] },
      ],
      action: 'bet_win',
      metadata: {
        author: 'RaceLab',
        createdAt: '2024-01-15',
        description: '최근 폼 상승 전략',
        tags: ['form', 'momentum'],
      },
    },
    benchmarkStats: {
      period: '2023-01 ~ 2023-12',
      winRate: 21.6,
      roi: 8.9,
      sampleSize: 534,
    },
  },
];
