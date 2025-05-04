import "@/styles/globals.css";
import { createContext } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Head from "next/head";

export const Season_context = createContext()


export default function App({ Component, pageProps }) {

  const queryclient = new QueryClient()


  const dateobject = new Date()
  let current_month = dateobject.getMonth()+1
  let current_year = dateobject.getFullYear()
  let past_year = 0
  let upcoming_year =0
  const seasons = ['winter','spring', 'summer', 'fall']
  let current_season
  if(current_month>=1 && current_month<=3){
     current_season = seasons[0]
  }
  else if(current_month>=4 && current_month<=6){
     current_season= seasons[1]
  }
  else if(current_month>=7 && current_month<=9){
     current_season = seasons[2]
  }
  else{
     current_season = seasons[3]
  }
  const past_season_funct = (seasons, current_season,current_year) =>{
    if(seasons.indexOf(current_season)==0){
      past_year = current_year-1
      return seasons[seasons.length-1]
    }
    else{
      past_year = current_year
      return seasons[seasons.indexOf(current_season)-1]
    }
  }
  
  const upcoming_season_funct = (seasons, current_season,current_year) =>{
    if(seasons.indexOf(current_season) == seasons.length-1){
      upcoming_year = current_year+1
      return seasons[0]
    }
    else{
      upcoming_year = current_year
      return seasons[seasons.indexOf(current_season)+1]
    }
  }
  
  const past_year_funct = (seasons, current_season,current_year) =>{
    if(seasons.indexOf(current_season)==0){
      return past_year = current_year-1
    
    }
    else{
      return past_year = current_year
     
    }
  }
  
  const upcoming_year_funct = (seasons, current_season,current_year) =>{
    if(seasons.indexOf(current_season) == seasons.length-1){
      return upcoming_year = current_year+1
  
    }
    else{
      return upcoming_year = current_year
     
    }
  }
  
  
  const past_season = past_season_funct(seasons, current_season)
  const upcoming_season = upcoming_season_funct(seasons,current_season)
  past_year = past_year_funct(seasons,current_season,current_year)
  upcoming_year = upcoming_year_funct(seasons,current_season,current_year)
  

  return (
  <>
  <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1" />
  </Head>
  <Season_context.Provider value={{current_month,current_year,current_season,past_season,past_year,upcoming_season,upcoming_year}}>
      <QueryClientProvider client={queryclient}>
        <Component {...pageProps} />
      </QueryClientProvider>
  </Season_context.Provider>
  </>
  

);
}
