
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import React from "react"
import Image from "next/image"
function animecard(props){

    return (
    <Card className='bg-zinc-800 p-1 border-none rounded-sm w-40 sm:w-55 hover:bg-zinc-700 h-75 sm:h-90'>
        <CardContent className='truncate p-1 '>

            <Image className="rounded-md mb-2 mx-auto sm:h-70 h-50" loading="lazy" quality={90} height={1000} width={1000} alt={props.title} src={props.link}></Image>
            
            <CardTitle className='text-white text-center truncate mb-2'> {props.title}</CardTitle>
            <CardDescription className='flex sm:flex-nowrap w-full truncate flex-row text-sm items-center flex-wrap  justify-center sm:justify-between'>
            <span className="mr-2 sm:mr-0">{props.rating!=null ? ('⭐'+props.rating):('NA')}</span>
            <span>{props.year}</span>
            <span className="hidden sm:inline-block">{props.status}</span>
            </CardDescription>
            <p className="w-full text-center text-sm text-neutral-500 inline-block sm:hidden">{props.status}</p>
        </CardContent>
    </Card>
    )
    
   
} 
animecard.defaultProps = {
  year : 'NA'
}
export default animecard
