import { getRequiredEnv } from '../env';
import {
  validateYear,
  validateSeason,
  validateLimit,
  validateOffset,
  validateAnimeId,
  validateUserListStatus,
  validateUserListSort,
  validateScore,
  validateEpisode,
} from './validation';

/**
 * Proxy client for MyAnimeList REST API v2 endpoints.
 */

const MAL_API_BASE = 'https://api.myanimelist.net/v2';

export async function fetchSeasonal(
  yearVal: string | number | null | undefined,
  seasonVal: string | null | undefined,
  limitVal?: string | number | null | undefined,
  offsetVal?: string | number | null | undefined
) {
  const year = validateYear(yearVal?.toString());
  const season = validateSeason(seasonVal);
  const limit = validateLimit(limitVal);
  const offset = validateOffset(offsetVal);

  const clientId = getRequiredEnv('Client_ID');
  
  const fields = 'main_picture,status,start_season,num_episodes,title,alternative_titles,mean,num_scoring_users,popularity,genres';
  
  const params = new URLSearchParams({
    sort: 'anime_score',
    limit: limit.toString(),
    offset: offset.toString(),
    fields,
  });

  const url = `${MAL_API_BASE}/anime/season/${year}/${season}?${params.toString()}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-MAL-CLIENT-ID': clientId,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    const err: any = new Error(`MAL Seasonal API returned status ${response.status}: ${errorText}`);
    err.status = response.status;
    throw err;
  }

  return response.json();
}

export async function fetchAnimeDetails(
  idVal: string | number | null | undefined,
  accessToken: string
) {
  const animeId = validateAnimeId(idVal);
  if (!accessToken) {
    const err: any = new Error('Access token is required');
    err.status = 401;
    throw err;
  }

  const url = `${MAL_API_BASE}/anime/${animeId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    const err: any = new Error(`MAL Details API returned status ${response.status}: ${errorText}`);
    err.status = response.status;
    throw err;
  }

  return response.json();
}

export async function fetchUserData(accessToken: string) {
  if (!accessToken) {
    const err: any = new Error('Access token is required');
    err.status = 401;
    throw err;
  }

  const url = `${MAL_API_BASE}/users/@me?fields=anime_statistics,picture`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    const err: any = new Error(`MAL User Data API returned status ${response.status}: ${errorText}`);
    err.status = response.status;
    throw err;
  }

  return response.json();
}

export async function fetchUserList(
  accessToken: string,
  statusVal: string | null | undefined,
  sortVal: string | null | undefined,
  offsetVal?: string | number | null | undefined
) {
  if (!accessToken) {
    const err: any = new Error('Access token is required');
    err.status = 401;
    throw err;
  }

  const status = validateUserListStatus(statusVal);
  const sort = validateUserListSort(sortVal);
  const offset = validateOffset(offsetVal);

  const fields = 'list_status,main_picture,status,start_season,num_episodes,title,alternative_titles,mean,num_scoring_users,popularity,genres';

  const params = new URLSearchParams({
    status,
    sort,
    offset: offset.toString(),
    fields,
    nsfw: 'true',
    limit: '1000',
  });

  const url = `${MAL_API_BASE}/users/@me/animelist?${params.toString()}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    const err: any = new Error(`MAL User List API returned status ${response.status}: ${errorText}`);
    err.status = response.status;
    throw err;
  }

  return response.json();
}

export async function saveAnime(
  accessToken: string,
  animeIdVal: string | number | null | undefined,
  statusVal: string | null | undefined,
  scoreVal: string | number | null | undefined,
  episodeVal: string | number | null | undefined
) {
  if (!accessToken) {
    const err: any = new Error('Access token is required');
    err.status = 401;
    throw err;
  }

  const animeId = validateAnimeId(animeIdVal);
  const status = validateUserListStatus(statusVal);
  const score = validateScore(scoreVal);
  const numWatchedEpisodes = validateEpisode(episodeVal);

  const url = `${MAL_API_BASE}/anime/${animeId}/my_list_status`;
  
  const body = new URLSearchParams({
    status,
    score: score.toString(),
    num_watched_episodes: numWatchedEpisodes.toString(),
  });

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    const err: any = new Error(`MAL Save Anime API returned status ${response.status}: ${errorText}`);
    err.status = response.status;
    throw err;
  }

  return response.json();
}

export async function deleteAnime(
  accessToken: string,
  animeIdVal: string | number | null | undefined
) {
  if (!accessToken) {
    const err: any = new Error('Access token is required');
    err.status = 401;
    throw err;
  }

  const animeId = validateAnimeId(animeIdVal);

  const url = `${MAL_API_BASE}/anime/${animeId}/my_list_status`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    // If anime status is not on list, MAL might return 404. We can still let it propagate safely.
    const errorText = await response.text().catch(() => 'Unknown error');
    const err: any = new Error(`MAL Delete Anime API returned status ${response.status}: ${errorText}`);
    err.status = response.status;
    throw err;
  }

  // MAL DELETE returns 200/204, return parsed or true
  return true;
}
