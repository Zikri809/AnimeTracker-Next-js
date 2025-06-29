import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from 'lucide-react';
export default function error_exceed_retryLimit(props){
    const router = props.router
    const error_page_url =props.url
    const error_page_query = JSON.parse(props.query)
    return(
        <div className="w-screen h-screen flex flex-row items-center justify-center px-10">
        <div className="flex flex-col gap-4">
            <p className="font-extrabold text-center text-2xl">Retry Limit Exceeded!</p>
            <p className="text-lg text-center text-neutral-400">Your enthusiasm is admirable, but even the strongest anime protagonist needs a rest! Please wait a few minutes before your next attempt. 🍜</p>
            <div className="text-md flex flex-row gap-4 items-center justify-center font-extrabold">
                <Button className='hover:bg-neutral-700 flex flex-row gap-1 items-center hover:border-neutral-700 bg-black border-2 border-neutral-500' ><Link className="flex flex-row items-center gap-2 " href={error_page_url.split('/').pop()=='tracking'?error_page_url.split('/').slice(0,-1).join('/'):
                (error_page_query.hasOwnProperty('relation_id')?(error_page_url.split('/').slice(0,-2).join('/')):
                (error_page_url.split('/')[1]=='Anime'?'/':(error_page_query.hasOwnProperty('mylist_tab')? '/mylist':error_page_url.split('/').slice(0,-1).join('/'))))}>
                  <ArrowLeft size={32} /> Go Back
                </Link></Button>
                <Button className='hover:bg-neutral-400 bg-white text-black' onClick={() => router.push(error_page_url)}>Try Again</Button>

            </div>
        </div>
        
        </div>
    )
}