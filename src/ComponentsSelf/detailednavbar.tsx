"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Copy, CheckCheck } from "lucide-react";
import Link from 'next/link';
import copy from "copy-to-clipboard";
import { useCurrentRoute } from "@/hooks/use-current-route";
import { buildDetailBackHref } from "@/lib/routing/path-utils";

interface DetailedNavbarProps {
  sectionTitle: string;
}

export default function DetailedNavbar(props: DetailedNavbarProps) {
  const { pathname, params } = useCurrentRoute();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    copy(props.sectionTitle);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  const backHref = buildDetailBackHref({ pathname, params });

  return (
    <nav className="fixed border-b-1 border-gray-700 z-1000 bg-black w-screen pl-4 h-20 px-2 pr-4 mb-3 top-0 left-0 flex flex-row items-center justify-between">
      <div className="flex flex-row items-center gap-2 sm:gap-1">
        <Link href={backHref}>
          <Button className="bg-zinc-800 text-white hover:text-black hover:bg-zinc-400" variant="secondary" size="icon">
            <ChevronLeft />
          </Button>
        </Link>
        <p className="line-clamp-1 text-left overflow-hidden text-ellipsis text-2xl ml-2 text-white font-bold">
          {props.sectionTitle}
        </p>
      </div>

      <Button
        variant="outline"
        className="ml-2 border-none bg-white hover:bg-gray-300"
        onClick={handleCopy}
      >
        {copied ? (
          <CheckCheck className="text-black" />
        ) : (
          <Copy className="text-black" />
        )}
      </Button>
    </nav>
  );
}
