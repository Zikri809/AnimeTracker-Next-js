import { fetchAuthSession } from "@/lib/auth-session";
import { toast } from "sonner";
import looping_updater from "./looping_list_updater";
import { buildTrackingBackHref } from "@/lib/routing/path-utils";
import { removeFromAllWatchlists } from "./watchlist-storage";

function toMalStatus(status: string, fallback?: string | null): string {
  if (status) {
    return status.split(' ').map(word => word[0].toLowerCase() + word.slice(1)).join('_');
  }
  return fallback || '';
}

export default async function delete_show(
  animeinfo: any,
  Setadded: (added: boolean) => void,
  routerOrAdapter: any,
  status: string,
  malId?: string | number,
  relationId?: string | number
): Promise<any> {
  const session = await fetchAuthSession();
  const mal_status = toMalStatus(status, animeinfo.list_status?.status);

  removeFromAllWatchlists(animeinfo.node.id);

  Setadded(false);

  const apicall = async () => {
    try {
      const result = await fetch(`/api/users/data/delete_anime?anime_id=${animeinfo.node.id}`);
      if (!result.ok) {
        const errordata = await result.json();
        throw new Error(`error message ${JSON.stringify(errordata)}`);
      }
    } catch (error) {
      console.log('error occured in delete funciton update delete req');
    }
  };

  let vartimer = 1000;
  if (session.authenticated) {
    vartimer = 3000; // to let the toast stay longer on the screen
    const promise = async () => {
      await apicall(); // wait for first to complete
      if (mal_status) {
        await looping_updater(mal_status); // then do second
      }
      return { name: 'Your' };
    };

    toast.promise(promise(), {
      loading: 'Loading...',
      success: (data) => {
        return `${data.name} anime has been deleted`;
      },
      error: 'Error',
    });
  }

  setTimeout(() => {
    const currentPath = routerOrAdapter.currentPath ?? routerOrAdapter.asPath ?? '';
    const backHref = buildTrackingBackHref(currentPath);
    routerOrAdapter.push(backHref);
  }, vartimer);
}
