/**
 * FormGroup Component
 *
 * 관련 폼 요소를 그룹화하는 시맨틱 컴포넌트 (WCAG 1.3.1 Info and Relationships)
 *
 * fieldset + legend를 사용하여 스크린 리더가 폼 구조를 이해할 수 있도록 함
 *
 * @see https://www.w3.org/WAI/tutorials/forms/grouping/
 */

import React, { useId } from 'react';

export interface FormGroupProps {
  /** 그룹 제목 (legend) */
  legend: string;
  /** 그룹 내 폼 요소들 */
  children: React.ReactNode;
  /** 그룹 설명 (선택) */
  description?: string;
  /** legend 시각적으로 숨김 (sr-only) */
  hideLegend?: boolean;
  /** 필수 그룹 여부 */
  required?: boolean;
  /** 에러 메시지 */
  error?: string;
  /** 추가 CSS 클래스 */
  className?: string;
}

/**
 * 폼 그룹 컴포넌트
 *
 * @example
 * ```tsx
 * <FormGroup legend="연락처 정보" description="연락 가능한 정보를 입력해주세요">
 *   <M3TextField label="이메일" type="email" />
 *   <M3TextField label="전화번호" type="tel" />
 * </FormGroup>
 * ```
 *
 * @example
 * ```tsx
 * <FormGroup legend="경주 유형 선택" required>
 *   <RaceTypeFilter />
 * </FormGroup>
 * ```
 */
export function FormGroup({
  legend,
  children,
  description,
  hideLegend = false,
  required = false,
  error,
  className = '',
}: FormGroupProps) {
  const descriptionId = useId();
  const errorId = useId();

  const hasError = !!error;

  // aria-describedby 조합
  const describedByIds = [
    description ? descriptionId : null,
    hasError ? errorId : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <fieldset
      className={`space-y-4 ${hasError ? 'border-red-500' : ''} ${className}`.trim()}
      aria-describedby={describedByIds || undefined}
      aria-invalid={hasError || undefined}
      aria-required={required || undefined}
    >
      <legend
        className={`text-sm font-medium text-on-surface ${
          hideLegend ? 'sr-only' : ''
        } ${required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ''}`}
      >
        {legend}
      </legend>

      {description && (
        <p id={descriptionId} className="text-xs text-on-surface-variant -mt-2">
          {description}
        </p>
      )}

      {children}

      {hasError && (
        <p id={errorId} className="text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}

/**
 * 라디오/체크박스 그룹용 컴포넌트
 *
 * @example
 * ```tsx
 * <RadioGroup legend="결제 방법" name="payment">
 *   <Radio value="card" label="카드" />
 *   <Radio value="bank" label="계좌이체" />
 * </RadioGroup>
 * ```
 */
export function RadioGroup({
  legend,
  children,
  name,
  orientation = 'vertical',
  ...props
}: FormGroupProps & {
  name: string;
  orientation?: 'horizontal' | 'vertical';
}) {
  return (
    <FormGroup legend={legend} {...props}>
      <div
        role="radiogroup"
        aria-label={legend}
        className={
          orientation === 'horizontal' ? 'flex flex-wrap gap-4' : 'space-y-2'
        }
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<{ name?: string }>, {
              name,
            });
          }
          return child;
        })}
      </div>
    </FormGroup>
  );
}

export default FormGroup;
