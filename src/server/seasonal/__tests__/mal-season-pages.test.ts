import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  fetchCachedMalSeason,
  fetchCachedMalSeasonOrEmpty,
  normalizeMalSeasonResponse,
  filterSeasonStart,
  pickSeasonRepresentative,
} from '../mal-season-pages';

describe('mal-season-pages helper', () => {
  const originalFetch = global.fetch;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.Client_ID = 'mock-client-id';
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env = originalEnv;
  });

  describe('fetchCachedMalSeason', () => {
    it('builds the exact MAL seasonal URL, headers, and next revalidate option', async () => {
      let requestedUrl = '';
      let requestedHeaders: Record<string, string> = {};
      let requestedInit: any = {};

      const fetchMock = vi.fn().mockImplementation((url, init) => {
        requestedUrl = url;
        requestedHeaders = init?.headers || {};
        requestedInit = init || {};
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ data: [] }),
        });
      });
      global.fetch = fetchMock;

      const result = await fetchCachedMalSeason({
        year: 2026,
        season: 'spring',
        sort: 'descending',
      });

      expect(result).toEqual([]);
      expect(requestedUrl).toContain('https://api.myanimelist.net/v2/anime/season/2026/spring');
      expect(requestedUrl).toContain('sort=descending');
      expect(requestedUrl).toContain('limit=500');
      expect(requestedUrl).toContain('offset=0');
      expect(requestedHeaders['X-MAL-CLIENT-ID']).toBe('mock-client-id');
      expect(requestedInit.next).toEqual({ revalidate: 43200 });
      expect(requestedInit.cache).toBeUndefined(); // should not use cache: 'no-store'
    });

    it('fails safely when Client_ID is missing', async () => {
      delete (process.env as any).Client_ID;
      await expect(
        fetchCachedMalSeason({ year: 2026, season: 'spring' })
      ).rejects.toThrow('Missing required environment variable: Client_ID');
    });

    it('throws when upstream response is not ok (e.g. 500)', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      });
      global.fetch = fetchMock;

      await expect(
        fetchCachedMalSeason({ year: 2026, season: 'spring' })
      ).rejects.toThrow('MAL Seasonal API returned status 500');
    });

    it('returns an empty list for page callers when MAL is unavailable', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
      });
      global.fetch = fetchMock;
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      await expect(
        fetchCachedMalSeasonOrEmpty({ year: 2026, season: 'spring' })
      ).resolves.toEqual([]);

      consoleSpy.mockRestore();
    });
  });

  describe('normalizeMalSeasonResponse', () => {
    it('normalizes valid raw MAL payload and removes duplicate node IDs', () => {
      const raw = {
        data: [
          { node: { id: 1, title: 'Anime 1' } },
          { node: { id: 2, title: 'Anime 2' } },
          { node: { id: 1, title: 'Anime 1 Duplicate' } }, // Duplicate id
          { node: { title: 'No ID' } }, // Missing id
          { missingNode: {} }, // Missing node
        ],
      };

      const normalized = normalizeMalSeasonResponse(raw);
      expect(normalized).toHaveLength(2);
      expect(normalized[0].node.id).toBe(1);
      expect(normalized[0].node.title).toBe('Anime 1');
      expect(normalized[1].node.id).toBe(2);
    });

    it('returns empty array when data field is missing or invalid', () => {
      expect(normalizeMalSeasonResponse(null)).toEqual([]);
      expect(normalizeMalSeasonResponse({})).toEqual([]);
      expect(normalizeMalSeasonResponse({ data: 'not-an-array' })).toEqual([]);
    });

    it('survives missing optional fields', () => {
      const raw = {
        data: [
          { node: { id: 1 } },
        ],
      };
      const normalized = normalizeMalSeasonResponse(raw);
      expect(normalized).toHaveLength(1);
      expect(normalized[0].node.id).toBe(1);
      expect(normalized[0].node.title).toBeUndefined();
    });
  });

  describe('filterSeasonStart', () => {
    it('guards missing start_season and filters correctly', () => {
      const items = [
        { node: { id: 1, start_season: { season: 'spring' as const, year: 2026 } } },
        { node: { id: 2, start_season: { season: 'winter' as const, year: 2026 } } },
        { node: { id: 3 } }, // missing start_season
      ];

      const filtered = filterSeasonStart(items, 'spring', 2026);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].node.id).toBe(1);
    });
  });

  describe('pickSeasonRepresentative', () => {
    it('returns first matching item or null', () => {
      const items = [
        { node: { id: 1, start_season: { season: 'spring' as const, year: 2026 } } },
        { node: { id: 2, start_season: { season: 'spring' as const, year: 2026 } } },
      ];

      const representative = pickSeasonRepresentative(items, 'spring', 2026);
      expect(representative).not.toBeNull();
      expect(representative?.node.id).toBe(1);

      expect(pickSeasonRepresentative(items, 'winter', 2026)).toBeNull();
    });
  });
});
