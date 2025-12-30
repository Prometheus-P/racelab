/**
 * react-querybuilder → StrategyDefinition 변환
 *
 * react-querybuilder의 RuleGroupType을 기존 DSL의 StrategyDefinition으로 변환
 */

import type { RuleGroupType, RuleType } from 'react-querybuilder';
import type {
  StrategyDefinition,
  StrategyCondition,
  ConditionOperator,
  BetAction,
} from '@/lib/strategy/types';

/**
 * react-querybuilder 연산자 → DSL 연산자 매핑
 */
const OPERATOR_MAP: Record<string, ConditionOperator> = {
  '=': 'eq',
  '!=': 'ne',
  '>': 'gt',
  '>=': 'gte',
  '<': 'lt',
  '<=': 'lte',
  between: 'between',
  notBetween: 'between', // 반전 처리 필요 (향후)
  in: 'in',
  notIn: 'in', // 반전 처리 필요 (향후)
};

/**
 * react-querybuilder 규칙 → DSL 조건으로 변환
 */
function ruleToCondition(rule: RuleType): StrategyCondition | null {
  const { field, operator, value } = rule;

  // 필수 값 검증
  if (!field || !operator || value === undefined || value === null || value === '') {
    return null;
  }

  const dslOperator = OPERATOR_MAP[operator];
  if (!dslOperator) {
    console.warn(`Unknown operator: ${operator}`);
    return null;
  }

  // 값 변환
  let conditionValue: StrategyCondition['value'];

  if (dslOperator === 'between') {
    // between의 경우 "min,max" 형식 또는 배열 처리
    if (Array.isArray(value)) {
      conditionValue = [Number(value[0]), Number(value[1])];
    } else if (typeof value === 'string' && value.includes(',')) {
      const [min, max] = value.split(',').map(Number);
      conditionValue = [min, max];
    } else {
      console.warn(`Invalid between value: ${value}`);
      return null;
    }
  } else if (dslOperator === 'in') {
    // in의 경우 배열 또는 쉼표 구분 문자열 처리
    if (Array.isArray(value)) {
      conditionValue = value.map(Number);
    } else if (typeof value === 'string') {
      conditionValue = value.split(',').map((v) => Number(v.trim()));
    } else {
      conditionValue = [Number(value)];
    }
  } else {
    // 단일 값
    conditionValue = Number(value);
    if (isNaN(conditionValue)) {
      conditionValue = value as string;
    }
  }

  return {
    // ExtendedConditionField는 ConditionField의 superset이므로 type assertion 사용
    field: field as unknown as StrategyCondition['field'],
    operator: dslOperator,
    value: conditionValue,
  };
}

/**
 * react-querybuilder RuleGroupType → StrategyDefinition 변환
 */
export interface QueryToStrategyOptions {
  /** 전략 ID (미지정 시 자동 생성) */
  id?: string;
  /** 전략 이름 */
  name: string;
  /** 베팅 액션 */
  action?: BetAction;
  /** 작성자 */
  author?: string;
  /** 설명 */
  description?: string;
  /** 태그 */
  tags?: string[];
  /** 베팅 금액 설정 */
  stake?: StrategyDefinition['stake'];
  /** 필터 설정 */
  filters?: StrategyDefinition['filters'];
}

/**
 * UUID 생성 (간단 버전)
 */
function generateId(): string {
  return 'strategy-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
}

/**
 * react-querybuilder 쿼리를 StrategyDefinition으로 변환
 */
export function queryToStrategy(
  query: RuleGroupType,
  options: QueryToStrategyOptions
): StrategyDefinition {
  const conditions: StrategyCondition[] = [];

  // 규칙 그룹 처리 (현재는 최상위 그룹의 AND 규칙만 지원)
  // 향후 중첩 그룹 및 OR 지원 확장 가능
  for (const rule of query.rules) {
    if ('rules' in rule) {
      // 중첩 그룹 - 재귀적으로 flatten (현재 AND로 처리)
      const nestedRules = rule as RuleGroupType;
      for (const nestedRule of nestedRules.rules) {
        if (!('rules' in nestedRule)) {
          const condition = ruleToCondition(nestedRule as RuleType);
          if (condition) {
            conditions.push(condition);
          }
        }
      }
    } else {
      // 단일 규칙
      const condition = ruleToCondition(rule as RuleType);
      if (condition) {
        conditions.push(condition);
      }
    }
  }

  const now = new Date().toISOString();

  return {
    id: options.id || generateId(),
    name: options.name,
    version: '1.0.0',
    conditions,
    action: options.action || 'bet_win',
    stake: options.stake || { fixed: 10000 },
    filters: options.filters,
    metadata: {
      author: options.author || 'anonymous',
      createdAt: now,
      updatedAt: now,
      description: options.description,
      tags: options.tags,
    },
  };
}

/**
 * StrategyDefinition → react-querybuilder RuleGroupType 변환 (역변환)
 * 기존 전략을 편집할 때 사용
 */
export function strategyToQuery(strategy: StrategyDefinition): RuleGroupType {
  const rules: RuleType[] = strategy.conditions.map((condition, index) => {
    let operator = '=';
    let value: string | number = '';

    // DSL 연산자 → react-querybuilder 연산자
    switch (condition.operator) {
      case 'eq':
        operator = '=';
        break;
      case 'ne':
        operator = '!=';
        break;
      case 'gt':
        operator = '>';
        break;
      case 'gte':
        operator = '>=';
        break;
      case 'lt':
        operator = '<';
        break;
      case 'lte':
        operator = '<=';
        break;
      case 'between':
        operator = 'between';
        break;
      case 'in':
        operator = 'in';
        break;
    }

    // 값 변환
    if (Array.isArray(condition.value)) {
      value = condition.value.join(',');
    } else {
      value = condition.value as string | number;
    }

    return {
      id: `rule-${index}`,
      field: condition.field,
      operator,
      value: String(value),
    };
  });

  return {
    id: 'root',
    combinator: 'and',
    rules,
  };
}
