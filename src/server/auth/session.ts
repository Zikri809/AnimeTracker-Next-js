import { COOKIES } from '../http/cookies';

export interface SessionState {
  authenticated: boolean;
  accessTokenExpiresAt: string | null;
  hasRefreshToken: boolean;
  userData: any | null;
}

export function getSessionFromCookies(cookiesGetter: {
  get: (name: string) => { value: string } | undefined;
}): SessionState {
  const accessToken = cookiesGetter.get(COOKIES.ACCESS_TOKEN)?.value;
  const refreshToken = cookiesGetter.get(COOKIES.REFRESH_TOKEN)?.value;
  const expiresIn = cookiesGetter.get(COOKIES.EXPIRES_IN)?.value;
  const userDataCookie = cookiesGetter.get(COOKIES.USER_DATA)?.value;

  if (!accessToken || !expiresIn) {
    return {
      authenticated: false,
      accessTokenExpiresAt: null,
      hasRefreshToken: !!refreshToken,
      userData: null,
    };
  }

  const expiryDate = new Date(expiresIn);
  const now = new Date();

  if (isNaN(expiryDate.getTime()) || now.getTime() >= expiryDate.getTime()) {
    return {
      authenticated: false,
      accessTokenExpiresAt: null,
      hasRefreshToken: !!refreshToken,
      userData: null,
    };
  }

  let userData = null;
  if (userDataCookie) {
    try {
      userData = JSON.parse(userDataCookie);
    } catch (e) {
      // Ignored, userData remains null
    }
  }

  return {
    authenticated: true,
    accessTokenExpiresAt: expiryDate.toISOString(),
    hasRefreshToken: !!refreshToken,
    userData,
  };
}
