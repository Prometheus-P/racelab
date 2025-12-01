---
title: KRace TDD 개발 계획
version: 1.0.0
status: Active
owner: "@Prometheus-P"
created: 2025-11-25
updated: 2025-11-25
reviewers: []
language: Korean (한국어)
---

# plan.md - TDD 개발 계획

> **이 문서는 TDD 사이클을 추적하고 관리하는 실시간 개발 계획서입니다.**
> `go` 명령 실행 시 이 문서를 기반으로 다음 작업을 결정합니다.

---

## 변경 이력 (Changelog)

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2025-11-25 | @Prometheus-P | 최초 작성 |
| 1.1.0 | 2025-11-27 | AI | OddsDisplay, ResultsTable 컴포넌트 추가, 리팩토링 |
| 1.2.0 | 2025-11-27 | AI | UI 컴포넌트 통합 완료, E2E 테스트 추가 |
| 1.2.3 | 2025-12-01 | AI | API-007, API-008, E2E-004, TEST-001 완료 상태 반영 |
| 1.2.4 | 2025-12-01 | AI | TEST-002~004, PERF-001 완료, ISR 캐싱 적용 |
| 1.2.5 | 2025-12-01 | AI | E2E 테스트 안정화, 295개 테스트 통과 |

## 관련 문서 (Related Documents)

- [CONTEXT.md](./CONTEXT.md) - 프로젝트 컨텍스트
- [docs/TDD_RULES.md](./docs/TDD_RULES.md) - TDD 규칙
- [docs/technical/TECHNICAL_DESIGN.md](./docs/technical/TECHNICAL_DESIGN.md) - 기술 설계

---

## 📊 현재 상태 요약

```
┌─────────────────────────────────────────────────────────────┐
│  📈 프로젝트 진행률                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  MVP 기능    [████████████████████████] 98%                │
│  테스트 커버  [██████████████████████░░] 90%                │
│  문서화      [██████████████████░░░░░░] 80%                │
│                                                             │
└─────────────────────────────────────────────────────────────┘

마지막 업데이트: 2025-12-01
현재 Phase: MVP
현재 버전: v1.2.4
다음 마일스톤: 이미지 최적화 및 번들 사이즈 분석
```

---

## 🎯 현재 스프린트

### Sprint: MVP 완성

**기간**: 2025-11-25 ~
**목표**: MVP 핵심 기능 완성 및 테스트 커버리지 80% 달성

---

## 📋 태스크 목록

### Legend

| 상태 | 아이콘 | 설명 |
|------|--------|------|
| 대기 | ⏳ | 아직 시작하지 않음 |
| 진행중 | 🔄 | 현재 작업 중 |
| RED | 🔴 | 실패하는 테스트 작성 완료 |
| GREEN | 🟢 | 테스트 통과 코드 작성 완료 |
| REFACTOR | 🔵 | 리팩토링 진행 중 |
| 완료 | ✅ | 사이클 완료 |
| 차단됨 | 🚫 | 의존성으로 인해 차단 |

---

## 🏗️ Epic 1: 핵심 인프라

### 1.1 프로젝트 문서화 ✅

| ID | 태스크 | 상태 | TDD Phase | 담당 |
|----|--------|------|-----------|------|
| DOC-001 | CONTEXT.md 생성 | ✅ 완료 | N/A | AI |
| DOC-002 | README.md 개선 | ✅ 완료 | N/A | AI |
| DOC-003 | ENVIRONMENT.md 생성 | ✅ 완료 | N/A | AI |
| DOC-004 | plan.md 생성 | ✅ 완료 | N/A | AI |

### 1.2 Public 에셋 생성 ✅

| ID | 태스크 | 상태 | TDD Phase | 담당 |
|----|--------|------|-----------|------|
| ASSET-001 | /public 디렉토리 생성 | ✅ 완료 | N/A | AI |
| ASSET-002 | favicon.svg 추가 | ✅ 완료 | N/A | AI |
| ASSET-003 | opengraph-image.svg 추가 | ✅ 완료 | N/A | AI |
| ASSET-004 | icon.svg 추가 | ✅ 완료 | N/A | AI |

---

## 🏇 Epic 2: 경주 데이터 API

### 2.1 경주 목록 API ✅

| ID | 태스크 | 상태 | TDD Phase | 파일 |
|----|--------|------|-----------|------|
| API-001 | 경마 목록 API | ✅ 완료 | GREEN | `src/app/api/races/horse/route.ts` |
| API-002 | 경륜 목록 API | ✅ 완료 | GREEN | `src/app/api/races/cycle/route.ts` |
| API-003 | 경정 목록 API | ✅ 완료 | GREEN | `src/app/api/races/boat/route.ts` |

### 2.2 출주표 API ✅

| ID | 태스크 | 상태 | TDD Phase | 파일 |
|----|--------|------|-----------|------|
| API-004 | 출주표 엔드포인트 | ✅ 완료 | GREEN | `src/app/api/races/[type]/[id]/entries/route.ts` |
| API-005 | 출주 데이터 매퍼 | ✅ 완료 | GREEN | `src/lib/api-helpers/mappers.ts` |

### 2.3 배당률 API ✅

| ID | 태스크 | 상태 | TDD Phase | 파일 |
|----|--------|------|-----------|------|
| API-006 | 배당률 엔드포인트 | ✅ 완료 | GREEN | `src/app/api/races/[type]/[id]/odds/route.ts` |
| API-007 | 배당률 데이터 매퍼 | ✅ 완료 | GREEN | `src/lib/api-helpers/mappers.ts` |
| API-008 | 배당률 타입 정의 | ✅ 완료 | GREEN | `src/types/index.ts` |

**다음 TDD 사이클 (API-007):**

```typescript
// 🔴 RED: 작성할 테스트
// src/lib/api-helpers/mappers.test.ts

describe('mapOddsResponse', () => {
  it('should map KSPO odds response to Odds type', () => {
    const kspoResponse = {
      oddsDansng: '2.5',    // 단승 배당
      oddsBoksng: '1.8',    // 복승 배당
      oddsSsangsng: '5.2',  // 쌍승 배당
    };

    const result = mapOddsResponse(kspoResponse);

    expect(result).toEqual({
      win: 2.5,
      place: 1.8,
      quinella: 5.2,
    });
  });

  it('should handle null odds values', () => {
    const kspoResponse = {
      oddsDansng: null,
      oddsBoksng: '1.8',
      oddsSsangsng: null,
    };

    const result = mapOddsResponse(kspoResponse);

    expect(result).toEqual({
      win: null,
      place: 1.8,
      quinella: null,
    });
  });
});
```

### 2.4 결과 API ⏳

| ID | 태스크 | 상태 | TDD Phase | 파일 |
|----|--------|------|-----------|------|
| API-009 | 결과 엔드포인트 | ⏳ 대기 | - | `src/app/api/races/[type]/[id]/results/route.ts` |
| API-010 | 결과 데이터 매퍼 | ⏳ 대기 | - | `src/lib/api-helpers/mappers.ts` |
| API-011 | 결과 타입 정의 | ⏳ 대기 | - | `src/types/index.ts` |

---

## 🖥️ Epic 3: UI 컴포넌트

### 3.1 공통 컴포넌트 ✅

| ID | 태스크 | 상태 | TDD Phase | 파일 |
|----|--------|------|-----------|------|
| UI-001 | Header 컴포넌트 | ✅ 완료 | GREEN | `src/components/Header.tsx` |
| UI-002 | Footer 컴포넌트 | ✅ 완료 | GREEN | `src/components/Footer.tsx` |
| UI-003 | TodayRaces 컴포넌트 | ✅ 완료 | GREEN | `src/components/TodayRaces.tsx` |
| UI-004 | QuickStats 컴포넌트 | ✅ 완료 | GREEN | `src/components/QuickStats.tsx` |

### 3.2 경주 상세 컴포넌트 ✅

| ID | 태스크 | 상태 | TDD Phase | 파일 |
|----|--------|------|-----------|------|
| UI-005 | RaceDetail 페이지 | ✅ 완료 | GREEN | `src/app/race/[id]/page.tsx` |
| UI-006 | EntryList 컴포넌트 | ✅ 완료 | GREEN | `src/components/EntryList.tsx` |
| UI-007 | OddsDisplay 컴포넌트 | ✅ 완료 | GREEN | `src/components/OddsDisplay.tsx` |
| UI-008 | ResultsTable 컴포넌트 | ✅ 완료 | GREEN | `src/components/ResultsTable.tsx` |
| UI-009 | Skeletons 컴포넌트 | ✅ 완료 | GREEN | `src/components/Skeletons.tsx` |

### 3.3 UI 컴포넌트 통합 ✅

| ID | 태스크 | 상태 | TDD Phase | 파일 |
|----|--------|------|-----------|------|
| UI-010 | OddsDisplay를 RaceDetail에 통합 | ✅ 완료 | GREEN | `src/app/race/[id]/page.tsx` |
| UI-011 | ResultsTable을 RaceDetail에 통합 | ✅ 완료 | GREEN | `src/app/race/[id]/page.tsx` |

---

## 🧪 Epic 4: 테스트 강화

### 4.1 유틸리티 테스트 ✅

| ID | 태스크 | 상태 | TDD Phase | 파일 |
|----|--------|------|-----------|------|
| TEST-001 | date.ts 유틸 테스트 | ✅ 완료 | GREEN | `src/lib/utils/date.test.ts` |
| TEST-002 | ui.ts 유틸 테스트 | ✅ 완료 | GREEN | `src/lib/utils/ui.test.ts` |
| TEST-003 | apiResponse.ts 테스트 | ✅ 완료 | GREEN | `src/lib/utils/apiResponse.test.ts` |

**다음 TDD 사이클 (TEST-001):**

```typescript
// 🔴 RED: 작성할 테스트
// src/lib/utils/date.test.ts

import { formatDate, isToday, getKoreanDate } from './date';

describe('date utilities', () => {
  describe('formatDate', () => {
    it('should format date to YYYY-MM-DD', () => {
      const date = new Date('2025-11-25T12:00:00');
      expect(formatDate(date)).toBe('2025-11-25');
    });
  });

  describe('isToday', () => {
    it('should return true for today', () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });
  });

  describe('getKoreanDate', () => {
    it('should return date in Korean timezone', () => {
      const result = getKoreanDate();
      expect(result).toBeInstanceOf(Date);
    });
  });
});
```

### 4.2 API 매퍼 테스트 🔄

| ID | 태스크 | 상태 | TDD Phase | 파일 |
|----|--------|------|-----------|------|
| TEST-004 | KSPO 매퍼 테스트 | ✅ 완료 | GREEN | `src/lib/api-helpers/mappers.test.ts` |
| TEST-005 | 더미 데이터 테스트 | ⏳ 대기 | - | `src/lib/api-helpers/dummy.test.ts` |

### 4.3 E2E 테스트 확장 🔄

| ID | 태스크 | 상태 | TDD Phase | 파일 |
|----|--------|------|-----------|------|
| E2E-001 | 경주 상세 E2E 테스트 | ✅ 완료 | GREEN | `e2e/tests/race-detail.spec.ts` |
| E2E-002 | 배당률 표시 E2E 테스트 | ✅ 완료 | GREEN | `e2e/tests/race-detail.spec.ts` |
| E2E-003 | 결과 표시 E2E 테스트 | ✅ 완료 | GREEN | `e2e/tests/race-detail.spec.ts` |
| E2E-004 | 탭 전환 E2E 테스트 | ✅ 완료 | GREEN | `e2e/tests/home.spec.ts` |

---

## 📈 Epic 5: 성능 및 SEO

### 5.1 SEO 최적화 ✅

| ID | 태스크 | 상태 | TDD Phase | 파일 |
|----|--------|------|-----------|------|
| SEO-001 | sitemap.ts 구현 | ✅ 완료 | N/A | `src/app/sitemap.ts` |
| SEO-002 | robots.ts 구현 | ✅ 완료 | N/A | `src/app/robots.ts` |
| SEO-003 | 메타 태그 설정 | ✅ 완료 | N/A | `src/app/layout.tsx` |

### 5.2 성능 최적화 🔄

| ID | 태스크 | 상태 | TDD Phase | 파일 |
|----|--------|------|-----------|------|
| PERF-001 | ISR 캐싱 전략 구현 | ✅ 완료 | N/A | API routes (30-60s revalidation) |
| PERF-002 | 이미지 최적화 | ⏳ 대기 | N/A | - |
| PERF-003 | 번들 사이즈 분석 | ⏳ 대기 | N/A | - |

---

## 📅 다음 작업 큐

**우선순위 순서:**

```
┌─────────────────────────────────────────────────────────────┐
│  🎯 다음 작업 (go 명령 시 실행)                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. [TEST-005] 더미 데이터 테스트                           │
│     - dummy.ts 헬퍼 함수 테스트                             │
│                                                             │
│  2. [PERF-002] 이미지 최적화                                │
│     - Next.js Image 컴포넌트 적용                           │
│                                                             │
│  3. [PERF-003] 번들 사이즈 분석                             │
│     - @next/bundle-analyzer 설정                            │
│                                                             │
│  4. [E2E-005] 성능 E2E 테스트                               │
│     - Lighthouse CI 통합                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 실행 명령어

### TDD 사이클 실행

```bash
# AI 에이전트에게 다음 TDD 사이클 실행 요청
> go

# 특정 태스크 실행
> go API-007

# 특정 Epic 전체 실행
> go Epic-2
```

### 태스크 상태 업데이트

```bash
# 태스크 상태 변경
> update plan.md status API-007 GREEN

# 새 태스크 추가
> update plan.md add "새로운 태스크" Epic-3
```

---

## 📊 테스트 커버리지 현황

```
┌─────────────────────────────────────────────────────────────┐
│  📊 커버리지 리포트 (npm test -- --coverage)                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  파일                         | 라인 | 함수 | 브랜치        │
│  ─────────────────────────────┼──────┼──────┼───────        │
│  src/app/api/races/**         | 85%  | 90%  | 75%          │
│  src/components/**            | 75%  | 80%  | 70%          │
│  src/lib/api-helpers/**       | 60%  | 65%  | 55%          │
│  src/lib/utils/**             | 40%  | 45%  | 35%          │
│  ─────────────────────────────┼──────┼──────┼───────        │
│  전체                         | 70%  | 75%  | 65%          │
│                                                             │
│  목표: 80% | 현재: 70% | 갭: 10%                            │
│  테스트 수: 222 Jest + 295 E2E (22 suites)                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 완료된 TDD 사이클 이력

### 최근 완료된 사이클

| 날짜 | ID | 태스크 | 결과 |
|------|-----|--------|------|
| 2025-12-01 | E2E-FIX | E2E 테스트 안정화 (295개 통과) | ✅ 성공 |
| 2025-12-01 | PERF-001 | ISR 캐싱 적용 | ✅ 성공 |
| 2025-12-01 | TEST-002~004 | 유틸 함수 테스트 추가 | ✅ 성공 |
| 2025-11-27 | UI-010 | OddsDisplay 통합 | ✅ 성공 |
| 2025-11-27 | UI-011 | ResultsTable 통합 | ✅ 성공 |
| 2025-11-27 | E2E-002 | 배당률 E2E 테스트 | ✅ 성공 |
| 2025-11-27 | E2E-003 | 결과 E2E 테스트 | ✅ 성공 |
| 2025-11-27 | UI-007 | OddsDisplay 컴포넌트 | ✅ 성공 |
| 2025-11-27 | UI-008 | ResultsTable 컴포넌트 | ✅ 성공 |
| 2025-11-27 | UI-009 | Skeletons 컴포넌트 | ✅ 성공 |
| 2025-11-27 | REFACTOR | page.tsx/layout.tsx 리팩토링 | ✅ 성공 |
| 2025-11-24 | UI-005 | RaceDetail 페이지 | ✅ 성공 |
| 2025-11-24 | E2E-001 | 경주 상세 E2E 테스트 | ✅ 성공 |
| 2025-11-23 | UI-001~004 | 공통 컴포넌트 | ✅ 성공 |
| 2025-11-22 | API-001~005 | 경주/출주표 API | ✅ 성공 |

---

## 📝 노트

### 기술적 결정 사항

1. **Server Components 우선**: 데이터 페칭이 필요한 컴포넌트는 Server Component로 구현
2. **ISR 캐싱**: 경주 데이터는 30초~5분 캐싱 적용
3. **Mock 데이터**: API 키 없이 개발 가능하도록 더미 데이터 제공

### 알려진 이슈

- [ ] KSPO API 응답 형식이 문서와 다른 경우 있음 (필드명 차이)
- [ ] 경주 시작 후 배당률 업데이트 주기 최적화 필요

### 다음 스프린트 계획

1. Phase 2 기능 설계 (결과 히스토리, 알림)
2. 프로덕션 모니터링 설정
3. 사용자 피드백 수집 체계 구축

---

*이 문서는 TDD 사이클 진행에 따라 실시간으로 업데이트됩니다.*
*마지막 업데이트: 2025-11-27*
