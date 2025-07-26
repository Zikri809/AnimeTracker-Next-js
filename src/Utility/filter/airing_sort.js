import top_score from "./top_score";
export default function airing_sort(anime_arr_of_object){
    const airing = []
    const not_airing = []
    for(let index = 0 ; index<anime_arr_of_object.length ; index++){
        if(anime_arr_of_object[index].node.status === 'currently_airing'){
            airing.push(anime_arr_of_object[index])
        }
        else{
            not_airing.push(anime_arr_of_object[index])
        }
    }
    return [...top_score(airing), ...not_airing]
}