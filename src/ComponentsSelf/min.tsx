"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCurrentRoute } from '@/hooks/use-current-route';
import { buildRelationHref } from '@/lib/routing/path-utils';

interface RelationProps {
  id: string | number;
}

interface RelationEntry {
  mal_id: number;
  type: string;
  name: string;
  url: string;
}

interface RelationObject {
  relation: string;
  entry: RelationEntry[];
}

export default function RelationComponent(props: RelationProps) {
  const [animerelinfo, Setanimerelinfo] = useState<RelationObject[]>([]);
  const [isloading, Setloading] = useState(true);
  const { pathname } = useCurrentRoute();

  useEffect(() => {
    let active = true;
    async function fetchapi() {
      try {
        const response = await fetch('https://api.jikan.moe/v4/anime/' + props.id + '/relations');
        const apirelfeedback = await response.json();
        if (active) {
          const showrelinfo = apirelfeedback.data;
          Setanimerelinfo(showrelinfo || []);
          Setloading(false);
        }
      } catch (error) {
        if (active) {
          setTimeout(fetchapi, 2000);
        }
        console.error(error);
      }
    }
    fetchapi();
    return () => {
      active = false;
    };
  }, [props.id]);

  return (
    <div className='flex bg-black overflow-hidden w-screen px-5 py-4 flex-wrap flex-col justify-between'>
      {isloading ? (
        <p>loading</p>
      ) : (
        animerelinfo && animerelinfo.length > 0 ? (
          animerelinfo.map((object, idx) => (
            <div className='overflow-hidden' key={`rel-${idx}-${object.relation}`}>
              <p className='text-gray-400'>{object.relation}</p>
              {object.relation !== 'Adaptation' ? (
                object.entry.map((entry) => {
                  const href = buildRelationHref({ pathname, relationId: entry.mal_id });
                  return (
                    <Link key={`entry-${entry.mal_id}`} href={href}>
                      <p className='text-blue-500'>{entry.name}</p>
                    </Link>
                  );
                })
              ) : (
                object.entry.map((entry) => (
                  <p className='text-white' key={`entry-${entry.mal_id}`}>{entry.name}</p>
                ))
              )}
            </div>
          ))
        ) : (
          <p className='hidden'></p>
        )
      )}
    </div>
  );
}
