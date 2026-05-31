import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchAuthSessionWithRefresh } from './auth-session';

describe('auth session refresh helper', () => {
  beforeEach(() => {
    vi.useRealTimers();
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
