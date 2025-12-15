# Data Model: Production Hardening

**Date**: 2025-12-12
**Feature**: 006-production-hardening

## Overview

이 피처에서는 새로운 도메인 엔티티를 추가하지 않고, API 결과 래핑과 설정 타입만 추가합니다.

---

## New Types

### RaceFetchStatus

API 호출 결과 상태를 나타내는 Union 타입

```typescript
// src/types/index.ts

/**
 * API fetch 결과 상태
 * - OK: 정상 응답
 * - NOT_FOUND: 요청한 리소스가 존재하지 않음
 * - UPSTREAM_ERROR: 외부 API 오류 또는 타임아웃
 */
export type RaceFetchStatus = 'OK' | 'NOT_FOUND' | 'UPSTREAM_ERROR';
```

**Usage**:
- `fetchRaceById` 결과에서 상태 구분
- UI에서 적절한 에러 메시지/화면 표시

---

### RaceFetchResult<T>

API 결과를 상태와 함께 래핑하는 제네릭 타입

```typescript
// src/types/index.ts

/**
 * API fetch 결과 래퍼
 * @template T - 성공 시 반환되는 데이터 타입
 */
export interface RaceFetchResult<T> {
  /** 결과 상태 */
  status: RaceFetchStatus;
  /** 성공 시 데이터, 실패 시 null */
  data: T | null;
  /** 에러 발생 시 메시지 (선택) */
  error?: string;
}
```

**State Transitions**:
```
API 호출 시작
    │
    ├─ 응답 성공 (200) + 데이터 있음 ──→ { status: 'OK', data: T }
    │
    ├─ 응답 성공 (200) + 데이터 없음 ──→ { status: 'NOT_FOUND', data: null }
    │
    ├─ 응답 실패 (4xx/5xx) ──────────→ { status: 'UPSTREAM_ERROR', data: null, error: '...' }
    │
    └─ 타임아웃 (10초 초과) ─────────→ { status: 'UPSTREAM_ERROR', data: null, error: 'Timeout' }
```

---

### TodayRacesData

홈 화면에서 사용하는 오늘의 경주 데이터 집합

```typescript
// src/types/index.ts

/**
 * 오늘의 전체 경주 데이터
 * 홈 페이지에서 한 번 fetch 후 TodayRaces, QuickStats에 전달
 */
export interface TodayRacesData {
  /** 경마 경주 목록 */
  horse: Race[];
  /** 경륜 경주 목록 */
  cycle: Race[];
  /** 경정 경주 목록 */
  boat: Race[];
  /** 각 종목별 fetch 상태 (부분 실패 처리용) */
  status: {
    horse: RaceFetchStatus;
    cycle: RaceFetchStatus;
    boat: RaceFetchStatus;
  };
}
```

**Relationships**:
- `Race[]`: 기존 Race 타입 배열
- `RaceFetchStatus`: 각 종목별 API 결과 상태

---

### RaceTypeConfig

Race type UI 설정 타입

```typescript
// src/config/raceTypes.ts

/**
 * Race type별 UI 설정
 */
export interface RaceTypeConfig {
  /** 전체 라벨 (경마, 경륜, 경정) */
  label: string;
  /** 축약 라벨 (마, 륜, 정) */
  shortLabel: string;
  /** 이모지 아이콘 */
  icon: string;
  /** Tailwind 색상 클래스 */
  color: {
    primary: string;   // 텍스트 색상 (text-horse 등)
    bg: string;        // 배경 색상 (bg-horse/5 등)
    border: string;    // 테두리 색상 (border-horse 등)
    badge: string;     // 배지 배경 (bg-horse/10 등)
  };
}
```

---

## Modified Types

### Race (기존)

`date` 필드가 이미 optional로 정의되어 있음. 변경 불필요.

```typescript
// src/types/race.ts (변경 없음)
export interface Race {
  id: string;
  type: RaceType;
  raceNo: number;
  track: string;
  date?: string;        // YYYY-MM-DD (optional)
  meetCode?: string;
  startTime: string;    // HH:mm
  distance?: number;
  grade?: string;
  status: RaceStatus;
  entries: Entry[];
}
```

**Validation Notes**:
- `date` undefined 시 JSON-LD 생성에서 기본값 사용 또는 생략
- API 응답에서 date가 누락된 경우 로깅 권장

---

## Entity Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                      TodayRacesData                          │
├─────────────────────────────────────────────────────────────┤
│  horse: Race[]  ◄────────────────────────────────────────┐  │
│  cycle: Race[]  ◄───────────────────────────────────┐    │  │
│  boat: Race[]   ◄──────────────────────────────┐    │    │  │
│  status: {                                      │    │    │  │
│    horse: RaceFetchStatus                       │    │    │  │
│    cycle: RaceFetchStatus                       │    │    │  │
│    boat: RaceFetchStatus                        │    │    │  │
│  }                                              │    │    │  │
└─────────────────────────────────────────────────│────│────│──┘
                                                  │    │    │
                                                  ▼    ▼    ▼
┌─────────────────────────────────────────────────────────────┐
│                          Race                                │
├─────────────────────────────────────────────────────────────┤
│  id: string                                                  │
│  type: RaceType ────────────────────────────────────────────┼──► RaceTypeConfig
│  date?: string (YYYY-MM-DD)                                  │     (RACE_TYPES)
│  startTime: string (HH:mm)                                   │
│  ...                                                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    RaceFetchResult<T>                        │
├─────────────────────────────────────────────────────────────┤
│  status: RaceFetchStatus                                     │
│  data: T | null                                              │
│  error?: string                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Validation Rules

| Field | Rule | Error Handling |
| ----- | ---- | -------------- |
| `race.date` | YYYY-MM-DD 또는 YYYYMMDD 형식 | normalizeRaceDate()로 정규화 |
| `race.startTime` | HH:mm 형식 | 유효성 검사 후 사용 |
| `RaceFetchStatus` | 3개 값 중 하나 | TypeScript 컴파일 타임 검증 |
| `TodayRacesData.status` | 모든 종목 상태 포함 | 부분 실패 시 개별 에러 표시 |

---

## Migration Notes

이 피처는 기존 데이터 구조를 변경하지 않습니다. 새로운 타입은 기존 타입을 래핑하거나 보조하는 역할만 합니다.

**Breaking Changes**: None
**Database Changes**: None (외부 API 데이터 사용)
