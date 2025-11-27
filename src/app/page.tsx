import { Suspense } from 'react'
import TodayRaces from '@/components/TodayRaces'
import QuickStats from '@/components/QuickStats'
import Link from 'next/link'
import { RaceType } from '@/types'
import { QuickStatsSkeleton, RaceListSkeleton } from '@/components/Skeletons'

// Tab configuration for consistent styling and accessibility
const tabConfig: Record<RaceType, {
  icon: string;
  label: string;
  activeClass: string;
  inactiveHoverClass: string;
}> = {
  horse: {
    icon: '🐎',
    label: '경마',
    activeClass: 'text-horse bg-horse/10 border-b-2 border-horse',
    inactiveHoverClass: 'hover:text-horse hover:bg-horse/5',
  },
  cycle: {
    icon: '🚴',
    label: '경륜',
    activeClass: 'text-cycle bg-cycle/10 border-b-2 border-cycle',
    inactiveHoverClass: 'hover:text-cycle hover:bg-cycle/5',
  },
  boat: {
    icon: '🚤',
    label: '경정',
    activeClass: 'text-boat bg-boat/10 border-b-2 border-boat',
    inactiveHoverClass: 'hover:text-boat hover:bg-boat/5',
  },
}

const tabIds = ['horse', 'cycle', 'boat'] as const

interface TabLinkProps {
  tabId: RaceType;
  isActive: boolean;
}

function TabLink({ tabId, isActive }: TabLinkProps) {
  const config = tabConfig[tabId];

  return (
    <Link
      href={`/?tab=${tabId}`}
      role="tab"
      id={`tab-${tabId}`}
      aria-selected={isActive}
      aria-controls={`tabpanel-${tabId}`}
      tabIndex={isActive ? 0 : -1}
      className={`
        flex-1 min-h-[48px] py-3 px-4
        flex items-center justify-center gap-2
        font-medium text-sm md:text-base
        transition-all duration-150 ease-out
        focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary
        ${isActive ? config.activeClass : `text-gray-500 ${config.inactiveHoverClass}`}
      `}
    >
      <span aria-hidden="true">{config.icon}</span>
      <span>{config.label}</span>
    </Link>
  );
}

function AnnouncementBanner() {
  return (
    <aside
      aria-label="서비스 안내"
      className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 text-white shadow-lg"
    >
      <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
        <span aria-hidden="true">📊</span>
        KRace 베타 서비스
      </h2>
      <p className="text-white/90 text-sm leading-relaxed">
        경마, 경륜, 경정 정보를 한 곳에서 확인하세요.
        실시간 배당률과 경주 결과를 무료로 제공합니다.
      </p>
    </aside>
  );
}

function PageHeader() {
  const now = new Date();
  const todayFormatted = now.toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
  });
  const todayISO = now.toISOString().split('T')[0];

  return (
    <header className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-900">오늘의 경주</h1>
      <time dateTime={todayISO} className="text-gray-600 text-sm md:text-base">
        {todayFormatted}
      </time>
    </header>
  );
}

interface RaceTabsProps {
  currentTab: RaceType;
}

function RaceTabs({ currentTab }: RaceTabsProps) {
  return (
    <section
      data-testid="today-races"
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
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
        <Suspense key={currentTab} fallback={<RaceListSkeleton />}>
          <TodayRaces filter={currentTab} />
        </Suspense>
      </div>
    </section>
  );
}

export default function Home({ searchParams }: { searchParams: { tab?: string } }) {
  const currentTab = (searchParams.tab as RaceType) || 'horse';

  return (
    <div className="space-y-6">
      <PageHeader />
      <section aria-label="경주 요약 통계" data-testid="quick-stats">
        <Suspense fallback={<QuickStatsSkeleton />}>
          <QuickStats />
        </Suspense>
      </section>
      <RaceTabs currentTab={currentTab} />
      <AnnouncementBanner />
    </div>
  );
}
