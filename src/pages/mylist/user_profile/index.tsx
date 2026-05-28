'use client';

import User_card from "@/ComponentsSelf/user_profile/user_card"
import { fetchAuthSession } from "@/lib/auth-session"
import { useEffect, useState } from "react"
import User_profile_navbar from '@/ComponentsSelf/user_profile/user_profile_navbar'
import Stat_card from "@/ComponentsSelf/user_profile/anime_statcard"
import Top_rated from "@/ComponentsSelf/user_profile/Top_rated"

export default function UserProfile() {
    const [userobject, Set_userobject] = useState<any>('')
    const [joined_date, Set_joined_date] = useState<any>('')
    const [loading, setloading] = useState(true)

    useEffect(() => {
        let cancelled = false

        fetchAuthSession().then((session) => {
            if (cancelled) return
            const user_data = session.userData
            if (!user_data) {
                setloading(false)
                return
            }
            try {
                Set_userobject(user_data)

                const date = new Date(user_data.joined_at)
                const year = date.getFullYear()
                const month = date.getMonth()
                const day = date.getDate()
                const dateformat = {
                    year: year,
                    month: month,
                    day: day
                }
                Set_joined_date(dateformat)
            } catch (e) {
                console.error(e)
            } finally {
                setloading(false)
            }
        })

        return () => {
            cancelled = true
        }
    }, [])

    return (
        <div className=" sm:h-380 h-320 ">
            <User_profile_navbar/>
            {
                !loading && userobject ? (
                   <div className="flex  flex-col gap-4 mx-4 w-screen h-screen relative top-20">
                    <div className="pr-9 flex-col flex gap-4 w-screen">
                     <User_card
                        avatar_src={userobject.picture}
                        username={userobject.name}
                        join_date={joined_date}
                    />
                        <Stat_card data={userobject.anime_statistics}/>
                        <Top_rated title={'Top 10 Rated'} localStorage_id={'Completed'} score={true}/>
                        <Top_rated title={'Worst 10 Rated'} localStorage_id={'Completed'} score={false}/>
                    </div>
                   </div>
                ) : null
            }
        </div>
    )
}
