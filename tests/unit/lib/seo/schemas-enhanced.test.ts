/**
 * @jest-environment node
 *
 * Tests for enhanced SportsEvent schema output (T028)
 * Verifies advanced schema features for voice search optimization
 */
import { describe, expect, it } from '@jest/globals';
import { generateSportsEventSchema } from '@/lib/seo/schemas';
import { Race, RaceResult } from '@/types';

describe('Enhanced SportsEvent Schema', () => {
  const mockHorseRace: Race = {
    id: 'horse-sel-20241215-03',
    type: 'horse',
    track: '서울',
    raceNo: 3,
    date: '2024-12-15',
    startTime: '14:30',
    distance: 1400,
    status: 'finished',
    entries: [
      { no: 1, name: '번개호', jockey: '김철수', trainer: '박영희', weight: 57, odds: 3.5 },
      { no: 2, name: '천둥이', jockey: '이영수', trainer: '최민정', weight: 55, odds: 5.2 },
      { no: 3, name: '바람이', jockey: '정대한', trainer: '김수연', weight: 56, odds: 8.1 },
    ],
  };

  const mockResults: RaceResult[] = [
    { rank: 1, no: 1, name: '번개호', odds: 3.5, jockey: '김철수' },
    { rank: 2, no: 3, name: '바람이', odds: 8.1, jockey: '정대한' },
    { rank: 3, no: 2, name: '천둥이', odds: 5.2, jockey: '이영수' },
  ];

  describe('eventStatus mapping', () => {
    it('maps upcoming status to EventScheduled', () => {
      const upcomingRace = { ...mockHorseRace, status: 'upcoming' as const };
      const schema = generateSportsEventSchema(upcomingRace);

      expect(schema.eventStatus).toBe('https://schema.org/EventScheduled');
    });

    it('maps live status to EventScheduled', () => {
      const liveRace = { ...mockHorseRace, status: 'live' as const };
      const schema = generateSportsEventSchema(liveRace);

      expect(schema.eventStatus).toBe('https://schema.org/EventScheduled');
    });

    it('maps finished status to EventScheduled', () => {
      const finishedRace = { ...mockHorseRace, status: 'finished' as const };
      const schema = generateSportsEventSchema(finishedRace);

      expect(schema.eventStatus).toBe('https://schema.org/EventScheduled');
    });

    it('maps canceled status to EventCancelled', () => {
      const canceledRace = { ...mockHorseRace, status: 'canceled' as const };
      const schema = generateSportsEventSchema(canceledRace);

      expect(schema.eventStatus).toBe('https://schema.org/EventCancelled');
    });
  });

  describe('competitor array', () => {
    it('uses Thing type for horse racing competitors', () => {
      const schema = generateSportsEventSchema(mockHorseRace);

      schema.competitor.forEach((c) => {
        expect(c['@type']).toBe('Thing');
      });
    });

    it('uses Person type for cycle racing competitors', () => {
      const cycleRace: Race = {
        ...mockHorseRace,
        type: 'cycle',
        entries: [
          { no: 1, name: '김선수', jockey: '김선수', trainer: '박코치', weight: 70, odds: 2.0 },
        ],
      };
      const schema = generateSportsEventSchema(cycleRace);

      expect(schema.competitor[0]['@type']).toBe('Person');
    });

    it('uses Person type for boat racing competitors', () => {
      const boatRace: Race = {
        ...mockHorseRace,
        type: 'boat',
        entries: [
          { no: 1, name: '이선수', jockey: '이선수', trainer: '최코치', weight: 65, odds: 3.0 },
        ],
      };
      const schema = generateSportsEventSchema(boatRace);

      expect(schema.competitor[0]['@type']).toBe('Person');
    });

    it('includes competitor names', () => {
      const schema = generateSportsEventSchema(mockHorseRace);

      expect(schema.competitor[0].name).toBe('번개호');
      expect(schema.competitor[1].name).toBe('천둥이');
    });

    it('includes jockey as athlete for horse racing', () => {
      const schema = generateSportsEventSchema(mockHorseRace);

      expect(schema.competitor[0].athlete).toBeDefined();
      expect(schema.competitor[0].athlete?.['@type']).toBe('Person');
      expect(schema.competitor[0].athlete?.name).toBe('김철수');
    });
  });

  describe('subEvent for race results', () => {
    it('includes subEvent when results are provided', () => {
      const schema = generateSportsEventSchema(mockHorseRace, mockResults);

      expect(schema.subEvent).toBeDefined();
      expect(schema.subEvent).toHaveLength(3);
    });

    it('limits subEvent to top 3 finishers', () => {
      const manyResults: RaceResult[] = [
        ...mockResults,
        { rank: 4, no: 4, name: '넷째', odds: 10.0, jockey: '박기수' },
        { rank: 5, no: 5, name: '다섯째', odds: 15.0, jockey: '최기수' },
      ];
      const schema = generateSportsEventSchema(mockHorseRace, manyResults);

      expect(schema.subEvent).toHaveLength(3);
    });

    it('formats subEvent with rank in name', () => {
      const schema = generateSportsEventSchema(mockHorseRace, mockResults);

      expect(schema.subEvent?.[0].name).toBe('1착');
      expect(schema.subEvent?.[1].name).toBe('2착');
      expect(schema.subEvent?.[2].name).toBe('3착');
    });

    it('includes horse name and odds in subEvent description', () => {
      const schema = generateSportsEventSchema(mockHorseRace, mockResults);

      expect(schema.subEvent?.[0].description).toContain('번개호');
      expect(schema.subEvent?.[0].description).toContain('3.5');
    });

    it('does not include subEvent when no results', () => {
      const schema = generateSportsEventSchema(mockHorseRace);

      expect(schema.subEvent).toBeUndefined();
    });

    it('does not include subEvent when results array is empty', () => {
      const schema = generateSportsEventSchema(mockHorseRace, []);

      expect(schema.subEvent).toBeUndefined();
    });
  });

  describe('organizer information', () => {
    it('sets KRA as organizer for horse racing', () => {
      const schema = generateSportsEventSchema(mockHorseRace);

      expect(schema.organizer.name).toBe('한국마사회 (KRA)');
      expect(schema.organizer.url).toBe('https://kra.co.kr');
    });

    it('sets KSPO as organizer for cycle racing', () => {
      const cycleRace = { ...mockHorseRace, type: 'cycle' as const };
      const schema = generateSportsEventSchema(cycleRace);

      expect(schema.organizer.name).toBe('국민체육진흥공단 (KSPO)');
      expect(schema.organizer.url).toBe('https://kspo.or.kr');
    });

    it('sets KSPO as organizer for boat racing', () => {
      const boatRace = { ...mockHorseRace, type: 'boat' as const };
      const schema = generateSportsEventSchema(boatRace);

      expect(schema.organizer.name).toBe('국민체육진흥공단 (KSPO)');
    });
  });

  describe('location information', () => {
    it('includes track name as location', () => {
      const schema = generateSportsEventSchema(mockHorseRace);

      expect(schema.location.name).toBe('서울');
    });

    it('sets location type to Place', () => {
      const schema = generateSportsEventSchema(mockHorseRace);

      expect(schema.location['@type']).toBe('Place');
    });

    it('includes Korea as address country', () => {
      const schema = generateSportsEventSchema(mockHorseRace);

      expect(schema.location.address.addressCountry).toBe('KR');
    });
  });

  describe('startDate formatting', () => {
    it('formats startDate with timezone', () => {
      const schema = generateSportsEventSchema(mockHorseRace);

      expect(schema.startDate).toBe('2024-12-15T14:30:00+09:00');
    });
  });

  describe('sport field', () => {
    it('sets sport to Korean race type', () => {
      const horseSchema = generateSportsEventSchema(mockHorseRace);
      expect(horseSchema.sport).toBe('경마');

      const cycleRace = { ...mockHorseRace, type: 'cycle' as const };
      const cycleSchema = generateSportsEventSchema(cycleRace);
      expect(cycleSchema.sport).toBe('경륜');

      const boatRace = { ...mockHorseRace, type: 'boat' as const };
      const boatSchema = generateSportsEventSchema(boatRace);
      expect(boatSchema.sport).toBe('경정');
    });
  });
});
