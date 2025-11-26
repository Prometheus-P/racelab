# KRace 테스트 가이드 v1.0

> **Project:** KRace - 경마/경륜/경정 통합 정보 플랫폼
> **Last Updated:** 2025-11-26

---

## 기술 스택

```yaml
tech_stack:
  frontend:
    framework: "Next.js 14"
    language: "TypeScript"
    test_runner: "Jest"
    component_test: "React Testing Library"
    e2e: "Playwright"

  backend:
    type: "Next.js API Routes"
    language: "TypeScript"
    test_runner: "Jest (jest.config.api.js)"

  external_apis:
    - name: "KRA API"
      description: "Korea Horse Racing Association"
      env_key: "KRA_API_KEY"
    - name: "KSPO API"
      description: "National Sports Promotion Foundation (cycle & boat)"
      env_key: "KSPO_API_KEY"

  ci_cd: "GitHub Actions"

  coverage:
    unit: 80
    integration: 60
    critical_paths: 100
```

---

## 테스트 전략

```
┌─────────────────────────────────────────────────────────────┐
│  Test Pyramid for KRace                                     │
│                                                             │
│         ╱╲ E2E (Playwright) - 10%                          │
│        ╱──╲ home.spec.ts, race-detail.spec.ts, api.spec.ts │
│       ╱Int.╲ Integration - 20%                             │
│      ╱──────╲ API Routes + MSW Mocking                     │
│     ╱  Unit  ╲ Unit - 70%                                  │
│    ╱──────────╲ Components, lib/api.ts, mappers.ts         │
└─────────────────────────────────────────────────────────────┘
```

---

## 명령어

```bash
# 전체 테스트
npm run test                    # Jest (UI + API)
npm run test:e2e                # Playwright E2E

# 단일 파일 테스트
npx jest src/components/Header.test.tsx
npx jest --testNamePattern="should render"
npx playwright test e2e/tests/home.spec.ts
npx playwright test -g "should load homepage"

# E2E 디버깅
npm run test:e2e:ui             # Interactive UI
npm run test:e2e:debug          # Debug mode
npm run test:e2e:report         # View report
```

---

## 테스트 구조

```
src/
├── components/
│   ├── Header.tsx
│   ├── Header.test.tsx             # UI Unit Test
│   ├── Footer.tsx
│   ├── Footer.test.tsx
│   ├── TodayRaces.tsx
│   ├── TodayRaces.test.tsx
│   ├── QuickStats.tsx
│   └── QuickStats.test.tsx
├── lib/
│   ├── api.ts
│   ├── api.test.ts                 # API Client Unit Test
│   ├── api-helpers/
│   │   ├── mappers.ts
│   │   ├── mappers.test.ts         # Mapper Unit Test
│   │   └── dummy.ts
│   └── utils/
│       ├── apiResponse.ts
│       ├── date.ts
│       └── ui.ts
├── app/
│   ├── page.tsx
│   ├── page.test.tsx               # Page Unit Test
│   ├── layout.tsx
│   ├── layout.test.tsx
│   ├── robots.ts
│   ├── robots.test.ts
│   ├── sitemap.ts
│   ├── sitemap.test.ts
│   ├── race/[id]/
│   │   ├── page.tsx
│   │   └── page.test.tsx           # Race Detail Page Test
│   └── api/races/
│       ├── horse/route.test.ts     # API Route Integration Test
│       ├── cycle/route.test.ts
│       ├── boat/route.test.ts
│       └── [type]/[id]/
│           ├── entries/route.test.ts
│           ├── odds/route.test.ts
│           └── results/route.test.ts
└── tests/
    └── example.test.ts

e2e/
├── pages/                          # Page Objects
│   ├── base.page.ts
│   ├── home.page.ts
│   └── race-detail.page.ts
└── tests/
    ├── home.spec.ts
    ├── race-detail.spec.ts
    └── api.spec.ts
```

---

## Unit Test 패턴

### 명명 규칙

```
test_should_[동작]_when_[조건]

# 예시
it('should_render_navigation_links')
it('should_display_error_when_api_fails')
it('should_call_api_with_correct_date')
```

### Component Test Template

```typescript
// src/components/{Component}.test.tsx
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Component } from './{Component}';

// Mock dependencies
jest.mock('@/lib/api', () => ({
  fetchHorseRaceSchedules: jest.fn(),
}));

describe('{Component}', () => {
  beforeEach(() => jest.clearAllMocks());

  // Rendering
  it('should_render_main_elements', () => {
    render(<Component />);
    expect(screen.getByRole('...')).toBeInTheDocument();
  });

  // Interaction
  it('should_handle_click_event', async () => {
    const user = userEvent.setup();
    render(<Component onClick={mockFn} />);
    await user.click(screen.getByRole('button'));
    expect(mockFn).toHaveBeenCalled();
  });

  // Edge Cases
  describe('Edge Cases', () => {
    it('should_render_empty_state_when_no_data', () => {
      render(<Component data={[]} />);
      expect(screen.getByText(/없습니다/)).toBeInTheDocument();
    });
  });
});
```

### API Client Test Template

```typescript
// src/lib/api.test.ts
import { fetchHorseRaceSchedules } from './api';

// Mock fetch
global.fetch = jest.fn();

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.KRA_API_KEY = 'test-key';
  });

  it('should_return_races_when_api_succeeds', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        response: { body: { items: { item: [/* mock data */] } } }
      })
    });

    const result = await fetchHorseRaceSchedules('20240101');
    expect(result).toHaveLength(1);
  });

  it('should_return_dummy_data_when_no_api_key', async () => {
    delete process.env.KRA_API_KEY;
    const result = await fetchHorseRaceSchedules('20240101');
    expect(result.length).toBeGreaterThan(0);
  });

  it('should_throw_error_when_api_fails', async () => {
    (fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500 });
    await expect(fetchHorseRaceSchedules('20240101')).rejects.toThrow();
  });
});
```

---

## Integration Test 패턴

### API Route Test Template

```typescript
// src/app/api/races/{type}/route.test.ts
import { GET } from './route';
import { NextRequest } from 'next/server';
import { fetchHorseRaceSchedules } from '@/lib/api';

jest.mock('@/lib/api');

describe('GET /api/races/{type}', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should_return_200_with_races', async () => {
    (fetchHorseRaceSchedules as jest.Mock).mockResolvedValue([
      { id: 'horse-1', type: 'horse', track: '서울' }
    ]);

    const request = new NextRequest('http://localhost/api/races/horse');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(1);
  });

  it('should_return_500_when_api_fails', async () => {
    (fetchHorseRaceSchedules as jest.Mock).mockRejectedValue(new Error('API Error'));

    const request = new NextRequest('http://localhost/api/races/horse');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INTERNAL_ERROR');
  });
});
```

---

## E2E Test 패턴

### Page Object Pattern

```typescript
// e2e/pages/{page}.page.ts
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class {Page}Page extends BasePage {
  readonly element: Locator;

  constructor(page: Page) {
    super(page);
    this.element = page.locator('[data-testid="..."]');
  }

  async goto() {
    await super.goto('/path');
    await this.waitForPageLoad();
  }

  async performAction() {
    await this.element.click();
  }
}
```

### E2E Test Template

```typescript
// e2e/tests/{feature}.spec.ts
import { test, expect } from '@playwright/test';
import { {Page}Page } from '../pages/{page}.page';

test.describe('{Feature}', () => {
  let page: {Page}Page;

  test.beforeEach(async ({ page: p }) => {
    page = new {Page}Page(p);
    await page.goto();
  });

  test('should_load_successfully', async () => {
    await expect(page.element).toBeVisible();
  });

  test('should_navigate_to_detail', async ({ page: p }) => {
    await page.clickElement();
    expect(p.url()).toContain('/detail');
  });
});

// Security Tests
test.describe('Security', () => {
  test('should_handle_invalid_input', async ({ page }) => {
    await page.goto('/race/invalid-id');
    await expect(page.locator('text=찾을 수 없습니다')).toBeVisible();
  });
});
```

---

## Race Type 테스트 데이터

```typescript
// Test data matching KRace types
const mockHorseRace: Race = {
  id: 'horse-1-1-20240101',
  type: 'horse',
  raceNo: 1,
  track: '서울',           // 서울, 부산경남, 제주
  startTime: '11:30',
  distance: 1200,
  status: 'upcoming',
  entries: []
};

const mockCycleRace: Race = {
  id: 'cycle-1-1-20240101',
  type: 'cycle',
  raceNo: 1,
  track: '광명',           // 광명
  startTime: '11:00',
  distance: 1000,
  status: 'upcoming',
  entries: []
};

const mockBoatRace: Race = {
  id: 'boat-1-1-20240101',
  type: 'boat',
  raceNo: 1,
  track: '미사리',         // 미사리
  startTime: '10:30',
  status: 'upcoming',
  entries: []
};
```

---

## 커버리지 목표

| 영역 | Line | 필수 테스트 |
|------|------|-------------|
| `src/lib/api.ts` | 90%+ | API 호출, 에러 처리, 더미 데이터 폴백 |
| `src/lib/api-helpers/mappers.ts` | 95%+ | 모든 매핑 함수, 엣지 케이스 |
| `src/components/*` | 80%+ | 렌더링, 인터랙션, 빈 상태 |
| `src/app/api/*` | 80%+ | 성공/실패 응답, 파라미터 검증 |
| E2E Critical Paths | 100% | 홈 → 경주 상세 → 정보 표시 |

---

## AI 코드 검증 체크리스트

```
□ 모든 import 경로 확인 (@/lib/api, @/types 등)
□ API 응답 구조 검증 (response.body.items.item)
□ Race type 색상 적용 확인 (horse: green, cycle: red, boat: blue)
□ 한글 텍스트 처리 (경마, 경륜, 경정)
□ 날짜 포맷 검증 (YYYYMMDD)
□ 엣지 케이스: 빈 배열, null entries, 잘못된 race ID
□ 에러 처리: API 실패, 네트워크 오류
```

---

## TDD 커밋 규칙 (CLAUDE.md 참조)

```bash
# 구조 변경 (rename, move, reorganize)
git commit -m "chore(structure): ..."

# 동작 변경 (feature, fix)
git commit -m "feat(behavior): ..."
git commit -m "fix(behavior): ..."

# 테스트 추가
git commit -m "test: Add unit tests for {component}"
```
