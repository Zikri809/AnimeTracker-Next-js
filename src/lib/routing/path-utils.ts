export type RouteParams = Record<string, string | string[] | undefined>;

export function normalizeRouteParam(value: string | string[] | undefined | null): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value || undefined;
}

export function stripQueryString(path: string): string {
  return path.split('?')[0];
}

export function pathSegments(pathname: string): string[] {
  return stripQueryString(pathname).split('/').filter(Boolean);
}

export function parentPath(pathname: string, segmentCount: number = 1): string {
  const segments = pathSegments(pathname);
  if (segments.length <= segmentCount) return '/';
  return '/' + segments.slice(0, segments.length - segmentCount).join('/');
}

export function sanitizeSearchTerm(raw: string): string {
  return raw.replace(/[\/\\<>'"&]/g, '');
}

export function buildSearchHref(raw: string): string {
  const sanitized = sanitizeSearchTerm(raw);
  if (!sanitized) return '/';
  return '/search/' + encodeURIComponent(sanitized);
}

export function buildTrackingHref(input: { pathname: string; params?: RouteParams }): string {
  const base = stripQueryString(input.pathname);
  if (base.endsWith('/tracking')) return base;
  return base.replace(/\/$/, '') + '/tracking';
}

export function buildDetailBackHref(input: { pathname: string; params?: RouteParams }): string {
  const base = stripQueryString(input.pathname);
  const segments = pathSegments(base);

  if (segments.length >= 2 && segments[segments.length - 2] === 'relation') {
    return '/' + segments.slice(0, segments.length - 2).join('/');
  }

  if (segments[0] === 'Anime') {
    return '/';
  }
  if (segments[0] === 'mylist') {
    return '/mylist';
  }

  if (segments.length <= 1) return '/';
  return '/' + segments.slice(0, segments.length - 1).join('/');
}

export function buildTrackingBackHref(pathname: string): string {
  const base = stripQueryString(pathname);
  if (base.endsWith('/tracking')) {
    return parentPath(base, 1);
  }
  return base;
}

export function buildRelationHref(input: { pathname: string; relationId: string | number }): string {
  const base = stripQueryString(input.pathname);
  const segments = pathSegments(base);

  if (segments.length >= 2 && segments[segments.length - 2] === 'relation') {
    return '/' + segments.slice(0, segments.length - 1).join('/') + '/' + input.relationId;
  }

  return base.replace(/\/$/, '') + '/relation/' + input.relationId;
}

export function currentPathWithSearch(pathname: string, searchParams?: URLSearchParams | { toString(): string } | null): string {
  const base = stripQueryString(pathname);
  const q = searchParams ? searchParams.toString() : '';
  return q ? `${base}?${q}` : base;
}
