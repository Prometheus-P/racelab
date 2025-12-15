# v1.4 Refine Cycle: 구현 계획 (Implementation Plan)

## 0. 개요 (Overview)

- **목표**: racelab 프로젝트를 "예쁘게 포장된 데모" 수준에서 "실제 서비스로 돌릴 수 있는 최소 프로덕션" 수준으로 끌어올리는 v1.4 Refine 사이클을 2~3주 이내에 완료한다.
- **기간**: 2~3주
- **기반 스펙**: [v1.4 Refine Cycle: Project to Production-Ready Specification](./spec.md)
- **전제**: Next.js 14 (App Router) + React 18 + TypeScript + Tailwind + Vercel 구조를 유지하며, 새로운 기술 스택 추가는 없다.

## 1. 워크스트림 (Workstreams)

### 1.1 문서/거버넌스 (Documentation/Governance)

- **기간**: 0.5주
- **목표**: 프로젝트 문서의 단일 진실(SSOT)을 확립하고, 문서의 역할을 명확히 한다.
- **구체적인 변경 대상 파일/디렉토리**:
    - `CONTEXT.md`
    - `docs/technical/TECHNICAL_DESIGN.md`
    - `docs/technical/API_README_v2.md`
- **예상 브랜치 전략**: `feature/docs-governance-v1.4`
- **테스트 전략**:
    - **Jest**: 없음 (문서 변경에 대한 코드 테스트 불필요)
    - **Playwright**: 없음
    - **수동 검증**: 변경된 문서들의 내용, 버전 정보, 알려진 이슈 업데이트 여부 및 상단 요약 섹션 추가 여부 확인.
- **롤백 전략**:
    - 해당 브랜치의 커밋을 `git revert`하여 이전 상태로 되돌린다.
    - 변경 전 파일 내용을 백업한다.

---

### 1.2 도메인/타입/서비스 (Domain/Types/Services)

- **기간**: 1주
- **목표**: 핵심 도메인 모델(Race, Entry 등)을 보강하고, 외부 API 로직을 체계화된 서비스 레이어로 분리한다.
- **구체적인 변경 대상 파일/디렉토리**:
    - `src/types/index.ts` (기존 타입 재정의 또는 분리)
    - `src/types/race.ts`, `src/types/entry.ts`, `src/types/result.ts`, `src/types/oddsSnapshot.ts` (신규)
    - `src/lib/api/kraClient.ts`, `src/lib/api/kspoCycleClient.ts`, `src/lib/api/kspoBoatClient.ts` (신규/기존 분리)
    - `src/lib/services/raceService.ts` (신규/기존 통합)
    - `src/app/api/races/.../route.ts` (API Route 핸들러 수정)
    - `src/app/api/results/.../route.ts` (API Route 핸들러 수정)
- **예상 브랜치 전략**: `feature/domain-api-refactor-v1.4`
- **테스트 전략**:
    - **Jest**:
        - `src/types/*.ts` 파일에 정의된 도메인 타입에 대한 유닛 테스트 추가 (특히 ID 생성의 결정성, `date`, `meetCode` 포함 여부).
        - 외부 API raw 응답 → 내부 도메인 타입 매핑 로직에 대한 유닛 테스트 (매퍼 유닛 테스트).
        - `raceService.ts` 내의 고수준 도메인 함수들에 대한 유닛 테스트.
        - API Route 핸들러의 HTTP 파라미터 검증, 서비스 호출, 에러 변환 로직에 대한 통합 테스트.
    - **Playwright**:
        - E2E 테스트 시나리오를 통해 변경된 API 로직이 UI에 올바른 데이터를 제공하는지 확인 (기존 `e2e/tests/api.spec.ts` 수정 및 확장).
- **롤백 전략**:
    - 해당 브랜치에서 문제가 발생하면 `git revert`를 통해 도메인/타입/서비스 변경 전 커밋으로 되돌린다.
    - 새로운 타입 파일(`src/types/*.ts`) 및 서비스 레이어 파일(`src/lib/services/raceService.ts`)은 삭제한다.

---

### 1.3 UI/UX (User Interface/User Experience)

- **기간**: 1주
- **목표**: 경주 상세 페이지를 정보 구조 중심으로 리디자인하고, 로딩/에러/빈 상태 UX를 강화한다.
- **구체적인 변경 대상 파일/디렉토리**:
    - `src/app/race/[id]/page.tsx` (경주 상세 페이지 메인 로직)
    - `src/components/...` (상단 요약 카드, 통합 출전표 테이블, 결과/배당 섹션, 핵심 인사이트 블록 등 신규/수정 컴포넌트)
    - `src/components/ui/Skeleton.tsx`, `src/components/ui/M3Snackbar.tsx` 등 (로딩/에러 컴포넌트 활용)
- **예상 브랜치 전략**: `feature/race-detail-ux-v1.4`
- **테스트 전략**:
    - **Jest**:
        - 리디자인된 각 UI 컴포넌트의 유닛 테스트 (렌더링, props 처리, 조건부 로직 등).
        - 로딩/에러/빈 상태 컴포넌트의 시각적/기능적 유닛 테스트.
    - **Playwright**:
        - 경주 상세 페이지 E2E 테스트 추가 (레이아웃, 정보 표시, 로딩/에러 상태 전환, 재시도 버튼 동작 등).
        - (Note: 모바일 반응형 디자인에 대한 E2E 테스트는 이번 사이클에서는 제외됩니다.)
- **롤백 전략**:
    - UI/UX 변경 사항은 시각적인 영향이 크므로, 문제가 발생하면 `git revert`로 이전 브랜치로 빠르게 되돌린다.
    - 주요 컴포넌트들은 기능적으로 독립성을 유지하여 롤백의 영향을 최소화한다.

---

### 1.4 관측/SEO (Observability/SEO)

- **기간**: 0.5주
- **목표**: GA4, Search Console 연동 및 에러 모니터링을 초기 세팅하고, SEO를 최적화한다.
- **구체적인 변경 대상 파일/디렉토리**:
    - `ENVIRONMENT.md` (GA_ID, Search Console 설정 문서화)
    - `src/app/layout.tsx` (GA4 스크립트 삽입, `schema.org` 메타데이터)
    - `src/app/race/[id]/page.tsx` (개별 경주 상세 페이지 `schema.org` 데이터, URL 패턴 적용)
    - `src/lib/utils/ga.ts` (신규, GA 이벤트 로깅 함수)
    - `src/lib/utils/errorLogger.ts` (신규, Sentry 또는 유사 서비스 연동 로직)
- **예상 브랜치 전략**: `feature/observability-seo-v1.4`
- **테스트 전략**:
    - **Jest**:
        - GA 이벤트 로깅 함수 유닛 테스트 (올바른 이벤트 데이터 전송).
        - 에러 로깅 함수 유닛 테스트 (Sentry 연동 확인 - Mocking 필요).
    - **Playwright**:
        - E2E 테스트를 통해 GA 이벤트가 올바르게 트리거되는지 확인 (네트워크 요청 스파이).
        - 경주 상세 페이지의 URL 구조가 변경 요구사항에 맞는지 검증.
        - `schema.org` 메타데이터가 HTML에 올바르게 포함되는지 E2E로 검증.
- **롤백 전략**:
    - `git revert`를 통해 변경 전 커밋으로 되돌린다.
    - GA/Sentry 연동은 외부 서비스이므로, 설정 파일만 제거하면 서비스에는 영향이 없다.

## 2. 비범위 (Out of Scope for this Cycle)

- 회원 시스템/로그인/알림 기능 구현
- 구독/유료 결제 시스템 구축
- 별도의 백엔드 서버(Next.js 외) 도입 및 운영 자동화
- ML/AI 기반 추천/분석 기능

## 3. 타임라인 요약 (Timeline Summary)

- **1주차**: 문서/거버넌스 & 도메인/타입/서비스 워크스트림 완료
- **2주차**: UI/UX 워크스트림 완료
- **2.5주차**: 관측/SEO 워크스트림 완료 및 전체 통합 테스트, QA
- **3주차**: 최종 검토 및 배포 준비

**Note**: 위 기간은 각 워크스트림의 독립적인 진행을 가정한 것이며, 실제로는 병렬적으로 진행될 수 있습니다. 필요 시 각 워크스트림 내에서 세부 태스크를 더 나눌 수 있습니다.

## 4. 의존성 (Dependencies)

- 각 워크스트림은 가능한 한 독립적으로 진행되나, '도메인/타입/서비스'의 변경 사항은 'UI/UX' 및 '관측/SEO' 워크스트림에 직접적인 영향을 미친다.
- '문서/거버넌스'는 다른 워크스트림의 진행 상황에 따라 지속적으로 업데이트가 필요할 수 있다.

## 5. 승인 (Approval)

- [ ] Product Owner
- [ ] Technical Lead

이 계획은 v1.4 Refine 사이클의 성공적인 구현을 위한 가이드라인입니다. 계획은 프로젝트 진행 상황에 따라 유연하게 조정될 수 있습니다.
