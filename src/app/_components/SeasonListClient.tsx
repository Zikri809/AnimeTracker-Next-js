"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Morenavbar from "@/ComponentsSelf/morenavbar";
import Horizontalcard from "@/ComponentsSelf/animecardhorizontal";
import type { MalSeasonItem } from "@/server/seasonal/mal-season-pages";
import type { AnimeSeason } from "@/server/seasonal/page-season";
import { FALLBACK_POSTER_SRC } from "@/ComponentsSelf/animecard";
import { useScrollSaver } from "@/hooks/use-scroll-saver";
import {
  parseWatchlistMap,
  readRouteScopedSlice,
  writeRouteScopedSlice,
  readRouteScopedSortedAnime,
} from "@/lib/season-list-storage";

interface SeasonListClientProps {
  title: string;
  initialItems: MalSeasonItem[];
  detailHrefPrefix: string;
  season?: AnimeSeason;
  year?: number;
}

export default function SeasonListClient({
  title,
  initialItems,
  detailHrefPrefix,
  season,
  year,
}: SeasonListClientProps) {
  const [animearr, setAnimearr] = useState<MalSeasonItem[]>(initialItems);
  const [visibleCount, setpagearr] = useState(30);
  const isupdated = useRef(false);
  const cardref = useRef(null);
  const pathname = usePathname();

  // Watchlist maps state
  const [plantowatchmap, Setplantowatchmap] = useState<Map<number, unknown>>(new Map());
  const [watchingmap, Setwatchingmap] = useState<Map<number, unknown>>(new Map());
  const [completedmap, Setcompletedmap] = useState<Map<number, unknown>>(new Map());
  const [onholdmap, Setonholdmap] = useState<Map<number, unknown>>(new Map());
  const [droppedmap, Setdroppedmap] = useState<Map<number, unknown>>(new Map());

  // Restore state on mount
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    Setplantowatchmap(parseWatchlistMap("PlanToWatch"));
    Setwatchingmap(parseWatchlistMap("Watching"));
    Setcompletedmap(parseWatchlistMap("Completed"));
    Setonholdmap(parseWatchlistMap("OnHold"));
    Setdroppedmap(parseWatchlistMap("Dropped"));

    const restoredSlice = readRouteScopedSlice(pathname);
    if (restoredSlice !== null) {
      setpagearr(restoredSlice);
    }

    const restoredSorted = readRouteScopedSortedAnime(pathname, initialItems);
    if (restoredSorted !== null) {
      setAnimearr(restoredSorted);
    } else {
      setAnimearr(initialItems);
    }

    isupdated.current = true;
  }, [pathname, initialItems]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Save scroll position using useScrollSaver
  useScrollSaver([visibleCount, animearr]);

  // Infinite scroll
  useEffect(() => {
    function scrollhandler() {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
        isupdated.current &&
        visibleCount < animearr.length
      ) {
        const addedpage = visibleCount + 30;
        setpagearr(addedpage);
        writeRouteScopedSlice(pathname, addedpage);
        isupdated.current = true;
      }
    }
    window.addEventListener("scroll", scrollhandler);
    return () => {
      window.removeEventListener("scroll", scrollhandler);
    };
  }, [visibleCount, animearr.length, pathname]);

  useEffect(() => {
    isupdated.current = true;
  }, [visibleCount]);

  // Helper formatting functions
  const formatStatus = (status?: string): string => {
    if (!status) return "Unknown";
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatSeasonStr = (item: MalSeasonItem): string => {
    const start = item.node.start_season;
    if (!start || !start.season || !start.year) return " ";
    return `${start.season.charAt(0).toUpperCase() + start.season.slice(1)} ${start.year}`;
  };

  return (
    <div className="relative top-0 left-0 font-poppins overflow-hidden m-0 w-screen h-auto bg-black text-white ml-1 antialiased">
      <Morenavbar
        sectionTitle={title}
        SetAnimeArr={(arr) => setAnimearr(arr as MalSeasonItem[])}
        IsUpdateRef={isupdated}
        SetpageArr={setpagearr}
        season={season || null}
        year={year || null}
        defaultArr={initialItems}
      />

      <div className="relative top-18 lg:grid lg:grid-cols-2 w-screen pb-33 sm:pb-15 lg:grid-rows">
        {animearr.slice(0, visibleCount).map((element) => {
          if (!element.node || typeof element.node.id !== "number") {
            return null;
          }
          const id = element.node.id;
          const isAdded =
            plantowatchmap.has(id) ||
            watchingmap.has(id) ||
            completedmap.has(id) ||
            onholdmap.has(id) ||
            droppedmap.has(id);

          const image = element.node.main_picture?.large || FALLBACK_POSTER_SRC;
          const status = formatStatus(element.node.status);
          const seasonStr = formatSeasonStr(element);
          const episodes = element.node.num_episodes ?? 0;
          const titleText =
            element.node.alternative_titles?.en || element.node.title || "Untitled";

          const genresMapped = (element.node.genres ?? [])
            .filter((g): g is { id?: number; name: string } => typeof g.name === "string")
            .map((g) => ({ name: g.name }));

          return (
            <Link key={id} href={`${detailHrefPrefix}/${id}`}>
              <Horizontalcard
                ref={cardref}
                addstatus={isAdded}
                mal_id={id}
                image={image}
                status={status}
                season={seasonStr}
                episodes={episodes}
                title={titleText}
                score={element.node.mean ?? undefined}
                users={element.node.num_scoring_users ?? 0}
                ranking={element.node.popularity ?? 0}
                genre={genresMapped}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
