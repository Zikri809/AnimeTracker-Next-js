import Login_navbar from "@/ComponentsSelf/navbar/log_in_navbar"
import { Button } from "@/components/ui/button"
import { LogIn } from 'lucide-react';
import { Card,CardContent,CardDescription,CardTitle } from "@/components/ui/card";
import { useRouter } from "next/router";

export default function login_page(){
    const router = useRouter()
    async function log_in (){
        try{
            router.push('/api/users/auth/authorize')
        }catch(error){
            console.error('fatal error occured during auth', error)
        }
    }

    return(
        <div className="bg-black w-screen h-[100svh]  flex flex-col items-center">
            <Login_navbar/>
            <Card className="bg-black  h-screen w-screen relative border-0 flex flex-col items-center justify-center">
                 <CardContent className="sm:bg-white/5 bg-black sm:backdrop-blur-md sm:border sm:border-white/10  rounded-2xl p-10 flex w-fit flex-col items-center justify-center">
                    <img className="h-80 w-80 p-0" src="/svg-illustration/Mobile-login-amico.svg"></img>
                    <h1 className="text-2xl text-white  text-center font-bold"> Store Your Anime World</h1>
                    <p className="mt-2 text-center text-neutral-400 text-sm">Connect your MAL account to sync and track your anime effortlessly.</p>
                    <Button onClick={log_in} className='mt-6 bg-neutral-700'><LogIn /> Connect to MAL Account</Button>
                </CardContent>
            </Card>
               
                    
                   
                    
                
            
        </div>
    )
}