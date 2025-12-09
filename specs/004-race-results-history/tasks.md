# Tasks: Race Results History

**Input**: Design documents from `/specs/001-race-results-history/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included per constitution requirement (TDD NON-NEGOTIABLE)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Next.js App Router: `src/app/` for pages and API routes
- Components: `src/components/`
- Library: `src/lib/` and `src/lib/api-helpers/`
- Types: `src/types/`
- E2E tests: `e2e/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Type definitions and shared utilities needed by all stories

- [x] T001 Add HistoricalRace, HistoricalRaceResult, Dividend types in src/types/index.ts
- [x] T002 [P] Add ResultsSearchParams and PaginatedResults types in src/types/index.ts
- [x] T003 [P] Add TRACKS constant with type-to-track mapping in src/lib/constants.ts
- [x] T004 Add dummy historical race data generator in src/lib/api-helpers/dummy.ts

---

## Phase 1.5: Material Design 3 (M3) Design System Setup

**Purpose**: Establish M3 design tokens, typography, and component foundations for consistent UI

**Design Decisions** (from spec.md Clarifications 2025-12-02):

- Color: M3 neutral brand + semantic race colors (horse=green, cycle=red, boat=blue)
- Components: M3 Elevated Cards for results, Filter Chips, Search Bar
- Typography: Pretendard font with M3 Type Scale
- Interaction: In-place card expansion (accordion style)
- Theme: Light mode only (initial release)

### Infrastructure

- [x] T004a [P] Install Pretendard font and configure in src/app/layout.tsx
- [x] T004b [P] Create M3 design tokens file in src/styles/tokens.ts (colors, spacing, elevation)
- [x] T004c [P] Update tailwind.config.ts with M3 color palette and typography scale
- [x] T004d [P] Create M3 type scale CSS classes in src/styles/typography.css

### Tests (TDD - write first, ensure FAIL)

- [x] T004e [P] Write failing test for M3Card component in src/components/ui/M3Card.test.tsx
- [x] T004f [P] Write failing test for M3Chip component in src/components/ui/M3Chip.test.tsx
- [x] T004g [P] Write failing test for useCardExpansion hook in src/hooks/useCardExpansion.test.ts

### Base Components

- [x] T004h [P] Create M3Card base component with elevation variants in src/components/ui/M3Card.tsx
- [x] T004i [P] Create M3Chip component for filters in src/components/ui/M3Chip.tsx
- [x] T004j [P] Create M3SearchBar component in src/components/ui/M3SearchBar.tsx
- [x] T004k Create useCardExpansion hook for accordion behavior in src/hooks/useCardExpansion.ts

**Checkpoint**: M3 design system ready - all UI components will use M3 tokens and patterns

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core API and data fetching infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Tests (TDD - write first, ensure FAIL)

- [x] T005 [P] Write failing test for fetchHistoricalResults function in src/lib/api.test.ts
- [x] T006 [P] Write failing test for mapHistoricalRaceResult mapper in src/lib/api-helpers/mappers.test.ts
- [x] T007 [P] Write failing API route test for GET /api/results in src/app/api/results/route.test.ts
- [x] T008 [P] Write failing API route test for GET /api/results/[id] in src/app/api/results/[id]/route.test.ts

### Implementation

- [x] T009 Implement mapHistoricalRaceResult mapper function in src/lib/api-helpers/mappers.ts
- [x] T010 Implement fetchHistoricalResults function in src/lib/api.ts
- [x] T011 Implement GET /api/results route handler in src/app/api/results/route.ts
- [x] T012 Implement GET /api/results/[id] route handler in src/app/api/results/[id]/route.ts
- [x] T013 Add results link to Header navigation in src/components/Header.tsx

**Checkpoint**: Foundation ready - API endpoints work, user story implementation can begin

---

## Phase 3: User Story 1 - Browse Recent Results (Priority: P1) 🎯 MVP

**Goal**: Users can view recent race results immediately upon page load with top 3 finishers and payouts

**Independent Test**: Navigate to /results and verify race results display with positions and dividends

### Tests (TDD - write first, ensure FAIL)

- [x] T014 [P] [US1] Write failing test for ResultCard component in src/components/ResultCard.test.tsx
- [x] T015 [P] [US1] Write failing test for ResultsList component in src/components/ResultsList.test.tsx
- [x] T016 [P] [US1] Write failing test for results page in src/app/results/page.test.tsx
- [x] T017 [P] [US1] Write failing E2E test for browse results in e2e/tests/results.spec.ts

### Implementation

- [x] T018 [P] [US1] Create ResultCard component (extends M3Card) displaying race summary in src/components/ResultCard.tsx
- [x] T019 [P] [US1] Create DividendDisplay component for payout info in src/components/DividendDisplay.tsx
- [x] T020 [US1] Create ResultsList component with pagination in src/components/ResultsList.tsx
- [x] T021 [US1] Create Pagination component in src/components/Pagination.tsx
- [x] T022 [US1] Implement results page with data fetching in src/app/results/page.tsx
- [x] T023 [US1] Add loading skeleton for results page (M3 skeleton pattern) in src/components/Skeletons.tsx
- [x] T024 [US1] Create results page object for E2E tests in e2e/pages/results.page.ts

**Checkpoint**: User Story 1 complete - users can browse recent results with pagination

---

## Phase 4: User Story 2 - Filter by Date and Race Type (Priority: P2)

**Goal**: Users can filter results by date range and race type (horse/cycle/boat)

**Independent Test**: Apply date and type filters, verify only matching results appear

### Tests (TDD - write first, ensure FAIL)

- [x] T025 [P] [US2] Write failing test for DateRangeFilter component in src/components/DateRangeFilter.test.tsx
- [x] T026 [P] [US2] Write failing test for RaceTypeFilter component in src/components/RaceTypeFilter.test.tsx
- [x] T027 [P] [US2] Write failing test for ResultFilters component in src/components/ResultFilters.test.tsx
- [x] T028 [P] [US2] Write failing E2E test for date/type filtering in e2e/tests/results.spec.ts

### Implementation

- [x] T029 [P] [US2] Create DateRangeFilter component with date picker in src/components/DateRangeFilter.tsx
- [x] T030 [P] [US2] Create RaceTypeFilter component (uses M3Chip) with multi-select in src/components/RaceTypeFilter.tsx
- [x] T031 [US2] Create ResultFilters container component in src/components/ResultFilters.tsx
- [x] T032 [US2] Integrate filters with URL state (searchParams) in src/app/results/page.tsx
- [x] T033 [US2] Add filter clear functionality in src/components/ResultFilters.tsx

**Checkpoint**: User Story 2 complete - users can filter by date and race type

---

## Phase 5: User Story 3 - Filter by Track Location (Priority: P3)

**Goal**: Users can filter results by specific track/venue

**Independent Test**: Select track filter, verify only results from that track appear

### Tests (TDD - write first, ensure FAIL)

- [x] T034 [P] [US3] Write failing test for TrackFilter component in src/components/TrackFilter.test.tsx
- [x] T035 [P] [US3] Write failing E2E test for track filtering in e2e/tests/results.spec.ts

### Implementation

- [x] T036 [US3] Create TrackFilter component with type-aware options in src/components/TrackFilter.tsx
- [x] T037 [US3] Integrate TrackFilter with ResultFilters in src/components/ResultFilters.tsx
- [x] T038 [US3] Update API route to handle track filter parameter in src/app/api/results/route.ts

**Checkpoint**: User Story 3 complete - users can filter by track location

---

## Phase 6: User Story 4 - Search by Jockey/Rider Name (Priority: P4)

**Goal**: Users can search for results featuring a specific jockey or rider

**Independent Test**: Enter jockey name, verify matching results appear with name highlighted

### Tests (TDD - write first, ensure FAIL)

- [x] T039 [P] [US4] Write failing test for ResultSearch component in src/components/ResultSearch.test.tsx
- [x] T040 [P] [US4] Write failing test for name highlighting in ResultCard in src/components/ResultCard.test.tsx
- [x] T041 [P] [US4] Write failing E2E test for jockey search in e2e/tests/results.spec.ts

### Implementation

- [x] T042 [US4] Create ResultSearch component (uses M3SearchBar) with debounced input in src/components/ResultSearch.tsx
- [x] T043 [US4] Add search highlighting to ResultCard component in src/components/ResultCard.tsx
- [x] T044 [US4] Integrate search with URL state in src/app/results/page.tsx
- [x] T045 [US4] Create NoResults component with suggestions in src/components/NoResults.tsx

**Checkpoint**: User Story 4 complete - users can search by jockey/rider name

---

## Phase 7: User Story 5 - View Detailed Race Result (Priority: P5)

**Goal**: Users can expand a race card to see full details including all finishers and complete dividends

**Independent Test**: Click on race card, verify detailed view shows all finishers with complete info

### Tests (TDD - write first, ensure FAIL)

- [x] T046 [P] [US5] Write failing test for ResultDetail component in src/components/ResultDetail.test.tsx
- [x] T047 [P] [US5] Write failing E2E test for detail expansion in e2e/tests/results.spec.ts

### Implementation

- [x] T048 [US5] Create ResultDetail component with full finisher list in src/components/ResultDetail.tsx
- [x] T049 [US5] Add expand/collapse functionality (uses useCardExpansion hook) to ResultCard in src/components/ResultCard.tsx
- [x] T050 [US5] Display complete dividend breakdown in ResultDetail in src/components/ResultDetail.tsx

**Checkpoint**: User Story 5 complete - users can view complete race details

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, edge cases, performance, and final validation

- [x] T051 [P] Add error state handling for API failures in src/app/results/page.tsx
- [x] T052 [P] Add empty state for no results found in src/components/NoResults.tsx
- [x] T053 [P] Add canceled race visual indicator in src/components/ResultCard.tsx
- [x] T054 Handle missing dividend data gracefully in src/components/DividendDisplay.tsx
- [x] T054a [P] Handle missing finisher data (null name/position) gracefully in src/components/ResultCard.tsx
- [x] T054b [P] Handle missing track info gracefully in src/components/ResultCard.tsx
- [x] T054c [P] Add unit tests for missing data scenarios in src/components/ResultCard.test.tsx
- [x] T055 Add mobile-responsive styles to all result components
- [x] T056 Run full E2E test suite with npm run test:e2e
- [x] T057 Validate quickstart.md scenarios manually
- [x] T058 Update Header navigation active state for /results

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **M3 Design System (Phase 1.5)**: Depends on Setup - BLOCKS all UI components
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories (API side)
- **User Stories (Phase 3-7)**: Depend on BOTH Phase 1.5 (M3) and Phase 2 (API) completion
  - US1 (Browse) → US2 (Date/Type Filter) → US3 (Track Filter) → US4 (Search) → US5 (Detail)
  - Each story builds on previous but remains independently testable
  - All UI components MUST use M3 base components (M3Card, M3Chip, M3SearchBar)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Foundation only - MVP deliverable
- **US2 (P2)**: Foundation + US1 components (uses ResultsList, ResultCard)
- **US3 (P3)**: Foundation + US2 (extends ResultFilters)
- **US4 (P4)**: Foundation + US1 (extends ResultCard for highlighting)
- **US5 (P5)**: Foundation + US1 (extends ResultCard for expansion)

### Within Each User Story

1. Tests MUST be written and FAIL before implementation
2. Components before page integration
3. Simple components before composite components
4. Core functionality before enhancements

### Parallel Opportunities

- All Setup tasks (T001-T004) can run in parallel
- All Foundational tests (T005-T008) can run in parallel
- Within each story, all test tasks marked [P] can run in parallel
- Within each story, independent component tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task T014: "Write failing test for ResultCard component"
Task T015: "Write failing test for ResultsList component"
Task T016: "Write failing test for results page"
Task T017: "Write failing E2E test for browse results"

# Launch parallel component creation:
Task T018: "Create ResultCard component"
Task T019: "Create DividendDisplay component"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T013)
3. Complete Phase 3: User Story 1 (T014-T024)
4. **STOP and VALIDATE**: Test at /results - users can browse recent results
5. Deploy MVP if ready

### Incremental Delivery

1. Setup + Foundational → API works
2. Add US1 → Browse results works → Deploy MVP!
3. Add US2 → Date/type filtering works → Deploy
4. Add US3 → Track filtering works → Deploy
5. Add US4 → Jockey search works → Deploy
6. Add US5 → Detail view works → Deploy
7. Polish → Error handling, edge cases → Final deploy

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label (US1-US5) maps task to specific user story
- TDD required per constitution: tests fail first, then implement
- Commit after each task following constitution commit convention
- `chore(structure):` for setup/structure tasks
- `feat(behavior):` for implementation tasks
- `test:` for test-only tasks
