# CLAUDE.md - AI Assistant Guide for krace

이 문서는 krace 프로젝트에서 작업하는 AI 어시스턴트를 위한 포괄적인 가이드를 제공합니다.

## Project Overview

**Repository:** Prometheus-P/krace
**Status:** Active Development
**Purpose:** 한국 경마/경륜/경정 정보 종합 웹 애플리케이션

### Project Context

krace는 한국의 3가지 경주(경마, 경륜, 경정) 정보를 실시간으로 제공하는 웹 애플리케이션입니다. 공공데이터포털의 한국마사회 및 국민체육진흥공단 API를 활용하여 경주 일정, 출마표, 배당률, 결과 등을 제공합니다.

### Key Features

- 🐎 **경마 (Horse Racing)**: 서울, 부산경남, 제주 경마장
- 🚴 **경륜 (Cycle Racing)**: 광명, 창원, 부산 경륜장
- 🚤 **경정 (Boat Racing)**: 미사리 경정장
- 📊 실시간 통계 및 다음 경주 정보
- 🎯 타입별 필터링 및 상세 정보 제공
- 📱 반응형 디자인 (모바일/태블릿/데스크톱)

## Technology Stack

### Core Technologies

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.9+
- **UI Library**: React 18
- **Styling**: Tailwind CSS 3.4
- **Runtime**: Node.js

### Dependencies

```json
{
  "next": "^14.2.33",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "typescript": "^5.9.3",
  "tailwindcss": "^3.4.0"
}
```

### External APIs

- **한국마사회 API** (KRA): `http://apis.data.go.kr/B551015`
- **국민체육진흥공단 API** (KSPO): `http://apis.data.go.kr/B551014`
- API 키 발급: [공공데이터포털](https://www.data.go.kr)

## Repository Structure

```
krace/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── globals.css         # 전역 스타일 (Tailwind)
│   │   ├── layout.tsx          # 루트 레이아웃
│   │   ├── page.tsx            # 홈페이지 (메인 대시보드)
│   │   └── race/[id]/          # 동적 라우트
│   │       └── page.tsx        # 경주 상세 페이지
│   ├── components/             # React 컴포넌트
│   │   ├── QuickStats.tsx      # 빠른 통계 위젯
│   │   └── TodayRaces.tsx      # 오늘의 경주 목록
│   ├── lib/                    # 유틸리티 라이브러리
│   │   └── api.ts              # API 호출 함수
│   └── types/                  # TypeScript 타입 정의
│       └── index.ts            # 공통 타입 (Race, Entry, etc.)
├── public/                     # 정적 파일
├── .env.local.example          # 환경변수 예시
├── .gitignore                  # Git 제외 파일
├── next.config.js              # Next.js 설정
├── package.json                # 프로젝트 메타데이터
├── postcss.config.js           # PostCSS 설정
├── tailwind.config.ts          # Tailwind 설정
├── tsconfig.json               # TypeScript 설정
├── CLAUDE.md                   # 이 파일
└── README.md                   # 프로젝트 문서
```

### Key Files Description

- **`src/types/index.ts`**: 모든 TypeScript 타입 정의 (Race, Entry, RaceResult, Payout, Horse, Athlete 등)
- **`src/lib/api.ts`**: API 호출 및 데이터 파싱 로직, 더미 데이터 제공
- **`src/app/page.tsx`**: 메인 대시보드 (통계 + 오늘의 경주 목록)
- **`src/app/race/[id]/page.tsx`**: 개별 경주 상세 정보

## Development Workflows

### Local Development Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/Prometheus-P/krace.git
   cd krace
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local and add your API keys
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   # Open http://localhost:3000
   ```

5. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

### Available Scripts

- `npm run dev`: 개발 서버 실행 (포트 3000)
- `npm run build`: 프로덕션 빌드
- `npm start`: 프로덕션 서버 실행
- `npm run lint`: ESLint 검사

### Git Workflow

- **Main Branch**: `main` (프로덕션 배포)
- **Development Branch**: `claude/*` (AI 개발 작업용)
- **Feature Branches**: `feature/기능명`, `fix/버그명`
- **Commit Convention**: Conventional Commits
  - Format: `type(scope): subject`
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
  - Examples:
    - `feat(api): add boat race results endpoint`
    - `fix(ui): correct odds display formatting`
    - `docs: update API integration guide`

### Git Push Requirements (for AI Assistants)

- Always use: `git push -u origin <branch-name>`
- Branch naming: Must start with `claude/` and end with matching session ID
- Retry logic: If push fails due to network errors, retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s)

### Git Operations Best Practices

- Prefer fetching specific branches: `git fetch origin <branch-name>`
- Use clear commit messages that explain the "why" not just the "what"
- Keep commits atomic and focused on single concerns
- Never force push to main without explicit permission
- Always test locally before pushing

## Code Conventions

### General Principles

1. **Simplicity First**: Avoid over-engineering. Implement what's needed now, not what might be needed.
2. **No Premature Abstraction**: Three similar lines are better than a premature abstraction.
3. **Delete Unused Code**: No backwards-compatibility hacks. Delete unused code completely.
4. **Type Safety**: Leverage TypeScript's type system. Avoid `any` types.
5. **Security Awareness**: Watch for vulnerabilities:
   - XSS (Cross-Site Scripting)
   - API key exposure (keep in .env.local)
   - Insecure data handling
   - CORS issues

### TypeScript / React Conventions

#### Naming

- **Components**: PascalCase (e.g., `QuickStats.tsx`, `TodayRaces.tsx`)
- **Variables**: camelCase (e.g., `raceData`, `isLoading`)
- **Types/Interfaces**: PascalCase (e.g., `Race`, `Entry`, `DailyStats`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE`, `KRA_API_KEY`)
- **Files**:
  - Components: PascalCase (e.g., `QuickStats.tsx`)
  - Utilities: camelCase (e.g., `api.ts`)
  - Pages: lowercase (e.g., `page.tsx`)

#### Component Structure

```typescript
// 1. Imports
import { Race } from '@/types'
import { getRaces } from '@/lib/api'

// 2. Types/Interfaces
interface Props {
  raceType: 'horse' | 'cycle' | 'boat'
}

// 3. Component
export default function RaceList({ raceType }: Props) {
  // 4. State and hooks
  const [races, setRaces] = useState<Race[]>([])

  // 5. Effects
  useEffect(() => {
    // ...
  }, [])

  // 6. Handlers
  const handleClick = () => {
    // ...
  }

  // 7. Render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

#### Type Definitions

- Always define types in `src/types/index.ts`
- Export all types for reuse
- Use interfaces for object shapes
- Use type unions for specific values (e.g., `type RaceType = 'horse' | 'cycle' | 'boat'`)

### API Integration Guidelines

#### API Functions (`src/lib/api.ts`)

- Always provide dummy data for development/demo
- Handle errors gracefully
- Cache API responses using Next.js `revalidate`
- Parse API responses consistently

```typescript
// Good: Fallback to dummy data
export async function getRaces(): Promise<Race[]> {
  if (!API_KEY) {
    return getDummyRaces()
  }

  try {
    const data = await fetchApi(url)
    return parseRaces(data)
  } catch {
    return getDummyRaces()
  }
}
```

### Styling Conventions

#### Tailwind CSS

- Use Tailwind utility classes
- Follow mobile-first approach
- Use semantic class grouping

```tsx
// Good: Organized classes
<div className="
  flex items-center justify-between
  px-4 py-2
  bg-white rounded-lg shadow
  hover:shadow-md transition-shadow
">
```

#### Responsive Design

- Mobile: default (no prefix)
- Tablet: `md:` (768px+)
- Desktop: `lg:` (1024px+)

### Code Quality Standards

- **Comments**: Only where logic isn't self-evident. Code should be self-documenting.
- **Error Handling**: Handle at API boundaries. Use try/catch for external calls.
- **Type Safety**: No `any` types. Use proper TypeScript types.
- **Async/Await**: Prefer async/await over .then() chains

## File Operations

### Tool Usage Guidelines

Always prefer specialized tools over bash commands:

- **Read files:** Use `Read` tool, not `cat/head/tail`
- **Edit files:** Use `Edit` tool, not `sed/awk`
- **Write files:** Use `Write` tool, not `echo >` or `cat <<EOF`
- **Search files:** Use `Glob` for file patterns, `Grep` for content
- **Communication:** Output text directly, never use `echo` in bash for messages

### File Modification Policy

- **ALWAYS** prefer editing existing files over creating new ones
- **NEVER** create files unless absolutely necessary
- **READ FIRST:** Always read a file before modifying it
- Avoid creating unnecessary documentation files unless explicitly requested

## Testing Practices

### Testing Philosophy

- Test critical paths: API parsing, data transformations
- Test components with complex logic
- Mock external API calls
- Test edge cases (empty data, API failures)
- Avoid testing trivial UI components

### Testing Setup (To Be Implemented)

Recommended testing stack:
- **Jest**: Unit/integration testing
- **React Testing Library**: Component testing
- **MSW (Mock Service Worker)**: API mocking

### Test Examples

```typescript
// Example: Testing API parsing
describe('parseHorseRaces', () => {
  it('should parse KRA API response correctly', () => {
    const mockResponse = { /* ... */ }
    const result = parseHorseRaces(mockResponse)
    expect(result).toHaveLength(3)
    expect(result[0].type).toBe('horse')
  })

  it('should handle empty response', () => {
    const result = parseHorseRaces({ response: { body: { items: { item: [] } } } })
    expect(result).toEqual([])
  })
})
```

## Task Management

### Todo System Usage

AI assistants should actively use the TodoWrite tool for:

- **Multi-step tasks:** 3+ distinct steps
- **Complex tasks:** Requiring careful planning
- **Multiple user requests:** Lists of tasks
- **Progress tracking:** To show users what's being done

### Todo Best Practices

1. **Task States:**
   - `pending`: Not yet started
   - `in_progress`: Currently working (ONLY ONE at a time)
   - `completed`: Finished successfully

2. **Task Descriptions:**
   - `content`: Imperative form (e.g., "Run tests")
   - `activeForm`: Present continuous (e.g., "Running tests")

3. **Task Management:**
   - Mark completed immediately after finishing
   - Keep exactly ONE task as in_progress
   - Remove tasks that become irrelevant
   - Only mark completed when fully accomplished

4. **When NOT to use:**
   - Single, straightforward tasks
   - Trivial operations
   - Purely conversational requests

## Project-Specific Considerations

### Racing Domain Knowledge

#### Race Types (경주 종류)

1. **경마 (Horse Racing)**
   - 경마장: 서울, 부산경남, 제주
   - 거리: 1000m ~ 2300m
   - 등급: 국산/외산, 1~7등급
   - 출전 마필: 보통 8~14두
   - API: 한국마사회 (KRA)

2. **경륜 (Cycle Racing)**
   - 경륜장: 광명, 창원, 부산
   - 거리: 1400m ~ 2000m
   - 선수 등급: 특선, S, A, B
   - 출전 선수: 보통 7~9명
   - API: 국민체육진흥공단 (KSPO)

3. **경정 (Boat Racing)**
   - 경정장: 미사리 (단일)
   - 거리: 600m (고정)
   - 선수 등급: A1, A2, B1, B2
   - 출전 선수: 보통 6명
   - API: 국민체육진흥공단 (KSPO)

#### Betting Types (베팅 방식)

- **단승 (Win)**: 1위 적중
- **연승 (Place)**: 2위 이내 적중
- **복승 (Show)**: 3위 이내 적중
- **쌍승 (Exacta)**: 1, 2위 순서대로 적중
- **복연승 (Quinella)**: 1, 2위 순서 무관 적중
- **복승식 (Trifecta)**: 1, 2, 3위 순서대로 적중

### API Integration Specifics

#### Data Sources

- **공공데이터포털** (data.go.kr)
  - 무료 API 제공 (일일 트래픽 제한 있음)
  - XML/JSON 형식 지원
  - 요청 파라미터: 날짜, 경기장, 경주 번호 등

#### API Response Handling

```typescript
// KRA API 응답 구조
{
  response: {
    header: {
      resultCode: "00",  // 성공
      resultMsg: "NORMAL SERVICE"
    },
    body: {
      items: {
        item: [/* 경주 데이터 배열 */]
      },
      totalCount: 10
    }
  }
}
```

#### Rate Limiting & Caching

- API 호출 최소화 (공공 API 제한 고려)
- Next.js ISR (Incremental Static Regeneration) 활용
- `revalidate: 60` (1분 캐시)
- 개발 환경에서는 더미 데이터 사용

### Performance Considerations

- **Initial Load**: Server-side rendering (SSR) for SEO
- **Data Updates**: 1분마다 재검증
- **Images**: Optimize with Next.js Image component (향후 추가 시)
- **Bundle Size**: Keep dependencies minimal

### User Experience

- **실시간성**: 경주 시간이 중요하므로 정확한 시간 표시
- **가독성**: 배당률, 경주 정보 명확하게 표시
- **필터링**: 타입별(경마/경륜/경정) 빠른 전환
- **모바일**: 대부분 사용자가 모바일로 접근 예상

## Security Considerations

### Environment Variables

**CRITICAL**: Never commit API keys or sensitive data

- API keys must be in `.env.local` (git-ignored)
- Use `.env.local.example` for documentation
- Verify `.gitignore` includes `.env` and `.env.local`

```bash
# .env.local (NEVER commit this)
KRA_API_KEY=actual_key_here
KSPO_API_KEY=actual_key_here
```

### API Security

- **Rate Limiting**: Respect API quotas
- **HTTPS Only**: All API calls use HTTPS
- **Error Messages**: Don't expose sensitive info in errors
- **CORS**: Configure properly for production domain

### Client-Side Security

- **XSS Prevention**: Sanitize user inputs (if added)
- **Content Security Policy**: Configure in production
- **HTTPS**: Enforce HTTPS in production

### Legal Compliance

- **공공데이터포털 이용약관** 준수
- API 키 재판매 금지
- 데이터 저작권 표시 (한국마사회, 국민체육진흥공단)
- 사행성 조장 콘텐츠 주의

## Communication Style

### For AI Assistants

- Be concise and direct
- Use technical accuracy over validation
- No emojis unless explicitly requested
- Output text for communication, not bash commands
- Focus on facts and problem-solving
- Disagree when necessary; objective guidance over false agreement

### Documentation Style

- Use GitHub-flavored markdown
- Include code references with `file_path:line_number` format
- Keep explanations focused and practical
- Prefer bullet points and structured information
- Include examples where helpful

## Common Operations

### Adding a New Component

1. Create component file in `src/components/`
   ```bash
   src/components/NewComponent.tsx
   ```

2. Follow component structure:
   ```typescript
   import { Race } from '@/types'

   interface Props {
     // ...
   }

   export default function NewComponent({ }: Props) {
     return <div>{/* ... */}</div>
   }
   ```

3. Import and use in pages
4. Test in browser
5. Commit: `feat(ui): add NewComponent`

### Adding a New API Function

1. Define return type in `src/types/index.ts`
2. Add function to `src/lib/api.ts`
3. Include error handling and dummy data
4. Use in component with proper typing
5. Test with and without API key
6. Commit: `feat(api): add function for X`

### Updating Types

1. Edit `src/types/index.ts`
2. Export new types/interfaces
3. Update related API functions
4. Fix TypeScript errors in components
5. Commit: `refactor(types): update X interface`

### Adding a New Page

1. Create in `src/app/`
   ```bash
   src/app/new-page/page.tsx
   ```

2. Implement page component:
   ```typescript
   export default function NewPage() {
     return <div>{/* ... */}</div>
   }
   ```

3. Add navigation link if needed
4. Test routing
5. Commit: `feat(pages): add new page for X`

### Styling Updates

1. Use Tailwind classes in JSX
2. Update `globals.css` for global styles
3. Configure `tailwind.config.ts` for custom tokens
4. Test responsive design (mobile/tablet/desktop)
5. Commit: `style(ui): update X styling`

### Fixing a Bug

1. Reproduce the issue
2. Check browser console for errors
3. Identify root cause (API, parsing, UI)
4. Create minimal fix
5. Test fix thoroughly
6. Commit: `fix(component): brief description`

### Deploying to Production

1. Test build locally:
   ```bash
   npm run build
   npm start
   ```

2. Verify all features work
3. Check environment variables
4. Deploy to hosting (Vercel/Netlify recommended)
5. Test production URL

## Exploration Guidelines

### When to Use Task Tool with Explore Agent

Use the Task tool with `subagent_type=Explore` for:

- Understanding codebase structure
- Finding where functionality is implemented
- Answering "how does X work?" questions
- Non-specific searches requiring context

### Direct Tool Usage

Use Grep/Glob directly for:

- Finding specific file/class/function (needle queries)
- Known patterns or strings
- Quick lookups

## Build and Deployment

### Build Process

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)

# Production Build
npm run build            # Create optimized production build
npm start                # Start production server

# Linting
npm run lint             # Run ESLint
```

### Build Output

```
.next/
├── static/             # Static assets
├── server/             # Server-side code
└── cache/              # Build cache
```

### Deployment Options

#### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

- Automatic deployments from GitHub
- Environment variables in dashboard
- Built-in Next.js optimization

#### Netlify

```bash
# Build command
npm run build

# Publish directory
.next
```

#### Self-Hosted

```bash
npm run build
npm start

# Or use PM2
pm2 start npm --name "krace" -- start
```

### Environment Variables

Production deployment requires:
- `KRA_API_KEY`
- `KSPO_API_KEY`
- `NEXT_PUBLIC_SITE_URL`

### Continuous Integration (To Be Implemented)

Recommended GitHub Actions:
- Run `npm run lint` on PRs
- Run `npm run build` to check for errors
- Run tests when implemented
- Deploy to preview on PR
- Deploy to production on main branch merge

## Version Control Practices

### Commit Guidelines

1. **Atomic commits:** One logical change per commit
2. **Clear messages:** Explain why, not just what
3. **Reference issues:** Include issue numbers when applicable
4. **Test before commit:** Ensure code works

### Branch Management

- Keep branches focused on single features/fixes
- Regularly sync with main branch
- Delete branches after merging
- Use descriptive branch names

### Pull Request Process

1. Ensure all tests pass
2. Write clear PR description with:
   - Summary of changes
   - Test plan
   - Related issues
3. Use `gh pr create` with proper format
4. Address review feedback promptly

## Troubleshooting

### Common Issues

#### Build Errors

**Issue**: `Module not found: Can't resolve '@/types'`
```bash
# Solution: Check tsconfig.json paths
# Ensure "@/*": ["./src/*"] is configured
```

**Issue**: `Error: ENOENT: no such file or directory`
```bash
# Solution: Install dependencies
npm install
```

#### API Issues

**Issue**: API returns empty data
```typescript
// Solution: Check if API key is set
console.log(process.env.KRA_API_KEY) // Should not be undefined

// Fallback: Dummy data is used if no API key
```

**Issue**: CORS errors
```typescript
// Solution: API calls should be server-side only
// Use in page.tsx (Server Component), not client components
```

#### TypeScript Errors

**Issue**: Type errors after updating types
```bash
# Solution: Restart TypeScript server
# VS Code: Cmd/Ctrl + Shift + P -> "TypeScript: Restart TS Server"
```

#### Styling Issues

**Issue**: Tailwind classes not working
```bash
# Solution: Check if Tailwind is configured
# Verify tailwind.config.ts has correct content paths
# Restart dev server
npm run dev
```

### Development Tips

- Use React DevTools browser extension
- Check Next.js build output for warnings
- Monitor browser console for errors
- Test on mobile viewport (DevTools responsive mode)
- Clear `.next` cache if build behaves oddly:
  ```bash
  rm -rf .next
  npm run dev
  ```

### Getting Help

- Check [Next.js Documentation](https://nextjs.org/docs)
- Review [React Documentation](https://react.dev)
- Check [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- Search GitHub issues in this repository
- Ask user for clarification when needed

## Future Enhancements

### Planned Features

- [ ] 실시간 경주 결과 업데이트 (WebSocket)
- [ ] 과거 경주 결과 조회 및 통계
- [ ] 출마표 상세 정보 (기수/조교사 프로필)
- [ ] 배당률 추이 그래프
- [ ] 즐겨찾기 기능 (경마장/경륜장)
- [ ] 푸시 알림 (경주 시작 전)
- [ ] 다크 모드 지원
- [ ] PWA (Progressive Web App) 지원

### Technical Debt

- [ ] Add comprehensive testing (Jest + RTL)
- [ ] Implement error boundaries
- [ ] Add loading skeletons
- [ ] Optimize bundle size
- [ ] Add analytics (Google Analytics)
- [ ] SEO optimization (meta tags, sitemap)
- [ ] Accessibility improvements (ARIA labels)

## Resources

### Official Documentation

- [Next.js 14 Docs](https://nextjs.org/docs)
- [React 18 Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### API Documentation

- [공공데이터포털](https://www.data.go.kr)
- [한국마사회 공공데이터](https://www.data.go.kr/data/15048266/openapi.do)
- [국민체육진흥공단 경륜/경정](https://www.data.go.kr/data/15048239/openapi.do)

### Related Projects

- Korean racing information services
- Sports betting information platforms
- Real-time data dashboards

## Evolution of This Document

This CLAUDE.md should evolve with the project:

- **Add** new conventions as they're established
- **Update** when new features are added
- **Remove** outdated information
- **Refine** based on development experience
- **Document** major architectural decisions

When making significant changes to project architecture, APIs, or conventions, update this document to reflect current best practices.

---

**Last Updated:** 2025-11-24
**Document Version:** 2.0.0
**Status:** Active Development
**Primary Language**: Korean (한국어)
**Tech Stack**: Next.js 14 + TypeScript + Tailwind CSS
