export default function completed_click(e,api,btnref,Setstatus,num_episodes){
     //console.log('button clicked')
        //api.scrollTo(props.episodes-1);
        api.scrollTo(num_episodes);
        for(let i =0 ; i<5 ; i++){
            btnref.current[i].classList.remove('hover:text-green-500')
            btnref.current[i].classList.remove('hover:text-indigo-500')
            btnref.current[i].classList.remove('hover:text-yellow-300')
            btnref.current[i].classList.remove('hover:text-red-500')
            btnref.current[i].classList.remove('hover:text-blue-400')

            btnref.current[i].classList.remove('text-green-500')
            btnref.current[i].classList.remove('text-indigo-500')
            btnref.current[i].classList.remove('text-yellow-300')
            btnref.current[i].classList.remove('text-red-500')
            btnref.current[i].classList.remove('text-blue-400')

            btnref.current[i].classList.add('hover:text-black')
            btnref.current[i].classList.add('text-white')
        }
        e.target.classList.replace('hover:text-black','hover:text-blue-400')
        e.target.classList.replace('text-white','text-blue-400')
        
        //console.log(e)
        Setstatus(e.target.innerText)
        //console.log('button clicked')
      
}