import {
    Card,
    CardContent,
} from "@/components/ui/card"
import React from "react"
import Image from "next/image"
import { Heart, Star, Trophy } from "lucide-react"
import { FALLBACK_POSTER_SRC } from "./animecard"

interface GenreItem {
    name: string;
}

interface AnimeCardHeaderProps {
    genre: GenreItem[];
    image: string;
    bannerImage?: string | null;
    status: string;
    season: string;
    episodes: number | null;
    title: string;
    score?: number | string;
    users: number | string;
    ranking: number | string;
    favorites: number | string;
}

function statusClassName(status: string) {
    if (status === "Finished Airing") {
        return "border-emerald-400/25 bg-emerald-400/10 text-emerald-300";
    }
    if (status === "Currently Airing") {
        return "border-primary/25 bg-primary/10 text-primary";
    }
    return "border-rose-400/25 bg-rose-400/10 text-rose-300";
}

function AnimeCardHeader(props: AnimeCardHeaderProps) {
    let genrearr = [...props.genre];
    if (genrearr.length > 3) {
        const exceeded = genrearr.length - 3;
        genrearr = genrearr.slice(0, 3);
        genrearr.push({ name: `+${exceeded}` });
    }

    if (props.bannerImage) {
        return (
            <section className="relative min-h-[25rem] overflow-hidden border-b border-white/10 bg-background sm:min-h-[32rem]">
                <Image
                    className="object-cover"
                    src={props.bannerImage}
                    alt={`${props.title} banner`}
                    quality={90}
                    fill
                    priority
                    sizes="100vw"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(8_9_11/0.18)_0%,rgb(8_9_11/0.45)_45%,rgb(8_9_11/0.96)_100%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(8_9_11/0.92)_0%,rgb(8_9_11/0.62)_42%,rgb(8_9_11/0.12)_100%)]" />
                <div className="relative z-10 flex min-h-[25rem] max-w-5xl flex-col justify-end px-5 pb-7 pt-20 sm:min-h-[32rem] sm:px-8 sm:pb-10">
                    <div className="max-w-3xl">
                        <span className={`status-pill mb-4 ${statusClassName(props.status)}`}>
                            {props.status}
                        </span>
                        <h1 className="text-balance text-3xl font-bold leading-tight text-white drop-shadow-lg sm:text-5xl">
                            {props.title}
                        </h1>
                        <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-300 sm:text-base">
                            <p className="capitalize">{props.season}</p>
                            <p>{props.episodes == null ? "" : `${props.episodes} Episodes`}</p>
                        </div>
                        <div className="mt-5 grid max-w-xl grid-cols-2 gap-4 text-sm text-slate-300 sm:grid-cols-3">
                            <div className="min-w-0">
                                <div className="flex items-center gap-1 text-slate-50">
                                    <Star className="size-4 fill-primary text-primary" />
                                    <p>{props.score === undefined ? "No Rating" : props.score}</p>
                                </div>
                                <p className="truncate">{props.users} users</p>
                            </div>
                            <div>
                                <div className="flex items-center gap-1 text-slate-50">
                                    <Trophy className="size-4 text-primary" />
                                    <p>#{props.ranking}</p>
                                </div>
                                <p>Ranking</p>
                            </div>
                            <div>
                                <div className="flex items-center gap-1 text-slate-50">
                                    <Heart className="size-4 text-primary" />
                                    <p>#{props.favorites}</p>
                                </div>
                                <p>Favourites</p>
                            </div>
                        </div>
                        <div className="mt-5 flex flex-row flex-wrap items-center gap-2">
                            {genrearr.map((genre, index) => (
                                <span key={`${genre.name}-${index}`} className="metadata-pill bg-black/45 backdrop-blur-sm">
                                    {genre.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="border-b border-white/10 bg-background px-5 py-6 sm:px-8">
            <Card className="border-none bg-transparent p-0 text-white shadow-none">
                <CardContent className="flex min-w-0 flex-row items-center gap-5 p-0 sm:gap-7">
                    <div className="relative h-[17rem] w-[12rem] flex-none overflow-hidden rounded-md bg-[#111318] sm:h-[22rem] sm:w-[15rem]">
                        <Image
                            className="object-cover"
                            src={props.image || FALLBACK_POSTER_SRC}
                            alt={props.title || "Anime cover"}
                            quality={85}
                            fill
                            sizes="(min-width: 640px) 240px, 192px"
                        />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col items-start gap-5">
                        <span className={`status-pill ${statusClassName(props.status)}`}>
                            {props.status}
                        </span>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-400">
                            <p className="capitalize">{props.season}</p>
                            <p>{props.episodes == null ? "" : `${props.episodes} Episodes`}</p>
                        </div>
                        <h1 className="hidden max-w-3xl text-balance text-3xl font-bold leading-tight text-white sm:block">
                            {props.title}
                        </h1>
                        <div className="grid w-full max-w-xl grid-cols-2 gap-4 text-sm text-slate-400 sm:grid-cols-3">
                            <div className="min-w-0">
                                <div className="flex items-center gap-1 text-slate-100">
                                    <Star className="size-4 fill-primary text-primary" />
                                    <p>{props.score === undefined ? "No Rating" : props.score}</p>
                                </div>
                                <p className="truncate">{props.users} users</p>
                            </div>
                            <div>
                                <div className="flex items-center gap-1 text-slate-100">
                                    <Trophy className="size-4 text-primary" />
                                    <p>#{props.ranking}</p>
                                </div>
                                <p>Ranking</p>
                            </div>
                            <div>
                                <div className="flex items-center gap-1 text-slate-100">
                                    <Heart className="size-4 text-primary" />
                                    <p>#{props.favorites}</p>
                                </div>
                                <p>Favourites</p>
                            </div>
                        </div>
                        <div className="hidden flex-row flex-wrap items-center gap-2 sm:flex">
                            {genrearr.map((genre, index) => (
                                <span key={`${genre.name}-${index}`} className="metadata-pill">
                                    {genre.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="mt-5 flex flex-row flex-wrap items-center gap-2 sm:hidden">
                {genrearr.map((genre, index) => (
                    <span key={`${genre.name}-${index}-mobile`} className="metadata-pill">
                        {genre.name}
                    </span>
                ))}
            </div>
        </section>
    )
}

export default AnimeCardHeader;
