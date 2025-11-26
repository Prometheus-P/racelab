// src/lib/api-helpers/mappers.test.ts
import { mapOddsResponse, mapKRAHorseRaceToRace, mapKSPOCycleRaceToRace, mapKSPOBoatRaceToRace } from './mappers';

describe('mapOddsResponse', () => {
  describe('valid odds values', () => {
    it('should map KSPO odds response to Odds type', () => {
      const kspoResponse = {
        oddsDansng: '2.5',    // 단승 배당
        oddsBoksng: '1.8',    // 복승 배당
        oddsSsangsng: '5.2',  // 쌍승 배당
      };

      const result = mapOddsResponse(kspoResponse);

      expect(result).toEqual({
        win: 2.5,
        place: 1.8,
        quinella: 5.2,
      });
    });
  });

  describe('null handling', () => {
    it('should handle null odds values', () => {
      const kspoResponse = {
        oddsDansng: null,
        oddsBoksng: '1.8',
        oddsSsangsng: null,
      };

      const result = mapOddsResponse(kspoResponse);

      expect(result).toEqual({
        win: null,
        place: 1.8,
        quinella: null,
      });
    });

    it('should handle undefined odds values', () => {
      const kspoResponse = {
        oddsBoksng: '3.5',
      };

      const result = mapOddsResponse(kspoResponse);

      expect(result).toEqual({
        win: null,
        place: 3.5,
        quinella: null,
      });
    });

    it('should handle empty string odds values', () => {
      const kspoResponse = {
        oddsDansng: '',
        oddsBoksng: '',
        oddsSsangsng: '',
      };

      const result = mapOddsResponse(kspoResponse);

      expect(result).toEqual({
        win: null,
        place: null,
        quinella: null,
      });
    });
  });

  describe('invalid input', () => {
    it('should handle invalid number strings', () => {
      const kspoResponse = {
        oddsDansng: 'invalid',
        oddsBoksng: '2.0',
        oddsSsangsng: 'NaN',
      };

      const result = mapOddsResponse(kspoResponse);

      expect(result).toEqual({
        win: null,
        place: 2.0,
        quinella: null,
      });
    });
  });
});

describe('mapKRAHorseRaceToRace', () => {
  it('should map KRA API response to Race type', () => {
    const kraItem = {
      meet: '1',
      rcNo: '1',
      rcDate: '20240115',
      rcTime: '11:30',
      rcDist: '1200',
      rank: '국산5등급',
      hrNo: '1',
      hrName: '말1',
      jkName: '기수1',
      trName: '조교사1',
      age: '3',
      wgHr: '54',
      rcRst: '1-2-3',
    };

    const result = mapKRAHorseRaceToRace(kraItem);

    expect(result.id).toBe('horse-1-1-20240115');
    expect(result.type).toBe('horse');
    expect(result.raceNo).toBe(1);
    expect(result.track).toBe('서울');
    expect(result.startTime).toBe('11:30');
    expect(result.distance).toBe(1200);
    expect(result.grade).toBe('국산5등급');
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].name).toBe('말1');
  });

  it('should handle missing entry data', () => {
    const kraItem = {
      meet: '2',
      rcNo: '5',
      rcDate: '20240115',
      rcTime: '14:00',
      rcDist: '1400',
    };

    const result = mapKRAHorseRaceToRace(kraItem);

    expect(result.entries).toHaveLength(0);
    expect(result.track).toBe('부산경남');
  });
});

describe('mapKSPOCycleRaceToRace', () => {
  it('should map KSPO cycle response to Race type', () => {
    const kspoItem = {
      meet: '1',
      rcNo: '2',
      rcDate: '20240115',
      rcTime: '11:00',
      rcDist: '1000',
      hrNo: '1',
      hrName: '선수1',
      age: '25',
      recentRecord: '1-2-3',
    };

    const result = mapKSPOCycleRaceToRace(kspoItem);

    expect(result.id).toBe('cycle-1-2-20240115');
    expect(result.type).toBe('cycle');
    expect(result.track).toBe('광명');
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].name).toBe('선수1');
  });
});

describe('mapKSPOBoatRaceToRace', () => {
  it('should map KSPO boat response to Race type', () => {
    const kspoItem = {
      meet: '1',
      rcNo: '3',
      rcDate: '20240115',
      rcTime: '10:30',
      hrNo: '1',
      hrName: '선수1',
      age: '28',
      recentRecord: '1-2-3',
    };

    const result = mapKSPOBoatRaceToRace(kspoItem);

    expect(result.id).toBe('boat-1-3-20240115');
    expect(result.type).toBe('boat');
    expect(result.track).toBe('미사리');
    expect(result.distance).toBeUndefined();
    expect(result.entries).toHaveLength(1);
  });
});
