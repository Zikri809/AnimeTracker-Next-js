import { NextRequest, NextResponse } from 'next/server';
import { getSeasonCarouselWindow } from '@/server/seasonal/page-season';
import { getBaseUrl } from '@/server/env';
import { jsonOk, NO_CACHE_HEADERS } from '@/server/http/responses';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

interface WarmUpRoute {
  route: string;
  attempts: number;
  success: boolean;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchRoute(item: WarmUpRoute, baseUrl: string) {
  if (item.attempts >= 3 || item.success) return;
  
  try {
    const response = await fetch(baseUrl + item.route, {
      method: 'GET',
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    item.success = true;
  } catch (error) {
    item.attempts++;
    console.error(`fail to warm page for route ${item.route}:`, error);
  }
}

export async function GET(request: NextRequest) {
  // Determine base URL according to requirements
  const baseUrl = getBaseUrl(request.nextUrl.origin);

  const static_routes = [
    'morethiseseason',
    'morelastseason',
    'moreupcoming',
  ];

  const all_season = getSeasonCarouselWindow();

  const dynamic_routes: string[] = [];
  for (const element of all_season) {
    dynamic_routes.push(`seasons/${element.season}/${element.year}`);
  }

  const route_objects: WarmUpRoute[] = [...static_routes, ...dynamic_routes].map((value) => ({
    route: value,
    attempts: 0,
    success: false,
  }));

  // Ensure retry loops up to 3 times
  for (let attempt = 0; attempt < 3; attempt++) {
    let all_success = true;
    
    for (const item of route_objects) {
      if (!item.success) {
        await fetchRoute(item, baseUrl);
        if (!item.success) {
          all_success = false;
        }
      }
    }

    if (all_success) {
      return jsonOk({ message: 'success warming all pages' });
    }
    
    // Delay between attempt loops
    await delay(500);
  }

  const failed = route_objects.filter((r) => !r.success).map((r) => r.route);

  return NextResponse.json(
    {
      message: 'fail warming all pages',
      failedRoutes: failed,
    },
    { status: 400, headers: NO_CACHE_HEADERS }
  );
}
