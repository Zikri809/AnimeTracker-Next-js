// Standard cookie names
export const COOKIES = {
  STATE: 'state',
  CODE_VERIFIER: 'code_verifier',
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  EXPIRES_IN: 'expires_in',
  USER_DATA: 'user_data',
} as const;

export function getBaseCookieOptions(): any {
  return {
    path: '/',
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
  };
}

export function getHttpOnlyCookieOptions(maxAgeSeconds?: number): any {
  return {
    ...getBaseCookieOptions(),
    httpOnly: true,
    ...(maxAgeSeconds !== undefined ? { maxAge: maxAgeSeconds } : {}),
  };
}

export function getPublicCookieOptions(maxAgeSeconds?: number): any {
  return {
    ...getBaseCookieOptions(),
    httpOnly: false,
    ...(maxAgeSeconds !== undefined ? { maxAge: maxAgeSeconds } : {}),
  };
}

// Sets OAuth transient cookies
export function setOAuthTransientCookies(
  response: { cookies: { set: (name: string, value: string, options: any) => any } },
  state: string,
  codeVerifier: string
) {
  const oneHour = 3600;
  response.cookies.set(COOKIES.STATE, state, getHttpOnlyCookieOptions(oneHour));
  response.cookies.set(COOKIES.CODE_VERIFIER, codeVerifier, getHttpOnlyCookieOptions(oneHour));
}

// Clears OAuth transient cookies
export function clearOAuthTransientCookies(
  response: { cookies: { set: (name: string, value: string, options: any) => any } }
) {
  response.cookies.set(COOKIES.STATE, '', { ...getHttpOnlyCookieOptions(0), maxAge: 0 });
  response.cookies.set(COOKIES.CODE_VERIFIER, '', { ...getHttpOnlyCookieOptions(0), maxAge: 0 });
}

// Sets auth cookies after token exchange/refresh
export function setAuthCookies(
  response: { cookies: { set: (name: string, value: string, options: any) => any } },
  accessToken: string,
  refreshToken: string,
  expiresInSeconds: number
) {
  const sixtyDays = 60 * 24 * 3600; // 60 days in seconds
  
  // Set access token (httpOnly)
  response.cookies.set(COOKIES.ACCESS_TOKEN, accessToken, getHttpOnlyCookieOptions(expiresInSeconds));
  
  // Set refresh token (httpOnly)
  response.cookies.set(COOKIES.REFRESH_TOKEN, refreshToken, getHttpOnlyCookieOptions(sixtyDays));
  
  // Set expires_in (public - client-readable, holds an ISO timestamp string)
  const expiryTimestamp = new Date(Date.now() + expiresInSeconds * 1000).toISOString();
  response.cookies.set(COOKIES.EXPIRES_IN, expiryTimestamp, getPublicCookieOptions(expiresInSeconds));
}

// Sets user data cookie
export function setUserDataCookie(
  response: { cookies: { set: (name: string, value: string, options: any) => any } },
  userDataJson: string
): { success: boolean; error?: string } {
  const sixtyDays = 60 * 24 * 3600; // 60 days
  
  // URL encoding or raw string size check (safe limit is ~4096 bytes for cookie)
  const encoded = encodeURIComponent(userDataJson);
  if (encoded.length > 4000) {
    return { success: false, error: 'User data payload exceeds safe cookie size limits' };
  }
  
  response.cookies.set(COOKIES.USER_DATA, userDataJson, getPublicCookieOptions(sixtyDays));
  return { success: true };
}

// Clears all auth/user cookies on logout
export function clearAllAuthCookies(
  response: { cookies: { set: (name: string, value: string, options: any) => any } }
) {
  response.cookies.set(COOKIES.ACCESS_TOKEN, '', { ...getHttpOnlyCookieOptions(0), maxAge: 0 });
  response.cookies.set(COOKIES.REFRESH_TOKEN, '', { ...getHttpOnlyCookieOptions(0), maxAge: 0 });
  response.cookies.set(COOKIES.EXPIRES_IN, '', { ...getPublicCookieOptions(0), maxAge: 0 });
  response.cookies.set(COOKIES.USER_DATA, '', { ...getPublicCookieOptions(0), maxAge: 0 });
  clearOAuthTransientCookies(response);
}
