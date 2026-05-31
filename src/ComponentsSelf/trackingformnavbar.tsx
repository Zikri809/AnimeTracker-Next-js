"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from 'next/link';
import { useCurrentRoute } from "@/hooks/use-current-route";
import { buildTrackingBackHref } from "@/lib/routing/path-utils";

interface TrackingFormNavbarProps {
  searchtitle: string;
  savebutton: () => void;
}

export default function TrackingFormNavbar(props: TrackingFormNavbarProps) {
  const { pathname } = useCurrentRoute();
  const backHref = buildTrackingBackHref(pathname);

  return (
    <nav className="app-header">
      <div className="flex min-w-0 flex-row items-center gap-3">
        <Link href={backHref}>
          <Button className="icon-button" variant="secondary" size="icon" aria-label="Go back">
            <ChevronLeft />
          </Button>
        </Link>
        <p className="line-clamp-1 overflow-hidden text-ellipsis text-xl text-white font-bold text-left sm:text-2xl">
          {props.searchtitle}
        </p>
      </div>
      <Button
        type="button"
        className="primary-action h-10 px-5"
        onClick={props.savebutton}
      >
        Save
      </Button>
    </nav>
  );
}
