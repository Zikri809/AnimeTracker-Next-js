export type MalTrackingItem = {
  node: {
    id: number;
    main_picture?: { large?: string | null; medium?: string | null } | null;
    status?: string | null;
    start_season?: { season?: string; year?: number } | null;
    num_episodes?: number | null;
    title?: string | null;
    alternative_titles?: {
      en?: string | null;
      ja?: string | null;
      synonyms?: string[];
    } | null;
    mean?: number | null;
    num_scoring_users?: number | null;
    popularity?: number | null;
    genres?: Array<{ id?: number; name?: string }> | null;
  };
  list_status: {
    status: string | null;
    score: number;
    num_episodes_watched: number;
    is_rewatching: boolean;
    updated_at: string | null;
  };
};

export const MAL_TRACKING_FIELDS =
  "id,title,main_picture,alternative_titles,start_date,end_date,mean,num_scoring_users,popularity,media_type,status,genres,num_episodes,start_season,broadcast,source,average_episode_duration,rating,my_list_status";
