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
    sessionStorage.setItem('slicearr', JSON.stringify(30));
    sessionStorage.removeItem('sort_type');
    sessionStorage.removeItem('sorted_anime');
  }

  return (
    <nav className="fixed border-b border-gray-700 z-10 bg-black w-screen pl-4 h-20 px-2 pr-4 mb-3 top-0 left-0 flex flex-row items-center justify-between">
      <div className="flex items-center gap-2">
        <Link href={'/'}>
          <Button onClick={resetslicearr} className='bg-zinc-800 text-white hover:text-black hover:bg-zinc-400' variant="secondary" size="icon">
            <ChevronLeft />
          </Button>
        </Link>
        <p className="line-clamp-1 overflow-hidden text-ellipsis text-xl ml-2 text-white font-bold text-center">
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
