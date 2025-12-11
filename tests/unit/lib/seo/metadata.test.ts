/**
 * @jest-environment node
 *
 * Unit tests for SEO metadata generation
 */
import { describe, expect, it } from '@jest/globals';
import { generateRaceMetadata, isHistoricalRace, type RaceMetadataInput } from '@/lib/seo/metadata';

describe('generateRaceMetadata', () => {
  const mockRace: RaceMetadataInput = {
    id: 'horse-sel-20251211-01',
    type: 'horse',
    track: '서울',
    raceNo: 1,
    date: '2025-12-11',
    distance: 1600,
  };

  it('generates title with track and race number', () => {
    const metadata = generateRaceMetadata(mockRace);

    expect(metadata.title).toContain('서울');
    expect(metadata.title).toContain('제1경주');
    expect(metadata.title).toContain('RaceLab');
  });

  it('includes race type in Korean in title', () => {
    const metadata = generateRaceMetadata(mockRace);

    expect(metadata.title).toContain('경마');
  });

  it('includes date in title for historical races', () => {
    const metadata = generateRaceMetadata(mockRace);

    expect(metadata.title).toContain('2025-12-11');
  });

  it('generates description with track, race number, and data source', () => {
    const metadata = generateRaceMetadata(mockRace);

    expect(metadata.description).toContain('서울');
    expect(metadata.description).toContain('제1경주');
    expect(metadata.description).toContain('한국마사회(KRA)');
  });

  it('includes canonical URL with race ID', () => {
    const metadata = generateRaceMetadata(mockRace);

    expect(metadata.alternates?.canonical).toContain('/race/horse-sel-20251211-01');
  });

  it('generates openGraph metadata', () => {
    const metadata = generateRaceMetadata(mockRace);

    expect(metadata.openGraph).toBeDefined();
    expect(metadata.openGraph?.title).toContain('서울');
    expect(metadata.openGraph?.type).toBe('website');
    expect(metadata.openGraph?.siteName).toBe('RaceLab');
    expect(metadata.openGraph?.locale).toBe('ko_KR');
  });

  it('includes openGraph images', () => {
    const metadata = generateRaceMetadata(mockRace);

    expect(metadata.openGraph?.images).toBeDefined();
    expect(metadata.openGraph?.images).toHaveLength(1);
    expect(metadata.openGraph?.images?.[0].width).toBe(1200);
    expect(metadata.openGraph?.images?.[0].height).toBe(630);
  });

  it('generates twitter metadata', () => {
    const metadata = generateRaceMetadata(mockRace);

    expect(metadata.twitter).toBeDefined();
    expect(metadata.twitter?.card).toBe('summary_large_image');
    expect(metadata.twitter?.title).toContain('서울');
  });

  it('uses KSPO data source for cycle racing', () => {
    const cycleRace = { ...mockRace, type: 'cycle' };
    const metadata = generateRaceMetadata(cycleRace);

    expect(metadata.description).toContain('국민체육진흥공단(KSPO)');
  });

  it('uses KSPO data source for boat racing', () => {
    const boatRace = { ...mockRace, type: 'boat' };
    const metadata = generateRaceMetadata(boatRace);

    expect(metadata.description).toContain('국민체육진흥공단(KSPO)');
  });

  it('handles missing date gracefully', () => {
    const raceWithoutDate = { ...mockRace, date: undefined };
    const metadata = generateRaceMetadata(raceWithoutDate);

    expect(metadata.title).toBeDefined();
    expect(metadata.description).toContain('오늘');
  });
});

describe('isHistoricalRace', () => {
  it('returns true for past dates', () => {
    const pastDate = '2020-01-01';
    expect(isHistoricalRace(pastDate)).toBe(true);
  });

  it('returns false for today', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(isHistoricalRace(today)).toBe(false);
  });

  it('returns false for future dates', () => {
    const futureDate = '2099-12-31';
    expect(isHistoricalRace(futureDate)).toBe(false);
  });
});
