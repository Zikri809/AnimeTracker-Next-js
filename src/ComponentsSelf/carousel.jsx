import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { ArrowRight } from 'lucide-react';

import Link from "next/link";
import { cn } from "@/lib/utils";
import { GridPattern } from "@/components/magicui/grid-pattern.jsx";
import { Button } from "@/components/ui/button";

import { useState } from "react";
 



export function CarouselDemo(props) {
 React.useEffect(()=>{
  console.log('carousel data ', props.data)
 },[])
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: false })
  )
  
 
  const imagearr = ['https://cdn.myanimelist.net/images/anime/1750/145801l.webp?_gl=1*11kk1f7*_gcl_au*MTM3NDQyODcyNC4xNzQxMTkyNzU4*_ga*MjA0NDg0MTY4Mi4xNzQxMTkyNzU4*_ga_26FEP9527K*MTc0MTE5Mjc1Ni4xLjEuMTc0MTE5MzE1OS4xMi4wLjA.',
    'https://cdn.myanimelist.net/images/anime/1437/115925l.webp',
    'https://cdn.myanimelist.net/images/anime/1091/145945l.webp?_gl=1*1t9umzs*_gcl_au*MTM3NDQyODcyNC4xNzQxMTkyNzU4*_ga*MjA0NDg0MTY4Mi4xNzQxMTkyNzU4*_ga_26FEP9527K*MTc0MTE5Mjc1Ni4xLjEuMTc0MTE5MzA3NC4xNC4wLjA.',
    'https://cdn.myanimelist.net/images/anime/1848/147037l.webp?_gl=1*1degood*_gcl_au*MTM3NDQyODcyNC4xNzQxMTkyNzU4*_ga*MjA0NDg0MTY4Mi4xNzQxMTkyNzU4*_ga_26FEP9527K*MTc0MTE5Mjc1Ni4xLjEuMTc0MTE5MzI5OS40Ni4wLjA.',
    'https://cdn.myanimelist.net/images/anime/1258/147105l.webp',
  ]
  return (
    <div className="h-140 mt-15">
       <div className="relative flex h-[550px] w-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-black border-transparent">
       <GridPattern
        squares={[
          [4, 4],
          [5, 1],
          [8, 2],
          [5, 3],
          [5, 5],
          [10, 10],
          [12, 15],
          [15, 10],
          [10, 15],
          [15, 10],
          [10, 15],
          [15, 10],
        ]}
        className={cn(
          "[mask-image:radial-gradient(1000px_circle_at_center,white,transparent)]",
          "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12",
        )}
      />
       </div>
      <Carousel className="aboslute z-1 top-[-530px] border-none bg-transparent mb-3 w-full mx-auto"  plugins={[plugin.current]}>
      <CarouselContent className='border-none' >
        {props.data.map((object, index) => (
          <CarouselItem key={index} className='border-none'>
            <div className="p-2 border-none">
              <Card className=" bg-transparent border-none p-0 h-120 flex flex-row justify-center rounded-md overflow-clip border-black">
                 <img className='h-120 w-fit rounded-md' src={object.images.webp.large_image_url}></img>
                 <div className="fixed top-0  h-145 w-110 border-0 rounded-base bg-transprent bg-gradient-to-t from-black via-transparent to-transparent">

                  <div className="relative top-82  z-2 flex flex-col gap-4 items-center">
                       <div className="line-clamp-1 text-center overflow-hidden text-ellipsis w-85 text-2xl text-white">{object.title}</div>
                       <div className="flex flex-row gap-4  rounded-md text-white">
                        {
                          object.genres.slice(0, 3).map((genre, index) => (
                            <div key={index}>{genre.name}</div>
                          ))
                          
                        }
                       </div>
                       <div className="flex flex-row gap-4">
                        <Link href={'/Anime/'+object.mal_id}><Button className='hover:bg-white hover:text-black w-35 h-10'><ArrowRight size={24} />More Details</Button></Link>
                        <Link  href={'/Anime/'+object.mal_id+'/tracking'}><Button className='hover:bg-black hover:text-white w-35 h-10 backdrop-blur-2xl bg-transparent '>+ Add To Mylist</Button></Link>
                         
                       </div>
                  </div>
                 </div>
                 
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  
    </div>
   
    
  )
}

