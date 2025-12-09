// src/lib/api/kspoBoatClient.test.ts

import { fetchBoatRaceSchedules } from './kspoBoatClient';
import { fetchApi } from './fetcher';
import { mapKSPOBoatRaceInfoToRaces, KSPOBoatRaceInfoItem } from '../api-helpers/mappers';

// Mock dependencies
jest.mock('./fetcher');
jest.mock('../api-helpers/mappers');

const mockFetchApi = fetchApi as jest.MockedFunction<typeof fetchApi>;
const mockMapKSPOBoatRaceInfoToRaces = mapKSPOBoatRaceInfoToRaces as jest.MockedFunction<typeof mapKSPOBoatRaceInfoToRaces>;

describe('kspoBoatClient', () => {
  const mockDate = '20251209';
  const mockApiKey = 'TEST_KSPO_API_KEY';
  const mockRawItems: KSPOBoatRaceInfoItem[] = [
    {
      rcDate: '20251209',
      rcNo: '1',
      meet: '미사리',
      // ... other KSPOBoatRaceInfoItem properties
    },
  ];
  const mockMappedRaces: any[] = [{ id: 'boat-1-1-20251209', type: 'boat' }]; // Simplified Race object

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.KSPO_API_KEY = mockApiKey;
  });

  afterEach(() => {
    delete process.env.KSPO_API_KEY;
  });

  describe('fetchBoatRaceSchedules', () => {
    it('should fetch KSPO boat race schedules and map them correctly', async () => {
      mockFetchApi.mockResolvedValueOnce(mockRawItems);
      mockMapKSPOBoatRaceInfoToRaces.mockReturnValueOnce(mockMappedRaces);

      const result = await fetchBoatRaceSchedules(mockDate);

      expect(mockFetchApi).toHaveBeenCalledTimes(1);
      expect(mockFetchApi).toHaveBeenCalledWith(
        'https://apis.data.go.kr/B551014',
        '/SRVC_OD_API_VWEB_MBR_RACE_INFO/TODZ_API_VWEB_MBR_RACE_I',
        mockApiKey,
        { resultType: 'json' },
        mockDate,
        'KSPO Boat',
        'KSPO_API_KEY'
      );
      expect(mockMapKSPOBoatRaceInfoToRaces).toHaveBeenCalledTimes(1);
      expect(mockMapKSPOBoatRaceInfoToRaces).toHaveBeenCalledWith(mockRawItems, mockDate);
      expect(result).toEqual(mockMappedRaces);
    });

    it('should return an empty array if KSPO_API_KEY is not set', async () => {
      delete process.env.KSPO_API_KEY; // Simulate missing API key
      mockFetchApi.mockResolvedValueOnce([]); // fetchApi will return empty array due to internal check
      mockMapKSPOBoatRaceInfoToRaces.mockReturnValueOnce([]); // mapper called with empty rawItems

      const result = await fetchBoatRaceSchedules(mockDate);

      expect(mockFetchApi).toHaveBeenCalledTimes(1); // fetchApi is called, but returns empty due to internal check
      expect(mockFetchApi).toHaveBeenCalledWith(
        'https://apis.data.go.kr/B551014',
        '/SRVC_OD_API_VWEB_MBR_RACE_INFO/TODZ_API_VWEB_MBR_RACE_I',
        undefined, // KSPO_API_KEY is undefined
        { resultType: 'json' },
        mockDate,
        'KSPO Boat',
        'KSPO_API_KEY'
      );
      expect(mockMapKSPOBoatRaceInfoToRaces).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it('should handle fetchApi returning an empty array', async () => {
      mockFetchApi.mockResolvedValueOnce([]);
      mockMapKSPOBoatRaceInfoToRaces.mockReturnValueOnce([]);

      const result = await fetchBoatRaceSchedules(mockDate);

      expect(mockFetchApi).toHaveBeenCalledTimes(1);
      expect(mockMapKSPOBoatRaceInfoToRaces).toHaveBeenCalledTimes(1); // Mapper still called with empty array
      expect(result).toEqual([]);
    });

    it('should handle fetchApi throwing an error', async () => {
      const mockError = new Error('Network error');
      mockFetchApi.mockRejectedValueOnce(mockError);

      await expect(fetchBoatRaceSchedules(mockDate)).rejects.toThrow(mockError);
      expect(mockFetchApi).toHaveBeenCalledTimes(1);
      expect(mockMapKSPOBoatRaceInfoToRaces).not.toHaveBeenCalled();
    });
  });
});
