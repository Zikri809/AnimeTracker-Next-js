import { NextRequest, NextResponse } from 'next/server';
import { clearAllAuthCookies } from '@/server/http/cookies';
import { getBaseUrl } from '@/server/env';
import { NO_CACHE_HEADERS } from '@/server/http/responses';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request.nextUrl.origin);
  const successRedirect = new URL('mylist/logout_success', baseUrl);
  const failureRedirect = new URL('mylist/login_failed', baseUrl);

  try {
    const response = NextResponse.redirect(successRedirect, 302);
    for (const [key, value] of Object.entries(NO_CACHE_HEADERS)) {
      response.headers.set(key, value);
    }
    clearAllAuthCookies(response);
    return response;
  } catch (error) {
    console.error('Error during log out:', error);
    const response = NextResponse.redirect(failureRedirect, 302);
    for (const [key, value] of Object.entries(NO_CACHE_HEADERS)) {
      response.headers.set(key, value);
    }
    return response;
  }
}
