/**
 * Transformer
 *
 * DSL ↔ Legacy 전략 변환
 * Phase 3: Transformer (하위 호환)
 */

import { randomUUID } from 'crypto';
import type { StrategyDefinition, StrategyCondition, ConditionField } from '../types';
import type { DSLStrategyDefinition, DSLFilter } from './types';
import { DSL_FIELD_MAPPING } from './types';

// =============================================================================
// Format Detection
// =============================================================================

/**
 * Legacy 전략 포맷 여부 확인
 * - conditions 배열이 있으면 Legacy
 * - strategy 래퍼가 없으면 Legacy
 */
export function isLegacyStrategy(input: unknown): input is StrategyDefinition {
  if (!input || typeof input !== 'object') {
    return false;
  }

  const obj = input as Record<string, unknown>;

  // strategy 래퍼가 있으면 DSL
  if ('strategy' in obj) {
    return false;
  }

  // conditions 배열이 있으면 Legacy
  return 'conditions' in obj && Array.isArray(obj.conditions);
}

/**
 * DSL 전략 포맷 여부 확인
 * - strategy 래퍼가 있고
 * - strategy.filters 배열이 있으면 DSL
 */
export function isDSLStrategy(input: unknown): input is DSLStrategyDefinition {
  if (!input || typeof input !== 'object') {
    return false;
  }

  const obj = input as Record<string, unknown>;

  if (!('strategy' in obj)) {
    return false;
  }

  const strategy = obj.strategy as Record<string, unknown>;

  if (!strategy || typeof strategy !== 'object') {
    return false;
  }

  return 'filters' in strategy && Array.isArray(strategy.filters);
}

// =============================================================================
// Field Mapping
// =============================================================================

/**
 * Dot notation 필드를 flat 필드로 변환
 * 예: 'odds.win' → 'odds_win'
 */
function dotToFlat(field: string): ConditionField {
  // 이미 flat 형식이면 그대로 반환
  if (field in DSL_FIELD_MAPPING === false && !field.includes('.')) {
    return field as ConditionField;
  }

  // dot notation → flat 변환
  const mapped = DSL_FIELD_MAPPING[field];
  if (mapped) {
    return mapped;
  }

  // 알 수 없는 dot notation은 그대로 변환 (odds.win → odds_win)
  return field.replace(/\./g, '_') as ConditionField;
}

// =============================================================================
// DSL to Legacy Transformation
// =============================================================================

/**
 * DSL 전략을 Legacy 포맷으로 변환
 */
export function transformDSLToLegacy(dsl: DSLStrategyDefinition): StrategyDefinition {
  const { strategy } = dsl;

  // conditions 변환
  const conditions: StrategyCondition[] = strategy.filters.map(
    (filter: DSLFilter) => ({
      field: dotToFlat(filter.field),
      operator: filter.operator,
      value: filter.value,
      ...(filter.timeRef && { timeRef: filter.timeRef }),
    })
  );

  // 메타데이터 생성
  const metadata = {
    author: strategy.metadata?.author ?? 'anonymous',
    createdAt: strategy.metadata?.createdAt ?? new Date().toISOString(),
    ...(strategy.metadata?.updatedAt && { updatedAt: strategy.metadata.updatedAt }),
    ...(strategy.metadata?.description && { description: strategy.metadata.description }),
    ...(strategy.metadata?.tags && { tags: strategy.metadata.tags }),
  };

  // Legacy 전략 생성
  const legacy: StrategyDefinition = {
    id: randomUUID(),
    name: strategy.name,
    version: String(strategy.version),
    conditions,
    action: strategy.action ?? 'bet_win',
    metadata,
  };

  // 선택적 필드 추가
  if (strategy.stake) {
    legacy.stake = {
      ...(strategy.stake.fixed !== undefined && { fixed: strategy.stake.fixed }),
      ...(strategy.stake.percentOfBankroll !== undefined && {
        percentOfBankroll: strategy.stake.percentOfBankroll,
      }),
      ...(strategy.stake.useKelly !== undefined && { useKelly: strategy.stake.useKelly }),
    };
  }

  if (strategy.raceFilters) {
    legacy.filters = {
      ...(strategy.raceFilters.raceTypes && { raceTypes: strategy.raceFilters.raceTypes }),
      ...(strategy.raceFilters.tracks && { tracks: strategy.raceFilters.tracks }),
      ...(strategy.raceFilters.grades && { grades: strategy.raceFilters.grades }),
      ...(strategy.raceFilters.minEntries !== undefined && {
        minEntries: strategy.raceFilters.minEntries,
      }),
    };
  }

  return legacy;
}

// =============================================================================
// Legacy to DSL Transformation
// =============================================================================

/**
 * 버전 문자열에서 주 버전 번호 추출
 * 예: '1.0.0' → 1, '2' → 2
 */
function extractMajorVersion(version: string): number {
  const match = version.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 1;
}

/**
 * Legacy 전략을 DSL 포맷으로 변환
 */
export function transformLegacyToDSL(legacy: StrategyDefinition): DSLStrategyDefinition {
  // filters 변환 (flat 필드 유지)
  const filters: DSLFilter[] = legacy.conditions.map((condition) => ({
    field: condition.field,
    operator: condition.operator,
    value: condition.value,
    ...(condition.timeRef && { timeRef: condition.timeRef }),
  }));

  // DSL 전략 생성
  const dsl: DSLStrategyDefinition = {
    strategy: {
      name: legacy.name,
      version: extractMajorVersion(legacy.version),
      filters,
      action: legacy.action,
    },
  };

  // 선택적 필드 추가
  if (legacy.stake) {
    dsl.strategy.stake = {
      ...(legacy.stake.fixed !== undefined && { fixed: legacy.stake.fixed }),
      ...(legacy.stake.percentOfBankroll !== undefined && {
        percentOfBankroll: legacy.stake.percentOfBankroll,
      }),
      ...(legacy.stake.useKelly !== undefined && { useKelly: legacy.stake.useKelly }),
    };
  }

  if (legacy.filters) {
    dsl.strategy.raceFilters = {
      ...(legacy.filters.raceTypes && { raceTypes: legacy.filters.raceTypes }),
      ...(legacy.filters.tracks && { tracks: legacy.filters.tracks }),
      ...(legacy.filters.grades && { grades: legacy.filters.grades }),
      ...(legacy.filters.minEntries !== undefined && { minEntries: legacy.filters.minEntries }),
    };
  }

  if (legacy.metadata) {
    dsl.strategy.metadata = {
      ...(legacy.metadata.author && { author: legacy.metadata.author }),
      ...(legacy.metadata.description && { description: legacy.metadata.description }),
      ...(legacy.metadata.tags && { tags: legacy.metadata.tags }),
      ...(legacy.metadata.createdAt && { createdAt: legacy.metadata.createdAt }),
      ...(legacy.metadata.updatedAt && { updatedAt: legacy.metadata.updatedAt }),
    };
  }

  return dsl;
}

// =============================================================================
// Strategy Normalization
// =============================================================================

/**
 * 입력 전략을 Legacy 포맷으로 정규화
 * - Legacy 포맷은 그대로 반환
 * - DSL 포맷은 Legacy로 변환
 */
export function normalizeStrategy(input: unknown): StrategyDefinition {
  if (isLegacyStrategy(input)) {
    return input;
  }

  if (isDSLStrategy(input)) {
    return transformDSLToLegacy(input);
  }

  throw new Error(
    'Unknown strategy format: input must be either Legacy (with conditions) or DSL (with strategy wrapper)'
  );
}
