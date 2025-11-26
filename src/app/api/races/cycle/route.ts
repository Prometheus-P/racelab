// src/app/api/races/cycle/route.ts
import { fetchCycleRaceSchedules } from '@/lib/api';
import { Race } from '@/types';
import { handleApiRequest } from '@/lib/utils/apiResponse';

export async function GET() {
  return handleApiRequest<Race>(fetchCycleRaceSchedules, 'cycle race');
}