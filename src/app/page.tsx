import { Suspense } from 'react'
import TodayRaces from '@/components/TodayRaces'
import QuickStats from '@/components/QuickStats'
import Link from 'next/link'
import { RaceType } from '@/types'

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

export default function Home({
  searchParams,
}: {
  searchParams: { tab?: string }
}) {
  const now = new Date()
  const todayFormatted = now.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
  const todayISO = now.toISOString().split('T')[0]

  const currentTab = (searchParams.tab as RaceType) || 'horse'
  const tabIds = ['horse', 'cycle', 'boat'] as const

  return (
    <div className="space-y-6">
      {/* Page header with date */}
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          오늘의 경주
        </h1>
        <time
          dateTime={todayISO}
          className="text-gray-600 text-sm md:text-base"
        >
          {todayFormatted}
        </time>
      </header>

      {/* Quick stats summary */}
      <section aria-label="경주 요약 통계" data-testid="quick-stats">
        <Suspense fallback={<QuickStatsSkeleton />}>
          <QuickStats />
        </Suspense>
      </section>

      {/* Race type tabs */}
      <section
        data-testid="today-races"
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
      >
        {/* Tab list */}
        <div
          role="tablist"
          aria-label="경주 종목 선택"
          className="flex border-b border-gray-100"
        >
          {tabIds.map((tabId) => {
            const config = tabConfig[tabId]
            const isActive = currentTab === tabId

            return (
              <Link
                key={tabId}
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
                  ${isActive
                    ? config.activeClass
                    : `text-gray-500 ${config.inactiveHoverClass}`
                  }
                `}
              >
                <span aria-hidden="true">{config.icon}</span>
                <span>{config.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Tab panel */}
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

      {/* Announcement banner */}
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
    </div>
  )
}

// Skeleton components with proper structure
function QuickStatsSkeleton() {
  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
      aria-label="통계 로딩 중"
      role="status"
    >
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white p-4 rounded-xl border border-gray-100 animate-pulse"
        >
          <div className="h-4 bg-gray-200 rounded w-16 mb-3" />
          <div className="h-8 bg-gray-200 rounded w-20" />
        </div>
      ))}
      <span className="sr-only">통계 정보를 불러오는 중입니다</span>
    </div>
  )
}

function RaceListSkeleton() {
  return (
    <div
      className="space-y-3"
      aria-label="경주 목록 로딩 중"
      role="status"
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg animate-pulse"
        >
          <div className="h-10 w-10 bg-gray-200 rounded-full flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-48" />
          </div>
          <div className="h-6 bg-gray-200 rounded w-16 flex-shrink-0" />
        </div>
      ))}
      <span className="sr-only">경주 목록을 불러오는 중입니다</span>
    </div>
  )
}
