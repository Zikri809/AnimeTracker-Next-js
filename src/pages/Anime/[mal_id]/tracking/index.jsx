import { Button } from '@/components/ui/button'
import Navbar from '@/ComponentsSelf/trackingformnavbar.jsx'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
   
  } from "@/components/ui/carousel"
  import { Card, CardContent } from "@/components/ui/card"
  import Numberedcarousel from '@/ComponentsSelf/numbered carousel'
 import {useRef, useState } from 'react'
  import EmblaCarousel from 'embla-carousel'
  import { Toaster } from "@/components/ui/sonner"
  import { toast } from "sonner"
  import { Trash } from 'lucide-react';
  import { useEffect } from 'react'
  import jikantomal from '@/Utility/tracking/jikantomalformat'
  import savehandler_tracking from '@/Utility/tracking/savehandler_tracking'
  import last_clicktracking from '@/Utility/tracking/lastclick_tracking'
  import delete_show_tracking from '@/Utility/tracking/deleteshow_tracking'
  import completed_click from '@/Utility/tracking/completed_click'
  import status_button from '@/Utility/tracking/statusbutton'

 

  import { useRouter } from 'next/router'
import { parseCookies } from 'nookies'


export default function trackingform(){
    const [api, setApi] = useState(null);
    const [api2, Setapi2]  = useState(null)
    const [status, Setstatus] = useState('')
    //const [score, Setscore] = useState(0)
    //const [progress, Setprogress]  = useState(0)
    const [animeinfo, Setanimeinfo] = useState()
    const [isloading, Setloading] = useState(true)
    const[isadded, Setadded] = useState(false)
    const btnref = useRef([])
    const cookie = parseCookies({})
    
    //const animeid ='50346'
    const router = useRouter()
   
    
    useEffect(()=>{
        if(!isloading)
        {
            let deletewatchingmap =new Map(JSON.parse(localStorage.getItem('Watching'))) 
            let deletecompletedmap =new Map(JSON.parse(localStorage.getItem('Completed'))) 
            let deleteplantowatchmap =new Map(JSON.parse(localStorage.getItem('PlanToWatch'))) 
            let deleteonholdmap =new Map(JSON.parse(localStorage.getItem('OnHold'))) 
            let deletedroppedmap =new Map(JSON.parse(localStorage.getItem('Dropped'))) 
           
            
            Setadded(  deletewatchingmap.has(animeinfo.node.id) ||  deletecompletedmap.has(animeinfo.node.id) ||  deleteplantowatchmap.has(animeinfo.node.id) ||  deleteonholdmap.has(animeinfo.node.id) ||  deletedroppedmap.has(animeinfo.node.id))
            
        }
    },[isloading])

    function deleteshow(){
         delete_show_tracking(animeinfo,Setadded,router,status)
    }

    useEffect(()=>{
        if(router.isReady){
            async function fetchapi(){
                try{
                
                        sessionStorage.setItem('urlparams',router.query.mal_id)
                  
                    const response = await fetch('https://api.jikan.moe/v4/anime/'+(router.query.relation_id ?? router.query.mal_id)+'/full')
                    const apifeedback = await response.json()
                    const showinfo = apifeedback.data
                    const malformat =jikantomal(showinfo)
                    console.log(malformat)
                    Setanimeinfo(malformat)
                    Setloading(false)
                }
                catch(error){
                   fetchapi()
                    console.error(error)
                }
            }
            fetchapi()
            }
        },[router.isReady])

        useEffect(()=>{
            if(!isloading && api!=null && api2!=null){
                last_click()
            }
        },[isloading,api])

    function completedclickhandler(e){
        completed_click(e,api,btnref,Setstatus,animeinfo.node.num_episodes)
      }
      function last_click(){
        last_clicktracking(btnref,api,api2,router)
      }

      function statusbutton(e){
        status_button(e,btnref,Setstatus)
      }
       function savehandler(){
        //router cannot be use inside the import function
         savehandler_tracking(animeinfo,status,api,api2,Setadded,router)
         
        
      }
      //console.log({userstatus: status, userscore: score, userprogress: progress})
      //console.log('btnref',btnref)
      //solving button first when click reset all styles to inactive using useref with looping then use e to target that specific element changes the style after that trigger a state so that it can force a rerender
    return(
        <div className='bg-black w-screen h-[100vh] mb-15 sm:mb-0 overflow-hidden'>
            {isloading?<p>loading</p>:
            <>
            
            <Navbar searchtitle={animeinfo.node.alternative_titles.en ?? animeinfo.node.title }  savebutton={savehandler} className=''/>
            <Toaster richColors/>
            <div  key={animeinfo.node.id} className='relative top-25  flex px-5 flex-col'>
                <div className='pb-5 flex flex-row text-gray-400 text-xl justify-between items-center'>
                    <p>Status</p>
                    <p>{animeinfo.node.status.split('_').map(word => word[0].toUpperCase() + word.slice(1)).join(' ')}</p>
                </div>
                <div className='flex mb-5  flex-row justify-center w-full border-0 border-blue-500'>
                    <div className=' flex flex-row gap-2  w-fit flex-wrap '>
                   { animeinfo.node.status=='not_yet_aired'?<Button disabled variant='outline' type="button" ref={(Element) =>(btnref.current[0]=Element)}  className='bg-black rounded-sm border-gray-400 text-white   focus:bg-black'>Watching</Button>:<Button ref={(Element) =>(btnref.current[0]=Element)} variant='outline' type="button" onClick={statusbutton} className='bg-black rounded-sm border-gray-400 text-white hover:text-black  focus:bg-black'>Watching</Button>}
                    {animeinfo.node.status=='not_yet_aired' ||animeinfo.node.status=='currently_airing'?<Button disabled type="button" ref={(Element) =>(btnref.current[1]=Element)}  variant='outline' className='bg-black rounded-sm border-gray-400 text-white '>Completed</Button>: <Button ref={(Element) =>(btnref.current[1]=Element)}  type="button" variant='outline' onClick={completedclickhandler} className='bg-black rounded-sm border-gray-400 text-white hover:text-black focus:bg-black '>Completed</Button>}
                    <Button variant='outline' ref={(Element) =>(btnref.current[2]=Element)} type="button"  onClick={statusbutton} className='bg-black rounded-sm border-gray-400 text-white hover:text-black focus:bg-black '>Plan To Watch</Button>    
                    <Button variant='outline' ref={(Element) =>(btnref.current[3]=Element)} type="button"  onClick={statusbutton} className='bg-black rounded-sm border-gray-400 text-white hover:text-black focus:bg-black'>On Hold</Button>
                    <Button variant='outline' ref={(Element) =>(btnref.current[4]=Element)} type="button"  onClick={statusbutton} className='bg-black rounded-sm border-gray-400 text-white  !hover:text-black focus:bg-black'>Dropped</Button>
                    </div>
                </div>
               
                <div className='pb-5 text-xl flex flex-row text-gray-400 justify-between items-center'>
                    <p>Your Progress</p>
                    <p>{animeinfo.node.num_episodes} ep</p>
                </div>
                {isloading?<></>:<Numberedcarousel apiref={setApi} length={animeinfo.node.num_episodes+1}/>}
              
                <div className='pb-5 text-xl flex flex-row text-gray-400 justify-between items-center'>
                    <p>Score</p>
                </div>
                <Numberedcarousel apiref={Setapi2}  length={10+1}/>
                <div className='w-full flex mb-4 bg-gray-800 text-gray-200 rounded-md py-5 px-5 flex-col'>
                    <p>Note:</p>
                    <p>{cookie.expires_in?'Your watchlist are saved locally and on your MAL account be aware that cross synchronization is possible you can access your watchlist on other devices':'Your Watchlist are saved exclusively on this device please be aware that cross syncronization is not possible as of now'}</p>
                </div>
              { 
                isadded?<Button variant='destructive' onClick={deleteshow} className='sm:w-60'><Trash size={32} />Remove from Watchlist</Button>:<Button variant='destructive' disabled className='sm:w-60'><Trash size={32} />Remove from Watchlist</Button>}
            </div>
            </>    }
        </div>
    )
}