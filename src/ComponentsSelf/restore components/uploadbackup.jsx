import { Upload, History } from 'lucide-react';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card,CardContent,CardDescription,CardFooter,CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRef, useState
} from "react"
import { Toaster } from "sonner"
import { toast } from "sonner"
import { useRouter } from 'next/router';
export default function uploadbackup(){
    const [entries , Set_entries] = useState()
    const [last_modified , Set_lastmodified] = useState()
    const [animearr , Setanimearr] = useState()
    const inputref = useRef(null)
    const router = useRouter()

    function Filereader(e){
        const file = e.target.files[0]
        const date = new Date(file.lastModified)
        Set_lastmodified(date.toDateString())
        if(!file){
            console.log('No file selected. PLease choose a file')
            return
        }
        if(!file.type=='.json'){
            console.log('Unsupported file type.File must be json ')
            return
        }
        const reader = new FileReader()
        reader.onerror = () => {
            console.log("Error reading the file. Please try again.", "error");
          };
        reader.onload = ()=>{
          try{
              const watchlistarr = JSON.parse(reader.result)
              Setanimearr(watchlistarr)
              Set_entries(watchlistarr[0].length +watchlistarr[1].length +watchlistarr[2].length + watchlistarr[3].length + watchlistarr[4].length)
              //toast.success('File is succesfully red')
          }
          catch{
              toast.error('Problem reading the file')
          }
        }
        reader.readAsText(file)
    }
    function submitrestore(){
        if(animearr==undefined) return
        const plantowatcharr =  animearr[0]
        const watchingarr = animearr[1]
        const  completedarr = animearr[2]
        const onholdarr = animearr[3]
        const droppedarr = animearr[4]
        const plantowatchmap = new Map(plantowatcharr)
    
        const watchingmap = new Map(watchingarr)
        const  completedmap =new Map(completedarr)
        const onholdmap =new Map(onholdarr)
        const droppedmap =new Map(droppedarr)
        if(plantowatchmap==undefined || watchingmap ==undefined || completedmap==undefined || onholdmap ==undefined || droppedmap ==undefined){
            toast.error('File content cannot be parsed. This file may have been tampered')
            return
        }
        localStorage.setItem('PlanToWatch',JSON.stringify(plantowatcharr))
        localStorage.setItem('Watching', JSON.stringify(watchingarr))
        localStorage.setItem('Completed', JSON.stringify(completedarr))
        localStorage.setItem('OnHold', JSON.stringify(onholdarr))
        localStorage.setItem('Dropped', JSON.stringify(droppedarr))
        toast.success('Watchlist restored')
        setTimeout(() => {
            router.push('/mylist')
        }, 1500);
        
       } 
    return(
        <div className="fixed inset-0 flex items-center justify-center bg-black">
           
            <Card className="bg-neutral-950 border-neutral-700 w-80 sm:w-100 h-fit p-4">
                <CardContent className='p-1'>
                    <CardHeader className='text-white text-xl w-full font-bold border-0'>Restore Your Anime World</CardHeader>
                    <CardContent className=' border-0'>
                        <p className='mt-2 text-sm text-neutral-500 text-left'>
                         Upload your saved data file to continue tracking your favourite anime.
                        </p>
                        <Input onChange={Filereader} ref={inputref} className='my-6 bg-black  text-sm text-neutral-500 border-neutral-700 rounded-sm' placeholder='no file chosen' type="file"/>
                        <Button onClick={submitrestore} className='mb-4 w-full hover:bg-neutral-800 bg-neutral-900 border-neutral-700'>Restore Now</Button>
                 
                       <ul className='list-disc list-inside w-full text-neutral-500 text-sm'>
                         <li>{entries==undefined? 'NA':entries} anime entries</li>
                         <li>Last modified: {last_modified==undefined?'NA' : last_modified}</li>
                        
                       </ul>
                     
                       
                    </CardContent>
                </CardContent>
            </Card>
        </div>

     
    )
}