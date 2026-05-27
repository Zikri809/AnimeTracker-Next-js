'use client';

import Login_navbar from "@/ComponentsSelf/navbar/log_in_navbar"
import { Card, CardContent } from "@/components/ui/card";
import { useCurrentRoute } from "@/hooks/use-current-route";
import { useEffect, useState } from "react";

export default function LogoutSuccessPage() {
    const router = useCurrentRoute();
    const [timer, Settimer] = useState(5);
    useEffect(() => {
        if (!router.isReady) return;
        let interval: any;
        let timeout: any;
        const runcount = () => {
          interval = setInterval(() => {
            Settimer((t) => t - 1);
        }, 1000);
         timeout = setTimeout(() => {
            window.location.href = '/mylist';
        }, 5000);
        };
       localStorage.setItem('Watching', JSON.stringify([]));
       localStorage.setItem('Completed', JSON.stringify([]));
       localStorage.setItem('OnHold', JSON.stringify([]));
       localStorage.setItem('Dropped', JSON.stringify([]));
       localStorage.setItem('PlanToWatch', JSON.stringify([]));
       runcount();
         return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [router.isReady]);
    return (
        <div className="bg-black w-screen h-[100svh]  flex flex-col items-center">
            <Login_navbar/>
            <Card className="bg-black  h-screen w-screen relative border-0 flex flex-col items-center justify-center">
                 <CardContent className="sm:bg-white/5 bg-black sm:backdrop-blur-md sm:border sm:border-white/10  rounded-2xl p-10 flex w-fit flex-col items-center justify-center">
                    <img className="h-80 w-80 p-0" src="/svg-illustration/Alone-rafiki.svg" alt="Logout illustration" />
                    <h1 className="text-2xl text-white  text-center font-bold">Your Anime World Has Been Disconnected</h1>
                    <p className="mt-2 text-center text-neutral-400 text-sm">All watchlist on this device has been removed.</p>
                    <p className="mt-0 text-center text-neutral-400 text-sm">You will be redirected in {timer} seconds. Doesn&apos;t work? Click the top left button.</p>
                </CardContent>
            </Card>
        </div>
    );
}
