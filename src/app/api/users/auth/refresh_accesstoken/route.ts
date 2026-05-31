import { NextRequest, NextResponse } from 'next/server';
import { refreshAccessToken } from '@/server/mal/oauth';
import { setAuthCookies, clearAllAuthCookies, COOKIES } from '@/server/http/cookies';
import { jsonError, jsonOk } from '@/server/http/responses';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

async function handleRefresh(request: NextRequest): Promise<NextResponse> {
  const cookies = request.cookies;
  const refreshToken = cookies.get(COOKIES.REFRESH_TOKEN)?.value;

  if (!refreshToken) {
    return jsonError('Missing refresh token', 401);
  }

  try {
    const tokenData = await refreshAccessToken(refreshToken);

    const response = jsonOk({ message: 'token refresh retrieved successfully' });
    setAuthCookies(response, tokenData.access_token, tokenData.refresh_token, tokenData.expires_in);
    return response;
  } catch (error: any) {
    const status = error.status || error.statusCode || 500;
    if (status === 401 || status === 403) {
      // Clear all auth cookies on authentication failure
      const response = jsonError('Invalid refresh token. Cleared cookies.', 401);
      clearAllAuthCookies(response);
      return response;
    }

    // Map upstream errors safely
    return jsonError('Token refresh failed', status);
  }
}

export async function GET(request: NextRequest) {
  return handleRefresh(request);
}

export async function POST(request: NextRequest) {
  return handleRefresh(request);
}
