# Tasks: User-Friendly Design System

**Input**: Design documents from `/specs/002-design-system/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Following TDD per constitution (Principle I). Tests written before implementation.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Components**: `src/components/ui/`, `src/components/brand/`
- **Styles**: `src/styles/`, `tailwind.config.ts`
- **Hooks**: `src/hooks/`
- **Assets**: `public/`
- **Tests**: Co-located with components (`*.test.tsx`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project structure and shared dependencies

- [x] T001 Create brand components directory at src/components/brand/
- [x] T002 [P] Create animations CSS file at src/styles/animations.css
- [x] T003 [P] Create barrel export for ui components at src/components/ui/index.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core tokens and utilities that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Extend motion tokens in src/styles/tokens.ts (duration, easing)
- [x] T005 [P] Update M3 elevation shadows in tailwind.config.ts per research.md specs
- [x] T006 [P] Add reduced-motion media query styles to src/styles/globals.css
- [x] T007 [P] Create useReducedMotion hook at src/hooks/useReducedMotion.ts
- [x] T008 Create useRipple hook at src/hooks/useRipple.ts (ripple effect utility)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Brand Identity Through Logo (Priority: P1) 🎯 MVP

**Goal**: Display RaceLab logo consistently across all pages with proper variants and hover animation

**Independent Test**: Open app → verify logo in header with correct colors (green roof, red core, blue base), hover shows scale animation

### Tests for User Story 1

- [x] T009 [P] [US1] Write failing tests for RaceLabLogo component at src/components/brand/RaceLabLogo.test.tsx

### Implementation for User Story 1

- [x] T010 [P] [US1] Extract clean SVG from public/racelab_logo_clean.html to public/racelab-logo.svg
- [x] T011 [P] [US1] Create symbol-only variant at public/racelab-symbol.svg
- [x] T012 [P] [US1] Create favicon from logo at public/favicon.svg
- [x] T013 [US1] Implement RaceLabLogo component at src/components/brand/RaceLabLogo.tsx (variants: full, symbol, text)
- [x] T014 [US1] Add hover animation (scale 1.02x, 500ms) to RaceLabLogo with reduced-motion support
- [x] T015 [US1] Create barrel export at src/components/brand/index.ts
- [x] T016 [US1] Integrate RaceLabLogo into Header component at src/components/Header.tsx
- [x] T017 [US1] Add text fallback "RACELAB" when logo fails to load in RaceLabLogo.tsx
- [x] T018 [US1] Update favicon reference in src/app/layout.tsx (and updated branding to RaceLab)

**Checkpoint**: ✅ Logo displays correctly in header, hover animation works, fallback shows if image fails

---

## Phase 4: User Story 2 - Consistent Visual Experience (Priority: P2)

**Goal**: Ensure M3 tokens are applied consistently across all components via Tailwind

**Independent Test**: Navigate home → results → race detail → verify same colors, typography, card styles

### Tests for User Story 2

- [x] T019 [P] [US2] Write failing tests for M3Card variants at src/components/ui/M3Card.test.tsx (extend existing)
- [x] T020 [P] [US2] Write failing tests for M3Button component at src/components/ui/M3Button.test.tsx

### Implementation for User Story 2

- [x] T021 [P] [US2] Create M3Button component at src/components/ui/M3Button.tsx (5 variants: filled, outlined, text, elevated, tonal)
- [x] T022 [US2] Enhance M3Card component at src/components/ui/M3Card.tsx (add 3 variants: elevated, filled, outlined)
- [x] T023 [US2] Update M3Chip component at src/components/ui/M3Chip.tsx to support race type colors
- [x] T024 [US2] Create M3TextField component at src/components/ui/M3TextField.tsx
- [x] T025 [US2] Update barrel export at src/components/ui/index.ts with new components
- [x] T026 [US2] Verify typography tokens applied consistently via Tailwind classes (78 component tests pass)

**Checkpoint**: ✅ All buttons, cards, chips look identical across home, results, race detail pages

---

## Phase 5: User Story 3 - Meaningful Motion and Feedback (Priority: P3)

**Goal**: Implement ripple effect, skeleton shimmer, and card expansion animations

**Independent Test**: Click button → see ripple from click point; view loading state → see shimmer; expand card → smooth 300ms transition

### Tests for User Story 3

- [ ] T027 [P] [US3] Write failing tests for useRipple hook at src/hooks/useRipple.test.ts
- [ ] T028 [P] [US3] Write failing tests for Skeleton component at src/components/ui/Skeleton.test.tsx

### Implementation for User Story 3

- [ ] T029 [US3] Add ripple keyframe animation to src/styles/animations.css
- [ ] T030 [US3] Add shimmer keyframe animation to src/styles/animations.css
- [ ] T031 [US3] Implement ripple effect in useRipple hook at src/hooks/useRipple.ts
- [ ] T032 [US3] Create Skeleton component with shimmer at src/components/ui/Skeleton.tsx
- [ ] T033 [US3] Integrate ripple effect into M3Button at src/components/ui/M3Button.tsx
- [ ] T034 [US3] Integrate ripple effect into M3Chip at src/components/ui/M3Chip.tsx
- [ ] T035 [US3] Add expansion animation to M3Card at src/components/ui/M3Card.tsx (300ms ease-out)
- [ ] T036 [US3] Ensure all animations respect prefers-reduced-motion in src/styles/animations.css

**Checkpoint**: Ripple shows on button/chip click, skeleton shimmer on loading, card expands smoothly

---

## Phase 6: User Story 4 - Accessible Touch-Friendly Interface (Priority: P4)

**Goal**: Ensure 48x48dp touch targets and immediate visual feedback on all interactive elements

**Independent Test**: Use app on mobile → tap buttons, chips, links → all tappable, all show feedback

### Tests for User Story 4

- [ ] T037 [P] [US4] Write failing tests for touch target sizing in src/components/ui/M3Button.test.tsx

### Implementation for User Story 4

- [ ] T038 [US4] Add min-w-[48px] min-h-[48px] enforcement to M3Button at src/components/ui/M3Button.tsx
- [ ] T039 [US4] Add extended touch area (::before pseudo-element) to M3Chip at src/components/ui/M3Chip.tsx
- [ ] T040 [US4] Verify touch targets on M3TextField at src/components/ui/M3TextField.tsx
- [ ] T041 [US4] Add touch target validation utility at src/lib/utils/accessibility.ts
- [ ] T042 [US4] Audit existing interactive elements (Header nav, filters) for 48dp compliance

**Checkpoint**: All interactive elements meet 48x48dp, immediate feedback on tap

---

## Phase 7: User Story 5 - Clear Information Hierarchy (Priority: P5)

**Goal**: Ensure visual hierarchy makes primary info identifiable within 3 seconds

**Independent Test**: Show result card to new user → ask to identify race winner → should find in <3 seconds

### Tests for User Story 5

- [ ] T043 [P] [US5] Write failing tests for ResultCard hierarchy styling at src/components/ResultCard.test.tsx

### Implementation for User Story 5

- [ ] T044 [US5] Apply M3 type scale to ResultCard headlines at src/components/ResultCard.tsx
- [ ] T045 [US5] Enhance race type color prominence in ResultCard at src/components/ResultCard.tsx
- [ ] T046 [US5] Apply larger text-title-large to dividend amounts in DividendDisplay at src/components/DividendDisplay.tsx
- [ ] T047 [US5] Add section header styling with consistent M3 typography
- [ ] T048 [US5] Verify contrast ratios meet WCAG AA (4.5:1) across key text

**Checkpoint**: Primary info (race type, winner, dividend) stands out visually

---

## Phase 8: User Story 6 - Responsive Layout Adaptation (Priority: P6)

**Goal**: Layouts adapt correctly at mobile (375px), tablet (768px), desktop (1280px)

**Independent Test**: Resize browser → verify single-column mobile, 2-col tablet, max-width desktop

### Tests for User Story 6

- [ ] T049 [P] [US6] Write failing E2E test for responsive layout at e2e/tests/responsive.spec.ts

### Implementation for User Story 6

- [ ] T050 [US6] Verify mobile-first responsive classes in ResultsList at src/components/ResultsList.tsx
- [ ] T051 [US6] Add max-w-[1280px] container constraint to main layouts at src/app/layout.tsx
- [ ] T052 [US6] Verify grid breakpoints in TodayRaces at src/components/TodayRaces.tsx
- [ ] T053 [US6] Test and fix any overflow issues on mobile viewport

**Checkpoint**: All pages render correctly at 375px, 768px, 1280px viewports

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, cleanup, and validation

- [ ] T054 [P] Create M3Dialog component at src/components/ui/M3Dialog.tsx
- [ ] T055 [P] Create M3Snackbar component at src/components/ui/M3Snackbar.tsx
- [ ] T056 [P] Write tests for M3Dialog at src/components/ui/M3Dialog.test.tsx
- [ ] T057 [P] Write tests for M3Snackbar at src/components/ui/M3Snackbar.test.tsx
- [ ] T058 Update quickstart.md with actual usage examples
- [ ] T059 Run full accessibility audit (axe-core or lighthouse)
- [ ] T060 Final barrel export update at src/components/ui/index.ts
- [ ] T061 Verify all 15+ components documented per SC-007

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational completion
  - Can proceed in parallel (if staffed)
  - Or sequentially: P1 → P2 → P3 → P4 → P5 → P6
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

| Story | Depends On | Can Run Parallel With |
|-------|------------|----------------------|
| US1 (Logo) | Foundational | US2, US3, US4, US5, US6 |
| US2 (Consistency) | Foundational | US1, US3, US4, US5, US6 |
| US3 (Motion) | Foundational, useRipple | US1, US2, US4, US5, US6 |
| US4 (Touch) | US2 (needs components) | US1, US3, US5, US6 |
| US5 (Hierarchy) | US2 (needs typography) | US1, US3, US4, US6 |
| US6 (Responsive) | US2 (needs layouts) | US1, US3, US4, US5 |

### Within Each User Story (TDD Cycle)

1. Write failing tests FIRST (Red)
2. Implement minimum code to pass (Green)
3. Refactor while keeping tests green

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Launch in parallel - different files, no dependencies:
Task: "Update M3 elevation shadows in tailwind.config.ts"
Task: "Add reduced-motion media query to src/styles/globals.css"
Task: "Create useReducedMotion hook at src/hooks/useReducedMotion.ts"
```

## Parallel Example: User Story 1

```bash
# Launch asset extraction in parallel:
Task: "Extract SVG to public/racelab-logo.svg"
Task: "Create symbol variant at public/racelab-symbol.svg"
Task: "Create favicon at public/favicon.svg"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Logo)
4. **STOP and VALIDATE**: Logo displays in header, hover works
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Logo) → Test → Deploy (MVP!)
3. Add US2 (Consistency) → Test → Deploy
4. Add US3 (Motion) → Test → Deploy
5. Add US4 (Touch) → Test → Deploy
6. Add US5 (Hierarchy) → Test → Deploy
7. Add US6 (Responsive) → Test → Deploy
8. Polish → Final validation

### Parallel Team Strategy

With multiple developers after Foundational phase:

- Developer A: US1 (Logo) + US5 (Hierarchy)
- Developer B: US2 (Consistency) + US4 (Touch)
- Developer C: US3 (Motion) + US6 (Responsive)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Each user story independently testable after implementation
- Commit after each task or logical group
- Stop at any checkpoint to validate
- TDD: Tests fail before implementation, pass after
- Total: 61 tasks across 9 phases
