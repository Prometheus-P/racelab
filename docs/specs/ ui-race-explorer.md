# Race Explorer 스펙

> ID: `UI_RACE_EXPLORER`
> URL: `/races/explorer`
> 목적: 기간/트랙/거리/등급 조건으로 경주 패턴(이변, 배당, 편성)을 분석하는 탐색 화면

---

## 1. 화면 개요 (Overview)

- **설명**: 과거/현재 경주 데이터를 다양한 조건(종목, 트랙, 거리, 등급, 기간)으로 필터링하여 경주 패턴을 분석하고, 트랙별/거리별 통계와 이변 발생 패턴을 파악하는 탐색형 분석 화면
- **대표 사용자 시나리오 (Top 3 Use Cases)**

  1. "서울 1200m 경주에서 1인기 승률은 얼마나 되지?" → 트랙+거리 필터링 후 통계 확인
  2. "경륜 창원 경기장에서 롱샷(5인기 이하) 우승 비율은?" → 롱샷 지표 확인
  3. "특정 등급 경주에서 평균 배당금이 가장 높은 조건은?" → ROI 비교 분석

- **화면 타입**
  - [ ] Dashboard
  - [ ] Detail
  - [x] Search / Filter
  - [x] Lab / Analytics
  - [ ] 기타

---

## 2. 데이터 소스 (Data Sources)

### 2.1 Public APIs

- **KRA (한국마사회)**
  - 경주결과종합 (API299)
    - 엔드포인트: `/API299`
    - 주요 필드: `meet`, `rcNo`, `rcDate`, `ord`, `hrName`, `chulNo`, `rcTime`, `rank`
  - 확정배당율종합 (API301)
    - 주요 필드: `hrName`, `chulNo`, `ord`, `rcTime`, `jkName`, `finalBit`
  - 경주결과상세 (API156)
    - 주요 필드: `rsutRk`, `pthrHrno`, `pthrHrnm`, `rsutRaceRcd`, `rsutMargin`

- **KSPO (경륜/경정)**
  - 경륜 경주결과 (SRVC_OD_API_CRA_RACE_RESULT)
    - 주요 필드: `race_no`, `rank1`, `rank2`, `rank3`, `pool1_val`~`pool8_val`
  - 경정 경주결과 (SRVC_OD_API_VWEB_RACE_RESULT)
    - 주요 필드: `race_no`, `rank1`, `rank2`, `rank3`, `pool1_val`~`pool6_val`

### 2.2 내부 DB 테이블

- **races** - 경주 기본 정보
  - `id`, `race_type`, `track_id`, `race_no`, `race_date`, `distance`, `grade`, `status`, `weather`, `track_condition`
- **results** - 경주 결과
  - `race_id`, `entry_no`, `finish_position`, `time`, `margin`, `dividend_win`, `dividend_place`
- **entries** - 출전 정보
  - `race_id`, `entry_no`, `name`, `rating`, `jockey_name`
- **odds_snapshots** - 최종 배당률
  - `race_id`, `entry_no`, `odds_win`, `popularity_rank`
- **tracks** - 경기장 정보
  - `id`, `code`, `name`, `race_type`

### 2.3 집계 테이블 (Materialized View)

- **race_condition_stats** - 조건별 경주 통계
  - `track_id`, `distance_bucket`, `grade`, `favorite_win_rate`, `longshot_rate`, `avg_dividend`

---

## 3. 주요 UX 플로우 (User Flows)

### 3.1 기본 플로우

1. 사용자가 `/races/explorer` 접속
2. 상단 필터바에서 기간/종목/트랙/거리/등급 설정
3. 조건에 맞는 경주 목록 + 통계 요약 표시
4. 특정 경주 클릭 시 상세 결과 모달 또는 `/race/[id]` 이동

### 3.2 파워 유저 플로우

- 다중 필터 조합으로 특정 조건 그룹 분석 (예: "서울+1400m+국산급")
- "즐겨찾기" 필터 조합 저장 → 빠른 재접근
- CSV 다운로드로 자체 분석 수행

---

## 4. 레이아웃 정의 (Layout)

### 4.1 섹션 구조

- **상단 (Filter Bar)**
  - 기간 선택기 (DateRangePicker)
  - 종목 탭 (경마 | 경륜 | 경정 | 전체)
  - 트랙/거리/등급 멀티셀렉트 필터

- **메인 (Main Panel)**
  - **통계 요약 카드 (4열)**
    - 총 경주 수, 1인기 승률, 평균 배당, 롱샷 비율
  - **경주 목록 테이블**
    - 페이지네이션 + 무한 스크롤 지원
    - 정렬 가능한 헤더

- **사이드 (Side Panel / Drawer)**
  - 조건별 비교 차트 (트랙별 1인기 승률 바 차트)
  - 선택한 경주의 상세 정보

### 4.2 컴포넌트 목록

- `RaceFilterBar` - 필터 바
  - 역할: 다양한 조건 필터링
  - 데이터: URL query params로 상태 관리
  - 상호작용: 필터 변경 시 테이블 + 통계 즉시 갱신

- `RaceStatsCard` - 통계 요약 카드
  - 역할: 필터링된 결과의 핵심 통계 표시
  - 데이터: 집계 쿼리 결과
  - 상호작용: 클릭 시 해당 지표 상세 차트 표시

- `RaceDataTable` - 경주 목록 테이블
  - 역할: 경주 데이터 테이블 표시
  - 데이터: `races` JOIN `results` JOIN `entries`
  - 상호작용: 행 클릭 시 상세 모달, 헤더 클릭 시 정렬

- `ConditionCompareChart` - 조건별 비교 차트
  - 역할: 여러 조건의 통계를 시각적으로 비교
  - 데이터: `race_condition_stats` 집계
  - 상호작용: 차트 막대 클릭 시 해당 조건으로 필터 적용

---

## 5. 데이터 테이블 / 카드 컬럼 정의

### 5.1 메인 테이블: 경주 탐색 결과

- **테이블 ID**: `race_explorer_table`
- **용도**: 조건에 맞는 경주 목록과 핵심 지표 표시

| 컬럼 ID | 라벨(한글) | 타입 | 소스 필드 | 설명 / 계산 로직 |
|---------|------------|------|-----------|------------------|
| `raceDate` | 경주일 | date | `races.race_date` | YYYY-MM-DD 형식 |
| `track` | 경기장 | string | `tracks.name` | 서울, 부산, 광명 등 |
| `raceNo` | 경주 | number | `races.race_no` | N경주 형식 |
| `distance` | 거리 | number | `races.distance` | 1000m, 1400m 등 |
| `grade` | 등급 | string | `races.grade` | 국산5등급, A급 등 |
| `fieldSize` | 출전두수 | number | `COUNT(entries)` | 출전 마/선수 수 |
| `winnerNo` | 1착 | number | `results.entry_no WHERE finish_position=1` | 1착 마번/배번 |
| `winnerName` | 1착 마/선수명 | string | `entries.name` | 우승마/선수명 |
| `winnerOdds` | 1착 배당 | number | `results.dividend_win / 100` | 확정 단승 배당률 |
| `favoriteFinish` | 1인기 착순 | number | `results.finish_position WHERE popularity_rank=1` | 1인기가 몇 착? |
| `upsetFlag` | 이변 | boolean | computed | 1인기 ≠ 1착이면 true |
| `roiWin` | ROI(단승) | computed | formula (아래) | 1인기 단승 시 ROI |

**파생 지표 계산식**:
```
favoriteWinRate (조건별) = COUNT(1인기 1착) / COUNT(전체 경주) × 100
longshotRate = COUNT(5인기 이하 1착) / COUNT(전체 경주) × 100
avgDividend = AVG(dividend_win) / 100
roiWin (1인기) = SUM(1인기가 1착일 때 배당금) / COUNT(경주 수) × 100
```

### 5.2 통계 요약 카드

- **위젯 ID**: `race_stats_summary`
- 구성:
  | 카드 ID | 제목 | 계산 로직 |
  |---------|------|-----------|
  | `totalRaces` | 총 경주 | `COUNT(races)` |
  | `favoriteWinRate` | 1인기 승률 | `COUNT(1인기 1착) / COUNT(전체) × 100%` |
  | `avgWinDividend` | 평균 단승 배당 | `AVG(dividend_win) / 100` |
  | `longshotRate` | 롱샷 비율 | `COUNT(5인기↓ 1착) / COUNT(전체) × 100%` |

### 5.3 인사이트 위젯: 트랙-거리별 1인기 승률

- **위젯 ID**: `track_distance_favorite_chart`
- 제목: 트랙-거리별 1인기 승률
- 설명: 트랙과 거리 조합별 1인기 승률을 히트맵으로 표시
- 데이터:
  - 입력: `races.track_id`, `races.distance`, `results.finish_position`, `odds_snapshots.popularity_rank`
  - 출력: 히트맵 (행: 트랙, 열: 거리, 값: 1인기 승률)
- 계산 로직:
  ```text
  GROUP BY track, distance_bucket (1000/1200/1400/1600/1800/2000+)
  CALCULATE COUNT(1인기 1착) / COUNT(*) × 100
  ```

---

## 6. 필터 / 정렬 / 검색 (Controls)

### 6.1 필터 정의

| 필터 ID | 라벨 | 타입 | 대상 필드 | 설명 |
|---------|------|------|-----------|------|
| `dateRange` | 기간 | date-range | `races.race_date` | 시작일~종료일 |
| `raceType` | 종목 | select | `races.race_type` | 경마/경륜/경정/전체 |
| `track` | 경기장 | multi-select | `tracks.name` | 복수 선택 가능 |
| `distance` | 거리 | range | `races.distance` | 1000m~3000m 슬라이더 |
| `distancePreset` | 거리 프리셋 | chip-select | computed | 단거리/중거리/장거리 |
| `grade` | 등급 | multi-select | `races.grade` | G1/G2/G3/일반 등 |
| `upsetOnly` | 이변만 | toggle | computed | 1인기 탈락 경주만 |
| `weather` | 날씨 | select | `races.weather` | 맑음/흐림/비 등 |
| `trackCondition` | 주로상태 | select | `races.track_condition` | 양호/다습/불량 |

### 6.2 정렬 옵션

- 기본 정렬: `race_date` (DESC) - 최신순
- 지원 정렬:
  - `race_date` – 경주일순
  - `winner_odds` – 1착 배당순 (고배당 먼저)
  - `distance` – 거리순
  - `field_size` – 출전두수순

### 6.3 검색

- 검색 대상 필드:
  - `entries.name` (마명/선수명)
  - `entries.jockey_name` (기수명)
  - `tracks.name` (경기장명)
  - `races.id` (경주 ID)

---

## 7. 핵심 인사이트 정의 (Insights)

> 이 화면이 사용자에게 전달해야 할 핵심 결론/액션

### 인사이트 1: "이 조건에서 1인기 승률은 얼마나 될까?"
- 필요한 지표: 조건별 1인기 승률, 표본 크기
- 필요한 시각화: 바 차트 (트랙별/거리별)
- 예시 문장:
  > "서울 1200m 경주에서 1인기 승률은 42%. 전체 평균(35%)보다 높음."
  > "제주 1400m는 1인기 승률 28%로 이변이 잦은 조건."

### 인사이트 2: "고배당을 노릴 수 있는 조건은?"
- 필요한 지표: 평균 단승 배당, 롱샷 비율, 최고 배당
- 필요한 시각화: 분포 히스토그램, 박스플롯
- 예시 문장:
  > "부산 2000m+ 장거리에서 롱샷(5인기↓) 우승 비율 31%. 고배당 기대 가능."

### 인사이트 3: "날씨/주로상태가 결과에 미치는 영향"
- 필요한 지표: 날씨별/주로상태별 1인기 승률 비교
- 필요한 시각화: 조건별 비교 바 차트
- 예시 문장:
  > "불량 주로에서 1인기 승률 29% (양호 시 38%). 날씨 변수 고려 필요."

---

## 8. 성능 / 데이터 품질 고려사항

- **데이터 최신성**:
  - 경주 결과: 경주 종료 후 5분 내 DB 반영
  - 통계 집계: 매일 새벽 배치 job으로 Materialized View 갱신
  - 실시간 필터링: 최대 3개월 데이터는 실시간 쿼리, 이전은 집계 테이블

- **페이지당 레코드 수**:
  - 기본 50개, 최대 200개
  - 무한 스크롤 시 50개씩 추가 로드

- **쿼리 최적화**:
  - `races` 테이블: `race_date`, `race_type`, `track_id`, `distance` 복합 인덱스
  - `results` 테이블: `race_id`, `finish_position` 인덱스
  - 집계 쿼리: Materialized View 활용
  - 과거 데이터: 파티셔닝 (월별)

---

## 9. TODO / Open Questions

- [ ] 거리 버킷팅 기준 정의 (100m 단위? 500m 단위?)
- [ ] 경륜/경정의 "거리" 대신 "경주 유형" 필터 추가 필요
- [ ] 1인기 정의: 최종 배당 기준 vs 발매 마감 직전 기준
- [ ] 데이터 보관 기간: 몇 년치까지 조회 가능하게 할 것인지
- [ ] CSV 다운로드 시 개인정보 필터링 필요 여부

- **Open Questions**:
  - 트랙별 통계에 "경기장 폐쇄 기간" 제외 로직 필요?
  - 코로나 기간(무관중) 데이터 별도 마킹 필요?
