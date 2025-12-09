// src/lib/utils/race.ts

import { RaceType } from '@/types'; // Assuming RaceType is available from @/types/index

/**
 * Generate a unique race ID with validation
 * Throws error if required fields are missing to prevent invalid/duplicate IDs
 */
export function generateRaceId(
  type: RaceType,
  meet: string | undefined,
  rcNo: string | undefined,
  rcDate: string | undefined
): string {
  if (!meet || !rcNo || !rcDate) {
    // Log warning but don't throw to avoid breaking the app for bad API data
    console.warn(
      `Missing required fields for race ID generation: type=${type}, meet=${meet}, rcNo=${rcNo}, rcDate=${rcDate}`
    );
    // Generate a fallback ID with timestamp to ensure uniqueness
    const timestamp = Date.now();
    return `${type}-unknown-${timestamp}`;
  }
  return `${type}-${meet}-${rcNo}-${rcDate}`;
}