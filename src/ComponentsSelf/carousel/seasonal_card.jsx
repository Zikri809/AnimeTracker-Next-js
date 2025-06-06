
import { Card,CardContent } from "@/components/ui/card"
import Image from "next/image"
import React from "react"
export default function seasonal_card(props){
    const object = props.anime_data
    const seasonal_data = props.seasonal_data
    //console.log ('anime data is ',object)
    //orange-700/40
    return(
        <Card className=' rounded-sm w-40 sm:w-55 h-65 sm:h-90 p-0 m-0 border-0'>
            <CardContent className='p-0 m-0 grid grid-rows-1 grid-cols-1 border-0'>
                 <Image className=" col-start-1 row-start-1 rounded-sm h-65 sm:h-90 w-40 sm:w-55 object-cover" loading="lazy" src={object.node?.main_picture.large==undefined?'':object.node?.main_picture.large} quality={90} height={1000} width={1000} alt={seasonal_data.year +' '+seasonal_data.year}></Image>
                 <div style={{ backgroundImage: `linear-gradient(to top, ${props.bg}, transparent, transparent)`}} className={`font-bold text-base pb-6 col-start-1 row-start-1 text-white flex rounded-sm h-65 sm:h-90 w-40 sm:w-55 border-0  flex-col justify-end items-center `}>
                    <p>{seasonal_data.season.split('_').map(word => word[0].toUpperCase() + word.slice(1)).join(' ')+" • "+seasonal_data.year}</p>
                  
                 </div>
            </CardContent>
        </Card>
    )
}