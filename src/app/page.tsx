import { Suspense } from 'react'
import Script from 'next/script'
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
        RaceLab 베타 서비스
      </h2>
      <p className="text-white/90 text-sm leading-relaxed">
        경마, 경륜, 경정 정보를 한 곳에서 확인하세요.
        실시간 배당률과 경주 결과를 무료로 제공합니다.
      </p>
    </aside>
  );
}

// GEO 최적화: 경주 종목 안내 섹션
function RaceTypesGuide() {
  return (
    <section aria-labelledby="race-types-heading" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 id="race-types-heading" className="text-xl font-bold text-gray-900 mb-4">
        경마 · 경륜 · 경정이란?
      </h2>
      <p className="text-gray-600 mb-6">
        대한민국에서 합법적으로 운영되는 세 가지 공영 경주 스포츠입니다.
        각 경주는 고유한 특성과 매력을 가지고 있으며, RaceLab에서 모든 정보를 한눈에 확인할 수 있습니다.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        {/* 경마 */}
        <article className="p-4 rounded-lg bg-horse/5 border border-horse/20">
          <h3 className="font-semibold text-horse mb-2 flex items-center gap-2">
            <span aria-hidden="true">🐎</span>
            경마 (Horse Racing)
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            말과 기수가 함께 달리는 경주. 서울(과천), 부산경남, 제주에서 개최됩니다.
          </p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• 주관: 한국마사회 (KRA)</li>
            <li>• 경기장: 서울, 부산경남, 제주</li>
            <li>• 거리: 1,000m ~ 2,000m</li>
          </ul>
        </article>

        {/* 경륜 */}
        <article className="p-4 rounded-lg bg-cycle/5 border border-cycle/20">
          <h3 className="font-semibold text-cycle mb-2 flex items-center gap-2">
            <span aria-hidden="true">🚴</span>
            경륜 (Cycle Racing)
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            사이클 선수들이 경쟁하는 트랙 경주. 광명에서 개최됩니다.
          </p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• 주관: 국민체육진흥공단 (KSPO)</li>
            <li>• 경기장: 광명스피돔</li>
            <li>• 거리: 1,500m ~ 2,400m</li>
          </ul>
        </article>

        {/* 경정 */}
        <article className="p-4 rounded-lg bg-boat/5 border border-boat/20">
          <h3 className="font-semibold text-boat mb-2 flex items-center gap-2">
            <span aria-hidden="true">🚤</span>
            경정 (Boat Racing)
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            모터보트 선수들의 수상 경주. 미사리에서 개최됩니다.
          </p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• 주관: 국민체육진흥공단 (KSPO)</li>
            <li>• 경기장: 미사리경정공원</li>
            <li>• 거리: 600m (3바퀴)</li>
          </ul>
        </article>
      </div>
    </section>
  );
}

// GEO 최적화: 배당률 안내 섹션
function OddsGuideSection() {
  return (
    <section aria-labelledby="odds-guide-heading" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 id="odds-guide-heading" className="text-xl font-bold text-gray-900 mb-4">
        배당률 이해하기
      </h2>
      <p className="text-gray-600 mb-4">
        경주 배당률은 각 출전 선수/마필의 승리 예상 확률을 나타냅니다.
        배당률이 낮을수록 우승 확률이 높다고 예상되며, 높을수록 이변의 가능성을 의미합니다.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">베팅 유형별 설명</caption>
          <thead>
            <tr className="border-b border-gray-200">
              <th scope="col" className="text-left py-2 px-3 font-semibold text-gray-900">베팅 유형</th>
              <th scope="col" className="text-left py-2 px-3 font-semibold text-gray-900">설명</th>
              <th scope="col" className="text-left py-2 px-3 font-semibold text-gray-900">난이도</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="py-2 px-3 font-medium">단승식</td>
              <td className="py-2 px-3 text-gray-600">1위를 정확히 맞추는 방식</td>
              <td className="py-2 px-3"><span className="text-green-600">쉬움</span></td>
            </tr>
            <tr>
              <td className="py-2 px-3 font-medium">복승식</td>
              <td className="py-2 px-3 text-gray-600">1~2위를 순서 상관없이 맞추기</td>
              <td className="py-2 px-3"><span className="text-yellow-600">보통</span></td>
            </tr>
            <tr>
              <td className="py-2 px-3 font-medium">쌍승식</td>
              <td className="py-2 px-3 text-gray-600">1~2위를 순서대로 맞추기</td>
              <td className="py-2 px-3"><span className="text-red-600">어려움</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
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

  // FAQ Schema for AEO optimization
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'KRace는 어떤 서비스인가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'KRace는 한국 경마, 경륜, 경정 정보를 한 곳에서 확인할 수 있는 통합 정보 플랫폼입니다. 실시간 배당률, 출마표, 경주 결과를 무료로 제공합니다.',
        },
      },
      {
        '@type': 'Question',
        name: '경마, 경륜, 경정의 차이는 무엇인가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '경마는 말을 이용한 경주, 경륜은 자전거를 이용한 경주, 경정은 모터보트를 이용한 경주입니다. 모두 한국에서 합법적으로 운영되는 공영 도박입니다.',
        },
      },
      {
        '@type': 'Question',
        name: '배당률은 어떻게 확인하나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '메인 페이지에서 원하는 경주를 선택하면 상세 페이지에서 실시간 배당률을 확인할 수 있습니다. 단승 배당률이 표시되며, 경주 시작 직전까지 업데이트됩니다.',
        },
      },
      {
        '@type': 'Question',
        name: '경주 결과는 언제 확인할 수 있나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '경주가 종료되면 즉시 결과가 업데이트됩니다. 경주 상세 페이지에서 순위, 배당금 등의 정보를 확인할 수 있습니다.',
        },
      },
      {
        '@type': 'Question',
        name: 'KRace는 무료로 이용할 수 있나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '네, KRace의 모든 정보는 무료로 제공됩니다. 회원가입 없이도 모든 경주 정보, 배당률, 결과를 확인할 수 있습니다.',
        },
      },
    ],
  };

  return (
    <>
      {/* FAQ Schema for AEO */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="space-y-6">
        <PageHeader />
        <section aria-label="경주 요약 통계" data-testid="quick-stats">
          <Suspense fallback={<QuickStatsSkeleton />}>
            <QuickStats />
          </Suspense>
        </section>
        <RaceTabs currentTab={currentTab} />
        <AnnouncementBanner />
        <RaceTypesGuide />
        <OddsGuideSection />
      </div>
    </>
  );
}
