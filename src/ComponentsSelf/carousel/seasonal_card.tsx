import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import React from "react";
import { FALLBACK_POSTER_SRC } from "../animecard";

interface SeasonalCardProps {
  anime_data: {
    node?: {
      main_picture?: {
        large?: string;
      };
    };
  } | null;
  seasonal_data: {
    season: string;
    year: number | string;
  };
  bg: string;
}

export default function SeasonalCard({ anime_data, seasonal_data, bg }: SeasonalCardProps) {
  const imgSrc = anime_data?.node?.main_picture?.large || FALLBACK_POSTER_SRC;
  const seasonTitle = seasonal_data.season
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <Card className="media-card h-[19rem] w-[10rem] flex-none overflow-hidden p-0 sm:h-[23rem] sm:w-[13.25rem]">
      <CardContent className="grid h-full grid-cols-1 grid-rows-1 border-0 p-0">
        <div className="relative col-start-1 row-start-1 h-full w-full">
          <Image
            className="object-cover"
            loading="lazy"
            src={imgSrc}
            quality={85}
            fill
            sizes="(min-width: 640px) 212px, 160px"
            alt={`${seasonal_data.season} ${seasonal_data.year}`}
          />
        </div>
        <div
          style={{ backgroundImage: `linear-gradient(to bottom, rgb(8 9 11 / 0.55), transparent 38%, ${bg})` }}
          className="col-start-1 row-start-1 flex h-full w-full flex-col border-0 p-3 text-white"
        >
          <div className="w-fit rounded-md border border-white/15 bg-black/55 px-2.5 py-1.5 text-xs font-bold shadow-lg backdrop-blur-sm">
            {seasonTitle} {seasonal_data.year}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
