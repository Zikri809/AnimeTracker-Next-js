import { WATCHLIST_KEYS, getWatchlistMap } from './watchlist-storage';

const WATCHLIST_BUTTON_INDEX: Record<string, number> = {
  PlanToWatch: 2,
  Watching: 0,
  Completed: 1,
  OnHold: 3,
  Dropped: 4,
};

function carouselMaxIndex(api: any): number {
  const snapCount = api?.scrollSnapList?.().length;
  return typeof snapCount === 'number' && Number.isFinite(snapCount) ? snapCount - 1 : 0;
}

function clampToCarousel(value: unknown, maxIndex: number): number {
  const numericValue = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.min(Math.max(Math.trunc(numericValue), 0), Math.max(maxIndex, 0));
}

export default function last_click(
  btnref: any,
  api: any,
  api2: any,
  routerOrAdapter?: any,
  malId?: string | number,
  relationId?: string | number
): void {
  const resolvedMalId = malId ?? routerOrAdapter?.query?.mal_id;
  const resolvedRelationId = relationId ?? routerOrAdapter?.query?.relation_id;
  const mal_id = Number(resolvedRelationId ?? resolvedMalId);

  if (!Number.isFinite(mal_id)) return;

  for (const key of WATCHLIST_KEYS) {
    const map = getWatchlistMap(key);
    const anime = map.get(mal_id);
    if (anime) {
      btnref.current[WATCHLIST_BUTTON_INDEX[key]]?.click();
      api?.scrollTo(clampToCarousel(anime.list_status.num_episodes_watched, carouselMaxIndex(api)));
      api2?.scrollTo(clampToCarousel(anime.list_status.score, carouselMaxIndex(api2)));
      return;
    }
  }
}
