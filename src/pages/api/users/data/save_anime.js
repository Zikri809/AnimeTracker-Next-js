
export const config = {
    runtime: 'edge',
};
import { parseCookie } from "next/dist/compiled/@edge-runtime/cookies";
//http://localhost:3000/api/users/data/save_anime?anime_id=51818&status=watching&episode=0&score=0
export default async function handler(req){
   const rawcookies = req.headers.get('cookie')
   const cookies = parseCookie(rawcookies)
   const url = new URL(req.url)
   const anime_id  = url.searchParams.get('anime_id')
   const status  = url.searchParams.get('status')
   const episode = url.searchParams.get('episode')
   const score = url.searchParams.get('score')


   if(!(status=='watching' || status=='completed' || status=='on_hold' || status=='dropped' || status=='plan_to_watch')){

        return new Response(JSON.stringify({error : 'syntax error for status query check the spelling !'}),{
            status: 400,
            headers:{
                'Content_Type': 'application/json'
            }
        })
   }
   //status query format: watching completed on_hold dropped plan_to_watch
   if(!(parseInt(score)>=0 && parseInt(score)<=10)){ 

    return new Response(JSON.stringify({error: 'the score parameter is out of range only 0-10 is accepted'}),{
            status: 400,
            headers:{
                'Content_Type': 'application/json'
            }
        })
   }

   try{
    const body = new URLSearchParams({
        status: status,
        score: parseInt(score),
        num_watched_episodes: parseInt(episode)
    })
    const result = await fetch(`https://api.myanimelist.net/v2/anime/${anime_id}/my_list_status`,{
        method: 'PUT',
        headers:{
             'Authorization': `Bearer ${cookies.get('access_token')}`,
             'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
    })
    if(!result.ok) 
    {
        const errordata = await result.json()
        throw new Error(`error message ${JSON.stringify(errordata)}`)
    }
    return new Response(JSON.stringify({message: 'succesfully updated'}),{
            status: 200,
            headers:{
                'Content-Type': 'application/json'
            }
        })
    
   }
   catch(error){
    return new Response(JSON.stringify({error: 'error occured in proxy api ', causes: error}),{
            status: 500,
            headers:{
                'Content-Type': 'application/json'
            }
        })

   }



}