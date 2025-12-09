// src/lib/api/kspoCycleClient.test.ts

import { fetchCycleRaceSchedules } from './kspoCycleClient';
import { fetchApi } from './fetcher';
import { mapKSPOCycleRaceOrganToRaces, KSPOCycleRaceOrganItem } from '../api-helpers/mappers';

// Mock dependencies
jest.mock('./fetcher');
jest.mock('../api-helpers/mappers');

const mockFetchApi = fetchApi as jest.MockedFunction<typeof fetchApi>;
const mockMapKSPOCycleRaceOrganToRaces = mapKSPOCycleRaceOrganToRaces as jest.MockedFunction<typeof mapKSPOCycleRaceOrganToRaces>;

describe('kspoCycleClient', () => {
  const mockDate = '20251209';
  const mockApiKey = 'TEST_KSPO_API_KEY';
  const mockRawItems: KSPOCycleRaceOrganItem[] = [
    {
      rcDate: '20251209',
      rcNo: '1',
      meet: '광명',
      // ... other KSPOCycleRaceOrganItem properties
    },
  ];
  const mockMappedRaces: any[] = [{ id: 'cycle-1-1-20251209', type: 'cycle' }]; // Simplified Race object

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.KSPO_API_KEY = mockApiKey;
  });

  afterEach(() => {
    delete process.env.KSPO_API_KEY;
  });

  describe('fetchCycleRaceSchedules', () => {
    it('should fetch KSPO cycle race schedules and map them correctly', async () => {
      mockFetchApi.mockResolvedValueOnce(mockRawItems);
      mockMapKSPOCycleRaceOrganToRaces.mockReturnValueOnce(mockMappedRaces);

      const result = await fetchCycleRaceSchedules(mockDate);

      expect(mockFetchApi).toHaveBeenCalledTimes(1);
      expect(mockFetchApi).toHaveBeenCalledWith(
        'https://apis.data.go.kr/B551014',
        '/SRVC_OD_API_CRA_RACE_ORGAN/TODZ_API_CRA_RACE_ORGAN_I',
        mockApiKey,
        { resultType: 'json' },
        mockDate,
        'KSPO Cycle',
        'KSPO_API_KEY'
      );
      expect(mockMapKSPOCycleRaceOrganToRaces).toHaveBeenCalledTimes(1);
      expect(mockMapKSPOCycleRaceOrganToRaces).toHaveBeenCalledWith(mockRawItems, mockDate);
      expect(result).toEqual(mockMappedRaces);
    });

    it('should return an empty array if KSPO_API_KEY is not set', async () => {
      delete process.env.KSPO_API_KEY; // Simulate missing API key
      mockFetchApi.mockResolvedValueOnce([]); // fetchApi will return empty array due to internal check
      mockMapKSPOCycleRaceOrganToRaces.mockReturnValueOnce([]); // mapper called with empty rawItems

      const result = await fetchCycleRaceSchedules(mockDate);

      expect(mockFetchApi).toHaveBeenCalledTimes(1); // fetchApi is called, but returns empty due to internal check
      expect(mockFetchApi).toHaveBeenCalledWith(
        'https://apis.data.go.kr/B551014',
        '/SRVC_OD_API_CRA_RACE_ORGAN/TODZ_API_CRA_RACE_ORGAN_I',
        undefined, // KSPO_API_KEY is undefined
        { resultType: 'json' },
        mockDate,
        'KSPO Cycle',
        'KSPO_API_KEY'
      );
      expect(mockMapKSPOCycleRaceOrganToRaces).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it('should handle fetchApi returning an empty array', async () => {
      mockFetchApi.mockResolvedValueOnce([]);
      mockMapKSPOCycleRaceOrganToRaces.mockReturnValueOnce([]);

      const result = await fetchCycleRaceSchedules(mockDate);

      expect(mockFetchApi).toHaveBeenCalledTimes(1);
      expect(mockMapKSPOCycleRaceOrganToRaces).toHaveBeenCalledTimes(1); // Mapper still called with empty array
      expect(result).toEqual([]);
    });

    it('should handle fetchApi throwing an error', async () => {
      const mockError = new Error('Network error');
      mockFetchApi.mockRejectedValueOnce(mockError);

      await expect(fetchCycleRaceSchedules(mockDate)).rejects.toThrow(mockError);
      expect(mockFetchApi).toHaveBeenCalledTimes(1);
      expect(mockMapKSPOCycleRaceOrganToRaces).not.toHaveBeenCalled();
    });
  });
});
