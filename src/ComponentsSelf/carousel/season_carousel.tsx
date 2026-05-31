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
        <section className="mb-8">
            <div className="mb-3 flex flex-row items-end justify-between px-4 sm:px-6">
                <div className="space-y-2">
                    <h4 className="scroll-m-20 text-xl font-semibold tracking-tight text-white">Seasons</h4>
                    <div className="section-title-rule" />
                </div>
            </div>
            <Carousel className='mb-5' opts={{ skipSnaps: true }}>
                <CarouselContent className="ml-2 pr-4 md:ml-4">
                    {data.season_anime?.map((element, index) => {
                        const seasonal = data.seasonal_data[index];
                        if (!seasonal || !element) return null;

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
                                <CarouselItem className="basis-auto flex-shrink-0 pl-2 md:pl-3">
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
        </section>
    )
}
