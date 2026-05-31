import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as seasonalGET } from './seasonal/route';
import { GET as detailsGET } from './anime/anime_details/route';
import { GET as searchGET } from './anime/search/route';
import { GET as userDataGET } from './users/data/user_data/route';
import { GET as userListGET } from './users/data/userlist/route';
import { GET as saveGET, POST as savePOST } from './users/data/save_anime/route';
import { GET as deleteGET, DELETE as deleteDELETE } from './users/data/delete_anime/route';
import * as malClient from '@/server/mal/client';
import { COOKIES } from '@/server/http/cookies';

vi.mock('@/server/mal/client', () => ({
  fetchSeasonal: vi.fn(),
  fetchAnimeDetails: vi.fn(),
  fetchSearch: vi.fn(),
  fetchUserData: vi.fn(),
  fetchUserList: vi.fn(),
  saveAnime: vi.fn(),
  deleteAnime: vi.fn(),
}));

describe('Data Proxy Route Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/seasonal', () => {
    it('returns 400 if validation fails', async () => {
      const req = new NextRequest('http://localhost/api/seasonal?year=202&season=spring');
      const res = await seasonalGET(req);
      expect(res.status).toBe(400);
      expect(malClient.fetchSeasonal).not.toHaveBeenCalled();
    });

    it('returns MAL seasonal data on success', async () => {
      vi.mocked(malClient.fetchSeasonal).mockResolvedValue({ data: [] });
      const req = new NextRequest('http://localhost/api/seasonal?year=2026&season=spring');
      const res = await seasonalGET(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual({ data: [] });
    });
  });

  describe('GET /api/anime/anime_details', () => {
    it('returns 401 if access token is missing', async () => {
      const req = new NextRequest('http://localhost/api/anime/anime_details?id=123');
      const res = await detailsGET(req);
      expect(res.status).toBe(401);
    });

    it('returns details data on success', async () => {
      vi.mocked(malClient.fetchAnimeDetails).mockResolvedValue({ title: 'Anime' });
      const req = new NextRequest('http://localhost/api/anime/anime_details?id=123', {
        headers: { cookie: `${COOKIES.ACCESS_TOKEN}=access123` },
      });
      const res = await detailsGET(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual({ title: 'Anime' });
    });
  });

  describe('GET /api/users/data/user_data', () => {
    it('returns 401 if access token is missing', async () => {
      const req = new NextRequest('http://localhost/api/users/data/user_data');
      const res = await userDataGET(req);
      expect(res.status).toBe(401);
    });

    it('returns user profile and sets user_data cookie on success', async () => {
      const profile = { name: 'Zikri' };
      vi.mocked(malClient.fetchUserData).mockResolvedValue(profile);
      
      const req = new NextRequest('http://localhost/api/users/data/user_data', {
        headers: { cookie: `${COOKIES.ACCESS_TOKEN}=access123` },
      });
      const res = await userDataGET(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.user_data).toEqual(profile);
      
      const setCookies = res.headers.getSetCookie();
      expect(setCookies.join(';')).toContain(COOKIES.USER_DATA);
    });
  });

  describe('GET /api/users/data/userlist', () => {
    it('returns 400 on invalid query params', async () => {
      const req = new NextRequest('http://localhost/api/users/data/userlist?status=watching&sort=invalid_sort', {
        headers: { cookie: `${COOKIES.ACCESS_TOKEN}=access123` },
      });
      const res = await userListGET(req);
      expect(res.status).toBe(400);
    });

    it('returns userlist on success', async () => {
      vi.mocked(malClient.fetchUserList).mockResolvedValue({ data: [] });
      const req = new NextRequest('http://localhost/api/users/data/userlist?status=watching&sort=list_score&offset=0', {
        headers: { cookie: `${COOKIES.ACCESS_TOKEN}=access123` },
      });
      const res = await userListGET(req);
      expect(res.status).toBe(200);
      expect(res.headers.get('Cache-Control')).toContain('no-store');
      expect(res.headers.get('Vary')).toBe('Cookie');
      const body = await res.json();
      expect(body).toEqual({ data: [] });
    });
  });

  describe('GET/POST /api/users/data/save_anime', () => {
    it('returns 403 on cross-origin requests', async () => {
      const req = new NextRequest('http://localhost/api/users/data/save_anime', {
        headers: {
          cookie: `${COOKIES.ACCESS_TOKEN}=access123`,
          origin: 'http://malicious-site.com',
        },
      });
      const res = await saveGET(req);
      expect(res.status).toBe(403);
    });

    it('saves anime via GET request successfully', async () => {
      vi.mocked(malClient.saveAnime).mockResolvedValue({ status: 'watching' });
      const req = new NextRequest('http://localhost/api/users/data/save_anime?anime_id=123&status=watching&score=9&episode=4', {
        headers: {
          cookie: `${COOKIES.ACCESS_TOKEN}=access123`,
          origin: 'http://localhost',
        },
      });
      const res = await saveGET(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.message).toBe('successfully updated');
      expect(malClient.saveAnime).toHaveBeenCalledWith('access123', '123', 'watching', '9', '4');
    });

    it('keeps legacy GET mutation compatibility when Origin and Referer are absent', async () => {
      vi.mocked(malClient.saveAnime).mockResolvedValue({ status: 'watching' });
      const req = new NextRequest('http://localhost/api/users/data/save_anime?anime_id=123&status=watching&score=9&episode=4', {
        headers: {
          cookie: `${COOKIES.ACCESS_TOKEN}=access123`,
        },
      });
      const res = await saveGET(req);
      expect(res.status).toBe(200);
      expect(res.headers.get('Cache-Control')).toContain('no-store');
      expect(res.headers.get('Vary')).toBe('Cookie');
      expect(malClient.saveAnime).toHaveBeenCalledWith('access123', '123', 'watching', '9', '4');
    });

    it('saves anime via POST request successfully', async () => {
      vi.mocked(malClient.saveAnime).mockResolvedValue({ status: 'watching' });
      const req = new NextRequest('http://localhost/api/users/data/save_anime', {
        method: 'POST',
        headers: {
          cookie: `${COOKIES.ACCESS_TOKEN}=access123`,
          origin: 'http://localhost',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          anime_id: 123,
          status: 'watching',
          score: 9,
          episode: 4,
        }),
      });
      const res = await savePOST(req);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.message).toBe('successfully updated');
      expect(malClient.saveAnime).toHaveBeenCalledWith('access123', 123, 'watching', 9, 4);
    });
  });

  describe('GET/DELETE /api/users/data/delete_anime', () => {
    it('deletes anime via DELETE successfully', async () => {
      vi.mocked(malClient.deleteAnime).mockResolvedValue(true);
      const req = new NextRequest('http://localhost/api/users/data/delete_anime?anime_id=123', {
        method: 'DELETE',
        headers: {
          cookie: `${COOKIES.ACCESS_TOKEN}=access123`,
          origin: 'http://localhost',
        },
      });
      const res = await deleteDELETE(req);
      expect(res.status).toBe(200);
      expect(res.headers.get('Cache-Control')).toContain('no-store');
      expect(res.headers.get('Vary')).toBe('Cookie');
      const body = await res.json();
      expect(body.message).toBe('successfully deleted');
      expect(malClient.deleteAnime).toHaveBeenCalledWith('access123', '123');
    });
  });

  describe('GET /api/anime/search', () => {
    it('returns empty array if q is missing, empty, or NA', async () => {
      const reqEmpty = new NextRequest('http://localhost/api/anime/search');
      const resEmpty = await searchGET(reqEmpty);
      expect(resEmpty.status).toBe(200);
      expect(await resEmpty.json()).toEqual({ data: [] });

      const reqNA = new NextRequest('http://localhost/api/anime/search?q=NA');
      const resNA = await searchGET(reqNA);
      expect(resNA.status).toBe(200);
      expect(await resNA.json()).toEqual({ data: [] });
    });

    it('returns search data from Jikan successfully with caching headers', async () => {
      const mockJikanResponse = {
        data: [
          {
            mal_id: 12345,
            title: 'Test Jikan Anime',
            score: 8.9
          }
        ]
      };

      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockJikanResponse)
      });
      vi.stubGlobal('fetch', fetchMock);

      const req = new NextRequest('http://localhost/api/anime/search?q=test&page=2');
      const res = await searchGET(req);
      
      expect(res.status).toBe(200);
      expect(res.headers.get('Cache-Control')).toBe('public, max-age=3600, s-maxage=86400, stale-while-revalidate=60');
      
      const body = await res.json();
      expect(body).toEqual(mockJikanResponse);
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.jikan.moe/v4/anime?limit=24&sfw=true&page=2&q=test',
        expect.objectContaining({ method: 'GET' })
      );

      vi.unstubAllGlobals();
    });
  });
});
