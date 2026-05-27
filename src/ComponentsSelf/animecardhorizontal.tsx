"use client";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import React, { useEffect, useRef, useState } from "react";
import { CheckCheck } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import Image from "next/image";

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

const AnimeCardHorizontal = React.forwardRef<HTMLDivElement, AnimeCardHorizontalProps>((props, ref) => {
  const [genrearr_state, Set_genrearr_state] = useState<Genre[] | null>(null);
  const genre_container_ref = useRef<HTMLDivElement>(null);

  const rawGenres = props.genre ?? [];

  useEffect(() => {
    let genrearr = [...rawGenres];
    if (typeof window !== 'undefined') {
      if (genrearr.length > 2) {
        const exceeded = genrearr.length - 2;
        genrearr = genrearr.slice(0, 2);
        genrearr.push({ name: `+${exceeded}`, exeeeded_val: exceeded });
      }
      Set_genrearr_state(genrearr);
    }
  }, [props.genre]);

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
  }, [genrearr_state, props.genre]);

  const displayGenres = genrearr_state ?? rawGenres;

  return (
    <div ref={ref}>
      <Card className="rounded-none w-[100%] overflow-x-hidden border-l-1 hover:bg-zinc-800 text-white border-x-0 border-t-0 py-5 px-1 sm:px-4 mx-0 border-gray-700 bg-black">
        <CardContent className="flex p-0 flex-row gap-5 max-w-screen items-center">
          <Image
            className="rounded-sm h-55 w-35 sm:w-40 object-cover"
            loading="lazy"
            src={props.image || "/placeholder.png"}
            quality={90}
            height={1000}
            width={1000}
            alt={props.title}
          />
          <div className="flex flex-col items-start h-55 w-80 sm:overflow-visible justify-between">
            <div className="flex flex-row gap-1">
              {props.status === 'Finished Airing' ? (
                <Button variant="outline" className="bg-black border-1 font-medium text-sm text-green-500 border-gray-700">
                  {props.status}
                </Button>
              ) : props.status === 'Currently Airing' ? (
                <Button variant="outline" className="bg-black border-1 font-medium text-sm text-blue-400 border-gray-700">
                  {props.status}
                </Button>
              ) : (
                <Button variant="outline" className="bg-black border-1 font-medium text-sm text-red-400 border-gray-700">
                  {props.status}
                </Button>
              )}
              {props.addstatus ? (
                <Button variant="outline" className="bg-black border-1 font-medium text-sm text-blue-300 border-gray-700">
                  <CheckCheck size={32} />
                </Button>
              ) : null}
            </div>

            <div className="flex text-sm flex-row gap-2">
              <p className="capitalize">{props.season}</p>
              <p>{props.episodes === null ? '' : `${props.episodes} episodes`}</p>
            </div>
            <div className="pr-2 sm:pr-auto">
              <div className="text-base sm:text-2xl font-bold line-clamp-2 w-full overflow-hidden text-ellipsis">
                {props.title}
              </div>
              {props.title_english && (
                <div className="text-md hidden text-gray-400 line-clamp-1 overflow-hidden text-ellipsis">
                  {props.title_english}
                </div>
              )}
            </div>

            <div className="flex flex-row gap-10 text-sm text-gray-400">
              <div className="flex flex-col">
                <div className="flex flex-row gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                  </svg>
                  <p>{props.score === undefined ? 'No Rating' : props.score}</p>
                </div>
                <p>{props.users} users</p>
              </div>
              <div className="flex flex-col">
                <p>#{props.ranking}</p>
                <p>Ranking</p>
              </div>
            </div>
            <div ref={genre_container_ref} className="flex flex-row gap-2 overflow-x-auto w-[95%] items-center">
              {props.user_episode !== undefined && props.episodes ? (
                <>
                  <Progress className="my-2 h-2 bg-neutral-500 border-0" value={(props.user_episode / props.episodes) * 100} />
                  <p className="text-gray-400 text-sm ">{props.user_episode}/{props.episodes}</p>
                </>
              ) : (
                displayGenres.map((object, idx) => (
                  <Button key={`${object.name}-${idx}`} variant="secondary" className="text-sm text-white bg-slate-800">
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
