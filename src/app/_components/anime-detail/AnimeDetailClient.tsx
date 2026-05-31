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
import { ChevronDown, ChevronUp, Monitor, Clock } from 'lucide-react';

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
    <main className="app-shell pb-28 sm:pb-10">
      <Navbar sectionTitle={detail.displayTitle} />
      <div className="relative flex flex-col pt-20">
        <Horizontalcard
          key={detail.malId}
          image={detail.imageUrl ?? ''}
          bannerImage={detail.bannerImageUrl}
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
          <div className="mx-5 my-5 flex flex-col gap-3 rounded-md border border-white/10 bg-card px-4 py-4 text-white sm:mx-8 sm:flex-row sm:items-center sm:justify-around">
            {detail.duration && (
              <div className="flex flex-row flex-wrap items-center gap-2 text-slate-200">
                <Clock className="size-5 text-primary" />
                <span>
                  {(() => {
                    const lower = detail.duration.toLowerCase();
                    if (lower.includes('ep') || lower.includes('episode')) {
                      const cleanDuration = detail.duration.replace(/\bper ep\.?$/i, 'per episode');
                      return `Duration: ${cleanDuration}`;
                    }
                    if (detail.episodes === 1) {
                      return `Duration: ${detail.duration}`;
                    }
                    return `Duration: ${detail.duration} per episode`;
                  })()}
                </span>
              </div>
            )}
            {detail.broadcast && (
              <div className="flex flex-row flex-wrap items-center gap-2 text-slate-200">
                <Monitor className="size-5 text-primary" />
                {detail.broadcast.day && <span>{detail.broadcast.day}</span>}
                {detail.broadcast.time && <span>{detail.broadcast.time}</span>}
                {detail.broadcast.timezone && <span>{detail.broadcast.timezone}</span>}
              </div>
            )}
          </div>
        )}

        <section className="border-b border-white/10 px-5 pb-6 sm:px-8">
          <h4 className="mb-4 inline-block text-start font-poppins text-2xl font-bold text-white">
            Synopsis
          </h4>
          <div className="section-title-rule mb-5" />
          <div
            ref={synopsis_ref}
            className={`relative z-[1] text-pretty text-base leading-7 text-slate-200 ${
              isExpanded ? '' : 'max-h-30 line-clamp-5 overflow-hidden'
            }`}
          >
            {detail.synopsis || 'No synopsis available.'}
            {showDropdown && (
              <div
                onClick={() => SetExpanded(!isExpanded)}
                className={`absolute bottom-[-10px] z-[3] flex w-full cursor-pointer items-center justify-end bg-gradient-to-b from-transparent to-background text-slate-400 ${
                  isExpanded ? 'h-10' : 'h-full'
                }`}
              >
                {isExpanded ? (
                  <ChevronUp className="size-9" />
                ) : (
                  <ChevronDown className="size-9" />
                )}
              </div>
            )}
          </div>
        </section>

        {detail.trailerEmbedUrl && (
          <iframe
            className="mx-5 my-6 aspect-video rounded-md border border-white/10 bg-card sm:mx-auto sm:w-[50rem]"
            src={detail.trailerEmbedUrl}
            title={`${detail.displayTitle} trailer`}
          />
        )}

        <section className="mx-5 rounded-md border border-white/10 bg-card px-5 py-5 sm:mx-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col justify-center gap-2">
            <p className="text-sm text-slate-400">English</p>
            <p className="text-left">{detail.englishTitle || 'N/A'}</p>
          </div>
              <div>
              <p className="text-sm text-slate-400">Source</p>
                <p>{detail.source || 'Unknown'}</p>
              </div>
              <div>
              <p className="text-sm text-slate-400">Studio</p>
                {detail.studios.length > 0 ? (
                  detail.studios.map(studio => <p key={studio}>{studio}</p>)
                ) : (
                  <p>Unknown</p>
                )}
              </div>
              <div>
              <p className="text-sm text-slate-400">Rating</p>
                <p>{detail.rating || 'Unknown'}</p>
              </div>
              <div>
              <p className="text-sm text-slate-400">Season</p>
                <p>{detail.seasonLabel || 'Unknown'}</p>
              </div>
              <div>
              <p className="text-sm text-slate-400">Aired</p>
                <p>{detail.airedLabel || 'Unknown'}</p>
              </div>
              <div>
              <p className="text-sm text-slate-400">Licensor</p>
                {detail.licensors.length > 0 ? (
                  detail.licensors.map(licensor => <p key={licensor}>{licensor}</p>)
                ) : (
                  <p>Unknown</p>
                )}
              </div>
          </div>
        </section>

        <section className='flex w-full flex-col gap-4 overflow-hidden px-5 py-6 sm:px-8'>
          {detail.relations.length > 0 ? (
            detail.relations.map((relation, relationIndex) => (
              <div className='overflow-hidden rounded-md border border-white/10 bg-card p-4' key={`${relation.relation}-${relationIndex}`}>
                <p className='mb-2 text-sm text-slate-400'>{relation.relation}</p>
                {relation.relation !== 'Adaptation' ? (
                  relation.entries.map((entry) => (
                    <Link
                      key={`${relation.relation}-${entry.malId}`}
                      href={buildRelationHrefFromContext(context, entry.malId)}
                    >
                      <p className='text-primary'>{entry.name}</p>
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
        </section>
        <Add_to_watchlist_button
          mal_id={detail.malId}
          to={buildTrackingHrefFromContext(context)}
        />
      </div>
    </main>
  );
}
