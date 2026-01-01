/**
 * KRA API Client Tests
 *
 * 공공데이터 포털 한국마사회 API 클라이언트 테스트
 */

import { kraApi, kraApiSafe, kraApiAllMeets, getTodayDate, getTodayYearMonth, formatDateParam, parseDateParam } from './client';
import * as fetcher from '../fetcher';

// Mock fetcher module
jest.mock('../fetcher', () => ({
  fetchApi: jest.fn(),
  fetchApiSafe: jest.fn(),
}));

const mockFetchApi = fetcher.fetchApi as jest.MockedFunction<typeof fetcher.fetchApi>;
const mockFetchApiSafe = fetcher.fetchApiSafe as jest.MockedFunction<typeof fetcher.fetchApiSafe>;

describe('KRA API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.KRA_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    delete process.env.KRA_API_KEY;
  });

  describe('kraApi', () => {
    it('should call fetchApi with correct parameters', async () => {
      const mockItems = [{ jkNo: '001', jkName: '홍길동' }];
      mockFetchApi.mockResolvedValue(mockItems);

      const result = await kraApi('JOCKEY_RESULT', '20241225', { meet: '1' });

      expect(mockFetchApi).toHaveBeenCalledWith(
        'https://apis.data.go.kr/B551015',
        '/API11_1/jockeyResult_1',
        'test-api-key',
        { meet: '1' },
        '20241225',
        'KRA JOCKEY_RESULT',
        'KRA_API_KEY',
        'rc_date'
      );
      expect(result).toEqual(mockItems);
    });

    it('should include numOfRows and pageNo parameters', async () => {
      mockFetchApi.mockResolvedValue([]);

      await kraApi('JOCKEY_RESULT', '20241225', {
        meet: '1',
        numOfRows: 50,
        pageNo: 2,
      });

      expect(mockFetchApi).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
        { meet: '1', numOfRows: '50', pageNo: '2' },
        '20241225',
        expect.any(String),
        expect.any(String),
        expect.any(String)
      );
    });

    it('should include custom params', async () => {
      mockFetchApi.mockResolvedValue([]);

      await kraApi('JOCKEY_RESULT', '20241225', {
        params: { jkNo: '001' },
      });

      expect(mockFetchApi).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
        { jkNo: '001' },
        '20241225',
        expect.any(String),
        expect.any(String),
        expect.any(String)
      );
    });

    it('should use correct endpoint for TRAINER_INFO', async () => {
      mockFetchApi.mockResolvedValue([]);

      await kraApi('TRAINER_INFO', '20241225', { meet: '1' });

      expect(mockFetchApi).toHaveBeenCalledWith(
        'https://apis.data.go.kr/B551015',
        '/API308/trainerInfo',
        expect.any(String),
        expect.any(Object),
        '20241225',
        'KRA TRAINER_INFO',
        expect.any(String),
        'rc_date'
      );
    });

    it('should use correct endpoint for HORSE_INFO', async () => {
      mockFetchApi.mockResolvedValue([]);

      await kraApi('HORSE_INFO', '20241225', { meet: '1' });

      expect(mockFetchApi).toHaveBeenCalledWith(
        'https://apis.data.go.kr/B551015',
        '/API8_2/raceHorseInfo_2',
        expect.any(String),
        expect.any(Object),
        '20241225',
        'KRA HORSE_INFO',
        expect.any(String),
        'rc_date'
      );
    });

    it('should propagate errors from fetchApi', async () => {
      const error = new Error('API Error');
      mockFetchApi.mockRejectedValue(error);

      await expect(kraApi('JOCKEY_RESULT', '20241225')).rejects.toThrow('API Error');
    });
  });

  describe('kraApiSafe', () => {
    it('should return data with FetchResult structure', async () => {
      const mockItems = [{ jkNo: '001', jkName: '홍길동' }];
      mockFetchApiSafe.mockResolvedValue({ data: mockItems });

      const result = await kraApiSafe('JOCKEY_RESULT', '20241225', { meet: '1' });

      expect(result).toEqual({
        data: mockItems,
        isStale: undefined,
        warning: undefined,
      });
    });

    it('should return empty array with warning on error', async () => {
      mockFetchApiSafe.mockResolvedValue({
        data: [],
        isStale: true,
        warning: '데이터 제공 기관(API) 지연으로 최신 정보가 표시되지 않을 수 있습니다.',
      });

      const result = await kraApiSafe('JOCKEY_RESULT', '20241225');

      expect(result.data).toEqual([]);
      expect(result.isStale).toBe(true);
      expect(result.warning).toBeDefined();
    });

    it('should call fetchApiSafe with correct parameters', async () => {
      mockFetchApiSafe.mockResolvedValue({ data: [] });

      await kraApiSafe('TRAINER_INFO', '20241225', { meet: '3' });

      expect(mockFetchApiSafe).toHaveBeenCalledWith(
        'https://apis.data.go.kr/B551015',
        '/API308/trainerInfo',
        'test-api-key',
        { meet: '3' },
        '20241225',
        'KRA TRAINER_INFO',
        'KRA_API_KEY',
        'rc_date'
      );
    });
  });

  describe('kraApiAllMeets', () => {
    it('should fetch data from all three meets', async () => {
      const seoulData = [{ jkNo: '001', meet: '1' }];
      const jejuData = [{ jkNo: '002', meet: '2' }];
      const busanData = [{ jkNo: '003', meet: '3' }];

      mockFetchApiSafe
        .mockResolvedValueOnce({ data: seoulData })
        .mockResolvedValueOnce({ data: jejuData })
        .mockResolvedValueOnce({ data: busanData });

      const result = await kraApiAllMeets('JOCKEY_RESULT', '20241225');

      expect(mockFetchApiSafe).toHaveBeenCalledTimes(3);
      expect(result).toHaveLength(3);
      expect(result).toContainEqual({ jkNo: '001', meet: '1' });
      expect(result).toContainEqual({ jkNo: '002', meet: '2' });
      expect(result).toContainEqual({ jkNo: '003', meet: '3' });
    });

    it('should handle partial failures gracefully', async () => {
      const seoulData = [{ jkNo: '001', meet: '1' }];

      mockFetchApiSafe
        .mockResolvedValueOnce({ data: seoulData })
        .mockResolvedValueOnce({ data: [], isStale: true })
        .mockResolvedValueOnce({ data: [], isStale: true });

      const result = await kraApiAllMeets('JOCKEY_RESULT', '20241225');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ jkNo: '001', meet: '1' });
    });

    it('should return empty array when all meets fail', async () => {
      mockFetchApiSafe.mockResolvedValue({ data: [], isStale: true });

      const result = await kraApiAllMeets('JOCKEY_RESULT', '20241225');

      expect(result).toEqual([]);
    });

    it('should pass options to each meet request', async () => {
      mockFetchApiSafe.mockResolvedValue({ data: [] });

      await kraApiAllMeets('JOCKEY_RESULT', '20241225', { numOfRows: 50 });

      // kraApiAllMeets internally calls kraApiSafe, which calls fetchApiSafe
      // The numOfRows should be converted to string
      expect(mockFetchApiSafe).toHaveBeenCalledWith(
        'https://apis.data.go.kr/B551015',
        '/API11_1/jockeyResult_1',
        'test-api-key',
        expect.objectContaining({ meet: '1', numOfRows: '50' }),
        '20241225',
        'KRA JOCKEY_RESULT',
        'KRA_API_KEY',
        'rc_date'
      );
      expect(mockFetchApiSafe).toHaveBeenCalledWith(
        'https://apis.data.go.kr/B551015',
        '/API11_1/jockeyResult_1',
        'test-api-key',
        expect.objectContaining({ meet: '2', numOfRows: '50' }),
        '20241225',
        'KRA JOCKEY_RESULT',
        'KRA_API_KEY',
        'rc_date'
      );
      expect(mockFetchApiSafe).toHaveBeenCalledWith(
        'https://apis.data.go.kr/B551015',
        '/API11_1/jockeyResult_1',
        'test-api-key',
        expect.objectContaining({ meet: '3', numOfRows: '50' }),
        '20241225',
        'KRA JOCKEY_RESULT',
        'KRA_API_KEY',
        'rc_date'
      );
    });
  });

  describe('Date Helper Functions', () => {
    describe('getTodayDate', () => {
      it('should return date in YYYYMMDD format', () => {
        const result = getTodayDate();
        expect(result).toMatch(/^\d{8}$/);
      });

      it('should return correct date', () => {
        const now = new Date();
        const expected = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
        expect(getTodayDate()).toBe(expected);
      });
    });

    describe('getTodayYearMonth', () => {
      it('should return date in YYYYMM format', () => {
        const result = getTodayYearMonth();
        expect(result).toMatch(/^\d{6}$/);
      });

      it('should return correct year and month', () => {
        const now = new Date();
        const expected = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
        expect(getTodayYearMonth()).toBe(expected);
      });
    });

    describe('formatDateParam', () => {
      it('should convert YYYY-MM-DD to YYYYMMDD', () => {
        expect(formatDateParam('2024-12-25')).toBe('20241225');
      });

      it('should handle already formatted dates', () => {
        expect(formatDateParam('20241225')).toBe('20241225');
      });

      it('should remove all dashes', () => {
        expect(formatDateParam('2024-01-01')).toBe('20240101');
      });
    });

    describe('parseDateParam', () => {
      it('should convert YYYYMMDD to YYYY-MM-DD', () => {
        expect(parseDateParam('20241225')).toBe('2024-12-25');
      });

      it('should handle non-8-character strings', () => {
        expect(parseDateParam('2024')).toBe('2024');
        expect(parseDateParam('202412')).toBe('202412');
      });

      it('should correctly parse month boundaries', () => {
        expect(parseDateParam('20240101')).toBe('2024-01-01');
        expect(parseDateParam('20241231')).toBe('2024-12-31');
      });
    });
  });
});
