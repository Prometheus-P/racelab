import Script from 'next/script';
import Link from 'next/link';
import { RaceType, TodayRacesData, Race } from '@/types';
import {
  getFormattedKoreanDate,
  formatDate,
  getKoreanDate,
  getTodayYYYYMMDD,
} from '@/lib/utils/date';
import { fetchTodayAllRaces } from '@/lib/api';
import { RACE_TYPES } from '@/config/raceTypes';
import { faqSchema, howToSchema } from '../home-components';
import ErrorBanner from '@/components/ErrorBanner';
import type { Metadata } from 'next';

// 경주 종목별 경기장 목록
const TRACKS_BY_TYPE: Record<RaceType, string[]> = {
  horse: ['서울', '부산경남', '제주'],
  cycle: ['광명', '창원'],
  boat: ['미사리'],
};

export const metadata: Metadata = {
  title: '오늘의 경주 | RaceLab',
  description: '오늘 예정된 경마, 경륜, 경정 경주 일정을 확인하세요.',
};

// Build tab-specific styles from centralized RACE_TYPES config
function getTabStyles(type: RaceType) {
  const config = RACE_TYPES[type];
  return {
    icon: config.icon,
    label: config.label,
    activeClass: `${config.color.primary} ${config.color.badge} border-b-2 ${config.color.border}`,
    inactiveHoverClass: `hover:${config.color.primary.replace('text-', 'text-')} hover:${config.color.bg}`,
  };
}

const tabIds: RaceType[] = ['horse', 'cycle', 'boat'];

interface TabLinkProps {
  tabId: RaceType;
  isActive: boolean;
}

function TabLink({ tabId, isActive }: TabLinkProps) {
  const styles = getTabStyles(tabId);

  return (
    <Link
      href={`/races?tab=${tabId}`}
      role="tab"
      id={`tab-${tabId}`}
      aria-selected={isActive}
      aria-controls={`tabpanel-${tabId}`}
      tabIndex={isActive ? 0 : -1}
      className={`flex min-h-[48px] flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary md:text-base ${isActive ? styles.activeClass : `text-gray-500 ${styles.inactiveHoverClass}`} `}
    >
      <span aria-hidden="true">{styles.icon}</span>
      <span>{styles.label}</span>
    </Link>
  );
}

function AnnouncementBanner() {
  return (
    <aside
      aria-label="서비스 안내"
      className="to-secondary rounded-xl bg-gradient-to-r from-primary p-6 text-white shadow-lg"
    >
      <h2 className="mb-2 flex items-center gap-2 text-lg font-bold">
        <span aria-hidden="true">📊</span>
        RaceLab 베타 서비스
      </h2>
      <p className="mb-3 text-sm leading-relaxed text-white/90">
        경마, 경륜, 경정 정보를 한 곳에서 확인하세요. 실시간 배당률과 경주 결과를 무료로 제공합니다.
      </p>
      <Link
        href="/results"
        className="inline-flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/30"
      >
        <span aria-hidden="true">📈</span>
        과거 경주 결과 조회하기
      </Link>
    </aside>
  );
}

function PageHeader() {
  const todayFormatted = getFormattedKoreanDate();
  const todayISO = formatDate(getKoreanDate());

  return (
    <header className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-900">오늘의 경주</h1>
      <time dateTime={todayISO} className="text-sm text-gray-600 md:text-base">
        {todayFormatted}
      </time>
    </header>
  );
}

// Simple stats display component
function StatsRow({ data }: { data: TodayRacesData }) {
  const stats = [
    { type: 'horse' as const, label: '경마', icon: '🏇' },
    { type: 'cycle' as const, label: '경륜', icon: '🚴' },
    { type: 'boat' as const, label: '경정', icon: '🚤' },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map(({ type, label, icon }) => {
        const races = data[type];
        const count = races.length;
        return (
          <div
            key={type}
            className="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm"
          >
            <span className="text-2xl" aria-hidden="true">
              {icon}
            </span>
            <div className="mt-2 text-lg font-bold text-gray-900">{count}</div>
            <div className="text-sm text-gray-500">{label}</div>
          </div>
        );
      })}
    </div>
  );
}

// 경기장 필터 컴포넌트
interface TrackFilterProps {
  type: RaceType;
  currentTrack: string | null;
}

function TrackFilter({ type, currentTrack }: TrackFilterProps) {
  const tracks = TRACKS_BY_TYPE[type];

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <Link
        href={`/races?tab=${type}`}
        className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
          !currentTrack
            ? 'bg-primary text-white'
            : 'bg-[var(--rl-surface-container)] text-[var(--rl-text-secondary)] hover:bg-[var(--rl-surface-container-high)]'
        }`}
      >
        전체
      </Link>
      {tracks.map((track) => (
        <Link
          key={track}
          href={`/races?tab=${type}&track=${encodeURIComponent(track)}`}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            currentTrack === track
              ? 'bg-primary text-white'
              : 'bg-[var(--rl-surface-container)] text-[var(--rl-text-secondary)] hover:bg-[var(--rl-surface-container-high)]'
          }`}
        >
          {track}
        </Link>
      ))}
    </div>
  );
}

// Simple race list component
function RaceList({ races, type, trackFilter }: { races: Race[]; type: RaceType; trackFilter: string | null }) {
  // 경기장 필터 적용
  const filteredRaces = trackFilter
    ? races.filter((race) => race.track === trackFilter || race.track?.includes(trackFilter))
    : races;

  if (filteredRaces.length === 0) {
    const typeLabel = type === 'horse' ? '경마' : type === 'cycle' ? '경륜' : '경정';
    const filterMessage = trackFilter ? ` (${trackFilter})` : '';
    return (
      <div className="py-8 text-center text-gray-500 dark:text-gray-400">
        오늘 예정된 {typeLabel}{filterMessage} 경주가 없습니다
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100 dark:divide-gray-700">
      {filteredRaces.map((race) => (
        <li key={race.id}>
          <Link
            href={`/race/${race.id}`}
            className="flex items-center justify-between py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {race.track} 제{race.raceNo}경주
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{race.distance}m</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              race.status === 'finished'
                ? 'bg-[var(--rl-surface-container)] text-[var(--rl-text-secondary)]'
                : 'bg-status-info-bg text-status-info-text'
            }`}>
              {race.status === 'finished' ? '종료' : '예정'}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

interface RaceTabsProps {
  currentTab: RaceType;
  currentTrack: string | null;
  data: TodayRacesData;
}

function RaceTabs({ currentTab, currentTrack, data }: RaceTabsProps) {
  return (
    <section
      data-testid="today-races"
      className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-[var(--rl-surface)]"
    >
      <div role="tablist" aria-label="경주 종목 선택" className="flex border-b border-gray-100 dark:border-gray-700">
        {tabIds.map((tabId) => (
          <TabLink key={tabId} tabId={tabId} isActive={currentTab === tabId} />
        ))}
      </div>
      <div
        role="tabpanel"
        id={`tabpanel-${currentTab}`}
        aria-labelledby={`tab-${currentTab}`}
        tabIndex={0}
        className="p-4 focus:outline-none"
      >
        <TrackFilter type={currentTab} currentTrack={currentTrack} />
        <RaceList races={data[currentTab]} type={currentTab} trackFilter={currentTrack} />
      </div>
    </section>
  );
}

function JsonLdScripts() {
  return (
    <>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id="howto-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
    </>
  );
}

export default async function RacesPage({
  searchParams,
}: {
  searchParams: { tab?: string; track?: string };
}) {
  const currentTab = (searchParams.tab as RaceType) || 'horse';
  const currentTrack = searchParams.track ? decodeURIComponent(searchParams.track) : null;

  // Fetch all race data once at the server component level
  const rcDate = getTodayYYYYMMDD();
  const allRaces = await fetchTodayAllRaces(rcDate);

  // Check if any race type has an error
  const hasError =
    allRaces.status.horse === 'UPSTREAM_ERROR' ||
    allRaces.status.cycle === 'UPSTREAM_ERROR' ||
    allRaces.status.boat === 'UPSTREAM_ERROR';

  return (
    <>
      <JsonLdScripts />

      <div className="space-y-6">
        <PageHeader />
        <ErrorBanner
          show={hasError}
          message="일부 데이터 제공 시스템 지연으로 최신 정보가 표시되지 않을 수 있습니다"
        />
        <section aria-label="경주 요약 통계" data-testid="quick-stats">
          <StatsRow data={allRaces} />
        </section>
        <RaceTabs currentTab={currentTab} currentTrack={currentTrack} data={allRaces} />
        <AnnouncementBanner />
      </div>
    </>
  );
}
