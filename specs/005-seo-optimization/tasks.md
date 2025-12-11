# Tasks: Advanced SEO/AEO/GEO Optimization

**Input**: Design documents from `/specs/005-seo-optimization/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included per Technical Constraints ("Follow TDD: Write unit tests for metadata generation utility functions")

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create SEO library structure and configure testing

- [X] T001 Create SEO library directory structure at src/lib/seo/
- [X] T002 [P] Create placeholder files: src/lib/seo/schemas.ts, src/lib/seo/metadata.ts, src/lib/seo/sitemap.ts
- [X] T003 [P] Create test directory structure at tests/unit/lib/seo/
- [X] T004 [P] Create SEO components directory at src/components/seo/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core schema builder utilities that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

### Tests for Foundational

- [X] T005 [P] Write unit test for generateSportsEventSchema in tests/unit/lib/seo/schemas.test.ts
- [X] T006 [P] Write unit test for generateFAQSchema in tests/unit/lib/seo/schemas.test.ts
- [X] T007 [P] Write unit test for generateRaceMetadata in tests/unit/lib/seo/metadata.test.ts
- [X] T008 [P] Write unit test for generateSitemapEntries in tests/unit/lib/seo/sitemap.test.ts
- [X] T009 [P] Write unit test for shouldSplitSitemap in tests/unit/lib/seo/sitemap.test.ts

### Implementation for Foundational

- [X] T010 Implement generateSportsEventSchema in src/lib/seo/schemas.ts (must pass T005)
- [X] T011 Implement generateFAQSchema in src/lib/seo/schemas.ts (must pass T006)
- [X] T012 Implement generateRaceMetadata in src/lib/seo/metadata.ts (must pass T007)
- [X] T013 Implement generateSitemapEntries in src/lib/seo/sitemap.ts (must pass T008)
- [X] T014 Implement shouldSplitSitemap in src/lib/seo/sitemap.ts (must pass T009)
- [X] T015 Implement getStaticSitemapEntries in src/lib/seo/sitemap.ts
- [X] T016 Export all SEO utilities from src/lib/seo/index.ts
- [X] T017 Run all unit tests to verify foundational utilities work

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Search Engine Discovery (Priority: P1) MVP

**Goal**: Enable search engines to discover and index all race pages with unique metadata

**Independent Test**: Visit `/race/{id}` and verify unique `<title>` in browser tab, check sitemap.xml contains race URLs

### Tests for User Story 1

- [ ] T018 [P] [US1] Write integration test for dynamic metadata in race detail page in tests/unit/app/race-metadata.test.ts
- [ ] T019 [P] [US1] Write test for sitemap generation with historical data in tests/unit/app/sitemap.test.ts

### Implementation for User Story 1

- [X] T020 [US1] Update generateMetadata in src/app/race/[id]/page.tsx to use generateRaceMetadata utility
- [X] T021 [US1] Add canonical URL to race detail metadata in src/app/race/[id]/page.tsx
- [X] T022 [US1] Create fetchHistoricalRaceIds helper in src/lib/api.ts for past 365 days
- [X] T023 [US1] Update src/app/sitemap.ts to include historical race URLs using fetchHistoricalRaceIds
- [X] T024 [US1] Add ISR revalidation (export const revalidate = 3600) to src/app/sitemap.ts
- [ ] T025 [US1] Test sitemap generation locally with `npm run build && npm run start`
- [ ] T026 [US1] Verify unique titles in browser for 3 different race pages

**Checkpoint**: User Story 1 complete - search engines can discover all race pages with unique metadata

---

## Phase 4: User Story 2 - Voice Search Answer (Priority: P2)

**Goal**: Enable voice assistants to extract structured answers from race and FAQ pages

**Independent Test**: Run Google Rich Results Test on race detail page and verify SportsEvent schema passes

### Tests for User Story 2

- [ ] T027 [P] [US2] Write test for FAQJsonLd component in tests/unit/components/seo/FAQJsonLd.test.tsx
- [ ] T028 [P] [US2] Write test for enhanced SportsEvent schema output in tests/unit/lib/seo/schemas-enhanced.test.ts

### Implementation for User Story 2

- [X] T029 [P] [US2] Create FAQJsonLd component in src/components/seo/FAQJsonLd.tsx
- [X] T030 [US2] Create guide page with FAQ content at src/app/guide/page.tsx
- [X] T031 [US2] Add FAQJsonLd to guide page with betting FAQ data
- [X] T032 [US2] Enhance SportsEvent schema in race detail to include eventStatus mapping in src/app/race/[id]/page.tsx
- [X] T033 [US2] Add competitor array with proper @type (Thing for horse, Person for athlete) in race detail schema
- [X] T034 [US2] Add subEvent for race results (top 3 finishers) when race.status is 'finished'
- [ ] T035 [US2] Validate SportsEvent schema with Google Rich Results Test
- [ ] T036 [US2] Validate FAQPage schema on guide page with Google Rich Results Test

**Checkpoint**: User Story 2 complete - voice assistants can extract structured race and FAQ data

---

## Phase 5: User Story 3 - AI Citation Authority (Priority: P3)

**Goal**: Enable AI tools (ChatGPT, Perplexity) to cite RaceLab as authoritative source

**Independent Test**: View page source and verify AI Summary text block contains race results in plain text format

### Tests for User Story 3

- [ ] T037 [P] [US3] Write test for AISummary component output in tests/unit/components/seo/AISummary.test.tsx
- [ ] T038 [P] [US3] Write test for data source attribution in AI Summary

### Implementation for User Story 3

- [X] T039 [P] [US3] Create AISummary component in src/components/seo/AISummary.tsx with sr-only styling
- [X] T040 [US3] Add AISummary component to race detail page in src/app/race/[id]/page.tsx
- [X] T041 [US3] Ensure AISummary includes raceInfo, status, results (top 3), dataSource fields
- [X] T042 [US3] Verify AISummary text format matches contract (경주 정보:, 경주 결과:, 데이터 출처:)
- [ ] T043 [US3] Verify data source attribution appears in page source (한국마사회/국민체육진흥공단)
- [ ] T044 [US3] Test LLM parsing by checking page source for plain-text race summary

**Checkpoint**: User Story 3 complete - AI tools can parse and cite race data

---

## Phase 6: User Story 4 - Historical Race Search (Priority: P4)

**Goal**: Enable users to find historical race results via search engines

**Independent Test**: Search "2024년 11월 서울경마 결과 site:racelab.kr" and verify indexed pages

### Tests for User Story 4

- [X] T045 [P] [US4] Write test for historical metadata with date in title in tests/unit/lib/seo/metadata.test.ts
- [X] T046 [P] [US4] Write test for sitemap splitting logic in tests/unit/lib/seo/sitemap.test.ts

### Implementation for User Story 4

- [X] T047 [US4] Update generateRaceMetadata to include date in title for historical races in src/lib/seo/metadata.ts
- [X] T048 [US4] Create sitemap index route (generateSitemaps) in src/app/sitemap.ts for large datasets
- [X] T049 [US4] Implement generateSitemaps function in sitemap route for URL chunking
- [X] T050 [US4] Update fetchHistoricalRaceIds with pagination support in src/lib/api.ts
- [X] T051 [US4] Add error handling for API failures in sitemap generation (skip failed chunks)
- [X] T052 [US4] Test sitemap index at /sitemap/0.xml, /sitemap/1.xml etc.
- [ ] T053 [US4] Submit sitemap to Google Search Console and verify indexing (MANUAL)

**Checkpoint**: User Story 4 complete - historical race pages are indexable

---

## Phase 7: User Story 5 - Performance for Seniors (Priority: P5)

**Goal**: Achieve LCP < 2.5s and Lighthouse Score >= 90 for 50-60 demographic on slow networks

**Independent Test**: Run Lighthouse on mobile with slow 3G throttling, verify Performance Score >= 90

### Tests for User Story 5

- [ ] T054 [P] [US5] Write Playwright E2E test for LCP measurement in e2e/seo/performance.spec.ts
- [ ] T055 [P] [US5] Write test to verify font file size < 100KB

### Implementation for User Story 5

- [ ] T056 [US5] Download Pretendard font files (Regular, Bold) from GitHub releases
- [ ] T057 [US5] Generate Korean subset using pyftsubset with Unicode ranges U+AC00-D7A3,U+1100-11FF,U+3130-318F,U+0020-007E
- [ ] T058 [US5] Place subset font files in public/fonts/pretendard-korean-400.woff2 and pretendard-korean-700.woff2
- [ ] T059 [US5] Verify each font file is < 100KB using `ls -lh public/fonts/`
- [ ] T060 [US5] Update src/app/layout.tsx to use next/font/local with Korean subset fonts
- [ ] T061 [US5] Add font preload and display: swap configuration
- [ ] T062 [US5] Verify no layout shift (CLS) with Lighthouse after font change
- [ ] T063 [US5] Run Lighthouse on mobile for race detail page, verify LCP < 2.5s
- [ ] T064 [US5] Run Lighthouse on mobile, verify Performance Score >= 90

**Checkpoint**: User Story 5 complete - page loads fast for senior users on slow networks

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup across all user stories

- [ ] T065 Run full test suite: `npm run test`
- [ ] T066 Run E2E tests: `npm run test:e2e`
- [ ] T067 Run production build: `npm run build`
- [ ] T068 [P] Verify all race detail pages have unique titles (spot check 5 pages)
- [ ] T069 [P] Verify sitemap.xml is accessible and contains expected URLs
- [ ] T070 [P] Run Google Rich Results Test on 3 race pages for SportsEvent
- [ ] T071 [P] Run Google Rich Results Test on guide page for FAQPage
- [ ] T072 [P] Verify AI Summary appears in view-source for finished race pages
- [ ] T073 Run quickstart.md verification checklist
- [ ] T074 Update CLAUDE.md if any new patterns introduced

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can proceed in priority order (P1 → P2 → P3 → P4 → P5)
  - US1 is MVP and should be completed first
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational - No dependencies on other stories - **MVP**
- **US2 (P2)**: Can start after Foundational - Builds on schemas from foundational, independent of US1
- **US3 (P3)**: Can start after Foundational - Independent of US1/US2
- **US4 (P4)**: Can start after Foundational - Uses sitemap utilities from foundational, independent
- **US5 (P5)**: Can start after Foundational - Font optimization is independent of all other stories

### Within Each User Story

1. Tests MUST be written and FAIL before implementation (TDD)
2. Utilities before components
3. Components before page integration
4. Story complete before moving to next priority

### Parallel Opportunities

**Setup Phase**:
- T002, T003, T004 can run in parallel (different directories)

**Foundational Phase**:
- T005, T006, T007, T008, T009 can run in parallel (different test files)

**User Story Phases**:
- Tests within each story can run in parallel
- Different user stories can be worked on in parallel by different team members after Foundational

---

## Parallel Example: Foundational Tests

```bash
# Launch all foundational tests together:
Task: "Write unit test for generateSportsEventSchema in tests/unit/lib/seo/schemas.test.ts"
Task: "Write unit test for generateFAQSchema in tests/unit/lib/seo/schemas.test.ts"
Task: "Write unit test for generateRaceMetadata in tests/unit/lib/seo/metadata.test.ts"
Task: "Write unit test for generateSitemapEntries in tests/unit/lib/seo/sitemap.test.ts"
Task: "Write unit test for shouldSplitSitemap in tests/unit/lib/seo/sitemap.test.ts"
```

## Parallel Example: User Story 3 Tests

```bash
# Launch all US3 tests together:
Task: "Write test for AISummary component output in tests/unit/components/seo/AISummary.test.tsx"
Task: "Write test for data source attribution in AI Summary"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T017)
3. Complete Phase 3: User Story 1 (T018-T026)
4. **STOP and VALIDATE**: Test unique titles, sitemap generation
5. Deploy/demo if ready - search engines can now index race pages!

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → **MVP: Search Discovery** → Deploy
3. Add User Story 2 → **Voice Search Support** → Deploy
4. Add User Story 3 → **AI Citation Authority** → Deploy
5. Add User Story 4 → **Historical Search** → Deploy
6. Add User Story 5 → **Performance Optimization** → Deploy

### Suggested MVP Scope

**Minimum Viable SEO**: Complete only User Story 1 (P1)
- Delivers: Unique page titles, historical sitemap, basic SEO
- Tasks: T001-T026 (26 tasks)
- Validates: Search engine discovery works

---

## Task Summary

| Phase | Story | Task Count | Parallel Tasks |
|-------|-------|------------|----------------|
| Setup | - | 4 | 3 |
| Foundational | - | 13 | 5 |
| US1 (P1) | Search Discovery | 9 | 2 |
| US2 (P2) | Voice Search | 10 | 2 |
| US3 (P3) | AI Citation | 8 | 2 |
| US4 (P4) | Historical Search | 9 | 2 |
| US5 (P5) | Performance | 11 | 2 |
| Polish | - | 10 | 5 |
| **Total** | | **74** | **23** |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- TDD: Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
