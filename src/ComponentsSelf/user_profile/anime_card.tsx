import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import Image from "next/image";

interface AnimeCardProps {
    title: string;
    user_score: number | string;
    img: string;
    className?: string;
}

export default function AnimeCard({ title, user_score, img, className }: AnimeCardProps) {
    return (
        <Card className={`shrink-0 bg-transparent border-none overflow-hidden w-[110px] sm:w-[150px] ${className || ''}`}>
            <CardContent className='p-0 flex flex-col'>
                <div className="aspect-[2/3] rounded-md overflow-hidden relative">
                    <Image className="object-cover" src={img || "/placeholder.svg"} alt={title || "Anime cover"} fill sizes="(max-width: 640px) 110px, 150px" quality={85} />
                </div>
                <div className="flex-col flex gap-0.5 pt-1">
                    <p className="text-white font-medium line-clamp-2 sm:text-sm text-xs text-ellipsis">{title}</p>
                    <p className="text-neutral-400 sm:text-xs text-[10px]">{'Score: ' + user_score}</p>
                </div>
            </CardContent>
        </Card>
    )
}
