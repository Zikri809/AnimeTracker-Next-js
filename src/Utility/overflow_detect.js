
export default function overflow_detect (elementref){

        const scrollHeight = elementref.current.scrollHeight
        const offsetHeight = elementref.current.offsetHeight
    

 
    //detect overflow
    console.log('scroll heigth ',scrollHeight, ' offset heigth ',offsetHeight)
    if(scrollHeight > offsetHeight){
        return true
    }
    else 
        return false
}