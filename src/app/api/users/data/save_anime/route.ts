import { NextRequest } from 'next/server';
import { saveAnime } from '@/server/mal/client';
import { validateAnimeId, validateEpisode, validateScore, validateUserListStatus } from '@/server/mal/validation';
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

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const animeId = url.searchParams.get('anime_id');
  const status = url.searchParams.get('status');
  const score = url.searchParams.get('score');
  const episode = url.searchParams.get('episode');

  const accessToken = request.cookies.get(COOKIES.ACCESS_TOKEN)?.value;
  if (!accessToken) {
    return jsonError('Unauthorized: Access token is missing', 401);
  }

  if (!verifySameOrigin(request)) {
    return jsonError('Forbidden: Cross-origin request blocked', 403);
  }

  try {
    const validatedAnimeId = validateAnimeId(animeId);
    const validatedStatus = validateUserListStatus(status);
    const validatedScore = validateScore(score);
    const validatedEpisode = validateEpisode(episode);

    await saveAnime(
      accessToken,
      validatedAnimeId,
      validatedStatus,
      validatedScore,
      validatedEpisode,
    );
    return jsonOk({ message: 'successfully updated' });
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

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get(COOKIES.ACCESS_TOKEN)?.value;
  if (!accessToken) {
    return jsonError('Unauthorized: Access token is missing', 401);
  }

  if (!verifySameOrigin(request)) {
    return jsonError('Forbidden: Cross-origin request blocked', 403);
  }

  try {
    let body: any = {};
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      return jsonError('Invalid Content-Type. Must be application/json', 400);
    }

    const { anime_id, status, score, episode } = body;

    const validatedAnimeId = validateAnimeId(anime_id);
    const validatedStatus = validateUserListStatus(status);
    const validatedScore = validateScore(score);
    const validatedEpisode = validateEpisode(episode);

    await saveAnime(
      accessToken,
      validatedAnimeId,
      validatedStatus,
      validatedScore,
      validatedEpisode,
    );
    return jsonOk({ message: 'successfully updated' });
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      return jsonError('Malformed JSON body', 400);
    }
    if (error.message.includes('Missing') || error.message.includes('Invalid') || error.message.includes('must be')) {
      return jsonError(error.message, 400);
    }
    if (error.status === 401 || error.status === 403) {
      return jsonError('Unauthorized: Upstream access denied', error.status);
    }
    return handleUpstreamError(error);
  }
}
