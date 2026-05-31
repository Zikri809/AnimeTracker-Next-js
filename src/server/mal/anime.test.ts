import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkAnimeAppearsInMalSearch, isPotentiallyRestrictedAnime } from './anime';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('MAL Anime Helpers', () => {
  describe('isPotentiallyRestrictedAnime', () => {
    it('flags titles with NSFW rating or genre signals', () => {
      expect(isPotentiallyRestrictedAnime({ rating: 'rx' })).toBe(true);
      expect(isPotentiallyRestrictedAnime({ rating: 'r_plus' })).toBe(true);
      expect(isPotentiallyRestrictedAnime({ genres: [{ name: 'Hentai' }] })).toBe(true);
      expect(isPotentiallyRestrictedAnime({ genres: [{ name: 'Erotica' }] })).toBe(true);
      expect(isPotentiallyRestrictedAnime({ genres: [{ name: 'Ecchi' }] })).toBe(true);
    });

    it('does not flag normal TV anime metadata', () => {
      expect(isPotentiallyRestrictedAnime({
        rating: 'pg_13',
        media_type: 'tv',
        genres: [{ name: 'Action' }, { name: 'Adventure' }],
      })).toBe(false);
    });
  });

  describe('checkAnimeAppearsInMalSearch', () => {
    it('checks official MAL search with nsfw results included', async () => {
      vi.stubEnv('Client_ID', 'test-client');
      const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toContain('/anime?');
        expect(url).toContain('nsfw=true');
        expect(init?.headers).toEqual({ 'X-MAL-CLIENT-ID': 'test-client' });

        return {
          ok: true,
          json: async () => ({
            data: [
              { node: { id: 1, title: 'Other' } },
              { node: { id: 21, title: 'One Piece' } },
            ],
          }),
        } as Response;
      });
      vi.stubGlobal('fetch', fetchMock);

      await expect(checkAnimeAppearsInMalSearch(21, 'One Piece')).resolves.toBe(true);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('returns false when MAL search succeeds but hides the target ID', async () => {
      vi.stubEnv('Client_ID', 'test-client');
      vi.stubGlobal('fetch', vi.fn(async () => ({
        ok: true,
        json: async () => ({ data: [{ node: { id: 1, title: 'Other' } }] }),
      } as Response)));

      await expect(checkAnimeAppearsInMalSearch(21, 'One Piece')).resolves.toBe(false);
    });
  });
});
