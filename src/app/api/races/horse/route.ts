// src/app/api/races/horse/route.ts
import { fetchHorseRaceSchedules } from '@/lib/api';
import { Race } from '@/types';
import { handleApiRequest } from '@/lib/utils/apiResponse';

// ISR: Revalidate every 60 seconds for race schedules
export const revalidate = 60;

export async function GET(request: Request) {
  return handleApiRequest<Race>(fetchHorseRaceSchedules, 'horse race', request);
}