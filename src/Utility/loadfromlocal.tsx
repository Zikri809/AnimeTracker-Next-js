import React from 'react';
import { Plus } from 'lucide-react';

export function getWatchlistButtonContent(input: {
  malId?: string | number;
  relationId?: string | number;
  storage?: Storage;
}): React.ReactNode {
  if (typeof window === 'undefined') return null;
  const storage = input.storage || window.localStorage;
  if (!storage) return null;

  const resolvedIdStr = input.relationId ?? input.malId;
  if (resolvedIdStr === undefined || resolvedIdStr === null) return null;
  const mal_id = Number(resolvedIdStr);
  if (Number.isNaN(mal_id)) return null;

  const safeParse = (key: string): any[] => {
    try {
      const val = storage.getItem(key);
      if (!val) return [];
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const plantowatchmap = new Map(safeParse('PlanToWatch'));
  const watchingmap = new Map(safeParse('Watching'));
  const completedmap = new Map(safeParse('Completed'));
  const onholdmap = new Map(safeParse('OnHold'));
  const droppedmap = new Map(safeParse('Dropped'));

  if (plantowatchmap.has(mal_id)) {
    const anime = plantowatchmap.get(mal_id) as any;
    return `To Watch - Ep ${anime.userprogress ?? anime.list_status?.num_episodes_watched}/${anime.node.num_episodes}`;
  } else if (watchingmap.has(mal_id)) {
    const anime = watchingmap.get(mal_id) as any;
    return `Watching - Ep ${anime.userprogress ?? anime.list_status?.num_episodes_watched}/${anime.node.num_episodes}`;
  } else if (completedmap.has(mal_id)) {
    const anime = completedmap.get(mal_id) as any;
    return `Completed - Ep ${anime.userprogress ?? anime.list_status?.num_episodes_watched}/${anime.node.num_episodes}`;
  } else if (onholdmap.has(mal_id)) {
    const anime = onholdmap.get(mal_id) as any;
    return `On Hold - Ep ${anime.userprogress ?? anime.list_status?.num_episodes_watched}/${anime.node.num_episodes}`;
  } else if (droppedmap.has(mal_id)) {
    const anime = droppedmap.get(mal_id) as any;
    return `Dropped - Ep ${anime.userprogress ?? anime.list_status?.num_episodes_watched}/${anime.node.num_episodes}`;
  } else {
    return (
      <span className="flex flex-row items-center gap-1">
        <Plus size={36} />
        Add to watchlist
      </span>
    );
  }
}

// Backward compatible default export that accepts mal_id (or relation_id) and setter
export default function loadFromLocal(
  mal_id_or_router: any,
  Setusersstate: (content: React.ReactNode) => void
): void {
  let resolvedId: any = mal_id_or_router;
  if (mal_id_or_router && typeof mal_id_or_router === 'object' && mal_id_or_router.query) {
    resolvedId = mal_id_or_router.query.relation_id ?? mal_id_or_router.query.mal_id;
  }
  const content = getWatchlistButtonContent({ malId: resolvedId });
  Setusersstate(content);
}
