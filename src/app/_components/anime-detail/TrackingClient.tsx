'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Navbar from '@/ComponentsSelf/trackingformnavbar';
import Numberedcarousel from '@/ComponentsSelf/numbered carousel';
import { Toaster } from "@/components/ui/sonner";
import { AlertTriangle, Trash } from 'lucide-react';
import { fetchAuthSession } from '@/lib/auth-session';

import savehandler_tracking from '@/Utility/tracking/savehandler_tracking';
import last_clicktracking from '@/Utility/tracking/lastclick_tracking';
import delete_show_tracking from '@/Utility/tracking/deleteshow_tracking';
import completed_click from '@/Utility/tracking/completed_click';
import status_button from '@/Utility/tracking/statusbutton';

import { MalTrackingItem } from '@/Utility/tracking/mal-tracking-item';
import { DetailRouteContext } from '@/lib/routing/detail-route-context';
import { getAnimeWatchlistStatus } from '@/Utility/tracking/watchlist-storage';

type Props = {
  malDetail: MalTrackingItem;
  context: DetailRouteContext;
  malSearchVisible: boolean | null;
};

export default function TrackingClient({ malDetail, context, malSearchVisible }: Props) {
  const router = useRouter();
  const [api, setApi] = useState<any>(null);
  const [api2, setApi2] = useState<any>(null);
  const [status, setStatus] = useState('');
  const [isAdded, setAdded] = useState(false);
  const [isSessionAuthenticated, setIsSessionAuthenticated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const btnRef = useRef<any[]>([]);

  const routerAdapter = {
    push: (href: string) => router.push(href),
    currentPath: context.pathname,
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      setIsMounted(true);
    });
    fetchAuthSession().then((session) => {
      setIsSessionAuthenticated(session.authenticated);
    });
  }, []);

  useEffect(() => {
    if (isMounted) {
      const currentStatus = getAnimeWatchlistStatus(malDetail.node.id);
      Promise.resolve().then(() => {
        setAdded(currentStatus.key !== null);
      });
    }
  }, [isMounted, malDetail.node.id]);

  useEffect(() => {
    if (isMounted && api != null && api2 != null) {
      last_clicktracking(btnRef, api, api2, undefined, malDetail.node.id);
    }
  }, [isMounted, api, api2, malDetail.node.id]);

  function handleDelete() {
    delete_show_tracking(malDetail, setAdded, routerAdapter, status);
  }

  function handleSave() {
    savehandler_tracking(malDetail, status, api, api2, setAdded, routerAdapter);
  }

  function handleCompletedClick(e: any) {
    const numEps = malDetail.node.num_episodes ?? 0;
    completed_click(e, api, btnRef, setStatus, numEps);
  }

  function handleStatusButton(e: any) {
    status_button(e, btnRef, setStatus);
  }

  const safeEpisodeCount = malDetail.node.num_episodes ?? 0;
  const progressCarouselLength = Math.max(1, safeEpisodeCount + 1);

  const statusDisplay = malDetail.node.status
    ? malDetail.node.status.split('_').map(word => word[0].toUpperCase() + word.slice(1)).join(' ')
    : 'Unknown';

  const showTitle = malDetail.node.alternative_titles?.en || malDetail.node.title || 'Anime';

  const isNotYetAired = malDetail.node.status === 'not_yet_aired';
  const isCurrentlyAiring = malDetail.node.status === 'currently_airing';

  return (
    <div className="bg-black w-screen h-[100vh] mb-15 sm:mb-0 overflow-hidden text-white font-poppins antialiased">
      <Navbar searchtitle={showTitle} savebutton={handleSave} />
      <Toaster richColors />
      <div key={malDetail.node.id} className="relative top-25 flex px-5 flex-col">
        <div className="pb-5 flex flex-row text-gray-400 text-xl justify-between items-center">
          <p>Status</p>
          <p>{statusDisplay}</p>
        </div>
        <div className="flex mb-5 flex-row justify-center w-full border-0 border-blue-500">
          <div className="flex flex-row gap-2 w-fit flex-wrap">
             {isNotYetAired ? (
              <Button
                disabled
                variant="outline"
                type="button"
                ref={(el) => { btnRef.current[0] = el; }}
                className="bg-black rounded-sm border-gray-400 text-white focus:bg-black"
              >
                Watching
              </Button>
            ) : (
              <Button
                ref={(el) => { btnRef.current[0] = el; }}
                variant="outline"
                type="button"
                onClick={handleStatusButton}
                className="bg-black rounded-sm border-gray-400 text-white hover:text-green-500 focus:bg-black"
              >
                Watching
              </Button>
            )}

            {isNotYetAired || isCurrentlyAiring ? (
              <Button
                disabled
                type="button"
                ref={(el) => { btnRef.current[1] = el; }}
                variant="outline"
                className="bg-black rounded-sm border-gray-400 text-white"
              >
                Completed
              </Button>
            ) : (
              <Button
                ref={(el) => { btnRef.current[1] = el; }}
                type="button"
                variant="outline"
                onClick={handleCompletedClick}
                className="bg-black rounded-sm border-gray-400 text-white hover:text-blue-400 focus:bg-black"
              >
                Completed
              </Button>
            )}

            <Button
              variant="outline"
              ref={(el) => { btnRef.current[2] = el; }}
              type="button"
              onClick={handleStatusButton}
              className="bg-black rounded-sm border-gray-400 text-white hover:text-indigo-500 focus:bg-black"
            >
              Plan To Watch
            </Button>
            <Button
              variant="outline"
              ref={(el) => { btnRef.current[3] = el; }}
              type="button"
              onClick={handleStatusButton}
              className="bg-black rounded-sm border-gray-400 text-white hover:text-yellow-300 focus:bg-black"
            >
              On Hold
            </Button>
            <Button
              variant="outline"
              ref={(el) => { btnRef.current[4] = el; }}
              type="button"
              onClick={handleStatusButton}
              className="bg-black rounded-sm border-gray-400 text-white hover:text-red-500 focus:bg-black"
            >
              Dropped
            </Button>
          </div>
        </div>

        <div className="pb-5 text-xl flex flex-row text-gray-400 justify-between items-center">
          <p>Your Progress</p>
          <p>{malDetail.node.num_episodes !== null ? `${malDetail.node.num_episodes} ep` : 'Unknown'}</p>
        </div>
        <Numberedcarousel apiref={setApi} length={progressCarouselLength} />

        <div className="pb-5 text-xl flex flex-row text-gray-400 justify-between items-center">
          <p>Score</p>
        </div>
        <Numberedcarousel apiref={setApi2} length={11} />

        <div className="w-full flex mb-4 bg-gray-800 text-gray-200 rounded-md py-5 px-5 flex-col">
          <p>Note:</p>
          <p>
            {isSessionAuthenticated
              ? 'Your watchlist are saved locally and on your MyAnimeList account be aware that cross synchronization is possible you can access your watchlist on other devices'
              : 'Your Watchlist are saved exclusively on this device please be aware that cross syncronization is not possible as of now'}
          </p>
        </div>

        {isSessionAuthenticated && malSearchVisible === false ? (
          <div className="mb-4 flex w-full flex-col gap-2 rounded-md border border-amber-400/25 bg-amber-400/10 px-5 py-4 text-amber-100">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="size-5 text-amber-300" />
              <p>MAL sync may hide this title</p>
            </div>
            <p className="text-sm text-amber-100/80">
              This title exists by ID, but does not appear in official MAL search. AniJikan will only keep it after MAL save and list sync both confirm it.
            </p>
          </div>
        ) : null}

        {isAdded ? (
          <Button variant="destructive" onClick={handleDelete} className="sm:w-60">
            <Trash size={32} />Remove from Watchlist
          </Button>
        ) : (
          <Button variant="destructive" disabled className="sm:w-60">
            <Trash size={32} />Remove from Watchlist
          </Button>
        )}
      </div>
    </div>
  );
}
