"use client";

import { Button } from "@/components/ui/button";
import Animecard from './animecard';
import Cardskeleton from "./animecardskeleton";
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import type { SeasonSectionProps } from "@/types";

function UpcomingSec(props: SeasonSectionProps) {
  const isLoading = props.loading ?? true;
  const querydata = props.data ?? [];

  return (
    <section className="mb-8">
      <div className="mb-3 flex flex-row items-end justify-between px-4 sm:px-6">
        <div className="space-y-2">
          <h4 className="scroll-m-20 text-xl font-semibold tracking-tight text-white">Upcoming Season</h4>
          <div className="section-title-rule" />
        </div>
        <Link href='/moreupcoming'>
          <Button className='quiet-action h-9 px-3 text-primary' variant="link">
            <p className="text-sm font-semibold">View All</p>
          </Button>
        </Link>
      </div>
      <Carousel
        className='mb-5'
        opts={{
          skipSnaps: true,
        }}
      >
        <CarouselContent className="ml-2 pr-4 md:ml-4">
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
                <CarouselItem className="basis-auto flex-shrink-0 pl-2 md:pl-3">
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
    </section>
  );
}

export default UpcomingSec;
