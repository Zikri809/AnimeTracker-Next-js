import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from 'next/link'
import Anime_list_sort from "./sort/anime_list_sort"
function morenavbar(props){
function resetslicearr(){
        sessionStorage.setItem('slicearr',JSON.stringify(30))
        sessionStorage.removeItem('sort_type')
        sessionStorage.removeItem('sorted_anime')
    }
return (
    
    <nav className="fixed border-b-1  border-gray-700 z-3 bg-black w-screen pl-4 h-20 px-2 pr-4 mb-3 top-0 left-0 flex flex-row items-center justify-between">
        <div className="flex  items-center gap-2">
        <Link href={'/'}>
            <Button onClick={resetslicearr} className='bg-zinc-800 text-white hover:text-black hover:bg-zinc-400' variant="secondary" size="icon"><ChevronLeft  /></Button> 
        </Link>
       
        <p className="line-clamp-1 overflow-hidden text-ellipsis text-xl ml-2 text-white font-bold text-center">{props.sectionTitle}</p>
        </div>
        <Anime_list_sort
            SetAnimeArr= {props.SetAnimeArr}
            IsUpdateRef= {props.IsUpdateRef}
            SetpageArr= {props.SetpageArr}
            season={ props.season }
            year = {props.year}
            defaultArr={props.defaultArr}
        />
    </nav>
)

} export default morenavbar