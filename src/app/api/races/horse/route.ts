// src/app/api/races/horse/route.ts
import { fetchHorseRaceSchedules } from '@/lib/api';
import { Race } from '@/types';
import { handleApiRequest } from '@/lib/utils/apiResponse';

export async function GET() {
  return handleApiRequest<Race>(fetchHorseRaceSchedules, 'horse race');
}