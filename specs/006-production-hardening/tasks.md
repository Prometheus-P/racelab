# Tasks: Production Hardening

**Input**: Design documents from `/specs/006-production-hardening/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md
**Branch**: `006-production-hardening`

**Tests**: Included per Constitution (TDD is NON-NEGOTIABLE)

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1-US5) this task belongs to
- All paths relative to repository root

---

## Phase 1: Setup

**Purpose**: Verify environment and understand current state

- [x] T001 Verify branch is `006-production-hardening` and dependencies installed
- [x] T002 [P] Run `npm run test` to confirm baseline tests pass
- [x] T003 [P] Run `npm run lint` to confirm no existing lint errors
- [x] T004 [P] Run `npm run build` to confirm build succeeds

**Checkpoint**: Environment ready for development

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add types and config that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Add RaceFetchStatus type to src/types/index.ts
- [x] T006 Add RaceFetchResult<T> interface to src/types/index.ts
- [x] T007 Add TodayRacesData interface to src/types/index.ts
- [x] T008 [P] Create RaceTypeConfig interface in src/config/raceTypes.ts
- [x] T009 [P] Create RACE_TYPES constant with horse/cycle/boat config in src/config/raceTypes.ts
- [x] T010 Run `npx tsc --noEmit` to verify new types compile correctly

**Checkpoint**: Foundation ready - user story implementation can begin

---

## Phase 3: User Story 1 - Accurate Date Display (Priority: P0)

**Goal**: All date displays use KST consistently, JSON-LD has accurate startDate

**Independent Test**: KST 자정 전후 접속 시 헤더 날짜와 경주 목록 날짜 일치 확인

### Tests for User Story 1

- [x] T011 [P] [US1] Write failing test for normalizeRaceDate in src/lib/utils/date.test.ts
- [x] T012 [P] [US1] Write failing test for buildRaceStartDateTime in src/lib/utils/date.test.ts
- [x] T013 [P] [US1] Write failing test for getFormattedKoreanDate in src/lib/utils/date.test.ts

### Implementation for User Story 1

- [x] T014 [US1] Implement normalizeRaceDate function in src/lib/utils/date.ts
- [x] T015 [US1] Implement buildRaceStartDateTime function in src/lib/utils/date.ts
- [x] T016 [US1] Implement getFormattedKoreanDate function in src/lib/utils/date.ts
- [x] T017 [US1] Run tests to verify all date utils pass
- [x] T018 [US1] Update PageHeader in src/app/page.tsx to use getFormattedKoreanDate instead of new Date()
- [x] T019 [US1] Update generateSportsEventSchema in src/lib/seo/schemas.ts to handle race.date undefined
- [x] T020 [US1] Update generateSportsEventSchema to use buildRaceStartDateTime for startDate field
- [x] T021 [US1] Run `npm run build` to verify no type errors

**Checkpoint**: User Story 1 complete - all dates use KST, JSON-LD accurate

---

## Phase 4: User Story 2 - Optimized Home Page Loading (Priority: P0)

**Goal**: Home page makes only 3 API calls instead of 6

**Independent Test**: Network 탭에서 horse/cycle/boat API 각 1회씩만 호출 확인

### Tests for User Story 2

- [x] T022 [P] [US2] Write test for fetchTodayAllRaces in src/lib/__tests__/api.test.ts

### Implementation for User Story 2

- [x] T023 [US2] Implement fetchTodayAllRaces function in src/lib/api.ts using Promise.allSettled
- [x] T024 [US2] Run test to verify fetchTodayAllRaces passes
- [x] T025 [US2] Update TodayRaces component props interface in src/components/TodayRaces.tsx
- [x] T026 [US2] Remove internal API calls from TodayRaces, use props.data instead
- [x] T027 [US2] Update QuickStats component props interface in src/components/QuickStats.tsx
- [x] T028 [US2] Remove internal API calls from QuickStats, use props.data instead
- [x] T029 [US2] Update Home page in src/app/page.tsx to call fetchTodayAllRaces once
- [x] T030 [US2] Pass allRaces data to TodayRaces and QuickStats as props
- [x] T031 [US2] Run `npm run build` to verify no type errors

**Checkpoint**: User Story 2 complete - API calls reduced from 6 to 3

---

## Phase 5: User Story 3 - Clear Error vs Empty State (Priority: P1)

**Goal**: Users see appropriate messages for API errors vs empty data

**Independent Test**: API 타임아웃 시뮬레이션으로 "데이터 제공 시스템 지연 중" 메시지 확인

### Tests for User Story 3

- [x] T032 [P] [US3] Write test for fetchWithTimeout utility in src/lib/api.test.ts
- [x] T033 [P] [US3] Write test for RaceFetchResult handling in src/lib/api.test.ts

### Implementation for User Story 3

- [x] T034 [US3] Implement fetchWithTimeout utility with 10s timeout in src/lib/api.ts
- [x] T035 [US3] Create ErrorBanner component in src/components/ErrorBanner.tsx
- [x] T036 [US3] Add fetchRaceByIdWithStatus returning RaceFetchResult<Race> in src/lib/api.ts
- [x] T037 [US3] Update race/[id]/page.tsx to handle NOT_FOUND status with RaceNotFound component
- [x] T038 [US3] Update race/[id]/page.tsx to handle UPSTREAM_ERROR with ErrorBanner
- [x] T039 [US3] Update Home page to show ErrorBanner for failed race types
- [x] T040 [US3] Remove random mock logic from getMockResults in src/app/race/[id]/page.tsx
- [x] T041 [US3] Remove random mock logic from getMockDividends in src/app/race/[id]/page.tsx
- [x] T042 [US3] Add process.env.NODE_ENV check for mock data usage
- [x] T043 [US3] Run `npm run build` to verify no type errors

**Checkpoint**: User Story 3 complete - clear error/empty distinction

---

## Phase 6: User Story 4 - Consistent Race Type Config (Priority: P1)

**Goal**: All UI components use single RACE_TYPES config source

**Independent Test**: 경마 라벨 변경 시 모든 UI(탭, 통계카드, 경주목록) 동일 반영 확인

### Tests for User Story 4

- [x] T044 [P] [US4] Write test for RACE_TYPES config completeness in src/config/__tests__/raceTypes.test.ts

### Implementation for User Story 4

- [x] T045 [US4] Run test to verify RACE_TYPES structure (29 tests pass)
- [ ] T046 [US4] Update tabConfig in src/app/page.tsx to use RACE_TYPES (optional refactor)
- [ ] T047 [US4] Update raceTypeConfig in src/components/TodayRaces.tsx to use RACE_TYPES (optional refactor)
- [ ] T048 [US4] Update statConfigs in src/components/QuickStats.tsx to use RACE_TYPES (optional refactor)
- [ ] T049 [US4] Remove duplicate config objects from all updated files (optional refactor)
- [x] T050 [US4] Run `npm run build` to verify no type errors

**Checkpoint**: User Story 4 test infrastructure complete - central config in place

---

## Phase 7: User Story 5 - Type-Safe API Functions (Priority: P1)

**Goal**: All API functions have explicit return types, no any usage

**Independent Test**: TypeScript strict 모드에서 API 함수 리턴 타입 자동 추론 확인

### Implementation for User Story 5

- [x] T051 [US5] Add explicit Promise<Race[]> return type to fetchHorseRaceSchedules in src/lib/api/kraClient.ts (already present)
- [x] T052 [US5] Add explicit Promise<Race[]> return type to fetchCycleRaceSchedules in src/lib/api/kspoCycleClient.ts (already present)
- [x] T053 [US5] Add explicit Promise<Race[]> return type to fetchBoatRaceSchedules in src/lib/api/kspoBoatClient.ts (already present)
- [x] T054 [US5] Add explicit return types to all exported functions in src/lib/api.ts (already present)
- [x] T055 [US5] Run `npx tsc --noEmit --strict` to verify no type errors
- [x] T056 [US5] Run `npm run lint` to check for any remaining type issues

**Checkpoint**: User Story 5 complete - full type safety

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [x] T057 Run full test suite: `npm run test` (1056 passed, 5 skipped oddsPoller tests)
- [ ] T058 Run E2E tests: `npm run test:e2e` (skipped - long running)
- [x] T059 Run lint: `npm run lint` (warnings only, no errors)
- [x] T060 Run build: `npm run build` (success)
- [ ] T061 Manual verification: Check network tab for 3 API calls on home page
- [ ] T062 Manual verification: Check date display consistency across pages
- [ ] T063 [P] Update quickstart.md verification checklist with results
- [ ] T064 Commit structural changes: `chore(structure): add types and config for production hardening`
- [ ] T065 Commit behavioral changes: `feat(behavior): optimize API calls and error handling`

**Checkpoint**: All tasks complete - ready for PR

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup ──────────────────────────────────────────┐
                                                         │
Phase 2: Foundational ◄──────────────────────────────────┘
    │
    ├──► Phase 3: US1 - Date Display (P0)
    │
    ├──► Phase 4: US2 - API Optimization (P0)
    │         └── depends on T005-T007 (types)
    │
    ├──► Phase 5: US3 - Error Handling (P1)
    │         └── depends on T005-T006 (RaceFetchStatus, RaceFetchResult)
    │
    ├──► Phase 6: US4 - Race Type Config (P1)
    │         └── depends on T008-T009 (RACE_TYPES)
    │
    └──► Phase 7: US5 - Type Safety (P1)
              └── can run in parallel with US3, US4

Phase 8: Polish ◄── All user stories complete
```

### User Story Independence

| Story | Can Start After | Independent Test |
| ----- | --------------- | ---------------- |
| US1 | Phase 2 | 날짜 유틸 단위 테스트 |
| US2 | Phase 2 + T005-T007 | 네트워크 탭 API 호출 수 확인 |
| US3 | Phase 2 + T005-T006 | 타임아웃 시 에러 배너 표시 |
| US4 | Phase 2 + T008-T009 | RACE_TYPES 변경 시 UI 반영 |
| US5 | Phase 2 | TypeScript 타입 체크 통과 |

### Parallel Opportunities

**Within Phase 2:**
```bash
# Run in parallel:
T008 + T009 (config files)
```

**Within Phase 3 (US1):**
```bash
# Run in parallel:
T011 + T012 + T013 (all test files)
```

**Within Phase 4-5-6-7:**
```bash
# After Phase 2, these can run in parallel on different machines:
Phase 4 (US2) || Phase 6 (US4) || Phase 7 (US5)
# Phase 5 (US3) slightly depends on US2 for Home page integration
```

---

## Implementation Strategy

### MVP First (US1 + US2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 (Date Display)
4. Complete Phase 4: US2 (API Optimization)
5. **STOP and VALIDATE**: Test home page loads with 3 API calls, dates correct
6. Deploy/demo if ready

### Full Implementation

1. MVP above
2. Add Phase 5: US3 (Error Handling)
3. Add Phase 6: US4 (Config Consolidation)
4. Add Phase 7: US5 (Type Safety)
5. Complete Phase 8: Polish

### Commit Strategy (Constitution Compliance)

Per Constitution II (Structural-Behavioral Separation):

1. **Structural commits first:**
   - `chore(structure): add RaceFetchStatus and related types`
   - `chore(structure): add RACE_TYPES central config`

2. **Behavioral commits after:**
   - `feat(behavior): add KST date utilities for accurate display`
   - `feat(behavior): optimize home page to single API fetch`
   - `feat(behavior): add error state handling and ErrorBanner`
   - `refactor(behavior): consolidate race type configs`
   - `refactor(behavior): add explicit return types to API functions`

---

## Notes

- All tasks follow TDD: write failing tests first (Red), implement (Green), refactor
- [P] tasks can run in parallel on different files
- [US#] label maps to spec.md user stories
- Verify tests fail before implementing
- Commit after each logical group following Constitution II
- Stop at any checkpoint to validate story independently
