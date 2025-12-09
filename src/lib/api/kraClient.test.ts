// src/lib/api/kraClient.test.ts

import { fetchHorseRaceSchedules } from './kraClient';
import { fetchApi } from './fetcher';
import { mapKRA299ToRaces } from '../api-helpers/mappers';
import { KRA299ResultItem } from '../api-helpers/mappers'; // Assuming KRA299ResultItem is exported from mappers

// Mock dependencies
jest.mock('./fetcher');
jest.mock('../api-helpers/mappers');

const mockFetchApi = fetchApi as jest.MockedFunction<typeof fetchApi>;
const mockMapKRA299ToRaces = mapKRA299ToRaces as jest.MockedFunction<typeof mapKRA299ToRaces>;

describe('kraClient', () => {
  const mockDate = '20251209';
  const mockApiKey = 'TEST_KRA_API_KEY';
  const mockRawItems: KRA299ResultItem[] = [
    {
      rcDate: '20251209',
      rcNo: '1',
      meet: '서울',
      // ... other KRA299ResultItem properties
    },
  ];
  const mockMappedRaces: any[] = [{ id: 'horse-1-1-20251209', type: 'horse' }]; // Simplified Race object

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.KRA_API_KEY = mockApiKey;
  });

  afterEach(() => {
    delete process.env.KRA_API_KEY;
  });

  describe('fetchHorseRaceSchedules', () => {
    it('should fetch KRA race schedules and map them correctly', async () => {
      mockFetchApi.mockResolvedValueOnce(mockRawItems);
      mockMapKRA299ToRaces.mockReturnValueOnce(mockMappedRaces);

      const result = await fetchHorseRaceSchedules(mockDate);

      expect(mockFetchApi).toHaveBeenCalledTimes(1);
      expect(mockFetchApi).toHaveBeenCalledWith(
        'https://apis.data.go.kr/B551015',
        '/API299/Race_Result_total',
        mockApiKey,
        {},
        mockDate,
        'KRA API299',
        'KRA_API_KEY'
      );
      expect(mockMapKRA299ToRaces).toHaveBeenCalledTimes(1);
      expect(mockMapKRA299ToRaces).toHaveBeenCalledWith(mockRawItems);
      expect(result).toEqual(mockMappedRaces);
    });

    it('should return an empty array if KRA_API_KEY is not set', async () => {
      delete process.env.KRA_API_KEY; // Simulate missing API key
      mockFetchApi.mockResolvedValueOnce([]); // fetchApi will return empty array due to internal check
      mockMapKRA299ToRaces.mockReturnValueOnce([]); // mapper called with empty rawItems
      const result = await fetchHorseRaceSchedules(mockDate);

      expect(mockFetchApi).toHaveBeenCalledTimes(1); // fetchApi is called, but returns empty due to internal check
      expect(mockFetchApi).toHaveBeenCalledWith(
        'https://apis.data.go.kr/B551015',
        '/API299/Race_Result_total',
        undefined, // KRA_API_KEY is undefined
        {},
        mockDate,
        'KRA API299',
        'KRA_API_KEY'
      );
      expect(mockMapKRA299ToRaces).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it('should handle fetchApi returning an empty array', async () => {
      mockFetchApi.mockResolvedValueOnce([]);
      mockMapKRA299ToRaces.mockReturnValueOnce([]);

      const result = await fetchHorseRaceSchedules(mockDate);

      expect(mockFetchApi).toHaveBeenCalledTimes(1);
      expect(mockMapKRA299ToRaces).toHaveBeenCalledTimes(1); // Mapper still called with empty array
      expect(result).toEqual([]);
    });

    it('should handle fetchApi throwing an error', async () => {
      const mockError = new Error('Network error');
      mockFetchApi.mockRejectedValueOnce(mockError);

      await expect(fetchHorseRaceSchedules(mockDate)).rejects.toThrow(mockError);
      expect(mockFetchApi).toHaveBeenCalledTimes(1);
      expect(mockMapKRA299ToRaces).not.toHaveBeenCalled();
    });
  });
});
