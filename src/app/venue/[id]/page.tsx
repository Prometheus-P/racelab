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

interface FetchResult {
  races: Race[];
  failedTypes: ('horse' | 'cycle' | 'boat')[];
}

const fetchRaces = async (date: string): Promise<FetchResult> => {
  const failedTypes: ('horse' | 'cycle' | 'boat')[] = [];

  const safe = async (
    fn: (d: string) => Promise<Race[]>,
    type: 'horse' | 'cycle' | 'boat'
  ): Promise<Race[]> => {
    try {
      return await fn(date);
    } catch (error) {
      console.error(`venue ${type} fetch 실패`, error);
      failedTypes.push(type);
      return [];
    }
  };

  const [horse, cycle, boat] = await Promise.all([
    safe(fetchHorseRaceSchedules, 'horse'),
    safe(fetchCycleRaceSchedules, 'cycle'),
    safe(fetchBoatRaceSchedules, 'boat'),
  ]);

  return {
    races: [...horse, ...cycle, ...boat],
    failedTypes,
  };
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
  const { races, failedTypes } = await fetchRaces(rcDate);
  const viewModel = buildBookViewModel({ date, races });
  const hasPartialFailure = failedTypes.length > 0 && failedTypes.length < 3;
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
      {hasPartialFailure && (
        <div className="mb-4 rounded-xl border border-dashed border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
          <div className="font-semibold">일부 데이터 로드 실패</div>
          <div className="text-xs">
            {failedTypes.map((t) => (t === 'horse' ? '경마' : t === 'cycle' ? '경륜' : '경정')).join(', ')} 데이터를 불러오지 못했습니다.
          </div>
        </div>
      )}
      <VenueSection venue={selectedVenue} viewMode={viewMode} />
      <ProGate feature="pdf" />
    </BookPageShell>
  );
}
