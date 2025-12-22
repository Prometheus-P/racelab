# Contributing Guide

KRace 프로젝트에 기여해 주셔서 감사합니다.

## 시작하기 전에

이 프로젝트는 **Proprietary License**입니다. 기여하시기 전에 저작권 및 라이센스 조항을 확인해 주세요.

## 개발 환경 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 테스트 실행
npm run test
```

## 개발 규칙

### TDD (Test-Driven Development)

이 프로젝트는 **TDD를 엄격히 준수**합니다:

1. **Red**: 실패하는 테스트 먼저 작성
2. **Green**: 테스트를 통과하는 최소한의 코드 작성
3. **Refactor**: 코드 개선 (테스트는 계속 통과해야 함)

### 커밋 규칙

커밋 메시지는 [Conventional Commits](https://www.conventionalcommits.org/) 형식을 따릅니다:

```
<type>(<scope>): <description>

[optional body]
```

**Type**:
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `refactor`: 리팩토링 (기능 변경 없음)
- `docs`: 문서 변경
- `test`: 테스트 추가/수정
- `chore`: 빌드/설정 변경

**중요**: 구조 변경과 동작 변경은 **반드시 별도 커밋**으로 분리하세요.

```bash
# Good
git commit -m "chore(structure): rename utils to helpers"
git commit -m "feat(behavior): add date formatting function"

# Bad - 혼합된 커밋
git commit -m "add date function and rename utils"
```

### 코드 스타일

- **함수 크기**: 10-20 줄 이하
- **단일 책임 원칙 (SRP)** 준수
- **TypeScript** 타입 명시
- **ESLint/Prettier** 설정 준수

```bash
# 린트 검사
npm run lint

# 포맷팅
npm run format
```

## Pull Request 프로세스

1. **Feature 브랜치** 생성
   ```bash
   git checkout -b NNN-feature-name
   ```

2. **개발 및 테스트**
   ```bash
   npm run test
   npm run lint
   npm run build
   ```

3. **PR 생성**
   - PR 템플릿을 따라 작성
   - 관련 이슈 연결
   - 변경 사항 설명

4. **코드 리뷰**
   - 최소 1명의 리뷰어 승인 필요
   - CI 테스트 통과 필수

## 브랜치 전략

| 브랜치 | 용도 |
|--------|------|
| `main` | 프로덕션 배포 |
| `NNN-feature-name` | 기능 개발 |

## 질문 및 지원

- **Issues**: 버그 리포트, 기능 제안
- **Email**: parkdavid31@gmail.com
