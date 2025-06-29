import error_exceed_retryLimit from "@/ComponentsSelf/Retry_UI/Error_after_retry"
import { useRouter } from "next/router"
export default function testbed (){
   const router = useRouter()
        

    return(
       error_exceed_retryLimit(router)
    )
}
