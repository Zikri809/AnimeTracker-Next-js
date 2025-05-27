import { parseCookies, setCookie } from "nookies";
export default async function handler(req,res){
    //http://localhost:3000/api/users/auth/refresh_accesstoken
    //get the refresh token from the cookies
    const cookies =parseCookies({req})
    const basicAuth = Buffer.from(`${process.env.Client_ID}:${process.env.Client_Secret}`).toString('base64'); //this is not in docs by=ut gpt told me and it works
    const body = new  URLSearchParams({
        client_id: process.env.Client_ID,
        grant_type: 'refresh_token',
        refresh_token: cookies.refresh_token
    })
    try{
        const result =await fetch('https://myanimelist.net/v1/oauth2/token',{
            method: "POST",
            headers:{
                 'Authorization': `Basic ${basicAuth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: body.toString()
        })
        if(!result.ok) throw new Error
        const resultjson = await result.json()
        //res.status(200).json(resultjson)
        const second_to_ms = resultjson.expires_in * 1000
        const expiry_date = new Date(Date.now() +second_to_ms)

         setCookie({res},'access_token', `${resultjson.access_token}`,{
                    httpOnly: true,
                    secure: true,
                    path: '/',
                    maxAge: resultjson.expires_in, // use access token expiration time
                })
        setCookie({res},'refresh_token', `${resultjson.refresh_token}`,{
            httpOnly: true,
            secure: true,
            path: '/',
            maxAge: 5184000, // no  expire stated in docs but had to set it to prevent it becoming ssession cookies
        })
        setCookie({res},'expires_in', `${expiry_date}`,{
                    httpOnly: false,
                    secure: true,
                    path: '/',
                    maxAge: resultjson.expires_in, // use access token expiration time
                })
        res.status(200).json({message: 'token refresh retrieved succesfully !'})
    }
    catch(error){
        res.status(500).json({message: `nternal server error ${error}`})
    }
}