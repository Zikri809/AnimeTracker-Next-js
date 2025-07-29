
import { useEffect } from "react"
import dataValidity from "@/Utility/sync_user_data/dataValidity"

export default function testbed (){
   useEffect(()=>{
     const data = Promise.resolve(dataValidity('Completed','completed')) 
     console.log('result of validaity cehck is  ',data)
   },[])
        

    return(
      <>
      </>
    )
}
