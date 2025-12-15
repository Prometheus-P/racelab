# Implementation Plan: Production Hardening

**Branch**: `006-production-hardening` | **Date**: 2025-12-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-production-hardening/spec.md`

## Summary

프로덕션 안정성 강화를 위한 내부 개선 작업. 주요 변경 사항:
1. **P0**: KST 타임존 기반 날짜 처리 일관성 확보, 홈 페이지 API 중복 호출 제거 (6회→3회)
2. **P1**: API 장애/데이터 없음 상태 구분, Race type config 단일화, 타입 안전성 강화
3. **P2**: 로깅 유틸 추가, 테스트 강화 (선택)

기존 Next.js 14 App Router 구조를 유지하면서 리팩토링 진행.

## Technical Context

**Language/Version**: TypeScript 5.9 + Next.js 14.2 (App Router)
**Primary Dependencies**: React 18.3, Tailwind CSS 3.4, Pretendard font
**Storage**: N/A (외부 공공 API 데이터, Next.js ISR 캐싱)
**Testing**: Jest (UI + API) + Playwright (E2E)
**Target Platform**: Vercel Edge Functions (Web)
**Project Type**: Web application (Next.js App Router - Server Components)
**Performance Goals**: 홈 페이지 API 호출 50% 감소, 에러 피드백 2초 내 표시
**Constraints**: API 타임아웃 10초, 공공 API rate limit 고려
**Scale/Scope**: 기존 코드베이스 리팩토링 (신규 페이지 없음)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle | Compliance | Notes |
| --------- | ---------- | ----- |
| I. Test-Driven Development | ✅ PASS | 날짜 유틸, API 함수에 대한 단위 테스트 추가 예정 |
| II. Structural-Behavioral Separation | ✅ PASS | Config 파일 분리(구조) → 컴포넌트 수정(행동) 순서로 진행 |
| III. Simplicity First | ✅ PASS | 기존 구조 유지, 최소 변경으로 문제 해결 |
| IV. Clear Data Flow | ✅ PASS | fetchTodayAllRaces → props 전달 패턴으로 데이터 흐름 명확화 |
| V. Mobile-First Responsive Design | ✅ PASS | UI 변경 없음 (에러 배너만 추가) |

**Quality Gates Checklist**:
- [ ] TDD cycle followed (date utils, API wrapper tests first)
- [ ] Structural and behavioral changes in separate commits
- [ ] No unnecessary complexity beyond requirements
- [ ] Data flow follows established pattern
- [ ] All tests pass including E2E critical paths

## Project Structure

### Documentation (this feature)

```text
specs/006-production-hardening/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (affected files)

```text
src/
├── app/
│   ├── page.tsx                    # [MODIFY] 홈 - fetchTodayAllRaces 호출, props 전달
│   └── race/[id]/page.tsx          # [MODIFY] 상세 - RaceFetchResult 처리, mock 제거
├── components/
│   ├── TodayRaces.tsx              # [MODIFY] props로 데이터 수신, 내부 fetch 제거
│   ├── QuickStats.tsx              # [MODIFY] props로 데이터 수신, 내부 fetch 제거
│   └── ErrorBanner.tsx             # [NEW] UPSTREAM_ERROR 표시용 배너 컴포넌트
├── config/
│   └── raceTypes.ts                # [NEW] RACE_TYPES 중앙 설정
├── lib/
│   ├── api.ts                      # [MODIFY] fetchTodayAllRaces, RaceFetchResult 타입 추가
│   ├── utils/
│   │   └── date.ts                 # [MODIFY] normalizeRaceDate, buildRaceStartDateTime 추가
│   └── seo/
│       └── schemas.ts              # [MODIFY] race.date undefined 처리
└── types/
    └── index.ts                    # [MODIFY] RaceFetchStatus, TodayRacesData 타입 추가

src/lib/utils/
│   └── date.test.ts                # [EXISTING] 날짜 유틸 테스트 (tests added)
src/config/
│   └── __tests__/raceTypes.test.ts # [NEW] config 테스트
e2e/tests/
    └── error-states.spec.ts        # [NEW] API 장애 시나리오 테스트
```

**Structure Decision**: 기존 Next.js App Router 구조 유지. 신규 파일은 `src/config/raceTypes.ts`와 `src/components/ErrorBanner.tsx`만 추가.

## Complexity Tracking

> No violations - all changes follow Constitution principles.

| Area | Approach | Rationale |
| ---- | -------- | --------- |
| API 호출 최적화 | Server Component에서 한 번 fetch → props 전달 | Next.js 권장 패턴, 추가 라이브러리 불필요 |
| 에러 상태 구분 | 단순 Union 타입 (RaceFetchStatus) | 복잡한 Result 모나드 대신 명확한 3-상태 구분 |
| Config 단일화 | Plain object export | Context나 Provider 불필요, 정적 데이터 |
