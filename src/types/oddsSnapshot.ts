// src/types/oddsSnapshot.ts

export interface Odds {
  win: number | null; // 단승 배당률
  place: number | null; // 복승 배당률
  quinella: number | null; // 쌍승 배당률
}

// Raw KSPO odds response item (should be in api-specific types, but putting here for now)
export interface KSPOOddsResponse {
  oddsDansng?: string | null; // 단승 배당
  oddsBoksng?: string | null; // 복승 배당
  oddsSsangsng?: string | null; // 쌍승 배당
}
