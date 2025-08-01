//this is a serach result page
'use client'
import Navbar from '@/ComponentsSelf/searchnavbar.jsx'

import Horizontalcard from '@/ComponentsSelf/animecardhorizontal.jsx'
import { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useWindowScroll } from "@uidotdev/usehooks";


export default function searchpage(){
    const [animearr, setAnimearr] = useState([]);
        const [isLoading, setLoading] = useState(true)
        const [currentpage , setpage ] = useState(1)
        const isupdated = useRef(false)
        const isaddedarr = useRef(false)
        const [hasScrolled, setHasScrolled] = useState(false);
        const [searchtarget, Set_search_target] = useState(null)
        const [plantowatchmap, Setplantowatchmap] =useState(new Map())
        const [watchingmap, Setwatchingmap] =useState(new Map())
        const [completedmap, Setcompletedmap] =useState(new Map())
        const [onholdmap, Setonholdmap] =useState(new Map())
        const [droppedmap, Setdroppedmap] =useState(new Map())

        const router = useRouter()
        function clearstate(inputval){
            setpage(1)
            setLoading(true)
            setHasScrolled(false)
            setAnimearr([])
            Set_search_target(inputval)
            sessionStorage.removeItem('animedatasearch')
            isaddedarr.current=false
            isupdated.current=false
        }
        
        useEffect(() => {
            const handleRouteChangeStart = () => {
              sessionStorage.setItem('scrollY', window.scrollY);
            };
            router.events.on('routeChangeStart', handleRouteChangeStart);
         
            return () => {
                router.events.off('routeChangeStart', handleRouteChangeStart);
               
              };
        },[])
         
        useEffect(()=>{
            if(!isLoading){
            const savedY = sessionStorage.getItem('scrollY');
                if (savedY) {
                  window.scrollTo(0, parseInt(savedY));
                }}
        },[isLoading])

        useEffect(()=>{
            
            },[])
        useEffect(()=>{
            function scrollhandler(){ 
                console.log('scroll event working')
                 
               if (  window.innerHeight + window.scrollY>=document.body.offsetHeight - 2000 && !isupdated.current){
                        setpage((currentpage)=>currentpage+1)
                        //console.log('condition fullfiled',currentpage)
                        isaddedarr.current = false
                        isupdated.current = true
                       
                        window.removeEventListener('scroll', scrollhandler)
                       
                    }
            }
            window.addEventListener('scroll',scrollhandler)
            console.log('scroll event added')
        },[currentpage])
        async function fetchapi(currpage){
            try{
                const storeddata = JSON.parse(sessionStorage.getItem('animedatasearch'))
                if(storeddata!==null){
                    if( !(Math.floor(Date.now()/86400000)-JSON.parse(sessionStorage.getItem('lastupdatetimesearch'))>=1)){
                        //console.log('lastupdatedtime',)
                        if(storeddata.length>animearr.length){
                            console.log('using already stored data',storeddata)
                            setpage(Math.ceil(storeddata.length/24)+1)
                            setAnimearr(storeddata)
                            return
                        }
                    }
                    else{
                        sessionStorage.removeItem("animedatasearch")
                        sessionStorage.removeItem("lastupdatetimesearch")
                    }
                }  
                //console.log('apilinks https://api.jikan.moe/v4/anime?letter&limit=24&sfw=true&page='+currpage+'&q='+(searchtarget==null?router.query.title:searchtarget))
                const response = await fetch('https://api.jikan.moe/v4/anime?letter&limit=24&sfw=true&page='+currpage+'&q='+(searchtarget==null?router.query.title:searchtarget))
                const apifeedback = await response.json()
                const top24 = apifeedback.data
                //console.log('apifeedback',apifeedback)
                let tempfilteredSetid =  new Set()
                let tempfiltered = new Set()
                let filteredSet = top24.filter((element)=>{
                   if(!tempfilteredSetid.has(element.mal_id)){
                    tempfiltered.add(element)
                    tempfilteredSetid.add(element.mal_id)
                    return true
                   }
                   return false
                })
                let deconstructed=new Set()
                tempfiltered.forEach(({status,mal_id,images:{webp:{large_image_url}},season, year,episodes,title_english,title,score,scored_by,popularity,genres })=>(
                   deconstructed.add({title_english,status,mal_id,images:{webp:{large_image_url}},season, year,episodes, title,score,scored_by,popularity,genres })
                   )
               )
               if(!isaddedarr.current){
                isaddedarr.current = true
                //console.log('api setn anime aree')
                setAnimearr((animearr)=>[...animearr,...deconstructed])
                const currenttimedays = Math.floor(Date.now()/86400000)
               
                sessionStorage.setItem('lastupdatetimesearch',JSON.stringify(currenttimedays))
                sessionStorage.setItem('animedatasearch',JSON.stringify([...animearr,...deconstructed]))
                
               
                //console.log('local storage ',JSON.parse(sessionStorage.getItem('animedata')))
                isupdated.current = false
            }
            setLoading(false)
                    
            //console.log('fetched data from api',top24)
            }
            catch(error){
            
                fetchapi(currentpage,searchtarget)
                console.error(error)
            }
        }
        
        useEffect(()=>{

            fetchapi(currentpage,searchtarget) 
            console.log('refetched triggered')
        },[currentpage,searchtarget])
        //console.log('fetching ',animearr)
        //console.log('current page is ',currentpage)
        useEffect(()=>{
            //console.log('api data is ',seasonaldata)
          Setplantowatchmap(new Map(JSON.parse(localStorage.getItem('PlanToWatch'))))
          Setwatchingmap (new Map(JSON.parse(localStorage.getItem('Watching'))))
          Setcompletedmap (new Map(JSON.parse(localStorage.getItem('Completed'))))
          Setonholdmap (new Map(JSON.parse(localStorage.getItem('OnHold'))))
          Setdroppedmap (new Map(JSON.parse(localStorage.getItem('Dropped'))))
          
        
      },[])
    return(
       < >
            <Navbar set_state={clearstate} searchtitle={router.query.title=='NA'?'Search':router.query.title}/>
            { isLoading?<div className=" w-screen h-screen flex flex-row justify-center items-center "> <div class="loader"></div></div>:<div  className='relative left-0 mb-16 h-fit sm:pb-0 pt-18 lg:grid lg:grid-cols-2 w-screen min-h-screen   lg:grid-rows flex flex-col '>
            {
             ( animearr.length!=0 && router.query.title!='NA'?(animearr.map((element) =>(
              
                    <Link  key={element.mal_id+10} href={'/search/'+router.query.title+'/'+element.mal_id}>
                         <Horizontalcard  key={element.mal_id}
                           mal_id={element.mal_id} 
                    image={element.images.webp.large_image_url} 
                    status= {element.status}
                    season={element.season ==null ? ' ':element.season + ' '+ element.year }
                    episodes={element.episodes}
                    title={element.title_english==null?element.title:element.title_english}
                    score={element.score}
                    users={element.scored_by}
                    ranking={element.popularity}
                    genre={element.genres}
                    addstatus={plantowatchmap.has(element.mal_id) || watchingmap.has(element.mal_id) || completedmap.has(element.mal_id) || onholdmap.has(element.mal_id) || droppedmap.has(element.mal_id)}
                    />
                    
                    </Link>
                   
              
                
               )

                
                    
                )):<div className=' flex m-auto p-0  gap-0 items-center justify-center'>
                       
                        <p className="text-neutral-300 text-base font-bold text-center  ">Your anime journey starts here !</p>
                    </div>)
            }
            </div>}
           
           

       </>
    )
}