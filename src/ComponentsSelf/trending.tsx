import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import Animecard from './animecard'
import React, { useState } from "react";
import Cardskeleton from "./animecardskelaton";
import Link from 'next/link'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { useQuery } from "@tanstack/react-query";

interface TrendingAnime {
    status: string;
    mal_id: number;
    images: {
        webp: {
            large_image_url: string;
        }
    };
    year: number | null;
    title: string;
    score: number | null;
}

export default function TrendSec() {
    async function fetchapi(): Promise<TrendingAnime[]> {
        const response = await fetch('https://api.jikan.moe/v4/top/anime?filter=airing')
        const apifeedback = await response.json()
        const top24 = apifeedback.data.slice(0, 24)

        const tempfilteredSetid = new Set<number>()
        const tempfiltered: any[] = []

        top24.forEach((element: any) => {
            if (!tempfilteredSetid.has(element.mal_id)) {
                tempfiltered.push(element)
                tempfilteredSetid.add(element.mal_id)
            }
        })

        const deconstructed: TrendingAnime[] = []
        tempfiltered.forEach(({ status, mal_id, images: { webp: { large_image_url } }, year, title, score }: any) => {
            deconstructed.push({ status, mal_id, images: { webp: { large_image_url } }, year, title, score })
        })
        return deconstructed
    }

    const { data: querydata, isLoading } = useQuery<TrendingAnime[]>({
        queryKey: ['trendingquery'],
        queryFn: () => fetchapi(),
        staleTime: 1000 * 60 * 20,
    })

    return (
        <div>
            <div className="flex flex-row pl-4 pr-4 mb-2 justify-between items-center">
                <div className="border-b-2 pb-2">
                    <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">Trending Right Now</h4>
                </div>
                <Link href='/'>
                    <Button className='bg-black border-gray-500' variant="outline" size="icon">
                        <ChevronRight />
                    </Button>
                </Link>
            </div>
            <Carousel className='ml-1 mb-5' opts={{ skipSnaps: true }}>
                <CarouselContent className="ml-1 md:ml-1 w-56">
                    {isLoading ? (
                        <>
                            <Cardskeleton />
                            <Cardskeleton />
                            <Cardskeleton />
                            <Cardskeleton />
                            <Cardskeleton />
                            <Cardskeleton />
                            <Cardskeleton />
                            <Cardskeleton />
                            <Cardskeleton />
                            <Cardskeleton />
                            <Cardskeleton />
                            <Cardskeleton />
                        </>
                    ) : (
                        querydata?.map((element) => (
                            <Link key={element.mal_id} href={`/Anime/${element.mal_id}`}>
                                <CarouselItem className="pl-2 md:pl-4">
                                    <Animecard
                                        title={element.title}
                                        link={element.images.webp.large_image_url}
                                        year={element.year}
                                        rating={element.score}
                                        status={element.status}
                                    />
                                </CarouselItem>
                            </Link>
                        ))
                    )}
                </CarouselContent>
            </Carousel>
        </div>
    )
}
