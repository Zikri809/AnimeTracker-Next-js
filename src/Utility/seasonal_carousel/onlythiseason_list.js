export default function onlythisseason_list(object, season,year){
    //return a list of anime that are from specified seasons
    if(object.data == undefined) return
    let this_season_only_list =[]
    //accepts the json from mal api as a whole 
    for (const element of object.data){
        //make sure this anime only start on this season
        //season : winter spring summer fall
        //year must be in number
        if(element.node.start_season.season==season && element.node.start_season.year==year){
            //console.log('returning ', element)
            this_season_only_list.push(element)
            
        }
    }
    //console.log('this season only list ', this_season_only_list)
    return this_season_only_list
}