# KRace 프로젝트 슬림화 최종 권고안 (K-Vegas Pivot 기준)

> **작성일**: 2025-12-15
> **목적**: 1인 스타트업 운영 효율성 극대화 및 K-Vegas 관광 플랫폼 MVP 피벗 준비
> **예상 효과**: 문서 관리 비용 50% 절감, 코드베이스 30-40% 감소

---

## A. 불필요 문서 및 프로세스 (삭제/폐기 권고)

### A.1 과도한 프로세스 정의 (즉시 삭제)

| 파일/폴더 | 사유 | 권고 조치 |
|:---|:---|:---|
| `.claude/commands/speckit.*.md` (9개 파일) | Agent 의존적 워크플로우. 1인 개발에서 과도한 프로세스 오버헤드 발생 | **삭제** - 필요시 단순 체크리스트로 대체 |
| `.specify/memory/constitution.md` | 대규모 팀용 개발 헌장. MVP 단계에서 불필요한 엄격한 규칙 | **삭제** - 핵심 원칙만 `CONTRIBUTING.md`에 병합 |
| `.specify/templates/` (5개 파일) | spec-kit 프레임워크 의존성. 피벗 후 무용지물 | **삭제** |
| `.specify/scripts/bash/` (5개 스크립트) | 자동화 스크립트지만 새 워크플로우와 불일치 | **삭제** |

### A.2 중복/과도한 문서 (폐기 또는 통합)

| 파일/폴더 | 사유 | 권고 조치 |
|:---|:---|:---|
| `docs/guides/TDD_GUIDE.md` | `TDD_RULES.md`와 중복. 초기 MVP에서 과도 | `CONTRIBUTING.md`에 핵심만 병합 후 **삭제** |
| `docs/guides/CLEAN_CODE_GUIDE.md` | 좋은 가이드지만 별도 문서로 관리 불필요 | `CONTRIBUTING.md`에 핵심만 병합 후 **삭제** |
| `docs/guides/TEST_STRATEGY_GUIDE.md` | `TEST_GUIDE.md`와 중복 | **삭제** |
| `docs/TDD_RULES.md` (5.7K) | 1인 개발에서 과도한 TDD 강제 규칙 | 핵심만 `CONTRIBUTING.md`에 요약 후 **삭제** |
| `docs/operations/INCIDENT_RESPONSE.md` | 초기 MVP에 불필요한 운영 문서 | **삭제** - 장애 발생 시 `README`로 대응 |
| `docs/operations/RUNBOOK.md` | 운영 팀 부재 상황에서 불필요 | **삭제** |
| `docs/operations/MONITORING.md` | Vercel 기본 모니터링으로 충분 | **삭제** |
| `docs/operations/DEPLOYMENT_OPERATIONS.md` | `DEPLOYMENT_CHECKLIST.md`와 중복 | **삭제** |

### A.3 구시대적 UI 스펙 (피벗으로 인한 폐기)

| 파일/폴더 | 사유 | 권고 조치 |
|:---|:---|:---|
| `docs/SCREEN_DEFINITIONS.md` (5.4K) | 경마 UI 정의. K-Vegas에서 전면 재설계 필요 | **폐기** |
| `docs/WIREFRAME_BRIEFS.md` (3.7K) | 경마 와이어프레임. 재사용 불가 | **폐기** |
| `docs/ui-results-strategy-lab.md` (21K) | 경마 결과 분석 UI. 관광과 무관 | **폐기** |
| `docs/ui-horse-explorer.md` (12K) | 경마 탐색기 UI 스펙 | **폐기** |
| `docs/ui-race-explorer.md` (11K) | 경주 탐색기 UI 스펙 | **폐기** |
| `docs/ui-today-dashboard.md` (9.8K) | 오늘의 경주 대시보드 스펙 | **폐기** |
| `docs/AI_PIPELINE_DESIGN.md` (25K) | AI 예측 파이프라인. Phase 3 이후로 연기 | **아카이브** (`/archive/`) |

### A.4 기존 Feature Specs (아카이브)

| 파일/폴더 | 사유 | 권고 조치 |
|:---|:---|:---|
| `specs/001-refine-to-production/` | 경마 플랫폼 기준 프로덕션 스펙 | **아카이브** |
| `specs/002-design-system/` | M3 디자인 시스템 - 일부 재활용 가능 | **유지** (컴포넌트 참조용) |
| `specs/003-layout-dashboard-social/` | 경마 레이아웃 스펙 | **아카이브** |
| `specs/004-race-results-history/` | 경주 결과 이력 - 관광과 무관 | **폐기** |
| `specs/005-seo-optimization/` | SEO 스펙 - K-Vegas에서도 재활용 가능 | **유지** |
| `specs/006-production-hardening/` | 프로덕션 안정화 - 재활용 가능 | **유지** |

**예상 삭제량**: ~150K+ (문서 약 50% 감소)

---

## B. Frontend 비핵심 기능 (삭제/이동 권고)

### B.1 메인 페이지 교육 섹션 (제거 또는 이동)

| 컴포넌트/경로 | 사유 | 권고 조치 |
|:---|:---|:---|
| `src/app/home-components/RaceTypesGuide.tsx` (2.7K) | 경마/경륜/경정 설명. 관광과 무관 | **삭제** |
| `src/app/home-components/OddsGuideSection.tsx` (3.3K) | 배당률 교육. 관광과 완전 무관 | **삭제** |
| `src/app/home-components/TrackGuideSection.tsx` (4.2K) | 경마장 가이드. 관광 명소로 대체 필요 | **삭제** 후 새 컴포넌트로 대체 |
| `src/app/home-components/BeginnerGuideSection.tsx` (2.9K) | 초보자 가이드. 경마 맥락 | **삭제** |
| `src/app/home-components/schemas.ts` | FAQ/HowTo 스키마 - 경마 내용 | **수정** (관광 내용으로 교체) |

### B.2 페이지 컴포넌트 호출 제거 (`src/app/page.tsx`)

```tsx
// 삭제해야 할 임포트 및 호출:
import { RaceTypesGuide, OddsGuideSection, TrackGuideSection, BeginnerGuideSection } from './home-components';

// return 문 내에서 삭제:
<RaceTypesGuide />
<OddsGuideSection />
<TrackGuideSection />
<BeginnerGuideSection />
```

| 권고 조치 | 설명 |
|:---|:---|
| `/guide` 페이지로 링크 처리 | 상세 가이드는 별도 페이지로 분리, 메인은 CTA 중심으로 |
| 새 관광 섹션으로 대체 | `<FeaturedTours />`, `<PopularDestinations />`, `<BookingCTA />` 등 |

### B.3 경주 전용 컴포넌트 (삭제)

| 컴포넌트 | 크기 | 사유 | 권고 조치 |
|:---|:---|:---|:---|
| `src/components/race-detail/EntryTable.tsx` | 8.6K | 출전표 - 경마 전용 | **삭제** |
| `src/components/race-detail/KeyInsightBlock.tsx` | 5.9K | 경주 인사이트 - 경마 전용 | **삭제** |
| `src/components/race-detail/RaceResultsOdds.tsx` | 8.1K | 배당률 표시 - 경마 전용 | **삭제** |
| `src/components/race-detail/RaceSummaryCard.tsx` | 4.8K | 경주 요약 - 경마 전용 | **삭제** |
| `src/components/race-detail/RaceDetailSkeleton.tsx` | 5.4K | 로딩 스켈레톤 - 경마 구조 | **삭제** |
| `src/components/TodayRaces.tsx` | 5.6K | 오늘의 경주 - 경마 전용 | **삭제** |
| `src/components/QuickStats.tsx` | 3.0K | 경주 통계 - 경마 전용 | **삭제** |
| `src/components/OddsDisplay.tsx` | 2.8K | 배당률 표시 | **삭제** |
| `src/components/EntryList.tsx` | 3.2K | 출전 목록 | **삭제** |
| `src/components/StatusBadge.tsx` | - | 경주 상태 뱃지 | **삭제** |

### B.4 결과/필터 컴포넌트 (판단 필요)

| 컴포넌트 | 사유 | 권고 조치 |
|:---|:---|:---|
| `src/components/ResultCard.tsx` | 일반적 카드 - 관광 상품 카드로 리팩토링 가능 | **수정하여 유지** |
| `src/components/ResultFilters.tsx` | 필터 패턴 - 관광 필터로 재활용 가능 | **수정하여 유지** |
| `src/components/Pagination.tsx` | 범용 컴포넌트 | **유지** |
| `src/components/DateRangeFilter.tsx` | 범용 - 예약 날짜에 활용 | **유지** |

### B.5 Dashboard 페이지

| 경로 | 사유 | 권고 조치 |
|:---|:---|:---|
| `src/app/dashboard/page.tsx` | Home과 역할 중복. 현재 빈 상태 | **삭제** 또는 관광 대시보드로 재정의 |

**예상 삭제량**: ~60K+ (컴포넌트 약 40% 감소)

---

## C. 기술 의존성 및 테스트 (축소/연기 권고)

### C.1 테스트 파일 (연기/삭제)

| 파일 | 사유 | 권고 조치 |
|:---|:---|:---|
| `e2e/tests/seo/performance.spec.ts` | MVP 단계에서 성능 테스트 과도 | **연기** (Phase 2 이후) |
| `src/components/race-detail/*.test.tsx` (5개) | 삭제될 컴포넌트 테스트 | **삭제** (컴포넌트와 함께) |
| `src/components/TodayRaces.test.tsx` | 삭제될 컴포넌트 테스트 | **삭제** |
| `src/components/QuickStats.test.tsx` | 삭제될 컴포넌트 테스트 | **삭제** |
| `src/components/OddsDisplay.test.tsx` | 삭제될 컴포넌트 테스트 | **삭제** |

### C.2 Mock/Dummy 데이터 (정리)

| 파일 | 크기 | 사유 | 권고 조치 |
|:---|:---|:---|:---|
| `src/lib/api-helpers/dummy.ts` | 72 lines | 경마 더미 데이터 - 프로덕션 코드에 불필요 | 테스트 파일로 이동 후 **삭제** |
| `src/lib/mockHistoricalResults.ts` | 577 lines | 경마 이력 목 데이터 | **삭제** |
| `src/lib/mockData.ts` | 47 lines | 기타 목 데이터 | 테스트로 이동 후 **삭제** |

### C.3 M3 컴포넌트 (평가 후 단순화)

| 컴포넌트 | 사유 | 권고 조치 |
|:---|:---|:---|
| `src/components/ui/M3Button.tsx` | Tailwind Button으로 대체 가능 | **단순화 검토** |
| `src/components/ui/M3Card.tsx` | 유지 - 범용성 높음 | **유지** |
| `src/components/ui/M3Chip.tsx` | Tailwind Badge로 대체 가능 | **단순화 검토** |
| `src/components/ui/M3Dialog.tsx` | 유지 - 모달 필수 | **유지** |
| `src/components/ui/M3SearchBar.tsx` | 유지 - 검색 필수 | **유지** |
| `src/components/ui/M3Snackbar.tsx` | 유지 - 알림 필수 | **유지** |
| `src/components/ui/M3TextField.tsx` | 유지 - 폼 필수 | **유지** |

**권고**: M3 라이브러리 전체 유지. 단순화보다 일관성이 더 중요.

### C.4 API 관련 (리팩토링)

| 파일 | 크기 | 사유 | 권고 조치 |
|:---|:---|:---|:---|
| `src/lib/api-helpers/mappers.ts` | 36K | KRA/KSPO API 매핑 - 관광 API로 교체 필요 | **리팩토링** (관광 API용) |
| `src/lib/api/kraClient.ts` | - | 마사회 API 클라이언트 | **삭제** |
| `src/lib/api/kspoCycleClient.ts` | - | 경륜 API 클라이언트 | **삭제** |
| `src/lib/api/kspoBoatClient.ts` | - | 경정 API 클라이언트 | **삭제** |

### C.5 타입 정의 (정리)

| 파일 | 사유 | 권고 조치 |
|:---|:---|:---|
| `src/types/index.ts` | Race, Entry, Odds 등 경마 타입 다수 | **리팩토링** (관광 타입으로 교체) |

**예상 효과**: 빌드 타임 20-30% 개선, 테스트 실행 시간 40% 단축

---

## D. 장기 기능 연기 확정 기능

### D.1 Phase 3 이후로 무조건 연기 (3개월 내 매출 목표 불기여)

- [ ] **AI 예측 기능** (`AI_PIPELINE_DESIGN.md` 전체)
  - 승률 예측 모델
  - 배당률 분석 AI
  - 패턴 인식 알고리즘

- [ ] **고급 데이터 분석**
  - 역사적 트렌드 분석
  - 경주마 성적 추적
  - 기수/조교사 분석

- [ ] **실시간 기능**
  - 실시간 배당률 업데이트 (WebSocket)
  - 라이브 경주 중계 연동
  - 푸시 알림 시스템

- [ ] **소셜 기능**
  - 사용자 예측 공유
  - 커뮤니티 기능
  - 리더보드

- [ ] **복잡한 시각화**
  - 인터랙티브 차트
  - 3D 트랙 뷰
  - AR/VR 경험

### D.2 MVP 범위 확정 (K-Vegas)

**포함 (Phase 1 - 3개월)**:
- [ ] 관광 상품 목록 조회
- [ ] 상품 상세 페이지
- [ ] 예약 폼 (연락처 수집)
- [ ] 다국어 지원 (ko/en/zh/ja)
- [ ] 기본 SEO
- [ ] Vercel 배포

**포함 (Phase 2 - 6개월)**:
- [ ] 결제 연동 (Toss/Stripe)
- [ ] 사용자 계정
- [ ] 예약 관리
- [ ] 리뷰 시스템

---

## E. 실행 계획

### 1단계: 즉시 삭제 (Day 1)
```bash
# 문서 정리
rm -rf .claude/commands/speckit.*.md
rm -rf .specify/
rm -rf docs/guides/
rm -rf docs/operations/
rm docs/SCREEN_DEFINITIONS.md docs/WIREFRAME_BRIEFS.md
rm docs/ui-*.md

# specs 아카이브
mkdir -p archive/specs
mv specs/001-* specs/003-* specs/004-* archive/specs/
```

### 2단계: 컴포넌트 정리 (Day 2-3)
```bash
# 경마 컴포넌트 삭제
rm -rf src/components/race-detail/
rm src/components/TodayRaces.tsx src/components/QuickStats.tsx
rm src/components/OddsDisplay.tsx src/components/EntryList.tsx
rm src/components/StatusBadge.tsx

# 홈 컴포넌트 정리
rm src/app/home-components/*Guide*.tsx
```

### 3단계: API/타입 리팩토링 (Day 4-7)
- 새 관광 타입 정의
- API 클라이언트 교체
- 매퍼 리팩토링

### 4단계: 새 MVP 컴포넌트 구현 (Week 2+)
- TourCard, BookingForm, DestinationList 등

---

## F. 예상 효과 요약

| 지표 | Before | After | 개선율 |
|:---|:---|:---|:---|
| 문서 파일 수 | ~50개 | ~20개 | 60% 감소 |
| 컴포넌트 수 | 80개 | ~45개 | 44% 감소 |
| 코드베이스 크기 | 1.4MB | ~900KB | 35% 감소 |
| 테스트 파일 | 63개 | ~35개 | 44% 감소 |
| 빌드 타임 | ~45s | ~30s | 33% 개선 |
| 문서 관리 비용 | High | Low | 70% 절감 |

---

*이 권고안은 K-Vegas 관광 플랫폼 피벗을 위한 기술 부채 정리 및 개발 효율성 극대화를 목표로 합니다.*
