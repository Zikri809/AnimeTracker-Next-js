import { stripQueryString, pathSegments } from './path-utils';

export type DetailRouteFamily =
  | "anime"
  | "morethiseseason"
  | "morelastseason"
  | "moreupcoming"
  | "search"
  | "mylist"
  | "seasons";

export type DetailRouteContext = {
  family: DetailRouteFamily;
  pathname: string;
  sourceAnimeId: number;
  targetAnimeId: number;
  relationAnimeId?: number;
  title?: string;
  mylistTab?: string;
  season?: string;
  year?: number;
  isRelationRoute: boolean;
  isTrackingRoute: boolean;
};

export function isValidId(id: string | number | undefined | null): boolean {
  if (id === undefined || id === null || id === '') return false;
  const num = Number(id);
  if (Number.isNaN(num) || !Number.isFinite(num)) return false;
  if (num <= 0) return false;
  if (!Number.isInteger(num)) return false;
  return true;
}

function encodePathSegment(value: string | number | undefined): string {
  if (value === undefined || value === null) return '';
  const raw = String(value);
  try {
    return encodeURIComponent(decodeURIComponent(raw));
  } catch {
    return encodeURIComponent(raw);
  }
}

export function parseDetailRouteContext(pathname: string): DetailRouteContext {
  const cleanPath = stripQueryString(pathname);
  const segments = pathSegments(cleanPath);

  if (segments.length < 2) {
    throw new Error(`Invalid detail route pathname: ${pathname}`);
  }

  const rawFamily = segments[0];
  let family: DetailRouteFamily;
  let malIdStr = '';
  let title: string | undefined;
  let mylistTab: string | undefined;
  let season: string | undefined;
  let year: number | undefined;
  let remainingSegments: string[] = [];

  const lowerFamily = rawFamily.toLowerCase();
  if (lowerFamily === 'anime') {
    family = 'anime';
    malIdStr = segments[1];
    remainingSegments = segments.slice(2);
  } else if (lowerFamily === 'morethiseseason') {
    family = 'morethiseseason';
    malIdStr = segments[1];
    remainingSegments = segments.slice(2);
  } else if (lowerFamily === 'morelastseason') {
    family = 'morelastseason';
    malIdStr = segments[1];
    remainingSegments = segments.slice(2);
  } else if (lowerFamily === 'moreupcoming') {
    family = 'moreupcoming';
    malIdStr = segments[1];
    remainingSegments = segments.slice(2);
  } else if (lowerFamily === 'search') {
    if (segments.length < 3) {
      throw new Error(`Invalid search detail route: ${pathname}`);
    }
    family = 'search';
    title = segments[1]; // keep encoded segment
    malIdStr = segments[2];
    remainingSegments = segments.slice(3);
  } else if (lowerFamily === 'mylist') {
    if (segments.length < 3) {
      throw new Error(`Invalid mylist detail route: ${pathname}`);
    }
    family = 'mylist';
    mylistTab = segments[1];
    malIdStr = segments[2];
    remainingSegments = segments.slice(3);
  } else if (lowerFamily === 'seasons') {
    if (segments.length < 4) {
      throw new Error(`Invalid seasons detail route: ${pathname}`);
    }
    family = 'seasons';
    season = segments[1];
    const yearStr = segments[2];
    if (!isValidId(yearStr)) {
      throw new Error(`Invalid year in seasons route: ${pathname}`);
    }
    year = Number(yearStr);
    malIdStr = segments[3];
    remainingSegments = segments.slice(4);
  } else {
    throw new Error(`Unknown route family in path: ${pathname}`);
  }

  if (!isValidId(malIdStr)) {
    throw new Error(`Invalid mal_id in route path: ${pathname}`);
  }
  const sourceAnimeId = Number(malIdStr);

  let isRelationRoute = false;
  let isTrackingRoute = false;
  let relationAnimeId: number | undefined;

  if (remainingSegments.length > 0) {
    if (remainingSegments[0] === 'tracking') {
      isTrackingRoute = true;
      if (remainingSegments.length > 1) {
        throw new Error(`Unexpected segments after tracking: ${pathname}`);
      }
    } else if (remainingSegments[0] === 'relation') {
      if (remainingSegments.length < 2) {
        throw new Error(`Missing relation_id in path: ${pathname}`);
      }
      isRelationRoute = true;
      const relationIdStr = remainingSegments[1];
      if (!isValidId(relationIdStr)) {
        throw new Error(`Invalid relation_id in path: ${pathname}`);
      }
      relationAnimeId = Number(relationIdStr);

      if (remainingSegments.length > 2) {
        if (remainingSegments[2] === 'tracking') {
          isTrackingRoute = true;
          if (remainingSegments.length > 3) {
            throw new Error(`Unexpected segments after tracking relation: ${pathname}`);
          }
        } else {
          throw new Error(`Unexpected segment: ${remainingSegments[2]}`);
        }
      }
    } else {
      throw new Error(`Unexpected segment: ${remainingSegments[0]}`);
    }
  }

  const targetAnimeId = isRelationRoute ? (relationAnimeId as number) : sourceAnimeId;

  return {
    family,
    pathname: cleanPath,
    sourceAnimeId,
    targetAnimeId,
    relationAnimeId,
    title,
    mylistTab,
    season,
    year,
    isRelationRoute,
    isTrackingRoute,
  };
}

export function buildDetailHref(context: Omit<DetailRouteContext, 'pathname'>): string {
  let base = '';
  const malId = context.sourceAnimeId;

  switch (context.family) {
    case 'anime':
      base = `/Anime/${malId}`;
      break;
    case 'morethiseseason':
      base = `/morethiseseason/${malId}`;
      break;
    case 'morelastseason':
      base = `/morelastseason/${malId}`;
      break;
    case 'moreupcoming':
      base = `/moreupcoming/${malId}`;
      break;
    case 'search':
      base = `/search/${encodePathSegment(context.title)}/${malId}`;
      break;
    case 'mylist':
      base = `/mylist/${encodePathSegment(context.mylistTab)}/${malId}`;
      break;
    case 'seasons':
      base = `/seasons/${encodePathSegment(context.season)}/${context.year}/${malId}`;
      break;
  }

  if (context.isRelationRoute && context.relationAnimeId !== undefined) {
    base += `/relation/${context.relationAnimeId}`;
  }

  return base;
}

export function buildTrackingHrefFromContext(context: DetailRouteContext): string {
  const detailHref = buildDetailHref(context);
  return `${detailHref}/tracking`;
}

export function buildTrackingReturnHref(context: DetailRouteContext): string {
  // Returns to detail page of the context
  const cleanContext = { ...context, isTrackingRoute: false };
  return buildDetailHref(cleanContext);
}

export function buildRelationHrefFromContext(context: DetailRouteContext, relationId: number): string {
  if (!isValidId(relationId)) {
    throw new Error(`Invalid relationId: ${relationId}`);
  }
  const cleanContext = {
    ...context,
    isRelationRoute: true,
    relationAnimeId: relationId,
    isTrackingRoute: false,
  };
  return buildDetailHref(cleanContext);
}

export function buildRetryLimitHref(originalLink: string, query: Record<string, any>): string {
  const encodedLink = encodeURIComponent(originalLink);
  const encodedQuery = encodeURIComponent(JSON.stringify(query));
  return `/ExceedRetryLimit?original_link=${encodedLink}&original_query=${encodedQuery}`;
}

export function buildPathnameFromParams(family: DetailRouteFamily, params: any, isTracking: boolean): string {
  const malId = params.mal_id;
  const relationId = params.relation_id;
  let path = '';
  if (family === 'anime') {
    path = `/Anime/${malId}`;
  } else if (family === 'morethiseseason') {
    path = `/morethiseseason/${malId}`;
  } else if (family === 'morelastseason') {
    path = `/morelastseason/${malId}`;
  } else if (family === 'moreupcoming') {
    path = `/moreupcoming/${malId}`;
  } else if (family === 'search') {
    path = `/search/${encodePathSegment(params.title)}/${malId}`;
  } else if (family === 'mylist') {
    path = `/mylist/${encodePathSegment(params.mylist_tab)}/${malId}`;
  } else if (family === 'seasons') {
    path = `/seasons/${encodePathSegment(params.season)}/${params.year}/${malId}`;
  }

  if (relationId) {
    path += `/relation/${relationId}`;
  }

  if (isTracking) {
    path += '/tracking';
  }

  return path;
}
