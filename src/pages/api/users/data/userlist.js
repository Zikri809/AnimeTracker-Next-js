import { parseCookies } from "nookies"

export default async function handler (req, res) {

    const {sort, offset,status }= req.query
     const fields='list_status,main_picture,status,start_season,num_episodes,title,alternative_titles,mean,num_scoring_users,popularity,genres'
     const cookies =parseCookies({req})
     //http://localhost:3000/api/users/data/userlist?&sort=list_updated_at&offset=0&status=completed
     //ommit the localhost not needed during deploymnent
     //for status : watching completed on_hold dropped plan_to_watch
     //below for the sort :
     //list_score 	Descending
     //list_updated_at 	Descending
     //anime_title 	Ascending
     //anime_start_date 	Descending

    


    try {
        const result = await fetch(`https://api.myanimelist.net/v2/users/@me/animelist?status=${status}&sort=${sort}&offset=${offset}&fields=${fields}&limit=100`,{
            method: 'GET',
            headers:{
               'Authorization': `Bearer ${cookies.access_token}`,
            }
        })
         if(!result.ok){
            throw new Error(`HTTP ${result.status}`)
        }
        const resultjson = await result.json()
        res.status(200).json(resultjson)
    }
    catch(error){
        res.status(500).json({error: 'Failed to fetch data'})
    }
}