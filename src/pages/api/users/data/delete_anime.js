



export const config = {
    runtime: 'edge',
};
import { parseCookie } from "next/dist/compiled/@edge-runtime/cookies";
export default async function handler(req){
    const rawcookies = req.headers.get('cookie')
    const cookies = parseCookie(rawcookies)
    const url = new URL(req.url)
    const anime_id = url.searchParams.get('anime_id')
    
  //http://localhost:3000/api/users/data/delete_anime?anime_id=51818
   
    if(!anime_id) 
        return new Response(JSON.stringify({error: ' animeid parameter is missing'}),{
            status: 400,
            headers:{
                'Content_Type': 'application/json'
            }
        })
   try{
    
    const result = await fetch(`https://api.myanimelist.net/v2/anime/${anime_id}/my_list_status`,{
        method: 'DELETE',
        headers:{
             'Authorization': `Bearer ${cookies.get('access_token')}`,
             'Content-Type': 'application/x-www-form-urlencoded'
        },
    })
    if(!result.ok) 
    {
        const errordata = await result.json()
        throw new Error(`error message ${JSON.stringify(errordata)}`)
    }
    return new Response(JSON.stringify({message: 'succesfully deleted'}),{
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