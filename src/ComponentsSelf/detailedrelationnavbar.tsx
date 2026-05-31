"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Copy, CheckCheck } from "lucide-react";
import Link from 'next/link';
import copy from "copy-to-clipboard";
import { useCurrentRoute } from "@/hooks/use-current-route";
import { buildDetailBackHref } from "@/lib/routing/path-utils";

interface DetailedRelationNavbarProps {
  sectionTitle: string;
}

export default function DetailedRelationNavbar(props: DetailedRelationNavbarProps) {
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
    <nav className="app-header">
      <div className="flex min-w-0 flex-row items-center gap-3">
        <Link href={backHref}>
          <Button className="icon-button" variant="secondary" size="icon" aria-label="Go back">
            <ChevronLeft />
          </Button>
        </Link>
        <p className="line-clamp-1 text-left overflow-hidden text-ellipsis text-xl text-white font-bold sm:text-2xl">
          {props.sectionTitle}
        </p>
      </div>

      <Button
        variant="outline"
        className="icon-button ml-2"
        onClick={handleCopy}
        aria-label="Copy anime title"
      >
        {copied ? (
          <CheckCheck />
        ) : (
          <Copy />
        )}
      </Button>
    </nav>
  );
}
