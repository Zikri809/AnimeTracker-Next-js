import pkceChallenge from "pkce-challenge";
import randomstring from '@/Utility/randomstring'
import { setCookie } from 'nookies';
export default async function handler(req, res){
    //http://localhost:3000/api/users/auth/authorize
    const challenge = await pkceChallenge(128, { method: 'plain' });
    //we use only the code verfier since the pkcechallegne proudce sh256 string not plain one that is supported by mal
    //becasuse sh256 challegne and verifeier are not euql a encryption is done but mal does not support is
    // thaat why we only use verfier since it is exact match as like mal wants
    const state =  randomstring(32)
    console.log('the state is ', state)
    setCookie({ res }, 'state', `${state}`, {
        httpOnly: true,
        secure: true,
        path: '/',
        maxAge: 60 * 60, // 1 hour
    });
    setCookie({ res }, 'code_verifier', `${challenge.code_verifier}`, {
        httpOnly: true,
        secure: true,
        path: '/',
        maxAge: 60 * 60, // 1 hour
    });
    

    try{
        res.redirect(`https://myanimelist.net/v1/oauth2/authorize?`+
                        `response_type=code`+
                        `&client_id=${process.env.Client_ID}`+
                        `&state=${state}`+
                        `&redirect_uri=${process.env.dev_auth_redirect ?? process.env.prod_auth_redirect}`+
                        `&code_challenge=${challenge.code_verifier}`+
                        `&code_challenge_method=plain`
                    )
    }
    catch(error){
        res.status(500).json({ error: `Internal Server Error : ${error}` });
    }
}