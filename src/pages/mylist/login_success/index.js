import Login_navbar from "@/ComponentsSelf/navbar/log_in_navbar"
import { Button } from "@/components/ui/button"
import { LogIn } from 'lucide-react';
import { Card,CardContent,CardDescription,CardTitle } from "@/components/ui/card";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function login_page(){
    const router = useRouter()
    const [timer, Settimer] = useState(10)
    useEffect(()=>{
        if (!router.isReady) return
        let interval
        let timeout
        const runcount = () =>{
             interval = setInterval(() => {
               Settimer((timer)=> (timer-1))
           }, 1000);
           // if insist on using router offset the timeout to be slower by 500ms to prevetn race conditions
            timeout = setTimeout(() => {
               window.location.href = '/mylist'
           }, 10000);
        }

    
     const worker = new Worker(
       '/worker/worker.js'
      
     );
     worker.postMessage('start')
     worker.onmessage = (e) =>{
       console.log('data is passed from the worker',e.data.collectionarr)
       
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
       runcount()
      
     }
    
       



        return () => {
            clearInterval(interval)
            clearTimeout(timeout)
            worker.terminate()
        }
    },[router.isReady])
    return(
        <div className="bg-black w-screen h-[100svh]  flex flex-col items-center">
            <Login_navbar/>
            <Card className="bg-black  h-screen w-screen relative border-0 flex flex-col items-center justify-center">
                 <CardContent className="sm:bg-white/5 bg-black sm:backdrop-blur-md sm:border sm:border-white/10  rounded-2xl p-10 flex w-fit flex-col items-center justify-center">
                    <img className="h-80 w-80 p-0" src="/svg-illustration/Completed-amico.svg"></img>
                    <h1 className="text-2xl text-white  text-center font-bold">Your Anime World Connected</h1>
                    <p className="mt-2 text-center text-neutral-400 text-sm">MAL account will sync your watchlist across devices.</p>
                     <p className="mt-0 text-center text-neutral-400 text-sm">`You will be redirected in {timer} seconds. Doesn't work? Click the top left button.`</p>
                   
                </CardContent>
            </Card>
               
                    
                   
                    
                
            
        </div>
    )
}