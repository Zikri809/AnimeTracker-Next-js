import seasonaldata from '@/Utility/seasonaldata'
export default function extended_season_data (){
    const season_data = seasonaldata()

    //calculate past 4 season from the last current season
    const seasons = ['winter','spring', 'summer', 'fall']
    let past_data = []
    let last_season_index = seasons.indexOf(season_data.past_season)
    let lastseasonyear = season_data.past_year

    for(let i = 0 ; i<5 ; i++){
        last_season_index--
         if(seasons[last_season_index>=0?last_season_index:3]!=seasons[3]){
            past_data[i] = {
                season : seasons[last_season_index],
                year : lastseasonyear
            }
         }
         else{
            lastseasonyear--
            last_season_index = 3
            past_data[i] = {
                season: seasons[last_season_index],
                year: lastseasonyear
            }
         }
    }
    past_data = past_data.reverse()
    //console.log('past 4 season is ',past_data)

    //calculate the next 4 season 
    let future_data = []
    let future_season_index = seasons.indexOf(season_data.upcoming_season)
    let futureseasonyear = season_data.upcoming_year

    for(let i =0 ; i<1 ; i++){
        future_season_index++
        if(seasons[future_season_index<=3?future_season_index:0]!=seasons[0]){
            future_data[i]= {
                season: seasons[future_season_index],
                year: futureseasonyear
            }
        }
        else{
            futureseasonyear++
            future_season_index = 0
            future_data[i] = {
                season: seasons[future_season_index],
                year: futureseasonyear
            }
        }
    }
    //console.log("future 4 season ",future_data)
    return {
        past_4_season : past_data,
        future_4_season : future_data,
    }
}
