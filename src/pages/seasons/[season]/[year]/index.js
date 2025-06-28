import Morenavabr from '@/ComponentsSelf/morenavbar'
import Horizontalcard from '@/ComponentsSelf/animecardhorizontal'
import { useState, useEffect, useRef } from "react";

import { useWindowScroll } from "@uidotdev/usehooks";

import { useRouter } from 'next/router';
import Link from 'next/link';
import { useContext } from 'react';
import { Season_context } from '@/pages/_app';
import seasonaldata from '@/Utility/seasonaldata';
import scrollsaver from '@/Utility/ScrollSaver';
import extended_season_data from '@/Utility/seasonal_carousel/extended_season_data';
import onlythis_season from '@/Utility/seasonal_carousel/onlythisseason';
import top_score from '@/Utility/filter/top_score';










export async function getStaticPaths (){
   const seasonal_data = seasonaldata()
  const {past_4_season, future_4_season} = extended_season_data()
   const all_season = [
            ...past_4_season, 
            {season: seasonal_data.past_season,year: seasonal_data.past_year},
            {season: seasonal_data.current_season,year: seasonal_data.current_year},
            {season: seasonal_data.upcoming_season,year: seasonal_data.upcoming_year},
            ...future_4_season
        ]
  console.log(past_4_season , future_4_season)
  let paths = []

  //generate all possible paths
  for(const element of all_season){
    paths.push(
      {
        params: {
          year: element.year.toString(),
          season: element.season
        }
      }
    )
  }

  return{
    paths: paths,
    fallback: false
  }
    
  
}

export const getStaticProps = async ({params}) =>{
  const {year, season} = params
   const seasoninfo = seasonaldata()
   const fields='main_picture,status,start_season,num_episodes,title,alternative_titles,mean,num_scoring_users,popularity,genres'
   const offset=0
   let data =[]
  try{
        const result = await fetch (`https://api.myanimelist.net/v2/anime/season/${year}/${season}?sort=descending&limit=500&offset=${offset}&fields=${fields}`,{
            method: 'GET',
            headers:{
               'X-MAL-CLIENT-ID': process.env.Client_ID,
            }
        })
        if(!result.ok){
            throw new Error(`HTTP ${result.status}`)
        }
        data = await result.json()
        data = top_score(data.data)
    }
    catch(error){
        console.log('error fetching data')


    }
  let revalidate_time=43200
  return {
      props:{
        seasonaldata : data,
        year: year,
        season: season
        

      },
      revalidate:revalidate_time //12 hours  in seconds
    }
}


function more({seasonaldata,year,season}){
        const [animearr, setAnimearr] = useState([]);
        const [isLoading, setLoading] = useState(false)
        const [currentpagearr , setpagearr ] = useState(30)
        const is_scrollrestored = useRef(false)
        const is_arrrestored = useRef(false)
        const cardref = useRef(null)
        const [{ x, y }, scrollTo] = useWindowScroll();
        const isupdated = useRef(false)
        const isaddedarr = useRef(false)
        const [plantowatchmap, Setplantowatchmap] =useState(new Map())
        const [watchingmap, Setwatchingmap] =useState(new Map())
        const [completedmap, Setcompletedmap] =useState(new Map())
        const [onholdmap, Setonholdmap] =useState(new Map())
        const [droppedmap, Setdroppedmap] =useState(new Map())
            
        let router = useRouter()
        const seasoninfo = useContext(Season_context)
        
        useEffect(()=>{
                //console.log('api data is ',seasonaldata)
              Setplantowatchmap(new Map(JSON.parse(localStorage.getItem('PlanToWatch'))))
              Setwatchingmap (new Map(JSON.parse(localStorage.getItem('Watching'))))
              Setcompletedmap (new Map(JSON.parse(localStorage.getItem('Completed'))))
              Setonholdmap (new Map(JSON.parse(localStorage.getItem('OnHold'))))
              Setdroppedmap (new Map(JSON.parse(localStorage.getItem('Dropped'))))
              
            
          },[])
          useEffect(()=>{
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight +100;
            const savedY = sessionStorage.getItem('scrollY');
            console.log('mxscroll check is ',savedY<maxScroll)
                if (savedY && savedY<=maxScroll && !is_scrollrestored.current) {
                  is_scrollrestored.current = true
                  window.scrollTo(0, parseInt(savedY));
                }
          },[currentpagearr,animearr])
        

        
          useEffect(() => {
            setAnimearr(seasonaldata)
             if(sessionStorage.getItem('slicearr')!=undefined ) {
              setpagearr(parseInt(sessionStorage.getItem('slicearr')))
              isupdated.current =true
            
            }

        },[])
        //in this function it has its own useefect and needs a router
        scrollsaver(router)
         useEffect(()=>{
            function scrollhandler(){   
               //console.log( window.innerHeight + Math.ceil(window.scrollY)>=document.body.offsetHeight - 10 )
               //about line below, how it work? dont't know suddenly decided to works along with teh useEffect above
               //  future me dont fix if it ain't broken
     
                if (  window.innerHeight + window.scrollY>=document.body.offsetHeight - 200 && isupdated.current && router.isReady && (currentpagearr<seasonaldata.length) ){
                        const addedpage = currentpagearr +30
                        setpagearr(addedpage)
                        console.log('added page is ',addedpage)
                        console.log('current page is ',currentpagearr)
                        sessionStorage.setItem('slicearr',(addedpage))
                        console.log('condition fullfiled',currentpagearr)
                        isupdated.current = true
                       
                        //window.removeEventListener('scroll', scrollhandler)
                       
                    }
            }
            window.addEventListener('scroll',scrollhandler,false)
             return() =>{
               window.removeEventListener('scroll', scrollhandler)
            }
        },[currentpagearr])
      
        
 useEffect(()=>{
            
           
            isupdated.current = true 
  
        },[currentpagearr])
        
    return(
       <div  className='relative top-0 left-0 font-poppins overflow-hidden m-0   w-screen h-auto  bg-black text-white font-poppins ml-1  antialiased' >
         
            <Morenavabr sectionTitle={`${season.split('_').map(word => word[0].toUpperCase() + word.slice(1)).join(' ')}, ${year}`}/>
             { isLoading ?<div className=" w-screen h-screen flex flex-row justify-center items-center "> <div class="loader"></div></div>:
             
             (
                <div  className='relative top-18 lg:grid lg:grid-cols-2 w-screen pb-33 sm:pb-0 lg:grid-rows '>
           
            {animearr.slice(0,currentpagearr).map((element) =>(
                <Link  href={`/seasons/${season}/${year}/${element.node.id}`}>
                    
                    <Horizontalcard  ref={cardref} key={element.node.id}
                    addstatus={plantowatchmap.has(element.node.id) || watchingmap.has(element.node.id) || completedmap.has(element.node.id) || onholdmap.has(element.node.id) || droppedmap.has(element.node.id)} 
                    mal_id={element.node.id}
                    image={element.node.main_picture.large==undefined?'':element.node.main_picture.large} 
                    status= {element.node.status.split('_').map(word => word[0].toUpperCase() + word.slice(1)).join(' ')}
                    season={element.node.season ==null ? ' ':element.node.season + ' '+ element.node.year }
                    episodes={element.node.num_episodes}
                   title={element.node.alternative_titles.en==''?element.node.title:element.node.alternative_titles.en}
                    score={element.node.mean}
                    users={element.node.num_scoring_users}
                    ranking={element.node.popularity}
                    genre={element.node.genres}/>
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