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

# Jest - pattern match
npx jest --testNamePattern="test name pattern"

# Playwright - single file
npx playwright test e2e/tests/home.spec.ts

# Playwright - specific test
npx playwright test -g "test name"
```

## Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      External APIs                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ KRA (경마)   │  │ KSPO (경륜) │  │ data.go.kr (공공데이터) │  │
│  └──────┬──────┘  └──────┬──────┘  └────────────┬────────────┘  │
└─────────┼────────────────┼──────────────────────┼───────────────┘
          │                │                      │
          ▼                ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    src/lib/api/                                  │
│  ┌──────────────┐  ┌───────────────┐  ┌─────────────────────┐   │
│  │ kraClient.ts │  │ kspo*Client.ts│  │ kra/ (새 통합 API)  │   │
│  └──────────────┘  └───────────────┘  │  ├── registry.ts    │   │
│                                        │  ├── client.ts      │   │
│                                        │  ├── jockey.ts      │   │
│                                        │  ├── trainer.ts     │   │
│                                        │  └── horse.ts       │   │
│                                        └─────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│  API Routes (src/app/api/)                                       │
│  ├── races/           # 경주 목록/상세                           │
│  ├── v1/kra/         # KRA 공공데이터 API                        │
│  │   ├── jockeys/    # 기수 목록/상세                            │
│  │   ├── trainers/   # 조교사 목록/상세                          │
│  │   └── horses/     # 마필 목록/상세                            │
│  └── v1/daily-selections/  # AI 추천                            │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│  React Components (src/components/, src/app/)                    │
└─────────────────────────────────────────────────────────────────┘
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

## Team Conventions

### Git Workflow
- **No direct push to main/dev** - Always use feature branches + PR
- Feature branches: `NNN-feature-name` (e.g., `004-data-platform-phase1`)
- Conventional Commits: `feat(scope):`, `fix(scope):`, `chore(scope):`

### Spec-First Development
- All features start with spec documents as **source of truth**
- Specs location: `specs/NNN-feature-name/`
- Required artifacts: `spec.md`, `plan.md`, `tasks.md`

### Role-Based Structure
| Role | Directory | Responsibility |
|------|-----------|----------------|
| AI Worker | `src/ingestion/`, `src/workers/` | Data collection, parsing |
| Backend | `src/app/api/`, `src/lib/db/` | API routes, DB queries |
| Frontend | `src/app/`, `src/components/` | UI pages, components |

### Architecture Patterns
- **Backend**: Clean Architecture (router → service → repo)
- **Workers**: Parser/Strategy pattern (file type별 parser 분리)
- **Frontend**: `app/`, `components/`, `hooks/`, `lib/`, `types/`

### AI Output Policy
- AI results are **Preview-only** - human has final responsibility
- Audit log required for all AI-generated content
- Hash verification for data integrity

## Core Principles

| 섹션 | 핵심 원칙 |
|------|-----------|
| 1. TDD | 테스트 먼저 → Red/Green/Refactor 사이클 |
| 2. 외부 설정 | 수동 설정 필요 시 GitHub Issue 등록 필수 |
| 3. 디자인 시스템 | Clean Architecture, DI, Event-Driven |
| 4. 커밋 메시지 | Conventional Commits, AI 언급 금지 |
| 5. 코드 스타일 | ESLint/Prettier, 단일 책임 원칙 |
| 6. 응답 원칙 | CTO 관점, 객관적, 근거 필수 |
| 7. PR 체크리스트 | 7개 항목 체크 후 머지 |

## Development Rules (TDD)

This project follows strict TDD discipline per `docs/TDD_RULES.md`:

1. **TDD Cycle**: Red → Green → Refactor (mandatory)
2. **Commit Separation**:
   - `chore(structure):` for structural changes (rename, move, reorganize)
   - `feat(behavior):` or `fix(behavior):` for behavioral changes
   - Never mix structure + behavior in same commit
3. **All tests must pass before committing**
4. **Functions should be 10-20 lines max, following SRP**

## Environment Variables

Required in `.env.local`:

```bash
KRA_API_KEY=     # data.go.kr Encoding key (pre-encoded)
KSPO_API_KEY=    # 국민체육진흥공단 API
NEXT_PUBLIC_SITE_URL=https://racelab.kr
```

When API keys are missing, the app falls back to dummy data (`lib/api-helpers/dummy.ts`).

## Response Guidelines (응답 원칙)

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

## Business Thinking

| 항목 | 내용 |
|------|------|
| 소비자 중심 사고 | 리서치/피드백은 최종 사용자 관점 |
| 비즈니스 임팩트 | 수익/비용/시장 영향 고려 |
| 가치 전달 | 기술 ≠ 비즈니스 구분 |
| 시장 현실 | 이상 < 실용 |

B2C/B2B/B2G 전 영역 적용.

## Vibe Coding: Effective AI Collaboration

### Effective Prompt Patterns

**Pattern 1: Role Assignment**
```
"You are a senior React developer with 10 years experience.
Review this component and suggest improvements."
```

**Pattern 2: Step-by-Step Requests**
```
"Proceed in this order:
1. Analyze current code problems
2. Present 3 improvement options
3. Refactor using the most suitable option
4. Explain the changes"
```

**Pattern 3: Constraint Specification**
```
"Implement with these constraints:
- Maintain existing API contract
- No new dependencies
- Test coverage >= 80%"
```

**Pattern 4: Example-Based Requests**
```
"Create OrderService.ts following the same pattern as
UserService.ts. Especially follow the error handling approach."
```

### Boundaries

**DO NOT delegate to Claude:**
- Security credential generation/management
- Direct production DB manipulation
- Code deployment without verification

**Human verification REQUIRED:**
- Security-related code (auth, permissions)
- Financial transaction logic
- Personal data processing code
- External API integration code

### Checklist

**Before Starting:**
- [ ] Shared project structure and conventions
- [ ] Clearly defined task objectives

**During Coding:**
- [ ] Providing sufficient context with file paths
- [ ] Giving specific feedback

**After Coding:**
- [ ] Ran tests (`npm test`, `npm run build`)
- [ ] Verified security-related code
- [ ] Removed AI mentions from commit messages
