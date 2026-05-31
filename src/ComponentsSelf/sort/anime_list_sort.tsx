import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import top_score from "@/Utility/filter/top_score";
import top_member from "@/Utility/filter/top_members";
import airing_sort from "@/Utility/filter/airing_sort";
import completed_sort from "@/Utility/filter/completed_sort";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { UsersRound, LaptopMinimalCheck, Radio, ArrowDown10 } from 'lucide-react';

interface AnimeListSortProps {
  SetAnimeArr: (arr: any[]) => void;
  IsUpdateRef: React.MutableRefObject<boolean>;
  SetpageArr: (page: number) => void;
  season?: string | null;
  year?: number | null;
  defaultArr: any[];
}

export default function AnimeListSort({
  SetAnimeArr,
  IsUpdateRef,
  SetpageArr,
  defaultArr
}: AnimeListSortProps) {
  const [toggleValue, SetTogglevalue] = useState('');
  const [isOpenDropDown, SetOpenDropDown] = useState(false);

  function toggleValueHandler(selectedValue: string) {
    console.log('this works when value of the radio changes');
    const anime_data = defaultArr;
    let sorted: any[] = [];
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    switch (selectedValue) {
      case 'TopScore': {
        sorted = top_score(anime_data);
        break;
      }
      case 'Top Member': {
        sorted = top_member(anime_data);
        break;
      }
      case 'Completed': {
        sorted = completed_sort(anime_data);
        break;
      }
      case 'Airing': {
        sorted = airing_sort(anime_data);
        break;
      }
      default: {
        if (pathname) {
          sessionStorage.removeItem(`season-list:${pathname}:sort_type`);
          sessionStorage.removeItem(`season-list:${pathname}:sorted_anime`);
          sessionStorage.removeItem(`season-list:${pathname}:slicearr`);
        }
        sessionStorage.setItem('scrollY', JSON.stringify(0));

        SetAnimeArr(defaultArr);
        SetpageArr(30);
        IsUpdateRef.current = true;
        if (pathname) {
          sessionStorage.setItem(`season-list:${pathname}:slicearr`, '30');
        }
        window.scrollTo(0, 0);
        SetOpenDropDown(false);
        return;
      }
    }

    if (pathname) {
      sessionStorage.setItem(`season-list:${pathname}:sort_type`, JSON.stringify(selectedValue));
      sessionStorage.setItem(`season-list:${pathname}:sorted_anime`, JSON.stringify(sorted.length === 0 ? '' : sorted));
      sessionStorage.setItem(`season-list:${pathname}:slicearr`, '30');
    }

    SetAnimeArr(sorted);
    SetpageArr(30);
    IsUpdateRef.current = true;
    SetOpenDropDown(false);
    window.scrollTo(0, 0);
  }

  function menuTriggerHandler() {
    console.log('click trigger the restore');
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const storedSortType = pathname
      ? sessionStorage.getItem(`season-list:${pathname}:sort_type`)
      : null;
    SetTogglevalue(JSON.parse(storedSortType || 'null') ?? '');
    SetOpenDropDown(!isOpenDropDown);
  }

  return (
    <DropdownMenu open={isOpenDropDown} onOpenChange={SetOpenDropDown}>
      <DropdownMenuTrigger asChild>
        <Button
          type='button'
          onPointerDown={menuTriggerHandler}
          className='bg-white text-black w-10 h-10 p-2 rounded-md hover:bg-black hover:text-white hover:border-1 hover:border-neutral-400 transition-colors outline-none ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0'
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="lucide lucide-funnel-icon lucide-funnel"
          >
            <path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z" />
          </svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side='left'
        collisionPadding={40}
        className='bg-white/10 backdrop-blur-sm border-2 border-neutral-600 p-4 transition-transform ease-linear w-full'
      >
        <ToggleGroup
          type='single'
          defaultValue={toggleValue}
          onValueChange={toggleValueHandler}
          orientation='vertical'
          className='text-white bg-transparent flex flex-col gap-3 w-full'
        >
          <ToggleGroupItem
            value='TopScore'
            className='rounded-md px-2 py-1 w-full data-[state=off]:text-neutral-400 data-[state=on]:text-black flex-row justify-end gap-7'
          >
            <ArrowDown10 />
            <span>Top Score</span>
          </ToggleGroupItem>
          <ToggleGroupItem
            value='Top Member'
            className='rounded-md px-2 py-1 w-full data-[state=off]:text-neutral-400 data-[state=on]:text-black flex-row justify-end'
          >
            <UsersRound />
            <span>Top Member</span>
          </ToggleGroupItem>
          <ToggleGroupItem
            value='Completed'
            className='rounded-md px-2 py-1 w-full data-[state=off]:text-neutral-400 data-[state=on]:text-black flex-row gap-5'
          >
            <LaptopMinimalCheck />
            <span>Completed</span>
          </ToggleGroupItem>
          <ToggleGroupItem
            value='Airing'
            className='rounded-md px-2 py-1 w-full data-[state=off]:text-neutral-400 data-[state=on]:text-black flex-row gap-13'
          >
            <Radio />
            <span>Airing</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
