import { MalTrackingItem } from '@/Utility/tracking/mal-tracking-item';

export interface NormalizedRowItem {
  id: number;
  title: string;
  image: string;
  status: string;
  season: string;
  episodes: number;
  score: number;
  users: number;
  ranking: number;
  genres: Array<{ id: number; name: string }>;
  userProgress: number;
}

export function normalizeRowItem(item: any): NormalizedRowItem {
  const id = item?.node?.id ?? 0;
  
  // Title prefers English alternative title, falls back to main title, then to Anime #id
  let title = `Anime #${id}`;
  if (item?.node?.alternative_titles?.en) {
    title = item.node.alternative_titles.en;
  } else if (item?.node?.title) {
    title = item.node.title;
  }

  // Image fallback
  const image = item?.node?.main_picture?.large ?? item?.node?.main_picture?.medium ?? '';

  // Status format from node.status
  let rawStatus = item?.node?.status ?? '';
  let status = '';
  if (rawStatus) {
    status = rawStatus
      .split('_')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Season prefers start_season, falls back to legacy season/year
  let season = ' ';
  if (item?.node?.start_season?.season && item?.node?.start_season?.year) {
    season = `${item.node.start_season.season} ${item.node.start_season.year}`;
  } else if (item?.node?.season && item?.node?.year) {
    season = `${item.node.season} ${item.node.year}`;
  }

  // Stable numeric/array fallbacks
  const episodes = item?.node?.num_episodes ?? 0;
  const score = item?.node?.mean ?? 0;
  const users = item?.node?.num_scoring_users ?? 0;
  const ranking = item?.node?.popularity ?? 0;
  const genres = Array.isArray(item?.node?.genres) ? item.node.genres : [];

  // Watching progress
  const userProgress = item?.userprogress ?? item?.list_status?.num_episodes_watched ?? 0;

  return {
    id,
    title,
    image,
    status,
    season,
    episodes,
    score,
    users,
    ranking,
    genres,
    userProgress
  };
}

export function getTopOrWorstRated(items: any[], isTop: boolean): any[] {
  // Filter out invalid items (mixed valid/corrupted entries)
  const validItems = items.filter(item => item && item.node && typeof item.node.id === 'number');

  return [...validItems].sort((a, b) => {
    const scoreA = a.list_status?.score ?? 0;
    const scoreB = b.list_status?.score ?? 0;
    
    if (scoreA !== scoreB) {
      return isTop ? scoreB - scoreA : scoreA - scoreB;
    }
    
    // Break ties with update time (latest updated first for both top and worst)
    const parseTime = (dateStr: any) => {
      if (!dateStr) return 0;
      const parsed = Date.parse(dateStr);
      return isNaN(parsed) ? 0 : parsed;
    };
    const timeA = parseTime(a.list_status?.updated_at);
    const timeB = parseTime(b.list_status?.updated_at);
    if (timeA !== timeB) {
      return timeB - timeA;
    }

    // Break ties with community mean score
    const meanA = a.node?.mean ?? 0;
    const meanB = b.node?.mean ?? 0;
    if (meanA !== meanB) {
      return isTop ? meanB - meanA : meanA - meanB;
    }
    
    // Break ties with ID deterministically
    const idA = a.node.id;
    const idB = b.node.id;
    return idA - idB;
  });
}
