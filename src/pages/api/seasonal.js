export default async function handler(req, res){
    //this means that pages/api/seasonal?year=2025&season=spring&limit=50 can remove the limit and use the default
    let {year,season,offset,limit} = req.query

    //request field from the server to avoid overfetching
    const fields='main_picture,status,start_season,num_episodes,title,alternative_titles,mean,num_scoring_users,popularity,genres'


    if(year.length!=4 || isNaN(parseInt(year))) {
        res.status(400).json({error: 'Invalid api query for year'})
        return
    }

    if(!(season=='winter' || season=='spring' || season=='summer' || season=='fall')) {
        res.status(400).json({error: 'Invalid api query for season'})
        return 
    }

    
    if(offset==null || offset==undefined) offset=0 
    try{
        const result = await fetch (`https://api.myanimelist.net/v2/anime/season/${year}/${season}?sort=anime_score&limit=${limit ?? 500}&offset=${offset}&fields=${fields}`,{
            method: 'GET',
            headers:{
               'X-MAL-CLIENT-ID': process.env.Client_ID,
            }
        })
        if(!result.ok){
            throw new Error(`HTTP ${result.status}`)
        }
        const apifeedback = await result.json()
        console.log('proxy fetched ', apifeedback)
        res.status(200).json(apifeedback)
    }
    catch(error){
        res.status(500).json({error: `Failed to fetch data error: ${error}`})

    }
}

