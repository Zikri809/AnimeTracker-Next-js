import { getSeasonWindow, getSeasonCarouselWindow } from "./page-season";
import type { AnimeSeason, SeasonWindow } from "./page-season";
import { fetchCachedMalSeason, pickSeasonRepresentative } from "./mal-season-pages";
import type { MalSeasonItem } from "./mal-season-pages";

export const SEASONAL_PAGE_REVALIDATE_SECONDS = 43200;

export type HomeSeasonCard = {
  status: string;
  mal_id: number;
  images: { webp: { large_image_url: string } };
  year?: number;
  title: string;
  score?: number;
  title_english: string | null;
};

export type HomeSeasonResult = {
  querydata: HomeSeasonCard[];
  isloading: boolean;
  error: boolean;
};

export type AniListSpotlightItem = {
  bannerImage?: string;
  idMal: number | string;
  genres: string[];
  title: { english?: string; romaji?: string };
};

export type HomeSeasonCarouselData = {
  season_anime: Array<MalSeasonItem | null>;
  seasonal_data: Array<{ season: AnimeSeason; year: number }>;
};

const MAL_STATUS_LABELS: Record<string, string> = {
  currently_airing: "Currently Airing",
  finished_airing: "Finished Airing",
  not_yet_aired: "Not Yet Aired",
};

function normalizeMalStatus(status?: string): string {
  if (!status) return "Unknown";
  return MAL_STATUS_LABELS[status] ?? status;
}

export async function fetchMalSeasonCards(season: AnimeSeason, year: number): Promise<HomeSeasonResult> {
  try {
    const items = await fetchCachedMalSeason({ year, season, sort: "anime_score" });

    const deconstructed: HomeSeasonCard[] = [];
    const seenIds = new Set<number>();

    for (const item of items) {
      const node = item?.node;
      if (!node || typeof node.id !== "number") continue;
      if (seenIds.has(node.id)) continue;
      seenIds.add(node.id);

      deconstructed.push({
        status: normalizeMalStatus(node.status),
        mal_id: node.id,
        images: {
          webp: {
            large_image_url: node.main_picture?.large || "/placeholder.svg",
          },
        },
        year: node.start_season?.year ?? undefined,
        title: node.title || "Untitled",
        score: node.mean ?? undefined,
        title_english: node.alternative_titles?.en ?? null,
      });

      if (deconstructed.length >= 24) {
        break;
      }
    }

    return {
      querydata: deconstructed,
      isloading: false,
      error: false,
    };
  } catch (error) {
    console.error(`Error fetching MAL season cards for ${season} ${year}:`, error);
    return {
      querydata: [],
      isloading: false,
      error: true,
    };
  }
}

export async function fetchAniListSpotlight(seasonWindow: SeasonWindow): Promise<{
  querydata: AniListSpotlightItem[];
  isloading: boolean;
  error: boolean;
}> {
  const graphql_queries = `query Page($perPage: Int, $page: Int, $season: MediaSeason, $seasonYear: Int, $sort: [MediaSort], $isAdult: Boolean) {
    Page(perPage: $perPage, page: $page) {
      media(season: $season, seasonYear: $seasonYear, sort: $sort, isAdult: $isAdult) {
        bannerImage
        idMal
        genres
        title {
          english
          romaji
        }
      }
    }
  }`;

  const graphql_variables = {
    perPage: 10,
    page: 1,
    season: seasonWindow.current_season.toUpperCase(),
    seasonYear: seasonWindow.current_year,
    sort: "POPULARITY_DESC",
    isAdult: false,
  };

  const response = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: graphql_queries,
      variables: graphql_variables,
    }),
    next: { revalidate: SEASONAL_PAGE_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`AniList returned status ${response.status}`);
  }

  const payload = await response.json();
  const rawMedia = payload?.data?.Page?.media;
  if (!Array.isArray(rawMedia)) {
    throw new Error("AniList spotlight data.Page.media is missing or not an array");
  }

  const normalized: AniListSpotlightItem[] = [];
  for (const item of rawMedia) {
    if (!item || item.idMal === null || item.idMal === undefined) {
      continue;
    }
    normalized.push({
      bannerImage: item.bannerImage ?? undefined,
      idMal: item.idMal,
      genres: item.genres ?? [],
      title: {
        english: item.title?.english ?? undefined,
        romaji: item.title?.romaji ?? undefined,
      },
    });
  }

  if (normalized.length === 0) {
    throw new Error("AniList spotlight normalized media is empty");
  }

  return {
    querydata: normalized,
    isloading: false,
    error: false,
  };
}

export async function fetchHomeSeasonCarousel(seasonWindow?: SeasonWindow): Promise<HomeSeasonCarouselData> {
  let dateInput: Date | undefined;
  if (seasonWindow) {
    dateInput = new Date(seasonWindow.current_year, seasonWindow.current_month - 1, 15);
  }
  const seasonal_data = getSeasonCarouselWindow(dateInput);

  const season_anime = await Promise.all(
    seasonal_data.map(async (element) => {
      try {
        const items = await fetchCachedMalSeason({
          year: element.year,
          season: element.season,
          sort: "anime_score",
        });
        return pickSeasonRepresentative(items, element.season, element.year);
      } catch (error) {
        console.error(`Error fetching carousel representative for ${element.season} ${element.year}:`, error);
        return null;
      }
    })
  );

  return {
    season_anime,
    seasonal_data,
  };
}

export async function fetchHomePageData() {
  const seasonWindow = getSeasonWindow();

  // Fetch critical AniList Spotlight data first (let it throw on failure)
  const spotlightData = await fetchAniListSpotlight(seasonWindow);

  // Fetch the rest of the data in parallel
  const [thisseason, pastSeason, upcomingSeason, seasonal_carousel_data] = await Promise.all([
    fetchMalSeasonCards(seasonWindow.current_season, seasonWindow.current_year),
    fetchMalSeasonCards(seasonWindow.past_season, seasonWindow.past_year),
    fetchMalSeasonCards(seasonWindow.upcoming_season, seasonWindow.upcoming_year),
    fetchHomeSeasonCarousel(seasonWindow),
  ]);

  return {
    thisseason,
    pastSeason,
    upcomingSeason,
    carouseldata: spotlightData,
    seasonal_carousel_data,
  };
}
