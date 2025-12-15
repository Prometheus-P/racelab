import Script from 'next/script';
import TodayRaces from '@/components/TodayRaces';
import QuickStats from '@/components/QuickStats';
import Link from 'next/link';
import { RaceType, TodayRacesData } from '@/types';
import { getFormattedKoreanDate, formatDate, getKoreanDate, getTodayYYYYMMDD } from '@/lib/utils/date';
import { fetchTodayAllRaces } from '@/lib/api';
import { RACE_TYPES } from '@/config/raceTypes';
import {
  RaceTypesGuide,
  OddsGuideSection,
  TrackGuideSection,
  BeginnerGuideSection,
  faqSchema,
  howToSchema,
} from './home-components';
import ErrorBanner from '@/components/ErrorBanner';

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
      href={`/?tab=${tabId}`}
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

interface RaceTabsProps {
  currentTab: RaceType;
  data: TodayRacesData;
}

function RaceTabs({ currentTab, data }: RaceTabsProps) {
  return (
    <section
      data-testid="today-races"
      className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
    >
      <div role="tablist" aria-label="경주 종목 선택" className="flex border-b border-gray-100">
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
        <TodayRaces data={data} filter={currentTab} />
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

export default async function Home({ searchParams }: { searchParams: { tab?: string } }) {
  const currentTab = (searchParams.tab as RaceType) || 'horse';

  // Fetch all race data once at the server component level
  // This reduces API calls from 6 to 3 (was: TodayRaces 3 + QuickStats 3)
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
          <QuickStats data={allRaces} />
        </section>
        <RaceTabs currentTab={currentTab} data={allRaces} />
        <AnnouncementBanner />
        <RaceTypesGuide />
        <OddsGuideSection />
        <TrackGuideSection />
        <BeginnerGuideSection />
      </div>
    </>
  );
}
