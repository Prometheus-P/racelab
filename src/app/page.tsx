import { Suspense } from 'react'
import TodayRaces from '@/components/TodayRaces'
import QuickStats from '@/components/QuickStats'
import Link from 'next/link'

export default function Home({
  searchParams,
}: {
  searchParams: { tab?: string }
}) {
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })

  const currentTab = searchParams.tab || 'horse'

  return (
    <div className="space-y-6">
      {/* 오늘 날짜 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          오늘의 경주
        </h1>
        <span className="text-gray-500">{today}</span>
      </div>

      {/* 빠른 요약 */}
      <Suspense fallback={<QuickStatsSkeleton />}>
        {/* @ts-expect-error Server Component */}
        <QuickStats />
      </Suspense>

      {/* 종목별 탭 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        {/* 탭 헤더 */}
        <div className="flex border-b border-gray-100">
          <Link
            href="/?tab=horse"
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${currentTab === 'horse'
                ? 'text-horse bg-green-50 border-b-2 border-horse'
                : 'text-gray-500 hover:text-horse hover:bg-green-50'
              }`}
          >
            🐎 경마
          </Link>
          <Link
            href="/?tab=cycle"
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${currentTab === 'cycle'
                ? 'text-cycle bg-red-50 border-b-2 border-cycle'
                : 'text-gray-500 hover:text-cycle hover:bg-red-50'
              }`}
          >
            🚴 경륜
          </Link>
          <Link
            href="/?tab=boat"
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${currentTab === 'boat'
                ? 'text-boat bg-blue-50 border-b-2 border-boat'
                : 'text-gray-500 hover:text-boat hover:bg-blue-50'
              }`}
          >
            🚤 경정
          </Link>
        </div>

        {/* 경주 목록 */}
        <div className="p-4">
          <Suspense key={currentTab} fallback={<RaceListSkeleton />}>
            {/* @ts-expect-error Server Component */}
            <TodayRaces filter={currentTab} />
          </Suspense>
        </div>
      </div>

      {/* 안내 배너 */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-6 text-white">
        <h2 className="text-lg font-bold mb-2">📊 KRace 베타 서비스</h2>
        <p className="text-white/90 text-sm">
          경마, 경륜, 경정 정보를 한 곳에서 확인하세요.
          실시간 배당률과 경주 결과를 무료로 제공합니다.
        </p>
      </div>
    </div>
  )
}

// 스켈레톤 컴포넌트
function QuickStatsSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>
      ))}
    </div>
  )
}

function RaceListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center space-x-4 p-3 bg-gray-50 rounded animate-pulse">
          <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
      ))}
    </div>
  )
}
