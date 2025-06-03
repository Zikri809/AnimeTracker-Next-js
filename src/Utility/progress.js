
export default function progress (mal_id){
    const plantowatchmap = new Map(JSON.parse(localStorage.getItem('PlanToWatch')));
          const watchingmap = new Map(JSON.parse(localStorage.getItem('Watching')));
          const completedmap = new Map(JSON.parse(localStorage.getItem('Completed')));
          const onholdmap = new Map(JSON.parse(localStorage.getItem('OnHold')));
          const droppedmap = new Map(JSON.parse(localStorage.getItem('Dropped')));
         
    
          
    
          // Check each map and update the button state accordingly
          if (plantowatchmap.has(mal_id)) {
            const anime = plantowatchmap.get(mal_id);
            return(anime.userprogress ?? anime.list_status?.num_episodes_watched);
          } else if (watchingmap.has(mal_id)) {
            const anime = watchingmap.get(mal_id);
            return(anime.userprogress ?? anime.list_status?.num_episodes_watched);
          } else if (completedmap.has(mal_id)) {
            const anime = completedmap.get(mal_id);
           return(anime.userprogress ?? anime.list_status?.num_episodes_watched);
          } else if (onholdmap.has(mal_id)) {
            const anime = onholdmap.get(mal_id);
            return(anime.userprogress ?? anime.list_status?.num_episodes_watched);
          } else  {
            const anime = droppedmap.get(mal_id);
            return(anime.userprogress ?? anime.list_status?.num_episodes_watched);
          } 
}