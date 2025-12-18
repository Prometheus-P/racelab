# Racelab B2B Data API - API Reference

## 1. Introduction

Welcome to the Racelab B2B Data API. This document provides technical specifications for developers looking to integrate our real-time and historical racing data into their applications.

Our API is built for performance, reliability, and ease of use, providing high-quality data for professional use cases, from analytics to automated betting systems.

**Supported Racing Types:**
- Horse Racing (경마)
- Cycle Racing (경륜)
- Boat Racing (경정)

---

## 2. Authentication

All requests to the B2B API (except `/api/v1/health`) must be authenticated using an API key.

### Obtaining an API Key

1. Register for a B2B account at the Racelab dashboard
2. Your API key will be generated with a unique prefix for identification
3. Store your API key securely - it cannot be recovered if lost

### Including Your API Key

Include the key in the `X-API-Key` header of every request:

```
X-API-Key: YOUR_API_KEY_HERE
```

Alternatively, use the Authorization header:

```
Authorization: Bearer YOUR_API_KEY_HERE
```

### Authentication Errors

| Status Code | Error Code | Description |
|-------------|------------|-------------|
| 401 | `UNAUTHORIZED` | No API key provided |
| 401 | `INVALID_KEY` | API key is invalid or unknown |
| 403 | `FORBIDDEN` | API key is suspended |
| 403 | `EXPIRED` | API key subscription has expired |
| 429 | `RATE_LIMITED` | Rate limit exceeded |

---

## 3. Rate Limiting

Rate limits are enforced per API key on a sliding window basis (1 minute window).

### Rate Limit Headers

All API responses include rate limit information in headers:

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests allowed per minute |
| `X-RateLimit-Remaining` | Remaining requests in current window |
| `X-RateLimit-Reset` | Unix timestamp when the limit resets |
| `X-Client-Tier` | Your current subscription tier |

### Handling Rate Limits

When rate limited, you'll receive a `429 Too Many Requests` response with a `Retry-After` header indicating seconds until retry.

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded. Try again in 45 seconds"
  },
  "timestamp": "2024-12-10T10:30:00.000Z"
}
```

---

## 4. API Endpoints

### Base URL

```
https://racelab.kr/api/v1
```

### 4.1. Health Check

Check API availability. No authentication required.

```
GET /api/v1/health
```

#### Response

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "v1",
    "timestamp": "2024-12-10T10:00:00.000Z",
    "service": "racelab-b2b-api"
  },
  "timestamp": "2024-12-10T10:00:00.000Z"
}
```

#### curl Example

```bash
curl -X GET "https://racelab.kr/api/v1/health"
```

---

### 4.2. Client Information

Get your tier information and permissions.

```
GET /api/v1/client/info
```

#### Response

```json
{
  "success": true,
  "data": {
    "clientId": "client_abc123",
    "tier": "Silver",
    "permissions": {
      "csv": true,
      "streaming": true,
      "realTimeIntervalSeconds": 30
    },
    "rateLimit": {
      "limit": 60,
      "remaining": 58,
      "resetInSeconds": 45
    },
    "features": {
      "oddsHistory": true,
      "raceSchedules": true,
      "entriesData": true,
      "csvExport": true,
      "streamingExport": true
    }
  },
  "timestamp": "2024-12-10T10:00:00.000Z"
}
```

#### curl Example

```bash
curl -X GET "https://racelab.kr/api/v1/client/info" \
     -H "X-API-Key: YOUR_API_KEY"
```

---

### 4.3. Usage Statistics

Get your API usage statistics.

```
GET /api/v1/client/usage
```

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `days` | number | 30 | Days to look back (1-90) |

#### Response

```json
{
  "success": true,
  "data": {
    "period": {
      "days": 30,
      "startDate": "2024-11-10",
      "endDate": "2024-12-10"
    },
    "summary": {
      "totalRequests": 15234,
      "successfulRequests": 15100,
      "errorRequests": 134,
      "successRate": "99.12%",
      "avgResponseTimeMs": 45,
      "totalDataTransferBytes": 125000000
    },
    "byEndpoint": [
      { "endpoint": "/api/v1/data/odds-history", "count": 8500 },
      { "endpoint": "/api/v1/data/races", "count": 6734 }
    ],
    "byDay": [
      { "day": "2024-12-09", "count": 520 },
      { "day": "2024-12-10", "count": 485 }
    ]
  },
  "timestamp": "2024-12-10T10:00:00.000Z"
}
```

#### curl Example

```bash
curl -X GET "https://racelab.kr/api/v1/client/usage?days=7" \
     -H "X-API-Key: YOUR_API_KEY"
```

---

### 4.4. Race Schedules

Get race schedules for a specific date.

```
GET /api/v1/data/races
```

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `date` | string | today | Date in YYYYMMDD format |
| `type` | string | all | Filter by race type: `horse`, `cycle`, `boat` |
| `status` | string | all | Filter by status: `upcoming`, `live`, `finished`, `canceled` |

#### Response

```json
{
  "success": true,
  "data": {
    "date": "2024-12-10",
    "filters": {
      "type": "horse",
      "status": "all"
    },
    "count": 48,
    "races": [
      {
        "race_id": "horse-seoul-3-20241210",
        "race_type": "horse",
        "track_id": 1,
        "race_no": 3,
        "race_date": "2024-12-10",
        "start_time": "11:30",
        "distance": 1200,
        "grade": "5등급",
        "status": "upcoming",
        "purse": 28000000,
        "conditions": "3세이상 국산",
        "weather": "맑음",
        "track_condition": "양호"
      }
    ]
  },
  "timestamp": "2024-12-10T10:00:00.000Z"
}
```

#### curl Examples

```bash
# Get today's horse races
curl -X GET "https://racelab.kr/api/v1/data/races?type=horse" \
     -H "X-API-Key: YOUR_API_KEY"

# Get specific date's finished races
curl -X GET "https://racelab.kr/api/v1/data/races?date=20241210&status=finished" \
     -H "X-API-Key: YOUR_API_KEY"
```

---

### 4.5. Odds History (Time Series)

Stream historical odds data for a specific race. Optimized for large datasets.

```
GET /api/v1/data/odds-history/{raceId}
```

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `raceId` | string | Race ID (e.g., `horse-seoul-3-20241210`) |

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `format` | string | `jsonl` | Output format: `json`, `jsonl`, `csv` |
| `startTime` | string | - | ISO 8601 timestamp filter |
| `endTime` | string | - | ISO 8601 timestamp filter |
| `entryNo` | number | - | Filter by specific entry |
| `limit` | number | tier-based | Max records (capped by tier) |

#### Tier Restrictions

| Tier | Formats | Max Records |
|------|---------|-------------|
| Bronze | `json` only | 1,000 |
| Silver | `json`, `jsonl`, `csv` | 10,000 |
| Gold | `json`, `jsonl`, `csv` | 100,000 |

#### Response Format: JSON

```json
{
  "success": true,
  "data": {
    "raceId": "horse-seoul-3-20241210",
    "totalRecords": 1500,
    "filters": {
      "startTime": null,
      "endTime": null,
      "entryNo": null,
      "limit": 10000
    },
    "records": [
      {
        "timestamp": "2024-12-10T10:00:00.000Z",
        "race_id": "horse-seoul-3-20241210",
        "entry_no": 1,
        "odds_win": 3.5,
        "odds_place": 1.8,
        "pool_total": 125000000,
        "pool_win": 85000000,
        "pool_place": 40000000,
        "popularity_rank": 2
      }
    ]
  },
  "timestamp": "2024-12-10T10:00:00.000Z"
}
```

#### Response Format: JSONL (Newline-Delimited JSON)

```
{"timestamp":"2024-12-10T10:00:00.000Z","race_id":"horse-seoul-3-20241210","entry_no":1,"odds_win":3.5,"odds_place":1.8,"pool_total":125000000,"pool_win":85000000,"pool_place":40000000,"popularity_rank":2}
{"timestamp":"2024-12-10T10:00:30.000Z","race_id":"horse-seoul-3-20241210","entry_no":1,"odds_win":3.4,"odds_place":1.7,"pool_total":126500000,"pool_win":86000000,"pool_place":40500000,"popularity_rank":2}
```

#### Response Format: CSV

```csv
timestamp,race_id,entry_no,odds_win,odds_place,pool_total,pool_win,pool_place,popularity_rank
2024-12-10T10:00:00.000Z,horse-seoul-3-20241210,1,3.5,1.8,125000000,85000000,40000000,2
2024-12-10T10:00:30.000Z,horse-seoul-3-20241210,1,3.4,1.7,126500000,86000000,40500000,2
```

#### curl Examples

```bash
# Get data as JSONL stream (Silver+ tier)
curl -X GET "https://racelab.kr/api/v1/data/odds-history/horse-seoul-3-20241210?format=jsonl" \
     -H "X-API-Key: YOUR_API_KEY"

# Get data as CSV file (Silver+ tier)
curl -X GET "https://racelab.kr/api/v1/data/odds-history/horse-seoul-3-20241210?format=csv" \
     -H "X-API-Key: YOUR_API_KEY" \
     -o odds_history.csv

# Filter by time range and entry
curl -X GET "https://racelab.kr/api/v1/data/odds-history/horse-seoul-3-20241210?format=json&startTime=2024-12-10T10:00:00Z&endTime=2024-12-10T12:00:00Z&entryNo=3" \
     -H "X-API-Key: YOUR_API_KEY"
```

---

## 5. Data Models

### FlatOddsRecord

Flat record format optimized for data analysis (Pandas-friendly).

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | string | ISO 8601 timestamp |
| `race_id` | string | Race identifier |
| `entry_no` | number | Entry/horse number |
| `odds_win` | number | Win odds |
| `odds_place` | number\|null | Place odds |
| `pool_total` | number\|null | Total betting pool |
| `pool_win` | number\|null | Win pool amount |
| `pool_place` | number\|null | Place pool amount |
| `popularity_rank` | number\|null | Popularity ranking |

### FlatRace

Flat race record format.

| Field | Type | Description |
|-------|------|-------------|
| `race_id` | string | Unique race identifier |
| `race_type` | string | `horse`, `cycle`, or `boat` |
| `track_id` | number | Track/venue ID |
| `race_no` | number | Race number |
| `race_date` | string | Date in YYYY-MM-DD format |
| `start_time` | string | Start time (HH:MM) |
| `distance` | number | Race distance in meters |
| `grade` | string\|null | Race grade/class |
| `status` | string | `upcoming`, `live`, `finished`, `canceled` |
| `purse` | number\|null | Prize money (KRW) |
| `conditions` | string\|null | Race conditions |
| `weather` | string\|null | Weather condition |
| `track_condition` | string\|null | Track/course condition |

---

## 6. Tiers & Pricing

| Feature | Bronze | Silver | Gold |
|---------|--------|--------|------|
| **Rate Limit** | 10/min | 60/min | Unlimited |
| **Data Update Interval** | 5 minutes | 30 seconds | Real-time |
| **JSON Format** | ✅ | ✅ | ✅ |
| **JSONL Streaming** | ❌ | ✅ | ✅ |
| **CSV Export** | ❌ | ✅ | ✅ |
| **Max Records/Request** | 1,000 | 10,000 | 100,000 |
| **Price** | $99/month | $499/month | $1,999/month |

### Upgrading Your Tier

To upgrade your tier or discuss enterprise pricing, contact [b2b-support@racelab.kr](mailto:b2b-support@racelab.kr).

---

## 7. Data Reliability

### Automated Failure Recovery

Our data ingestion pipeline includes automated recovery:

1. **Failure Logging**: Full context captured for every failure
2. **Exponential Backoff**: Retries at 1s → 2s → 4s → 8s → 16s intervals
3. **Max Retry Tracking**: Up to 5 retries before alerting
4. **Slack Notifications**: Engineering team alerted on persistent failures
5. **Data Integrity**: Re-runs until success, preventing data gaps

### TimescaleDB Time-Series Accuracy

Historical odds data is stored in TimescaleDB, a high-performance time-series database:

- **Hypertable Partitioning**: Automatic time-based partitioning
- **Continuous Aggregates**: Pre-computed 5-minute OHLC candles
- **Compression**: Data older than 30 days is compressed
- **Native Functions**: `time_bucket()`, `first_value()` for temporal analysis

**Benefits:**
- Chronological precision guaranteed
- Millisecond query response times over millions of records
- Reliable aggregate calculations at database level

---

## 8. Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error description"
  },
  "timestamp": "2024-12-10T10:00:00.000Z"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | No API key provided |
| `INVALID_KEY` | 401 | Invalid API key |
| `FORBIDDEN` | 403 | Account suspended |
| `EXPIRED` | 403 | Subscription expired |
| `FEATURE_DENIED` | 403 | Feature not available in your tier |
| `RATE_LIMITED` | 429 | Rate limit exceeded |
| `INVALID_DATE` | 400 | Invalid date format |
| `INVALID_FORMAT` | 400 | Invalid output format |
| `NO_DATA` | 404 | No data found for request |
| `INTERNAL_ERROR` | 500 | Server error |

---

## 9. Python Example

```python
import requests
import pandas as pd
from io import StringIO

API_KEY = "your_api_key"
BASE_URL = "https://racelab.kr/api/v1"

headers = {"X-API-Key": API_KEY}

# Get race schedules
response = requests.get(
    f"{BASE_URL}/data/races",
    headers=headers,
    params={"date": "20241210", "type": "horse"}
)
races = response.json()["data"]["races"]

# Get odds history as CSV and load into pandas
response = requests.get(
    f"{BASE_URL}/data/odds-history/horse-seoul-3-20241210",
    headers=headers,
    params={"format": "csv"},
    stream=True
)

df = pd.read_csv(StringIO(response.text))
print(df.head())
print(f"Total records: {len(df)}")
```

---

## 10. Support

- **Technical Support**: [b2b-support@racelab.kr](mailto:b2b-support@racelab.kr)
- **API Status**: [status.racelab.kr](https://status.racelab.kr)
- **Documentation Updates**: Check this document for the latest API changes

### Response Times

- Bronze tier: Best effort support
- Silver tier: 24-hour response time
- Gold tier: 4-hour response time with dedicated support channel
