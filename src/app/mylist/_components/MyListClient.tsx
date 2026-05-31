"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from '@/ComponentsSelf/mylistnavbar';
import Horizontalcard from '@/ComponentsSelf/animecardhorizontal';
import Link from "next/link";
import { Toaster } from "sonner";
import useScrollSaver from "@/Utility/ScrollSaver";
import useSwipeGesture from "@/hooks/useSwipeGesture";
import { fetchAuthSessionWithRefresh } from "@/lib/auth-session";
import { getWatchlistMap, MYLIST_TABS } from "@/Utility/tracking/watchlist-storage";
import { startWatchlistSync, logoutChannel } from "../_lib/mylist-worker-sync";
import { normalizeRowItem } from "../_lib/mylist-row-view-model";

import top_score from "@/Utility/filter/top_score";
import top_member from "@/Utility/filter/top_members";
import completed_sort from "@/Utility/filter/completed_sort";
import airing_sort from "@/Utility/filter/airing_sort";

function normalizeTab(tabName: string | null): string {
  if (!tabName) return 'Plan To Watch';
  if (tabName === 'PlanToWatch' || tabName === 'Plan To Watch') return 'Plan To Watch';
  if (tabName === 'Completed') return 'Completed';
  if (tabName === 'Watching') return 'Watching';
  if (tabName === 'OnHold' || tabName === 'On Hold') return 'On Hold';
  if (tabName === 'Dropped') return 'Dropped';
  return 'Plan To Watch';
}

function getStorageKeyForTab(tab: string): 'Watching' | 'Completed' | 'OnHold' | 'Dropped' | 'PlanToWatch' {
  if (tab === 'Watching') return 'Watching';
  if (tab === 'Completed') return 'Completed';
  if (tab === 'On Hold') return 'OnHold';
  if (tab === 'Dropped') return 'Dropped';
  return 'PlanToWatch';
}

function parseSortType(rawSort: string | null): string {
  if (!rawSort) return '';
  const validSorts = new Set(['TopScore', 'Top Member', 'Completed', 'Airing']);
  try {
    const parsed = JSON.parse(rawSort);
    if (typeof parsed === 'string' && validSorts.has(parsed)) return parsed;
    return '';
  } catch {
    // Ignore
  }
  return validSorts.has(rawSort) ? rawSort : '';
}

function recomputeSort(anime_data: any[], sortType: string): any[] {
  switch (sortType) {
    case 'TopScore':
      return top_score(anime_data);
    case 'Top Member':
      return top_member(anime_data);
    case 'Completed':
      return completed_sort(anime_data);
    case 'Airing':
      return airing_sort(anime_data);
    default:
      return anime_data;
  }
}

export default function MyListClient() {
  const [planmap, Setplan] = useState<any[]>([]);
  const [completedmap, Setcompleted] = useState<any[]>([]);
  const [watchinmap, Setwatching] = useState<any[]>([]);
  const [onholdmap, Setonhold] = useState<any[]>([]);
  const [droppedmap, Setdropped] = useState<any[]>([]);
  const [isloading, Setloading] = useState(false);
  const [activetab, Setactivetab] = useState('Plan To Watch');
  const [currentpagearr, setpagearr] = useState(30);
  const [mounted, setMounted] = useState(false);
  const [isInitialRestoreComplete, setIsInitialRestoreComplete] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => {
      // 1. Determine active tab
      const savedTab = sessionStorage.getItem('activetab');
      const active = normalizeTab(savedTab);
      Setactivetab(active);
      sessionStorage.setItem('activetab', active);

      // 2. Load lists from localStorage
      const watchingMap = getWatchlistMap('Watching');
      const completedMap = getWatchlistMap('Completed');
      const onHoldMap = getWatchlistMap('OnHold');
      const droppedMap = getWatchlistMap('Dropped');
      const planToWatchMap = getWatchlistMap('PlanToWatch');

      let watchingData: any[] = Array.from(watchingMap.entries());
      let completedData: any[] = Array.from(completedMap.entries());
      let onHoldData: any[] = Array.from(onHoldMap.entries());
      let droppedData: any[] = Array.from(droppedMap.entries());
      let planToWatchData: any[] = Array.from(planToWatchMap.entries());

      // 3. Process sort
      const rawSort = sessionStorage.getItem('sort_type');
      const sortType = parseSortType(rawSort);

      if (sortType) {
        try {
          const parsedSorted = JSON.parse(sessionStorage.getItem('sorted_anime') || '[]');
          if (Array.isArray(parsedSorted) && parsedSorted.length > 0) {
            const activeStorageKey = getStorageKeyForTab(active);
            const activeMap = getWatchlistMap(activeStorageKey);
            const allBelong = parsedSorted.length === activeMap.size && parsedSorted.every(([id]) => activeMap.has(id));

            if (allBelong) {
              if (active === 'Watching') watchingData = parsedSorted;
              else if (active === 'Completed') completedData = parsedSorted;
              else if (active === 'On Hold') onHoldData = parsedSorted;
              else if (active === 'Dropped') droppedData = parsedSorted;
              else if (active === 'Plan To Watch') planToWatchData = parsedSorted;
            } else {
              const sorted = recomputeSort(Array.from(activeMap.values()), sortType);
              const sortedMapped = sorted.map(item => [item.node.id, item]);
              sessionStorage.setItem('sorted_anime', JSON.stringify(sortedMapped));
              if (active === 'Watching') watchingData = sortedMapped;
              else if (active === 'Completed') completedData = sortedMapped;
              else if (active === 'On Hold') onHoldData = sortedMapped;
              else if (active === 'Dropped') droppedData = sortedMapped;
              else if (active === 'Plan To Watch') planToWatchData = sortedMapped;
            }
          } else {
            const activeStorageKey = getStorageKeyForTab(active);
            const activeMap = getWatchlistMap(activeStorageKey);
            const sorted = recomputeSort(Array.from(activeMap.values()), sortType);
            const sortedMapped = sorted.map(item => [item.node.id, item]);
            sessionStorage.setItem('sorted_anime', JSON.stringify(sortedMapped));
            if (active === 'Watching') watchingData = sortedMapped;
            else if (active === 'Completed') completedData = sortedMapped;
            else if (active === 'On Hold') onHoldData = sortedMapped;
            else if (active === 'Dropped') droppedData = sortedMapped;
            else if (active === 'Plan To Watch') planToWatchData = sortedMapped;
          }
        } catch {
          // Ignore
        }
      }

      Setwatching(watchingData);
      Setcompleted(completedData);
      Setonhold(onHoldData);
      Setdropped(droppedData);
      Setplan(planToWatchData);

      // 4. Parse slicearr count
      let initialSlice = 30;
      const savedSlice = sessionStorage.getItem('slicearr');
      if (savedSlice) {
        const parsedSlice = parseInt(savedSlice, 10);
        if (Number.isInteger(parsedSlice) && parsedSlice >= 30) {
          initialSlice = parsedSlice;
        }
      }
      setpagearr(initialSlice);

      setMounted(true);

      // 5. Delay infinite scroll registration to prevent mount jitter
      setTimeout(() => {
        setIsInitialRestoreComplete(true);
      }, 50);
    });
  }, []);

  // Listen for watchlist sync completion events to silently refresh data in the UI
  useEffect(() => {
    if (!mounted) return;

    const handleSyncComplete = () => {
      const watchingMap = getWatchlistMap('Watching');
      const completedMap = getWatchlistMap('Completed');
      const onHoldMap = getWatchlistMap('OnHold');
      const droppedMap = getWatchlistMap('Dropped');
      const planToWatchMap = getWatchlistMap('PlanToWatch');

      Setwatching(Array.from(watchingMap.entries()));
      Setcompleted(Array.from(completedMap.entries()));
      Setonhold(Array.from(onHoldMap.entries()));
      Setdropped(Array.from(droppedMap.entries()));
      Setplan(Array.from(planToWatchMap.entries()));
    };

    window.addEventListener('watchlist-sync-complete', handleSyncComplete);
    return () => {
      window.removeEventListener('watchlist-sync-complete', handleSyncComplete);
    };
  }, [mounted]);

  // Synchronize logout across tabs
  useEffect(() => {
    if (!mounted || !logoutChannel) return;
    const channel = logoutChannel;
    const handleLogout = (e: MessageEvent) => {
      if (e.data === 'logout') {
        window.location.reload();
      }
    };
    channel.addEventListener('message', handleLogout);
    return () => {
      channel.removeEventListener('message', handleLogout);
    };
  }, [mounted]);

  // Swipe callbacks
  const tabArray = ['Plan To Watch', 'Completed', 'Watching', 'On Hold', 'Dropped'];

  function moveToNextTab() {
    const normalized = normalizeTab(activetab);
    const index = tabArray.indexOf(normalized);
    const nextTab = index === tabArray.length - 1 ? tabArray[0] : tabArray[index + 1];
    handletabchange(nextTab);
  }

  function moveToPrevTab() {
    const normalized = normalizeTab(activetab);
    const index = tabArray.indexOf(normalized);
    const prevTab = index === 0 ? tabArray[tabArray.length - 1] : tabArray[index - 1];
    handletabchange(prevTab);
  }

  useSwipeGesture('x-axis', [moveToNextTab, moveToPrevTab], 100);

  // Scroll handler for infinite scroll
  const getActiveTabRows = useCallback((): any[] => {
    if (activetab === 'Watching') return watchinmap;
    if (activetab === 'Completed') return completedmap;
    if (activetab === 'On Hold') return onholdmap;
    if (activetab === 'Dropped') return droppedmap;
    return planmap;
  }, [activetab, watchinmap, completedmap, onholdmap, droppedmap, planmap]);

  useEffect(() => {
    if (!mounted || !isInitialRestoreComplete) return;

    let isFetching = false;

    function scrollhandler() {
      if (isFetching) return;
      
      const threshold = 200;
      const reachedBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - threshold;

      if (reachedBottom) {
        const activeRows = getActiveTabRows();
        if (currentpagearr < activeRows.length) {
          isFetching = true;
          const nextSlice = currentpagearr + 30;
          setpagearr(nextSlice);
          sessionStorage.setItem('slicearr', String(nextSlice));
          
          setTimeout(() => {
            isFetching = false;
          }, 100);
        }
      }
    }

    window.addEventListener('scroll', scrollhandler);
    return () => {
      window.removeEventListener('scroll', scrollhandler);
    };
  }, [mounted, isInitialRestoreComplete, currentpagearr, getActiveTabRows]);

  useScrollSaver([currentpagearr, planmap, watchinmap, droppedmap, onholdmap, completedmap]);

  function handletabchange(value: string) {
    const normalized = normalizeTab(value);
    Setactivetab(normalized);
    sessionStorage.setItem('activetab', normalized);

    // Reset state on tab change
    sessionStorage.setItem('scrollY', '0');
    setpagearr(30);
    sessionStorage.setItem('slicearr', '30');
    sessionStorage.removeItem('sort_type');
    sessionStorage.removeItem('sorted_anime');

    const watchingMap = getWatchlistMap('Watching');
    const completedMap = getWatchlistMap('Completed');
    const onHoldMap = getWatchlistMap('OnHold');
    const droppedMap = getWatchlistMap('Dropped');
    const planToWatchMap = getWatchlistMap('PlanToWatch');

    Setwatching(Array.from(watchingMap.entries()));
    Setcompleted(Array.from(completedMap.entries()));
    Setonhold(Array.from(onHoldMap.entries()));
    Setdropped(Array.from(droppedMap.entries()));
    Setplan(Array.from(planToWatchMap.entries()));

    window.scrollTo(0, 0);
  }

  if (!mounted) return null;

  return (
    <>
      <Navbar
        isLoading={isloading}
        Setcompleted={Setcompleted}
        Setplan={Setplan}
        Setwatching={Setwatching}
        Setonhold={Setonhold}
        Setdropped={Setdropped}
        SetpageArr={setpagearr}
      />
      <Toaster className='fixed top-0 z-[1000]' richColors />
      <Tabs defaultValue="Plan To Watch" value={activetab} onValueChange={handletabchange} className="relative top-20 w-full border-0 bg-background">
        <TabsList style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} className='no-scrollbar fixed top-20 z-[2] w-full justify-start gap-1 overflow-auto rounded-none border-b border-white/10 bg-[#08090b]/95 px-2 py-2 text-black backdrop-blur-xl'>
          <TabsTrigger className='h-9 rounded-md border-0 px-3 text-sm text-slate-400 data-[state=active]:bg-white/[0.08] data-[state=active]:text-white' value="Plan To Watch">Plan To Watch</TabsTrigger>
          <TabsTrigger className='h-9 rounded-md border-0 px-3 text-sm text-slate-400 data-[state=active]:bg-white/[0.08] data-[state=active]:text-white' value="Completed">Completed</TabsTrigger>
          <TabsTrigger className='h-9 rounded-md border-0 px-3 text-sm text-slate-400 data-[state=active]:bg-white/[0.08] data-[state=active]:text-white' value="Watching">Watching</TabsTrigger>
          <TabsTrigger className='h-9 rounded-md border-0 px-3 text-sm text-slate-400 data-[state=active]:bg-white/[0.08] data-[state=active]:text-white' value="On Hold">On Hold</TabsTrigger>
          <TabsTrigger className='h-9 rounded-md border-0 px-3 text-sm text-slate-400 data-[state=active]:bg-white/[0.08] data-[state=active]:text-white' value="Dropped">Dropped</TabsTrigger>
        </TabsList>

        {MYLIST_TABS.map((tab) => {
          let rows: any[] = [];
          if (tab.label === 'Watching') rows = watchinmap;
          else if (tab.label === 'Completed') rows = completedmap;
          else if (tab.label === 'On Hold') rows = onholdmap;
          else if (tab.label === 'Dropped') rows = droppedmap;
          else rows = planmap;

          return (
            <TabsContent key={tab.label} className='relative top-14 pb-36 sm:pb-20' value={tab.label}>
              {isloading ? (
                <p className="empty-state text-white">Loading please wait</p>
              ) : rows.length !== 0 ? (
                <div className="flex w-full flex-col pb-8 sm:pb-0 lg:grid lg:grid-cols-2 lg:grid-rows lg:gap-3 lg:p-4">
                  {rows.slice(0, currentpagearr).map(([key, value]) => {
                    const normalized = normalizeRowItem(value);
                    return (
                      <Link key={normalized.id} href={`/mylist/${tab.hrefSegment}/${normalized.id}`} className="block min-w-0 lg:h-full">
                        <Horizontalcard
                          className=''
                          mal_id={normalized.id}
                          image={normalized.image}
                          status={normalized.status}
                          season={normalized.season}
                          episodes={normalized.episodes}
                          title={normalized.title}
                          score={normalized.score}
                          users={normalized.users}
                          ranking={normalized.ranking}
                          genre={normalized.genres}
                          user_episode={normalized.userProgress}
                        />
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <p className="text-lg font-semibold text-white">No shows in record yet</p>
                  <p className="text-sm text-slate-400">Add anime from a detail page and they will appear here.</p>
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </>
  );
}
