import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import Image from "next/image";
import { Star } from "lucide-react";

export const FALLBACK_POSTER_SRC = "/placeholder.svg";

interface AnimeCardProps {
  title: string;
  link?: string;
  rating?: number | string | null;
  year?: number | string | null;
  status?: string;
}

export default function AnimeCard({
  title,
  link = FALLBACK_POSTER_SRC,
  rating,
  year = "NA",
  status,
}: AnimeCardProps) {
  const imgSrc = link && link.trim() !== "" ? link : FALLBACK_POSTER_SRC;
  const displayYear = year ?? "NA";

  return (
    <Card className="media-card h-[19rem] w-[10rem] flex-none p-0 sm:h-[23rem] sm:w-[13.25rem]">
      <CardContent className="flex h-full flex-col p-2">
        <div className="relative mb-3 aspect-[2/3] w-full overflow-hidden rounded-md bg-[#0d1016]">
          <Image
            className="object-cover transition-transform duration-300 hover:scale-[1.03]"
            loading="lazy"
            quality={85}
            fill
            sizes="(min-width: 640px) 212px, 160px"
            alt={title}
            src={imgSrc}
          />
        </div>
        <CardTitle className="line-clamp-2 min-h-[2.5rem] text-left text-sm font-semibold leading-5 text-white sm:text-base">
          {title}
        </CardTitle>
        <CardDescription className="mt-auto grid grid-cols-[1fr_auto] items-end gap-2 text-xs text-slate-400">
          <span className="inline-flex min-w-0 items-center gap-1 text-slate-200">
            <Star className="size-3.5 fill-primary text-primary" />
            <span className="truncate">{rating != null ? rating : "NA"}</span>
          </span>
          <span className="text-right">{displayYear}</span>
          <span className="col-span-2 truncate text-slate-500">{status}</span>
        </CardDescription>
      </CardContent>
    </Card>
  );
}
