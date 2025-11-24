import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getRaceTypeEmoji, formatOdds } from '@/lib/api'
import { Race, Entry } from '@/types'

// 더미 데이터 (API 연동 전)
async function getRaceById(id: string): Promise<Race | null> {
  // TODO: 실제 API 연동
  const dummyRace: Race = {
    id,
    type: id.startsWith('horse') ? 'horse' : id.startsWith('cycle') ? 'cycle' : 'boat',
    raceNo: 1,
    track: '서울',
    startTime: '12:00',
    distance: 1400,
    grade: '국산4등급',
    status: 'upcoming',
    entries: [
      { no: 1, name: '번개', jockey: '김기수', trainer: '박조교', age: 4, weight: 54, odds: 2.3, recentRecord: '1-2-1-3-1' },
      { no: 2, name: '청풍', jockey: '이기수', trainer: '최조교', age: 5, weight: 55, odds: 4.1, recentRecord: '3-1-2-4-2' },
      { no: 3, name: '바람돌이', jockey: '박기수', trainer: '김조교', age: 4, weight: 53, odds: 6.8, recentRecord: '2-4-3-1-5' },
      { no: 4, name: '천둥', jockey: '정기수', trainer: '이조교', age: 6, weight: 56, odds: 8.5, recentRecord: '5-3-4-2-3' },
      { no: 5, name: '불꽃', jockey: '강기수', trainer: '정조교', age: 3, weight: 52, odds: 12.0, recentRecord: '4-6-5-3-4' },
      { no: 6, name: '질주', jockey: '윤기수', trainer: '강조교', age: 5, weight: 54, odds: 15.5, recentRecord: '6-5-6-6-6' },
      { no: 7, name: '태풍', jockey: '최기수', trainer: '윤조교', age: 4, weight: 53, odds: 22.0, recentRecord: '7-7-4-5-7' },
      { no: 8, name: '승리', jockey: '한기수', trainer: '한조교', age: 5, weight: 55, odds: 35.0, recentRecord: '8-8-7-8-8' },
    ],
  }
  
  return dummyRace
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const race = await getRaceById(params.id)
  
  if (!race) {
    return { title: '경주를 찾을 수 없습니다' }
  }
  
  const typeLabel = race.type === 'horse' ? '경마' : race.type === 'cycle' ? '경륜' : '경정'
  
  return {
    title: `${race.track} ${race.raceNo}R - ${typeLabel} 출마표`,
    description: `${race.track} ${race.raceNo}경주 출마표와 배당률. ${race.distance}m ${race.grade || ''}`,
  }
}

export default async function RacePage({ params }: { params: { id: string } }) {
  const race = await getRaceById(params.id)
  
  if (!race) {
    notFound()
  }
  
  const typeColors = {
    horse: 'text-horse bg-green-50 border-horse',
    cycle: 'text-cycle bg-red-50 border-cycle',
    boat: 'text-boat bg-blue-50 border-boat',
  }
  
  const typeLabels = {
    horse: '경마',
    cycle: '경륜',
    boat: '경정',
  }
  
  return (
    <div className="space-y-6">
      {/* 뒤로가기 */}
      <a href="/" className="inline-flex items-center text-gray-500 hover:text-gray-700">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        돌아가기
      </a>
      
      {/* 경주 헤더 */}
      <div className={`card border-l-4 ${typeColors[race.type]}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">{getRaceTypeEmoji(race.type)}</span>
              <h1 className="text-2xl font-bold text-gray-900">
                {race.track} {race.raceNo}R
              </h1>
              <span className={`badge badge-${race.type}`}>
                {typeLabels[race.type]}
              </span>
            </div>
            <p className="text-gray-500 mt-1">
              {race.distance}m • {race.grade} • {race.startTime} 발주
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500">마감까지</div>
            <div className="text-xl font-bold text-primary">15:30</div>
          </div>
        </div>
      </div>
      
      {/* 출마표 */}
      <div className="card">
        <h2 className="text-lg font-bold text-gray-900 mb-4">📋 출마표</h2>
        
        <div className="overflow-x-auto">
          <table className="table-race">
            <thead>
              <tr>
                <th className="w-12">번호</th>
                <th>마명</th>
                <th>기수</th>
                <th>조교사</th>
                <th className="text-center">연령</th>
                <th className="text-center">부담중량</th>
                <th className="text-center">최근5주</th>
                <th className="text-right">단승배당</th>
              </tr>
            </thead>
            <tbody>
              {race.entries.map((entry, index) => (
                <EntryRow key={entry.no} entry={entry} rank={index + 1} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* 배당률 차트 */}
      <div className="card">
        <h2 className="text-lg font-bold text-gray-900 mb-4">📊 배당률 분포</h2>
        <OddsChart entries={race.entries} />
      </div>
      
      {/* 안내 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          ⚠️ 배당률은 실시간 변동됩니다. 정확한 정보는 
          <a href="https://race.kra.co.kr" target="_blank" rel="noopener" className="underline ml-1">
            한국마사회 공식 사이트
          </a>를 확인하세요.
        </p>
      </div>
    </div>
  )
}

function EntryRow({ entry, rank }: { entry: Entry; rank: number }) {
  // 배당률 기준 상위 3마리 하이라이트
  const isTopOdds = rank <= 3
  
  return (
    <tr className={isTopOdds ? 'bg-yellow-50' : ''}>
      <td>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white
          ${rank === 1 ? 'bg-yellow-500' : rank === 2 ? 'bg-gray-400' : rank === 3 ? 'bg-amber-600' : 'bg-gray-300'}`}>
          {entry.no}
        </div>
      </td>
      <td className="font-medium">{entry.name}</td>
      <td>{entry.jockey}</td>
      <td className="text-gray-500">{entry.trainer}</td>
      <td className="text-center">{entry.age}세</td>
      <td className="text-center">{entry.weight}kg</td>
      <td className="text-center font-mono text-sm">{entry.recentRecord}</td>
      <td className="text-right">
        <span className={`odds ${isTopOdds ? 'text-primary' : ''}`}>
          {entry.odds ? formatOdds(entry.odds) : '-'}
        </span>
      </td>
    </tr>
  )
}

function OddsChart({ entries }: { entries: Entry[] }) {
  const maxOdds = Math.max(...entries.map(e => e.odds || 0))
  
  return (
    <div className="space-y-2">
      {entries.map((entry) => {
        const width = ((entry.odds || 0) / maxOdds) * 100
        const barColor = 
          entry.odds && entry.odds < 5 ? 'bg-green-500' :
          entry.odds && entry.odds < 10 ? 'bg-yellow-500' :
          'bg-gray-400'
        
        return (
          <div key={entry.no} className="flex items-center space-x-3">
            <div className="w-8 text-sm font-medium text-gray-600">{entry.no}번</div>
            <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
              <div 
                className={`h-full ${barColor} transition-all duration-500`}
                style={{ width: `${Math.max(width, 5)}%` }}
              />
            </div>
            <div className="w-16 text-right text-sm font-medium">
              {entry.odds ? formatOdds(entry.odds) : '-'}배
            </div>
          </div>
        )
      })}
    </div>
  )
}
