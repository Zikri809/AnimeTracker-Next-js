import { parseCookies, setCookie } from "nookies"

export default async function handler (req, res) {

    
     const cookies =parseCookies({req})
     //http://localhost:3000/api/users/data/user_data
     //ommit the localhost not needed during deploymnent
     //when using the user data cookie make sure to use JSON.parse() then 
     //you are able to acces the json object 
     //directly using it will cause error since the cookie is stored in string format 

    try {
        const result = await fetch(`https://api.myanimelist.net/v2/users/@me?fields=anime_statistics,picture`,{
            method: 'GET',
            headers:{
               'Authorization': `Bearer ${cookies.access_token}`,
            }
        })
         const resultjson = await result.json()
         if(!result.ok){
            throw new Error(`HTTP ${result.status} error at ${resultjson}`)
        }
        setCookie({res},'user_data', `${JSON.stringify(resultjson)}`,{
                    httpOnly: false,
                    secure: true,
                    path: '/',
                    maxAge: 5184000, // use access token expiration time
                })
       
        res.status(200).json({succes: 'User data succesfully fetch'})
    }
    catch(error){
        res.status(500).json({error: `${error}`})
    }
}