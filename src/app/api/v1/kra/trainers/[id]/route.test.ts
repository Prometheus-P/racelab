/**
 * GET /api/v1/kra/trainers/[id] Route Tests
 *
 * 조교사 상세정보 조회 API 테스트
 */

import { NextRequest } from 'next/server';
import { GET } from './route';
import * as kraApi from '@/lib/api/kra';

// Mock KRA API
jest.mock('@/lib/api/kra', () => ({
  fetchTrainerInfo: jest.fn(),
  formatDateParam: jest.fn((date: string) => date.replace(/-/g, '')),
}));

const mockFetchTrainerInfo = kraApi.fetchTrainerInfo as jest.MockedFunction<
  typeof kraApi.fetchTrainerInfo
>;

// Sample mock data
const mockTrainer = {
  id: '001',
  name: '박영수',
  nameEn: 'Park Young-su',
  meet: '1',
  meetName: '서울',
  part: 'A조',
  totalStarts: 300,
  totalWins: 60,
  totalSeconds: 50,
  totalThirds: 40,
  winRate: 20,
  placeRate: 50,
  recentStarts: 80,
  recentWins: 20,
  recentWinRate: 25,
  horseCount: 15,
};

function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost'));
}

describe('GET /api/v1/kra/trainers/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful requests', () => {
    it('should return trainer details by id', async () => {
      mockFetchTrainerInfo.mockResolvedValue(mockTrainer);

      const response = await GET(createRequest('http://localhost/api/v1/kra/trainers/001'), {
        params: Promise.resolve({ id: '001' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('001');
      expect(data.data.name).toBe('박영수');
      expect(mockFetchTrainerInfo).toHaveBeenCalledWith('001', undefined, undefined);
    });

    it('should pass meet parameter', async () => {
      mockFetchTrainerInfo.mockResolvedValue(mockTrainer);

      await GET(createRequest('http://localhost/api/v1/kra/trainers/001?meet=1'), {
        params: Promise.resolve({ id: '001' }),
      });

      expect(mockFetchTrainerInfo).toHaveBeenCalledWith('001', '1', undefined);
    });

    it('should pass date parameter', async () => {
      mockFetchTrainerInfo.mockResolvedValue(mockTrainer);

      await GET(createRequest('http://localhost/api/v1/kra/trainers/001?date=2024-12-25'), {
        params: Promise.resolve({ id: '001' }),
      });

      expect(mockFetchTrainerInfo).toHaveBeenCalledWith('001', undefined, '20241225');
    });
  });

  describe('Response structure', () => {
    it('should return correct response structure', async () => {
      mockFetchTrainerInfo.mockResolvedValue(mockTrainer);

      const response = await GET(createRequest('http://localhost/api/v1/kra/trainers/001'), {
        params: Promise.resolve({ id: '001' }),
      });
      const data = await response.json();

      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('timestamp');
      expect(data.data).toMatchObject({
        id: '001',
        name: '박영수',
        totalStarts: 300,
      });
    });
  });

  describe('Not found', () => {
    it('should return 404 when trainer not found', async () => {
      mockFetchTrainerInfo.mockResolvedValue(null);

      const response = await GET(createRequest('http://localhost/api/v1/kra/trainers/999'), {
        params: Promise.resolve({ id: '999' }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
      expect(data.error.message).toBe('Trainer not found: 999');
    });
  });

  describe('Error handling', () => {
    it('should return 500 on API error', async () => {
      mockFetchTrainerInfo.mockRejectedValue(new Error('API Error'));

      const response = await GET(createRequest('http://localhost/api/v1/kra/trainers/001'), {
        params: Promise.resolve({ id: '001' }),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FETCH_ERROR');
    });
  });
});
