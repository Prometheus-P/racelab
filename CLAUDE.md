# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KRace (경마/경륜/경정 통합 정보 플랫폼) - A unified web service providing real-time information for Korean horse racing, cycle racing, and boat racing. Built with Next.js 14 App Router, React 18, TypeScript, and Tailwind CSS.

## Commands

```bash
# Development
npm run dev                    # Start dev server (racelab.kr)

# Testing
npm run test                   # Run all Jest tests (UI + API)
npm run test:e2e               # Run Playwright E2E tests
npm run test:e2e:ui            # Interactive Playwright UI
npm run test:e2e:debug         # Debug E2E tests

# Build & Lint
npm run lint                   # ESLint validation
npm run build                  # Production build
```

### Running Single Tests

```bash
# Jest - single file
npx jest path/to/file.test.ts

# Jest - pattern match
npx jest --testNamePattern="test name pattern"

# Playwright - single file
npx playwright test e2e/tests/home.spec.ts

# Playwright - specific test
npx playwright test -g "test name"
```

## Architecture

### Data Flow

```
External APIs (KRA, KSPO) → lib/api.ts → lib/api-helpers/mappers.ts → API Routes → Components
```

### Key Directories

- `src/app/` - Next.js App Router pages and API routes
- `src/app/race/[id]/` - Race detail page
- `src/app/api/races/` - Race data endpoints
  - `horse/`, `cycle/`, `boat/` - Type-specific race lists
  - `[type]/[id]/entries/` - Race entries endpoint
  - `[type]/[id]/odds/` - Odds endpoint
  - `[type]/[id]/results/` - Results endpoint
- `src/components/` - React components (Header, Footer, TodayRaces, QuickStats)
- `src/lib/api.ts` - Data fetching functions
- `src/lib/api-helpers/mappers.ts` - API response transformers
- `src/lib/api-helpers/dummy.ts` - Mock data for development
- `src/lib/utils/` - Utility functions (apiResponse, date, ui)
- `src/types/index.ts` - TypeScript interfaces (Race, Entry, etc.)
- `e2e/` - Playwright E2E tests with page objects pattern
- `docs/` - Project documentation (business, technical, operations)

### API Response Pattern

```typescript
{
  success: boolean,
  data?: T[],
  error?: { code, message },
  timestamp: ISO string
}
```

### Testing Architecture

- **UI Tests** (`jest.config.ui.js`): jsdom environment for components
- **API Tests** (`jest.config.api.js`): node environment for routes
- **E2E Tests** (`playwright.config.ts`): Multi-browser including mobile

### Race Type Colors

- Horse (경마): `horse` color (#2d5a27 green)
- Cycle (경륜): `cycle` color (#dc2626 red)
- Boat (경정): `boat` color (#0369a1 blue)

## Team Conventions

### Git Workflow
- **No direct push to main/dev** - Always use feature branches + PR
- Feature branches: `NNN-feature-name` (e.g., `004-data-platform-phase1`)

### Spec-First Development
- All features start with spec documents as **source of truth**
- Specs location: `specs/NNN-feature-name/`
- Required artifacts: `spec.md`, `plan.md`, `tasks.md`

### Role-Based Structure
| Role | Directory | Responsibility |
|------|-----------|----------------|
| AI Worker | `src/ingestion/`, `src/workers/` | Data collection, parsing |
| Backend | `src/app/api/`, `src/lib/db/` | API routes, DB queries |
| Frontend | `src/app/`, `src/components/` | UI pages, components |

### Architecture Patterns
- **Backend**: Clean Architecture (router → service → repo)
- **Workers**: Parser/Strategy pattern (file type별 parser 분리)
- **Frontend**: `pages/app`, `components`, `hooks`, `lib/api`, `types`

### AI Output Policy
- AI results are **Preview-only** - human has final responsibility
- Audit log required for all AI-generated content
- Hash verification for data integrity
- Case-level data isolation

### Environment
- Single `.env` + `.env.example` provided
- Service-specific symlinks where needed

## Development Rules (TDD)

This project follows strict TDD discipline per `docs/TDD_RULES.md`:

1. **TDD Cycle**: Red → Green → Refactor (mandatory)
2. **Commit Separation**:
   - `chore(structure):` for structural changes (rename, move, reorganize)
   - `feat(behavior):` or `fix(behavior):` for behavioral changes
   - Never mix structure + behavior in same commit
3. **All tests must pass before committing**
4. **Functions should be 10-20 lines max, following SRP**

## Environment Variables

Required in `.env.local`:

- `KRA_API_KEY` - Korea Horse Racing Association API
- `KSPO_API_KEY` - National Sports Promotion Foundation API (cycle & boat)
- `NEXT_PUBLIC_SITE_URL` - Site URL for SEO

When API keys are missing, the app falls back to dummy data from `lib/api-helpers/dummy.ts`.

## Active Technologies
- TypeScript 5.9 + Node.js 20 LTS (004-data-platform-phase1)

- TypeScript 5.9 + Next.js 14.2 (App Router), React 18.3, Tailwind CSS 3.4 (001-race-results-history)
- N/A (external API data, cached via Next.js fetch caching) (001-race-results-history)
- TypeScript 5.9 + Next.js 14.2 (App Router), React 18.3, Tailwind CSS 3.4 + Tailwind CSS (styling), Pretendard (typography), existing M3 tokens in `src/styles/tokens.ts` (002-design-system)
- N/A (design system - no data persistence) (002-design-system)
- TypeScript 5.9.3 + Next.js 14.2.33, React 18.3.1, Tailwind CSS 3.4.0 (003-layout-dashboard-social)

## Recent Changes

- 001-race-results-history: Added TypeScript 5.9 + Next.js 14.2 (App Router), React 18.3, Tailwind CSS 3.4
