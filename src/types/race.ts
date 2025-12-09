// src/types/race.ts

import type { RaceType, RaceStatus, Entry } from './index';

export interface Race {
  id: string; // 고유 ID (예: type-meetCode-raceNo-date)
  type: RaceType; // 종목
  raceNo: number; // 경주 번호
  track: string; // 경기장 (서울, 부산경남, 제주, 광명, 미사리)
  date: string; // YYYY-MM-DD
  meetCode: string; // 외부 API에서 내려오는 원시 회차/시행 코드
  startTime: string; // 발주 시간 (HH:mm)
  distance?: number; // 거리 (m)
  grade?: string; // 등급
  status: RaceStatus; // 상태
  entries: Entry[]; // 출전 목록
}