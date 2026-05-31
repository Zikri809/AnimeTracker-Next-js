import { MalTrackingItem } from '@/Utility/tracking/mal-tracking-item';

export function normalizeMalAnime(data: any): MalTrackingItem {
  const node = {
    id: data.id,
    main_picture: data.main_picture
      ? {
          large: data.main_picture.large || null,
          medium: data.main_picture.medium || null,
        }
      : null,
    status: data.status || null,
    start_season: data.start_season
      ? {
          season: data.start_season.season || '',
          year: data.start_season.year || 0,
        }
      : null,
    num_episodes: typeof data.num_episodes === 'number' && data.num_episodes > 0 ? data.num_episodes : null,
    title: data.title || null,
    alternative_titles: data.alternative_titles
      ? {
          en: data.alternative_titles.en || null,
          ja: data.alternative_titles.ja || null,
          synonyms: Array.isArray(data.alternative_titles.synonyms)
            ? data.alternative_titles.synonyms
            : [],
        }
      : null,
    mean: typeof data.mean === 'number' ? data.mean : null,
    num_scoring_users: typeof data.num_scoring_users === 'number' ? data.num_scoring_users : null,
    popularity: typeof data.popularity === 'number' ? data.popularity : null,
    genres: Array.isArray(data.genres)
      ? data.genres.map((g: any) => ({
          id: typeof g.id === 'number' ? g.id : undefined,
          name: g.name || '',
        }))
      : null,
  };

  const list_status = data.my_list_status
    ? {
        status: data.my_list_status.status || null,
        score: typeof data.my_list_status.score === 'number' ? data.my_list_status.score : 0,
        num_episodes_watched: typeof data.my_list_status.num_episodes_watched === 'number'
          ? data.my_list_status.num_episodes_watched
          : 0,
        is_rewatching: !!data.my_list_status.is_rewatching,
        updated_at: data.my_list_status.updated_at || null,
      }
    : {
        status: null,
        score: 0,
        num_episodes_watched: 0,
        is_rewatching: false,
        updated_at: null,
      };

  return {
    node,
    list_status,
  };
}
