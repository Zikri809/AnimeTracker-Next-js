import { describe, it, expect } from 'vitest';
import {
  stripQueryString,
  parentPath,
  sanitizeSearchTerm,
  buildSearchHref,
  buildTrackingHref,
  buildDetailBackHref,
  buildTrackingBackHref,
  buildRelationHref,
  normalizeRouteParam,
  pathSegments,
  currentPathWithSearch
} from './path-utils';


describe('Path Utilities', () => {
  describe('normalizeRouteParam', () => {
    it('should extract first element from array', () => {
      expect(normalizeRouteParam(['one', 'two'])).toBe('one');
    });
    it('should return string as is', () => {
      expect(normalizeRouteParam('test')).toBe('test');
    });
    it('should return undefined for empty/null', () => {
      expect(normalizeRouteParam(undefined)).toBeUndefined();
      expect(normalizeRouteParam(null)).toBeUndefined();
    });
  });

  describe('stripQueryString', () => {
    it('should strip query parameters from path', () => {
      expect(stripQueryString('/search/naruto?x=1')).toBe('/search/naruto');
      expect(stripQueryString('/Anime/1')).toBe('/Anime/1');
    });
  });

  describe('pathSegments', () => {
    it('should split pathname into non-empty segments', () => {
      expect(pathSegments('/Anime/1/relation/20')).toEqual(['Anime', '1', 'relation', '20']);
      expect(pathSegments('/seasons/spring/2026/')).toEqual(['seasons', 'spring', '2026']);
    });
  });

  describe('parentPath', () => {
    it('should drop correct number of trailing segments', () => {
      expect(parentPath('/Anime/1/tracking')).toBe('/Anime/1');
      expect(parentPath('/Anime/1/relation/20/tracking', 1)).toBe('/Anime/1/relation/20');
      expect(parentPath('/Anime/1', 2)).toBe('/');
    });
  });

  describe('sanitizeSearchTerm', () => {
    it('should remove unsafe characters', () => {
      expect(sanitizeSearchTerm('naruto/shippuden\\<script>')).toBe('narutoshippudenscript');
      expect(sanitizeSearchTerm('frieren & beyond "\'')).toBe('frieren  beyond ');
    });
  });

  describe('buildSearchHref', () => {
    it('should handle normal terms', () => {
      expect(buildSearchHref('frieren')).toBe('/search/frieren');
    });
    it('should handle sanitization and encoding', () => {
      expect(buildSearchHref('frieren/beyond')).toBe('/search/frierenbeyond');
      expect(buildSearchHref('spy family')).toBe('/search/spy%20family');
      expect(buildSearchHref('////')).toBe('/');
      expect(buildSearchHref('')).toBe('/');
    });
  });

  describe('buildTrackingHref', () => {
    const testCases = [
      { path: '/Anime/1', expected: '/Anime/1/tracking' },
      { path: '/Anime/1/relation/20', expected: '/Anime/1/relation/20/tracking' },
      { path: '/search/NA/1', expected: '/search/NA/1/tracking' },
      { path: '/search/spy%20family/1/relation/20', expected: '/search/spy%20family/1/relation/20/tracking' },
      { path: '/mylist/PlanToWatch/1', expected: '/mylist/PlanToWatch/1/tracking' },
      { path: '/mylist/Completed/1/relation/20', expected: '/mylist/Completed/1/relation/20/tracking' },
      { path: '/morethiseseason/1', expected: '/morethiseseason/1/tracking' },
      { path: '/morelastseason/1/relation/20', expected: '/morelastseason/1/relation/20/tracking' },
      { path: '/moreupcoming/1', expected: '/moreupcoming/1/tracking' },
      { path: '/seasons/spring/2026/1', expected: '/seasons/spring/2026/1/tracking' },
      { path: '/seasons/spring/2026/1/relation/20', expected: '/seasons/spring/2026/1/relation/20/tracking' },
    ];

    testCases.forEach(({ path, expected }) => {
      it(`should map ${path} to ${expected}`, () => {
        expect(buildTrackingHref({ pathname: path })).toBe(expected);
      });
    });
  });

  describe('buildDetailBackHref', () => {
    const testCases = [
      { path: '/Anime/1', expected: '/' },
      { path: '/Anime/1/relation/20', expected: '/Anime/1' },
      { path: '/search/NA/1', expected: '/search/NA' },
      { path: '/search/NA/1/relation/20', expected: '/search/NA/1' },
      { path: '/mylist/PlanToWatch/1', expected: '/mylist' },
      { path: '/mylist/PlanToWatch/1/relation/20', expected: '/mylist/PlanToWatch/1' },
      { path: '/morethiseseason/1', expected: '/morethiseseason' },
      { path: '/morethiseseason/1/relation/20', expected: '/morethiseseason/1' },
      { path: '/seasons/spring/2026/1', expected: '/seasons/spring/2026' },
      { path: '/seasons/spring/2026/1/relation/20', expected: '/seasons/spring/2026/1' },
    ];

    testCases.forEach(({ path, expected }) => {
      it(`should map ${path} to ${expected}`, () => {
        expect(buildDetailBackHref({ pathname: path })).toBe(expected);
      });
    });
  });

  describe('buildTrackingBackHref', () => {
    const testCases = [
      { path: '/Anime/1/tracking', expected: '/Anime/1' },
      { path: '/Anime/1/relation/20/tracking', expected: '/Anime/1/relation/20' },
      { path: '/search/NA/1/tracking?draft=1', expected: '/search/NA/1' },
      { path: '/mylist/Watching/1/relation/20/tracking', expected: '/mylist/Watching/1/relation/20' },
    ];

    testCases.forEach(({ path, expected }) => {
      it(`should map ${path} to ${expected}`, () => {
        expect(buildTrackingBackHref(path)).toBe(expected);
      });
    });
  });

  describe('buildRelationHref', () => {
    it('should build relation link from standard page', () => {
      expect(buildRelationHref({ pathname: '/Anime/1', relationId: 20 })).toBe('/Anime/1/relation/20');
      expect(buildRelationHref({ pathname: '/search/NA/1', relationId: 20 })).toBe('/search/NA/1/relation/20');
    });

    it('should replace relation ID when already on a relation route', () => {
      expect(buildRelationHref({ pathname: '/Anime/1/relation/20', relationId: 30 })).toBe('/Anime/1/relation/30');
      expect(buildRelationHref({ pathname: '/seasons/spring/2026/1/relation/20', relationId: 30 })).toBe('/seasons/spring/2026/1/relation/30');
    });
  });

  describe('currentPathWithSearch', () => {
    it('should append search params to the pathname', () => {
      const searchParams = new URLSearchParams({ q: 'test', page: '2' });
      expect(currentPathWithSearch('/mylist', searchParams)).toBe('/mylist?q=test&page=2');
    });

    it('should handle custom stringable objects', () => {
      const customObj = { toString() { return 'custom=val'; } };
      expect(currentPathWithSearch('/mylist', customObj)).toBe('/mylist?custom=val');
    });

    it('should return base path when params are empty, null or undefined', () => {
      expect(currentPathWithSearch('/mylist', null)).toBe('/mylist');
      expect(currentPathWithSearch('/mylist', undefined)).toBe('/mylist');
      expect(currentPathWithSearch('/mylist', new URLSearchParams())).toBe('/mylist');
    });

    it('should strip existing query parameters from the pathname before appending', () => {
      const searchParams = new URLSearchParams({ page: '3' });
      expect(currentPathWithSearch('/mylist?old=1', searchParams)).toBe('/mylist?page=3');
    });
  });

  describe('Edge cases and boundaries', () => {
    it('normalizeRouteParam should handle empty arrays or empty strings', () => {
      expect(normalizeRouteParam([])).toBeUndefined();
      expect(normalizeRouteParam('')).toBeUndefined();
    });

    it('parentPath should handle zero, negative, or extremely large segment counts', () => {
      expect(parentPath('/Anime/1/relation/20', 0)).toBe('/Anime/1/relation/20');
      expect(parentPath('/Anime/1/relation/20', -1)).toBe('/Anime/1/relation/20');
      expect(parentPath('/Anime/1/relation/20', 99)).toBe('/');
    });
  });
});
