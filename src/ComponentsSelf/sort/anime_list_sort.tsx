import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import top_score from "@/Utility/filter/top_score";
import top_member from "@/Utility/filter/top_members";
import airing_sort from "@/Utility/filter/airing_sort";
import completed_sort from "@/Utility/filter/completed_sort";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { UsersRound, LaptopMinimalCheck, Radio, ArrowDown10, ListFilter } from 'lucide-react';

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

  function scrollToListTop() {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    document.scrollingElement?.scrollTo(0, 0);
  }

  function resetVisibleList() {
    IsUpdateRef.current = false;
    scrollToListTop();
    SetpageArr(30);
    window.requestAnimationFrame(() => {
      IsUpdateRef.current = false;
      scrollToListTop();
      SetpageArr(30);
      window.setTimeout(() => {
        IsUpdateRef.current = false;
        scrollToListTop();
        SetpageArr(30);
        IsUpdateRef.current = true;
      }, 500);
    });
  }

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
        resetVisibleList();
        if (pathname) {
          sessionStorage.setItem(`season-list:${pathname}:slicearr`, '30');
        }
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
    resetVisibleList();
    SetOpenDropDown(false);
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
          className='icon-button'
          aria-label="Sort anime list"
        >
          <ListFilter className="lucide-funnel size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side='left'
        collisionPadding={40}
        className='w-56 border-white/10 bg-[#151821]/95 p-3 text-white shadow-xl backdrop-blur-xl'
      >
        <ToggleGroup
          type='single'
          defaultValue={toggleValue}
          onValueChange={toggleValueHandler}
          orientation='vertical'
          className='flex w-full flex-col gap-2 bg-transparent text-white'
        >
          <ToggleGroupItem
            value='TopScore'
            className='w-full justify-start gap-2 rounded-md px-3 py-2 data-[state=off]:text-slate-400 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground'
          >
            <ArrowDown10 />
            <span>Top Score</span>
          </ToggleGroupItem>
          <ToggleGroupItem
            value='Top Member'
            className='w-full justify-start gap-2 rounded-md px-3 py-2 data-[state=off]:text-slate-400 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground'
          >
            <UsersRound />
            <span>Top Member</span>
          </ToggleGroupItem>
          <ToggleGroupItem
            value='Completed'
            className='w-full justify-start gap-2 rounded-md px-3 py-2 data-[state=off]:text-slate-400 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground'
          >
            <LaptopMinimalCheck />
            <span>Completed</span>
          </ToggleGroupItem>
          <ToggleGroupItem
            value='Airing'
            className='w-full justify-start gap-2 rounded-md px-3 py-2 data-[state=off]:text-slate-400 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground'
          >
            <Radio />
            <span>Airing</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
