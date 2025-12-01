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
