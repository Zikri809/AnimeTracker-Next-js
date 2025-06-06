//import seasonal_data from "@/Utility/seasonal_carousel/season_fetch"
import Seasonal_card from "@/ComponentsSelf/carousel/seasonal_card"
import { Carousel,CarouselContent,CarouselItem } from "@/components/ui/carousel"
//import { useEffect, useState } from "react"
import Link from "next/link"
export default function season_carousel(props){
  
    const data = props.data
    
    //data = Promise.all(data)
    //Setdata(data)
   

//console.log('data is ',data)
    return(
        <div>
            <div className="flex flex-row  pl-4  pr-6 mb-2 justify-between items-center">
                <div className="border-b-2  pb-2"><h4 className=" scroll-m-20 text-xl font-semibold tracking-tight">Seasons  </h4> </div>       
            </div>
            <Carousel  className='ml-1 mb-5' opts={{
                        skipSnaps: true,
                    }}>
                <CarouselContent className="ml-0 md:ml-0 last:mr-2">
                    {
                            true? (
                                data.season_anime?.map((element,index)=>(
                                    <Link href={`/seasons/${data.seasonal_data[index].season}/${data.seasonal_data[index].year}`}>
                                        <CarouselItem key={index} className="basis-auto flex-shrink-0 pl-3 md:pl-5 ">
                                            <Seasonal_card anime_data={element} seasonal_data={data.seasonal_data[index]} 
                                            bg={data.seasonal_data[index].season=='fall' ? '#b91c1c66':(data.seasonal_data[index].season=='winter'?'#1d4ed866':
                                                (data.seasonal_data[index].season=='summer'?'#c2410c66':'#15803d66')
                                            )}>
                                            
                                            </Seasonal_card>
                                        </CarouselItem>
                                    </Link>
                                    
                                    
                                ))
                            ): <></>
                        }
                </CarouselContent>
            </Carousel>

        </div>
     
           
           
       
    )
}

