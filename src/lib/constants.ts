// src/lib/constants.ts

import { Track, RaceType } from '@/types';

/**
 * Track information for all race types
 * Used for filtering and display
 */
export const TRACKS: Track[] = [
  // Horse racing tracks
  { code: '1', name: '서울', raceType: 'horse' },
  { code: '2', name: '부산경남', raceType: 'horse' },
  { code: '3', name: '제주', raceType: 'horse' },
  // Cycle racing tracks
  { code: '1', name: '광명', raceType: 'cycle' },
  { code: '2', name: '창원', raceType: 'cycle' },
  { code: '3', name: '부산', raceType: 'cycle' },
  // Boat racing tracks
  { code: '1', name: '미사리', raceType: 'boat' },
];

/**
 * Get tracks filtered by race type(s)
 */
export function getTracksByType(types?: RaceType[]): Track[] {
  if (!types || types.length === 0) {
    return TRACKS;
  }
  return TRACKS.filter(track => types.includes(track.raceType));
}

/**
 * Get track names for a specific race type
 */
export function getTrackNamesByType(type: RaceType): string[] {
  return TRACKS
    .filter(track => track.raceType === type)
    .map(track => track.name);
}

/**
 * Race type display colors (CSS classes)
 */
export const RACE_TYPE_COLORS: Record<RaceType, { text: string; bg: string; border: string }> = {
  horse: { text: 'text-horse', bg: 'bg-horse', border: 'border-horse' },
  cycle: { text: 'text-cycle', bg: 'bg-cycle', border: 'border-cycle' },
  boat: { text: 'text-boat', bg: 'bg-boat', border: 'border-boat' },
};

/**
 * Race type display names in Korean
 */
export const RACE_TYPE_NAMES: Record<RaceType, string> = {
  horse: '경마',
  cycle: '경륜',
  boat: '경정',
};

/**
 * Default pagination settings
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

/**
 * Historical results constraints
 */
export const HISTORY = {
  MAX_DAYS: 90,
};
