import { redirect } from 'next/navigation';
import Script from 'next/script';
import type { Metadata } from 'next';
import BookPageShell from '@/components/book/BookPageShell';
import BookTopBar from '@/components/book/BookTopBar';
import BookTOC from '@/components/book/BookTOC';
import VenueSection from '@/components/book/VenueSection';
import AdSlot from '@/components/shared/AdSlot';
import ProGate from '@/components/shared/ProGate';
import {
  fetchHorseRaceSchedules,
  fetchCycleRaceSchedules,
  fetchBoatRaceSchedules,
} from '@/lib/api';
import { buildBookViewModel, BookViewMode, VenueVM } from '@/lib/view-models/bookVM';
import { formatDate, getKoreanDate } from '@/lib/utils/date';
import { Race } from '@/types';
import '../../globals.css';
import './print.css';
import { generateSportsEventSchema } from '@/lib/seo';

interface BookPageProps {
  params: { date: string };
  searchParams: { view?: BookViewMode };
}

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const normalizedDate = normalizeDate(params.date);
  const titleDate = normalizedDate ?? formatDate(getKoreanDate());

  return {
    title: `${titleDate} 출전표 · 북모드 - RaceLab`,
    description: `${titleDate} 경마/경륜/경정 출전표와 최근 기록을 한눈에 볼 수 있는 인쇄용 북모드`,
  };
}

function normalizeDate(dateParam: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    return null;
  }
  const parsed = new Date(`${dateParam}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return dateParam;
}

interface FetchResult {
  races: Race[];
  failedTypes: ('horse' | 'cycle' | 'boat')[];
}

async function fetchRacesForDate(rcDate: string): Promise<FetchResult> {
  const failedTypes: ('horse' | 'cycle' | 'boat')[] = [];

  const safeFetch = async (
    fn: (date: string) => Promise<Race[]>,
    type: 'horse' | 'cycle' | 'boat'
  ): Promise<Race[]> => {
    try {
      return await fn(rcDate);
    } catch (error) {
      console.error(`북 모드 ${type} 데이터 수집 실패`, error);
      failedTypes.push(type);
      return [];
    }
  };

  const [horse, cycle, boat] = await Promise.all([
    safeFetch(fetchHorseRaceSchedules, 'horse'),
    safeFetch(fetchCycleRaceSchedules, 'cycle'),
    safeFetch(fetchBoatRaceSchedules, 'boat'),
  ]);

  return {
    races: [...horse, ...cycle, ...boat],
    failedTypes,
  };
}

export default async function BookPage({ params, searchParams }: BookPageProps) {
  const normalizedDate = normalizeDate(params.date);
  const today = formatDate(getKoreanDate());

  if (!normalizedDate) {
    redirect(`/book/${today}`);
  }

  const rcDate = normalizedDate.replace(/-/g, '');
  const { races, failedTypes } = await fetchRacesForDate(rcDate);
  const viewMode: BookViewMode = searchParams.view === 'expert' ? 'expert' : 'compact';

  const viewModel = buildBookViewModel({ date: normalizedDate, races });
  const hasData = viewModel.hasData;
  const hasPartialFailure = failedTypes.length > 0 && failedTypes.length < 3;
  const venuesToRender: VenueVM[] =
    viewModel.venues.length > 0
      ? viewModel.venues
      : [
          { id: 'horse-placeholder', name: '경마장 준비중', type: 'horse', races: [] },
          { id: 'cycle-placeholder', name: '경륜장 준비중', type: 'cycle', races: [] },
          { id: 'boat-placeholder', name: '경정장 준비중', type: 'boat', races: [] },
        ];

  const sportsEventSchemas = viewModel.venues.flatMap((venue) =>
    venue.races.map((race) =>
      generateSportsEventSchema(
        {
          id: race.id,
          type: venue.type,
          raceNo: Number(race.id.split('-')[2] ?? 1),
          track: venue.name,
          date: viewModel.date.replace(/-/g, ''),
          startTime: race.startTime,
          distance: race.distance,
          status: 'upcoming',
        } as Race,
        []
      )
    )
  );

  return (
    <BookPageShell>
      <Script
        id="sports-events-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sportsEventSchemas) }}
      />
      <div className="print-only flex items-center justify-between text-sm text-gray-600">
        <span>RaceLab 북모드</span>
        <span>{viewModel.date}</span>
        <span>생성 {viewModel.updatedAt}</span>
      </div>
      <BookTopBar
        date={normalizedDate}
        viewMode={viewMode}
        freshness={viewModel.freshness}
        updatedAt={viewModel.updatedAt}
      />

      <AdSlot id="book-header" position="book-header" />

      {!hasData && (
        <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <div className="font-semibold">오늘 데이터 수집중</div>
          <div className="text-xs">최근 스냅샷: {viewModel.snapshotAt ?? viewModel.updatedAt}</div>
        </div>
      )}

      {hasPartialFailure && (
        <div className="rounded-xl border border-dashed border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
          <div className="font-semibold">일부 데이터 로드 실패</div>
          <div className="text-xs">
            {failedTypes.map((t) => (t === 'horse' ? '경마' : t === 'cycle' ? '경륜' : '경정')).join(', ')} 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-[280px_1fr]">
        <BookTOC venues={viewModel.venues} />
        <div className="space-y-4">
          {venuesToRender.map((venue) => (
            <VenueSection key={venue.id} venue={venue} viewMode={viewMode} />
          ))}
          <AdSlot id="book-footer" position="book-footer" />
          <ProGate feature="pdf" />
        </div>
      </div>
      <div className="print-only print-footer mt-4 text-center text-xs text-gray-600">
        RaceLab • {viewModel.date} • 생성 {viewModel.updatedAt}
      </div>
    </BookPageShell>
  );
}
