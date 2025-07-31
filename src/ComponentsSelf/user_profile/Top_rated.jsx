import { Card,CardContent,CardTitle,CardDescription } from "@/components/ui/card";
import { useEffect, useState } from "react";
import top_score from "@/Utility/filter/top_score";
import Animecard from "./anime_card";
import { Carousel, CarouselContent,CarouselItem } from "@/components/ui/carousel";
import 'swiper/css'

export default function rated_card({title,localStorage_id,score}){
    const [top_list, Setlist] = useState([])
    useEffect(()=>{
        let anime_arr = JSON.parse(localStorage.getItem(localStorage_id))
        anime_arr = anime_arr.map((element)=>{
            return element[1]
        })
        const top_anime = top_score(anime_arr)
        Setlist(score?top_anime.slice(0,10):top_anime.slice(top_anime.length-10,top_anime.length))
        console.log('anime arr is ',anime_arr)
    },[])
    console.log('top arr ',top_list)
    return(
        <Card className=' bg-neutral-900 border-1 border-neutral-600 overflow-x-auto h-fit '>
            <CardContent className=''>
                <CardTitle className='text-white font-bold '>{title}</CardTitle>
                <CardDescription  >
                    <Carousel opts={{skipSnaps: true}}>
                        <CarouselContent className=" ">
                        {top_list.map((element)=>{
                                    return (
                                    <CarouselItem className='basis-auto sm:basis-1/9 not-first:pl-2 '>
                                        <Animecard className=' shrink-0'      key={element.node.id+20} title={element.node.title} img={element.node.main_picture.large} user_score={element.list_status.score}/>
                                    </CarouselItem>
                                    )
                                })}
                        </CarouselContent>
                    </Carousel>
                
                    
                   
                    
                    
                    
                   
                        
                    
                    
                </CardDescription>
            </CardContent>
        </Card>
    )
}