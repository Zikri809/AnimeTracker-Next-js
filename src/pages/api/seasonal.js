export const config = {
  runtime: 'edge',
};


export default async function handler(req){
    //this means that pages/api/seasonal?year=2025&season=spring&limit=50 can remove the limit and use the default
    const url = new URL(req.url)
    
    //console.log('url is ',url)
    
    const year = url.searchParams.get('year')
    const season = url.searchParams.get('season')
    let offset = url.searchParams.get('offset')
    const limit = url.searchParams.get('limit')
    

    //request field from the server to avoid overfetching
    const fields='main_picture,status,start_season,num_episodes,title,alternative_titles,mean,num_scoring_users,popularity,genres'


    if(year.length!=4 || isNaN(parseInt(year))) {
       
        return new Response(JSON.stringify({error: 'Invalid api query for year'}),{
            status: 400,
        })
    }

    if(!(season=='winter' || season=='spring' || season=='summer' || season=='fall')) {
       
        return new Response(JSON.stringify({error: 'Invalid api query for season'}),{
            status: 400,
        })
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
    
        return new Response(JSON.stringify(apifeedback),{
            status: 200,
        })
    }
    catch(error){
       
        return new Response(JSON.stringify({error: `Failed to fetch data error: ${error}`}),{
            status: 500
        })

    }
}

