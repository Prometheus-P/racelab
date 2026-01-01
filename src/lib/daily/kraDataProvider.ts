/**
 * KRA Data Provider for Daily Screener
 *
 * Provides real race and entry data from KRA API for the screening engine
 */

import { fetchHorseRaceSchedules } from '@/lib/api/kraClient';
import { fetchEntriesByRace } from '@/lib/api/kra/entry';
import type { RaceEntry } from '@/lib/api/kra/types';
import type { RaceForScreening, EntryForScreening } from './types';

/**
 * Fetch races for screening from KRA API
 */
async function getRaces(
  date: string,
  _tracks?: string[]
): Promise<RaceForScreening[]> {
  // Convert YYYY-MM-DD to YYYYMMDD format
  const dateParam = date.replace(/-/g, '');

  const races = await fetchHorseRaceSchedules(dateParam);

  return races.map((race) => ({
    id: race.id,
    date,
    track: race.track,
    raceNo: race.raceNo,
    startTime: race.startTime
      ? `${date}T${race.startTime}:00`
      : `${date}T00:00:00`,
    grade: race.grade,
    distance: race.distance,
    raceType: 'horse' as const,
  }));
}

/**
 * Fetch entries for screening from KRA API
 */
async function getEntries(
  raceIds: string[]
): Promise<Map<string, EntryForScreening[]>> {
  const result = new Map<string, EntryForScreening[]>();

  if (raceIds.length === 0) {
    return result;
  }

  // Extract date from first race ID (format: horse-meetCode-raceNo-date)
  const firstId = raceIds[0];
  const parts = firstId.split('-');
  if (parts.length < 4) {
    return result;
  }
  const date = parts[3];

  // Fetch all entries for the date
  const entriesByRace = await fetchEntriesByRace(date);

  // Map to screening format
  const raceEntries = Array.from(entriesByRace.entries());
  for (const [raceId, entries] of raceEntries) {
    // Convert raceId format if needed
    const screeningRaceId = raceId.includes('horse-')
      ? raceId
      : `horse-${raceId}`;

    // Check if this race is in the requested list
    const matchingId =
      raceIds.find((id) => id === screeningRaceId || id === raceId) ||
      screeningRaceId;

    const screeningEntries: EntryForScreening[] = entries.map(
      (entry: RaceEntry) => ({
        raceId: matchingId,
        entryNo: parseInt(entry.horseNo, 10) || 0,
        horseName: entry.horseName,
        horse_rating: entry.rating,
        burden_weight: entry.burden,
        // Additional fields can be added when odds API is integrated
        odds_win: undefined,
        odds_place: undefined,
        odds_drift_pct: undefined,
        popularity_rank: undefined,
      })
    );

    result.set(matchingId, screeningEntries);
  }

  return result;
}

/**
 * KRA Data Provider instance
 */
export const kraDataProvider = {
  getRaces,
  getEntries,
};
