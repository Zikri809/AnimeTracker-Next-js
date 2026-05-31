import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import Image from "next/image";

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
    <Card className="bg-zinc-800 p-1 border-none rounded-sm w-40 sm:w-55 hover:bg-zinc-700 h-75 sm:h-90">
      <CardContent className="truncate p-1">
        <Image
          className="rounded-md mb-2 mx-auto sm:h-70 h-50 object-cover"
          loading="lazy"
          quality={90}
          height={1000}
          width={1000}
          alt={title}
          src={imgSrc}
        />
        <CardTitle className="text-white text-center truncate mb-2">{title}</CardTitle>
        <CardDescription className="flex sm:flex-nowrap w-full truncate flex-row text-sm items-center flex-wrap justify-center sm:justify-between">
          <span className="mr-2 sm:mr-0">{rating != null ? `⭐${rating}` : "NA"}</span>
          <span>{displayYear}</span>
          <span className="hidden sm:inline-block">{status}</span>
        </CardDescription>
        <p className="w-full text-center text-sm text-neutral-500 inline-block sm:hidden">{status}</p>
      </CardContent>
    </Card>
  );
}
