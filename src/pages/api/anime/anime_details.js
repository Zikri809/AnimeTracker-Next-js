export const config = {
    runtime: 'edge',
};
export default async function anime_details(req){
    //the main purpose of this api to cross check the anime 
    //testing at localhost:300/api/anime/anime_details?=57969


    const raw_cookies = req.headers.get('cookie')
    const cookies = parseCookie(raw_cookies)
    const url = new URL(req.url)
    const mal_id = url.searchParams.get('id')
    try{
        const result = await fetch (`https://api.myanimelist.net/v2/anime/${mal_id}`,{
            method: 'GET',
            headers:{
               'Authorization': `Bearer ${cookies.get('access_token')}`,
            }
        })
        if(!result.ok){
            throw new Error(`HTTP ${result.status}`)
        }
        const resultjson = await result.json()
        return new Response(JSON.stringify(resultjson),{
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }
    catch(error){
        return new Response(JSON.stringify({error: 'Failed to fetch data'}),{
            status: 500,
            headers:{
                'Content-Type': 'application/json'
            }
        })
    }
}