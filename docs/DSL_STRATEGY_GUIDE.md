# DSL Strategy Guide

> RaceLab 전략 정의 언어(DSL) 사용자 가이드

---

## 목차

1. [개요](#개요)
2. [YAML 포맷 스펙](#yaml-포맷-스펙)
3. [지원 필드](#지원-필드)
4. [연산자](#연산자)
5. [수식 엔진](#수식-엔진)
6. [전략 예시](#전략-예시)
7. [마이그레이션 가이드](#마이그레이션-가이드)
8. [API 레퍼런스](#api-레퍼런스)

---

## 개요

RaceLab DSL은 경마/경륜/경정 베팅 전략을 YAML 형식으로 정의하는 도메인 특화 언어입니다.

### 특징

- **선언적 문법**: 조건과 액션을 직관적으로 정의
- **Dot Notation**: `odds.win`, `horse.rating` 등 계층적 필드 접근
- **수식 지원**: mathjs 기반 안전한 수식 평가
- **타입 안전성**: Zod 스키마 기반 검증
- **역호환성**: Legacy JSON 포맷과 양방향 변환 지원

### 아키텍처

```
YAML/JSON Input
     ↓
  Parser (parser.ts)
     ↓
  Validator (Zod Schema)
     ↓
  DSLStrategyDefinition
     ↓
  Transformer → Legacy Format (선택)
     ↓
  Evaluator (evaluator.ts)
     ↓
  EvaluationResult[]
```

---

## YAML 포맷 스펙

### 기본 구조

```yaml
strategy:
  name: string           # 필수: 전략 이름
  version: number        # 필수: 정수 버전
  filters: DSLFilter[]   # 필수: 1-10개 조건
  scoring: DSLScoring    # 선택: 점수 계산
  action: BetAction      # 선택: 베팅 액션
  stake: DSLStake        # 선택: 배팅 금액
  raceFilters: object    # 선택: 경주 필터
  metadata: object       # 선택: 메타 정보
```

### 필수 필드

| 필드 | 타입 | 설명 |
|------|------|------|
| `name` | string | 전략 이름 (1-100자) |
| `version` | number | 정수 버전 (1 이상) |
| `filters` | array | 필터 조건 배열 (1-10개) |

### 선택 필드

| 필드 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `scoring` | object | - | 점수 계산 수식 |
| `action` | string | `bet_win` | 베팅 타입 |
| `stake` | object | - | 배팅 금액 설정 |
| `raceFilters` | object | - | 경주 유형 필터 |
| `metadata` | object | - | 작성자, 설명 등 |

---

## 지원 필드

### Phase 0: 배당률 관련

| Dot Notation | Flat Notation | 설명 | 단위 |
|--------------|---------------|------|------|
| `odds.win` | `odds_win` | 단승 배당률 | 배 |
| `odds.place` | `odds_place` | 복승 배당률 | 배 |
| `odds.drift_pct` | `odds_drift_pct` | 배당률 변화율 | % |
| `odds.stddev` | `odds_stddev` | 배당률 표준편차 | - |

### Phase 0: 수요/공급 관련

| Dot Notation | Flat Notation | 설명 | 범위 |
|--------------|---------------|------|------|
| `popularity.rank` | `popularity_rank` | 인기 순위 (1=최고) | 1-20 |
| `pool.total` | `pool_total` | 총 배팅 풀 | KRW |
| `pool.win_pct` | `pool_win_pct` | 단승 풀 비율 | 0-100% |

### Phase 1: 마필 정보

| Dot Notation | Flat Notation | 설명 | 범위 |
|--------------|---------------|------|------|
| `horse.rating` | `horse_rating` | 마필 레이팅 | 0-150 |
| `burden.weight` | `burden_weight` | 부담 중량 | 45-65kg |
| `entry.count` | `entry_count` | 출전 두수 | 2-16 |

### 필드 사용 예시

```yaml
filters:
  # Dot notation (권장)
  - field: odds.win
    operator: gte
    value: 5.0

  # Flat notation (호환)
  - field: odds_win
    operator: gte
    value: 5.0
```

---

## 연산자

### 지원 연산자 목록

| 연산자 | 기호 | 설명 | 값 타입 |
|--------|------|------|---------|
| `eq` | `=` | 같음 | single |
| `ne` | `≠` | 같지 않음 | single |
| `gt` | `>` | 초과 | number |
| `gte` | `≥` | 이상 | number |
| `lt` | `<` | 미만 | number |
| `lte` | `≤` | 이하 | number |
| `between` | `∈` | 범위 (포함) | [min, max] |
| `in` | `∈` | 목록 포함 | array |

### 연산자 사용 예시

```yaml
filters:
  # 단일 값 비교
  - field: odds.win
    operator: gte
    value: 5.0

  # 범위 비교
  - field: odds.win
    operator: between
    value: [3.0, 8.0]

  # 목록 포함
  - field: popularity.rank
    operator: in
    value: [1, 2, 3]

  # 같지 않음
  - field: horse.rating
    operator: ne
    value: 0
```

---

## 수식 엔진

### 기본 문법

```yaml
scoring:
  formula: "odds_win * 0.5 + horse_rating * 0.3"
  threshold: 2.0  # 선택: 최소 점수
```

### 허용된 연산자

| 연산자 | 설명 |
|--------|------|
| `+` | 덧셈 |
| `-` | 뺄셈 |
| `*` | 곱셈 |
| `/` | 나눗셈 |
| `^` | 거듭제곱 |
| `()` | 그룹화 |

### 허용된 함수

| 함수 | 설명 | 예시 |
|------|------|------|
| `min(a, b)` | 최솟값 | `min(odds_win, 10)` |
| `max(a, b)` | 최댓값 | `max(odds_win, 3)` |
| `abs(x)` | 절댓값 | `abs(odds_drift_pct)` |
| `floor(x)` | 내림 | `floor(odds_win)` |
| `ceil(x)` | 올림 | `ceil(odds_win)` |
| `round(x)` | 반올림 | `round(odds_win)` |
| `sqrt(x)` | 제곱근 | `sqrt(horse_rating)` |

### 허용된 변수

수식에서는 **Flat Notation**만 사용 가능합니다:

```
odds_win, odds_place, odds_drift_pct, odds_stddev,
popularity_rank, pool_total, pool_win_pct,
horse_rating, burden_weight, entry_count
```

### 수식 예시

```yaml
# 기본 가중치 계산
scoring:
  formula: "odds_win * 0.6 + horse_rating * 0.4"

# 함수 사용
scoring:
  formula: "max(odds_win, 3) * min(horse_rating, 100)"

# 복합 수식
scoring:
  formula: "(odds_win - 1) / pool_win_pct * 100 + sqrt(popularity_rank)"
  threshold: 5.0
```

### 보안 제약

| 제약 | 값 |
|------|-----|
| 최대 수식 길이 | 200자 |
| 금지 키워드 | `import`, `require`, `eval`, `Function`, `constructor` |
| 할당 연산자 | 금지 (`=`, `+=`, `-=` 등) |
| 변수 화이트리스트 | 강제 적용 |

---

## 전략 예시

### 1. Value Bet Scanner (고배당 스캐너)

```yaml
strategy:
  name: Value Bet Scanner
  version: 1
  filters:
    - field: odds.win
      operator: gte
      value: 5.0
    - field: popularity.rank
      operator: lte
      value: 5
  scoring:
    formula: "odds_win * horse_rating / 100"
    threshold: 2.0
  action: bet_win
  stake:
    fixed: 10000
  metadata:
    author: analyst_001
    description: 고배당 + 인기마 조합
    tags: [value-bet, high-odds]
```

### 2. Momentum Strategy (모멘텀 전략)

```yaml
strategy:
  name: Momentum Strategy
  version: 1
  filters:
    - field: odds.drift_pct
      operator: lt
      value: -10
    - field: odds.win
      operator: between
      value: [2.0, 6.0]
    - field: popularity.rank
      operator: lte
      value: 3
  scoring:
    formula: "abs(odds_drift_pct) * odds_win / 10"
    threshold: 3.0
  action: bet_win
  stake:
    percentOfBankroll: 3
  raceFilters:
    raceTypes: [horse]
    minEntries: 10
  metadata:
    description: 배당률 급락 마필 추적
    tags: [momentum, odds-movement]
```

### 3. Risk-Adjusted Strategy (위험 조정 전략)

```yaml
strategy:
  name: Risk-Adjusted Strategy
  version: 1
  filters:
    - field: odds.win
      operator: between
      value: [3.0, 5.0]
    - field: odds.stddev
      operator: lt
      value: 0.5
    - field: horse.rating
      operator: gte
      value: 80
    - field: pool.win_pct
      operator: gte
      value: 15
  scoring:
    formula: "(odds_win - 1) * horse_rating / (odds_stddev + 1) / 100"
    threshold: 1.5
  action: bet_win
  stake:
    fixed: 20000
    useKelly: true
  raceFilters:
    raceTypes: [horse, cycle]
    tracks: [서울, 부산경남]
  metadata:
    description: 안정적인 배당 + 높은 레이팅
    tags: [low-risk, stable-odds]
```

### 4. Underdog Hunter (비인기마 헌터)

```yaml
strategy:
  name: Underdog Hunter
  version: 1
  filters:
    - field: popularity.rank
      operator: gte
      value: 6
    - field: odds.win
      operator: between
      value: [8.0, 20.0]
    - field: horse.rating
      operator: gte
      value: 70
    - field: odds.drift_pct
      operator: lt
      value: -5
  scoring:
    formula: "odds_win * max(horse_rating - 60, 10) / 100"
    threshold: 4.0
  action: bet_win
  stake:
    fixed: 5000
  metadata:
    description: 저평가된 비인기마 발굴
    tags: [underdog, high-reward]
```

---

## 마이그레이션 가이드

### Legacy JSON → DSL YAML 변환

#### Legacy JSON 형식

```json
{
  "id": "uuid-string",
  "name": "My Strategy",
  "version": "1.0.0",
  "conditions": [
    {
      "field": "odds_win",
      "operator": "gte",
      "value": 5.0
    }
  ],
  "action": "bet_win",
  "stake": {
    "fixed": 10000
  },
  "metadata": {
    "author": "user",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### DSL YAML 형식 (변환 후)

```yaml
strategy:
  name: My Strategy
  version: 1
  filters:
    - field: odds.win       # flat → dot notation
      operator: gte
      value: 5.0
  action: bet_win
  stake:
    fixed: 10000
  metadata:
    author: user
    createdAt: "2024-01-01T00:00:00Z"
```

### 변환 규칙

| Legacy | DSL |
|--------|-----|
| `conditions` | `filters` |
| `odds_win` | `odds.win` |
| `odds_place` | `odds.place` |
| `popularity_rank` | `popularity.rank` |
| `horse_rating` | `horse.rating` |
| `version: "1.0.0"` | `version: 1` |

### 코드에서 변환

```typescript
import { transformLegacyToDSL, transformDSLToLegacy } from '@/lib/strategy/dsl';

// Legacy → DSL
const dslStrategy = transformLegacyToDSL(legacyStrategy);

// DSL → Legacy
const legacyStrategy = transformDSLToLegacy(dslStrategy);

// 자동 감지 및 정규화
const normalized = normalizeStrategy(unknownInput);
```

---

## API 레퍼런스

### Parser API

```typescript
import {
  parseDSL,
  parseYAML,
  parseJSON,
  detectFormat,
  validateDSLStructure,
} from '@/lib/strategy/dsl';

// YAML/JSON 자동 감지 파싱
const result = parseDSL(yamlOrJsonString);
if (result.success) {
  console.log(result.data); // DSLStrategyDefinition
} else {
  console.error(result.error); // { code, message, path? }
}

// 포맷 감지
const format = detectFormat(input); // 'json' | 'yaml' | undefined

// 구조 검증
const validation = validateDSLStructure(parsedObject);
```

### Expression API

```typescript
import {
  parseFormula,
  evaluateFormula,
  evaluateFormulaString,
  validateFormula,
  extractVariables,
} from '@/lib/strategy/dsl';

// 수식 검증
const validation = validateFormula('odds_win * 2');
if (validation.valid) {
  // OK
}

// 수식 평가
const context = {
  odds_win: 5.0,
  horse_rating: 85,
};
const result = evaluateFormulaString('odds_win * horse_rating / 100', context);
// result = 4.25

// 변수 추출
const vars = extractVariables('odds_win + horse_rating');
// ['odds_win', 'horse_rating']
```

### Evaluator API

```typescript
import { StrategyEvaluator } from '@/lib/strategy';

const evaluator = new StrategyEvaluator(strategy);

// 경주 전체 평가
const results = evaluator.evaluateRace(raceData);

// 단일 출전마 평가
const entryResult = evaluator.evaluateEntry(entryContext, raceData);
```

### 에러 코드

| 코드 | 설명 |
|------|------|
| `MISSING_STRATEGY_WRAPPER` | `strategy` 키 누락 |
| `MISSING_NAME` | `name` 필드 누락 |
| `MISSING_VERSION` | `version` 필드 누락 |
| `MISSING_FILTERS` | `filters` 배열 누락 |
| `EMPTY_FILTERS` | 빈 `filters` 배열 |
| `TOO_MANY_FILTERS` | 10개 초과 필터 |
| `INVALID_FIELD` | 알 수 없는 필드명 |
| `INVALID_OPERATOR` | 알 수 없는 연산자 |
| `INVALID_VALUE` | 잘못된 값 타입 |
| `INVALID_ACTION` | 알 수 없는 액션 |
| `FORMULA_TOO_LONG` | 200자 초과 수식 |
| `INVALID_VARIABLE` | 허용되지 않은 변수 |
| `PARSE_ERROR` | 구문 오류 |

---

## 시간 참조 (Time Reference)

배당률 변화 추적을 위한 시간 기준점:

```yaml
filters:
  - field: odds.win
    operator: gte
    value: 3.0
    timeRef: last  # 또는 first, T-5m, T-15m, T-30m, T-60m
```

| timeRef | 설명 |
|---------|------|
| `first` | 첫 수집 시점 |
| `last` | 마감 직전 |
| `T-5m` | 발매 마감 5분 전 |
| `T-15m` | 발매 마감 15분 전 |
| `T-30m` | 발매 마감 30분 전 |
| `T-60m` | 발매 마감 60분 전 |

---

## 베팅 액션 & 스테이크

### Action 타입

| Action | 설명 |
|--------|------|
| `bet_win` | 단승 베팅 |
| `bet_place` | 복승 베팅 |
| `bet_quinella` | 연승 베팅 (Phase 1+) |
| `skip` | 베팅 안함 |

### Stake 설정

```yaml
stake:
  fixed: 10000           # 고정 금액 (KRW)
  percentOfBankroll: 5   # 자본금 대비 % (0-100)
  useKelly: true         # Kelly Criterion 적용
```

---

## 경주 필터

특정 경주 유형만 대상으로 하는 필터:

```yaml
raceFilters:
  raceTypes: [horse, cycle, boat]  # 경주 유형
  tracks: [서울, 부산경남]           # 경주장
  grades: [G1, G2]                  # 등급
  minEntries: 8                     # 최소 출전 두수
```

---

## 제약 사항

| 항목 | 제한 |
|------|------|
| 최대 필터 수 | 10개 |
| 최대 수식 길이 | 200자 |
| 백테스트 기간 (Gold) | 90일 |
| 백테스트 기간 (QuantLab) | 365일 |
| 기본 초기 자본금 | 1,000,000 KRW |
| 기본 배팅 금액 | 10,000 KRW |

---

## 파일 위치

| 파일 | 용도 |
|------|------|
| `src/lib/strategy/index.ts` | 메인 exports |
| `src/lib/strategy/types.ts` | Legacy 타입 정의 |
| `src/lib/strategy/evaluator.ts` | 전략 평가 엔진 |
| `src/lib/strategy/validator.ts` | Zod 검증 스키마 |
| `src/lib/strategy/dsl/types.ts` | DSL 타입 & 필드 매핑 |
| `src/lib/strategy/dsl/parser.ts` | YAML/JSON 파서 |
| `src/lib/strategy/dsl/expression.ts` | 수식 엔진 |
| `src/lib/strategy/dsl/transformer.ts` | 포맷 변환 |
