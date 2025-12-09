# Quickstart: Race Results History

**Feature**: Race Results History
**Date**: 2025-12-02

## Overview

This feature adds a historical race results page where users can search, filter, and view past race results for horse, cycle, and boat racing.

## Prerequisites

- Node.js 18.17+
- npm 9.0+
- KRA_API_KEY and KSPO_API_KEY in `.env.local` (optional - uses dummy data if not set)

## Quick Start

```bash
# 1. Ensure you're on the feature branch
git checkout 001-race-results-history

# 2. Install dependencies (if not done)
npm install

# 3. Start development server
npm run dev

# 4. Open browser
open https://racelab.kr/results
```

## Feature Pages

| Route                                        | Description                              |
| -------------------------------------------- | ---------------------------------------- |
| `/results`                                   | Main results history page with filtering |
| `/results?dateFrom=20241201&dateTo=20241202` | Results for specific date range          |
| `/results?types=horse`                       | Horse racing results only                |
| `/results?track=서울`                        | Seoul track results only                 |
| `/results?jockey=김`                         | Results featuring jockeys matching "김"  |

## API Endpoints

| Method | Endpoint            | Description               |
| ------ | ------------------- | ------------------------- |
| GET    | `/api/results`      | Paginated results list    |
| GET    | `/api/results/[id]` | Single race result detail |

### Example API Calls

```bash
# Get today's results
curl https://racelab.kr/api/results

# Get results for date range
curl "https://racelab.kr/api/results?dateFrom=20241201&dateTo=20241202"

# Get horse racing results with pagination
curl "https://racelab.kr/api/results?types=horse&page=1&limit=20"

# Get single race result
curl https://racelab.kr/api/results/horse-1-5-20241202
```

## Testing

```bash
# Run all tests
npm run test

# Run specific test file
npx jest src/app/results/page.test.tsx

# Run API route tests
npx jest src/app/api/results

# Run E2E tests
npm run test:e2e

# Run specific E2E test
npx playwright test e2e/tests/results.spec.ts
```

## Development Workflow

1. **TDD Cycle** (Required):

   ```bash
   # 1. Write failing test
   npm run test -- --watch

   # 2. Implement minimum code to pass
   # 3. Refactor while keeping tests green
   ```

2. **Commit Convention**:

   ```bash
   # Structure changes only
   git commit -m "chore(structure): extract ResultCard component"

   # Behavior changes only
   git commit -m "feat(behavior): add date filter to results page"
   ```

## Key Files

### New Files (to be created)

| File                                | Purpose                |
| ----------------------------------- | ---------------------- |
| `src/app/results/page.tsx`          | Results page component |
| `src/app/api/results/route.ts`      | Results list API       |
| `src/app/api/results/[id]/route.ts` | Result detail API      |
| `src/components/ResultCard.tsx`     | Result card component  |
| `src/components/ResultFilters.tsx`  | Filter controls        |
| `src/components/ResultSearch.tsx`   | Name search input      |

### Modified Files

| File                             | Changes                             |
| -------------------------------- | ----------------------------------- |
| `src/types/index.ts`             | Add HistoricalRace, Dividend types  |
| `src/lib/api.ts`                 | Add fetchHistoricalResults function |
| `src/lib/api-helpers/mappers.ts` | Add result history mappers          |
| `src/lib/api-helpers/dummy.ts`   | Add dummy historical data           |
| `src/components/Header.tsx`      | Add results link to navigation      |

## Component Hierarchy

```
ResultsPage
├── Header (existing)
├── ResultFilters
│   ├── DateRangePicker
│   ├── RaceTypeFilter
│   └── TrackFilter
├── ResultSearch
├── ResultsList
│   └── ResultCard (×n)
│       └── ResultDetail (expandable)
├── Pagination
└── Footer (existing)
```

## Configuration

### Environment Variables

No new environment variables required. Uses existing:

- `KRA_API_KEY` - Korea Horse Racing Association API
- `KSPO_API_KEY` - National Sports Promotion Foundation API

### Tailwind Classes

Uses existing race type color classes:

- `text-horse` / `bg-horse` - Green (#2d5a27)
- `text-cycle` / `bg-cycle` - Red (#dc2626)
- `text-boat` / `bg-boat` - Blue (#0369a1)

## Validation Checklist

After implementation, verify:

- [ ] Results page loads at `/results`
- [ ] Date filter works (single date and range)
- [ ] Race type filter works (multi-select)
- [ ] Track filter shows appropriate options per race type
- [ ] Jockey/rider search returns matching results
- [ ] Pagination works correctly
- [ ] URL reflects filter state (shareable)
- [ ] Mobile layout is touch-friendly
- [ ] Race type colors are correct
- [ ] API caching headers are set correctly
- [ ] All tests pass (`npm run test && npm run test:e2e`)

## Troubleshooting

### No results displayed

- Check if API keys are set in `.env.local`
- Verify date range is within 90 days
- Check browser console for API errors

### Slow loading

- External APIs may be slow; caching should mitigate
- Check network tab for API response times

### Filter not working

- Ensure URL params are updating
- Check component state management
