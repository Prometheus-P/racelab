// src/types/entrant.ts
import type { RaceType } from './index';

export interface EntrantHistoryItem {
  date: string;
  track?: string;
  result?: string;
  notes?: string;
}

export interface EntrantStats {
  speed: number;
  stamina: number;
  recentWinRate: number;
  condition: number;
}

export type EntrantBadge = 'highWinRate' | 'hotPick';

export interface EntrantData {
  id: string;
  number: number;
  name: string;
  raceType: RaceType;
  odds?: number;
  stats: EntrantStats;
  badges?: EntrantBadge[];
  history?: EntrantHistoryItem[];
  favorite?: boolean;
}
