# KRace - 경마/경륜/경정 통합 정보 플랫폼

> 한국 경마, 경륜, 경정 실시간 정보를 한눈에 제공하는 웹 서비스

## 프로젝트 개요

| 항목       | 내용                                          |
| ---------- | --------------------------------------------- |
| 프로젝트명 | KRace                                         |
| 도메인     | https://racelab.kr                            |
| 기술스택   | Next.js 14, TypeScript, Tailwind CSS          |
| 데이터소스 | 공공데이터포털 (한국마사회, 국민체육진흥공단) |
| 수익모델   | Google AdSense, 제휴 마케팅                   |

## 핵심 기능

### MVP (Phase 1)

- [ ] 오늘의 경주 일정 통합 조회
- [ ] 종목별 출마표/출전표 제공
- [ ] 실시간 배당률 표시
- [ ] 경주 결과 조회
- [ ] 반응형 모바일 UI

### Phase 2

- [ ] 배당률 변동 알림
- [ ] 과거 경주 데이터 분석
- [ ] 마필/선수 상세 정보
- [ ] PWA 지원

### Phase 3

- [ ] AI 기반 분석 데이터
- [ ] 커뮤니티 기능
- [ ] 유료 프리미엄 서비스

## 빠른 시작

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.local.example .env.local
# API 키 입력 필요

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
npm run start
```

## 환경변수

| 변수명                   | 필수 | 설명                    |
| ------------------------ | ---- | ----------------------- |
| `KRA_API_KEY`            | ✅   | 한국마사회 API 키       |
| `KSPO_API_KEY`           | ✅   | 국민체육진흥공단 API 키 |
| `NEXT_PUBLIC_SITE_URL`   | ✅   | 사이트 URL              |
| `NEXT_PUBLIC_GA_ID`      | ❌   | Google Analytics ID     |
| `NEXT_PUBLIC_ADSENSE_ID` | ❌   | AdSense Publisher ID    |

## 프로젝트 구조

```
krace/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── page.tsx               # 메인 페이지
│   │   ├── layout.tsx             # 루트 레이아웃
│   │   ├── globals.css            # 전역 스타일
│   │   ├── robots.ts              # SEO robots.txt
│   │   ├── sitemap.ts             # SEO sitemap
│   │   ├── race/[id]/             # 개별 경주 상세
│   │   │   └── page.tsx
│   │   └── api/races/             # API 라우트
│   │       ├── [type]/route.ts    # 동적 타입 라우트
│   │       ├── horse/route.ts     # 경마 API
│   │       ├── cycle/route.ts     # 경륜 API
│   │       └── boat/route.ts      # 경정 API
│   ├── components/                 # React 컴포넌트
│   │   ├── Header.tsx             # 헤더
│   │   ├── Footer.tsx             # 푸터
│   │   ├── TodayRaces.tsx         # 오늘의 경주 목록
│   │   └── QuickStats.tsx         # 요약 통계
│   ├── lib/                        # 유틸리티
│   │   ├── api.ts                 # API 호출 함수
│   │   ├── api-helpers/
│   │   │   ├── mappers.ts         # API 응답 변환
│   │   │   └── dummy.ts           # 목업 데이터
│   │   └── utils/
│   │       ├── apiResponse.ts     # API 응답 헬퍼
│   │       ├── date.ts            # 날짜 유틸
│   │       └── ui.ts              # UI 유틸
│   └── types/                      # TypeScript 타입
│       └── index.ts
├── e2e/                            # E2E 테스트 (Playwright)
│   ├── pages/                      # Page Objects
│   │   ├── base.page.ts
│   │   ├── home.page.ts
│   │   └── race-detail.page.ts
│   └── tests/
│       ├── home.spec.ts
│       ├── race-detail.spec.ts
│       └── api.spec.ts
├── docs/                           # 문서
│   ├── business/                   # 비즈니스 문서
│   ├── technical/                  # 기술 문서
│   └── operations/                 # 운영 문서
├── public/                         # 정적 파일
├── next.config.js
├── tailwind.config.ts
├── jest.config.js                  # Jest 통합 설정
├── jest.config.ui.js               # UI 테스트 설정
├── jest.config.api.js              # API 테스트 설정
├── playwright.config.ts            # Playwright 설정
└── package.json
```

## API 연동

### 한국마사회 (경마)

- 엔드포인트: `http://apis.data.go.kr/B551015`
- 주요 API: 경주일정, 출마표, 배당률, 경주결과

### 국민체육진흥공단 (경륜/경정)

- 엔드포인트: `http://apis.data.go.kr/B551014`
- 경륜: API214_01, API214_03
- 경정: API214_02

## 배포

Vercel 배포 권장:

```bash
# Vercel CLI
npm i -g vercel
vercel

# 환경변수는 Vercel 대시보드에서 설정
```

## 라이선스

ISC License

## 문의

- 도박 문제 상담: 1336 (한국도박문제관리센터)
- 본 서비스는 정보 제공 목적이며, 베팅 결과를 보장하지 않습니다.
