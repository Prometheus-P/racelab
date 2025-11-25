---
title: KRace 프론트엔드 상세 스펙
version: 1.0.0
status: Approved
owner: "@Prometheus-P"
created: 2025-11-25
updated: 2025-11-25
reviewers: []
language: Korean (한국어)
---

# FRONTEND_SPEC.md - 프론트엔드 상세 스펙

> **이 문서는 KRace 프론트엔드의 상세 기술 스펙을 정의합니다.**
> 컴포넌트 설계, 상태 관리, UI/UX 가이드라인을 포함합니다.

---

## 변경 이력 (Changelog)

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2025-11-25 | @Prometheus-P | 최초 작성 |

## 관련 문서 (Related Documents)

- [ARCHITECTURE.md](./ARCHITECTURE.md) - 시스템 아키텍처
- [PRD.md](./PRD.md) - 제품 요구사항
- [DATA_MODEL.md](./DATA_MODEL.md) - 데이터 모델

---

## 📋 목차

1. [프론트엔드 아키텍처](#1-프론트엔드-아키텍처)
2. [페이지 구조](#2-페이지-구조)
3. [컴포넌트 설계](#3-컴포넌트-설계)
4. [상태 관리](#4-상태-관리)
5. [스타일 가이드](#5-스타일-가이드)
6. [반응형 설계](#6-반응형-설계)
7. [성능 최적화](#7-성능-최적화)
8. [접근성](#8-접근성)

---

## 1. 프론트엔드 아키텍처

### 1.1 기술 스택

```
┌─────────────────────────────────────────────────────────────┐
│  🎨 프론트엔드 기술 스택                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Framework     Next.js 14.2 (App Router)                    │
│  UI Library    React 18.3                                   │
│  Language      TypeScript 5.9                               │
│  Styling       Tailwind CSS 3.4                             │
│  Icons         (Native SVG / Heroicons)                     │
│  Testing       Jest + React Testing Library                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 디렉토리 구조

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 루트 레이아웃
│   ├── page.tsx                  # 홈페이지 (/)
│   ├── globals.css               # 전역 스타일
│   ├── robots.ts                 # SEO robots.txt
│   ├── sitemap.ts                # SEO sitemap
│   │
│   ├── race/
│   │   └── [id]/
│   │       └── page.tsx          # 경주 상세 (/race/[id])
│   │
│   └── api/                      # API Routes
│       └── races/
│
├── components/                   # React 컴포넌트
│   ├── layout/                   # 레이아웃 컴포넌트
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   │
│   ├── race/                     # 경주 관련 컴포넌트
│   │   ├── TodayRaces.tsx        # Server Component
│   │   ├── RaceCard.tsx
│   │   ├── RaceTabs.tsx          # Client Component
│   │   ├── EntryList.tsx
│   │   ├── OddsDisplay.tsx       # Client Component
│   │   └── ResultsTable.tsx
│   │
│   └── common/                   # 공통 컴포넌트
│       ├── LoadingSkeleton.tsx
│       ├── ErrorBoundary.tsx
│       └── TabGroup.tsx
│
├── lib/                          # 유틸리티
│   ├── api.ts                    # API 클라이언트
│   ├── api-helpers/
│   │   ├── mappers.ts
│   │   └── dummy.ts
│   └── utils/
│       ├── date.ts
│       └── ui.ts
│
├── types/                        # TypeScript 타입
│   └── index.ts
│
└── hooks/                        # Custom Hooks
    ├── useOdds.ts
    └── useInterval.ts
```

### 1.3 렌더링 전략

| 페이지 | 렌더링 | 이유 |
|--------|--------|------|
| 홈페이지 | ISR (30초) | SEO + 적절한 신선도 |
| 경주 상세 | ISR (60초) | SEO + 데이터 갱신 |
| 배당률 섹션 | CSR | 실시간 갱신 필요 |
| 결과 페이지 | ISR (5분) | 확정 데이터, SEO |

---

## 2. 페이지 구조

### 2.1 페이지 목록

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/` | HomePage | 오늘의 경주 목록 |
| `/race/[id]` | RaceDetailPage | 경주 상세 정보 |

### 2.2 홈페이지 (/)

```tsx
// src/app/page.tsx

import { Suspense } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TodayRaces } from '@/components/race/TodayRaces';
import { QuickStats } from '@/components/race/QuickStats';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';

export const revalidate = 30; // ISR: 30초

export default function HomePage() {
  return (
    <>
      <Header />

      <main className="container mx-auto px-4 py-6">
        {/* 빠른 통계 */}
        <section className="mb-6">
          <Suspense fallback={<LoadingSkeleton type="stats" />}>
            <QuickStats />
          </Suspense>
        </section>

        {/* 오늘의 경주 */}
        <section>
          <h1 className="text-2xl font-bold mb-4">오늘의 경주</h1>
          <Suspense fallback={<LoadingSkeleton type="races" />}>
            <TodayRaces />
          </Suspense>
        </section>
      </main>

      <Footer />
    </>
  );
}
```

**와이어프레임**

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] KRace                                    [날씨] [시간]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┬─────────────┬─────────────┐               │
│  │ 경마 12경주 │ 경륜 10경주 │ 경정 8경주  │  ← QuickStats │
│  └─────────────┴─────────────┴─────────────┘               │
│                                                             │
│  오늘의 경주                                                │
│  ┌─────────┬─────────┬─────────┐                           │
│  │  경마   │  경륜   │  경정   │  ← TabGroup               │
│  └─────────┴─────────┴─────────┘                           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 서울 1경주        10:30 출발        [예정]           │   │
│  │ 1200m │ 3등급 │ 출주 12마리                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 서울 2경주        11:05 출발        [진행중]         │   │
│  │ 1400m │ 4등급 │ 출주 10마리                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ... more races ...                                         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  © 2025 KRace. 본 서비스는 정보 제공 목적입니다.            │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 경주 상세 페이지 (/race/[id])

```tsx
// src/app/race/[id]/page.tsx

import { notFound } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { EntryList } from '@/components/race/EntryList';
import { OddsDisplay } from '@/components/race/OddsDisplay';
import { ResultsTable } from '@/components/race/ResultsTable';
import { getRaceById } from '@/lib/api';

export const revalidate = 60; // ISR: 60초

interface Props {
  params: { id: string };
}

export default async function RaceDetailPage({ params }: Props) {
  const race = await getRaceById(params.id);

  if (!race) {
    notFound();
  }

  return (
    <>
      <Header />

      <main className="container mx-auto px-4 py-6">
        {/* 경주 헤더 */}
        <section className="mb-6">
          <h1 className="text-2xl font-bold">
            {race.venue} {race.raceNumber}경주
          </h1>
          <p className="text-gray-600">
            {race.distance}m | {race.class} | {race.entries}마리 출주
          </p>
        </section>

        {/* 출주표 */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">출주표</h2>
          <EntryList raceId={params.id} />
        </section>

        {/* 배당률 (Client Component) */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-3">배당률</h2>
          <OddsDisplay raceId={params.id} />
        </section>

        {/* 결과 */}
        {race.status === 'finished' && (
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">경주 결과</h2>
            <ResultsTable raceId={params.id} />
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
```

---

## 3. 컴포넌트 설계

### 3.1 컴포넌트 분류

| 유형 | 렌더링 | 용도 | 예시 |
|------|--------|------|------|
| **Server** | 서버 | 데이터 페칭, SEO | TodayRaces, EntryList |
| **Client** | 클라이언트 | 인터랙션, 실시간 | OddsDisplay, RaceTabs |
| **Shared** | 양쪽 | 순수 UI | RaceCard, LoadingSkeleton |

### 3.2 주요 컴포넌트 스펙

#### Header 컴포넌트

```tsx
// src/components/layout/Header.tsx

interface HeaderProps {
  className?: string;
}

/**
 * 헤더 컴포넌트
 * @description 로고, 날짜, 시간을 표시하는 고정 헤더
 */
export function Header({ className }: HeaderProps) {
  return (
    <header className={cn(
      "sticky top-0 z-50 bg-white border-b border-gray-200",
      className
    )}>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-blue-600">KRace</span>
        </Link>

        {/* 날짜/시간 */}
        <div className="text-sm text-gray-600">
          <time dateTime={new Date().toISOString()}>
            {formatDate(new Date())}
          </time>
        </div>
      </div>
    </header>
  );
}
```

#### TodayRaces 컴포넌트 (Server)

```tsx
// src/components/race/TodayRaces.tsx

import { getRaces } from '@/lib/api';
import { RaceTabs } from './RaceTabs';
import { RaceCard } from './RaceCard';

/**
 * 오늘의 경주 목록
 * @description Server Component - 데이터 페칭 담당
 */
export async function TodayRaces() {
  // 병렬 데이터 페칭
  const [horseRaces, cycleRaces, boatRaces] = await Promise.all([
    getRaces('horse'),
    getRaces('cycle'),
    getRaces('boat'),
  ]);

  const raceData = {
    horse: horseRaces,
    cycle: cycleRaces,
    boat: boatRaces,
  };

  return <RaceTabs raceData={raceData} />;
}
```

#### RaceTabs 컴포넌트 (Client)

```tsx
// src/components/race/RaceTabs.tsx
'use client';

import { useState } from 'react';
import { RaceCard } from './RaceCard';
import { TabGroup } from '../common/TabGroup';
import type { Race, RaceType } from '@/types';

interface RaceTabsProps {
  raceData: Record<RaceType, Race[]>;
}

const TABS = [
  { id: 'horse', label: '경마', icon: '🏇' },
  { id: 'cycle', label: '경륜', icon: '🚴' },
  { id: 'boat', label: '경정', icon: '🚤' },
] as const;

/**
 * 경주 탭 컴포넌트
 * @description Client Component - 탭 전환 인터랙션
 */
export function RaceTabs({ raceData }: RaceTabsProps) {
  const [activeTab, setActiveTab] = useState<RaceType>('horse');
  const races = raceData[activeTab];

  return (
    <div>
      {/* 탭 그룹 */}
      <TabGroup
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as RaceType)}
        className="mb-4"
      />

      {/* 경주 목록 */}
      <div className="space-y-3">
        {races.length > 0 ? (
          races.map((race) => (
            <RaceCard key={race.id} race={race} />
          ))
        ) : (
          <p className="text-center text-gray-500 py-8">
            오늘 예정된 {TABS.find(t => t.id === activeTab)?.label} 경주가 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}
```

#### OddsDisplay 컴포넌트 (Client)

```tsx
// src/components/race/OddsDisplay.tsx
'use client';

import { useOdds } from '@/hooks/useOdds';
import { formatTime } from '@/lib/utils/date';

interface OddsDisplayProps {
  raceId: string;
  refreshInterval?: number; // 기본 30초
}

/**
 * 배당률 표시 컴포넌트
 * @description Client Component - 실시간 배당률 갱신
 */
export function OddsDisplay({ raceId, refreshInterval = 30000 }: OddsDisplayProps) {
  const { odds, isLoading, error, lastUpdated, refresh } = useOdds(raceId, {
    refreshInterval,
  });

  if (isLoading && !odds) {
    return <OddsSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        배당률을 불러올 수 없습니다.
        <button onClick={refresh} className="ml-2 underline">
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* 마지막 갱신 시간 */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-gray-500">
          마지막 갱신: {formatTime(lastUpdated)}
        </span>
        <button
          onClick={refresh}
          className="text-sm text-blue-600 hover:underline"
        >
          새로고침
        </button>
      </div>

      {/* 배당률 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left">번호</th>
              <th className="px-3 py-2 text-left">마명</th>
              <th className="px-3 py-2 text-right">단승</th>
              <th className="px-3 py-2 text-right">복승</th>
            </tr>
          </thead>
          <tbody>
            {odds?.odds.map((entry) => (
              <tr key={entry.number} className="border-b">
                <td className="px-3 py-2 font-medium">{entry.number}</td>
                <td className="px-3 py-2">{entry.name}</td>
                <td className="px-3 py-2 text-right">
                  <OddsValue value={entry.win} change={entry.winChange} />
                </td>
                <td className="px-3 py-2 text-right">
                  <OddsValue value={entry.place} change={entry.placeChange} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OddsValue({ value, change }: { value: number | null; change?: string }) {
  if (value === null) return <span className="text-gray-400">-</span>;

  const changeColor = {
    up: 'text-red-500',
    down: 'text-blue-500',
    same: '',
  }[change || 'same'];

  return (
    <span className={changeColor}>
      {value.toFixed(1)}
      {change === 'up' && ' ▲'}
      {change === 'down' && ' ▼'}
    </span>
  );
}
```

---

## 4. 상태 관리

### 4.1 상태 관리 전략

```
┌─────────────────────────────────────────────────────────────┐
│  📦 상태 관리 전략                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Server State (서버 데이터)                                  │
│  ─────────────────────────────────────────────              │
│  • Server Components에서 직접 fetch                         │
│  • ISR로 캐싱                                               │
│  • 추가 라이브러리 불필요                                    │
│                                                             │
│  Client State (UI 상태)                                     │
│  ─────────────────────────────────────────────              │
│  • React useState / useReducer                              │
│  • 탭 선택, 모달, 폼 상태                                   │
│  • 컴포넌트 레벨 관리                                        │
│                                                             │
│  Real-time State (실시간 데이터)                            │
│  ─────────────────────────────────────────────              │
│  • Custom Hooks (useOdds)                                   │
│  • useInterval로 폴링                                        │
│  • 로컬 캐시 (상태)                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Custom Hooks

#### useOdds Hook

```typescript
// src/hooks/useOdds.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useInterval } from './useInterval';
import type { RaceOdds } from '@/types';

interface UseOddsOptions {
  refreshInterval?: number;
  enabled?: boolean;
}

interface UseOddsReturn {
  odds: RaceOdds | null;
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

/**
 * 배당률 실시간 조회 훅
 * @param raceId - 경주 ID
 * @param options - 옵션 (갱신 주기 등)
 */
export function useOdds(
  raceId: string,
  options: UseOddsOptions = {}
): UseOddsReturn {
  const { refreshInterval = 30000, enabled = true } = options;

  const [odds, setOdds] = useState<RaceOdds | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchOdds = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/races/${raceId}/odds`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error.message);
      }

      setOdds(data.data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('배당률 조회 실패'));
    } finally {
      setIsLoading(false);
    }
  }, [raceId]);

  // 초기 로드
  useEffect(() => {
    if (enabled) {
      fetchOdds();
    }
  }, [enabled, fetchOdds]);

  // 주기적 갱신
  useInterval(
    () => {
      if (enabled) {
        fetchOdds();
      }
    },
    enabled ? refreshInterval : null
  );

  return {
    odds,
    isLoading,
    error,
    lastUpdated,
    refresh: fetchOdds,
  };
}
```

#### useInterval Hook

```typescript
// src/hooks/useInterval.ts
'use client';

import { useEffect, useRef } from 'react';

/**
 * setInterval을 React에서 안전하게 사용하기 위한 훅
 * @param callback - 실행할 콜백
 * @param delay - 지연 시간 (ms), null이면 중지
 */
export function useInterval(
  callback: () => void,
  delay: number | null
): void {
  const savedCallback = useRef<() => void>();

  // callback 저장
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // interval 설정
  useEffect(() => {
    if (delay === null) return;

    const tick = () => {
      savedCallback.current?.();
    };

    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
}
```

---

## 5. 스타일 가이드

### 5.1 디자인 토큰

```typescript
// tailwind.config.ts

const config = {
  theme: {
    extend: {
      colors: {
        // 브랜드 컬러
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',  // 메인
          600: '#2563eb',
          700: '#1d4ed8',
        },
        // 경주 상태
        status: {
          scheduled: '#6b7280',  // gray
          'in-progress': '#f59e0b',  // amber
          finished: '#10b981',  // green
          cancelled: '#ef4444',  // red
        },
        // 배당률 변화
        odds: {
          up: '#ef4444',    // red (상승)
          down: '#3b82f6',  // blue (하락)
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'odds': ['1.125rem', { lineHeight: '1.5', fontWeight: '600' }],
      },
    },
  },
};
```

### 5.2 컴포넌트 스타일 패턴

```tsx
// 조건부 스타일 유틸리티
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 사용 예시
function RaceStatusBadge({ status }: { status: RaceStatus }) {
  return (
    <span className={cn(
      "px-2 py-1 rounded text-xs font-medium",
      {
        'bg-gray-100 text-gray-600': status === 'scheduled',
        'bg-amber-100 text-amber-700': status === 'in_progress',
        'bg-green-100 text-green-700': status === 'finished',
        'bg-red-100 text-red-700': status === 'cancelled',
      }
    )}>
      {statusLabels[status]}
    </span>
  );
}
```

---

## 6. 반응형 설계

### 6.1 브레이크포인트

| 이름 | 크기 | 타겟 기기 |
|------|------|----------|
| `sm` | 640px | 큰 스마트폰 |
| `md` | 768px | 태블릿 세로 |
| `lg` | 1024px | 태블릿 가로, 작은 노트북 |
| `xl` | 1280px | 데스크톱 |

### 6.2 레이아웃 전략

```
Mobile First 접근법
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

모바일 (< 640px)
┌───────────────────┐
│      Header       │
├───────────────────┤
│    Quick Stats    │
│   (세로 스택)      │
├───────────────────┤
│   Tab (풀너비)     │
├───────────────────┤
│   Race Cards      │
│   (풀너비)        │
└───────────────────┘

태블릿 (768px+)
┌─────────────────────────────┐
│          Header             │
├─────────────────────────────┤
│ Stats │ Stats │ Stats       │
├─────────────────────────────┤
│ Tab │ Tab │ Tab             │
├─────────────────────────────┤
│  Race Card  │  Race Card    │
│  Race Card  │  Race Card    │
└─────────────────────────────┘

데스크톱 (1024px+)
┌───────────────────────────────────────┐
│              Header                   │
├───────────────────────────────────────┤
│  Stats  │  Stats  │  Stats  │ Stats   │
├───────────────────────────────────────┤
│  Tab │ Tab │ Tab                      │
├───────────────────────────────────────┤
│ Race Card │ Race Card │ Race Card     │
└───────────────────────────────────────┘
```

### 6.3 반응형 컴포넌트 예시

```tsx
function RaceCard({ race }: { race: Race }) {
  return (
    <div className={cn(
      // 모바일: 풀너비, 세로 레이아웃
      "p-4 bg-white rounded-lg shadow-sm border",
      // 태블릿+: 가로 레이아웃
      "md:flex md:items-center md:justify-between"
    )}>
      {/* 경주 정보 */}
      <div className="mb-3 md:mb-0">
        <h3 className="font-semibold">
          {race.venue} {race.raceNumber}경주
        </h3>
        <p className="text-sm text-gray-500">
          {race.distance}m | {race.class}
        </p>
      </div>

      {/* 출발 시간 & 상태 */}
      <div className={cn(
        "flex items-center justify-between",
        "md:flex-col md:items-end md:gap-1"
      )}>
        <time className="text-sm">{formatTime(race.startTime)}</time>
        <RaceStatusBadge status={race.status} />
      </div>
    </div>
  );
}
```

---

## 7. 성능 최적화

### 7.1 최적화 체크리스트

```
┌─────────────────────────────────────────────────────────────┐
│  ⚡ 성능 최적화 체크리스트                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  □ Server Components 우선 사용                              │
│  □ 'use client' 최소화 (필요한 곳만)                        │
│  □ ISR revalidate 적절히 설정                               │
│  □ Image 컴포넌트 사용 (next/image)                         │
│  □ Dynamic import로 코드 스플리팅                           │
│  □ Suspense 바운더리로 스트리밍                             │
│  □ 불필요한 리렌더링 방지 (memo, useMemo)                   │
│  □ CSS Tailwind purge 활성화                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 코드 스플리팅

```tsx
// 동적 임포트로 번들 크기 최적화
import dynamic from 'next/dynamic';

// 배당률 컴포넌트 - 경주 상세에서만 로드
const OddsDisplay = dynamic(
  () => import('@/components/race/OddsDisplay'),
  {
    loading: () => <OddsSkeleton />,
    ssr: false, // 클라이언트에서만 렌더링
  }
);
```

### 7.3 성능 목표

| 지표 | 목표 | 측정 도구 |
|------|------|----------|
| LCP | < 2.5s | Lighthouse |
| FID | < 100ms | Lighthouse |
| CLS | < 0.1 | Lighthouse |
| TTI | < 3.8s | Lighthouse |
| Bundle Size | < 100KB (초기) | Next.js 분석 |

---

## 8. 접근성

### 8.1 접근성 요구사항

| 항목 | 요구사항 | WCAG |
|------|----------|------|
| 색상 대비 | 4.5:1 이상 | AA |
| 키보드 접근 | 모든 기능 | AA |
| 스크린 리더 | 주요 콘텐츠 | AA |
| 포커스 표시 | 명확한 표시 | AA |

### 8.2 접근성 구현

```tsx
// 탭 컴포넌트 접근성 예시
function TabGroup({ tabs, activeTab, onTabChange }) {
  return (
    <div
      role="tablist"
      aria-label="경주 종목 선택"
      className="flex gap-2"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          id={`tab-${tab.id}`}
          aria-selected={activeTab === tab.id}
          aria-controls={`panel-${tab.id}`}
          tabIndex={activeTab === tab.id ? 0 : -1}
          onClick={() => onTabChange(tab.id)}
          onKeyDown={(e) => handleKeyDown(e, tab.id)}
          className={cn(
            "px-4 py-2 rounded transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            activeTab === tab.id
              ? "bg-blue-600 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          )}
        >
          <span aria-hidden="true">{tab.icon}</span>
          <span className="ml-1">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
```

---

## 📋 부록

### A. 파일 명명 규칙

| 유형 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase | `RaceCard.tsx` |
| 훅 | camelCase + use | `useOdds.ts` |
| 유틸리티 | camelCase | `formatDate.ts` |
| 테스트 | *.test.tsx | `RaceCard.test.tsx` |
| 스타일 | *.module.css (선택) | - |

### B. 임포트 순서

```tsx
// 1. React/Next.js
import { useState, useEffect } from 'react';
import Link from 'next/link';

// 2. 서드파티 라이브러리
import { clsx } from 'clsx';

// 3. 내부 모듈 (@/)
import { cn } from '@/lib/utils';
import type { Race } from '@/types';

// 4. 상대 경로
import { RaceCard } from './RaceCard';
```

---

*이 문서는 프론트엔드 스펙 변경 시 업데이트됩니다.*
