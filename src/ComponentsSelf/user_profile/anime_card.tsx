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
        <Card className={`shrink-0 bg-transparent border-none overflow-hidden w-23 sm:w-fit ${className || ''}`}>
            <CardContent className='p-0 flex flex-col'>
                <div className="aspect-[2/3] rounded-lg overflow-hidden relative">
                    <Image className="object-cover" src={img || "/placeholder.svg"} alt={title || "Anime cover"} fill sizes="(max-width: 640px) 100px, 160px" quality={85} />
                </div>
                <div className="flex-col flex gap-1 pt-2">
                    <p className="text-white font-bold line-clamp-2 sm:text-lg text-ellipsis">{title}</p>
                    <p className="text-neutral-400 sm:text-base">{'Score: ' + user_score}</p>
                </div>
            </CardContent>
        </Card>
    )
}
