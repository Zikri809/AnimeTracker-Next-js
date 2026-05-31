import { fetchAuthSession } from "@/lib/auth-session";
import { toast } from "sonner";
import looping_updater from "./looping_list_updater";
import cross_check from "./list_cross_check";
import { buildTrackingBackHref } from "@/lib/routing/path-utils";
import { addToWatchlist } from "./watchlist-storage";
import { startWatchlistSync } from "@/app/mylist/_lib/mylist-worker-sync";


function clampNumber(value: unknown, min: number, max: number): number {
  const numericValue = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numericValue)) return min;
  return Math.min(Math.max(Math.trunc(numericValue), min), max);
}

function selectedSnap(api: any): number {
  return typeof api?.selectedScrollSnap === 'function' ? api.selectedScrollSnap() : 0;
}

export default async function tracking_save(
  animeinfo: any,
  status: string,
  api: any,
  api2: any,
  Setadded: (added: boolean) => void,
  routerOrAdapter: any,
  malId?: string | number,
  relationId?: string | number
): Promise<any> {
  const session = await fetchAuthSession();
  if (status === '') {
    console.log('toast');
    return toast.error("Status has not been selected, Please do so!");
  }

  // change the list status
  const mal_status = status.split(' ').map(word => word[0].toLowerCase() + word.slice(1)).join('_');
  const safeEpisodeCount = Math.max(0, animeinfo.node.num_episodes ?? 0);
  animeinfo.list_status.status = mal_status;
  animeinfo.list_status.score = clampNumber(selectedSnap(api2), 0, 10);
  animeinfo.list_status.num_episodes_watched = clampNumber(selectedSnap(api), 0, safeEpisodeCount);

  const statusToKey = (s: string) => {
    if (s === 'Plan To Watch') return 'PlanToWatch';
    if (s === 'On Hold') return 'OnHold';
    return s as any;
  };
  const saveLocal = () => {
    Setadded(true);
    addToWatchlist(animeinfo, statusToKey(status));
  };

  const apicall = async () => {
    const result = await fetch(`/api/users/data/save_anime?anime_id=${animeinfo.node.id}&status=${mal_status}&episode=${animeinfo.list_status.num_episodes_watched}&score=${animeinfo.list_status.score}`);
    const data = await result.json();
    if (!result.ok) {
      throw new Error(`error message ${JSON.stringify(data)}`);
    }
    console.log('update data is ', data);
    return data;
  };

  if (session.authenticated) {
    console.log('api update triggered');
    const promise = async () => {
      await apicall(); // wait for first to complete
      await looping_updater(mal_status);
      await cross_check(animeinfo.node.id, mal_status); // then do second
      saveLocal();

      try {
        startWatchlistSync();
      } catch (err) {
        console.error('Failed to trigger background sync after save:', err);
      }

      return { name: 'Your' };
    };

    const savePromise = promise();
    toast.promise(savePromise, {
      loading: 'Loading...',
      success: (data) => {
        return `${data.name} anime has been added`;
      },
      error: 'MAL accepted the page but did not expose it through list sync, so AniJikan did not keep a local copy.',
    });

    try {
      await savePromise;
      const currentPath = routerOrAdapter.currentPath ?? routerOrAdapter.asPath ?? '';
      const backHref = buildTrackingBackHref(currentPath);
      routerOrAdapter.push(backHref);
    } catch {
      Setadded(false);
    }

    return;
  }

  saveLocal();
  setTimeout(() => {
    const currentPath = routerOrAdapter.currentPath ?? routerOrAdapter.asPath ?? '';
    const backHref = buildTrackingBackHref(currentPath);
    routerOrAdapter.push(backHref);
  }, 1000);
}
