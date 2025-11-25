# 테스트 전략 가이드

> KRace 프로젝트의 테스트 전략, 피라미드 구조, 커버리지 목표를 정의합니다.

## 목차

1. [테스트 피라미드](#테스트-피라미드)
2. [테스트 레벨 정의](#테스트-레벨-정의)
3. [커버리지 목표](#커버리지-목표)
4. [테스트 도구](#테스트-도구)
5. [Mock 전략](#mock-전략)
6. [테스트 데이터 관리](#테스트-데이터-관리)
7. [CI/CD 통합](#cicd-통합)

---

## 테스트 피라미드

```
                    ▲
                   /E\         E2E Tests (10%)
                  /2E \        - 사용자 시나리오
                 /─────\       - 크리티컬 패스
                /       \
               / Integra-\     Integration Tests (20%)
              /   tion    \    - API 엔드포인트
             /─────────────\   - 컴포넌트 통합
            /               \
           /    Unit Tests   \  Unit Tests (70%)
          /                   \ - 비즈니스 로직
         /─────────────────────\- 유틸리티 함수
```

### 비율 근거

| 레벨 | 비율 | 실행 시간 | 유지보수 비용 |
|------|------|-----------|---------------|
| Unit | 70% | 빠름 (~1ms) | 낮음 |
| Integration | 20% | 중간 (~100ms) | 중간 |
| E2E | 10% | 느림 (~1s+) | 높음 |

---

## 테스트 레벨 정의

### 1. 단위 테스트 (Unit Tests)

**목적**: 개별 함수/모듈의 독립적인 동작 검증

**범위**:
- 유틸리티 함수
- 비즈니스 로직
- 커스텀 훅 (React)
- 상태 관리 로직

```typescript
// ✅ 좋은 단위 테스트 예시
describe('calculateOdds', () => {
  it('should return correct decimal odds from fractional', () => {
    expect(calculateOdds({ numerator: 5, denominator: 2 })).toBe(3.5);
  });

  it('should handle edge case of even odds', () => {
    expect(calculateOdds({ numerator: 1, denominator: 1 })).toBe(2.0);
  });

  it('should throw for invalid input', () => {
    expect(() => calculateOdds({ numerator: -1, denominator: 2 }))
      .toThrow('Invalid odds: numerator must be positive');
  });
});
```

**파일 위치**: `__tests__/unit/` 또는 소스 파일 옆 `*.test.ts`

### 2. 통합 테스트 (Integration Tests)

**목적**: 여러 모듈이 함께 동작하는지 검증

**범위**:
- API 라우트 핸들러
- 데이터베이스 연동 (필요시)
- 외부 API 연동
- React 컴포넌트 + 훅 통합

```typescript
// ✅ API 라우트 통합 테스트
describe('GET /api/races/today', () => {
  beforeEach(() => {
    // Mock 외부 API 응답
    mockKspoApi.getRaces.mockResolvedValue(mockRaceData);
  });

  it('should return today races with proper structure', async () => {
    const response = await fetch('/api/races/today');
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      success: true,
      data: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          raceName: expect.any(String),
          startTime: expect.any(String),
        }),
      ]),
    });
  });

  it('should handle upstream API failure gracefully', async () => {
    mockKspoApi.getRaces.mockRejectedValue(new Error('API down'));

    const response = await fetch('/api/races/today');
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toBe('External service unavailable');
  });
});
```

```tsx
// ✅ 컴포넌트 통합 테스트
describe('RaceCard with data fetching', () => {
  it('should display race info after loading', async () => {
    render(<RaceCard raceId="race-123" />);

    // 로딩 상태 확인
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();

    // 데이터 로드 후
    await waitFor(() => {
      expect(screen.getByText('제1경주')).toBeInTheDocument();
      expect(screen.getByText('14:30 출발')).toBeInTheDocument();
    });
  });
});
```

**파일 위치**: `__tests__/integration/`

### 3. E2E 테스트 (End-to-End Tests)

**목적**: 실제 사용자 시나리오 전체 흐름 검증

**범위**:
- 크리티컬 사용자 경로
- 페이지 네비게이션
- 폼 제출 흐름
- 인증 플로우

```typescript
// ✅ Playwright E2E 테스트
import { test, expect } from '@playwright/test';

test.describe('Race Information Flow', () => {
  test('user can view today races and navigate to details', async ({ page }) => {
    // 1. 메인 페이지 접근
    await page.goto('/');
    await expect(page).toHaveTitle(/KRace/);

    // 2. 오늘의 경주 섹션 확인
    const todaySection = page.getByTestId('today-races');
    await expect(todaySection).toBeVisible();

    // 3. 첫 번째 경주 카드 클릭
    const firstRace = todaySection.getByRole('article').first();
    await firstRace.click();

    // 4. 상세 페이지로 이동 확인
    await expect(page).toHaveURL(/\/races\/\d+/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('경주');

    // 5. 출전마 정보 표시 확인
    const horseList = page.getByTestId('horse-list');
    await expect(horseList.getByRole('listitem')).toHaveCount.greaterThan(0);
  });

  test('user can filter races by type', async ({ page }) => {
    await page.goto('/races');

    // 경륜 필터 선택
    await page.getByRole('button', { name: '경륜' }).click();

    // URL 파라미터 확인
    await expect(page).toHaveURL(/type=cycling/);

    // 결과 확인
    const races = page.getByTestId('race-card');
    for (const race of await races.all()) {
      await expect(race).toContainText('경륜');
    }
  });
});
```

**파일 위치**: `e2e/` 또는 `tests/e2e/`

---

## 커버리지 목표

### 전체 목표

| 메트릭 | 최소 | 목표 | 이상적 |
|--------|------|------|--------|
| Line Coverage | 70% | 80% | 90%+ |
| Branch Coverage | 65% | 75% | 85%+ |
| Function Coverage | 80% | 90% | 95%+ |
| Statement Coverage | 70% | 80% | 90%+ |

### 모듈별 목표

```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // 크리티컬 모듈은 더 높은 커버리지 요구
    './src/lib/api/**/*.ts': {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './src/utils/**/*.ts': {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    // UI 컴포넌트는 상대적으로 낮은 커버리지 허용
    './src/components/**/*.tsx': {
      branches: 60,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
```

### 커버리지 제외 대상

```javascript
// jest.config.js
module.exports = {
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/',
    '/e2e/',
    '\\.d\\.ts$',
    '\\.stories\\.tsx$',
    '/types/',
    'index\\.ts$', // barrel exports
  ],
};
```

---

## 테스트 도구

### 테스트 프레임워크

| 도구 | 용도 | 버전 |
|------|------|------|
| Jest | Unit/Integration 테스트 러너 | 30.x |
| @testing-library/react | React 컴포넌트 테스트 | 16.x |
| Playwright | E2E 테스트 | 1.56.x |
| MSW | API 모킹 | 2.x |

### 설정 파일 구조

```
racelab/
├── jest.config.js           # Jest 설정
├── jest.setup.ts            # 전역 설정
├── playwright.config.ts     # Playwright 설정
├── __tests__/
│   ├── unit/               # 단위 테스트
│   ├── integration/        # 통합 테스트
│   └── __mocks__/          # 공통 모의 객체
└── e2e/                    # E2E 테스트
    └── fixtures/           # 테스트 픽스처
```

### Jest 설정 예시

```javascript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '**/__tests__/**/*.(test|spec).(ts|tsx)',
    '**/*.(test|spec).(ts|tsx)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
  ],
};

module.exports = createJestConfig(customJestConfig);
```

### Playwright 설정 예시

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Mock 전략

### 모킹 레이어

```
┌─────────────────────────────────────────────┐
│                 테스트 코드                   │
├─────────────────────────────────────────────┤
│              MSW (API Mocking)              │  ← Network Level
├─────────────────────────────────────────────┤
│           Jest Mocks (Module)               │  ← Module Level
├─────────────────────────────────────────────┤
│              Test Fixtures                   │  ← Data Level
└─────────────────────────────────────────────┘
```

### 1. MSW (Mock Service Worker)

네트워크 레벨에서 API 요청을 가로채서 모킹합니다.

```typescript
// __tests__/__mocks__/handlers.ts
import { http, HttpResponse } from 'msw';
import { mockRaces, mockHorses } from './fixtures';

export const handlers = [
  // 오늘 경주 목록
  http.get('/api/races/today', () => {
    return HttpResponse.json({
      success: true,
      data: mockRaces,
    });
  }),

  // 경주 상세 정보
  http.get('/api/races/:id', ({ params }) => {
    const race = mockRaces.find((r) => r.id === params.id);
    if (!race) {
      return HttpResponse.json(
        { success: false, error: 'Race not found' },
        { status: 404 }
      );
    }
    return HttpResponse.json({ success: true, data: race });
  }),

  // 외부 KSPO API 모킹
  http.get('https://api.kspo.or.kr/*', () => {
    return HttpResponse.json(mockKspoResponse);
  }),
];
```

```typescript
// jest.setup.ts
import { setupServer } from 'msw/node';
import { handlers } from './__tests__/__mocks__/handlers';

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 2. Jest Module Mocks

```typescript
// __tests__/__mocks__/next/navigation.ts
export const useRouter = jest.fn(() => ({
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn(),
}));

export const usePathname = jest.fn(() => '/');
export const useSearchParams = jest.fn(() => new URLSearchParams());
```

```typescript
// 테스트에서 사용
jest.mock('next/navigation');

describe('Navigation', () => {
  it('should navigate on click', () => {
    const { push } = useRouter();
    render(<NavigateButton />);

    fireEvent.click(screen.getByRole('button'));

    expect(push).toHaveBeenCalledWith('/races');
  });
});
```

### 3. 테스트 픽스처

```typescript
// __tests__/__mocks__/fixtures/races.ts
import type { Race, Horse } from '@/types';

export const createMockRace = (overrides?: Partial<Race>): Race => ({
  id: 'race-001',
  raceName: '제1경주',
  raceNumber: 1,
  raceType: 'horse',
  venue: 'seoul',
  startTime: '2024-01-15T14:30:00+09:00',
  status: 'scheduled',
  distance: 1200,
  horses: [],
  ...overrides,
});

export const createMockHorse = (overrides?: Partial<Horse>): Horse => ({
  id: 'horse-001',
  name: '번개',
  number: 1,
  jockey: '김철수',
  trainer: '박영희',
  weight: 55,
  odds: 3.5,
  ...overrides,
});

// 시나리오별 픽스처
export const mockRaces: Race[] = [
  createMockRace({ id: 'race-001', raceName: '제1경주' }),
  createMockRace({ id: 'race-002', raceName: '제2경주', raceNumber: 2 }),
  createMockRace({ id: 'race-003', raceName: '제3경주', raceNumber: 3, status: 'running' }),
];
```

---

## 테스트 데이터 관리

### 데이터 생성 패턴

```typescript
// Factory Pattern
class RaceFactory {
  private static counter = 0;

  static create(overrides?: Partial<Race>): Race {
    RaceFactory.counter++;
    return {
      id: `race-${RaceFactory.counter.toString().padStart(3, '0')}`,
      raceName: `제${RaceFactory.counter}경주`,
      raceNumber: RaceFactory.counter,
      raceType: 'horse',
      venue: 'seoul',
      startTime: new Date().toISOString(),
      status: 'scheduled',
      distance: 1200,
      horses: [],
      ...overrides,
    };
  }

  static createMany(count: number, overrides?: Partial<Race>): Race[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  static reset(): void {
    RaceFactory.counter = 0;
  }
}

// 사용 예시
describe('Race list', () => {
  beforeEach(() => RaceFactory.reset());

  it('should display all races', () => {
    const races = RaceFactory.createMany(5);
    render(<RaceList races={races} />);

    expect(screen.getAllByRole('article')).toHaveLength(5);
  });
});
```

### 스냅샷 데이터

```typescript
// __tests__/fixtures/snapshots/kspo-response.json
{
  "resultCode": "0",
  "resultMessage": "성공",
  "data": {
    "races": [
      {
        "rcNo": "1",
        "rcName": "제1경주",
        "stTime": "1430"
      }
    ]
  }
}
```

```typescript
// 테스트에서 사용
import kspoResponse from './fixtures/snapshots/kspo-response.json';

it('should parse KSPO response correctly', () => {
  const result = parseKspoRaces(kspoResponse);
  expect(result).toMatchSnapshot();
});
```

---

## CI/CD 통합

### 테스트 실행 단계

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run test:unit -- --coverage

      - uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          flags: unit

  integration-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run test:integration

  e2e-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

### npm 스크립트

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern='__tests__/unit'",
    "test:integration": "jest --testPathPattern='__tests__/integration'",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

### 커버리지 게이트

```yaml
# PR 머지 조건
- name: Check coverage threshold
  run: |
    COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
    if (( $(echo "$COVERAGE < 80" | bc -l) )); then
      echo "Coverage $COVERAGE% is below threshold 80%"
      exit 1
    fi
```

---

## 테스트 명명 규칙

### 파일 명명

```
# 단위 테스트
src/utils/odds.ts           → src/utils/odds.test.ts
src/lib/api/races.ts        → __tests__/unit/lib/api/races.test.ts

# 통합 테스트
app/api/races/route.ts      → __tests__/integration/api/races.test.ts

# E2E 테스트
기능명.spec.ts              → e2e/race-viewing.spec.ts
```

### 테스트 케이스 명명

```typescript
// describe: 테스트 대상 (명사)
describe('RaceCard', () => {
  // describe: 메서드/상태 (동사/상태)
  describe('when race is scheduled', () => {
    // it: 기대 동작 (should + 동사)
    it('should display countdown timer', () => {});
    it('should show "예정" badge', () => {});
  });

  describe('when race is running', () => {
    it('should display live indicator', () => {});
    it('should show "진행중" badge', () => {});
  });
});

// 또는 Given-When-Then 스타일
describe('calculateWinnings', () => {
  it('given valid bet and odds, when race is won, then returns correct winnings', () => {});
});
```

---

## 체크리스트

### PR 제출 전 테스트 체크리스트

- [ ] 모든 단위 테스트 통과
- [ ] 새 기능에 대한 테스트 추가
- [ ] 커버리지 임계값 충족 (80%+)
- [ ] 통합 테스트 통과
- [ ] E2E 크리티컬 패스 통과
- [ ] 스냅샷 테스트 업데이트 (필요시)
- [ ] 테스트 실행 시간 적절 (Unit: <30s, Integration: <2m, E2E: <5m)

### 새 기능 테스트 체크리스트

- [ ] Happy path 테스트
- [ ] Edge case 테스트
- [ ] Error case 테스트
- [ ] 경계값 테스트
- [ ] null/undefined 처리 테스트

---

## 참고 자료

- [Jest 공식 문서](https://jestjs.io/)
- [Testing Library 가이드](https://testing-library.com/docs/)
- [Playwright 공식 문서](https://playwright.dev/)
- [MSW 공식 문서](https://mswjs.io/)
- [테스트 피라미드](https://martinfowler.com/articles/practical-test-pyramid.html)
