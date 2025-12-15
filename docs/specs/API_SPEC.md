---
title: KRace B2B API 명세서
version: 2.0.0
status: Production
owner: '@Prometheus-P'
created: 2025-11-25
updated: 2025-12-15
language: Korean (한국어)
---

# KRace B2B API - 한국 공영경주 데이터 API

> **실시간 경마, 경륜, 경정 데이터를 제공하는 B2B API 서비스입니다.**

---

## 🚀 Quick Start

```bash
# 1. API 호출 테스트
curl -H "X-API-Key: YOUR_API_KEY" \
  "https://racelab.kr/api/races/horse?date=20251215"

# 2. Bearer 토큰 방식
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://racelab.kr/api/races/horse?date=20251215"
```

---

## 📋 목차

1. [인증 (Authentication)](#1-인증-authentication)
2. [Rate Limiting](#2-rate-limiting)
3. [API 엔드포인트](#3-api-엔드포인트)
4. [응답 형식](#4-응답-형식)
5. [에러 코드](#5-에러-코드)
6. [가격 정책](#6-가격-정책)

---

## 1. 인증 (Authentication)

### 1.1 API Key 발급

API Key는 계약 체결 후 발급됩니다. 문의: api@racelab.kr

### 1.2 인증 방법

두 가지 방식 모두 지원합니다:

**방법 1: X-API-Key 헤더 (권장)**

```http
GET /api/races/horse HTTP/1.1
Host: racelab.kr
X-API-Key: your_api_key_here
```

**방법 2: Bearer Token**

```http
GET /api/races/horse HTTP/1.1
Host: racelab.kr
Authorization: Bearer your_api_key_here
```

### 1.3 인증 실패 응답

**401 Unauthorized - API Key 누락**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "API key required. Provide via X-API-Key header or Authorization: Bearer token"
  },
  "timestamp": "2025-12-15T10:00:00.000Z"
}
```

**401 Unauthorized - 잘못된 API Key**

```json
{
  "success": false,
  "error": {
    "code": "INVALID_KEY",
    "message": "Invalid API key"
  },
  "timestamp": "2025-12-15T10:00:00.000Z"
}
```

---

## 2. Rate Limiting

### 2.1 제한 정책

| 플랜 | 요청 제한 | 설명 |
|------|-----------|------|
| Basic | 100 req/min | 테스트 및 소규모 서비스 |
| Pro | 1,000 req/min | 중규모 서비스 |
| Enterprise | Unlimited | 대규모 서비스 (협의) |

### 2.2 Rate Limit 헤더

모든 응답에 포함됩니다:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1734242460
```

| 헤더 | 설명 |
|------|------|
| `X-RateLimit-Limit` | 분당 최대 요청 수 |
| `X-RateLimit-Remaining` | 남은 요청 수 |
| `X-RateLimit-Reset` | 제한 리셋 시간 (Unix timestamp) |

### 2.3 Rate Limit 초과 응답

**429 Too Many Requests**

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Rate limit exceeded. Try again in 45 seconds"
  },
  "timestamp": "2025-12-15T10:00:00.000Z"
}
```

응답 헤더에 `Retry-After: 60` 포함됩니다.

---

## 3. API 엔드포인트

### 3.1 기본 정보

| 항목 | 값 |
|------|-----|
| **Base URL** | `https://racelab.kr/api` |
| **프로토콜** | HTTPS only |
| **형식** | JSON |
| **인코딩** | UTF-8 |

### 3.2 엔드포인트 목록

| 엔드포인트 | 메서드 | 설명 | 갱신 주기 |
|------------|--------|------|----------|
| `/races/horse` | GET | 경마 경주 목록 | 30초 |
| `/races/cycle` | GET | 경륜 경주 목록 | 30초 |
| `/races/boat` | GET | 경정 경주 목록 | 30초 |
| `/races/{type}/{id}/entries` | GET | 출주표 | 60초 |
| `/races/{type}/{id}/odds` | GET | 배당률 | 30초 |
| `/races/{type}/{id}/results` | GET | 경주 결과 | 60초 |

### 3.3 경주 목록 API

**GET /api/races/{type}**

```bash
curl -H "X-API-Key: YOUR_KEY" \
  "https://racelab.kr/api/races/horse?date=20251215"
```

**파라미터**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `type` | path | Yes | `horse`, `cycle`, `boat` |
| `date` | query | No | 조회 날짜 (YYYYMMDD), 기본값: 오늘 |

**응답 예시**

```json
{
  "success": true,
  "data": [
    {
      "id": "horse-20251215-seoul-1",
      "type": "horse",
      "track": "서울",
      "raceNo": 1,
      "date": "2025-12-15",
      "postTime": "10:30",
      "distance": 1200,
      "status": "scheduled",
      "entries": [
        {
          "no": 1,
          "name": "번개왕",
          "jockey": "김철수",
          "odds": 3.5
        }
      ]
    }
  ],
  "timestamp": "2025-12-15T10:00:00.000Z"
}
```

### 3.4 출주표 API

**GET /api/races/{type}/{id}/entries**

```bash
curl -H "X-API-Key: YOUR_KEY" \
  "https://racelab.kr/api/races/horse/horse-20251215-seoul-1/entries"
```

### 3.5 배당률 API

**GET /api/races/{type}/{id}/odds**

```bash
curl -H "X-API-Key: YOUR_KEY" \
  "https://racelab.kr/api/races/horse/horse-20251215-seoul-1/odds"
```

### 3.6 경주 결과 API

**GET /api/races/{type}/{id}/results**

```bash
curl -H "X-API-Key: YOUR_KEY" \
  "https://racelab.kr/api/races/horse/horse-20251215-seoul-1/results"
```

---

## 4. 응답 형식

### 4.1 성공 응답

```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  timestamp: string; // ISO 8601
}
```

### 4.2 에러 응답

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
  timestamp: string;
}
```

### 4.3 데이터 타입

```typescript
// 경주 정보
interface Race {
  id: string;
  type: 'horse' | 'cycle' | 'boat';
  track: string;
  raceNo: number;
  date: string;
  postTime?: string;
  distance: number;
  status: 'scheduled' | 'in_progress' | 'finished' | 'cancelled';
  entries: Entry[];
}

// 출주마/선수 정보
interface Entry {
  no: number;
  name: string;
  jockey?: string;
  trainer?: string;
  weight?: number;
  odds?: number;
}

// 배당률 정보
interface Odds {
  win: OddsEntry[];
  place?: OddsEntry[];
  quinella?: QuinellaOdds[];
  updatedAt: string;
}

// 경주 결과
interface RaceResult {
  rank: number;
  no: number;
  name: string;
  time?: string;
  odds?: number;
  payout?: number;
}
```

---

## 5. 에러 코드

| HTTP | 코드 | 설명 | 조치 |
|------|------|------|------|
| 401 | `UNAUTHORIZED` | API Key 누락 | API Key 헤더 추가 |
| 401 | `INVALID_KEY` | 잘못된 API Key | API Key 확인 |
| 404 | `NOT_FOUND` | 리소스 없음 | ID 확인 |
| 429 | `RATE_LIMITED` | 요청 한도 초과 | Retry-After 후 재시도 |
| 500 | `SERVER_ERROR` | 서버 오류 | 지원팀 문의 |

---

## 6. 가격 정책

| 플랜 | 월 요금 | 요청 제한 | SLA | 지원 |
|------|---------|-----------|-----|------|
| **Basic** | ₩99,000 | 100 req/min | 99.0% | Email |
| **Pro** | ₩299,000 | 1,000 req/min | 99.5% | Email + Slack |
| **Enterprise** | 협의 | Unlimited | 99.9% | 전담 지원 |

### 6.1 무료 체험

- 14일 무료 체험 (Basic 플랜)
- 신용카드 등록 불필요
- 문의: api@racelab.kr

---

## 📞 지원

- **이메일**: api@racelab.kr
- **문서**: https://racelab.kr/docs
- **상태 페이지**: https://status.racelab.kr

---

_마지막 업데이트: 2025-12-15_
