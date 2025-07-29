export default async function dataValidity(storage_key,api_status){
    //DEPRECATED - mal now allow 1000 per fetch defeats whole purpose of this
    //false - invaLid data needed whole refetch
    //true - valid data dont need refetch
    const valid_api_status = ['watching','completed','on_hold','dropped','plan_to_watch']
    //check for valid api status string 
    if(valid_api_status.indexOf(api_status) ==-1) return {status: false , return_at: 'invalid api status check', hint: valid_api_status}


    let local_data = JSON.parse(localStorage.getItem(storage_key))
    const  api_data = await fetchapi(api_status)
    console.log('local data is ',local_data)
    console.log('api data is ',api_data)

    //avoid checking data that only needed single api call
    //max api per fetch is 100 thus this function is for user list greater then 100
    if(!Array.isArray(local_data) || !local_data) return {status: false , return_at: 'local data is undefined or not an array check'}
    if(local_data.length<100 || api_data.length < 100) return {status: false , return_at: '<100 check'}
    local_data =  local_data.slice(0, 100)
    if(!api_data) return {status: false , return_at: 'api data is undefined check'}
    //if the head content is different then means changes
    const compare_id = local_data[0][0] === api_data[0].node.id

    //console.log('local data ',local_data[0][1].list_status)
    const list_status_local = local_data[0][1].list_status
    //console.log('api data ', api_data[0][1])
    const list_status_api =  api_data[0].list_status


    const compare_status = list_status_local.status === list_status_api.status
    //console.log('success head check')
    const compare_ep_progress = list_status_local.num_episodes_watched === list_status_api.num_episodes_watched
    const compare_score = list_status_local.score === list_status_api.score
    if(!(compare_id && compare_ep_progress && compare_score && compare_status)) return false

    //different length means data difference compare them
    //if(local_data.length != api_data.length) return {status: false , return_at: 'length check'}
    
    // Pre-computed deterministic indexes (28 evenly spaced)
    const sample_indexes = new Set([
        3, 7, 10, 14, 17, 21, 24, 28, 31, 
      34, 38, 41, 45, 48, 52, 55, 59, 62, 65, 
      69, 72, 76, 79, 83, 86, 90, 93, 97
    ]);

    for (const value of sample_indexes){
        if(value>api_data.length-1 || value >= local_data.length-1) return {status: false , return_at: `sampling check where value of sampling > api_data length at ${value}`}
        const list_status_local = local_data[value][1].list_status
        const list_status_api = api_data[value].list_status

        const compare_id = local_data[value][0] === api_data[value].node.id
        const compare_status = list_status_local.status === list_status_api.status
        const compare_ep_progress = list_status_local.num_episodes_watched === list_status_api.num_episodes_watched
        const compare_score = list_status_local.score === list_status_api.score
        if(!(compare_id && compare_ep_progress && compare_score && compare_status)) return {status: false , return_at: `sampling check at ${value}`}

    }
    return {status: true , return_at: `succesfully validate the local no need additional fetch`}

}
async function fetchapi(api_status){
    //http://localhost:3000/api/users/data/userlist?&sort=list_updated_at&offset=0&status=completed
    try{
        console.log(`${process.env.NEXT_PUBLIC_Local_host ?? process.env.Prod_host}api/users/data/userlist?&sort=list_updated_at&offset=0&status=${api_status}`)
        const result = await fetch(`${process.env.NEXT_PUBLIC_Local_host ?? process.env.Prod_host}api/users/data/userlist?&sort=list_updated_at&offset=0&status=${api_status}`)
        if(!result.ok){
            throw new Error(`HTTP ${result.status}`)
        }
        const resultjson = await result.json()
        return resultjson.data
    }
    catch(error){
        console.log(`error in fetching for validation cause: ${error}`)
    }
}