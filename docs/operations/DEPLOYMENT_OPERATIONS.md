# KRace 배포 및 운영 가이드

## 1. 배포 환경

### 1.1 환경 구성

| 환경 | URL | 용도 |
|------|-----|------|
| Development | `localhost:3000` | 로컬 개발 |
| Preview | `*.vercel.app` | PR 미리보기 |
| Production | `racelab.kr` | 실서비스 |

### 1.2 인프라 구성

```
┌─────────────────────────────────────────────────┐
│                    Cloudflare                    │
│              (DNS / DDoS Protection)             │
└───────────────────────┬─────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────┐
│                  Vercel Edge                     │
│         (CDN / Edge Functions / SSL)             │
└───────────────────────┬─────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────┐
│              Vercel Serverless                   │
│            (Next.js Application)                 │
└───────────────────────┬─────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────┐
│              External APIs                       │
│      (공공데이터포털: KRA, KSPO)                  │
└─────────────────────────────────────────────────┘
```

---

## 2. Vercel 배포

### 2.1 초기 설정

```bash
# Vercel CLI 설치
npm install -g vercel

# 프로젝트 연결
vercel link

# 환경변수 설정
vercel env add KRA_API_KEY
vercel env add KSPO_API_KEY
vercel env add NEXT_PUBLIC_SITE_URL
```

### 2.2 배포 명령어

```bash
# Preview 배포 (PR/브랜치)
vercel

# Production 배포
vercel --prod

# 롤백 (이전 배포로)
vercel rollback
```

### 2.3 자동 배포 (CI/CD)

GitHub 연동 시 자동 배포:

| 트리거 | 환경 |
|--------|------|
| PR 생성/업데이트 | Preview |
| `main` 브랜치 push | Production |

---

## 3. 환경변수 관리

### 3.1 환경별 변수

| 변수 | Development | Preview | Production |
|------|-------------|---------|------------|
| `KRA_API_KEY` | 테스트 키 | 테스트 키 | 프로덕션 키 |
| `KSPO_API_KEY` | 테스트 키 | 테스트 키 | 프로덕션 키 |
| `NEXT_PUBLIC_SITE_URL` | https://localhost:3000 | preview URL (https) | https://racelab.kr |
| `NEXT_PUBLIC_GA_ID` | - | - | G-XXXXXXXX |
| `NEXT_PUBLIC_ADSENSE_ID` | - | - | ca-pub-XXX |

### 3.2 Vercel에서 설정

```bash
# 환경변수 추가
vercel env add [변수명]

# 환경변수 조회
vercel env ls

# 환경변수 삭제
vercel env rm [변수명]
```

또는 Vercel Dashboard → Settings → Environment Variables

---

## 4. 도메인 설정

### 4.1 Vercel 도메인 연결

1. Vercel Dashboard → Project → Settings → Domains
2. `racelab.kr` 입력
3. DNS 설정 안내 확인

### 4.2 DNS 레코드

```
# A Record (Root domain)
Type: A
Name: @
Value: 76.76.21.21

# CNAME (www subdomain)
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 4.3 SSL 인증서

Vercel 자동 발급 (Let's Encrypt)
- 설정 불필요
- 자동 갱신

---

## 5. 모니터링

### 5.1 Vercel Analytics

무료 제공:
- 실시간 방문자
- Web Vitals (LCP, FID, CLS)
- 지역별 트래픽

설정:
```tsx
// layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function Layout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### 5.2 Google Analytics 4

```tsx
// layout.tsx
import Script from 'next/script'

export default function Layout({ children }) {
  return (
    <html>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  )
}
```

### 5.3 핵심 모니터링 지표

| 지표 | 목표 | 알람 기준 |
|------|------|----------|
| Uptime | 99.9% | < 99% |
| LCP | < 2.5s | > 4s |
| Error Rate | < 1% | > 5% |
| API Response | < 500ms | > 2s |

---

## 6. 장애 대응

### 6.1 장애 등급

| 등급 | 설명 | 대응 시간 |
|------|------|----------|
| P1 | 전체 서비스 불가 | 즉시 |
| P2 | 핵심 기능 장애 | 1시간 내 |
| P3 | 일부 기능 장애 | 24시간 내 |
| P4 | 경미한 이슈 | 다음 배포 |

### 6.2 롤백 절차

```bash
# 1. 현재 배포 확인
vercel ls

# 2. 이전 배포로 롤백
vercel rollback

# 또는 특정 배포로 롤백
vercel rollback [deployment-url]

# 3. 확인
curl -I https://racelab.kr
```

### 6.3 장애 체크리스트

**서비스 불가 시:**
1. [ ] Vercel Status 확인 (status.vercel.com)
2. [ ] DNS 확인 (`dig racelab.kr`)
3. [ ] 최근 배포 확인 → 롤백 검토
4. [ ] 에러 로그 확인 (Vercel Dashboard → Logs)

**API 오류 시:**
1. [ ] 공공데이터 포털 상태 확인
2. [ ] API 키 만료 여부 확인
3. [ ] Rate Limit 초과 여부 확인
4. [ ] 캐시 데이터 활용 가능 여부 확인

---

## 7. 성능 최적화

### 7.1 캐싱 전략

```typescript
// API 캐싱
const response = await fetch(url, {
  next: { 
    revalidate: 60 // 60초 캐시
  }
})

// 정적 페이지
export const revalidate = 300 // 5분
```

### 7.2 이미지 최적화

```tsx
import Image from 'next/image'

<Image
  src="/logo.png"
  alt="KRace"
  width={200}
  height={50}
  priority // LCP 이미지
/>
```

### 7.3 번들 최적화

```bash
# 번들 분석
npm run build
npx @next/bundle-analyzer
```

---

## 8. 백업 및 복구

### 8.1 코드 백업

- GitHub 저장소 (기본)
- 주요 배포 태그 유지

### 8.2 환경변수 백업

```bash
# 환경변수 내보내기
vercel env pull .env.backup

# 환경변수 복원
# Vercel Dashboard에서 수동 입력
```

### 8.3 데이터 백업

현재 버전: 데이터베이스 미사용
- 모든 데이터는 외부 API에서 실시간 조회
- 백업 불필요

---

## 9. 비용 관리

### 9.1 Vercel 요금제

| 플랜 | 월 비용 | 적합 트래픽 |
|------|---------|------------|
| Hobby | $0 | ~10K MAU |
| Pro | $20 | ~100K MAU |
| Enterprise | 문의 | 100K+ MAU |

### 9.2 예상 비용 (Phase별)

| Phase | MAU | 예상 비용 |
|-------|-----|----------|
| Phase 1 | 5K | $0 (Hobby) |
| Phase 2 | 20K | $20 (Pro) |
| Phase 3 | 50K+ | $20-50 |

### 9.3 비용 최적화

1. **캐싱 최대화**: API 호출 최소화
2. **이미지 최적화**: next/image 사용
3. **Edge Functions**: 지역별 응답 최적화

---

## 10. 보안

### 10.1 체크리스트

- [ ] 환경변수 노출 방지 (`NEXT_PUBLIC_` prefix 주의)
- [ ] API 키 서버사이드 호출만
- [ ] HTTPS 강제 (Vercel 기본)
- [ ] CSP 헤더 설정

### 10.2 보안 헤더

```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}
```

---

## 11. 연락처

| 역할 | 담당 | 연락처 |
|------|------|--------|
| 기술 리드 | TBD | |
| 운영 담당 | TBD | |
| 긴급 연락 | TBD | |

---
**문서 버전**: 1.0
**최종 수정일**: 2024-XX-XX
