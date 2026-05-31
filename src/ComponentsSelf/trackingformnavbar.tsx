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
    <nav className="fixed border-b-1 border-gray-700 z-50 bg-black w-screen pl-4 h-20 px-2 pr-4 mb-3 top-0 left-0 flex flex-row items-center justify-between">
      <div className="flex flex-row items-center gap-2 sm:gap-2">
        <Link href={backHref}>
          <Button className="bg-zinc-800 text-white" variant="secondary" size="icon">
            <ChevronLeft />
          </Button>
        </Link>
        <p className="line-clamp-1 overflow-hidden text-ellipsis text-2xl ml-2 text-white font-bold text-left">
          {props.searchtitle}
        </p>
      </div>
      <Button
        type="button"
        className="hover:bg-gray-300 hover:text-black text-blue-400"
        onClick={props.savebutton}
      >
        Save
      </Button>
    </nav>
  );
}
