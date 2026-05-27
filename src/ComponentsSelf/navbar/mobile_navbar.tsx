"use client";

import Link from "next/link";
import { House, Search, List } from 'lucide-react';
import { usePathname } from "next/navigation";

export default function MobileNavbar() {
    const pathname = usePathname() || "";
    const path = pathname.split('/')[1];

    const isHomeActive = path === '' || path === 'Anime' || path === 'morelastseason' || path === 'morethiseseason' || path === 'moreupcoming' || path === 'seasons';
    const isSearchActive = path === 'search';
    const isListActive = path === 'mylist';

    function resetState() {
        if (typeof window === "undefined") return;
        console.log('reset soort has occured');
        sessionStorage.removeItem('sort_type');
        sessionStorage.removeItem('sorted_anime');
    }

    return (
        <nav className="fixed overflow-x-hidden w-screen border-t border-gray-700 bg-black rounded-t-none py-3 z-[10000] sm:hidden bottom-0 left-0 flex flex-row justify-around">
            <div className="flex items-center flex-col text-xs transition-colors duration-200" style={{ color: isHomeActive ? '#ffffff' : '#9E9E9E' }}>
                <Link onClick={resetState} className="flex items-center flex-col" href={'/'}>
                    <House className="w-5 h-5 mb-1" />
                    <div>Home</div>
                </Link>
            </div>
            <div className="flex items-center flex-col text-xs transition-colors duration-200" style={{ color: isSearchActive ? '#ffffff' : '#9E9E9E' }}>
                <Link onClick={resetState} className="flex items-center flex-col" href={'/search/NA'}>
                    <Search className="w-5 h-5 mb-1" />
                    <div>Search</div>
                </Link>
            </div>
            <div className="flex items-center flex-col text-xs transition-colors duration-200" style={{ color: isListActive ? '#ffffff' : '#9E9E9E' }}>
                <Link onClick={resetState} className="flex items-center flex-col" href={'/mylist'}>
                    <List className="w-5 h-5 mb-1" />
                    <div>MyList</div>
                </Link>
            </div>
        </nav>
    );
}