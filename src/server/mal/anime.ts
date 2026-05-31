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
