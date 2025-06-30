import { useEffect } from "react"

export default function useSwipeGesture(TypeOfSwipe, onSwipeAction, minimumSwipeActivateThreshold){
    //user have to provide an array containing 2 function that will be executed depending on the swipe event 
    //note: onswipeaction[0] is for swipe right or swipe up
    //note: onswipeaction[1] is for swipe left or swipe down

    
    
    useEffect(()=>{
        
            let x_swipe
            let y_swipe
            let touchstartX
            let touchstartY
            let touchendX
            let touchendY
            const swipeOption = ['x-axis','y-axis']
        
            //input validation
            if (TypeOfSwipe === swipeOption[0]){
                x_swipe = true
            }
            else if(TypeOfSwipe === swipeOption[1]) {
                 y_swipe = true
            }
            else{
                console.error('Type of swipe invalide only : x-axis or y-axis')
                return
            }
        
            if(onSwipeAction.length !=2){
                console.error('the array of function of onSwipeAction must contain 2 elements only ')
                return
            }
            else{
                if(!(typeof onSwipeAction[0] == 'function' && typeof onSwipeAction[1] == 'function')){
                    console.error('the elements provided in the onSwipeAction arrays are not a function ! it must be a function')
                    return
                }
            }
            const minimum_threshold = minimumSwipeActivateThreshold
        function touchstart(event){
            if(x_swipe){
                 touchstartX = event.changedTouches[0].screenX;
            }
            else{
                 touchstartY = event.changedTouches[0].screenY;
            }
        }
        function touchend(event) {
            if(x_swipe){
                 touchendX = event.changedTouches[0].screenX;
            }
            else{
                 touchendY = event.changedTouches[0].screenY;
            }
            handleGesture()
        }
        window.addEventListener('touchstart', touchstart,false)
        window.addEventListener('touchend', touchend, false);
    
        function handleGesture(){
            if(x_swipe){
                if(touchendX < touchstartX && touchstartX - touchendX >= minimum_threshold){
                    //console.log('swipe right !')
                    onSwipeAction[0]()
                }
                else if(touchendX -touchstartX >= minimum_threshold){
                    //console.log('swipe left')
                    onSwipeAction[1]()
                }
            }
            else{
                if(touchendY < touchstartY && touchstartY - touchendY >= minimum_threshold){
                    //console.log('swipe up')
                     onSwipeAction[0]()
                }
                else if(touchendY - touchstartY >= minimum_threshold){
                    //console.log('swipe down')
                     onSwipeAction[1]()
                }
            }
        }
        return ()=>{
            //event listner applied recommended to removed once unmount
            window.removeEventListener('touchstart',touchstart)
            window.removeEventListener('touchend',touchend)
        }
    },[])
}