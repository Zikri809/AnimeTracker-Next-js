import { Button } from "@/components/ui/button"
import { ChevronLeft,Copy } from "lucide-react"
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import Link from 'next/link'
import copy from "copy-to-clipboard";
function morenavbar(props){
    const buttonref = useRef(null)
    const iconchange = useRef(null)
    const [refstate, Setrefstate] = useState(false)
    const router = useRouter()

    useEffect(()=>{
        const handleClick = () => {
            copy(props.sectionTitle)
            button.removeEventListener('click', handleClick);
            //console.log(buttonref)
            buttonref.current.innerHTML ='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-check"><path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/></svg>' 
            setTimeout(()=>{
                buttonref.current.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>'
            },1000)
            Setrefstate(!refstate)
          };
          const button = buttonref.current
          button.addEventListener('click', handleClick);
          
    },[refstate])
   
    {router.asPath.split('/')[1]=='morethiseseason' || router.asPath.split('/')[1]=='moreupcoming' || router.asPath.split('/')[1]=='morelastseason'?
        (router.query.hasOwnProperty('relation_id')?'/'+router.asPath.split('/')[1]+'/'+router.query.mal_id:'/'+router.asPath.split('/')[1]):
        (router.query.hasOwnProperty('title')?(router.query.hasOwnProperty('relation_id')?('/search/'+router.query.title+'/'+router.query.mal_id):'/search/'+router.query.title):
        (router.query.hasOwnProperty('mylist_tab')?(router.query.hasOwnProperty('relation_id')?'/mylist/'+router.query.mylist_tab+'/'+router.query.mal_id:'/mylist'):
        (router.query.hasOwnProperty('relation_id')?'/Anime/'+router.query.mal_id:'/')))
        }
//console.log('id is',id)
return (
    <nav className="fixed border-b-1 border-gray-700 z-1000 bg-black w-screen pl-4 h-20 px-2 pr-4 mb-3 top-0 left-0 flex flex-row items-center justify-between">
        <div className="flex  flex-row items-center gap-2 sm:gap-1">
            <Link 
            href={router.query.hasOwnProperty('relation_id')?(router.asPath.split('/').slice(0,-2).join('/')):
                (router.asPath.split('/')[1]=='Anime'?'/':(router.query.hasOwnProperty('mylist_tab')? '/mylist':router.asPath.split('/').slice(0,-1).join('/')))}
            >
            
            <Button className='bg-zinc-800 text-white hover:text-black hover:bg-zinc-400' variant="secondary" size="icon"><ChevronLeft  /></Button> 
            </Link>
            
   
       
        <p  className="line-clamp-1 text-left overflow-hidden text-ellipsis text-2xl ml-2  text-white font-bold ">{props.sectionTitle}</p>
       
        </div>
        
        <Button ref={buttonref} variant="outline" className='ml-2 border-none bg-white hover:bg-gray-300' ><Copy ref={iconchange} className="text-black"/></Button>
       
       
    </nav>
)

} export default morenavbar