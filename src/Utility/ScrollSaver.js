import { useEffect } from "react";


export default function scrollsaver(router){
   
    useEffect(()=>{
          const handleRouteChangeStart = () => {
              sessionStorage.setItem('scrollY', window.scrollY);
            };
            router.events.on('routeChangeStart', handleRouteChangeStart);
         
            return () => {
                router.events.off('routeChangeStart', handleRouteChangeStart);
               
               
              };
    },[])
}