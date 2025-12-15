# Quickstart: Production Hardening

**Feature Branch**: `006-production-hardening`
**Estimated Effort**: 2-3 days

## Prerequisites

```bash
# 브랜치 체크아웃
git checkout 006-production-hardening

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

## Key Files to Understand

```
src/lib/utils/date.ts          # KST 날짜 유틸 (수정 대상)
src/app/page.tsx               # 홈 페이지 (수정 대상)
src/components/TodayRaces.tsx  # 경주 목록 (수정 대상)
src/components/QuickStats.tsx  # 통계 카드 (수정 대상)
src/lib/api.ts                 # API 함수 (수정 대상)
```

## Implementation Order (TDD)

### Step 1: Date Utils (P0)

```bash
# 1. 테스트 먼저 작성
npx jest src/lib/utils/__tests__/date.test.ts --watch

# 2. normalizeRaceDate, buildRaceStartDateTime 구현
# 3. 테스트 통과 확인
```

**테스트 케이스**:
```typescript
describe('normalizeRaceDate', () => {
  it('YYYYMMDD를 YYYY-MM-DD로 변환', () => {
    expect(normalizeRaceDate('20251211')).toBe('2025-12-11');
  });

  it('이미 YYYY-MM-DD면 그대로 반환', () => {
    expect(normalizeRaceDate('2025-12-11')).toBe('2025-12-11');
  });
});

describe('buildRaceStartDateTime', () => {
  it('ISO 8601 형식 생성', () => {
    expect(buildRaceStartDateTime('2025-12-11', '13:30'))
      .toBe('2025-12-11T13:30:00+09:00');
  });
});
```

### Step 2: Race Types Config (P1 - Structure)

```bash
# 구조 변경 커밋 (behavioral 변경 전)
git add src/config/raceTypes.ts
git commit -m "chore(structure): add RACE_TYPES central config"
```

**파일 생성**: `src/config/raceTypes.ts`
```typescript
import { RaceType } from '@/types';

export const RACE_TYPES = {
  horse: { label: '경마', icon: '🐎', ... },
  cycle: { label: '경륜', icon: '🚴', ... },
  boat: { label: '경정', icon: '🚤', ... },
} as const satisfies Record<RaceType, RaceTypeConfig>;
```

### Step 3: Types Addition (P1 - Structure)

**수정**: `src/types/index.ts`
```typescript
export type RaceFetchStatus = 'OK' | 'NOT_FOUND' | 'UPSTREAM_ERROR';

export interface RaceFetchResult<T> {
  status: RaceFetchStatus;
  data: T | null;
  error?: string;
}

export interface TodayRacesData {
  horse: Race[];
  cycle: Race[];
  boat: Race[];
  status: {
    horse: RaceFetchStatus;
    cycle: RaceFetchStatus;
    boat: RaceFetchStatus;
  };
}
```

### Step 4: API Optimization (P0 - Behavior)

**수정**: `src/lib/api.ts`
```typescript
export async function fetchTodayAllRaces(rcDate: string): Promise<TodayRacesData> {
  const results = await Promise.allSettled([
    fetchHorseRaceSchedules(rcDate),
    fetchCycleRaceSchedules(rcDate),
    fetchBoatRaceSchedules(rcDate),
  ]);

  return {
    horse: results[0].status === 'fulfilled' ? results[0].value : [],
    cycle: results[1].status === 'fulfilled' ? results[1].value : [],
    boat: results[2].status === 'fulfilled' ? results[2].value : [],
    status: {
      horse: results[0].status === 'fulfilled' ? 'OK' : 'UPSTREAM_ERROR',
      cycle: results[1].status === 'fulfilled' ? 'OK' : 'UPSTREAM_ERROR',
      boat: results[2].status === 'fulfilled' ? 'OK' : 'UPSTREAM_ERROR',
    },
  };
}
```

### Step 5: Home Page Update (P0 - Behavior)

**수정**: `src/app/page.tsx`
```typescript
export default async function Home({ searchParams }) {
  const rcDate = getTodayYYYYMMDD();
  const allRaces = await fetchTodayAllRaces(rcDate);

  return (
    <>
      <PageHeader />
      <QuickStats data={allRaces} />
      <RaceTabs currentTab={currentTab} data={allRaces} />
    </>
  );
}
```

### Step 6: Component Props Update (P0 - Behavior)

**수정**: `src/components/TodayRaces.tsx`
```typescript
// Before: 내부에서 API 호출
export default async function TodayRaces({ filter }) {
  const [horseRaces, cycleRaces, boatRaces] = await Promise.all([...]);
}

// After: props로 데이터 수신
interface TodayRacesProps {
  data: TodayRacesData;
  filter?: RaceType | 'all';
}

export default function TodayRaces({ data, filter = 'all' }: TodayRacesProps) {
  // 더 이상 async 아님, 내부 fetch 없음
}
```

## Testing Commands

```bash
# 단위 테스트
npm run test

# E2E 테스트
npm run test:e2e

# 타입 체크
npx tsc --noEmit

# 린트
npm run lint

# 빌드
npm run build
```

## Verification Checklist

### Automated Tests (via `npm run test`)
- [x] normalizeRaceDate 유틸 - YYYYMMDD ↔ YYYY-MM-DD 변환
- [x] buildRaceStartDateTime 유틸 - ISO 8601 형식 생성
- [x] getFormattedKoreanDate 유틸 - KST 기준 한국어 날짜
- [x] fetchTodayAllRaces - Promise.allSettled 병렬 호출
- [x] fetchWithTimeout - 10초 타임아웃 처리
- [x] fetchRaceByIdWithStatus - RaceFetchResult 반환
- [x] ErrorBanner 컴포넌트 - 조건부 렌더링
- [x] RACE_TYPES config - 완전성 및 구조 검증

### Manual Verification (TBD)
- [ ] 홈 페이지 네트워크 탭에서 API 호출 3회 확인 (기존 6회)
- [ ] KST 자정 전후 날짜 표시 정확성 확인
- [ ] API 타임아웃(10초) 시 에러 배너 표시 확인
- [ ] race.date undefined 시 JSON-LD 정상 생성 확인
- [ ] RACE_TYPES 변경 시 모든 UI 반영 확인

## Common Issues

### 1. TypeScript 타입 에러
```bash
# 타입 정의 확인
npx tsc --noEmit
```

### 2. 테스트 실패
```bash
# 단일 테스트 디버깅
npx jest path/to/test.ts --verbose
```

### 3. 빌드 실패
```bash
# 빌드 로그 확인
npm run build 2>&1 | head -100
```

## Related Docs

- [spec.md](./spec.md) - 기능 명세
- [research.md](./research.md) - 기술 결정 배경
- [data-model.md](./data-model.md) - 데이터 모델
- [Constitution](./../.specify/memory/constitution.md) - 개발 원칙
