console.log('Worker script started');
self.onmessage = async (event) => {
  // this is used to fetch user list into the localstorage
  const watchlistarr =['watching', 'completed', 'on_hold' ,'dropped' ,'plan_to_watch']
  let collectionarr = []
  console.log('entering for loop')
  for(element of watchlistarr){
    console.log('in loop')
    let datamap=new Map()
    let paging='sdsfsf' //placeholder to let first run
    let offset =0
    while(paging!=undefined){
      pagingresult = await apifetch(offset, datamap,element)
      paging = await pagingresult.next
      console.log('fetching area paging is ',paging)
      offset+=100
    }
    collectionarr.push(datamap)
    console.log('completed fetching for status: ',element,'data is',datamap)
 }
    user_fetch()
    self.postMessage({collectionarr: collectionarr})
    console.log('completed all fetching in web worker')
};



async function apifetch(offset,datamap,status){
   
    try{
        const result = await fetch(`/api/users/data/userlist?&sort=list_updated_at&offset=${offset}&status=${status}`)
        if (!result.ok) throw new Error
        const resultjson = await result.json()
        //iterate accross the array of result.data
        for(const element of resultjson.data){
          datamap.set(element.node.id, element)
        }
        return resultjson.paging
    }
    catch{
        console.log('error occur in web worker api fetch for each anime status')
        return undefined
    }
}

async function user_fetch(){
  try{
    const result = await fetch('/api/users/data/user_data')
    const resultjson = await result.json()
    if(!result.ok) throw new Error
  }
  catch(error){
    console.log('error occur fetching user data in worker ',error)
  }
}