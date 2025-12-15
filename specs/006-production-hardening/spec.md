# Feature Specification: Production Hardening

**Feature Branch**: `006-production-hardening`
**Created**: 2025-12-11
**Status**: Draft
**Input**: 프로덕션 안정성 강화를 위한 핵심 개선 작업 (P0: 날짜/API 정확도, P1: 타입/에러 처리, P2: 캐싱/관측성)

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Accurate Date Display Across All Pages (Priority: P0)

사용자가 racelab.kr에 접속했을 때, 화면에 표시되는 "오늘의 날짜"와 실제 조회되는 경주 데이터의 날짜가 항상 일치해야 한다. 서버 위치(Vercel Edge, 해외 서버 등)와 관계없이 한국 시간(KST) 기준으로 동작한다.

**Why this priority**: 날짜 불일치는 사용자 신뢰도에 직접적 영향. 검색엔진/AI 크롤러가 잘못된 날짜 정보를 수집하면 SEO 품질 저하.

**Independent Test**: KST 자정 전후에 홈 페이지 접속 시, 헤더 날짜와 경주 목록 날짜가 일치하는지 확인하여 검증 가능.

**Acceptance Scenarios**:

1. **Given** 서버 시간이 UTC 기준 2025-12-11 23:30 (KST 2025-12-12 08:30), **When** 홈 페이지 접속, **Then** "2025년 12월 12일"로 표시되고 12월 12일 경주 데이터 조회됨
2. **Given** JSON-LD가 포함된 경주 상세 페이지, **When** 2025년 12월 11일 서울 제3경주 페이지 접속, **Then** JSON-LD startDate가 "2025-12-11T{startTime}:00+09:00" 형식
3. **Given** 홈 화면의 PageHeader, **When** 렌더링, **Then** 날짜 표시와 API 호출 날짜가 동일한 KST 기준 유틸 함수 사용

---

### User Story 2 - Optimized Home Page Loading (Priority: P0)

홈 화면 진입 시 공공 API 호출을 최소화하여 로딩 속도를 개선하고 rate limit 문제를 방지한다. TodayRaces와 QuickStats가 동일한 데이터를 공유한다.

**Why this priority**: 현재 동일 날짜에 대해 6회 API 호출 발생. 공공데이터 API는 느리고 rate limit이 있어 병목 원인.

**Independent Test**: 네트워크 탭에서 홈 페이지 로딩 시 horse/cycle/boat 스케줄 API가 각각 1회씩만 호출되는지 확인.

**Acceptance Scenarios**:

1. **Given** 사용자가 홈 화면에 처음 접속, **When** 페이지 로딩 완료, **Then** horse/cycle/boat 스케줄 API가 총 3회만 호출됨 (기존 6회에서 감소)
2. **Given** 홈 화면의 TodayRaces와 QuickStats 컴포넌트, **When** 렌더링, **Then** 동일한 경주 데이터를 props로 전달받아 표시
3. **Given** 공공 API 응답이 느린 상황(3초 이상), **When** 홈 페이지 접속, **Then** Suspense fallback(스켈레톤)이 표시되고 데이터 도착 후 동기화된 상태로 렌더링

---

### User Story 3 - Clear Error vs Empty State Distinction (Priority: P1)

API 장애로 데이터를 가져오지 못한 경우와 실제로 데이터가 없는 경우를 명확히 구분하여 사용자에게 적절한 메시지를 제공한다.

**Why this priority**: 현재 API 오류 시 mock 데이터를 사용하거나 null 반환. 사용자는 "데이터 없음"과 "시스템 장애" 구분 불가.

**Independent Test**: API 타임아웃 상황을 시뮬레이션하여 "데이터 제공 시스템 지연 중" 메시지가 표시되는지 확인.

**Acceptance Scenarios**:

1. **Given** 존재하지 않는 race ID로 상세 페이지 접속, **When** 페이지 렌더링, **Then** "경주 정보를 찾을 수 없습니다" 메시지 표시 (404 스타일)
2. **Given** 공공 API가 500 에러 또는 타임아웃 반환, **When** 홈 또는 상세 페이지 접속, **Then** "데이터 제공 시스템 지연 중" 배너 표시
3. **Given** 프로덕션 환경, **When** API 오류 발생, **Then** mock/dummy 데이터 대신 적절한 에러 상태 표시 (mock은 개발 환경에서만 사용)

---

### User Story 4 - Consistent Race Type Configuration (Priority: P1)

경마/경륜/경정의 라벨, 아이콘, 색상 등 UI 설정이 단일 소스에서 관리되어 일관성을 유지한다.

**Why this priority**: 현재 tabConfig, raceTypeConfig, statConfigs 등 3곳에서 중복 정의. 수정 시 불일치 위험.

**Independent Test**: 경마 색상을 변경했을 때 모든 UI(탭, 통계카드, 경주목록)에 동일하게 반영되는지 확인.

**Acceptance Scenarios**:

1. **Given** RACE_TYPES 중앙 설정 파일, **When** 경마 라벨을 변경, **Then** Header, TodayRaces, QuickStats 모든 곳에서 동일하게 반영
2. **Given** 새로운 컴포넌트에서 race type 정보 필요, **When** RACE_TYPES 참조, **Then** 라벨, 색상 클래스, 아이콘 정보를 일관되게 사용 가능

---

### User Story 5 - Type-Safe API Functions (Priority: P1)

모든 API 함수가 명시적인 리턴 타입을 가지고, 제네릭 타입이 올바르게 적용되어 타입 안전성을 보장한다.

**Why this priority**: 타입 누락으로 인한 런타임 에러 방지. IDE 자동완성 및 리팩토링 안전성 확보.

**Independent Test**: TypeScript strict 모드에서 API 함수 호출 시 리턴 타입이 자동 추론되는지 확인.

**Acceptance Scenarios**:

1. **Given** fetchHistoricalResults 함수 호출, **When** IDE에서 리턴값 확인, **Then** `Promise<PaginatedResults<HistoricalRace>>` 타입으로 명시됨
2. **Given** any 타입 사용 금지 규칙, **When** 전체 코드베이스 타입 체크, **Then** API 관련 파일에서 any 사용 없음

---

### Edge Cases

- 자정(00:00 KST) 전후 1분 내에 접속 시 날짜 전환이 올바르게 처리되어야 함
- race.date가 undefined인 경우 JSON-LD 생성 시 graceful 처리
- 공공 API가 부분 성공(일부 종목만 응답)하는 경우: 성공한 종목은 정상 표시, 실패한 종목 섹션에 "데이터 로딩 실패" 메시지 표시
- Vercel Edge Functions에서 타임존 처리 정확성
- ISR 재검증 시점과 실제 날짜 변경 시점 간 불일치 가능성

## Requirements _(mandatory)_

### Functional Requirements

**P0 - 날짜/타임존 정확도**

- **FR-001**: 시스템은 모든 날짜 표시에 Asia/Seoul 타임존(KST)을 기준으로 사용해야 한다
- **FR-002**: PageHeader 컴포넌트는 KST 기준 유틸 함수를 사용하여 오늘 날짜를 표시해야 한다
- **FR-003**: JSON-LD SportsEvent.startDate는 race.date와 race.startTime을 조합하여 ISO 8601 형식으로 생성해야 한다 (예: 2025-12-11T13:30:00+09:00)
- **FR-004**: date.ts 유틸에 normalizeRaceDate(YYYYMMDD → YYYY-MM-DD) 함수를 추가해야 한다
- **FR-005**: date.ts 유틸에 buildRaceStartDateTime(date, time) → ISO string 함수를 추가해야 한다

**P0 - API 호출 최적화**

- **FR-006**: 홈 페이지는 서버 컴포넌트 레벨에서 오늘자 모든 경주 데이터를 한 번에 fetch해야 한다
- **FR-007**: TodayRaces와 QuickStats 컴포넌트는 props로 전달받은 데이터만 사용해야 한다 (내부 API 호출 금지)
- **FR-008**: fetchTodayAllRaces(rcDate) 함수를 추가하여 horse/cycle/boat 스케줄을 병렬로 한 번에 가져와야 한다

**P1 - 에러 처리 및 상태 구분**

- **FR-009**: API fetch 결과는 RaceFetchStatus 타입(OK, NOT_FOUND, UPSTREAM_ERROR)으로 구분되어야 한다
- **FR-010**: 프로덕션 환경에서는 API 실패 시 mock 데이터 대신 에러 상태를 표시해야 한다
- **FR-011**: race/[id] 페이지에서 NOT_FOUND 상태일 때 전용 "경주 정보 없음" 화면을 표시해야 한다
- **FR-012**: UPSTREAM_ERROR 상태일 때 "데이터 제공 시스템 지연 중" 배너를 표시해야 한다 (API 응답 10초 초과 시 타임아웃 처리)
- **FR-013**: getMockResults, getMockDividends의 랜덤 로직을 제거하고, 개발 환경에서만 결정적(deterministic) mock 데이터를 사용해야 한다

**P1 - 타입 및 설정 정리**

- **FR-014**: RACE_TYPES 중앙 설정 파일(src/config/raceTypes.ts)을 생성하여 라벨, 색상, 아이콘을 단일 소스로 관리해야 한다
- **FR-015**: Header, TodayRaces, QuickStats 등 모든 컴포넌트는 RACE_TYPES 설정을 참조해야 한다
- **FR-016**: 모든 exported API 함수는 명시적인 Promise<...> 리턴 타입을 가져야 한다
- **FR-017**: Race 타입의 date 필드가 optional이므로 JSON-LD 생성 시 undefined 체크를 수행해야 한다

**P2 - 관측성 및 테스트 (선택)**

- **FR-018**: API 호출 실패, fallback 사용 횟수를 로깅할 수 있는 공통 로거 유틸을 추가해야 한다
- **FR-019**: 공공 API JSON → 내부 타입 변환 로직에 대한 fixture 기반 단위 테스트를 추가해야 한다
- **FR-020**: E2E 테스트에 API 장애 시나리오(500/타임아웃 → Empty State + 경고 배너)를 추가해야 한다

### Key Entities

- **Race**: 경주 정보. date 필드는 YYYY-MM-DD 형식으로 저장되며, JSON-LD 및 API 호출에 사용됨
- **RaceFetchStatus**: API 호출 결과 상태. 'OK' | 'NOT_FOUND' | 'UPSTREAM_ERROR' 구분
- **RaceFetchResult**: status와 race를 포함하는 래퍼 타입
- **RACE_TYPES**: 경마/경륜/경정 UI 설정(라벨, 색상, 아이콘)을 담은 중앙 설정 객체
- **TodayRacesData**: horse, cycle, boat 배열을 포함하는 오늘의 경주 데이터 타입

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 홈 페이지 로딩 시 동일 날짜에 대한 공공 API 호출이 6회에서 3회로 50% 감소한다
- **SC-002**: 서버 타임존과 관계없이 한국 시간 기준 날짜가 100% 정확하게 표시된다
- **SC-003**: JSON-LD startDate가 모든 경주 상세 페이지에서 유효한 ISO 8601 형식으로 생성된다
- **SC-004**: API 장애 발생 시 사용자에게 명확한 피드백(에러 메시지)이 2초 내에 표시된다
- **SC-005**: Race type 관련 UI 설정이 단일 파일에서 관리되어 수정 시 1곳만 변경하면 된다
- **SC-006**: TypeScript strict 모드에서 API 관련 파일의 타입 에러가 0건이다
- **SC-007**: 프로덕션 환경에서 mock 데이터가 사용자에게 노출되는 경우가 0건이다

## Clarifications

### Session 2025-12-12

- Q: API 타임아웃 기준 시간? → A: 10초 (공공 API 지연 허용하면서 사용자 대기 최소화)
- Q: 부분 API 성공 시 동작? → A: 성공한 종목 데이터 표시 + 실패한 종목에 "데이터 로딩 실패" 표시

## Assumptions

- Vercel Edge Functions에서 `Intl.DateTimeFormat`과 `toLocaleString` timezone 옵션이 정상 동작한다
- 공공 API(KRA, KSPO)의 응답 형식은 현재 구현과 동일하게 유지된다
- Next.js 14 App Router의 Server Component에서 데이터 fetching 후 props 전달이 정상 동작한다
- 개발 환경 구분은 `process.env.NODE_ENV`로 판단한다

## Out of Scope

- Redis/Upstash 등 외부 캐시 시스템 연동 (P2에서 설계만 진행)
- Sentry 등 외부 모니터링 서비스 실제 연동 (로거 유틸 추가까지만)
- 공공 API 응답 캐싱 TTL 세부 조정 (Next.js 기본 ISR 사용)
- 새로운 경주 종목 추가
