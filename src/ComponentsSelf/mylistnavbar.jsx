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
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
  import { Download } from 'lucide-react';
  import { EllipsisVertical } from 'lucide-react';
  
function morenavbar(props){

  function backup(){
    const plantowatch =JSON.parse(localStorage.getItem('PlanToWatch'))
    const watching =   JSON.parse(localStorage.getItem('Watching'))
    const  completed = JSON.parse(localStorage.getItem('Completed'))
    const onhold =     JSON.parse(localStorage.getItem('OnHold'))
    const dropped =    JSON.parse(localStorage.getItem('Dropped'))
    const watchlistarr = [plantowatch,watching,completed,onhold,dropped]

    //turn it into a more readable format
    const downloadable = JSON.stringify(watchlistarr,null,2)
    const blob = new Blob([downloadable], {type: 'application/json'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a');
    a.href = url;
    a.download = "watchlist-backup.json";
    a.click();
  }

return (
    <nav className="fixed w-screen  z-3 border-0  bg-black  py-4 h-20 px-4  mb-3 top-0 left-0 flex flex-row items-center justify-between">
        <div className="flex  items-center gap-5">
        <Link href={'/'}>
            <Button className='bg-zinc-800 text-white hover:text-black hover:bg-zinc-400' variant="secondary" size="icon"><ChevronLeft  /></Button> 
        </Link>
       
        <p className="line-clamp-1 overflow-hidden text-ellipsis text-2xl  text-white font-bold text-center">Mylist</p>
        </div>
        <Dialog>
            <DropdownMenu >
                <DropdownMenuTrigger className='outline-none ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 border-none bg-black' ><EllipsisVertical/></DropdownMenuTrigger>
               
                <DropdownMenuContent side={'left'} align={'start'}  className='text-xl rounded-sm border-0 bg-neutral-700 text-white border-neutral-600'> 
                  <DialogTrigger asChild>
                    <DropdownMenuItem className='text-base focus:bg-neutral-600 focus:text-white' >Backup</DropdownMenuItem>
                  </DialogTrigger>
                  <DropdownMenuItem className='text-base focus:bg-neutral-600 focus:text-white'><Link href={'/mylist/Restore'}>Restore</Link></DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <DialogContent className='border-neutral-800'>
            <DialogHeader>
            <DialogTitle>Download Watchlist Backup?</DialogTitle>
            <DialogDescription>
            A file containing your watchlist will be downloaded to your device. Do not tamper with this file, and be sure to follow the restoration instructions.
            </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <div className="relative right-0 flex flex-row w-auto gap-2 justify-end">
                <Button className='outline-none ring-0 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-neutral-700 border-none border-neutral-700 hover:bg-neutral-600'>Cancel</Button>
                <Button onClick={backup} className='bg-emerald-500 border-none hover:bg-green-700'><Download />Download</Button>
                </div>
               
            </DialogFooter>
            </DialogContent>
                 
       
        </Dialog>
       
        
    </nav>
)

} export default morenavbar