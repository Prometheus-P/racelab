/**
 * LiveRegion Component
 *
 * 스크린 리더에 동적 콘텐츠 변경을 알리는 컴포넌트 (WCAG 4.1.3 Status Messages)
 *
 * 사용 예:
 * - 검색 결과 개수 알림
 * - 폼 제출 결과 알림
 * - 로딩 완료 알림
 *
 * @see https://www.w3.org/WAI/WCAG21/Understanding/status-messages.html
 */

import React, { useEffect, useState } from 'react';

export interface LiveRegionProps {
  /** 알림 메시지 */
  message: string;
  /** 긴급도: polite(비긴급), assertive(긴급) */
  politeness?: 'polite' | 'assertive';
  /** atomic: true면 전체 내용 읽음 */
  atomic?: boolean;
  /** 역할: status(상태), alert(경고), log(로그) */
  role?: 'status' | 'alert' | 'log';
  /** 메시지 지연 시간 (ms) - 스크린 리더 호환성 향상 */
  delay?: number;
}

/**
 * 스크린 리더에 동적 콘텐츠 변경을 알림
 *
 * @example
 * ```tsx
 * const [results, setResults] = useState([]);
 *
 * <LiveRegion
 *   message={`검색 결과 ${results.length}건`}
 *   politeness="polite"
 * />
 * ```
 */
export function LiveRegion({
  message,
  politeness = 'polite',
  atomic = true,
  role = 'status',
  delay = 100,
}: LiveRegionProps) {
  const [announcement, setAnnouncement] = useState('');

  // 메시지 변경 시 약간의 지연 후 알림 (스크린 리더 호환성)
  useEffect(() => {
    if (!message) {
      setAnnouncement('');
      return;
    }

    // 먼저 빈 문자열로 초기화 (스크린 리더가 변경 감지하도록)
    setAnnouncement('');

    const timer = setTimeout(() => {
      setAnnouncement(message);
    }, delay);

    return () => clearTimeout(timer);
  }, [message, delay]);

  return (
    <div
      role={role}
      aria-live={politeness}
      aria-atomic={atomic}
      className="sr-only"
    >
      {announcement}
    </div>
  );
}

/**
 * 긴급 알림용 컴포넌트 (에러, 경고)
 *
 * @example
 * ```tsx
 * <AlertLive message="저장에 실패했습니다" />
 * ```
 */
export function AlertLive({ message }: { message: string }) {
  return <LiveRegion message={message} politeness="assertive" role="alert" />;
}

/**
 * 상태 알림용 컴포넌트 (검색 결과, 로딩 완료)
 *
 * @example
 * ```tsx
 * <StatusLive message={`${count}개의 결과를 찾았습니다`} />
 * ```
 */
export function StatusLive({ message }: { message: string }) {
  return <LiveRegion message={message} politeness="polite" role="status" />;
}

export default LiveRegion;
