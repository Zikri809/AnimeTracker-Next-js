import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import top_score from "@/Utility/filter/top_score";
import top_member from "@/Utility/filter/top_members";
import airing_sort from "@/Utility/filter/airing_sort";
import completed_sort from "@/Utility/filter/completed_sort";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { UsersRound } from 'lucide-react';
import { LaptopMinimalCheck, Radio, ArrowDown10, ListFilter } from 'lucide-react';
import { getWatchlistMap, MYLIST_TABS } from "@/Utility/tracking/watchlist-storage";

interface MylistSortProps {
    Setcompleted: (data: any) => void;
    Setplan: (data: any) => void;
    Setwatching: (data: any) => void;
    Setonhold: (data: any) => void;
    Setdropped: (data: any) => void;
    SetpageArr: (pages: number) => void;
    isLoading: boolean;
}

export default function MylistSort({
    Setcompleted,
    Setplan,
    Setwatching,
    Setonhold,
    Setdropped,
    SetpageArr,
    isLoading
}: MylistSortProps) {
    const [toggleValue, SetTogglevalue] = useState('')
    const [isOpenDropDown, SetOpenDropDown] = useState(false)

    function getStorageKeyForTab(tabLabel: string) {
        return MYLIST_TABS.find((tab) => tab.label === tabLabel)?.storageKey ?? 'PlanToWatch'
    }

    function restoreAllLists() {
        Setcompleted(Array.from(getWatchlistMap('Completed').entries()))
        Setplan(Array.from(getWatchlistMap('PlanToWatch').entries()))
        Setwatching(Array.from(getWatchlistMap('Watching').entries()))
        Setonhold(Array.from(getWatchlistMap('OnHold').entries()))
        Setdropped(Array.from(getWatchlistMap('Dropped').entries()))
    }

    function parseStoredSortType() {
        const raw = sessionStorage.getItem('sort_type')
        if (!raw) return ''
        try {
            const parsed = JSON.parse(raw)
            return typeof parsed === 'string' ? parsed : ''
        } catch {
            return raw
        }
    }

    function findSetter(sorted_anime_map: any[], activetab: string) {
        switch (activetab) {
            case 'Plan To Watch': {
                Setplan(sorted_anime_map)
                break
            }
            case 'Watching': {
                Setwatching(sorted_anime_map)
                break
            }
            case 'Completed': {
                Setcompleted(sorted_anime_map)
                break
            }
            case 'On Hold': {
                Setonhold(sorted_anime_map)
                break
            }
            case 'Dropped': {
                Setdropped(sorted_anime_map)
                break
            }
        }
    }

    function toggleValueHandler(selectedValue: string) {
        console.log('this works when value of the radio changes')
        const activetab = sessionStorage.getItem('activetab')
        if (!activetab) return;

        const activeStorageKey = getStorageKeyForTab(activetab)
        const anime_data = Array.from(getWatchlistMap(activeStorageKey).values())
        console.log('sorter anime data ', anime_data)
        let sorted: any[] = []
        switch (selectedValue) {
            case 'TopScore': {
                sorted = top_score(anime_data)
                break
            }
            case 'Top Member': {
                sorted = top_member(anime_data)
                break
            }
            case 'Completed': {
                sorted = completed_sort(anime_data)
                break
            }
            case 'Airing': {
                sorted = airing_sort(anime_data)
                break
            }
            default: {
                sessionStorage.removeItem('sort_type')
                sessionStorage.removeItem('sorted_anime')
                sessionStorage.setItem('scrollY', JSON.stringify(0))

                restoreAllLists()
                SetpageArr(30)

                sessionStorage.setItem('slicearr', '30')
                window.scrollTo(0, 0);
                SetOpenDropDown(false)
                return
            }
        }

        sessionStorage.setItem('sort_type', JSON.stringify(selectedValue))

        console.log('sorted', sorted)
        const sorted_anime_map = sorted.map((value: any) => { return [value.node.id, value] })
        console.log('sorted map', sorted_anime_map)
        findSetter(sorted_anime_map, activetab)
        sessionStorage.setItem('sorted_anime', JSON.stringify(sorted.length === 0 ? '' : sorted_anime_map))
        SetpageArr(30)

        sessionStorage.setItem('slicearr', '30')
        SetOpenDropDown(false)
        window.scrollTo(0, 0);
    }

    function menuTriggerHandler() {
        console.log('click trigger the restore')
        SetTogglevalue(parseStoredSortType())
        SetOpenDropDown(!isOpenDropDown)
    }

    return (
        <>
            {!isLoading ? (
                <DropdownMenu open={isOpenDropDown} onOpenChange={SetOpenDropDown}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            type='button'
                            onPointerDown={menuTriggerHandler}
                            className='icon-button'
                            aria-label="Sort my list"
                        >
                            <ListFilter className="lucide-funnel size-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side='left' collisionPadding={40} className='w-56 border-white/10 bg-[#151821]/95 p-3 text-white shadow-xl backdrop-blur-xl'>
                        <ToggleGroup type='single' defaultValue={toggleValue} onValueChange={toggleValueHandler} orientation='vertical' className='flex w-full flex-col gap-2 bg-transparent text-white'>
                            <ToggleGroupItem value='TopScore' className='w-full justify-start gap-2 rounded-md px-3 py-2 data-[state=off]:text-slate-400 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground'>
                                <ArrowDown10 /><span>Top Score</span>
                            </ToggleGroupItem>
                            <ToggleGroupItem value='Top Member' className='w-full justify-start gap-2 rounded-md px-3 py-2 data-[state=off]:text-slate-400 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground'>
                                <UsersRound /><span>Top Member</span>
                            </ToggleGroupItem>
                            <ToggleGroupItem value='Completed' className='w-full justify-start gap-2 rounded-md px-3 py-2 data-[state=off]:text-slate-400 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground'>
                                <LaptopMinimalCheck /><span>Completed</span>
                            </ToggleGroupItem>
                            <ToggleGroupItem value='Airing' className='w-full justify-start gap-2 rounded-md px-3 py-2 data-[state=off]:text-slate-400 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground'>
                                <Radio /><span>Airing</span>
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : <></>}
        </>
    )
}
