import { NextRequest } from 'next/server';
import { fetchUserList } from '@/server/mal/client';
import { validateUserListStatus, validateUserListSort, validateOffset } from '@/server/mal/validation';
import { COOKIES } from '@/server/http/cookies';
import { jsonError, jsonOk, handleUpstreamError } from '@/server/http/responses';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const sortStr = url.searchParams.get('sort');
  const offsetStr = url.searchParams.get('offset');
  const statusStr = url.searchParams.get('status');

  const accessToken = request.cookies.get(COOKIES.ACCESS_TOKEN)?.value;
  if (!accessToken) {
    return jsonError('Unauthorized: Access token is missing', 401);
  }

  try {
    // Perform validations before calling the proxy client
    const status = validateUserListStatus(statusStr);
    const sort = validateUserListSort(sortStr);
    const offset = validateOffset(offsetStr);

    const data = await fetchUserList(accessToken, status, sort, offset);
    return jsonOk(data);
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
