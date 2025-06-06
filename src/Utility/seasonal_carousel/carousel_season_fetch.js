import extended_season_data from "@/Utility/seasonal_carousel/extended_season_data"
import onlythis_season from "@/Utility/seasonal_carousel/onlythisseason"
import seasonaldata from "@/Utility/seasonaldata"
import sleep from "@/Utility/sleep"
export default async function seasonal_data(){
    const seasonal_data = seasonaldata()
        const extended = extended_season_data()
        const all_season = [
            ...extended.past_4_season, 
            {season: seasonal_data.past_season,year: seasonal_data.past_year},
            {season: seasonal_data.current_season,year: seasonal_data.current_year},
            {season: seasonal_data.upcoming_season,year: seasonal_data.upcoming_year},
            ...extended.future_4_season
        ]
        let season_anime = []
        //console.log('all season ',all_season)
        //add past 4 season
    
        for(const element of all_season){
            try{
                //console.log(`/api/seasonal?year=${year}&season=${season}&limit=${10}`)
                //this will be called by static path thus need for the host
                const result = await fetch(`${process.env.NEXT_PUBLIC_Local_host }/api/seasonal?year=${element.year}&season=${element.season}&limit=${10}`)
                const resultjson = await result.json()
                season_anime.push(onlythis_season(resultjson,element.season,element.year))
                //console.log(season_anime)
                //sleep(500)
            }
            catch(error){
                console.log('error occured fetching exclusive season data error: ',error)
                return []
            }
           
        }
        //resolved all the promises in the array to obtain the value
    
        //season_anime = await season_anime.json()
        console.log('all 11 season data ',season_anime)
        return {
            season_anime: season_anime,
            seasonal_data: all_season
        }
}