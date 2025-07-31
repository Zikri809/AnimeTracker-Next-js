import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card,CardContent } from "@/components/ui/card"
export default function user_card(props){
    return(
        <Card className=' bg-neutral-900 border-1 border-neutral-600 '>
            <CardContent>
            <div className=" flex flex-row gap-4 ">
                <div className="flex flex-col justify-center items-center ">
                    <Avatar className='text-black h-20 w-20'>
                      <AvatarImage  src={props.avatar_src} />
                      <AvatarFallback>MAL</AvatarFallback>
                    </Avatar>
                </div>
                <div className="flex flex-col justify-center  ">
                    <p className="text-white font-bold text-2xl">{'@'+props.username}</p>
                    <p className="text-neutral-400">Joined at {props.join_date.day +'/'+ props.join_date.month+'/'+ props.join_date.year}</p>
                </div>
            </div>

            </CardContent>
        </Card>
    )
}