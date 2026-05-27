'use client'
import Horizontalcard from '@/ComponentsSelf/animecardheader'
import Navbar from '@/ComponentsSelf/detailednavbar'
import { useEffect, useState } from "react"

import Relation from '@/ComponentsSelf/min'
import Add_to_watchlist_button from '@/ComponentsSelf/add to watchlist button'

import { Skeleton } from "@/components/ui/skeleton"
import Cardskeleton from '@/ComponentsSelf/animecardheader-skeleton'
import overflow_detect from  '@/Utility/overflow_detect.js'
import { useRef } from 'react'
import { useDebounce } from "@uidotdev/usehooks";
import dynamic from 'next/dynamic'
import relation from '@/ComponentsSelf/min'
import { useRouter } from 'next/router'


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }


//const Add_to_watchlist_button = dynamic(() => import('@/ComponentsSelf/add to watchlist button'), { ssr: false })

 export default function DetailAnime(){

    const [animeinfo, Setanimeinfo] = useState<any>()
    const [isloading, Setloading] = useState(true)
    const [browser_width, SetBrowserWidth] = useState<any>()
    const [windowinner, Setwindow] = useState<number>(0)
    let debouncebrowserwidth = useDebounce(windowinner,200)
    const synopsis_ref = useRef<HTMLDivElement>(null)
    const dropdownref = useRef<HTMLDivElement>(null)
    const router = useRouter()

  const [showDropdown, SetShowDropdown] = useState(false);
  const [isExpanded, SetExpanded] = useState(false);

  useEffect(() => {
    if (!isloading && synopsis_ref.current) {
      if (synopsis_ref.current.scrollHeight > synopsis_ref.current.offsetHeight) {
        SetShowDropdown(true);
      } else {
        SetShowDropdown(false);
      }
    }
  }, [isloading, debouncebrowserwidth]);
  useEffect(() => {
    const handleResize = () => {
      Setwindow(window.innerWidth);
      SetBrowserWidth(debouncebrowserwidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [debouncebrowserwidth]);
    useEffect(()=>{
        let retries = 0
        async function fetchapi(){
            if(router.isReady==true){
                console.log('router ',router.query)
                sessionStorage.setItem('urlparams',String(router.query.mal_id ?? ''))
            try{


                const response = await fetch('https://api.jikan.moe/v4/anime/'+(String(router.query.mal_id ?? ''))+'/full')
                if (!response.ok) throw new Error(`HTTP ${response.status}`)
                const apifeedback = await response.json()
                const showinfo = await apifeedback.data
                //console.log(showinfo)
                Setanimeinfo(showinfo)
                Setloading(false)
                window.scrollTo(0,0)
            }
            catch(error){
                await sleep(1000)
                if(retries <=3){
                    retries++
                    fetchapi()
                }
                else{
                    router.push(
                        {
                            pathname: '/ExceedRetryLimit',
                            query:{
                                original_link : router.asPath,
                                original_query : JSON.stringify(router.query)
                            }
                        }
                    )
                }

                console.error(error)
            }
         }
        }
        fetchapi()

    },[String(router.query.mal_id ?? '')])
    //console.log('id',id)
    return (
       <div className='relative overflow-x-hidden top-0 left-0   m-0   w-screen h-auto overflow-hidden  bg-black text-white font-poppins my-1 antialiased' >
            {isloading?
            <nav className='flex flex-row justify-between items-center px-4 top-0 fixed bg-black z-4 w-full h-20'>
                <div className='flex flex-row gap-3'>
                    <Skeleton className='h-10 bg-zinc-700 w-10 rounded-md '/>
                    <Skeleton className='h-10 bg-zinc-700 sm:w-120 w-70 '/>
                </div>

                <Skeleton className='h-10 w-10 bg-zinc-700 rounded-md '/>
            </nav>
            : <Navbar sectionTitle={animeinfo.title_english==null?animeinfo.title: animeinfo.title_english}/>}
            <div className='relative top-20 flex pb-38 sm:pb-30 flex-col '>
                {
                    isloading? <Cardskeleton></Cardskeleton>
                    :
                    <Horizontalcard
                    key={animeinfo.mal_id}
                    image={animeinfo.images.webp.large_image_url}
                    status= {animeinfo.status}
                    season={animeinfo.season ==null ? ' ':animeinfo.season + ' '+ animeinfo.year }
                    episodes={animeinfo.episodes}
                    title={animeinfo.title_english==null?animeinfo.title: animeinfo.title_english}
                    score={animeinfo.score}
                    users={animeinfo.scored_by}
                    ranking={animeinfo.popularity}
                    genre={animeinfo.genres}
                    favorites={animeinfo.favorites}
                    />
                }
                 {!isloading && animeinfo && (animeinfo.status == 'Currently Airing' || animeinfo.status == 'Finished Airing') ?<div className='px-6 py-4 border-none justify-around mb-4 text-white items-center bg-neutral-900 flex flex-row border-gray-600  '>
                    {
                        isloading?<></>:
                        <>
                            <span>{animeinfo.duration}</span>
                            {
                                (
                                    <div className='flex flex-row gap-2'>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125Z" />
                                </svg>
                                <span>{animeinfo.broadcast.day}</span>
                                <span>{animeinfo.broadcast.time}</span>
                                <span>{animeinfo.broadcast.timezone}</span>
                            </div>
                                )
                            }


                        </>

                    }

                </div>:<></>}
                <div className='px-6 border-b-1 border-gray-600 pb-5 '>
                    {isloading?<Skeleton className= 'bg-zinc-700 w-20 h-8 mb-5  inline-block  pb-1'></Skeleton>:<h4 className='text-start font-bold text-2xl mb-5 font-poppins inline-block border-b-1 pb-1 border-white'>Synopsis</h4>}
                {isloading?
                <div className='flex-col flex gap-2'>
                 <Skeleton className='w-[90%] bg-zinc-700 h-8'></Skeleton>
                 <Skeleton className='w-[90%] bg-zinc-700 h-8'></Skeleton>
                 <Skeleton className='w-[90%] bg-zinc-700 h-8'></Skeleton>
                 <Skeleton className='w-[90%] bg-zinc-700 h-8'></Skeleton>
                </div>
               :<div ref={synopsis_ref} className={`relative text-justify z-[1] ${isExpanded ? '' : 'max-h-30 line-clamp-5 overflow-hidden'}`}>
                    {animeinfo.synopsis}
                    {showDropdown && (
                      <div onClick={() => SetExpanded(!isExpanded)} className={`absolute bottom-[-10px] z-[3] w-full flex items-center text-neutral-500 justify-end bg-gradient-to-b to-black cursor-pointer ${isExpanded ? 'h-10' : 'h-full'}`}>
                        {isExpanded ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-up-icon lucide-chevron-up"><path d="m18 15-6-6-6 6"/></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down-icon lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
                        )}
                      </div>
                    )}
                </div>}
                </div>

               {
                isloading ? <Skeleton className=' bg-zinc-700  my-4 mx-6 sm:mx-auto sm:w-200 aspect-video'></Skeleton>:(
                    <>
                       {animeinfo.trailer.embed_url!=null && <iframe className='border-1 border-gray-700 my-4 mx-6 sm:mx-auto sm:w-200 aspect-video' src={animeinfo.trailer.embed_url!=null?(animeinfo.trailer.embed_url.substring(0,animeinfo.trailer.embed_url.length-11)+'&autoplay=0&mute=0'):''}></iframe>}
                    </>
                )
               }
               <div className='bg-neutral-900 px-5 py-4 flex flex-col gap-10 '>
                    <div className=' flex flex-col justify-center gap-2 '>
                        {isloading?
                        <>
                         <Skeleton className='h-8 bg-zinc-700 w-30 rounded-md '/>
                         <Skeleton className='h-8 bg-zinc-700 w-70 rounded-md '/>
                        </>
                        :<>
                            <p className='text-gray-400'>English</p>
                            <p className='text-left'>{animeinfo.title_english}</p>
                        </>
                            }
                    </div>
                    <div className='flex flex-row gap-10 '>
                        <div className='flex flex-col gap-4'>
                            <div>
                                <p className='text-gray-400'>Source</p>
                               { isloading? <Skeleton className='h-8 bg-zinc-700 w-30 rounded-md '/>:<p>{animeinfo.source}</p>}
                            </div>
                            <div>
                            <p className='text-gray-400'>Studio</p>
                            {isloading? <Skeleton className='h-8 bg-zinc-700 w-30 rounded-md '/>:
                            (
                                animeinfo.studios.map((object) => {
                                    return <p key={object.name}>{object.name}</p>
                                })
                            )
                            }
                            </div>
                            <div>
                                <p className='text-gray-400'>Rating</p>
                                {isloading? <Skeleton className='h-8 bg-zinc-700 w-30 rounded-md '/>:<p>{animeinfo.rating}</p>}
                            </div>
                        </div>
                        <div className='flex flex-col gap-4'>
                            <div>
                                <p className='text-gray-400'>Season</p>
                                {isloading? <Skeleton className='h-8 bg-zinc-700 w-30 rounded-md '/>:<p>{animeinfo.source}</p>}
                            </div>
                            <div>
                            <p className='text-gray-400'>Aired</p>
                            {isloading?  <Skeleton className='h-8 bg-zinc-700 w-30 rounded-md '/>:
                            (
                                animeinfo.aired.string
                            )
                            }
                            </div>
                            <div>
                                <p className='text-gray-400'>Licensor</p>
                                {
                                    isloading? <Skeleton className='h-8 bg-zinc-700 w-30 rounded-md '/>:
                                    (animeinfo.liscensor == undefined ? <p>Unkown</p> :
                                       (
                                       animeinfo.liscensor.map((object) => {
                                        return <p key={object.name}>{object.name}</p>
                                       })
                                      )
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </div>
                    {isloading?<Skeleton className='h-30 mt-2 bg-zinc-700 w-[90%]'/>: <Relation id={animeinfo.mal_id}/>}
                    {!isloading && animeinfo && <Add_to_watchlist_button mal_id={animeinfo.mal_id} to={router.asPath +`/tracking`}/>}{/* */}
            </div>

        </div>


    )
}