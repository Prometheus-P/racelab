# Research: Data Platform Phase 1

**Date**: 2025-12-10
**Plan Reference**: [plan.md](./plan.md)

이 문서는 Data Platform Phase 1 구현을 위한 기술 조사 결과를 정리합니다.

---

## 1. ORM 선택: Drizzle vs Prisma

### Decision: **Drizzle ORM**

### Rationale

| 항목 | Drizzle | Prisma |
|------|---------|--------|
| **성능** | 경량 (~7.4kb), 서버리스 최적화 | Rust 엔진 바이너리로 오버헤드 존재 |
| **학습 곡선** | SQL 기반, 낮은 진입 장벽 | 추상화된 문법, 높은 학습 곡선 |
| **타입 생성** | 즉시 반영 (codegen 불필요) | `prisma generate` 필요 |
| **마이그레이션** | 컬럼 rename 대화형 지원 | rename 감지 이슈 존재 |
| **TimescaleDB** | Raw SQL 지원으로 유연 | Extension 지원 제한적 |

Drizzle은 "If you know SQL, you know Drizzle ORM" 철학으로, SQL-first 접근 방식을 채택합니다.
시계열 데이터(odds_snapshots)를 다루는 Phase 1에서 Raw SQL과 TimescaleDB 특화 쿼리가 필요하므로 Drizzle이 적합합니다.

### Alternatives Considered

- **Prisma**: 풍부한 생태계와 tooling이 장점이나, codegen 워크플로우와 TimescaleDB 호환성 이슈로 제외
- **Kysely**: Type-safe SQL builder이나, 마이그레이션 도구 부재로 제외
- **Raw pg**: 완전한 제어 가능하나, 타입 안전성과 생산성 부족으로 제외

### References

- [Drizzle vs Prisma: the Better TypeScript ORM in 2025](https://www.bytebase.com/blog/drizzle-vs-prisma/)
- [Drizzle vs Prisma: Which ORM is best for your project?](https://blog.logrocket.com/drizzle-vs-prisma-which-orm-is-best/)

---

## 2. PostgreSQL 호스팅: TimescaleDB 지원

### Decision: **Supabase (Postgres 15)** 또는 **Timescale Cloud**

### Rationale

| 서비스 | TimescaleDB | 가격 (Free/Pro) | 특징 |
|--------|-------------|-----------------|------|
| **Supabase** | ✅ (PG 15만) | Free: 500MB / Pro: $25/월 | REST API 내장, Auth 통합 |
| **Neon** | ❌ | Free: 0.5GB / Launch: $19/월 | Serverless, Branching |
| **Railway** | ❌ (커스텀 필요) | $5/월 시작 | 간편한 배포 |
| **Timescale Cloud** | ✅ (네이티브) | Free: 30일 / $29/월 시작 | TimescaleDB 최적화 |

**⚠️ 중요**: Supabase에서 TimescaleDB는 Postgres 17에서 deprecated됨. Postgres 15 프로젝트로 생성 필요.

### Option A: Supabase (권장 - 초기 개발)

```
장점:
- 무료 Tier로 PoC 가능
- REST API, Auth 등 부가 기능
- Dashboard UI
- 기존 RaceLab과 통합 용이

단점:
- TimescaleDB는 PG 15에서만 지원
- 향후 PG 17 업그레이드 시 마이그레이션 필요
```

### Option B: Timescale Cloud (권장 - 프로덕션)

```
장점:
- TimescaleDB 네이티브 최적화
- 자동 압축, 연속 집계 완벽 지원
- 시계열 전문 성능 튜닝

단점:
- 무료 Tier 30일 제한
- 최소 $29/월 비용
```

### Migration Path

1. **Phase 1 개발**: Supabase Free (PG 15 + TimescaleDB)
2. **Phase 2 프로덕션**: 데이터 양에 따라 Timescale Cloud 전환 검토

### References

- [Supabase TimescaleDB Extension](https://supabase.com/docs/guides/database/extensions/timescaledb)
- [PostgreSQL Hosting Options 2025 Pricing](https://www.bytebase.com/blog/postgres-hosting-options-pricing-comparison/)

---

## 3. Job Queue / Redis 호스팅

### Decision: **Railway Redis** (개발) / **Upstash Fixed Price** (프로덕션)

### Rationale

| 서비스 | Bull 호환성 | 가격 모델 | 특징 |
|--------|-------------|-----------|------|
| **Railway Redis** | ✅ 완벽 | 사용량 기반 (~$1-5/월) | 간편한 설정 |
| **Upstash** | ⚠️ 설정 필요 | 커맨드 기반 / Fixed Plan | 서버리스 |
| **Fly.io Redis** | ✅ | Self-hosted | 복잡한 설정 |

### Upstash 주의사항

Bull/BullMQ는 Lua 스크립트 내에서 키를 생성하는데, Upstash는 이를 제한했었습니다.
현재는 호환성이 개선되었으나, **폴링 기반 작업에서 커맨드 비용이 급증**할 수 있습니다.

```
경고: 개발자 보고에 따르면 Bull 사용 시 월 ~3M 커맨드 발생
- Upstash Pay-as-you-go: $10-15/월 이상
- Railway: ~$1/월
```

### Recommendation

```yaml
Development:
  provider: Railway Redis
  reason: 간편한 설정, 저렴한 비용, Bull 완벽 호환

Production:
  provider: Upstash Fixed Price Plan
  reason: BullMQ 최적화 플랜, 분석 가능한 비용
  config:
    stalledInterval: 300000
    guardInterval: 300000
    drainDelay: 300
```

### References

- [BullMQ with Upstash Redis](https://upstash.com/docs/redis/integrations/bullmq)
- [Using Bull with Upstash](https://upstash.com/examples/usingbullwithupstash)

---

## 4. Worker 호스팅

### Decision: **Railway Worker** 또는 **Vercel Cron + QStash**

### Rationale

| 방식 | 장점 | 단점 | 비용 |
|------|------|------|------|
| **Railway Worker** | 장시간 실행 가능, Bull 통합 | 별도 배포 필요 | $5/월 시작 |
| **Vercel Cron** | 기존 인프라 활용 | 10초 타임아웃, 최소 1분 주기 | 무료 |
| **QStash + Vercel** | 서버리스, 재시도 내장 | 추가 서비스 필요 | $2/월 시작 |
| **Render Worker** | Background Worker 지원 | Railway 대비 느린 배포 | $7/월 시작 |

### Option A: Hybrid 아키텍처 (권장)

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel (기존)                         │
│  ┌─────────────┐                                        │
│  │ Vercel Cron │ ─────▶ API Routes (트리거)             │
│  │  (1분 주기) │                                        │
│  └─────────────┘                                        │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   Railway Worker                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Bull Worker Process                             │   │
│  │  - schedulePoller (매일 06:00)                   │   │
│  │  - oddsPoller (경주별 시간대 수집)               │   │
│  │  - resultPoller (경주 종료 후)                   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Option B: Vercel-only 아키텍처 (MVP)

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel                                │
│                                                         │
│  ┌─────────────┐     ┌─────────────────────────────┐   │
│  │ Vercel Cron │ ──▶ │ /api/ingestion/cron         │   │
│  │  (1분 주기) │     │ - 10초 내 빠른 작업만       │   │
│  └─────────────┘     └─────────────────────────────┘   │
│                                                         │
│  ┌─────────────┐     ┌─────────────────────────────┐   │
│  │   QStash    │ ──▶ │ /api/ingestion/webhook      │   │
│  │ (지연 작업) │     │ - 장시간 작업 분할 실행     │   │
│  └─────────────┘     └─────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Recommendation

**Phase 1 MVP**: Option B (Vercel Cron + QStash)
- 추가 인프라 없이 시작
- 10초 타임아웃 내 작업 분할

**Phase 1 프로덕션**: Option A (Hybrid)
- 안정적인 장시간 폴링
- Bull 기반 재시도/실패 복구

---

## 5. Odds 수집 주기 검토

### Decision: **Vercel Cron 1분 주기 + 동적 스케줄링**

### Analysis

```
요구사항:
- T-60분~T-15분: 5분 간격 수집
- T-15분~T-5분: 1분 간격 수집
- T-5분~T: 30초 간격 수집

Vercel Cron 한계:
- 최소 주기: 1분
- 30초 간격 직접 지원 불가
```

### Solution: 스마트 스케줄링

```typescript
// 1분마다 실행되는 Cron Job
export async function handleOddsCron() {
  const upcomingRaces = await getUpcomingRaces();

  for (const race of upcomingRaces) {
    const minutesToStart = getMinutesToStart(race.startTime);

    if (minutesToStart <= 5) {
      // T-5분 이내: 2번 수집 (30초 간격 시뮬레이션)
      await collectOdds(race.id);
      await delay(30000);
      await collectOdds(race.id);
    } else if (minutesToStart <= 15) {
      // T-15분 이내: 1번 수집
      await collectOdds(race.id);
    } else if (minutesToStart <= 60 && minutesToStart % 5 === 0) {
      // T-60분 이내 & 5분 단위: 1번 수집
      await collectOdds(race.id);
    }
  }
}
```

### Tradeoff

| 방식 | 정밀도 | 복잡도 | 비용 |
|------|--------|--------|------|
| **Vercel Cron (1분)** | 낮음 | 낮음 | 무료 |
| **QStash 동적 스케줄** | 높음 | 중간 | ~$2/월 |
| **Railway Worker** | 높음 | 높음 | ~$5/월 |

**Recommendation**: Vercel Cron 1분 + 내부 30초 delay로 MVP 구현, 이후 QStash/Railway로 고도화

---

## 6. 최종 기술 스택 결정

| 영역 | 선택 | 비고 |
|------|------|------|
| **ORM** | Drizzle ORM | SQL-first, 경량, TimescaleDB 친화적 |
| **PostgreSQL** | Supabase (PG 15) | 무료 Tier, TimescaleDB 지원 |
| **Redis** | Railway Redis | Bull 완벽 호환, 저렴 |
| **Job Queue** | Bull 4.x | 성숙한 생태계, 재시도/실패 복구 |
| **Worker** | Vercel Cron + Railway Worker | MVP: Cron만, 프로덕션: Hybrid |
| **Monitoring** | Sentry + 자체 대시보드 | 기존 인프라 활용 |

---

## 7. 남은 결정 사항

1. **Supabase 프로젝트 생성 시 PG 15 선택 필수** (PG 17에서 TimescaleDB deprecated)
2. **Railway 계정 설정** (Worker + Redis)
3. **환경 변수 설정**: `DATABASE_URL`, `REDIS_URL`, `SUPABASE_*`
4. **비용 모니터링 설정**: Railway/Supabase 대시보드 알림

---

**Research Complete**: 모든 NEEDS CLARIFICATION 항목 해결됨
