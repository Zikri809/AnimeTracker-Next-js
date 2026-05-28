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

export function isSessionExpiringSoon(session: AuthSession, daysBeforeExpiry = 2): boolean {
  if (!session.accessTokenExpiresAt) return false;

  const expiryDate = new Date(session.accessTokenExpiresAt);
  if (Number.isNaN(expiryDate.getTime())) return false;

  const refreshDeadline = new Date(expiryDate);
  refreshDeadline.setDate(expiryDate.getDate() - daysBeforeExpiry);

  return Date.now() >= refreshDeadline.getTime();
}
