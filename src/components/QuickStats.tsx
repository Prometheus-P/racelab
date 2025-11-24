import { getTodayStats } from '@/lib/api'

export default async function QuickStats() {
  const stats = await getTodayStats()
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* 전체 경주 */}
      <div className="card">
        <div className="text-sm text-gray-500 mb-1">오늘 전체</div>
        <div className="text-2xl font-bold text-gray-900">
          {stats.totalRaces}경주
        </div>
      </div>
      
      {/* 경마 */}
      <div className="card border-l-4 border-horse">
        <div className="text-sm text-gray-500 mb-1">🐎 경마</div>
        <div className="text-2xl font-bold text-horse">
          {stats.horseRaces}경주
        </div>
      </div>
      
      {/* 경륜 */}
      <div className="card border-l-4 border-cycle">
        <div className="text-sm text-gray-500 mb-1">🚴 경륜</div>
        <div className="text-2xl font-bold text-cycle">
          {stats.cycleRaces}경주
        </div>
      </div>
      
      {/* 경정 */}
      <div className="card border-l-4 border-boat">
        <div className="text-sm text-gray-500 mb-1">🚤 경정</div>
        <div className="text-2xl font-bold text-boat">
          {stats.boatRaces}경주
        </div>
      </div>
    </div>
  )
}
