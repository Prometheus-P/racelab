# API Contracts: Race Results History

**Feature**: Race Results History
**Date**: 2025-12-02

## Base URL

```
/api/results
```

## Endpoints

### 1. GET /api/results

Retrieve paginated list of historical race results with optional filtering.

**Query Parameters**:

| Parameter | Type   | Required | Default          | Description                                   |
| --------- | ------ | -------- | ---------------- | --------------------------------------------- |
| dateFrom  | string | No       | Today            | Start date (YYYYMMDD)                         |
| dateTo    | string | No       | Same as dateFrom | End date (YYYYMMDD)                           |
| types     | string | No       | All              | Comma-separated race types (horse,cycle,boat) |
| track     | string | No       | All              | Track name filter                             |
| jockey    | string | No       | None             | Jockey/rider name search (min 2 chars)        |
| page      | number | No       | 1                | Page number (1-indexed)                       |
| limit     | number | No       | 20               | Results per page (max 100)                    |

**Request Example**:

```
GET /api/results?dateFrom=20241201&dateTo=20241202&types=horse,cycle&track=서울&page=1&limit=20
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "horse-1-5-20241202",
        "type": "horse",
        "raceNo": 5,
        "track": "서울",
        "date": "20241202",
        "startTime": "14:30",
        "distance": 1400,
        "grade": "국산3등급",
        "status": "finished",
        "results": [
          {
            "rank": 1,
            "entryNo": 3,
            "name": "승리마",
            "jockey": "김기수",
            "trainer": "박조교",
            "time": "1:24.5",
            "timeDiff": null
          },
          {
            "rank": 2,
            "entryNo": 7,
            "name": "희망마",
            "jockey": "이기수",
            "trainer": "최조교",
            "time": "1:24.8",
            "timeDiff": "1.5"
          }
        ],
        "dividends": [
          { "type": "win", "entries": [3], "amount": 4500 },
          { "type": "place", "entries": [3], "amount": 1800 },
          { "type": "place", "entries": [7], "amount": 2100 },
          { "type": "quinella", "entries": [3, 7], "amount": 8700 }
        ]
      }
    ],
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  },
  "timestamp": "2024-12-02T10:30:00.000Z"
}
```

**Error Responses**:

| Status | Code               | Description                             |
| ------ | ------------------ | --------------------------------------- |
| 400    | INVALID_DATE_RANGE | dateFrom > dateTo or date > 90 days ago |
| 400    | INVALID_PARAMS     | Invalid query parameter format          |
| 500    | SERVER_ERROR       | Internal server error                   |
| 502    | API_ERROR          | External API unavailable                |

```json
{
  "success": false,
  "error": {
    "code": "INVALID_DATE_RANGE",
    "message": "Date range exceeds 90 day limit"
  },
  "timestamp": "2024-12-02T10:30:00.000Z"
}
```

---

### 2. GET /api/results/[id]

Retrieve detailed information for a single historical race result.

**Path Parameters**:

| Parameter | Type   | Required | Description                                     |
| --------- | ------ | -------- | ----------------------------------------------- |
| id        | string | Yes      | Race ID (format: {type}-{meet}-{raceNo}-{date}) |

**Request Example**:

```
GET /api/results/horse-1-5-20241202
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "id": "horse-1-5-20241202",
    "type": "horse",
    "raceNo": 5,
    "track": "서울",
    "date": "20241202",
    "startTime": "14:30",
    "distance": 1400,
    "grade": "국산3등급",
    "status": "finished",
    "results": [
      {
        "rank": 1,
        "entryNo": 3,
        "name": "승리마",
        "jockey": "김기수",
        "trainer": "박조교",
        "time": "1:24.5",
        "timeDiff": null
      },
      {
        "rank": 2,
        "entryNo": 7,
        "name": "희망마",
        "jockey": "이기수",
        "trainer": "최조교",
        "time": "1:24.8",
        "timeDiff": "1.5"
      },
      {
        "rank": 3,
        "entryNo": 1,
        "name": "도전마",
        "jockey": "최기수",
        "trainer": "김조교",
        "time": "1:25.1",
        "timeDiff": "3.0"
      }
    ],
    "dividends": [
      { "type": "win", "entries": [3], "amount": 4500 },
      { "type": "place", "entries": [3], "amount": 1800 },
      { "type": "place", "entries": [7], "amount": 2100 },
      { "type": "place", "entries": [1], "amount": 3200 },
      { "type": "quinella", "entries": [3, 7], "amount": 8700 }
    ]
  },
  "timestamp": "2024-12-02T10:30:00.000Z"
}
```

**Error Responses**:

| Status | Code         | Description            |
| ------ | ------------ | ---------------------- |
| 400    | INVALID_ID   | Invalid race ID format |
| 404    | NOT_FOUND    | Race result not found  |
| 500    | SERVER_ERROR | Internal server error  |

---

## Response Format

All endpoints follow the standard KRace API response format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string; // ISO 8601 format
}
```

## Caching Headers

| Endpoint                       | Cache-Control | Notes     |
| ------------------------------ | ------------- | --------- |
| /api/results (today)           | max-age=300   | 5 minutes |
| /api/results (historical)      | max-age=86400 | 24 hours  |
| /api/results/[id] (today)      | max-age=300   | 5 minutes |
| /api/results/[id] (historical) | max-age=86400 | 24 hours  |

## Rate Limiting

Inherits from external API constraints:

- 1,000 calls/day aggregate limit
- Caching mitigates user-facing rate limits

## TypeScript Types

```typescript
// Request types
interface ResultsQueryParams {
  dateFrom?: string;
  dateTo?: string;
  types?: string;
  track?: string;
  jockey?: string;
  page?: string;
  limit?: string;
}

// Response types
interface PaginatedResultsResponse {
  items: HistoricalRace[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface SingleResultResponse {
  // HistoricalRace fields
}
```
