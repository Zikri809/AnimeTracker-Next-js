import type { Season } from "./validation";

const MAL_API_ORIGIN = "https://api.myanimelist.net";
const MAL_API_VERSION_PATH = "/v2";

const SEASON_PATH_SEGMENTS = {
  winter: "winter",
  spring: "spring",
  summer: "summer",
  fall: "fall",
} as const satisfies Record<Season, string>;

function assertTrustedMalUrl(url: URL): URL {
  if (url.origin !== MAL_API_ORIGIN || !url.pathname.startsWith(`${MAL_API_VERSION_PATH}/`)) {
    throw new Error("Unexpected MAL API URL");
  }

  return url;
}

function appendSearchParams(url: URL, params?: URLSearchParams): URL {
  if (params) {
    url.search = params.toString();
  }

  return url;
}

function encodePathSegment(segment: string): string {
  if (!segment || segment === "." || segment === ".." || /[\\/]/.test(segment)) {
    throw new Error("Invalid MAL API path segment");
  }

  return encodeURIComponent(segment);
}

function encodeNumericPathSegment(value: number, label: string): string {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${label} must be a positive integer`);
  }

  const segment = value.toString();
  if (!/^\d+$/.test(segment)) {
    throw new Error(`${label} must be a positive integer`);
  }

  return segment;
}

export function buildMalApiUrl(
  pathSegments: readonly string[],
  params?: URLSearchParams,
): string {
  const safePath = pathSegments
    .map((segment) => encodePathSegment(segment))
    .join("/");
  const url = new URL(`${MAL_API_VERSION_PATH}/${safePath}`, MAL_API_ORIGIN);

  return assertTrustedMalUrl(appendSearchParams(url, params)).toString();
}

export function buildMalAnimeDetailsUrl(animeId: number): string {
  return buildMalApiUrl(["anime", encodeNumericPathSegment(animeId, "Anime ID")]);
}

export function buildMalAnimeListStatusUrl(animeId: number): string {
  return buildMalApiUrl([
    "anime",
    encodeNumericPathSegment(animeId, "Anime ID"),
    "my_list_status",
  ]);
}

export function buildMalSeasonUrl(
  year: number,
  season: Season,
  params: URLSearchParams,
): string {
  const yearSegment = year.toString();
  if (!/^\d{4}$/.test(yearSegment)) {
    throw new Error("Year must be exactly 4 digits");
  }

  if (!Object.prototype.hasOwnProperty.call(SEASON_PATH_SEGMENTS, season)) {
    throw new Error("Invalid season. Allowed values are: winter, spring, summer, fall");
  }

  const seasonSegment = SEASON_PATH_SEGMENTS[season];
  return buildMalApiUrl(["anime", "season", yearSegment, seasonSegment], params);
}
