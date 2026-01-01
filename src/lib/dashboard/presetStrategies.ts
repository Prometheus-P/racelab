/**
 * 프리셋 전략 정의
 * 대시보드에서 사용할 사전 정의된 베팅 전략들
 */

export interface PresetStrategy {
  id: string;
  name: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  riskLevel: 'low' | 'medium' | 'high';
  tags: string[];
}

export const PRESET_STRATEGIES: PresetStrategy[] = [
  {
    id: 'underdog-betting',
    name: '인기마 역배팅',
    description: '인기순위 5위 이하 + 배당률 10배 이상인 말에 베팅',
    difficulty: 'hard',
    riskLevel: 'high',
    tags: ['고위험', '고수익', '역배팅'],
  },
  {
    id: 'odds-surge',
    name: '배당률 급등 추적',
    description: '마감 30분 내 배당률이 20% 이상 하락한 말에 베팅',
    difficulty: 'medium',
    riskLevel: 'medium',
    tags: ['변동성', '타이밍'],
  },
  {
    id: 'stable-combo',
    name: '안정형 복합 베팅',
    description: '인기 1-3위 말의 복승식 조합에 베팅',
    difficulty: 'easy',
    riskLevel: 'low',
    tags: ['안정적', '복승식', '초보추천'],
  },
  {
    id: 'value-drift',
    name: '가치 드리프트 헌터',
    description: '배당률 대비 실력이 저평가된 말 탐색',
    difficulty: 'hard',
    riskLevel: 'medium',
    tags: ['가치투자', '분석형'],
  },
  {
    id: 'momentum',
    name: '모멘텀 추종',
    description: '최근 3경주 연속 입상한 말에 베팅',
    difficulty: 'medium',
    riskLevel: 'medium',
    tags: ['추세추종', '통계'],
  },
];

export function getStrategyById(id: string): PresetStrategy | undefined {
  return PRESET_STRATEGIES.find((s) => s.id === id);
}
