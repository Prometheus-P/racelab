# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KRace (경마/경륜/경정 통합 정보 플랫폼) - A unified web service providing real-time information for Korean horse racing, cycle racing, and boat racing. Built with Next.js 14 App Router, React 18, TypeScript, and Tailwind CSS.

## Commands

```bash
# Development
npm run dev                    # Start dev server (racelab.kr)

# Testing
npm run test                   # Run all Jest tests (UI + API)
npm run test:e2e               # Run Playwright E2E tests
npm run test:e2e:ui            # Interactive Playwright UI
npm run test:e2e:debug         # Debug E2E tests

# Build & Lint
npm run lint                   # ESLint validation
npm run build                  # Production build
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
External APIs (KRA, KSPO) → lib/api.ts → lib/api-helpers/mappers.ts → API Routes → Components
```

### Key Directories

- `src/app/` - Next.js App Router pages and API routes
- `src/app/race/[id]/` - Race detail page
- `src/app/api/races/` - Race data endpoints
  - `horse/`, `cycle/`, `boat/` - Type-specific race lists
  - `[type]/[id]/entries/` - Race entries endpoint
  - `[type]/[id]/odds/` - Odds endpoint
  - `[type]/[id]/results/` - Results endpoint
- `src/components/` - React components (Header, Footer, TodayRaces, QuickStats)
- `src/lib/api.ts` - Data fetching functions
- `src/lib/api-helpers/mappers.ts` - API response transformers
- `src/lib/api-helpers/dummy.ts` - Mock data for development
- `src/lib/utils/` - Utility functions (apiResponse, date, ui)
- `src/types/index.ts` - TypeScript interfaces (Race, Entry, etc.)
- `e2e/` - Playwright E2E tests with page objects pattern
- `docs/` - Project documentation (business, technical, operations)

### API Response Pattern

```typescript
{
  success: boolean,
  data?: T[],
  error?: { code, message },
  timestamp: ISO string
}
```

### Testing Architecture

- **UI Tests** (`jest.config.ui.js`): jsdom environment for components
- **API Tests** (`jest.config.api.js`): node environment for routes
- **E2E Tests** (`playwright.config.ts`): Multi-browser including mobile

### Race Type Colors

- Horse (경마): `horse` color (#2d5a27 green)
- Cycle (경륜): `cycle` color (#dc2626 red)
- Boat (경정): `boat` color (#0369a1 blue)

## Team Conventions

### Git Workflow
- **No direct push to main/dev** - Always use feature branches + PR
- Feature branches: `NNN-feature-name` (e.g., `004-data-platform-phase1`)

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
- **Frontend**: `pages/app`, `components`, `hooks`, `lib/api`, `types`

### AI Output Policy
- AI results are **Preview-only** - human has final responsibility
- Audit log required for all AI-generated content
- Hash verification for data integrity
- Case-level data isolation

### Environment
- Single `.env` + `.env.example` provided
- Service-specific symlinks where needed

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

## Response Guidelines (응답 원칙)

### CTO 관점
- **결정 중심** (옵션 나열 X)
- 트레이드오프/리스크/ROI 명시
- P0/P1/P2 우선순위 부여
- 간결함 유지

### 객관성
- 감정 배제
- 사실 기반
- 정량적 표현

### 근거 확보
- 공식 문서 참조
- 코드 라인 명시 (예: `file.tsx:123`)
- 테스트 결과 포함
- 벤치마크 데이터

### 금지 표현
- ❌ "아마도...", "~일 것 같습니다"
- ❌ "보통은...", "일반적으로..."
- ❌ 출처 없는 주장

## Business Thinking

| 항목 | 내용 |
|------|------|
| 소비자 중심 사고 | 리서치/피드백은 최종 사용자 관점 |
| 비즈니스 임팩트 | 수익/비용/시장 영향 고려 |
| 가치 전달 | 기술 ≠ 비즈니스 구분 |
| 시장 현실 | 이상 < 실용 |

B2C/B2B/B2G 전 영역 적용.

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

- `KRA_API_KEY` - Korea Horse Racing Association API
- `KSPO_API_KEY` - National Sports Promotion Foundation API (cycle & boat)
- `NEXT_PUBLIC_SITE_URL` - Site URL for SEO

When API keys are missing, the app falls back to dummy data from `lib/api-helpers/dummy.ts`.

## Active Technologies
- TypeScript 5.9 + Node.js 20 LTS (004-data-platform-phase1)
- TypeScript 5.9 + Next.js 14.2 (App Router) + React 18.3, Tailwind CSS 3.4, Pretendard fon (005-seo-optimization)
- N/A (external API data, cached via Next.js ISR) (005-seo-optimization)
- N/A (외부 공공 API 데이터, Next.js ISR 캐싱) (006-production-hardening)

- TypeScript 5.9 + Next.js 14.2 (App Router), React 18.3, Tailwind CSS 3.4 (001-race-results-history)
- N/A (external API data, cached via Next.js fetch caching) (001-race-results-history)
- TypeScript 5.9 + Next.js 14.2 (App Router), React 18.3, Tailwind CSS 3.4 + Tailwind CSS (styling), Pretendard (typography), existing M3 tokens in `src/styles/tokens.ts` (002-design-system)
- N/A (design system - no data persistence) (002-design-system)
- TypeScript 5.9.3 + Next.js 14.2.33, React 18.3.1, Tailwind CSS 3.4.0 (003-layout-dashboard-social)

## Recent Changes

- 001-race-results-history: Added TypeScript 5.9 + Next.js 14.2 (App Router), React 18.3, Tailwind CSS 3.4

---

## Vibe Coding: Effective AI Collaboration

### Philosophy

**"AI is a Pair Programming Partner, Not Just a Tool"**

Collaboration with Claude is not mere code generation—it's a process of sharing thought processes and solving problems together.

### 1. Context Provision Principles

**Provide Sufficient Background:**
```markdown
# BAD: No context
"Create a login feature"

# GOOD: Rich context
"Our project uses Next.js 14 + Supabase.
Auth-related code is in /app/auth folder.
Following existing patterns, add OAuth login.
Reference: src/app/auth/login/page.tsx"
```

**Context Checklist:**
- [ ] Specify project tech stack
- [ ] Provide relevant file paths
- [ ] Mention existing patterns/conventions
- [ ] Describe expected output format
- [ ] State constraints and considerations

### 2. Iterative Refinement Cycle

```
VIBE CODING CYCLE

1. SPECIFY    → Describe desired functionality specifically
2. GENERATE   → Claude generates initial code
3. REVIEW     → Review generated code yourself
4. REFINE     → Provide feedback for modifications
5. VERIFY     → Run tests and verify edge cases

Repeat 2-5 as needed
```

### 3. Effective Prompt Patterns

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

### 4. Boundaries

**DO NOT delegate to Claude:**
- Security credential generation/management
- Direct production DB manipulation
- Code deployment without verification
- Sensitive business logic full delegation

**Human verification REQUIRED:**
- Security-related code (auth, permissions)
- Financial transaction logic
- Personal data processing code
- Irreversible operations
- External API integration code

### 5. Vibe Coding Checklist

```
Before Starting:
- [ ] Shared CLAUDE.md file with Claude?
- [ ] Explained project structure and conventions?
- [ ] Clearly defined task objectives?

During Coding:
- [ ] Providing sufficient context?
- [ ] Understanding generated code?
- [ ] Giving specific feedback?

After Coding:
- [ ] Personally reviewed generated code?
- [ ] Ran tests?
- [ ] Verified security-related code?
- [ ] Removed AI mentions from commit messages?
```

