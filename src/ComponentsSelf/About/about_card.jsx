import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Github } from "lucide-react"
export default function about_card(){
    return(
        <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center gap-4">
                <Avatar className='w-24 h-24'>
                    <AvatarImage  src='https://github.com/Zikri809.png'/> 
                    <AvatarFallback>Zikri</AvatarFallback>
                </Avatar>
                <div className="flex flex-col ">
                    <p className="text-lg font-bold">Zikri</p>
                    <p className="text-neutral-400">Bachelor in Computer Science</p>
                    <div className="flex flex-row gap-2 items-center">
                        <Github size={15}/>
                        <a className="text-blue-600 hover:underline break-all" target="_blank" rel="noopener noreferrer" href="https://github.com/Zikri809">https://github.com/Zikri809</a>
                    </div>

                </div>
            </div>
            <div className="">
                AniJikan is my first personal project built for learning full-stack development with a focus on anime tracking.
            </div>
            <Separator/>
            <div>
                <p className="font-semibold">Credits</p>
                <ul className="text-neutral-400 list-disc list-inside">
                    <li><a className="hover:underline" target="_blank" rel="noopener noreferrer" href="https://myanimelist.net/apiconfig/references/api/v2">MyAnimeList API - Anime data and auth provider</a></li>
                    <li><a className="hover:underline" target="_blank" rel="noopener noreferrer" href="https://jikan.moe/">Jikan API - Unofficial MAL API</a></li>
                    <li><a className="hover:underline" target="_blank" rel="noopener noreferrer" href="https://storyset.com/">Illustration - Storyset</a></li>
                </ul>
            </div>

        </div>
    )
}