// src/config/__tests__/raceTypes.test.ts
import { RACE_TYPES, getRaceTypeLabel, getRaceTypeIcon, RaceTypeConfig } from '../raceTypes';
import { RaceType } from '@/types';

describe('RACE_TYPES config', () => {
  const expectedTypes: RaceType[] = ['horse', 'cycle', 'boat'];

  describe('Completeness', () => {
    it('should have all three race types defined', () => {
      expectedTypes.forEach((type) => {
        expect(RACE_TYPES[type]).toBeDefined();
      });
    });

    it('should have exactly three race types', () => {
      expect(Object.keys(RACE_TYPES)).toHaveLength(3);
    });
  });

  describe('Structure', () => {
    expectedTypes.forEach((type) => {
      describe(`${type} config`, () => {
        let config: RaceTypeConfig;

        beforeAll(() => {
          config = RACE_TYPES[type];
        });

        it('should have a label', () => {
          expect(config.label).toBeDefined();
          expect(typeof config.label).toBe('string');
          expect(config.label.length).toBeGreaterThan(0);
        });

        it('should have a shortLabel', () => {
          expect(config.shortLabel).toBeDefined();
          expect(typeof config.shortLabel).toBe('string');
          expect(config.shortLabel.length).toBeGreaterThan(0);
        });

        it('should have an icon', () => {
          expect(config.icon).toBeDefined();
          expect(typeof config.icon).toBe('string');
          expect(config.icon.length).toBeGreaterThan(0);
        });

        it('should have color configuration', () => {
          expect(config.color).toBeDefined();
          expect(config.color.primary).toBeDefined();
          expect(config.color.bg).toBeDefined();
          expect(config.color.border).toBeDefined();
          expect(config.color.badge).toBeDefined();
        });

        it('should have correct Tailwind class format in colors', () => {
          expect(config.color.primary).toMatch(/^text-/);
          expect(config.color.bg).toMatch(/^bg-/);
          expect(config.color.border).toMatch(/^border-/);
          expect(config.color.badge).toMatch(/^bg-/);
        });
      });
    });
  });

  describe('Expected values', () => {
    it('horse should have correct Korean label', () => {
      expect(RACE_TYPES.horse.label).toBe('경마');
    });

    it('cycle should have correct Korean label', () => {
      expect(RACE_TYPES.cycle.label).toBe('경륜');
    });

    it('boat should have correct Korean label', () => {
      expect(RACE_TYPES.boat.label).toBe('경정');
    });

    it('horse should have horse emoji', () => {
      expect(RACE_TYPES.horse.icon).toBe('🐎');
    });

    it('cycle should have bicycle emoji', () => {
      expect(RACE_TYPES.cycle.icon).toBe('🚴');
    });

    it('boat should have speedboat emoji', () => {
      expect(RACE_TYPES.boat.icon).toBe('🚤');
    });
  });

  describe('Helper functions', () => {
    describe('getRaceTypeLabel', () => {
      it('should return correct label for horse', () => {
        expect(getRaceTypeLabel('horse')).toBe('경마');
      });

      it('should return correct label for cycle', () => {
        expect(getRaceTypeLabel('cycle')).toBe('경륜');
      });

      it('should return correct label for boat', () => {
        expect(getRaceTypeLabel('boat')).toBe('경정');
      });
    });

    describe('getRaceTypeIcon', () => {
      it('should return correct icon for horse', () => {
        expect(getRaceTypeIcon('horse')).toBe('🐎');
      });

      it('should return correct icon for cycle', () => {
        expect(getRaceTypeIcon('cycle')).toBe('🚴');
      });

      it('should return correct icon for boat', () => {
        expect(getRaceTypeIcon('boat')).toBe('🚤');
      });
    });
  });
});
