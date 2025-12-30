/**
 * Preset Strategies Index
 *
 * 모든 사전 정의된 전략을 통합 export
 */

export * from './types';

// 카테고리별 전략
export { ODDS_BASED_STRATEGIES } from './odds-based';
export { POPULARITY_BASED_STRATEGIES } from './popularity-based';
export { JOCKEY_TRAINER_STRATEGIES } from './jockey-trainer';
export { HORSE_CONDITION_STRATEGIES } from './horse-condition';
export { RACE_CONDITION_STRATEGIES } from './race-condition';

import type { PresetStrategy, StrategyCategory } from './types';
import { ODDS_BASED_STRATEGIES } from './odds-based';
import { POPULARITY_BASED_STRATEGIES } from './popularity-based';
import { JOCKEY_TRAINER_STRATEGIES } from './jockey-trainer';
import { HORSE_CONDITION_STRATEGIES } from './horse-condition';
import { RACE_CONDITION_STRATEGIES } from './race-condition';

/**
 * 전체 프리셋 전략 목록 (20개)
 */
export const ALL_PRESET_STRATEGIES: PresetStrategy[] = [
  ...ODDS_BASED_STRATEGIES, // 5개
  ...POPULARITY_BASED_STRATEGIES, // 4개
  ...JOCKEY_TRAINER_STRATEGIES, // 4개
  ...HORSE_CONDITION_STRATEGIES, // 4개
  ...RACE_CONDITION_STRATEGIES, // 3개
];

/**
 * 카테고리별 전략 맵
 */
export const STRATEGIES_BY_CATEGORY: Record<StrategyCategory, PresetStrategy[]> = {
  odds: ODDS_BASED_STRATEGIES,
  popularity: POPULARITY_BASED_STRATEGIES,
  'jockey-trainer': JOCKEY_TRAINER_STRATEGIES,
  horse: HORSE_CONDITION_STRATEGIES,
  race: RACE_CONDITION_STRATEGIES,
};

/**
 * ID로 전략 찾기
 */
export function getPresetStrategyById(id: string): PresetStrategy | undefined {
  return ALL_PRESET_STRATEGIES.find((s) => s.id === id);
}

/**
 * 카테고리로 전략 필터링
 */
export function getPresetStrategiesByCategory(category: StrategyCategory): PresetStrategy[] {
  return STRATEGIES_BY_CATEGORY[category] || [];
}

/**
 * 난이도로 전략 필터링
 */
export function getPresetStrategiesByDifficulty(
  difficulty: 'easy' | 'medium' | 'hard'
): PresetStrategy[] {
  return ALL_PRESET_STRATEGIES.filter((s) => s.difficulty === difficulty);
}

/**
 * 리스크 레벨로 전략 필터링
 */
export function getPresetStrategiesByRisk(riskLevel: 'low' | 'medium' | 'high'): PresetStrategy[] {
  return ALL_PRESET_STRATEGIES.filter((s) => s.riskLevel === riskLevel);
}

/**
 * 태그로 전략 검색
 */
export function searchPresetStrategiesByTag(tag: string): PresetStrategy[] {
  const lowerTag = tag.toLowerCase();
  return ALL_PRESET_STRATEGIES.filter((s) =>
    s.tags.some((t) => t.toLowerCase().includes(lowerTag))
  );
}

/**
 * 전략 통계 요약
 */
export const STRATEGIES_SUMMARY = {
  total: ALL_PRESET_STRATEGIES.length,
  byCategory: {
    odds: ODDS_BASED_STRATEGIES.length,
    popularity: POPULARITY_BASED_STRATEGIES.length,
    'jockey-trainer': JOCKEY_TRAINER_STRATEGIES.length,
    horse: HORSE_CONDITION_STRATEGIES.length,
    race: RACE_CONDITION_STRATEGIES.length,
  },
  byDifficulty: {
    easy: ALL_PRESET_STRATEGIES.filter((s) => s.difficulty === 'easy').length,
    medium: ALL_PRESET_STRATEGIES.filter((s) => s.difficulty === 'medium').length,
    hard: ALL_PRESET_STRATEGIES.filter((s) => s.difficulty === 'hard').length,
  },
  byRisk: {
    low: ALL_PRESET_STRATEGIES.filter((s) => s.riskLevel === 'low').length,
    medium: ALL_PRESET_STRATEGIES.filter((s) => s.riskLevel === 'medium').length,
    high: ALL_PRESET_STRATEGIES.filter((s) => s.riskLevel === 'high').length,
  },
};
