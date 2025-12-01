// src/lib/api-helpers/dummy.ts
import { KRAHorseRaceItem, KSPORaceItem } from './mappers';

// Function to generate dummy horse race data as per DEVELOPMENT_GUIDE.md
// Returns raw API items to be mapped by fetchHorseRaceSchedules
// Including entry data for proper testing
export function getDummyHorseRaces(rcDate: string = '20240115'): KRAHorseRaceItem[] {
  return [
    { meet: '1', rcNo: '1', rcDate, rcTime: '11:30', rcDist: '1200', rank: '국산5등급', hrNo: '1', hrName: '번개', jkName: '김철수', trName: '이훈련' },
    { meet: '1', rcNo: '1', rcDate, rcTime: '11:30', rcDist: '1200', rank: '국산5등급', hrNo: '2', hrName: '태풍', jkName: '박민수', trName: '최훈련' },
    { meet: '1', rcNo: '1', rcDate, rcTime: '11:30', rcDist: '1200', rank: '국산5등급', hrNo: '3', hrName: '질풍', jkName: '이영희', trName: '정훈련' },
    { meet: '2', rcNo: '2', rcDate, rcTime: '12:00', rcDist: '1400', rank: '국산4등급', hrNo: '1', hrName: '천둥', jkName: '홍길동', trName: '강훈련' },
    { meet: '2', rcNo: '2', rcDate, rcTime: '12:00', rcDist: '1400', rank: '국산4등급', hrNo: '2', hrName: '우박', jkName: '임꺽정', trName: '윤훈련' },
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
