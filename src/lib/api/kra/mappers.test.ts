/**
 * KRA API Mappers Tests
 *
 * API 응답 변환 함수 테스트
 */

import {
  mapJockeyResult,
  mergeJockeyInfo,
  mapJockeyResults,
  mapTrainerInfo,
  mapTrainerInfoList,
  mapHorseInfo,
  mergeHorseTotalInfo,
  mapHorseRaceRecord,
  mapHorseInfoList,
  mapHorseRaceRecords,
  mapEntryHorse,
  mapEntryHorseList,
  sortJockeysByWinRate,
  sortTrainersByWinRate,
  sortHorsesByRating,
} from './mappers';
import type {
  KraJockeyResultItem,
  KraJockeyInfoItem,
  KraTrainerInfoItem,
  KraHorseInfoItem,
  KraHorseResultItem,
  KraHorseTotalInfoItem,
  KraEntryHorseItem,
  Jockey,
  Trainer,
  Horse,
} from './types';

describe('KRA API Mappers', () => {
  describe('Jockey Mappers', () => {
    const mockJockeyResultItem: KraJockeyResultItem = {
      meet: '1',
      jkNo: '001',
      jkName: '홍길동',
      part: 'A조',
      rcCnt: '500',
      ord1Cnt: '100',
      ord2Cnt: '80',
      ord3Cnt: '60',
      ordCnt: '240',
      winRate: '20.0',
      ordRate: '48.0',
      rcCnt1y: '100',
      ord1Cnt1y: '25',
      ord2Cnt1y: '20',
      ord3Cnt1y: '15',
      ordCnt1y: '60',
      winRate1y: '25.0',
      ordRate1y: '60.0',
    };

    describe('mapJockeyResult', () => {
      it('should map basic jockey information correctly', () => {
        const result = mapJockeyResult(mockJockeyResultItem);

        expect(result.id).toBe('001');
        expect(result.name).toBe('홍길동');
        expect(result.meet).toBe('1');
        expect(result.meetName).toBe('서울');
        expect(result.part).toBe('A조');
      });

      it('should parse numeric statistics correctly', () => {
        const result = mapJockeyResult(mockJockeyResultItem);

        expect(result.totalStarts).toBe(500);
        expect(result.totalWins).toBe(100);
        expect(result.totalSeconds).toBe(80);
        expect(result.totalThirds).toBe(60);
        expect(result.totalPlaces).toBe(240);
      });

      it('should parse percentage values correctly', () => {
        const result = mapJockeyResult(mockJockeyResultItem);

        expect(result.winRate).toBe(20);
        expect(result.placeRate).toBe(48);
        expect(result.recentWinRate).toBe(25);
        expect(result.recentPlaceRate).toBe(60);
      });

      it('should handle missing/invalid values', () => {
        const invalidItem: KraJockeyResultItem = {
          ...mockJockeyResultItem,
          rcCnt: '',
          winRate: 'invalid',
        };

        const result = mapJockeyResult(invalidItem);

        expect(result.totalStarts).toBe(0);
        expect(result.winRate).toBe(0);
      });

      it('should map meet codes to names correctly', () => {
        const seoulResult = mapJockeyResult({ ...mockJockeyResultItem, meet: '1' });
        const jejuResult = mapJockeyResult({ ...mockJockeyResultItem, meet: '2' });
        const busanResult = mapJockeyResult({ ...mockJockeyResultItem, meet: '3' });

        expect(seoulResult.meetName).toBe('서울');
        expect(jejuResult.meetName).toBe('제주');
        expect(busanResult.meetName).toBe('부경');
      });
    });

    describe('mergeJockeyInfo', () => {
      const mockJockey: Jockey = {
        id: '001',
        name: '홍길동',
        meet: '1',
        meetName: '서울',
        part: 'A조',
        totalStarts: 500,
        totalWins: 100,
        totalSeconds: 80,
        totalThirds: 60,
        totalPlaces: 240,
        winRate: 20,
        placeRate: 48,
        recentStarts: 100,
        recentWins: 25,
        recentSeconds: 20,
        recentThirds: 15,
        recentPlaces: 60,
        recentWinRate: 25,
        recentPlaceRate: 60,
      };

      const mockJockeyInfo: KraJockeyInfoItem = {
        meet: '1',
        jkNo: '001',
        jkName: '홍길동',
        jkNameEn: 'Hong Gil-dong',
        part: 'A조',
        birthday: '19850315',
        debut: '20050101',
        rcCnt: '500',
        ord1Cnt: '100',
        rating: '85',
      };

      it('should merge additional info into jockey', () => {
        const result = mergeJockeyInfo(mockJockey, mockJockeyInfo);

        expect(result.nameEn).toBe('Hong Gil-dong');
        expect(result.birthday).toBe('19850315');
        expect(result.debutDate).toBe('20050101');
        expect(result.rating).toBe(85);
      });

      it('should preserve original jockey data', () => {
        const result = mergeJockeyInfo(mockJockey, mockJockeyInfo);

        expect(result.id).toBe('001');
        expect(result.totalStarts).toBe(500);
        expect(result.winRate).toBe(20);
      });

      it('should handle missing optional fields', () => {
        const incompleteInfo: KraJockeyInfoItem = {
          meet: '1',
          jkNo: '001',
          jkName: '홍길동',
          part: 'A조',
          rcCnt: '500',
          ord1Cnt: '100',
        };

        const result = mergeJockeyInfo(mockJockey, incompleteInfo);

        expect(result.nameEn).toBeUndefined();
        expect(result.birthday).toBeUndefined();
        expect(result.rating).toBe(0);
      });
    });

    describe('mapJockeyResults', () => {
      it('should map array of jockey items', () => {
        const items = [
          mockJockeyResultItem,
          { ...mockJockeyResultItem, jkNo: '002', jkName: '김철수' },
        ];

        const result = mapJockeyResults(items);

        expect(result).toHaveLength(2);
        expect(result[0].name).toBe('홍길동');
        expect(result[1].name).toBe('김철수');
      });

      it('should return empty array for empty input', () => {
        const result = mapJockeyResults([]);
        expect(result).toEqual([]);
      });
    });
  });

  describe('Trainer Mappers', () => {
    const mockTrainerItem: KraTrainerInfoItem = {
      meet: '1',
      trNo: '001',
      trName: '박영수',
      trNameEn: 'Park Young-su',
      part: 'B조',
      rcCnt: '300',
      ord1Cnt: '60',
      ord2Cnt: '50',
      ord3Cnt: '40',
      winRate: '20.0',
      ordRate: '50.0',
      rcCnt1y: '80',
      ord1Cnt1y: '20',
      winRate1y: '25.0',
      hrCnt: '15',
    };

    describe('mapTrainerInfo', () => {
      it('should map basic trainer information correctly', () => {
        const result = mapTrainerInfo(mockTrainerItem);

        expect(result.id).toBe('001');
        expect(result.name).toBe('박영수');
        expect(result.nameEn).toBe('Park Young-su');
        expect(result.meet).toBe('1');
        expect(result.meetName).toBe('서울');
        expect(result.part).toBe('B조');
      });

      it('should parse numeric statistics correctly', () => {
        const result = mapTrainerInfo(mockTrainerItem);

        expect(result.totalStarts).toBe(300);
        expect(result.totalWins).toBe(60);
        expect(result.totalSeconds).toBe(50);
        expect(result.totalThirds).toBe(40);
        expect(result.horseCount).toBe(15);
      });

      it('should parse percentage values correctly', () => {
        const result = mapTrainerInfo(mockTrainerItem);

        expect(result.winRate).toBe(20);
        expect(result.placeRate).toBe(50);
        expect(result.recentWinRate).toBe(25);
      });
    });

    describe('mapTrainerInfoList', () => {
      it('should map array of trainer items', () => {
        const items = [
          mockTrainerItem,
          { ...mockTrainerItem, trNo: '002', trName: '이순신' },
        ];

        const result = mapTrainerInfoList(items);

        expect(result).toHaveLength(2);
        expect(result[0].name).toBe('박영수');
        expect(result[1].name).toBe('이순신');
      });
    });
  });

  describe('Horse Mappers', () => {
    const mockHorseInfoItem: KraHorseInfoItem = {
      meet: '1',
      hrNo: 'H001',
      hrName: '명마',
      hrNameEn: 'Famous Horse',
      sex: '수',
      age: '5',
      birthday: '20190315',
      wlClass: '1',
      trName: '박영수',
      owName: '김마주',
      rating: '92',
      rcCnt: '30',
      ord1Cnt: '10',
      ord2Cnt: '8',
      ord3Cnt: '5',
      prize: '500000000',
      rcCnt1y: '10',
      ord1Cnt1y: '4',
    };

    describe('mapHorseInfo', () => {
      it('should map basic horse information correctly', () => {
        const result = mapHorseInfo(mockHorseInfoItem);

        expect(result.id).toBe('H001');
        expect(result.name).toBe('명마');
        expect(result.nameEn).toBe('Famous Horse');
        expect(result.meet).toBe('1');
        expect(result.meetName).toBe('서울');
      });

      it('should parse sex information correctly', () => {
        const result = mapHorseInfo(mockHorseInfoItem);

        expect(result.sex).toBe('수');
        expect(result.sexName).toBe('수말');
      });

      it('should parse age and grade correctly', () => {
        const result = mapHorseInfo(mockHorseInfoItem);

        expect(result.age).toBe(5);
        expect(result.grade).toBe('1');
      });

      it('should parse statistics correctly', () => {
        const result = mapHorseInfo(mockHorseInfoItem);

        expect(result.totalStarts).toBe(30);
        expect(result.totalWins).toBe(10);
        expect(result.totalSeconds).toBe(8);
        expect(result.totalThirds).toBe(5);
        expect(result.totalPrize).toBe(500000000);
        expect(result.rating).toBe(92);
      });

      it('should calculate win rate and place rate correctly', () => {
        const result = mapHorseInfo(mockHorseInfoItem);

        // winRate = (10/30) * 100 = 33.33...
        expect(result.winRate).toBeCloseTo(33.33, 1);
        // placeRate = (10+8+5)/30 * 100 = 76.67...
        expect(result.placeRate).toBeCloseTo(76.67, 1);
      });

      it('should handle zero starts gracefully', () => {
        const zeroStartItem = { ...mockHorseInfoItem, rcCnt: '0' };
        const result = mapHorseInfo(zeroStartItem);

        expect(result.winRate).toBe(0);
        expect(result.placeRate).toBe(0);
      });

      it('should parse sex codes correctly', () => {
        const maleResult = mapHorseInfo({ ...mockHorseInfoItem, sex: '수' });
        const femaleResult = mapHorseInfo({ ...mockHorseInfoItem, sex: '암' });
        const geldingResult = mapHorseInfo({ ...mockHorseInfoItem, sex: '거' });

        expect(maleResult.sexName).toBe('수말');
        expect(femaleResult.sexName).toBe('암말');
        expect(geldingResult.sexName).toBe('거세마');
      });
    });

    describe('mergeHorseTotalInfo', () => {
      const mockHorse: Horse = {
        id: 'H001',
        name: '명마',
        meet: '1',
        meetName: '서울',
        sex: '수',
        sexName: '수말',
        age: 5,
        trainer: '박영수',
        totalStarts: 30,
        totalWins: 10,
        totalSeconds: 8,
        totalThirds: 5,
        winRate: 33.33,
        placeRate: 76.67,
        recentStarts: 10,
        recentWins: 4,
        rating: 92,
      };

      const mockTotalInfo: KraHorseTotalInfoItem = {
        hrNo: 'H001',
        hrName: '명마',
        hrNameEn: 'Famous Horse',
        birthNa: '한국',
        impNa: '',
        breedNm: '더러브레드',
        coatColor: '밤색',
        fatherHr: '부마명',
        motherHr: '모마명',
        grandfatherHr: '외조부마명',
      };

      it('should merge pedigree information', () => {
        const result = mergeHorseTotalInfo(mockHorse, mockTotalInfo);

        expect(result.sire).toBe('부마명');
        expect(result.dam).toBe('모마명');
        expect(result.grandsire).toBe('외조부마명');
      });

      it('should merge origin information', () => {
        const result = mergeHorseTotalInfo(mockHorse, mockTotalInfo);

        expect(result.birthCountry).toBe('한국');
        expect(result.importCountry).toBe('');
        expect(result.breed).toBe('더러브레드');
        expect(result.coatColor).toBe('밤색');
      });

      it('should preserve original horse data', () => {
        const result = mergeHorseTotalInfo(mockHorse, mockTotalInfo);

        expect(result.id).toBe('H001');
        expect(result.totalStarts).toBe(30);
        expect(result.rating).toBe(92);
      });
    });

    describe('mapHorseRaceRecord', () => {
      const mockResultItem: KraHorseResultItem = {
        hrNo: 'H001',
        rcDate: '20241225',
        meet: '1',
        rcNo: '5',
        rcDist: '1400',
        ord: '1',
        rcTime: '1:23.45',
        jkName: '홍길동',
        wgHr: '480',
        wgBu: '57',
        oddWin: '2.5',
        oddPlc: '1.3',
      };

      it('should map race record correctly', () => {
        const result = mapHorseRaceRecord(mockResultItem);

        expect(result.date).toBe('20241225');
        expect(result.meet).toBe('서울');
        expect(result.raceNo).toBe(5);
        expect(result.distance).toBe(1400);
        expect(result.position).toBe(1);
        expect(result.time).toBe('1:23.45');
        expect(result.jockey).toBe('홍길동');
        expect(result.weight).toBe(480);
        expect(result.burden).toBe(57);
        expect(result.winOdds).toBe(2.5);
        expect(result.placeOdds).toBe(1.3);
      });
    });

    describe('mapHorseInfoList', () => {
      it('should map array of horse items', () => {
        const items = [
          mockHorseInfoItem,
          { ...mockHorseInfoItem, hrNo: 'H002', hrName: '쾌속마' },
        ];

        const result = mapHorseInfoList(items);

        expect(result).toHaveLength(2);
        expect(result[0].name).toBe('명마');
        expect(result[1].name).toBe('쾌속마');
      });
    });

    describe('mapHorseRaceRecords', () => {
      it('should map array of race record items', () => {
        const items: KraHorseResultItem[] = [
          {
            hrNo: 'H001',
            rcDate: '20241225',
            meet: '1',
            rcNo: '5',
            rcDist: '1400',
            ord: '1',
            jkName: '홍길동',
          },
          {
            hrNo: 'H001',
            rcDate: '20241218',
            meet: '1',
            rcNo: '3',
            rcDist: '1200',
            ord: '2',
            jkName: '김철수',
          },
        ];

        const result = mapHorseRaceRecords(items);

        expect(result).toHaveLength(2);
        expect(result[0].position).toBe(1);
        expect(result[1].position).toBe(2);
      });
    });
  });

  describe('Entry Mappers', () => {
    const mockEntryItem: KraEntryHorseItem = {
      meet: '1',
      rcDate: '20241225',
      rcNo: '5',
      rcName: '서울대상경주',
      rcDist: '1800',
      wlClass: '1',
      hrNo: 'H001',
      hrName: '명마',
      sex: '수',
      age: '5',
      jkName: '홍길동',
      trName: '박영수',
      owName: '김마주',
      wgBu: '57',
      rating: '92',
    };

    describe('mapEntryHorse', () => {
      it('should map entry information correctly', () => {
        const result = mapEntryHorse(mockEntryItem);

        expect(result.raceDate).toBe('20241225');
        expect(result.meet).toBe('서울');
        expect(result.raceNo).toBe(5);
        expect(result.raceName).toBe('서울대상경주');
        expect(result.distance).toBe(1800);
        expect(result.grade).toBe('1');
      });

      it('should map horse information correctly', () => {
        const result = mapEntryHorse(mockEntryItem);

        expect(result.horseNo).toBe('H001');
        expect(result.horseName).toBe('명마');
        expect(result.sex).toBe('수말');
        expect(result.age).toBe(5);
      });

      it('should map personnel information correctly', () => {
        const result = mapEntryHorse(mockEntryItem);

        expect(result.jockey).toBe('홍길동');
        expect(result.trainer).toBe('박영수');
        expect(result.owner).toBe('김마주');
      });

      it('should map burden and rating correctly', () => {
        const result = mapEntryHorse(mockEntryItem);

        expect(result.burden).toBe(57);
        expect(result.rating).toBe(92);
      });
    });

    describe('mapEntryHorseList', () => {
      it('should map array of entry items', () => {
        const items = [
          mockEntryItem,
          { ...mockEntryItem, hrNo: 'H002', hrName: '쾌속마' },
        ];

        const result = mapEntryHorseList(items);

        expect(result).toHaveLength(2);
        expect(result[0].horseName).toBe('명마');
        expect(result[1].horseName).toBe('쾌속마');
      });
    });
  });

  describe('Sort Utilities', () => {
    describe('sortJockeysByWinRate', () => {
      it('should sort jockeys by win rate in descending order', () => {
        const jockeys: Jockey[] = [
          { ...createMockJockey(), id: '1', winRate: 20 },
          { ...createMockJockey(), id: '2', winRate: 30 },
          { ...createMockJockey(), id: '3', winRate: 15 },
        ];

        const result = sortJockeysByWinRate(jockeys);

        expect(result[0].winRate).toBe(30);
        expect(result[1].winRate).toBe(20);
        expect(result[2].winRate).toBe(15);
      });

      it('should not mutate original array', () => {
        const jockeys: Jockey[] = [
          { ...createMockJockey(), id: '1', winRate: 20 },
          { ...createMockJockey(), id: '2', winRate: 30 },
        ];

        const original = [...jockeys];
        sortJockeysByWinRate(jockeys);

        expect(jockeys[0].winRate).toBe(original[0].winRate);
      });
    });

    describe('sortTrainersByWinRate', () => {
      it('should sort trainers by win rate in descending order', () => {
        const trainers: Trainer[] = [
          { ...createMockTrainer(), id: '1', winRate: 25 },
          { ...createMockTrainer(), id: '2', winRate: 35 },
          { ...createMockTrainer(), id: '3', winRate: 10 },
        ];

        const result = sortTrainersByWinRate(trainers);

        expect(result[0].winRate).toBe(35);
        expect(result[1].winRate).toBe(25);
        expect(result[2].winRate).toBe(10);
      });
    });

    describe('sortHorsesByRating', () => {
      it('should sort horses by rating in descending order', () => {
        const horses: Horse[] = [
          { ...createMockHorse(), id: '1', rating: 85 },
          { ...createMockHorse(), id: '2', rating: 92 },
          { ...createMockHorse(), id: '3', rating: 78 },
        ];

        const result = sortHorsesByRating(horses);

        expect(result[0].rating).toBe(92);
        expect(result[1].rating).toBe(85);
        expect(result[2].rating).toBe(78);
      });

      it('should handle undefined ratings', () => {
        const horses: Horse[] = [
          { ...createMockHorse(), id: '1', rating: 85 },
          { ...createMockHorse(), id: '2', rating: undefined },
          { ...createMockHorse(), id: '3', rating: 92 },
        ];

        const result = sortHorsesByRating(horses);

        expect(result[0].rating).toBe(92);
        expect(result[1].rating).toBe(85);
        expect(result[2].rating).toBeUndefined();
      });
    });
  });
});

// Helper functions for creating mock data
function createMockJockey(): Jockey {
  return {
    id: '001',
    name: '홍길동',
    meet: '1',
    meetName: '서울',
    part: 'A조',
    totalStarts: 100,
    totalWins: 20,
    totalSeconds: 15,
    totalThirds: 10,
    totalPlaces: 45,
    winRate: 20,
    placeRate: 45,
    recentStarts: 30,
    recentWins: 8,
    recentSeconds: 5,
    recentThirds: 3,
    recentPlaces: 16,
    recentWinRate: 26.67,
    recentPlaceRate: 53.33,
  };
}

function createMockTrainer(): Trainer {
  return {
    id: '001',
    name: '박영수',
    meet: '1',
    meetName: '서울',
    totalStarts: 200,
    totalWins: 50,
    totalSeconds: 40,
    totalThirds: 30,
    winRate: 25,
    placeRate: 60,
    recentStarts: 50,
    recentWins: 15,
    recentWinRate: 30,
  };
}

function createMockHorse(): Horse {
  return {
    id: 'H001',
    name: '명마',
    meet: '1',
    meetName: '서울',
    sex: '수',
    sexName: '수말',
    age: 5,
    trainer: '박영수',
    totalStarts: 30,
    totalWins: 10,
    totalSeconds: 8,
    totalThirds: 5,
    winRate: 33.33,
    placeRate: 76.67,
    recentStarts: 10,
    recentWins: 4,
    rating: 85,
  };
}
