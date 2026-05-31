import { describe, it, expect } from 'vitest';
import {
  parseDetailRouteContext,
  buildDetailHref,
  buildTrackingHrefFromContext,
  buildTrackingReturnHref,
  buildRelationHrefFromContext,
  buildRetryLimitHref,
  isValidId,
} from './detail-route-context';

describe('Detail Route Context Helper', () => {
  describe('isValidId', () => {
    it('should validate correct ids', () => {
      expect(isValidId(1)).toBe(true);
      expect(isValidId('123')).toBe(true);
    });

    it('should reject invalid ids', () => {
      expect(isValidId(0)).toBe(false);
      expect(isValidId(-5)).toBe(false);
      expect(isValidId(1.5)).toBe(false);
      expect(isValidId('1.5')).toBe(false);
      expect(isValidId('abc')).toBe(false);
      expect(isValidId(NaN)).toBe(false);
      expect(isValidId(Infinity)).toBe(false);
      expect(isValidId(undefined)).toBe(false);
      expect(isValidId(null)).toBe(false);
      expect(isValidId('')).toBe(false);
    });
  });

  describe('parseDetailRouteContext', () => {
    it('should parse Anime detail root route', () => {
      const ctx = parseDetailRouteContext('/Anime/123');
      expect(ctx.family).toBe('anime');
      expect(ctx.sourceAnimeId).toBe(123);
      expect(ctx.targetAnimeId).toBe(123);
      expect(ctx.isRelationRoute).toBe(false);
      expect(ctx.isTrackingRoute).toBe(false);
    });

    it('should parse Anime tracking route', () => {
      const ctx = parseDetailRouteContext('/Anime/123/tracking');
      expect(ctx.family).toBe('anime');
      expect(ctx.sourceAnimeId).toBe(123);
      expect(ctx.targetAnimeId).toBe(123);
      expect(ctx.isRelationRoute).toBe(false);
      expect(ctx.isTrackingRoute).toBe(true);
    });

    it('should parse Anime relation route', () => {
      const ctx = parseDetailRouteContext('/Anime/123/relation/456');
      expect(ctx.family).toBe('anime');
      expect(ctx.sourceAnimeId).toBe(123);
      expect(ctx.targetAnimeId).toBe(456);
      expect(ctx.relationAnimeId).toBe(456);
      expect(ctx.isRelationRoute).toBe(true);
      expect(ctx.isTrackingRoute).toBe(false);
    });

    it('should parse Anime relation tracking route', () => {
      const ctx = parseDetailRouteContext('/Anime/123/relation/456/tracking');
      expect(ctx.family).toBe('anime');
      expect(ctx.sourceAnimeId).toBe(123);
      expect(ctx.targetAnimeId).toBe(456);
      expect(ctx.relationAnimeId).toBe(456);
      expect(ctx.isRelationRoute).toBe(true);
      expect(ctx.isTrackingRoute).toBe(true);
    });

    it('should parse morethiseseason routes', () => {
      const ctx = parseDetailRouteContext('/morethiseseason/123/relation/456/tracking');
      expect(ctx.family).toBe('morethiseseason');
      expect(ctx.sourceAnimeId).toBe(123);
      expect(ctx.targetAnimeId).toBe(456);
    });

    it('should parse morelastseason routes', () => {
      const ctx = parseDetailRouteContext('/morelastseason/123');
      expect(ctx.family).toBe('morelastseason');
      expect(ctx.sourceAnimeId).toBe(123);
    });

    it('should parse moreupcoming routes', () => {
      const ctx = parseDetailRouteContext('/moreupcoming/123/tracking');
      expect(ctx.family).toBe('moreupcoming');
      expect(ctx.sourceAnimeId).toBe(123);
      expect(ctx.isTrackingRoute).toBe(true);
    });

    it('should parse search routes', () => {
      const ctx = parseDetailRouteContext('/search/naruto%20shippuden/123/relation/456/tracking');
      expect(ctx.family).toBe('search');
      expect(ctx.title).toBe('naruto%20shippuden');
      expect(ctx.sourceAnimeId).toBe(123);
      expect(ctx.targetAnimeId).toBe(456);
    });

    it('should parse mylist routes', () => {
      const ctx = parseDetailRouteContext('/mylist/Watching/123/tracking');
      expect(ctx.family).toBe('mylist');
      expect(ctx.mylistTab).toBe('Watching');
      expect(ctx.sourceAnimeId).toBe(123);
      expect(ctx.isTrackingRoute).toBe(true);
    });

    it('should parse seasons routes', () => {
      const ctx = parseDetailRouteContext('/seasons/spring/2026/123/relation/456/tracking');
      expect(ctx.family).toBe('seasons');
      expect(ctx.season).toBe('spring');
      expect(ctx.year).toBe(2026);
      expect(ctx.sourceAnimeId).toBe(123);
      expect(ctx.targetAnimeId).toBe(456);
      expect(ctx.isTrackingRoute).toBe(true);
    });

    it('should throw errors on invalid structures', () => {
      expect(() => parseDetailRouteContext('/Anime')).toThrow();
      expect(() => parseDetailRouteContext('/Anime/abc')).toThrow();
      expect(() => parseDetailRouteContext('/seasons/spring/abc/123')).toThrow();
      expect(() => parseDetailRouteContext('/Anime/123/relation')).toThrow();
      expect(() => parseDetailRouteContext('/Anime/123/relation/abc')).toThrow();
      expect(() => parseDetailRouteContext('/Anime/123/relation/456/tracking/extra')).toThrow();
      expect(() => parseDetailRouteContext('/otherfamily/123')).toThrow();
    });
  });

  describe('buildHref functions', () => {
    it('should build correct detail href', () => {
      const ctx = parseDetailRouteContext('/seasons/spring/2026/123/relation/456/tracking');
      expect(buildDetailHref(ctx)).toBe('/seasons/spring/2026/123/relation/456');
    });

    it('should build correct tracking href', () => {
      const ctx = parseDetailRouteContext('/search/naruto/123');
      expect(buildTrackingHrefFromContext(ctx)).toBe('/search/naruto/123/tracking');
    });

    it('should encode dynamic path segments without double-encoding existing encoded titles', () => {
      const encodedCtx = parseDetailRouteContext('/search/spy%20family/123');
      expect(buildTrackingHrefFromContext(encodedCtx)).toBe('/search/spy%20family/123/tracking');

      const decodedCtx = {
        ...encodedCtx,
        title: 'spy family?',
      };
      expect(buildTrackingHrefFromContext(decodedCtx)).toBe('/search/spy%20family%3F/123/tracking');
    });

    it('should build correct tracking return href', () => {
      const ctx = parseDetailRouteContext('/Anime/123/tracking');
      expect(buildTrackingReturnHref(ctx)).toBe('/Anime/123');
    });

    it('should build correct relation href from context', () => {
      const ctx = parseDetailRouteContext('/Anime/123/tracking');
      expect(buildRelationHrefFromContext(ctx, 999)).toBe('/Anime/123/relation/999');
    });

    it('should build correct retry limit href', () => {
      const href = buildRetryLimitHref('/Anime/123', { mal_id: '123' });
      expect(href).toBe('/ExceedRetryLimit?original_link=%2FAnime%2F123&original_query=%7B%22mal_id%22%3A%22123%22%7D');
    });
  });
});
