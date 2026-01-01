/**
 * VisuallyHidden Component
 *
 * 시각적으로는 숨기지만 스크린 리더에서는 읽히는 텍스트 (WCAG 1.3.1)
 *
 * 사용 예:
 * - 아이콘 버튼의 설명 텍스트
 * - 추가 컨텍스트 정보
 * - 테이블 헤더 보충 설명
 *
 * @see https://www.w3.org/WAI/tutorials/forms/labels/#note-on-hiding-elements
 */

import React from 'react';

export interface VisuallyHiddenProps {
  /** 스크린 리더에 읽힐 콘텐츠 */
  children: React.ReactNode;
  /** HTML 요소 타입 */
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label';
  /** 추가 CSS 클래스 */
  className?: string;
  /** ID (aria-labelledby 등에서 참조용) */
  id?: string;
}

/**
 * 스크린 리더 전용 텍스트
 *
 * Tailwind의 sr-only 클래스를 사용하여 시각적으로 숨김
 *
 * @example
 * ```tsx
 * <button>
 *   <SearchIcon aria-hidden="true" />
 *   <VisuallyHidden>검색</VisuallyHidden>
 * </button>
 * ```
 *
 * @example
 * ```tsx
 * <VisuallyHidden as="h2" id="results-heading">
 *   검색 결과
 * </VisuallyHidden>
 * <ul aria-labelledby="results-heading">
 *   ...
 * </ul>
 * ```
 */
export function VisuallyHidden({
  children,
  as: Component = 'span',
  className = '',
  id,
}: VisuallyHiddenProps) {
  return (
    <Component id={id} className={`sr-only ${className}`.trim()}>
      {children}
    </Component>
  );
}

/**
 * 포커스 시에만 보이는 요소 (스킵 링크 등)
 *
 * @example
 * ```tsx
 * <FocusVisible as="a" href="#main">
 *   본문 바로가기
 * </FocusVisible>
 * ```
 */
export function FocusVisible({
  children,
  as: Component = 'span',
  className = '',
  ...props
}: VisuallyHiddenProps & React.HTMLAttributes<HTMLElement>) {
  return (
    <Component
      className={`sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-2 focus:bg-white focus:text-black focus:ring-2 focus:ring-primary ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  );
}

export default VisuallyHidden;
