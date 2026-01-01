# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RaceLab (경마/경륜/경정 통합 정보 플랫폼) - A unified web service providing real-time information for Korean horse racing, cycle racing, and boat racing. Built with Next.js 14 App Router, React 18, TypeScript 5.9, and Tailwind CSS 3.4.

## Commands

```bash
# Development
npm run dev                    # Start dev server (racelab.kr)

# Testing
npm run test                   # Run all Jest tests (UI + API)
npm run test:e2e               # Run Playwright E2E tests
npm run test:e2e:ui            # Interactive Playwright UI

# Build & Lint
npm run lint                   # ESLint validation
npm run build                  # Production build

# Storybook
npm run storybook              # Storybook dev server (localhost:6006)
```

### Running Single Tests

```bash
# Jest - single file
npx jest path/to/file.test.ts

# Jest - pattern match (use --testPathPatterns for newer Jest)
npx jest --testPathPatterns="pattern"

# Playwright - single file
npx playwright test e2e/tests/home.spec.ts

# Playwright - specific test
npx playwright test -g "test name"
```

## Architecture

### Data Flow

```
External APIs (KRA, KSPO, data.go.kr)
          │
          ▼
┌─────────────────────────────────────┐
│  src/lib/api/                       │
│  ├── kraClient.ts (legacy)          │
│  ├── kspo*Client.ts                 │
│  └── kra/         (new unified API) │
│      ├── registry.ts                │
│      ├── client.ts                  │
│      ├── jockey.ts                  │
│      ├── trainer.ts                 │
│      └── horse.ts                   │
└─────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────┐
│  API Routes (src/app/api/)          │
│  ├── races/                         │
│  └── v1/kra/ (jockeys, trainers,    │
│               horses)               │
└─────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────┐
│  React Components & Pages           │
└─────────────────────────────────────┘
```

### Key Directories

- `src/app/` - Next.js App Router pages and API routes
- `src/app/api/v1/kra/` - KRA 공공데이터 포털 API 라우트
- `src/app/analytics/` - 기수/조교사 분석 페이지
- `src/components/` - React components
- `src/lib/api/kra/` - KRA 공공데이터 통합 클라이언트
- `src/lib/analytics/` - 분석 데이터 처리 (API 브릿지)
- `src/lib/daily/` - Daily Selections 로직
- `src/lib/strategy/` - DSL 전략 시스템
- `src/types/` - TypeScript 인터페이스
- `e2e/` - Playwright E2E 테스트 (page objects 패턴)

### API Response Pattern

```typescript
{
  success: boolean,
  data?: T | T[],
  error?: { code: string, message: string },
  timestamp: string  // ISO format
}
```

### Testing Architecture

| Type | Config | Environment |
|------|--------|-------------|
| UI Tests | `jest.config.ui.js` | jsdom |
| API Tests | `jest.config.api.js` | node |
| E2E Tests | `playwright.config.ts` | Multi-browser + mobile |

### Race Type Colors (Tailwind)

- Horse (경마): `horse` (#2d5a27 green)
- Cycle (경륜): `cycle` (#dc2626 red)
- Boat (경정): `boat` (#0369a1 blue)

## KRA API Integration (src/lib/api/kra/)

공공데이터 포털(data.go.kr) 경마 API 통합 모듈:

| 파일 | 역할 |
|------|------|
| `registry.ts` | API 엔드포인트 레지스트리 |
| `client.ts` | 통합 HTTP 클라이언트 (`kraApi`, `kraApiSafe`) |
| `types.ts` | API 응답 타입 및 도메인 모델 |
| `mappers.ts` | Raw API → 도메인 모델 변환 |
| `jockey.ts` | 기수 API (`fetchJockeyRanking`, `fetchJockeyInfo`) |
| `trainer.ts` | 조교사 API |
| `horse.ts` | 마필 API |

**Meet Codes**: 1=서울, 2=제주, 3=부산/부경

## Prediction Engine (src/lib/predictions/)

경마 예측 시스템. 팩터 기반 스코어링 → Softmax 확률 변환 → 추천 생성.

```
Entry Data → Scorer → Raw Scores → Softmax → Win Probabilities → Predictions
               ↑
         ModelWeights (constants.ts)
```

### 핵심 모듈

| 파일 | 역할 |
|------|------|
| `core/predictor.ts` | `PredictionEngine` 메인 클래스 |
| `core/scorer.ts` | 팩터별 점수 계산 (8개 내부 + 5개 외부 팩터) |
| `core/probability.ts` | Softmax, Kelly Criterion, 가치 분석 |
| `core/normalizer.ts` | Min-Max / Z-Score 정규화 |
| `constants.ts` | 모델 가중치, 임계값 상수 |
| `adapters/kraAdapter.ts` | KRA API 응답 → 예측 입력 변환 |

### 모델 가중치 (DEFAULT_MODEL_WEIGHTS)

- **External (40%)**: 주로상태(12%), 게이트(8%), 거리적합도(10%), 필드크기(5%), 표면(5%)
- **Internal (60%)**: 레이팅(15%), 최근폼(10%), 부담중량(8%), 거리선호도(7%), 기수(8%), 조교사(5%), 콤보(7%)

### 사용 예시

```typescript
import { predictRace, PredictionEngine } from '@/lib/predictions';

// 간편 예측
const result = predictRace({ race, entries });

// 커스텀 가중치
const engine = new PredictionEngine(customWeights);
const result = engine.predictRace({ race, entries });
```

## Ingestion System (src/ingestion/)

데이터 수집 파이프라인. Vercel Cron으로 스케줄링.

```
External APIs (KRA/KSPO)
        ↓
   clients/*.ts (HTTP 요청)
        ↓
   mappers/*.ts (Raw → Domain 변환)
        ↓
   jobs/*.ts (Poller 로직)
        ↓
   Database (Drizzle ORM)
```

### 구조

| 디렉토리 | 역할 |
|----------|------|
| `clients/` | KRA/KSPO API 클라이언트 |
| `mappers/` | API 응답 → DB 스키마 변환 |
| `jobs/` | Poller 작업 (schedule, entry, odds, result) |
| `services/` | Slack 알림, 상태 관리 |
| `utils/` | 재시도, 쿼터 관리, 메트릭 |

### Poller 종류

| Job | 설명 | 스케줄 |
|-----|------|--------|
| `schedulePoller` | 경주 일정 수집 | 매일 06:00 |
| `entryPoller` | 출주마 정보 수집 | 경주 시작 전 |
| `oddsPoller` | 실시간 배당률 | 경주 중 (5분 간격) |
| `resultPoller` | 경주 결과 | 경주 종료 후 |

## Team Conventions

### Git Workflow
- **No direct push to main/dev** - Always use feature branches + PR
- Feature branches: `NNN-feature-name` (e.g., `004-data-platform-phase1`)
- Conventional Commits: `feat(scope):`, `fix(scope):`, `chore(scope):`
- **커밋 메시지에 AI/Claude 언급 금지** - 순수 기술적 내용만 작성

### Spec-First Development
- All features start with spec documents as **source of truth**
- Specs location: `specs/NNN-feature-name/`
- Required artifacts: `spec.md`, `plan.md`, `tasks.md`

### TDD Discipline (per `docs/TDD_RULES.md`)

1. **TDD Cycle**: Red → Green → Refactor (mandatory)
2. **Commit Separation**:
   - `chore(structure):` for structural changes (rename, move, reorganize)
   - `feat(behavior):` or `fix(behavior):` for behavioral changes
   - Never mix structure + behavior in same commit
3. **All tests must pass before committing**
4. **Functions should be 10-20 lines max, following SRP**

### Architecture Patterns
- **Backend**: Clean Architecture (router → service → repo)
- **Workers**: Parser/Strategy pattern (file type별 parser 분리)
- **Frontend**: `app/`, `components/`, `hooks/`, `lib/`, `types/`

## Environment Variables

Required in `.env.local`:

```bash
KRA_API_KEY=     # data.go.kr Encoding key (pre-encoded)
KSPO_API_KEY=    # 국민체육진흥공단 API
NEXT_PUBLIC_SITE_URL=https://racelab.kr
```

When API keys are missing, the app falls back to dummy data (`lib/api-helpers/dummy.ts`).

## Response Guidelines

### CTO 관점
- **결정 중심** (옵션 나열 X)
- 트레이드오프/리스크/ROI 명시
- P0/P1/P2 우선순위 부여

### 근거 확보
- 코드 라인 명시 (예: `file.tsx:123`)
- 테스트 결과 포함
- 공식 문서 참조

### 금지 표현
- "아마도...", "~일 것 같습니다"
- "보통은...", "일반적으로..."
- 출처 없는 주장
