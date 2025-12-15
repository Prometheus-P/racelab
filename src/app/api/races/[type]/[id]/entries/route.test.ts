// src/app/api/races/[type]/[id]/entries/route.test.ts
import { GET } from './route';
import { NextRequest } from 'next/server';
import * as raceService from '@/lib/services/raceService';

jest.mock('@/lib/services/raceService');
// Mock apiAuth to pass through without authentication in tests
jest.mock('@/lib/api-helpers/apiAuth', () => ({
  withApiAuthParams: <T,>(handler: (req: Request, ctx: { params: Promise<T> }) => Promise<Response>) => handler,
}));

describe('GET /api/races/[type]/[id]/entries', () => {
  const mockEntries = [
    {
      no: 1,
      name: '번개',
      jockey: '김기수',
      trainer: '박조교',
      age: 4,
      weight: 55,
      odds: 2.3,
      recentRecord: '1-2-1',
    },
    {
      no: 2,
      name: '청풍',
      jockey: '이기수',
      trainer: '최조교',
      age: 5,
      weight: 56,
      odds: 4.1,
      recentRecord: '3-1-2',
    },
  ];

  const mockRaceDetail = {
    race: {
      id: 'horse-1-1-20240115',
      type: 'horse' as const,
      raceNo: 1,
      track: '서울',
      startTime: '10:00',
      status: 'upcoming' as const,
      entries: mockEntries,
    },
    entries: mockEntries,
    odds: null,
    results: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should_return_entries_for_valid_race', async () => {
      (raceService.getRaceDetail as jest.Mock).mockResolvedValue(mockRaceDetail);

      const request = new NextRequest(
        'https://racelab.kr/api/races/horse/horse-1-1-20240115/entries'
      );
      const response = await GET(request, { params: Promise.resolve({ type: 'horse', id: 'horse-1-1-20240115' }) });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockEntries);
      expect(data.data).toHaveLength(2);
    });

    it('should_return_empty_array_for_race_with_no_entries', async () => {
      (raceService.getRaceDetail as jest.Mock).mockResolvedValue({
        ...mockRaceDetail,
        entries: [],
      });

      const request = new NextRequest(
        'https://racelab.kr/api/races/horse/horse-1-1-20240115/entries'
      );
      const response = await GET(request, { params: Promise.resolve({ type: 'horse', id: 'horse-1-1-20240115' }) });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
    });

    it('should_work_for_all_race_types', async () => {
      (raceService.getRaceDetail as jest.Mock).mockResolvedValue(mockRaceDetail);

      for (const type of ['horse', 'cycle', 'boat']) {
        const request = new NextRequest(
          `https://racelab.kr/api/races/${type}/${type}-1-1-20240115/entries`
        );
        const response = await GET(request, { params: Promise.resolve({ type, id: `${type}-1-1-20240115` }) });
        expect(response.status).toBe(200);
      }
    });
  });

  describe('Error Cases', () => {
    it('should_return_404_when_race_not_found', async () => {
      (raceService.getRaceDetail as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('https://racelab.kr/api/races/horse/invalid-id/entries');
      const response = await GET(request, { params: Promise.resolve({ type: 'horse', id: 'invalid-id' }) });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
    });

    it('should_return_500_when_api_fails', async () => {
      (raceService.getRaceDetail as jest.Mock).mockRejectedValue(new Error('API error'));

      const request = new NextRequest(
        'https://racelab.kr/api/races/horse/horse-1-1-20240115/entries'
      );
      const response = await GET(request, { params: Promise.resolve({ type: 'horse', id: 'horse-1-1-20240115' }) });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('SERVER_ERROR');
    });
  });

  describe('Security Tests', () => {
    it('should_handle_sql_injection_attempt_in_id', async () => {
      (raceService.getRaceDetail as jest.Mock).mockResolvedValue(null);

      const maliciousId = "'; DROP TABLE races; --";
      const request = new NextRequest(
        `https://racelab.kr/api/races/horse/${encodeURIComponent(maliciousId)}/entries`
      );
      const response = await GET(request, { params: Promise.resolve({ type: 'horse', id: maliciousId }) });

      // Should return 404 (not found) or handle gracefully, not crash
      expect(response.status).toBe(404);
      expect(raceService.getRaceDetail).toHaveBeenCalledWith(maliciousId);
    });

    it('should_handle_xss_attempt_in_id', async () => {
      (raceService.getRaceDetail as jest.Mock).mockResolvedValue(null);

      const xssId = "<script>alert('xss')</script>";
      const request = new NextRequest(
        `https://racelab.kr/api/races/horse/${encodeURIComponent(xssId)}/entries`
      );
      const response = await GET(request, { params: Promise.resolve({ type: 'horse', id: xssId }) });

      expect(response.status).toBe(404);
    });

    it('should_handle_path_traversal_attempt', async () => {
      (raceService.getRaceDetail as jest.Mock).mockResolvedValue(null);

      const traversalId = '../../../etc/passwd';
      const request = new NextRequest(
        `https://racelab.kr/api/races/horse/${encodeURIComponent(traversalId)}/entries`
      );
      const response = await GET(request, { params: Promise.resolve({ type: 'horse', id: traversalId }) });

      expect(response.status).toBe(404);
    });
  });

  describe('Response Format', () => {
    it('should_include_timestamp_in_response', async () => {
      (raceService.getRaceDetail as jest.Mock).mockResolvedValue(mockRaceDetail);

      const request = new NextRequest(
        'https://racelab.kr/api/races/horse/horse-1-1-20240115/entries'
      );
      const response = await GET(request, { params: Promise.resolve({ type: 'horse', id: 'horse-1-1-20240115' }) });

      const data = await response.json();
      expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should_return_entry_with_correct_structure', async () => {
      (raceService.getRaceDetail as jest.Mock).mockResolvedValue(mockRaceDetail);

      const request = new NextRequest(
        'https://racelab.kr/api/races/horse/horse-1-1-20240115/entries'
      );
      const response = await GET(request, { params: Promise.resolve({ type: 'horse', id: 'horse-1-1-20240115' }) });

      const data = await response.json();
      const entry = data.data[0];
      expect(entry).toHaveProperty('no');
      expect(entry).toHaveProperty('name');
      expect(entry).toHaveProperty('jockey');
    });
  });
});
