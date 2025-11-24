// 공통 타입
export type RaceType = 'horse' | 'cycle' | 'boat'

export interface Race {
  id: string
  type: RaceType
  raceNo: number           // 경주 번호
  track: string            // 경마장/경륜장/경정장
  startTime: string        // 발주 시간
  distance: number         // 거리 (m)
  grade?: string           // 등급
  status: 'upcoming' | 'live' | 'finished' | 'canceled'
  entries: Entry[]
}

export interface Entry {
  no: number               // 번호
  name: string             // 마명/선수명
  jockey?: string          // 기수 (경마)
  trainer?: string         // 조교사 (경마)
  age?: number             // 연령
  weight?: number          // 마체중/선수체중
  odds?: number            // 단승 배당률
  recentRecord?: string    // 최근 성적
}

export interface RaceResult {
  raceId: string
  rankings: ResultEntry[]
  payouts: Payout[]
}

export interface ResultEntry {
  rank: number
  no: number
  name: string
  time?: string
  margin?: string          // 착차
}

export interface Payout {
  type: string             // 단승, 복승, 쌍승 등
  combination: number[]
  amount: number           // 배당금
}

// 경마 전용 타입
export interface Horse {
  id: string
  name: string
  birthYear: number
  origin: 'domestic' | 'foreign'  // 국산/외산
  gender: 'male' | 'female' | 'gelding'
  trainer: string
  owner: string
  totalRaces: number
  wins: number
  rating?: number
}

// 경륜/경정 전용 타입
export interface Athlete {
  id: string
  name: string
  no: number               // 선수 번호
  class: string            // 등급
  trainingCenter: string   // 훈련지
  recentWins: number
  winRate: number
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

// 공공데이터 API 응답 (경마)
export interface KRAApiResponse {
  response: {
    header: {
      resultCode: string
      resultMsg: string
    }
    body: {
      items: {
        item: any[]
      }
      numOfRows: number
      pageNo: number
      totalCount: number
    }
  }
}

// 통계 타입
export interface DailyStats {
  totalRaces: number
  horseRaces: number
  cycleRaces: number
  boatRaces: number
  nextRace?: {
    type: RaceType
    track: string
    time: string
    raceNo: number
  }
}
