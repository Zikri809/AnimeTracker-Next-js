
export const config = {
    runtime: 'edge',
};
import { parseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export default async function handler (req) {
    const rawcookies = req.headers.get('cookie')
    //console.log('rawcookies', rawcookies)
    const cookies =parseCookie(rawcookies)
     
     //http://localhost:3000/api/users/data/user_data
     //ommit the localhost not needed during deploymnent
     //when using the user data cookie make sure to use JSON.parse() then 
     //you are able to acces the json object 
     //directly using it will cause error since the cookie is stored in string format 

    try {
        const result = await fetch(`https://api.myanimelist.net/v2/users/@me?fields=anime_statistics,picture`,{
            method: 'GET',
            headers:{
               'Authorization': `Bearer ${cookies.get('access_token')}`,
            }
        })
         const resultjson = await result.json()
         if(!result.ok){
            throw new Error(`HTTP ${result.status} error at ${resultjson}`)
        }
        
        return new Response(JSON.stringify({succes: 'User data succesfully fetch', user_data: resultjson}),{
            status: 200,
            headers:{
                'Content-Type': 'application/json',
                'Set-Cookie': `user_data=${encodeURIComponent(JSON.stringify(resultjson))};  HttpOnly; Secure; path=/;Max-Age=5184000`
            }
        })
       
    }
    catch(error){
        return new Response (JSON.stringify({error: `${error}`}),{
            status: 500,
            headers:{
                'Content-Type': 'application/json'
            }
       })
       
    }
}