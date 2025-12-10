# Horse & Connection Explorer 스펙

> ID: `UI_HORSE_EXPLORER`
> URL: `/horses` (말/선수) + `/connections` (기수/조교사/마주)
> 목적: 말/기수/조교사/선수의 폼·성적·배당·ROI를 데이터로 비교·분석하는 화면

---

## 1. 화면 개요 (Overview)

- **설명**: 경마의 말/기수/조교사, 경륜/경정의 선수를 개별 엔티티로 조회하고, 성적 추이/배당 대비 ROI/폼 변화 등을 분석하는 탐색 화면. 특정 엔티티의 상세 프로필과 과거 출전 기록을 확인할 수 있음.
- **대표 사용자 시나리오 (Top 3 Use Cases)**

  1. "이 기수의 최근 성적이 어떤지 확인하고 싶다" → 기수 프로필 + 최근 N경주 성적 조회
  2. "특정 말이 어떤 조건(거리/트랙)에서 강한지 분석" → 말 상세 페이지에서 조건별 성적 비교
  3. "인기 대비 실적이 좋은 선수/말을 찾고 싶다" → ROI 랭킹 테이블로 저평가 엔티티 탐색

- **화면 타입**
  - [ ] Dashboard
  - [x] Detail
  - [x] Search / Filter
  - [x] Lab / Analytics
  - [ ] 기타

---

## 2. 데이터 소스 (Data Sources)

### 2.1 Public APIs

- **KRA (한국마사회)**
  - 출전등록현황 (API323)
    - 주요 필드: `hrnm`, `trarNm`, `ownerNm`, `ag`, `gndr`, `ratg`
  - 출전표상세 (API26_2)
    - 주요 필드: `hrName`, `jkName`, `trName`, `rating`, `chulNo`, `chaksunT`
  - 확정배당율종합 (API301)
    - 주요 필드: `hrName`, `jkName`, `jkOrd1CntT`, `jkRcCntT`, `hrOrd1CntT`
  - 경주결과상세 (API156)
    - 주요 필드: `hrmJckyNm`, `hrmTrarNm`, `pthrHrnm`, `rsutRk`

- **KSPO (경륜/경정)**
  - 경륜 선수정보 (SRVC_OD_API_CRA_RACER_INFO)
    - 주요 필드: `racer_nm`, `racer_grd_cd`, `win_rate`, `high_rate`, `high_3_rate`
  - 경정 선수정보 (SRVC_OD_API_VWEB_RACER_INFO)
    - 주요 필드: `racer_nm`, `racer_grd_cd`, `win_ratio`, `high_rate`, `avg_rank`
  - 경정 선수컨디션 (SRVC_OD_API_VWEB_RACER_CONDITION)
    - 주요 필드: `heal_stat_cn`, `trng_stat_cn`

### 2.2 내부 DB 테이블

- **horses** (신규 필요) - 말 마스터 정보
  - `id`, `name`, `birth_year`, `sex`, `origin`, `sire`, `dam`, `trainer_id`, `owner_name`
- **jockeys** (신규 필요) - 기수 마스터 정보
  - `id`, `name`, `birth_year`, `career_start`, `affiliated_track`
- **trainers** (신규 필요) - 조교사 마스터 정보
  - `id`, `name`, `career_start`, `affiliated_track`
- **racers** (신규 필요) - 경륜/경정 선수 마스터
  - `id`, `name`, `race_type`, `grade`, `period_no`
- **entries** - 출전 정보 (참조)
  - `horse_id`, `jockey_id`, `trainer_id`, `racer_id`
- **results** - 경주 결과 (참조)
  - 착순, 배당금 등 성적 데이터
- **entity_stats** (Materialized View) - 엔티티별 집계 통계
  - `entity_type`, `entity_id`, `total_starts`, `wins`, `places`, `roi_win`, `avg_odds`, `form_score`

---

## 3. 주요 UX 플로우 (User Flows)

### 3.1 기본 플로우

1. 사용자가 `/horses` 또는 `/connections` 접속
2. 검색창에서 마명/기수명/선수명 검색 또는 랭킹 테이블 브라우징
3. 특정 엔티티 클릭 → 상세 프로필 페이지 이동
4. 상세 페이지에서 최근 성적, 조건별 분석, 배당 대비 ROI 확인

### 3.2 파워 유저 플로우

- 랭킹 정렬 변경 (승률순, ROI순, 최근 폼순)
- 다중 엔티티 비교 모드 → 2~3개 엔티티 나란히 비교
- 관심 엔티티 북마크 → 해당 엔티티 출전 시 대시보드에서 하이라이트

---

## 4. 레이아웃 정의 (Layout)

### 4.1 섹션 구조

- **상단 (Search + Tab Bar)**
  - 통합 검색창 (말/기수/조교사/선수 통합 검색)
  - 탭 전환: 말 | 기수 | 조교사 | 경륜선수 | 경정선수

- **메인 (Main Panel)**
  - **랭킹 테이블**
    - 엔티티 목록 + 핵심 지표 (승률, ROI, 최근 폼)
    - 페이지네이션
  - **상세 프로필 (엔티티 클릭 시)**
    - 기본 정보 카드
    - 성적 추이 차트
    - 조건별 분석 테이블
    - 최근 출전 기록

- **사이드 (Side Panel)**
  - 인기 검색 엔티티
  - 오늘 출전 예정인 주요 엔티티

### 4.2 컴포넌트 목록

- `EntitySearchBar` - 통합 검색창
  - 역할: 마명/기수명/선수명 검색
  - 데이터: 자동완성을 위한 엔티티 목록
  - 상호작용: 타이핑 시 자동완성 드롭다운

- `EntityRankingTable` - 랭킹 테이블
  - 역할: 엔티티 목록과 핵심 통계 표시
  - 데이터: `entity_stats` + 마스터 테이블
  - 상호작용: 행 클릭 시 상세 페이지, 헤더 클릭 시 정렬

- `EntityProfileCard` - 엔티티 프로필 카드
  - 역할: 기본 정보 + 핵심 지표 요약
  - 데이터: 마스터 테이블 + `entity_stats`
  - 상호작용: 북마크, 비교 추가

- `PerformanceTrendChart` - 성적 추이 차트
  - 역할: 최근 N경주 착순/배당 추이 시각화
  - 데이터: `results` 테이블 시계열
  - 상호작용: 기간 필터, 데이터 포인트 호버 시 상세

- `ConditionBreakdownTable` - 조건별 분석 테이블
  - 역할: 트랙/거리/등급별 성적 비교
  - 데이터: `results` + `races` join 집계
  - 상호작용: 조건 클릭 시 해당 조건 경주 목록 필터

---

## 5. 데이터 테이블 / 카드 컬럼 정의

### 5.1 메인 테이블: 말/선수 랭킹

- **테이블 ID**: `entity_ranking_table`
- **용도**: 엔티티 목록과 핵심 성적 지표를 랭킹 형태로 표시

| 컬럼 ID | 라벨(한글) | 타입 | 소스 필드 | 설명 / 계산 로직 |
|---------|------------|------|-----------|------------------|
| `rank` | 순위 | number | computed | 현재 정렬 기준 순위 |
| `name` | 마명/선수명 | string | `horses.name` / `racers.name` | 엔티티명 |
| `entityType` | 유형 | enum | `entity_stats.entity_type` | 말/기수/조교사/경륜/경정 |
| `totalStarts` | 출전 | number | `entity_stats.total_starts` | 총 출전 횟수 |
| `wins` | 1착 | number | `entity_stats.wins` | 1착 횟수 |
| `winRate` | 승률 | computed | `wins / totalStarts × 100` | 승률 % |
| `placeRate` | 입상률 | computed | `(wins + places) / totalStarts × 100` | 1-2착 비율 |
| `avgOdds` | 평균배당 | number | `entity_stats.avg_odds` | 출전 시 평균 배당률 |
| `roiWin` | ROI(단승) | computed | formula (아래) | 배당 대비 수익률 |
| `formScore` | 폼점수 | computed | formula (아래) | 최근 5경주 기반 폼 |
| `lastRace` | 최근출전 | date | `MAX(races.race_date)` | 마지막 출전일 |
| `trend` | 추세 | enum | computed | 상승/유지/하락 |

**파생 지표 계산식**:
```
winRate = wins / totalStarts × 100
placeRate = (wins + places) / totalStarts × 100
roiWin = SUM(우승 시 배당금) / totalStarts × 100
  → 100 이상이면 수익, 100 미만이면 손실

formScore (0-100) =
  (최근 5경주 평균착순 역수 × 40) +
  (최근 5경주 인기순위 대비 실제착순 × 30) +
  (최근 출전 간격 점수 × 15) +
  (트랙/거리 적합도 × 15)

trend =
  IF 최근 3경주 formScore > 이전 3경주 → 상승
  IF 최근 3경주 formScore < 이전 3경주 → 하락
  ELSE → 유지
```

### 5.2 엔티티 프로필 위젯

- **위젯 ID**: `entity_profile_summary`
- 구성 (말 기준):
  | 필드 | 라벨 | 소스 |
  |------|------|------|
  | `name` | 마명 | `horses.name` |
  | `birthYear` | 연령 | `horses.birth_year` → 현재년도 - birthYear + 1세 |
  | `sex` | 성별 | `horses.sex` (수/암/거) |
  | `origin` | 산지 | `horses.origin` (한/미/일 등) |
  | `sire` | 부마 | `horses.sire` |
  | `trainer` | 조교사 | `trainers.name` |
  | `owner` | 마주 | `horses.owner_name` |
  | `rating` | 레이팅 | `entries.rating` (최근 값) |
  | `totalPrize` | 총상금 | `SUM(results.prize)` |

### 5.3 조건별 분석 테이블

- **테이블 ID**: `condition_breakdown_table`
- **용도**: 트랙/거리/등급별 성적 비교

| 컬럼 | 라벨 | 계산 |
|------|------|------|
| `condition` | 조건 | 트랙명, 거리, 등급 |
| `starts` | 출전 | 해당 조건 출전 수 |
| `winRate` | 승률 | 해당 조건 승률 |
| `avgFinish` | 평균착순 | 해당 조건 평균 착순 |
| `roiWin` | ROI | 해당 조건 ROI |

### 5.4 인사이트 위젯: 인기 대비 성적 (Value)

- **위젯 ID**: `value_score_widget`
- 제목: 저평가 지수 (Value Score)
- 설명: 평균 인기순위 대비 실제 착순이 좋은 정도를 수치화
- 데이터:
  - 입력: `odds_snapshots.popularity_rank`, `results.finish_position`
  - 출력: `valueScore` (-100 ~ +100)
- 계산 로직:
  ```text
  valueScore = AVG(인기순위 - 실제착순) × 10
  → 양수: 인기보다 잘 뛰는 저평가 엔티티
  → 음수: 인기보다 못 뛰는 고평가 엔티티

  예: 평균 5인기인데 평균 착순 3착 → (5-3) × 10 = +20 (저평가)
  ```

---

## 6. 필터 / 정렬 / 검색 (Controls)

### 6.1 필터 정의

| 필터 ID | 라벨 | 타입 | 대상 필드 | 설명 |
|---------|------|------|-----------|------|
| `entityType` | 유형 | tab | `entity_stats.entity_type` | 말/기수/조교사/경륜/경정 |
| `raceType` | 종목 | select | `races.race_type` | 경마/경륜/경정 |
| `track` | 소속 | multi-select | `horses.trainer_id → tracks` | 소속 경기장 |
| `minStarts` | 최소출전 | number | `entity_stats.total_starts` | N회 이상 출전 |
| `activePeriod` | 활동기간 | select | computed | 최근 1개월/3개월/1년/전체 |
| `grade` | 등급 | select | `racers.grade` | 경륜/경정 선수 등급 |

### 6.2 정렬 옵션

- 기본 정렬: `winRate` (DESC) - 승률순
- 지원 정렬:
  - `winRate` – 승률순
  - `roiWin` – ROI순 (가성비)
  - `formScore` – 현재 폼순
  - `totalStarts` – 출전 횟수순
  - `valueScore` – 저평가 지수순

### 6.3 검색

- 검색 대상 필드:
  - `horses.name`, `jockeys.name`, `trainers.name`, `racers.name`
  - 자동완성 지원 (최소 2글자 입력 시)

---

## 7. 핵심 인사이트 정의 (Insights)

### 인사이트 1: "지금 폼이 좋은 말/선수는 누구?"
- 필요한 지표: formScore, 최근 5경주 추이
- 필요한 시각화: 폼 점수 게이지 + 착순 추이 스파크라인
- 예시 문장:
  > "'번개'의 폼점수 85점 (상승세). 최근 5경주: 1-2-3-2-1착. 호조건."
  > "김철수 기수 폼점수 92점. 이번 주 승률 40%로 핫한 상태."

### 인사이트 2: "배당 대비 수익률이 좋은 엔티티는?"
- 필요한 지표: roiWin, valueScore, avgOdds
- 필요한 시각화: ROI 분포 차트, 저평가 순위
- 예시 문장:
  > "'질주왕' ROI 132%. 평균 8배당이나 실제 승률 18%. 가성비 우수."
  > "박기수 조교사 ROI 145%. 관리마 단승 수익률 TOP 5."

### 인사이트 3: "어떤 조건에서 강한가?"
- 필요한 지표: 조건별 승률/ROI 비교
- 필요한 시각화: 조건별 히트맵
- 예시 문장:
  > "'천둥'은 서울 1400m에서 승률 35% (전체 15%). 거리 적성 뚜렷."
  > "창원 경륜 A급에서 이선수 승률 28%. 홈 어드밴티지 확인."

---

## 8. 성능 / 데이터 품질 고려사항

- **데이터 최신성**:
  - 마스터 정보: 매일 새벽 배치 갱신
  - 성적 집계: 경주 결과 반영 후 5분 내 `entity_stats` 갱신
  - 폼 점수: 매 경주 종료 시 재계산

- **페이지당 레코드 수**:
  - 랭킹 테이블: 기본 30개, 최대 100개
  - 최근 출전 기록: 최대 50개

- **쿼리 최적화**:
  - `entity_stats` Materialized View로 집계 쿼리 최적화
  - `horses`, `racers` 테이블: `name` 텍스트 검색 인덱스 (pg_trgm)
  - 자동완성: 캐시 + 트라이그램 유사도 검색

---

## 9. TODO / Open Questions

- [ ] 마스터 테이블 스키마 확정 (horses, jockeys, trainers, racers)
- [ ] 엔티티 ID 체계 정의 (KRA/KSPO 원본 ID 사용 vs 내부 생성)
- [ ] 은퇴/휴식 엔티티 처리 방안
- [ ] 말 혈통 데이터 수집 가능 여부 확인
- [ ] 경륜/경정 선수 프로필 사진 수집 가능 여부

- **Open Questions**:
  - 엔티티 비교 기능의 최대 비교 수 (2개? 3개?)
  - 북마크 기능의 로그인 필수 여부
  - ROI 계산 시 복승/쌍승 포함 여부
