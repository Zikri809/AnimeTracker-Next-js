import Login_navbar from "@/ComponentsSelf/navbar/log_in_navbar"
import { Button } from "@/components/ui/button"
import { LogIn } from 'lucide-react';
import { Card,CardContent,CardDescription,CardTitle } from "@/components/ui/card";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function login_page(){
    const router = useRouter()
    const [timer, Settimer] = useState(5)
    useEffect(()=>{
        const interval = setInterval(() => {
            Settimer((timer)=> (timer-1))
        }, 1000);
        const timeout = setTimeout(() => {
            window.location.href = '/mylist'
        }, 5000);
    },[])
    return(
        <div className="bg-black w-screen h-[100svh]  flex flex-col items-center">
            <Login_navbar/>
            <Card className="bg-black  h-screen w-screen relative border-0 flex flex-col items-center justify-center">
                 <CardContent className="sm:bg-white/5 bg-black sm:backdrop-blur-md sm:border sm:border-white/10  rounded-2xl p-10 flex w-fit flex-col items-center justify-center">
                    <img className="h-80 w-80 p-0" src="/svg-illustration/Forgot-password-bro.svg"></img>
                    <h1 className="text-2xl text-white  text-center font-bold">Error Occured during Operation</h1>
                    <p className="mt-2 text-center text-neutral-400 text-sm">Try checking your internet connection or it might be a server error</p>
                     <p className="mt-0 text-center text-neutral-400 text-sm">`You will be redirected in {timer} seconds. Doesn't work? Click the top left button.`</p>
                   
                </CardContent>
            </Card>
               
                    
                   
                    
                
            
        </div>
    )
}