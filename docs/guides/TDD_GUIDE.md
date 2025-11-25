---
title: KRace TDD 가이드
version: 1.0.0
status: Approved
owner: "@Prometheus-P"
created: 2025-11-25
updated: 2025-11-25
reviewers: []
language: Korean (한국어)
---

# TDD_GUIDE.md - TDD 개발 가이드

> **이 문서는 KRace 프로젝트의 TDD(Test-Driven Development) 방법론과 실천 가이드를 제공합니다.**
> Kent Beck의 TDD 원칙을 기반으로 프로젝트에 맞게 최적화되었습니다.

---

## 변경 이력 (Changelog)

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2025-11-25 | @Prometheus-P | 최초 작성 |

## 관련 문서 (Related Documents)

- [plan.md](../../plan.md) - TDD 개발 계획
- [TEST_STRATEGY_GUIDE.md](./TEST_STRATEGY_GUIDE.md) - 테스트 전략
- [CLEAN_CODE_GUIDE.md](./CLEAN_CODE_GUIDE.md) - 클린 코드 가이드
- [docs/TDD_RULES.md](../TDD_RULES.md) - TDD 규칙 (기존)

---

## 📋 목차

1. [TDD 개요](#1-tdd-개요)
2. [TDD 사이클](#2-tdd-사이클)
3. [테스트 작성 가이드](#3-테스트-작성-가이드)
4. [리팩토링 가이드](#4-리팩토링-가이드)
5. [실전 예제](#5-실전-예제)
6. [TDD 안티패턴](#6-tdd-안티패턴)
7. [도구 및 설정](#7-도구-및-설정)

---

## 1. TDD 개요

### 1.1 TDD란?

```
┌─────────────────────────────────────────────────────────────┐
│  🔴🟢🔵 TDD (Test-Driven Development)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  "테스트가 개발을 이끈다"                                    │
│                                                             │
│  프로덕션 코드를 작성하기 전에 실패하는 테스트를 먼저 작성하고,│
│  테스트를 통과시키는 최소한의 코드를 구현한 후,              │
│  코드를 개선하는 개발 방법론입니다.                          │
│                                                             │
│  핵심 원칙:                                                  │
│  • 실패하는 테스트 없이 프로덕션 코드 작성 금지              │
│  • 테스트를 통과하는 최소한의 코드만 작성                    │
│  • 리팩토링 시 테스트가 항상 통과해야 함                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 TDD의 이점

| 이점 | 설명 |
|------|------|
| **버그 감소** | 코드 작성 전 테스트로 요구사항 명확화 |
| **설계 개선** | 테스트 가능한 코드 = 좋은 설계 |
| **문서화** | 테스트가 코드의 사용법을 보여줌 |
| **자신감** | 변경 시 회귀 버그 즉시 발견 |
| **생산성** | 디버깅 시간 대폭 감소 |

### 1.3 TDD vs 기존 개발

```
기존 개발 방식:
┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐
│ 설계   │ ─▶ │ 구현   │ ─▶ │ 테스트 │ ─▶ │ 디버그 │ ─▶ ... 반복
└────────┘    └────────┘    └────────┘    └────────┘

TDD 방식:
┌────────┐    ┌────────┐    ┌────────┐
│ 테스트 │ ─▶ │ 구현   │ ─▶ │리팩토링│ ─▶ ... 반복 (작은 단위)
└────────┘    └────────┘    └────────┘
```

---

## 2. TDD 사이클

### 2.1 Red-Green-Refactor 사이클

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│           ┌─────────┐                                       │
│           │   RED   │  ← 1. 실패하는 테스트 작성             │
│           │ (실패)  │                                       │
│           └────┬────┘                                       │
│                │                                            │
│                ▼                                            │
│           ┌─────────┐                                       │
│           │  GREEN  │  ← 2. 테스트 통과하는 최소 코드        │
│           │ (통과)  │                                       │
│           └────┬────┘                                       │
│                │                                            │
│                ▼                                            │
│           ┌─────────┐                                       │
│           │REFACTOR │  ← 3. 코드 개선 (동작 유지)           │
│           │ (개선)  │                                       │
│           └────┬────┘                                       │
│                │                                            │
│                └──────────────▶ 다음 기능으로 반복           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 각 단계 상세

#### 🔴 RED 단계 (실패하는 테스트 작성)

```typescript
// ✅ 올바른 RED 단계
// 1. 원하는 동작을 테스트로 표현
// 2. 컴파일 에러 또는 테스트 실패 확인

describe('formatOdds', () => {
  it('should format odds value to one decimal place', () => {
    // 아직 formatOdds 함수가 없음 → 실패
    expect(formatOdds(2.567)).toBe('2.6');
  });
});

// 실행 결과: ReferenceError: formatOdds is not defined
```

**RED 단계 체크리스트:**
- [ ] 테스트가 원하는 동작을 명확히 표현하는가?
- [ ] 테스트가 실패하는가? (반드시 실패 확인)
- [ ] 테스트 하나만 작성했는가?
- [ ] 테스트 이름이 의도를 명확히 설명하는가?

#### 🟢 GREEN 단계 (테스트 통과)

```typescript
// ✅ 올바른 GREEN 단계
// 테스트를 통과하는 가장 간단한 코드 작성

function formatOdds(value: number): string {
  return value.toFixed(1);  // 최소한의 구현
}

// 실행 결과: PASS
```

**GREEN 단계 체크리스트:**
- [ ] 테스트가 통과하는가?
- [ ] 가장 간단한 구현인가?
- [ ] 불필요한 기능을 추가하지 않았는가?
- [ ] "나중에 필요할 것 같은" 코드를 넣지 않았는가?

#### 🔵 REFACTOR 단계 (코드 개선)

```typescript
// ✅ 올바른 REFACTOR 단계
// 동작은 유지하면서 코드 품질 개선

/**
 * 배당률 값을 표시 형식으로 변환합니다.
 * @param value - 배당률 값
 * @returns 소수점 1자리 문자열, null이면 '-'
 */
function formatOdds(value: number | null): string {
  if (value === null) return '-';
  return value.toFixed(1);
}

// 테스트 추가 필요
it('should return dash for null value', () => {
  expect(formatOdds(null)).toBe('-');
});
```

**REFACTOR 단계 체크리스트:**
- [ ] 모든 테스트가 여전히 통과하는가?
- [ ] 중복 코드를 제거했는가?
- [ ] 네이밍이 명확한가?
- [ ] 함수/클래스가 단일 책임인가?
- [ ] 새로운 동작을 추가하지 않았는가?

### 2.3 사이클 속도

```
┌─────────────────────────────────────────────────────────────┐
│  ⏱️ TDD 사이클 속도 가이드                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  이상적인 사이클: 1-5분                                      │
│                                                             │
│  • RED:      30초 - 2분 (테스트 작성)                        │
│  • GREEN:    30초 - 2분 (최소 구현)                          │
│  • REFACTOR: 1분 - 3분 (개선)                                │
│                                                             │
│  ⚠️ 사이클이 길어지면:                                       │
│  • 테스트 범위가 너무 큰 것                                  │
│  • 더 작은 단계로 분할 필요                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 테스트 작성 가이드

### 3.1 테스트 명명 규칙

```typescript
// 패턴: should_[예상결과]_when_[조건]

// ✅ 좋은 예시
describe('RaceService', () => {
  describe('getRaceById', () => {
    it('should return race when valid id provided', () => {});
    it('should throw NotFoundError when race does not exist', () => {});
    it('should return cached data when cache is valid', () => {});
  });
});

// ❌ 나쁜 예시
describe('RaceService', () => {
  it('test getRaceById', () => {});      // 무엇을 테스트?
  it('works', () => {});                  // 구체적이지 않음
  it('getRaceById returns race', () => {}); // 조건 없음
});
```

### 3.2 테스트 구조 (AAA 패턴)

```typescript
// AAA 패턴: Arrange-Act-Assert

describe('mapOddsResponse', () => {
  it('should map KSPO response to EntryOdds type', () => {
    // Arrange (준비) - 테스트 데이터 설정
    const kspoResponse = {
      entNo: '1',
      oddsDansng: '2.5',
      oddsBoksng: '1.8',
    };
    const playerName = '선수1';

    // Act (실행) - 테스트 대상 실행
    const result = mapOddsResponse(kspoResponse, playerName);

    // Assert (검증) - 결과 확인
    expect(result).toEqual({
      number: 1,
      name: '선수1',
      win: 2.5,
      place: 1.8,
    });
  });
});
```

### 3.3 테스트 독립성

```typescript
// ✅ 좋은 예시: 각 테스트가 독립적
describe('RaceCard', () => {
  // 각 테스트마다 새로운 데이터
  it('should display race venue', () => {
    const race = createMockRace({ venue: '서울' });
    render(<RaceCard race={race} />);
    expect(screen.getByText('서울')).toBeInTheDocument();
  });

  it('should display race number', () => {
    const race = createMockRace({ raceNumber: 5 });
    render(<RaceCard race={race} />);
    expect(screen.getByText('5경주')).toBeInTheDocument();
  });
});

// ❌ 나쁜 예시: 테스트 간 의존성
let sharedRace: Race;

beforeAll(() => {
  sharedRace = createMockRace();  // 공유 상태
});

it('test 1', () => {
  sharedRace.status = 'finished';  // 상태 변경
  // ...
});

it('test 2', () => {
  // sharedRace.status가 이전 테스트에 의존
  // ...
});
```

### 3.4 테스트 데이터 팩토리

```typescript
// src/tests/factories/race.factory.ts

import type { Race, RaceStatus, RaceType } from '@/types';

interface CreateMockRaceOptions {
  id?: string;
  type?: RaceType;
  raceNumber?: number;
  venue?: string;
  status?: RaceStatus;
  startTime?: string;
  distance?: number;
  entries?: number;
}

/**
 * 테스트용 Race 객체 생성 팩토리
 */
export function createMockRace(options: CreateMockRaceOptions = {}): Race {
  return {
    id: options.id ?? 'horse-20251125-seoul-1',
    type: options.type ?? 'horse',
    raceNumber: options.raceNumber ?? 1,
    venue: options.venue ?? '서울',
    venueCode: 'seoul',
    startTime: options.startTime ?? '2025-11-25T10:30:00+09:00',
    status: options.status ?? 'scheduled',
    distance: options.distance ?? 1200,
    entries: options.entries ?? 12,
  };
}

/**
 * 여러 경주 생성
 */
export function createMockRaces(count: number): Race[] {
  return Array.from({ length: count }, (_, i) =>
    createMockRace({
      id: `horse-20251125-seoul-${i + 1}`,
      raceNumber: i + 1,
    })
  );
}
```

---

## 4. 리팩토링 가이드

### 4.1 리팩토링 원칙

```
┌─────────────────────────────────────────────────────────────┐
│  ♻️ 리팩토링 황금 규칙                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 동작을 변경하지 않는다                                   │
│     • 리팩토링 전후 테스트 결과가 같아야 함                  │
│                                                             │
│  2. 작은 단계로 진행한다                                    │
│     • 한 번에 하나의 변경만                                 │
│     • 각 단계 후 테스트 실행                                │
│                                                             │
│  3. 테스트가 통과할 때만 진행한다                           │
│     • 테스트 실패 시 즉시 되돌리기                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 일반적인 리팩토링 패턴

#### 함수 추출 (Extract Function)

```typescript
// Before: 긴 함수
async function getRaces(type: RaceType, date: string): Promise<Race[]> {
  // 파라미터 검증
  if (!['horse', 'cycle', 'boat'].includes(type)) {
    throw new ValidationError('Invalid race type');
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new ValidationError('Invalid date format');
  }

  // API 호출
  const response = await fetch(`${API_URL}?type=${type}&date=${date}`);
  const data = await response.json();

  // 데이터 변환
  return data.items.map((item: any) => ({
    id: `${type}-${item.rcDate}-${item.trkCd}-${item.rcNo}`,
    // ... 많은 변환 로직
  }));
}

// After: 함수 분리
async function getRaces(type: RaceType, date: string): Promise<Race[]> {
  validateRaceParams(type, date);
  const rawData = await fetchRacesFromAPI(type, date);
  return rawData.map(mapToRace);
}

function validateRaceParams(type: RaceType, date: string): void {
  if (!isValidRaceType(type)) {
    throw new ValidationError('Invalid race type');
  }
  if (!isValidDate(date)) {
    throw new ValidationError('Invalid date format');
  }
}

async function fetchRacesFromAPI(type: RaceType, date: string): Promise<RawRace[]> {
  const response = await fetch(`${API_URL}?type=${type}&date=${date}`);
  return response.json().then(data => data.items);
}

function mapToRace(raw: RawRace): Race {
  return {
    id: generateRaceId(raw),
    // ...
  };
}
```

#### 조건문 간소화

```typescript
// Before: 복잡한 조건문
function getRaceStatusLabel(status: string): string {
  if (status === 'scheduled') {
    return '예정';
  } else if (status === 'in_progress') {
    return '진행중';
  } else if (status === 'finished') {
    return '종료';
  } else if (status === 'cancelled') {
    return '취소';
  } else {
    return '알 수 없음';
  }
}

// After: 맵 사용
const STATUS_LABELS: Record<RaceStatus, string> = {
  scheduled: '예정',
  in_progress: '진행중',
  finished: '종료',
  cancelled: '취소',
};

function getRaceStatusLabel(status: RaceStatus): string {
  return STATUS_LABELS[status] ?? '알 수 없음';
}
```

### 4.3 Tidy와 Behavior 분리

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️ 절대 규칙: Tidy와 Behavior를 섞지 마세요!               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Tidy (구조적 변경):                                        │
│  • 리팩토링 (함수 추출, 이름 변경)                          │
│  • 코드 포맷팅                                              │
│  • 파일/폴더 이동                                           │
│  • 타입 개선                                                │
│  → 동작이 변하지 않음                                       │
│                                                             │
│  Behavior (동작 변경):                                      │
│  • 새 기능 추가                                             │
│  • 버그 수정                                                │
│  • 로직 변경                                                │
│  → 동작이 변함                                              │
│                                                             │
│  커밋 예시:                                                  │
│  ✅ "refactor: extract validation logic"                    │
│  ✅ "feat: add odds display component"                      │
│  ❌ "feat: add odds display and refactor api"               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. 실전 예제

### 5.1 API Route TDD 예제

#### RED: 실패하는 테스트 작성

```typescript
// src/app/api/races/horse/route.test.ts

import { GET } from './route';
import { NextRequest } from 'next/server';

describe('GET /api/races/horse', () => {
  it('should return horse races list for valid date', async () => {
    // Arrange
    const request = new NextRequest(
      'http://localhost/api/races/horse?date=2025-11-25'
    );

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });
});
```

#### GREEN: 테스트 통과하는 최소 구현

```typescript
// src/app/api/races/horse/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: [],  // 최소 구현: 빈 배열 반환
  });
}
```

#### 테스트 추가 및 구현 확장

```typescript
// 테스트 추가
it('should return 400 for invalid date format', async () => {
  const request = new NextRequest(
    'http://localhost/api/races/horse?date=invalid'
  );

  const response = await GET(request);
  const data = await response.json();

  expect(response.status).toBe(400);
  expect(data.success).toBe(false);
  expect(data.error.code).toBe('INVALID_DATE_FORMAT');
});

// 구현 확장
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  // 날짜 검증 추가
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_DATE_FORMAT',
          message: '날짜 형식이 올바르지 않습니다.',
        },
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    data: [],
  });
}
```

### 5.2 컴포넌트 TDD 예제

#### RED: 실패하는 테스트

```typescript
// src/components/race/RaceCard.test.tsx

import { render, screen } from '@testing-library/react';
import { RaceCard } from './RaceCard';
import { createMockRace } from '@/tests/factories/race.factory';

describe('RaceCard', () => {
  it('should display race venue and number', () => {
    const race = createMockRace({
      venue: '서울',
      raceNumber: 3,
    });

    render(<RaceCard race={race} />);

    expect(screen.getByText('서울')).toBeInTheDocument();
    expect(screen.getByText(/3경주/)).toBeInTheDocument();
  });
});
```

#### GREEN: 최소 구현

```typescript
// src/components/race/RaceCard.tsx

import type { Race } from '@/types';

interface RaceCardProps {
  race: Race;
}

export function RaceCard({ race }: RaceCardProps) {
  return (
    <div>
      <span>{race.venue}</span>
      <span>{race.raceNumber}경주</span>
    </div>
  );
}
```

#### REFACTOR: 스타일 및 구조 개선

```typescript
// src/components/race/RaceCard.tsx

import type { Race } from '@/types';
import { cn } from '@/lib/utils';

interface RaceCardProps {
  race: Race;
  className?: string;
}

/**
 * 경주 카드 컴포넌트
 * @description 경주 목록에서 개별 경주 정보를 표시
 */
export function RaceCard({ race, className }: RaceCardProps) {
  return (
    <article
      className={cn(
        "p-4 bg-white rounded-lg shadow-sm border",
        "hover:shadow-md transition-shadow",
        className
      )}
    >
      <header className="flex items-center justify-between">
        <h3 className="font-semibold">
          {race.venue} {race.raceNumber}경주
        </h3>
        <RaceStatusBadge status={race.status} />
      </header>
      {/* 추가 정보... */}
    </article>
  );
}
```

---

## 6. TDD 안티패턴

### 6.1 피해야 할 패턴

```
┌─────────────────────────────────────────────────────────────┐
│  ❌ TDD 안티패턴                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 테스트 후 작성 (Test-After)                             │
│     • 코드 먼저 작성 후 테스트 추가                         │
│     • 문제: 테스트하기 어려운 코드 구조                      │
│                                                             │
│  2. 과도한 테스트 (Over-Testing)                            │
│     • 구현 세부사항 테스트                                  │
│     • 문제: 리팩토링 시 테스트 깨짐                         │
│                                                             │
│  3. 테스트 없는 리팩토링                                    │
│     • 테스트 실행 없이 코드 수정                            │
│     • 문제: 버그 유입                                       │
│                                                             │
│  4. 한 번에 너무 많은 테스트                                │
│     • 여러 기능을 한 번에 테스트                            │
│     • 문제: 실패 원인 파악 어려움                           │
│                                                             │
│  5. 느린 테스트 무시                                        │
│     • 오래 걸리는 테스트 스킵                               │
│     • 문제: 테스트 신뢰도 하락                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 구현 세부사항 vs 동작 테스트

```typescript
// ❌ 나쁜 예시: 구현 세부사항 테스트
describe('OddsDisplay', () => {
  it('should call useState with initial value', () => {
    const useStateSpy = jest.spyOn(React, 'useState');
    render(<OddsDisplay raceId="123" />);
    expect(useStateSpy).toHaveBeenCalledWith(null);  // 구현 세부사항
  });

  it('should call fetch with correct URL', () => {
    const fetchSpy = jest.spyOn(global, 'fetch');
    render(<OddsDisplay raceId="123" />);
    expect(fetchSpy).toHaveBeenCalledWith('/api/races/123/odds');  // 구현 세부사항
  });
});

// ✅ 좋은 예시: 동작 테스트
describe('OddsDisplay', () => {
  it('should display odds values when loaded', async () => {
    // Mock API 응답
    server.use(
      rest.get('/api/races/123/odds', (req, res, ctx) => {
        return res(ctx.json({
          success: true,
          data: { odds: [{ number: 1, name: '선수1', win: 2.5 }] }
        }));
      })
    );

    render(<OddsDisplay raceId="123" />);

    // 사용자가 보는 동작 테스트
    expect(await screen.findByText('2.5')).toBeInTheDocument();
    expect(screen.getByText('선수1')).toBeInTheDocument();
  });

  it('should show error message when API fails', async () => {
    server.use(
      rest.get('/api/races/123/odds', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    render(<OddsDisplay raceId="123" />);

    expect(await screen.findByText(/불러올 수 없습니다/)).toBeInTheDocument();
  });
});
```

---

## 7. 도구 및 설정

### 7.1 Jest 설정

```javascript
// jest.config.js

module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### 7.2 테스트 실행 명령어

```bash
# 전체 테스트 실행
npm test

# Watch 모드 (TDD 권장)
npm test -- --watch

# 특정 파일만 실행
npm test -- RaceCard.test.tsx

# 커버리지 리포트
npm test -- --coverage

# 특정 테스트만 실행
npm test -- -t "should display race venue"
```

### 7.3 VS Code 설정

```json
// .vscode/settings.json
{
  "jest.autoRun": {
    "watch": true,
    "onStartup": ["all-tests"]
  },
  "jest.showCoverageOnLoad": true
}
```

---

## 📋 빠른 참조

### TDD 사이클 체크리스트

```
□ RED
  □ 테스트 이름이 명확한가?
  □ 테스트가 실패하는가?
  □ 한 가지만 테스트하는가?

□ GREEN
  □ 테스트가 통과하는가?
  □ 최소한의 코드인가?
  □ 미래를 위한 코드를 넣지 않았는가?

□ REFACTOR
  □ 모든 테스트가 통과하는가?
  □ 중복을 제거했는가?
  □ 새 동작을 추가하지 않았는가?
```

### 자주 사용하는 명령어

```bash
npm test -- --watch           # TDD 모드
npm test -- --coverage        # 커버리지
npm test -- -t "pattern"      # 특정 테스트
npm test -- --updateSnapshot  # 스냅샷 업데이트
```

---

*TDD는 연습이 필요합니다. 작은 것부터 시작하세요!* 🚀
