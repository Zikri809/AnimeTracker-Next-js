import Morenavabr from '@/ComponentsSelf/morenavbar'
import Horizontalcard from '@/ComponentsSelf/animecardhorizontal'
import { useState, useEffect, useRef } from "react";

import { useWindowScroll } from "@uidotdev/usehooks";
import validator from '@/Utility/validation.js'
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useContext } from 'react';
import { Season_context } from '@/pages/_app';


function more(props){
        const [animearr, setAnimearr] = useState([]);
        const [isLoading, setLoading] = useState(true)
        const [currentpage , setpage ] = useState(0)
        const cardref = useRef(null)
        const [{ x, y }, scrollTo] = useWindowScroll();
        const isupdated = useRef(false)
        const isaddedarr = useRef(false)
        let router = useRouter()
        const seasoninfo = useContext(Season_context)
        
        useEffect(()=>{

              setTimeout(validator, 2000)
            
          },[])
      
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
            function scrollhandler(){   
               //console.log( window.innerHeight + Math.ceil(window.scrollY)>=document.body.offsetHeight - 10 )
               //about line below, how it work? dont't know suddenly decided to works along with teh useEffect above
               //  future me dont fix if it ain't broken
     
                if (  window.innerHeight + window.scrollY>=document.body.offsetHeight - 2000 && !isupdated.current && router.isReady){
                        setpage((currentpage)=>currentpage+1)
                        console.log('condition fullfiled',currentpage)
                        isaddedarr.current = false
                        isupdated.current = true
                       
                        window.removeEventListener('scroll', scrollhandler)
                       
                    }
            }
            window.addEventListener('scroll',scrollhandler,false)
        },[currentpage])


        async function fetchapi(currpage, apilink,storageidentifier,storagetimeidentifier){
            try{
                const storeddata = JSON.parse(sessionStorage.getItem('animedata'+storageidentifier))
                if(storeddata!==null){
                    if( !(Math.floor(Date.now()/86400000)-JSON.parse(sessionStorage.getItem('lastupdatetime'+storagetimeidentifier))>=1)){
                        console.log('lastupdatedtime',)
                        if(storeddata.length>animearr.length){
                            console.log('using already stored data',storeddata)
                            console.log('storedata length ', storeddata.length)
                            //console.log('store data page ',storeddata.length/25)
                            setpage(Math.ceil(storeddata.length/24)+1)
                            setAnimearr(storeddata)
                            setLoading(false)
                            return
                        }
                    }
                    else{
                        sessionStorage.removeItem("animedata"+storageidentifier)
                        sessionStorage.removeItem("lastupdatetime"+storagetimeidentifier)
                    }
                   
                }
             
                const response = await fetch(apilink+'&sfw=true&limit=24&page='+currpage)
                const apifeedback = await response.json()
                const top24 = apifeedback.data
                //console.log('apifeedback',apifeedback)
                let tempfilteredSetid =  new Set()
                let tempfiltered = new Set()
                 top24.filter((element)=>{
                   if(!tempfilteredSetid.has(element.mal_id)){
                    tempfiltered.add(element)
                    tempfilteredSetid.add(element.mal_id)
                    return true
                   }
                   return false
                })
                let deconstructed=new Set()
                 tempfiltered.forEach(({status,mal_id,images:{webp:{large_image_url}},season, year,episodes, title,title_english,score,scored_by,popularity,genres })=>(
                    deconstructed.add({status,mal_id,images:{webp:{large_image_url}},season, year,episodes, title,title_english,score,scored_by,popularity,genres })
                    )
                )
                //console.log('deconstructed arr is ',deconstructed)
                if(!isaddedarr.current){
                    isaddedarr.current = true
                    setAnimearr((animearr)=>[...animearr,...deconstructed])
                    const currenttimedays = Math.floor(Date.now()/86400000)
                    sessionStorage.setItem('lastupdatetime'+storagetimeidentifier,JSON.stringify(currenttimedays))
                    sessionStorage.setItem('animedata'+storageidentifier,JSON.stringify([...animearr,...deconstructed]))
                    
                   
                    //console.log('local storage ',JSON.parse(sessionStorage.getItem('animedata')))
                    isupdated.current = false
                }
              
               
                setLoading(false)
                    
                
            }
            catch(error){
               //initla 0 is set buffer as it seems to increment on mount thus let say by chance it does not error will occur thus we change it to 1
               if (currpage==0){
                setpage(1)
               }
               else{
                fetchapi(currentpage, apilink,storageidentifier,storagetimeidentifier)
                console.error(error)
               } 
              
                
            }
        }
        
        useEffect(()=>{
            const apilink = 'https://api.jikan.moe/v4/seasons/'+seasoninfo.current_year+'/'+seasoninfo.current_season+'?'
            const storageidentifier = 'morethisseason'
            const storagetimeidentifier = 'morethisseasontime'
            
            fetchapi(currentpage,apilink,storageidentifier,storagetimeidentifier) 
        },[currentpage])
        console.log('fetching ',animearr)
        console.log('current page is ',currentpage)
        //console.log('params is ',params)
    return(
       <div   className='relative top-0 left-0 font-poppins overflow-hidden m-0   w-screen h-auto  bg-black text-white font-poppins ml-1  antialiased' >
         
            <Morenavabr sectionTitle={'This Season'}/>
             { isLoading?<div className=" w-screen h-screen flex flex-row justify-center items-center "> <div class="loader"></div></div>:
             
             (
                <div  className='relative top-18 lg:grid lg:grid-cols-2 w-screen pb-33 sm:pb-0 lg:grid-rows '>
           
            {animearr.map((element) =>(
                <Link href={'/morethiseseason'+'/'+element.mal_id}>
                    
                    <Horizontalcard  ref={cardref} key={element.mal_id} 
                    mal_id={element.mal_id}
                    image={element.images.webp.large_image_url} 
                    status= {element.status}
                    season={element.season ==null ? ' ':element.season + ' '+ element.year }
                    episodes={element.episodes}
                    title={element.title_english==null?element.title:element.title_english}
                    score={element.score}
                    users={element.scored_by}
                    ranking={element.popularity}
                    genre={element.genres}/>
                </Link>
                
               )   
                )
            }
              
            </div>
             )
             }
            
           
           

       </div>
    )
} export default more