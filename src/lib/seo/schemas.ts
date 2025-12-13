// src/lib/seo/schemas.ts
// JSON-LD schema builders for SEO optimization

import { Race, RaceResult } from '@/types';
import { buildRaceStartDateTime } from '@/lib/utils/date';
import { getSiteUrl } from './siteUrl';

const BASE_URL = getSiteUrl();

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

export interface SportsEventSchema {
  '@context': string;
  '@type': string;
  '@id': string;
  name: string;
  description: string;
  startDate: string;
  eventStatus: string;
  location: {
    '@type': string;
    name: string;
    address: {
      '@type': string;
      addressCountry: string;
    };
  };
  organizer: {
    '@type': string;
    name: string;
    url: string;
  };
  sport: string;
  competitor: Array<{
    '@type': string;
    name: string;
    athlete?: {
      '@type': string;
      name: string;
    };
  }>;
  url: string;
  subEvent?: Array<{
    '@type': string;
    name: string;
    description: string;
  }>;
}

export interface FAQSchema {
  '@context': string;
  '@type': string;
  mainEntity: Array<{
    '@type': string;
    name: string;
    acceptedAnswer: {
      '@type': string;
      text: string;
    };
  }>;
}

export interface BreadcrumbListSchema {
  '@context': string;
  '@type': string;
  itemListElement: Array<{
    '@type': string;
    position: number;
    name: string;
    item: string;
  }>;
}

/**
 * Generate SportsEvent JSON-LD schema for race pages
 */
export function generateSportsEventSchema(
  race: Race,
  results?: RaceResult[]
): SportsEventSchema {
  const schema: SportsEventSchema = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    '@id': `${BASE_URL}/race/${race.id}#event`,
    name: `${race.track} 제${race.raceNo}경주`,
    description: race.distance
      ? `${RACE_TYPE_KO[race.type]} ${race.distance}m 경주`
      : `${RACE_TYPE_KO[race.type]} 경주`,
    startDate: buildRaceStartDateTime(race.date, race.startTime),
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
  };

  if (results && results.length > 0) {
    schema.subEvent = results.slice(0, 3).map((r, idx) => ({
      '@type': 'Event',
      name: `${idx + 1}착`,
      description: `${r.name} (배당률: ${r.odds || '-'}배)`,
    }));
  }

  return schema;
}

/**
 * Generate FAQPage JSON-LD schema for guide pages
 */
export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>
): FAQSchema {
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

/**
 * Generate BreadcrumbList JSON-LD schema for navigation (FR-008)
 */
export function generateBreadcrumbListSchema(
  items: Array<{ name: string; url: string }>
): BreadcrumbListSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}
