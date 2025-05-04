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
 

  import { useRouter } from 'next/router'


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
    const test ='http://localhost:5173/'
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
           
            
            Setadded(  deletewatchingmap.has(animeinfo.mal_id) ||  deletecompletedmap.has(animeinfo.mal_id) ||  deleteplantowatchmap.has(animeinfo.mal_id) ||  deleteonholdmap.has(animeinfo.mal_id) ||  deletedroppedmap.has(animeinfo.mal_id))
            
        }
    },[isloading])

    function deleteshow(){
        let deletewatchingmap =new Map(JSON.parse(localStorage.getItem('Watching'))) 
        let deletecompletedmap =new Map(JSON.parse(localStorage.getItem('Completed'))) 
        let deleteplantowatchmap =new Map(JSON.parse(localStorage.getItem('PlanToWatch'))) 
        let deleteonholdmap =new Map(JSON.parse(localStorage.getItem('OnHold'))) 
        let deletedroppedmap =new Map(JSON.parse(localStorage.getItem('Dropped'))) 
        if(deletewatchingmap.has(animeinfo.mal_id)){
            console.log('condition triggered')
            deletewatchingmap.delete(animeinfo.mal_id)
            localStorage.setItem('Watching',JSON.stringify([...deletewatchingmap]))
            
        }
        else if(deletecompletedmap.has(animeinfo.mal_id)){
            deletecompletedmap.delete(animeinfo.mal_id)
            localStorage.setItem('Completed',JSON.stringify([...deletecompletedmap]))
        }
        else if(deleteplantowatchmap.has(animeinfo.mal_id)){
            deleteplantowatchmap.delete(animeinfo.mal_id)
            localStorage.setItem('PlanToWatch',JSON.stringify([...deleteplantowatchmap]))

        }
        else if(deleteonholdmap.has(animeinfo.mal_id)){
            deleteonholdmap.delete(animeinfo.mal_id)
            localStorage.setItem('OnHold',JSON.stringify([...deleteonholdmap]))
        }
        else{
            deletedroppedmap.delete(animeinfo.mal_id)
            localStorage.setItem('Dropped',JSON.stringify([...deletedroppedmap]))
        }
        toast.success('Show has been deleted from watch list')
        Setadded(false)
        setTimeout(() => {
            router.push('/'+router.asPath.split('/')[1]+'/'+router.query.mylist_tab+'/'+router.query.mal_id)
        }, 1000);
    }

    useEffect(()=>{
        if(router.isReady){
            async function fetchapi(){
                try{
                
                        sessionStorage.setItem('urlparams',router.query.relation_id)
                  
                    const response = await fetch('https://api.jikan.moe/v4/anime/'+router.query.relation_id+'/full')
                    const apifeedback = await response.json()
                    const showinfo = apifeedback.data
                    console.log(showinfo)
                    Setanimeinfo(showinfo)
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
        
        //console.log('button clicked')
        //api.scrollTo(props.episodes-1);
        api.scrollTo(animeinfo.episodes);
        for(let i =0 ; i<5 ; i++){
            btnref.current[i].style.color = 'white'
        }
        e.target.style.color='#2196F3'
        //console.log(e)
        Setstatus(e.target.innerText)
        //console.log('button clicked')
      }
      function last_click(){

        const plantowatchmap = new Map(JSON.parse(localStorage.getItem('PlanToWatch')))
        const watchingmap = new Map(JSON.parse(localStorage.getItem('Watching')))
        const  completedmap = new Map(JSON.parse(localStorage.getItem('Completed')))
        const onholdmap = new Map(JSON.parse(localStorage.getItem('OnHold')))
        const droppedmap = new Map(JSON.parse(localStorage.getItem('Dropped')))
        const mal_id = parseInt(sessionStorage.getItem('urlparams'))
        //console.log('params is ', id)
        //console.log('button checker id is ',mal_id)
        //console.log(plantowatchmap)
        //console.log('TURHT IS ',plantowatchmap.has(mal_id))
        if(plantowatchmap.has(mal_id)){
            const anime = plantowatchmap.get(mal_id)
            btnref.current[2].click()
            api.scrollTo(anime.userprogress);
            api2.scrollTo(anime.userscore)
            
        }
        else if (watchingmap.has(mal_id)){
            const anime = watchingmap.get(mal_id)
            btnref.current[0].click()
            api.scrollTo(anime.userprogress);
            api2.scrollTo(anime.userscore)
            
        }
        else if (completedmap.has(mal_id)){
            const anime = completedmap.get(mal_id)
            btnref.current[1].click()
            api.scrollTo(anime.userprogress);
            api2.scrollTo(anime.userscore)
           
        }
        else if(onholdmap.has(mal_id)){
            const anime = onholdmap.get(mal_id)
            btnref.current[3].click()
            api.scrollTo(anime.userprogress);
            api2.scrollTo(anime.userscore)
          
        }
        else if(droppedmap.has(mal_id)){
            const anime = droppedmap.get(mal_id)
            btnref.current[4].click()
            api.scrollTo(anime.userprogress);
            api2.scrollTo(anime.userscore)
        } 
        else{
            //do nothing
        }
      }

      function statusbutton(e){
        for(let i =0 ; i<5 ; i++){
            btnref.current[i].style.color = 'white'
        }
        let text = e.target.innerText
        if(text=='Watching'){
            console.log('triggered')
            e.target.style.color='#4CAF50'
        }
        else if (text =='Plan To Watch'){
            e.target.style.color='#5C6BC0'
        }
        else if(text =='On Hold'){
            e.target.style.color = '#FFEB3B'
        }
        else{
            e.target.style.color = '#F44336'
        }
        
        console.log(e)
        Setstatus(text)
      }
      function savehandler(){
        if(status==''){
            console.log('toast')
            return toast.error("Status has been selected, Please do so!")
        }
       
        
        const userwatch = {userstatus: status, userprogress: api.selectedScrollSnap(),userscore: api2.selectedScrollSnap()}
       Setadded(true)
        if(status=='Watching'){
           
            if(localStorage.getItem('Watching')==null){
                const Watching = new Map()
                localStorage.setItem('Watching',JSON.stringify([...Watching]))
            }
            let watchingmap =new Map(JSON.parse(localStorage.getItem('Watching'))) 
            watchingmap.set(animeinfo.mal_id, Object.assign(animeinfo,userwatch))
            localStorage.setItem('Watching',JSON.stringify([...watchingmap]))

            let deletecompletedmap =new Map(JSON.parse(localStorage.getItem('Completed'))) 
            deletecompletedmap.delete(animeinfo.mal_id)
            localStorage.setItem('Completed',JSON.stringify([...deletecompletedmap]))

            let deleteplantowatchmap =new Map(JSON.parse(localStorage.getItem('PlanToWatch'))) 
            deleteplantowatchmap.delete(animeinfo.mal_id)
            localStorage.setItem('PlanToWatch',JSON.stringify([...deleteplantowatchmap]))

            let deleteonholdmap =new Map(JSON.parse(localStorage.getItem('OnHold'))) 
            deleteonholdmap.delete(animeinfo.mal_id)
            localStorage.setItem('OnHold',JSON.stringify([...deleteonholdmap]))

            let deletedroppedmap =new Map(JSON.parse(localStorage.getItem('Dropped'))) 
           deletedroppedmap.delete(animeinfo.mal_id)
           localStorage.setItem('Dropped',JSON.stringify([...deletedroppedmap]))

            toast.success('Watchlist saved')
           
        }
        else if(status=='Completed'){
           
            if(localStorage.getItem('Completed')==null){
                const Completed = new Map()
                localStorage.setItem('Completed',JSON.stringify([...Completed]))
            }
            let completedmap =new Map(JSON.parse(localStorage.getItem('Completed'))) 
           completedmap.set(animeinfo.mal_id, Object.assign(animeinfo,userwatch))
            localStorage.setItem('Completed',JSON.stringify([...completedmap]))

            let deletewatchingmap =new Map(JSON.parse(localStorage.getItem('Watching'))) 
            deletewatchingmap.delete(animeinfo.mal_id)
            localStorage.setItem('Watching',JSON.stringify([...deletewatchingmap]))

            let deleteplantowatchmap =new Map(JSON.parse(localStorage.getItem('PlanToWatch'))) 
            deleteplantowatchmap.delete(animeinfo.mal_id)
            localStorage.setItem('PlanToWatch',JSON.stringify([...deleteplantowatchmap]))

            let deleteonholdmap =new Map(JSON.parse(localStorage.getItem('OnHold'))) 
            deleteonholdmap.delete(animeinfo.mal_id)
            localStorage.setItem('OnHold',JSON.stringify([...deleteonholdmap]))

            let deletedroppedmap =new Map(JSON.parse(localStorage.getItem('Dropped'))) 
           deletedroppedmap.delete(animeinfo.mal_id)
           localStorage.setItem('Dropped',JSON.stringify([...deletedroppedmap]))

            toast.success('Watchlist saved')
           
        }
        else if(status=='Plan To Watch'){
           
            if(localStorage.getItem('PlanToWatch')==null){
                const PlanToWatch = new Map()
                localStorage.setItem('PlanToWatch',JSON.stringify([...PlanToWatch]))
            }
            let plantowatchmap =new Map(JSON.parse(localStorage.getItem('PlanToWatch'))) 
           plantowatchmap.set(animeinfo.mal_id,Object.assign(animeinfo,userwatch))
            localStorage.setItem('PlanToWatch',JSON.stringify([...plantowatchmap]))

             let deletewatchingmap =new Map(JSON.parse(localStorage.getItem('Watching'))) 
             deletewatchingmap.delete(animeinfo.mal_id)
             localStorage.setItem('Watching',JSON.stringify([...deletewatchingmap]))
 
             let deletecompletedmap =new Map(JSON.parse(localStorage.getItem('Completed'))) 
             deletecompletedmap.delete(animeinfo.mal_id)
             localStorage.setItem('Completed',JSON.stringify([...deletecompletedmap]))
 
             let deleteonholdmap =new Map(JSON.parse(localStorage.getItem('OnHold'))) 
             deleteonholdmap.delete(animeinfo.mal_id)
             localStorage.setItem('OnHold',JSON.stringify([...deleteonholdmap]))
 
             let deletedroppedmap =new Map(JSON.parse(localStorage.getItem('Dropped'))) 
            deletedroppedmap.delete(animeinfo.mal_id)
            localStorage.setItem('Dropped',JSON.stringify([...deletedroppedmap]))

            toast.success('Watchlist saved')
           
        }
        else if(status=='On Hold'){
           
            if(localStorage.getItem('OnHold')==null){
                const OnHold = new Map()
                localStorage.setItem('OnHold',JSON.stringify([...OnHold]))
            }
            let onholdmap =new Map(JSON.parse(localStorage.getItem('OnHold'))) 
           onholdmap.set(animeinfo.mal_id,Object.assign(animeinfo,userwatch))
            localStorage.setItem('OnHold',JSON.stringify([...onholdmap]))

            let deletewatchingmap =new Map(JSON.parse(localStorage.getItem('Watching'))) 
            deletewatchingmap.delete(animeinfo.mal_id)
            localStorage.setItem('Watching',JSON.stringify([...deletewatchingmap]))

            let deletecompletedmap =new Map(JSON.parse(localStorage.getItem('Completed'))) 
            deletecompletedmap.delete(animeinfo.mal_id)
            localStorage.setItem('Completed',JSON.stringify([...deletecompletedmap]))

            let deleteplantowatchmap =new Map(JSON.parse(localStorage.getItem('PlanToWatch'))) 
            deleteplantowatchmap.delete(animeinfo.mal_id)
            localStorage.setItem('PlanToWatch',JSON.stringify([...deleteplantowatchmap]))

            let deletedroppedmap =new Map(JSON.parse(localStorage.getItem('Dropped'))) 
           deletedroppedmap.delete(animeinfo.mal_id)
           localStorage.setItem('Dropped',JSON.stringify([...deletedroppedmap]))

            toast.success('Watchlist saved')
           
        }
        else {
           
            if(localStorage.getItem('Dropped')==null){
                const Dropped = new Map()
                localStorage.setItem('Dropped',JSON.stringify([...Dropped]))
            }
            let droppedmap =new Map(JSON.parse(localStorage.getItem('Dropped'))) 
           droppedmap.set(animeinfo.mal_id,Object.assign(animeinfo,userwatch))
            localStorage.setItem('Dropped',JSON.stringify([...droppedmap]))

            let deletewatchingmap =new Map(JSON.parse(localStorage.getItem('Watching'))) 
            deletewatchingmap.delete(animeinfo.mal_id)
            localStorage.setItem('Watching',JSON.stringify([...deletewatchingmap]))

            let deletecompletedmap =new Map(JSON.parse(localStorage.getItem('Completed'))) 
            deletecompletedmap.delete(animeinfo.mal_id)
            localStorage.setItem('Completed',JSON.stringify([...deletecompletedmap]))

            let deleteplantowatchmap =new Map(JSON.parse(localStorage.getItem('PlanToWatch'))) 
            deleteplantowatchmap.delete(animeinfo.mal_id)
            localStorage.setItem('PlanToWatch',JSON.stringify([...deleteplantowatchmap]))

            let deleteonholdmap =new Map(JSON.parse(localStorage.getItem('OnHold'))) 
           deleteonholdmap.delete(animeinfo.mal_id)
           localStorage.setItem('OnHold',JSON.stringify([...deleteonholdmap]))

            
            //console.log(new Map(JSON.parse(localStorage.getItem('Watching'))))  
        }
        setTimeout(() => {
            router.push('/'+router.asPath.split('/')[1]+'/'+router.query.mylist_tab+'/'+router.query.mal_id)
            toast.success('Watchlist saved')
        }, 1000);
        
        //to do : make sure that we a show is added to  category make sure to delete its existence in other category
      }
      //console.log({userstatus: status, userscore: score, userprogress: progress})
      console.log('btnref',btnref)
      //solving button first when click reset all styles to inactive using useref with looping then use e to target that specific element changes the style after that trigger a state so that it can force a rerender
    return(
        <div className='bg-black w-screen h-[100vh] overflow-hidden'>
            {isloading?<p>loading</p>:
            <>
            
            <Navbar searchtitle={animeinfo.title_english}  savebutton={savehandler} className=''/>
            <Toaster richColors/>
            <div  className='relative top-25 flex px-5 flex-col'>
                <div className='pb-5 flex flex-row text-gray-400 text-xl justify-between items-center'>
                    <p>Status</p>
                    <p>{animeinfo.status}</p>
                </div>
                <div className='flex mb-5  flex-row justify-center w-full border-0 border-blue-500'>
                    <div className=' flex flex-row gap-2  w-fit flex-wrap '>
                   { animeinfo.status=='Not yet aired'?<Button disabled variant='outline' type="button" ref={(Element) =>(btnref.current[0]=Element)}  className='bg-black rounded-sm border-gray-400 text-white   focus:bg-black'>Watching</Button>:<Button ref={(Element) =>(btnref.current[0]=Element)} variant='outline' type="button" onClick={statusbutton} className='bg-black rounded-sm border-gray-400 text-white hover:text-black  focus:bg-black'>Watching</Button>}
                    {animeinfo.status=='Not yet aired' ||animeinfo.status=='Airing'?<Button disabled type="button" ref={(Element) =>(btnref.current[1]=Element)}  variant='outline' className='bg-black rounded-sm border-gray-400 text-white '>Completed</Button>: <Button ref={(Element) =>(btnref.current[1]=Element)}  type="button" variant='outline' onClick={completedclickhandler} className='bg-black rounded-sm border-gray-400 text-white hover:text-black focus:bg-black '>Completed</Button>}
                    <Button variant='outline' ref={(Element) =>(btnref.current[2]=Element)} type="button"  onClick={statusbutton} className='bg-black rounded-sm border-gray-400 text-white hover:text-black focus:bg-black '>Plan To Watch</Button>    
                    <Button variant='outline' ref={(Element) =>(btnref.current[3]=Element)} type="button"  onClick={statusbutton} className='bg-black rounded-sm border-gray-400 text-white hover:text-black focus:bg-black'>On Hold</Button>
                    <Button variant='outline' ref={(Element) =>(btnref.current[4]=Element)} type="button"  onClick={statusbutton} className='bg-black rounded-sm border-gray-400 text-white hover:text-black focus:bg-black'>Dropped</Button>
                    </div>
                </div>
               
                <div className='pb-5 text-xl flex flex-row text-gray-400 justify-between items-center'>
                    <p>Your Progress</p>
                    <p>{animeinfo.episodes} ep</p>
                </div>
                {isloading?<></>:<Numberedcarousel apiref={setApi} length={animeinfo.episodes+1}/>}
              
                <div className='pb-5 text-xl flex flex-row text-gray-400 justify-between items-center'>
                    <p>Score</p>
                </div>
                <Numberedcarousel apiref={Setapi2}  length={10+1}/>
                <div className='w-full flex mb-4 bg-gray-800 text-gray-200 rounded-md py-5 px-5 flex-col'>
                    <p>Note:</p>
                    <p>Your Watchlist are saved exclusively on this device please be aware that cross syncronization is not possible as of now</p>
                </div>
              { 
                isadded?<Button variant='destructive' onClick={deleteshow} className='sm:w-60'><Trash size={32} />Remove from Watchlist</Button>:<Button variant='destructive' disabled className='sm:w-60'><Trash size={32} />Remove from Watchlist</Button>}
            </div>
            </>    }
        </div>
    )
}