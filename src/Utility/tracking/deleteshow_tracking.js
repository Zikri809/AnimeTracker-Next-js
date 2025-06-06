
import { parseCookies } from "nookies"
import { toast } from "sonner"
import looping_updater from "./looping_list_updater"

export default async function delete_show(animeinfo,Setadded,router, status){
    let deletewatchingmap =new Map(JSON.parse(localStorage.getItem('Watching'))) 
    let deletecompletedmap =new Map(JSON.parse(localStorage.getItem('Completed'))) 
    let deleteplantowatchmap =new Map(JSON.parse(localStorage.getItem('PlanToWatch'))) 
    let deleteonholdmap =new Map(JSON.parse(localStorage.getItem('OnHold'))) 
    let deletedroppedmap =new Map(JSON.parse(localStorage.getItem('Dropped'))) 
    const cookies =parseCookies({})
    const mal_status = status.split(' ').map(word => word[0].toLowerCase() + word.slice(1)).join('_')
    if(deletewatchingmap.has(animeinfo.node.id)){
        console.log('condition triggered')
        deletewatchingmap.delete(animeinfo.node.id)
        localStorage.setItem('Watching',JSON.stringify([...deletewatchingmap]))
        
    }
    else if(deletecompletedmap.has(animeinfo.node.id)){
        deletecompletedmap.delete(animeinfo.node.id)
        localStorage.setItem('Completed',JSON.stringify([...deletecompletedmap]))
    }
    else if(deleteplantowatchmap.has(animeinfo.node.id)){
        deleteplantowatchmap.delete(animeinfo.node.id)
        localStorage.setItem('PlanToWatch',JSON.stringify([...deleteplantowatchmap]))
    }
    else if(deleteonholdmap.has(animeinfo.node.id)){
        deleteonholdmap.delete(animeinfo.node.id)
        localStorage.setItem('OnHold',JSON.stringify([...deleteonholdmap]))
    }
    else{
        deletedroppedmap.delete(animeinfo.node.id)
        localStorage.setItem('Dropped',JSON.stringify([...deletedroppedmap]))
    }
    //toast.success('Show has been deleted from watch list')
    Setadded(false)
    const apicall = async () =>{ 
           try{
               const result = await fetch(`/api/users/data/delete_anime?anime_id=${animeinfo.node.id}`)
               if(!result.ok){
                   const errordata = await result.json()
                   throw new Error(`error message ${JSON.stringify(errordata)}`)
               }
           }
           catch(error){
               console.log('error occured in delete funciton update delete req')
           }
       }
    let vartimer = 1000
    if(cookies.expires_in){
        vartimer = 3000 //to let the toast stay longer on the screen
       const promise = async () => {
            await apicall(); // wait for first to complete
            await looping_updater(mal_status); // then do second
            return { name: 'Your'};
        }
           //toast.success('Watchlist saved')
        toast.promise(promise, {
          loading: 'Loading...',
          success: (data) => {
            return `${data.name} anime has been deleted`;
          },
          error: 'Error',
        });
    }
    setTimeout(() => {
       router.push(router.asPath.split('/').slice(0,-1).join('/'))
    }, vartimer);
}