import { NextRequest, NextResponse } from 'next/server';
import { exchangeAuthCode } from '@/server/mal/oauth';
import { setAuthCookies, clearOAuthTransientCookies, COOKIES } from '@/server/http/cookies';
import { getAuthRedirectUri, getBaseUrl } from '@/server/env';
import { NO_CACHE_HEADERS } from '@/server/http/responses';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get('code');
  const queryState = url.searchParams.get('state');

  const cookies = request.cookies;
  const cookieState = cookies.get(COOKIES.STATE)?.value;
  const codeVerifier = cookies.get(COOKIES.CODE_VERIFIER)?.value;

  const baseUrl = getBaseUrl(url.origin);
  const failureRedirectUrl = new URL('mylist/login_failed', baseUrl);
  const successRedirectUrl = new URL('mylist/login_success', baseUrl);

  // Helper to create failure response and clear transient cookies
  const fail = () => {
    const response = NextResponse.redirect(failureRedirectUrl, 302);
    for (const [key, value] of Object.entries(NO_CACHE_HEADERS)) {
      response.headers.set(key, value);
    }
    clearOAuthTransientCookies(response);
    return response;
  };

  // 1. Verify code and state exist
  if (!code || !queryState || !cookieState || !codeVerifier) {
    return fail();
  }

  // 2. Validate state matching
  if (cookieState !== queryState) {
    return fail();
  }

  try {
    const redirectUri = getAuthRedirectUri();
    
    // 3. Exchange auth code (throws on failure or invalid payload shape)
    const tokenData = await exchangeAuthCode(code, codeVerifier, redirectUri);
    
    const response = NextResponse.redirect(successRedirectUrl, 302);
    for (const [key, value] of Object.entries(NO_CACHE_HEADERS)) {
      response.headers.set(key, value);
    }
    
    // 4. Set authentication cookies
    setAuthCookies(response, tokenData.access_token, tokenData.refresh_token, tokenData.expires_in);
    
    // 5. Clear OAuth transient cookies on success
    clearOAuthTransientCookies(response);
    
    return response;
  } catch {
    return fail();
  }
}
