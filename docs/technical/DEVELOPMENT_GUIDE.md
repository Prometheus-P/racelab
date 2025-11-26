# KRace 개발 가이드

## 1. 개발 환경 설정

### 1.1 필수 요구사항

| 도구 | 최소 버전 | 권장 버전 |
|------|----------|----------|
| Node.js | 18.17.0 | 20.x LTS |
| npm | 9.x | 10.x |
| Git | 2.x | 최신 |

### 1.2 초기 설정

```bash
# 저장소 클론
git clone https://github.com/your-org/krace.git
cd krace

# 의존성 설치
npm install

# 환경변수 설정
cp .env.local.example .env.local

# .env.local 편집 - API 키 입력
# KRA_API_KEY=your_key_here
# KSPO_API_KEY=your_key_here

# 개발 서버 실행
npm run dev
```

### 1.3 API 키 발급

1. [공공데이터포털](https://www.data.go.kr) 회원가입
2. 아래 API 활용 신청:
   - 한국마사회_경마정보 (경마)
   - 국민체육진흥공단_경륜경정정보 (경륜/경정)
3. 발급받은 키를 `.env.local`에 입력

> **참고**: API 키 없이도 더미 데이터로 개발 가능

---

## 2. 프로젝트 구조

```
krace/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── page.tsx               # 메인 페이지
│   │   ├── layout.tsx             # 루트 레이아웃
│   │   ├── globals.css            # 전역 스타일
│   │   ├── robots.ts              # SEO robots.txt
│   │   ├── sitemap.ts             # SEO sitemap
│   │   ├── race/[id]/             # 경주 상세 페이지
│   │   │   └── page.tsx
│   │   └── api/races/             # API 라우트
│   │       ├── horse/route.ts     # 경마 API
│   │       ├── cycle/route.ts     # 경륜 API
│   │       ├── boat/route.ts      # 경정 API
│   │       └── [type]/[id]/       # 동적 라우트
│   │           ├── entries/       # 출전표
│   │           ├── odds/          # 배당률
│   │           └── results/       # 결과
│   │
│   ├── components/                 # React 컴포넌트
│   │   ├── Header.tsx             # 헤더
│   │   ├── Footer.tsx             # 푸터
│   │   ├── TodayRaces.tsx         # 오늘의 경주 (Server)
│   │   └── QuickStats.tsx         # 통계 요약 (Server)
│   │
│   ├── lib/                        # 유틸리티
│   │   ├── api.ts                 # API 호출 함수
│   │   ├── api-helpers/
│   │   │   ├── mappers.ts         # API 응답 변환
│   │   │   └── dummy.ts           # 목업 데이터
│   │   └── utils/
│   │       ├── apiResponse.ts     # API 응답 헬퍼
│   │       ├── date.ts            # 날짜 유틸
│   │       └── ui.ts              # UI 유틸
│   │
│   └── types/                      # TypeScript 타입
│       └── index.ts
│
├── e2e/                            # E2E 테스트
│   ├── pages/                      # Page Objects
│   └── tests/                      # 테스트 파일
├── docs/                           # 문서
├── public/                         # 정적 파일
├── jest.config.js                  # Jest 통합 설정
├── jest.config.ui.js               # UI 테스트 설정
├── jest.config.api.js              # API 테스트 설정
├── playwright.config.ts            # Playwright 설정
├── next.config.js                  # Next.js 설정
├── tailwind.config.ts              # Tailwind 설정
├── tsconfig.json                   # TypeScript 설정
└── package.json
```

---

## 3. 코딩 컨벤션

### 3.1 TypeScript

```typescript
// ✅ 인터페이스 명명: PascalCase
interface Race {
  id: string
  type: RaceType
}

// ✅ 타입 정의: PascalCase
type RaceType = 'horse' | 'cycle' | 'boat'

// ✅ 함수 명명: camelCase
async function getRaceById(id: string): Promise<Race | null> {
  // ...
}

// ✅ 상수: UPPER_SNAKE_CASE
const API_BASE_URL = 'http://apis.data.go.kr'

// ✅ 컴포넌트: PascalCase
function RaceCard({ race }: { race: Race }) {
  return <div>...</div>
}
```

### 3.2 파일 명명

| 유형 | 컨벤션 | 예시 |
|------|--------|------|
| 컴포넌트 | PascalCase | `TodayRaces.tsx` |
| 유틸리티 | camelCase | `api.ts` |
| 타입 | camelCase | `index.ts` |
| 페이지 | kebab-case | `page.tsx` |

### 3.3 컴포넌트 구조

```tsx
// 1. Imports
import { Race } from '@/types'

// 2. Types/Interfaces
interface Props {
  race: Race
}

// 3. Component
export default function RaceCard({ race }: Props) {
  // 4. Hooks (해당시)
  
  // 5. Event handlers
  
  // 6. Render
  return (
    <div className="...">
      {/* content */}
    </div>
  )
}

// 7. Sub-components (필요시)
function SubComponent() { ... }
```

---

## 4. Tailwind CSS 가이드

### 4.1 커스텀 색상

```typescript
// tailwind.config.ts
colors: {
  primary: '#1a56db',    // 메인 블루
  secondary: '#7c3aed',  // 보조 퍼플
  horse: '#2d5a27',      // 경마 그린
  cycle: '#dc2626',      // 경륜 레드
  boat: '#0369a1',       // 경정 블루
}
```

### 4.2 유틸리티 클래스

```tsx
// ✅ 재사용 클래스는 globals.css에 정의
// globals.css
.card {
  @apply bg-white rounded-lg shadow-sm border border-gray-100 p-4;
}

.badge {
  @apply inline-flex items-center px-2 py-0.5 rounded text-xs font-medium;
}

// ✅ 사용
<div className="card">
  <span className="badge badge-horse">경마</span>
</div>
```

### 4.3 반응형 디자인

```tsx
// 모바일 퍼스트
<div className="
  grid 
  grid-cols-1           // 기본: 1열
  sm:grid-cols-2        // 640px+: 2열
  md:grid-cols-3        // 768px+: 3열
  lg:grid-cols-4        // 1024px+: 4열
  gap-4
">
```

---

## 5. API 연동

### 5.1 기본 패턴

```typescript
// src/lib/api.ts

// 환경변수
const KRA_API_KEY = process.env.KRA_API_KEY || ''

// API 호출 공통 함수
async function fetchApi<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    next: { revalidate: 60 } // 60초 캐시
  })
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`)
  }
  
  return response.json()
}

// API 키 없으면 더미 데이터 반환
export async function getHorseRacesToday(): Promise<Race[]> {
  if (!KRA_API_KEY) {
    return getDummyHorseRaces()
  }
  
  const url = `${API_BASE}/...?serviceKey=${KRA_API_KEY}&_type=json`
  const data = await fetchApi<KRAApiResponse>(url)
  return parseHorseRaces(data)
}
```

### 5.2 Server Component에서 사용

```tsx
// src/components/TodayRaces.tsx
import { getAllRacesToday } from '@/lib/api'

// Server Component - async 가능
export default async function TodayRaces() {
  const races = await getAllRacesToday()
  
  return (
    <div>
      {races.map(race => (
        <RaceCard key={race.id} race={race} />
      ))}
    </div>
  )
}
```

---

## 6. 테스트

### 6.1 테스트 실행

```bash
# Jest 단위/통합 테스트
npm run test                    # 전체 Jest 테스트 (UI + API)
npx jest path/to/file.test.ts   # 단일 파일

# Playwright E2E 테스트
npm run test:e2e                # 전체 E2E 테스트
npm run test:e2e:ui             # 인터랙티브 UI 모드
npm run test:e2e:debug          # 디버그 모드
npx playwright test -g "test"   # 특정 테스트

# 타입 체크 & 린트
npx tsc --noEmit
npm run lint

# 빌드 테스트
npm run build
```

### 6.2 테스트 구조

- **UI 테스트** (`jest.config.ui.js`): jsdom 환경, 컴포넌트 테스트
- **API 테스트** (`jest.config.api.js`): node 환경, API 라우트 테스트
- **E2E 테스트** (`playwright.config.ts`): 브라우저 환경, 전체 흐름 테스트

자세한 내용은 [TEST_GUIDE.md](../TEST_GUIDE.md) 참조

### 6.3 API 직접 테스트

```bash
# cURL로 외부 API 테스트
curl "http://apis.data.go.kr/B551015/API214_17/raceHorse_1?\
serviceKey=${KRA_API_KEY}\
&numOfRows=10&pageNo=1\
&rc_date=$(date +%Y%m%d)\
&_type=json" | jq
```

---

## 7. 배포

### 7.1 Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 7.2 환경변수 설정

Vercel 대시보드에서 설정:
1. Project Settings → Environment Variables
2. 추가:
   - `KRA_API_KEY`
   - `KSPO_API_KEY`
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_GA_ID` (선택)

### 7.3 도메인 연결

1. Vercel Dashboard → Domains
2. `krace.co.kr` 추가
3. DNS 설정:
   - A Record: `76.76.21.21`
   - CNAME: `cname.vercel-dns.com`

---

## 8. 트러블슈팅

### 8.1 빌드 에러

**문제**: `Type error: Cannot find module '@/types'`

**해결**:
```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 8.2 API 호출 실패

**문제**: `API Error: 401`

**해결**:
- API 키 확인 (`.env.local`)
- URL 인코딩 확인
- 공공데이터 포털에서 활용 신청 상태 확인

### 8.3 스타일 미적용

**문제**: Tailwind 클래스가 작동하지 않음

**해결**:
```typescript
// tailwind.config.ts - content 경로 확인
content: [
  './src/**/*.{js,ts,jsx,tsx,mdx}',
]
```

---

## 9. Git 워크플로우

### 9.1 브랜치 전략

```
main              # 프로덕션
├── develop       # 개발 통합
│   ├── feature/xxx  # 기능 개발
│   └── fix/xxx      # 버그 수정
└── hotfix/xxx    # 긴급 수정
```

### 9.2 커밋 메시지

```
feat: 경마 출마표 페이지 추가
fix: 배당률 표시 오류 수정
docs: API 명세서 업데이트
style: 모바일 레이아웃 개선
refactor: API 호출 로직 분리
```

---

## 10. 추가 리소스

- [Next.js 문서](https://nextjs.org/docs)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [공공데이터포털](https://www.data.go.kr)
- [Vercel 문서](https://vercel.com/docs)

---
**문서 버전**: 1.1
**최종 수정일**: 2025-11-26
