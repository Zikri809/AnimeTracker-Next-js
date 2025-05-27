  import { parseCookies } from "nookies"
import { toast } from "sonner"
import looping_updater from "./looping_list_updater"

export default async function tracking_save(animeinfo,status,api,api2,Setadded,router){
    const cookies =parseCookies({})
    if(status==''){
        console.log('toast')
        return toast.error("Status has been selected, Please do so!")
    }
      
       //change the list status
    const mal_status = status.split(' ').map(word => word[0].toLowerCase() + word.slice(1)).join('_')
    animeinfo.list_status.status = mal_status
    animeinfo.list_status.score = api2.selectedScrollSnap()
    animeinfo.list_status.num_episodes_watched = api.selectedScrollSnap()
      Setadded(true)
    if(status=='Watching'){
       
        if(localStorage.getItem('Watching')==null){
            const Watching = new Map()
            localStorage.setItem('Watching',JSON.stringify([...Watching]))
        }
        let watchingmap =new Map(JSON.parse(localStorage.getItem('Watching'))) 
        watchingmap.set(animeinfo.node.id, animeinfo)
        localStorage.setItem('Watching',JSON.stringify([...watchingmap]))
        let deletecompletedmap =new Map(JSON.parse(localStorage.getItem('Completed'))) 
        deletecompletedmap.delete(animeinfo.node.id)
        localStorage.setItem('Completed',JSON.stringify([...deletecompletedmap]))
        let deleteplantowatchmap =new Map(JSON.parse(localStorage.getItem('PlanToWatch'))) 
        deleteplantowatchmap.delete(animeinfo.node.id)
        localStorage.setItem('PlanToWatch',JSON.stringify([...deleteplantowatchmap]))
        let deleteonholdmap =new Map(JSON.parse(localStorage.getItem('OnHold'))) 
        deleteonholdmap.delete(animeinfo.node.id)
        localStorage.setItem('OnHold',JSON.stringify([...deleteonholdmap]))
        let deletedroppedmap =new Map(JSON.parse(localStorage.getItem('Dropped'))) 
       deletedroppedmap.delete(animeinfo.node.id)
       localStorage.setItem('Dropped',JSON.stringify([...deletedroppedmap]))
       
       
    }
    else if(status=='Completed'){
       
        if(localStorage.getItem('Completed')==null){
            const Completed = new Map()
            localStorage.setItem('Completed',JSON.stringify([...Completed]))
        }
    let completedmap =new Map(JSON.parse(localStorage.getItem('Completed'))) 
    completedmap.set(animeinfo.node.id, animeinfo)
        localStorage.setItem('Completed',JSON.stringify([...completedmap]))
        let deletewatchingmap =new Map(JSON.parse(localStorage.getItem('Watching'))) 
        deletewatchingmap.delete(animeinfo.node.id)
        localStorage.setItem('Watching',JSON.stringify([...deletewatchingmap]))
        let deleteplantowatchmap =new Map(JSON.parse(localStorage.getItem('PlanToWatch'))) 
        deleteplantowatchmap.delete(animeinfo.node.id)
        localStorage.setItem('PlanToWatch',JSON.stringify([...deleteplantowatchmap]))
        let deleteonholdmap =new Map(JSON.parse(localStorage.getItem('OnHold'))) 
        deleteonholdmap.delete(animeinfo.node.id)
        localStorage.setItem('OnHold',JSON.stringify([...deleteonholdmap]))
        let deletedroppedmap =new Map(JSON.parse(localStorage.getItem('Dropped'))) 
    deletedroppedmap.delete(animeinfo.node.id)
    localStorage.setItem('Dropped',JSON.stringify([...deletedroppedmap]))
    
       
    }
    else if(status=='Plan To Watch'){
       
        if(localStorage.getItem('PlanToWatch')==null){
            const PlanToWatch = new Map()
            localStorage.setItem('PlanToWatch',JSON.stringify([...PlanToWatch]))
        }
        let plantowatchmap =new Map(JSON.parse(localStorage.getItem('PlanToWatch'))) 
        plantowatchmap.set(animeinfo.node.id,animeinfo)
        localStorage.setItem('PlanToWatch',JSON.stringify([...plantowatchmap]))
        let deletewatchingmap =new Map(JSON.parse(localStorage.getItem('Watching'))) 
        deletewatchingmap.delete(animeinfo.node.id)
        localStorage.setItem('Watching',JSON.stringify([...deletewatchingmap]))
        let deletecompletedmap =new Map(JSON.parse(localStorage.getItem('Completed'))) 
        deletecompletedmap.delete(animeinfo.node.id)
        localStorage.setItem('Completed',JSON.stringify([...deletecompletedmap]))
        let deleteonholdmap =new Map(JSON.parse(localStorage.getItem('OnHold'))) 
        deleteonholdmap.delete(animeinfo.node.id)
        localStorage.setItem('OnHold',JSON.stringify([...deleteonholdmap]))
        let deletedroppedmap =new Map(JSON.parse(localStorage.getItem('Dropped'))) 
        deletedroppedmap.delete(animeinfo.node.id)
        localStorage.setItem('Dropped',JSON.stringify([...deletedroppedmap]))
       
       
    }
    else if(status=='On Hold'){
       
        if(localStorage.getItem('OnHold')==null){
            const OnHold = new Map()
            localStorage.setItem('OnHold',JSON.stringify([...OnHold]))
        }
        let onholdmap =new Map(JSON.parse(localStorage.getItem('OnHold'))) 
        onholdmap.set(animeinfo.node.id,animeinfo)
        localStorage.setItem('OnHold',JSON.stringify([...onholdmap]))
        let deletewatchingmap =new Map(JSON.parse(localStorage.getItem('Watching'))) 
        deletewatchingmap.delete(animeinfo.node.id)
        localStorage.setItem('Watching',JSON.stringify([...deletewatchingmap]))
        let deletecompletedmap =new Map(JSON.parse(localStorage.getItem('Completed'))) 
        deletecompletedmap.delete(animeinfo.node.id)
        localStorage.setItem('Completed',JSON.stringify([...deletecompletedmap]))
        let deleteplantowatchmap =new Map(JSON.parse(localStorage.getItem('PlanToWatch'))) 
        deleteplantowatchmap.delete(animeinfo.node.id)
        localStorage.setItem('PlanToWatch',JSON.stringify([...deleteplantowatchmap]))
        let deletedroppedmap =new Map(JSON.parse(localStorage.getItem('Dropped'))) 
       deletedroppedmap.delete(animeinfo.node.id)
       localStorage.setItem('Dropped',JSON.stringify([...deletedroppedmap]))
       
       
    }
    else {
       
        if(localStorage.getItem('Dropped')==null){
            const Dropped = new Map()
            localStorage.setItem('Dropped',JSON.stringify([...Dropped]))
        }
        let droppedmap =new Map(JSON.parse(localStorage.getItem('Dropped'))) 
       droppedmap.set(animeinfo.node.id,animeinfo)
        localStorage.setItem('Dropped',JSON.stringify([...droppedmap]))
        let deletewatchingmap =new Map(JSON.parse(localStorage.getItem('Watching'))) 
        deletewatchingmap.delete(animeinfo.node.id)
        localStorage.setItem('Watching',JSON.stringify([...deletewatchingmap]))
        let deletecompletedmap =new Map(JSON.parse(localStorage.getItem('Completed'))) 
        deletecompletedmap.delete(animeinfo.node.id)
        localStorage.setItem('Completed',JSON.stringify([...deletecompletedmap]))
        let deleteplantowatchmap =new Map(JSON.parse(localStorage.getItem('PlanToWatch'))) 
        deleteplantowatchmap.delete(animeinfo.node.id)
        localStorage.setItem('PlanToWatch',JSON.stringify([...deleteplantowatchmap]))
        let deleteonholdmap =new Map(JSON.parse(localStorage.getItem('OnHold'))) 
       deleteonholdmap.delete(animeinfo.node.id)
       localStorage.setItem('OnHold',JSON.stringify([...deleteonholdmap]))
       
        //console.log(new Map(JSON.parse(localStorage.getItem('Watching'))))  
    }
    const apicall = async () =>{ 
        try{
            const result = await fetch(`/api/users/data/save_anime?anime_id=${animeinfo.node.id}&status=${mal_status}&episode=${animeinfo.list_status.num_episodes_watched}&score=${animeinfo.list_status.score}`)
             const data = await result.json()
            if(!result.ok){
               
                throw new Error(`error message ${JSON.stringify(data)}`)
            }
             console.log('upadte data is ',data)
        }
        catch(error){
            console.log('error occured in save funciton update req')
        }
    }
    let vartimer = 1000
    if(cookies.expires_in){
        console.log('api upadte triggered')
         vartimer = 3000  
        const promise = async () => {
            await apicall(); // wait for first to complete
            await looping_updater(mal_status); // then do second
            return { name: 'Your'};
        }
           //toast.success('Watchlist saved')
        toast.promise(promise, {
          loading: 'Loading...',
          success: (data) => {
            return `${data.name} anime has been added`;
          },
          error: 'Error',
        });
    }
    setTimeout(() => {
        router.push(router.asPath.split('/')[1]=='morethiseseason' || router.asPath.split('/')[1]=='moreupcoming' || router.asPath.split('/')[1]=='morelastseason'?
                (router.query.hasOwnProperty('relation_id')?'/'+router.asPath.split('/')[1]+'/'+router.query.mal_id+'/relation/'+router.query.relation_id:'/'+router.asPath.split('/')[1]+'/'+router.query.mal_id):
                (router.query.hasOwnProperty('title')?(router.query.hasOwnProperty('relation_id')?('/search/'+router.query.title+'/'+router.query.mal_id+'/relation/'+router.query.relation_id):'/search/'+router.query.title+'/'+router.query.mal_id):
                (router.query.hasOwnProperty('mylist_tab')?(router.query.hasOwnProperty('relation_id')?'/mylist/'+router.asPath.split('/')[2]+'/'+router.query.mal_id+'/relation/'+router.query.relation_id:'/mylist/'+router.asPath.split('/')[2]+'/'+router.query.mal_id):
                (router.query.hasOwnProperty('relation_id')?'/Anime/'+router.query.mal_id+'/relation/'+router.query.relation_id:'/Anime/'+router.query.mal_id))))
    }, vartimer);
    
    //to do : make sure that we a show is added to  category make sure to delete its existence in other category
}