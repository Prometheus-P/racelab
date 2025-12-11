# Feature Specification: Advanced SEO/AEO/GEO Optimization

**Feature Branch**: `005-seo-optimization`
**Created**: 2025-12-11
**Status**: Draft
**Input**: User description: "Implement advanced SEO, AEO, and GEO optimizations targeting 50-60 demographic users for better search visibility, voice search support, and AI citation authority"

## User Scenarios & Testing _(mandatory)_

<!--
  IMPORTANT: User stories are PRIORITIZED as user journeys ordered by importance.
  Each story is INDEPENDENTLY TESTABLE and delivers standalone value.

  Target Demographic: 50-60 year old users who:
  - Prefer simple, clear information
  - May use voice search (Naver Clova, Google Assistant)
  - Need fast-loading pages on mobile
  - Search for race information in Korean
-->

### User Story 1 - Search Engine Discovery (Priority: P1)

사용자로서 "서울경마 1경주 배당률" 또는 "경륜 결과" 같은 검색어로 Google/Naver에서 RaceLab 페이지를 상위에서 찾고 싶습니다. 검색 결과에 경주명, 배당률, 결과 등 핵심 정보가 미리보기로 표시되어야 합니다.

**Why this priority**: 검색 엔진을 통한 유기적 유입은 DAU 10,000명 목표 달성의 핵심 채널입니다. 50-60대 사용자의 70%가 포털 검색을 통해 경주 정보를 찾습니다.

**Independent Test**: Google Search Console에서 인덱싱 상태 확인, "서울경마 RaceLab" 검색 시 1페이지 노출 여부 테스트

**Acceptance Scenarios**:

1. **Given** 경주 상세 페이지가 존재할 때, **When** 검색 엔진이 페이지를 크롤링하면, **Then** 고유한 title (예: "서울 제1경주 배당률 & 결과 - RaceLab")과 description이 인덱싱됩니다
2. **Given** 과거 1년간의 경주 데이터가 존재할 때, **When** 사이트맵을 생성하면, **Then** 모든 과거 경주 URL이 sitemap.xml에 포함됩니다
3. **Given** 사용자가 모바일에서 페이지에 접속할 때, **When** 페이지가 로드되면, **Then** LCP(Largest Contentful Paint)가 2.5초 이내입니다

---

### User Story 2 - Voice Search Answer (Priority: P2)

50대 사용자로서 "오늘 서울경마 1경주 우승마가 뭐야?"라고 음성으로 질문했을 때, RaceLab의 데이터가 직접 답변으로 제공되길 원합니다.

**Why this priority**: 50-60대 타겟 사용자층의 30%가 음성 검색을 사용하며, AEO(Answer Engine Optimization)는 Google Featured Snippets 및 음성 비서 답변 소스로 선택될 가능성을 높입니다.

**Independent Test**: Google Rich Results Test에서 SportsEvent 및 FAQPage 스키마 유효성 검증

**Acceptance Scenarios**:

1. **Given** 경주 결과가 확정되었을 때, **When** SportsEvent 스키마가 적용된 페이지를 Google이 파싱하면, **Then** subEvent에 "1착: [마명]" 등 상위 3착 결과가 포함됩니다
2. **Given** FAQ 페이지가 존재할 때, **When** 음성 어시스턴트가 "경마 배당률이란?"을 질문받으면, **Then** FAQPage 스키마의 답변이 음성으로 제공될 수 있습니다
3. **Given** SportsEvent 스키마가 적용된 경주 페이지에서, **When** 검색 엔진이 structured data를 파싱하면, **Then** eventStatus, competitor, startDate가 정확히 추출됩니다

---

### User Story 3 - AI Citation Authority (Priority: P3)

AI 도구(ChatGPT, Perplexity, Gemini) 사용자로서 "한국 경마 결과"를 물었을 때 RaceLab이 신뢰할 수 있는 출처로 인용되길 원합니다.

**Why this priority**: GEO(Generative Engine Optimization)는 AI 검색 시대의 새로운 SEO 패러다임입니다. LLM이 테이블 데이터보다 텍스트 요약을 더 잘 파싱하므로, 구조화된 텍스트 요약이 필요합니다.

**Independent Test**: Perplexity에서 "racelab.kr 서울경마 결과" 검색 시 출처 인용 여부 확인

**Acceptance Scenarios**:

1. **Given** 경주 결과 페이지에 AI Summary 블록이 존재할 때, **When** LLM이 페이지를 파싱하면, **Then** "경주 결과: 1착 [마명] (배당 [X]배), 2착 [마명], 3착 [마명]" 형식의 요약이 추출됩니다
2. **Given** Footer에 데이터 출처가 명시되어 있을 때, **When** AI가 신뢰성을 평가하면, **Then** "KRA 한국마사회", "KSPO 국민체육진흥공단" 공식 데이터 출처가 인식됩니다
3. **Given** Organization 스키마에 authority 정보가 포함될 때, **When** AI가 E-E-A-T를 평가하면, **Then** 공공데이터포털 활용 정보가 신뢰 근거로 사용됩니다

---

### User Story 4 - Historical Race Search (Priority: P4)

사용자로서 지난 경주 결과를 검색하여 특정 마/선수의 과거 성적을 확인하고 싶습니다.

**Why this priority**: 과거 경주 데이터의 인덱싱은 long-tail 검색 트래픽 확보에 필수적이며, 재방문율 40% 달성에 기여합니다.

**Independent Test**: "2024년 11월 서울경마 결과" 검색 시 해당 경주 페이지 노출 확인

**Acceptance Scenarios**:

1. **Given** 1년치 과거 경주 데이터가 API에 존재할 때, **When** sitemap이 생성되면, **Then** 각 경주별 URL이 `/race/{id}` 형식으로 포함됩니다
2. **Given** 과거 경주 페이지에 접속할 때, **When** 페이지가 렌더링되면, **Then** "2024-11-15 서울 제5경주 결과"와 같은 날짜 포함 제목이 표시됩니다
3. **Given** 사이트맵 URL 수가 50,000개를 초과할 때, **When** sitemap을 생성하면, **Then** sitemap index를 통해 여러 sitemap 파일로 분할됩니다

---

### User Story 5 - Performance for Seniors (Priority: P5)

50-60대 사용자로서 느린 네트워크 환경(3G/LTE)에서도 빠르게 경주 정보를 확인하고 싶습니다.

**Why this priority**: 타겟 사용자층의 데이터 환경과 구형 기기 사용을 고려한 Core Web Vitals 최적화가 필요합니다.

**Independent Test**: Lighthouse Performance Score 90+ 달성, PageSpeed Insights 모바일 점수 확인

**Acceptance Scenarios**:

1. **Given** `next/font/google`로 Noto Sans KR 폰트가 구성될 때, **When** 폰트가 로드되면, **Then** 자동 서브셋팅, self-hosting, `display: swap`이 적용되어 render-blocking 없이 로드됩니다
2. **Given** 이미지가 포함된 페이지를 로드할 때, **When** 뷰포트 아래 이미지가 있으면, **Then** lazy loading이 적용되어 초기 로드에 포함되지 않습니다
3. **Given** Next.js 페이지가 빌드될 때, **When** ISR이 적용되면, **Then** TTFB(Time to First Byte)가 600ms 이하입니다

---

### Edge Cases

- **과거 경주 데이터 API 실패 시**: sitemap 생성에서 해당 기간을 skip하고 가용 데이터만 포함
- **JSON-LD 파싱 오류 시**: 필수 필드(name, startDate) 누락 시 기본값 사용하여 스키마 유효성 유지
- **sitemap URL 50,000개 초과 시**: sitemap index 파일로 분할하여 검색 엔진 제한 준수
- **경주 취소/연기 시**: eventStatus를 EventCancelled/EventPostponed로 업데이트
- **실시간 데이터 갱신 중 크롤링**: ISR 캐시로 일관된 데이터 제공

## Requirements _(mandatory)_

### Functional Requirements

**SEO (Search Engine Optimization)**

- **FR-001**: System MUST generate unique `<title>` and `<meta description>` for each race detail page based on race data (track, raceNo, type, date)
- **FR-002**: System MUST generate sitemap.xml containing all race URLs from the past 365 days
- **FR-003**: System MUST split sitemap into index + child sitemaps when URL count exceeds 50,000
- **FR-004**: System MUST set appropriate `changeFrequency` and `priority` for each sitemap entry based on race status
- **FR-005**: System MUST include canonical URLs for all indexable pages

**AEO (Answer Engine Optimization)**

- **FR-006**: System MUST output SportsEvent JSON-LD schema with `eventStatus`, `competitor`, `location`, `startDate` for each race page
- **FR-007**: System MUST output FAQPage JSON-LD schema for guide/help pages with Q&A pairs
- **FR-008**: System MUST include BreadcrumbList JSON-LD schema on all race detail pages

**GEO (Generative Engine Optimization)**

- **FR-009**: System MUST render a text-based "AI Summary" block on race result pages containing winner name, odds, and ranking in plain Korean text
- **FR-010**: System MUST include explicit data source attribution (KRA/KSPO) in page content accessible to crawlers
- **FR-011**: System MUST use semantic HTML (`<article>`, `<section>`, `<main>`) for content structure

**Performance**

- **FR-012**: System MUST achieve LCP < 2.5s on mobile (Lighthouse measurement)
- **FR-013**: System MUST achieve TTFB < 600ms using ISR caching
- **FR-014**: System MUST optimize Korean font loading using `next/font/google` with automatic subsetting, self-hosting, and `display: swap` (original Pretendard < 100KB target was not achievable due to 11,172 Korean syllables requiring ~250KB minimum)
- **FR-015**: System MUST lazy-load below-fold images using `loading="lazy"` or Next.js Image component

### Key Entities

- **RaceMetadata**: Page-specific SEO data (title, description, canonical URL, Open Graph, Twitter Card)
- **SportsEventSchema**: JSON-LD structured data for race events (name, startDate, eventStatus, competitor[], location, organizer)
- **FAQSchema**: JSON-LD structured data for FAQ pages (mainEntity[] with Question/Answer pairs)
- **AISummary**: Plain-text race result summary for LLM parsing (winner, odds, rankings)
- **SitemapEntry**: URL entry with lastModified, changeFrequency, priority

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of dynamic race pages have unique `<title>` containing track name, race number, and "RaceLab"
- **SC-002**: sitemap.xml contains 100% of historical race IDs from past 365 days (verified via sitemap URL count)
- **SC-003**: Google Rich Results Test passes for SportsEvent schema on all race detail pages
- **SC-004**: Google Rich Results Test passes for FAQPage schema on guide pages
- **SC-005**: Lighthouse Performance Score >= 90 on mobile for race detail pages
- **SC-006**: LCP < 2.5s measured via Lighthouse or PageSpeed Insights (mobile, median)
- **SC-007**: Korean font uses `next/font/google` with automatic subsetting and no render-blocking @import (verified via lighthouse audit and typography.css inspection)
- **SC-008**: AI Summary block visible on 100% of finished race pages
- **SC-009**: Search Console shows indexing of historical race pages within 30 days of deployment

## Technical Constraints

- Use Next.js built-in `Metadata` API (not `next-seo` package) for consistency
- Maintain strict Server/Client Component separation - metadata generation in Server Components only
- Follow TDD: Write unit tests for metadata generation utility functions
- JSON-LD schemas must validate against Schema.org and Google Structured Data Testing Tool
- Sitemap generation must handle API failures gracefully (fallback to cached data or skip)

## Out of Scope

- Real-time push notifications for race results (covered in Phase 2 F-010)
- User personalization or saved search preferences (covered in Phase 3)
- Multi-language support (Korean only for MVP)
- Video content optimization (no video content in current scope)
