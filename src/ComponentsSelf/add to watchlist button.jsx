import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react';
import { useRouter } from 'next/router';
import Link from 'next/link'
import { useEffect, useState } from 'react';

export default function add_to_watchlist_button (props){
    const router = useRouter()
    const [user_state , Setusersstate] = useState( <></>)
    console.log('id is ')
    useEffect(() => {
        function loadFromLocal() {
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
            Setusersstate(`To Watch · Ep ${anime.userprogress}/${anime.episodes == null ? '?' : anime.episodes}`);
          } else if (watchingmap.has(mal_id)) {
            const anime = watchingmap.get(mal_id);
            Setusersstate(`Watching · Ep ${anime.userprogress}/${anime.episodes == null ? '?' : anime.episodes}`);
          } else if (completedmap.has(mal_id)) {
            const anime = completedmap.get(mal_id);
            Setusersstate(`Completed · Ep ${anime.userprogress}/${anime.episodes == null ? '?' : anime.episodes}`);
          } else if (onholdmap.has(mal_id)) {
            const anime = onholdmap.get(mal_id);
            Setusersstate(`On Hold · Ep ${anime.userprogress}/${anime.episodes == null ? '?' : anime.episodes}`);
          } else if (droppedmap.has(mal_id)) {
            const anime = droppedmap.get(mal_id);
            Setusersstate(`Dropped · Ep ${anime.userprogress}/${anime.episodes == null ? '?' : anime.episodes}`);
          } else {
            Setusersstate(
              <>
                <Plus size={36} />
                Add to watchlist
              </>
            );
          }
        }
    
        // Make sure that router is ready and it's client-side rendering
   
        if (typeof window !== 'undefined' && router.isReady) {
            loadFromLocal();
          }
        }, [router.isReady, router.query.id]);
        
    


    return(
        <Link  href={props.to}>{/* to={props.to}*/}
        <Button key={Math.random()+Math.random()} type='button' size='xl' className='p-4 sm:p-5 z-10 sm:text-lg fixed right-0 bottom-15 sm:bottom-0 mb-5 bg-gray-800 mr-5 hover:bg-gray-300 hover:text-black text-blue-100'>
        {user_state}
        </Button>
        </Link>
    )
}