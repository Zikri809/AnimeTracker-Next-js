import { NextRequest, NextResponse } from 'next/server';
import { exchangeAuthCode, decodeUrlSafeBase64 } from '@/server/mal/oauth';
import { setAuthCookies, clearOAuthTransientCookies, COOKIES } from '@/server/http/cookies';
import { getAuthRedirectUri, getBaseUrl } from '@/server/env';
import { NO_CACHE_HEADERS } from '@/server/http/responses';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

function isAllowedOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    const hostname = url.hostname;
    
    // Allow localhost / 127.0.0.1
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return true;
    }
    
    // Allow Prod_host
    if (process.env.Prod_host) {
      try {
        const prodUrl = new URL(process.env.Prod_host);
        if (hostname === prodUrl.hostname) {
          return true;
        }
      } catch {}
    }
    
    // Allow NEXT_PUBLIC_Local_host
    if (process.env.NEXT_PUBLIC_Local_host) {
      try {
        const localUrl = new URL(process.env.NEXT_PUBLIC_Local_host);
        if (hostname === localUrl.hostname) {
          return true;
        }
      } catch {}
    }
    
    // Allow Vercel domains
    if (hostname.endsWith('.vercel.app') || hostname === 'anime-tracker-next-js.vercel.app') {
      return true;
    }
    
    return false;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get('code');
  const queryState = url.searchParams.get('state') || '';

  // Parse state to check if we need to bounce to local development origin
  const stateParts = queryState.split(':');
  const encodedOrigin = stateParts[1];
  const encodedRedirectUri = stateParts[2];

  let decodedOrigin = '';
  let decodedRedirectUri = '';
  if (encodedOrigin) {
    decodedOrigin = decodeUrlSafeBase64(encodedOrigin);
  }
  if (encodedRedirectUri) {
    decodedRedirectUri = decodeUrlSafeBase64(encodedRedirectUri);
  }

  // Cross-origin redirect fallback for local development using production MAL client settings
  if (decodedOrigin && decodedOrigin !== url.origin && isAllowedOrigin(decodedOrigin)) {
    const targetUrl = new URL(url.pathname + url.search, decodedOrigin);
    return NextResponse.redirect(targetUrl, 302);
  }

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

  // Validate decoded redirect URI origin if present (defense in depth)
  if (decodedRedirectUri) {
    try {
      const redirectOrigin = new URL(decodedRedirectUri).origin;
      if (!isAllowedOrigin(redirectOrigin)) {
        return fail();
      }
    } catch {
      return fail();
    }
  }

  try {
    const redirectUri = decodedRedirectUri || getAuthRedirectUri();
    
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
