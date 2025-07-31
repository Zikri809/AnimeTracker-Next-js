export default async function cross_check(mal_id,status){
    //the main purpose of this function is to make sure that the anime added through the tracking page is 
    //available in the watchlist because there is cases of shadow banned occuring on anime with genre such as echi , Rx and so on 
    //those anime can be added to the watchlist but is not returned in our userwatch list api
    //and those anime are visible on mal website

    const valid_storage_name = status.split(' ').map(text => {return text.substring(0,1).toUpperCase()+text.substring(1)}).join('')
    console.log('valid storage name ',valid_storage_name)
    const key_value_array = JSON.parse(localStorage.getItem(valid_storage_name))
    console.log('key value array ',key_value_array)
    const data_map = new Map(key_value_array)
    console.log('data map ',data_map)
    if(data_map.has((parseInt(mal_id)))){
        return Promise.resolve('anime is visible in watchlist')
    }
    else{
        return Promise.reject('anime is not in the watchlist')
    }


}