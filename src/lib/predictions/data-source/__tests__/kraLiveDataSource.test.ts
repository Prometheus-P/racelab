/**
 * KRA Live Data Source Integration Tests
 *
 * 실시간 데이터 연동 통합 테스트
 */

import { fetchTodaysRaces, fetchRaceData } from '../kraLiveDataSource';

// =============================================================================
// Mocks
// =============================================================================

const mockJockeys = [
  {
    id: 'JK001',
    name: '문세영',
    meet: '1',
    meetName: '서울',
    part: '1',
    totalStarts: 1000,
    totalWins: 200,
    totalSeconds: 150,
    totalThirds: 100,
    totalPlaces: 450,
    winRate: 20,
    placeRate: 45,
    recentStarts: 100,
    recentWins: 20,
    recentSeconds: 15,
    recentThirds: 10,
    recentPlaces: 45,
    recentWinRate: 20,
    recentPlaceRate: 45,
  },
];

const mockTrainers = [
  {
    id: 'TR001',
    name: '김영관',
    meet: '1',
    meetName: '서울',
    totalStarts: 800,
    totalWins: 150,
    totalSeconds: 120,
    totalThirds: 80,
    totalPlaces: 350,
    winRate: 18.75,
    placeRate: 43.75,
    recentStarts: 80,
    recentWins: 15,
    recentWinRate: 18.75,
  },
];

const mockEntries = [
  {
    raceDate: '20241215',
    meet: '1', // Use code instead of name
    raceNo: 1,
    raceName: '제1경주',
    distance: 1200,
    grade: 'G5',
    horseNo: '1', // Numeric string for proper parsing
    horseName: '테스트마1',
    sex: 'M',
    age: 4,
    jockey: '문세영',
    trainer: '김영관',
    burden: 57,
    rating: 65,
  },
  {
    raceDate: '20241215',
    meet: '1',
    raceNo: 1,
    raceName: '제1경주',
    distance: 1200,
    grade: 'G5',
    horseNo: '2',
    horseName: '테스트마2',
    sex: 'F',
    age: 5,
    jockey: '문세영',
    trainer: '김영관',
    burden: 55,
    rating: 62,
  },
];

const mockOdds = [
  {
    meet: '서울',
    raceNo: 1,
    raceDate: '20241215',
    win: {
      '1': 3.5,
      '2': 5.2,
    },
    place: {},
  },
];

// Type assertion for mock data (fetchHorseDetail mock)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockHorseDetail: any = {
  horse: {
    id: '1',
    name: '테스트마1',
    hrNo: '1',
    hrName: '테스트마1',
    sex: 'M',
    sexName: '수',
    age: 4,
    rating: 65,
    color: 'bay',
    sire: '아버지마',
    dam: '어머니마',
    owner: '테스트오너',
    trainer: '김영관',
    meet: '1',
    meetName: '서울',
    totalStarts: 10,
    totalWins: 3,
    totalSeconds: 2,
    totalThirds: 1,
    winRate: 30,
    placeRate: 60,
    recentStarts: 5,
    recentWins: 2,
  },
  history: [
    {
      raceDate: '20241201',
      meet: '서울',
      raceNo: 5,
      distance: 1200,
      position: 2,
      horseName: '테스트마1',
      jockey: '문세영',
      grade: 'G5',
      time: '1:12.5',
      margin: '1.0',
    },
  ],
};

// Mock KRA API module
jest.mock('@/lib/api/kra', () => ({
  fetchEntriesByRace: jest.fn(),
  fetchAllJockeyResults: jest.fn(),
  fetchAllTrainerResults: jest.fn(),
  fetchHorseDetail: jest.fn(),
  fetchAllOdds: jest.fn(),
  getTodayDate: jest.fn(() => '20241215'),
  MEET_NAMES: { '1': '서울', '2': '제주', '3': '부경' },
}));

// Mock adapter module to isolate testing
jest.mock('@/lib/predictions/adapters/kraAdapter', () => ({
  adaptKraRace: jest.fn((raceData) => ({
    race: {
      raceId: raceData.raceId,
      raceDate: raceData.raceDate,
      meetCode: raceData.meetCode,
      raceNo: raceData.raceNo,
      raceName: raceData.raceName,
      distance: raceData.distance,
      surface: raceData.surface,
      grade: raceData.grade,
      fieldSize: raceData.entries.length,
      trackCondition: {
        moisture: 10,
        firmness: 7,
        label: '양호',
        going: 'good',
      },
    },
    entries: raceData.entries.map((e: { horseNo: string; horseName: string }) => ({
      no: parseInt(e.horseNo) || 0,
      horseName: e.horseName,
      rating: 60,
      recentFinishes: [],
      burdenWeight: 55,
      jockey: { id: 'JK001', name: '문세영', winRate: 20, formScore: 3 },
      trainer: { id: 'TR001', name: '김영관', winRate: 18 },
    })),
  })),
  getSurfaceByMeet: jest.fn(() => 'dirt'),
}));

import {
  fetchEntriesByRace,
  fetchAllJockeyResults,
  fetchAllTrainerResults,
  fetchHorseDetail,
  fetchAllOdds,
} from '@/lib/api/kra';

const mockedFetchEntriesByRace = fetchEntriesByRace as jest.MockedFunction<typeof fetchEntriesByRace>;
const mockedFetchAllJockeyResults = fetchAllJockeyResults as jest.MockedFunction<typeof fetchAllJockeyResults>;
const mockedFetchAllTrainerResults = fetchAllTrainerResults as jest.MockedFunction<typeof fetchAllTrainerResults>;
const mockedFetchHorseDetail = fetchHorseDetail as jest.MockedFunction<typeof fetchHorseDetail>;
const mockedFetchAllOdds = fetchAllOdds as jest.MockedFunction<typeof fetchAllOdds>;

// =============================================================================
// Tests
// =============================================================================

describe('fetchTodaysRaces', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('정상 동작', () => {
    it('경주 데이터가 있을 때 올바르게 조회', async () => {
      // Arrange
      const entriesMap = new Map([['1-20241215-1', mockEntries]]);
      mockedFetchEntriesByRace.mockResolvedValue(entriesMap);
      mockedFetchAllJockeyResults.mockResolvedValue(mockJockeys);
      mockedFetchAllTrainerResults.mockResolvedValue(mockTrainers);
      mockedFetchHorseDetail.mockResolvedValue(mockHorseDetail);
      mockedFetchAllOdds.mockResolvedValue(mockOdds);

      // Act
      const result = await fetchTodaysRaces('20241215');

      // Assert
      expect(result.success).toBe(true);
      expect(result.races.length).toBe(1);
      expect(result.races[0].raceNo).toBe(1);
      expect(result.races[0].trackName).toBe('서울');
      expect(result.races[0].distance).toBe(1200);
      expect(result.meta.date).toBe('20241215');
      expect(result.meta.source).toBe('kra-live');
    });

    it('예측 입력 데이터가 올바르게 변환됨', async () => {
      // Arrange
      const entriesMap = new Map([['1-20241215-1', mockEntries]]);
      mockedFetchEntriesByRace.mockResolvedValue(entriesMap);
      mockedFetchAllJockeyResults.mockResolvedValue(mockJockeys);
      mockedFetchAllTrainerResults.mockResolvedValue(mockTrainers);
      mockedFetchHorseDetail.mockResolvedValue(mockHorseDetail);
      mockedFetchAllOdds.mockResolvedValue(mockOdds);

      // Act
      const result = await fetchTodaysRaces('20241215');

      // Assert
      expect(result.races[0].predictionInput).toBeDefined();
      expect(result.races[0].predictionInput.race).toBeDefined();
      expect(result.races[0].predictionInput.entries.length).toBe(2);
    });

    it('경마장 코드 필터 적용', async () => {
      // Arrange
      const entriesMap = new Map([['1-20241215-1', mockEntries]]);
      mockedFetchEntriesByRace.mockResolvedValue(entriesMap);
      mockedFetchAllJockeyResults.mockResolvedValue(mockJockeys);
      mockedFetchAllTrainerResults.mockResolvedValue(mockTrainers);
      mockedFetchHorseDetail.mockResolvedValue(mockHorseDetail);
      mockedFetchAllOdds.mockResolvedValue(mockOdds);

      // Act
      await fetchTodaysRaces('20241215', '1');

      // Assert
      expect(mockedFetchEntriesByRace).toHaveBeenCalledWith('20241215', '1');
    });

    it('여러 경주를 경주번호 순으로 정렬', async () => {
      // Arrange
      const entries2 = mockEntries.map((e) => ({ ...e, raceNo: 3 }));
      const entriesMap = new Map([
        ['1-20241215-3', entries2],
        ['1-20241215-1', mockEntries],
      ]);
      mockedFetchEntriesByRace.mockResolvedValue(entriesMap);
      mockedFetchAllJockeyResults.mockResolvedValue(mockJockeys);
      mockedFetchAllTrainerResults.mockResolvedValue(mockTrainers);
      mockedFetchHorseDetail.mockResolvedValue(mockHorseDetail);
      mockedFetchAllOdds.mockResolvedValue(mockOdds);

      // Act
      const result = await fetchTodaysRaces('20241215');

      // Assert
      expect(result.races.length).toBe(2);
      expect(result.races[0].raceNo).toBe(1);
      expect(result.races[1].raceNo).toBe(3);
    });
  });

  describe('경주 없는 날', () => {
    it('빈 결과 반환 및 경고 메시지', async () => {
      // Arrange
      mockedFetchEntriesByRace.mockResolvedValue(new Map());

      // Act
      const result = await fetchTodaysRaces('20241220');

      // Assert
      expect(result.success).toBe(true);
      expect(result.races.length).toBe(0);
      expect(result.warnings).toContain('오늘 예정된 경주가 없습니다.');
    });
  });

  describe('API 부분 실패', () => {
    it('기수 정보 조회 실패 시 계속 진행', async () => {
      // Arrange
      const entriesMap = new Map([['1-20241215-1', mockEntries]]);
      mockedFetchEntriesByRace.mockResolvedValue(entriesMap);
      mockedFetchAllJockeyResults.mockRejectedValue(new Error('API Error'));
      mockedFetchAllTrainerResults.mockResolvedValue(mockTrainers);
      mockedFetchHorseDetail.mockResolvedValue(mockHorseDetail);
      mockedFetchAllOdds.mockResolvedValue(mockOdds);

      // Act
      const result = await fetchTodaysRaces('20241215');

      // Assert
      expect(result.success).toBe(true);
      expect(result.races.length).toBe(1);
      expect(result.warnings.some((w) => w.includes('기수 정보 조회 실패'))).toBe(true);
    });

    it('조교사 정보 조회 실패 시 계속 진행', async () => {
      // Arrange
      const entriesMap = new Map([['1-20241215-1', mockEntries]]);
      mockedFetchEntriesByRace.mockResolvedValue(entriesMap);
      mockedFetchAllJockeyResults.mockResolvedValue(mockJockeys);
      mockedFetchAllTrainerResults.mockRejectedValue(new Error('API Error'));
      mockedFetchHorseDetail.mockResolvedValue(mockHorseDetail);
      mockedFetchAllOdds.mockResolvedValue(mockOdds);

      // Act
      const result = await fetchTodaysRaces('20241215');

      // Assert
      expect(result.success).toBe(true);
      expect(result.warnings.some((w) => w.includes('조교사 정보 조회 실패'))).toBe(true);
    });

    it('배당률 조회 실패 시 계속 진행', async () => {
      // Arrange
      const entriesMap = new Map([['1-20241215-1', mockEntries]]);
      mockedFetchEntriesByRace.mockResolvedValue(entriesMap);
      mockedFetchAllJockeyResults.mockResolvedValue(mockJockeys);
      mockedFetchAllTrainerResults.mockResolvedValue(mockTrainers);
      mockedFetchHorseDetail.mockResolvedValue(mockHorseDetail);
      mockedFetchAllOdds.mockRejectedValue(new Error('API Error'));

      // Act
      const result = await fetchTodaysRaces('20241215');

      // Assert
      expect(result.success).toBe(true);
      expect(result.warnings.some((w) => w.includes('배당률 정보 조회 실패'))).toBe(true);
    });

    it('마필 상세정보 일부 실패 시 계속 진행', async () => {
      // Arrange
      const entriesMap = new Map([['1-20241215-1', mockEntries]]);
      mockedFetchEntriesByRace.mockResolvedValue(entriesMap);
      mockedFetchAllJockeyResults.mockResolvedValue(mockJockeys);
      mockedFetchAllTrainerResults.mockResolvedValue(mockTrainers);
      mockedFetchHorseDetail
        .mockResolvedValueOnce(mockHorseDetail)
        .mockRejectedValueOnce(new Error('Horse not found'));
      mockedFetchAllOdds.mockResolvedValue(mockOdds);

      // Act
      const result = await fetchTodaysRaces('20241215');

      // Assert
      expect(result.success).toBe(true);
      expect(result.races.length).toBe(1);
      expect(result.warnings.some((w) => w.includes('마필') && w.includes('조회 실패'))).toBe(true);
    });
  });

  describe('전체 실패', () => {
    it('출마표 조회 실패 시 실패 응답', async () => {
      // Arrange
      mockedFetchEntriesByRace.mockRejectedValue(new Error('Network Error'));

      // Act
      const result = await fetchTodaysRaces('20241215');

      // Assert
      expect(result.success).toBe(false);
      expect(result.races.length).toBe(0);
      expect(result.warnings.some((w) => w.includes('데이터 조회 실패'))).toBe(true);
    });
  });
});

describe('fetchRaceData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('특정 경주 조회 성공', async () => {
    // Arrange
    const entriesMap = new Map([['1-20241215-1', mockEntries]]);
    mockedFetchEntriesByRace.mockResolvedValue(entriesMap);
    mockedFetchAllJockeyResults.mockResolvedValue(mockJockeys);
    mockedFetchAllTrainerResults.mockResolvedValue(mockTrainers);
    mockedFetchHorseDetail.mockResolvedValue(mockHorseDetail);
    mockedFetchAllOdds.mockResolvedValue(mockOdds);

    // Act
    const result = await fetchRaceData('20241215', '1', 1);

    // Assert
    expect(result).not.toBeNull();
    expect(result?.raceNo).toBe(1);
    expect(result?.trackName).toBe('서울');
  });

  it('존재하지 않는 경주번호 조회 시 null 반환', async () => {
    // Arrange
    const entriesMap = new Map([['1-20241215-1', mockEntries]]);
    mockedFetchEntriesByRace.mockResolvedValue(entriesMap);
    mockedFetchAllJockeyResults.mockResolvedValue(mockJockeys);
    mockedFetchAllTrainerResults.mockResolvedValue(mockTrainers);
    mockedFetchHorseDetail.mockResolvedValue(mockHorseDetail);
    mockedFetchAllOdds.mockResolvedValue(mockOdds);

    // Act
    const result = await fetchRaceData('20241215', '1', 99);

    // Assert
    expect(result).toBeNull();
  });

  it('조회 실패 시 null 반환', async () => {
    // Arrange
    mockedFetchEntriesByRace.mockRejectedValue(new Error('Network Error'));

    // Act
    const result = await fetchRaceData('20241215', '1', 1);

    // Assert
    expect(result).toBeNull();
  });
});

describe('createOddsMap (via fetchTodaysRaces)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('배당률 맵이 경주에 연결됨', async () => {
    // Arrange
    const entriesMap = new Map([['1-20241215-1', mockEntries]]);
    mockedFetchEntriesByRace.mockResolvedValue(entriesMap);
    mockedFetchAllJockeyResults.mockResolvedValue(mockJockeys);
    mockedFetchAllTrainerResults.mockResolvedValue(mockTrainers);
    mockedFetchHorseDetail.mockResolvedValue(mockHorseDetail);
    mockedFetchAllOdds.mockResolvedValue(mockOdds);

    // Act
    const result = await fetchTodaysRaces('20241215');

    // Assert
    expect(result.success).toBe(true);
    expect(mockedFetchAllOdds).toHaveBeenCalledWith('20241215');
  });
});
