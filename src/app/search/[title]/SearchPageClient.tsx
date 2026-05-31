"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/ComponentsSelf/searchnavbar";
import Horizontalcard from "@/ComponentsSelf/animecardhorizontal";
import Link from "next/link";
import scrollsaver from "@/Utility/ScrollSaver";

interface AnimeSearchResultItem {
  mal_id: number;
  title: string;
  title_english: string | null;
  images: {
    webp: {
      large_image_url: string;
    };
  };
  status: string;
  season: string | null;
  year: number | null;
  episodes: number | null;
  score: number | null;
  scored_by: number | null;
  popularity: number | null;
  genres: Array<{ name: string }>;
}

interface SearchPageClientProps {
  title: string;
}

export default function SearchPageClient({ title: queryTitle }: SearchPageClientProps) {
  const [animearr, setAnimearr] = useState<AnimeSearchResultItem[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [currentpage, setpage] = useState(1);
  const isupdated = useRef(false);
  const isaddedarr = useRef(false);
  const [searchtarget, Set_search_target] = useState<string | null>(null);
  const [plantowatchmap, Setplantowatchmap] = useState<Map<number, unknown>>(new Map());
  const [watchingmap, Setwatchingmap] = useState<Map<number, unknown>>(new Map());
  const [completedmap, Setcompletedmap] = useState<Map<number, unknown>>(new Map());
  const [onholdmap, Setonholdmap] = useState<Map<number, unknown>>(new Map());
  const [droppedmap, Setdroppedmap] = useState<Map<number, unknown>>(new Map());

  function clearstate(inputval: string) {
    setpage(1);
    setLoading(true);
    setAnimearr([]);
    Set_search_target(inputval);
    sessionStorage.removeItem("animedatasearch");
    isaddedarr.current = false;
    isupdated.current = false;
  }

  scrollsaver([isLoading]);

  useEffect(() => {
    function scrollhandler() {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 2000 && !isupdated.current) {
        setpage((currPage) => currPage + 1);
        isaddedarr.current = false;
        isupdated.current = true;
        window.removeEventListener("scroll", scrollhandler);
      }
    }
    window.addEventListener("scroll", scrollhandler);
    return () => {
      window.removeEventListener("scroll", scrollhandler);
    };
  }, [currentpage]);

  const fetchapiRef = useRef<(currpage: number) => Promise<void>>(null as any);

  const fetchapi = useCallback(async (currpage: number) => {
    try {
      const q = searchtarget === null ? queryTitle : searchtarget;
      if (!q || q === "NA" || (typeof q === "string" && !q.trim())) {
        setLoading(false);
        return;
      }

      const storeddataStr = sessionStorage.getItem("animedatasearch");
      const storeddata = storeddataStr ? JSON.parse(storeddataStr) : null;
      if (storeddata !== null) {
        const lastUpdate = JSON.parse(sessionStorage.getItem("lastupdatetimesearch") || "0");
        if (!(Math.floor(Date.now() / 86400000) - lastUpdate >= 1)) {
          if (storeddata.length > animearr.length) {
            console.log("using already stored data", storeddata);
            setpage(Math.ceil(storeddata.length / 24) + 1);
            setAnimearr(storeddata);
            setLoading(false);
            return;
          }
        } else {
          sessionStorage.removeItem("animedatasearch");
          sessionStorage.removeItem("lastupdatetimesearch");
        }
      }

      const response = await fetch("/api/anime/search?page=" + currpage + "&q=" + encodeURIComponent(q));
      const apifeedback = await response.json();
      const top24 = apifeedback.data || [];

      const tempfilteredSetid = new Set<number>();
      const tempfiltered = new Set<AnimeSearchResultItem>();
      top24.forEach((element: AnimeSearchResultItem) => {
        if (!tempfilteredSetid.has(element.mal_id)) {
          tempfiltered.add(element);
          tempfilteredSetid.add(element.mal_id);
        }
      });

      const deconstructed: AnimeSearchResultItem[] = [];
      tempfiltered.forEach(({ status, mal_id, images, season, year, episodes, title_english, title: mainTitle, score, scored_by, popularity, genres }) => {
        deconstructed.push({ title_english, status, mal_id, images, season, year, episodes, title: mainTitle, score, scored_by, popularity, genres });
      });

      if (!isaddedarr.current) {
        isaddedarr.current = true;
        const newArr = [...animearr, ...deconstructed];
        setAnimearr(newArr);
        const currenttimedays = Math.floor(Date.now() / 86400000);
        sessionStorage.setItem("lastupdatetimesearch", JSON.stringify(currenttimedays));
        sessionStorage.setItem("animedatasearch", JSON.stringify(newArr));
        isupdated.current = false;
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      // retry once
      setTimeout(() => {
        fetchapiRef.current?.(currpage);
      }, 1000);
    }
  }, [animearr, queryTitle, searchtarget]);

  useEffect(() => {
    fetchapiRef.current = fetchapi;
  }, [fetchapi]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchapi(currentpage);
    });
  }, [currentpage, fetchapi]);

  useEffect(() => {
    Promise.resolve().then(() => {
      Setplantowatchmap(new Map(JSON.parse(localStorage.getItem("PlanToWatch") || "[]")));
      Setwatchingmap(new Map(JSON.parse(localStorage.getItem("Watching") || "[]")));
      Setcompletedmap(new Map(JSON.parse(localStorage.getItem("Completed") || "[]")));
      Setonholdmap(new Map(JSON.parse(localStorage.getItem("OnHold") || "[]")));
      Setdroppedmap(new Map(JSON.parse(localStorage.getItem("Dropped") || "[]")));
    });
  }, []);

  return (
    <>
      <Navbar set_state={clearstate} searchtitle={queryTitle === "NA" ? "Search" : queryTitle} />
      {isLoading ? (
        <div className="flex h-screen w-full flex-row items-center justify-center bg-background">
          <div className="loader"></div>
        </div>
      ) : (
        <div className="relative left-0 mb-16 flex min-h-screen w-full flex-col bg-background pt-20 sm:pb-0 lg:grid lg:grid-cols-2 lg:grid-rows lg:gap-3 lg:p-4 lg:pt-24">
          {animearr.length !== 0 && queryTitle !== "NA" ? (
            animearr.map((element: AnimeSearchResultItem) => (
              <Link key={element.mal_id + 10} href={"/search/" + queryTitle + "/" + element.mal_id} className="block min-w-0 lg:h-full">
                <Horizontalcard
                  key={element.mal_id}
                  mal_id={element.mal_id}
                  image={element.images.webp.large_image_url}
                  status={element.status}
                  season={element.season == null ? " " : element.season + " " + element.year}
                  episodes={element.episodes ?? 0}
                  title={element.title_english == null ? element.title : element.title_english}
                  score={element.score ?? undefined}
                  users={element.scored_by ?? 0}
                  ranking={element.popularity ?? 0}
                  genre={element.genres}
                  addstatus={
                    plantowatchmap.has(element.mal_id) ||
                    watchingmap.has(element.mal_id) ||
                    completedmap.has(element.mal_id) ||
                    onholdmap.has(element.mal_id) ||
                    droppedmap.has(element.mal_id)
                  }
                />
              </Link>
            ))
          ) : (
            <div className="empty-state lg:col-span-2">
              <p className="text-lg font-semibold text-white">Your anime journey starts here</p>
              <p className="text-sm text-slate-400">Search for a title to find details, rankings, and watchlist actions.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
