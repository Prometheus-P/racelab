# KRace API 명세서

## 1. 개요

KRace는 공공데이터포털의 API를 활용하여 경마/경륜/경정 정보를 제공합니다.

### 1.1 데이터 소스

| 기관 | API 종류 | Base URL |
|------|----------|----------|
| 한국마사회 | 경마 정보 | `http://apis.data.go.kr/B551015` |
| 국민체육진흥공단 | 경륜/경정 정보 | `http://apis.data.go.kr/B551014` |

### 1.2 인증

모든 API 호출에는 `serviceKey` 파라미터가 필요합니다.

```
?serviceKey={YOUR_API_KEY}&_type=json
```

## 2. 한국마사회 API (경마)

### 2.1 경주일정 조회

**Endpoint**: `GET /API214_17/raceHorse_1`

**Parameters**:
| 파라미터 | 필수 | 설명 | 예시 |
|----------|------|------|------|
| `serviceKey` | ✅ | API 인증키 | |
| `numOfRows` | ✅ | 한 페이지 결과 수 | 50 |
| `pageNo` | ✅ | 페이지 번호 | 1 |
| `rc_date` | ✅ | 경주일 (YYYYMMDD) | 20240115 |
| `meet` | ❌ | 경마장 코드 | 1=서울, 2=부산, 3=제주 |
| `_type` | ❌ | 응답 형식 | json |

**Request Example**:
```
GET /API214_17/raceHorse_1?serviceKey={KEY}&numOfRows=50&pageNo=1&rc_date=20240115&_type=json
```

**Response**:
```json
{
  "response": {
    "header": {
      "resultCode": "00",
      "resultMsg": "NORMAL SERVICE"
    },
    "body": {
      "items": {
        "item": [
          {
            "meet": "1",
            "rcNo": "1",
            "rcDate": "20240115",
            "rcTime": "11:30",
            "rcDist": "1200",
            "chulNo": "12",
            "rank": "국산5등급"
          }
        ]
      },
      "numOfRows": 50,
      "pageNo": 1,
      "totalCount": 12
    }
  }
}
```

**Field Mapping**:
| API 필드 | 설명 | 매핑 |
|----------|------|------|
| `meet` | 경마장 코드 | 1=서울, 2=부산경남, 3=제주 |
| `rcNo` | 경주 번호 | `raceNo` |
| `rcDate` | 경주일 | 내부 ID 생성용 |
| `rcTime` | 발주 시간 | `startTime` |
| `rcDist` | 거리(m) | `distance` |
| `chulNo` | 출주두수 | 참고용 |
| `rank` | 등급 | `grade` |

---

### 2.2 출마표 조회

**Endpoint**: `GET /API214_17/raceHorse_2`

**Parameters**:
| 파라미터 | 필수 | 설명 |
|----------|------|------|
| `serviceKey` | ✅ | API 인증키 |
| `numOfRows` | ✅ | 한 페이지 결과 수 |
| `pageNo` | ✅ | 페이지 번호 |
| `rc_date` | ✅ | 경주일 (YYYYMMDD) |
| `meet` | ✅ | 경마장 코드 |
| `rc_no` | ✅ | 경주 번호 |
| `_type` | ❌ | 응답 형식 |

**Response Fields**:
| 필드 | 설명 | 매핑 |
|------|------|------|
| `hrNo` | 마번 | `no` |
| `hrName` | 마명 | `name` |
| `jkName` | 기수명 | `jockey` |
| `trName` | 조교사명 | `trainer` |
| `age` | 연령 | `age` |
| `wgHr` | 부담중량 | `weight` |
| `rcRst` | 최근성적 | `recentRecord` |

---

### 2.3 배당률 조회

**Endpoint**: `GET /API214_17/raceHorse_3`

**Parameters**: 출마표와 동일

**Response Fields**:
| 필드 | 설명 | 매핑 |
|------|------|------|
| `hrNo` | 마번 | `no` |
| `ordOdds` | 단승 배당률 | `odds` |
| `plcOdds` | 복승 배당률 | (Phase 2) |

---

### 2.4 경주결과 조회

**Endpoint**: `GET /API214_17/raceHorse_4`

**Response Fields**:
| 필드 | 설명 |
|------|------|
| `ord` | 순위 |
| `hrNo` | 마번 |
| `hrName` | 마명 |
| `rcTime` | 기록 |
| `diffTime` | 착차 |

---

## 3. 국민체육진흥공단 API (경륜/경정)

### 3.1 경륜 출주표

**Endpoint**: `GET /API214_01/raceCycle_1`

**Parameters**:
| 파라미터 | 필수 | 설명 |
|----------|------|------|
| `serviceKey` | ✅ | API 인증키 |
| `numOfRows` | ✅ | 결과 수 |
| `pageNo` | ✅ | 페이지 |
| `rc_date` | ✅ | 경기일 |
| `meet` | ❌ | 경기장 (1=광명, 2=창원, 3=부산) |
| `_type` | ❌ | 응답 형식 |

**Response Fields**:
| 필드 | 설명 | 매핑 |
|------|------|------|
| `meet` | 경기장 코드 | 1=광명, 2=창원, 3=부산 |
| `rcNo` | 경주 번호 | `raceNo` |
| `rcTime` | 발주 시간 | `startTime` |
| `rcDist` | 거리 | `distance` |

---

### 3.2 경정 출주표

**Endpoint**: `GET /API214_02/raceBoat_1`

**Parameters**: 경륜과 동일

**Response Fields**:
| 필드 | 설명 | 매핑 |
|------|------|------|
| `meet` | 경기장 (미사리 단일) | `track` |
| `rcNo` | 경주 번호 | `raceNo` |
| `rcTime` | 발주 시간 | `startTime` |

---

### 3.3 경륜 경주결과

**Endpoint**: `GET /API214_03/raceCycle_3`

---

## 4. 내부 API 설계 (Next.js API Routes)

### 4.1 오늘 전체 경주

```typescript
// GET /api/races/today
// 오늘 모든 종목의 경주 목록

interface Response {
  success: boolean
  data: Race[]
  timestamp: string
}
```

### 4.2 종목별 경주

```typescript
// GET /api/races/horse
// GET /api/races/cycle
// GET /api/races/boat

interface Response {
  success: boolean
  data: Race[]
  timestamp: string
}
```

### 4.3 경주 상세

```typescript
// GET /api/race/[id]
// 예: /api/race/horse-1-1-20240115

interface Response {
  success: boolean
  data: Race
  timestamp: string
}
```

### 4.4 통계

```typescript
// GET /api/stats/today

interface Response {
  success: boolean
  data: {
    totalRaces: number
    horseRaces: number
    cycleRaces: number
    boatRaces: number
    nextRace?: {
      type: string
      track: string
      time: string
    }
  }
  timestamp: string
}
```

---

## 5. 에러 코드

### 5.1 공공데이터 API 에러

| 코드 | 설명 | 대응 |
|------|------|------|
| `00` | 정상 | - |
| `01` | 어플리케이션 에러 | 재시도 |
| `02` | DB 에러 | 재시도 |
| `03` | 데이터 없음 | 빈 결과 반환 |
| `04` | HTTP 에러 | 재시도 |
| `10` | 잘못된 요청 | 파라미터 확인 |
| `11` | 인증 실패 | API 키 확인 |
| `20` | 서비스 접근 거부 | 권한 확인 |
| `22` | 호출 제한 초과 | 캐싱 활용 |

### 5.2 내부 API 에러

```typescript
interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
  }
  timestamp: string
}
```

| 코드 | HTTP | 설명 |
|------|------|------|
| `NOT_FOUND` | 404 | 경주를 찾을 수 없음 |
| `INVALID_PARAMS` | 400 | 잘못된 파라미터 |
| `API_ERROR` | 502 | 외부 API 오류 |
| `SERVER_ERROR` | 500 | 서버 오류 |

---

## 6. Rate Limiting

### 6.1 공공데이터 API 제한

| 구분 | 제한 |
|------|------|
| 일일 호출 | 1,000회 (기본) |
| 초당 호출 | 제한 없음 |

### 6.2 캐싱 전략

```typescript
// Next.js fetch 캐싱
const response = await fetch(url, {
  next: { revalidate: 60 } // 60초 캐시
})
```

예상 호출 수:
- 페이지 로드당 API 호출: 3회 (경마, 경륜, 경정)
- 캐시 미스 시에만 실제 호출
- 일 예상 호출: ~200회 (여유 확보)

---

## 7. 테스트

### 7.1 API 테스트 (cURL)

```bash
# 경마 일정 조회
curl "http://apis.data.go.kr/B551015/API214_17/raceHorse_1?\
serviceKey=YOUR_KEY\
&numOfRows=10\
&pageNo=1\
&rc_date=20240115\
&_type=json"
```

### 7.2 개발 모드 (더미 데이터)

API 키 없이 개발 시 자동으로 더미 데이터 반환:

```typescript
if (!KRA_API_KEY) {
  return getDummyHorseRaces()
}
```

---

## 8. 변경 이력

| 버전 | 일자 | 변경 내용 |
|------|------|----------|
| 1.0 | 2024-XX-XX | 최초 작성 |

---
**문서 버전**: 1.0
**최종 수정일**: 2024-XX-XX
