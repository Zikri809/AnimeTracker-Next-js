import { NextRequest } from 'next/server';
import { fetchUserData } from '@/server/mal/client';
import { setUserDataCookie, COOKIES } from '@/server/http/cookies';
import { jsonError, jsonOk, handleUpstreamError } from '@/server/http/responses';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get(COOKIES.ACCESS_TOKEN)?.value;
  if (!accessToken) {
    return jsonError('Unauthorized: Access token is missing', 401);
  }

  try {
    const data = await fetchUserData(accessToken);

    const userDataJson = JSON.stringify(data);
    const cookieResultPreview = encodeURIComponent(userDataJson).length <= 4000;
    const response = jsonOk({
      success: 'User data successfully fetched',
      succes: 'User data successfully fetched', // for backward compatibility
      user_data: data,
      ...(cookieResultPreview ? {} : { warning: 'User data cookie omitted because payload is too large' }),
    });

    // Set readable user_data cookie on success
    if (cookieResultPreview) {
      setUserDataCookie(response, userDataJson);
    }

    return response;
  } catch (error: any) {
    if (error.status === 401 || error.status === 403) {
      return jsonError('Unauthorized: Upstream access denied', error.status);
    }
    return handleUpstreamError(error);
  }
}
