import User_card from "@/ComponentsSelf/user_profile/user_card"
import { parseCookies } from "nookies"
import { useEffect, useState } from "react"
import User_profile_navbar from '@/ComponentsSelf/user_profile/user_profile_navbar'
import Stat_card from "@/ComponentsSelf/user_profile/anime_statcard"
import Top_rated from "@/ComponentsSelf/user_profile/Top_rated"



export default function user_profile(){
    const [userobject, Set_userobject] = useState('')
    const [avatarurl, Setavatarurl] = useState('')
    const [joined_date , Set_joined_date] = useState('')
    const[loading , setloading] = useState(true)
    const cookies = parseCookies({})
    useEffect(()=>{
        console.log(cookies)
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
        <div className=" sm:h-380 h-320 "> 
        <User_profile_navbar/>
        {
            
            !loading?
           <div className="flex  flex-col gap-4 mx-4 w-screen h-screen relative top-20">
            <div className="pr-9 flex-col flex gap-4 w-screen">
             <User_card 
                avatar_src={userobject.picture}
                username = {userobject.name}
                join_date={joined_date}
            />
                <Stat_card data={userobject.anime_statistics}/>
                <Top_rated title={'Top 10 Rated'} localStorage_id={'Completed'} score={true}/>
                <Top_rated title={'Worst 10 Rated'} localStorage_id={'Completed'} score={false}/>
            </div>
            
           
           </div>
            :<></>
        }
        </div>
    )
}