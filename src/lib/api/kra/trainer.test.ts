/**
 * KRA Trainer API Tests
 *
 * 조교사 정보 조회 API 테스트
 */

import {
  fetchTrainerResults,
  fetchAllTrainerResults,
  fetchTrainerInfo,
  searchTrainersByName,
  fetchTrainerRanking,
  fetchTrainerHorseCount,
  fetchTrainerResultsSafe,
} from './trainer';
import * as client from './client';

// Mock client module
jest.mock('./client', () => ({
  kraApi: jest.fn(),
  kraApiSafe: jest.fn(),
  kraApiAllMeets: jest.fn(),
  getTodayDate: jest.fn(() => '20241225'),
}));

const mockKraApi = client.kraApi as jest.MockedFunction<typeof client.kraApi>;
const mockKraApiSafe = client.kraApiSafe as jest.MockedFunction<typeof client.kraApiSafe>;
const mockKraApiAllMeets = client.kraApiAllMeets as jest.MockedFunction<typeof client.kraApiAllMeets>;
const mockGetTodayDate = client.getTodayDate as jest.MockedFunction<typeof client.getTodayDate>;

// Sample API response data
const mockTrainerInfoItems = [
  {
    meet: '1',
    trNo: '001',
    trName: '박영수',
    trNameEn: 'Park Young-su',
    part: 'A조',
    rcCnt: '300',
    ord1Cnt: '60',
    ord2Cnt: '50',
    ord3Cnt: '40',
    winRate: '20.0',
    ordRate: '50.0',
    rcCnt1y: '80',
    ord1Cnt1y: '20',
    winRate1y: '25.0',
    hrCnt: '15',
  },
  {
    meet: '1',
    trNo: '002',
    trName: '이순신',
    trNameEn: 'Lee Soon-shin',
    part: 'B조',
    rcCnt: '400',
    ord1Cnt: '120',
    ord2Cnt: '80',
    ord3Cnt: '60',
    winRate: '30.0',
    ordRate: '65.0',
    rcCnt1y: '100',
    ord1Cnt1y: '35',
    winRate1y: '35.0',
    hrCnt: '20',
  },
];

describe('KRA Trainer API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTodayDate.mockReturnValue('20241225');
  });

  describe('fetchTrainerResults', () => {
    it('should fetch trainer results for a specific meet', async () => {
      mockKraApi.mockResolvedValue(mockTrainerInfoItems);

      const result = await fetchTrainerResults('1');

      expect(mockKraApi).toHaveBeenCalledWith('TRAINER_INFO', '20241225', {
        meet: '1',
        numOfRows: 100,
      });
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('박영수');
      expect(result[1].name).toBe('이순신');
    });

    it('should use provided date instead of today', async () => {
      mockKraApi.mockResolvedValue([]);

      await fetchTrainerResults('1', '20241201');

      expect(mockKraApi).toHaveBeenCalledWith('TRAINER_INFO', '20241201', expect.any(Object));
    });

    it('should return mapped Trainer objects', async () => {
      mockKraApi.mockResolvedValue([mockTrainerInfoItems[0]]);

      const result = await fetchTrainerResults('1');

      expect(result[0]).toMatchObject({
        id: '001',
        name: '박영수',
        nameEn: 'Park Young-su',
        meet: '1',
        meetName: '서울',
        totalStarts: 300,
        totalWins: 60,
        winRate: 20,
        horseCount: 15,
      });
    });

    it('should return empty array when no data', async () => {
      mockKraApi.mockResolvedValue([]);

      const result = await fetchTrainerResults('1');

      expect(result).toEqual([]);
    });
  });

  describe('fetchAllTrainerResults', () => {
    it('should fetch trainers from all meets', async () => {
      const allMeetsData = [
        { ...mockTrainerInfoItems[0], meet: '1' },
        { ...mockTrainerInfoItems[1], meet: '2' },
      ];
      mockKraApiAllMeets.mockResolvedValue(allMeetsData);

      const result = await fetchAllTrainerResults();

      expect(mockKraApiAllMeets).toHaveBeenCalledWith('TRAINER_INFO', '20241225', {
        numOfRows: 100,
      });
      expect(result).toHaveLength(2);
    });

    it('should sort results by win rate', async () => {
      const unsortedData = [
        { ...mockTrainerInfoItems[0], winRate: '20.0' }, // 20%
        { ...mockTrainerInfoItems[1], winRate: '30.0' }, // 30%
      ];
      mockKraApiAllMeets.mockResolvedValue(unsortedData);

      const result = await fetchAllTrainerResults();

      expect(result[0].winRate).toBe(30);
      expect(result[1].winRate).toBe(20);
    });

    it('should use provided date', async () => {
      mockKraApiAllMeets.mockResolvedValue([]);

      await fetchAllTrainerResults('20241201');

      expect(mockKraApiAllMeets).toHaveBeenCalledWith('TRAINER_INFO', '20241201', expect.any(Object));
    });
  });

  describe('fetchTrainerInfo', () => {
    it('should return null when trainer not found', async () => {
      mockKraApi.mockResolvedValue([]);

      const result = await fetchTrainerInfo('999');

      expect(result).toBeNull();
    });

    it('should return trainer when found', async () => {
      mockKraApi.mockResolvedValue([mockTrainerInfoItems[0]]);

      const result = await fetchTrainerInfo('001');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('001');
      expect(result?.name).toBe('박영수');
    });

    it('should call API with correct parameters', async () => {
      mockKraApi.mockResolvedValue([mockTrainerInfoItems[0]]);

      await fetchTrainerInfo('001', '1', '20241201');

      expect(mockKraApi).toHaveBeenCalledWith('TRAINER_INFO', '20241201', {
        meet: '1',
        params: { trNo: '001' },
      });
    });

    it('should use today date when not provided', async () => {
      mockKraApi.mockResolvedValue([mockTrainerInfoItems[0]]);

      await fetchTrainerInfo('001');

      expect(mockKraApi).toHaveBeenCalledWith('TRAINER_INFO', '20241225', expect.any(Object));
    });
  });

  describe('searchTrainersByName', () => {
    it('should filter trainers by name (case-insensitive)', async () => {
      mockKraApiAllMeets.mockResolvedValue(mockTrainerInfoItems);

      const result = await searchTrainersByName('박영수');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('박영수');
    });

    it('should return all matches for partial name', async () => {
      const moreTrainers = [
        ...mockTrainerInfoItems,
        { ...mockTrainerInfoItems[0], trNo: '003', trName: '박세리', winRate: '25.0' },
      ];
      mockKraApiAllMeets.mockResolvedValue(moreTrainers);

      const result = await searchTrainersByName('박');

      expect(result).toHaveLength(2);
      expect(result.map((t) => t.name)).toContain('박영수');
      expect(result.map((t) => t.name)).toContain('박세리');
    });

    it('should return empty array when no match', async () => {
      mockKraApiAllMeets.mockResolvedValue(mockTrainerInfoItems);

      const result = await searchTrainersByName('없는이름');

      expect(result).toEqual([]);
    });

    it('should sort results by win rate', async () => {
      const moreTrainers = [
        { ...mockTrainerInfoItems[0], trNo: '001', trName: '박영수', winRate: '20.0' },
        { ...mockTrainerInfoItems[0], trNo: '003', trName: '박세리', winRate: '35.0' },
      ];
      mockKraApiAllMeets.mockResolvedValue(moreTrainers);

      const result = await searchTrainersByName('박');

      expect(result[0].name).toBe('박세리');
      expect(result[1].name).toBe('박영수');
    });
  });

  describe('fetchTrainerRanking', () => {
    it('should filter by minimum starts (10)', async () => {
      const mixedStarts = [
        { ...mockTrainerInfoItems[0], rcCnt: '100', winRate: '30.0' }, // qualified
        { ...mockTrainerInfoItems[1], rcCnt: '5', winRate: '80.0' }, // not qualified
      ];
      mockKraApiAllMeets.mockResolvedValue(mixedStarts);

      const result = await fetchTrainerRanking();

      expect(result).toHaveLength(1);
      expect(result[0].totalStarts).toBeGreaterThanOrEqual(10);
    });

    it('should limit results to specified count', async () => {
      const manyTrainers = Array.from({ length: 30 }, (_, i) => ({
        ...mockTrainerInfoItems[0],
        trNo: String(i + 1).padStart(3, '0'),
        trName: `조교사${i + 1}`,
        rcCnt: '100',
        winRate: String(50 - i),
      }));
      mockKraApiAllMeets.mockResolvedValue(manyTrainers);

      const result = await fetchTrainerRanking(undefined, 10);

      expect(result).toHaveLength(10);
    });

    it('should default to limit of 20', async () => {
      const manyTrainers = Array.from({ length: 30 }, (_, i) => ({
        ...mockTrainerInfoItems[0],
        trNo: String(i + 1).padStart(3, '0'),
        rcCnt: '100',
      }));
      mockKraApiAllMeets.mockResolvedValue(manyTrainers);

      const result = await fetchTrainerRanking();

      expect(result).toHaveLength(20);
    });

    it('should fetch specific meet when provided', async () => {
      mockKraApi.mockResolvedValue([mockTrainerInfoItems[0]]);

      await fetchTrainerRanking('1', 20, '20241225');

      expect(mockKraApi).toHaveBeenCalledWith('TRAINER_INFO', '20241225', {
        meet: '1',
        numOfRows: 100,
      });
      expect(mockKraApiAllMeets).not.toHaveBeenCalled();
    });

    it('should fetch all meets when no meet specified', async () => {
      mockKraApiAllMeets.mockResolvedValue(mockTrainerInfoItems);

      await fetchTrainerRanking();

      expect(mockKraApiAllMeets).toHaveBeenCalled();
      expect(mockKraApi).not.toHaveBeenCalled();
    });

    it('should sort by win rate descending', async () => {
      const unsortedTrainers = [
        { ...mockTrainerInfoItems[0], trNo: '001', rcCnt: '100', winRate: '20.0' },
        { ...mockTrainerInfoItems[0], trNo: '002', rcCnt: '100', winRate: '30.0' },
        { ...mockTrainerInfoItems[0], trNo: '003', rcCnt: '100', winRate: '25.0' },
      ];
      mockKraApiAllMeets.mockResolvedValue(unsortedTrainers);

      const result = await fetchTrainerRanking();

      expect(result[0].winRate).toBe(30);
      expect(result[1].winRate).toBe(25);
      expect(result[2].winRate).toBe(20);
    });
  });

  describe('fetchTrainerHorseCount', () => {
    it('should fetch trainer horse counts', async () => {
      const horseCountData = [
        { trNo: '001', trName: '박영수', hrCnt: '15' },
        { trNo: '002', trName: '이순신', hrCnt: '20' },
      ];
      mockKraApi.mockResolvedValue(horseCountData);

      const result = await fetchTrainerHorseCount('1');

      expect(mockKraApi).toHaveBeenCalledWith('TRAINER_HORSE_COUNT', '20241225', {
        meet: '1',
        numOfRows: 100,
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: '001', name: '박영수', horseCount: 15 });
      expect(result[1]).toEqual({ id: '002', name: '이순신', horseCount: 20 });
    });

    it('should return empty array when API fails', async () => {
      mockKraApi.mockRejectedValue(new Error('API Error'));

      const result = await fetchTrainerHorseCount('1');

      expect(result).toEqual([]);
    });

    it('should handle missing hrCnt gracefully', async () => {
      const incompleteData = [{ trNo: '001', trName: '박영수' }];
      mockKraApi.mockResolvedValue(incompleteData);

      const result = await fetchTrainerHorseCount('1');

      expect(result[0].horseCount).toBe(0);
    });
  });

  describe('fetchTrainerResultsSafe', () => {
    it('should return FetchResult structure', async () => {
      mockKraApiSafe.mockResolvedValue({ data: mockTrainerInfoItems });

      const result = await fetchTrainerResultsSafe('1');

      expect(result).toHaveProperty('data');
      expect(result.data).toHaveLength(2);
    });

    it('should include isStale and warning when present', async () => {
      mockKraApiSafe.mockResolvedValue({
        data: [],
        isStale: true,
        warning: 'API 지연',
      });

      const result = await fetchTrainerResultsSafe('1');

      expect(result.isStale).toBe(true);
      expect(result.warning).toBe('API 지연');
    });

    it('should map data to Trainer objects', async () => {
      mockKraApiSafe.mockResolvedValue({ data: [mockTrainerInfoItems[0]] });

      const result = await fetchTrainerResultsSafe('1');

      expect(result.data[0]).toMatchObject({
        id: '001',
        name: '박영수',
        meet: '1',
      });
    });
  });
});
