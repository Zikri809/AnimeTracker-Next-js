"use client";

import { Button } from "@/components/ui/button";
import Animecard from './animecard';
import Cardskeleton from "./animecardskelaton";
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import type { SeasonSectionProps } from "@/types";

function ThisseasonSec(props: SeasonSectionProps) {
  const isLoading = props.loading ?? true;
  const querydata = props.data ?? [];

  return (
    <div>
      <div className="flex flex-row pl-4 pr-6 mb-2 justify-between items-center">
        <div className="border-b-2 pb-2">
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">This Season</h4>
        </div>
        <Link href={'/morethiseseason'}>
          <Button className='bg-black border-black' variant="link" size="icon">
            <p className="text-blue-500 text-base">View All</p>
          </Button>
        </Link>
      </div>
      <Carousel
        className='ml-1 mb-5'
        opts={{
          skipSnaps: true,
        }}
      >
        <CarouselContent className="ml-1 md:ml-1 last:mr-2">
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
              <Link key={element.mal_id} href={'/Anime/' + element.mal_id}>
                <CarouselItem className="basis-auto flex-shrink-0 pl-2 md:pl-4">
                  <Animecard
                    title={element.title_english === null ? element.title : element.title_english}
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
  );
}

export default ThisseasonSec;
