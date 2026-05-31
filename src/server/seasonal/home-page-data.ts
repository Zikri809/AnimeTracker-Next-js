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

export async function fetchJikanSeasonCards(season: AnimeSeason, year: number): Promise<HomeSeasonResult> {
  try {
    const response = await fetch(`https://api.jikan.moe/v4/seasons/${year}/${season}`, {
      next: { revalidate: SEASONAL_PAGE_REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    if (!payload || !Array.isArray(payload.data)) {
      throw new Error("Invalid Jikan response payload");
    }

    const deconstructed: HomeSeasonCard[] = [];
    const seenIds = new Set<number>();

    for (const item of payload.data) {
      if (!item || typeof item.mal_id !== "number") continue;
      if (seenIds.has(item.mal_id)) continue;
      seenIds.add(item.mal_id);

      deconstructed.push({
        status: item.status || "Unknown",
        mal_id: item.mal_id,
        images: {
          webp: {
            large_image_url: item.images?.webp?.large_image_url || "/placeholder.svg",
          },
        },
        year: item.year ?? undefined,
        title: item.title || "Untitled",
        score: item.score ?? undefined,
        title_english: item.title_english ?? null,
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
    console.error(`Error fetching Jikan season cards for ${season} ${year}:`, error);
    return {
      querydata: [],
      isloading: true,
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
    fetchJikanSeasonCards(seasonWindow.current_season, seasonWindow.current_year),
    fetchJikanSeasonCards(seasonWindow.past_season, seasonWindow.past_year),
    fetchJikanSeasonCards(seasonWindow.upcoming_season, seasonWindow.upcoming_year),
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
