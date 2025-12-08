// src/components/seo/RaceJsonLd.tsx
import Script from 'next/script';

interface Competitor {
  name: string;
  type: 'Horse' | 'Person';
}

interface RaceJsonLdProps {
  name: string;
  startDate: string;
  location: string;
  competitors: Competitor[];
  url: string;
  raceType: 'horse' | 'cycle' | 'boat';
  status?: 'scheduled' | 'live' | 'finished';
  distance?: number;
}

const RaceJsonLd = ({
  name,
  startDate,
  location,
  competitors,
  url,
  raceType,
  status = 'scheduled',
  distance,
}: RaceJsonLdProps) => {
  const raceTypeKorean = raceType === 'horse' ? '경마' : raceType === 'cycle' ? '경륜' : '경정';
  const organizer = raceType === 'horse' ? '한국마사회 (KRA)' : '국민체육진흥공단 (KSPO)';

  const eventStatus = {
    scheduled: 'https://schema.org/EventScheduled',
    live: 'https://schema.org/EventLive',
    finished: 'https://schema.org/EventCompleted',
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name,
    description: distance ? `${raceTypeKorean} ${distance}m 경주` : `${raceTypeKorean} 경주`,
    startDate,
    eventStatus: eventStatus[status],
    location: {
      '@type': 'Place',
      name: location,
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'KR',
      },
    },
    sport: raceTypeKorean,
    competitor: competitors.map((c) => ({
      '@type': c.type === 'Horse' ? 'Horse' : 'Person',
      name: c.name,
    })),
    url,
    organizer: {
      '@type': 'Organization',
      name: organizer,
    },
  };

  return (
    <Script
      id={`race-jsonld-${name.replace(/\s+/g, '-')}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};

export default RaceJsonLd;
