# 운영 런북 (Runbook)

> KRace 프로젝트의 일상 운영 절차와 장애 시나리오별 대응 방법을 정의합니다.

## 목차

1. [일상 운영](#일상-운영)
2. [장애 시나리오별 대응](#장애-시나리오별-대응)
3. [배포 운영](#배포-운영)
4. [모니터링 운영](#모니터링-운영)
5. [데이터 운영](#데이터-운영)
6. [보안 운영](#보안-운영)

---

## 일상 운영

### 일일 점검 사항

```markdown
## 매일 아침 (09:00)

□ 서비스 상태 확인
  - https://krace.kr 접속 확인
  - /api/health 엔드포인트 확인

□ 모니터링 대시보드 확인
  - 야간 에러 발생 여부
  - 응답 시간 이상 여부

□ 알림 채널 확인
  - Slack #alerts 미처리 알림

□ 외부 API 상태 확인
  - KSPO API 연동 상태
  - KRA API 연동 상태
```

### 헬스 체크 명령어

```bash
# 서비스 상태 확인
curl -s https://krace.kr/api/health | jq

# 예상 응답:
# {
#   "status": "healthy",
#   "timestamp": "2024-01-15T09:00:00.000Z",
#   "version": "1.0.0",
#   "checks": [
#     { "name": "KSPO API", "status": "pass", "responseTime": 245 },
#     { "name": "KRA API", "status": "pass", "responseTime": 180 }
#   ]
# }

# 응답 시간 측정
curl -w "@curl-format.txt" -o /dev/null -s https://krace.kr

# curl-format.txt 내용:
#     time_namelookup:  %{time_namelookup}s\n
#        time_connect:  %{time_connect}s\n
#     time_appconnect:  %{time_appconnect}s\n
#    time_pretransfer:  %{time_pretransfer}s\n
#       time_redirect:  %{time_redirect}s\n
#  time_starttransfer:  %{time_starttransfer}s\n
#                     ----------\n
#          time_total:  %{time_total}s\n
```

### Vercel 상태 확인

```bash
# Vercel CLI 설치 (최초 1회)
npm i -g vercel

# 현재 배포 목록 확인
vercel list

# 프로덕션 배포 상태
vercel list --prod

# 배포 로그 확인
vercel logs [deployment-url]

# 실시간 로그 스트리밍
vercel logs [deployment-url] --follow
```

---

## 장애 시나리오별 대응

### 시나리오 1: 서비스 전면 장애

**증상:**
- 사이트 접속 불가 (5xx 에러)
- 모든 API 요청 실패

**진단:**

```bash
# 1. DNS 확인
nslookup krace.kr
dig krace.kr

# 2. SSL 인증서 확인
openssl s_client -connect krace.kr:443 -servername krace.kr

# 3. Vercel 상태 페이지 확인
# https://www.vercel-status.com/

# 4. 배포 상태 확인
vercel list --prod
```

**대응:**

```markdown
1. Vercel 상태 페이지에서 플랫폼 장애 여부 확인
   - 플랫폼 장애 시: Vercel 복구 대기, 상태 페이지 모니터링

2. 최근 배포 문제인 경우:
   □ 이전 배포로 롤백
     vercel promote [previous-deployment-url] --prod

3. DNS 문제인 경우:
   □ 도메인 레지스트라 확인
   □ DNS 레코드 검증

4. SSL 문제인 경우:
   □ Vercel 대시보드에서 SSL 상태 확인
   □ 인증서 재발급 요청
```

---

### 시나리오 2: KSPO API 장애

**증상:**
- 경주 정보 로딩 실패
- "데이터를 불러올 수 없습니다" 에러

**진단:**

```bash
# KSPO API 직접 호출 테스트
curl -v "https://api.kspo.or.kr/races" \
  -H "X-API-Key: $KSPO_API_KEY"

# 응답 시간 확인
curl -w "Total: %{time_total}s\n" -o /dev/null -s \
  "https://api.kspo.or.kr/races"

# 우리 서비스의 외부 API 상태 확인
curl -s https://krace.kr/api/health | jq '.checks[] | select(.name == "KSPO API")'
```

**대응:**

```markdown
## KSPO API 장애 대응

1. 장애 범위 확인
   □ 전면 장애 vs 부분 장애
   □ 특정 엔드포인트만 문제인지 확인

2. 캐시 상태 확인
   □ ISR 캐시 데이터 유효한지 확인
   □ 캐시된 데이터로 서비스 유지 가능한지 확인

3. 폴백 모드 활성화 (자동)
   - 시스템이 자동으로 캐시된 데이터 제공
   - 사용자에게 "최신 데이터가 아닐 수 있음" 안내 표시

4. KSPO 측 연락
   □ 기술지원 연락처: 02-xxxx-xxxx
   □ 장애 상황 전달 및 복구 예상 시간 확인

5. 장기화 시
   □ 상태 페이지 업데이트
   □ 사용자 공지
```

---

### 시나리오 3: 높은 에러율 발생

**증상:**
- 에러율 5% 이상
- 간헐적 5xx 에러

**진단:**

```bash
# Vercel 로그에서 에러 확인
vercel logs [deployment-url] --since 1h | grep -i error

# Sentry에서 에러 확인
# https://sentry.io/organizations/[org]/issues/

# 최근 배포 확인
vercel list --prod
git log --oneline -10
```

**대응:**

```markdown
## 높은 에러율 대응

1. 에러 패턴 분석
   □ 특정 엔드포인트에 집중되는지 확인
   □ 특정 사용자/지역에 집중되는지 확인
   □ 에러 메시지/스택 트레이스 확인

2. 최근 변경사항 확인
   □ 최근 배포 시점과 에러 발생 시점 비교
   □ 배포 후 에러 증가 시 롤백 고려

3. 원인별 대응

   a) 코드 버그인 경우:
      □ 롤백 실행
        vercel promote [previous-deployment-url] --prod
      □ 핫픽스 준비

   b) 외부 의존성 문제인 경우:
      □ 해당 서비스 상태 확인
      □ 타임아웃/재시도 설정 조정 검토

   c) 리소스 부족인 경우:
      □ Vercel 함수 메모리/타임아웃 설정 확인
      □ 필요시 설정 조정

4. 모니터링 강화
   □ 알림 임계치 일시적 하향 조정
   □ 에러율 추이 지속 관찰
```

---

### 시나리오 4: 느린 응답 시간

**증상:**
- P95 응답 시간 > 2초
- 사용자 불만 접수

**진단:**

```bash
# 응답 시간 측정
for i in {1..10}; do
  curl -w "%{time_total}\n" -o /dev/null -s https://krace.kr/api/races/today
done

# Vercel Analytics에서 성능 확인
# https://vercel.com/[team]/[project]/analytics

# 외부 API 응답 시간 확인
curl -s https://krace.kr/api/health | jq '.checks[].responseTime'
```

**대응:**

```markdown
## 느린 응답 대응

1. 병목 지점 파악
   □ 외부 API 응답 느림?
   □ 서버 사이드 렌더링 느림?
   □ 데이터베이스 쿼리 느림?

2. 외부 API가 원인인 경우
   □ 캐시 TTL 확인 및 조정 검토
   □ 타임아웃 설정 확인 (너무 길면 줄이기)
   □ 백그라운드 리프레시 적용 검토

3. 렌더링이 원인인 경우
   □ 무거운 컴포넌트 확인
   □ 불필요한 데이터 페칭 확인
   □ ISR/SSG 적용 검토

4. 임시 조치
   □ 캐시 TTL 늘리기 (데이터 신선도 vs 속도 트레이드오프)
   □ 일부 기능 비활성화 (비필수 기능)

5. 영구 조치
   □ 성능 개선 작업 티켓 생성
   □ 다음 스프린트에 포함
```

---

### 시나리오 5: 배포 후 장애

**증상:**
- 배포 직후 에러 발생
- 새 기능 동작 안 함

**진단:**

```bash
# 배포 시점 확인
vercel list --prod

# 배포 전후 비교
# 이전 배포 URL로 직접 접근하여 비교 테스트
curl https://[previous-deployment].vercel.app/api/health
curl https://[current-deployment].vercel.app/api/health

# 변경 사항 확인
git diff [previous-commit] [current-commit] --stat
```

**대응:**

```markdown
## 배포 후 장애 대응

1. 즉시 롤백 (심각한 경우)
   vercel promote [previous-deployment-url] --prod

2. 경미한 경우 - 조사 후 결정
   □ 영향 범위 파악
   □ 빠른 수정 가능 여부 확인

3. 원인 분석
   □ 배포 로그 확인
   □ 변경된 코드 리뷰
   □ 환경 변수 변경 여부 확인

4. 핫픽스 배포 (롤백하지 않는 경우)
   □ 핫픽스 브랜치 생성
   □ 수정 및 테스트
   □ 긴급 배포

5. 사후 조치
   □ 테스트 케이스 보강
   □ 배포 프로세스 개선점 식별
```

---

## 배포 운영

### 정상 배포 절차

```bash
# 1. 배포 전 확인
pnpm lint && pnpm typecheck && pnpm test

# 2. 프리뷰 배포 (PR 머지 전)
# - PR에서 자동 생성된 프리뷰 URL 확인
# - 기능 검증

# 3. main 브랜치 머지
git checkout main
git pull origin main
git merge feature/my-feature

# 4. 프로덕션 배포 (자동)
# - main 머지 시 GitHub Actions에서 자동 배포

# 5. 배포 확인
vercel list --prod
curl -s https://krace.kr/api/health
```

### 롤백 절차

```bash
# 1. 이전 배포 목록 확인
vercel list --prod

# 2. 롤백할 배포 선택 (안정적이었던 버전)
# 예: https://krace-abc123.vercel.app

# 3. 롤백 실행
vercel promote https://krace-abc123.vercel.app --prod

# 4. 롤백 확인
curl -s https://krace.kr/api/health

# 5. 팀에 공유
# Slack #deployments 채널에 롤백 사실 공유
```

### 환경 변수 관리

```bash
# 환경 변수 목록 확인
vercel env ls

# 환경 변수 추가
vercel env add VARIABLE_NAME

# 환경 변수 수정
vercel env rm VARIABLE_NAME
vercel env add VARIABLE_NAME

# 주의: 환경 변수 변경 후 재배포 필요
vercel --prod
```

---

## 모니터링 운영

### 알림 관리

```markdown
## 알림 대응 가이드

### Slack 알림 수신 시
1. 알림 내용 확인
2. 심각도 판단 (P1-P4)
3. 해당 런북 섹션 참조하여 대응
4. 필요시 에스컬레이션

### 일반적인 알림 유형

| 알림 | 대응 |
|------|------|
| High Error Rate | → 시나리오 3 참조 |
| High Latency | → 시나리오 4 참조 |
| External API Down | → 시나리오 2 참조 |
| Deployment Failed | → 배포 로그 확인, 재시도 |
```

### 로그 분석

```bash
# Vercel 로그 검색
vercel logs [deployment-url] --since 1h

# 특정 패턴 검색
vercel logs [deployment-url] --since 1h | grep "ERROR"

# JSON 로그 파싱
vercel logs [deployment-url] --output json | jq '.message'

# Sentry 이슈 확인
# https://sentry.io/organizations/[org]/issues/?query=is:unresolved
```

### 메트릭 확인

```markdown
## 주요 메트릭 확인 위치

1. Vercel Analytics
   - URL: https://vercel.com/[team]/[project]/analytics
   - 내용: Core Web Vitals, 트래픽, 지역별 분포

2. Vercel Logs
   - URL: https://vercel.com/[team]/[project]/logs
   - 내용: 실시간 로그, 에러 로그

3. Sentry
   - URL: https://sentry.io/organizations/[org]/
   - 내용: 에러 추적, 스택 트레이스

4. Custom Dashboard (설정된 경우)
   - Datadog/Grafana 등
```

---

## 데이터 운영

### 캐시 관리

```bash
# ISR 캐시 무효화 (특정 페이지)
# Next.js의 on-demand revalidation 사용
curl -X POST "https://krace.kr/api/revalidate?path=/races&secret=$REVALIDATE_SECRET"

# 전체 캐시 무효화 (재배포)
vercel --prod --force

# CDN 캐시 확인
curl -I https://krace.kr | grep -i cache
```

### 데이터 정합성 확인

```bash
# API 응답 데이터 검증
curl -s https://krace.kr/api/races/today | jq '.data | length'

# 외부 API와 비교
curl -s "https://api.kspo.or.kr/races" -H "X-API-Key: $KSPO_API_KEY" | jq '. | length'
```

---

## 보안 운영

### 보안 점검

```markdown
## 정기 보안 점검 (월간)

□ 의존성 취약점 스캔
  pnpm audit

□ 환경 변수 검토
  - 불필요한 변수 제거
  - 권한 최소화 원칙 확인

□ 접근 권한 검토
  - Vercel 팀 멤버 확인
  - GitHub 저장소 접근 권한 확인

□ API 키 로테이션 (분기별)
  - KSPO API 키
  - 기타 외부 서비스 키
```

### 보안 이슈 대응

```markdown
## 보안 취약점 발견 시

1. 심각도 평가
   - Critical: 즉시 대응 (데이터 유출 위험)
   - High: 24시간 이내 대응
   - Medium/Low: 다음 스프린트에 수정

2. 영향 범위 파악
   - 영향받는 사용자
   - 노출된 데이터

3. 조치
   - 취약점 수정
   - 필요시 키/토큰 로테이션
   - 영향받은 사용자 알림 (필요시)

4. 보고
   - 보안 이슈 문서화
   - 재발 방지 조치 수립
```

### API 키 로테이션

```bash
# 1. 새 API 키 생성 (외부 서비스에서)

# 2. Vercel에 새 키 추가
vercel env add KSPO_API_KEY_NEW

# 3. 코드에서 새 키 사용하도록 수정 및 배포

# 4. 정상 동작 확인 후 이전 키 제거
vercel env rm KSPO_API_KEY_OLD

# 5. 외부 서비스에서 이전 키 비활성화
```

---

## 연락처 및 리소스

### 내부 연락처

| 역할 | Slack | 전화 |
|------|-------|------|
| Primary Oncall | @oncall-primary | - |
| Tech Lead | @techlead | 010-xxxx-xxxx |
| Engineering Manager | @em | 010-xxxx-xxxx |

### 외부 연락처

| 서비스 | 연락처 | 비고 |
|--------|--------|------|
| Vercel Support | support@vercel.com | Enterprise |
| KSPO 기술지원 | 02-xxxx-xxxx | 평일 09-18시 |

### 유용한 링크

```markdown
- Vercel Dashboard: https://vercel.com/[team]/[project]
- Sentry: https://sentry.io/organizations/[org]/
- GitHub Repo: https://github.com/[org]/racelab
- 상태 페이지: https://status.krace.kr (설정된 경우)
```

---

## 체크리스트

### 온콜 인수인계 체크리스트

```markdown
□ 현재 진행 중인 이슈 공유
□ 예정된 배포 일정 확인
□ 특이사항 전달
□ 연락처 확인 (에스컬레이션 경로)
□ 접근 권한 확인 (VPN, 대시보드 등)
```

### 장애 복구 완료 체크리스트

```markdown
□ 모든 서비스 정상 동작 확인
□ 에러율 정상 범위 확인
□ 응답 시간 정상 범위 확인
□ 모니터링 알림 해소 확인
□ 임시 조치 문서화
□ 팀 공유 완료
□ Postmortem 일정 수립 (SEV1/2)
```
