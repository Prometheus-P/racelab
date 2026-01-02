/**
 * KRA Odds API Tests
 *
 * 배당률 정보 조회 API 테스트
 */

import {
  fetchOdds,
  fetchAllOdds,
  fetchRaceOdds,
  fetchOddsSafe,
  extractWinOdds,
  extractPlaceOdds,
  getOddsFavoriteOrder,
  getHorseOdds,
} from './odds';
import * as client from './client';
import type { RaceOdds } from './types';

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
const mockOddsItems = [
  // 1경주 단승
  { meet: '1', rcDate: '20241225', rcNo: '1', betType: 'WIN', hrNo1: '1', odds: '2.5' },
  { meet: '1', rcDate: '20241225', rcNo: '1', betType: 'WIN', hrNo1: '2', odds: '3.1' },
  { meet: '1', rcDate: '20241225', rcNo: '1', betType: 'WIN', hrNo1: '3', odds: '5.0' },
  // 1경주 연승
  { meet: '1', rcDate: '20241225', rcNo: '1', betType: 'PLC', hrNo1: '1', odds: '1.5' },
  { meet: '1', rcDate: '20241225', rcNo: '1', betType: 'PLC', hrNo1: '2', odds: '1.8' },
  // 1경주 복승
  { meet: '1', rcDate: '20241225', rcNo: '1', betType: 'QNL', hrNo1: '1', hrNo2: '2', odds: '4.5' },
  // 1경주 쌍승
  { meet: '1', rcDate: '20241225', rcNo: '1', betType: 'EXA', hrNo1: '1', hrNo2: '2', odds: '8.2' },
  // 2경주 단승
  { meet: '1', rcDate: '20241225', rcNo: '2', betType: 'WIN', hrNo1: '1', odds: '4.0' },
  { meet: '1', rcDate: '20241225', rcNo: '2', betType: 'WIN', hrNo1: '2', odds: '2.0' },
];

const mockMultiMeetOddsItems = [
  // 서울 1경주
  { meet: '1', rcDate: '20241225', rcNo: '1', betType: 'WIN', hrNo1: '1', odds: '2.5' },
  // 제주 1경주
  { meet: '2', rcDate: '20241225', rcNo: '1', betType: 'WIN', hrNo1: '1', odds: '3.0' },
  // 부경 1경주
  { meet: '3', rcDate: '20241225', rcNo: '1', betType: 'WIN', hrNo1: '1', odds: '3.5' },
];

describe('KRA Odds API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTodayDate.mockReturnValue('20241225');
  });

  describe('fetchOdds', () => {
    it('should fetch odds for a specific meet', async () => {
      mockKraApi.mockResolvedValue(mockOddsItems);

      const result = await fetchOdds('1');

      expect(mockKraApi).toHaveBeenCalledWith('ODDS_FINAL', '20241225', {
        meet: '1',
        numOfRows: 1000,
      });
      expect(result).toHaveLength(2); // 2 races
    });

    it('should use provided date instead of today', async () => {
      mockKraApi.mockResolvedValue([]);

      await fetchOdds('1', '20241201');

      expect(mockKraApi).toHaveBeenCalledWith('ODDS_FINAL', '20241201', expect.any(Object));
    });

    it('should return mapped RaceOdds objects', async () => {
      mockKraApi.mockResolvedValue(mockOddsItems);

      const result = await fetchOdds('1');

      // 1경주 확인
      const race1 = result.find((r) => r.raceNo === 1);
      expect(race1).toBeDefined();
      expect(race1?.meet).toBe('서울');
      expect(race1?.win['1']).toBe(2.5);
      expect(race1?.win['2']).toBe(3.1);
      expect(race1?.place['1']).toBe(1.5);
      expect(race1?.quinella?.['1-2']).toBe(4.5);
      expect(race1?.exacta?.['1-2']).toBe(8.2);
    });

    it('should return empty array when no data', async () => {
      mockKraApi.mockResolvedValue([]);

      const result = await fetchOdds('1');

      expect(result).toEqual([]);
    });
  });

  describe('fetchAllOdds', () => {
    it('should fetch odds from all meets', async () => {
      mockKraApiAllMeets.mockResolvedValue(mockMultiMeetOddsItems);

      const result = await fetchAllOdds();

      expect(mockKraApiAllMeets).toHaveBeenCalledWith('ODDS_FINAL', '20241225', {
        numOfRows: 1000,
      });
      expect(result).toHaveLength(3); // 3 meets, 1 race each
    });

    it('should use provided date', async () => {
      mockKraApiAllMeets.mockResolvedValue([]);

      await fetchAllOdds('20241201');

      expect(mockKraApiAllMeets).toHaveBeenCalledWith('ODDS_FINAL', '20241201', expect.any(Object));
    });

    it('should map odds by meet correctly', async () => {
      mockKraApiAllMeets.mockResolvedValue(mockMultiMeetOddsItems);

      const result = await fetchAllOdds();

      const seoulRace = result.find((r) => r.meet === '서울');
      const jejuRace = result.find((r) => r.meet === '제주');
      const busanRace = result.find((r) => r.meet === '부경');

      expect(seoulRace?.win['1']).toBe(2.5);
      expect(jejuRace?.win['1']).toBe(3.0);
      expect(busanRace?.win['1']).toBe(3.5);
    });
  });

  describe('fetchRaceOdds', () => {
    it('should fetch odds for a specific race', async () => {
      mockKraApi.mockResolvedValue(mockOddsItems);

      const result = await fetchRaceOdds('1', 1);

      expect(mockKraApi).toHaveBeenCalledWith('ODDS_FINAL', '20241225', {
        meet: '1',
        params: { rcNo: '1' },
        numOfRows: 200,
      });
      expect(result).not.toBeNull();
      expect(result?.raceNo).toBe(1);
    });

    it('should return null when race not found', async () => {
      mockKraApi.mockResolvedValue([]);

      const result = await fetchRaceOdds('1', 99);

      expect(result).toBeNull();
    });

    it('should use provided date', async () => {
      mockKraApi.mockResolvedValue([]);

      await fetchRaceOdds('1', 1, '20241201');

      expect(mockKraApi).toHaveBeenCalledWith('ODDS_FINAL', '20241201', expect.any(Object));
    });

    it('should return specific race odds with all bet types', async () => {
      mockKraApi.mockResolvedValue(mockOddsItems.filter((o) => o.rcNo === '1'));

      const result = await fetchRaceOdds('1', 1);

      expect(result?.win).toEqual({ '1': 2.5, '2': 3.1, '3': 5.0 });
      expect(result?.place).toEqual({ '1': 1.5, '2': 1.8 });
      expect(result?.quinella).toEqual({ '1-2': 4.5 });
      expect(result?.exacta).toEqual({ '1-2': 8.2 });
    });
  });

  describe('fetchOddsSafe', () => {
    it('should return FetchResult structure', async () => {
      mockKraApiSafe.mockResolvedValue({ data: mockOddsItems });

      const result = await fetchOddsSafe('1');

      expect(result).toHaveProperty('data');
      expect(result.data).toHaveLength(2);
    });

    it('should include isStale and warning when present', async () => {
      mockKraApiSafe.mockResolvedValue({
        data: [],
        isStale: true,
        warning: 'API 지연',
      });

      const result = await fetchOddsSafe('1');

      expect(result.isStale).toBe(true);
      expect(result.warning).toBe('API 지연');
    });

    it('should map data to RaceOdds objects', async () => {
      mockKraApiSafe.mockResolvedValue({
        data: mockOddsItems.filter((o) => o.rcNo === '1'),
      });

      const result = await fetchOddsSafe('1');

      expect(result.data[0]).toMatchObject({
        meet: '서울',
        raceNo: 1,
      });
    });
  });

  describe('extractWinOdds', () => {
    it('should extract win odds from RaceOdds', () => {
      const raceOdds: RaceOdds = {
        raceDate: '20241225',
        meet: '서울',
        raceNo: 1,
        win: { '1': 2.5, '2': 3.1, '3': 5.0 },
        place: { '1': 1.5, '2': 1.8 },
      };

      const result = extractWinOdds(raceOdds);

      expect(result).toEqual({ '1': 2.5, '2': 3.1, '3': 5.0 });
    });
  });

  describe('extractPlaceOdds', () => {
    it('should extract place odds from RaceOdds', () => {
      const raceOdds: RaceOdds = {
        raceDate: '20241225',
        meet: '서울',
        raceNo: 1,
        win: { '1': 2.5, '2': 3.1 },
        place: { '1': 1.5, '2': 1.8 },
      };

      const result = extractPlaceOdds(raceOdds);

      expect(result).toEqual({ '1': 1.5, '2': 1.8 });
    });
  });

  describe('getOddsFavoriteOrder', () => {
    it('should return horse numbers sorted by win odds (ascending)', () => {
      const raceOdds: RaceOdds = {
        raceDate: '20241225',
        meet: '서울',
        raceNo: 1,
        win: { '1': 5.0, '2': 2.5, '3': 3.1, '4': 10.0 },
        place: {},
      };

      const result = getOddsFavoriteOrder(raceOdds);

      // 낮은 배당률 = 높은 인기
      expect(result).toEqual(['2', '3', '1', '4']);
    });

    it('should return empty array for empty odds', () => {
      const raceOdds: RaceOdds = {
        raceDate: '20241225',
        meet: '서울',
        raceNo: 1,
        win: {},
        place: {},
      };

      const result = getOddsFavoriteOrder(raceOdds);

      expect(result).toEqual([]);
    });
  });

  describe('getHorseOdds', () => {
    it('should return win and place odds for a specific horse', () => {
      const raceOdds: RaceOdds = {
        raceDate: '20241225',
        meet: '서울',
        raceNo: 1,
        win: { '1': 2.5, '2': 3.1 },
        place: { '1': 1.5, '2': 1.8 },
      };

      const result = getHorseOdds(raceOdds, '1');

      expect(result).toEqual({ win: 2.5, place: 1.5 });
    });

    it('should return 0 for missing horse', () => {
      const raceOdds: RaceOdds = {
        raceDate: '20241225',
        meet: '서울',
        raceNo: 1,
        win: { '1': 2.5 },
        place: { '1': 1.5 },
      };

      const result = getHorseOdds(raceOdds, '99');

      expect(result).toEqual({ win: 0, place: 0 });
    });

    it('should return 0 for missing place odds only', () => {
      const raceOdds: RaceOdds = {
        raceDate: '20241225',
        meet: '서울',
        raceNo: 1,
        win: { '1': 2.5 },
        place: {},
      };

      const result = getHorseOdds(raceOdds, '1');

      expect(result).toEqual({ win: 2.5, place: 0 });
    });
  });
});

describe('Odds Mappers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTodayDate.mockReturnValue('20241225');
  });

  describe('mapOddsItems grouping', () => {
    it('should group odds by race correctly', async () => {
      mockKraApi.mockResolvedValue(mockOddsItems);

      const result = await fetchOdds('1');

      // 2개의 경주로 그룹화됨
      expect(result).toHaveLength(2);

      const race1 = result.find((r) => r.raceNo === 1);
      const race2 = result.find((r) => r.raceNo === 2);

      expect(race1).toBeDefined();
      expect(race2).toBeDefined();
    });

    it('should handle quinella place (QPL) bet type', async () => {
      const oddsWithQPL = [
        { meet: '1', rcDate: '20241225', rcNo: '1', betType: 'QPL', hrNo1: '1', hrNo2: '2', odds: '2.3' },
      ];
      mockKraApi.mockResolvedValue(oddsWithQPL);

      const result = await fetchOdds('1');

      expect(result[0].quinellaPlace?.['1-2']).toBe(2.3);
    });

    it('should handle trifecta (TLA) bet type', async () => {
      const oddsWithTLA = [
        { meet: '1', rcDate: '20241225', rcNo: '1', betType: 'TLA', hrNo1: '1', hrNo2: '2', hrNo3: '3', odds: '50.0' },
      ];
      mockKraApi.mockResolvedValue(oddsWithTLA);

      const result = await fetchOdds('1');

      expect(result[0].trifecta?.['1-2-3']).toBe(50.0);
    });

    it('should sort quinella keys correctly', async () => {
      // hrNo1: '3', hrNo2: '1' -> key should be '1-3' (sorted)
      const oddsWithQNL = [
        { meet: '1', rcDate: '20241225', rcNo: '1', betType: 'QNL', hrNo1: '3', hrNo2: '1', odds: '6.0' },
      ];
      mockKraApi.mockResolvedValue(oddsWithQNL);

      const result = await fetchOdds('1');

      expect(result[0].quinella?.['1-3']).toBe(6.0);
    });
  });
});
