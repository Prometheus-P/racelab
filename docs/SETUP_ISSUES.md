# GitHub Issues - 수동 설정 필요 항목

아래 내용을 GitHub Issues에 복사하여 생성하세요.

---

## Issue #1: Vercel 배포 설정

**Title:** `[Setup] Vercel 배포를 위한 토큰 및 프로젝트 설정`

**Labels:** `setup`, `deployment`, `documentation`

**Body:**

```markdown
## 개요

Vercel 배포 워크플로우가 정상 작동하려면 아래 설정이 필요합니다.

## 필요한 작업

### 1. Vercel 프로젝트 연결

```bash
# 로컬에서 실행
npm i -g vercel
vercel login
vercel link
```

### 2. Vercel 토큰 생성

1. [Vercel Dashboard](https://vercel.com/account/tokens) 접속
2. "Create Token" 클릭
3. 이름: `github-actions`
4. Scope: Full Account
5. 생성된 토큰 복사

### 3. GitHub Secrets 설정

**Repository → Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | 설명 | 확인 방법 |
|-------------|------|----------|
| `VERCEL_TOKEN` | Vercel API 토큰 | 위 2단계에서 생성 |
| `VERCEL_ORG_ID` | Vercel 조직 ID | `.vercel/project.json` → `orgId` |
| `VERCEL_PROJECT_ID` | Vercel 프로젝트 ID | `.vercel/project.json` → `projectId` |

### 4. 확인 방법

```bash
# .vercel/project.json 파일 내용 확인
cat .vercel/project.json
```

예시 출력:
```json
{
  "projectId": "prj_xxxxxxxxxxxx",
  "orgId": "team_xxxxxxxxxxxx"
}
```

## 체크리스트

- [ ] Vercel 계정 생성
- [ ] Vercel CLI로 프로젝트 연결 (`vercel link`)
- [ ] Vercel 토큰 생성
- [ ] `VERCEL_TOKEN` secret 설정
- [ ] `VERCEL_ORG_ID` secret 설정
- [ ] `VERCEL_PROJECT_ID` secret 설정
- [ ] Preview 배포 테스트
- [ ] Production 배포 테스트

## 관련 파일

- `.github/workflows/deploy-preview.yml`
- `.github/workflows/deploy-prod.yml`
```

---

## Issue #2: API 키 설정

**Title:** `[Setup] 공공데이터 API 키 설정 (KRA, KSPO)`

**Labels:** `setup`, `api`, `documentation`

**Body:**

```markdown
## 개요

경마(KRA), 경륜/경정(KSPO) 데이터를 가져오기 위해 공공데이터포털 API 키가 필요합니다.

## API 키 발급

### 1. KRA (한국마사회) API

1. [공공데이터포털](https://www.data.go.kr) 접속
2. "한국마사회_경마정보" 검색
3. 활용 신청
4. 승인 후 API 키 확인

**API 문서:** `API214_17` - 경마 경주 일정 조회

### 2. KSPO (국민체육진흥공단) API

1. [공공데이터포털](https://www.data.go.kr) 접속
2. "경륜경정" 검색
3. 활용 신청
4. 승인 후 API 키 확인

**API 문서:**
- `API214_01` - 경륜 경주 일정 조회
- `API214_02` - 경정 경주 일정 조회

## GitHub Secrets 설정

**Repository → Settings → Secrets and variables → Actions**

### Secrets (민감 정보)

| Secret Name | 설명 | 환경 |
|-------------|------|------|
| `KRA_API_KEY` | 한국마사회 API 키 | Production |
| `KSPO_API_KEY` | KSPO API 키 | Production |
| `KSPO_API_KEY_PREVIEW` | KSPO API 키 (Preview) | Preview |

### Variables (비민감 정보)

**Repository → Settings → Secrets and variables → Actions → Variables**

| Variable Name | 값 | 환경 |
|---------------|---|------|
| `KSPO_API_URL` | `http://apis.data.go.kr/B551014` | Production |
| `KSPO_API_URL_PREVIEW` | `http://apis.data.go.kr/B551014` | Preview |

## 로컬 개발 환경 설정

`.env.local` 파일 생성:

```env
KRA_API_KEY=your_kra_api_key_here
KSPO_API_KEY=your_kspo_api_key_here
```

> ⚠️ `.env.local`은 `.gitignore`에 포함되어 있어 커밋되지 않습니다.

## 체크리스트

- [ ] 공공데이터포털 계정 생성
- [ ] KRA API 활용 신청 및 승인
- [ ] KSPO API 활용 신청 및 승인
- [ ] `KRA_API_KEY` secret 설정
- [ ] `KSPO_API_KEY` secret 설정
- [ ] `KSPO_API_KEY_PREVIEW` secret 설정
- [ ] `KSPO_API_URL` variable 설정
- [ ] `KSPO_API_URL_PREVIEW` variable 설정
- [ ] 로컬 `.env.local` 파일 생성
- [ ] API 연동 테스트

## 참고

API 키가 없으면 더미 데이터가 반환됩니다 (개발 모드).
```

---

## Issue #3: Google Analytics 및 Search Console 설정

**Title:** `[Setup] Google Analytics 및 Search Console 설정`

**Labels:** `setup`, `analytics`, `seo`

**Body:**

```markdown
## 개요

웹사이트 분석 및 검색 엔진 최적화를 위한 Google 서비스 설정이 필요합니다.

## 1. Google Analytics 설정

### GA4 속성 생성

1. [Google Analytics](https://analytics.google.com) 접속
2. 관리 → 속성 만들기
3. 웹 스트림 설정
4. 측정 ID 복사 (형식: `G-XXXXXXXXXX`)

### 환경 변수 설정

**Vercel Dashboard → Project → Settings → Environment Variables**

| Name | Value | Environment |
|------|-------|-------------|
| `NEXT_PUBLIC_GA_ID` | `G-XXXXXXXXXX` | Production |

또는 GitHub Secrets에 설정:

```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## 2. Google Search Console 설정

### 사이트 소유권 확인

1. [Google Search Console](https://search.google.com/search-console) 접속
2. 속성 추가 → URL 접두어 선택
3. `https://krace.co.kr` (또는 실제 도메인) 입력
4. HTML 태그 방식으로 확인
5. 메타 태그의 `content` 값 복사

### 코드 수정 필요

`src/app/layout.tsx` 파일의 verification 값 수정:

```typescript
verification: {
  google: 'your-actual-verification-code', // 실제 코드로 변경
},
```

## 3. Sitemap 제출

사이트 인증 후:

1. Search Console → Sitemaps
2. `https://krace.co.kr/sitemap.xml` 제출

## 체크리스트

- [ ] Google Analytics 계정/속성 생성
- [ ] GA4 측정 ID 확인
- [ ] `NEXT_PUBLIC_GA_ID` 환경 변수 설정
- [ ] Google Search Console 속성 추가
- [ ] 소유권 확인 코드 발급
- [ ] `layout.tsx`의 verification 코드 업데이트
- [ ] Sitemap 제출
- [ ] Analytics 데이터 수집 확인

## 관련 파일

- `src/app/layout.tsx` - 메타데이터 및 GA 스크립트
- `src/app/sitemap.ts` - 사이트맵 생성
- `src/app/robots.ts` - robots.txt 생성
```

---

## Issue #4: 도메인 설정

**Title:** `[Setup] 커스텀 도메인 설정`

**Labels:** `setup`, `deployment`, `documentation`

**Body:**

```markdown
## 개요

프로덕션 환경을 위한 커스텀 도메인 설정이 필요합니다.

## 현재 설정된 도메인

코드에서 참조하는 도메인:
- `https://krace.co.kr` (layout.tsx OpenGraph)
- `https://racelab.co.kr` (robots.ts, sitemap.ts)

> ⚠️ 도메인이 일치하지 않습니다. 통일이 필요합니다.

## 설정 단계

### 1. 도메인 구매

- 가비아, 후이즈 등에서 도메인 구매
- 또는 Vercel에서 직접 구매 가능

### 2. Vercel 도메인 연결

1. Vercel Dashboard → Project → Settings → Domains
2. 도메인 추가 (예: `krace.co.kr`)
3. DNS 레코드 설정:
   - A Record: `76.76.21.21`
   - 또는 CNAME: `cname.vercel-dns.com`

### 3. 코드 수정

도메인 통일을 위해 아래 파일 수정 필요:

**`src/app/robots.ts`**
```typescript
sitemap: 'https://krace.co.kr/sitemap.xml',
```

**`src/app/sitemap.ts`**
```typescript
const baseUrl = 'https://krace.co.kr';
```

### 4. 환경별 도메인 설정

| 환경 | 도메인 |
|------|--------|
| Production | `krace.co.kr` |
| Preview | `*.vercel.app` (자동) |
| Development | `localhost:3000` |

## 체크리스트

- [ ] 도메인 결정 및 구매
- [ ] Vercel에 도메인 연결
- [ ] DNS 설정 완료
- [ ] SSL 인증서 자동 발급 확인
- [ ] 코드의 도메인 참조 통일
- [ ] HTTPS 리다이렉트 확인
- [ ] www → non-www 리다이렉트 설정 (선택)

## 관련 파일

- `src/app/layout.tsx` - OpenGraph URL
- `src/app/robots.ts` - Sitemap URL
- `src/app/sitemap.ts` - 기본 URL
- `.github/workflows/deploy-prod.yml` - 배포 URL
```

---

## 요약: 전체 설정 체크리스트

| 카테고리 | 항목 | 우선순위 |
|----------|------|----------|
| Vercel | `VERCEL_TOKEN` | 🔴 High |
| Vercel | `VERCEL_ORG_ID` | 🔴 High |
| Vercel | `VERCEL_PROJECT_ID` | 🔴 High |
| API | `KRA_API_KEY` | 🟡 Medium |
| API | `KSPO_API_KEY` | 🟡 Medium |
| API | `KSPO_API_KEY_PREVIEW` | 🟡 Medium |
| Analytics | `NEXT_PUBLIC_GA_ID` | 🟢 Low |
| SEO | Google verification code | 🟢 Low |
| Domain | 커스텀 도메인 | 🟢 Low |
