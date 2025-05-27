
export default async function tokenrefresh(){
    try{
        const result = await fetch('/api/users/auth/refresh_accesstoken')
        const resultjson = await result.json()
        if(!result.ok) throw new Error
        console.log('refresh access token obtained succesfully')

    }
    catch(error){
        console.log('error occred during refreshing ccess token using worker' + error)
      
    }
}