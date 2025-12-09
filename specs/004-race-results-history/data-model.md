# Data Model: Race Results History

**Feature**: Race Results History
**Date**: 2025-12-02

## Entity Overview

```
┌─────────────────┐     ┌──────────────────────┐
│ HistoricalRace  │────<│ HistoricalRaceResult │
└─────────────────┘     └──────────────────────┘
        │                         │
        │                         │
        ▼                         ▼
┌─────────────────┐     ┌──────────────────────┐
│     Track       │     │      Dividend        │
└─────────────────┘     └──────────────────────┘
```

## Entities

### HistoricalRace

Represents a completed race with full result data. Extends existing `Race` type with historical context.

| Field     | Type                     | Required | Description                                                 |
| --------- | ------------------------ | -------- | ----------------------------------------------------------- |
| id        | string                   | Yes      | Unique identifier (format: `{type}-{meet}-{raceNo}-{date}`) |
| type      | RaceType                 | Yes      | 'horse' \| 'cycle' \| 'boat'                                |
| raceNo    | number                   | Yes      | Race number for the day                                     |
| track     | string                   | Yes      | Track name (서울, 부산경남, 제주, 광명, 창원, 미사리)       |
| date      | string                   | Yes      | Race date (YYYYMMDD)                                        |
| startTime | string                   | Yes      | Scheduled start time (HH:mm)                                |
| distance  | number                   | No       | Race distance in meters                                     |
| grade     | string                   | No       | Race grade/class                                            |
| status    | 'finished' \| 'canceled' | Yes      | Race completion status                                      |
| results   | HistoricalRaceResult[]   | Yes      | Ordered list of finishers                                   |
| dividends | Dividend[]               | Yes      | Payout information                                          |

**Validation Rules**:

- `id` must match pattern: `(horse|cycle|boat)-\d+-\d+-\d{8}`
- `date` must be within 90-day window from today
- `results` must be ordered by finishing position (1st, 2nd, ...)
- `status` is 'finished' if results exist, 'canceled' otherwise

### HistoricalRaceResult

A single participant's finishing result in a historical race.

| Field    | Type   | Required   | Description                              |
| -------- | ------ | ---------- | ---------------------------------------- |
| rank     | number | Yes        | Finishing position (1, 2, 3, ...)        |
| entryNo  | number | Yes        | Entry/participant number                 |
| name     | string | Yes        | Horse name or rider/athlete name         |
| jockey   | string | Horse only | Jockey name (horse racing)               |
| trainer  | string | Horse only | Trainer name (horse racing)              |
| time     | string | No         | Finishing time/record                    |
| timeDiff | string | No         | Time behind winner (e.g., "1.5", "머리") |

**Validation Rules**:

- `rank` must be positive integer ≥ 1
- `entryNo` must be positive integer
- `jockey` and `trainer` required only when race type is 'horse'
- `time` format varies by race type

### Dividend

Payout information for a specific bet type.

| Field   | Type         | Required | Description                    |
| ------- | ------------ | -------- | ------------------------------ |
| type    | DividendType | Yes      | 'win' \| 'place' \| 'quinella' |
| entries | number[]     | Yes      | Entry numbers involved         |
| amount  | number       | Yes      | Payout amount in KRW           |

**Validation Rules**:

- `type` determines expected `entries` count:
  - 'win': 1 entry
  - 'place': 1-3 entries (depending on field size)
  - 'quinella': 2 entries
- `amount` must be positive integer

### Track

Track/venue information. Uses existing track codes from CLAUDE.md.

| Field    | Type     | Required | Description          |
| -------- | -------- | -------- | -------------------- |
| code     | string   | Yes      | Track code (1, 2, 3) |
| name     | string   | Yes      | Korean display name  |
| raceType | RaceType | Yes      | Applicable race type |

**Static Data**:

| Race Type | Code | Name     |
| --------- | ---- | -------- |
| horse     | 1    | 서울     |
| horse     | 2    | 부산경남 |
| horse     | 3    | 제주     |
| cycle     | 1    | 광명     |
| cycle     | 2    | 창원     |
| cycle     | 3    | 부산     |
| boat      | 1    | 미사리   |

### SearchParams

Query parameters for results filtering and pagination.

| Field    | Type       | Required | Default | Description              |
| -------- | ---------- | -------- | ------- | ------------------------ |
| dateFrom | string     | No       | Today   | Start date (YYYYMMDD)    |
| dateTo   | string     | No       | Today   | End date (YYYYMMDD)      |
| types    | RaceType[] | No       | All     | Race types to include    |
| track    | string     | No       | All     | Track name filter        |
| jockey   | string     | No       | None    | Jockey/rider name search |
| page     | number     | No       | 1       | Page number              |
| limit    | number     | No       | 20      | Results per page         |

**Validation Rules**:

- `dateFrom` must be within 90 days of today
- `dateTo` must be ≥ `dateFrom`
- `page` must be positive integer ≥ 1
- `limit` must be 1-100

## Type Definitions

```typescript
// New types to add to src/types/index.ts

export type DividendType = 'win' | 'place' | 'quinella';

export interface Dividend {
  type: DividendType;
  entries: number[];
  amount: number;
}

export interface HistoricalRaceResult {
  rank: number;
  entryNo: number;
  name: string;
  jockey?: string;
  trainer?: string;
  time?: string;
  timeDiff?: string;
}

export interface HistoricalRace {
  id: string;
  type: RaceType;
  raceNo: number;
  track: string;
  date: string;
  startTime: string;
  distance?: number;
  grade?: string;
  status: 'finished' | 'canceled';
  results: HistoricalRaceResult[];
  dividends: Dividend[];
}

export interface ResultsSearchParams {
  dateFrom?: string;
  dateTo?: string;
  types?: RaceType[];
  track?: string;
  jockey?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResults<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

## Relationship to Existing Types

| Existing Type | Relationship                    | Notes                                        |
| ------------- | ------------------------------- | -------------------------------------------- |
| Race          | Extended by HistoricalRace      | HistoricalRace adds date, results, dividends |
| RaceResult    | Similar to HistoricalRaceResult | New type for historical context              |
| Entry         | Used in HistoricalRaceResult    | Maps entry data to result data               |
| RaceType      | Reused                          | 'horse' \| 'cycle' \| 'boat'                 |

## State Transitions

### Race Status

```
upcoming → live → finished
                ↘ canceled
```

Historical races are always in terminal state ('finished' or 'canceled').

### Filter State (Client)

```
initial → loading → loaded
              ↘ error → retry → loading
```

## Data Source Mapping

### KRA API299 → HistoricalRace

| API Field | Entity Field            |
| --------- | ----------------------- |
| meet      | track (mapped via code) |
| rcDate    | date                    |
| rcNo      | raceNo                  |
| schStTime | startTime               |
| rank      | grade                   |
| ord       | results[].rank          |
| hrName    | results[].name          |
| chulNo    | results[].entryNo       |
| jkName    | results[].jockey        |
| rcTime    | results[].time          |

### KSPO APIs → HistoricalRace

| API Field | Entity Field      |
| --------- | ----------------- |
| meet_nm   | track             |
| race_no   | raceNo            |
| back_no   | results[].entryNo |
| racer_nm  | results[].name    |
