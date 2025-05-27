import User_card from "@/ComponentsSelf/user_profile/user_card"
import { parseCookies } from "nookies"
import { useEffect, useState } from "react"
import User_profile_navbar from '@/ComponentsSelf/user_profile/user_profile_navbar'
import Stat_card from "@/ComponentsSelf/user_profile/anime_statcard"



export default function user_profile(){
    const [userobject, Set_userobject] = useState('')
    const [avatarurl, Setavatarurl] = useState('')
    const [joined_date , Set_joined_date] = useState('')
    const[loading , setloading] = useState(true)
    const cookies = parseCookies({})
    useEffect(()=>{
        const user_data = JSON.parse(cookies.user_data)
        Set_userobject(user_data)
        
       

        const date = new Date(user_data.joined_at)
        const year = date.getFullYear() // retunr year of the date
        const month = date.getMonth() //return month of the date
        const day = date.getDate() //return day of the month
        const dateformat = {
            year: year,
            month: month,
            day: day
        }
        Set_joined_date(dateformat)

        setloading(false)
    },[])
    console.log(joined_date)
    console.log('avatar url is ', avatarurl)
    return(
        <div className="pb-15"> 
        <User_profile_navbar/>
        {
            
            !loading?
           <div className="flex flex-col gap-6 mx-4 w-screen h-screen relative top-20">
             <User_card 
                avatar_src={userobject.picture}
                username = {userobject.name}
                join_date={joined_date}
            />
            <div className="pr-7 grid grid-rows-2 grid-cols-1 sm:grid-rows-1 sm:grid-cols-2 gap-2 w-screen">
                <Stat_card data={userobject.anime_statistics}/>
                <Stat_card data={userobject.anime_statistics}/>
            </div>
            
           
           </div>
            :<></>
        }
        </div>
    )
}