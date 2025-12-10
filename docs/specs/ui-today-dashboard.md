# Today & Upcoming Dashboard 스펙

> ID: `UI_TODAY_DASHBOARD`
> URL: `/` (홈) + `/dashboard/today`
> 목적: 오늘/다가오는 경주 중 "중요한 것"과 "기회"를 한눈에 보여주는 홈 대시보드

---

## 1. 화면 개요 (Overview)

- **설명**: 오늘 진행되는 경마/경륜/경정 경주 중에서 핵심 정보를 요약하고, 데이터 기반 인사이트(고배당 기회, 인기 쏠림, 이변 가능성)를 제공하는 대시보드
- **대표 사용자 시나리오 (Top 3 Use Cases)**

  1. "오늘 경주 중 가장 주목할 만한 경주가 뭐지?" → 인사이트 카드로 빠르게 확인
  2. "지금 바로 시작하는 경주는?" → 실시간 카운트다운 + 배당률 요약
  3. "고배당 기회가 있는 경주를 찾고 싶다" → 기회 탐지 섹션에서 필터링

- **화면 타입**
  - [x] Dashboard
  - [ ] Detail
  - [ ] Search / Filter
  - [ ] Lab / Analytics
  - [ ] 기타

---

## 2. 데이터 소스 (Data Sources)

### 2.1 Public APIs

- **KRA (한국마사회)**
  - 경주일정조회 (API214_17/raceHorse_1)
    - 엔드포인트: `/API214_17/raceHorse_1`
    - 주요 필드: `meet`, `rcNo`, `rcDate`, `rcTime`, `rcDist`, `rank`
  - 출마표 조회 (API214_17/raceHorse_2)
    - 주요 필드: `hrNo`, `hrName`, `jkName`, `trName`, `age`, `wgHr`
  - 배당률 조회 (API214_17/raceHorse_3)
    - 주요 필드: `hrNo`, `ordOdds`

- **KSPO (경륜/경정)**
  - 경륜 출주표 (SRVC_OD_API_CRA_RACE_ORGAN)
    - 주요 필드: `meet_nm`, `race_no`, `back_no`, `racer_nm`, `win_rate`, `gear_rate`
  - 경정 출주표 (SRVC_OD_API_VWEB_MBR_RACE_INFO)
    - 주요 필드: `race_no`, `back_no`, `racer_nm`, `motor_no`, `boat_no`

### 2.2 내부 DB 테이블

- **races** - 경주 기본 정보
  - `id`, `race_type`, `track_id`, `race_no`, `race_date`, `start_time`, `distance`, `grade`, `status`
- **entries** - 출전 정보
  - `race_id`, `entry_no`, `name`, `jockey_name`, `trainer_name`, `rating`, `status`
- **odds_snapshots** - 배당률 시계열 (TimescaleDB)
  - `time`, `race_id`, `entry_no`, `odds_win`, `odds_place`, `popularity_rank`
- **results** - 경주 결과
  - `race_id`, `entry_no`, `finish_position`, `dividend_win`

---

## 3. 주요 UX 플로우 (User Flows)

### 3.1 기본 플로우

1. 사용자가 홈페이지(`/`) 접속
2. 오늘 날짜의 경주 개요 (종목별 경주 수, 다음 발주) 표시
3. "주목할 경주" 인사이트 카드 스캔
4. 관심 경주 클릭 → 경주 상세 페이지 이동

### 3.2 파워 유저 플로우

- 종목 탭 전환 → 해당 종목의 경주만 필터링
- "고배당 기회" 카드 클릭 → 해당 경주의 배당 분석 화면으로 이동
- "인기 쏠림 경고" 확인 → 저평가 마/선수 목록 확인

---

## 4. 레이아웃 정의 (Layout)

### 4.1 섹션 구조

- **상단 (Top / Hero 영역)**
  - 오늘의 요약 카드: 총 경주 수, 종목별 분포, 다음 발주까지 카운트다운
  - 날짜 선택기 (오늘 / 내일 / 이번 주)

- **메인 (Main Panel)**
  - **인사이트 카드 그리드** (3열)
    - "지금 곧 시작" - 30분 내 발주 경주 목록
    - "고배당 기회" - 인기 대비 저평가 마/선수가 있는 경주
    - "주목할 경주" - 역대 데이터 기반 이변 가능성 높은 경주
  - **종목별 경주 목록** (탭: 경마 | 경륜 | 경정 | 전체)
    - 시간순 정렬된 경주 카드 리스트

- **사이드 (Side Panel)**
  - 실시간 배당 변동 알림
  - 최근 결과 요약 (직전 3경주 착순/배당)

### 4.2 컴포넌트 목록

- `TodaySummaryCard` - 오늘의 요약 카드
  - 역할: 종목별 경주 수, 다음 발주 카운트다운 표시
  - 데이터: `races` 테이블 집계
  - 상호작용: 종목 클릭 시 해당 탭으로 이동

- `InsightCard` - 인사이트 카드
  - 역할: 데이터 기반 인사이트 표시
  - 데이터: `odds_snapshots` + `entries` 기반 계산
  - 상호작용: 카드 클릭 시 상세 분석 화면 이동

- `RaceListItem` - 경주 목록 아이템
  - 역할: 개별 경주 정보 표시
  - 데이터: `races` + `entries` join
  - 상호작용: 클릭 시 `/race/[id]` 이동

- `OddsChangeAlert` - 배당 변동 알림
  - 역할: 실시간 배당 급변동 알림
  - 데이터: `odds_snapshots` 시계열 비교

---

## 5. 데이터 테이블 / 카드 컬럼 정의

### 5.1 메인 테이블: 오늘의 경주 목록

- **테이블 ID**: `today_races_list`
- **용도**: 오늘 진행되는 모든 경주를 시간순으로 표시

| 컬럼 ID | 라벨(한글) | 타입 | 소스 필드 | 설명 / 계산 로직 |
|---------|------------|------|-----------|------------------|
| `raceTime` | 발주 시간 | time | `races.start_time` | HH:mm 형식 |
| `raceType` | 종목 | enum | `races.race_type` | horse/cycle/boat → 경마/경륜/경정 |
| `track` | 경기장 | string | `tracks.name` | 서울, 부산, 광명 등 |
| `raceNo` | 경주 | number | `races.race_no` | N경주 형식 |
| `grade` | 등급 | string | `races.grade` | 국산5등급, A급 등 |
| `fieldSize` | 출전 | number | `COUNT(entries)` | 출전 두수/인원 |
| `status` | 상태 | enum | `races.status` | 예정/진행중/종료 |
| `topFavoriteOdds` | 1인기 배당 | number | `MIN(odds_snapshots.odds_win)` | 가장 낮은 단승 배당 |
| `oddsConcentration` | 인기 편중도 | computed | formula (아래) | 상위 3개 배당 점유율 |

**파생 지표 계산식**:
```
oddsConcentration = (1등 배당률 역수 + 2등 배당률 역수 + 3등 배당률 역수) / 전체 합 × 100
→ 70% 이상이면 "인기 쏠림", 40% 이하면 "혼전"
```

### 5.2 인사이트 위젯: 고배당 기회

- **위젯 ID**: `high_odds_opportunity`
- 제목: 고배당 기회 탐지
- 설명: 인기 순위 대비 실력이 저평가된 마/선수가 출전한 경주
- 데이터:
  - 입력: `entries.rating`, `odds_snapshots.popularity_rank`, 과거 성적
  - 출력: `opportunityScore` (0-100)
- 계산 로직:
  ```text
  opportunityScore =
    (최근 5경주 입상률 × 30) +
    (레이팅 백분위 × 30) +
    (현재 인기순위 역전 가능성 × 40)

  인기순위 역전 가능성 = (실력 기대 순위 - 현재 인기 순위) / 출전 두수
  ```

### 5.3 인사이트 위젯: 이변 가능성

- **위젯 ID**: `upset_potential`
- 제목: 이변 주의보
- 설명: 역대 데이터 기반, 1인기 탈락 가능성이 높은 경주
- 데이터:
  - 입력: 트랙/거리/등급별 1인기 승률, 현재 배당 분포
  - 출력: `upsetProbability` (0-100%)
- 계산 로직:
  ```text
  upsetProbability =
    (1 - 해당 조건 1인기 역대 승률) ×
    (1 + 인기 편중도 패널티)

  인기 편중도가 높을수록 이변 시 고배당
  ```

---

## 6. 필터 / 정렬 / 검색 (Controls)

### 6.1 필터 정의

| 필터 ID | 라벨 | 타입 | 대상 필드 | 설명 |
|---------|------|------|-----------|------|
| `raceType` | 종목 | select | `races.race_type` | 경마/경륜/경정/전체 |
| `track` | 경기장 | multi-select | `tracks.name` | 서울/부산/제주/광명/창원/미사리 |
| `timeRange` | 시간대 | select | `races.start_time` | 오전/오후/전체 |
| `status` | 상태 | select | `races.status` | 예정/진행중/전체 |

### 6.2 정렬 옵션

- 기본 정렬: `start_time` (ASC) - 발주 시간순
- 지원 정렬:
  - `start_time` – 시간순 (가장 빠른 순)
  - `odds_concentration` – 인기 편중도순 (혼전 경주 먼저)
  - `field_size` – 출전 두수순 (많은 순)
  - `opportunity_score` – 기회 점수순 (높은 순)

### 6.3 검색

- 검색 대상 필드:
  - `entries.name` (마명/선수명)
  - `entries.jockey_name` (기수명)
  - `tracks.name` (경기장명)

---

## 7. 핵심 인사이트 정의 (Insights)

> 이 화면이 사용자에게 전달해야 할 핵심 결론/액션

### 인사이트 1: "지금 주목해야 할 경주"
- 필요한 지표: 발주 시간, 인기 편중도, 고배당 마/선수 유무
- 필요한 시각화: 카운트다운 타이머 + 배당 분포 미니 차트
- 예시 문장:
  > "서울 5경주 (14:20) - 인기 쏠림 심함. 1인기 배당 1.2배. 저배당 경주."
  > "광명 3경주 (15:00) - 혼전 양상. 고배당 기회 있음. 기회점수 78점."

### 인사이트 2: "저평가된 마/선수 알림"
- 필요한 지표: 레이팅 vs 현재 인기순위, 최근 성적
- 필요한 시각화: 인기순위 vs 실력순위 비교 바 차트
- 예시 문장:
  > "부산 7경주 6번 '질주왕' - 레이팅 1위이나 현재 4인기. ROI 기대값 상승."

### 인사이트 3: "1인기 탈락 가능성"
- 필요한 지표: 트랙/거리별 1인기 역대 승률, 현재 배당 분포
- 필요한 시각화: 이변 확률 게이지
- 예시 문장:
  > "제주 2경주 - 1000m 단거리 국산급. 역대 1인기 승률 38%. 이변 주의."

---

## 8. 성능 / 데이터 품질 고려사항

- **데이터 최신성**:
  - 경주 목록: 매일 06:00 전체 갱신
  - 배당률: 발주 1시간 전부터 30초 간격 스냅샷
  - 인사이트 계산: 배당 갱신 시마다 재계산 (캐시 30초)

- **페이지당 레코드 수**:
  - 경주 목록: 기본 20개, 무한 스크롤
  - 인사이트 카드: 상위 5개만 표시

- **쿼리 최적화**:
  - `races` 테이블: `race_date` + `race_type` 복합 인덱스
  - `odds_snapshots`: TimescaleDB 시계열 인덱스 활용
  - 인사이트 계산: 백그라운드 job으로 pre-compute, Redis 캐시

---

## 9. TODO / Open Questions

- [ ] 인사이트 알고리즘 검증을 위한 백테스팅 데이터 필요
- [ ] 배당률 급변동 알림 임계값 설정 (±10% 변동?)
- [ ] 인기 편중도 계산 시 복승/쌍승 포함 여부 결정
- [ ] 실시간 WebSocket vs Polling 결정 (현재 30초 polling)

- **Open Questions**:
  - 사용자 개인화 (관심 종목/경기장 저장) 기능 Phase 2로?
  - 역대 데이터 기반 인사이트의 법적 이슈 검토 필요 (투기 조장 우려)
