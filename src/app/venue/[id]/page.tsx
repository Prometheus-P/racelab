import { Metadata } from 'next';
import Script from 'next/script';
import VenueSection from '@/components/book/VenueSection';
import BookPageShell from '@/components/book/BookPageShell';
import ProGate from '@/components/shared/ProGate';
import { buildBookViewModel, BookViewMode } from '@/lib/view-models/bookVM';
import { fetchBoatRaceSchedules, fetchCycleRaceSchedules, fetchHorseRaceSchedules } from '@/lib/api';
import { formatDate, getKoreanDate } from '@/lib/utils/date';
import { Race } from '@/types';

interface Props {
  params: { id: string };
  searchParams?: { date?: string; view?: BookViewMode };
}

const fetchRaces = async (date: string): Promise<Race[]> => {
  const safe = async (fn: (d: string) => Promise<Race[]>) => {
    try {
      return await fn(date);
    } catch (error) {
      console.error('venue fetch 실패', error);
      return [];
    }
  };

  const [horse, cycle, boat] = await Promise.all([
    safe(fetchHorseRaceSchedules),
    safe(fetchCycleRaceSchedules),
    safe(fetchBoatRaceSchedules),
  ]);
  return [...horse, ...cycle, ...boat];
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const date = searchParams?.date ?? formatDate(getKoreanDate());
  return {
    title: `${params.id} ${date} 편성/출전표 - RaceLab`,
    description: `${params.id} ${date} 경주 편성, 출전표, 최신 스냅샷을 제공합니다.`,
  };
}

export default async function VenuePage({ params, searchParams }: Props) {
  const date = searchParams?.date ?? formatDate(getKoreanDate());
  const rcDate = date.replace(/-/g, '');
  const races = await fetchRaces(rcDate);
  const viewModel = buildBookViewModel({ date, races });
  const viewMode: BookViewMode = searchParams?.view === 'expert' ? 'expert' : 'compact';
  const venueVM = viewModel.venues.find((venue) => venue.name === params.id || venue.id === params.id);
  const selectedVenue =
    venueVM ??
    ({
      id: params.id,
      name: params.id,
      type: 'horse',
      races: [],
    } as const);

  const placeSchema = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: params.id,
    description: `${params.id} 경주장 편성 정보`,
  };

  return (
    <BookPageShell>
      <Script id="venue-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(placeSchema) }} />
      <VenueSection venue={selectedVenue} viewMode={viewMode} />
      <ProGate feature="pdf" />
    </BookPageShell>
  );
}
