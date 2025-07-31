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
import useSwipeGesture from "@/hooks/useSwipeGesture"
import { parseCookies } from "nookies"
import storage_Parser from "@/Utility/safety/storage_parser"
import airing_sort from "@/Utility/filter/airing_sort"
import completed_sort from "@/Utility/filter/completed_sort"
import top_member from "@/Utility/filter/top_members"
import top_score from "@/Utility/filter/top_score"

export default function mylist(){
    const [planmap , Setplan] = useState([])
    const [completedmap, Setcompleted] = useState([])
    const [watchinmap, Setwatching] = useState([])
    const [onholdmap, Setonhold] = useState([])
    const [droppedmap, Setdropped] = useState([])
    const [isloading, Setloading] = useState(false)
    const [activetab, Setactivetab] = useState('Plan To Watch')
    const router = useRouter()
    const [currentpagearr , setpagearr ] = useState(30)
    const is_scrollrestored = useRef(false)
    const isupdated = useRef(false)
    
    function onswiperight(){
        //why we dont just use the activetab state var
        //this is because when first run the function will read the fisrt value of state var on first mount
        //since the function are not created at every render it will be stale 
        //thus any function using the state var will be broken
        //but if we use the setter function it will provide the latest value of the state var
        //thus we are able to wrok with the fresh value
        //since setter fucntion will run and get the fresh value of state var
        Setactivetab((activetab)=>{

            const tabArray = ['Plan To Watch','Completed','Watching','On Hold','Dropped' ]
            if(activetab == tabArray[tabArray.length-1]){
                //console.log('active tab is ',activetab)
                 //console.log('moving to Dropped')
                 scrollreset()
                return 'Plan To Watch'
            }
            else{
                const index = tabArray.indexOf(activetab)
                scrollreset()
                //console.log('active tab is ',activetab)
                //console.log('moving to ',tabArray[index +1 ])
               return tabArray[index +1 ]
            }
        })
    }
    function onswipeleft(){
        Setactivetab((activetab)=>{

            const tabArray = ['Plan To Watch','Completed','Watching','On Hold','Dropped' ]
             if(activetab == tabArray[0]){
                //console.log('active tab is ',activetab)
                //console.log('moving to Dropped')
                scrollreset()
                return 'Dropped'
            }
            else{
                const index = tabArray.indexOf(activetab)
                scrollreset()
                //console.log('active tab is ',activetab)
                //console.log('moving to ',tabArray[index -1 ])
                return tabArray[index -1 ]
            }
        })
    }
    useSwipeGesture('x-axis',[onswiperight,onswipeleft],100)

     
    

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

    function scrollreset(){
        
        console.log('scrollreset triggered')
       sessionStorage.setItem('scrollY', 0)
       setpagearr(30)
       sessionStorage.removeItem('sort_type')
       sessionStorage.removeItem('sorted_anime')
       Setcompleted(JSON.parse(localStorage.getItem('Completed')))
       Setplan(JSON.parse(localStorage.getItem('PlanToWatch')))
       Setwatching(JSON.parse(localStorage.getItem('Watching')))
       Setonhold(JSON.parse(localStorage.getItem('OnHold')))
       Setdropped(JSON.parse(localStorage.getItem('Dropped')))
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
         
    const cookies =parseCookies({})
    const expiry_date = new Date(cookies.expires_in) // real expiry
    const internaldeadline = new Date(cookies.expires_in)
    internaldeadline.setDate(expiry_date.getDate()-2);
    const current_date = new Date()
    const hasrunned = useRef(false) //function to have a value that presist across rerender
    useEffect(()=>{
        //allow only run once per entry to page based on my list
     if(cookies.expires_in==undefined || cookies.expires_in == null || current_date.getTime() >= expiry_date.getTime() || hasrunned.current  ) return
     const completed_fallback = JSON.parse(localStorage.getItem('Completed'))
     const plan_fallback = JSON.parse(localStorage.getItem('PlanToWatch'))
     const watching_fallback = JSON.parse(localStorage.getItem('Watching'))
     const onhold_fallback = JSON.parse(localStorage.getItem('OnHold'))
     const dropped_fallback = JSON.parse(localStorage.getItem('Dropped'))
     
     const worker = new Worker(
       '/worker/worker.js'
      
     );
     //Setloading(true)
     worker.postMessage('start')
     //prevent this from being triggered for second time
     hasrunned.current = true
     worker.onmessage = (e) =>{
       //console.log('data is passed from the worker',e.data.collectionarr)
       //Setloading(true)
       
       const watchingmap = e.data.collectionarr[0]
       const completedmap = e.data.collectionarr[1]
       const onholdmap = e.data.collectionarr[2]
       const droppedmap = e.data.collectionarr[3]
       const plantowatchmap = e.data.collectionarr[4]
       
       localStorage.setItem('Watching',JSON.stringify(Array.from(watchingmap)))
       localStorage.setItem('Completed',JSON.stringify(Array.from(completedmap)))
       localStorage.setItem('OnHold',JSON.stringify(Array.from(onholdmap)))
       localStorage.setItem('Dropped',JSON.stringify(Array.from(droppedmap)))
       localStorage.setItem('PlanToWatch',JSON.stringify(Array.from(plantowatchmap)))
        const selectedValue = storage_Parser(sessionStorage, 'sort_type','')
        const anime_data =  JSON.parse(localStorage.getItem(activetab.split(' ').join(''))).map((value)=>{return value[1]})
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
        }
        sorted = sorted.map((value)=>{return [value.node.id,value]})
        if(sorted.length!=0){
            sessionStorage.setItem('sorted_anime', JSON.stringify(sorted))

        }

       Setcompleted(sorted.length!=0?sorted:Array.from(completedmap) )
       Setplan(sorted.length!=0?sorted:Array.from(plantowatchmap) )
       Setwatching(sorted.length!=0?sorted:Array.from(watchingmap) )
       Setonhold(sorted.length!=0?sorted:Array.from(onholdmap))
       Setdropped(sorted.length!=0?sorted:Array.from(droppedmap) )

        //Setloading(false)
      
     }
     if(sessionStorage.getItem('activetab')==undefined || sessionStorage.getItem('activetab')==null){
         Setactivetab('Plan To Watch')
     }
     if(sessionStorage.getItem('activetab')!=undefined || sessionStorage.getItem('activetab')!=null){
         Setactivetab(sessionStorage.getItem('activetab')=='PlanToWatch'?'Plan To Watch':(sessionStorage.getItem('activetab')=='OnHold'?'On Hold':sessionStorage.getItem('activetab')))
    }
    console.log('returning from reload ',storage_Parser(sessionStorage,'sorted_anime', JSON.parse(localStorage.getItem('Completed'))))
    Setcompleted(storage_Parser(sessionStorage,'sorted_anime', completed_fallback))
    Setplan(storage_Parser(sessionStorage,'sorted_anime',      plan_fallback     ))
    Setwatching(storage_Parser(sessionStorage,'sorted_anime',  watching_fallback ))
    Setonhold(storage_Parser(sessionStorage,'sorted_anime',    onhold_fallback   ))
    Setdropped(storage_Parser(sessionStorage,'sorted_anime',   dropped_fallback  ))
    console.log('completed map', completedmap)
    Setloading(false)
    
   return ()=>{
        worker.terminate()
   }
  },[])
    
    useEffect(()=>{
       
        
    },[])
    function handletabchange(value){
        Setactivetab(value)
        sessionStorage.setItem('activetab',value)
        const tab_arr = ['Plan To Watch','Completed','Watching','On Hold','Dropped' ]
        const active_tab_index = tab_arr.indexOf(value)
        const storage_id = ['PlanToWatch','Completed','Watching','OnHold','Dropped' ]
        const setters = [Setplan, Setcompleted, Setwatching, Setonhold, Setdropped];
        for(let index=0; index<storage_id.length; index++){
            if(index==active_tab_index) continue
            const defaultArr = JSON.parse(localStorage.getItem(storage_id[index]))
            setters[index](defaultArr)
        }        
        
       
    }
    
  
    //console.log('completed map', completedmap)
    return (
        <>
             <Navbar isLoading={isloading} Setcompleted={Setcompleted} Setplan={Setplan} Setwatching={Setwatching} Setonhold={Setonhold} Setdropped={Setdropped} SetpageArr={setpagearr}/>
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
                        <Link     href={'/mylist/PlanToWatch/'+value.node.id}>
                            
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
                        <Link  href={'/mylist/OnHold/'+value.node.id}>
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