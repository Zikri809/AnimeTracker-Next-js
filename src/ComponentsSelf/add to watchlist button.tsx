"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCurrentRoute } from '@/hooks/use-current-route';
import { buildTrackingHref } from '@/lib/routing/path-utils';
import { getWatchlistButtonContent } from '@/Utility/loadfromlocal';

interface AddToWatchlistButtonProps {
  to?: string;
  mal_id?: string | number;
  relation_id?: string | number;
}

export default function AddToWatchlistButton(props: AddToWatchlistButtonProps) {
  const { isReady, pathname, params } = useCurrentRoute();
  const [user_state, Setusersstate] = useState<React.ReactNode>(null);

  const malId = props.mal_id ?? params.mal_id;
  const relationId = props.relation_id ?? params.relation_id;

  useEffect(() => {
    if (typeof window !== 'undefined' && isReady) {
      const content = getWatchlistButtonContent({ malId, relationId });
      Promise.resolve().then(() => {
        Setusersstate(content);
      });
    }
  }, [isReady, pathname, malId, relationId]);

  const targetHref = props.to || buildTrackingHref({ pathname, params });

  return (
    <Link href={targetHref}>
      <Button
        type="button"
        size="default"
        className="p-4 sm:p-5 z-10 sm:text-lg fixed right-0 bottom-15 sm:bottom-0 mb-5 bg-gray-800 mr-5 hover:bg-gray-300 hover:text-black text-blue-100"
      >
        {user_state}
      </Button>
    </Link>
  );
}
