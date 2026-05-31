"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { ListChecks, Search } from "lucide-react";

function Navbar() {
    const router = useRouter();
    const [query, setQuery] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = query.trim();
        if (trimmed !== "") {
            const sanitized = trimmed.replace(/[\/\\<>'"&]/g, "");
            router.push(`/search/${encodeURIComponent(sanitized)}`);
        } else {
            router.push("/search");
        }
    };

    return (
        <nav className="app-header">
            <div className="min-w-0">
                <Link href="/">
                    <h1 className="text-white scroll-m-20 text-3xl font-extrabold font-poppins tracking-tight lg:text-4xl cursor-pointer">
                        AniJikan
                    </h1>
                </Link>
            </div>
            <div className="sm:flex flex-row gap-3 hidden">
                <form onSubmit={handleSearch} className="flex w-[min(34vw,24rem)] items-center gap-2">
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="h-10 border-white/10 bg-white/[0.06] px-3 text-sm text-white placeholder:text-slate-500 focus-visible:border-primary/70 focus-visible:ring-primary/30"
                        placeholder="Search anime..."
                    />
                    <Button
                        type="submit"
                        aria-label="Search anime"
                        className="icon-button"
                    >
                        <Search className="size-5" />
                    </Button>
                </form>
                <Link href={'/mylist'}>
                    <Button className='h-10 border border-primary/25 bg-primary px-4 text-primary-foreground hover:bg-primary/90'>
                        <ListChecks className="size-4" />
                        MyList
                    </Button>
                </Link>
            </div>
        </nav>
    );
}

export default React.memo(Navbar);
