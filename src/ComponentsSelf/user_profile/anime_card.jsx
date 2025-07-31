import {Card, CardContent} from  "@/components/ui/card";
export default function animecard({title, user_score, img}){
    return(
        <>
        <Card className='bg-transparent border-none overflow-hidden  w-fit '>
            <CardContent className='p-0 flex flex-col'>
                
                <img className="rounded-md object-cover  aspect-[2/3]" src={img}></img>
                <div className="flex-col flex gap-1 pt-2">
                    <p className="text-white font-bold line-clamp-2  text-ellipsis">{title}</p>
                    <p className="text-neutral-400 ">{'User Score '+user_score}</p>

                </div>
            </CardContent>
        </Card>
        </>
    )
}