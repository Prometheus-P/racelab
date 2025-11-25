---
title: KRace 클린 코드 가이드
version: 1.0.0
status: Approved
owner: "@Prometheus-P"
created: 2025-11-25
updated: 2025-11-25
reviewers: []
language: Korean (한국어)
---

# CLEAN_CODE_GUIDE.md - 클린 코드 가이드

> **이 문서는 KRace 프로젝트의 클린 코드 원칙과 코딩 컨벤션을 정의합니다.**
> Robert C. Martin의 Clean Code 원칙을 TypeScript/React에 맞게 적용했습니다.

---

## 변경 이력 (Changelog)

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2025-11-25 | @Prometheus-P | 최초 작성 |

## 관련 문서 (Related Documents)

- [TDD_GUIDE.md](./TDD_GUIDE.md) - TDD 가이드
- [ERROR_HANDLING_GUIDE.md](./ERROR_HANDLING_GUIDE.md) - 에러 처리 가이드
- [CONTRIBUTING.md](../../CONTRIBUTING.md) - 기여 가이드

---

## 📋 목차

1. [클린 코드 원칙](#1-클린-코드-원칙)
2. [네이밍 규칙](#2-네이밍-규칙)
3. [함수 설계](#3-함수-설계)
4. [클래스와 모듈](#4-클래스와-모듈)
5. [주석과 문서화](#5-주석과-문서화)
6. [TypeScript 베스트 프랙티스](#6-typescript-베스트-프랙티스)
7. [React 베스트 프랙티스](#7-react-베스트-프랙티스)
8. [코드 품질 체크리스트](#8-코드-품질-체크리스트)

---

## 1. 클린 코드 원칙

### 1.1 핵심 원칙

```
┌─────────────────────────────────────────────────────────────┐
│  📖 클린 코드 핵심 원칙                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 가독성 (Readability)                                    │
│     "코드는 작성되는 것보다 읽히는 횟수가 더 많다"           │
│     → 다른 개발자(미래의 나)가 쉽게 이해할 수 있게           │
│                                                             │
│  2. 단순성 (Simplicity)                                     │
│     "가장 간단한 해결책이 최선이다"                          │
│     → 불필요한 복잡성 제거, YAGNI 원칙                       │
│                                                             │
│  3. 단일 책임 (Single Responsibility)                       │
│     "하나의 함수/클래스는 하나의 일만"                       │
│     → 변경 이유가 하나뿐인 코드                             │
│                                                             │
│  4. DRY (Don't Repeat Yourself)                            │
│     "중복은 모든 악의 근원"                                  │
│     → 동일한 로직은 한 곳에만                               │
│                                                             │
│  5. 표현력 (Expressiveness)                                 │
│     "코드가 의도를 명확히 표현"                              │
│     → 주석 없이도 이해 가능한 코드                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 코드 품질 기준

| 항목 | 기준 | 이유 |
|------|------|------|
| 함수 길이 | 20줄 이하 | 가독성, 단일 책임 |
| 클래스 길이 | 200줄 이하 | 응집도 유지 |
| 파일 길이 | 400줄 이하 | 관리 용이성 |
| 중첩 깊이 | 3단계 이하 | 복잡도 제어 |
| 매개변수 수 | 4개 이하 | 인터페이스 단순화 |
| 사이클로매틱 복잡도 | 10 이하 | 테스트 용이성 |

---

## 2. 네이밍 규칙

### 2.1 일반 원칙

```typescript
// ✅ 의도를 드러내는 이름
const raceStartTime = new Date('2025-11-25T10:30:00');
const isRaceFinished = race.status === 'finished';
const maxEntriesPerRace = 16;

// ❌ 의미 없는 이름
const d = new Date('2025-11-25T10:30:00');
const flag = race.status === 'finished';
const n = 16;
```

### 2.2 네이밍 컨벤션

| 대상 | 컨벤션 | 예시 |
|------|--------|------|
| 변수 | camelCase | `raceData`, `userToken` |
| 상수 | UPPER_SNAKE_CASE | `MAX_ENTRIES`, `API_URL` |
| 함수 | camelCase (동사) | `getRaces`, `validateInput` |
| 클래스/타입 | PascalCase | `RaceService`, `EntryOdds` |
| 인터페이스 | PascalCase | `RaceProps`, `ApiResponse` |
| 파일 (컴포넌트) | PascalCase | `RaceCard.tsx` |
| 파일 (유틸리티) | camelCase | `formatDate.ts` |
| 훅 | camelCase (use-) | `useOdds`, `useInterval` |

### 2.3 의미 있는 이름 짓기

```typescript
// ✅ 좋은 예시

// 동사로 시작하는 함수명
function calculateWinRate(wins: number, total: number): number { }
function fetchRaceData(raceId: string): Promise<Race> { }
function isValidDate(dateString: string): boolean { }

// 명확한 불린 이름
const isLoading = true;
const hasError = error !== null;
const canSubmit = isValid && !isLoading;

// 컬렉션은 복수형
const races: Race[] = [];
const oddsMap: Map<string, Odds> = new Map();
const entryIds: string[] = [];

// ❌ 나쁜 예시
function process(data: any): any { }        // 무엇을 처리?
function doIt(): void { }                    // 무엇을?
const data = [];                             // 무슨 데이터?
const temp = calculateSomething();           // 임시?
```

### 2.4 약어 사용 규칙

```typescript
// ✅ 허용되는 약어
const id = '123';           // identifier
const url = 'https://...';  // Uniform Resource Locator
const api = new ApiClient(); // Application Programming Interface

// ✅ 프로젝트 도메인 약어 (용어집 정의됨)
const kra = 'Korean Racing Authority';  // 한국마사회
const kspo = 'Korea Sports Promotion Foundation';  // 국민체육진흥공단

// ❌ 피해야 할 약어
const rc = getRace();       // race
const usr = getUser();      // user
const btn = document.getElementById('button');  // button
```

---

## 3. 함수 설계

### 3.1 단일 책임 원칙

```typescript
// ❌ 나쁜 예시: 여러 책임
async function processRaceData(raceId: string) {
  // 1. 데이터 가져오기
  const response = await fetch(`/api/races/${raceId}`);
  const data = await response.json();

  // 2. 데이터 검증
  if (!data.id || !data.venue) {
    throw new Error('Invalid data');
  }

  // 3. 데이터 변환
  const race = {
    id: data.id,
    venue: data.venue,
    startTime: new Date(data.startTime),
  };

  // 4. 캐시에 저장
  cache.set(raceId, race);

  // 5. UI 업데이트
  updateRaceDisplay(race);

  return race;
}

// ✅ 좋은 예시: 책임 분리
async function getRace(raceId: string): Promise<Race> {
  const rawData = await fetchRaceData(raceId);
  validateRaceData(rawData);
  return mapToRace(rawData);
}

async function fetchRaceData(raceId: string): Promise<RawRaceData> {
  const response = await fetch(`/api/races/${raceId}`);
  return response.json();
}

function validateRaceData(data: unknown): asserts data is RawRaceData {
  if (!isValidRaceData(data)) {
    throw new ValidationError('Invalid race data');
  }
}

function mapToRace(raw: RawRaceData): Race {
  return {
    id: raw.id,
    venue: raw.venue,
    startTime: new Date(raw.startTime),
  };
}
```

### 3.2 함수 인자 규칙

```typescript
// ✅ 좋은 예시: 명확한 인자

// 인자 0-2개가 이상적
function getOdds(raceId: string): Promise<Odds> { }
function formatTime(date: Date, locale: string): string { }

// 3개 이상이면 객체로 그룹화
interface CreateRaceOptions {
  type: RaceType;
  venue: string;
  date: string;
  distance: number;
  class: string;
}

function createRace(options: CreateRaceOptions): Race { }

// ❌ 나쁜 예시: 너무 많은 인자
function createRace(
  type: string,
  venue: string,
  date: string,
  distance: number,
  raceClass: string,
  entries: number,
  prize: string,
  weather: string
): Race { }
```

### 3.3 부작용 피하기

```typescript
// ❌ 나쁜 예시: 숨겨진 부작용
let cachedRaces: Race[] = [];

function getRaces(): Race[] {
  if (cachedRaces.length === 0) {
    cachedRaces = fetchRacesSync();  // 부작용: 전역 상태 변경
  }
  return cachedRaces;
}

// ✅ 좋은 예시: 순수 함수
function filterFinishedRaces(races: Race[]): Race[] {
  return races.filter(race => race.status === 'finished');
}

function sortByStartTime(races: Race[]): Race[] {
  return [...races].sort((a, b) =>
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
}

// 부작용이 필요한 경우 명확히 표시
function saveToCache(key: string, data: unknown): void {
  localStorage.setItem(key, JSON.stringify(data));
}
```

### 3.4 Early Return 패턴

```typescript
// ❌ 나쁜 예시: 깊은 중첩
function processRace(race: Race | null): string {
  if (race) {
    if (race.status === 'finished') {
      if (race.results) {
        if (race.results.length > 0) {
          return `Winner: ${race.results[0].name}`;
        } else {
          return 'No results';
        }
      } else {
        return 'Results pending';
      }
    } else {
      return 'Race not finished';
    }
  } else {
    return 'No race';
  }
}

// ✅ 좋은 예시: Early Return
function processRace(race: Race | null): string {
  if (!race) {
    return 'No race';
  }

  if (race.status !== 'finished') {
    return 'Race not finished';
  }

  if (!race.results) {
    return 'Results pending';
  }

  if (race.results.length === 0) {
    return 'No results';
  }

  return `Winner: ${race.results[0].name}`;
}
```

---

## 4. 클래스와 모듈

### 4.1 모듈 구성

```typescript
// ✅ 좋은 모듈 구조

// src/lib/api/races.ts
// 단일 도메인에 집중

// Public API (export)
export async function getRaces(type: RaceType, date: string): Promise<Race[]> {
  const rawData = await fetchRaces(type, date);
  return rawData.map(mapToRace);
}

export async function getRaceById(id: string): Promise<Race> {
  const rawData = await fetchRaceById(id);
  return mapToRace(rawData);
}

// Private helpers (no export)
async function fetchRaces(type: RaceType, date: string): Promise<RawRace[]> {
  // 구현...
}

async function fetchRaceById(id: string): Promise<RawRace> {
  // 구현...
}

function mapToRace(raw: RawRace): Race {
  // 구현...
}
```

### 4.2 의존성 주입

```typescript
// ✅ 좋은 예시: 테스트 가능한 구조

interface ApiClient {
  get<T>(url: string): Promise<T>;
}

class RaceService {
  constructor(private apiClient: ApiClient) {}

  async getRaces(type: RaceType): Promise<Race[]> {
    const data = await this.apiClient.get<RawRace[]>(`/races/${type}`);
    return data.map(mapToRace);
  }
}

// 프로덕션
const raceService = new RaceService(new HttpApiClient());

// 테스트
const mockClient: ApiClient = {
  get: jest.fn().mockResolvedValue(mockData),
};
const testService = new RaceService(mockClient);
```

### 4.3 인터페이스 분리

```typescript
// ❌ 나쁜 예시: 뚱뚱한 인터페이스
interface RaceRepository {
  getRaces(): Promise<Race[]>;
  getRaceById(id: string): Promise<Race>;
  createRace(race: Race): Promise<Race>;
  updateRace(id: string, race: Race): Promise<Race>;
  deleteRace(id: string): Promise<void>;
  getOdds(raceId: string): Promise<Odds>;
  getResults(raceId: string): Promise<Results>;
  // ... 너무 많은 책임
}

// ✅ 좋은 예시: 분리된 인터페이스
interface RaceReader {
  getRaces(): Promise<Race[]>;
  getRaceById(id: string): Promise<Race>;
}

interface RaceWriter {
  createRace(race: Race): Promise<Race>;
  updateRace(id: string, race: Race): Promise<Race>;
  deleteRace(id: string): Promise<void>;
}

interface OddsReader {
  getOdds(raceId: string): Promise<Odds>;
}

interface ResultsReader {
  getResults(raceId: string): Promise<Results>;
}
```

---

## 5. 주석과 문서화

### 5.1 주석 원칙

```typescript
// ✅ 좋은 주석: WHY (왜)를 설명

// KSPO API는 날짜를 YYYYMMDD 형식으로 요구합니다
const formattedDate = date.replace(/-/g, '');

// 경주 시작 5분 전부터는 배당률 갱신을 중단합니다 (규정상 제한)
if (minutesUntilStart < 5) {
  stopOddsPolling();
}

// ❌ 나쁜 주석: WHAT (무엇)을 설명 (코드로 이미 명확함)

// 날짜를 포맷합니다
const formattedDate = formatDate(date);

// 경주를 가져옵니다
const races = await getRaces();

// i를 1 증가시킵니다
i++;
```

### 5.2 JSDoc 활용

```typescript
/**
 * 배당률 값을 표시 형식으로 변환합니다.
 *
 * @param value - 배당률 값 (1.0 이상의 숫자 또는 null)
 * @returns 소수점 첫째 자리까지의 문자열, null이면 '-'
 *
 * @example
 * formatOdds(2.567)  // '2.6'
 * formatOdds(null)   // '-'
 * formatOdds(1.0)    // '1.0'
 */
export function formatOdds(value: number | null): string {
  if (value === null) return '-';
  return value.toFixed(1);
}

/**
 * 경주 목록을 조회합니다.
 *
 * @param type - 경주 유형 (horse, cycle, boat)
 * @param date - 조회 날짜 (YYYY-MM-DD 형식)
 * @returns 경주 목록
 *
 * @throws {ValidationError} 잘못된 날짜 형식
 * @throws {ApiError} API 호출 실패
 */
export async function getRaces(type: RaceType, date: string): Promise<Race[]> {
  // 구현...
}
```

### 5.3 TODO 주석 (금지)

```typescript
// ❌ 금지: TODO, FIXME 등 미완성 표시
function calculateOdds() {
  // TODO: 나중에 구현
}

function processData() {
  // FIXME: 버그 있음
}

// ✅ 대신: 이슈로 등록하고 완성된 코드만 커밋
// 미완성 기능은 커밋하지 않거나, feature flag로 비활성화
```

---

## 6. TypeScript 베스트 프랙티스

### 6.1 타입 정의

```typescript
// ✅ 좋은 타입 정의

// 명확한 타입 별칭
type RaceId = string;
type OddsValue = number | null;

// Union 타입으로 가능한 값 제한
type RaceStatus = 'scheduled' | 'in_progress' | 'finished' | 'cancelled';
type RaceType = 'horse' | 'cycle' | 'boat';

// 인터페이스로 객체 구조 정의
interface Race {
  id: RaceId;
  type: RaceType;
  status: RaceStatus;
  startTime: string;
}

// 제네릭으로 재사용성
interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// ❌ 피해야 할 패턴
type Data = any;                    // any 금지
type Response = object;             // 너무 광범위
interface Props { [key: string]: any; }  // 타입 안전성 없음
```

### 6.2 타입 가드

```typescript
// ✅ 타입 가드 함수
function isRace(value: unknown): value is Race {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'type' in value &&
    'status' in value
  );
}

function isValidRaceType(value: string): value is RaceType {
  return ['horse', 'cycle', 'boat'].includes(value);
}

// 사용
function processData(data: unknown) {
  if (isRace(data)) {
    // 여기서 data는 Race 타입
    console.log(data.venue);
  }
}
```

### 6.3 Null 처리

```typescript
// ✅ 명시적 null 처리

// Optional chaining
const venueName = race?.venue?.name ?? 'Unknown';

// Nullish coalescing
const displayOdds = odds ?? '-';

// Type narrowing
function getWinnerName(race: Race): string {
  if (!race.results || race.results.length === 0) {
    return 'No winner';
  }
  return race.results[0].name;  // 여기서 results[0]은 안전
}

// ❌ 피해야 할 패턴
const name = race.results![0].name;  // Non-null assertion 남용
const value = data as Race;           // 검증 없는 타입 단언
```

### 6.4 Strict Mode 활용

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```

---

## 7. React 베스트 프랙티스

### 7.1 컴포넌트 구조

```typescript
// ✅ 좋은 컴포넌트 구조

// 1. imports
import { useState, useCallback } from 'react';
import type { Race } from '@/types';
import { cn } from '@/lib/utils';

// 2. types
interface RaceCardProps {
  race: Race;
  onSelect?: (raceId: string) => void;
  className?: string;
}

// 3. component
export function RaceCard({ race, onSelect, className }: RaceCardProps) {
  // 3.1 hooks
  const [isExpanded, setIsExpanded] = useState(false);

  // 3.2 handlers
  const handleClick = useCallback(() => {
    onSelect?.(race.id);
  }, [race.id, onSelect]);

  // 3.3 derived state
  const isFinished = race.status === 'finished';

  // 3.4 render
  return (
    <article
      className={cn('race-card', className)}
      onClick={handleClick}
    >
      <h3>{race.venue} {race.raceNumber}경주</h3>
      {isFinished && <span>종료</span>}
    </article>
  );
}

// 4. sub-components (같은 파일에 작은 컴포넌트)
function RaceStatusBadge({ status }: { status: RaceStatus }) {
  // ...
}
```

### 7.2 Server vs Client Components

```typescript
// ✅ Server Component (기본값) - 데이터 페칭
// src/components/TodayRaces.tsx

import { getRaces } from '@/lib/api';

export async function TodayRaces() {
  // 서버에서 직접 데이터 페칭
  const races = await getRaces('horse', getTodayString());

  return (
    <ul>
      {races.map(race => (
        <li key={race.id}>{race.venue}</li>
      ))}
    </ul>
  );
}

// ✅ Client Component - 인터랙션 필요시만
// src/components/RaceTabs.tsx
'use client';

import { useState } from 'react';

export function RaceTabs() {
  const [activeTab, setActiveTab] = useState('horse');

  return (
    <div>
      <button onClick={() => setActiveTab('horse')}>경마</button>
      <button onClick={() => setActiveTab('cycle')}>경륜</button>
    </div>
  );
}
```

### 7.3 Props 설계

```typescript
// ✅ 좋은 Props 설계

// 필수 props만 필수로
interface ButtonProps {
  children: React.ReactNode;    // 필수
  onClick?: () => void;          // 선택
  disabled?: boolean;            // 선택 (기본값: false)
  variant?: 'primary' | 'secondary';  // 선택 (기본값 제공)
}

// 기본값은 구조 분해에서 설정
function Button({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn-${variant}`}
    >
      {children}
    </button>
  );
}

// ❌ 피해야 할 패턴
interface BadProps {
  // 너무 많은 불린 props
  isPrimary?: boolean;
  isSecondary?: boolean;
  isLarge?: boolean;
  isSmall?: boolean;
}
```

### 7.4 커스텀 훅 설계

```typescript
// ✅ 잘 설계된 커스텀 훅

interface UseOddsOptions {
  refreshInterval?: number;
  enabled?: boolean;
}

interface UseOddsReturn {
  odds: Odds | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

/**
 * 배당률 조회 훅
 */
export function useOdds(
  raceId: string,
  options: UseOddsOptions = {}
): UseOddsReturn {
  const { refreshInterval = 30000, enabled = true } = options;

  const [state, setState] = useState<{
    odds: Odds | null;
    isLoading: boolean;
    error: Error | null;
  }>({
    odds: null,
    isLoading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    // 구현...
  }, [raceId]);

  useEffect(() => {
    if (enabled) {
      refresh();
    }
  }, [enabled, refresh]);

  // 반환 타입 명확
  return {
    odds: state.odds,
    isLoading: state.isLoading,
    error: state.error,
    refresh,
  };
}
```

---

## 8. 코드 품질 체크리스트

### 8.1 PR 전 체크리스트

```markdown
## 코드 품질 체크리스트

### 네이밍
- [ ] 변수/함수명이 의도를 명확히 표현하는가?
- [ ] 약어 없이 전체 단어를 사용했는가?
- [ ] 네이밍 컨벤션을 따르는가?

### 함수
- [ ] 함수가 20줄 이하인가?
- [ ] 함수가 한 가지 일만 하는가?
- [ ] 매개변수가 4개 이하인가?
- [ ] 부작용이 최소화되었는가?

### 타입
- [ ] any 타입을 사용하지 않았는가?
- [ ] null/undefined를 명시적으로 처리했는가?
- [ ] 타입 가드를 적절히 사용했는가?

### 구조
- [ ] 중복 코드가 없는가?
- [ ] 중첩이 3단계 이하인가?
- [ ] 파일이 400줄 이하인가?

### React
- [ ] Server/Client Component를 적절히 분리했는가?
- [ ] 불필요한 리렌더링이 없는가?
- [ ] 훅 규칙을 따르는가?

### 가독성
- [ ] 주석 없이도 코드가 이해되는가?
- [ ] Early return을 활용했는가?
- [ ] 매직 넘버/문자열을 상수로 추출했는가?
```

### 8.2 자동화 도구

```json
// .eslintrc.json
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "max-lines-per-function": ["warn", { "max": 30 }],
    "max-depth": ["warn", 3],
    "complexity": ["warn", 10]
  }
}
```

---

## 📋 빠른 참조

### 코드 품질 기준

```
함수 길이:      ≤ 20줄
파일 길이:      ≤ 400줄
중첩 깊이:      ≤ 3단계
매개변수 수:    ≤ 4개
복잡도:         ≤ 10
```

### 네이밍 체크

```
변수:     camelCase, 명사
함수:     camelCase, 동사로 시작
상수:     UPPER_SNAKE_CASE
타입:     PascalCase
불린:     is/has/can 접두사
```

### 피해야 할 것

```
❌ any 타입
❌ 매직 넘버/문자열
❌ 중복 코드
❌ 깊은 중첩
❌ 긴 함수
❌ TODO 주석
❌ 주석으로 설명이 필요한 코드
```

---

*좋은 코드는 읽는 사람을 위한 코드입니다.* 📖
