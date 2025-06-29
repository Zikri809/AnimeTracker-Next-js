import Error_exceed_retryLimit from "@/ComponentsSelf/Retry_UI/Error_after_retry"
import { useRouter } from "next/router"
export default function ExceedRetryLimit(){
    const router = useRouter()
    if (!router.isReady) {
    return <div>Loading...</div> // or null
}
    const {original_link, original_query} = router.query
    return(
        <Error_exceed_retryLimit router={router} url={original_link} query={original_query}/>
    )
}