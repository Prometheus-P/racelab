---
title: RaceLab 데이터 플랫폼 스펙
version: 1.0.0
status: Draft
owner: '@Prometheus-P'
created: 2025-12-10
updated: 2025-12-10
language: Korean (한국어)
---

# RaceLab 데이터 플랫폼 스펙 (Data Platform Specification)

> **이 문서는 RaceLab을 "정보 뷰어" 수준에서 "데이터 플랫폼" 체급으로 확장하기 위한 기술적 설계 스펙입니다.**
> 아이템스카우트(ItemScout), 블랙키위(BlackKiwi)와 같은 데이터 기반 의사결정 플랫폼을 벤치마크로 삼아,
> 공영경주(경마/경륜/경정) 도메인에 특화된 분석·전략 플랫폼으로의 전환을 목표로 합니다.

---

## 목차 (Table of Contents)

1. [Overview](#1-overview)
2. [Current State (As-Is)](#2-current-state-as-is)
3. [Target Architecture (To-Be)](#3-target-architecture-to-be)
4. [Data Model & Metrics](#4-data-model--metrics)
5. [Feature Modules](#5-feature-modules)
6. [Strategy & Backtest & Alert](#6-strategy--backtest--alert)
7. [Roadmap & Phasing](#7-roadmap--phasing)
8. [Non-Goals](#8-non-goals)

---

## 1. Overview

### 1.1 프로젝트 비전

**현재 RaceLab**은 KRA/KSPO 공공 API를 통해 오늘의 경주 정보, 출주표, 배당률, 결과를 조회할 수 있는 **"정보 포털(뷰어)"** 수준의 서비스입니다.

**목표 RaceLab**은 다음을 제공하는 **"데이터 플랫폼"**으로 진화하는 것입니다:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    RaceLab 데이터 플랫폼 비전                          │
├─────────────────────────────────────────────────────────────────────┤
│  1. 히스토리 데이터 축적: 과거 경주 데이터를 수집·저장·분석              │
│  2. 지표 기반 인사이트: 승률, ROI, 배당 변동성 등 파생 지표 제공         │
│  3. 전략 빌더 & 백테스트: 사용자 정의 전략의 과거 성과 검증              │
│  4. 실시간 알림: 조건 충족 시 대시보드/푸시/텔레그램 알림                 │
│  5. SaaS BM: 프리미엄 분석 기능을 구독 모델로 수익화                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 벤치마크 서비스

| 서비스 | 도메인 | 핵심 기능 | RaceLab 적용 포인트 |
|--------|--------|-----------|---------------------|
| **아이템스카우트** | 이커머스(네이버 스마트스토어) | 키워드 분석, 경쟁 상품 분석, 트렌드 분석 인사이트 | RaceScout(경주 발굴), Odds Radar(배당 분석) |
| **블랙키위** | 이커머스 SEO | 검색량 추이, 경쟁 강도, 기회 키워드 발굴 | 언더밸류 경주 발굴, Money Flow 분석 |
| **Betfair Exchange** | 스포츠 베팅 | 실시간 odds 변동, 거래량 시각화 | Odds 시계열 분석, 베팅 집중도 지표 |
| **Racing Post** | 경마 | 폼 가이드, 스피드 피규어, 예상 배당률 | Horse/Runner Insight, 폼 트렌드 분석 |

### 1.3 핵심 성공 지표 (KPIs)

| 지표 | 설명 | 목표 |
|------|------|------|
| **데이터 수집 완성도** | 과거 N년치 경주 데이터 수집률 | 99%+ (최근 3년) |
| **분석 기능 MAU** | 월간 활성 분석 기능 사용자 | 5,000+ |
| **전략 빌더 사용률** | 전략을 1개 이상 생성한 사용자 비율 | 20%+ |
| **유료 전환율** | 무료 → 프리미엄 전환 | 5%+ |

---

## 2. Current State (As-Is)

### 2.1 현재 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                       현재 RaceLab 아키텍처                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐ │
│  │  KRA API    │───▶│  Next.js    │───▶│   React UI          │ │
│  │  (경마)     │    │  API Routes │    │   (SSR/CSR)         │ │
│  └─────────────┘    │             │    └─────────────────────┘ │
│                     │  ISR Cache  │                             │
│  ┌─────────────┐    │  (30s~5m)   │                             │
│  │  KSPO API   │───▶│             │                             │
│  │  (경륜/경정)│    └─────────────┘                             │
│  └─────────────┘                                                │
│                                                                 │
│  ❌ 데이터베이스 없음                                            │
│  ❌ 히스토리 저장 없음                                           │
│  ❌ 지표/피처 계산 없음                                          │
│  ❌ 분석 기능 없음                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 현재 제공 기능

| 기능 | 상태 | 설명 |
|------|------|------|
| 오늘의 경주 목록 | ✅ 완료 | 경마/경륜/경정 탭별 조회 |
| 경주 상세 정보 | ✅ 완료 | 출주표, 기수/선수 정보 |
| 배당률 조회 | 🔄 진행중 | 단승/복승/쌍승 배당 |
| 경주 결과 | 🔄 진행중 | 착순, 배당금 |
| 결과 히스토리 | ⏳ 예정 | 과거 경주 결과 검색 (Phase 2) |

### 2.3 현재 데이터 흐름

```
External APIs (KRA, KSPO)
        │
        ▼
┌───────────────────┐
│  lib/api.ts       │  ← API 클라이언트 (fetch)
│  + api-helpers/   │  ← 응답 변환 (mappers.ts)
│    mappers.ts     │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  API Routes       │  ← /api/races/[type]/...
│  (ISR Cache)      │  ← revalidate: 30~300초
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  React Components │  ← TodayRaces, RaceDetail 등
└───────────────────┘
```

### 2.4 현재 데이터 모델 (Types)

현재 정의된 핵심 타입 (`src/types/`):

| 타입 | 파일 | 설명 |
|------|------|------|
| `Race` | `race.ts` | 경주 기본 정보 |
| `Entry` | `entry.ts` | 출전 정보 (말/선수) |
| `RaceResult` | `result.ts` | 경주 결과 |
| `Odds` | `oddsSnapshot.ts` | 배당률 (현재 시점 단일값) |
| `HistoricalRace` | `index.ts` | 과거 경주 (Mock 데이터용) |

### 2.5 현재의 한계점 (Gap Analysis)

| 레이어 | 현재 상태 | 목표 상태 | Gap |
|--------|-----------|-----------|-----|
| **Ingestion** | 실시간 fetch만 | 스케줄 수집 + 저장 | 🔴 없음 |
| **Storage** | 없음 (캐시만) | PostgreSQL + TimescaleDB | 🔴 없음 |
| **Modeling** | 없음 | 지표/피처 테이블 | 🔴 없음 |
| **Insights** | 없음 | RaceScout, Odds Radar | 🔴 없음 |
| **Strategy** | 없음 | 전략 빌더 + 백테스트 | 🔴 없음 |

---

## 3. Target Architecture (To-Be)

### 3.1 4-Layer 데이터 플랫폼 아키텍처

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        RaceLab 데이터 플랫폼 아키텍처 (To-Be)                      │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         Layer 1: INGESTION                               │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │   │
│  │  │  KRA Poller  │  │ KSPO Poller  │  │ Odds Poller  │  │ Weather API │  │   │
│  │  │  (경마 일정) │  │ (경륜/경정)  │  │  (1분 간격)  │  │  (트랙상태) │  │   │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘  │   │
│  │         │                 │                 │                 │         │   │
│  │         └─────────────────┴─────────────────┴─────────────────┘         │   │
│  │                                     │                                    │   │
│  │                                     ▼                                    │   │
│  │                        ┌────────────────────────┐                        │   │
│  │                        │    Message Queue       │                        │   │
│  │                        │  (Bull/Redis or SQS)   │                        │   │
│  │                        └───────────┬────────────┘                        │   │
│  └────────────────────────────────────┼─────────────────────────────────────┘   │
│                                       │                                         │
│  ┌────────────────────────────────────▼─────────────────────────────────────┐   │
│  │                         Layer 2: STORAGE & MODELING                       │   │
│  │                                                                           │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │                     PostgreSQL + TimescaleDB                        │ │   │
│  │  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────────┐ │ │   │
│  │  │  │   tracks   │  │   races    │  │  entries   │  │    results     │ │ │   │
│  │  │  └────────────┘  └────────────┘  └────────────┘  └────────────────┘ │ │   │
│  │  │  ┌────────────────────┐  ┌───────────────────┐  ┌─────────────────┐ │ │   │
│  │  │  │  odds_snapshots    │  │  betting_pools    │  │  weather_logs   │ │ │   │
│  │  │  │  (TimescaleDB)     │  │                   │  │                 │ │ │   │
│  │  │  └────────────────────┘  └───────────────────┘  └─────────────────┘ │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                           │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │                     Materialized Views / Aggregates                  │ │   │
│  │  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────┐  │ │   │
│  │  │  │ horse_stats_    │  │ jockey_stats    │  │ race_metrics        │  │ │   │
│  │  │  │ daily           │  │                 │  │                     │  │ │   │
│  │  │  └─────────────────┘  └─────────────────┘  └─────────────────────┘  │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └───────────────────────────────────────────────────────────────────────────┘   │
│                                       │                                         │
│  ┌────────────────────────────────────▼─────────────────────────────────────┐   │
│  │                         Layer 3: INSIGHTS                                 │   │
│  │                                                                           │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐   │   │
│  │  │   RaceScout     │  │  Horse Insight  │  │     Odds Radar          │   │   │
│  │  │  (경주 발굴)    │  │  (폼 트렌드)    │  │  (배당 변동 시각화)     │   │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────────────┘   │   │
│  │                                                                           │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐   │   │
│  │  │  Track Insight  │  │ Jockey Insight  │  │   Results Insight       │   │   │
│  │  │  (트랙 분석)    │  │ (기수/선수 분석)│  │  (결과 분석/회고)       │   │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────────────┘   │   │
│  └───────────────────────────────────────────────────────────────────────────┘   │
│                                       │                                         │
│  ┌────────────────────────────────────▼─────────────────────────────────────┐   │
│  │                         Layer 4: STRATEGY & ALERT                         │   │
│  │                                                                           │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐   │   │
│  │  │ Strategy Builder│  │   Backtest      │  │    Alert Engine         │   │   │
│  │  │  (전략 정의)    │  │  (과거 검증)    │  │  (실시간 알림)          │   │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────────────┘   │   │
│  │                                                                           │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  Alert Channels: Dashboard / Email / Telegram / Webhook             │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └───────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Layer 1: Ingestion Layer (데이터 수집 공장)

#### 3.2.1 수집 대상 데이터

| 데이터 | 소스 | 수집 주기 | 저장 형태 |
|--------|------|-----------|-----------|
| 경주 일정 | KRA/KSPO API | 1일 1회 (매일 06:00) | `races` 테이블 |
| 출주표 | KRA/KSPO API | 경주 시작 2시간 전 | `entries` 테이블 |
| 배당률 (odds) | KRA/KSPO API | 경주 시작 전 1분 간격 | `odds_snapshots` 테이블 |
| 베팅 풀 | KRA/KSPO API | 배당과 동시 수집 | `betting_pools` 테이블 |
| 경주 결과 | KRA/KSPO API | 경주 종료 후 5분 | `results` 테이블 |
| 날씨/트랙 상태 | 기상청 API | 경주일 06:00, 12:00 | `weather_logs` 테이블 |

#### 3.2.2 Odds 시간 스냅샷 수집 전략

```
┌─────────────────────────────────────────────────────────────────┐
│                    Odds 수집 타임라인 (경주별)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  경주 시작                                                       │
│      │                                                          │
│  ────┼──────────────────────────────────────────────▶ 시간      │
│      │                                                          │
│  T-60분   T-30분   T-15분   T-5분    T-1분    T(발주)           │
│    │        │        │        │        │        │               │
│    ▼        ▼        ▼        ▼        ▼        ▼               │
│  5분 간격  5분 간격  1분 간격  1분 간격  30초 간격  최종 확정     │
│                                                                 │
│  [저장 필드]                                                     │
│  - race_id, timestamp, entry_no                                 │
│  - odds_win, odds_place, odds_quinella                          │
│  - pool_total, pool_entry (베팅 금액)                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### 3.2.3 원본 데이터 저장 구조 (Raw Data Lake)

```
s3://racelab-data-lake/
├── raw/
│   ├── kra/
│   │   ├── schedules/
│   │   │   └── YYYY-MM-DD/
│   │   │       └── {timestamp}_{meet}.json
│   │   ├── entries/
│   │   │   └── YYYY-MM-DD/
│   │   │       └── {race_id}.json
│   │   ├── odds/
│   │   │   └── YYYY-MM-DD/
│   │   │       └── {race_id}_{timestamp}.json
│   │   └── results/
│   │       └── YYYY-MM-DD/
│   │           └── {race_id}.json
│   └── kspo/
│       ├── cycle/
│       └── boat/
└── processed/
    └── daily_summary/
        └── YYYY-MM-DD.parquet
```

#### 3.2.4 실패/재시도/모니터링 전략

| 항목 | 전략 |
|------|------|
| **재시도** | Exponential backoff (1s, 2s, 4s, 8s, max 5회) |
| **실패 기록** | `ingestion_failures` 테이블에 로그 |
| **알림** | Slack/Discord 웹훅으로 실패 통보 |
| **복구** | 실패 건은 `pending_ingestion` 큐에 저장, 수동/자동 재실행 |
| **모니터링** | Prometheus metrics + Grafana 대시보드 |

### 3.3 Layer 2: Storage & Modeling Layer (지표·피처 공장)

#### 3.3.1 데이터베이스 선택

| DB | 용도 | 이유 |
|----|------|------|
| **PostgreSQL 15+** | 핵심 관계형 데이터 | 안정성, 풍부한 기능, JSON 지원 |
| **TimescaleDB** (PG Extension) | 시계열 데이터 (odds) | 시계열 압축, 연속 집계, 하이퍼테이블 |
| **Redis** | 캐시, 세션, 실시간 데이터 | 저지연, pub/sub 지원 |

#### 3.3.2 핵심 테이블 스키마

##### tracks (경기장)

```sql
CREATE TABLE tracks (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(10) UNIQUE NOT NULL,  -- 'seoul', 'busan', 'gwangmyeong'
    name        VARCHAR(50) NOT NULL,         -- '서울', '부산경남', '광명'
    race_type   VARCHAR(10) NOT NULL,         -- 'horse', 'cycle', 'boat'
    location    POINT,                         -- 위경도
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

##### races (경주)

```sql
CREATE TABLE races (
    id              VARCHAR(50) PRIMARY KEY,  -- 'horse-1-3-20241210'
    race_type       VARCHAR(10) NOT NULL,
    track_id        INT REFERENCES tracks(id),
    race_no         INT NOT NULL,
    race_date       DATE NOT NULL,
    start_time      TIME,
    distance        INT,                       -- 미터
    grade           VARCHAR(20),               -- '1등급', '특별경주' 등
    status          VARCHAR(20) DEFAULT 'scheduled',  -- scheduled, live, finished, canceled
    purse           BIGINT,                    -- 상금 (원)
    conditions      JSONB,                     -- 출전 조건 (연령, 등급 등)
    weather         VARCHAR(20),               -- 맑음, 흐림, 비
    track_condition VARCHAR(20),               -- 양호, 불량 등
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_races_date ON races(race_date);
CREATE INDEX idx_races_type_date ON races(race_type, race_date);
```

##### entries (출전 정보)

```sql
CREATE TABLE entries (
    id              SERIAL PRIMARY KEY,
    race_id         VARCHAR(50) REFERENCES races(id),
    entry_no        INT NOT NULL,              -- 출전 번호 (마번/배번)
    name            VARCHAR(100) NOT NULL,     -- 마명/선수명
    entity_type     VARCHAR(10) NOT NULL,      -- 'horse', 'cyclist', 'boat_racer'

    -- 경마 전용
    horse_id        VARCHAR(20),               -- 마등록번호
    jockey_id       VARCHAR(20),
    jockey_name     VARCHAR(50),
    trainer_id      VARCHAR(20),
    trainer_name    VARCHAR(50),
    owner_name      VARCHAR(50),
    birth_year      INT,
    sex             VARCHAR(10),               -- 수, 암, 거세
    weight          DECIMAL(5,1),              -- 마체중
    burden_weight   DECIMAL(5,1),              -- 부담중량
    rating          INT,                       -- 레이팅

    -- 경륜/경정 전용
    racer_id        VARCHAR(20),
    racer_grade     VARCHAR(10),
    gear_ratio      DECIMAL(3,2),              -- 기어비 (경륜)
    motor_no        INT,                       -- 모터번호 (경정)
    boat_no         INT,                       -- 보트번호 (경정)

    -- 공통
    recent_record   VARCHAR(100),              -- 최근 성적 요약
    status          VARCHAR(20) DEFAULT 'active',  -- active, scratched

    created_at      TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(race_id, entry_no)
);

CREATE INDEX idx_entries_race ON entries(race_id);
CREATE INDEX idx_entries_jockey ON entries(jockey_id);
CREATE INDEX idx_entries_horse ON entries(horse_id);
```

##### odds_snapshots (배당률 시계열 - TimescaleDB)

```sql
CREATE TABLE odds_snapshots (
    time            TIMESTAMPTZ NOT NULL,
    race_id         VARCHAR(50) NOT NULL,
    entry_no        INT NOT NULL,

    odds_win        DECIMAL(8,2),              -- 단승 배당
    odds_place      DECIMAL(8,2),              -- 복승 배당
    odds_quinella   JSONB,                     -- 쌍승 조합별 배당

    pool_total      BIGINT,                    -- 전체 베팅 풀
    pool_win        BIGINT,                    -- 해당 출전번호 단승 풀
    pool_place      BIGINT,                    -- 해당 출전번호 복승 풀

    popularity_rank INT,                       -- 인기 순위

    PRIMARY KEY (time, race_id, entry_no)
);

-- TimescaleDB 하이퍼테이블 변환
SELECT create_hypertable('odds_snapshots', 'time');

-- 압축 정책 (30일 이후 압축)
SELECT add_compression_policy('odds_snapshots', INTERVAL '30 days');

-- 연속 집계 (5분 단위 요약)
CREATE MATERIALIZED VIEW odds_5min
WITH (timescaledb.continuous) AS
SELECT
    time_bucket('5 minutes', time) AS bucket,
    race_id,
    entry_no,
    first(odds_win, time) AS odds_open,
    last(odds_win, time) AS odds_close,
    max(odds_win) AS odds_high,
    min(odds_win) AS odds_low,
    avg(odds_win) AS odds_avg,
    last(popularity_rank, time) AS final_rank
FROM odds_snapshots
GROUP BY bucket, race_id, entry_no;
```

##### results (경주 결과)

```sql
CREATE TABLE results (
    id              SERIAL PRIMARY KEY,
    race_id         VARCHAR(50) REFERENCES races(id),
    entry_no        INT NOT NULL,

    finish_position INT NOT NULL,              -- 착순 (1, 2, 3, ...)
    time            DECIMAL(10,3),             -- 주파시간 (초)
    margin          VARCHAR(20),               -- 착차 ('목', '1/2마신', 등)

    -- 구간 기록 (경마)
    split_times     JSONB,                     -- {s1f: 13.2, g3f: 36.5, ...}

    -- 배당금
    dividend_win    BIGINT,                    -- 단승 배당금
    dividend_place  BIGINT,                    -- 복승 배당금

    created_at      TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(race_id, entry_no)
);

CREATE INDEX idx_results_race ON results(race_id);
CREATE INDEX idx_results_position ON results(finish_position);
```

##### betting_pools (베팅 풀)

```sql
CREATE TABLE betting_pools (
    id              SERIAL PRIMARY KEY,
    race_id         VARCHAR(50) REFERENCES races(id),
    snapshot_time   TIMESTAMPTZ NOT NULL,

    pool_type       VARCHAR(20) NOT NULL,      -- 'win', 'place', 'quinella', 'exacta', 'trifecta'
    total_amount    BIGINT NOT NULL,           -- 총 베팅 금액
    entry_breakdown JSONB,                     -- {1: 1000000, 2: 500000, ...}

    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3.3.3 집계 테이블 (Aggregate Tables)

##### horse_stats_daily (말별 일간 통계)

```sql
CREATE TABLE horse_stats_daily (
    id              SERIAL PRIMARY KEY,
    horse_id        VARCHAR(20) NOT NULL,
    horse_name      VARCHAR(100),
    stats_date      DATE NOT NULL,

    -- 통산 성적
    total_starts    INT DEFAULT 0,
    total_wins      INT DEFAULT 0,
    total_places    INT DEFAULT 0,             -- 1-2위
    total_shows     INT DEFAULT 0,             -- 1-3위

    -- 승률 지표
    win_rate        DECIMAL(5,2),              -- 승률 (%)
    place_rate      DECIMAL(5,2),              -- 복승률 (%)
    show_rate       DECIMAL(5,2),              -- 연승률 (%)

    -- 최근 N경주 성적
    recent_5_avg_position   DECIMAL(4,2),
    recent_5_avg_odds       DECIMAL(6,2),
    recent_10_trend         VARCHAR(20),       -- 'improving', 'declining', 'stable'

    -- 조건별 성적
    stats_by_distance       JSONB,             -- {1200: {starts: 5, wins: 2}, ...}
    stats_by_track          JSONB,             -- {seoul: {starts: 10, wins: 3}, ...}
    stats_by_condition      JSONB,             -- {good: {...}, muddy: {...}}

    -- ROI 지표
    roi_win         DECIMAL(6,2),              -- 단승 ROI (%)
    roi_place       DECIMAL(6,2),              -- 복승 ROI (%)

    created_at      TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(horse_id, stats_date)
);

CREATE INDEX idx_horse_stats_date ON horse_stats_daily(stats_date);
```

##### jockey_stats (기수 통계)

```sql
CREATE TABLE jockey_stats (
    id              SERIAL PRIMARY KEY,
    jockey_id       VARCHAR(20) NOT NULL,
    jockey_name     VARCHAR(50),
    stats_date      DATE NOT NULL,

    -- 성적
    total_rides     INT DEFAULT 0,
    wins            INT DEFAULT 0,
    places          INT DEFAULT 0,
    shows           INT DEFAULT 0,

    win_rate        DECIMAL(5,2),
    place_rate      DECIMAL(5,2),

    -- 기수 특성
    specialty_distance  INT[],                 -- 특기 거리
    specialty_track     VARCHAR(20)[],         -- 선호 트랙

    -- 조교사 궁합
    trainer_affinity    JSONB,                 -- {trainer_id: {rides: 50, wins: 15}, ...}

    created_at      TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(jockey_id, stats_date)
);
```

##### race_metrics (경주 지표)

```sql
CREATE TABLE race_metrics (
    id              SERIAL PRIMARY KEY,
    race_id         VARCHAR(50) REFERENCES races(id),

    -- 베팅 집중도
    betting_concentration   DECIMAL(5,2),      -- 상위 2마 베팅 비율 (%)
    favorite_strength       DECIMAL(5,2),      -- 1번 인기마 배당 강도

    -- 배당 변동성
    odds_volatility_avg     DECIMAL(6,2),      -- 전체 평균 변동성
    odds_volatility_max     DECIMAL(6,2),      -- 최대 변동 출전번호

    -- Money Flow
    money_flow_direction    VARCHAR(20),       -- 'stable', 'shifting', 'concentrated'
    late_money_entries      INT[],             -- 막판 돈 몰린 출전번호들

    -- 경쟁 강도
    field_quality_score     DECIMAL(5,2),      -- 출전마 평균 레이팅

    -- 분석 지표 (Phase 3+)
    value_entries           INT[],             -- 저평가 추정 출전번호

    calculated_at   TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.4 Layer 3: Insights Layer (분석 기능)

> [Section 5](#5-feature-modules)에서 상세 설명

### 3.5 Layer 4: Strategy & Alert Layer (전략 및 알림)

> [Section 6](#6-strategy--backtest--alert)에서 상세 설명

---

## 4. Data Model & Metrics

### 4.1 핵심 엔티티 관계도 (ERD)

```
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│    tracks     │       │    races      │       │   entries     │
├───────────────┤       ├───────────────┤       ├───────────────┤
│ id            │◄──────│ track_id      │       │ id            │
│ code          │       │ id            │◄──────│ race_id       │
│ name          │       │ race_no       │       │ entry_no      │
│ race_type     │       │ race_date     │       │ name          │
└───────────────┘       │ start_time    │       │ jockey_id     │
                        │ distance      │       │ horse_id      │
                        │ grade         │       │ ...           │
                        │ status        │       └───────┬───────┘
                        └───────┬───────┘               │
                                │                       │
                                ▼                       ▼
                        ┌───────────────┐       ┌───────────────┐
                        │   results     │       │odds_snapshots │
                        ├───────────────┤       ├───────────────┤
                        │ race_id       │       │ time          │
                        │ entry_no      │       │ race_id       │
                        │ finish_pos    │       │ entry_no      │
                        │ time          │       │ odds_win      │
                        │ dividend_win  │       │ odds_place    │
                        └───────────────┘       │ pool_total    │
                                                └───────────────┘
                                                        │
                                                        ▼
                        ┌───────────────────────────────────────┐
                        │            Aggregate Tables           │
                        ├───────────────────────────────────────┤
                        │ horse_stats_daily                     │
                        │ jockey_stats                          │
                        │ trainer_stats                         │
                        │ race_metrics                          │
                        └───────────────────────────────────────┘
```

### 4.2 핵심 지표 정의

#### 4.2.1 성적 기반 지표

| 지표명 | 영문명 | 계산식 | 설명 |
|--------|--------|--------|------|
| **승률** | `win_rate` | `wins / total_starts * 100` | 1착 비율 |
| **복승률** | `place_rate` | `(1st + 2nd) / total_starts * 100` | 1-2착 비율 |
| **연승률** | `show_rate` | `(1st + 2nd + 3rd) / total_starts * 100` | 1-3착 비율 |
| **최근 N경주 평균 순위** | `recent_n_avg_position` | `SUM(position) / N` | 최근 폼 지표 |
| **폼 트렌드** | `form_trend` | 최근 5경주 vs 이전 5경주 비교 | improving/declining/stable |

#### 4.2.2 배당(Odds) 기반 지표

| 지표명 | 영문명 | 계산식 | 설명 |
|--------|--------|--------|------|
| **배당 변동성** | `odds_volatility` | `stddev(odds) / avg(odds)` | 배당 변화 폭 |
| **배당 변화율** | `odds_change_rate` | `(final_odds - initial_odds) / initial_odds * 100` | 시작 대비 최종 변화 |
| **Money Flow Index** | `money_flow_index` | 베팅풀 유입 속도 분석 | 돈의 흐름 방향 |
| **인기 순위 변동** | `popularity_shift` | 시간대별 인기 순위 변화 | 막판 급등/급락 감지 |

#### 4.2.3 밸류 지표 (Value Metrics)

| 지표명 | 영문명 | 계산식 | 설명 |
|--------|--------|--------|------|
| **밸류 지수** | `value_index` | `expected_probability / implied_probability` | 1.0 이상이면 저평가 |
| **Expected ROI** | `expected_roi` | `(value_index - 1) * 100` | 기대 수익률 |
| **Historical Value** | `historical_value` | 과거 유사 배당 대비 실제 결과 분석 | 저평가 이력 |

#### 4.2.4 경주 특성 지표

| 지표명 | 영문명 | 계산식 | 설명 |
|--------|--------|--------|------|
| **베팅 집중도** | `betting_concentration` | 상위 2마 베팅 비율 | 쏠림 정도 |
| **필드 품질** | `field_quality` | 출전마 평균 레이팅 | 경쟁 수준 |
| **이변 가능성** | `upset_probability` | 과거 유사 경주 이변 발생률 | 분석 불확실성 |

### 4.3 지표 계산 파이프라인

```
┌─────────────────────────────────────────────────────────────────┐
│                    지표 계산 파이프라인 (ETL)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Trigger: 경주 종료 후 10분]                                    │
│                                                                 │
│  1. Extract:                                                    │
│     - results 테이블에서 최신 결과 조회                           │
│     - odds_snapshots에서 해당 경주 시계열 조회                    │
│                                                                 │
│  2. Transform:                                                  │
│     - horse_stats_daily 업데이트 (승률, ROI 등)                  │
│     - jockey_stats 업데이트                                     │
│     - race_metrics 생성 (배당 변동성, 집중도 등)                  │
│                                                                 │
│  3. Load:                                                       │
│     - Aggregate 테이블 UPSERT                                   │
│     - Redis 캐시 갱신 (인기 지표용)                              │
│                                                                 │
│  [Trigger: 매일 자정]                                            │
│                                                                 │
│  - Daily snapshot 생성                                          │
│  - 월간/연간 집계 갱신                                           │
│  - 랭킹 테이블 갱신                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Feature Modules

> **아이템스카우트/블랙키위 스타일의 분석 기능을 경주 도메인에 매핑**

### 5.1 RaceScout (경주 발굴)

#### 목표
"오늘/이번 주에 어떤 경주에 주목해야 하는가?"에 대한 답을 제공

#### 핵심 기능

| 기능 | 설명 | 유저 질문 |
|------|------|-----------|
| **Hot Races** | 베팅 집중도가 높은 경주 | "돈이 많이 몰리는 경주는?" |
| **Value Races** | 저평가 출전마가 있는 경주 | "이변 가능성 있는 경주는?" |
| **Sure Bet Races** | 압도적 1번 인기마가 있는 경주 | "거의 확정적인 경주는?" |
| **Competitive Races** | 상위권 배당이 비슷한 경주 | "경쟁이 치열한 경주는?" |

#### UI 구성

```
┌─────────────────────────────────────────────────────────────────┐
│  RaceScout - 오늘의 경주 레이더                                   │
├─────────────────────────────────────────────────────────────────┤
│  [필터] 종목: [경마 ▼] 트랙: [전체 ▼] 시간대: [전체 ▼]           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🔥 Hot Races (베팅 집중)                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 서울 7R | 14:30 | 1400m | 베팅 집중도 78%               │   │
│  │ 부산 5R | 13:00 | 1200m | 베팅 집중도 65%               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  💎 Value Races (이변 가능성)                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 서울 3R | 11:30 | 1000m | Value Entry: #5 (12.5배)      │   │
│  │ 제주 2R | 10:30 | 1200m | Value Entry: #3 (8.2배)       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ⚔️ Competitive Races (치열한 경쟁)                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 서울 9R | 16:00 | 1800m | 상위 4마 배당: 3.2~4.8배      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Horse/Runner Insight (말/선수 분석)

#### 목표
"이 말/선수의 현재 컨디션과 예상 성과는?"에 대한 답을 제공

#### 핵심 기능

| 기능 | 설명 | 유저 질문 |
|------|------|-----------|
| **Form Guide** | 최근 10경주 성적 트렌드 | "이 말 최근 폼이 어때?" |
| **Condition Analysis** | 거리/트랙/날씨별 성적 | "이 거리에서 잘 뛰나?" |
| **Jockey-Horse Affinity** | 기수-말 조합 성적 | "이 기수와 궁합이 맞나?" |
| **Value History** | 과거 배당 대비 실제 성과 | "저평가였던 적이 있나?" |
| **ROI Analysis** | 해당 말에 꾸준히 베팅했을 때 수익률 | "이 말에 투자하면?" |

#### UI 구성

```
┌─────────────────────────────────────────────────────────────────┐
│  Horse Insight: 스타라이터 (마번: 12345)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [기본 정보]                                                     │
│  나이: 5세 | 성별: 수 | 통산: 35전 8승 6복 5연 | 레이팅: 72       │
│                                                                 │
│  [폼 트렌드] ─────────────────────────────────────               │
│                                                                 │
│  순위  1 ─ ● ─ ● ─ ─ ─ ● ─ ─ ─ ● ─               (상승 트렌드)  │
│       2 ─ ─ ─ ─ ● ─ ─ ─ ─ ─ ─ ─ ─                             │
│       3 ─ ─ ─ ─ ─ ─ ● ─ ● ─ ─ ─ ─                             │
│       4+─ ─ ─ ─ ─ ─ ─ ─ ─ ● ─ ─ ─                             │
│          10   9   8   7   6   5   4   3   2   1  (최근)        │
│                                                                 │
│  [조건별 성적] ──────────────────────────────────               │
│  ┌──────────────────┬──────────────────┬─────────────────┐     │
│  │ 거리별           │ 트랙별           │ 트랙상태별      │     │
│  │ 1200m: 3/10 30%  │ 서울: 5/20 25%   │ 양호: 7/25 28%  │     │
│  │ 1400m: 4/15 27%  │ 부산: 3/15 20%   │ 습윤: 1/10 10%  │     │
│  │ 1800m: 1/10 10%  │                  │                 │     │
│  └──────────────────┴──────────────────┴─────────────────┘     │
│                                                                 │
│  [ROI 분석] 단승: +12.5% | 복승: +8.2% | (최근 20경주 기준)      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 Odds Radar (배당 레이더)

#### 목표
"배당이 어떻게 움직이고 있고, 어디에 돈이 몰리는가?"에 대한 답을 제공

#### 핵심 기능

| 기능 | 설명 | 유저 질문 |
|------|------|-----------|
| **Odds Timeline** | 시간대별 배당 변동 차트 | "배당이 언제 급변했지?" |
| **Money Flow** | 베팅 풀 유입 시각화 | "돈이 어디로 몰리나?" |
| **Late Money Alert** | 막판 급변 출전번호 감지 | "막판에 뭐가 올랐어?" |
| **Odds Comparison** | 시작 배당 vs 최종 배당 비교 | "어떤 말이 많이 올랐어?" |

#### UI 구성

```
┌─────────────────────────────────────────────────────────────────┐
│  Odds Radar - 서울 7R (14:30 발주)                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [실시간 배당 변동] ──────────────────────────────               │
│                                                                 │
│  배당  │                                                        │
│   15  │        ─── #5                                          │
│   10  │   ─────────────────────── #3                           │
│    5  │ ─────────── #1 ──────────────────────────              │
│    3  │ ═══════════════════════════════════════ #2             │
│       └──────────────────────────────────────────── 시간       │
│         T-60     T-30     T-15     T-5      현재               │
│                                                                 │
│  [Money Flow] ────────────────────────────────────              │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ #2 ████████████████████████████████████████ 45%        │    │
│  │ #1 ████████████████████████ 28%                        │    │
│  │ #5 ████████████ 15%                                    │    │
│  │ #3 ██████ 8%                                           │    │
│  │ 기타 ████ 4%                                           │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  [🚨 Late Money Alert]                                          │
│  #5: 배당 12.5 → 8.2 (▼ 34%) - 최근 10분간 급락                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.4 Track Insight (트랙 분석)

#### 목표
"이 경기장/트랙의 특성은 무엇인가?"

#### 핵심 기능

| 기능 | 설명 |
|------|------|
| **Post Position Stats** | 마번별 유불리 통계 |
| **Pace Analysis** | 선행/추입 유리 경향 |
| **Favorite Performance** | 1번 인기마 승률 |
| **Upset Frequency** | 이변 발생 빈도 |

### 5.5 Results Insight (결과 분석/회고)

#### 목표
"경주 결과를 어떻게 해석해야 하는가?"

#### 핵심 기능

| 기능 | 설명 |
|------|------|
| **Result Breakdown** | 구간별 기록, 착차 분석 |
| **Value Assessment** | 저평가/과대평가 결과 분석 |
| **Pattern Detection** | 유사 경주 패턴 매칭 |

---

## 6. Strategy & Backtest & Alert

### 6.1 Strategy Builder (전략 빌더)

#### 6.1.1 전략 조건식 DSL (Domain-Specific Language)

```typescript
// Strategy DSL 예시
interface StrategyCondition {
  field: string;           // 조건 필드
  operator: Operator;      // 비교 연산자
  value: number | string;  // 비교 값
  timeframe?: string;      // 시간 범위 (recent_n, last_year 등)
}

type Operator =
  | 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte'
  | 'in' | 'not_in'
  | 'between' | 'contains';

interface Strategy {
  id: string;
  name: string;
  description: string;
  conditions: StrategyCondition[];
  logic: 'AND' | 'OR';                    // 조건 결합 방식
  filters: {
    race_types?: RaceType[];
    tracks?: string[];
    distance_range?: [number, number];
    grade?: string[];
  };
  created_by: string;
  created_at: Date;
}
```

#### 6.1.2 전략 예시

**전략 1: "복승권 안정형"**
```yaml
name: 복승권 안정형
description: 최근 폼이 좋고 안정적인 복승권 진입 후보
conditions:
  - field: recent_5_avg_position
    operator: lte
    value: 2.5
  - field: place_rate
    operator: gte
    value: 50
  - field: odds_win
    operator: between
    value: [3.0, 10.0]
logic: AND
filters:
  race_types: [horse]
  distance_range: [1200, 1600]
```

**전략 2: "저평가 발굴형"**
```yaml
name: 저평가 발굴형
description: 배당 대비 실력이 저평가된 말 발굴
conditions:
  - field: value_index
    operator: gte
    value: 1.2
  - field: odds_change_rate
    operator: lt
    value: -10
  - field: recent_5_wins
    operator: gte
    value: 1
logic: AND
filters:
  race_types: [horse, cycle]
```

#### 6.1.3 UI Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  Strategy Builder                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  전략명: [저평가 발굴 전략          ]                            │
│                                                                 │
│  [조건 추가] ────────────────────────────────────               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 조건 1: [최근 5경주 평균순위 ▼] [≤] [2.5]    [x 삭제]   │   │
│  │ 조건 2: [복승률 ▼]             [≥] [50%]    [x 삭제]   │   │
│  │ 조건 3: [단승 배당 ▼]          [범위] [3.0 ~ 10.0]     │   │
│  │                                                         │   │
│  │ [+ 조건 추가]                                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  조건 결합: (●) 모두 만족 (AND)  ( ) 하나라도 만족 (OR)          │
│                                                                 │
│  [필터] ──────────────────────────────────────────              │
│  종목: [✓] 경마 [✓] 경륜 [ ] 경정                               │
│  거리: [1200]m ~ [1600]m                                        │
│  트랙: [전체 ▼]                                                  │
│                                                                 │
│  [────────────────] [백테스트 실행] [저장]                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Backtest Engine (백테스트 엔진)

#### 6.2.1 백테스트 데이터 범위

| 항목 | 최소 요구사항 | 권장 |
|------|---------------|------|
| **기간** | 최근 1년 | 최근 3년 |
| **경주 수** | 10,000+ 경주 | 50,000+ 경주 |
| **odds 스냅샷** | 경주당 최소 10개 | 경주당 30개+ |

#### 6.2.2 백테스트 결과 메트릭

| 메트릭 | 영문명 | 설명 |
|--------|--------|------|
| **결과 매칭률** | `hit_rate` | 조건 충족 후 1착 결과 매칭 비율 |
| **복승 결과 매칭률** | `place_hit_rate` | 조건 충족 후 1-2착 결과 매칭 비율 |
| **총 ROI** | `total_roi` | 총 수익률 (%) |
| **MDD** | `max_drawdown` | 최대 낙폭 (%) |
| **샤프 비율** | `sharpe_ratio` | 위험 대비 수익 |
| **월별 성과** | `monthly_returns` | 월별 수익률 배열 |
| **조건 충족 빈도** | `trigger_frequency` | 일/주/월 평균 발생 횟수 |

#### 6.2.3 백테스트 결과 UI

```
┌─────────────────────────────────────────────────────────────────┐
│  Backtest Results: "저평가 발굴 전략"                             │
│  기간: 2023-01-01 ~ 2024-12-09 (2년)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [핵심 지표] ────────────────────────────────────               │
│  ┌────────────┬────────────┬────────────┬────────────┐         │
│  │ 결과 매칭률 │ 복승 결과 매칭률 │ 총 ROI     │ MDD        │         │
│  │   18.5%    │   42.3%    │  +23.7%    │  -15.2%    │         │
│  └────────────┴────────────┴────────────┴────────────┘         │
│                                                                 │
│  총 시그널: 1,247건 | 평균 배당: 6.8배 | 샤프: 1.42              │
│                                                                 │
│  [월별 수익률 추이] ─────────────────────────────────           │
│                                                                 │
│   15% │         ┌──┐                                            │
│   10% │    ┌──┐ │  │ ┌──┐                     ┌──┐              │
│    5% │ ┌──┤  │ │  │ │  │ ┌──┐ ┌──┐      ┌──┐ │  │ ┌──┐        │
│    0% ├─┴──┴──┴─┴──┴─┴──┴─┤  ├─┤  ├──────┤  ├─┴──┴─┤  │        │
│   -5% │                   │  │ │  │ ┌──┐ │  │      │  │        │
│  -10% │                   └──┘ └──┘ │  │ └──┘      └──┘        │
│       └──────────────────────────────┴──┴───────────────        │
│        1월 2월 3월 4월 5월 6월 7월 8월 9월 10월 11월 12월        │
│                                                                 │
│  [시그널 샘플] ────────────────────────────────────             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 날짜       경주          출전번호  배당   결과  손익     │   │
│  │ 2024-12-08 서울 7R      #5        8.2    2착   -1.0     │   │
│  │ 2024-12-07 부산 5R      #3        5.5    1착   +4.5     │   │
│  │ 2024-12-06 서울 3R      #7       12.0    5착   -1.0     │   │
│  │ ...                                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [💾 이 전략 저장] [🔔 알림 설정] [📊 상세 분석]                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 Alert Engine (알림 엔진)

#### 6.3.1 알림 이벤트 종류

| 이벤트 | 설명 | 긴급도 |
|--------|------|--------|
| `STRATEGY_TRIGGERED` | 저장된 전략 조건 충족 | High |
| `ODDS_SPIKE` | 특정 출전번호 배당 급변 (±20%) | Medium |
| `LATE_MONEY` | 막판 5분 내 대량 베팅 유입 | High |
| `RACE_STARTING_SOON` | 관심 경주 시작 5분 전 | Low |
| `RESULT_AVAILABLE` | 관심 경주 결과 확정 | Medium |

#### 6.3.2 알림 채널

| 채널 | 구현 방식 | 특징 |
|------|-----------|------|
| **Dashboard** | WebSocket / SSE | 실시간, 무료 |
| **Email** | SendGrid / AWS SES | 요약형, 무료 Tier |
| **Telegram Bot** | Telegram Bot API | 실시간, 무료 |
| **Webhook** | HTTP POST | 사용자 시스템 연동 |
| **Push Notification** | FCM / APNS | 모바일 앱 (Phase 3+) |

#### 6.3.3 알림 설정 UI

```
┌─────────────────────────────────────────────────────────────────┐
│  Alert Settings                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [내 전략 알림] ─────────────────────────────────────           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ✓ 저평가 발굴 전략    [Dashboard] [Telegram] [Email]   │   │
│  │ ✓ 복승권 안정형       [Dashboard] [Telegram]           │   │
│  │   고배당 노림수       [설정하기...]                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [시스템 알림] ─────────────────────────────────────            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ✓ 배당 급변 알림 (±20% 이상)    [Dashboard]             │   │
│  │ ✓ 막판 머니 플로우 알림          [Dashboard] [Telegram] │   │
│  │   관심 경주 시작 알림            [설정 안함]            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Telegram 연동] ───────────────────────────────────            │
│  Bot: @RaceLabBot | Chat ID: 123456789 | [✓ 연동됨]             │
│                                                                 │
│  [Webhook 설정] ────────────────────────────────────            │
│  URL: https://my-server.com/webhook/racelab                     │
│  Secret: ********                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.4 BM (Business Model) 아이디어

| Tier | 가격 | 기능 |
|------|------|------|
| **Free** | 무료 | 기본 정보 조회, RaceScout 제한 (1일 3회), 백테스트 제한 (1년) |
| **Pro** | 9,900원/월 | 전체 분석 기능, 백테스트 3년, 전략 5개, 알림 무제한 |
| **Premium** | 29,900원/월 | API 접근, 전략 무제한, 커스텀 알림, 우선 지원 |
| **Enterprise** | 협의 | 전용 인스턴스, SLA, 데이터 익스포트 |

---

## 7. Roadmap & Phasing

### 7.1 Phase Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                       RaceLab 로드맵                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Phase 1          Phase 2          Phase 3          Phase 4    │
│  (3개월)          (3개월)          (3개월)          (지속)     │
│                                                                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐ │
│  │Ingestion │    │ Insights │    │ Strategy │    │ SaaS BM  │ │
│  │+ Storage │───▶│  1차     │───▶│+ Backtest│───▶│+ 고도화  │ │
│  │  기초    │    │          │    │          │    │          │ │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘ │
│                                                                 │
│  - DB 스키마      - RaceScout     - Strategy      - 결제 연동   │
│  - Ingestion     - Horse Insight   Builder       - API 공개    │
│    파이프라인    - Odds Radar     - Backtest     - 모바일 앱   │
│  - 히스토리                        Engine                       │
│    마이그레이션  - 지표 계산       - Alert                      │
│                    파이프라인       Engine                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Phase 1: Ingestion + Storage 기초 (Month 1-3)

#### 목표
- 데이터 수집 파이프라인 구축
- PostgreSQL + TimescaleDB 셋업
- 과거 데이터 마이그레이션 (가능한 범위)

#### 주요 태스크

| 태스크 | 설명 | 예상 기간 |
|--------|------|-----------|
| DB 스키마 설계 및 마이그레이션 | PostgreSQL 스키마 생성 | 1주 |
| TimescaleDB 하이퍼테이블 설정 | odds_snapshots 시계열 테이블 | 1주 |
| Ingestion Worker 구현 | Bull + Redis 기반 스케줄러 | 2주 |
| KRA/KSPO Poller 구현 | API 폴링 및 저장 로직 | 2주 |
| Odds 스냅샷 수집 로직 | 시간대별 수집 전략 구현 | 2주 |
| 과거 데이터 수집/마이그레이션 | 가능한 범위 내 히스토리 확보 | 2주 |
| 모니터링 대시보드 | Grafana 기반 수집 현황 모니터링 | 1주 |

#### 산출물
- `ingestion/` 디렉토리 (수집 워커)
- `db/migrations/` 디렉토리 (스키마 마이그레이션)
- `docs/ingestion-ops.md` (운영 가이드)

### 7.3 Phase 2: Metrics & Insights 1차 (Month 4-6)

#### 목표
- 핵심 지표 계산 파이프라인 구축
- RaceScout, Horse Insight, Odds Radar 1차 버전

#### 주요 태스크

| 태스크 | 설명 | 예상 기간 |
|--------|------|-----------|
| Aggregate 테이블 생성 | horse_stats_daily, race_metrics 등 | 1주 |
| 지표 계산 ETL 파이프라인 | 경주 종료 후 집계 로직 | 2주 |
| RaceScout 기능 구현 | Hot/Value/Competitive Races | 2주 |
| Horse Insight 기능 구현 | 폼 트렌드, 조건별 성적 | 2주 |
| Odds Radar 기능 구현 | 시계열 차트, Money Flow | 2주 |
| API 엔드포인트 추가 | /api/insights/* 라우트 | 1주 |
| UI 컴포넌트 개발 | 차트, 테이블 등 | 2주 |

#### 산출물
- `src/app/insights/` 페이지
- `src/lib/metrics/` 지표 계산 모듈
- `src/components/charts/` 차트 컴포넌트

### 7.4 Phase 3: Strategy Builder & Backtest (Month 7-9)

#### 목표
- 전략 빌더 UI/로직 구현
- 백테스트 엔진 구현
- 알림 시스템 1차 구현

#### 주요 태스크

| 태스크 | 설명 | 예상 기간 |
|--------|------|-----------|
| Strategy DSL 설계 및 구현 | 조건식 파서, 평가 엔진 | 2주 |
| Strategy Builder UI | 조건 추가/삭제/수정 UI | 2주 |
| Backtest Engine | 히스토리 데이터 기반 시뮬레이션 | 3주 |
| Backtest 결과 시각화 | 월별 수익률, 드로다운 차트 | 1주 |
| Alert Engine 구현 | 이벤트 감지 및 발송 | 2주 |
| Telegram Bot 연동 | 알림 채널 추가 | 1주 |
| 사용자 전략 저장/관리 | CRUD 및 공유 기능 | 1주 |

#### 산출물
- `src/app/strategy/` 페이지
- `src/lib/backtest/` 백테스트 엔진
- `src/lib/alerts/` 알림 엔진

### 7.5 Phase 4: Alert & SaaS 모듈 / BM 실험 (Month 10+)

#### 목표
- 결제 시스템 연동
- Pro/Premium Tier 기능 분리
- 모바일 앱 고려 (PWA 또는 Native)

#### 주요 태스크

| 태스크 | 설명 |
|--------|------|
| 결제 연동 | Stripe / 토스페이먼츠 |
| Tier별 기능 제한 | 미들웨어 기반 접근 제어 |
| API 공개 | 외부 개발자용 API |
| 고급 분석 기능 | ML 기반 분석 (선택) |
| 모바일 최적화 | PWA 또는 React Native |

---

## 8. Non-Goals

> **이번 스펙 범위에서 의도적으로 제외하는 항목들**

### 8.1 명시적으로 제외하는 것들

| 항목 | 이유 | 언제 다룰 수 있는가 |
|------|------|---------------------|
| **실제 베팅 서비스** | 법적 규제, PG 연동 복잡성 | 별도 사업 검토 필요 |
| **ML 기반 승률 분석 모델 상세 설계** | 데이터 축적 우선 필요 | Phase 4 이후 검토 |
| **규제/라이선스 상세 검토** | 법률 전문가 필요 | 별도 문서로 분리 |
| **해외 경주 데이터** | 국내 우선 집중 | Phase 5+ |
| **소셜 기능 (커뮤니티, 전략 공유)** | 핵심 기능 우선 | Phase 4+ |
| **Native 모바일 앱** | 웹 우선, PWA로 대체 가능 | 사용자 피드백 후 결정 |

### 8.2 기술적 제약 인정

| 제약 | 대응 |
|------|------|
| KRA/KSPO API 호출 제한 | 캐싱 및 스케줄링으로 완화 |
| 실시간 데이터 지연 (최대 30초~1분) | 사용자에게 갱신 시간 명시 |
| 과거 데이터 접근 제한 | 가능한 범위 내 수집, 점진적 확장 |

### 8.3 추후 검토 필요 사항

- **데이터 정확성 보장**: 공공 API 데이터 오류 시 대응 방안
- **개인정보 처리**: 사용자 전략 데이터 보관 정책
- **서비스 가용성**: SLA 정의 및 장애 대응 프로세스

---

## 부록 A: 용어 정리

| 용어 | 영문 | 설명 |
|------|------|------|
| 경마 | Horse Racing | 기수가 말을 타고 경주 |
| 경륜 | Cycle Racing | 자전거 경주 |
| 경정 | Boat Racing | 모터보트 경주 |
| 단승 | Win | 1등 분석형 정보 |
| 복승 | Place | 1-2등 데이터 인사이트 |
| 쌍승 | Quinella | 1-2등 순서 무관 |
| 출주표 | Entry List | 출전 선수/말 목록 |
| 배당률 | Odds | 베팅 배당 비율 |
| 밸류 | Value | 배당 대비 실제 확률이 높은 상태 |
| 백테스트 | Backtest | 과거 데이터로 전략 검증 |
| MDD | Maximum Drawdown | 최대 낙폭 |
| ROI | Return on Investment | 투자 수익률 |

---

## 부록 B: 참고 자료

- [아이템스카우트](https://itemscout.io) - 이커머스 데이터 플랫폼
- [블랙키위](https://blackkiwi.net) - 키워드 분석 도구
- [Racing Post](https://www.racingpost.com) - 영국 경마 정보 플랫폼
- [Betfair Exchange](https://www.betfair.com) - 베팅 익스체인지
- [TimescaleDB Documentation](https://docs.timescale.com) - 시계열 DB

---

**문서 버전**: 1.0.0
**작성일**: 2025-12-10
**작성자**: RaceLab Data Platform Team
**검토자**: TBD

---

_이 문서는 RaceLab 데이터 플랫폼 전환의 기술적 방향성을 정의하며, 구현 과정에서 지속적으로 업데이트됩니다._
