'use client';

/**
 * Visual Strategy Builder
 *
 * react-querybuilder 기반 No-Code 전략 빌더
 * 드래그앤드롭으로 베팅 전략 조건을 시각적으로 구성
 */

import { useState, useCallback, useMemo } from 'react';
import {
  QueryBuilder,
  type RuleGroupType,
  type Field,
  type OperatorSelectorProps,
  type ValueEditorProps,
} from 'react-querybuilder';
import { QueryBuilderDnD } from '@react-querybuilder/dnd';
import * as ReactDnD from 'react-dnd';
import * as ReactDndHtml5Backend from 'react-dnd-html5-backend';
import {
  EXTENDED_FIELD_METADATA,
  FIELD_CATEGORIES,
  type ExtendedConditionField,
} from '@/lib/strategy/types';
import { queryToStrategy } from './utils/queryToStrategy';
import type { StrategyDefinition, BetAction } from '@/lib/strategy/types';

// =============================================================================
// 한국어 연산자 정의
// =============================================================================

const OPERATORS = [
  { name: '=', label: '같다' },
  { name: '!=', label: '다르다' },
  { name: '>', label: '크다' },
  { name: '>=', label: '크거나 같다' },
  { name: '<', label: '작다' },
  { name: '<=', label: '작거나 같다' },
  { name: 'between', label: '범위 내' },
  { name: 'in', label: '포함' },
];

// =============================================================================
// 한국어 번역
// =============================================================================

const TRANSLATIONS = {
  addRule: {
    label: '+ 조건 추가',
    title: '새 조건 추가',
  },
  addGroup: {
    label: '+ 그룹 추가',
    title: '새 조건 그룹 추가',
  },
  removeRule: {
    label: '×',
    title: '조건 삭제',
  },
  removeGroup: {
    label: '×',
    title: '그룹 삭제',
  },
  combinators: {
    title: '조합 방식',
  },
  fields: {
    title: '필드 선택',
    placeholderName: '필드 선택',
    placeholderLabel: '필드를 선택하세요',
  },
  operators: {
    title: '연산자',
  },
  value: {
    title: '값',
  },
  dragHandle: {
    label: '☰',
    title: '드래그하여 순서 변경',
  },
};

const COMBINATORS = [
  { name: 'and', label: 'AND (모두 충족)' },
  { name: 'or', label: 'OR (하나라도 충족)' },
];

// =============================================================================
// 필드 정의 (카테고리별 그룹)
// =============================================================================

function createFields(): Field[] {
  const fields: Field[] = [];

  // 카테고리별로 필드 그룹화
  for (const [category, categoryMeta] of Object.entries(FIELD_CATEGORIES)) {
    const categoryFields = Object.values(EXTENDED_FIELD_METADATA).filter(
      (meta) => meta.category === category
    );

    for (const meta of categoryFields) {
      fields.push({
        name: meta.field,
        label: `[${categoryMeta.label}] ${meta.label}`,
        inputType: 'number',
        placeholder: meta.description,
        comparator: 'number',
      } as Field);
    }
  }

  return fields;
}

// =============================================================================
// Custom Value Editor (범위 입력 지원)
// =============================================================================

function CustomValueEditor(props: ValueEditorProps) {
  const { field, operator, value, handleOnChange } = props;

  // 필드 메타데이터 가져오기
  const fieldMeta = EXTENDED_FIELD_METADATA[field as ExtendedConditionField];
  const unit = fieldMeta?.unit || '';
  const min = fieldMeta?.min;
  const max = fieldMeta?.max;

  // between 연산자: 범위 입력
  if (operator === 'between') {
    const [minVal, maxVal] = (value || ',').split(',');

    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          className="w-20 rounded border border-neutral-border bg-surface px-2 py-1 text-sm"
          placeholder={min !== undefined ? String(min) : '최소'}
          value={minVal || ''}
          min={min}
          max={max}
          onChange={(e) => handleOnChange(`${e.target.value},${maxVal || ''}`)}
        />
        <span className="text-neutral-text-secondary">~</span>
        <input
          type="number"
          className="w-20 rounded border border-neutral-border bg-surface px-2 py-1 text-sm"
          placeholder={max !== undefined ? String(max) : '최대'}
          value={maxVal || ''}
          min={min}
          max={max}
          onChange={(e) => handleOnChange(`${minVal || ''},${e.target.value}`)}
        />
        {unit && <span className="text-sm text-neutral-text-tertiary">{unit}</span>}
      </div>
    );
  }

  // in 연산자: 다중 값 입력
  if (operator === 'in') {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          className="w-40 rounded border border-neutral-border bg-surface px-2 py-1 text-sm"
          placeholder="값1, 값2, 값3"
          value={value || ''}
          onChange={(e) => handleOnChange(e.target.value)}
        />
        {unit && <span className="text-sm text-neutral-text-tertiary">{unit}</span>}
      </div>
    );
  }

  // 기본: 단일 숫자 입력
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        className="w-24 rounded border border-neutral-border bg-surface px-2 py-1 text-sm"
        placeholder={fieldMeta?.description || '값 입력'}
        value={value || ''}
        min={min}
        max={max}
        step={field.includes('pct') || field.includes('rate') ? '0.1' : '1'}
        onChange={(e) => handleOnChange(e.target.value)}
      />
      {unit && <span className="text-sm text-neutral-text-tertiary">{unit}</span>}
    </div>
  );
}

// =============================================================================
// Custom Operator Selector (한국어 라벨)
// =============================================================================

function CustomOperatorSelector(props: OperatorSelectorProps) {
  const { value, handleOnChange, options } = props;

  return (
    <select
      className="rounded border border-neutral-border bg-surface px-2 py-1 text-sm"
      value={value}
      onChange={(e) => handleOnChange(e.target.value)}
    >
      {options.map((option) => {
        // OptionGroup 처리 (그룹이면 options 속성이 있음)
        if ('options' in option) {
          return null; // 그룹은 현재 지원하지 않음
        }
        return (
          <option key={option.name} value={option.name}>
            {option.label}
          </option>
        );
      })}
    </select>
  );
}

// =============================================================================
// StrategyBuilder Props
// =============================================================================

export interface StrategyBuilderProps {
  /** 초기 전략 (편집 모드) */
  initialStrategy?: StrategyDefinition;
  /** 전략 저장 콜백 */
  onSave?: (strategy: StrategyDefinition) => void;
  /** 전략 변경 콜백 (실시간) */
  onChange?: (strategy: StrategyDefinition) => void;
  /** 미리보기 표시 여부 */
  showPreview?: boolean;
  /** 저장 버튼 표시 여부 */
  showSaveButton?: boolean;
  /** 클래스명 */
  className?: string;
}

// =============================================================================
// StrategyBuilder Component
// =============================================================================

const DEFAULT_QUERY: RuleGroupType = {
  id: 'root',
  combinator: 'and',
  rules: [],
};

export function StrategyBuilder({
  initialStrategy,
  onSave,
  onChange,
  showPreview = true,
  showSaveButton = true,
  className = '',
}: StrategyBuilderProps) {
  // 필드 목록 (메모이제이션)
  const fields = useMemo(() => createFields(), []);

  // 전략 이름
  const [strategyName, setStrategyName] = useState(initialStrategy?.name || '새 전략');

  // 베팅 액션
  const [action, setAction] = useState<BetAction>(initialStrategy?.action || 'bet_win');

  // 베팅 금액
  const [betAmount, setBetAmount] = useState(initialStrategy?.stake?.fixed || 10000);

  // 쿼리 상태
  const [query, setQuery] = useState<RuleGroupType>(() => {
    if (initialStrategy) {
      // 기존 전략을 쿼리로 변환
      const rules = initialStrategy.conditions.map((condition, index) => {
        let operator = '=';
        let value = '';

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

        if (Array.isArray(condition.value)) {
          value = condition.value.join(',');
        } else {
          value = String(condition.value);
        }

        return {
          id: `rule-${index}`,
          field: condition.field,
          operator,
          value,
        };
      });

      return {
        id: 'root',
        combinator: 'and',
        rules,
      };
    }
    return DEFAULT_QUERY;
  });

  // 현재 전략 생성
  const currentStrategy = useMemo(() => {
    return queryToStrategy(query, {
      name: strategyName,
      action,
      stake: { fixed: betAmount },
      author: 'user',
    });
  }, [query, strategyName, action, betAmount]);

  // 쿼리 변경 핸들러
  const handleQueryChange = useCallback(
    (newQuery: RuleGroupType) => {
      setQuery(newQuery);
      if (onChange) {
        const strategy = queryToStrategy(newQuery, {
          name: strategyName,
          action,
          stake: { fixed: betAmount },
          author: 'user',
        });
        onChange(strategy);
      }
    },
    [onChange, strategyName, action, betAmount]
  );

  // 저장 핸들러
  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(currentStrategy);
    }
  }, [onSave, currentStrategy]);

  return (
    <div className={`rounded-xl border border-neutral-divider bg-surface p-6 ${className}`}>
      {/* 헤더: 전략 이름 */}
      <div className="mb-6">
        <label className="mb-2 block text-label-medium font-medium text-neutral-text-secondary">
          전략 이름
        </label>
        <input
          type="text"
          className="w-full rounded-lg border border-neutral-border bg-neutral-background px-4 py-2 text-title-medium font-semibold text-neutral-text-primary focus:border-primary focus:outline-none"
          value={strategyName}
          onChange={(e) => setStrategyName(e.target.value)}
          placeholder="전략 이름을 입력하세요"
        />
      </div>

      {/* 조건 빌더 */}
      <div className="mb-6">
        <label className="mb-2 block text-label-medium font-medium text-neutral-text-secondary">
          진입 조건
        </label>
        <div className="rounded-lg border border-neutral-border bg-neutral-background p-4">
          <QueryBuilderDnD dnd={{ ...ReactDnD, ...ReactDndHtml5Backend }}>
            <QueryBuilder
              fields={fields}
              query={query}
              onQueryChange={handleQueryChange}
              operators={OPERATORS}
              combinators={COMBINATORS}
              translations={TRANSLATIONS}
              controlElements={{
                valueEditor: CustomValueEditor,
                operatorSelector: CustomOperatorSelector,
              }}
              controlClassnames={{
                queryBuilder: 'strategy-builder',
                ruleGroup: 'rounded-lg border border-neutral-divider bg-surface p-3 mb-2',
                header: 'flex items-center gap-2 mb-2',
                body: 'space-y-2',
                rule: 'flex items-center gap-2 rounded-md bg-surface-container p-2',
                addRule: 'text-sm text-primary hover:text-primary-dark cursor-pointer',
                addGroup: 'text-sm text-boat hover:text-boat-dark cursor-pointer ml-2',
                removeRule:
                  'text-sm text-error hover:text-error-dark cursor-pointer ml-auto px-2',
                removeGroup: 'text-sm text-error hover:text-error-dark cursor-pointer ml-2',
                combinators: 'rounded border border-neutral-border bg-surface px-2 py-1 text-sm',
                fields: 'rounded border border-neutral-border bg-surface px-2 py-1 text-sm',
                operators: 'rounded border border-neutral-border bg-surface px-2 py-1 text-sm',
                value: 'rounded border border-neutral-border bg-surface px-2 py-1 text-sm',
                dragHandle: 'cursor-grab text-neutral-text-tertiary hover:text-neutral-text-primary',
              }}
              showCombinatorsBetweenRules
              showNotToggle={false}
              resetOnFieldChange
            />
          </QueryBuilderDnD>
        </div>
      </div>

      {/* 액션 설정 */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-label-medium font-medium text-neutral-text-secondary">
            베팅 유형
          </label>
          <select
            className="w-full rounded-lg border border-neutral-border bg-neutral-background px-4 py-2 text-body-medium"
            value={action}
            onChange={(e) => setAction(e.target.value as BetAction)}
          >
            <option value="bet_win">단승 베팅</option>
            <option value="bet_place">복승 베팅</option>
            <option value="bet_quinella">연승 베팅</option>
            <option value="skip">베팅 안함</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-label-medium font-medium text-neutral-text-secondary">
            베팅 금액
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              className="w-full rounded-lg border border-neutral-border bg-neutral-background px-4 py-2 text-body-medium"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              min={1000}
              step={1000}
            />
            <span className="text-body-medium text-neutral-text-tertiary">원</span>
          </div>
        </div>
      </div>

      {/* 미리보기 */}
      {showPreview && (
        <div className="mb-6 rounded-lg border border-neutral-divider bg-surface-container p-4">
          <h4 className="mb-2 text-label-medium font-semibold text-neutral-text-primary">
            조건 요약
          </h4>
          {currentStrategy.conditions.length === 0 ? (
            <p className="text-body-small text-neutral-text-tertiary">
              조건을 추가하세요.
            </p>
          ) : (
            <ul className="space-y-1 text-body-small text-neutral-text-secondary">
              {currentStrategy.conditions.map((condition, index) => {
                const fieldMeta = EXTENDED_FIELD_METADATA[condition.field as ExtendedConditionField];
                const fieldLabel = fieldMeta?.label || condition.field;
                const unit = fieldMeta?.unit || '';

                let valueDisplay = '';
                if (Array.isArray(condition.value)) {
                  if (condition.operator === 'between') {
                    valueDisplay = `${condition.value[0]} ~ ${condition.value[1]}${unit}`;
                  } else {
                    valueDisplay = condition.value.join(', ') + unit;
                  }
                } else {
                  valueDisplay = `${condition.value}${unit}`;
                }

                const operatorLabels: Record<string, string> = {
                  eq: '=',
                  ne: '≠',
                  gt: '>',
                  gte: '≥',
                  lt: '<',
                  lte: '≤',
                  between: '범위',
                  in: '포함',
                };

                return (
                  <li key={index} className="flex items-center gap-2">
                    <span className="font-medium text-neutral-text-primary">{fieldLabel}</span>
                    <span className="text-neutral-text-tertiary">
                      {operatorLabels[condition.operator] || condition.operator}
                    </span>
                    <span className="font-mono text-primary">{valueDisplay}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* 저장 버튼 */}
      {showSaveButton && (
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="rounded-lg border border-neutral-border px-6 py-2 text-label-large font-medium text-neutral-text-primary hover:bg-surface-container"
            onClick={() => setQuery(DEFAULT_QUERY)}
          >
            초기화
          </button>
          <button
            type="button"
            className="rounded-lg bg-primary px-6 py-2 text-label-large font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
            disabled={currentStrategy.conditions.length === 0}
            onClick={handleSave}
          >
            전략 저장
          </button>
        </div>
      )}
    </div>
  );
}

export default StrategyBuilder;
