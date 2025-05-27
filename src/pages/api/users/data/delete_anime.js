import { parseCookies } from "nookies"

export default async function handler(req, res){
    const {anime_id} = req.query
  
    const cookies =parseCookies({req})
    if(!anime_id) return res.status(400).json({error: ' animeid parameter is missing'})
   try{
    
    const result = await fetch(`https://api.myanimelist.net/v2/anime/${anime_id}/my_list_status`,{
        method: 'DELETE',
        headers:{
             'Authorization': `Bearer ${cookies.access_token}`,
             'Content-Type': 'application/x-www-form-urlencoded'
        },
    })
    if(!result.ok) 
    {
        const errordata = await result.json()
        throw new Error(`error message ${JSON.stringify(errordata)}`)
    }
     res.status(200).json({message: 'succesfully deleted'})
   }
   catch(error){
    res.status(500).json({error: 'error occured in proxy api ', causes: error})
   }



}