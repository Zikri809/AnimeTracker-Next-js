import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from 'next/link';
import AnimeListSort from "./sort/anime_list_sort";

interface MoreNavbarProps {
  sectionTitle: string;
  SetAnimeArr: (arr: any[]) => void;
  IsUpdateRef: React.MutableRefObject<boolean>;
  SetpageArr: (page: number) => void;
  season?: string | null;
  year?: number | null;
  defaultArr: any[];
}

export default function MoreNavbar({
  sectionTitle,
  SetAnimeArr,
  IsUpdateRef,
  SetpageArr,
  season = null,
  year = null,
  defaultArr
}: MoreNavbarProps) {
  function resetslicearr() {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    if (pathname) {
      sessionStorage.setItem(`season-list:${pathname}:slicearr`, JSON.stringify(30));
      sessionStorage.removeItem(`season-list:${pathname}:sort_type`);
      sessionStorage.removeItem(`season-list:${pathname}:sorted_anime`);
    }
  }

  return (
    <nav className="app-header">
      <div className="flex min-w-0 items-center gap-3">
        <Link href={'/'}>
          <Button onClick={resetslicearr} className='icon-button' variant="secondary" size="icon" aria-label="Go back">
            <ChevronLeft />
          </Button>
        </Link>
        <p className="line-clamp-1 overflow-hidden text-ellipsis text-xl text-white font-bold text-left sm:text-2xl">
          {sectionTitle}
        </p>
      </div>
      <AnimeListSort
        SetAnimeArr={SetAnimeArr}
        IsUpdateRef={IsUpdateRef}
        SetpageArr={SetpageArr}
        season={season}
        year={year}
        defaultArr={defaultArr}
      />
    </nav>
  );
}
