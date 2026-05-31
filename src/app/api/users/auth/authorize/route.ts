import { NextRequest, NextResponse } from 'next/server';
import { generateSecureRandomString, generatePkcePlain, buildAuthorizeUrl, encodeUrlSafeBase64 } from '@/server/mal/oauth';
import { setOAuthTransientCookies } from '@/server/http/cookies';
import { getAuthRedirectUri } from '@/server/env';
import { jsonError, NO_CACHE_HEADERS } from '@/server/http/responses';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl;
    const origin = url.origin;
    const redirectUri = getAuthRedirectUri();
    
    const stateRandom = generateSecureRandomString(24);
    const encodedOrigin = encodeUrlSafeBase64(origin);
    const encodedRedirectUri = encodeUrlSafeBase64(redirectUri);
    const state = `${stateRandom}:${encodedOrigin}:${encodedRedirectUri}`;

    const { code_verifier } = generatePkcePlain();
    
    const authorizeUrl = buildAuthorizeUrl(state, code_verifier, redirectUri);
    
    const response = NextResponse.redirect(authorizeUrl, 302);
    for (const [key, value] of Object.entries(NO_CACHE_HEADERS)) {
      response.headers.set(key, value);
    }
    
    // Set transient state and verifier cookies
    setOAuthTransientCookies(response, state, code_verifier);
    
    return response;
  } catch (error: any) {
    console.error('Error in authorize route handler:', error);
    return jsonError('Internal server error during authorization redirection', 500);
  }
}
