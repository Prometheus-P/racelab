/**
 * 기수/조교사 기반 전략들
 *
 * 기수와 조교사의 성적 기반 전략
 */

import type { PresetStrategy } from './types';

export const JOCKEY_TRAINER_STRATEGIES: PresetStrategy[] = [
  {
    id: 'jockey-hot',
    name: '핫 기수 추적',
    description: '최근 승률 20% 이상인 기수가 탄 말에 베팅.',
    category: 'jockey-trainer',
    difficulty: 'medium',
    riskLevel: 'medium',
    tags: ['기수', '폼', '통계'],
    strategy: {
      id: 'jockey-hot',
      name: '핫 기수 추적',
      version: '1.0.0',
      conditions: [
        { field: 'jockey_win_rate', operator: 'gte', value: 20 },
        { field: 'popularity_rank', operator: 'between', value: [1, 5] },
      ],
      action: 'bet_win',
      metadata: {
        author: 'RaceLab',
        createdAt: '2024-01-15',
        description: '핫 기수 추적 전략',
        tags: ['jockey', 'hot', 'form'],
      },
    },
    benchmarkStats: {
      period: '2023-01 ~ 2023-12',
      winRate: 25.3,
      roi: 11.2,
      sampleSize: 478,
    },
  },
  {
    id: 'trainer-form',
    name: '조교사 폼',
    description: '최근 10경주에서 3승 이상인 조교사의 말에 베팅.',
    category: 'jockey-trainer',
    difficulty: 'medium',
    riskLevel: 'medium',
    tags: ['조교사', '폼', '통계'],
    strategy: {
      id: 'trainer-form',
      name: '조교사 폼',
      version: '1.0.0',
      conditions: [
        { field: 'trainer_win_rate', operator: 'gte', value: 18 },
        { field: 'trainer_recent_form', operator: 'lte', value: 4 },
      ],
      action: 'bet_win',
      metadata: {
        author: 'RaceLab',
        createdAt: '2024-01-15',
        description: '조교사 폼 전략',
        tags: ['trainer', 'form'],
      },
    },
    benchmarkStats: {
      period: '2023-01 ~ 2023-12',
      winRate: 21.7,
      roi: 9.4,
      sampleSize: 392,
    },
  },
  {
    id: 'combo-power',
    name: '콤보 파워',
    description: '기수-조교사 콤보 승률이 상위인 조합에 베팅.',
    category: 'jockey-trainer',
    difficulty: 'hard',
    riskLevel: 'medium',
    tags: ['콤보', '시너지', '분석'],
    strategy: {
      id: 'combo-power',
      name: '콤보 파워',
      version: '1.0.0',
      conditions: [
        { field: 'trainer_combo_rate', operator: 'gte', value: 25 },
        { field: 'jockey_win_rate', operator: 'gte', value: 15 },
        { field: 'trainer_win_rate', operator: 'gte', value: 15 },
      ],
      action: 'bet_win',
      metadata: {
        author: 'RaceLab',
        createdAt: '2024-01-15',
        description: '콤보 파워 전략',
        tags: ['combo', 'synergy'],
      },
    },
    benchmarkStats: {
      period: '2023-01 ~ 2023-12',
      winRate: 28.9,
      roi: 16.8,
      sampleSize: 267,
    },
  },
  {
    id: 'jockey-switch',
    name: '기수 교체 신호',
    description: '상위 기수로 교체된 말에 베팅. 진영의 자신감 신호.',
    category: 'jockey-trainer',
    difficulty: 'hard',
    riskLevel: 'medium',
    tags: ['기수교체', '신호', '내부자'],
    strategy: {
      id: 'jockey-switch',
      name: '기수 교체 신호',
      version: '1.0.0',
      conditions: [
        { field: 'jockey_win_rate', operator: 'gte', value: 18 },
        { field: 'odds_drift_pct', operator: 'lte', value: -10 },
        { field: 'popularity_rank', operator: 'between', value: [3, 8] },
      ],
      action: 'bet_win',
      metadata: {
        author: 'RaceLab',
        createdAt: '2024-01-15',
        description: '기수 교체 신호 전략',
        tags: ['jockey-switch', 'signal'],
      },
    },
    benchmarkStats: {
      period: '2023-01 ~ 2023-12',
      winRate: 19.4,
      roi: 21.3,
      sampleSize: 189,
    },
  },
];
