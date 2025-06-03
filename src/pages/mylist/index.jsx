// this is mylist page

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Navbar from '@/ComponentsSelf/mylistnavbar.jsx'
import { useEffect, useRef, useState } from "react"
import Horizontalcard from '@/ComponentsSelf/animecardhorizontal'
import Link from "next/link"
import { useWindowScroll } from "@uidotdev/usehooks"
import progress from "@/Utility/progress"
import { useRouter } from "next/router"
import { Toaster } from "@/components/ui/sonner"
import scrollsaver from "@/Utility/ScrollSaver"

export default function mylist(){
    const [planmap , Setplan] = useState()
    const [completedmap, Setcompleted] = useState()
    const [watchinmap, Setwatching] = useState()
    const [onholdmap, Setonhold] = useState()
    const [droppedmap, Setdropped] = useState()
    const [isloading, Setloading] = useState(true)
    const [{ x, y }, scrollTo] = useWindowScroll();
    const [activetab, Setactivetab] = useState('Plan To Watch')
    const router = useRouter()
    const [currentpagearr , setpagearr ] = useState(30)
    const is_scrollrestored = useRef(false)
     const isupdated = useRef(false)

     
    

    useEffect(() => {
            const handleRouteChangeStart = () => {
              sessionStorage.setItem('scrollY', window.scrollY);
            };
            const handleRouteChangeComplete = () => {
                const savedY = sessionStorage.getItem('scrollY');
                if (savedY) {
                  window.scrollTo(0, parseInt(savedY));
                }
              };
            router.events.on('routeChangeStart', handleRouteChangeStart);
            router.events.on('routeChangeComplete', handleRouteChangeComplete);
            return () => {
                router.events.off('routeChangeStart', handleRouteChangeStart);
                router.events.off('routeChangeComplete', handleRouteChangeComplete);
              };
        })

    function scrollreset(list_type){
        
        console.log('scrollreset triggered')
       sessionStorage.setItem('scrollY', 0)
       setpagearr(30)
       window.scrollTo(0, 0)
    }
  
    useEffect(()=>{
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight +100;
            const savedY = sessionStorage.getItem('scrollY');
            console.log('max scroll ', maxScroll)
            console.log('mxscroll check is ',savedY && savedY<=maxScroll && !is_scrollrestored.current)
                if (savedY && savedY<=maxScroll && !is_scrollrestored.current) {
                  console.log('scroll restored')
                  is_scrollrestored.current = true
                  window.scrollTo(0, parseInt(savedY));
                }
          },[currentpagearr,planmap,watchinmap,droppedmap,onholdmap,completedmap])
        

        
          useEffect(() => {
            //setAnimearr(seasonaldata)
             if(sessionStorage.getItem('slicearr')!=undefined && currentpagearr<parseInt(sessionStorage.getItem('slicearr'))) {
              setpagearr(parseInt(sessionStorage.getItem('slicearr')))
              console.log('updated the current page arr ')
              isupdated.current =true
            
            }
         
        },[currentpagearr])
        useEffect(()=>{
            function scrollhandler(){   
               //console.log( window.innerHeight + Math.ceil(window.scrollY)>=document.body.offsetHeight - 10 )
               //about line below, how it work? dont't know suddenly decided to works along with teh useEffect above
               //  future me dont fix if it ain't broken
     
                if (  window.innerHeight + window.scrollY>=document.body.offsetHeight - 200 && isupdated.current && router.isReady ){
                  const addedpage = currentpagearr +30
                  setpagearr(addedpage)
                  console.log('added page is ',addedpage)
                  console.log('current page is ',currentpagearr)
                  sessionStorage.setItem('slicearr',(addedpage))
                  console.log('condition fullfiled',currentpagearr)
                  isupdated.current = true  
                }
            }
            window.addEventListener('scroll',scrollhandler,false)
            return() =>{
               window.removeEventListener('scroll', scrollhandler)
            }
        },[currentpagearr])
      
        
        useEffect(()=>{
            
           
            isupdated.current = true 
  
        },[currentpagearr])
         scrollsaver(router)
         
     
    
    useEffect(()=>{
        Setcompleted(JSON.parse(localStorage.getItem('Completed')))
        Setplan(JSON.parse(localStorage.getItem('PlanToWatch')))
        Setwatching(JSON.parse(localStorage.getItem('Watching')))
        Setonhold(JSON.parse(localStorage.getItem('OnHold')))
        Setdropped(JSON.parse(localStorage.getItem('Dropped')))
        console.log('completed map', completedmap)
        if(sessionStorage.getItem('activetab')==undefined || sessionStorage.getItem('activetab')==null){
            Setactivetab('Plan To Watch')
        }
        if(sessionStorage.getItem('activetab')!=undefined || sessionStorage.getItem('activetab')!=null){
            Setactivetab(sessionStorage.getItem('activetab'))
       }
        Setloading(false)
        
    },[])
    function handletabchange(value){
        Setactivetab(value)
       
    }
  
    //console.log('completed map', completedmap)
    return (
        <> 
             <Navbar/>
             <Toaster className='fixed top-0 z-1000' richColors/>
             <Tabs defaultValue="Plan To Watch" value={activetab} onValueChange={handletabchange} className="relative w-full top-20 border-0 border-blue-500 bg-black">
            <TabsList style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}} className='no-scrollbar::-webkit-scrollbar w-screen justify-start text-xl  z-2 fixed touch-auto  pb-0 rounded-none bg-black text-black border-b-0 overflow-auto border-gray-600 gap-0'>
              <TabsTrigger  onClick={scrollreset} className='border-x-0  text-base border-b-gray-600 rounded-none data-[state=active]:border-b-white data-[state=active]:rounded-b-none data-[state=active]:bg-inherit    data-[state=active]:text-white text-neutral-400  ' value="Plan To Watch">Plan To Watch</TabsTrigger>
              <TabsTrigger  onClick={scrollreset} className='border-x-0  text-neutral-400    text-base      data-[state=active]:bg-inherit  data-[state=active]:text-white  border-b-gray-600 rounded-none data-[state=active]:border-b-white data-[state=active]:rounded-b-none' value="Completed">Completed</TabsTrigger>
              <TabsTrigger  onClick={scrollreset} className='border-x-0  text-neutral-400    text-base      data-[state=active]:bg-inherit  data-[state=active]:text-white  border-b-gray-600 rounded-none data-[state=active]:border-b-white data-[state=active]:rounded-b-none' value="Watching">Watching</TabsTrigger>
              <TabsTrigger  onClick={scrollreset} className='border-x-0  text-neutral-400    text-base      data-[state=active]:bg-inherit  data-[state=active]:text-white  border-b-gray-600 rounded-none data-[state=active]:border-b-white data-[state=active]:rounded-b-none' value="On Hold">On Hold</TabsTrigger>
              <TabsTrigger  onClick={scrollreset} className='border-x-0  text-neutral-400    text-base     data-[state=active]:bg-inherit  data-[state=active]:text-white  border-b-gray-600 rounded-none data-[state=active]:border-b-white data-[state=active]:rounded-b-none' value="Dropped">Dropped</TabsTrigger>
            </TabsList>
            <TabsContent className='relative top-10 pb-38 sm:pb-20 ' value="Plan To Watch">
            {isloading? <p>Loading please wait</p>:
            (planmap.length!=0?<div className="lg:grid  lg:grid-cols-2 w-screen lg:grid-rows pb-8 sm:pb-0">
                {
                     (planmap.slice(0,currentpagearr).map(([key, value]) =>(
                        <Link     href={'/mylist/Plan To Watch/'+value.node.id}>
                            
                            <Horizontalcard className='' key={value.node.id} 
                            mal_id={value.node.id}
                            image={value.node.main_picture?.large==undefined?'':value.node.main_picture?.large} 
                            status= {value.node.status.split('_').map(word => word[0].toUpperCase() + word.slice(1)).join(' ')}
                            season={value.node.season ==null ? ' ':value.node.season + ' '+ value.node.year }
                            episodes={value.node.num_episodes}
                            title={value.node.alternative_titles.en==''?value.node.title:value.node.alternative_titles.en}
                            score={value.node.mean}
                            users={value.node.num_scoring_users}
                            ranking={value.node.popularity}
                            genre={value.node.genres}/>
                        </Link>
               )))
                }
            </div>:<p className="text-white w-full h-full text-center py-60 ">No shows in record yet</p>)
              
            }
            </TabsContent>
            <TabsContent className='relative top-10 max-w-screen pb-38 sm:pb-20' value="Completed">
            {isloading? <p>Loading please wait</p>:
           (completedmap.length!=0? <div className="lg:grid lg:grid-cols-2 max-w-screen pb-8 sm:pb-0 lg:grid-rows">
                {
                     (completedmap.slice(0,currentpagearr).map(([key, value]) =>(
                        <Link  href={'/mylist/Completed/'+value.node.id}>
                            <Horizontalcard className='' key={value.node.id} 
                            mal_id={value.node.id}
                            image={value.node.main_picture?.large==undefined?'':value.node.main_picture?.large} 
                            status= {value.node.status.split('_').map(word => word[0].toUpperCase() + word.slice(1)).join(' ')}
                            season={value.node.season ==null ? ' ':value.node.season + ' '+ value.node.year }
                            episodes={value.node.num_episodes}
                            title={value.node.alternative_titles.en==''?value.node.title:value.node.alternative_titles.en}
                            score={value.node.mean}
                            users={value.node.num_scoring_users}
                            ranking={value.node.popularity}
                            genre={value.node.genres}/>
                           
                        </Link>
               )))
                }
            </div>:<p className="text-white w-full h-full text-center py-60 ">No shows in record yet</p>)
              
            }
            </TabsContent>
            <TabsContent className='relative top-10 bg-black  pb-38 sm:pb-20' value="Watching">
            {isloading? <p>Loading please wait</p>:
            ( watchinmap.length!=0?<div className="lg:grid lg:grid-cols-2 max-w-screen pb-8 sm:pb-0 lg:grid-rows">
                {
                    (watchinmap.slice(0,currentpagearr).map(([key, value]) =>(
                        <Link  href={'/mylist/Watching/'+value.node.id}>
                            <Horizontalcard className='' key={value.node.id} 
                            mal_id={value.node.id}
                            image={value.node.main_picture?.large==undefined?'':value.node.main_picture?.large} 
                            status= {value.node.status.split('_').map(word => word[0].toUpperCase() + word.slice(1)).join(' ')}
                            season={value.node.season ==null ? ' ':value.node.season + ' '+ value.node.year }
                            episodes={value.node.num_episodes}
                            title={value.node.alternative_titles.en==''?value.node.title:value.node.alternative_titles.en}
                            score={value.node.mean}
                            users={value.node.num_scoring_users}
                            ranking={value.node.popularity}
                            user_episode={progress(key)}/>
                           
                        </Link>
               )))
                }
            </div>:<p className="text-white w-full h-full text-center py-60 ">No shows in record yet</p>)
               
            }
            </TabsContent>
            <TabsContent className='relative top-10 pb-38 sm:pb-20' value="On Hold">
            {isloading? <p>Loading please wait</p>:
            (onholdmap.length!=0?<div className="lg:grid lg:grid-cols-2 w-screen pb-8 sm:pb-0 lg:grid-rows">
                {
                     (onholdmap.slice(0,currentpagearr).map(([key, value]) =>(
                        <Link  href={'/mylist/On Hold/'+value.node.id}>
                            <Horizontalcard className='' key={value.node.id} 
                            mal_id={value.node.id}
                            image={value.node.main_picture?.large==undefined?'':value.node.main_picture?.large} 
                            status= {value.node.status.split('_').map(word => word[0].toUpperCase() + word.slice(1)).join(' ')}
                            season={value.node.season ==null ? ' ':value.node.season + ' '+ value.node.year }
                            episodes={value.node.num_episodes}
                            title={value.node.alternative_titles.en==''?value.node.title:value.node.alternative_titles.en}
                            score={value.node.mean}
                            users={value.node.num_scoring_users}
                            ranking={value.node.popularity}
                            genre={value.node.genres}/>
                           
                        </Link>
               )))
                }
            </div>:<p className="text-white w-full h-full text-center py-60 ">No shows in record yet</p>)
              
            }
            </TabsContent>
            <TabsContent className='relative top-10 pb-38 sm:pb-20' value="Dropped">
            {isloading? <p>Loading please wait</p>:
            (droppedmap.length!=0?
            <div className="lg:grid lg:grid-cols-2 w-screen pb-8 sm:pb-0 lg:grid-rows">
                {
                     (droppedmap.slice(0,currentpagearr).map(([key, value]) =>(
                        <Link href={'/mylist/Dropped/'+value.node.id}>
                            <Horizontalcard className='' key={value.node.id} 
                            mal_id={value.node.id}
                            image={value.node.main_picture?.large==undefined?'':value.node.main_picture?.large} 
                            status= {value.node.status.split('_').map(word => word[0].toUpperCase() + word.slice(1)).join(' ')}
                            season={value.node.season ==null ? ' ':value.node.season + ' '+ value.node.year }
                            episodes={value.node.num_episodes}
                            title={value.node.alternative_titles.en==''?value.node.title:value.node.alternative_titles.en}
                            score={value.node.mean}
                            users={value.node.num_scoring_users}
                            ranking={value.node.popularity}
                            genre={value.node.genres}/>
                          
                        </Link>
                         )))
                }
            </div>:<p className="text-white w-full h-full text-center py-60 ">No shows in record yet</p>)
              
              
            }
            </TabsContent>
           
        </Tabs>
        </>
    
       
       

    )
}