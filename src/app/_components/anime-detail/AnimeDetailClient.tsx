'use client';

import React, { useEffect, useState, useRef } from 'react';
import Horizontalcard from '@/ComponentsSelf/animecardheader';
import Navbar from '@/ComponentsSelf/detailednavbar';
import Add_to_watchlist_button from '@/ComponentsSelf/add to watchlist button';
import { useDebounce } from '@uidotdev/usehooks';
import { JikanAnimeDetailViewModel } from '@/server/anime/jikan-detail-normalize';
import {
  DetailRouteContext,
  buildRelationHrefFromContext,
  buildTrackingHrefFromContext,
} from '@/lib/routing/detail-route-context';
import Link from 'next/link';

type Props = {
  detail: JikanAnimeDetailViewModel;
  context: DetailRouteContext;
};

export default function AnimeDetailClient({ detail, context }: Props) {
  const [windowinner, Setwindow] = useState<number>(0);
  const debouncebrowserwidth = useDebounce(windowinner, 200);
  const synopsis_ref = useRef<HTMLDivElement>(null);

  const [showDropdown, SetShowDropdown] = useState(false);
  const [isExpanded, SetExpanded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      Promise.resolve().then(() => {
        Setwindow(window.innerWidth);
      });
      const handleResize = () => {
        Setwindow(window.innerWidth);
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    if (synopsis_ref.current) {
      if (synopsis_ref.current.scrollHeight > synopsis_ref.current.offsetHeight) {
        SetShowDropdown(true);
      } else {
        SetShowDropdown(false);
      }
    }
  }, [debouncebrowserwidth, detail.synopsis]);

  const showBroadcast = detail.status === 'Currently Airing' || detail.status === 'Finished Airing';

  return (
    <main className="relative overflow-x-hidden top-0 left-0 m-0 w-screen h-auto overflow-hidden bg-black text-white font-poppins my-1 antialiased">
      <Navbar sectionTitle={detail.displayTitle} />
      <div className="relative top-20 flex pb-38 sm:pb-30 flex-col">
        <Horizontalcard
          key={detail.malId}
          image={detail.imageUrl ?? ''}
          status={detail.status ?? 'Unknown'}
          season={detail.seasonLabel || ' '}
          episodes={detail.episodes}
          title={detail.displayTitle}
          score={detail.score ?? undefined}
          users={detail.scoredBy ?? 'N/A'}
          ranking={detail.popularity ?? 'N/A'}
          genre={detail.genres.map(g => ({ mal_id: g.id, name: g.name }))}
          favorites={detail.favorites ?? 'N/A'}
        />

        {showBroadcast && (detail.duration || detail.broadcast) && (
          <div className="px-6 py-4 border-none justify-around mb-4 text-white items-center bg-neutral-900 flex flex-row border-gray-600">
            {detail.duration && <span>{detail.duration}</span>}
            {detail.broadcast && (
              <div className="flex flex-row gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125Z"
                  />
                </svg>
                {detail.broadcast.day && <span>{detail.broadcast.day}</span>}
                {detail.broadcast.time && <span>{detail.broadcast.time}</span>}
                {detail.broadcast.timezone && <span>{detail.broadcast.timezone}</span>}
              </div>
            )}
          </div>
        )}

        <div className="px-6 border-b-1 border-gray-600 pb-5">
          <h4 className="text-start font-bold text-2xl mb-5 font-poppins inline-block border-b-1 pb-1 border-white">
            Synopsis
          </h4>
          <div
            ref={synopsis_ref}
            className={`relative text-justify z-[1] ${
              isExpanded ? '' : 'max-h-30 line-clamp-5 overflow-hidden'
            }`}
          >
            {detail.synopsis || 'No synopsis available.'}
            {showDropdown && (
              <div
                onClick={() => SetExpanded(!isExpanded)}
                className={`absolute bottom-[-10px] z-[3] w-full flex items-center text-neutral-500 justify-end bg-gradient-to-b to-black cursor-pointer ${
                  isExpanded ? 'h-10' : 'h-full'
                }`}
              >
                {isExpanded ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-chevron-up-icon lucide-chevron-up"
                  >
                    <path d="m18 15-6-6-6 6" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-chevron-down-icon lucide-chevron-down"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                )}
              </div>
            )}
          </div>
        </div>

        {detail.trailerEmbedUrl && (
          <iframe
            className="border-1 border-gray-700 my-4 mx-6 sm:mx-auto sm:w-200 aspect-video"
            src={detail.trailerEmbedUrl}
          />
        )}

        <div className="bg-neutral-900 px-5 py-4 flex flex-col gap-10">
          <div className="flex flex-col justify-center gap-2">
            <p className="text-gray-400">English</p>
            <p className="text-left">{detail.englishTitle || 'N/A'}</p>
          </div>
          <div className="flex flex-row gap-10">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-gray-400">Source</p>
                <p>{detail.source || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-gray-400">Studio</p>
                {detail.studios.length > 0 ? (
                  detail.studios.map(studio => <p key={studio}>{studio}</p>)
                ) : (
                  <p>Unknown</p>
                )}
              </div>
              <div>
                <p className="text-gray-400">Rating</p>
                <p>{detail.rating || 'Unknown'}</p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-gray-400">Season</p>
                <p>{detail.seasonLabel || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-gray-400">Aired</p>
                <p>{detail.airedLabel || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-gray-400">Licensor</p>
                {detail.licensors.length > 0 ? (
                  detail.licensors.map(licensor => <p key={licensor}>{licensor}</p>)
                ) : (
                  <p>Unknown</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className='flex bg-black overflow-hidden w-screen px-5 py-4 flex-wrap flex-col justify-between'>
          {detail.relations.length > 0 ? (
            detail.relations.map((relation, relationIndex) => (
              <div className='overflow-hidden' key={`${relation.relation}-${relationIndex}`}>
                <p className='text-gray-400'>{relation.relation}</p>
                {relation.relation !== 'Adaptation' ? (
                  relation.entries.map((entry) => (
                    <Link
                      key={`${relation.relation}-${entry.malId}`}
                      href={buildRelationHrefFromContext(context, entry.malId)}
                    >
                      <p className='text-blue-500'>{entry.name}</p>
                    </Link>
                  ))
                ) : (
                  relation.entries.map((entry) => (
                    <p className='text-white' key={`${relation.relation}-${entry.malId}`}>
                      {entry.name}
                    </p>
                  ))
                )}
              </div>
            ))
          ) : (
            <p className='hidden'></p>
          )}
        </div>
        <Add_to_watchlist_button
          mal_id={detail.malId}
          to={buildTrackingHrefFromContext(context)}
        />
      </div>
    </main>
  );
}
