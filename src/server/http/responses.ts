import { NextResponse } from 'next/server';

export const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  'Vary': 'Cookie',
};

export function jsonOk<T>(data: T, headers?: Record<string, string>): NextResponse {
  return NextResponse.json(data, {
    status: 200,
    headers: {
      ...NO_CACHE_HEADERS,
      ...headers,
    },
  });
}

export function jsonError(
  message: string,
  status: number = 500,
  extra: Record<string, any> = {}
): NextResponse {
  return NextResponse.json(
    {
      error: message,
      status,
      ...extra,
    },
    {
      status,
      headers: {
        ...NO_CACHE_HEADERS,
      },
    }
  );
}

export function handleUpstreamError(error: any): NextResponse {
  const rawStatus = Number(error?.status || error?.statusCode || 502);
  const status = [400, 401, 403, 404, 429, 500, 502].includes(rawStatus) ? rawStatus : 502;

  const messages: Record<number, string> = {
    400: 'Bad upstream request',
    401: 'Unauthorized: upstream access denied',
    403: 'Forbidden: upstream access denied',
    404: 'Upstream resource not found',
    429: 'Upstream rate limit exceeded',
    500: 'Internal server error',
    502: 'Upstream service error',
  };

  return jsonError(messages[status] ?? 'Upstream service error', status);
}
