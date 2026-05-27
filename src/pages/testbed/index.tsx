'use client';

import { useEffect } from "react"
import dataValidity from "@/Utility/sync_user_data/dataValidity"

export default function Testbed() {
   useEffect(() => {
     const data = Promise.resolve(dataValidity('Completed', 'completed'))
     console.log('result of validaity check is  ', data)
   }, [])

    return (
      <></>
    )
}
