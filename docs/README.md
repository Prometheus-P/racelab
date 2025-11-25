# KRace - 경마/경륜/경정 통합 정보 플랫폼

> 한국 경마, 경륜, 경정 실시간 정보를 한눈에 제공하는 웹 서비스

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | KRace |
| 도메인 | https://krace.co.kr |
| 기술스택 | Next.js 14, TypeScript, Tailwind CSS |
| 데이터소스 | 공공데이터포털 (한국마사회, 국민체육진흥공단) |
| 수익모델 | Google AdSense, 제휴 마케팅 |

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
- [ ] AI 기반 예측 데이터
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

| 변수명 | 필수 | 설명 |
|--------|------|------|
| `KRA_API_KEY` | ✅ | 한국마사회 API 키 |
| `KSPO_API_KEY` | ✅ | 국민체육진흥공단 API 키 |
| `NEXT_PUBLIC_SITE_URL` | ✅ | 사이트 URL |
| `NEXT_PUBLIC_GA_ID` | ❌ | Google Analytics ID |
| `NEXT_PUBLIC_ADSENSE_ID` | ❌ | AdSense Publisher ID |

## 프로젝트 구조

```
krace/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # 메인 페이지
│   │   ├── layout.tsx         # 루트 레이아웃
│   │   ├── globals.css        # 전역 스타일
│   │   ├── horse/             # 경마 섹션
│   │   ├── cycle/             # 경륜 섹션
│   │   ├── boat/              # 경정 섹션
│   │   └── race/[id]/         # 개별 경주 상세
│   ├── components/            # React 컴포넌트
│   │   ├── TodayRaces.tsx    # 오늘의 경주 목록
│   │   ├── QuickStats.tsx    # 요약 통계
│   │   └── ...
│   ├── lib/                   # 유틸리티
│   │   └── api.ts            # API 호출 함수
│   └── types/                 # TypeScript 타입
│       └── index.ts
├── public/                    # 정적 파일
├── .env.local.example        # 환경변수 템플릿
├── next.config.js
├── tailwind.config.ts
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
