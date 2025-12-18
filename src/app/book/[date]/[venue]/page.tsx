import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import BookPageShell from '@/components/book/BookPageShell';
import VenueSection from '@/components/book/VenueSection';
import BookTopBar from '@/components/book/BookTopBar';
import { buildBookViewModel, BookViewMode } from '@/lib/view-models/bookVM';
import { fetchBoatRaceSchedules, fetchCycleRaceSchedules, fetchHorseRaceSchedules } from '@/lib/api';
import { formatDate, getKoreanDate } from '@/lib/utils/date';
import { Race } from '@/types';

interface Props {
  params: { date: string; venue: string };
  searchParams: { view?: BookViewMode };
}

const normalizeDate = (dateParam: string): string | null => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) return null;
  const parsed = new Date(`${dateParam}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : dateParam;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const normalizedDate = normalizeDate(params.date) ?? formatDate(getKoreanDate());
  return {
    title: `${params.venue} ${normalizedDate} 출전표 - 북모드`,
    description: `${normalizedDate} ${params.venue} 출전표/편성 정보를 한눈에 제공합니다.`,
  };
}

async function fetchRaces(date: string): Promise<Race[]> {
  const safe = async (fn: (d: string) => Promise<Race[]>) => {
    try {
      return await fn(date);
    } catch (error) {
      console.error('북 모드 venue fetch 실패', error);
      return [];
    }
  };

  const [horse, cycle, boat] = await Promise.all([
    safe(fetchHorseRaceSchedules),
    safe(fetchCycleRaceSchedules),
    safe(fetchBoatRaceSchedules),
  ]);
  return [...horse, ...cycle, ...boat];
}

export default async function BookVenuePage({ params, searchParams }: Props) {
  const normalizedDate = normalizeDate(params.date);
  const today = formatDate(getKoreanDate());
  if (!normalizedDate) {
    redirect(`/book/${today}/${params.venue}`);
  }

  const rcDate = normalizedDate.replace(/-/g, '');
  const races = await fetchRaces(rcDate);
  const viewModel = buildBookViewModel({ date: normalizedDate, races });
  const viewMode: BookViewMode = searchParams.view === 'expert' ? 'expert' : 'compact';

  const venueVM = viewModel.venues.find((venue) => venue.name === params.venue || venue.id === params.venue);
  const selectedVenue = venueVM ?? {
    id: params.venue,
    name: params.venue,
    type: 'horse' as const,
    races: [],
  };

  return (
    <BookPageShell>
      <BookTopBar
        date={normalizedDate}
        viewMode={viewMode}
        freshness={viewModel.freshness}
        updatedAt={viewModel.updatedAt}
      />
      <VenueSection venue={selectedVenue} viewMode={viewMode} />
    </BookPageShell>
  );
}
