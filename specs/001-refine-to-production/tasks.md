# v1.4 Refine Cycle: GitHub Issue Tasks

This document outlines the detailed tasks for the v1.4 Refine Cycle, categorized by workstream and suitable for direct import as GitHub Issues.

## Workstream 1: 문서/거버넌스 (Documentation/Governance)

### Task: CONTEXT.md 업데이트 및 정리 [X]
- **Label**: `docs`, `refactor`
- **Description**: 현재 릴리즈 버전(v1.3.x)을 반영하여 `CONTEXT.md`의 버전 정보, 변경 이력, 알려진 이슈를 업데이트한다. 해결된 이슈는 제거하거나 "해결됨"으로 명시하여 레포 전체의 SSOT 역할을 강화한다.
- **Target Files/Directories**: `CONTEXT.md`
- **Acceptance Criteria**:
    - `CONTEXT.md`의 `version`이 v1.3.x (또는 현재 릴리즈 버전)으로 업데이트된다.
    - `CHANGELOG` 섹션에 v1.3.x에 대한 변경 내역이 추가된다.
    - `알려진 이슈` 섹션에서 해결된 이슈(`public` 디렉토리 등)가 제거되거나 상태가 "해결됨"으로 업데이트된다.
    - `CONTEXT.md` 상단에 "이 문서가 무엇을 책임지는지"를 3줄로 요약하는 인트로 섹션이 추가된다.
- **Related Tasks**: None

### Task: API 스펙 단일 진실 정의 및 문서 요약 [X]
- **Label**: `docs`, `refactor`
- **Description**: `docs/technical/API_README_v2.md`를 외부 API 최종 스펙으로 지정하고, `docs/technical/TECHNICAL_DESIGN.md` 내의 API 상세 테이블은 요약만 남기고 파라미터/필드/코드 목록은 `API_README_v2.md`로 위임한다.
- **Target Files/Directories**:
    - `docs/technical/API_README_v2.md`
    - `docs/technical/TECHNICAL_DESIGN.md`
- **Acceptance Criteria**:
    - `docs/technical/API_README_v2.md`가 외부 API의 최종적이고 상세한 스펙을 포함한다.
    - `docs/technical/TECHNICAL_DESIGN.md`의 API 명세 섹션이 엔드포인트 그룹 설명과 `API_README_v2.md`로의 링크만 남긴 채 요약 형태로 변경된다.
    - `docs/technical/API_README_v2.md` 상단에 "이 문서가 무엇을 책임지는지"를 3줄로 요약하는 인트로 섹션이 추가된다.
    - `docs/technical/TECHNICAL_DESIGN.md` 상단에 "이 문서가 무엇을 책임지는지"를 3줄로 요약하는 인트로 섹션이 추가된다.
- **Related Tasks**: None

## Workstream 2: 도메인/타입/서비스 (Domain/Types/Services)

### Task: Race 도메인 타입 확장 (ID 및 필수 필드) [X]
- **Label**: `enhancement`, `refactor`, `test`
- **Description**: `Race` 도메인 타입에 `date` (YYYY-MM-DD), `meetCode` (원시 회차/시행 코드) 필드를 추가하고, `id` 필드를 "type-<meetCode>-<raceNo>-<date>" 형태로 안정적이고 결정적으로 생성되도록 규격화한다.
- **Target Files/Directories**:
    - `src/types/index.ts` 또는 `src/types/race.ts` (신규)
    - 외부 API raw 응답을 파싱하는 매핑 로직 관련 파일
- **Acceptance Criteria**:
    - `Race` 타입 정의에 `date: string` 및 `meetCode: string` 필드가 추가된다.
    - `Race` 객체 생성 시 `id`가 `type-<meetCode>-<raceNo>-<date>` 형식으로 결정적으로 생성됨을 보장한다.
    - 해당 변경에 대한 유닛 테스트(Jest)가 추가되고 통과한다. (ID 생성 결정성, 필수 필드 포함 여부)
- **Related Tasks**: `Task: 하위 도메인 타입 (Entry/Runner) 정리`, `Task: 외부 API 클라이언트 모듈 분리`

### Task: 하위 도메인 타입 (Entry/Runner) 정리 [X]
- **Label**: `enhancement`, `refactor`, `test`
- **Description**: `Entry`/`Runner` 등 `Race`의 하위 도메인 타입을 경마/경륜/경정 종목별 요구사항에 맞춰 필드를 정리한다.
- **Target Files/Directories**:
    - `src/types/index.ts` 또는 `src/types/entry.ts` (신규)
    - 외부 API raw 응답을 파싱하는 매핑 로직 관련 파일
- **Acceptance Criteria**:
    - `Entry` 타입 정의에 경마(말/기수/조교사/마방/부담중량/연령/최근 성적), 경륜/경정(선수/기수/모터/보트/기록/점수/최근 성적) 필드가 명확히 정의된다.
    - 해당 변경에 대한 유닛 테스트(Jest)가 추가되고 통과한다.
- **Related Tasks**: `Task: Race 도메인 타입 확장 (ID 및 필수 필드)`

### Task: 도메인 타입 파일 분리 및 매핑 레이어 구현
- **Label**: `refactor`, `enhancement`, `test`
- **Description**: `src/types` 디렉토리 하위에 도메인 중심의 타입 정의 파일을 분리 생성하고, 외부 API raw 응답 타입과 내부 도메인 타입을 분리하며 매핑 레이어를 명시적으로 구현한다.
- **Target Files/Directories**:
    - `src/types/index.ts` (기존 통합 타입 파일 정리)
    - `src/types/race.ts`, `src/types/entry.ts`, `src/types/result.ts`, `src/types/oddsSnapshot.ts` (신규)
    - `src/lib/api/mappers.ts` 또는 유사 매핑 로직 파일
- **Acceptance Criteria**:
    - 각 핵심 도메인별 타입(`Race`, `Entry`, `Result`, `OddsSnapshot`)이 별도 파일(`src/types/*.ts`)로 분리 정의된다.
    - 외부 API 응답을 위한 raw 타입과 애플리케이션 내부에서 사용될 도메인 타입이 명확히 구분된다.
    - raw 타입을 도메인 타입으로 변환하는 명시적인 매핑 함수가 구현된다.
    - `Race`/`Entry`/`Result`/`OddsSnapshot`에 대한 유닛 테스트 (스냅샷 테스트 포함)가 추가되고 통과한다.
- **Related Tasks**: `Task: Race 도메인 타입 확장 (ID 및 필수 필드)`, `Task: 하위 도메인 타입 (Entry/Runner) 정리`, `Task: 외부 API 클라이언트 모듈 분리`

### Task: 외부 API 클라이언트 모듈 분리 (KRA) [X]
- **Label**: `refactor`, `enhancement`, `test`
- **Description**: 한국마사회(KRA) 관련 외부 API 호출 로직을 `src/lib/api/kraClient.ts`로 분리한다. `API_README_v2.md` 내 어떤 스펙 섹션을 기준으로 했는지 주석으로 명시한다.
- **Target Files/Directories**:
    - `src/lib/api/kraClient.ts` (신규/수정)
    - 기존 외부 API 호출 로직이 있던 파일 (`src/lib/api.ts` 등에서 이동)
- **Acceptance Criteria**:
    - `src/lib/api/kraClient.ts` 파일이 생성되고 KRA 관련 API 호출 함수를 포함한다.
    - 해당 파일 내에 `API_README_v2.md`의 섹션명에 대한 주석이 포함된다.
    - 분리된 클라이언트 모듈에 대한 유닛 테스트가 추가되고 통과한다.
- **Related Tasks**: `Task: 외부 API 클라이언트 모듈 분리 (KSPO 경륜)`, `Task: 외부 API 클라이언트 모듈 분리 (KSPO 경정)`

### Task: 외부 API 클라이언트 모듈 분리 (KSPO 경륜) [X]
- **Label**: `refactor`, `enhancement`, `test`
- **Description**: 국민체육진흥공단(KSPO) 경륜 관련 외부 API 호출 로직을 `src/lib/api/kspoCycleClient.ts`로 분리한다. `API_README_v2.md` 내 어떤 스펙 섹션을 기준으로 했는지 주석으로 명시한다.
- **Target Files/Directories**:
    - `src/lib/api/kspoCycleClient.ts` (신규/수정)
    - 기존 외부 API 호출 로직이 있던 파일
- **Acceptance Criteria**:
    - `src/lib/api/kspoCycleClient.ts` 파일이 생성되고 KSPO 경륜 관련 API 호출 함수를 포함한다.
    - 해당 파일 내에 `API_README_v2.md`의 섹션명에 대한 주석이 포함된다.
    - 분리된 클라이언트 모듈에 대한 유닛 테스트가 추가되고 통과한다.
- **Related Tasks**: `Task: 외부 API 클라이언트 모듈 분리 (KRA)`, `Task: 외부 API 클라이언트 모듈 분리 (KSPO 경정)`

### Task: 외부 API 클라이언트 모듈 분리 (KSPO 경정) [X]
- **Label**: `refactor`, `enhancement`, `test`
- **Description**: 국민체육진흥공단(KSPO) 경정 관련 외부 API 호출 로직을 `src/lib/api/kspoBoatClient.ts`로 분리한다. `API_README_v2.md` 내 어떤 스펙 섹션을 기준으로 했는지 주석으로 명시한다.
- **Target Files/Directories**:
    - `src/lib/api/kspoBoatClient.ts` (신규/수정)
    - 기존 외부 API 호출 로직이 있던 파일
- **Acceptance Criteria**:
    - `src/lib/api/kspoBoatClient.ts` 파일이 생성되고 KSPO 경정 관련 API 호출 함수를 포함한다.
    - 해당 파일 내에 `API_README_v2.md`의 섹션명에 대한 주석이 포함된다.
    - 분리된 클라이언트 모듈에 대한 유닛 테스트가 추가되고 통과한다.
- **Related Tasks**: `Task: 외부 API 클라이언트 모듈 분리 (KRA)`, `Task: 외부 API 클라이언트 모듈 분리 (KSPO 경륜)`

### Task: RaceService 레이어 추가 및 기존 Route 핸들러 리팩토링
- **Label**: `refactor`, `enhancement`, `test`
- **Description**: `src/lib/services/raceService.ts` (혹은 디렉토리)를 생성하여 고수준 도메인 함수를 제공하고, 기존 `src/app/api/races/.../route.ts` 및 `src/app/api/results/.../route.ts` 핸들러들이 `RaceService`를 호출하도록 수정한다. Route 핸들러의 역할은 파라미터 검증, 서비스 호출, 에러 변환으로 제한한다.
- **Target Files/Directories**:
    - `src/lib/services/raceService.ts` (신규/수정)
    - `src/app/api/races/.../route.ts`
    - `src/app/api/results/.../route.ts`
- **Acceptance Criteria**:
    - `src/lib/services/raceService.ts`에 "오늘의 경주 조회", "특정 날짜/종목별 경주 조회", "경주 상세 + 출전표 + 배당 + 결과 묶어서 조회" 등의 고수준 도메인 함수가 구현된다.
    - 모든 `app/api` Route 핸들러가 `raceService`를 통해 데이터를 가져오고, Route 핸들러는 HTTP 파라미터 검증 및 에러 변환 역할만 수행한다.
    - `RaceService` 및 관련 Route 핸들러에 대한 유닛/통합 테스트가 추가되고 통과한다.
- **Related Tasks**: `Task: 외부 API 클라이언트 모듈 분리 (KRA)`, `Task: 외부 API 클라이언트 모듈 분리 (KSPO 경륜)`, `Task: 외부 API 클라이언트 모듈 분리 (KSPO 경정)`

### Task: API 에러 처리 정책 구현
- **Label**: `enhancement`, `test`
- **Description**: 외부 API 오류, 타임아웃, null 응답 시 일관된 기본값/에러 메시지를 반환하도록 에러 처리 로직을 구현한다. "데이터 제공 기관(API) 지연으로 최신 정보가 표시되지 않을 수 있다"는 메시지를 프론트에 전달할 수 있게 한다.
- **Target Files/Directories**:
    - `src/lib/services/raceService.ts`
    - `src/lib/api/errors.ts` (신규) 또는 기존 에러 핸들링 파일
    - 외부 API 클라이언트 모듈들
- **Acceptance Criteria**:
    - `raceService` 및 외부 API 클라이언트 모듈에서 정의된 에러 처리 정책에 따라 오류가 발생할 때 일관된 응답을 반환한다.
    - 프론트엔드에서 표시될 "데이터 제공 기관 지연" 메시지가 정의되고, 관련 에러 발생 시 해당 메시지를 전달할 수 있다.
    - 에러 처리 로직에 대한 유닛 테스트가 추가되고 통과한다.
- **Related Tasks**: `Task: RaceService 레이어 추가 및 기존 Route 핸들러 리팩토링`

## Workstream 3: UI/UX (User Interface/User Experience)

### Task: 경주 상세 페이지 기본 레이아웃 구성 (상단 요약 카드)
- **Label**: `enhancement`, `refactor`, `test`
- **Description**: 경주 상세 페이지 (`src/app/race/[id]/page.tsx`)에 종목, 경주장, 회차, 등급, 거리, 출발 시간, 상태를 한눈에 보여주는 `상단 요약 카드` 컴포넌트를 구현한다.
- **Target Files/Directories**:
    - `src/app/race/[id]/page.tsx`
    - `src/components/race-detail/RaceSummaryCard.tsx` (신규)
- **Acceptance Criteria**:
    - `RaceSummaryCard` 컴포넌트가 구현되고 경주 상세 페이지에 통합된다.
    - 카드 컴포넌트 내에 필요한 모든 정보가 올바르게 표시된다.
    - `RaceSummaryCard` 컴포넌트에 대한 유닛 테스트(Jest)가 추가되고 통과한다.
- **Related Tasks**: `Task: 경주 상세 페이지 기본 레이아웃 구성 (출전표 테이블)`, `Task: RaceService 레이어 추가 및 기존 Route 핸들러 리팩토링`

### Task: 경주 상세 페이지 기본 레이아웃 구성 (통합 출전표 테이블)
- **Label**: `enhancement`, `refactor`, `test`
- **Description**: 경주 상세 페이지에 번호, 마/선수 이름, 기수/조교사/모터/보트, 부담중량/기록, 최근 성적, 배당(단승/복승/쌍승)을 하나의 테이블로 보여주는 `통합 출전표 테이블` 컴포넌트를 구현한다. 현재의 중복되는 섹션은 제거한다.
- **Target Files/Directories**:
    - `src/app/race/[id]/page.tsx`
    - `src/components/race-detail/EntryTable.tsx` (신규/수정)
    - `src/components/HorseEntryTable.tsx` 등 기존 출전표 관련 컴포넌트
- **Acceptance Criteria**:
    - `EntryTable` 컴포넌트가 구현되고 경주 상세 페이지에 통합된다.
    - 테이블 내에 필요한 모든 정보가 올바르게 표시되며, 중복되는 정보 섹션이 제거된다.
    - `EntryTable` 컴포넌트에 대한 유닛 테스트(Jest)가 추가되고 통과한다.
    - 기존 `HorseEntryTable.tsx`는 `EntryTable.tsx`로 통합되거나 참조하는 형태로 수정된다.
- **Related Tasks**: `Task: 경주 상세 페이지 기본 레이아웃 구성 (상단 요약 카드)`

### Task: 경주 상세 페이지 기본 레이아웃 구성 (결과/배당 섹션)
- **Label**: `enhancement`, `refactor`, `test`
- **Description**: 경주 상세 페이지에 착순 순서대로 순위, 번호, 이름, 배당금(단승/복승/쌍승/삼쌍 등)을 테이블로 정리하는 `결과/배당 섹션` 컴포넌트를 구현한다. 값이 없는 경우(`아직 결과 미집계`, `복승 미발매`) 적절한 문구를 표시한다.
- **Target Files/Directories**:
    - `src/app/race/[id]/page.tsx`
    - `src/components/race-detail/RaceResultsOdds.tsx` (신규)
- **Acceptance Criteria**:
    - `RaceResultsOdds` 컴포넌트가 구현되고 경주 상세 페이지에 통합된다.
    - 결과 및 배당 정보가 테이블 형태로 올바르게 표시된다.
    - 값이 없는 경우 정의된 문구가 표시된다.
    - `RaceResultsOdds` 컴포넌트에 대한 유닛 테스트(Jest)가 추가되고 통과한다.
- **Related Tasks**: `Task: 경주 상세 페이지 기본 레이아웃 구성 (통합 출전표 테이블)`

### Task: 경주 상세 페이지 기본 레이아웃 구성 (핵심 인사이트 블록)
- **Label**: `enhancement`, `test`
- **Description**: 경주 상세 페이지에 인기 상위 3두(또는 선수)의 배당, 최근 성적, 실제 결과를 한눈에 비교하는 요약 카드인 `핵심 인사이트 블록` 컴포넌트를 구현한다.
- **Target Files/Directories**:
    - `src/app/race/[id]/page.tsx`
    - `src/components/race-detail/KeyInsightBlock.tsx` (신규)
- **Acceptance Criteria**:
    - `KeyInsightBlock` 컴포넌트가 구현되고 경주 상세 페이지에 통합된다.
    - 인기 상위 3두의 정보가 요약 형태로 비교되어 표시된다.
    - `KeyInsightBlock` 컴포넌트에 대한 유닛 테스트(Jest)가 추가되고 통과한다.
- **Related Tasks**: `Task: 경주 상세 페이지 기본 레이아웃 구성 (결과/배당 섹션)`

### Task: 로딩/에러/빈 상태 UX 적용 (Skeleton/Shimmer/Snackbar)
- **Label**: `enhancement`, `test`
- **Description**: 경주 상세 페이지에 디자인 시스템에 정의된 `Skeleton`/`Shimmer`/`Snackbar`를 활용하여 일관된 로딩, 에러, 빈 상태 UX를 적용한다. 로딩 시 섹션별 Skeleton 유지, 에러 시 재시도 버튼 포함 에러 컴포넌트 표시.
- **Target Files/Directories**:
    - `src/app/race/[id]/page.tsx`
    - `src/components/ui/Skeleton.tsx`, `src/components/ui/M3Snackbar.tsx` 등 기존 컴포넌트 활용
    - `src/components/common/ErrorComponent.tsx` (신규)
- **Acceptance Criteria**:
    - 경주 상세 페이지 각 섹션(요약 카드, 출전표, 결과/배당 등) 데이터 로딩 시 Skeleton UI가 표시된다.
    - API 에러 발생 시 "공공데이터 API 오류/지연" 메시지와 재시도 버튼을 포함한 `ErrorComponent`가 표시된다.
    - 데이터가 비어있을 때 적절한 빈 상태 메시지가 표시된다.
    - 관련 컴포넌트 및 페이지에 대한 유닛 테스트(Jest)가 추가되고 통과한다.
- **Related Tasks**: `Task: 경주 상세 페이지 기본 레이아웃 구성 (상단 요약 카드)` 외 모든 상세 페이지 레이아웃 태스크

## Workstream 4: 관측/SEO (Observability/SEO)

### Task: GA4 및 Search Console 연동 문서화 및 이벤트 구현
- **Label**: `ops`, `seo`, `enhancement`, `test`
- **Description**: `NEXT_PUBLIC_GA_ID`, `Search Console` 설정을 `ENVIRONMENT.md`에 문서화하고, `tab_click` 및 `race_detail_view` 최소 이벤트를 구현한다.
- **Target Files/Directories**:
    - `ENVIRONMENT.md`
    - `src/app/layout.tsx` (GA4 스크립트 삽입)
    - `src/app/api/races/.../route.ts` (이벤트 트리거 로직)
    - `src/app/race/[id]/page.tsx` (이벤트 트리거 로직)
    - `src/lib/utils/ga.ts` (신규)
- **Acceptance Criteria**:
    - `ENVIRONMENT.md`에 GA4 및 Search Console 설정 예시가 추가된다 (민감 값 마스킹).
    - `src/lib/utils/ga.ts`에 `tab_click` 및 `race_detail_view` 이벤트를 전송하는 함수가 구현된다.
    - `tab_click` 이벤트가 경마/경륜/경정 탭 클릭 시 올바른 파라미터와 함께 GA4로 전송된다.
    - `race_detail_view` 이벤트가 경주 상세 페이지 조회 시 올바른 파라미터와 함께 GA4로 전송된다.
    - GA 이벤트 로깅 함수에 대한 유닛 테스트(Jest) 및 E2E 테스트(Playwright)가 추가되고 통과한다.
- **Related Tasks**: `Task: 에러/장애 모니터링 시스템 연동`, `Task: 경주 상세 페이지 URL 패턴 및 Schema.org 적용`

### Task: 에러/장애 모니터링 시스템 연동 (Sentry 예시)
- **Label**: `ops`, `enhancement`, `test`
- **Description**: Sentry 또는 유사 서비스 하나를 Next.js 서버 에러 및 외부 API 호출 에러를 중앙에서 모니터링할 수 있도록 연동한다.
- **Target Files/Directories**:
    - `.env.local` (Sentry DSN 등 환경 변수)
    - `next.config.js` (Sentry SDK 설정)
    - `src/lib/utils/errorLogger.ts` (신규)
    - `src/lib/services/raceService.ts` 및 외부 API 클라이언트 모듈 (에러 로깅 적용)
- **Acceptance Criteria**:
    - Sentry (또는 지정된 서비스) SDK가 Next.js 프로젝트에 설정된다.
    - Next.js 서버에서 발생하는 에러가 Sentry로 전송됨을 확인한다.
    - 외부 API 호출 실패 시 Sentry로 에러가 기록됨을 확인한다.
    - 에러 로깅 함수에 대한 유닛 테스트(Jest)가 추가되고 통과한다.
- **Related Tasks**: `Task: API 에러 처리 정책 구현`

### Task: 경주 상세 페이지 URL 패턴 및 Schema.org 적용
- **Label**: `seo`, `enhancement`, `test`
- **Description**: 경주 상세 페이지 URL 패턴을 "type/date/track/raceNo" 위주로 읽기 좋게 정리하고, `head` 메타에 `schema.org SportsEvent`를 적용한다.
- **Target Files/Directories**:
    - `src/app/race/[id]/page.tsx`
    - `next.config.js` (URL rewrites/redirects 필요 시)
- **Acceptance Criteria**:
    - 경주 상세 페이지 URL이 `/{type}/{date}/{track}/{raceNo}` (예: `/horse/20251209/seoul/1`) 형식으로 접근 가능하도록 라우팅이 설정된다.
    - 경주 상세 페이지의 `head` 섹션에 `schema.org SportsEvent` 마크업이 JSON-LD 형식으로 올바르게 삽입된다.
    - URL 패턴 및 `schema.org` 적용에 대한 E2E 테스트(Playwright)가 추가되고 통과한다.
- **Related Tasks**: `Task: GA4 및 Search Console 연동 문서화 및 이벤트 구현`
