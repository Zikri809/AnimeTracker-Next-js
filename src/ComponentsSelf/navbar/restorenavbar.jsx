import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default function restorenavbar(props){

   
    return (
        <nav className="fixed border-b-1 border-gray-700 z-3 bg-black w-screen pl-4 h-20 px-2 pr-4 mb-3 top-0 left-0 flex flex-row items-center justify-between">
        <div className="flex  flex-row items-center gap-2 sm:gap-2">
        <Link href={'/mylist'}>
             <Button className='bg-zinc-800 text-white ' variant="secondary" size="icon"><ChevronLeft  /></Button> 
            </Link>
           
        <p  className="line-clamp-1 overflow-hidden text-ellipsis text-2xl ml-2 text-white font-bold text-left">Restore </p>
       
        </div>
       
    </nav>
    )
}