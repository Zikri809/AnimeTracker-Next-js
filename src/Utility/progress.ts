export default function progress(mal_id: number): number | undefined {
  if (typeof window === 'undefined') return undefined;
  const plantowatchmap = new Map(JSON.parse(localStorage.getItem('PlanToWatch') || '[]'));
  const watchingmap = new Map(JSON.parse(localStorage.getItem('Watching') || '[]'));
  const completedmap = new Map(JSON.parse(localStorage.getItem('Completed') || '[]'));
  const onholdmap = new Map(JSON.parse(localStorage.getItem('OnHold') || '[]'));
  const droppedmap = new Map(JSON.parse(localStorage.getItem('Dropped') || '[]'));

  let anime: any;
  if (plantowatchmap.has(mal_id)) {
    anime = plantowatchmap.get(mal_id);
  } else if (watchingmap.has(mal_id)) {
    anime = watchingmap.get(mal_id);
  } else if (completedmap.has(mal_id)) {
    anime = completedmap.get(mal_id);
  } else if (onholdmap.has(mal_id)) {
    anime = onholdmap.get(mal_id);
  } else if (droppedmap.has(mal_id)) {
    anime = droppedmap.get(mal_id);
  }

  if (anime) {
    return anime.userprogress ?? anime.list_status?.num_episodes_watched;
  }
  return undefined;
}
