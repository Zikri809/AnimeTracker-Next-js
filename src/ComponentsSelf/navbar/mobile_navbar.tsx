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

    const itemClass = "flex min-w-[4.5rem] items-center justify-center rounded-md px-3 py-2 text-xs transition-colors duration-200";

    return (
        <nav className="fixed bottom-0 left-0 z-[10000] flex w-full justify-around border-t border-white/10 bg-[#08090b]/90 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl sm:hidden">
            <div className={itemClass} style={{ color: isHomeActive ? '#ffffff' : '#8c95a6', backgroundColor: isHomeActive ? 'rgb(255 255 255 / 0.08)' : 'transparent' }}>
                <Link onClick={resetState} className="flex items-center flex-col gap-1" href={'/'} aria-current={isHomeActive ? "page" : undefined}>
                    <House className="h-5 w-5" />
                    <div>Home</div>
                </Link>
            </div>
            <div className={itemClass} style={{ color: isSearchActive ? '#ffffff' : '#8c95a6', backgroundColor: isSearchActive ? 'rgb(255 255 255 / 0.08)' : 'transparent' }}>
                <Link onClick={resetState} className="flex items-center flex-col gap-1" href={'/search/NA'} aria-current={isSearchActive ? "page" : undefined}>
                    <Search className="h-5 w-5" />
                    <div>Search</div>
                </Link>
            </div>
            <div className={itemClass} style={{ color: isListActive ? '#ffffff' : '#8c95a6', backgroundColor: isListActive ? 'rgb(255 255 255 / 0.08)' : 'transparent' }}>
                <Link onClick={resetState} className="flex items-center flex-col gap-1" href={'/mylist'} aria-current={isListActive ? "page" : undefined}>
                    <List className="h-5 w-5" />
                    <div>MyList</div>
                </Link>
            </div>
        </nav>
    );
}
