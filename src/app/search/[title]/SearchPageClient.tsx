"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/ComponentsSelf/searchnavbar";
import Horizontalcard from "@/ComponentsSelf/animecardhorizontal";
import Link from "next/link";
import scrollsaver from "@/Utility/ScrollSaver";

interface MalAnimeNode {
  id: number;
  title: string;
  alternative_titles: { en: string | null };
  main_picture: { large: string };
  status: string; // already mapped to display form by the route
  start_season: { season: string | null; year: number | null } | null;
  num_episodes: number | null;
  mean: number | null;
  num_scoring_users: number | null;
  popularity: number | null;
  genres: Array<{ id: number; name: string }>;
}

interface AnimeSearchResultItem {
  node: MalAnimeNode;
}

interface SearchPageClientProps {
  title: string;
}

export default function SearchPageClient({ title: queryTitle }: SearchPageClientProps) {
  const [animearr, setAnimearr] = useState<AnimeSearchResultItem[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [searchError, setSearchError] = useState<string | null>(null);
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
    setSearchError(null);
    Set_search_target(inputval);
    sessionStorage.removeItem("animedatasearch");
    isaddedarr.current = false;
    isupdated.current = false;
    // Reset scroll to the top for a fresh search. This covers the case where
    // the same query is re-searched (no route change → no remount → the
    // navbar's pre-navigation scroll-clear in SearchNavbar wouldn't fire).
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
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

  const fetchapiRef = useRef<(currpage: number, isRetry?: boolean) => Promise<void>>(null as any);

  const fetchapi = useCallback(async (currpage: number, isRetry = false) => {
    try {
      const q = searchtarget === null ? queryTitle : searchtarget;
      if (!q || q === "NA" || (typeof q === "string" && !q.trim())) {
        setLoading(false);
        return;
      }

      const storeddataStr = sessionStorage.getItem("animedatasearch");
      const storeddata = storeddataStr ? JSON.parse(storeddataStr) : null;
      if (storeddata !== null && Array.isArray(storeddata)) {
        // Shape guard: the response shape changed from Jikan (flat, `mal_id`)
        // to MAL (`node.id`). If cached entries lack `.node`, the cache is
        // stale pre-migration data — discard it so we don't render garbage.
        const isMalShaped =
          storeddata.length === 0 ||
          (storeddata[0] && typeof storeddata[0].node === "object");
        if (isMalShaped) {
          const lastUpdate = JSON.parse(sessionStorage.getItem("lastupdatetimesearch") || "0");
          if (!(Math.floor(Date.now() / 86400000) - lastUpdate >= 1)) {
            if (storeddata.length > animearr.length) {
              setpage(Math.ceil(storeddata.length / 24) + 1);
              setAnimearr(storeddata);
              setLoading(false);
              return;
            }
          } else {
            sessionStorage.removeItem("animedatasearch");
            sessionStorage.removeItem("lastupdatetimesearch");
          }
        } else {
          // Stale Jikan-shaped cache — clear it.
          sessionStorage.removeItem("animedatasearch");
          sessionStorage.removeItem("lastupdatetimesearch");
        }
      }

      const response = await fetch("/api/anime/search?page=" + currpage + "&q=" + encodeURIComponent(q));

      // Surface upstream errors (429 rate-limit, 502, 504, etc.) explicitly
      // instead of letting response.json() throw an opaque parse error. This
      // fixes the original bug where a 504 silently showed the welcome page.
      if (!response.ok) {
        throw new Error(`Search failed (HTTP ${response.status})`);
      }

      const apifeedback = await response.json();
      const top24: AnimeSearchResultItem[] = apifeedback.data || [];

      // Dedupe against both the incoming page AND the already-loaded items.
      // MAL can return overlapping ids across pagination boundaries (e.g. when
      // results shift between requests), which previously caused duplicate
      // React keys in the render loop.
      const seenIds = new Set<number>(
        animearr
          .map((item) => item?.node?.id)
          .filter((id): id is number => typeof id === "number"),
      );
      const deconstructed: AnimeSearchResultItem[] = [];
      for (const element of top24) {
        if (element?.node && typeof element.node.id === "number" && !seenIds.has(element.node.id)) {
          seenIds.add(element.node.id);
          deconstructed.push(element);
        }
      }

      if (!isaddedarr.current) {
        isaddedarr.current = true;
        const newArr = [...animearr, ...deconstructed];
        setAnimearr(newArr);
        const currenttimedays = Math.floor(Date.now() / 86400000);
        sessionStorage.setItem("lastupdatetimesearch", JSON.stringify(currenttimedays));
        sessionStorage.setItem("animedatasearch", JSON.stringify(newArr));
        isupdated.current = false;
      }
      setSearchError(null);
      setLoading(false);
    } catch (error) {
      console.error(error);
      // Retry once after a short backoff; if the retry also fails, show an
      // explicit error message instead of silently rendering the empty-state
      // "welcome page" (the original bug).
      if (!isRetry) {
        setTimeout(() => {
          fetchapiRef.current?.(currpage, true);
        }, 1000);
      } else {
        setSearchError(
          "Search is unavailable right now. The anime data service may be busy — please try again in a moment.",
        );
        setLoading(false);
      }
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
      ) : searchError ? (
        <div className="flex min-h-screen w-full flex-col items-center justify-center gap-3 bg-background px-6 pt-20 text-center">
          <p className="text-lg font-semibold text-white">{searchError}</p>
          <button
            type="button"
            onClick={() => {
              setSearchError(null);
              setLoading(true);
              setpage(1);
              isaddedarr.current = false;
              isupdated.current = false;
              Promise.resolve().then(() => fetchapiRef.current?.(1));
            }}
            className="mt-2 rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="relative left-0 mb-16 flex min-h-screen w-full flex-col bg-background pt-20 sm:pb-0 lg:grid lg:grid-cols-2 lg:grid-rows lg:gap-3 lg:p-4 lg:pt-24">
          {animearr.length !== 0 && queryTitle !== "NA" ? (
            animearr.map((element: AnimeSearchResultItem, index: number) => {
              const node = element.node;
              const seasonStr =
                node.start_season && node.start_season.season
                  ? `${node.start_season.season} ${node.start_season.year ?? ""}`.trim()
                  : " ";
              const displayTitle =
                node.alternative_titles?.en == null
                  ? node.title
                  : node.alternative_titles.en;
              // Include the array index in the key to guarantee uniqueness
              // even if a duplicate id slips past dedup (defensive; dedup in
              // fetchapi should prevent this, but React keys must be unique).
              const itemKey = `${node.id}-${index}`;
              return (
                <Link key={itemKey} href={"/search/" + queryTitle + "/" + node.id} className="block min-w-0 lg:h-full">
                  <Horizontalcard
                    key={node.id}
                    mal_id={node.id}
                    image={node.main_picture?.large ?? ""}
                    status={node.status}
                    season={seasonStr}
                    episodes={node.num_episodes ?? 0}
                    title={displayTitle}
                    score={node.mean ?? undefined}
                    users={node.num_scoring_users ?? 0}
                    ranking={node.popularity ?? 0}
                    genre={node.genres}
                    addstatus={
                      plantowatchmap.has(node.id) ||
                      watchingmap.has(node.id) ||
                      completedmap.has(node.id) ||
                      onholdmap.has(node.id) ||
                      droppedmap.has(node.id)
                    }
                  />
                </Link>
              );
            })
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
