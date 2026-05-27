import { Card, CardContent } from "@/components/ui/card";
import React from "react";

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
                <div className="aspect-[2/3] rounded-lg overflow-hidden">
                    <img className="w-full h-full object-cover" src={img} alt={title || "Anime cover"} />
                </div>
                <div className="flex-col flex gap-1 pt-2">
                    <p className="text-white font-bold line-clamp-2 sm:text-lg text-ellipsis">{title}</p>
                    <p className="text-neutral-400 sm:text-base">{'Score: ' + user_score}</p>
                </div>
            </CardContent>
        </Card>
    )
}
