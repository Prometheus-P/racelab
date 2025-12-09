# Research: Race Results History

**Feature**: Race Results History
**Date**: 2025-12-02
**Status**: Complete

## Research Topics

### 1. Historical Data Availability via Public APIs

**Decision**: Use existing KRA API299 and extend KSPO APIs for historical queries

**Rationale**:

- KRA API299 (`/API299/Race_Result_total`) already returns completed race results with finishing data
- KSPO APIs support `rc_date` parameter for querying specific dates
- Same endpoints work for both current and historical data by changing the date parameter
- No separate "history" endpoints required

**Alternatives Considered**:

- Separate historical APIs: Not available in public data portal
- Database storage: Unnecessary complexity; caching suffices for 90-day window

**Key Findings**:

- KRA API299 returns: meet, rcDate, rcNo, ord (rank), hrName, hrNo, jkName, rcTime (record)
- KSPO Cycle/Boat APIs return similar structure with racer_nm, back_no, etc.
- Rate limit: 1,000 calls/day shared across all endpoints

### 2. Caching Strategy for Historical Queries

**Decision**: Use Next.js ISR with extended revalidation for historical data

**Rationale**:

- Historical results are immutable once finalized
- Longer cache times (24 hours) reduce API calls significantly
- Today's results use shorter cache (5 minutes) as they may still be updating

**Implementation**:

```typescript
// Historical data (>1 day old): cache 24 hours
{
  next: {
    revalidate: 86400;
  }
}

// Today's data: cache 5 minutes
{
  next: {
    revalidate: 300;
  }
}
```

**Rate Limit Considerations**:

- 90-day history × 3 race types × ~12 races/day = ~3,240 unique queries possible
- With 24-hour cache: ~135 calls/day for full history coverage
- Well within 1,000 call/day limit with margin for user requests

### 3. Filtering Architecture

**Decision**: Server-side filtering via API query parameters

**Rationale**:

- External APIs already support date filtering via `rc_date`
- Race type filtering handled by calling appropriate API (horse/cycle/boat)
- Track filtering applied post-fetch as APIs return all tracks per type
- Reduces client-side data transfer

**Implementation Approach**:

```typescript
// Query params for /api/results
interface ResultsQueryParams {
  dateFrom?: string; // YYYYMMDD
  dateTo?: string; // YYYYMMDD
  types?: string; // horse,cycle,boat (comma-separated)
  track?: string; // Seoul, Busan, etc.
  jockey?: string; // Partial match search
  page?: number; // Pagination
  limit?: number; // Results per page (default 20)
}
```

**Filter Flow**:

1. Date range → multiple API calls (one per date)
2. Type filter → call only relevant APIs
3. Track filter → post-process to filter by venue
4. Jockey search → post-process entry data

### 4. Jockey/Rider Search Implementation

**Decision**: Client-side partial match search on cached results

**Rationale**:

- External APIs don't support name-based search
- Search operates on already-fetched results
- Korean name matching requires simple substring check
- No complex search index needed for 90-day window

**Implementation**:

```typescript
// Filter entries containing search term
results.filter((race) =>
  race.entries.some(
    (entry) => entry.jockey?.includes(searchTerm) || entry.name?.includes(searchTerm)
  )
);
```

**Search UX**:

- Minimum 2 characters to trigger search
- Debounce 300ms to avoid excessive filtering
- Highlight matched names in results

### 5. Dividend/Payout Data

**Decision**: Extend existing result types to include dividend information

**Rationale**:

- KRA API returns dividend data in race results
- Structure aligns with existing `RaceResult` type pattern
- Display win (단승), place (복승), quinella (쌍승) payouts

**Data Structure**:

```typescript
interface Dividend {
  type: 'win' | 'place' | 'quinella';
  combination: number[]; // Entry numbers involved
  amount: number; // Payout in KRW
}

interface HistoricalRaceResult {
  raceId: string;
  finishers: RaceResultEntry[];
  dividends: Dividend[];
  recordTime?: string;
}
```

### 6. URL State Management

**Decision**: Use Next.js searchParams for filter persistence

**Rationale**:

- Native Next.js App Router support
- Enables shareable URLs with filters applied
- Supports browser back/forward navigation
- No additional state management library needed

**URL Format**:

```
/results?dateFrom=20241201&dateTo=20241202&types=horse,cycle&track=Seoul&page=1
```

### 7. Pagination Strategy

**Decision**: Offset-based pagination with URL state

**Rationale**:

- Simple implementation aligns with constitution's simplicity principle
- Historical data is stable (no new items appearing mid-page)
- Cursor-based pagination unnecessary for this use case

**Implementation**:

- Default 20 results per page
- Total count displayed for user context
- Page number in URL for shareability

## Technical Constraints Confirmed

| Constraint                  | Value           | Source                  |
| --------------------------- | --------------- | ----------------------- |
| API Rate Limit              | 1,000 calls/day | KSPO/KRA public portal  |
| History Window              | 90 days         | Spec requirement        |
| Cache Duration (historical) | 24 hours        | Research decision       |
| Cache Duration (today)      | 5 minutes       | Research decision       |
| Page Size                   | 20 results      | Spec requirement FR-009 |
| Search Min Chars            | 2               | UX best practice        |

## Dependencies

| Component              | Exists | Status                              |
| ---------------------- | ------ | ----------------------------------- |
| KRA API299 integration | Yes    | Ready (in lib/api.ts)               |
| KSPO API integration   | Yes    | Ready (in lib/api.ts)               |
| Race/Entry types       | Yes    | Ready (in types/index.ts)           |
| Mapper functions       | Yes    | Ready (in mappers.ts)               |
| Date utilities         | Yes    | Ready (in lib/utils/date.ts)        |
| API response helpers   | Yes    | Ready (in lib/utils/apiResponse.ts) |

## Open Questions (Resolved)

1. **Q**: Do external APIs support date range queries?
   **A**: No, must query one date at a time. Implementation will loop through date range.

2. **Q**: Is dividend data available via current APIs?
   **A**: KRA API299 includes result data. KSPO requires checking specific result endpoints.

3. **Q**: How to handle timezone for date queries?
   **A**: Use KST (Korea Standard Time) as all race data is KST-based.
