/**
 * GET /api/v1/kra/horses/[id] Route Tests
 *
 * 마필 상세정보 및 경주기록 조회 API 테스트
 */

import { NextRequest } from 'next/server';
import { GET } from './route';
import * as kraApi from '@/lib/api/kra';

// Mock KRA API
jest.mock('@/lib/api/kra', () => ({
  fetchHorseDetail: jest.fn(),
  formatDateParam: jest.fn((date: string) => date.replace(/-/g, '')),
}));

const mockFetchHorseDetail = kraApi.fetchHorseDetail as jest.MockedFunction<
  typeof kraApi.fetchHorseDetail
>;

// Sample mock data
const mockHorse = {
  id: 'H001',
  name: '명마',
  nameEn: 'Famous Horse',
  meet: '1',
  meetName: '서울',
  sex: '수',
  sexName: '수말',
  age: 5,
  grade: '1',
  trainer: '박영수',
  owner: '김마주',
  totalStarts: 30,
  totalWins: 10,
  totalSeconds: 8,
  totalThirds: 5,
  winRate: 33.33,
  placeRate: 76.67,
  recentStarts: 10,
  recentWins: 4,
  rating: 92,
  sire: '부마명',
  dam: '모마명',
  grandsire: '외조부마명',
};

const mockRaceHistory = [
  {
    date: '20241225',
    meet: '서울',
    raceNo: 5,
    distance: 1400,
    position: 1,
    time: '1:23.45',
    jockey: '홍길동',
    weight: 480,
    burden: 57,
    winOdds: 2.5,
    placeOdds: 1.3,
  },
  {
    date: '20241218',
    meet: '서울',
    raceNo: 3,
    distance: 1200,
    position: 2,
    time: '1:11.50',
    jockey: '김철수',
    weight: 478,
    burden: 57,
    winOdds: 3.1,
    placeOdds: 1.5,
  },
];

function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost'));
}

describe('GET /api/v1/kra/horses/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful requests', () => {
    it('should return horse details with race history', async () => {
      mockFetchHorseDetail.mockResolvedValue({
        horse: mockHorse,
        history: mockRaceHistory,
      });

      const response = await GET(createRequest('http://localhost/api/v1/kra/horses/H001'), {
        params: Promise.resolve({ id: 'H001' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('H001');
      expect(data.data.name).toBe('명마');
      expect(data.data.raceHistory).toHaveLength(2);
      expect(mockFetchHorseDetail).toHaveBeenCalledWith('H001', undefined, undefined);
    });

    it('should include race history in response', async () => {
      mockFetchHorseDetail.mockResolvedValue({
        horse: mockHorse,
        history: mockRaceHistory,
      });

      const response = await GET(createRequest('http://localhost/api/v1/kra/horses/H001'), {
        params: Promise.resolve({ id: 'H001' }),
      });
      const data = await response.json();

      expect(data.data.raceHistory[0]).toMatchObject({
        date: '20241225',
        position: 1,
        jockey: '홍길동',
      });
    });

    it('should pass meet parameter', async () => {
      mockFetchHorseDetail.mockResolvedValue({ horse: mockHorse, history: [] });

      await GET(createRequest('http://localhost/api/v1/kra/horses/H001?meet=1'), {
        params: Promise.resolve({ id: 'H001' }),
      });

      expect(mockFetchHorseDetail).toHaveBeenCalledWith('H001', '1', undefined);
    });

    it('should pass date parameter', async () => {
      mockFetchHorseDetail.mockResolvedValue({ horse: mockHorse, history: [] });

      await GET(createRequest('http://localhost/api/v1/kra/horses/H001?date=2024-12-25'), {
        params: Promise.resolve({ id: 'H001' }),
      });

      expect(mockFetchHorseDetail).toHaveBeenCalledWith('H001', undefined, '20241225');
    });

    it('should pass all parameters', async () => {
      mockFetchHorseDetail.mockResolvedValue({ horse: mockHorse, history: [] });

      await GET(createRequest('http://localhost/api/v1/kra/horses/H001?meet=1&date=2024-12-25'), {
        params: Promise.resolve({ id: 'H001' }),
      });

      expect(mockFetchHorseDetail).toHaveBeenCalledWith('H001', '1', '20241225');
    });
  });

  describe('Response structure', () => {
    it('should return correct response structure', async () => {
      mockFetchHorseDetail.mockResolvedValue({
        horse: mockHorse,
        history: mockRaceHistory,
      });

      const response = await GET(createRequest('http://localhost/api/v1/kra/horses/H001'), {
        params: Promise.resolve({ id: 'H001' }),
      });
      const data = await response.json();

      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('timestamp');
      expect(data.data).toMatchObject({
        id: 'H001',
        name: '명마',
        sex: '수',
        age: 5,
        rating: 92,
      });
      expect(data.data).toHaveProperty('raceHistory');
    });

    it('should include pedigree information', async () => {
      mockFetchHorseDetail.mockResolvedValue({
        horse: mockHorse,
        history: [],
      });

      const response = await GET(createRequest('http://localhost/api/v1/kra/horses/H001'), {
        params: Promise.resolve({ id: 'H001' }),
      });
      const data = await response.json();

      expect(data.data.sire).toBe('부마명');
      expect(data.data.dam).toBe('모마명');
      expect(data.data.grandsire).toBe('외조부마명');
    });

    it('should return ISO timestamp', async () => {
      mockFetchHorseDetail.mockResolvedValue({ horse: mockHorse, history: [] });

      const response = await GET(createRequest('http://localhost/api/v1/kra/horses/H001'), {
        params: Promise.resolve({ id: 'H001' }),
      });
      const data = await response.json();

      expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
    });
  });

  describe('Empty race history', () => {
    it('should handle horse with no race history', async () => {
      mockFetchHorseDetail.mockResolvedValue({
        horse: mockHorse,
        history: [],
      });

      const response = await GET(createRequest('http://localhost/api/v1/kra/horses/H001'), {
        params: Promise.resolve({ id: 'H001' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.raceHistory).toEqual([]);
    });
  });

  describe('Not found', () => {
    it('should return 404 when horse not found', async () => {
      mockFetchHorseDetail.mockResolvedValue({
        horse: null,
        history: [],
      });

      const response = await GET(createRequest('http://localhost/api/v1/kra/horses/H999'), {
        params: Promise.resolve({ id: 'H999' }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('NOT_FOUND');
      expect(data.error.message).toBe('Horse not found: H999');
    });
  });

  describe('Error handling', () => {
    it('should return 500 on API error', async () => {
      mockFetchHorseDetail.mockRejectedValue(new Error('API Error'));

      const response = await GET(createRequest('http://localhost/api/v1/kra/horses/H001'), {
        params: Promise.resolve({ id: 'H001' }),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('FETCH_ERROR');
      expect(data.error.message).toBe('API Error');
    });

    it('should handle unknown errors', async () => {
      mockFetchHorseDetail.mockRejectedValue('Unknown error');

      const response = await GET(createRequest('http://localhost/api/v1/kra/horses/H001'), {
        params: Promise.resolve({ id: 'H001' }),
      });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.message).toBe('Unknown error');
    });
  });
});
