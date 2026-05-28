/**
 * Input validation helpers for MyAnimeList proxy parameters.
 */

export function parseStrictInt(val: string | null | undefined): number | null {
  if (val === undefined || val === null) return null;
  const trimmed = val.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const num = parseInt(trimmed, 10);
  return isNaN(num) ? null : num;
}

export function validateYear(yearStr: string | null | undefined): number {
  if (!yearStr) throw new Error('Missing year parameter');
  const trimmed = yearStr.trim();
  if (!/^\d{4}$/.test(trimmed)) {
    throw new Error('Year must be exactly 4 digits');
  }
  return parseInt(trimmed, 10);
}

export const ALLOWED_SEASONS = ['winter', 'spring', 'summer', 'fall'] as const;
export type Season = typeof ALLOWED_SEASONS[number];

export function validateSeason(seasonStr: string | null | undefined): Season {
  if (!seasonStr) throw new Error('Missing season parameter');
  const lower = seasonStr.trim().toLowerCase();
  if (!ALLOWED_SEASONS.includes(lower as Season)) {
    throw new Error(`Invalid season. Allowed values are: ${ALLOWED_SEASONS.join(', ')}`);
  }
  return lower as Season;
}

export const ALLOWED_STATUSES = [
  'watching',
  'completed',
  'on_hold',
  'dropped',
  'plan_to_watch',
] as const;
export type UserListStatus = typeof ALLOWED_STATUSES[number];

export function validateUserListStatus(statusStr: string | null | undefined): UserListStatus {
  if (!statusStr) throw new Error('Missing status parameter');
  const lower = statusStr.trim().toLowerCase();
  if (!ALLOWED_STATUSES.includes(lower as UserListStatus)) {
    throw new Error(`Invalid status. Allowed values are: ${ALLOWED_STATUSES.join(', ')}`);
  }
  return lower as UserListStatus;
}

export const ALLOWED_SORTS = [
  'list_score',
  'list_updated_at',
  'anime_title',
  'anime_start_date',
] as const;
export type UserListSort = typeof ALLOWED_SORTS[number];

export function validateUserListSort(sortStr: string | null | undefined): UserListSort {
  if (!sortStr) throw new Error('Missing sort parameter');
  const lower = sortStr.trim().toLowerCase();
  if (!ALLOWED_SORTS.includes(lower as UserListSort)) {
    throw new Error(`Invalid sort. Allowed values are: ${ALLOWED_SORTS.join(', ')}`);
  }
  return lower as UserListSort;
}

export function validateScore(scoreStr: string | number | null | undefined): number {
  if (scoreStr === undefined || scoreStr === null) {
    throw new Error('Missing score parameter');
  }
  
  let score: number | null = null;
  if (typeof scoreStr === 'number') {
    score = scoreStr;
  } else {
    score = parseStrictInt(scoreStr);
  }
  
  if (score === null || score < 0 || score > 10) {
    throw new Error('Score must be an integer between 0 and 10');
  }
  return score;
}

export function validateEpisode(episodeStr: string | number | null | undefined): number {
  if (episodeStr === undefined || episodeStr === null) {
    throw new Error('Missing episode parameter');
  }

  let episode: number | null = null;
  if (typeof episodeStr === 'number') {
    episode = episodeStr;
  } else {
    episode = parseStrictInt(episodeStr);
  }

  if (episode === null || episode < 0) {
    throw new Error('Episode must be an integer greater than or equal to 0');
  }
  return episode;
}

export function validateOffset(offsetStr: string | number | null | undefined): number {
  if (offsetStr === undefined || offsetStr === null) {
    return 0; // Default offset
  }

  let offset: number | null = null;
  if (typeof offsetStr === 'number') {
    offset = offsetStr;
  } else {
    offset = parseStrictInt(offsetStr);
  }

  if (offset === null || offset < 0) {
    throw new Error('Offset must be an integer greater than or equal to 0');
  }
  return offset;
}

export function validateLimit(limitStr: string | number | null | undefined): number {
  if (limitStr === undefined || limitStr === null) {
    return 500; // Default limit
  }

  let limit: number | null = null;
  if (typeof limitStr === 'number') {
    limit = limitStr;
  } else {
    limit = parseStrictInt(limitStr);
  }

  if (limit === null || limit < 1 || limit > 500) {
    throw new Error('Limit must be an integer between 1 and 500');
  }
  return limit;
}

export function validateAnimeId(animeIdStr: string | number | null | undefined): number {
  if (animeIdStr === undefined || animeIdStr === null) {
    throw new Error('Missing anime_id parameter');
  }

  let animeId: number | null = null;
  if (typeof animeIdStr === 'number') {
    animeId = animeIdStr;
  } else {
    animeId = parseStrictInt(animeIdStr);
  }

  if (animeId === null || animeId <= 0) {
    throw new Error('Anime ID must be a positive integer');
  }
  return animeId;
}
