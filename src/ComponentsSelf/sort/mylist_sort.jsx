import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState } from "react";
import top_score from "@/Utility/filter/top_score";
import top_member from "@/Utility/filter/top_members";
import airing_sort from "@/Utility/filter/airing_sort";
import completed_sort from "@/Utility/filter/completed_sort";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { UsersRound } from 'lucide-react';
import { LaptopMinimalCheck,Radio, ArrowDown10 } from 'lucide-react';



export default function mylist_sort({Setcompleted,Setplan,Setwatching,Setonhold,Setdropped, SetpageArr,isLoading}){
    const [toggleValue, SetTogglevalue] = useState('')
    const [isOpenDropDown, SetOpenDropDown] = useState(false)
    
    
    function findSetter(sorted_anime_map,activetab){
        switch(activetab){
            case 'Plan To Watch':{
                Setplan(sorted_anime_map)
                break
            }
            case 'Watching':{
                Setwatching(sorted_anime_map)
                break
            }
            case 'Completed':{
                Setcompleted(sorted_anime_map)
                break
            }
            case 'On Hold':{
                Setonhold(sorted_anime_map)
                break
            }
            case 'Dropped':{
                Setdropped(sorted_anime_map)
                break
            }
        }
    }
    
     function toggleValueHandler(selectedValue){
        console.log('this works when value of the radio changes')
        const activetab = sessionStorage.getItem('activetab')
        //since the data from the local storage are in map format we had to turn it into regular array of anime then parse it back into a map
        const anime_data =  JSON.parse(localStorage.getItem(activetab.split(' ').join(''))).map((value)=>{return value[1]})
        console.log('sorter anime data ', anime_data)
        let sorted =[]
        switch(selectedValue){
            case 'TopScore':{
                sorted = top_score(anime_data)
                break
            }
            case 'Top Member':{
                sorted = top_member(anime_data)
                break
            }
            case 'Completed':{
                sorted = completed_sort(anime_data)
                break
            }
            case 'Airing':{
                sorted = airing_sort(anime_data)
                break
            }
            default:{
                sessionStorage.removeItem('sort_type')
                sessionStorage.removeItem('sorted_anime')
                sessionStorage.setItem('scrollY', JSON.stringify(0))
                
                //page setter
                //console.log('default arr is ',defaultArr)
                Setcompleted(JSON.parse(localStorage.getItem('Completed')))
                Setplan(JSON.parse(localStorage.getItem('PlanToWatch')))
                Setwatching(JSON.parse(localStorage.getItem('Watching')))
                Setonhold(JSON.parse(localStorage.getItem('OnHold')))
                Setdropped(JSON.parse(localStorage.getItem('Dropped')))
                SetpageArr(30)
                
                sessionStorage.setItem('slicearr',31)
                window.scrollTo(0, 0);
                SetOpenDropDown(false)
                //SetTogglevalue('') 
                return
            }
        }
        //explaination
        //when toggling off the option this taggle value handler is triggered and our selected value is ''
        //thus when it goes to the switch case it it goes to the default
        //for us this indicate that we are toggling off thus reset using the defaault value
        sessionStorage.setItem('sort_type', JSON.stringify(selectedValue))
        
        //page setter
        console.log('sorted',sorted)
        const sorted_anime_map = sorted.map((value)=>{return [value.node.id,value]})
        console.log('sorted map',sorted_anime_map)
        findSetter(sorted_anime_map,activetab)
        sessionStorage.setItem('sorted_anime', JSON.stringify(sorted.length==0?'':sorted_anime_map))
        SetpageArr(30)
        
        sessionStorage.setItem('slicearr',31)
        SetOpenDropDown(false)
        //sessionStorage.setItem('scrollY',JSON.stringify(0))
        window.scrollTo(0, 0);
    }
    function menuTriggerHandler(e){
        console.log('click tirgger the restore')
        SetTogglevalue(JSON.parse(sessionStorage.getItem('sort_type')) ?? '')
        SetOpenDropDown((!isOpenDropDown))
    }
    return(
        <>{!isLoading?
        <DropdownMenu open={isOpenDropDown} onOpenChange={SetOpenDropDown}  className=''>
            <DropdownMenuTrigger asChild >
                <Button type='button' onPointerDown={menuTriggerHandler} className=' bg-black text-white w-9 h-9 p-2 rounded-md border-1 border-neutral-300 hover:bg-white hover:text-black hover:border-1 hover:border-neutral-400 transition-colors outline-none ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-funnel-icon lucide-funnel"><path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z"/></svg>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side='left' collisionPadding={40} className='bg-white/10 backdrop-blur-sm border-2 border-neutral-600 p-4 transition-transform  ease-linear w-full'>
                <ToggleGroup type='single' defaultValue={toggleValue} onValueChange={toggleValueHandler} orientation='vertical' className='text-white bg-transparent flex flex-col gap-3 w-full '>
                    <ToggleGroupItem value='TopScore' className='rounded-md px-2 py-1 w-full  data-[state=off]:text-neutral-400 data-[state=on]:text-black flex-row justify-end gap-7'><ArrowDown10 /><span>Top Score</span> </ToggleGroupItem>
                    <ToggleGroupItem value='Top Member' className='rounded-md px-2 py-1 w-full data-[state=off]:text-neutral-400 data-[state=on]:text-black flex-row justify-end'><UsersRound /><span>Top Member</span> </ToggleGroupItem>
                    <ToggleGroupItem value='Completed'className='rounded-md px-2 py-1 w-full data-[state=off]:text-neutral-400 data-[state=on]:text-black flex-row gap-5'><LaptopMinimalCheck /><span>Completed</span></ToggleGroupItem>
                    <ToggleGroupItem value='Airing' className='rounded-md px-2 py-1 w-full data-[state=off]:text-neutral-400 data-[state=on]:text-black flex-row gap-13 '><Radio /><span>Airing</span></ToggleGroupItem>
                </ToggleGroup>
                
            </DropdownMenuContent>
        </DropdownMenu>:<></>
        
        }

        </>
    )
}