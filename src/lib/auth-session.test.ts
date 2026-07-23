import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fetchAuthSessionWithRefresh,
  markWasAuthenticated,
  clearWasAuthenticated,
  wasPreviouslyAuthenticated,
  evaluateSessionExpiry,
  type AuthSession,
} from './auth-session';

function unauthenticated(): AuthSession {
  return {
    authenticated: false,
    accessTokenExpiresAt: null,
    hasRefreshToken: false,
    userData: null,
  };
}

function authenticated(): AuthSession {
  return {
    authenticated: true,
    accessTokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
    hasRefreshToken: true,
    userData: { name: 'MalUser' },
  };
}

describe('auth session refresh helper', () => {
  beforeEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('refreshes once when session is expired but refresh token exists', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          authenticated: false,
          accessTokenExpiresAt: null,
          hasRefreshToken: true,
          userData: null,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ message: 'refreshed' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          authenticated: true,
          accessTokenExpiresAt: new Date(Date.now() + 3600000).toISOString(),
          hasRefreshToken: true,
          userData: null,
        }),
      });

    vi.stubGlobal('fetch', fetchMock);

    const session = await fetchAuthSessionWithRefresh();

    expect(session.authenticated).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1][0]).toBe('/api/users/auth/refresh_accesstoken');
  });
});

describe('wasAuthenticated localStorage helpers', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('wasPreviouslyAuthenticated returns false when marker absent', () => {
    expect(wasPreviouslyAuthenticated()).toBe(false);
  });

  it('markWasAuthenticated sets the marker and wasPreviouslyAuthenticated returns true', () => {
    markWasAuthenticated();
    expect(wasPreviouslyAuthenticated()).toBe(true);
    expect(localStorage.getItem('wasAuthenticated')).toBe('1');
  });

  it('clearWasAuthenticated removes the marker', () => {
    markWasAuthenticated();
    clearWasAuthenticated();
    expect(wasPreviouslyAuthenticated()).toBe(false);
    expect(localStorage.getItem('wasAuthenticated')).toBeNull();
  });

  it('markWasAuthenticated is idempotent', () => {
    markWasAuthenticated();
    markWasAuthenticated();
    expect(wasPreviouslyAuthenticated()).toBe(true);
  });

  it('clearWasAuthenticated is safe when marker never set', () => {
    expect(() => clearWasAuthenticated()).not.toThrow();
    expect(wasPreviouslyAuthenticated()).toBe(false);
  });

  it('wasPreviouslyAuthenticated ignores non-canonical marker values', () => {
    localStorage.setItem('wasAuthenticated', 'true');
    expect(wasPreviouslyAuthenticated()).toBe(false);
  });

  it('helpers do not throw when localStorage.setItem throws', () => {
    const original = localStorage.setItem;
    Object.defineProperty(localStorage, 'setItem', {
      configurable: true,
      value: vi.fn(() => {
        throw new Error('quota');
      }),
    });
    expect(() => markWasAuthenticated()).not.toThrow();
    (localStorage.setItem as any).mockRestore?.();
    Object.defineProperty(localStorage, 'setItem', { configurable: true, value: original });
  });

  it('wasPreviouslyAuthenticated returns false when getItem throws', () => {
    const original = localStorage.getItem;
    Object.defineProperty(localStorage, 'getItem', {
      configurable: true,
      value: vi.fn(() => {
        throw new Error('denied');
      }),
    });
    expect(wasPreviouslyAuthenticated()).toBe(false);
    Object.defineProperty(localStorage, 'getItem', { configurable: true, value: original });
  });
});

describe('evaluateSessionExpiry decision', () => {
  it('returns authenticated when session is authenticated and marker absent', () => {
    expect(evaluateSessionExpiry(authenticated(), false)).toEqual({ kind: 'authenticated' });
  });

  it('returns authenticated when session is authenticated and marker set', () => {
    expect(evaluateSessionExpiry(authenticated(), true)).toEqual({ kind: 'authenticated' });
  });

  it('returns expired when session unauthenticated and marker set', () => {
    expect(evaluateSessionExpiry(unauthenticated(), true)).toEqual({ kind: 'expired' });
  });

  it('returns local-only when session unauthenticated and marker absent', () => {
    expect(evaluateSessionExpiry(unauthenticated(), false)).toEqual({ kind: 'local-only' });
  });

  it('returns local-only when session lacks refresh token and marker absent', () => {
    expect(
      evaluateSessionExpiry({ ...unauthenticated(), hasRefreshToken: false }, false),
    ).toEqual({ kind: 'local-only' });
  });

  it('returns expired when refresh token present but session still unauthenticated', () => {
    expect(
      evaluateSessionExpiry({ ...unauthenticated(), hasRefreshToken: true }, true),
    ).toEqual({ kind: 'expired' });
  });
});
