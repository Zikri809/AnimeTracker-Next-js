import React from "react"
import Seasonal_card from "@/ComponentsSelf/carousel/seasonal_card"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import Link from "next/link"

interface SeasonalData {
    season: string;
    year: number | string;
}

interface SeasonCarouselProps {
    data: {
        season_anime?: any[];
        seasonal_data: SeasonalData[];
    };
}

export default function SeasonCarousel(props: SeasonCarouselProps) {
    const data = props.data;

    return (
        <div>
            <div className="flex flex-row pl-4 pr-6 mb-2 justify-between items-center">
                <div className="border-b-2 pb-2">
                    <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">Seasons</h4>
                </div>
            </div>
            <Carousel className='ml-1 mb-5' opts={{ skipSnaps: true }}>
                <CarouselContent className="ml-0 md:ml-0 last:mr-2">
                    {data.season_anime?.map((element, index) => {
                        const seasonal = data.seasonal_data[index];
                        if (!seasonal) return null;

                        const bg = seasonal.season === 'fall'
                            ? '#b91c1c66'
                            : (seasonal.season === 'winter'
                                ? '#1d4ed866'
                                : (seasonal.season === 'summer'
                                    ? '#c2410c66'
                                    : '#15803d66'));

                        return (
                            <Link
                                key={`${seasonal.season}-${seasonal.year}-${index}`}
                                href={`/seasons/${seasonal.season}/${seasonal.year}`}
                            >
                                <CarouselItem className="basis-auto flex-shrink-0 pl-3 md:pl-5">
                                    <Seasonal_card
                                        anime_data={element}
                                        seasonal_data={seasonal}
                                        bg={bg}
                                    />
                                </CarouselItem>
                            </Link>
                        );
                    })}
                </CarouselContent>
            </Carousel>
        </div>
    )
}
