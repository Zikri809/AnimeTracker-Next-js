export default function onlythis_season(object, season,year){
    //this function return one exclusive anime for each season
 
    //console.log('object is ',object)
      if(object.data == undefined) return
    for (const element of object.data){
        //make sure this anime only start on this season
        //season : winter spring summer fall
        //year must be in number
        if(element.node.start_season.season==season && element.node.start_season.year==year){
            //console.log('returning ', element)
            return element
            
        }
    }
}


