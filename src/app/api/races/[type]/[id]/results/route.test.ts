// src/app/api/races/[type]/[id]/results/route.test.ts
import { GET } from './route';
import { NextRequest } from 'next/server';
import * as raceService from '@/lib/services/raceService';

jest.mock('@/lib/services/raceService');
// Mock apiAuth to pass through without authentication in tests
jest.mock('@/lib/api-helpers/apiAuth', () => ({
  withApiAuthParams: <T,>(handler: (req: Request, ctx: { params: Promise<T> }) => Promise<Response>) => handler,
}));

describe('GET /api/races/[type]/[id]/results', () => {
  const mockResults = [
    { rank: 1, no: 3, name: '바람돌이', jockey: '박기수', odds: 6.8 },
    { rank: 2, no: 1, name: '번개', jockey: '김기수', odds: 2.3 },
    { rank: 3, no: 2, name: '청풍', jockey: '이기수', odds: 4.1 },
  ];

  const mockRaceDetail = {
    race: {
      id: 'horse-1-1-20240115',
      type: 'horse' as const,
      raceNo: 1,
      track: '서울',
      startTime: '10:00',
      status: 'finished' as const,
      entries: [],
    },
    entries: [],
    odds: null,
    results: mockResults,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return results for a completed race', async () => {
    (raceService.getRaceDetail as jest.Mock).mockResolvedValue(mockRaceDetail);

    const request = new NextRequest(
      'https://racelab.kr/api/races/horse/horse-1-1-20240115/results'
    );
    const response = await GET(request, { params: Promise.resolve({ type: 'horse', id: 'horse-1-1-20240115' }) });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toEqual(mockResults);
    expect(data.data).toHaveLength(3);
  });

  it('should return 404 when race not found', async () => {
    (raceService.getRaceDetail as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest('https://racelab.kr/api/races/horse/invalid-id/results');
    const response = await GET(request, { params: Promise.resolve({ type: 'horse', id: 'invalid-id' }) });

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });

  it('should return empty array for race without results', async () => {
    (raceService.getRaceDetail as jest.Mock).mockResolvedValue({
      ...mockRaceDetail,
      results: [],
    });

    const request = new NextRequest(
      'https://racelab.kr/api/races/horse/horse-1-1-20240115/results'
    );
    const response = await GET(request, { params: Promise.resolve({ type: 'horse', id: 'horse-1-1-20240115' }) });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data).toEqual([]);
  });

  it('should handle API errors gracefully', async () => {
    (raceService.getRaceDetail as jest.Mock).mockRejectedValue(new Error('API error'));

    const request = new NextRequest(
      'https://racelab.kr/api/races/horse/horse-1-1-20240115/results'
    );
    const response = await GET(request, { params: Promise.resolve({ type: 'horse', id: 'horse-1-1-20240115' }) });

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });

  it('should return results with correct structure', async () => {
    (raceService.getRaceDetail as jest.Mock).mockResolvedValue(mockRaceDetail);

    const request = new NextRequest(
      'https://racelab.kr/api/races/horse/horse-1-1-20240115/results'
    );
    const response = await GET(request, { params: Promise.resolve({ type: 'horse', id: 'horse-1-1-20240115' }) });

    const data = await response.json();
    expect(data.data[0]).toHaveProperty('rank');
    expect(data.data[0]).toHaveProperty('no');
    expect(data.data[0]).toHaveProperty('name');
    expect(data.data[0]).toHaveProperty('jockey');
  });
});
