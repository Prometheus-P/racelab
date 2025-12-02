# 공공데이터 API 명세서

> 최종 업데이트: 2025-12-02
> 활용기간: 2025-12-01 ~ 2027-12-01

## 개요

KRace 프로젝트에서 사용하는 공공데이터포털(data.go.kr) API 목록입니다.

- **인증키**: 모든 API에 동일한 Decoding 키 사용
- **Base URL (KRA)**: `https://apis.data.go.kr/B551015`
- **Base URL (KSPO)**: `https://apis.data.go.kr/B551014`

---

## 경마 (KRA) - 한국마사회

### 승인된 API 목록 (6개)

| API명 | 엔드포인트 | 설명 페이지 | 현재 사용 |
|-------|-----------|------------|----------|
| 경마경주정보 | `/API187` | [링크](https://www.data.go.kr/data/15063951/openapi.do) | |
| **경마시행당일_경주결과종합** | `/API299` | [링크](https://www.data.go.kr/data/15119524/openapi.do) | ✅ 사용 중 |
| 경마시행당일_확정배당율종합 | `/API301` | [링크](https://www.data.go.kr/data/15119558/openapi.do) | |
| 출전 등록말 정보 | `/API23_1` | [링크](https://www.data.go.kr/data/15056699/openapi.do) | |
| 출전표 상세정보 | `/API26_2` | [링크](https://www.data.go.kr/data/15058677/openapi.do) | |
| AI기반연구용_경주결과상세 | `/API156` | [링크](https://www.data.go.kr/data/15150068/openapi.do) | |

### API299 (경주결과종합) - 현재 사용 중

```
GET https://apis.data.go.kr/B551015/API299/Race_Result_total
```

**파라미터:**
| 파라미터 | 필수 | 설명 |
|---------|------|------|
| serviceKey | Y | 인증키 (Decoding) |
| numOfRows | N | 한 페이지 결과 수 (기본: 100) |
| pageNo | N | 페이지 번호 (기본: 1) |
| rc_date | Y | 경주일자 (YYYYMMDD) |
| _type | N | 응답형식 (json/xml) |

**응답 필드:**
- `meet`: 경마장명 (서울, 부산, 제주)
- `rcNo`: 경주번호
- `rcDate`: 경주일자
- `chulNo`: 출전번호
- `hrName`: 마명
- `jkName`: 기수명
- `ord`: 순위
- `rcTime`: 주파기록
- `rank`: 등급
- `schStTime`: 발주예정시각

---

## 경륜 (KSPO Cycle) - 국민체육진흥공단

### 승인된 API 목록 (6개)

| API명 | 엔드포인트 | 설명 페이지 | 현재 사용 |
|-------|-----------|------------|----------|
| **출주표_GW** | `/SRVC_OD_API_CRA_RACE_ORGAN` | [링크](https://www.data.go.kr/data/15107830/openapi.do) | ✅ 사용 중 |
| 경주결과_GW | `/SRVC_TODZ_CRA_RACE_RESULT` | [링크](https://www.data.go.kr/data/15107816/openapi.do) | |
| 배당률_GW | `/SRVC_OD_API_CRA_PAYOFF` | [링크](https://www.data.go.kr/data/15107845/openapi.do) | |
| 선수정보 | `/SRVC_CRA_RACER_INFO` | [링크](https://www.data.go.kr/data/15107844/openapi.do) | |
| 경주결과순위 정보 | `/SRVC_CRA_RACE_RANK` | [링크](https://www.data.go.kr/data/15143989/openapi.do) | |
| 운영 정보_GW | `/SRVC_OD_API_CRA_CYCLE_EXER` | [링크](https://www.data.go.kr/data/15107870/openapi.do) | |

### SRVC_OD_API_CRA_RACE_ORGAN (출주표) - 현재 사용 중

```
GET https://apis.data.go.kr/B551014/SRVC_OD_API_CRA_RACE_ORGAN/TODZ_API_CRA_RACE_ORGAN_I
```

**응답 필드:**
- `meet_nm`: 경기장명 (광명/창원/부산)
- `race_no`: 경주번호
- `back_no`: 배번
- `racer_nm`: 선수명
- `racer_age`: 선수연령
- `win_rate`: 승률
- `gear_rate`: 기어배율

---

## 경정 (KSPO Boat) - 국민체육진흥공단

### 승인된 API 목록 (6개)

| API명 | 엔드포인트 | 설명 페이지 | 현재 사용 |
|-------|-----------|------------|----------|
| **출주표_GW** | `/SRVC_OD_API_VWEB_MBR_RACE_INFO` | [링크](https://www.data.go.kr/data/15107808/openapi.do) | ✅ 사용 중 |
| 경주결과_GW | `/SRVC_OD_API_MBR_RACE_RESULT` | [링크](https://www.data.go.kr/data/15107847/openapi.do) | |
| 배당률_GW | `/SRVC_OD_API_MBR_PAYOFF` | [링크](https://www.data.go.kr/data/15107811/openapi.do) | |
| 선수정보 | `/SRVC_VWEB_MBR_RACER_INFO` | [링크](https://www.data.go.kr/data/15107809/openapi.do) | |
| 경주결과순위 정보 | `/SRVC_MRA_RACE_RANK` | [링크](https://www.data.go.kr/data/15143984/openapi.do) | |
| 운영 정보_GW | `/SRVC_OD_API_MRA_SUPP_CD` | [링크](https://www.data.go.kr/data/15107867/openapi.do) | |

### SRVC_OD_API_VWEB_MBR_RACE_INFO (출주표) - 현재 사용 중

```
GET https://apis.data.go.kr/B551014/SRVC_OD_API_VWEB_MBR_RACE_INFO/TODZ_API_VWEB_MBR_RACE_I
```

**응답 필드:**
- `meet_nm`: 경기장명 (미사리)
- `race_no`: 경주번호
- `back_no`: 배번
- `racer_nm`: 선수명
- `racer_age`: 선수연령
- `motor_no`: 모터번호
- `boat_no`: 보트번호
- `tms_6_avg_rank_scr`: 최근6회차 평균착순점수

---

## 인증키 정보

환경변수에는 Decoding 버전 사용 (Next.js가 자동 인코딩 처리)

```bash
# .env.local
KRA_API_KEY=your_decoding_key_here
KSPO_API_KEY=your_decoding_key_here
```

---

## API 연동 현황

| 종목 | 엔드포인트 | 상태 |
|------|-----------|------|
| 경마 | `/API299/Race_Result_total` | ✅ 연동 완료 |
| 경륜 | `/SRVC_OD_API_CRA_RACE_ORGAN/TODZ_API_CRA_RACE_ORGAN_I` | ✅ 연동 완료 |
| 경정 | `/SRVC_OD_API_VWEB_MBR_RACE_INFO/TODZ_API_VWEB_MBR_RACE_I` | ✅ 연동 완료 |

### 향후 작업 (Phase 2)
- [ ] 배당률 API 연동
- [ ] 경주결과 API 연동
- [ ] 선수정보 API 연동

---

## 참고 자료

- [공공데이터포털](https://www.data.go.kr)
- [한국마사회 오픈API](https://www.data.go.kr/dataset/15045628/openapi.do)
- [국민체육진흥공단 오픈API](https://www.data.go.kr/dataset/15044947/openapi.do)
