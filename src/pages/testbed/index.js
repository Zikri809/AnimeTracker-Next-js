import { useEffect } from "react";
import top_score from "@/Utility/filter/top_score";
export default function testbed (){
    useEffect(()=>{
        async function apicall(){
            const result = await fetch ('/api/seasonal?year=2025&season=spring&limit=500')
            const resultjson = await result.json()
            console.log('resultjson is ',resultjson)
            top_score(resultjson.data)
        }
        apicall()
        })
        

    return(
        <>
        </>
    )
}
