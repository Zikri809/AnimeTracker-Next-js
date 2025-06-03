import seasonal_data from "@/Utility/seasonal_carousel/season_carousel"
import { useEffect } from "react"
export default function testbed(){
    useEffect(()=>{
        
    seasonal_data()

    },[])
    return(
        
        <div>
            <input key={123} placeholder="search anime ...."></input>
        </div>
    )
}

