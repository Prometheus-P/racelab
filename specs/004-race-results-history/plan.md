# Implementation Plan: Race Results History

**Branch**: `001-race-results-history` | **Date**: 2025-12-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-race-results-history/spec.md`

## Summary

Enable users to search and view historical race results for horse, cycle, and boat racing with filtering by date range, race type, track location, and jockey/rider name search. Display finishing positions, times, and dividend payouts. Implementation leverages existing KRA/KSPO public APIs with the same endpoints used for live data but querying past dates.

## Technical Context

**Language/Version**: TypeScript 5.9
**Primary Dependencies**: Next.js 14.2 (App Router), React 18.3, Tailwind CSS 3.4
**Storage**: N/A (external API data, cached via Next.js fetch caching)
**Testing**: Jest 30 (UI + API), Playwright 1.56 (E2E)
**Target Platform**: Web (mobile-first responsive, desktop supported)
**Project Type**: Web application (Next.js monolith)
**Performance Goals**: Initial load <2s, filter/search <1s response
**Constraints**: API rate limit 1,000 calls/day (requires caching), 90-day history window
**Scale/Scope**: Single new page (/results), 3-5 new API routes, 5-8 new components

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                            | Status  | Evidence/Notes                                                            |
| ------------------------------------ | ------- | ------------------------------------------------------------------------- |
| I. TDD (NON-NEGOTIABLE)              | ✅ PASS | Tasks will follow Red-Green-Refactor; tests written before implementation |
| II. Structural-Behavioral Separation | ✅ PASS | Commits will separate structure from behavior per convention              |
| III. Simplicity First                | ✅ PASS | Direct API calls with caching; no complex patterns needed                 |
| IV. Clear Data Flow                  | ✅ PASS | External APIs → lib/api.ts → mappers → API Routes → Components            |
| V. Mobile-First Design               | ✅ PASS | Mobile viewport primary, race type colors enforced                        |

**Gate Result**: PASSED - All constitution principles satisfied. No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/001-race-results-history/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API schemas)
├── checklists/          # Quality checklists
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── results/                    # NEW: Results history page
│   │   └── page.tsx                # Main results page with filters
│   └── api/
│       └── results/                # NEW: Results API routes
│           ├── route.ts            # GET /api/results (paginated list)
│           └── [id]/
│               └── route.ts        # GET /api/results/[id] (single result detail)
├── components/
│   ├── ResultCard.tsx              # NEW: Race result summary card
│   ├── ResultDetail.tsx            # NEW: Expanded result view
│   ├── ResultFilters.tsx           # NEW: Filter controls (date, type, track)
│   ├── ResultSearch.tsx            # NEW: Jockey/rider name search
│   └── ResultsTable.tsx            # EXISTING: May extend for history view
├── lib/
│   ├── api.ts                      # EXTEND: Add historical results fetching
│   └── api-helpers/
│       ├── mappers.ts              # EXTEND: Add result history mappers
│       └── dummy.ts                # EXTEND: Add dummy historical data
└── types/
    └── index.ts                    # EXTEND: Add HistoricalRace, SearchParams types

e2e/
├── pages/
│   └── results.page.ts             # NEW: Results page object
└── tests/
    └── results.spec.ts             # NEW: Results E2E tests
```

**Structure Decision**: Follows existing Next.js App Router pattern. New `/results` page route and `/api/results` API routes. Components follow existing naming conventions. Extends existing lib/api.ts and types rather than creating new files.

## Complexity Tracking

> No violations requiring justification. Implementation uses established patterns.

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| N/A       | N/A        | N/A                                  |
