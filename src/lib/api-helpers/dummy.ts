// src/lib/api-helpers/dummy.ts
import { KRA299ResultItem, KSPORaceItem } from './mappers';

// Function to generate dummy horse race data in API299 format
// Returns raw API items to be mapped by fetchHorseRaceSchedules using mapKRA299ToRaces
export function getDummyHorseRaces(rcDate: string = '20240115'): KRA299ResultItem[] {
  const rcDateNum = parseInt(rcDate);
  return [
    { meet: '서울', rcDate: rcDateNum, rcNo: 1, chulNo: 1, ord: 1, hrName: '번개', jkName: '김철수', age: 4, rank: '국산5등급', schStTime: `${rcDate.slice(0, 4)}-${rcDate.slice(4, 6)}-${rcDate.slice(6, 8)}T11:30:00` },
    { meet: '서울', rcDate: rcDateNum, rcNo: 1, chulNo: 2, ord: 2, hrName: '태풍', jkName: '박민수', age: 3, rank: '국산5등급', schStTime: `${rcDate.slice(0, 4)}-${rcDate.slice(4, 6)}-${rcDate.slice(6, 8)}T11:30:00` },
    { meet: '서울', rcDate: rcDateNum, rcNo: 1, chulNo: 3, ord: 3, hrName: '질풍', jkName: '이영희', age: 5, rank: '국산5등급', schStTime: `${rcDate.slice(0, 4)}-${rcDate.slice(4, 6)}-${rcDate.slice(6, 8)}T11:30:00` },
    { meet: '부산', rcDate: rcDateNum, rcNo: 1, chulNo: 1, ord: 1, hrName: '천둥', jkName: '홍길동', age: 4, rank: '국산4등급', schStTime: `${rcDate.slice(0, 4)}-${rcDate.slice(4, 6)}-${rcDate.slice(6, 8)}T12:00:00` },
    { meet: '부산', rcDate: rcDateNum, rcNo: 1, chulNo: 2, ord: 2, hrName: '우박', jkName: '임꺽정', age: 3, rank: '국산4등급', schStTime: `${rcDate.slice(0, 4)}-${rcDate.slice(4, 6)}-${rcDate.slice(6, 8)}T12:00:00` },
  ];
}

// Function to generate dummy cycle race data
// Returns raw API items to be mapped by fetchCycleRaceSchedules
export function getDummyCycleRaces(rcDate: string = '20240115'): KSPORaceItem[] {
  return [
    { meet: '1', rcNo: '1', rcDate, rcTime: '11:00', rcDist: '1000', hrNo: '1', hrName: '이선수' },
    { meet: '1', rcNo: '1', rcDate, rcTime: '11:00', rcDist: '1000', hrNo: '2', hrName: '박선수' },
    { meet: '2', rcNo: '2', rcDate, rcTime: '12:00', rcDist: '1200', hrNo: '1', hrName: '김선수' },
  ];
}

// Function to generate dummy boat race data
// Returns raw API items to be mapped by fetchBoatRaceSchedules
export function getDummyBoatRaces(rcDate: string = '20240115'): KSPORaceItem[] {
  return [
    { meet: '1', rcNo: '1', rcDate, rcTime: '10:30', hrNo: '1', hrName: '최선수' },
    { meet: '1', rcNo: '1', rcDate, rcTime: '10:30', hrNo: '2', hrName: '정선수' },
    { meet: '1', rcNo: '2', rcDate, rcTime: '11:00', hrNo: '1', hrName: '한선수' },
  ];
}

// ============================================
// Historical Race Results Dummy Data
// ============================================

import { HistoricalRace, Dividend, HistoricalRaceResult, RaceType } from '@/types';

/**
 * Generate dummy historical race results for development/testing
 */
export function getDummyHistoricalResults(
  dateFrom: string,
  dateTo: string,
  types?: RaceType[],
  track?: string
): HistoricalRace[] {
  const results: HistoricalRace[] = [];
  const raceTypes: RaceType[] = types && types.length > 0 ? types : ['horse', 'cycle', 'boat'];

  // Generate some races for the date range
  const startDate = new Date(
    parseInt(dateFrom.slice(0, 4)),
    parseInt(dateFrom.slice(4, 6)) - 1,
    parseInt(dateFrom.slice(6, 8))
  );
  const endDate = new Date(
    parseInt(dateTo.slice(0, 4)),
    parseInt(dateTo.slice(4, 6)) - 1,
    parseInt(dateTo.slice(6, 8))
  );

  // Generate races for each day in range
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10).replace(/-/g, '');

    for (const type of raceTypes) {
      const tracks = getTracksForType(type);
      const filteredTracks = track ? tracks.filter(t => t === track) : tracks;

      for (const trackName of filteredTracks) {
        // Generate 2-3 races per track per day
        const raceCount = 2 + Math.floor(Math.random() * 2);
        for (let raceNo = 1; raceNo <= raceCount; raceNo++) {
          results.push(generateDummyHistoricalRace(type, trackName, dateStr, raceNo));
        }
      }
    }
  }

  return results.sort((a, b) => {
    // Sort by date descending, then by race number
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return a.raceNo - b.raceNo;
  });
}

function getTracksForType(type: RaceType): string[] {
  switch (type) {
    case 'horse': return ['서울', '부산경남', '제주'];
    case 'cycle': return ['광명', '창원', '부산'];
    case 'boat': return ['미사리'];
  }
}

function getTrackCode(type: RaceType, trackName: string): string {
  const trackCodes: Record<string, string> = {
    '서울': '1', '부산경남': '2', '제주': '3',
    '광명': '1', '창원': '2', '부산': '3',
    '미사리': '1',
  };
  return trackCodes[trackName] || '1';
}

function generateDummyHistoricalRace(
  type: RaceType,
  track: string,
  date: string,
  raceNo: number
): HistoricalRace {
  const trackCode = getTrackCode(type, track);
  const id = `${type}-${trackCode}-${raceNo}-${date}`;

  // Generate results (4-8 finishers)
  const finisherCount = 4 + Math.floor(Math.random() * 5);
  const results: HistoricalRaceResult[] = [];

  const horseNames = ['번개', '태풍', '질풍', '천둥', '우박', '폭풍', '돌풍', '회오리'];
  const jockeyNames = ['김철수', '박민수', '이영희', '홍길동', '임꺽정', '장보고', '을지문덕', '강감찬'];
  const trainerNames = ['김조교', '박조교', '이조교', '최조교', '정조교'];
  const cycleNames = ['이선수', '박선수', '김선수', '최선수', '정선수', '한선수', '유선수', '조선수'];

  for (let rank = 1; rank <= finisherCount; rank++) {
    const baseTime = 80 + Math.random() * 20; // 80-100 seconds base time
    const timeDiff = rank === 1 ? undefined : (Math.random() * 3).toFixed(1);

    if (type === 'horse') {
      results.push({
        rank,
        entryNo: rank,
        name: horseNames[(rank - 1) % horseNames.length],
        jockey: jockeyNames[(rank - 1) % jockeyNames.length],
        trainer: trainerNames[(rank - 1) % trainerNames.length],
        time: `1:${(baseTime + rank * 0.5).toFixed(1)}`,
        timeDiff,
      });
    } else {
      results.push({
        rank,
        entryNo: rank,
        name: cycleNames[(rank - 1) % cycleNames.length],
        time: `${(baseTime + rank * 0.3).toFixed(1)}`,
        timeDiff,
      });
    }
  }

  // Generate dividends
  const dividends: Dividend[] = [
    { type: 'win', entries: [results[0].entryNo], amount: 2000 + Math.floor(Math.random() * 8000) },
    { type: 'place', entries: [results[0].entryNo], amount: 1000 + Math.floor(Math.random() * 3000) },
    { type: 'place', entries: [results[1].entryNo], amount: 1000 + Math.floor(Math.random() * 4000) },
    { type: 'quinella', entries: [results[0].entryNo, results[1].entryNo], amount: 5000 + Math.floor(Math.random() * 15000) },
  ];

  // Add third place for larger fields
  if (finisherCount > 5) {
    dividends.push({ type: 'place', entries: [results[2].entryNo], amount: 1500 + Math.floor(Math.random() * 5000) });
  }

  const hours = 10 + Math.floor(Math.random() * 8); // 10:00 - 17:00
  const minutes = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45

  return {
    id,
    type,
    raceNo,
    track,
    date,
    startTime: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
    distance: type === 'horse' ? 1200 + Math.floor(Math.random() * 4) * 200 : type === 'cycle' ? 1000 + Math.floor(Math.random() * 3) * 200 : undefined,
    grade: type === 'horse' ? `국산${3 + Math.floor(Math.random() * 3)}등급` : undefined,
    status: 'finished',
    results,
    dividends,
  };
}

/**
 * Get a single dummy historical race by ID
 */
export function getDummyHistoricalRaceById(id: string): HistoricalRace | null {
  const parts = id.split('-');
  if (parts.length !== 4) return null;

  const [type, trackCode, raceNoStr, date] = parts;
  if (!['horse', 'cycle', 'boat'].includes(type)) return null;

  const raceNo = parseInt(raceNoStr);
  if (isNaN(raceNo)) return null;

  const trackMap: Record<string, Record<string, string>> = {
    horse: { '1': '서울', '2': '부산경남', '3': '제주' },
    cycle: { '1': '광명', '2': '창원', '3': '부산' },
    boat: { '1': '미사리' },
  };

  const track = trackMap[type]?.[trackCode];
  if (!track) return null;

  return generateDummyHistoricalRace(type as RaceType, track, date, raceNo);
}
