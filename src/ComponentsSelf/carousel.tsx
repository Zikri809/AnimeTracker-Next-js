import * as React from "react"
import { Card } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import Link from "next/link";
import Image from "next/image";

interface AnimeTitle {
  english?: string;
  romaji?: string;
}

interface AnimeElement {
  idMal: number | string;
  bannerImage?: string;
  title: AnimeTitle;
  genres: string[];
}

interface CarouselDemoProps {
  data: AnimeElement[];
}

export function CarouselDemo({ data }: CarouselDemoProps) {
  // Memoize the Autoplay plugin so we don't access a ref during render
  const autoplayPlugin = React.useMemo(
    () => Autoplay({ delay: 2000, stopOnInteraction: false }),
    []
  );

  // Filter items that have a bannerImage to build the spotlight data list cleanly
  const spotlightData = React.useMemo(() => {
    return data.filter((element) => !!element.bannerImage);
  }, [data]);

  return (
    <div className="relative mb-8 h-[15rem] overflow-hidden border-b border-white/10 bg-[#0b0d12] md:h-[22rem]">
      <Carousel
        className="relative z-10 h-full border-none bg-transparent"
        plugins={[autoplayPlugin]}
      >
        <CarouselContent className='h-full border-none'>
          {spotlightData.map((element, index) => (
            <CarouselItem key={element.idMal} className='h-full border-none'>
              <div className="h-full border-none">
                <Link href={`/Anime/${element.idMal}`}>
                  <Card className="relative flex h-[15rem] flex-row justify-center overflow-hidden rounded-none border-none bg-transparent p-0 md:h-[22rem]">
                    <Image
                      className='h-full w-full object-cover object-center'
                      fill
                      sizes="100vw"
                      quality={90}
                      priority={index === 0}
                      alt={element.title.english ?? element.title.romaji ?? "Spotlight Anime"}
                      src={element.bannerImage!}
                    />
                    <div className="absolute inset-0 border-0 bg-[linear-gradient(90deg,rgb(8_9_11/0.94)_0%,rgb(8_9_11/0.72)_42%,rgb(8_9_11/0.14)_100%)] px-5 md:px-10">
                      <div className="relative z-2 flex h-full max-w-4xl flex-col items-start justify-end gap-2 pb-7 md:pb-10">
                        <div className="text-sm font-semibold uppercase tracking-[0.18em] text-primary md:text-base">
                          #{index + 1} Spotlight
                        </div>
                        <div className="line-clamp-2 max-w-[38rem] text-left text-2xl font-bold leading-tight text-white md:text-5xl">
                          {element.title.english ?? element.title.romaji}
                        </div>
                        <div className="flex max-w-full flex-row flex-wrap gap-2 rounded-md text-white">
                          {element.genres.slice(0, 3).map((genre, genreIndex) => (
                            <div className="metadata-pill" key={genreIndex}>
                              {genre}
                            </div>
                          ))}
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
