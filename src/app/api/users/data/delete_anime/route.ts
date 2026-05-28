import { NextRequest, type NextResponse } from 'next/server';
import { deleteAnime } from '@/server/mal/client';
import { COOKIES } from '@/server/http/cookies';
import { jsonError, jsonOk, handleUpstreamError } from '@/server/http/responses';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

function verifySameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const targetOrigin = request.nextUrl.origin;

  if (origin && origin !== targetOrigin) {
    return false;
  }
  if (!origin && referer && !referer.startsWith(targetOrigin)) {
    return false;
  }
  return true;
}

async function handleDelete(request: NextRequest): Promise<NextResponse> {
  const url = request.nextUrl;
  const animeId = url.searchParams.get('anime_id');

  const accessToken = request.cookies.get(COOKIES.ACCESS_TOKEN)?.value;
  if (!accessToken) {
    return jsonError('Unauthorized: Access token is missing', 401);
  }

  if (!verifySameOrigin(request)) {
    return jsonError('Forbidden: Cross-origin request blocked', 403);
  }

  try {
    await deleteAnime(accessToken, animeId);
    return jsonOk({ message: 'successfully deleted' });
  } catch (error: any) {
    if (error.message.includes('Missing') || error.message.includes('Invalid') || error.message.includes('must be')) {
      return jsonError(error.message, 400);
    }
    if (error.status === 401 || error.status === 403) {
      return jsonError('Unauthorized: Upstream access denied', error.status);
    }
    return handleUpstreamError(error);
  }
}

export async function GET(request: NextRequest) {
  return handleDelete(request);
}

export async function DELETE(request: NextRequest) {
  return handleDelete(request);
}
