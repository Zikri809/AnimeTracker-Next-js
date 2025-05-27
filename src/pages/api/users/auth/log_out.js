import { destroyCookie } from "nookies";
export default async function handler(req,res){
 //localhost:300/api/users/auth/log_out
 //to accces this musth use router.push cannot fetch since ther is nothing this will return
    try{
        const cookie_name = ['access_token', 'refresh_token' , 'expires_in','user_data']
        for (let element of cookie_name){
              destroyCookie({res}, element, { path: '/' })
        }
        console.log('finished clearing now back to')
        res.redirect(302, '/mylist/logout_success')

    }catch(error){
        console.log('error is',error )
        res.redirect(302, '/mylist/login_failed')
    }

}