import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchPublicAnimeDetail } from './anime';
import { fetchAniListBannerImage, fetchJikanTrailerEmbedUrl } from '@/server/anime/jikan-detail';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe.each([
  ['Jikan trailer', fetchJikanTrailerEmbedUrl],
  ['AniList banner', fetchAniListBannerImage],
] as const)('%s deadline', (_name, fetchMedia) => {
  it.each(['headers', 'body'])('aborts a stalled response during %s without retrying', async (stage) => {
    vi.useFakeTimers();
    let signal: AbortSignal | undefined;
    const fetchMock = vi.fn((_url: string, init: RequestInit) => {
      signal = init.signal as AbortSignal;
      const stalled = () => new Promise<never>((_resolve, reject) => {
        signal!.addEventListener('abort', () => reject(new Error('aborted')), { once: true });
      });
      return stage === 'headers'
        ? stalled()
        : Promise.resolve({ ok: true, json: stalled } as unknown as Response);
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = fetchMedia(1);
    await vi.advanceTimersByTimeAsync(1999);
    expect(signal?.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await expect(result).resolves.toBeNull();
    expect(signal?.aborted).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('fetchPublicAnimeDetail', () => {
  it('requests the documented MAL detail fields with client credentials and caches at the edge', async () => {
    vi.stubEnv('Client_ID', 'test-client');
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      expect(url).toContain('https://api.myanimelist.net/v2/anime/21?');
      expect(url).toContain('fields=');
      expect(url).toContain('synopsis');
      expect(url).toContain('related_anime');
      expect(init?.headers).toEqual({ 'X-MAL-CLIENT-ID': 'test-client' });
      expect(init?.next).toEqual({ revalidate: 43200 });

      return {
        ok: true,
        json: async () => ({ id: 21, title: 'One Piece' }),
      } as Response;
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchPublicAnimeDetail(21)).resolves.toEqual({
      id: 21,
      title: 'One Piece',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('rejects invalid anime IDs without hitting the network', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchPublicAnimeDetail(0)).rejects.toThrow('Invalid anime ID');
    await expect(fetchPublicAnimeDetail(-5)).rejects.toThrow('Invalid anime ID');
    await expect(fetchPublicAnimeDetail('abc')).rejects.toThrow('Invalid anime ID');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('throws a status-tagged error when MAL responds with a non-ok status', async () => {
    vi.stubEnv('Client_ID', 'test-client');
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: false,
      status: 429,
      text: async () => 'Too Many Requests',
    } as Response)));

    try {
      await fetchPublicAnimeDetail(1);
      expect.fail('expected fetchPublicAnimeDetail to throw');
    } catch (error: any) {
      expect(error.status).toBe(429);
      expect(error.message).toContain('429');
    }
  });

  it('throws when the response ID does not match the requested anime', async () => {
    vi.stubEnv('Client_ID', 'test-client');
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({ id: 999, title: 'Mismatch' }),
    } as Response)));

    await expect(fetchPublicAnimeDetail(1)).rejects.toThrow('ID mismatch');
  });

  it('fails when the Client_ID environment variable is missing', async () => {
    vi.stubGlobal('fetch', vi.fn());
    await expect(fetchPublicAnimeDetail(1)).rejects.toThrow(
      'Missing required environment variable: Client_ID',
    );
  });
});

describe('fetchJikanTrailerEmbedUrl', () => {
  it('returns null on Jikan rate limiting instead of throwing', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: false,
      status: 429,
    } as Response)));

    await expect(fetchJikanTrailerEmbedUrl(1)).resolves.toBeNull();
  });

  it('extracts the trailer embed URL from a successful Jikan payload', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({
        data: { trailer: { embed_url: 'https://www.youtube.com/embed/abc' } },
      }),
    } as Response)));

    await expect(fetchJikanTrailerEmbedUrl(1)).resolves.toBe(
      'https://www.youtube.com/embed/abc',
    );
  });

  it('returns null when the payload has no trailer', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({ data: { trailer: { embed_url: null } } }),
    } as Response)));

    await expect(fetchJikanTrailerEmbedUrl(1)).resolves.toBeNull();
  });

  it('returns null when the network request itself fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => {
      throw new Error('network down');
    }));

    await expect(fetchJikanTrailerEmbedUrl(1)).resolves.toBeNull();
  });
});
