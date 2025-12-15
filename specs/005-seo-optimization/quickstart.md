# Quickstart: Advanced SEO/AEO/GEO Optimization

**Feature**: 005-seo-optimization
**Date**: 2025-12-11

## Prerequisites

- Node.js 20 LTS
- npm 10+
- fonttools (for font subsetting): `pip install fonttools brotli zopfli`

## Implementation Order

Follow this order to maintain TDD discipline and avoid circular dependencies:

```
1. lib/seo/schemas.ts     → Unit tests first
2. lib/seo/metadata.ts    → Unit tests first
3. lib/seo/sitemap.ts     → Unit tests first
4. components/seo/*       → Component tests
5. app/sitemap.ts         → Integration test
6. app/race/[id]/page.tsx → E2E test
7. Font optimization      → Manual verification
```

---

## Step 1: Create Schema Builders (TDD)

### 1.1 Write Tests First

```typescript
// tests/unit/lib/seo/schemas.test.ts
import { generateSportsEventSchema, generateFAQSchema } from '@/lib/seo/schemas';

describe('generateSportsEventSchema', () => {
  const mockRace = {
    id: 'horse-sel-20251211-01',
    type: 'horse' as const,
    track: '서울',
    raceNo: 1,
    date: '2025-12-11',
    startTime: '10:30',
    status: 'upcoming' as const,
    entries: [{ no: 1, name: '스피드킹', jockey: '김철수' }],
  };

  it('generates valid SportsEvent schema', () => {
    const schema = generateSportsEventSchema(mockRace);

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('SportsEvent');
    expect(schema.name).toBe('서울 제1경주');
    expect(schema.eventStatus).toBe('https://schema.org/EventScheduled');
  });

  it('maps cancelled status correctly', () => {
    const cancelledRace = { ...mockRace, status: 'canceled' as const };
    const schema = generateSportsEventSchema(cancelledRace);

    expect(schema.eventStatus).toBe('https://schema.org/EventCancelled');
  });

  it('includes competitor array', () => {
    const schema = generateSportsEventSchema(mockRace);

    expect(schema.competitor).toHaveLength(1);
    expect(schema.competitor[0]['@type']).toBe('Thing');
    expect(schema.competitor[0].name).toBe('스피드킹');
  });
});

describe('generateFAQSchema', () => {
  it('generates valid FAQPage schema', () => {
    const faqs = [
      { question: '배당률이란?', answer: '결과 매칭 시 받는 배수입니다.' },
    ];

    const schema = generateFAQSchema(faqs);

    expect(schema['@type']).toBe('FAQPage');
    expect(schema.mainEntity[0]['@type']).toBe('Question');
    expect(schema.mainEntity[0].acceptedAnswer['@type']).toBe('Answer');
  });
});
```

### 1.2 Implement Schema Builders

```typescript
// src/lib/seo/schemas.ts
import { Race, Entry, RaceResult } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://racelab.kr';

const STATUS_MAP: Record<string, string> = {
  upcoming: 'https://schema.org/EventScheduled',
  live: 'https://schema.org/EventScheduled',
  finished: 'https://schema.org/EventScheduled',
  canceled: 'https://schema.org/EventCancelled',
  postponed: 'https://schema.org/EventPostponed',
};

const RACE_TYPE_KO: Record<string, string> = {
  horse: '경마',
  cycle: '경륜',
  boat: '경정',
};

const ORGANIZER: Record<string, { name: string; url: string }> = {
  horse: { name: '한국마사회 (KRA)', url: 'https://kra.co.kr' },
  cycle: { name: '국민체육진흥공단 (KSPO)', url: 'https://kspo.or.kr' },
  boat: { name: '국민체육진흥공단 (KSPO)', url: 'https://kspo.or.kr' },
};

export function generateSportsEventSchema(
  race: Race,
  results?: RaceResult[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    '@id': `${BASE_URL}/race/${race.id}#event`,
    name: `${race.track} 제${race.raceNo}경주`,
    description: race.distance
      ? `${RACE_TYPE_KO[race.type]} ${race.distance}m 경주`
      : `${RACE_TYPE_KO[race.type]} 경주`,
    startDate: `${race.date}T${race.startTime}:00+09:00`,
    eventStatus: STATUS_MAP[race.status] || STATUS_MAP.upcoming,
    location: {
      '@type': 'Place',
      name: race.track,
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'KR',
      },
    },
    organizer: {
      '@type': 'Organization',
      ...ORGANIZER[race.type],
    },
    sport: RACE_TYPE_KO[race.type],
    competitor: race.entries.map((entry) => ({
      '@type': race.type === 'horse' ? 'Thing' : 'Person',
      name: entry.name,
      ...(entry.jockey && {
        athlete: { '@type': 'Person', name: entry.jockey },
      }),
    })),
    url: `${BASE_URL}/race/${race.id}`,
    ...(results && results.length > 0 && {
      subEvent: results.slice(0, 3).map((r, idx) => ({
        '@type': 'Event',
        name: `${idx + 1}착`,
        description: `${r.name} (배당률: ${r.odds || '-'}배)`,
      })),
    }),
  };
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
```

---

## Step 2: Create Metadata Generator (TDD)

### 2.1 Write Tests First

```typescript
// tests/unit/lib/seo/metadata.test.ts
import { generateRaceMetadata } from '@/lib/seo/metadata';

describe('generateRaceMetadata', () => {
  it('generates title with track and race number', () => {
    const race = { track: '서울', raceNo: 1, type: 'horse' };
    const metadata = generateRaceMetadata(race);

    expect(metadata.title).toContain('서울');
    expect(metadata.title).toContain('제1경주');
    expect(metadata.title).toContain('RaceLab');
  });

  it('includes canonical URL', () => {
    const race = { id: 'horse-sel-20251211-01', track: '서울', raceNo: 1 };
    const metadata = generateRaceMetadata(race);

    expect(metadata.alternates.canonical).toContain('/race/horse-sel-20251211-01');
  });
});
```

### 2.2 Implement Metadata Generator

```typescript
// src/lib/seo/metadata.ts
import { Metadata } from 'next';
import { Race } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://racelab.kr';

const RACE_TYPE_KO: Record<string, string> = {
  horse: '경마',
  cycle: '경륜',
  boat: '경정',
};

const DATA_SOURCE: Record<string, string> = {
  horse: '한국마사회(KRA)',
  cycle: '국민체육진흥공단(KSPO)',
  boat: '국민체육진흥공단(KSPO)',
};

export function generateRaceMetadata(race: Race): Metadata {
  const raceType = RACE_TYPE_KO[race.type];
  const title = `${race.track} 제${race.raceNo}경주 ${raceType} - RaceLab`;
  const description = `${race.date || '오늘'} ${race.track} 제${race.raceNo}경주 ${raceType} 출주표, 배당률, 경주 결과를 확인하세요. ${DATA_SOURCE[race.type]} 공식 데이터.`;
  const url = `${BASE_URL}/race/${race.id}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url,
      siteName: 'RaceLab',
      locale: 'ko_KR',
      images: [
        {
          url: `${BASE_URL}/opengraph-image.svg`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}
```

---

## Step 3: Update Sitemap (TDD)

### 3.1 Write Tests First

```typescript
// tests/unit/lib/seo/sitemap.test.ts
import { generateSitemapEntries, shouldSplitSitemap } from '@/lib/seo/sitemap';

describe('generateSitemapEntries', () => {
  it('sets correct priority for finished races', () => {
    const races = [{ id: '1', status: 'finished', date: '2025-12-11' }];
    const entries = generateSitemapEntries(races);

    expect(entries[0].priority).toBe(0.7);
    expect(entries[0].changeFrequency).toBe('never');
  });

  it('sets correct priority for upcoming races', () => {
    const races = [{ id: '2', status: 'upcoming', date: '2025-12-11' }];
    const entries = generateSitemapEntries(races);

    expect(entries[0].priority).toBe(0.9);
    expect(entries[0].changeFrequency).toBe('hourly');
  });
});

describe('shouldSplitSitemap', () => {
  it('returns false for less than 50000 URLs', () => {
    expect(shouldSplitSitemap(49999)).toBe(false);
  });

  it('returns true for 50000 or more URLs', () => {
    expect(shouldSplitSitemap(50000)).toBe(true);
  });
});
```

### 3.2 Implement Sitemap Utilities

```typescript
// src/lib/seo/sitemap.ts
import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://racelab.kr';
const MAX_URLS_PER_SITEMAP = 50000;

interface RaceForSitemap {
  id: string;
  status: string;
  date: string;
  updatedAt?: string;
}

export function shouldSplitSitemap(totalUrls: number): boolean {
  return totalUrls >= MAX_URLS_PER_SITEMAP;
}

export function generateSitemapEntries(
  races: RaceForSitemap[]
): MetadataRoute.Sitemap {
  return races.map((race) => ({
    url: `${BASE_URL}/race/${race.id}`,
    lastModified: race.updatedAt ? new Date(race.updatedAt) : new Date(race.date),
    changeFrequency: race.status === 'finished' ? 'never' : 'hourly',
    priority: race.status === 'upcoming' ? 0.9 : 0.7,
  }));
}

export function getStaticSitemapEntries(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/results`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/guide`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];
}
```

---

## Step 4: Create AI Summary Component

```typescript
// src/components/seo/AISummary.tsx
import { Race, RaceResult, Dividend } from '@/types';

interface AISummaryProps {
  race: Race;
  results?: RaceResult[];
  dividends?: Dividend[];
}

const RACE_TYPE_KO: Record<string, string> = {
  horse: '경마',
  cycle: '경륜',
  boat: '경정',
};

const DATA_SOURCE: Record<string, string> = {
  horse: '한국마사회 (KRA) 공식 데이터',
  cycle: '국민체육진흥공단 (KSPO) 공식 데이터',
  boat: '국민체육진흥공단 (KSPO) 공식 데이터',
};

export default function AISummary({ race, results, dividends }: AISummaryProps) {
  const raceType = RACE_TYPE_KO[race.type];
  const distance = race.distance ? ` (${race.distance}m)` : '';

  const statusText = {
    upcoming: '경주 예정',
    live: '진행 중',
    finished: '경주 종료',
    canceled: '취소됨',
  }[race.status] || '경주 예정';

  const resultText = results?.slice(0, 3).map((r, idx) => {
    const parts = [`${idx + 1}착 ${r.name}`];
    if (r.odds) parts.push(`배당 ${r.odds}배`);
    if (r.jockey) parts.push(`기수: ${r.jockey}`);
    return parts.join(', ');
  }).join(' / ');

  return (
    <section
      data-testid="ai-summary"
      className="sr-only"
      aria-label="경주 요약 정보"
    >
      <p>경주 정보: {race.date} {race.track} 제{race.raceNo}경주 {raceType}{distance}</p>
      <p>상태: {statusText}</p>
      {resultText && <p>경주 결과: {resultText}</p>}
      {dividends && dividends.length > 0 && (
        <p>
          배당금:
          {dividends.map(d => `${d.type === 'win' ? '단승' : d.type === 'place' ? '복승' : '쌍승'} ${d.amount.toLocaleString()}원`).join(', ')}
        </p>
      )}
      <p>데이터 출처: {DATA_SOURCE[race.type]}</p>
    </section>
  );
}
```

---

## Step 5: Font Optimization

### 5.1 Generate Korean Subset

```bash
# Install fonttools
pip install fonttools brotli zopfli

# Download Pretendard from GitHub releases
# https://github.com/orioncactus/pretendard/releases

# Generate Korean subset
pyftsubset Pretendard-Regular.otf \
  --output-file=public/fonts/pretendard-korean-400.woff2 \
  --flavor=woff2 \
  --unicodes=U+AC00-D7A3,U+1100-11FF,U+3130-318F,U+0020-007E,U+2000-206F \
  --layout-features='*' \
  --with-zopfli

pyftsubset Pretendard-Bold.otf \
  --output-file=public/fonts/pretendard-korean-700.woff2 \
  --flavor=woff2 \
  --unicodes=U+AC00-D7A3,U+1100-11FF,U+3130-318F,U+0020-007E,U+2000-206F \
  --layout-features='*' \
  --with-zopfli

# Verify size < 100KB
ls -lh public/fonts/
```

### 5.2 Update Layout with next/font/local

```typescript
// src/app/layout.tsx
import localFont from 'next/font/local';

const pretendard = localFont({
  src: [
    {
      path: '../fonts/pretendard-korean-400.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/pretendard-korean-700.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-pretendard',
  preload: true,
});

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={pretendard.variable}>
      {/* ... */}
    </html>
  );
}
```

---

## Step 6: Run Tests

```bash
# Run all unit tests
npm run test

# Run specific SEO tests
npx jest tests/unit/lib/seo/

# Run E2E tests for structured data
npx playwright test e2e/seo/

# Verify build
npm run build
```

---

## Verification Checklist

- [ ] All unit tests pass
- [ ] `npm run build` succeeds
- [ ] Lighthouse Performance Score >= 90
- [ ] LCP < 2.5s on mobile
- [ ] Font files < 100KB each
- [ ] Google Rich Results Test passes for SportsEvent
- [ ] Google Rich Results Test passes for FAQPage
- [ ] Sitemap accessible at `/sitemap.xml`
- [ ] AI Summary visible in page source (sr-only)

---

## Troubleshooting

### Font Too Large
If subset is still > 100KB, reduce unicode ranges:
```bash
# Minimal Korean subset (2,350 most common characters)
--unicodes=U+AC00-D7A3,U+0020-007E
```

### Sitemap Not Updating
Check ISR revalidation:
```typescript
export const revalidate = 3600; // Must be exported
```

### Schema Validation Fails
Use [Schema Markup Validator](https://validator.schema.org/) to debug.
Common issues:
- Missing `@context`
- Invalid `startDate` format (must be ISO 8601)
- Empty `competitor` array
