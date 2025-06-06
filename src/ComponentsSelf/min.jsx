import React from 'react';
import { useEffect, useState } from "react"
import { useRouter } from 'next/router';
import Link from 'next/link'
const relation = (props) => {
  const [animerelinfo, Setanimerelinfo] = useState([])
  const [isloading, Setloading] = useState(true)
  const router = useRouter()
  useEffect(()=>{
  async function fetchapi(){
      try{
          const response = await fetch('https://api.jikan.moe/v4/anime/'+props.id+'/relations')
          const apirelfeedback = await response.json()
          const showrelinfo =  apirelfeedback.data
          //console.log(showrelinfo)
          Setanimerelinfo(showrelinfo)
          Setloading(false)
      }
      catch(error){
         fetchapi()
          console.error(error)
      }
  }
  fetchapi() 
  },[props.id])
  

    
  
//console.log('animerelinfo ',animerelinfo)
  return (
    <div className='flex bg-black overflow-hidden w-screen px-5 py-4 flex-wrap flex-col justify-between '>
     {
      isloading?<p>loading</p>:(animerelinfo!=undefined?animerelinfo.map((object)=>(
        <div className='overflow-hidden'>
           <p className=' text-gray-400'>{object.relation}</p>
          { object.relation!='Adaptation' ?
           ( object.entry.map((object)=>{
              return (
              <Link 

              href={router.query.hasOwnProperty('relation_id')?router.asPath.split('/').slice(0,-2).join('/')+ '/relation/'+object.mal_id:router.asPath + '/relation/'+object.mal_id}>{/*to={} */}
                  
                  
                  <p className='text-blue-500'>{object.name}</p>
              </Link>
            
            )
            
            })): ( object.entry.map((object)=>{
              return <p className='text-white'>{object.name}</p>
            }))
          }
           
        </div>
       
        
      )):<p className='hidden'></p>)
     }
      
    </div>
  );
};

export default relation;