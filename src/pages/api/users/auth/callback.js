import { parseCookies,setCookie } from "nookies"
export default async function handler(req, res){
    const{code,state} =req.query
    const cookies = parseCookies({req})
    const body = new URLSearchParams({
  client_id: process.env.Client_ID,
  client_secret: process.env.Client_Secret,
  grant_type: "authorization_code",
  code: code,
  redirect_uri: process.env.dev_auth_redirect==undefined?process.env.prod_auth_redirect:process.env.dev_auth_redirect,
  code_verifier: cookies.code_verifier,
});
console.log('verfier is ',cookies.code_verifier)
console.log('callback body ',body.toString())
    try{
        //verify the state 
        if(cookies.state!=state)  res.status(500).json({error: 'state is not the same' })
        const result = await fetch(`https://myanimelist.net/v1/oauth2/token`,{
            method:'POST',
            headers:{
               "Content-Type": "application/x-www-form-urlencoded",
            },
            body: body.toString()
        })
       
        const response = await result.json()
        console.log('response is ',response)
        const second_to_ms = response.expires_in * 1000
        const expiry_date = new Date(Date.now() +second_to_ms)
        
        //res.status(200).json(response)
        //set acces and refresh token into cookies
        setCookie({res},'access_token', `${response.access_token}`,{
            httpOnly: true,
            secure: true,
            path: '/',
            maxAge: response.expires_in, // use access token expiration time
        })
        setCookie({res},'refresh_token', `${response.refresh_token}`,{
            httpOnly: true,
            secure: true,
            path: '/',
            maxAge: 5184000, 
        })
        setCookie({res},'expires_in', `${expiry_date}`,{
            httpOnly: false,
            secure: true,
            path: '/',
            maxAge: response.expires_in, // use access token expiration time
        })
        res.redirect(302, '/mylist/login_success')

    }
    catch(error){
         res.redirect(302, '/mylist/login_failed')
        //res.status(500).json({error: `Internal server error cannot retrieved the tokens : ${error}` })
    }
}