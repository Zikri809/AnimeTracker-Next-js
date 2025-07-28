import extended_season_data from "@/Utility/seasonal_carousel/extended_season_data"
import seasonaldata from "@/Utility/seasonaldata"

export default async function warmUp(){
    const base_url = process.env.NEXT_PUBLIC_Local_host ?? process.env.Prod_host //the host already ends with /
    const static_routes = [
        'morethiseseason',
        'morelastseason',
        'moreupcoming'
    ]
    const seasonal_data = seasonaldata()
    const extended = extended_season_data()
    const all_season = [
        ...extended.past_4_season, 
        {season: seasonal_data.past_season,year: seasonal_data.past_year},
        {season: seasonal_data.current_season,year: seasonal_data.current_year},
        {season: seasonal_data.upcoming_season,year: seasonal_data.upcoming_year},
        ...extended.future_4_season
    ]
    let dynamic_routes = []
    for (const element of all_season){
        dynamic_routes.push(`seasons/${element.year}/${element.season}`)
    }
    const route_object = [...static_routes,...dynamic_routes].map((value)=>{
        return {
            route: value, 
            attempts: 0, 
            success:false
        }
    })

    //ensure go over the array for 3 times
    for(let array_looping = 0 ; array_looping < 3  ;array_looping++){
        //loop through elements of the array
        let all_success = true
        for(const element of route_object){
            await fetch_api(element,base_url)
            if(!element.success) all_success = false
         }
         //exit the retry if all success
         if(all_success) break
         await delay(500)
    }
    
}
async function fetch_api(element,base_url){
    try{
        if(element.attempts > 2 || element.success ) return
        const response = await fetch(base_url+element.route, { cache: 'no-store' })
        if(!response.ok) throw new Error((`HTTP ${response.status}`))
            element.success= true
            console.log('success warming page for route ',element.route)
    }
    catch(error){
        element.attempts++
        console.log({message: 'fail to warm page for route ',route: element.route, error: error})
    }
}
function delay(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }
  
  