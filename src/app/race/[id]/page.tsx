// src/app/race/[id]/page.tsx
import { fetchRaceByIdWithStatus } from '@/lib/api';
import type { Metadata, ResolvingMetadata } from 'next';
import Script from 'next/script';
import Link from 'next/link';
import { RaceNotFound, BackNavigation } from './components';
import { generateRaceMetadata, generateSportsEventSchema, generateBreadcrumbListSchema } from '@/lib/seo';
import { AISummary } from '@/components/seo';
import ErrorBanner from '@/components/ErrorBanner';
import { RACE_TYPES } from '@/config/raceTypes';
import { getSiteUrl } from '@/lib/seo/siteUrl';

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
  return generateRaceMetadata({
    id: race.id,
    type: race.type,
    track: race.track,
    raceNo: race.raceNo,
    date: race.date,
    distance: race.distance,
  });
}

export default async function RaceDetailPage({ params }: Props) {
  const result = await fetchRaceByIdWithStatus(params.id);

  if (result.status === 'NOT_FOUND' || !result.data) {
    return <RaceNotFound />;
  }

  const showError = result.status === 'UPSTREAM_ERROR';
  const race = result.data;
  const baseUrl = getSiteUrl();
  const raceTypeKorean = race.type === 'horse' ? '경마' : race.type === 'cycle' ? '경륜' : '경정';
  const raceConfig = RACE_TYPES[race.type];

  const breadcrumbSchema = generateBreadcrumbListSchema([
    { name: '홈', url: '/' },
    { name: raceTypeKorean, url: `/?tab=${race.type}` },
    { name: `${race.track} 제${race.raceNo}경주`, url: `/race/${race.id}` },
  ]);

  const sportsEventSchema = {
    ...generateSportsEventSchema(race, []),
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

      <AISummary race={race} results={[]} dividends={[]} />

      <div className="space-y-6">
        <BackNavigation raceType={race.type} />
        <ErrorBanner
          show={showError}
          message="데이터 제공 시스템 지연으로 일부 정보가 표시되지 않을 수 있습니다"
        />

        {/* Race Summary Card */}
        <section className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${raceConfig.color.badge}`}>
                {raceConfig.icon} {raceConfig.label}
              </span>
              <h1 className="mt-3 text-2xl font-bold text-gray-900">
                {race.track} 제{race.raceNo}경주
              </h1>
              <p className="mt-1 text-gray-500">{race.date} · {race.distance}m</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-sm font-medium ${race.status === 'finished' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
              {race.status === 'finished' ? '종료' : '예정'}
            </span>
          </div>
        </section>

        {/* Entry List */}
        {race.entries.length > 0 && (
          <section className="rounded-xl border border-gray-100 bg-white shadow-sm">
            <h2 className="border-b border-gray-100 px-6 py-4 text-lg font-bold text-gray-900">
              출전표 ({race.entries.length}두)
            </h2>
            <div className="divide-y divide-gray-100">
              {race.entries.map((entry) => (
                <div key={entry.no} className="flex items-center justify-between px-6 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-bold">
                      {entry.no}
                    </span>
                    <span className="font-medium text-gray-900">{entry.name}</span>
                    {entry.jockey && <span className="text-sm text-gray-500">{entry.jockey}</span>}
                  </div>
                  {entry.odds && (
                    <span className="text-sm font-medium text-primary">{entry.odds.toFixed(1)}배</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Back to Home */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </>
  );
}
