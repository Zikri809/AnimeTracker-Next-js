
import { useContext, useState } from 'react'
import Nav from '@/ComponentsSelf/navbar.jsx'
import LastSeason from '@/ComponentsSelf/LastSeason.jsx'
import { CarouselDemo } from '@/ComponentsSelf/carousel.jsx'
import  ThisSeasonSec from '@/ComponentsSelf/ThisSeasonSec.jsx'
import UpcomingSec from '@/ComponentsSelf/Upcoming.jsx'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect, useRef } from "react"
import Link from 'next/link'
import { useRouter } from 'next/router' //supposed to import useNavigate also supposed to use useRouter by next
import checkadder from '@/Utility/checkadder.js'
import validator from '@/Utility/validation.js'
import { Season_context } from '@/pages/_app'
import dynamic from "next/dynamic";





async function season_fetch(season,year){
  try{
   
    const response = await fetch('https://api.jikan.moe/v4/seasons/'+year+'/'+season+'?')
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const apifeedback = await response.json()
    const top24 = apifeedback.data.slice(0,24)
    //console.log('api response is ',top24)
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
     tempfiltered.forEach(({status,mal_id,images:{webp:{large_image_url}}, year, title,score})=>(
        deconstructed.add({status,mal_id,images:{webp:{large_image_url}}, year,title,score})
        )
    )
   
    return {
            querydata : [...deconstructed],
            isloading : false,
            error: false
        }
    }
   
        
catch(error){
    console.error(error)
    return {
            querydata : [],
            isloading : true,
            error : true
        }

}
}
async function apifetch(){
    
  try {
    const apiresponse = await fetch('https://api.jikan.moe/v4/top/anime?type=tv&filter=airing&sfw=true&limit=5');
    console.log('API request initiated');
    
    if (!apiresponse.ok) {
      throw new Error(`API request failed with status: ${apiresponse.status}`);
    }
  
    const responsedata = await apiresponse.json();
    const animedata = responsedata.data; // Get the array of anime data
    
    // Efficient mapping and returning anime data
    const deconstructed = animedata.map(({ images: { webp: { large_image_url } }, title, genres, mal_id }) => ({
      images: { webp: { large_image_url } },
      title,
      genres,
      mal_id
    }));
    let filtered =[]
    for(let i =0 ; i<deconstructed.length; i++){
      let dupe = false
      for(let x =0 ; x<filtered.length;x++){
        if(filtered[x].mal_id==deconstructed[i].mal_id){
          dupe = true
          break
        }
        }
        if(!dupe){
          filtered.push(deconstructed[i])
      }
    }
    console.log('Carousel API fetch successful', filtered);
    
    return {
      querydata: filtered,
      isloading: false,
      error: false,
    }
  }
    catch{
      return {
        querydata : [],
        isloading : true,
        error : true
    }
    }
  }
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

export const getStaticProps = async () =>{
  
  const dateobject = new Date()
  let current_month = dateobject.getMonth()+1
  let current_year = dateobject.getFullYear()
  let past_year = 0
  let upcoming_year =0
  const seasons = ['winter','spring', 'summer', 'fall']
  let current_season
  if(current_month>=1 && current_month<=3){
     current_season = seasons[0]
  }
  else if(current_month>=4 && current_month<=6){
     current_season= seasons[1]
  }
  else if(current_month>=7 && current_month<=9){
     current_season = seasons[2]
  }
  else{
     current_season = seasons[3]
  }
  const past_season_funct = (seasons, current_season,current_year) =>{
    if(seasons.indexOf(current_season)==0){
      past_year = current_year-1
      return seasons[seasons.length-1]
    }
    else{
      past_year = current_year
      return seasons[seasons.indexOf(current_season)-1]
    }
  }
  
  const upcoming_season_funct = (seasons, current_season,current_year) =>{
    if(seasons.indexOf(current_season) == seasons.length-1){
      upcoming_year = current_year+1
      return seasons[0]
    }
    else{
      upcoming_year = current_year
      return seasons[seasons.indexOf(current_season)+1]
    }
  }
  
  const past_year_funct = (seasons, current_season,current_year) =>{
    if(seasons.indexOf(current_season)==0){
      return past_year = current_year-1
    
    }
    else{
      return past_year = current_year
     
    }
  }
  
  const upcoming_year_funct = (seasons, current_season,current_year) =>{
    if(seasons.indexOf(current_season) == seasons.length-1){
      return upcoming_year = current_year+1
  
    }
    else{
      return upcoming_year = current_year
     
    }
  }

  
  const past_season = past_season_funct(seasons, current_season)
  const upcoming_season = upcoming_season_funct(seasons,current_season)
  past_year = past_year_funct(seasons,current_season,current_year)
  upcoming_year = upcoming_year_funct(seasons,current_season,current_year)


    const data1 = await season_fetch(current_season,current_year)
    const data2 = await season_fetch(past_season,past_year)
    const data3 = await season_fetch(upcoming_season,upcoming_year)
    sleep(1100)
    const carouseldata = await apifetch()

    return {
      props:{
        thisseason : data1,
        pastSeason : data2,
        upcomingSeason : data3,
        carouseldata : carouseldata

      },
      revalidate: 43200 //12 hours  in seconds
    }
  
}



export default function Home({thisseason,pastSeason,upcomingSeason,carouseldata}) {

  const navsearchref = useRef([])
  const navbuttonref = useRef([])
  const [searchval, Setsearchval] = useState(' ')
  const seasoninfo = useContext(Season_context)
  const router = useRouter()
  
 


useEffect(()=>{
 
  if(!router.isReady) return
  const navsearchbar = navsearchref.current
  const navbutton = navbuttonref.current


  
  navbutton.addEventListener('click',searchhandler)
 
  window.addEventListener('keydown',enterhandler)

  function enterhandler(e){
   if(e.key =="Enter"){
    searchhandler()
    
   }
  }
  
  function searchhandler(){
    Setsearchval(inputsearch.value)
   
    if(inputsearch.value!=''){
      router.push('/search/'+inputsearch.value)
    }
  else if (navsearchbar.value!=''){
    router.push(navsearchbar.value.length==0?'/':'/search/'+navsearchbar.value)
  }else {
    router.push('/search/')
  }

  }

  sessionStorage.setItem('morescroll',JSON.stringify(0))
  sessionStorage.removeItem("animedatasearch")
  sessionStorage.removeItem("lastupdatetimesearch")
  sessionStorage.setItem('activetab','Plan To Watch')
  sessionStorage.setItem('scrollY', window.scrollY)
 
 

  if(localStorage.getItem('Watching')==null){
    const Watching = new Map()
    localStorage.setItem('Watching',JSON.stringify([...Watching]))
}
if(localStorage.getItem('Completed')==null){
  const Completed = new Map()
  localStorage.setItem('Completed',JSON.stringify([...Completed]))
}
  if(localStorage.getItem('PlanToWatch')==null){
    const PlanToWatch = new Map()
    localStorage.setItem('PlanToWatch',JSON.stringify([...PlanToWatch]))
}
  if(localStorage.getItem('OnHold')==null){
    const OnHold = new Map()
    localStorage.setItem('OnHold',JSON.stringify([...OnHold]))
}
  if(localStorage.getItem('Dropped')==null){
    const Dropped = new Map()
    localStorage.setItem('Dropped',JSON.stringify([...Dropped]))
}
  
return () =>{
  navbutton.removeEventListener('click',searchhandler)
  
  window.removeEventListener('keydown',enterhandler)
}
},[router.isReady])


useEffect(()=>{
  checkadder(seasoninfo).then(
    setTimeout(validator, 2000)
  )
},[])

//the issue with search bar causing freeze because we cant have
//body tag in server component
//causes mismatch client hydration on the server
//note to self starting now use dive for all
//spent 1 whole day only to know i cant use body tag on server component
return (
 <div className='relative top-0 left-0  overflow-x-clip m-0   w-[100%] h-fit pb-13  bg-black text-white font-poppins my-1 ' >
      
      <Nav searchref={navsearchref} buttonref={navbuttonref}  />
     
     
      
      <CarouselDemo data={carouseldata.querydata} />
      <ThisSeasonSec data={thisseason.querydata} loading={thisseason.isloading} error={thisseason.error}/>
      <LastSeason className='' data={pastSeason.querydata} loading={pastSeason.isloading} error={pastSeason.error}/>
      <UpcomingSec data={upcomingSeason.querydata} loading={upcomingSeason.isloading} error={upcomingSeason.error}/>
      
 </div>
)
}
