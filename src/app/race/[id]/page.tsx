// src/app/race/[id]/page.tsx
import { fetchRaceById } from '@/lib/api';
import type { Metadata, ResolvingMetadata } from 'next';
import Script from 'next/script';
import OddsDisplay from '@/components/OddsDisplay';
import ResultsTable from '@/components/ResultsTable';
import { RaceResult } from '@/types';
import { RaceNotFound, BackNavigation } from './components';
import { RaceSummaryCard, EntryTable } from '@/components/race-detail';

type Props = {
  params: { id: string };
};

export async function generateMetadata(
  { params }: Props,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const race = await fetchRaceById(params.id);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://racelab.kr';

  if (!race) {
    return { title: '경주 정보 - KRace' };
  }

  const raceTypeKorean = race.type === 'horse' ? '경마' : race.type === 'cycle' ? '경륜' : '경정';
  const title = `${race.track} 제${race.raceNo}경주 - KRace`;
  const description = `${race.track} 제${race.raceNo}경주 ${raceTypeKorean} 상세 정보, 출전표, 배당률, 경주 결과를 확인하세요.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${baseUrl}/race/${params.id}`,
      siteName: 'KRace',
      locale: 'ko_KR',
      images: [
        {
          url: `${baseUrl}/opengraph-image.svg`,
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

// Mock results for demonstration (will be replaced with API data)
function getMockResults(
  raceStatus: string,
  entries: { no: number; name: string; jockey?: string; odds?: number }[]
): RaceResult[] {
  if (raceStatus !== 'finished' || entries.length < 3) {
    return [];
  }

  // Generate mock results from entries
  const shuffled = [...entries].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map((entry, index) => ({
    rank: index + 1,
    no: entry.no,
    name: entry.name,
    jockey: entry.jockey,
    odds: entry.odds,
    payout: entry.odds ? Math.round(entry.odds * 1000) : undefined,
  }));
}

export default async function RaceDetailPage({ params }: Props) {
  const race = await fetchRaceById(params.id);

  if (!race) {
    return <RaceNotFound />;
  }

  const isFinished = race.status === 'finished';
  const results = getMockResults(race.status, race.entries);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://racelab.kr';

  // Race type in Korean
  const raceTypeKorean = race.type === 'horse' ? '경마' : race.type === 'cycle' ? '경륜' : '경정';

  // JSON-LD BreadcrumbList schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '홈',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: raceTypeKorean,
        item: `${baseUrl}/?tab=${race.type}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${race.track} 제${race.raceNo}경주`,
      },
    ],
  };

  // JSON-LD SportsEvent schema
  const sportsEventSchema = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${race.track} 제${race.raceNo}경주`,
    description: race.distance
      ? `${raceTypeKorean} ${race.distance}m 경주`
      : `${raceTypeKorean} 경주`,
    startDate: new Date().toISOString().split('T')[0] + 'T' + race.startTime + ':00',
    eventStatus:
      race.status === 'finished'
        ? 'https://schema.org/EventCompleted'
        : race.status === 'live'
          ? 'https://schema.org/EventLive'
          : 'https://schema.org/EventScheduled',
    location: {
      '@type': 'Place',
      name: race.track,
    },
    sport: raceTypeKorean,
    competitor: race.entries.map((entry) => ({
      '@type': 'Person',
      name: entry.name,
      ...(entry.jockey && { coach: { '@type': 'Person', name: entry.jockey } }),
    })),
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

      <div className="space-y-6">
        <BackNavigation raceType={race.type} />
        <RaceSummaryCard race={race} />
        <EntryTable race={race} />

        {/* Odds section */}
        <section
          className="rounded-xl bg-white p-4 shadow-sm md:p-6"
          data-testid="odds"
          aria-labelledby="odds-heading"
        >
          <h2
            id="odds-heading"
            className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900"
          >
            <span aria-hidden="true">💰</span>
            단승 배당률
          </h2>
          <OddsDisplay entries={race.entries} raceType={race.type} />
        </section>

        {/* Results section (only for finished races) */}
        {isFinished && results.length > 0 && (
          <section
            className="rounded-xl bg-white p-4 shadow-sm md:p-6"
            data-testid="results"
            aria-labelledby="results-heading"
          >
            <h2
              id="results-heading"
              className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900"
            >
              <span aria-hidden="true">🏆</span>
              경주 결과
            </h2>
            <ResultsTable results={results} raceType={race.type} />
          </section>
        )}
      </div>
    </>
  );
}
