import { Button } from '@/components/ui/button'

import { useRouter } from 'next/router';
import Link from 'next/link'
import { useEffect, useState } from 'react';
import loadFromLocal from '@/Utility/loadfromlocal';

export default function add_to_watchlist_button (props){
    const router = useRouter()
    const [user_state , Setusersstate] = useState( <></>)
    //console.log('id is ')
    useEffect(() => {
        
    
        // Make sure that router is ready and it's client-side rendering
   
        if (typeof window !== 'undefined' && router.isReady) {
            loadFromLocal(router, Setusersstate);
          }
        }, [router.isReady, router.asPath]);
        
    


    return(
        <Link  href={props.to}>{/* to={props.to}*/}
        <Button key={Math.random()+Math.random()} type='button' size='xl' className='p-4 sm:p-5 z-10 sm:text-lg fixed right-0 bottom-15 sm:bottom-0 mb-5 bg-gray-800 mr-5 hover:bg-gray-300 hover:text-black text-blue-100'>
        {user_state}
        </Button>
        </Link>
    )
}