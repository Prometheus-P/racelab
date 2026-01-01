# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.4.x   | :white_check_mark: |
| < 1.4   | :x:                |

## Reporting a Vulnerability

보안 취약점을 발견하셨다면, **공개 이슈로 등록하지 마시고** 아래 방법으로 비공개 제보해 주세요.

### 제보 방법

1. **GitHub Security Advisories** (권장)
   - [Security 탭](../../security/advisories/new)에서 비공개 보안 권고 생성

2. **이메일**
   - parkdavid31@gmail.com

### 제보 시 포함해 주세요

- 취약점 유형 및 영향 범위
- 재현 단계 (가능한 상세히)
- 영향받는 버전
- 가능하다면 수정 제안

### 대응 절차

1. **확인**: 제보 접수 후 48시간 내 확인 응답
2. **분석**: 취약점 검증 및 심각도 평가 (최대 7일)
3. **수정**: 패치 개발 및 테스트
4. **공개**: 수정 완료 후 보안 권고 공개

## Known Vulnerabilities

### Development Dependencies (Non-Production)

| Package | Severity | Impact | Status |
|---------|----------|--------|--------|
| esbuild (via drizzle-kit) | Moderate | Dev server only | Next.js 15 업그레이드 시 해결 예정 |
| glob (via eslint-config-next) | High | CLI only | ESLint 9 업그레이드 시 해결 예정 |

> **Note**: 위 취약점들은 개발 환경/CLI 도구에만 영향을 미치며, 프로덕션 배포에는 영향이 없습니다.

## Security Best Practices

### 환경 변수
- API 키는 `.env.local`에 저장 (절대 커밋하지 않음)
- 민감한 정보는 Vercel 환경 변수로 관리

### 의존성 관리
- Dependabot 자동 업데이트 활성화
- 주기적 `npm audit` 실행
- 프로덕션 의존성 최소화

### 코드 보안
- API 입력 검증 (Zod 스키마)
- SQL Injection 방지 (Drizzle ORM 사용)
- XSS 방지 (React 기본 이스케이핑)

### 인프라
- HTTPS 강제 (Vercel 자동 적용)
- Rate limiting 적용
