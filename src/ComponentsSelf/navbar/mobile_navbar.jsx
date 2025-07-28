
import Link from "next/link"
import { House } from 'lucide-react';
import { Search } from 'lucide-react';
import { List } from 'lucide-react';
import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
export default function mobile_navbar(props){
    const buttonref0 = useRef()
    const buttonref1 = useRef()
    const buttonref2 = useRef()
    const router = useRouter()
    const btnarr = [buttonref0,buttonref1,buttonref2]
    function mobile_nabv_bar_active(){
        //if (!router.isReady) return 
        for(let i = 0 ; i<3 ; i++){
            btnarr[i].current.style.color = '#9E9E9E'
        }
        
        const path = router.asPath.split('/')[1]
        if(path=='' || path =='Anime' || path == 'morelastseason' || path=='morethiseseason' || path == 'moreupcoming' || path== 'seasons'){
            buttonref0.current.style.color = '#ffffff'
        }
        else if (path == 'search'){
            buttonref1.current.style.color =  '#ffffff'
        }
        else{
            buttonref2.current.style.color =  '#ffffff'
        }
    }
    function resetState(){
        //this reset the sort option for seasonal pages
        console.log('reset soort has occured')
        sessionStorage.removeItem('sort_type')
        sessionStorage.removeItem('sorted_anime')
    }
    useEffect(()=>{
        mobile_nabv_bar_active()
    },[router.asPath])

    
    return (
        <nav className="fixed overflow-x-hidden w-screen border-t-1 border-gray-700 bg-black rounded-t-none py-3 z-10000 sm:hidden bottom-0 left-0 flex flex-row  justify-around">
            
            
            <div ref={buttonref0} className="flex items-center flex-col text-white text-xs">
                <Link onClick={resetState} className="flex items-center flex-col" href={'/'}>
                <House className="w-5 h-5 mb-1" />
                <div>Home</div>
                </Link>
                
            </div>
            <div ref={buttonref1} className=" text-white text-xs">
                <Link onClick={resetState} className="flex items-center flex-col" href={'/search/NA'}>
                <Search className="w-5 h-5 mb-1" />
                <div>Search</div>
                </Link>
                
            </div>
            <div ref={buttonref2} className="flex items-center flex-col text-white text-xs">
                <Link onClick={resetState} className="flex items-center flex-col" href={'/mylist'}>
                <List className="w-5 h-5 mb-1" />
                <div>MyList</div>
                </Link>
                
            </div>
            
            
            
           
        </nav>
    )
}