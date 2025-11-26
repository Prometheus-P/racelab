// src/app/api/races/boat/route.ts
import { fetchBoatRaceSchedules } from '@/lib/api';
import { Race } from '@/types';
import { handleApiRequest } from '@/lib/utils/apiResponse';

export async function GET() {
  return handleApiRequest<Race>(fetchBoatRaceSchedules, 'boat race');
}
