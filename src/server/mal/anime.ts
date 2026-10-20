import { getRequiredEnv } from '../env';
import { MAL_TRACKING_FIELDS } from '@/Utility/tracking/mal-tracking-item';

const MAL_API_BASE = 'https://api.myanimelist.net/v2';

export async function fetchPublicAnimeForTracking(
  id: string | number,
  accessToken?: string
): Promise<any> {
  const animeId = Number(id);
  if (Number.isNaN(animeId) || animeId <= 0) {
    throw new Error(`Invalid anime ID: ${id}`);
  }

  if (process.env.PLAYWRIGHT_TEST === 'true') {
    if (animeId === 1) {
      return {
        id: 1,
        title: "Cowboy Bebop",
        alternative_titles: { en: "Cowboy Bebop English" },
        main_picture: { large: "https://example.com/cowboy.webp" },
        status: "finished_airing",
        num_episodes: 26,
        genres: [{ id: 1, name: "Action" }]
      };
    }
    if (animeId === 2) {
      return {
        id: 2,
        title: "Upcoming Show",
        status: "not_yet_aired",
        num_episodes: 12,
        genres: []
      };
    }
    if (animeId === 3) {
      return {
        id: 3,
        title: "Airing Show",
        status: "currently_airing",
        num_episodes: 12,
        genres: []
      };
    }
    if (animeId === 5) {
      return {
        id: 5,
        title: "Cowboy Bebop: Tengoku no Tobira",
        alternative_titles: { en: "Cowboy Bebop: The Movie" },
        main_picture: { large: "https://example.com/movie.webp" },
        status: "finished_airing",
        num_episodes: 1,
        genres: [{ id: 1, name: "Action" }]
      };
    }
    if (animeId === 999) {
      throw new Error("MAL details failed with status 500");
    }
  }

  const url = `${MAL_API_BASE}/anime/${animeId}?fields=${MAL_TRACKING_FIELDS}`;
  const headers: Record<string, string> = {};

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  } else {
    const clientId = getRequiredEnv('Client_ID');
    headers['X-MAL-CLIENT-ID'] = clientId;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers,
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`MAL Anime Details for tracking failed with status ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  if (!data || data.id !== animeId) {
    throw new Error(`Invalid MAL response or ID mismatch for anime ${animeId}`);
  }

  return data;
}

// Everything the detail page view model needs. Only documented MAL v2 fields
// may be requested — unknown names make the API reject the whole request with
// 400. my_list_status (via MAL_TRACKING_FIELDS) lets the same response serve
// the tracking variant when an access token is present. MAL exposes no
// favorites or licensor fields, so those view-model slots stay empty.
export const MAL_DETAIL_FIELDS = [
  MAL_TRACKING_FIELDS,
  'synopsis',
  'rank',
  'studios',
  'related_anime',
].join(',');

// Detail pages are heavily crawled, so cache upstream at the edge for 12h to
// stay inside the MAL client quota (same strategy the Jikan fetcher used).
const MAL_DETAIL_REVALIDATE_SECONDS = 43200;

export async function fetchPublicAnimeDetail(id: string | number): Promise<any> {
  const animeId = Number(id);
  if (Number.isNaN(animeId) || animeId <= 0) {
    throw new Error(`Invalid anime ID: ${id}`);
  }

  if (process.env.PLAYWRIGHT_TEST === 'true') {
    if (animeId === 1) {
      return {
        id: 1,
        title: "Cowboy Bebop",
        alternative_titles: { en: "Cowboy Bebop English", ja: "カウボーイビバップ" },
        main_picture: { large: "https://example.com/cowboy.webp" },
        status: "finished_airing",
        num_episodes: 26,
        mean: 8.78,
        num_scoring_users: 915000,
        rank: 39,
        popularity: 39,
        genres: [
          { id: 1, name: "Action" },
          { id: 2, name: "Sci-Fi" }
        ],
        synopsis: "This is a detailed mock synopsis for Cowboy Bebop.",
        media_type: "tv",
        start_season: { season: "spring", year: 1998 },
        start_date: "1998-04-03",
        end_date: "1999-04-24",
        source: "original",
        average_episode_duration: 1440,
        rating: "r_17",
        studios: [{ id: 14, name: "Sunrise" }],
        broadcast: { day_of_week: "saturday", start_time: "16:00" },
        related_anime: [
          {
            relation_type: "side_story",
            relation_type_formatted: "Side story",
            node: { id: 5, title: "Cowboy Bebop: Tengoku no Tobira" }
          }
        ]
      };
    }
    if (animeId === 2) {
      return {
        id: 2,
        title: "Upcoming Show",
        status: "not_yet_aired",
        num_episodes: 12,
        genres: []
      };
    }
    if (animeId === 3) {
      return {
        id: 3,
        title: "Airing Show",
        status: "currently_airing",
        num_episodes: 12,
        genres: []
      };
    }
    if (animeId === 5) {
      return {
        id: 5,
        title: "Cowboy Bebop: Tengoku no Tobira",
        alternative_titles: { en: "Cowboy Bebop: The Movie" },
        main_picture: { large: "https://example.com/movie.webp" },
        status: "finished_airing",
        num_episodes: 1,
        mean: 8.39,
        synopsis: "Relation movie synopsis.",
        genres: [{ id: 1, name: "Action" }],
        studios: [{ id: 14, name: "Sunrise" }],
        related_anime: []
      };
    }
    if (animeId === 999) {
      throw new Error("MAL details failed with status 500");
    }
  }

  const params = new URLSearchParams({ fields: MAL_DETAIL_FIELDS });
  const url = `${MAL_API_BASE}/anime/${animeId}?${params.toString()}`;
  const clientId = getRequiredEnv('Client_ID');

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-MAL-CLIENT-ID': clientId,
    },
    next: { revalidate: MAL_DETAIL_REVALIDATE_SECONDS },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    const err: any = new Error(`MAL Details API returned status ${response.status}: ${errorText}`);
    err.status = response.status;
    throw err;
  }

  const data = await response.json();
  if (!data || data.id !== animeId) {
    throw new Error(`Invalid MAL response or ID mismatch for anime ${animeId}`);
  }

  return data;
}

export async function checkAnimeAppearsInMalSearch(
  animeId: string | number,
  title: string | null | undefined
): Promise<boolean | null> {
  const parsedAnimeId = Number(animeId);
  const query = typeof title === 'string' ? title.trim() : '';
  if (!Number.isInteger(parsedAnimeId) || parsedAnimeId <= 0 || query === '') {
    return null;
  }

  if (process.env.PLAYWRIGHT_TEST === 'true') {
    return true;
  }

  try {
    const clientId = getRequiredEnv('Client_ID');
    const params = new URLSearchParams({
      q: query,
      limit: '20',
      fields: 'id,title,alternative_titles',
      nsfw: 'true',
    });

    const response = await fetch(`${MAL_API_BASE}/anime?${params.toString()}`, {
      method: 'GET',
      headers: {
        'X-MAL-CLIENT-ID': clientId,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    const entries = Array.isArray(payload?.data) ? payload.data : [];
    return entries.some((entry: any) => entry?.node?.id === parsedAnimeId);
  } catch {
    return null;
  }
}

export function isPotentiallyRestrictedAnime(data: any): boolean {
  const rating = typeof data?.rating === 'string' ? data.rating.toLowerCase() : '';
  const mediaType = typeof data?.media_type === 'string' ? data.media_type.toLowerCase() : '';
  const genres = Array.isArray(data?.genres)
    ? data.genres.map((genre: any) => String(genre?.name || '').toLowerCase())
    : [];

  const restrictedSignals = [
    rating,
    mediaType,
    ...genres,
  ];

  return restrictedSignals.some((signal) =>
    signal === 'rx' ||
    signal === 'r_plus' ||
    signal.includes('hentai') ||
    signal.includes('erotica') ||
    signal.includes('ecchi')
  );
}
