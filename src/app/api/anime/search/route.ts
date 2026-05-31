import { NextRequest } from 'next/server';
import { jsonOk, jsonError } from '@/server/http/responses';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const q = url.searchParams.get('q');
  const pageStr = url.searchParams.get('page');

  if (!q || q.trim() === '' || q === 'NA') {
    return jsonOk({ data: [] });
  }

  let page = 1;
  if (pageStr) {
    const parsedPage = parseInt(pageStr, 10);
    if (!isNaN(parsedPage) && parsedPage > 0) {
      page = parsedPage;
    }
  }

  try {
    const jikanUrl = `https://api.jikan.moe/v4/anime?limit=24&sfw=true&page=${page}&q=${encodeURIComponent(q)}`;
    const response = await fetch(jikanUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return jsonError(`Upstream Jikan search error: HTTP ${response.status}`, response.status);
    }

    const responseData = await response.json();
    
    // Return with Cache-Control headers for Edge caching
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=60',
      },
    });
  } catch (error: any) {
    return jsonError(error.message || 'Internal Server Error', 500);
  }
}
