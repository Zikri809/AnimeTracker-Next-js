export interface AuthSession {
  authenticated: boolean;
  accessTokenExpiresAt: string | null;
  hasRefreshToken: boolean;
  userData: any | null;
}

function unauthenticatedSession(): AuthSession {
  return {
    authenticated: false,
    accessTokenExpiresAt: null,
    hasRefreshToken: false,
    userData: null,
  };
}

export async function fetchAuthSession(): Promise<AuthSession> {
  try {
    const response = await fetch('/api/users/auth/session', {
      method: 'GET',
      cache: 'no-store',
      credentials: 'same-origin',
    });

    if (!response.ok) {
      return unauthenticatedSession();
    }

    const session = await response.json();

    return {
      authenticated: Boolean(session?.authenticated),
      accessTokenExpiresAt:
        typeof session?.accessTokenExpiresAt === 'string' ? session.accessTokenExpiresAt : null,
      hasRefreshToken: Boolean(session?.hasRefreshToken),
      userData: session?.userData ?? null,
    };
  } catch {
    return unauthenticatedSession();
  }
}

let refreshSessionPromise: Promise<AuthSession> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch('/api/users/auth/refresh_accesstoken', {
      method: 'POST',
      cache: 'no-store',
      credentials: 'same-origin',
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function fetchAuthSessionWithRefresh(): Promise<AuthSession> {
  const session = await fetchAuthSession();
  if (session.authenticated && !isSessionExpiringSoon(session)) {
    return session;
  }
  if (!session.hasRefreshToken) {
    return session;
  }

  if (!refreshSessionPromise) {
    refreshSessionPromise = refreshAccessToken()
      .then((refreshed) => (refreshed ? fetchAuthSession() : session))
      .finally(() => {
        refreshSessionPromise = null;
      });
  }

  return refreshSessionPromise;
}

export function isSessionExpiringSoon(session: AuthSession, daysBeforeExpiry = 2): boolean {
  if (!session.accessTokenExpiresAt) return false;

  const expiryDate = new Date(session.accessTokenExpiresAt);
  if (Number.isNaN(expiryDate.getTime())) return false;

  const refreshDeadline = new Date(expiryDate);
  refreshDeadline.setDate(expiryDate.getDate() - daysBeforeExpiry);

  return Date.now() >= refreshDeadline.getTime();
}
