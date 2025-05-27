export default function last_click(btnref,api,api2,router){
    const plantowatchmap = new Map(JSON.parse(localStorage.getItem('PlanToWatch')))
        const watchingmap = new Map(JSON.parse(localStorage.getItem('Watching')))
        const  completedmap = new Map(JSON.parse(localStorage.getItem('Completed')))
        const onholdmap = new Map(JSON.parse(localStorage.getItem('OnHold')))
        const droppedmap = new Map(JSON.parse(localStorage.getItem('Dropped')))
        const mal_id = parseInt(router.query.relation_id ?? router.query.mal_id)
        console.log('mal_id in lastclick ',mal_id)
        //console.log('params is ', id)
        //console.log('button checker id is ',mal_id)
        //console.log(plantowatchmap)
        //console.log('TURHT IS ',plantowatchmap.has(mal_id))

        //api is api for the progress scroll
        //api2 is api for score scroll
        if(plantowatchmap.has(mal_id)){
            const anime = plantowatchmap.get(mal_id)
            console.log('found in local ',anime)
            btnref.current[2].click()
            api.scrollTo(anime.list_status.num_episodes_watched);
            api2.scrollTo(anime.list_status.score)
            
        }
        else if (watchingmap.has(mal_id)){
            const anime = watchingmap.get(mal_id)
            console.log('found in local ',anime)
            btnref.current[0].click()
            api.scrollTo(anime.list_status.num_episodes_watched);
            api2.scrollTo(anime.list_status.score)
            
        }
        else if (completedmap.has(mal_id)){
            const anime = completedmap.get(mal_id)
            console.log('found in local ',anime)
            btnref.current[1].click()
            api.scrollTo(anime.list_status.num_episodes_watched);
            api2.scrollTo(anime.list_status.score)
           
        }
        else if(onholdmap.has(mal_id)){
            const anime = onholdmap.get(mal_id)
            console.log('found in local ',anime)
            btnref.current[3].click()
            api.scrollTo(anime.list_status.num_episodes_watched);
            api2.scrollTo(anime.list_status.score)
          
        }
        else if(droppedmap.has(mal_id)){
            const anime = droppedmap.get(mal_id)
            console.log('found in local ',anime)
            btnref.current[4].click()
            api.scrollTo(anime.list_status.num_episodes_watched);
            api2.scrollTo(anime.list_status.score)
        } 
        else{
            //do nothing
        }
      }