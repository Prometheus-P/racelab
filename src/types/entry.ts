// src/types/entry.ts

import type { EntryStatus } from './index';

export interface Entry {
  no: number; // 번호 (마번/선수 번호)
  name: string; // 마명/선수명
  jockey?: string; // 기수 (경마, 경륜, 경정 선수 중 조종자)
  trainer?: string; // 조교사 (경마)
  age?: number; // 연령 (경마)
  weight?: number; // 부담중량 (경마)
  stable?: string; // 마방 (경마)
  motor?: string; // 모터 (경정)
  boat?: string; // 보트 (경정)
  score?: number; // 점수 (경륜, 경정)
  recentRecord?: string; // 최근 성적
  odds?: number; // 단승 배당률 (Phase 2)
  // Add other properties as needed from API_SPECIFICATION.md
}