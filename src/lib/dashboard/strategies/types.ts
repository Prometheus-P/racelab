/**
 * Preset Strategy Types
 *
 * 사전 정의된 전략의 타입 정의
 */

import type { StrategyDefinition } from '@/lib/strategy/types';

/**
 * 전략 카테고리
 */
export type StrategyCategory =
  | 'odds' // 배당률 기반
  | 'popularity' // 인기순위 기반
  | 'jockey-trainer' // 기수/조교사 기반
  | 'horse' // 경주마 상태 기반
  | 'race'; // 경주 조건 기반

/**
 * 난이도
 */
export type Difficulty = 'easy' | 'medium' | 'hard';

/**
 * 리스크 레벨
 */
export type RiskLevel = 'low' | 'medium' | 'high';

/**
 * 벤치마크 통계
 */
export interface BenchmarkStats {
  /** 분석 기간 */
  period: string;
  /** 승률 (%) */
  winRate: number;
  /** ROI (%) */
  roi: number;
  /** 샘플 크기 */
  sampleSize: number;
}

/**
 * 프리셋 전략 정의
 */
export interface PresetStrategy {
  /** 고유 ID */
  id: string;
  /** 전략 이름 */
  name: string;
  /** 전략 설명 */
  description: string;
  /** 카테고리 */
  category: StrategyCategory;
  /** 난이도 */
  difficulty: Difficulty;
  /** 리스크 레벨 */
  riskLevel: RiskLevel;
  /** 태그 */
  tags: string[];
  /** 전략 DSL 정의 */
  strategy: StrategyDefinition;
  /** 벤치마크 통계 (선택) */
  benchmarkStats?: BenchmarkStats;
}

/**
 * 카테고리 메타데이터
 */
export const STRATEGY_CATEGORIES: Record<
  StrategyCategory,
  { label: string; description: string; icon: string }
> = {
  odds: {
    label: '배당률 기반',
    description: '배당률 변화와 수급을 분석하여 베팅',
    icon: '📊',
  },
  popularity: {
    label: '인기순위 기반',
    description: '인기순위와 배당률 괴리를 활용',
    icon: '🏆',
  },
  'jockey-trainer': {
    label: '기수/조교사',
    description: '기수와 조교사의 성적 기반 전략',
    icon: '🏇',
  },
  horse: {
    label: '경주마 상태',
    description: '마체중, 휴양, 최근 성적 분석',
    icon: '🐎',
  },
  race: {
    label: '경주 조건',
    description: '거리, 주로, 등급 적성 분석',
    icon: '🎯',
  },
};
