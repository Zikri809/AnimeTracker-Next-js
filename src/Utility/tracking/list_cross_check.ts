import { getWatchlistMap, WatchlistKey } from './watchlist-storage';

const STATUS_TO_STORAGE_KEY: Record<string, WatchlistKey> = {
  watching: 'Watching',
  Watching: 'Watching',
  completed: 'Completed',
  Completed: 'Completed',
  plan_to_watch: 'PlanToWatch',
  'Plan To Watch': 'PlanToWatch',
  on_hold: 'OnHold',
  'On Hold': 'OnHold',
  dropped: 'Dropped',
  Dropped: 'Dropped',
};

export default async function cross_check(
  mal_id: string | number,
  status: string
): Promise<string> {
  // the main purpose of this function is to make sure that the anime added through the tracking page is
  // available in the watchlist because there is cases of shadow banned occuring on anime with genre such as echi , Rx and so on
  // those anime can be added to the watchlist but is not returned in our userwatch list api
  // and those anime are visible on mal website

  const valid_storage_name = STATUS_TO_STORAGE_KEY[status];
  if (!valid_storage_name) {
    return Promise.reject('unknown watchlist status');
  }

  const data_map = getWatchlistMap(valid_storage_name);
  const parsedId = typeof mal_id === 'string' ? parseInt(mal_id, 10) : mal_id;
  if (data_map.has(parsedId)) {
    return Promise.resolve('anime is visible in watchlist');
  } else {
    return Promise.reject('anime is not in the watchlist');
  }
}
