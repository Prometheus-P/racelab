# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KRace (경마/경륜/경정 통합 정보 플랫폼) - A unified web service providing real-time information for Korean horse racing, cycle racing, and boat racing. Built with Next.js 14 App Router, React 18, TypeScript, and Tailwind CSS.

## Commands

```bash
# Development
npm run dev                    # Start dev server (localhost:3000)

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
- TypeScript 5.9 + Next.js 14.2 (App Router), React 18.3, Tailwind CSS 3.4 (001-race-results-history)
- N/A (external API data, cached via Next.js fetch caching) (001-race-results-history)

## Recent Changes
- 001-race-results-history: Added TypeScript 5.9 + Next.js 14.2 (App Router), React 18.3, Tailwind CSS 3.4
