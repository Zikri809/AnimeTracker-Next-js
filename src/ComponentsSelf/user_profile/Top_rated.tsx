import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { useEffect, useState } from "react";
import top_score from "@/Utility/filter/top_score";
import Animecard from "./anime_card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

interface RatedCardProps {
    title: string;
    localStorage_id: string;
    score: boolean;
}

export default function RatedCard({ title, localStorage_id, score }: RatedCardProps) {
    const [top_list, Setlist] = useState<any[]>([])

    useEffect(() => {
        const storedStr = localStorage.getItem(localStorage_id);
        if (!storedStr) return;

        let anime_arr = JSON.parse(storedStr)
        anime_arr = anime_arr.map((element: any) => {
            return element[1]
        })
        const top_anime = top_score(anime_arr)
        const sliced = score ? top_anime.slice(0, 10) : top_anime.slice(top_anime.length - 10, top_anime.length);

        Promise.resolve().then(() => {
            Setlist(sliced);
        });

        console.log('anime arr is ', anime_arr)
    }, [localStorage_id, score])

    console.log('top arr ', top_list)

    return (
        <Card className='bg-neutral-900 border-1 border-neutral-600 overflow-x-auto h-fit'>
            <CardContent className=''>
                <CardTitle className='text-white font-bold'>{title}</CardTitle>
                <CardDescription>
                    <Carousel opts={{ skipSnaps: true }}>
                        <CarouselContent className=" ">
                            {top_list.map((element) => {
                                return (
                                    <CarouselItem key={element.node.id + 20} className='basis-auto sm:basis-1/9 not-first:pl-2'>
                                        <Animecard
                                            className='shrink-0'
                                            title={element.node.title}
                                            img={element.node.main_picture.large}
                                            user_score={element.list_status.score}
                                        />
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
