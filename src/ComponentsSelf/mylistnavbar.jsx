import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from 'next/link'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
  import { EllipsisVertical } from 'lucide-react';
  
function morenavbar(props){

return (
    <nav className="fixed w-screen  z-3 bg-black  pl-4 h-15 px-4 pr-4 mb-3 top-0 left-0 flex flex-row items-center justify-between">
        <div className="flex  items-center gap-5">
        <Link href={'/'}>
            <Button className='bg-zinc-800 text-white hover:text-black hover:bg-zinc-400' variant="secondary" size="icon"><ChevronLeft  /></Button> 
        </Link>
       
        <p className="line-clamp-1 overflow-hidden text-ellipsis text-2xl  text-white font-bold text-center">Mylist</p>
        </div>
      
        <DropdownMenu >
            <DropdownMenuTrigger className='outline-none ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 border-none bg-black' ><EllipsisVertical/></DropdownMenuTrigger>
           
            <DropdownMenuContent side={'left'} align={'start'}  className='text-xl rounded-sm border-1 bg-black text-white border-neutral-600'> 
                <DropdownMenuLabel className='text-base'>User Data</DropdownMenuLabel>
                <DropdownMenuSeparator className='bg-neutral-700' />
              <DropdownMenuItem className='text-base focus:bg-neutral-700 focus:text-white' >Backup</DropdownMenuItem>
              <DropdownMenuItem className='text-base focus:bg-neutral-700 focus:text-white'>Restore</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
       
        
    </nav>
)

} export default morenavbar