import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
export default function user_card(props){
    return(
        <div className=" flex flex-row gap-4 ">
            <div className="flex flex-col justify-center items-center ">
                <Avatar className='text-black h-20 w-20'>
                  <AvatarImage  src={props.avatar_src} />
                  <AvatarFallback>MAL</AvatarFallback>
                </Avatar>
            </div>
            <div className="flex flex-col justify-center text-neutral-400 ">
                <p>{'@'+props.username}</p>
                <p>Joined at {props.join_date.day +'/'+ props.join_date.month+'/'+ props.join_date.year}</p>
            </div>
        </div>
    )
}