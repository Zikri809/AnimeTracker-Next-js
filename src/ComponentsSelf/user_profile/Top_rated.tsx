import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect, useState } from "react";
import Animecard from "./anime_card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { getWatchlistMap } from "@/Utility/tracking/watchlist-storage";
import { getTopOrWorstRated } from "@/app/mylist/_lib/mylist-row-view-model";

interface RatedCardProps {
    title: string;
    localStorage_id: string;
    score: boolean;
}

export default function RatedCard({ title, localStorage_id, score }: RatedCardProps) {
    const [top_list, Setlist] = useState<any[]>([])

    useEffect(() => {
        try {
            const map = getWatchlistMap(localStorage_id as any);
            const anime_arr = Array.from(map.values());
            const sorted_anime = getTopOrWorstRated(anime_arr, score);
            const sliced = sorted_anime.slice(0, 10);

            Promise.resolve().then(() => {
                Setlist(sliced);
            });
        } catch (e) {
            console.error('Failed to parse top rated completion list:', e);
        }
    }, [localStorage_id, score])

    return (
        <Card className='bg-neutral-900 border-1 border-neutral-600 overflow-x-auto h-fit'>
            <CardContent className=''>
                <CardTitle className='text-white font-bold'>{title}</CardTitle>
                <div className="text-sm text-neutral-400 mt-4">
                    <Carousel opts={{ skipSnaps: true }}>
                        <CarouselContent className="-ml-2">
                            {top_list.map((element) => {
                                return (
                                    <CarouselItem key={element.node.id + 20} className='basis-auto sm:basis-1/6 pl-2'>
                                        <Animecard
                                            className='shrink-0'
                                            title={element.node.title}
                                            img={element.node.main_picture?.large ?? element.node.main_picture?.medium ?? ''}
                                            user_score={element.list_status?.score ?? 0}
                                        />
                                    </CarouselItem>
                                )
                            })}
                        </CarouselContent>
                    </Carousel>
                </div>
            </CardContent>
        </Card>
    )
}
