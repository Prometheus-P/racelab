// src/types/index.ts

export interface Entry {
  no: number;              // 번호 (마번/선수 번호)
  name: string;            // 마명/선수명
  jockey?: string;         // 기수 (경마)
  trainer?: string;        // 조교사 (경마)
  age?: number;            // 연령
  weight?: number;         // 부담중량 (경마)
  recentRecord?: string;   // 최근 성적
  odds?: number;           // 단승 배당률 (Phase 2)
  // Add other properties as needed from API_SPECIFICATION.md
}

export interface Race {
  id: string;              // 고유 ID (예: horse-1-1-20240101)
  type: 'horse' | 'cycle' | 'boat'; // 종목
  raceNo: number;          // 경주 번호
  track: string;           // 경기장 (서울, 부산경남, 제주, 광명, 미사리)
  startTime: string;       // 발주 시간 (HH:mm)
  distance?: number;       // 거리 (m) - Made optional as not always available
  grade?: string;          // 등급
  status: 'upcoming' | 'live' | 'finished' | 'canceled'; // 상태
  entries: Entry[];        // 출전 목록
}

// Odds types for betting information
export interface Odds {
  win: number | null;      // 단승 배당률
  place: number | null;    // 복승 배당률
  quinella: number | null; // 쌍승 배당률
}

// Raw KSPO odds response item
export interface KSPOOddsResponse {
  oddsDansng?: string | null;    // 단승 배당
  oddsBoksng?: string | null;    // 복승 배당
  oddsSsangsng?: string | null;  // 쌍승 배당
}

// Additional types will be added here as needed.
