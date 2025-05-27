import { Plus } from 'lucide-react';
export default function loadFromLocal(router,Setusersstate) {
          // Wait for localStorage to be available and fetch data
          const plantowatchmap = new Map(JSON.parse(localStorage.getItem('PlanToWatch')));
          const watchingmap = new Map(JSON.parse(localStorage.getItem('Watching')));
          const completedmap = new Map(JSON.parse(localStorage.getItem('Completed')));
          const onholdmap = new Map(JSON.parse(localStorage.getItem('OnHold')));
          const droppedmap = new Map(JSON.parse(localStorage.getItem('Dropped')));
          const mal_id = parseInt(router.query.hasOwnProperty('relation_id')?router.query.relation_id:router.query.mal_id);
    
          console.log('params is ', mal_id);
          console.log('button checker id is ', mal_id);
          console.log('path is ',router.asPath)
    
          // Check each map and update the button state accordingly
          if (plantowatchmap.has(mal_id)) {
            const anime = plantowatchmap.get(mal_id);
            Setusersstate(`To Watch · Ep ${anime.userprogress ?? anime.list_status?.num_episodes_watched}/${anime.node.num_episodes}`);
          } else if (watchingmap.has(mal_id)) {
            const anime = watchingmap.get(mal_id);
            Setusersstate(`Watching · Ep ${anime.userprogress ?? anime.list_status?.num_episodes_watched}/${ anime.node.num_episodes}`);
          } else if (completedmap.has(mal_id)) {
            const anime = completedmap.get(mal_id);
            Setusersstate(`Completed · Ep ${anime.userprogress ?? anime.list_status?.num_episodes_watched}/${ anime.node.num_episodes}`);
          } else if (onholdmap.has(mal_id)) {
            const anime = onholdmap.get(mal_id);
            Setusersstate(`On Hold · Ep ${anime.userprogress ?? anime.list_status?.num_episodes_watched}/${ anime.node.num_episodes}`);
          } else if (droppedmap.has(mal_id)) {
            const anime = droppedmap.get(mal_id);
            Setusersstate(`Dropped · Ep ${anime.userprogress ?? anime.list_status?.num_episodes_watched}/${anime.node.num_episodes}`);
          } else {
            Setusersstate(
              <>
                <Plus size={36} />
                Add to watchlist
              </>
            );
          }
        }