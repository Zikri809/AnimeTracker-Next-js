export default function top_score(anime_arr_of_object){
    //remember do not return resultjson only need the data part
    //thus anime_arr_of_object resultjson.data 
  
    //generate a comparison arr using mean + anime_data index (literally)
    // 8.75 -> 875000
    // 875000 + index anime_arr =45 =875045 then sort by this 
    //map() generate a new array with each elements undergoes transformation from the callback function
     const encoded_arr = anime_arr_of_object.map((element,index) => {
        //needed to round up due to js floating point computation being incorrect even operating on int
        const encoded = Math.round((element.node.mean ?? 1.0) * 100000 +index)
        //to check for any outlier that fails decoding
        //if(encoded % 1000 != index ){console.log('error decode at ',element.node)console.log('at index ',index)}
        return encoded
        
    });
    
    //primitively sort the encoded_arr
    //to return big to small
    //mutate the original arr
    //console.log('unsorted endcoded arr : ',encoded_arr)
    encoded_arr.sort((a,b)=>b-a)
   

    
    const sorted_arr = encoded_arr.map(element => {
        return anime_arr_of_object[element % 1000]
    });
    //console.log('sorted endcoded arr : ',encoded_arr)
    //console.log('unsorted anime : ',anime_arr_of_object)
    //console.log('sorted anime : ',sorted_arr)
    return sorted_arr
   
}