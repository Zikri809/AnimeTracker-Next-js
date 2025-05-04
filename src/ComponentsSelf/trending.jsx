import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import Animecard from './animecard'
import { useState, useEffect } from "react";
import Cardskeleton from "./animecardskelaton";
import Link from 'next/link'
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { QueryClient, useQuery } from "@tanstack/react-query";
function trendSec(){
    const [animearr, setAnimearr] = useState([]);
    
        
        async function fetchapi(){
            try{
                const response = await fetch('https://api.jikan.moe/v4/top/anime?filter=airing')
                const apifeedback = await response.json()
                const top24 = apifeedback.data.slice(0,24)
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
                tempfiltered.forEach(({status,mal_id,images:{webp:{large_image_url}}, year, title,score })=>(
                   deconstructed.add({status,mal_id,images:{webp:{large_image_url}}, year,title,score})
                   )
               )
               return [...deconstructed]
                    
                
            }
            catch(error){
               fetchapi()
                console.error(error)
            }
        }
        const {data: querydata, isLoading} = useQuery({
            queryKey: ['trendingquery'],
            queryFn: ()=>fetchapi(),
            staleTime: 1000 * 60 * 20,
            cacheTime:  1000 * 60 * 30, 
        })
    return(
       <div>
            <div className="flex flex-row  pl-4  pr-4 mb-2 justify-between items-center">
                <div className="border-b-2  pb-2"><h4 className=" scroll-m-20 text-xl font-semibold tracking-tight">Trending Right Now</h4> </div>
                <Link href='/'>
                    <Button className='bg-black border-gray-500' variant="outline" size="icon"><ChevronRight  /></Button>      
                </Link>     
            </div>
            <Carousel className='ml-1 mb-5'
                opts={{
                    skipSnaps: true,
                  }}
            >
                <CarouselContent className="ml-1 md:ml-1 w-56">
                    {isLoading ?  (
                        <>
                            <Cardskeleton/>
                            <Cardskeleton/>
                            <Cardskeleton/>
                            <Cardskeleton/>
                            <Cardskeleton/>
                            <Cardskeleton/>
                            <Cardskeleton/>
                            <Cardskeleton/>
                            <Cardskeleton/>
                            <Cardskeleton/>
                            <Cardskeleton/>
                            <Cardskeleton/>
                        </>
                        
                    
                )
                         :(querydata?.map((element)=>(
                            <Link href='/' > 
                                <CarouselItem key={element.id} className="pl-2 md:pl-4"> <Animecard title={element.title} link={element.images.webp.large_image_url} year={element.year} rating={element.score} status = {element.status}/></CarouselItem>
                            </Link>
                         
                         )))
                    }
                  
                </CarouselContent>
            </Carousel>
        
      
       </div>
    )
} export default trendSec