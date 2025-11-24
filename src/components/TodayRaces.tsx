import { getAllRacesToday, getRaceTypeEmoji, formatOdds } from '@/lib/api'
import { Race } from '@/types'
import Link from 'next/link'

export default async function TodayRaces({ filter = 'horse' }: { filter?: string }) {
  const races = await getAllRacesToday()

  // 종목별로 그룹화
  const horseRaces = races.filter(r => r.type === 'horse' && (filter === 'horse' || filter === 'all'))
  const cycleRaces = races.filter(r => r.type === 'cycle' && (filter === 'cycle' || filter === 'all'))
  const boatRaces = races.filter(r => r.type === 'boat' && (filter === 'boat' || filter === 'all'))

  if (races.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-4xl mb-4">🏁</p>
        <p>오늘 예정된 경주가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 경마 */}
      {horseRaces.length > 0 && (
        <RaceSection
          title="🐎 경마"
          races={horseRaces}
          colorClass="text-horse"
          bgClass="bg-green-50"
        />
      )}

      {/* 경륜 */}
      {cycleRaces.length > 0 && (
        <RaceSection
          title="🚴 경륜"
          races={cycleRaces}
          colorClass="text-cycle"
          bgClass="bg-red-50"
        />
      )}

      {/* 경정 */}
      {boatRaces.length > 0 && (
        <RaceSection
          title="🚤 경정"
          races={boatRaces}
          colorClass="text-boat"
          bgClass="bg-blue-50"
        />
      )}
    </div>
  )
}

interface RaceSectionProps {
  title: string
  races: Race[]
  colorClass: string
  bgClass: string
}

function RaceSection({ title, races, colorClass, bgClass }: RaceSectionProps) {
  // 경마장별로 그룹화
  const byTrack = races.reduce((acc, race) => {
    if (!acc[race.track]) acc[race.track] = []
    acc[race.track].push(race)
    return acc
  }, {} as Record<string, Race[]>)

  return (
    <div>
      <h3 className={`font-bold text-lg mb-3 ${colorClass}`}>{title}</h3>

      {Object.entries(byTrack).map(([track, trackRaces]) => (
        <div key={track} className="mb-4">
          <div className={`text-sm font-medium px-3 py-1 rounded-t ${bgClass} ${colorClass}`}>
            📍 {track}
          </div>
          <div className="border border-t-0 border-gray-100 rounded-b overflow-hidden">
            {trackRaces.map((race) => (
              <RaceRow key={race.id} race={race} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function RaceRow({ race }: { race: Race }) {
  const statusColors = {
    upcoming: 'bg-yellow-100 text-yellow-800',
    live: 'bg-red-100 text-red-800 animate-pulse',
    finished: 'bg-gray-100 text-gray-600',
    canceled: 'bg-gray-100 text-gray-400 line-through',
  }

  const statusLabels = {
    upcoming: '예정',
    live: 'LIVE',
    finished: '종료',
    canceled: '취소',
  }

  return (
    <Link
      href={`/race/${race.id}`}
      className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
    >
      <div className="flex items-center space-x-3">
        {/* 경주 번호 */}
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-700">
          {race.raceNo}R
        </div>

        {/* 경주 정보 */}
        <div>
          <div className="font-medium text-gray-900">
            {race.distance}m
            {race.grade && (
              <span className="text-sm text-gray-500 ml-2">{race.grade}</span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            {race.startTime} 발주
            {race.entries.length > 0 && (
              <span className="ml-2">• {race.entries.length}두 출전</span>
            )}
          </div>
        </div>
      </div>

      {/* 상태 배지 */}
      <div className="flex items-center space-x-2">
        <span className={`badge ${statusColors[race.status]}`}>
          {statusLabels[race.status]}
        </span>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}

// 미니 출마표 (배당률 포함)
function MiniEntryTable({ race }: { race: Race }) {
  if (race.entries.length === 0) return null

  return (
    <div className="mt-2 overflow-hidden rounded border border-gray-100">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-2 py-1 text-left">번호</th>
            <th className="px-2 py-1 text-left">마명</th>
            <th className="px-2 py-1 text-left">기수</th>
            <th className="px-2 py-1 text-right">배당</th>
          </tr>
        </thead>
        <tbody>
          {race.entries.slice(0, 5).map((entry) => (
            <tr key={entry.no} className="border-t border-gray-50">
              <td className="px-2 py-1 font-medium">{entry.no}</td>
              <td className="px-2 py-1">{entry.name}</td>
              <td className="px-2 py-1 text-gray-500">{entry.jockey}</td>
              <td className="px-2 py-1 text-right font-medium text-primary">
                {entry.odds ? formatOdds(entry.odds) : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
