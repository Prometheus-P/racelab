// src/app/race/[id]/page.tsx
import { fetchRaceByIdWithStatus } from '@/lib/api';
import type { Metadata, ResolvingMetadata } from 'next';
import Script from 'next/script';
import { RaceResult, Dividend } from '@/types';
import { RaceNotFound, BackNavigation } from './components';
import { RaceSummaryCard, EntryTable, RaceResultsOdds, KeyInsightBlock } from '@/components/race-detail';
import { generateRaceMetadata, generateSportsEventSchema, generateBreadcrumbListSchema } from '@/lib/seo';
import { AISummary } from '@/components/seo';
import ErrorBanner from '@/components/ErrorBanner';

type Props = {
  params: { id: string };
};

export async function generateMetadata(
  { params }: Props,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const result = await fetchRaceByIdWithStatus(params.id);

  if (result.status !== 'OK' || !result.data) {
    return { title: '경주 정보 - RaceLab' };
  }

  const race = result.data;
  // Use centralized SEO metadata generator with canonical URL
  return generateRaceMetadata({
    id: race.id,
    type: race.type,
    track: race.track,
    raceNo: race.raceNo,
    date: race.date,
    distance: race.distance,
  });
}

// Mock results for demonstration - only used in development
// Production should use real API data
function getMockResults(
  raceStatus: string,
  entries: { no: number; name: string; jockey?: string; odds?: number }[]
): RaceResult[] {
  // Only provide mock data in development
  if (process.env.NODE_ENV !== 'development') {
    return [];
  }

  if (raceStatus !== 'finished' || entries.length < 3) {
    return [];
  }

  // Use deterministic order (first 3 entries) instead of random shuffle
  return entries.slice(0, 3).map((entry, index) => ({
    rank: index + 1,
    no: entry.no,
    name: entry.name,
    jockey: entry.jockey,
    odds: entry.odds,
    payout: entry.odds ? Math.round(entry.odds * 1000) : undefined,
  }));
}

// Mock dividends for demonstration - only used in development
// Production should use real API data
function getMockDividends(raceStatus: string, results: RaceResult[]): Dividend[] {
  // Only provide mock data in development
  if (process.env.NODE_ENV !== 'development') {
    return [];
  }

  if (raceStatus !== 'finished' || results.length < 2) {
    return [];
  }

  return [
    { type: 'win', entries: [results[0].no], amount: results[0].payout || 3500 },
    { type: 'place', entries: [results[0].no, results[1].no], amount: 1200 },
    { type: 'quinella', entries: [results[0].no, results[1].no], amount: 5600 },
  ];
}

export default async function RaceDetailPage({ params }: Props) {
  const result = await fetchRaceByIdWithStatus(params.id);

  // Handle NOT_FOUND - race doesn't exist
  if (result.status === 'NOT_FOUND' || !result.data) {
    return <RaceNotFound />;
  }

  // Handle UPSTREAM_ERROR - show error banner with partial data fallback
  const showError = result.status === 'UPSTREAM_ERROR';
  const race = result.data;

  const results = getMockResults(race.status, race.entries);
  const dividends = getMockDividends(race.status, results);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://racelab.kr';

  // Race type in Korean
  const raceTypeKorean = race.type === 'horse' ? '경마' : race.type === 'cycle' ? '경륜' : '경정';

  // JSON-LD BreadcrumbList schema (FR-008) using centralized utility
  const breadcrumbSchema = generateBreadcrumbListSchema([
    { name: '홈', url: '/' },
    { name: raceTypeKorean, url: `/?tab=${race.type}` },
    { name: `${race.track} 제${race.raceNo}경주`, url: `/race/${race.id}` },
  ]);

  // JSON-LD SportsEvent schema using centralized utility with ImageObject for AI crawlers
  const sportsEventSchemaBase = generateSportsEventSchema(race, results);
  const sportsEventSchema = {
    ...sportsEventSchemaBase,
    image: {
      '@type': 'ImageObject',
      url: `${baseUrl}/opengraph-image.svg`,
      contentUrl: `${baseUrl}/opengraph-image.svg`,
      caption: `${race.track} 제${race.raceNo}경주 ${raceTypeKorean} 정보 - RaceLab`,
      width: 1200,
      height: 630,
      encodingFormat: 'image/svg+xml',
    },
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="sports-event-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sportsEventSchema) }}
      />

      {/* AI Summary for LLM parsing (sr-only) */}
      <AISummary race={race} results={results} dividends={dividends} />

      <div className="space-y-6">
        <BackNavigation raceType={race.type} />
        <ErrorBanner
          show={showError}
          message="데이터 제공 시스템 지연으로 일부 정보가 표시되지 않을 수 있습니다"
        />
        <RaceSummaryCard race={race} />
        <KeyInsightBlock race={race} results={results} />
        <EntryTable race={race} />
        <RaceResultsOdds race={race} results={results} dividends={dividends} />
      </div>
    </>
  );
}
