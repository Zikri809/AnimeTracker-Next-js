import { parseCookies } from "nookies"
//http://localhost:3000/api/users/data/save_anime?anime_id=51818&status=watching&episode=0&score=0
export default async function handler(req, res){
    const {anime_id,status, episode, score} = req.query
   if(!(status=='watching' || status=='completed' || status=='on_hold' || status=='dropped' || status=='plan_to_watch')){
    return res.status(400).json({error : 'syntax error for status query check the spelling !'})}
   //status query format: watching completed on_hold dropped plan_to_watch
   if(!(parseInt(score)>=0 && parseInt(score)<=10)){ 
    return res.status(400).json({error: 'the score parameter is out of range only 0-10 is accepted'})}
    const cookies =parseCookies({req})
   try{
    const body = new URLSearchParams({
        status: status,
        score: parseInt(score),
        num_watched_episodes: parseInt(episode)
    })
    const result = await fetch(`https://api.myanimelist.net/v2/anime/${anime_id}/my_list_status`,{
        method: 'PUT',
        headers:{
             'Authorization': `Bearer ${cookies.access_token}`,
             'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
    })
    if(!result.ok) 
    {
        const errordata = await result.json()
        throw new Error(`error message ${JSON.stringify(errordata)}`)
    }
     res.status(200).json({message: 'succesfully updated'})
   }
   catch(error){
    res.status(500).json({error: 'error occured in proxy api ', causes: error})
   }



}