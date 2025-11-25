---
title: KRace API 명세서
version: 1.0.0
status: Approved
owner: "@Prometheus-P"
created: 2025-11-25
updated: 2025-11-25
reviewers: []
language: Korean (한국어)
---

# API_SPEC.md - API 명세서

> **이 문서는 KRace의 내부 API 명세를 정의합니다.**
> OpenAPI 3.0 스펙을 기반으로 작성되었습니다.

---

## 변경 이력 (Changelog)

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2025-11-25 | @Prometheus-P | 최초 작성 |

## 관련 문서 (Related Documents)

- [ARCHITECTURE.md](./ARCHITECTURE.md) - 시스템 아키텍처
- [DATA_MODEL.md](./DATA_MODEL.md) - 데이터 모델
- [BACKEND_DESIGN.md](./BACKEND_DESIGN.md) - 백엔드 설계

---

## 📋 목차

1. [API 개요](#1-api-개요)
2. [공통 규격](#2-공통-규격)
3. [경주 목록 API](#3-경주-목록-api)
4. [경주 상세 API](#4-경주-상세-api)
5. [에러 처리](#5-에러-처리)
6. [OpenAPI 스펙](#6-openapi-스펙)

---

## 1. API 개요

### 1.1 기본 정보

| 항목 | 값 |
|------|-----|
| **Base URL** | `/api` |
| **버전** | v1 (URL에 미포함) |
| **프로토콜** | HTTPS |
| **인증** | 없음 (공개 API) |
| **형식** | JSON |

### 1.2 API 목록

| 엔드포인트 | 메서드 | 설명 |
|-----------|--------|------|
| `/api/races/horse` | GET | 경마 경주 목록 |
| `/api/races/cycle` | GET | 경륜 경주 목록 |
| `/api/races/boat` | GET | 경정 경주 목록 |
| `/api/races/{type}/{id}/entries` | GET | 출주표 |
| `/api/races/{type}/{id}/odds` | GET | 배당률 |
| `/api/races/{type}/{id}/results` | GET | 경주 결과 |

---

## 2. 공통 규격

### 2.1 요청 헤더

```http
Accept: application/json
Content-Type: application/json
```

### 2.2 응답 형식

**성공 응답**

```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    timestamp: string;    // ISO 8601
    cached: boolean;      // 캐시 여부
    revalidateAt?: string; // 다음 갱신 시간
  };
}
```

**에러 응답**

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;         // 에러 코드
    message: string;      // 사용자 친화적 메시지
    details?: unknown;    // 상세 정보 (개발용)
  };
}
```

### 2.3 공통 파라미터

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `date` | string | No | 조회 날짜 (YYYY-MM-DD), 기본값: 오늘 |

### 2.4 HTTP 상태 코드

| 코드 | 설명 | 사용 상황 |
|------|------|----------|
| 200 | OK | 성공 |
| 400 | Bad Request | 잘못된 파라미터 |
| 404 | Not Found | 리소스 없음 |
| 429 | Too Many Requests | Rate Limit 초과 |
| 500 | Internal Server Error | 서버 오류 |
| 502 | Bad Gateway | 외부 API 오류 |
| 503 | Service Unavailable | 서비스 일시 중단 |

### 2.5 Rate Limiting

```
┌─────────────────────────────────────────────────────────────┐
│  ⚡ Rate Limiting                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  제한: 100 requests / minute / IP                           │
│                                                             │
│  응답 헤더:                                                  │
│  • X-RateLimit-Limit: 100                                   │
│  • X-RateLimit-Remaining: 95                                │
│  • X-RateLimit-Reset: 1732520400                            │
│                                                             │
│  초과 시 응답:                                               │
│  HTTP 429 Too Many Requests                                 │
│  {                                                          │
│    "success": false,                                        │
│    "error": {                                               │
│      "code": "RATE_LIMIT_EXCEEDED",                         │
│      "message": "요청 한도를 초과했습니다. 잠시 후 시도하세요" │
│    }                                                        │
│  }                                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 경주 목록 API

### 3.1 GET /api/races/horse

경마 경주 목록을 조회합니다.

**요청**

```http
GET /api/races/horse?date=2025-11-25
```

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `date` | string | No | 조회 날짜 (YYYY-MM-DD) |

**응답 (200 OK)**

```json
{
  "success": true,
  "data": [
    {
      "id": "horse-20251125-seoul-1",
      "type": "horse",
      "raceNumber": 1,
      "venue": "서울",
      "startTime": "2025-11-25T10:30:00+09:00",
      "status": "scheduled",
      "distance": 1200,
      "class": "3등급",
      "entries": 12,
      "prize": "15,000,000원"
    },
    {
      "id": "horse-20251125-seoul-2",
      "raceNumber": 2,
      "venue": "서울",
      "startTime": "2025-11-25T11:05:00+09:00",
      "status": "in_progress",
      "distance": 1400,
      "class": "4등급",
      "entries": 10,
      "prize": "12,000,000원"
    }
  ],
  "meta": {
    "timestamp": "2025-11-25T10:00:00+09:00",
    "cached": true,
    "revalidateAt": "2025-11-25T10:00:30+09:00"
  }
}
```

**응답 타입**

```typescript
interface Race {
  id: string;              // 고유 ID
  type: 'horse' | 'cycle' | 'boat';
  raceNumber: number;      // 경주 번호
  venue: string;           // 경주장
  startTime: string;       // 출발 시간 (ISO 8601)
  status: RaceStatus;      // 경주 상태
  distance: number;        // 거리 (m)
  class?: string;          // 등급
  entries: number;         // 출주 수
  prize?: string;          // 상금
}

type RaceStatus = 'scheduled' | 'in_progress' | 'finished' | 'cancelled';
```

### 3.2 GET /api/races/cycle

경륜 경주 목록을 조회합니다. (경마와 동일한 형식)

### 3.3 GET /api/races/boat

경정 경주 목록을 조회합니다. (경마와 동일한 형식)

---

## 4. 경주 상세 API

### 4.1 GET /api/races/{type}/{id}/entries

특정 경주의 출주표를 조회합니다.

**요청**

```http
GET /api/races/horse/horse-20251125-seoul-1/entries
```

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `type` | string | Yes | 경주 유형 (horse, cycle, boat) |
| `id` | string | Yes | 경주 ID |

**응답 (200 OK)**

```json
{
  "success": true,
  "data": {
    "raceId": "horse-20251125-seoul-1",
    "entries": [
      {
        "number": 1,
        "name": "번개왕",
        "age": 4,
        "weight": 54,
        "jockey": {
          "name": "김철수",
          "weight": 52
        },
        "trainer": "박영희",
        "owner": "삼성레이싱",
        "recentResults": ["1", "3", "2", "1", "4"],
        "winRate": 25.5
      },
      {
        "number": 2,
        "name": "태풍호",
        "age": 5,
        "weight": 56,
        "jockey": {
          "name": "이영희",
          "weight": 54
        },
        "trainer": "정민수",
        "owner": "현대마주단",
        "recentResults": ["2", "1", "1", "3", "2"],
        "winRate": 30.2
      }
    ]
  },
  "meta": {
    "timestamp": "2025-11-25T10:00:00+09:00",
    "cached": true
  }
}
```

**응답 타입**

```typescript
interface EntriesResponse {
  raceId: string;
  entries: Entry[];
}

interface Entry {
  number: number;           // 출주 번호
  name: string;             // 마명/선수명
  age?: number;             // 나이
  weight: number;           // 마체중/선수 체중
  jockey?: {                // 기수 정보 (경마)
    name: string;
    weight: number;
  };
  trainer?: string;         // 조교사
  owner?: string;           // 마주
  recentResults?: string[]; // 최근 5경주 결과
  winRate?: number;         // 승률 (%)
}
```

### 4.2 GET /api/races/{type}/{id}/odds

특정 경주의 배당률을 조회합니다.

**요청**

```http
GET /api/races/horse/horse-20251125-seoul-1/odds
```

**응답 (200 OK)**

```json
{
  "success": true,
  "data": {
    "raceId": "horse-20251125-seoul-1",
    "updatedAt": "2025-11-25T10:25:30+09:00",
    "odds": [
      {
        "number": 1,
        "name": "번개왕",
        "win": 3.5,
        "place": 1.8,
        "winChange": "up",
        "placeChange": "same"
      },
      {
        "number": 2,
        "name": "태풍호",
        "win": 2.8,
        "place": 1.5,
        "winChange": "down",
        "placeChange": "down"
      }
    ],
    "quinella": [
      {
        "combination": [1, 2],
        "odds": 5.2
      },
      {
        "combination": [1, 3],
        "odds": 12.5
      }
    ]
  },
  "meta": {
    "timestamp": "2025-11-25T10:25:30+09:00",
    "cached": false
  }
}
```

**응답 타입**

```typescript
interface OddsResponse {
  raceId: string;
  updatedAt: string;        // 마지막 갱신 시간
  odds: EntryOdds[];        // 출주마별 배당률
  quinella?: QuinellaOdds[]; // 쌍승 배당률
}

interface EntryOdds {
  number: number;           // 출주 번호
  name: string;             // 마명/선수명
  win: number | null;       // 단승 배당
  place: number | null;     // 복승 배당
  winChange?: 'up' | 'down' | 'same';   // 변화
  placeChange?: 'up' | 'down' | 'same';
}

interface QuinellaOdds {
  combination: [number, number];  // 조합
  odds: number;                   // 배당률
}
```

### 4.3 GET /api/races/{type}/{id}/results

특정 경주의 결과를 조회합니다.

**요청**

```http
GET /api/races/horse/horse-20251125-seoul-1/results
```

**응답 (200 OK) - 경주 종료 후**

```json
{
  "success": true,
  "data": {
    "raceId": "horse-20251125-seoul-1",
    "status": "finished",
    "finishedAt": "2025-11-25T10:32:15+09:00",
    "results": [
      {
        "rank": 1,
        "number": 2,
        "name": "태풍호",
        "time": "1:12.5",
        "margin": "-"
      },
      {
        "rank": 2,
        "number": 1,
        "name": "번개왕",
        "time": "1:12.8",
        "margin": "1.5마신"
      },
      {
        "rank": 3,
        "number": 5,
        "name": "질풍호",
        "time": "1:13.1",
        "margin": "2마신"
      }
    ],
    "payouts": {
      "win": {
        "number": 2,
        "payout": 2800
      },
      "place": [
        { "number": 2, "payout": 1500 },
        { "number": 1, "payout": 1800 }
      ],
      "quinella": {
        "combination": [1, 2],
        "payout": 5200
      }
    }
  },
  "meta": {
    "timestamp": "2025-11-25T10:35:00+09:00",
    "cached": true
  }
}
```

**응답 (200 OK) - 경주 진행 전/중**

```json
{
  "success": true,
  "data": {
    "raceId": "horse-20251125-seoul-1",
    "status": "in_progress",
    "message": "경주가 진행 중입니다. 결과는 종료 후 확인 가능합니다."
  }
}
```

**응답 타입**

```typescript
interface ResultsResponse {
  raceId: string;
  status: 'scheduled' | 'in_progress' | 'finished' | 'cancelled';
  finishedAt?: string;      // 종료 시간
  message?: string;         // 상태 메시지
  results?: RaceResult[];   // 착순 결과
  payouts?: Payouts;        // 배당금
}

interface RaceResult {
  rank: number;             // 순위
  number: number;           // 출주 번호
  name: string;             // 마명/선수명
  time?: string;            // 기록
  margin?: string;          // 착차
}

interface Payouts {
  win?: {
    number: number;
    payout: number;         // 단승 배당금 (100원 기준)
  };
  place?: Array<{
    number: number;
    payout: number;         // 복승 배당금
  }>;
  quinella?: {
    combination: [number, number];
    payout: number;         // 쌍승 배당금
  };
}
```

---

## 5. 에러 처리

### 5.1 에러 코드 목록

| 코드 | HTTP | 설명 |
|------|------|------|
| `INVALID_PARAMETER` | 400 | 잘못된 파라미터 |
| `INVALID_DATE_FORMAT` | 400 | 잘못된 날짜 형식 |
| `INVALID_RACE_TYPE` | 400 | 잘못된 경주 유형 |
| `RACE_NOT_FOUND` | 404 | 경주를 찾을 수 없음 |
| `RATE_LIMIT_EXCEEDED` | 429 | 요청 한도 초과 |
| `INTERNAL_ERROR` | 500 | 서버 내부 오류 |
| `EXTERNAL_API_ERROR` | 502 | 외부 API 오류 |
| `SERVICE_UNAVAILABLE` | 503 | 서비스 일시 중단 |

### 5.2 에러 응답 예시

**400 Bad Request**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_DATE_FORMAT",
    "message": "날짜 형식이 올바르지 않습니다. YYYY-MM-DD 형식을 사용하세요.",
    "details": {
      "received": "25-11-2025",
      "expected": "YYYY-MM-DD"
    }
  }
}
```

**404 Not Found**

```json
{
  "success": false,
  "error": {
    "code": "RACE_NOT_FOUND",
    "message": "해당 경주를 찾을 수 없습니다.",
    "details": {
      "raceId": "horse-20251125-seoul-99"
    }
  }
}
```

**502 Bad Gateway**

```json
{
  "success": false,
  "error": {
    "code": "EXTERNAL_API_ERROR",
    "message": "외부 데이터 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요."
  }
}
```

### 5.3 에러 처리 권장 사항

```typescript
// 클라이언트 에러 처리 예시
async function fetchRaces(type: string, date: string) {
  try {
    const response = await fetch(`/api/races/${type}?date=${date}`);
    const data = await response.json();

    if (!data.success) {
      // 에러 처리
      switch (data.error.code) {
        case 'RACE_NOT_FOUND':
          // 경주 없음 UI 표시
          return { races: [], message: '오늘 예정된 경주가 없습니다.' };
        case 'RATE_LIMIT_EXCEEDED':
          // 재시도 로직
          await delay(60000); // 1분 대기
          return fetchRaces(type, date);
        default:
          throw new Error(data.error.message);
      }
    }

    return data.data;
  } catch (error) {
    // 네트워크 에러 등 처리
    console.error('API 호출 실패:', error);
    throw error;
  }
}
```

---

## 6. OpenAPI 스펙

### 6.1 OpenAPI 3.0 YAML

```yaml
openapi: 3.0.3
info:
  title: KRace API
  description: 한국 공영경주 정보 API
  version: 1.0.0
  contact:
    name: KRace Team
    url: https://github.com/Prometheus-P/racelab

servers:
  - url: https://krace.co.kr/api
    description: Production
  - url: http://localhost:3000/api
    description: Development

paths:
  /races/{type}:
    get:
      summary: 경주 목록 조회
      description: 특정 종목의 경주 목록을 조회합니다.
      tags:
        - Races
      parameters:
        - name: type
          in: path
          required: true
          schema:
            type: string
            enum: [horse, cycle, boat]
          description: 경주 유형
        - name: date
          in: query
          required: false
          schema:
            type: string
            format: date
          description: 조회 날짜 (YYYY-MM-DD)
      responses:
        '200':
          description: 성공
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/RaceListResponse'
        '400':
          $ref: '#/components/responses/BadRequest'

  /races/{type}/{id}/entries:
    get:
      summary: 출주표 조회
      tags:
        - Race Details
      parameters:
        - $ref: '#/components/parameters/RaceType'
        - $ref: '#/components/parameters/RaceId'
      responses:
        '200':
          description: 성공
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/EntriesResponse'
        '404':
          $ref: '#/components/responses/NotFound'

  /races/{type}/{id}/odds:
    get:
      summary: 배당률 조회
      tags:
        - Race Details
      parameters:
        - $ref: '#/components/parameters/RaceType'
        - $ref: '#/components/parameters/RaceId'
      responses:
        '200':
          description: 성공
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OddsResponse'

  /races/{type}/{id}/results:
    get:
      summary: 경주 결과 조회
      tags:
        - Race Details
      parameters:
        - $ref: '#/components/parameters/RaceType'
        - $ref: '#/components/parameters/RaceId'
      responses:
        '200':
          description: 성공
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ResultsResponse'

components:
  parameters:
    RaceType:
      name: type
      in: path
      required: true
      schema:
        type: string
        enum: [horse, cycle, boat]
    RaceId:
      name: id
      in: path
      required: true
      schema:
        type: string

  schemas:
    Race:
      type: object
      properties:
        id:
          type: string
        type:
          type: string
          enum: [horse, cycle, boat]
        raceNumber:
          type: integer
        venue:
          type: string
        startTime:
          type: string
          format: date-time
        status:
          type: string
          enum: [scheduled, in_progress, finished, cancelled]
        distance:
          type: integer
        entries:
          type: integer

    RaceListResponse:
      type: object
      properties:
        success:
          type: boolean
        data:
          type: array
          items:
            $ref: '#/components/schemas/Race'

    EntriesResponse:
      type: object
      properties:
        success:
          type: boolean
        data:
          type: object
          properties:
            raceId:
              type: string
            entries:
              type: array
              items:
                $ref: '#/components/schemas/Entry'

    Entry:
      type: object
      properties:
        number:
          type: integer
        name:
          type: string
        weight:
          type: number
        jockey:
          type: object
          properties:
            name:
              type: string
            weight:
              type: number

    OddsResponse:
      type: object
      properties:
        success:
          type: boolean
        data:
          type: object
          properties:
            raceId:
              type: string
            updatedAt:
              type: string
              format: date-time
            odds:
              type: array
              items:
                $ref: '#/components/schemas/EntryOdds'

    EntryOdds:
      type: object
      properties:
        number:
          type: integer
        name:
          type: string
        win:
          type: number
          nullable: true
        place:
          type: number
          nullable: true

    ResultsResponse:
      type: object
      properties:
        success:
          type: boolean
        data:
          type: object
          properties:
            raceId:
              type: string
            status:
              type: string
            results:
              type: array
              items:
                $ref: '#/components/schemas/RaceResult'

    RaceResult:
      type: object
      properties:
        rank:
          type: integer
        number:
          type: integer
        name:
          type: string
        time:
          type: string

    Error:
      type: object
      properties:
        success:
          type: boolean
          example: false
        error:
          type: object
          properties:
            code:
              type: string
            message:
              type: string

  responses:
    BadRequest:
      description: 잘못된 요청
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    NotFound:
      description: 리소스 없음
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
```

---

## 📋 부록

### A. 캐싱 정책

| 엔드포인트 | Cache-Control | ISR revalidate |
|-----------|---------------|----------------|
| `/races/{type}` | public, max-age=30 | 30초 |
| `/{id}/entries` | public, max-age=60 | 60초 |
| `/{id}/odds` | no-cache | - |
| `/{id}/results` | public, max-age=300 | 5분 |

### B. 외부 API 매핑

| KRace 필드 | KSPO 필드 | 변환 |
|-----------|-----------|------|
| `id` | `rcNo` + `rcDate` | 조합 |
| `venue` | `trkNm` | 직접 |
| `startTime` | `rcTime` | ISO 8601 변환 |
| `status` | `rcStat` | 코드 매핑 |

---

*이 문서는 API 변경 시 업데이트됩니다.*
