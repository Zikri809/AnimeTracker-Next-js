import { parseCookies } from "nookies";
import {  useEffect, useRef } from "react";

export default function persistent_worker({children}){
    const cookies =parseCookies({})
    const expiry_date = new Date(cookies.expires_in) // real expiry
    const internaldeadline = new Date(cookies.expires_in)
    internaldeadline.setDate(expiry_date.getDate()-2);
    const current_date = new Date()
    const hasrunned = useRef(false) //function to have a value that presist across rerender
    useEffect(()=>{
     if(cookies.expires_in==undefined || cookies.expires_in == null || current_date.getTime() >= expiry_date.getTime() || hasrunned.current  ) return
    
     const worker = new Worker(
       '/worker/worker.js'
      
     );
     worker.postMessage('start')
     //prevent this from being triggered for second time
     hasrunned.current = true
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
      
     }
    
   return ()=>{
     //no terminate to help it persists across pages as when navigating away will destroy the worker
   }
  },)
    return(
        <>
            {...children}
        </>
    )
}