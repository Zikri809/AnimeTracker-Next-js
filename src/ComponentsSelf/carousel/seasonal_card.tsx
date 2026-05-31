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
    <Card className="rounded-sm w-40 sm:w-55 h-65 sm:h-90 p-0 m-0 border-0">
      <CardContent className="p-0 m-0 grid grid-rows-1 grid-cols-1 border-0">
        <Image
          className="col-start-1 row-start-1 rounded-sm h-65 sm:h-90 w-40 sm:w-55 object-cover"
          loading="lazy"
          src={imgSrc}
          quality={90}
          height={1000}
          width={1000}
          alt={`${seasonal_data.season} ${seasonal_data.year}`}
        />
        <div
          style={{ backgroundImage: `linear-gradient(to top, ${bg}, transparent, transparent)` }}
          className="font-bold text-base pb-6 col-start-1 row-start-1 text-white flex rounded-sm h-65 sm:h-90 w-40 sm:w-55 border-0 flex-col justify-end items-center"
        >
          <p>
            {seasonTitle} • {seasonal_data.year}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
