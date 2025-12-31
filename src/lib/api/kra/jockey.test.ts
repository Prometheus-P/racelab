/**
 * KRA Jockey API Tests
 *
 * 기수 정보 조회 API 테스트
 */

import {
  fetchJockeyResults,
  fetchAllJockeyResults,
  fetchJockeyInfo,
  searchJockeysByName,
  fetchJockeyRanking,
  fetchJockeyResultsSafe,
} from './jockey';
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
const mockJockeyResultItems = [
  {
    meet: '1',
    jkNo: '001',
    jkName: '홍길동',
    part: 'A조',
    rcCnt: '500',
    ord1Cnt: '100',
    ord2Cnt: '80',
    ord3Cnt: '60',
    ordCnt: '240',
    winRate: '20.0',
    ordRate: '48.0',
    rcCnt1y: '100',
    ord1Cnt1y: '25',
    ord2Cnt1y: '20',
    ord3Cnt1y: '15',
    ordCnt1y: '60',
    winRate1y: '25.0',
    ordRate1y: '60.0',
  },
  {
    meet: '1',
    jkNo: '002',
    jkName: '김철수',
    part: 'B조',
    rcCnt: '300',
    ord1Cnt: '90',
    ord2Cnt: '50',
    ord3Cnt: '40',
    ordCnt: '180',
    winRate: '30.0',
    ordRate: '60.0',
    rcCnt1y: '80',
    ord1Cnt1y: '30',
    ord2Cnt1y: '15',
    ord3Cnt1y: '10',
    ordCnt1y: '55',
    winRate1y: '37.5',
    ordRate1y: '68.75',
  },
];

const mockJockeyInfoItem = {
  meet: '1',
  jkNo: '001',
  jkName: '홍길동',
  jkNameEn: 'Hong Gil-dong',
  part: 'A조',
  birthday: '19850315',
  debut: '20050101',
  rcCnt: '500',
  ord1Cnt: '100',
  rating: '85',
};

describe('KRA Jockey API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTodayDate.mockReturnValue('20241225');
  });

  describe('fetchJockeyResults', () => {
    it('should fetch jockey results for a specific meet', async () => {
      mockKraApi.mockResolvedValue(mockJockeyResultItems);

      const result = await fetchJockeyResults('1');

      expect(mockKraApi).toHaveBeenCalledWith('JOCKEY_RESULT', '20241225', {
        meet: '1',
        numOfRows: 100,
      });
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('홍길동');
      expect(result[1].name).toBe('김철수');
    });

    it('should use provided date instead of today', async () => {
      mockKraApi.mockResolvedValue([]);

      await fetchJockeyResults('1', '20241201');

      expect(mockKraApi).toHaveBeenCalledWith('JOCKEY_RESULT', '20241201', expect.any(Object));
    });

    it('should return mapped Jockey objects', async () => {
      mockKraApi.mockResolvedValue([mockJockeyResultItems[0]]);

      const result = await fetchJockeyResults('1');

      expect(result[0]).toMatchObject({
        id: '001',
        name: '홍길동',
        meet: '1',
        meetName: '서울',
        totalStarts: 500,
        totalWins: 100,
        winRate: 20,
      });
    });

    it('should return empty array when no data', async () => {
      mockKraApi.mockResolvedValue([]);

      const result = await fetchJockeyResults('1');

      expect(result).toEqual([]);
    });
  });

  describe('fetchAllJockeyResults', () => {
    it('should fetch jockeys from all meets', async () => {
      const allMeetsData = [
        { ...mockJockeyResultItems[0], meet: '1' },
        { ...mockJockeyResultItems[1], meet: '2' },
      ];
      mockKraApiAllMeets.mockResolvedValue(allMeetsData);

      const result = await fetchAllJockeyResults();

      expect(mockKraApiAllMeets).toHaveBeenCalledWith('JOCKEY_RESULT', '20241225', {
        numOfRows: 100,
      });
      expect(result).toHaveLength(2);
    });

    it('should sort results by win rate', async () => {
      const unsortedData = [
        { ...mockJockeyResultItems[0], winRate: '20.0' }, // 20%
        { ...mockJockeyResultItems[1], winRate: '30.0' }, // 30%
      ];
      mockKraApiAllMeets.mockResolvedValue(unsortedData);

      const result = await fetchAllJockeyResults();

      expect(result[0].winRate).toBe(30);
      expect(result[1].winRate).toBe(20);
    });

    it('should use provided date', async () => {
      mockKraApiAllMeets.mockResolvedValue([]);

      await fetchAllJockeyResults('20241201');

      expect(mockKraApiAllMeets).toHaveBeenCalledWith('JOCKEY_RESULT', '20241201', expect.any(Object));
    });
  });

  describe('fetchJockeyInfo', () => {
    it('should return null when jockey not found', async () => {
      mockKraApi.mockResolvedValue([]);

      const result = await fetchJockeyInfo('999');

      expect(result).toBeNull();
    });

    it('should return jockey with basic info when detail fetch fails', async () => {
      mockKraApi
        .mockResolvedValueOnce([mockJockeyResultItems[0]]) // JOCKEY_RESULT
        .mockRejectedValueOnce(new Error('API Error')); // JOCKEY_INFO fails

      const result = await fetchJockeyInfo('001');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('001');
      expect(result?.name).toBe('홍길동');
    });

    it('should merge detail info when available', async () => {
      mockKraApi
        .mockResolvedValueOnce([mockJockeyResultItems[0]]) // JOCKEY_RESULT
        .mockResolvedValueOnce([mockJockeyInfoItem]); // JOCKEY_INFO

      const result = await fetchJockeyInfo('001');

      expect(result?.nameEn).toBe('Hong Gil-dong');
      expect(result?.birthday).toBe('19850315');
      expect(result?.debutDate).toBe('20050101');
      expect(result?.rating).toBe(85);
    });

    it('should use meet from jockey result when not provided', async () => {
      mockKraApi
        .mockResolvedValueOnce([mockJockeyResultItems[0]])
        .mockResolvedValueOnce([mockJockeyInfoItem]);

      await fetchJockeyInfo('001');

      // First call: JOCKEY_RESULT with jkNo
      expect(mockKraApi).toHaveBeenNthCalledWith(1, 'JOCKEY_RESULT', '20241225', {
        meet: undefined,
        params: { jkNo: '001' },
      });

      // Second call: JOCKEY_INFO with meet from result
      expect(mockKraApi).toHaveBeenNthCalledWith(2, 'JOCKEY_INFO', '20241225', {
        meet: '1',
        params: { jkNo: '001' },
      });
    });

    it('should use provided meet for both requests', async () => {
      mockKraApi
        .mockResolvedValueOnce([mockJockeyResultItems[0]])
        .mockResolvedValueOnce([mockJockeyInfoItem]);

      await fetchJockeyInfo('001', '3', '20241201');

      expect(mockKraApi).toHaveBeenNthCalledWith(1, 'JOCKEY_RESULT', '20241201', {
        meet: '3',
        params: { jkNo: '001' },
      });
    });
  });

  describe('searchJockeysByName', () => {
    it('should filter jockeys by name (case-insensitive)', async () => {
      mockKraApiAllMeets.mockResolvedValue(mockJockeyResultItems);

      const result = await searchJockeysByName('홍길동');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('홍길동');
    });

    it('should return all matches for partial name', async () => {
      const moreJockeys = [
        ...mockJockeyResultItems,
        { ...mockJockeyResultItems[0], jkNo: '003', jkName: '홍명보', winRate: '25.0' },
      ];
      mockKraApiAllMeets.mockResolvedValue(moreJockeys);

      const result = await searchJockeysByName('홍');

      expect(result).toHaveLength(2);
      expect(result.map((j) => j.name)).toContain('홍길동');
      expect(result.map((j) => j.name)).toContain('홍명보');
    });

    it('should return empty array when no match', async () => {
      mockKraApiAllMeets.mockResolvedValue(mockJockeyResultItems);

      const result = await searchJockeysByName('없는이름');

      expect(result).toEqual([]);
    });

    it('should sort results by win rate', async () => {
      const moreJockeys = [
        { ...mockJockeyResultItems[0], jkNo: '001', jkName: '홍길동', winRate: '20.0' },
        { ...mockJockeyResultItems[0], jkNo: '003', jkName: '홍명보', winRate: '35.0' },
      ];
      mockKraApiAllMeets.mockResolvedValue(moreJockeys);

      const result = await searchJockeysByName('홍');

      expect(result[0].name).toBe('홍명보');
      expect(result[1].name).toBe('홍길동');
    });
  });

  describe('fetchJockeyRanking', () => {
    it('should filter by minimum starts (10)', async () => {
      const mixedStarts = [
        { ...mockJockeyResultItems[0], rcCnt: '100', winRate: '30.0' }, // qualified
        { ...mockJockeyResultItems[1], rcCnt: '5', winRate: '80.0' }, // not qualified
      ];
      mockKraApiAllMeets.mockResolvedValue(mixedStarts);

      const result = await fetchJockeyRanking();

      expect(result).toHaveLength(1);
      expect(result[0].totalStarts).toBeGreaterThanOrEqual(10);
    });

    it('should limit results to specified count', async () => {
      const manyJockeys = Array.from({ length: 30 }, (_, i) => ({
        ...mockJockeyResultItems[0],
        jkNo: String(i + 1).padStart(3, '0'),
        jkName: `기수${i + 1}`,
        rcCnt: '100',
        winRate: String(50 - i),
      }));
      mockKraApiAllMeets.mockResolvedValue(manyJockeys);

      const result = await fetchJockeyRanking(undefined, 10);

      expect(result).toHaveLength(10);
    });

    it('should default to limit of 20', async () => {
      const manyJockeys = Array.from({ length: 30 }, (_, i) => ({
        ...mockJockeyResultItems[0],
        jkNo: String(i + 1).padStart(3, '0'),
        rcCnt: '100',
      }));
      mockKraApiAllMeets.mockResolvedValue(manyJockeys);

      const result = await fetchJockeyRanking();

      expect(result).toHaveLength(20);
    });

    it('should fetch specific meet when provided', async () => {
      mockKraApi.mockResolvedValue([mockJockeyResultItems[0]]);

      await fetchJockeyRanking('1', 20, '20241225');

      expect(mockKraApi).toHaveBeenCalledWith('JOCKEY_RESULT', '20241225', {
        meet: '1',
        numOfRows: 100,
      });
      expect(mockKraApiAllMeets).not.toHaveBeenCalled();
    });

    it('should fetch all meets when no meet specified', async () => {
      mockKraApiAllMeets.mockResolvedValue(mockJockeyResultItems);

      await fetchJockeyRanking();

      expect(mockKraApiAllMeets).toHaveBeenCalled();
      expect(mockKraApi).not.toHaveBeenCalled();
    });

    it('should sort by win rate descending', async () => {
      const unsortedJockeys = [
        { ...mockJockeyResultItems[0], jkNo: '001', rcCnt: '100', winRate: '20.0' },
        { ...mockJockeyResultItems[0], jkNo: '002', rcCnt: '100', winRate: '30.0' },
        { ...mockJockeyResultItems[0], jkNo: '003', rcCnt: '100', winRate: '25.0' },
      ];
      mockKraApiAllMeets.mockResolvedValue(unsortedJockeys);

      const result = await fetchJockeyRanking();

      expect(result[0].winRate).toBe(30);
      expect(result[1].winRate).toBe(25);
      expect(result[2].winRate).toBe(20);
    });
  });

  describe('fetchJockeyResultsSafe', () => {
    it('should return FetchResult structure', async () => {
      mockKraApiSafe.mockResolvedValue({ data: mockJockeyResultItems });

      const result = await fetchJockeyResultsSafe('1');

      expect(result).toHaveProperty('data');
      expect(result.data).toHaveLength(2);
    });

    it('should include isStale and warning when present', async () => {
      mockKraApiSafe.mockResolvedValue({
        data: [],
        isStale: true,
        warning: 'API 지연',
      });

      const result = await fetchJockeyResultsSafe('1');

      expect(result.isStale).toBe(true);
      expect(result.warning).toBe('API 지연');
    });

    it('should map data to Jockey objects', async () => {
      mockKraApiSafe.mockResolvedValue({ data: [mockJockeyResultItems[0]] });

      const result = await fetchJockeyResultsSafe('1');

      expect(result.data[0]).toMatchObject({
        id: '001',
        name: '홍길동',
        meet: '1',
      });
    });
  });
});
