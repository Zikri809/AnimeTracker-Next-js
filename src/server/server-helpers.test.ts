import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getRequiredEnv, getAuthRedirectUri, getBaseUrl } from './env';
import {
  parseStrictInt,
  validateYear,
  validateSeason,
  validateUserListStatus,
  validateUserListSort,
  validateScore,
  validateEpisode,
  validateOffset,
  validateLimit,
  validateAnimeId,
} from './mal/validation';
import { getSessionFromCookies } from './auth/session';
import { COOKIES, setAuthCookies, clearAllAuthCookies, setOAuthTransientCookies, clearOAuthTransientCookies } from './http/cookies';
import { generateSecureRandomString, generatePkcePlain, buildAuthorizeUrl, validateTokenResponse } from './mal/oauth';

describe('Server Helpers Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Env Helper', () => {
    it('should read required env variables or throw', () => {
      process.env.TEST_VAR = 'hello';
      expect(getRequiredEnv('TEST_VAR')).toBe('hello');
      expect(() => getRequiredEnv('NON_EXISTENT_VAR')).toThrow();
    });

    it('should determine redirect URI based on NODE_ENV', () => {
      process.env.dev_auth_redirect = 'http://localhost/dev';
      process.env.prod_auth_redirect = 'https://anime.app/prod';
      
      (process.env as any).NODE_ENV = 'development';
      expect(getAuthRedirectUri()).toBe('http://localhost/dev');

      (process.env as any).NODE_ENV = 'production';
      expect(getAuthRedirectUri()).toBe('https://anime.app/prod');
    });

    it('should resolve base URL correctly', () => {
      (process.env as any).NODE_ENV = 'production';
      process.env.Prod_host = 'https://anime.app';
      expect(getBaseUrl()).toBe('https://anime.app/');

      delete (process.env as any).Prod_host;
      process.env.VERCEL_URL = 'my-vercel-deploy.vercel.app';
      expect(getBaseUrl()).toBe('https://my-vercel-deploy.vercel.app/');

      (process.env as any).NODE_ENV = 'development';
      process.env.NEXT_PUBLIC_Local_host = 'http://localhost:3000';
      expect(getBaseUrl()).toBe('http://localhost:3000/');
      
      expect(getBaseUrl('http://origin:5000')).toBe('http://origin:5000/');
    });
  });

  describe('Validation Helper', () => {
    it('parseStrictInt parses digits strictly', () => {
      expect(parseStrictInt('123')).toBe(123);
      expect(parseStrictInt('  456  ')).toBe(456);
      expect(parseStrictInt('123a')).toBeNull();
      expect(parseStrictInt('a123')).toBeNull();
      expect(parseStrictInt('12.3')).toBeNull();
      expect(parseStrictInt('-5')).toBeNull();
      expect(parseStrictInt('')).toBeNull();
      expect(parseStrictInt(null)).toBeNull();
    });

    it('validateYear checks format', () => {
      expect(validateYear('2026')).toBe(2026);
      expect(() => validateYear('26')).toThrow();
      expect(() => validateYear('2026a')).toThrow();
      expect(() => validateYear(null)).toThrow();
    });

    it('validateSeason checks season list', () => {
      expect(validateSeason('spring')).toBe('spring');
      expect(validateSeason('WINTER ')).toBe('winter');
      expect(() => validateSeason('autumn')).toThrow();
    });

    it('validateUserListStatus checks status list', () => {
      expect(validateUserListStatus('plan_to_watch')).toBe('plan_to_watch');
      expect(validateUserListStatus('completed')).toBe('completed');
      expect(() => validateUserListStatus('unknown')).toThrow();
    });

    it('validateUserListSort checks sort list', () => {
      expect(validateUserListSort('list_score')).toBe('list_score');
      expect(() => validateUserListSort('score')).toThrow();
    });

    it('validateScore checks range', () => {
      expect(validateScore('10')).toBe(10);
      expect(validateScore(0)).toBe(0);
      expect(() => validateScore('11')).toThrow();
      expect(() => validateScore('-1')).toThrow();
    });

    it('validateEpisode checks non-negative', () => {
      expect(validateEpisode('0')).toBe(0);
      expect(validateEpisode(105)).toBe(105);
      expect(() => validateEpisode('-2')).toThrow();
      expect(() => validateEpisode('abc')).toThrow();
    });

    it('validateOffset checks offset', () => {
      expect(validateOffset(undefined)).toBe(0);
      expect(validateOffset('100')).toBe(100);
      expect(() => validateOffset('-10')).toThrow();
    });

    it('validateLimit checks range', () => {
      expect(validateLimit(undefined)).toBe(500);
      expect(validateLimit('100')).toBe(100);
      expect(() => validateLimit('0')).toThrow();
      expect(() => validateLimit('501')).toThrow();
    });

    it('validateAnimeId checks positive', () => {
      expect(validateAnimeId('12345')).toBe(12345);
      expect(() => validateAnimeId('0')).toThrow();
      expect(() => validateAnimeId('-5')).toThrow();
    });
  });

  describe('Session Helper', () => {
    it('returns unauthenticated if cookies missing', () => {
      const emptyGetter = { get: () => undefined };
      const session = getSessionFromCookies(emptyGetter);
      expect(session.authenticated).toBe(false);
      expect(session.accessTokenExpiresAt).toBeNull();
    });

    it('returns authenticated if access token is valid and future expiry', () => {
      const futureDate = new Date(Date.now() + 100000).toISOString();
      const mockStore: Record<string, string> = {
        [COOKIES.ACCESS_TOKEN]: 'token123',
        [COOKIES.EXPIRES_IN]: futureDate,
        [COOKIES.REFRESH_TOKEN]: 'refresh123',
        [COOKIES.USER_DATA]: JSON.stringify({ name: 'User' }),
      };
      
      const getter = { get: (name: string) => mockStore[name] ? { value: mockStore[name] } : undefined };
      const session = getSessionFromCookies(getter);
      
      expect(session.authenticated).toBe(true);
      expect(session.accessTokenExpiresAt).toBe(new Date(futureDate).toISOString());
      expect(session.hasRefreshToken).toBe(true);
      expect(session.userData).toEqual({ name: 'User' });
    });

    it('returns unauthenticated if expiry date is in the past', () => {
      const pastDate = new Date(Date.now() - 10000).toISOString();
      const mockStore: Record<string, string> = {
        [COOKIES.ACCESS_TOKEN]: 'token123',
        [COOKIES.EXPIRES_IN]: pastDate,
      };
      
      const getter = { get: (name: string) => mockStore[name] ? { value: mockStore[name] } : undefined };
      const session = getSessionFromCookies(getter);
      
      expect(session.authenticated).toBe(false);
    });
  });

  describe('Cookies Helper', () => {
    it('sets and clears cookies correctly', () => {
      const setMock = vi.fn();
      const responseMock = {
        cookies: {
          set: setMock,
        },
      };

      setOAuthTransientCookies(responseMock, 'state123', 'verifier123');
      expect(setMock).toHaveBeenCalledWith(COOKIES.STATE, 'state123', expect.any(Object));
      expect(setMock).toHaveBeenCalledWith(COOKIES.CODE_VERIFIER, 'verifier123', expect.any(Object));

      setMock.mockClear();
      setAuthCookies(responseMock, 'access123', 'refresh123', 3600);
      expect(setMock).toHaveBeenCalledWith(COOKIES.ACCESS_TOKEN, 'access123', expect.any(Object));
      expect(setMock).toHaveBeenCalledWith(COOKIES.REFRESH_TOKEN, 'refresh123', expect.any(Object));
      expect(setMock).toHaveBeenCalledWith(COOKIES.EXPIRES_IN, expect.any(String), expect.any(Object));

      setMock.mockClear();
      clearAllAuthCookies(responseMock);
      expect(setMock).toHaveBeenCalledWith(COOKIES.ACCESS_TOKEN, '', expect.objectContaining({ maxAge: 0 }));
      expect(setMock).toHaveBeenCalledWith(COOKIES.REFRESH_TOKEN, '', expect.objectContaining({ maxAge: 0 }));
    });
  });

  describe('OAuth Helper', () => {
    it('generates secure random state', () => {
      const state = generateSecureRandomString(32);
      expect(state).toHaveLength(32);
      expect(/^[A-Za-z0-9\-_.~]+$/.test(state)).toBe(true);
    });

    it('generates PKCE plain challenge', () => {
      const pkce = generatePkcePlain();
      expect(pkce.code_verifier).toHaveLength(128);
      expect(pkce.code_challenge).toBe(pkce.code_verifier);
    });

    it('builds MAL authorize URL', () => {
      process.env.Client_ID = 'test_client';
      const url = buildAuthorizeUrl('state123', 'verifier123', 'http://redirect');
      const parsed = new URL(url);
      expect(parsed.host).toBe('myanimelist.net');
      expect(parsed.searchParams.get('client_id')).toBe('test_client');
      expect(parsed.searchParams.get('state')).toBe('state123');
      expect(parsed.searchParams.get('code_challenge')).toBe('verifier123');
      expect(parsed.searchParams.get('code_challenge_method')).toBe('plain');
    });

    it('validates token response', () => {
      expect(() => validateTokenResponse({})).toThrow();
      expect(() => validateTokenResponse({ access_token: '123' })).toThrow();
      expect(() => validateTokenResponse({ access_token: '123', refresh_token: '456', expires_in: 3600 })).not.toThrow();
    });
  });
});
