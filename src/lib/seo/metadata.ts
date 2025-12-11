// src/lib/seo/metadata.ts
// Metadata generation utilities for race pages

import { Metadata } from 'next';

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

export interface RaceMetadataInput {
  id: string;
  type: string;
  track: string;
  raceNo: number;
  date?: string;
  distance?: number;
}

/**
 * Generate Next.js Metadata for race detail pages
 */
export function generateRaceMetadata(race: RaceMetadataInput): Metadata {
  const raceType = RACE_TYPE_KO[race.type] || race.type;
  const dataSource = DATA_SOURCE[race.type] || '공식 데이터';

  // Include date in title for historical races
  const datePrefix = race.date ? `${race.date} ` : '';
  const title = `${datePrefix}${race.track} 제${race.raceNo}경주 ${raceType} - RaceLab`;

  const description = `${race.date || '오늘'} ${race.track} 제${race.raceNo}경주 ${raceType} 출주표, 배당률, 경주 결과를 확인하세요. ${dataSource} 공식 데이터.`;
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

/**
 * Check if a race is historical (not today)
 */
export function isHistoricalRace(raceDate: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return raceDate < today;
}
