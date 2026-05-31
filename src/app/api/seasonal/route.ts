import { NextRequest } from 'next/server';
import { fetchSeasonal } from '@/server/mal/client';
import { validateYear, validateSeason, validateLimit, validateOffset } from '@/server/mal/validation';
import { jsonError, jsonOk, handleUpstreamError } from '@/server/http/responses';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const yearStr = url.searchParams.get('year');
  const seasonStr = url.searchParams.get('season');
  const limitStr = url.searchParams.get('limit');
  const offsetStr = url.searchParams.get('offset');

  try {
    // Perform validations before calling the proxy client
    const year = validateYear(yearStr);
    const season = validateSeason(seasonStr);
    const limit = validateLimit(limitStr);
    const offset = validateOffset(offsetStr);

    const data = await fetchSeasonal(year, season, limit, offset);
    return jsonOk(data);
  } catch (error: any) {
    if (error.message.includes('Missing') || error.message.includes('Invalid') || error.message.includes('must be')) {
      return jsonError(error.message, 400);
    }
    return handleUpstreamError(error);
  }
}
