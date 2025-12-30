/**
 * 배당률 기반 전략들
 *
 * 배당률 변화와 수급을 분석하여 베팅하는 전략
 */

import type { PresetStrategy } from './types';

export const ODDS_BASED_STRATEGIES: PresetStrategy[] = [
  {
    id: 'reversal',
    name: '인기마 역배팅',
    description: '인기 1-3위이면서 배당률이 5배 이상인 말에 베팅. 과소평가된 인기마를 찾습니다.',
    category: 'odds',
    difficulty: 'easy',
    riskLevel: 'medium',
    tags: ['인기마', '역배팅', '가치투자'],
    strategy: {
      id: 'reversal',
      name: '인기마 역배팅',
      version: '1.0.0',
      conditions: [
        { field: 'popularity_rank', operator: 'between', value: [1, 3] },
        { field: 'odds_win', operator: 'gte', value: 5 },
      ],
      action: 'bet_win',
      metadata: {
        author: 'RaceLab',
        createdAt: '2024-01-15',
        description: '인기마 역배팅 전략',
        tags: ['reversal', 'value'],
      },
    },
    benchmarkStats: {
      period: '2023-01 ~ 2023-12',
      winRate: 28.5,
      roi: 15.2,
      sampleSize: 423,
    },
  },
  {
    id: 'odds-surge',
    name: '배당률 급등 추적',
    description: '마감 전 배당률이 20% 이상 상승한 말에 베팅. 대중의 관심이 줄어든 말입니다.',
    category: 'odds',
    difficulty: 'medium',
    riskLevel: 'medium',
    tags: ['변동성', '역발상', '타이밍'],
    strategy: {
      id: 'odds-surge',
      name: '배당률 급등 추적',
      version: '1.0.0',
      conditions: [
        { field: 'odds_drift_pct', operator: 'gte', value: 20 },
        { field: 'popularity_rank', operator: 'between', value: [3, 8] },
      ],
      action: 'bet_win',
      metadata: {
        author: 'RaceLab',
        createdAt: '2024-01-15',
        description: '배당률 급등 추적 전략',
        tags: ['drift', 'surge'],
      },
    },
    benchmarkStats: {
      period: '2023-01 ~ 2023-12',
      winRate: 18.3,
      roi: 22.7,
      sampleSize: 287,
    },
  },
  {
    id: 'steam-move',
    name: '스팀 무브 감지',
    description: '배당률이 15% 이상 급락한 말에 베팅. 큰 자금이 유입되는 신호입니다.',
    category: 'odds',
    difficulty: 'hard',
    riskLevel: 'medium',
    tags: ['스마트머니', '수급', '프로'],
    strategy: {
      id: 'steam-move',
      name: '스팀 무브 감지',
      version: '1.0.0',
      conditions: [
        { field: 'odds_drift_pct', operator: 'lte', value: -15 },
        { field: 'popularity_rank', operator: 'between', value: [2, 6] },
      ],
      action: 'bet_win',
      metadata: {
        author: 'RaceLab',
        createdAt: '2024-01-15',
        description: '스팀 무브 감지 전략',
        tags: ['steam', 'smart-money'],
      },
    },
    benchmarkStats: {
      period: '2023-01 ~ 2023-12',
      winRate: 24.1,
      roi: 18.7,
      sampleSize: 312,
    },
  },
  {
    id: 'overlay',
    name: '오버레이 밸류',
    description: '배당률이 실제 승률 대비 과대평가된 말에 베팅. 장기적 수익을 추구합니다.',
    category: 'odds',
    difficulty: 'hard',
    riskLevel: 'low',
    tags: ['가치투자', '통계', '장기'],
    strategy: {
      id: 'overlay',
      name: '오버레이 밸류',
      version: '1.0.0',
      conditions: [
        { field: 'odds_win', operator: 'between', value: [3, 8] },
        { field: 'horse_win_rate', operator: 'gte', value: 20 },
        { field: 'odds_drift_pct', operator: 'gte', value: 5 },
      ],
      action: 'bet_win',
      metadata: {
        author: 'RaceLab',
        createdAt: '2024-01-15',
        description: '오버레이 밸류 전략',
        tags: ['overlay', 'value'],
      },
    },
    benchmarkStats: {
      period: '2023-01 ~ 2023-12',
      winRate: 26.8,
      roi: 14.3,
      sampleSize: 198,
    },
  },
  {
    id: 'morning-drift',
    name: '아침 배당 드리프트',
    description: '아침 배당 대비 최종 배당이 30% 이상 상승한 말에 베팅.',
    category: 'odds',
    difficulty: 'medium',
    riskLevel: 'high',
    tags: ['드리프트', '역발상', '고배당'],
    strategy: {
      id: 'morning-drift',
      name: '아침 배당 드리프트',
      version: '1.0.0',
      conditions: [
        { field: 'odds_drift_pct', operator: 'gte', value: 30 },
        { field: 'odds_win', operator: 'gte', value: 8 },
      ],
      action: 'bet_win',
      metadata: {
        author: 'RaceLab',
        createdAt: '2024-01-15',
        description: '아침 배당 드리프트 전략',
        tags: ['morning', 'drift'],
      },
    },
    benchmarkStats: {
      period: '2023-01 ~ 2023-12',
      winRate: 12.4,
      roi: 31.2,
      sampleSize: 156,
    },
  },
];
