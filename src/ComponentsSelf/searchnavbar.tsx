"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useCurrentRoute } from "@/hooks/use-current-route";
import { buildSearchHref } from "@/lib/routing/path-utils";

interface SearchNavbarProps {
  set_state: (val: string, rerender: any) => void;
  searchtitle: string;
}

export default function SearchNavbar({ set_state, searchtitle }: SearchNavbarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { push } = useCurrentRoute();

  const handleToggleOrSearch = () => {
    if (isVisible) {
      sessionStorage.setItem('animedatasearch', 'null');
      set_state(inputValue, undefined);
      setIsVisible(false);
      if (inputValue.trim() !== "") {
        push(buildSearchHref(inputValue));
      } else {
        push("/");
      }
    } else {
      setIsVisible(true);
    }
  };

  useEffect(() => {
    if (isVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleToggleOrSearch();
    }
  };

  return (
    <nav className="fixed border-b-1 border-gray-700 z-3 bg-black w-screen pl-4 h-20 px-2 pr-4 mb-3 top-0 left-0 flex flex-row items-center justify-between">
      <div className="flex justify-center flex-row items-center gap-2 sm:gap-2">
        <Link href="/">
          <Button className="bg-zinc-800 text-white hover:text-black hover:bg-zinc-400" variant="secondary" size="icon">
            <ChevronLeft />
          </Button>
        </Link>
        {!isVisible && (
          <p className="line-clamp-1 overflow-hidden text-ellipsis text-2xl ml-2 text-white font-bold text-left">
            {searchtitle}
          </p>
        )}
      </div>
      <div className={`flex ml-2 justify-around items-center space-x-2 transition-all ${isVisible ? 'w-[90%] sm:w-[30%]' : 'w-fit'}`}>
        <Input
          ref={inputRef}
          className={`border-gray-500 bg-black text-white ${isVisible ? '' : 'hidden'}`}
          type="search"
          placeholder="Search"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button type="button" onClick={handleToggleOrSearch}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </Button>
      </div>
    </nav>
  );
}
