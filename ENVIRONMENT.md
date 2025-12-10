---
title: KRace 환경 설정 가이드
version: 1.0.0
status: Approved
owner: '@Prometheus-P'
created: 2025-11-25
updated: 2025-11-25
reviewers: []
language: Korean (한국어)
---

# ENVIRONMENT.md - 환경 설정 가이드

> **이 문서는 KRace 프로젝트의 개발 및 배포 환경 설정을 안내합니다.**

---

## 변경 이력 (Changelog)

| 버전  | 날짜       | 작성자        | 변경 내용 |
| ----- | ---------- | ------------- | --------- |
| 1.0.0 | 2025-11-25 | @Prometheus-P | 최초 작성 |

## 관련 문서 (Related Documents)

- [CONTEXT.md](./CONTEXT.md) - 프로젝트 컨텍스트
- [README.md](./README.md) - 빠른 시작 가이드
- [docs/technical/DEVELOPMENT_GUIDE.md](./docs/technical/DEVELOPMENT_GUIDE.md) - 개발 가이드

---

## 1. 시스템 요구 사항

### 1.1 필수 소프트웨어

| 소프트웨어  | 최소 버전 | 권장 버전 | 확인 명령어      |
| ----------- | --------- | --------- | ---------------- |
| **Node.js** | 18.17.0   | 20.x LTS  | `node --version` |
| **npm**     | 9.0.0     | 10.x      | `npm --version`  |
| **Git**     | 2.30.0    | 최신      | `git --version`  |

### 1.2 선택 소프트웨어

| 소프트웨어     | 용도                | 설치 링크                                  |
| -------------- | ------------------- | ------------------------------------------ |
| **VS Code**    | 권장 IDE            | [다운로드](https://code.visualstudio.com/) |
| **Docker**     | 컨테이너 환경       | [다운로드](https://www.docker.com/)        |
| **Playwright** | E2E 테스트 브라우저 | 자동 설치 (`npx playwright install`)       |

### 1.3 VS Code 권장 확장

```json
// .vscode/extensions.json (권장 확장)
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-playwright.playwright",
    "formulahendry.auto-rename-tag"
  ]
}
```

---

## 2. 환경 변수 설정

### 2.1 환경 변수 파일

프로젝트는 환경별로 다른 `.env` 파일을 사용합니다:

| 파일                 | 용도             | Git 추적      |
| -------------------- | ---------------- | ------------- |
| `.env.local.example` | 환경 변수 템플릿 | ✅ 추적됨     |
| `.env.local`         | 로컬 개발 환경   | ❌ .gitignore |
| `.env.development`   | 개발 환경        | ❌ .gitignore |
| `.env.production`    | 프로덕션 환경    | ❌ .gitignore |

### 2.2 환경 변수 상세

```bash
# ══════════════════════════════════════════════════════════════
# .env.local - 로컬 개발 환경 변수
# ══════════════════════════════════════════════════════════════

# ┌─────────────────────────────────────────────────────────────┐
# │ 필수 설정 (Required)                                        │
# └─────────────────────────────────────────────────────────────┘

# 한국마사회 API 키
# 발급: https://www.data.go.kr/data/15000419/openapi.do
KRA_API_KEY=your_kra_api_key_here

# 국민체육진흥공단 API 키 (경륜/경정)
# 발급: https://www.data.go.kr/data/15044947/openapi.do
KSPO_API_KEY=your_kspo_api_key_here

# ┌─────────────────────────────────────────────────────────────┐
# │ 선택 설정 - 프로덕션용 (Optional)                            │
# └─────────────────────────────────────────────────────────────┘

# 사이트 URL (SEO, OG 태그용)
NEXT_PUBLIC_SITE_URL=https://racelab.kr

# Google Analytics 4 측정 ID
# 발급: https://analytics.google.com/
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Google AdSense 게시자 ID
# 발급: https://www.google.com/adsense/
NEXT_PUBLIC_ADSENSE_ID=ca-pub-XXXXXXXXXX

# Sentry DSN (에러 모니터링)
# 발급: https://sentry.io/
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# ┌─────────────────────────────────────────────────────────────┐
# │ 개발 설정 (Development)                                     │
# └─────────────────────────────────────────────────────────────┘

# Mock 데이터 사용 (API 키 없이 개발 시)
# true로 설정하면 더미 데이터 반환
NEXT_PUBLIC_USE_MOCK_DATA=false

# 디버그 모드
DEBUG=false
```

### 2.3 환경 변수 우선순위

Next.js는 다음 순서로 환경 변수를 로드합니다:

```
1. process.env (시스템 환경 변수)
2. .env.local (로컬 오버라이드)
3. .env.[environment].local
4. .env.[environment]
5. .env
```

### 2.4 NEXT*PUBLIC* 접두사

| 접두사         | 접근 가능 위치    | 보안      |
| -------------- | ----------------- | --------- |
| `NEXT_PUBLIC_` | 서버 + 클라이언트 | ⚠️ 노출됨 |
| (접두사 없음)  | 서버만            | ✅ 안전   |

```typescript
// ✅ 올바른 사용
// 서버 컴포넌트/API에서
const apiKey = process.env.KRA_API_KEY; // 안전

// 클라이언트 컴포넌트에서
const gaId = process.env.NEXT_PUBLIC_GA_ID; // 의도적 노출
```

---

## 3. API 키 발급 가이드

### 3.1 한국마사회 (KRA) API 키

1. [공공데이터포털](https://www.data.go.kr) 접속
2. 회원가입 및 로그인
3. "한국마사회 경마정보" 검색
4. **활용 신청** 클릭
5. 신청서 작성 (목적: 학습/개발)
6. 승인 후 **마이페이지 > 활용신청현황**에서 API 키 확인

```
⏱️ 승인 소요 시간: 보통 1-3일 (영업일 기준)
📧 문의: 공공데이터포털 고객센터
```

### 3.2 국민체육진흥공단 (KSPO) API 키

1. [공공데이터포털](https://www.data.go.kr) 접속
2. "경륜경정정보" 검색
3. **활용 신청** 클릭
4. 동일한 절차로 신청

### 3.3 Google Analytics 설정

1. [Google Analytics](https://analytics.google.com/) 접속
2. 속성 생성 > 웹 선택
3. 스트림 설정에서 **측정 ID** (G-XXXXXXXXXX) 복사
4. `.env.local`에 추가:
   ```bash
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```

#### 커스텀 이벤트 구현

RaceLab은 다음 GA4 커스텀 이벤트를 추적합니다:

| 이벤트명           | 트리거 시점      | 파라미터                                  |
| ------------------ | ---------------- | ----------------------------------------- |
| `tab_click`        | 탭 전환 클릭 시  | `race_type`: 'horse' \| 'cycle' \| 'boat' |
| `race_detail_view` | 경주 상세 조회시 | `race_id`, `race_type`, `track`, `race_no` |

이벤트 트래킹 유틸리티: `src/lib/utils/ga.ts`

### 3.4 Google Search Console 설정

1. [Google Search Console](https://search.google.com/search-console/) 접속
2. 속성 추가 > URL 접두사 > `https://racelab.kr` 입력
3. HTML 태그 인증 방법 선택
4. 메타 태그의 `content` 값 복사
5. `src/app/layout.tsx`의 `metadata.verification.google` 업데이트:
   ```typescript
   verification: {
     google: 'your-verification-code', // 여기에 입력
   }
   ```
6. 배포 후 Search Console에서 인증 확인

### 3.5 Google AdSense 설정

1. [Google AdSense](https://www.google.com/adsense/) 가입
2. 사이트 추가 및 승인 대기
3. 승인 후 **게시자 ID** 복사
4. `.env.local`에 추가:
   ```bash
   NEXT_PUBLIC_ADSENSE_ID=ca-pub-XXXXXXXXXX
   ```

### 3.6 Sentry 에러 모니터링 설정

1. [Sentry](https://sentry.io/) 계정 생성
2. 새 프로젝트 생성 > Next.js 선택
3. DSN 복사
4. `.env.local`에 추가:
   ```bash
   SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
   NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
   ```

#### 에러 로깅 유틸리티

에러 로깅 유틸리티: `src/lib/utils/errorLogger.ts`

```typescript
import { logError, logApiError, logExternalApiError } from '@/lib/utils/errorLogger';

// 일반 에러 로깅
logError(error, { severity: 'error', context: { userId: '123' } });

// API 에러 로깅
logApiError(error, { endpoint: '/api/races', method: 'GET', statusCode: 500 });

// 외부 API 에러 로깅 (KRA, KSPO)
logExternalApiError(error, 'KRA', 'https://kra.api.go.kr/races', 5000);
```

---

## 4. 로컬 개발 환경 설정

### 4.1 초기 설정

```bash
# 1. 저장소 클론
git clone https://github.com/Prometheus-P/racelab.git
cd racelab

# 2. Node.js 버전 확인
node --version  # 18.17.0 이상

# 3. 의존성 설치
npm install

# 4. 환경 변수 설정
cp .env.local.example .env.local

# 5. .env.local 편집 (API 키 입력)
# 에디터로 열어서 API 키 입력
code .env.local  # VS Code
# 또는
nano .env.local  # 터미널

# 6. Playwright 브라우저 설치 (E2E 테스트용)
npx playwright install
```

### 4.2 개발 서버 실행

```bash
# 개발 서버 시작
npm run dev

# 출력 예시:
# ▲ Next.js 14.2.33
# - Local:        https://racelab.kr
# - Environments: .env.local
```

### 4.3 Mock 데이터 모드

API 키 없이 개발할 때 Mock 데이터를 사용할 수 있습니다:

```bash
# .env.local
NEXT_PUBLIC_USE_MOCK_DATA=true
```

Mock 데이터는 `src/lib/api-helpers/dummy.ts`에 정의되어 있습니다.

---

## 5. 테스트 환경 설정

### 5.1 Jest (단위 테스트)

```bash
# 테스트 실행
npm test

# Watch 모드
npm test -- --watch

# 커버리지 리포트
npm test -- --coverage
```

**Jest 설정 파일:**

- `jest.config.api.js` - API 라우트 테스트
- `jest.config.ui.js` - UI 컴포넌트 테스트

### 5.2 Playwright (E2E 테스트)

```bash
# 브라우저 설치 (최초 1회)
npx playwright install

# E2E 테스트 실행
npm run test:e2e

# UI 모드 (시각적 디버깅)
npm run test:e2e:ui

# 특정 브라우저만
npx playwright test --project=chromium
```

**Playwright 설정 파일:** `playwright.config.ts`

---

## 6. 배포 환경 설정

### 6.1 Vercel 배포

Vercel은 GitHub 연동으로 자동 배포됩니다.

**환경 변수 설정:**

1. [Vercel Dashboard](https://vercel.com/) 접속
2. 프로젝트 선택 > Settings > Environment Variables
3. 환경 변수 추가:

| 변수명                 | 환경                |
| ---------------------- | ------------------- |
| `KRA_API_KEY`          | Production, Preview |
| `KSPO_API_KEY`         | Production, Preview |
| `NEXT_PUBLIC_SITE_URL` | Production          |
| `NEXT_PUBLIC_GA_ID`    | Production          |

### 6.2 배포 환경별 차이

| 항목        | Development | Preview | Production |
| ----------- | ----------- | ------- | ---------- |
| Mock 데이터 | 가능        | 불가    | 불가       |
| 캐시 TTL    | 10초        | 30초    | 5분        |
| Analytics   | 비활성      | 비활성  | 활성       |
| AdSense     | 비활성      | 비활성  | 활성       |

---

## 7. GitHub Secrets 설정 (CI/CD)

CI/CD 워크플로우가 정상 동작하려면 GitHub Repository Secrets를 설정해야 합니다.

### 7.1 필수 Secrets

GitHub Repository → Settings → Secrets and variables → Actions에서 설정:

| Secret Name            | 필수 | 용도                 | 발급 방법                                          |
| ---------------------- | ---- | -------------------- | -------------------------------------------------- |
| `VERCEL_TOKEN`         | ✅   | Vercel 배포 인증     | [Vercel Tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID`        | ✅   | Vercel 조직 ID       | Vercel 프로젝트 설정에서 확인                      |
| `VERCEL_PROJECT_ID`    | ✅   | Vercel 프로젝트 ID   | Vercel 프로젝트 설정에서 확인                      |
| `KSPO_API_KEY`         | ✅   | 프로덕션 KSPO API 키 | 공공데이터포털                                     |
| `KSPO_API_KEY_TEST`    | -    | 테스트용 KSPO API 키 | 공공데이터포털                                     |
| `KSPO_API_KEY_PREVIEW` | -    | 프리뷰용 KSPO API 키 | 공공데이터포털                                     |
| `CODECOV_TOKEN`        | -    | 코드 커버리지 업로드 | [Codecov](https://codecov.io/)                     |

### 7.2 Repository Variables

GitHub Repository → Settings → Secrets and variables → Actions → Variables 탭에서 설정:

| Variable Name          | 용도                  |
| ---------------------- | --------------------- |
| `KSPO_API_URL`         | 프로덕션 KSPO API URL |
| `KSPO_API_URL_PREVIEW` | 프리뷰 KSPO API URL   |

### 7.3 Vercel Token 발급

```bash
# 1. Vercel 대시보드 접속
https://vercel.com/account/tokens

# 2. "Create Token" 클릭
# 3. 토큰 이름 입력 (예: "GitHub Actions")
# 4. Scope: Full Account 선택
# 5. 생성된 토큰 복사

# 6. GitHub Secrets에 추가
# Repository → Settings → Secrets → New repository secret
# Name: VERCEL_TOKEN
# Value: [복사한 토큰]
```

### 7.4 Vercel Project ID 확인

```bash
# 방법 1: Vercel CLI
vercel link
cat .vercel/project.json
# projectId와 orgId 확인

# 방법 2: Vercel 대시보드
# 프로젝트 → Settings → General
# "Project ID" 섹션에서 확인
```

### 7.5 Secrets 설정 체크리스트

- [ ] `VERCEL_TOKEN` 설정
- [ ] `VERCEL_ORG_ID` 설정
- [ ] `VERCEL_PROJECT_ID` 설정
- [ ] `KSPO_API_KEY` 설정
- [ ] (선택) `CODECOV_TOKEN` 설정
- [ ] (선택) `KSPO_API_KEY_TEST` 설정
- [ ] (선택) `KSPO_API_KEY_PREVIEW` 설정

---

## 8. 문제 해결 (Troubleshooting)

### 8.1 일반적인 문제

#### Node.js 버전 오류

```bash
# 문제: Node.js 버전이 낮음
error engine node: incompatible version

# 해결: nvm으로 버전 변경
nvm install 20
nvm use 20
```

#### 환경 변수 인식 안됨

```bash
# 문제: API 키가 undefined
Error: API key is not defined

# 해결:
# 1. .env.local 파일 존재 확인
# 2. 변수명 오타 확인
# 3. 개발 서버 재시작
npm run dev
```

#### Playwright 브라우저 오류

```bash
# 문제: 브라우저 실행 실패
Error: Executable doesn't exist

# 해결: 브라우저 재설치
npx playwright install --force
```

### 8.2 API 관련 문제

#### API 호출 실패 (401)

```bash
# 문제: 인증 오류
Error: 401 Unauthorized

# 해결:
# 1. API 키 유효성 확인
# 2. 공공데이터포털에서 활용 신청 상태 확인
# 3. 일일 호출량 초과 여부 확인
```

#### API 호출 실패 (429)

```bash
# 문제: Rate limit 초과
Error: 429 Too Many Requests

# 해결:
# 1. 호출 빈도 줄이기
# 2. 캐싱 전략 확인
# 3. 다음 날까지 대기 (일일 한도 리셋)
```

---

## 9. 환경별 설정 요약

### 9.1 체크리스트

#### 로컬 개발 환경

- [ ] Node.js 18.17+ 설치
- [ ] `npm install` 완료
- [ ] `.env.local` 생성
- [ ] API 키 설정 (또는 Mock 모드)
- [ ] `npm run dev` 정상 실행

#### 테스트 환경

- [ ] Jest 테스트 통과 (`npm test`)
- [ ] Playwright 브라우저 설치
- [ ] E2E 테스트 통과 (`npm run test:e2e`)

#### 프로덕션 환경

- [ ] Vercel 환경 변수 설정
- [ ] 도메인 연결 (racelab.kr)
- [ ] SSL 인증서 활성화
- [ ] Google Analytics 연동
- [ ] Google AdSense 승인
- [ ] Sentry 에러 모니터링 연동

### 9.2 환경 변수 전체 목록

| 변수명                      | 필수 | 기본값             | 설명                    |
| --------------------------- | ---- | ------------------ | ----------------------- |
| `KRA_API_KEY`               | ✅   | -                  | 한국마사회 API 키       |
| `KSPO_API_KEY`              | ✅   | -                  | 국민체육진흥공단 API 키 |
| `NEXT_PUBLIC_SITE_URL`      | -    | https://racelab.kr | 사이트 URL              |
| `NEXT_PUBLIC_GA_ID`         | -    | -                  | Google Analytics ID     |
| `NEXT_PUBLIC_ADSENSE_ID`    | -    | -                  | Google AdSense ID       |
| `SENTRY_DSN`                | -    | -                  | Sentry DSN (서버용)     |
| `NEXT_PUBLIC_SENTRY_DSN`    | -    | -                  | Sentry DSN (클라이언트) |
| `NEXT_PUBLIC_USE_MOCK_DATA` | -    | false              | Mock 데이터 사용        |
| `DEBUG`                     | -    | false              | 디버그 모드             |

---

## 10. 보안 주의사항

### 10.1 절대 하지 말아야 할 것

```bash
# ❌ 절대 금지
# API 키를 코드에 직접 입력
const apiKey = "실제_API_키_값";  // 금지!

# .env.local을 Git에 커밋
git add .env.local  # 금지!

# NEXT_PUBLIC_ 접두사로 비밀 키 노출
NEXT_PUBLIC_SECRET_KEY=xxx  # 금지!
```

### 10.2 권장 사항

```bash
# ✅ 권장
# 환경 변수로 관리
const apiKey = process.env.KRA_API_KEY;

# .gitignore에 .env* 포함 확인
cat .gitignore | grep ".env"

# 서버 전용 키는 접두사 없이
KRA_API_KEY=xxx  # 서버에서만 접근 가능
```

---

_이 문서는 환경 설정의 모든 측면을 다루며, 지속적으로 업데이트됩니다._
