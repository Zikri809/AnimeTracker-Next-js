import Restorenavbar from "@/ComponentsSelf/navbar/restorenavbar"
import Uploadbackup from "@/ComponentsSelf/restore components/uploadbackup"
import { Toaster } from "sonner"

export default function restore_page(){
    return(
        <>
            <Restorenavbar/>
            <Toaster className='fixed top-0 z-1000' richColors/>
            <Uploadbackup />
        </>
    )
}