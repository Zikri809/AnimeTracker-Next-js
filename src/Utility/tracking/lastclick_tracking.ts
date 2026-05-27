export default function last_click(
  btnref: any,
  api: any,
  api2: any,
  routerOrAdapter?: any,
  malId?: string | number,
  relationId?: string | number
): void {
  const plantowatchmap = new Map<any, any>(JSON.parse(localStorage.getItem('PlanToWatch') || '[]'));
  const watchingmap = new Map<any, any>(JSON.parse(localStorage.getItem('Watching') || '[]'));
  const completedmap = new Map<any, any>(JSON.parse(localStorage.getItem('Completed') || '[]'));
  const onholdmap = new Map<any, any>(JSON.parse(localStorage.getItem('OnHold') || '[]'));
  const droppedmap = new Map<any, any>(JSON.parse(localStorage.getItem('Dropped') || '[]'));

  const resolvedMalId = malId ?? routerOrAdapter?.query?.mal_id;
  const resolvedRelationId = relationId ?? routerOrAdapter?.query?.relation_id;
  const mal_id = parseInt(String(resolvedRelationId ?? resolvedMalId));

  console.log('mal_id in lastclick ', mal_id);

  if (plantowatchmap.has(mal_id)) {
    const anime = plantowatchmap.get(mal_id);
    console.log('found in local ', anime);
    btnref.current[2]?.click();
    api?.scrollTo(anime.list_status.num_episodes_watched);
    api2?.scrollTo(anime.list_status.score);
  } else if (watchingmap.has(mal_id)) {
    const anime = watchingmap.get(mal_id);
    console.log('found in local ', anime);
    btnref.current[0]?.click();
    api?.scrollTo(anime.list_status.num_episodes_watched);
    api2?.scrollTo(anime.list_status.score);
  } else if (completedmap.has(mal_id)) {
    const anime = completedmap.get(mal_id);
    console.log('found in local ', anime);
    btnref.current[1]?.click();
    api?.scrollTo(anime.list_status.num_episodes_watched);
    api2?.scrollTo(anime.list_status.score);
  } else if (onholdmap.has(mal_id)) {
    const anime = onholdmap.get(mal_id);
    console.log('found in local ', anime);
    btnref.current[3]?.click();
    api?.scrollTo(anime.list_status.num_episodes_watched);
    api2?.scrollTo(anime.list_status.score);
  } else if (droppedmap.has(mal_id)) {
    const anime = droppedmap.get(mal_id);
    console.log('found in local ', anime);
    btnref.current[4]?.click();
    api?.scrollTo(anime.list_status.num_episodes_watched);
    api2?.scrollTo(anime.list_status.score);
  }
}
