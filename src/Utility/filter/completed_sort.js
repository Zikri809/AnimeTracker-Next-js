import top_score from "./top_score"
export default function completed_sort(anime_arr_of_object){
    const completed = []
    const  not_completed = []
    
    for (let index = 0 ; index<anime_arr_of_object.length ; index++){
        if(anime_arr_of_object[index].node.status === 'finished_airing'){
            completed.push(anime_arr_of_object[index])
        }
        else{
            not_completed.push(anime_arr_of_object[index])
        }
    }
    const sorted_completed = top_score(completed)
    return [...sorted_completed, ...not_completed]
}