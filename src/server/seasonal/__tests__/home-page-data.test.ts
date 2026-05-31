import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchJikanSeasonCards,
  fetchAniListSpotlight,
  fetchHomeSeasonCarousel,
  fetchHomePageData,
} from '../home-page-data';
import * as malClient from '../mal-season-pages';
import { getSeasonWindow } from '../page-season';

describe('home-page-data helper', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('fetchJikanSeasonCards', () => {
    it('deduplicates by mal_id, limits to 24, and projects expected shape', async () => {
      const mockItems = Array.from({ length: 30 }, (_, i) => ({
        mal_id: i < 5 ? 1 : i, // create some duplicates for ID 1
        status: 'Currently Airing',
        images: { webp: { large_image_url: `url-${i}` } },
        year: 2026,
        title: `Anime ${i}`,
        score: 8.5,
        title_english: `Anime EN ${i}`,
      }));

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: mockItems }),
      });
      global.fetch = fetchMock;

      const result = await fetchJikanSeasonCards('spring', 2026);
      expect(result.isloading).toBe(false);
      expect(result.error).toBe(false);
      // 30 items: first 5 have id 1 (1 unique). Remaining 25 are unique.
      // Total unique items = 1 + 25 = 26. Limited to 24.
      expect(result.querydata).toHaveLength(24);
      expect(result.querydata[0]).toEqual({
        status: 'Currently Airing',
        mal_id: 1,
        images: { webp: { large_image_url: 'url-0' } },
        year: 2026,
        title: 'Anime 0',
        score: 8.5,
        title_english: 'Anime EN 0',
      });
    });

    it('returns error shape on upstream failure', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });
      global.fetch = fetchMock;

      const result = await fetchJikanSeasonCards('spring', 2026);
      expect(result.querydata).toEqual([]);
      expect(result.isloading).toBe(true);
      expect(result.error).toBe(true);
    });
  });

  describe('fetchAniListSpotlight', () => {
    it('posts expected GraphQL query and variables, dropping entries without idMal', async () => {
      let requestedUrl = '';
      let requestedBody: any = null;

      const mockMedia = [
        { idMal: 123, bannerImage: 'banner-url', genres: ['Action'], title: { english: 'Eng', romaji: 'Rom' } },
        { idMal: null, bannerImage: 'banner-url-2' }, // should be dropped
        { idMal: 456, bannerImage: null, genres: undefined, title: null },
      ];

      const fetchMock = vi.fn().mockImplementation((url, init) => {
        requestedUrl = url;
        requestedBody = JSON.parse(init.body);
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ data: { Page: { media: mockMedia } } }),
        });
      });
      global.fetch = fetchMock;

      const seasonWindow = getSeasonWindow(new Date('2026-05-15'));
      const result = await fetchAniListSpotlight(seasonWindow);

      expect(requestedUrl).toBe('https://graphql.anilist.co');
      expect(requestedBody.variables.season).toBe('SPRING');
      expect(requestedBody.variables.seasonYear).toBe(2026);
      expect(result.querydata).toHaveLength(2);
      expect(result.querydata[0]).toEqual({
        bannerImage: 'banner-url',
        idMal: 123,
        genres: ['Action'],
        title: { english: 'Eng', romaji: 'Rom' },
      });
      expect(result.querydata[1]).toEqual({
        bannerImage: undefined,
        idMal: 456,
        genres: [],
        title: { english: undefined, romaji: undefined },
      });
    });

    it('throws error on empty or malformed AniList response', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { Page: { media: [] } } }),
      });
      global.fetch = fetchMock;

      const seasonWindow = getSeasonWindow(new Date('2026-05-15'));
      await expect(fetchAniListSpotlight(seasonWindow)).rejects.toThrow(
        'AniList spotlight normalized media is empty'
      );
    });
  });

  describe('fetchHomeSeasonCarousel', () => {
    it('returns aligned representatives, using null when a season has no representative', async () => {
      const seasonWindow = getSeasonWindow(new Date('2026-05-15'));

      const fetchCachedMalSeasonSpy = vi.spyOn(malClient, 'fetchCachedMalSeason');
      // Mock fetchCachedMalSeason responses
      // Let's mock:
      // index 0: spring 2026 has a match
      // index 1: others throw or have no match
      fetchCachedMalSeasonSpy.mockImplementation((input: any) => {
        if (input.year === 2026 && input.season === 'spring') {
          return Promise.resolve([
            { node: { id: 1, start_season: { season: 'spring' as const, year: 2026 } } },
          ]);
        }
        return Promise.resolve([]);
      });

      const result = await fetchHomeSeasonCarousel(seasonWindow);
      expect(result.seasonal_data).toHaveLength(9);
      expect(result.season_anime).toHaveLength(9);

      // Spring 2026 is at index 6
      expect(result.season_anime[6]).not.toBeNull();
      expect(result.season_anime[6]?.node.id).toBe(1);
      // Other indices have no matches or throw, so should be null
      expect(result.season_anime[0]).toBeNull();
    });
  });
});
