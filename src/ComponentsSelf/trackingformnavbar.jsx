import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { useRouter } from "next/router"
import Link from 'next/link'

export default function searchnavbar(props){
    const router = useRouter()
    return(
        <nav className="fixed border-b-1 border-gray-700 z-3 bg-black w-screen pl-4 h-20 px-2 pr-4 mb-3 top-0 left-0 flex flex-row items-center justify-between">
        <div className="flex  flex-row items-center gap-2 sm:gap-2">
        <Link href={router.asPath.split('/')[1]=='morethiseseason' || router.asPath.split('/')[1]=='moreupcoming' || router.asPath.split('/')[1]=='morelastseason'?
                (router.query.hasOwnProperty('relation_id')?'/'+router.asPath.split('/')[1]+'/'+router.query.mal_id+'/relation/'+router.query.relation_id:'/'+router.asPath.split('/')[1]+'/'+router.query.mal_id):
                (router.query.hasOwnProperty('title')?(router.query.hasOwnProperty('relation_id')?('/search/'+router.query.title+'/'+router.query.mal_id+'/relation/'+router.query.relation_id):'/search/'+router.query.title+'/'+router.query.mal_id):
                (router.query.hasOwnProperty('mylist_tab')?'/mylist':(router.query.hasOwnProperty('relation_id')?'/'+router.query.mal_id+'/relation/'+router.query.relation_id:'/'+router.query.mal_id)))}>{/*to={!router.query.hasOwnProperty('section')?(id.hasOwnProperty('title')?'/search/'+id.title+'/'+id.mal_id:(id.hasOwnProperty('mylist_tab')?'/mylist/'+id.mylist_tab+'/'+id.mal_id:'/'+id.mal_id)):'/'+id.section+'/'+id.mal_id} */}
             <Button className='bg-zinc-800 text-white ' variant="secondary" size="icon"><ChevronLeft  /></Button> 
            </Link>
           
        <p  className="line-clamp-1 overflow-hidden text-ellipsis text-2xl ml-2 text-white font-bold text-left"> {props.searchtitle}</p>
       
        </div>
        <Button type='button'  className='hover:bg-gray-300 hover:text-black text-blue-400' onClick={props.savebutton} >Save</Button>
    </nav>
    )
}