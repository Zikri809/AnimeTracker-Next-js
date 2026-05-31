import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as authorizeGET } from './authorize/route';
import { GET as callbackGET } from './callback/route';
import { GET as logoutGET } from './log_out/route';
import { GET as refreshGET, POST as refreshPOST } from './refresh_accesstoken/route';
import { GET as sessionGET } from './session/route';
import * as oauthHelpers from '@/server/mal/oauth';
import { COOKIES } from '@/server/http/cookies';

vi.mock('@/server/mal/oauth', async (importOriginal) => {
  const original: any = await importOriginal();
  return {
    ...original,
    exchangeAuthCode: vi.fn(),
    refreshAccessToken: vi.fn(),
  };
});

describe('Auth Route Handlers', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      Client_ID: 'client123',
      Client_Secret: 'secret123',
      dev_auth_redirect: 'http://localhost:3000/api/users/auth/callback',
      prod_auth_redirect: 'https://anime-tracker.vercel.app/api/users/auth/callback',
    };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('GET /api/users/auth/authorize', () => {
    it('redirects to MAL oauth page and sets transient cookies', async () => {
      const req = new NextRequest('http://localhost/api/users/auth/authorize');
      const res = await authorizeGET(req);

      expect(res.status).toBe(302);
      const redirectUrl = res.headers.get('Location');
      expect(redirectUrl).toContain('myanimelist.net/v1/oauth2/authorize');
      expect(redirectUrl).toContain('code_challenge_method=plain');
      
      const cookieHeader = res.headers.get('Set-Cookie');
      expect(cookieHeader).toContain(COOKIES.STATE);
      expect(cookieHeader).toContain(COOKIES.CODE_VERIFIER);
    });
  });

  describe('GET /api/users/auth/callback', () => {
    it('redirects to login_failed if query state or code is missing', async () => {
      const req = new NextRequest('http://localhost/api/users/auth/callback?code=123');
      const res = await callbackGET(req);
      expect(res.status).toBe(302);
      expect(res.headers.get('Location')).toContain('login_failed');
    });

    it('redirects to login_failed if state mismatch', async () => {
      const req = new NextRequest('http://localhost/api/users/auth/callback?code=123&state=stateX', {
        headers: {
          cookie: `${COOKIES.STATE}=stateY; ${COOKIES.CODE_VERIFIER}=verifier123`,
        },
      });
      const res = await callbackGET(req);
      expect(res.status).toBe(302);
      expect(res.headers.get('Location')).toContain('login_failed');
      expect(oauthHelpers.exchangeAuthCode).not.toHaveBeenCalled();
    });

    it('exchanges code and sets auth cookies on successful state match', async () => {
      vi.mocked(oauthHelpers.exchangeAuthCode).mockResolvedValue({
        access_token: 'accessX',
        refresh_token: 'refreshY',
        expires_in: 3600,
        token_type: 'Bearer',
      });

      const req = new NextRequest('http://localhost/api/users/auth/callback?code=code123&state=stateX', {
        headers: {
          cookie: `${COOKIES.STATE}=stateX; ${COOKIES.CODE_VERIFIER}=verifier123`,
        },
      });
      const res = await callbackGET(req);
      
      expect(res.status).toBe(302);
      expect(res.headers.get('Location')).toContain('login_success');
      expect(oauthHelpers.exchangeAuthCode).toHaveBeenCalledWith('code123', 'verifier123', 'http://localhost:3000/api/users/auth/callback');
      
      const setCookieHeaders = res.headers.getSetCookie();
      const cookiesStr = setCookieHeaders.join('; ');
      expect(cookiesStr).toContain(COOKIES.ACCESS_TOKEN);
      expect(cookiesStr).toContain(COOKIES.REFRESH_TOKEN);
      expect(cookiesStr).toContain(COOKIES.EXPIRES_IN);
    });

    it('redirects to decoded origin if it is different from current origin and is allowed', async () => {
      const targetOrigin = 'http://localhost:3000';
      const encodedOrigin = Buffer.from(targetOrigin).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      const state = `random123:${encodedOrigin}`;

      // Request lands on production domain: https://anime-tracker.vercel.app
      const req = new NextRequest(`https://anime-tracker.vercel.app/api/users/auth/callback?code=code123&state=${state}`);
      const res = await callbackGET(req);

      expect(res.status).toBe(302);
      expect(res.headers.get('Location')).toBe(`http://localhost:3000/api/users/auth/callback?code=code123&state=${state}`);
      expect(oauthHelpers.exchangeAuthCode).not.toHaveBeenCalled();
    });

    it('exchanges code using the decoded redirect_uri when on the correct origin', async () => {
      vi.mocked(oauthHelpers.exchangeAuthCode).mockResolvedValue({
        access_token: 'accessX',
        refresh_token: 'refreshY',
        expires_in: 3600,
        token_type: 'Bearer',
      });

      const currentOrigin = 'http://localhost:3000';
      const redirectUri = 'https://anime-tracker.vercel.app/api/users/auth/callback';
      const encodedOrigin = Buffer.from(currentOrigin).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      const encodedRedirect = Buffer.from(redirectUri).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      const state = `random123:${encodedOrigin}:${encodedRedirect}`;

      const req = new NextRequest(`http://localhost:3000/api/users/auth/callback?code=code123&state=${state}`, {
        headers: {
          cookie: `${COOKIES.STATE}=${state}; ${COOKIES.CODE_VERIFIER}=verifier123`,
        },
      });
      const res = await callbackGET(req);

      expect(res.status).toBe(302);
      expect(res.headers.get('Location')).toContain('login_success');
      // Should use the decoded redirectUri instead of getAuthRedirectUri()
      expect(oauthHelpers.exchangeAuthCode).toHaveBeenCalledWith('code123', 'verifier123', 'https://anime-tracker.vercel.app/api/users/auth/callback');
    });

    it('rejects authorization with redirect_uri if decoded redirect_uri is from an unallowed origin', async () => {
      const currentOrigin = 'http://localhost:3000';
      const maliciousRedirect = 'https://malicious-site.com/api/users/auth/callback';
      const encodedOrigin = Buffer.from(currentOrigin).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      const encodedRedirect = Buffer.from(maliciousRedirect).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      const state = `random123:${encodedOrigin}:${encodedRedirect}`;

      const req = new NextRequest(`http://localhost:3000/api/users/auth/callback?code=code123&state=${state}`, {
        headers: {
          cookie: `${COOKIES.STATE}=${state}; ${COOKIES.CODE_VERIFIER}=verifier123`,
        },
      });
      const res = await callbackGET(req);

      expect(res.status).toBe(302);
      expect(res.headers.get('Location')).toContain('login_failed');
      expect(oauthHelpers.exchangeAuthCode).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/users/auth/log_out', () => {
    it('clears all auth cookies and redirects to logout_success', async () => {
      const req = new NextRequest('http://localhost/api/users/auth/log_out');
      const res = await logoutGET(req);
      expect(res.status).toBe(302);
      expect(res.headers.get('Location')).toContain('logout_success');
      
      const setCookieHeaders = res.headers.getSetCookie();
      const cookiesStr = setCookieHeaders.join('; ');
      expect(cookiesStr).toContain(`${COOKIES.ACCESS_TOKEN}=;`);
      expect(cookiesStr).toContain(`${COOKIES.REFRESH_TOKEN}=;`);
    });
  });

  describe('GET/POST /api/users/auth/refresh_accesstoken', () => {
    it('returns 401 if refresh token is missing', async () => {
      const req = new NextRequest('http://localhost/api/users/auth/refresh_accesstoken');
      const res = await refreshGET(req);
      expect(res.status).toBe(401);
    });

    it('calls refreshAccessToken and updates cookies on success', async () => {
      vi.mocked(oauthHelpers.refreshAccessToken).mockResolvedValue({
        access_token: 'newAccess',
        refresh_token: 'newRefresh',
        expires_in: 3600,
        token_type: 'Bearer',
      });

      const req = new NextRequest('http://localhost/api/users/auth/refresh_accesstoken', {
        headers: {
          cookie: `${COOKIES.REFRESH_TOKEN}=oldRefresh`,
        },
      });
      const res = await refreshGET(req);
      expect(res.status).toBe(200);
      
      const setCookieHeaders = res.headers.getSetCookie();
      const cookiesStr = setCookieHeaders.join('; ');
      expect(cookiesStr).toContain(COOKIES.ACCESS_TOKEN);
      expect(cookiesStr).toContain(COOKIES.REFRESH_TOKEN);
    });

    it('clears cookies and returns 401 if refresh token is expired/invalid (401/403 upstream)', async () => {
      const error: any = new Error('MAL invalid token');
      error.status = 401;
      vi.mocked(oauthHelpers.refreshAccessToken).mockRejectedValue(error);

      const req = new NextRequest('http://localhost/api/users/auth/refresh_accesstoken', {
        method: 'POST',
        headers: {
          cookie: `${COOKIES.REFRESH_TOKEN}=oldRefresh`,
        },
      });
      const res = await refreshPOST(req);
      expect(res.status).toBe(401);

      const setCookieHeaders = res.headers.getSetCookie();
      const cookiesStr = setCookieHeaders.join('; ');
      expect(cookiesStr).toContain(`${COOKIES.ACCESS_TOKEN}=;`);
      expect(cookiesStr).toContain(`${COOKIES.REFRESH_TOKEN}=;`);
    });
  });

  describe('GET /api/users/auth/session', () => {
    it('returns unauthenticated if cookies absent', async () => {
      const req = new NextRequest('http://localhost/api/users/auth/session');
      const res = await sessionGET(req);
      expect(res.status).toBe(200);
      expect(res.headers.get('Cache-Control')).toContain('no-store');
      expect(res.headers.get('Vary')).toBe('Cookie');
      const data = await res.json();
      expect(data.authenticated).toBe(false);
    });

    it('returns authenticated session details', async () => {
      const futureDate = new Date(Date.now() + 100000).toISOString();
      const req = new NextRequest('http://localhost/api/users/auth/session', {
        headers: {
          cookie: `${COOKIES.ACCESS_TOKEN}=token123; ${COOKIES.EXPIRES_IN}=${futureDate}`,
        },
      });
      const res = await sessionGET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.authenticated).toBe(true);
    });
  });
});
