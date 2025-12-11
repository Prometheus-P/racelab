/**
 * @jest-environment node
 *
 * Unit tests for SEO schema builders
 */
import { describe, expect, it } from '@jest/globals';
import { generateSportsEventSchema, generateFAQSchema } from '@/lib/seo/schemas';
import type { Race } from '@/types';

describe('generateSportsEventSchema', () => {
  const mockRace: Race = {
    id: 'horse-sel-20251211-01',
    type: 'horse',
    track: '서울',
    raceNo: 1,
    date: '2025-12-11',
    startTime: '10:30',
    status: 'upcoming',
    distance: 1600,
    entries: [
      { no: 1, name: '스피드킹', jockey: '김철수', odds: 3.5, status: 'active' },
      { no: 2, name: '골든에이스', jockey: '박영희', odds: 5.2, status: 'active' },
    ],
  };

  it('generates valid SportsEvent schema with required fields', () => {
    const schema = generateSportsEventSchema(mockRace);

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('SportsEvent');
    expect(schema.name).toBe('서울 제1경주');
    expect(schema.eventStatus).toBe('https://schema.org/EventScheduled');
  });

  it('includes @id with correct format', () => {
    const schema = generateSportsEventSchema(mockRace);

    expect(schema['@id']).toContain('/race/horse-sel-20251211-01#event');
  });

  it('generates correct description with distance', () => {
    const schema = generateSportsEventSchema(mockRace);

    expect(schema.description).toBe('경마 1600m 경주');
  });

  it('generates description without distance when not provided', () => {
    const raceWithoutDistance = { ...mockRace, distance: undefined };
    const schema = generateSportsEventSchema(raceWithoutDistance);

    expect(schema.description).toBe('경마 경주');
  });

  it('formats startDate in ISO 8601 with KST timezone', () => {
    const schema = generateSportsEventSchema(mockRace);

    expect(schema.startDate).toBe('2025-12-11T10:30:00+09:00');
  });

  it('maps upcoming status to EventScheduled', () => {
    const schema = generateSportsEventSchema(mockRace);

    expect(schema.eventStatus).toBe('https://schema.org/EventScheduled');
  });

  it('maps live status to EventScheduled', () => {
    const liveRace = { ...mockRace, status: 'live' as const };
    const schema = generateSportsEventSchema(liveRace);

    expect(schema.eventStatus).toBe('https://schema.org/EventScheduled');
  });

  it('maps finished status to EventScheduled (per Google guidelines)', () => {
    const finishedRace = { ...mockRace, status: 'finished' as const };
    const schema = generateSportsEventSchema(finishedRace);

    expect(schema.eventStatus).toBe('https://schema.org/EventScheduled');
  });

  it('maps canceled status to EventCancelled', () => {
    const cancelledRace = { ...mockRace, status: 'canceled' as const };
    const schema = generateSportsEventSchema(cancelledRace);

    expect(schema.eventStatus).toBe('https://schema.org/EventCancelled');
  });

  it('includes location with Place type', () => {
    const schema = generateSportsEventSchema(mockRace);

    expect(schema.location['@type']).toBe('Place');
    expect(schema.location.name).toBe('서울');
    expect(schema.location.address['@type']).toBe('PostalAddress');
    expect(schema.location.address.addressCountry).toBe('KR');
  });

  it('includes KRA organizer for horse racing', () => {
    const schema = generateSportsEventSchema(mockRace);

    expect(schema.organizer['@type']).toBe('Organization');
    expect(schema.organizer.name).toBe('한국마사회 (KRA)');
    expect(schema.organizer.url).toBe('https://kra.co.kr');
  });

  it('includes KSPO organizer for cycle racing', () => {
    const cycleRace = { ...mockRace, type: 'cycle' as const };
    const schema = generateSportsEventSchema(cycleRace);

    expect(schema.organizer.name).toBe('국민체육진흥공단 (KSPO)');
    expect(schema.organizer.url).toBe('https://kspo.or.kr');
  });

  it('includes KSPO organizer for boat racing', () => {
    const boatRace = { ...mockRace, type: 'boat' as const };
    const schema = generateSportsEventSchema(boatRace);

    expect(schema.organizer.name).toBe('국민체육진흥공단 (KSPO)');
  });

  it('includes competitor array with Thing type for horse racing', () => {
    const schema = generateSportsEventSchema(mockRace);

    expect(schema.competitor).toHaveLength(2);
    expect(schema.competitor[0]['@type']).toBe('Thing');
    expect(schema.competitor[0].name).toBe('스피드킹');
  });

  it('includes jockey as athlete for horse racing entries', () => {
    const schema = generateSportsEventSchema(mockRace);

    expect(schema.competitor[0].athlete).toBeDefined();
    expect(schema.competitor[0].athlete?.['@type']).toBe('Person');
    expect(schema.competitor[0].athlete?.name).toBe('김철수');
  });

  it('uses Person type for cycle/boat racing competitors', () => {
    const cycleRace: Race = {
      ...mockRace,
      type: 'cycle',
      entries: [{ no: 1, name: '선수A', status: 'active' }],
    };
    const schema = generateSportsEventSchema(cycleRace);

    expect(schema.competitor[0]['@type']).toBe('Person');
  });

  it('includes sport field in Korean', () => {
    const schema = generateSportsEventSchema(mockRace);

    expect(schema.sport).toBe('경마');
  });

  it('includes url field', () => {
    const schema = generateSportsEventSchema(mockRace);

    expect(schema.url).toContain('/race/horse-sel-20251211-01');
  });

  it('does not include subEvent when no results provided', () => {
    const schema = generateSportsEventSchema(mockRace);

    expect(schema.subEvent).toBeUndefined();
  });

  it('includes subEvent with top 3 results when provided', () => {
    const results = [
      { rank: 1, no: 1, name: '스피드킹', odds: 3.5 },
      { rank: 2, no: 2, name: '골든에이스', odds: 5.2 },
      { rank: 3, no: 3, name: '썬더볼트', odds: 8.1 },
    ];
    const schema = generateSportsEventSchema(mockRace, results);

    expect(schema.subEvent).toBeDefined();
    expect(schema.subEvent).toHaveLength(3);
    expect(schema.subEvent![0]['@type']).toBe('Event');
    expect(schema.subEvent![0].name).toBe('1착');
    expect(schema.subEvent![0].description).toContain('스피드킹');
    expect(schema.subEvent![0].description).toContain('3.5배');
  });

  it('limits subEvent to top 3 even if more results provided', () => {
    const results = [
      { rank: 1, no: 1, name: '선수1', odds: 3.5 },
      { rank: 2, no: 2, name: '선수2', odds: 5.2 },
      { rank: 3, no: 3, name: '선수3', odds: 8.1 },
      { rank: 4, no: 4, name: '선수4', odds: 10.0 },
      { rank: 5, no: 5, name: '선수5', odds: 12.0 },
    ];
    const schema = generateSportsEventSchema(mockRace, results);

    expect(schema.subEvent).toHaveLength(3);
  });
});

describe('generateFAQSchema', () => {
  const mockFAQs = [
    { question: '배당률이란 무엇인가요?', answer: '적중 시 받을 수 있는 배수입니다.' },
    { question: '단승식과 복승식의 차이는?', answer: '단승식은 1등만, 복승식은 1,2등을 맞춥니다.' },
  ];

  it('generates valid FAQPage schema', () => {
    const schema = generateFAQSchema(mockFAQs);

    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('FAQPage');
  });

  it('includes mainEntity array with Question types', () => {
    const schema = generateFAQSchema(mockFAQs);

    expect(schema.mainEntity).toHaveLength(2);
    expect(schema.mainEntity[0]['@type']).toBe('Question');
    expect(schema.mainEntity[0].name).toBe('배당률이란 무엇인가요?');
  });

  it('includes acceptedAnswer with Answer type', () => {
    const schema = generateFAQSchema(mockFAQs);

    expect(schema.mainEntity[0].acceptedAnswer['@type']).toBe('Answer');
    expect(schema.mainEntity[0].acceptedAnswer.text).toBe('적중 시 받을 수 있는 배수입니다.');
  });

  it('handles empty FAQ array', () => {
    const schema = generateFAQSchema([]);

    expect(schema.mainEntity).toHaveLength(0);
  });

  it('handles single FAQ item', () => {
    const singleFAQ = [{ question: '질문', answer: '답변' }];
    const schema = generateFAQSchema(singleFAQ);

    expect(schema.mainEntity).toHaveLength(1);
  });
});
