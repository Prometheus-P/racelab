/**
 * KRA Horse API Tests
 *
 * 마필 정보 조회 API 테스트
 */

import {
  fetchHorseList,
  fetchAllHorses,
  fetchHorseInfo,
  fetchHorseRaceHistory,
  searchHorsesByName,
  fetchHorseRanking,
  fetchHorsesByGrade,
  fetchHorseListSafe,
  fetchHorseDetail,
} from './horse';
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
const mockHorseInfoItems = [
  {
    meet: '1',
    hrNo: 'H001',
    hrName: '명마',
    hrNameEn: 'Famous Horse',
    sex: '수',
    age: '5',
    birthday: '20190315',
    wlClass: '1',
    trName: '박영수',
    owName: '김마주',
    rating: '92',
    rcCnt: '30',
    ord1Cnt: '10',
    ord2Cnt: '8',
    ord3Cnt: '5',
    prize: '500000000',
    rcCnt1y: '10',
    ord1Cnt1y: '4',
  },
  {
    meet: '1',
    hrNo: 'H002',
    hrName: '쾌속마',
    hrNameEn: 'Fast Horse',
    sex: '암',
    age: '4',
    birthday: '20200615',
    wlClass: '2',
    trName: '이순신',
    owName: '박마주',
    rating: '85',
    rcCnt: '20',
    ord1Cnt: '6',
    ord2Cnt: '5',
    ord3Cnt: '4',
    prize: '200000000',
    rcCnt1y: '8',
    ord1Cnt1y: '3',
  },
];

const mockHorseTotalInfoItem = {
  hrNo: 'H001',
  hrName: '명마',
  hrNameEn: 'Famous Horse',
  birthNa: '한국',
  impNa: '',
  breedNm: '더러브레드',
  coatColor: '밤색',
  fatherHr: '부마명',
  motherHr: '모마명',
  grandfatherHr: '외조부마명',
};

const mockHorseResultItems = [
  {
    hrNo: 'H001',
    rcDate: '20241225',
    meet: '1',
    rcNo: '5',
    rcDist: '1400',
    ord: '1',
    rcTime: '1:23.45',
    jkName: '홍길동',
    wgHr: '480',
    wgBu: '57',
    oddWin: '2.5',
    oddPlc: '1.3',
  },
  {
    hrNo: 'H001',
    rcDate: '20241218',
    meet: '1',
    rcNo: '3',
    rcDist: '1200',
    ord: '2',
    rcTime: '1:11.50',
    jkName: '김철수',
    wgHr: '478',
    wgBu: '57',
    oddWin: '3.1',
    oddPlc: '1.5',
  },
];

describe('KRA Horse API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTodayDate.mockReturnValue('20241225');
  });

  describe('fetchHorseList', () => {
    it('should fetch horse list for a specific meet', async () => {
      mockKraApi.mockResolvedValue(mockHorseInfoItems);

      const result = await fetchHorseList('1');

      expect(mockKraApi).toHaveBeenCalledWith('HORSE_INFO', '20241225', {
        meet: '1',
        numOfRows: 100,
      });
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('명마');
      expect(result[1].name).toBe('쾌속마');
    });

    it('should use provided date instead of today', async () => {
      mockKraApi.mockResolvedValue([]);

      await fetchHorseList('1', '20241201');

      expect(mockKraApi).toHaveBeenCalledWith('HORSE_INFO', '20241201', expect.any(Object));
    });

    it('should return mapped Horse objects', async () => {
      mockKraApi.mockResolvedValue([mockHorseInfoItems[0]]);

      const result = await fetchHorseList('1');

      expect(result[0]).toMatchObject({
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
        rating: 92,
      });
    });

    it('should return empty array when no data', async () => {
      mockKraApi.mockResolvedValue([]);

      const result = await fetchHorseList('1');

      expect(result).toEqual([]);
    });
  });

  describe('fetchAllHorses', () => {
    it('should fetch horses from all meets', async () => {
      const allMeetsData = [
        { ...mockHorseInfoItems[0], meet: '1' },
        { ...mockHorseInfoItems[1], meet: '2' },
      ];
      mockKraApiAllMeets.mockResolvedValue(allMeetsData);

      const result = await fetchAllHorses();

      expect(mockKraApiAllMeets).toHaveBeenCalledWith('HORSE_INFO', '20241225', {
        numOfRows: 100,
      });
      expect(result).toHaveLength(2);
    });

    it('should sort results by rating', async () => {
      const unsortedData = [
        { ...mockHorseInfoItems[0], rating: '85' },
        { ...mockHorseInfoItems[1], rating: '92' },
      ];
      mockKraApiAllMeets.mockResolvedValue(unsortedData);

      const result = await fetchAllHorses();

      expect(result[0].rating).toBe(92);
      expect(result[1].rating).toBe(85);
    });

    it('should use provided date', async () => {
      mockKraApiAllMeets.mockResolvedValue([]);

      await fetchAllHorses('20241201');

      expect(mockKraApiAllMeets).toHaveBeenCalledWith('HORSE_INFO', '20241201', expect.any(Object));
    });
  });

  describe('fetchHorseInfo', () => {
    it('should return null when horse not found', async () => {
      mockKraApi.mockResolvedValue([]);

      const result = await fetchHorseInfo('H999');

      expect(result).toBeNull();
    });

    it('should return horse with basic info when total info fetch fails', async () => {
      mockKraApi
        .mockResolvedValueOnce([mockHorseInfoItems[0]]) // HORSE_INFO
        .mockRejectedValueOnce(new Error('API Error')); // HORSE_TOTAL_INFO fails

      const result = await fetchHorseInfo('H001');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('H001');
      expect(result?.name).toBe('명마');
      expect(result?.sire).toBeUndefined(); // No pedigree info
    });

    it('should merge total info when available', async () => {
      mockKraApi
        .mockResolvedValueOnce([mockHorseInfoItems[0]]) // HORSE_INFO
        .mockResolvedValueOnce([mockHorseTotalInfoItem]); // HORSE_TOTAL_INFO

      const result = await fetchHorseInfo('H001');

      expect(result?.sire).toBe('부마명');
      expect(result?.dam).toBe('모마명');
      expect(result?.grandsire).toBe('외조부마명');
      expect(result?.birthCountry).toBe('한국');
      expect(result?.breed).toBe('더러브레드');
      expect(result?.coatColor).toBe('밤색');
    });

    it('should call API with correct parameters', async () => {
      mockKraApi
        .mockResolvedValueOnce([mockHorseInfoItems[0]])
        .mockResolvedValueOnce([]);

      await fetchHorseInfo('H001', '1', '20241201');

      expect(mockKraApi).toHaveBeenNthCalledWith(1, 'HORSE_INFO', '20241201', {
        meet: '1',
        params: { hrNo: 'H001' },
      });

      expect(mockKraApi).toHaveBeenNthCalledWith(2, 'HORSE_TOTAL_INFO', '20241201', {
        params: { hrNo: 'H001' },
      });
    });
  });

  describe('fetchHorseRaceHistory', () => {
    it('should fetch race history for a horse', async () => {
      mockKraApi.mockResolvedValue(mockHorseResultItems);

      const result = await fetchHorseRaceHistory('H001');

      expect(mockKraApi).toHaveBeenCalledWith('HORSE_RESULT', '20241225', {
        params: { hrNo: 'H001' },
        numOfRows: 50,
      });
      expect(result).toHaveLength(2);
    });

    it('should return mapped race records', async () => {
      mockKraApi.mockResolvedValue([mockHorseResultItems[0]]);

      const result = await fetchHorseRaceHistory('H001');

      expect(result[0]).toMatchObject({
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
      });
    });

    it('should use provided date', async () => {
      mockKraApi.mockResolvedValue([]);

      await fetchHorseRaceHistory('H001', '20241201');

      expect(mockKraApi).toHaveBeenCalledWith('HORSE_RESULT', '20241201', expect.any(Object));
    });
  });

  describe('searchHorsesByName', () => {
    it('should filter horses by name (case-insensitive)', async () => {
      mockKraApiAllMeets.mockResolvedValue(mockHorseInfoItems);

      const result = await searchHorsesByName('명마');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('명마');
    });

    it('should return all matches for partial name', async () => {
      const moreHorses = [
        ...mockHorseInfoItems,
        { ...mockHorseInfoItems[0], hrNo: 'H003', hrName: '명품마', rating: '88' },
      ];
      mockKraApiAllMeets.mockResolvedValue(moreHorses);

      const result = await searchHorsesByName('명');

      expect(result).toHaveLength(2);
      expect(result.map((h) => h.name)).toContain('명마');
      expect(result.map((h) => h.name)).toContain('명품마');
    });

    it('should return empty array when no match', async () => {
      mockKraApiAllMeets.mockResolvedValue(mockHorseInfoItems);

      const result = await searchHorsesByName('없는마');

      expect(result).toEqual([]);
    });

    it('should sort results by rating', async () => {
      const moreHorses = [
        { ...mockHorseInfoItems[0], hrNo: 'H001', hrName: '명마', rating: '85' },
        { ...mockHorseInfoItems[0], hrNo: 'H003', hrName: '명품마', rating: '95' },
      ];
      mockKraApiAllMeets.mockResolvedValue(moreHorses);

      const result = await searchHorsesByName('명');

      expect(result[0].name).toBe('명품마');
      expect(result[1].name).toBe('명마');
    });
  });

  describe('fetchHorseRanking', () => {
    it('should filter by minimum starts (5)', async () => {
      const mixedStarts = [
        { ...mockHorseInfoItems[0], rcCnt: '10', rating: '90' }, // qualified
        { ...mockHorseInfoItems[1], rcCnt: '3', rating: '95' }, // not qualified
      ];
      mockKraApiAllMeets.mockResolvedValue(mixedStarts);

      const result = await fetchHorseRanking();

      expect(result).toHaveLength(1);
      expect(result[0].totalStarts).toBeGreaterThanOrEqual(5);
    });

    it('should limit results to specified count', async () => {
      const manyHorses = Array.from({ length: 30 }, (_, i) => ({
        ...mockHorseInfoItems[0],
        hrNo: `H${String(i + 1).padStart(3, '0')}`,
        hrName: `마필${i + 1}`,
        rcCnt: '10',
        rating: String(100 - i),
      }));
      mockKraApiAllMeets.mockResolvedValue(manyHorses);

      const result = await fetchHorseRanking(undefined, 10);

      expect(result).toHaveLength(10);
    });

    it('should default to limit of 20', async () => {
      const manyHorses = Array.from({ length: 30 }, (_, i) => ({
        ...mockHorseInfoItems[0],
        hrNo: `H${String(i + 1).padStart(3, '0')}`,
        rcCnt: '10',
      }));
      mockKraApiAllMeets.mockResolvedValue(manyHorses);

      const result = await fetchHorseRanking();

      expect(result).toHaveLength(20);
    });

    it('should fetch specific meet when provided', async () => {
      mockKraApi.mockResolvedValue([mockHorseInfoItems[0]]);

      await fetchHorseRanking('1', 20, '20241225');

      expect(mockKraApi).toHaveBeenCalledWith('HORSE_INFO', '20241225', {
        meet: '1',
        numOfRows: 100,
      });
      expect(mockKraApiAllMeets).not.toHaveBeenCalled();
    });

    it('should fetch all meets when no meet specified', async () => {
      mockKraApiAllMeets.mockResolvedValue(mockHorseInfoItems);

      await fetchHorseRanking();

      expect(mockKraApiAllMeets).toHaveBeenCalled();
      expect(mockKraApi).not.toHaveBeenCalled();
    });

    it('should sort by rating descending', async () => {
      const unsortedHorses = [
        { ...mockHorseInfoItems[0], hrNo: 'H001', rcCnt: '10', rating: '85' },
        { ...mockHorseInfoItems[0], hrNo: 'H002', rcCnt: '10', rating: '92' },
        { ...mockHorseInfoItems[0], hrNo: 'H003', rcCnt: '10', rating: '88' },
      ];
      mockKraApiAllMeets.mockResolvedValue(unsortedHorses);

      const result = await fetchHorseRanking();

      expect(result[0].rating).toBe(92);
      expect(result[1].rating).toBe(88);
      expect(result[2].rating).toBe(85);
    });
  });

  describe('fetchHorsesByGrade', () => {
    it('should filter horses by grade', async () => {
      const mixedGrades = [
        { ...mockHorseInfoItems[0], wlClass: '1' },
        { ...mockHorseInfoItems[1], wlClass: '2' },
        { ...mockHorseInfoItems[0], hrNo: 'H003', wlClass: '1' },
      ];
      mockKraApiAllMeets.mockResolvedValue(mixedGrades);

      const result = await fetchHorsesByGrade('1');

      expect(result).toHaveLength(2);
      expect(result.every((h) => h.grade === '1')).toBe(true);
    });

    it('should fetch from specific meet when provided', async () => {
      mockKraApi.mockResolvedValue([mockHorseInfoItems[0]]);

      await fetchHorsesByGrade('1', '1');

      expect(mockKraApi).toHaveBeenCalledWith('HORSE_INFO', '20241225', {
        meet: '1',
        numOfRows: 100,
      });
    });

    it('should fetch from all meets when meet not provided', async () => {
      mockKraApiAllMeets.mockResolvedValue([mockHorseInfoItems[0]]);

      await fetchHorsesByGrade('1');

      expect(mockKraApiAllMeets).toHaveBeenCalled();
    });

    it('should return empty array when no horses match grade', async () => {
      mockKraApiAllMeets.mockResolvedValue([{ ...mockHorseInfoItems[0], wlClass: '2' }]);

      const result = await fetchHorsesByGrade('1');

      expect(result).toEqual([]);
    });
  });

  describe('fetchHorseListSafe', () => {
    it('should return FetchResult structure', async () => {
      mockKraApiSafe.mockResolvedValue({ data: mockHorseInfoItems });

      const result = await fetchHorseListSafe('1');

      expect(result).toHaveProperty('data');
      expect(result.data).toHaveLength(2);
    });

    it('should include isStale and warning when present', async () => {
      mockKraApiSafe.mockResolvedValue({
        data: [],
        isStale: true,
        warning: 'API 지연',
      });

      const result = await fetchHorseListSafe('1');

      expect(result.isStale).toBe(true);
      expect(result.warning).toBe('API 지연');
    });

    it('should map data to Horse objects', async () => {
      mockKraApiSafe.mockResolvedValue({ data: [mockHorseInfoItems[0]] });

      const result = await fetchHorseListSafe('1');

      expect(result.data[0]).toMatchObject({
        id: 'H001',
        name: '명마',
        meet: '1',
      });
    });
  });

  describe('fetchHorseDetail', () => {
    it('should fetch both horse info and race history', async () => {
      // fetchHorseDetail calls fetchHorseInfo and fetchHorseRaceHistory in parallel
      // fetchHorseInfo: HORSE_INFO, then HORSE_TOTAL_INFO
      // fetchHorseRaceHistory: HORSE_RESULT
      // Order may vary due to Promise.all, so use mockImplementation
      mockKraApi.mockImplementation((apiKey: string) => {
        if (apiKey === 'HORSE_INFO') {
          return Promise.resolve([mockHorseInfoItems[0]]);
        }
        if (apiKey === 'HORSE_TOTAL_INFO') {
          return Promise.resolve([mockHorseTotalInfoItem]);
        }
        if (apiKey === 'HORSE_RESULT') {
          return Promise.resolve(mockHorseResultItems);
        }
        return Promise.resolve([]);
      });

      const result = await fetchHorseDetail('H001');

      expect(result.horse).not.toBeNull();
      expect(result.horse?.id).toBe('H001');
      expect(result.history).toHaveLength(2);
    });

    it('should return null horse when not found', async () => {
      mockKraApi.mockImplementation((apiKey: string) => {
        if (apiKey === 'HORSE_INFO') {
          return Promise.resolve([]);
        }
        if (apiKey === 'HORSE_RESULT') {
          return Promise.resolve([]);
        }
        return Promise.resolve([]);
      });

      const result = await fetchHorseDetail('H999');

      expect(result.horse).toBeNull();
      expect(result.history).toEqual([]);
    });

    it('should fetch history even if horse info fails', async () => {
      mockKraApi.mockImplementation((apiKey: string) => {
        if (apiKey === 'HORSE_INFO') {
          return Promise.resolve([]);
        }
        if (apiKey === 'HORSE_RESULT') {
          return Promise.resolve(mockHorseResultItems);
        }
        return Promise.resolve([]);
      });

      const result = await fetchHorseDetail('H001');

      expect(result.horse).toBeNull();
      expect(result.history).toHaveLength(2);
    });

    it('should use provided parameters', async () => {
      mockKraApi.mockResolvedValue([]);

      await fetchHorseDetail('H001', '1', '20241201');

      // Check HORSE_INFO call
      expect(mockKraApi).toHaveBeenCalledWith('HORSE_INFO', '20241201', {
        meet: '1',
        params: { hrNo: 'H001' },
      });

      // Check HORSE_RESULT call
      expect(mockKraApi).toHaveBeenCalledWith('HORSE_RESULT', '20241201', {
        params: { hrNo: 'H001' },
        numOfRows: 50,
      });
    });
  });
});
