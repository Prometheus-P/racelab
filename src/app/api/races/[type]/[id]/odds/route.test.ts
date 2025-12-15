// src/app/api/races/[type]/[id]/odds/route.test.ts
import { GET } from './route';
import { NextRequest } from 'next/server';
import * as raceService from '@/lib/services/raceService';

jest.mock('@/lib/services/raceService');
// Mock apiAuth to pass through without authentication in tests
jest.mock('@/lib/api-helpers/apiAuth', () => ({
  withApiAuthParams: <T,>(handler: (req: Request, ctx: { params: Promise<T> }) => Promise<Response>) => handler,
}));

describe('GET /api/races/[type]/[id]/odds', () => {
  const mockOdds = {
    win: 2.3,
    place: 1.5,
    quinella: 4.2,
  };

  const mockRaceDetail = {
    race: {
      id: 'horse-1-1-20240115',
      type: 'horse' as const,
      raceNo: 1,
      track: '서울',
      startTime: '10:00',
      status: 'upcoming' as const,
      entries: [],
    },
    entries: [],
    odds: mockOdds,
    results: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return odds for a valid race', async () => {
    (raceService.getRaceDetail as jest.Mock).mockResolvedValue(mockRaceDetail);

    const request = new NextRequest('https://racelab.kr/api/races/horse/horse-1-1-20240115/odds');
    const response = await GET(request, { params: Promise.resolve({ type: 'horse', id: 'horse-1-1-20240115' }) });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockOdds);
  });

  it('should return 404 when race not found', async () => {
    (raceService.getRaceDetail as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest('https://racelab.kr/api/races/horse/invalid-id/odds');
    const response = await GET(request, { params: Promise.resolve({ type: 'horse', id: 'invalid-id' }) });

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });

  it('should handle API errors gracefully', async () => {
    (raceService.getRaceDetail as jest.Mock).mockRejectedValue(new Error('API error'));

    const request = new NextRequest('https://racelab.kr/api/races/horse/horse-1-1-20240115/odds');
    const response = await GET(request, { params: Promise.resolve({ type: 'horse', id: 'horse-1-1-20240115' }) });

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });

  it('should return null odds when odds are not available', async () => {
    (raceService.getRaceDetail as jest.Mock).mockResolvedValue({
      ...mockRaceDetail,
      odds: null,
    });

    const request = new NextRequest('https://racelab.kr/api/races/horse/horse-1-1-20240115/odds');
    const response = await GET(request, { params: Promise.resolve({ type: 'horse', id: 'horse-1-1-20240115' }) });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toBeNull();
  });
});
