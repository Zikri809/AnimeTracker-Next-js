import { describe, it, expect } from 'vitest';
import {
  getSeasonWindow,
  getSeasonCarouselWindow,
  generateSeasonStaticParams,
  validateSeasonParam,
  validateYearParam,
  formatSeasonTitle,
} from '../page-season';

describe('page-season helper', () => {
  describe('getSeasonWindow', () => {
    it('correctly calculates current season for representative dates', () => {
      // Jan - Winter
      expect(getSeasonWindow(new Date('2026-01-15')).current_season).toBe('winter');
      // Mar - Winter
      expect(getSeasonWindow(new Date('2026-03-31')).current_season).toBe('winter');
      // Apr - Spring
      expect(getSeasonWindow(new Date('2026-04-01')).current_season).toBe('spring');
      // Jun - Spring
      expect(getSeasonWindow(new Date('2026-06-15')).current_season).toBe('spring');
      // Jul - Summer
      expect(getSeasonWindow(new Date('2026-07-20')).current_season).toBe('summer');
      // Sep - Summer
      expect(getSeasonWindow(new Date('2026-09-30')).current_season).toBe('summer');
      // Oct - Fall
      expect(getSeasonWindow(new Date('2026-10-05')).current_season).toBe('fall');
      // Dec - Fall
      expect(getSeasonWindow(new Date('2026-12-25')).current_season).toBe('fall');
    });

    it('correctly calculates previous season year boundary (winter to previous fall)', () => {
      const seasonWindow = getSeasonWindow(new Date('2026-02-15'));
      expect(seasonWindow.current_season).toBe('winter');
      expect(seasonWindow.past_season).toBe('fall');
      expect(seasonWindow.past_year).toBe(2025);
    });

    it('correctly calculates upcoming season year boundary (fall to next winter)', () => {
      const seasonWindow = getSeasonWindow(new Date('2026-11-15'));
      expect(seasonWindow.current_season).toBe('fall');
      expect(seasonWindow.upcoming_season).toBe('winter');
      expect(seasonWindow.upcoming_year).toBe(2027);
    });

    it('throws error for invalid Date input', () => {
      expect(() => getSeasonWindow(new Date('invalid-date'))).toThrow('Invalid Date input');
    });
  });

  describe('getSeasonCarouselWindow', () => {
    it('returns the exact 9 ordered seasons expected by the carousel', () => {
      // For Spring 2026, we expect:
      // fall 2024, winter 2025, spring 2025, summer 2025, fall 2025, winter 2026, spring 2026, summer 2026, fall 2026
      const seasons = getSeasonCarouselWindow(new Date('2026-05-15'));
      expect(seasons).toHaveLength(9);
      expect(seasons[0]).toEqual({ season: 'fall', year: 2024 });
      expect(seasons[1]).toEqual({ season: 'winter', year: 2025 });
      expect(seasons[2]).toEqual({ season: 'spring', year: 2025 });
      expect(seasons[3]).toEqual({ season: 'summer', year: 2025 });
      expect(seasons[4]).toEqual({ season: 'fall', year: 2025 });
      expect(seasons[5]).toEqual({ season: 'winter', year: 2026 });
      expect(seasons[6]).toEqual({ season: 'spring', year: 2026 });
      expect(seasons[7]).toEqual({ season: 'summer', year: 2026 });
      expect(seasons[8]).toEqual({ season: 'fall', year: 2026 });
    });
  });

  describe('generateSeasonStaticParams', () => {
    it('returns string years and valid seasons only', () => {
      const params = generateSeasonStaticParams(new Date('2026-05-15'));
      expect(params).toHaveLength(9);
      params.forEach(param => {
        expect(typeof param.year).toBe('string');
        expect(['winter', 'spring', 'summer', 'fall']).toContain(param.season);
        expect(param.year).toMatch(/^\d{4}$/);
      });
    });
  });

  describe('validation and formatting helpers', () => {
    it('validates season parameters', () => {
      expect(validateSeasonParam('spring')).toBe('spring');
      expect(validateSeasonParam('  WINTER  ')).toBe('winter');
      expect(validateSeasonParam('invalid')).toBeNull();
      expect(validateSeasonParam(undefined)).toBeNull();
    });

    it('validates year parameters', () => {
      expect(validateYearParam('2026')).toBe(2026);
      expect(validateYearParam('  2025  ')).toBe(2025);
      expect(validateYearParam('empty')).toBeNull();
      expect(validateYearParam('20x6')).toBeNull();
      expect(validateYearParam('20.25')).toBeNull();
      expect(validateYearParam('-2026')).toBeNull();
      expect(validateYearParam(undefined)).toBeNull();
    });

    it('formats season titles correctly', () => {
      expect(formatSeasonTitle('spring', 2026)).toBe('Spring, 2026');
      expect(formatSeasonTitle('WINTER', '2025')).toBe('Winter, 2025');
    });
  });
});
