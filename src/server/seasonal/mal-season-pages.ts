import { getRequiredEnv } from "../env";
import { validateYear, validateSeason } from "../mal/validation";
import { buildMalSeasonUrl } from "../mal/urls";
import type { AnimeSeason } from "./page-season";

export const SEASONAL_PAGE_REVALIDATE_SECONDS = 43200;

export const MAL_SEASON_FIELDS =
  "main_picture,status,start_season,num_episodes,title,alternative_titles,mean,num_scoring_users,popularity,genres";
export const MAL_SEASON_LIMIT = 500;
export const MAL_SEASON_OFFSET = 0;

export type MalSeasonNode = {
  id: number;
  main_picture?: { large?: string; medium?: string };
  status?: string;
  start_season?: { season?: AnimeSeason; year?: number };
  num_episodes?: number;
  title?: string;
  alternative_titles?: { en?: string };
  mean?: number | null;
  num_scoring_users?: number | null;
  popularity?: number | null;
  genres?: Array<{ id?: number; name?: string }>;
};

export type MalSeasonItem = { node: MalSeasonNode };

export async function fetchCachedMalSeason(input: {
  year: number | string;
  season: AnimeSeason;
  sort?: "anime_score" | "descending";
  revalidate?: number;
}): Promise<MalSeasonItem[]> {
  const year = validateYear(input.year.toString());
  const season = validateSeason(input.season);

  const clientId = getRequiredEnv("Client_ID");

  const params = new URLSearchParams({
    sort: input.sort || "descending",
    limit: MAL_SEASON_LIMIT.toString(),
    offset: MAL_SEASON_OFFSET.toString(),
    fields: MAL_SEASON_FIELDS,
  });

  const url = buildMalSeasonUrl(year, season, params);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-MAL-CLIENT-ID": clientId,
    },
    next: {
      revalidate: input.revalidate ?? SEASONAL_PAGE_REVALIDATE_SECONDS,
    },
  });

  if (!response.ok) {
    throw new Error(`MAL Seasonal API returned status ${response.status}`);
  }

  const raw = await response.json();
  return normalizeMalSeasonResponse(raw);
}

export async function fetchCachedMalSeasonOrEmpty(input: {
  year: number | string;
  season: AnimeSeason;
  sort?: "anime_score" | "descending";
  revalidate?: number;
}): Promise<MalSeasonItem[]> {
  try {
    return await fetchCachedMalSeason(input);
  } catch (error) {
    console.error(`Error fetching MAL season ${input.season} ${input.year}:`, error);
    return [];
  }
}

export function normalizeMalSeasonResponse(raw: unknown): MalSeasonItem[] {
  if (!raw || typeof raw !== "object" || !("data" in raw) || !Array.isArray((raw as any).data)) {
    return [];
  }

  const seenIds = new Set<number>();
  const normalized: MalSeasonItem[] = [];

  for (const item of (raw as any).data) {
    if (!item || typeof item !== "object" || !item.node || typeof item.node.id !== "number") {
      continue;
    }
    const id = item.node.id;
    if (seenIds.has(id)) {
      continue;
    }
    seenIds.add(id);
    normalized.push(item as MalSeasonItem);
  }

  return normalized;
}

export function filterSeasonStart(items: MalSeasonItem[], season: AnimeSeason, year: number): MalSeasonItem[] {
  return items.filter((item) => {
    const start = item.node.start_season;
    return start && start.season === season && start.year === year;
  });
}

export function pickSeasonRepresentative(items: MalSeasonItem[], season: AnimeSeason, year: number): MalSeasonItem | null {
  const filtered = filterSeasonStart(items, season, year);
  return filtered.length > 0 ? filtered[0] : null;
}
