

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import React from "react";
import Link from 'next/link';

function Navbar(props) {
   
    useEffect(()=>{
        console.log('navbar render')
    },[])
   
      
    return (
        <nav className="fixed z-3 bg-black border-b-0 border-gray-700  w-screen pl-4 h-20 px-2 pr-4 mb-3 top-0 left-0 flex flex-row items-center justify-between">
            <div>
                <h1 className="bg-linear-to-r text-white scroll-m-20 text-3xl font-extrabold font-poppins tracking-tight lg:text-5xl">
                    AniJikan
                </h1>
            </div>
            <div className="sm:flex flex-row gap-2 hidden">
                <div className="flex w-full max-w-sm items-center space-x-2">
                    <Input ref={props.searchref} 
  
                        className="text-white text-base px-2 py-1 rounded-md border-neutral-500"
                        placeholder="Search anime..."
                    />
                    <Button ref={props.buttonref}  type="submit">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                             viewBox="0 0 24 24" strokeWidth={1.5}
                             stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                    </Button>
                </div>
                <Link href={'/mylist'}>
                    <Button className='text-black bg-white hover:bg-neutral-600 hover:text-white border-0' variant="outline">
                        Mylist
                    </Button>
                </Link>
            </div>
        
        </nav>
    );
}

export default React.memo(Navbar);
