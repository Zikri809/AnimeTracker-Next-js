'use client';

import Login_navbar from "@/ComponentsSelf/navbar/log_in_navbar";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginFailedPage() {
    const router = useRouter();
    const [timer, Settimer] = useState(5);

    useEffect(() => {
        const interval = setInterval(() => {
            Settimer((t) => t - 1);
        }, 1000);
        const timeout = setTimeout(() => {
            router.push('/mylist');
        }, 5000);
        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [router]);

    return (
        <div className="bg-black w-screen h-[100svh]  flex flex-col items-center">
            <Login_navbar/>
            <Card className="bg-black  h-screen w-screen relative border-0 flex flex-col items-center justify-center">
                 <CardContent className="sm:bg-white/5 bg-black sm:backdrop-blur-md sm:border sm:border-white/10  rounded-2xl p-10 flex w-fit flex-col items-center justify-center">
                    <img className="h-80 w-80 p-0" src="/svg-illustration/Forgot-password-bro.svg" alt="Error illustration" />
                    <h1 className="text-2xl text-white  text-center font-bold">Error Occured during Operation</h1>
                    <p className="mt-2 text-center text-neutral-400 text-sm">Try checking your internet connection or it might be a server error</p>
                    <p className="mt-0 text-center text-neutral-400 text-sm">You will be redirected in {timer} seconds. Doesn&apos;t work? Click the top left button.</p>
                </CardContent>
            </Card>
        </div>
    );
}
