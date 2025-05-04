import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import Animecard from './animecard'
import { useState, useEffect, useContext } from "react";
import Cardskeleton from "./animecardskelaton"; 
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Link from 'next/link'
import { QueryClient, useQuery } from "@tanstack/react-query";
import { Season_context } from '@/pages/_app';


function UpcomingSec(props){
    const [isLoading, Setloading] = useState(true)
   const [querydata, Setquerydata ] = useState([])
   useEffect(()=>{
    console.log('error ', props.error)
    Setquerydata(props.data)
    Setloading(props.loading)
   },[])
    return(
       <div className="my-5">
            <div className="flex flex-row  pl-4  pr-4 mb-2 justify-between items-center">
                <div className="border-b-2  pb-2"><h4 className=" scroll-m-20 text-xl font-semibold tracking-tight">Upcoming Season</h4> </div>
                <Link href='/moreupcoming'>
                    <Button className='bg-black border-gray-500' variant="outline" size="icon"><ChevronRight  /></Button>      
                </Link>
              
            </div>
            <Carousel className='ml-1 mb-5'
                opts={{
                    skipSnaps: true,
                  }}
            >
                <CarouselContent className="ml-1 md:ml-1 w-56">
                    {isLoading  ?  (
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
                            <Link href={'/'+element.mal_id} >{/*to={'/'+element.mal_id} */}
                                <CarouselItem key={element.id} className="pl-2 md:pl-4"> <Animecard title={element.title} link={element.images.webp.large_image_url} year={element.year} rating={element.score} status = {element.status}/></CarouselItem>
                            </Link> 
                         )))
                    }
                  
                </CarouselContent>
            </Carousel>
      
       </div>
    )
} export default UpcomingSec;