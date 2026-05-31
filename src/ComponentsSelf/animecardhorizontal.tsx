"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React, { useEffect, useRef, useState } from "react";
import { CheckCheck, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { FALLBACK_POSTER_SRC } from "./animecard";

interface Genre {
  name: string;
  exeeeded_val?: number;
}

interface AnimeCardHorizontalProps {
  image: string;
  status: string;
  season: string;
  episodes: number | null;
  title: string;
  title_english?: string;
  score?: number | string;
  users?: number | string;
  ranking?: number | string;
  genre?: Genre[];
  user_episode?: number;
  addstatus?: boolean;
  className?: string;
  mal_id?: number | string;
}

function statusClassName(status: string) {
  if (status === "Finished Airing") {
    return "border-emerald-400/25 bg-emerald-400/10 text-emerald-300";
  }
  if (status === "Currently Airing") {
    return "border-primary/25 bg-primary/10 text-primary";
  }
  return "border-rose-400/25 bg-rose-400/10 text-rose-300";
}

const AnimeCardHorizontal = React.forwardRef<HTMLDivElement, AnimeCardHorizontalProps>((props, ref) => {
  const [genrearr_state, Set_genrearr_state] = useState<Genre[] | null>(null);
  const genre_container_ref = useRef<HTMLDivElement>(null);

  const rawGenres = React.useMemo(() => props.genre ?? [], [props.genre]);

  useEffect(() => {
    let genrearr = [...rawGenres];
    if (typeof window !== "undefined") {
      if (genrearr.length > 2) {
        const exceeded = genrearr.length - 2;
        genrearr = genrearr.slice(0, 2);
        genrearr.push({ name: `+${exceeded}`, exeeeded_val: exceeded });
      }
      Set_genrearr_state(genrearr);
    }
  }, [rawGenres]);

  useEffect(() => {
    if (
      genre_container_ref.current &&
      genre_container_ref.current.scrollWidth > genre_container_ref.current.clientWidth &&
      genrearr_state &&
      genrearr_state.length > 0
    ) {
      let genrearr = [...rawGenres];
      const lastItem = genrearr_state[genrearr_state.length - 1];
      const exceeded = lastItem.exeeeded_val !== undefined ? lastItem.exeeeded_val + 1 : 0;
      if (genrearr.length - exceeded > 0) {
        genrearr = genrearr.slice(0, genrearr.length - exceeded);
        genrearr.push({ name: `+${exceeded}`, exeeeded_val: exceeded });
        Set_genrearr_state(genrearr);
      }
    }
  }, [genrearr_state, rawGenres]);

  const displayGenres = genrearr_state ?? rawGenres;

  return (
    <div ref={ref} className={props.className}>
      <Card className="group rounded-none border-x-0 border-t-0 border-white/8 bg-background px-4 py-4 text-white shadow-none transition-colors duration-200 hover:bg-[#0f1218] sm:px-5 lg:h-full lg:rounded-md lg:border lg:border-white/10 lg:bg-card lg:px-4 lg:py-5 lg:hover:border-white/20 lg:hover:bg-[#151821]">
        <CardContent className="flex min-w-0 flex-row items-start gap-3 p-0 sm:gap-5">
          <div className="relative h-[8.6rem] w-[5.75rem] flex-none overflow-hidden rounded-md bg-[#111318] sm:h-[12rem] sm:w-[8rem]">
            <Image
              className="object-cover"
              loading="lazy"
              src={props.image || FALLBACK_POSTER_SRC}
              quality={85}
              fill
              sizes="(min-width: 640px) 128px, 92px"
              alt={props.title}
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:min-h-[12rem] sm:justify-between sm:gap-3">
            <div className="flex min-w-0 flex-row flex-wrap items-center gap-1.5">
              <span className={`status-pill h-7 px-2 text-[11px] sm:h-8 sm:px-3 sm:text-xs ${statusClassName(props.status)}`}>
                {props.status}
              </span>
              {props.addstatus ? (
                <span className="status-pill h-7 w-9 border-primary/25 bg-primary/10 px-0 text-primary sm:h-8 sm:w-auto sm:px-3" aria-label="In watchlist">
                  <CheckCheck className="size-3.5 sm:size-4" />
                </span>
              ) : null}
            </div>

            <div className="flex min-w-0 flex-wrap gap-x-2 gap-y-0.5 text-[11px] leading-4 text-slate-400 sm:text-sm">
              <p className="capitalize">{props.season}</p>
              <p>{props.episodes === null ? "" : `${props.episodes} episodes`}</p>
            </div>

            <div className="min-w-0 pr-1">
              <div className="line-clamp-2 text-[15px] font-bold leading-[1.12] text-white sm:text-xl sm:leading-snug">
                {props.title}
              </div>
              {props.title_english && (
                <div className="line-clamp-1 text-xs text-slate-500 sm:text-sm">
                  {props.title_english}
                </div>
              )}
            </div>

            <div className="grid w-full max-w-[13rem] grid-cols-2 gap-3 text-[11px] leading-4 text-slate-400 sm:max-w-sm sm:text-sm">
              <div className="min-w-0">
                <div className="flex flex-row items-center gap-1 text-slate-200">
                  <Star className="size-3.5 fill-primary text-primary sm:size-4" />
                  <p className="truncate">{props.score === undefined ? "No Rating" : props.score}</p>
                </div>
                <p className="truncate">{props.users} users</p>
              </div>
              <div className="min-w-0 text-left">
                <p className="truncate text-slate-200">#{props.ranking}</p>
                <p>Ranking</p>
              </div>
            </div>

            <div ref={genre_container_ref} className="flex min-w-0 flex-row flex-wrap items-center gap-1.5 overflow-hidden sm:gap-2">
              {props.user_episode !== undefined && props.episodes ? (
                <>
                  <Progress
                    className="my-2 h-2 min-w-0 flex-1 border-0 bg-white/10"
                    value={(props.user_episode / props.episodes) * 100}
                    indicatorClassName={props.user_episode >= props.episodes ? "bg-primary" : "bg-white"}
                  />
                  <p className="flex-none text-xs text-slate-400">{props.user_episode}/{props.episodes}</p>
                </>
              ) : (
                displayGenres.map((object, idx) => (
                  <Button key={`${object.name}-${idx}`} variant="secondary" className="metadata-pill h-6 max-w-[7rem] truncate px-2 text-[11px] sm:h-7 sm:max-w-[8rem] sm:text-xs">
                    {object.name}
                  </Button>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

AnimeCardHorizontal.displayName = "AnimeCardHorizontal";
export default AnimeCardHorizontal;
