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
import Image from "next/image";
import { useState } from "react";
 



export function CarouselDemo(props) {
  const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: false })
  )
  
 

  return (
    <div className="h-48 md:h-64 mt-0 mb-12">
       <div className="fixed flex h-fullw-full flex-col items-center justify-center overflow-hidden rounded-lg border bg-black border-transparent">
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
      <Carousel className="aboslute z-1  border-none bg-transparent mb-3 w-full mx-auto"  plugins={[plugin.current]}>
      <CarouselContent className='border-none' >
        {props.data.map((element, index) => (
          
          <CarouselItem key={index} className='border-none'>
            <div className="py-2  border-none">
              <Link href={`/Anime/${element.idMal}`}>
              <Card className=" bg-transparent border-none rounded-none p-0 h-55 md:h-64 flex flex-row justify-center  overflow-clip border-black">
                 <Image className='h-full w-full object-cover object-center 'width={500} height={500} quality={100} priority={true} alt={element.title.english ?? element.title.romaji} src={element.bannerImage}></Image>
                 <div className="fixed top-0 px-6 h-full w-full border-0  bg-transprent bg-gradient-to-tr from-black via-neutral-900/50 to-transparent">

                  <div className="relative left-0 top-30 md:top-35 w-full h-full z-2 flex flex-col gap-0 items-center">
                       <div className="text-white text-lg md:text-xl m-0 h-fit text-left w-full">#{index+1} Spotlight</div>
                       <div className="line-clamp-1 mb-1 text-left font-bold overflow-hidden text-ellipsis h-fit w-full text-2xl md:text-4xl text-white">{element.title.english ?? element.title.romaji}</div>
                       <div className="flex flex-row gap-3 w-full rounded-md text-white md:text-lg">
                        {
                          element.genres.slice(0, 3).map((genre, index) => (
                            <div className="px-4 py-1 rounded-xl bg-neutral-800" key={index}>{genre}</div>
                          ))
                          
                        }
                       </div>
                    
                  </div>
                 </div>
                 
              </Card>
          
             </Link>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  
    </div>
   
    
  )
}

