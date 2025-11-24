import { Race, Entry, DailyStats, KRAApiResponse } from '@/types'

// 환경변수에서 API 키 가져오기
const KRA_API_KEY = process.env.KRA_API_KEY || ''
const KSPO_API_KEY = process.env.KSPO_API_KEY || ''

const API_BASE = {
  kra: 'http://apis.data.go.kr/B551015',      // 한국마사회
  kspo: 'http://apis.data.go.kr/B551014',     // 국민체육진흥공단
}

// API 호출 공통 함수
async function fetchApi<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url, {
      next: { revalidate: 60 }, // 1분 캐시
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('API Fetch Error:', error)
    throw error
  }
}

// ============ 경마 API ============

// 오늘 경마 일정 조회
export async function getHorseRacesToday(): Promise<Race[]> {
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')

  // API 키가 없으면 더미 데이터 반환 (개발용)
  if (!KRA_API_KEY) {
    return getDummyHorseRaces()
  }

  const url = `${API_BASE.kra}/API214_17/raceHorse_1?serviceKey=${KRA_API_KEY}&numOfRows=50&pageNo=1&rc_date=${dateStr}&_type=json`

  try {
    const data = await fetchApi<KRAApiResponse>(url)
    return parseHorseRaces(data)
  } catch {
    return getDummyHorseRaces()
  }
}

// 출마표 조회
export async function getHorseEntries(meet: number, raceNo: number, date: string): Promise<Entry[]> {
  if (!KRA_API_KEY) {
    return getDummyEntries()
  }

  const url = `${API_BASE.kra}/API214_17/raceHorse_2?serviceKey=${KRA_API_KEY}&numOfRows=20&pageNo=1&meet=${meet}&rc_no=${raceNo}&rc_date=${date}&_type=json`

  try {
    const data = await fetchApi<KRAApiResponse>(url)
    return parseEntries(data)
  } catch {
    return getDummyEntries()
  }
}

// ============ 경륜 API ============

export async function getCycleRacesToday(): Promise<Race[]> {
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')

  if (!KSPO_API_KEY) {
    return getDummyCycleRaces()
  }

  // 경륜: API214_03 (경주결과) or API214_01 (출주표)
  // 여기서는 출주표(API214_01) 사용 가정
  const url = `${API_BASE.kspo}/API214_01/raceCycle_1?serviceKey=${KSPO_API_KEY}&numOfRows=50&pageNo=1&rc_date=${dateStr}&_type=json`

  try {
    const data = await fetchApi<KRAApiResponse>(url)
    return parseCycleRaces(data)
  } catch {
    return getDummyCycleRaces()
  }
}

// ============ 경정 API ============

export async function getBoatRacesToday(): Promise<Race[]> {
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')

  if (!KSPO_API_KEY) {
    return getDummyBoatRaces()
  }

  // 경정: API214_02 (출주표)
  const url = `${API_BASE.kspo}/API214_02/raceBoat_1?serviceKey=${KSPO_API_KEY}&numOfRows=50&pageNo=1&rc_date=${dateStr}&_type=json`

  try {
    const data = await fetchApi<KRAApiResponse>(url)
    return parseBoatRaces(data)
  } catch {
    return getDummyBoatRaces()
  }
}

// ============ 통합 함수 ============

export async function getTodayStats(): Promise<DailyStats> {
  const [horses, cycles, boats] = await Promise.all([
    getHorseRacesToday(),
    getCycleRacesToday(),
    getBoatRacesToday(),
  ])

  const allRaces = [...horses, ...cycles, ...boats].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  )

  const now = new Date()
  const currentTime = now.toTimeString().slice(0, 5)
  const nextRace = allRaces.find(r => r.startTime > currentTime && r.status === 'upcoming')

  return {
    totalRaces: allRaces.length,
    horseRaces: horses.length,
    cycleRaces: cycles.length,
    boatRaces: boats.length,
    nextRace: nextRace ? {
      type: nextRace.type,
      track: nextRace.track,
      time: nextRace.startTime,
      raceNo: nextRace.raceNo,
    } : undefined,
  }
}

export async function getAllRacesToday(): Promise<Race[]> {
  const [horses, cycles, boats] = await Promise.all([
    getHorseRacesToday(),
    getCycleRacesToday(),
    getBoatRacesToday(),
  ])

  return [...horses, ...cycles, ...boats].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  )
}

// ============ 파싱 함수 ============

function parseHorseRaces(data: KRAApiResponse): Race[] {
  const items = data.response?.body?.items?.item || []

  return items.map((item: any, index: number) => ({
    id: `horse-${item.meet}-${item.rcNo}-${item.rcDate}`,
    type: 'horse' as const,
    raceNo: parseInt(item.rcNo) || index + 1,
    track: item.meet === '1' ? '서울' : item.meet === '3' ? '부산경남' : '제주',
    startTime: item.rcTime || '00:00',
    distance: parseInt(item.rcDist) || 1200,
    grade: item.chulNo || '',
    status: 'upcoming' as const,
    entries: [],
  }))
}

function parseEntries(data: KRAApiResponse): Entry[] {
  const items = data.response?.body?.items?.item || []

  return items.map((item: any) => ({
    no: parseInt(item.hrNo) || 0,
    name: item.hrName || '',
    jockey: item.jkName || '',
    trainer: item.trName || '',
    age: parseInt(item.age) || 0,
    weight: parseFloat(item.wgHr) || 0,
    odds: parseFloat(item.odds) || 0,
    recentRecord: item.rcRst || '',
  }))
}

function parseCycleRaces(data: KRAApiResponse): Race[] {
  const items = data.response?.body?.items?.item || []

  return items.map((item: any, index: number) => ({
    id: `cycle-${item.meet}-${item.rcNo}-${item.rcDate}`,
    type: 'cycle' as const,
    raceNo: parseInt(item.rcNo) || index + 1,
    track: item.meet === '1' ? '광명' : item.meet === '2' ? '창원' : '부산',
    startTime: item.rcTime || '00:00',
    distance: parseInt(item.rcDist) || 0,
    grade: item.grade || '',
    status: 'upcoming' as const,
    entries: [],
  }))
}

function parseBoatRaces(data: KRAApiResponse): Race[] {
  const items = data.response?.body?.items?.item || []

  return items.map((item: any, index: number) => ({
    id: `boat-${item.meet}-${item.rcNo}-${item.rcDate}`,
    type: 'boat' as const,
    raceNo: parseInt(item.rcNo) || index + 1,
    track: '미사리', // 경정은 미사리 단일 경기장
    startTime: item.rcTime || '00:00',
    distance: 600, // 경정은 통상 600m
    grade: item.grade || '',
    status: 'upcoming' as const,
    entries: [],
  }))
}

// ============ 더미 데이터 (개발/데모용) ============

function getDummyHorseRaces(): Race[] {
  return [
    {
      id: 'horse-1-1-today',
      type: 'horse',
      raceNo: 1,
      track: '서울',
      startTime: '11:30',
      distance: 1200,
      grade: '국산5등급',
      status: 'upcoming',
      entries: getDummyEntries(),
    },
    {
      id: 'horse-1-2-today',
      type: 'horse',
      raceNo: 2,
      track: '서울',
      startTime: '12:05',
      distance: 1400,
      grade: '국산4등급',
      status: 'upcoming',
      entries: [],
    },
    {
      id: 'horse-1-3-today',
      type: 'horse',
      raceNo: 3,
      track: '서울',
      startTime: '12:40',
      distance: 1800,
      grade: '외산3등급',
      status: 'upcoming',
      entries: [],
    },
    {
      id: 'horse-3-1-today',
      type: 'horse',
      raceNo: 1,
      track: '부산경남',
      startTime: '11:00',
      distance: 1200,
      grade: '국산6등급',
      status: 'upcoming',
      entries: [],
    },
  ]
}

function getDummyCycleRaces(): Race[] {
  return [
    {
      id: 'cycle-1-today',
      type: 'cycle',
      raceNo: 1,
      track: '광명',
      startTime: '14:00',
      distance: 1800,
      status: 'upcoming',
      entries: [],
    },
    {
      id: 'cycle-2-today',
      type: 'cycle',
      raceNo: 2,
      track: '광명',
      startTime: '14:30',
      distance: 1800,
      status: 'upcoming',
      entries: [],
    },
  ]
}

function getDummyBoatRaces(): Race[] {
  return [
    {
      id: 'boat-1-today',
      type: 'boat',
      raceNo: 1,
      track: '미사리',
      startTime: '15:00',
      distance: 600,
      status: 'upcoming',
      entries: [],
    },
  ]
}

function getDummyEntries(): Entry[] {
  return [
    { no: 1, name: '번개', jockey: '김기수', trainer: '박조교', odds: 2.3, recentRecord: '1-2-1' },
    { no: 2, name: '청풍', jockey: '이기수', trainer: '최조교', odds: 4.1, recentRecord: '3-1-2' },
    { no: 3, name: '바람돌이', jockey: '박기수', trainer: '김조교', odds: 6.8, recentRecord: '2-4-3' },
    { no: 4, name: '천둥', jockey: '정기수', trainer: '이조교', odds: 8.5, recentRecord: '5-3-4' },
    { no: 5, name: '불꽃', jockey: '강기수', trainer: '정조교', odds: 12.0, recentRecord: '4-6-5' },
  ]
}

// ============ 유틸리티 ============

export function formatOdds(odds: number): string {
  return odds.toFixed(1)
}

export function getRaceTypeLabel(type: string): string {
  switch (type) {
    case 'horse': return '경마'
    case 'cycle': return '경륜'
    case 'boat': return '경정'
    default: return type
  }
}

export function getRaceTypeEmoji(type: string): string {
  switch (type) {
    case 'horse': return '🐎'
    case 'cycle': return '🚴'
    case 'boat': return '🚤'
    default: return '🏁'
  }
}
