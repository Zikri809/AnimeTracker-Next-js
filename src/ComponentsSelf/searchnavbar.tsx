"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Search } from "lucide-react";
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
    <nav className="app-header gap-3">
      <div className="flex min-w-0 flex-none justify-center flex-row items-center gap-3">
        <Link href="/">
          <Button className="icon-button" variant="secondary" size="icon" aria-label="Go back">
            <ChevronLeft />
          </Button>
        </Link>
        {!isVisible && (
          <p className="line-clamp-1 overflow-hidden text-ellipsis text-xl text-white font-bold text-left sm:text-2xl">
            {searchtitle}
          </p>
        )}
      </div>
      <div className={`flex min-w-0 items-center gap-2 transition-all ${isVisible ? 'flex-1' : 'w-fit'}`}>
        <Input
          ref={inputRef}
          className={`h-10 min-w-0 flex-1 border-white/10 bg-white/[0.06] text-white placeholder:text-slate-500 focus-visible:border-primary/70 focus-visible:ring-primary/30 ${isVisible ? '' : 'hidden'}`}
          type="search"
          placeholder="Search"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button type="button" onClick={handleToggleOrSearch} className="icon-button" aria-label="Search anime">
          <Search className="size-5" />
        </Button>
      </div>
    </nav>
  );
}
