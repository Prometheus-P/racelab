---
title: KRace 백엔드 설계
version: 1.0.0
status: Approved
owner: "@Prometheus-P"
created: 2025-11-25
updated: 2025-11-25
reviewers: []
language: Korean (한국어)
---

# BACKEND_DESIGN.md - 백엔드 설계

> **이 문서는 KRace 백엔드 API Routes의 설계와 구현 가이드를 제공합니다.**
> Next.js API Routes 기반의 서버리스 백엔드 아키텍처를 다룹니다.

---

## 변경 이력 (Changelog)

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|----------|
| 1.0.0 | 2025-11-25 | @Prometheus-P | 최초 작성 |

## 관련 문서 (Related Documents)

- [ARCHITECTURE.md](./ARCHITECTURE.md) - 시스템 아키텍처
- [API_SPEC.md](./API_SPEC.md) - API 명세
- [DATA_MODEL.md](./DATA_MODEL.md) - 데이터 모델

---

## 📋 목차

1. [백엔드 아키텍처](#1-백엔드-아키텍처)
2. [API Routes 구조](#2-api-routes-구조)
3. [외부 API 통합](#3-외부-api-통합)
4. [캐싱 전략](#4-캐싱-전략)
5. [에러 처리](#5-에러-처리)
6. [보안](#6-보안)
7. [테스트](#7-테스트)

---

## 1. 백엔드 아키텍처

### 1.1 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────┐
│  🔧 KRace 백엔드 아키텍처                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐                                        │
│  │   Client        │                                        │
│  │   (Browser)     │                                        │
│  └────────┬────────┘                                        │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐     ┌─────────────────┐               │
│  │   API Routes    │────▶│   API Helpers   │               │
│  │   (Handlers)    │     │   (Services)    │               │
│  └────────┬────────┘     └────────┬────────┘               │
│           │                       │                         │
│           │              ┌────────┴────────┐               │
│           │              │                 │                │
│           ▼              ▼                 ▼                │
│  ┌─────────────────┐ ┌───────────┐ ┌───────────┐           │
│  │   ISR Cache     │ │ KSPO API  │ │  KRA API  │           │
│  │   (Vercel)      │ │           │ │           │           │
│  └─────────────────┘ └───────────┘ └───────────┘           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 설계 원칙

| 원칙 | 설명 | 적용 |
|------|------|------|
| **단일 책임** | 각 API Route는 하나의 책임 | 경주 목록, 배당률 분리 |
| **Stateless** | 서버 상태 없음 | 모든 상태는 외부에 |
| **Proxy Pattern** | 외부 API 프록시 | 데이터 변환, 캐싱 |
| **Fail Fast** | 빠른 실패 | 타임아웃, 검증 |

### 1.3 레이어 구조

```
API Routes Layer (src/app/api/)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│ 역할: HTTP 요청 처리, 응답 포맷팅
│ 파일: route.ts
│
▼
API Helpers Layer (src/lib/api-helpers/)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│ 역할: 외부 API 호출, 데이터 변환
│ 파일: kspoClient.ts, mappers.ts
│
▼
Types Layer (src/types/)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│ 역할: 타입 정의, 검증
│ 파일: index.ts
```

---

## 2. API Routes 구조

### 2.1 디렉토리 구조

```
src/app/api/
├── races/
│   ├── horse/
│   │   └── route.ts            # GET /api/races/horse
│   ├── cycle/
│   │   └── route.ts            # GET /api/races/cycle
│   ├── boat/
│   │   └── route.ts            # GET /api/races/boat
│   └── [type]/
│       └── [id]/
│           ├── entries/
│           │   └── route.ts    # GET /api/races/{type}/{id}/entries
│           ├── odds/
│           │   └── route.ts    # GET /api/races/{type}/{id}/odds
│           └── results/
│               └── route.ts    # GET /api/races/{type}/{id}/results
```

### 2.2 Route Handler 패턴

```typescript
// src/app/api/races/horse/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getRaces } from '@/lib/api-helpers/kspoClient';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/apiResponse';
import { isValidDate } from '@/lib/utils/date';

/**
 * GET /api/races/horse
 * @description 경마 경주 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    // 1. 파라미터 추출 및 검증
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || getTodayString();

    if (!isValidDate(date)) {
      return NextResponse.json(
        createErrorResponse('INVALID_DATE_FORMAT', '날짜 형식이 올바르지 않습니다.'),
        { status: 400 }
      );
    }

    // 2. 비즈니스 로직 실행
    const races = await getRaces('horse', date);

    // 3. 응답 반환
    return NextResponse.json(
      createSuccessResponse(races),
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=59',
        },
      }
    );
  } catch (error) {
    console.error('[API] GET /api/races/horse 에러:', error);

    // 외부 API 에러 처리
    if (error instanceof ExternalAPIError) {
      return NextResponse.json(
        createErrorResponse('EXTERNAL_API_ERROR', '데이터를 불러올 수 없습니다.'),
        { status: 502 }
      );
    }

    // 기타 에러
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '서버 오류가 발생했습니다.'),
      { status: 500 }
    );
  }
}

// 캐시 설정 (ISR)
export const revalidate = 30;
```

### 2.3 응답 헬퍼 함수

```typescript
// src/lib/utils/apiResponse.ts

interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    timestamp: string;
    cached: boolean;
  };
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * 성공 응답 생성
 */
export function createSuccessResponse<T>(
  data: T,
  cached: boolean = false
): SuccessResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      cached,
    },
  };
}

/**
 * 에러 응답 생성
 */
export function createErrorResponse(
  code: string,
  message: string,
  details?: unknown
): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };
}
```

---

## 3. 외부 API 통합

### 3.1 API 클라이언트 구조

```typescript
// src/lib/api-helpers/kspoClient.ts

import { mapKSPORace, mapKSPOEntry, mapKSPOOdds } from './mappers';
import type { Race, Entry, EntryOdds, RaceType } from '@/types';

// 환경 변수
const KSPO_API_KEY = process.env.KSPO_API_KEY;
const KSPO_BASE_URL = 'https://api.data.go.kr/openapi/tn_pubr_public';

// 타임아웃 설정
const TIMEOUT_MS = 5000;

/**
 * KSPO API 호출 기본 함수
 */
async function fetchKSPO<T>(
  endpoint: string,
  params: Record<string, string>
): Promise<T> {
  const url = new URL(`${KSPO_BASE_URL}/${endpoint}`);
  url.searchParams.set('serviceKey', KSPO_API_KEY!);
  url.searchParams.set('type', 'json');

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new ExternalAPIError(
        `KSPO API 응답 오류: ${response.status}`,
        response.status
      );
    }

    const data = await response.json();

    // KSPO API 에러 응답 처리
    if (data.response?.header?.resultCode !== '00') {
      throw new ExternalAPIError(
        data.response?.header?.resultMsg || 'API 오류',
        500
      );
    }

    return data.response.body.items as T;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ExternalAPIError) {
      throw error;
    }

    if (error.name === 'AbortError') {
      throw new ExternalAPIError('API 타임아웃', 504);
    }

    throw new ExternalAPIError('API 호출 실패', 500);
  }
}

/**
 * 경주 목록 조회
 */
export async function getRaces(
  type: RaceType,
  date: string
): Promise<Race[]> {
  // 경마는 별도 API (KRA) 사용
  if (type === 'horse') {
    return getHorseRaces(date);
  }

  const endpoint = type === 'cycle' ? 'cycle_race_info' : 'boat_race_info';

  const rawData = await fetchKSPO<KSPORaceResponse[]>(endpoint, {
    rcDate: date.replace(/-/g, ''),
  });

  return rawData.map((item) => mapKSPORace(item, type));
}

/**
 * 출주표 조회
 */
export async function getEntries(
  type: RaceType,
  raceId: string
): Promise<Entry[]> {
  const { date, venue, raceNumber } = parseRaceId(raceId);

  const endpoint = type === 'horse'
    ? 'horse_entry_info'
    : `${type}_entry_info`;

  const rawData = await fetchKSPO<KSPOEntryResponse[]>(endpoint, {
    rcDate: date,
    trkCd: venue,
    rcNo: raceNumber.toString(),
  });

  return rawData.map(mapKSPOEntry);
}

/**
 * 배당률 조회
 */
export async function getOdds(
  type: RaceType,
  raceId: string
): Promise<{ odds: EntryOdds[]; updatedAt: string }> {
  const { date, venue, raceNumber } = parseRaceId(raceId);

  const endpoint = type === 'horse'
    ? 'horse_odds_info'
    : `${type}_odds_info`;

  const rawData = await fetchKSPO<KSPOOddsResponse[]>(endpoint, {
    rcDate: date,
    trkCd: venue,
    rcNo: raceNumber.toString(),
  });

  return {
    odds: rawData.map((item) => mapKSPOOdds(item, item.playerNm || '')),
    updatedAt: new Date().toISOString(),
  };
}
```

### 3.2 커스텀 에러 클래스

```typescript
// src/lib/errors.ts

/**
 * 외부 API 에러
 */
export class ExternalAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ExternalAPIError';
  }
}

/**
 * 검증 에러
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * 리소스 없음 에러
 */
export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource}를 찾을 수 없습니다: ${id}`);
    this.name = 'NotFoundError';
  }
}
```

### 3.3 데이터 매퍼

```typescript
// src/lib/api-helpers/mappers.ts

import type {
  Race,
  Entry,
  EntryOdds,
  RaceType,
  RaceStatus,
} from '@/types';
import type {
  KSPORaceResponse,
  KSPOEntryResponse,
  KSPOOddsResponse,
} from './kspoTypes';

/**
 * KSPO 경주 데이터 → 내부 Race 타입
 */
export function mapKSPORace(
  raw: KSPORaceResponse,
  type: RaceType
): Race {
  return {
    id: generateRaceId(type, raw.rcDate, raw.trkCd, raw.rcNo),
    type,
    raceNumber: parseInt(raw.rcNo, 10),
    venue: raw.trkNm,
    venueCode: mapVenueCode(raw.trkCd),
    startTime: formatStartTime(raw.rcDate, raw.rcTime),
    status: mapRaceStatus(raw.rcStat),
    distance: parseInt(raw.rcDist, 10),
    entries: parseInt(raw.entCnt, 10),
    class: raw.rcGrd || undefined,
    prize: raw.rcPrize || undefined,
  };
}

/**
 * KSPO 출주 데이터 → 내부 Entry 타입
 */
export function mapKSPOEntry(raw: KSPOEntryResponse): Entry {
  return {
    number: parseInt(raw.entNo, 10),
    name: raw.playerNm,
    weight: parseFloat(raw.playerWgt),
    grade: raw.playerGrd,
    recentResults: filterValidResults([
      raw.rcRslt1,
      raw.rcRslt2,
      raw.rcRslt3,
      raw.rcRslt4,
      raw.rcRslt5,
    ]),
    winRate: parseFloatSafe(raw.winRate),
  };
}

/**
 * KSPO 배당률 데이터 → 내부 EntryOdds 타입
 */
export function mapKSPOOdds(
  raw: KSPOOddsResponse,
  name: string
): EntryOdds {
  return {
    number: parseInt(raw.entNo, 10),
    name,
    win: parseOddsValue(raw.oddsDansng),
    place: parseOddsValue(raw.oddsBoksng),
  };
}

// ─────────────────────────────────────────────────────────────
// 헬퍼 함수
// ─────────────────────────────────────────────────────────────

function generateRaceId(
  type: RaceType,
  date: string,
  venueCode: string,
  raceNo: string
): string {
  const venue = mapVenueCode(venueCode);
  return `${type}-${date}-${venue}-${raceNo}`;
}

function mapVenueCode(code: string): string {
  const venueMap: Record<string, string> = {
    '01': 'changwon',
    '02': 'gwangmyeong',
    '03': 'misari',
    'S': 'seoul',
    'B': 'busan',
    'J': 'jeju',
  };
  return venueMap[code] || code.toLowerCase();
}

function mapRaceStatus(code: string): RaceStatus {
  const statusMap: Record<string, RaceStatus> = {
    '0': 'scheduled',
    '1': 'in_progress',
    '2': 'finished',
    '9': 'cancelled',
  };
  return statusMap[code] || 'scheduled';
}

function formatStartTime(date: string, time: string): string {
  const year = date.substring(0, 4);
  const month = date.substring(4, 6);
  const day = date.substring(6, 8);
  const hour = time.substring(0, 2);
  const minute = time.substring(2, 4);

  return `${year}-${month}-${day}T${hour}:${minute}:00+09:00`;
}

function parseOddsValue(value: string | null | undefined): number | null {
  if (!value || value === '' || value === '-') return null;
  const parsed = parseFloat(value);
  return isNaN(parsed) || parsed < 1.0 ? null : parsed;
}

function parseFloatSafe(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

function filterValidResults(results: (string | null | undefined)[]): string[] {
  return results.filter((r): r is string => !!r && r !== '-');
}
```

---

## 4. 캐싱 전략

### 4.1 캐싱 레이어

```
┌─────────────────────────────────────────────────────────────┐
│  💾 캐싱 전략                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Layer 1: HTTP Cache-Control                                │
│  ─────────────────────────────────────────────              │
│  • s-maxage: CDN 캐시 시간                                  │
│  • stale-while-revalidate: 백그라운드 갱신                  │
│                                                             │
│  Layer 2: Next.js ISR                                       │
│  ─────────────────────────────────────────────              │
│  • revalidate: 재검증 주기                                  │
│  • 정적 생성 + 점진적 갱신                                   │
│                                                             │
│  Layer 3: In-Memory Cache (선택)                            │
│  ─────────────────────────────────────────────              │
│  • 빈번한 동일 요청 처리                                    │
│  • 서버리스 환경에서는 제한적                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 엔드포인트별 캐싱

| 엔드포인트 | s-maxage | revalidate | 이유 |
|-----------|----------|------------|------|
| `/races/{type}` | 30s | 30s | 잦은 갱신 필요 |
| `/{id}/entries` | 60s | 60s | 상대적으로 안정 |
| `/{id}/odds` | 0 (no-cache) | - | 실시간 데이터 |
| `/{id}/results` | 300s | 300s | 확정 후 변경 없음 |

### 4.3 Cache-Control 헤더 설정

```typescript
// 캐시 헤더 유틸리티
function getCacheHeaders(type: 'races' | 'entries' | 'odds' | 'results') {
  const cacheConfig = {
    races: 'public, s-maxage=30, stale-while-revalidate=59',
    entries: 'public, s-maxage=60, stale-while-revalidate=119',
    odds: 'no-cache, no-store, must-revalidate',
    results: 'public, s-maxage=300, stale-while-revalidate=599',
  };

  return {
    'Cache-Control': cacheConfig[type],
    'CDN-Cache-Control': cacheConfig[type],
  };
}

// 사용 예시
return NextResponse.json(data, {
  headers: getCacheHeaders('races'),
});
```

---

## 5. 에러 처리

### 5.1 에러 처리 전략

```typescript
// src/app/api/races/[type]/[id]/odds/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getOdds } from '@/lib/api-helpers/kspoClient';
import {
  createSuccessResponse,
  createErrorResponse,
} from '@/lib/utils/apiResponse';
import {
  ExternalAPIError,
  ValidationError,
  NotFoundError,
} from '@/lib/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string; id: string } }
) {
  try {
    // 1. 파라미터 검증
    const { type, id } = params;

    if (!isValidRaceType(type)) {
      throw new ValidationError('올바르지 않은 경주 유형입니다.', 'type');
    }

    if (!isValidRaceId(id)) {
      throw new ValidationError('올바르지 않은 경주 ID입니다.', 'id');
    }

    // 2. 비즈니스 로직
    const odds = await getOdds(type, id);

    // 3. 성공 응답
    return NextResponse.json(
      createSuccessResponse({
        raceId: id,
        ...odds,
      }),
      {
        headers: getCacheHeaders('odds'),
      }
    );

  } catch (error) {
    // 에러 로깅
    console.error(`[API] GET /api/races/${params.type}/${params.id}/odds:`, error);

    // 에러 유형별 처리
    if (error instanceof ValidationError) {
      return NextResponse.json(
        createErrorResponse('INVALID_PARAMETER', error.message, {
          field: error.field,
        }),
        { status: 400 }
      );
    }

    if (error instanceof NotFoundError) {
      return NextResponse.json(
        createErrorResponse('RACE_NOT_FOUND', error.message),
        { status: 404 }
      );
    }

    if (error instanceof ExternalAPIError) {
      return NextResponse.json(
        createErrorResponse(
          'EXTERNAL_API_ERROR',
          '외부 데이터 서비스에 일시적인 문제가 발생했습니다.'
        ),
        { status: error.statusCode >= 500 ? 502 : 503 }
      );
    }

    // 예상치 못한 에러
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', '서버 오류가 발생했습니다.'),
      { status: 500 }
    );
  }
}
```

### 5.2 에러 코드 정의

```typescript
// src/lib/errors/errorCodes.ts

export const ERROR_CODES = {
  // 클라이언트 에러 (4xx)
  INVALID_PARAMETER: {
    status: 400,
    message: '잘못된 요청 파라미터입니다.',
  },
  INVALID_DATE_FORMAT: {
    status: 400,
    message: '날짜 형식이 올바르지 않습니다. YYYY-MM-DD 형식을 사용하세요.',
  },
  INVALID_RACE_TYPE: {
    status: 400,
    message: '올바르지 않은 경주 유형입니다.',
  },
  RACE_NOT_FOUND: {
    status: 404,
    message: '해당 경주를 찾을 수 없습니다.',
  },
  RATE_LIMIT_EXCEEDED: {
    status: 429,
    message: '요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.',
  },

  // 서버 에러 (5xx)
  INTERNAL_ERROR: {
    status: 500,
    message: '서버 오류가 발생했습니다.',
  },
  EXTERNAL_API_ERROR: {
    status: 502,
    message: '외부 데이터 서비스에 일시적인 문제가 발생했습니다.',
  },
  SERVICE_UNAVAILABLE: {
    status: 503,
    message: '서비스를 일시적으로 이용할 수 없습니다.',
  },
} as const;
```

---

## 6. 보안

### 6.1 보안 체크리스트

```
┌─────────────────────────────────────────────────────────────┐
│  🔒 보안 체크리스트                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  □ API 키 환경 변수로 관리 (process.env)                    │
│  □ API 키 클라이언트 노출 금지                              │
│  □ Rate Limiting 적용                                       │
│  □ 입력 검증 (모든 파라미터)                                │
│  □ 에러 메시지에 민감 정보 미포함                           │
│  □ CORS 설정                                                │
│  □ 보안 헤더 설정                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 입력 검증

```typescript
// src/lib/validators.ts

import { z } from 'zod';

/**
 * 경주 유형 검증
 */
export const RaceTypeSchema = z.enum(['horse', 'cycle', 'boat']);

export function isValidRaceType(type: string): type is RaceType {
  return RaceTypeSchema.safeParse(type).success;
}

/**
 * 날짜 검증
 */
export const DateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export function isValidDate(date: string): boolean {
  if (!DateSchema.safeParse(date).success) return false;

  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
}

/**
 * 경주 ID 검증
 */
export const RaceIdSchema = z.string().regex(
  /^(horse|cycle|boat)-\d{8}-[a-z]+-\d+$/
);

export function isValidRaceId(id: string): boolean {
  return RaceIdSchema.safeParse(id).success;
}

/**
 * 파라미터 검증 미들웨어
 */
export function validateParams<T extends z.ZodSchema>(
  schema: T,
  params: unknown
): z.infer<T> {
  const result = schema.safeParse(params);

  if (!result.success) {
    const firstError = result.error.errors[0];
    throw new ValidationError(
      firstError.message,
      firstError.path.join('.')
    );
  }

  return result.data;
}
```

### 6.3 Rate Limiting

```typescript
// src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 간단한 메모리 기반 Rate Limiter (프로덕션에서는 Redis 권장)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = 100;  // 분당 요청 수
const RATE_WINDOW = 60 * 1000;  // 1분

export function middleware(request: NextRequest) {
  // API 경로만 Rate Limiting 적용
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();

  // Rate Limit 체크
  let rateLimit = rateLimitMap.get(ip);

  if (!rateLimit || now > rateLimit.resetTime) {
    rateLimit = { count: 0, resetTime: now + RATE_WINDOW };
    rateLimitMap.set(ip, rateLimit);
  }

  rateLimit.count++;

  // 헤더 설정
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', RATE_LIMIT.toString());
  response.headers.set('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT - rateLimit.count).toString());
  response.headers.set('X-RateLimit-Reset', Math.ceil(rateLimit.resetTime / 1000).toString());

  // 한도 초과 시
  if (rateLimit.count > RATE_LIMIT) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: '요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.',
        },
      },
      {
        status: 429,
        headers: {
          'Retry-After': '60',
        },
      }
    );
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

---

## 7. 테스트

### 7.1 테스트 구조

```
tests/
├── api/
│   ├── races/
│   │   ├── horse.test.ts
│   │   ├── cycle.test.ts
│   │   └── boat.test.ts
│   └── races-detail/
│       ├── entries.test.ts
│       ├── odds.test.ts
│       └── results.test.ts
└── lib/
    ├── api-helpers/
    │   ├── mappers.test.ts
    │   └── kspoClient.test.ts
    └── validators.test.ts
```

### 7.2 API Route 테스트 예시

```typescript
// tests/api/races/horse.test.ts

import { GET } from '@/app/api/races/horse/route';
import { NextRequest } from 'next/server';

// Mock 설정
jest.mock('@/lib/api-helpers/kspoClient');

describe('GET /api/races/horse', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return horse races list', async () => {
    // Given
    const mockRaces = [
      {
        id: 'horse-20251125-seoul-1',
        type: 'horse',
        raceNumber: 1,
        venue: '서울',
        status: 'scheduled',
      },
    ];

    const { getRaces } = require('@/lib/api-helpers/kspoClient');
    getRaces.mockResolvedValue(mockRaces);

    const request = new NextRequest('http://localhost/api/races/horse');

    // When
    const response = await GET(request);
    const data = await response.json();

    // Then
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockRaces);
  });

  it('should return 400 for invalid date format', async () => {
    // Given
    const request = new NextRequest(
      'http://localhost/api/races/horse?date=25-11-2025'
    );

    // When
    const response = await GET(request);
    const data = await response.json();

    // Then
    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('INVALID_DATE_FORMAT');
  });

  it('should return 502 when external API fails', async () => {
    // Given
    const { getRaces } = require('@/lib/api-helpers/kspoClient');
    getRaces.mockRejectedValue(new ExternalAPIError('API 오류', 500));

    const request = new NextRequest('http://localhost/api/races/horse');

    // When
    const response = await GET(request);
    const data = await response.json();

    // Then
    expect(response.status).toBe(502);
    expect(data.error.code).toBe('EXTERNAL_API_ERROR');
  });
});
```

### 7.3 매퍼 테스트 예시

```typescript
// tests/lib/api-helpers/mappers.test.ts

import { mapKSPORace, mapKSPOEntry, mapKSPOOdds } from '@/lib/api-helpers/mappers';

describe('mapKSPORace', () => {
  it('should map KSPO race response to Race type', () => {
    // Given
    const kspoResponse = {
      rcDate: '20251125',
      rcNo: '1',
      trkCd: '01',
      trkNm: '창원',
      rcTime: '1030',
      rcDist: '1200',
      rcStat: '0',
      entCnt: '10',
    };

    // When
    const result = mapKSPORace(kspoResponse, 'cycle');

    // Then
    expect(result).toEqual({
      id: 'cycle-20251125-changwon-1',
      type: 'cycle',
      raceNumber: 1,
      venue: '창원',
      venueCode: 'changwon',
      startTime: '2025-11-25T10:30:00+09:00',
      status: 'scheduled',
      distance: 1200,
      entries: 10,
    });
  });
});

describe('mapKSPOOdds', () => {
  it('should parse valid odds values', () => {
    const result = mapKSPOOdds(
      { entNo: '1', oddsDansng: '2.5', oddsBoksng: '1.8' },
      '선수1'
    );

    expect(result.win).toBe(2.5);
    expect(result.place).toBe(1.8);
  });

  it('should return null for invalid odds', () => {
    const result = mapKSPOOdds(
      { entNo: '1', oddsDansng: '-', oddsBoksng: '' },
      '선수1'
    );

    expect(result.win).toBeNull();
    expect(result.place).toBeNull();
  });
});
```

---

## 📋 부록

### A. API Route 체크리스트

```markdown
새 API Route 생성 시 확인:

□ 파라미터 검증 구현
□ 에러 처리 구현
□ 응답 형식 통일 (createSuccessResponse/createErrorResponse)
□ Cache-Control 헤더 설정
□ revalidate 설정 (ISR)
□ 에러 로깅
□ 테스트 작성
□ API_SPEC.md 문서 업데이트
```

### B. 파일 명명 규칙

| 유형 | 규칙 | 예시 |
|------|------|------|
| API Route | route.ts | `app/api/races/horse/route.ts` |
| API Helper | camelCase | `kspoClient.ts` |
| 매퍼 | mappers.ts | `mappers.ts` |
| 테스트 | *.test.ts | `horse.test.ts` |

---

*이 문서는 백엔드 설계 변경 시 업데이트됩니다.*
