# Research: Production Hardening

**Date**: 2025-12-12
**Feature**: 006-production-hardening

## Research Summary

이 피처는 기존 코드베이스 리팩토링으로, 새로운 기술 도입 없이 기존 패턴의 최적화에 집중합니다.

---

## 1. KST Timezone Handling in Vercel Edge

### Decision
`Intl.DateTimeFormat`과 `toLocaleString`의 `timeZone: 'Asia/Seoul'` 옵션 사용

### Rationale
- Vercel Edge Runtime은 V8 기반으로 ECMA-402 Intl API를 완벽 지원
- 추가 라이브러리(moment-timezone, date-fns-tz) 불필요
- 기존 `getKoreanDate()` 함수가 이미 이 패턴 사용 중

### Alternatives Considered
| Alternative | Rejected Because |
| ----------- | ---------------- |
| moment-timezone | 번들 크기 증가, deprecated 상태 |
| date-fns-tz | 추가 의존성, 기존 패턴으로 충분 |
| UTC offset 하드코딩 (+9) | DST 없어 가능하지만 Intl API가 더 명시적 |

### Implementation Notes
```typescript
// 기존 패턴 유지
export function getKoreanDate(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
}

// 신규 추가
export function normalizeRaceDate(date: string): string {
  // YYYYMMDD → YYYY-MM-DD
  if (date.length === 8 && !date.includes('-')) {
    return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
  }
  return date;
}

export function buildRaceStartDateTime(date: string, time: string): string {
  const normalized = normalizeRaceDate(date);
  return `${normalized}T${time}:00+09:00`;
}
```

---

## 2. Next.js Server Component Data Fetching Pattern

### Decision
홈 페이지 Server Component에서 데이터 fetch 후 Client/Server Component에 props로 전달

### Rationale
- Next.js 14 권장 패턴: "Fetch data in Server Components, pass to Client Components"
- Request deduplication: 동일 요청은 자동으로 중복 제거됨
- Suspense와 자연스럽게 통합

### Alternatives Considered
| Alternative | Rejected Because |
| ----------- | ---------------- |
| React Query/SWR | Server Component에서 불필요, 추가 복잡성 |
| Context API | 서버-클라이언트 경계에서 제약, props가 더 명시적 |
| Parallel Routes | 현재 구조에 과도한 변경 필요 |

### Implementation Notes
```typescript
// src/app/page.tsx
export default async function Home({ searchParams }) {
  const rcDate = getTodayYYYYMMDD();
  const allRaces = await fetchTodayAllRaces(rcDate);

  return (
    <>
      <QuickStats data={allRaces} />
      <Suspense fallback={<RaceListSkeleton />}>
        <TodayRaces data={allRaces} filter={currentTab} />
      </Suspense>
    </>
  );
}
```

---

## 3. API Timeout Implementation

### Decision
`AbortController`와 `setTimeout`을 조합하여 10초 타임아웃 구현

### Rationale
- 표준 Web API 사용, 추가 라이브러리 불필요
- Next.js fetch는 AbortSignal 지원
- 10초는 공공 API 지연 허용하면서 사용자 대기 최소화하는 균형점 (Clarification에서 확정)

### Alternatives Considered
| Alternative | Rejected Because |
| ----------- | ---------------- |
| axios timeout | 추가 의존성, fetch로 충분 |
| Promise.race | AbortController가 더 명시적이고 리소스 정리 가능 |
| Next.js fetch options | revalidate는 캐싱용, timeout 직접 지원 안 함 |

### Implementation Notes
```typescript
async function fetchWithTimeout<T>(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 10000
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}
```

---

## 4. Error State Type Pattern

### Decision
단순 Union 타입 `RaceFetchStatus = 'OK' | 'NOT_FOUND' | 'UPSTREAM_ERROR'`

### Rationale
- 3가지 명확한 상태만 필요
- TypeScript exhaustiveness checking 활용 가능
- 기존 코드베이스 스타일과 일관성 유지

### Alternatives Considered
| Alternative | Rejected Because |
| ----------- | ---------------- |
| Result<T, E> 모나드 | 과도한 추상화, 학습 곡선 |
| Error 클래스 상속 | 단순 상태 구분에 과도함 |
| HTTP 상태 코드 그대로 | 도메인 의미 불명확 |

### Implementation Notes
```typescript
export type RaceFetchStatus = 'OK' | 'NOT_FOUND' | 'UPSTREAM_ERROR';

export interface RaceFetchResult<T> {
  status: RaceFetchStatus;
  data: T | null;
  error?: string;
}

// 사용 예시 - exhaustiveness check
function handleResult(result: RaceFetchResult<Race>) {
  switch (result.status) {
    case 'OK':
      return <RaceDetail race={result.data!} />;
    case 'NOT_FOUND':
      return <RaceNotFound />;
    case 'UPSTREAM_ERROR':
      return <ErrorBanner message="데이터 제공 시스템 지연 중" />;
  }
}
```

---

## 5. Race Type Config Consolidation

### Decision
`src/config/raceTypes.ts`에 단일 설정 객체 export

### Rationale
- 정적 데이터이므로 Context/Provider 불필요
- Tree-shaking 가능
- 타입 안전성 확보

### Implementation Notes
```typescript
// src/config/raceTypes.ts
import { RaceType } from '@/types';

export interface RaceTypeConfig {
  label: string;
  shortLabel: string;
  icon: string;
  color: {
    primary: string;    // text-horse, text-cycle, text-boat
    bg: string;         // bg-horse/5, etc.
    border: string;     // border-horse, etc.
    badge: string;      // bg-horse/10, etc.
  };
}

export const RACE_TYPES: Record<RaceType, RaceTypeConfig> = {
  horse: {
    label: '경마',
    shortLabel: '마',
    icon: '🐎',
    color: {
      primary: 'text-horse',
      bg: 'bg-horse/5',
      border: 'border-horse',
      badge: 'bg-horse/10',
    },
  },
  cycle: {
    label: '경륜',
    shortLabel: '륜',
    icon: '🚴',
    color: {
      primary: 'text-cycle',
      bg: 'bg-cycle/5',
      border: 'border-cycle',
      badge: 'bg-cycle/10',
    },
  },
  boat: {
    label: '경정',
    shortLabel: '정',
    icon: '🚤',
    color: {
      primary: 'text-boat',
      bg: 'bg-boat/5',
      border: 'border-boat',
      badge: 'bg-boat/10',
    },
  },
};
```

---

## Conclusion

모든 연구 항목이 기존 기술 스택과 패턴 내에서 해결 가능합니다. 추가 의존성 없이 구현 진행 가능.

| Research Area | Status | Additional Dependencies |
| ------------- | ------ | ----------------------- |
| KST Timezone | ✅ Resolved | None |
| Data Fetching Pattern | ✅ Resolved | None |
| API Timeout | ✅ Resolved | None |
| Error State Types | ✅ Resolved | None |
| Config Consolidation | ✅ Resolved | None |
