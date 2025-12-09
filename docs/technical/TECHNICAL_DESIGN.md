# KRace 기술 설계 문서 (Technical Design Document)

> **이 문서는 RaceLab 프로젝트의 기술적인 아키텍처 및 핵심 컴포넌트 설계를 정의합니다.**
> **시스템의 전체적인 구조와 데이터 흐름, 주요 기술 스택을 이해하는 데 사용됩니다.**
> 상세한 외부 API 명세는 `API_README_v2.md`를 참조하고, CONTEXT.md는 전체 프로젝트 맥락을 제공합니다.

## 1. 시스템 아키텍처

### 1.1 전체 구조

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐ │
│  │ Desktop │  │ Mobile  │  │ Tablet  │  │ PWA (Phase 2)   │ │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────────┬────────┘ │
└───────┼────────────┼────────────┼────────────────┼──────────┘
        │            │            │                │
        └────────────┴─────┬──────┴────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                       CDN (Vercel Edge)                      │
│                    Static Assets / Cache                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    Application Layer                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Next.js 14 (App Router)                  │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────────────┐│   │
│  │  │ SSR Pages  │ │ API Routes │ │ Server Components  ││   │
│  │  └────────────┘ └────────────┘ └────────────────────┘│   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                      Data Layer                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  KRA API    │  │  KSPO API   │  │  Cache (in-memory)  │  │
│  │  (경마)     │  │ (경륜/경정) │  │  revalidate: 60s    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 기술 스택 상세

| Layer     | 기술                    | 버전 | 용도              |
| --------- | ----------------------- | ---- | ----------------- |
| Runtime   | Node.js                 | 18+  | 서버 런타임       |
| Framework | Next.js                 | 14.x | 풀스택 프레임워크 |
| Language  | TypeScript              | 5.x  | 타입 안정성       |
| Styling   | Tailwind CSS            | 3.4  | 유틸리티 CSS      |
| State     | React Server Components | -    | 서버 상태 관리    |
| Hosting   | Vercel                  | -    | 서버리스 배포     |
| Analytics | Google Analytics 4      | -    | 사용자 분석       |
| Ads       | Google AdSense          | -    | 광고 수익화       |

## 2. 데이터 흐름

### 2.1 API 데이터 흐름

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   공공데이터포털  │     │   Next.js API    │     │     Client       │
│   (KRA/KSPO)     │     │   Route Cache    │     │   (Browser)      │
└────────┬─────────┘     └────────┬─────────┘     └────────┬─────────┘
         │                        │                        │
         │  1. Fetch (60s cache)  │                        │
         │◄───────────────────────│                        │
         │                        │                        │
         │  2. JSON Response      │                        │
         │───────────────────────►│                        │
         │                        │                        │
         │                        │  3. SSR HTML           │
         │                        │───────────────────────►│
         │                        │                        │
         │                        │  4. Client Hydration   │
         │                        │◄──────────────────────►│
```

### 2.2 캐싱 전략

| 데이터 유형 | 캐시 시간 | 전략                  |
| ----------- | --------- | --------------------- |
| 경주 일정   | 60초      | `revalidate: 60`      |
| 출마표      | 60초      | `revalidate: 60`      |
| 배당률      | 30초      | 실시간 갱신 (Phase 2) |
| 경주 결과   | 5분       | `revalidate: 300`     |
| 정적 콘텐츠 | 24시간    | CDN Cache             |

## 3. API 명세

### 3.1 공공데이터 API (외부)

RaceLab 프로젝트에서 사용하는 한국마사회(KRA) 및 국민체육진흥공단(KSPO)의 외부 공공데이터 API 상세 스펙은 [API_README_v2.md](./API_README_v2.md) 문서에서 확인할 수 있습니다. 이 문서는 각 API 엔드포인트별 상세 요청/응답 파라미터 및 데이터 형식을 다룹니다.

- **한국마사회 API**: 경주 일정, 출마표, 배당률, 경주 결과 등
- **국민체육진흥공단 API (경륜/경정)**: 경륜/경정 출주표, 경주 결과 등


### 3.2 내부 API (Next.js API Routes)

```typescript
// GET /api/races/today
// 오늘 전체 경주 조회
Response: Race[]

// GET /api/races/[type]
// 종목별 경주 조회 (type: horse | cycle | boat)
Response: Race[]

// GET /api/race/[id]
// 개별 경주 상세
Response: Race

// GET /api/stats/today
// 오늘 통계
Response: DailyStats
```

## 4. 데이터 모델

### 4.1 핵심 타입

```typescript
// 종목 타입
type RaceType = 'horse' | 'cycle' | 'boat';

// 경주 상태
type RaceStatus = 'upcoming' | 'live' | 'finished' | 'canceled';

// 경주 정보
interface Race {
  id: string; // 고유 ID (예: horse-1-1-20240101)
  type: RaceType; // 종목
  raceNo: number; // 경주 번호
  track: string; // 경기장 (서울, 부산경남, 제주, 광명, 미사리)
  startTime: string; // 발주 시간 (HH:mm)
  distance: number; // 거리 (m)
  grade?: string; // 등급
  status: RaceStatus; // 상태
  entries: Entry[]; // 출전 목록
}

// 출전 정보
interface Entry {
  no: number; // 번호
  name: string; // 마명/선수명
  jockey?: string; // 기수 (경마)
  trainer?: string; // 조교사 (경마)
  age?: number; // 연령
  weight?: number; // 부담중량
  odds?: number; // 단승 배당률
  recentRecord?: string; // 최근 성적
}

// 일일 통계
interface DailyStats {
  totalRaces: number;
  horseRaces: number;
  cycleRaces: number;
  boatRaces: number;
  nextRace?: {
    type: RaceType;
    track: string;
    time: string;
    raceNo: number;
  };
}
```

### 4.2 ID 규칙

```
{type}-{meet}-{raceNo}-{date}

예시:
- horse-1-3-20240115  (서울 3R, 2024.01.15)
- cycle-1-5-20240115  (광명 5R, 2024.01.15)
- boat-1-2-20240115   (미사리 2R, 2024.01.15)

meet 코드:
- 경마: 1=서울, 2=부산경남, 3=제주
- 경륜: 1=광명, 2=창원, 3=부산
- 경정: 1=미사리
```

## 5. 컴포넌트 설계

### 5.1 컴포넌트 계층

```
App
├── Layout (layout.tsx)
│   ├── Header
│   │   ├── Logo
│   │   └── Navigation
│   ├── Main Content
│   └── Footer
│
├── HomePage (page.tsx)
│   ├── QuickStats (Server Component)
│   ├── TodayRaces (Server Component)
│   │   ├── RaceSection
│   │   │   └── RaceRow
│   │   └── ...
│   └── InfoBanner
│
└── RaceDetailPage (race/[id]/page.tsx)
    ├── RaceHeader
    ├── EntryTable
    │   └── EntryRow
    └── OddsChart
```

### 5.2 주요 컴포넌트 책임

| 컴포넌트      | 타입   | 책임                          |
| ------------- | ------ | ----------------------------- |
| `TodayRaces`  | Server | 오늘 경주 목록 fetch & render |
| `QuickStats`  | Server | 통계 요약 표시                |
| `RaceSection` | Client | 종목별 그룹화 표시            |
| `RaceRow`     | Client | 개별 경주 카드                |
| `EntryTable`  | Client | 출마표 테이블                 |
| `OddsChart`   | Client | 배당률 시각화                 |

## 6. 라우팅 구조

```
/                       # 메인 (오늘의 경주)
├── ?tab=horse         # 경마 탭
├── ?tab=cycle         # 경륜 탭
└── ?tab=boat          # 경정 탭

/horse                  # 경마 섹션 (Phase 2)
/cycle                  # 경륜 섹션 (Phase 2)
/boat                   # 경정 섹션 (Phase 2)

/race/[id]             # 경주 상세
├── /race/horse-1-1-20240115
└── ...

/results               # 경주 결과 (Phase 2)
/analysis              # 분석 도구 (Phase 3)
```

## 7. 성능 최적화

### 7.1 Core Web Vitals 목표

| 지표 | 목표    | 전략               |
| ---- | ------- | ------------------ |
| LCP  | < 2.5s  | SSR, 이미지 최적화 |
| FID  | < 100ms | 코드 스플리팅      |
| CLS  | < 0.1   | 레이아웃 예약      |
| TTFB | < 800ms | Edge Functions     |

### 7.2 최적화 전략

1. **Server Components**: 데이터 fetch는 서버에서
2. **Streaming**: Suspense로 점진적 렌더링
3. **Caching**: 60초 revalidate
4. **Code Splitting**: 동적 import
5. **Image Optimization**: next/image 사용

## 8. 보안 고려사항

### 8.1 API 키 보호

- 환경변수로 관리 (`.env.local`)
- 클라이언트 노출 방지 (서버 사이드 호출만)

### 8.2 XSS 방지

- React 기본 이스케이핑
- dangerouslySetInnerHTML 미사용

### 8.3 Rate Limiting

- 공공데이터 API 일일 호출 제한 준수
- 캐싱으로 호출 최소화

## 9. 모니터링

### 9.1 Vercel Analytics (무료)

- 실시간 트래픽
- Web Vitals
- 에러 추적

### 9.2 Google Analytics 4

- 사용자 행동 분석
- 전환 추적
- 커스텀 이벤트

### 9.3 로깅

```typescript
// 에러 로깅
console.error('API Fetch Error:', {
  endpoint,
  error: error.message,
  timestamp: new Date().toISOString(),
});
```

## 10. 배포 파이프라인

```
Git Push (main)
       │
       ▼
┌──────────────┐
│ Vercel Build │
│   npm build  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Type Check  │
│  Lint Check  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Deploy     │
│   Preview    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Production  │
│   (merge)    │
└──────────────┘
```

---

**문서 버전**: 1.0
**최종 수정일**: 2024-XX-XX
