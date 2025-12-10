# Results & Strategy Lab 스펙

> ID: `UI_RESULTS_STRATEGY_LAB`
> URL: `/lab/strategies`
> 목적: 과거 결과/배당 데이터를 기반으로 전략(조건식)을 테스트하고 인사이트를 얻는 화면

---

## 1. 화면 개요 (Overview)

- **설명**: 사용자가 정의한 베팅 전략(조건식)을 과거 레이스 데이터에 적용하여 백테스팅하고, ROI/적중률 등 성과 지표를 시뮬레이션하는 분석 도구
- **대표 사용자 시나리오 (Top 3 Use Cases)**

  1. "1번 인기마 + 거리 1400m 이상" 조건으로 지난 1년 데이터 백테스팅하여 ROI 확인
  2. 특정 기수-조교사 조합의 과거 배당금 합계와 적중률 분석
  3. "배당률 5배 이상 + 최근 3경주 3착 이내" 전략의 수익성 검증
- **화면 타입**

  - [ ] Dashboard
  - [ ] Detail
  - [ ] Search / Filter
  - [x] Lab / Analytics
  - [ ] 기타

---

## 2. 데이터 소스 (Data Sources)

> 이 화면이 어떤 API / DB 테이블을 읽는지 정의

### 2.1 Public APIs

- **KRA (경마)**

  - getRaceResult – 과거 경주 결과 조회
    - 엔드포인트: `/openapi/service/rest/RaceService/getRaceResult`
    - 주요 필드: `ord`, `hrNo`, `hrName`, `jkName`, `trName`, `rcTime`, `rcTimeDiff`
  - getDividendInfo – 배당금 정보
    - 엔드포인트: `/openapi/service/rest/RaceService/getDividendInfo`
    - 주요 필드: `winOdds`, `plcOdds`, `quinOdds`, `exaOdds`, `trioOdds`
- **KSPO (경륜/경정)**

  - getGameResultInfo – 경주 결과
    - 엔드포인트: `/api/game/result`
    - 주요 필드: `rank`, `playerNo`, `playerName`, `arrivalTime`
  - getDividendInfo – 배당금 정보

### 2.2 내부 도메인 모델 / 테이블

- **Domain Models**

  - `HistoricalRace` – 과거 경주 정보
    - 필드: `id`, `type`, `raceNo`, `track`, `date`, `startTime`, `distance`, `grade`, `status`, `results`, `dividends`
  - `HistoricalRaceResult` – 경주 결과 상세
    - 필드: `rank`, `entryNo`, `name`, `jockey`, `trainer`, `time`, `timeDiff`
  - `Dividend` – 배당금 정보
    - 필드: `type`, `entries`, `amount`
  - `Strategy` – 사용자 정의 전략 (신규)
    - 필드: `id`, `name`, `conditions`, `createdAt`, `updatedAt`
  - `BacktestResult` – 백테스트 결과 (신규)
    - 필드: `strategyId`, `dateRange`, `totalRaces`, `hitCount`, `roi`, `profit`
- **DB / View / Materialized View**

  - `races` – 경주 마스터
  - `results` – 경주 결과 (rank, entry_no, time, time_diff)
  - `dividends` – 배당금 정보 (신규 테이블)
  - `entries` – 출전 정보 (조건 매칭용)
  - `odds_snapshots` – 배당률 스냅샷 (TimescaleDB)
  - `strategies` – 사용자 전략 저장 (신규 테이블)
  - `backtest_results` – 백테스트 결과 캐시 (신규 테이블)
  - `mv_race_statistics` – 경주별 통계 집계 (Materialized View, 신규)

---

## 3. 주요 UX 플로우 (User Flows)

### 3.1 기본 플로우

1. 사용자가 전략 빌더에서 조건식 구성 (예: 종목=경마, 인기순위≤3, 거리≥1400m)
2. 분석 기간 및 대상 트랙 선택
3. "백테스트 실행" 클릭 → 조건 매칭 경주 검색 → 결과 계산
4. ROI, 적중률, 배당금 분포 등 성과 지표 시각화
5. 상세 매칭 경주 목록 테이블로 확인
6. 전략 저장 또는 조건 수정 후 재실행

### 3.2 파워 유저 플로우 (선택)

- 여러 전략 동시 비교 (A/B 테스트)
- 전략 조건식 JSON/코드 직접 입력
- 결과 CSV 다운로드
- 전략 공유 URL 생성

---

## 4. 레이아웃 정의 (Layout)

### 4.1 섹션 구조

- **상단 (Top / Hero 영역)**

  - 전략 빌더: 조건식 구성 UI
  - 기간/트랙 필터 선택
  - 백테스트 실행 버튼
- **메인 (Main Panel)**

  - 성과 요약 카드 (ROI, 적중률, 순이익, 총 베팅 수)
  - 성과 추이 차트 (월별/주별 ROI 변화)
  - 배당금 분포 히스토그램
  - 매칭 경주 상세 테이블
- **사이드 / 보조 영역 (Side Panel / Secondary)**

  - 저장된 전략 목록
  - 전략 비교 패널
  - 인기 전략 프리셋

### 4.2 컴포넌트 목록

- `Component`: **StrategyBuilder**

  - 역할: 조건식 시각적 구성 (AND/OR 로직, 필드 선택, 연산자, 값)
  - 데이터 입력: 조건 필드 메타데이터 (종목, 인기순위, 거리, 등급, 배당률 범위 등)
  - 상호작용: 드래그앤드롭 조건 추가, 조건 그룹 중첩, 조건 삭제
- `Component`: **BacktestFilterBar**

  - 역할: 분석 기간, 대상 종목/트랙 필터링
  - 데이터 입력: `RaceType[]`, `Track[]`, `dateRange`
  - 상호작용: 날짜 범위 선택, 다중 선택
- `Component`: **PerformanceSummaryCard**

  - 역할: 핵심 성과 지표 요약 표시
  - 데이터 입력: `BacktestResult`
  - 상호작용: 지표 클릭 시 상세 드릴다운
- `Component`: **ROITrendChart**

  - 역할: 기간별 ROI 추이 시각화
  - 데이터 입력: `{ period: string; roi: number; cumProfit: number }[]`
  - 상호작용: 호버 시 상세 값 표시, 기간 단위 변경 (일/주/월)
- `Component`: **DividendDistributionChart**

  - 역할: 적중 시 배당금 분포 히스토그램
  - 데이터 입력: `number[]` (배당금 배열)
  - 상호작용: 구간 클릭 시 해당 경주 필터링
- `Component`: **MatchedRacesTable**

  - 역할: 조건 매칭된 경주 상세 목록
  - 데이터 입력: `MatchedRace[]`
  - 상호작용: 정렬, 페이지네이션, 경주 상세 모달
- `Component`: **SavedStrategiesList**

  - 역할: 저장된 전략 목록 및 빠른 로드
  - 데이터 입력: `Strategy[]`
  - 상호작용: 전략 로드, 삭제, 복제
- `Component`: **StrategyComparePanel**

  - 역할: 다중 전략 성과 비교
  - 데이터 입력: `BacktestResult[]`
  - 상호작용: 전략 추가/제거, 비교 차트 토글

---

## 5. 데이터 테이블 / 카드 컬럼 정의

### 5.1 메인 테이블 스펙: 매칭 경주 테이블

> 조건에 매칭된 개별 경주와 결과를 보여주는 테이블

- **테이블 ID**: `matched_races_table`
- **용도**: 백테스트 조건에 매칭된 경주별 상세 결과 및 수익 확인

| 컬럼 ID        | 라벨(한글)   | 타입     | 소스 필드 (API/테이블)   | 설명 / 계산 로직                           |
| -------------- | ------------ | -------- | ------------------------ | ------------------------------------------ |
| `date`         | 날짜         | date     | `races.date`             | 경주 날짜                                  |
| `type`         | 종목         | enum     | `races.type`             | horse/cycle/boat                           |
| `track`        | 경기장       | string   | `races.track`            | 서울/부산/제주/광명/미사리                 |
| `raceNo`       | 경주번호     | number   | `races.race_no`          | 해당 일자의 경주 번호                      |
| `grade`        | 등급         | string   | `races.grade`            | 경주 등급                                  |
| `distance`     | 거리         | number   | `races.distance`         | 미터 단위                                  |
| `betTarget`    | 베팅 대상    | string   | `computed`               | 조건 매칭된 출전 번호 (예: "3번 마")       |
| `odds`         | 배당률       | number   | `odds_snapshots.win`     | 발주 직전 단승 배당률                      |
| `result`       | 결과         | string   | `results.rank`           | 해당 출전의 최종 순위                      |
| `isHit`        | 적중 여부    | boolean  | `computed`               | 베팅 타입별 적중 판정 (1착/1-2착/연복 등)  |
| `payout`       | 배당금       | number   | `dividends.amount`       | 적중 시 배당금 (미적중 시 0)               |
| `profit`       | 손익         | computed | `payout - stake`         | 베팅금 대비 손익 (기본 베팅금 1,000원 기준)|
| `cumProfit`    | 누적 손익    | computed | `SUM(profit) OVER()`     | 해당 행까지의 누적 손익                    |

### 5.2 성과 요약 카드

- **위젯 ID**: `performance_summary_card`
  - 제목: 전략 성과 요약
  - 설명: 백테스트 핵심 지표를 한눈에 보여주는 카드
  - 데이터:
    - 입력: `BacktestResult`
    - 출력: 4개 핵심 지표
  - 지표 정의:

| 지표 ID      | 라벨(한글) | 계산 로직                                         |
| ------------ | ---------- | ------------------------------------------------- |
| `totalRaces` | 총 경주 수 | 조건 매칭된 경주 수                               |
| `hitRate`    | 적중률     | `(hitCount / totalRaces) * 100`                   |
| `roi`        | ROI        | `((totalPayout - totalStake) / totalStake) * 100` |
| `netProfit`  | 순이익     | `totalPayout - totalStake`                        |

### 5.3 전략 조건 필드 정의

> StrategyBuilder에서 선택 가능한 조건 필드

| 필드 ID           | 라벨(한글)     | 타입   | 소스              | 연산자                      |
| ----------------- | -------------- | ------ | ----------------- | --------------------------- |
| `type`            | 종목           | enum   | `races.type`      | `=`, `IN`                   |
| `track`           | 경기장         | enum   | `races.track`     | `=`, `IN`                   |
| `grade`           | 등급           | string | `races.grade`     | `=`, `IN`                   |
| `distance`        | 거리           | number | `races.distance`  | `=`, `>=`, `<=`, `BETWEEN`  |
| `popularityRank`  | 인기순위       | number | `computed`        | `=`, `>=`, `<=`, `BETWEEN`  |
| `winOdds`         | 단승배당률     | number | `odds_snapshots`  | `>=`, `<=`, `BETWEEN`       |
| `jockey`          | 기수           | string | `entries.jockey`  | `=`, `IN`                   |
| `trainer`         | 조교사         | string | `entries.trainer` | `=`, `IN`                   |
| `recentForm`      | 최근성적       | string | `entries.recent_record` | `CONTAINS`, `REGEX`   |
| `age`             | 연령           | number | `entries.age`     | `=`, `>=`, `<=`             |
| `weight`          | 부담중량       | number | `entries.weight`  | `>=`, `<=`, `BETWEEN`       |
| `dayOfWeek`       | 요일           | enum   | `computed`        | `=`, `IN`                   |
| `fieldSize`       | 출전두수       | number | `races.field_size`| `>=`, `<=`                  |

---

## 6. 필터 / 정렬 / 검색 (Controls)

### 6.1 백테스트 필터 정의

| 필터 ID     | 라벨        | 타입        | 대상 컬럼/필드    | 설명                          |
| ----------- | ----------- | ----------- | ----------------- | ----------------------------- |
| `dateRange` | 분석 기간   | dateRange   | `races.date`      | 시작일 ~ 종료일               |
| `types`     | 종목        | multiSelect | `races.type`      | 경마/경륜/경정 다중 선택      |
| `tracks`    | 경기장      | multiSelect | `races.track`     | 대상 경기장 다중 선택         |
| `betType`   | 베팅 타입   | select      | N/A               | 단승/연승/복승/쌍승 등        |
| `stake`     | 베팅금      | number      | N/A               | 기본 1,000원 (ROI 계산용)     |

### 6.2 결과 테이블 정렬 옵션

- 기본 정렬: `date` (DESC)
- 지원 정렬:
  - `date` – 날짜순
  - `profit` – 손익순
  - `odds` – 배당률순
  - `payout` – 배당금순

### 6.3 검색

- 검색 대상 필드:
  - `betTarget` (출전명/번호), `track`, `jockey`

---

## 7. 핵심 인사이트 정의 (Insights)

> "이 화면이 사용자에게 어떤 결론/통찰을 줘야 하는지"를 문장으로 정의

- **인사이트 1**: 이 전략은 과거 N년간 수익성이 있었는가?
  - 필요한 지표: `roi`, `netProfit`, `totalRaces`
  - 필요한 시각화: PerformanceSummaryCard, ROITrendChart
  - 예시 문장:
    > "해당 전략의 최근 1년 ROI는 +12.3%이며, 총 245경주 중 78경주 적중(적중률 31.8%)으로 +123,000원 순이익을 기록했습니다."

- **인사이트 2**: 전략의 수익성은 시간에 따라 어떻게 변했는가?
  - 필요한 지표: `monthlyRoi[]`, `cumProfit[]`
  - 필요한 시각화: ROITrendChart (라인 차트)
  - 예시 문장:
    > "이 전략은 2024년 상반기 ROI +25%에서 하반기 -5%로 성과가 하락하는 추세입니다."

- **인사이트 3**: 어떤 조건에서 전략이 더 효과적인가?
  - 필요한 지표: `roiByTrack`, `roiByGrade`, `roiByDistance`
  - 필요한 시각화: 조건별 ROI 비교 바 차트
  - 예시 문장:
    > "이 전략은 서울 경마장(ROI +18%)에서 부산경남(ROI -3%)보다 훨씬 효과적입니다."

- **인사이트 4**: 고배당 적중은 얼마나 자주 발생하는가?
  - 필요한 지표: `payoutDistribution`, `maxPayout`, `avgPayout`
  - 필요한 시각화: DividendDistributionChart (히스토그램)
  - 예시 문장:
    > "적중 78건 중 배당 10배 이상은 12건(15.4%)이며, 최고 배당은 45.2배(45,200원)입니다."

- **인사이트 5**: 다른 전략과 비교했을 때 어떤가?
  - 필요한 지표: `strategyComparison[]`
  - 필요한 시각화: StrategyComparePanel (테이블 + 차트)
  - 예시 문장:
    > "전략 A(ROI +12%)는 전략 B(ROI +8%)보다 수익성이 높지만, 적중률은 B가 더 높습니다(31% vs 42%)."

---

## 8. 파생 지표 계산식 (Derived Metrics)

### 8.1 백테스트 핵심 지표

```typescript
// 적중률 (Hit Rate)
interface HitRateCalc {
  formula: "hitCount / totalRaces * 100";
  inputs: {
    hitCount: number; // 베팅 타입별 적중 경주 수
    totalRaces: number; // 조건 매칭 총 경주 수
  };
  output: number; // 퍼센트 (%)
}

// ROI (Return on Investment)
interface ROICalc {
  formula: "(totalPayout - totalStake) / totalStake * 100";
  inputs: {
    totalPayout: number; // 총 배당금 수령액
    totalStake: number; // 총 베팅금 (경주수 × 베팅금)
  };
  output: number; // 퍼센트 (%)
}

// 순이익 (Net Profit)
interface NetProfitCalc {
  formula: "totalPayout - totalStake";
  inputs: {
    totalPayout: number;
    totalStake: number;
  };
  output: number; // 원
}

// 기대값 (Expected Value)
interface ExpectedValueCalc {
  formula: "(hitRate / 100) * avgPayoutOnHit - (1 - hitRate / 100) * stake";
  inputs: {
    hitRate: number; // 적중률 (%)
    avgPayoutOnHit: number; // 적중 시 평균 배당금
    stake: number; // 1회 베팅금
  };
  output: number; // 원 (양수면 +EV)
}

// 샤프 비율 (Sharpe Ratio) - 위험 대비 수익
interface SharpeRatioCalc {
  formula: "(avgProfit - riskFreeRate) / stdDevProfit";
  inputs: {
    avgProfit: number; // 경주당 평균 손익
    riskFreeRate: number; // 무위험 수익률 (0으로 가정)
    stdDevProfit: number; // 손익의 표준편차
  };
  output: number; // 높을수록 좋음
}
```

### 8.2 베팅 타입별 적중 판정

```typescript
type BetType = 'win' | 'place' | 'quinella' | 'exacta' | 'trio';

interface HitCriteria {
  win: "result.rank === 1"; // 단승: 1착
  place: "result.rank <= 2"; // 연승: 1-2착
  quinella: "selectedPair in top2"; // 복승: 선택 2마 모두 1-2착
  exacta: "selectedPair === [1st, 2nd]"; // 쌍승: 순서까지 맞춤
  trio: "selectedTrio in top3"; // 삼복승: 선택 3마 모두 1-3착
}
```

### 8.3 조건별 세부 분석

```typescript
// 조건별 ROI 세분화
interface SegmentedROI {
  byTrack: Record<string, number>; // 경기장별 ROI
  byGrade: Record<string, number>; // 등급별 ROI
  byDistance: Record<string, number>; // 거리 구간별 ROI
  byDayOfWeek: Record<string, number>; // 요일별 ROI
  byMonth: Record<string, number>; // 월별 ROI
  byOddsRange: Record<string, number>; // 배당률 구간별 ROI
}
```

---

## 9. 신규 DB 스키마 정의

### 9.1 strategies 테이블

```sql
CREATE TABLE strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255), -- 추후 인증 연동 시 사용
  name VARCHAR(255) NOT NULL,
  description TEXT,
  conditions JSONB NOT NULL, -- 조건식 JSON
  bet_type VARCHAR(20) NOT NULL DEFAULT 'win',
  stake INTEGER NOT NULL DEFAULT 1000,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 조건식 JSON 예시
-- {
--   "logic": "AND",
--   "conditions": [
--     { "field": "type", "operator": "=", "value": "horse" },
--     { "field": "popularityRank", "operator": "<=", "value": 3 },
--     { "field": "distance", "operator": ">=", "value": 1400 }
--   ]
-- }
```

### 9.2 backtest_results 테이블 (캐시)

```sql
CREATE TABLE backtest_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id UUID REFERENCES strategies(id) ON DELETE CASCADE,
  date_from DATE NOT NULL,
  date_to DATE NOT NULL,
  total_races INTEGER NOT NULL,
  hit_count INTEGER NOT NULL,
  total_stake BIGINT NOT NULL,
  total_payout BIGINT NOT NULL,
  roi DECIMAL(10, 4) NOT NULL,
  net_profit BIGINT NOT NULL,
  segmented_roi JSONB, -- 조건별 세부 ROI
  matched_race_ids UUID[], -- 매칭된 경주 ID 배열
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ -- 캐시 만료 시간
);

CREATE INDEX idx_backtest_strategy ON backtest_results(strategy_id);
CREATE INDEX idx_backtest_date_range ON backtest_results(date_from, date_to);
```

### 9.3 dividends 테이블 (확장)

```sql
-- 기존 results 테이블에 dividends 연관 또는 별도 테이블
CREATE TABLE dividends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  race_id UUID REFERENCES races(id) ON DELETE CASCADE,
  bet_type VARCHAR(20) NOT NULL, -- win, place, quinella, exacta, trio, etc.
  entries INTEGER[] NOT NULL, -- 적중 번호 배열
  amount INTEGER NOT NULL, -- 배당금 (원)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dividends_race ON dividends(race_id);
CREATE INDEX idx_dividends_bet_type ON dividends(race_id, bet_type);
```

---

## 10. API 엔드포인트 정의

### 10.1 전략 관리

```typescript
// POST /api/lab/strategies - 전략 저장
interface CreateStrategyRequest {
  name: string;
  description?: string;
  conditions: StrategyCondition;
  betType: BetType;
  stake: number;
}

// GET /api/lab/strategies - 저장된 전략 목록
// GET /api/lab/strategies/:id - 전략 상세
// PUT /api/lab/strategies/:id - 전략 수정
// DELETE /api/lab/strategies/:id - 전략 삭제
```

### 10.2 백테스트 실행

```typescript
// POST /api/lab/backtest - 백테스트 실행
interface BacktestRequest {
  conditions: StrategyCondition;
  dateFrom: string; // YYYY-MM-DD
  dateTo: string;
  betType: BetType;
  stake: number;
  types?: RaceType[];
  tracks?: string[];
}

interface BacktestResponse {
  success: boolean;
  data: {
    summary: {
      totalRaces: number;
      hitCount: number;
      hitRate: number;
      roi: number;
      netProfit: number;
      avgPayout: number;
      maxPayout: number;
    };
    segmentedROI: SegmentedROI;
    trendData: { period: string; roi: number; cumProfit: number }[];
    payoutDistribution: number[];
    matchedRaces: MatchedRace[];
  };
  timestamp: string;
}
```

### 10.3 전략 비교

```typescript
// POST /api/lab/compare - 다중 전략 비교
interface CompareRequest {
  strategies: {
    conditions: StrategyCondition;
    name: string;
  }[];
  dateFrom: string;
  dateTo: string;
  betType: BetType;
}
```

---

## 11. 성능 / 데이터 품질 고려사항

- **데이터 최신성**:
  - 과거 데이터 기반이므로 실시간성 불필요
  - 매일 새벽 배치로 전일 결과 적재
- **백테스트 성능**:
  - 1년 데이터 기준 ~3,000 경주 스캔 필요
  - 복잡한 조건식의 경우 2-5초 소요 예상
  - 캐시 테이블 활용으로 반복 조회 최적화
- **페이지당 레코드 수**:
  - 매칭 경주 테이블: 기본 50건, 최대 200건
- **쿼리 최적화**:
  - `races(date, type, track)` 복합 인덱스
  - `odds_snapshots(race_id, timestamp)` 인덱스
  - `results(race_id, rank)` 인덱스
  - 조건 필터링은 DB 레벨에서 수행
- **캐시 전략**:
  - 동일 조건/기간 백테스트 결과 24시간 캐시
  - 캐시 키: `hash(conditions + dateRange + betType)`

---

## 12. TODO / Open Questions

### TODO

- [ ] StrategyCondition JSON 스키마 상세 정의 (중첩 AND/OR 지원 범위)
- [ ] 인기순위(popularityRank) 계산 로직 - odds_snapshots 기반 순위 산출
- [ ] 경륜/경정 베팅 타입 매핑 (경마와 용어 차이)
- [ ] 전략 프리셋 목록 기획 (초보자용 기본 전략)
- [ ] 사용자 인증 연동 전 임시 저장 방식 (localStorage vs 세션)

### Open Questions

- Q1: 백테스트 최대 기간 제한? (전체 데이터 vs 최근 N년)
- Q2: 복합 베팅(쌍승, 삼복승 등) 조건 빌더 지원 범위?
- Q3: 전략 공유 기능의 범위? (URL 공유 vs 커뮤니티 게시)
- Q4: 실시간 베팅 연동(베팅 추천) 기능으로 확장 계획?

---

## 13. 연관 화면 참조

- [ui-race-explorer.md](./ui-race-explorer.md) - 경주 조건별 통계 (전략 조건 힌트)
- [ui-horse-explorer.md](./ui-horse-explorer.md) - 출전자 성적 데이터 (조건 필드 소스)
- [ui-today-dashboard.md](./ui-today-dashboard.md) - 오늘 경주에 전략 적용 결과 표시 (Phase 2)
