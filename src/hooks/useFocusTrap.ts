/**
 * useFocusTrap Hook
 *
 * 모달/다이얼로그 내부에서 포커스를 가두는 훅 (WCAG 2.4.3 Focus Order)
 *
 * 기능:
 * - Tab/Shift+Tab으로 내부 요소만 순환
 * - 열릴 때 첫 번째 포커스 가능 요소로 이동
 * - 닫힐 때 트리거 요소로 포커스 복원
 */

import { useEffect, useRef, useCallback } from 'react';

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
].join(', ');

interface UseFocusTrapOptions {
  /** 트랩 활성화 여부 */
  enabled?: boolean;
  /** 열릴 때 첫 요소로 포커스 이동 */
  autoFocus?: boolean;
  /** 닫힐 때 이전 포커스 복원 */
  restoreFocus?: boolean;
  /** 초기 포커스 대상 ref (지정 시 해당 요소로 포커스) */
  initialFocusRef?: React.RefObject<HTMLElement>;
}

export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  options: UseFocusTrapOptions = {}
) {
  const { enabled = true, autoFocus = true, restoreFocus = true, initialFocusRef } = options;

  const containerRef = useRef<T>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // 포커스 가능 요소 목록 가져오기
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];

    const elements = containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
    return Array.from(elements).filter(
      (el) => !el.hasAttribute('disabled') && el.offsetParent !== null // visible only
    );
  }, []);

  // Tab 키 핸들러
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement;

      // Shift+Tab on first element -> go to last
      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      // Tab on last element -> go to first
      if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
        return;
      }

      // 포커스가 컨테이너 밖에 있으면 첫 요소로 이동
      if (!containerRef.current?.contains(activeElement)) {
        event.preventDefault();
        firstElement.focus();
      }
    },
    [getFocusableElements]
  );

  // 포커스 트랩 활성화/비활성화
  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    // 이전 활성 요소 저장
    previousActiveElement.current = document.activeElement as HTMLElement;

    // 초기 포커스 설정
    if (autoFocus) {
      requestAnimationFrame(() => {
        if (initialFocusRef?.current) {
          initialFocusRef.current.focus();
        } else {
          const focusableElements = getFocusableElements();
          if (focusableElements.length > 0) {
            focusableElements[0].focus();
          } else {
            // 포커스 가능 요소가 없으면 컨테이너 자체에 포커스
            containerRef.current?.focus();
          }
        }
      });
    }

    // Tab 키 리스너 등록
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // 포커스 복원
      if (restoreFocus && previousActiveElement.current) {
        // 요소가 아직 DOM에 존재하고 포커스 가능한지 확인
        if (
          document.body.contains(previousActiveElement.current) &&
          typeof previousActiveElement.current.focus === 'function'
        ) {
          previousActiveElement.current.focus();
        }
      }
    };
  }, [enabled, autoFocus, restoreFocus, handleKeyDown, getFocusableElements, initialFocusRef]);

  return containerRef;
}

export default useFocusTrap;
