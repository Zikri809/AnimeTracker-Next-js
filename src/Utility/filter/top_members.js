export default function top_member(anime_arr_of_object){
    const encoded_arr = anime_arr_of_object.map((element, index) => {
        return (element.node.num_scoring_users ?? 1.0)* 100000 + index
    })
     encoded_arr.sort((a,b) => b - a )
     const sorted_arr = encoded_arr.map((element,index)=>{
        const decode_index =Math.round((element % 100000))
        return anime_arr_of_object[decode_index]
     })
     return sorted_arr 
}