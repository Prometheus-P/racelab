# KRace 배포 체크리스트

> **버전**: v1.2.4
> **최종 업데이트**: 2025-12-01
> **배포 대상**: Vercel

---

## 1. 사전 점검

### 1.1 코드 품질
- [x] 모든 Jest 테스트 통과 (222 tests)
- [x] 빌드 성공 (`npm run build`)
- [x] ESLint 오류 없음 (경고만 존재)
- [ ] E2E 테스트 통과 (일부 테스트 수정 필요)

### 1.2 버전 관리
- [x] main 브랜치 최신 상태
- [x] 버전 태그 생성 (v1.2.4)
- [x] plan.md 업데이트 완료

---

## 2. Vercel 환경 설정

### 2.1 필수 환경 변수

| 변수명 | 상태 | 설명 |
|--------|------|------|
| `KRA_API_KEY` | [ ] | 한국마사회 API 키 |
| `KSPO_API_KEY` | [ ] | 국민체육진흥공단 API 키 |
| `NEXT_PUBLIC_SITE_URL` | [ ] | `https://racelab.co.kr` |

### 2.2 선택 환경 변수

| 변수명 | 상태 | 설명 |
|--------|------|------|
| `NEXT_PUBLIC_GA_ID` | [ ] | Google Analytics 4 ID |
| `NEXT_PUBLIC_ADSENSE_ID` | [ ] | Google AdSense ID |

### 2.3 Vercel 설정
- [ ] 프로젝트 연결 확인
- [ ] 프로덕션 브랜치: `main`
- [ ] 빌드 명령어: `npm run build`
- [ ] 출력 디렉토리: `.next`

---

## 3. 도메인 설정

### 3.1 커스텀 도메인
- [ ] `racelab.co.kr` 도메인 연결
- [ ] SSL 인증서 활성화
- [ ] HTTPS 리다이렉트 설정

### 3.2 DNS 설정
```
A     @       76.76.21.21
CNAME www     cname.vercel-dns.com
```

---

## 4. SEO 확인

### 4.1 메타 태그
- [x] Title 태그 설정
- [x] Description 메타 태그
- [x] Open Graph 태그
- [x] Twitter Card 태그

### 4.2 검색 엔진
- [x] robots.txt 생성
- [x] sitemap.xml 생성
- [ ] Google Search Console 등록
- [ ] Naver Search Advisor 등록

---

## 5. 성능 최적화

### 5.1 캐싱 전략 (ISR)
- [x] 경주 일정 API: 60초 revalidation
- [x] 배당률 API: 30초 revalidation
- [x] 출주표/결과 API: 60초 revalidation

### 5.2 빌드 결과
```
Route                              Size     First Load JS
┌ ƒ /                              177 B    122 kB
├ ƒ /race/[id]                     177 B    122 kB
├ ○ /api/races/horse               0 B      0 B
├ ○ /api/races/cycle               0 B      0 B
├ ○ /api/races/boat                0 B      0 B
└ + First Load JS shared           106 kB
```

---

## 6. 모니터링 설정

### 6.1 Analytics
- [ ] Google Analytics 연동 확인
- [ ] Vercel Analytics 활성화

### 6.2 에러 추적
- [ ] Vercel 로그 모니터링
- [ ] 에러 알림 설정

---

## 7. 배포 후 확인

### 7.1 기능 테스트
- [ ] 홈페이지 로딩 확인
- [ ] 경주 목록 표시 확인
- [ ] 경주 상세 페이지 확인
- [ ] 탭 전환 동작 확인
- [ ] 모바일 반응형 확인

### 7.2 API 테스트
- [ ] `/api/races/horse` 응답 확인
- [ ] `/api/races/cycle` 응답 확인
- [ ] `/api/races/boat` 응답 확인

### 7.3 SEO 테스트
- [ ] `robots.txt` 접근 확인
- [ ] `sitemap.xml` 접근 확인
- [ ] Open Graph 미리보기 확인

---

## 8. 롤백 계획

### 8.1 롤백 방법
1. Vercel 대시보드 > Deployments
2. 이전 성공 배포 선택
3. "Promote to Production" 클릭

### 8.2 롤백 조건
- 500 에러 발생률 5% 초과
- 주요 기능 장애
- 데이터 무결성 문제

---

## 9. 사용자 설정 작업 (GitHub Issues 참조)

배포 후 사용자가 완료해야 할 작업:

| Issue | 작업 | 상태 |
|-------|------|------|
| #5 | Vercel 배포 설정 | [ ] |
| #6 | 공공데이터 API 키 설정 | [ ] |
| #7 | Google Analytics/Search Console | [ ] |
| #8 | 커스텀 도메인 설정 | [ ] |

---

## 10. 연락처

- **기술 문의**: GitHub Issues
- **긴급 연락**: Repository Owner

---

*마지막 점검일: 2025-12-01*
