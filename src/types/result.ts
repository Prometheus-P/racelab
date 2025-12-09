// src/types/result.ts

export interface RaceResult {
  rank: number; // 순위 (1, 2, 3, ...)
  no: number; // 번호 (마번/선수 번호)
  name: string; // 마명/선수명
  jockey?: string; // 기수 (경마)
  odds?: number; // 확정 배당률
  payout?: number; // 배당금 (원)
}